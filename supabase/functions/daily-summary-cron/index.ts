const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface TareaResumen {
  id: string;
  titulo: string;
  categoria: string;
  nivel_urgencia: string;
  fecha_vencimiento: string | null;
  completada: boolean;
}

interface Usuario {
  id: string;
  email: string;
  nombre: string;
}

Deno.serve(async (_req: Request): Promise<Response> => {
  try {
    // Obtener todos los usuarios activos
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!usersResponse.ok) {
      throw new Error(`Error fetching users: ${usersResponse.status}`);
    }

    const usuarios: Usuario[] = await usersResponse.json();

    const hoy = new Date().toISOString().split('T')[0];

    for (const usuario of usuarios) {
      const tasksResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/tareas?user_id=eq.${usuario.id}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        },
      );

      if (!tasksResponse.ok) continue;

      const tareas: TareaResumen[] = await tasksResponse.json();
      const pendientes = tareas.filter((t) => !t.completada);
      const criticas = pendientes.filter((t) => t.nivel_urgencia === 'Crítico');
      const vencenHoy = pendientes.filter(
        (t) => t.fecha_vencimiento && t.fecha_vencimiento.startsWith(hoy),
      );

      if (pendientes.length === 0) continue;

      let taskListHtml = '<ul>';
      for (const t of pendientes) {
        const urg = t.nivel_urgencia === 'Crítico' ? '🔴' : t.nivel_urgencia === 'Medio' ? '🟡' : '🟢';
        const vence = t.fecha_vencimiento
          ? new Date(t.fecha_vencimiento).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
          : 'Sin fecha';
        taskListHtml += `<li>${urg} <strong>${t.titulo}</strong> — Vence: ${vence}</li>`;
      }
      taskListHtml += '</ul>';

      let alerta = '';
      if (criticas.length > 0) {
        alerta = `<p style="color: #dc2626;"><strong>⚠️ Tienes ${criticas.length} tarea(s) crítica(s)</strong></p>`;
      }
      if (vencenHoy.length > 0) {
        alerta += `<p style="color: #d97706;"><strong>⏰ ${vencenHoy.length} tarea(s) vencen hoy</strong></p>`;
      }

      const emailHtml = `
        <h2>☀️ Buenos días, ${usuario.nombre}</h2>
        <p>Este es tu resumen diario de VIX — <strong>${pendientes.length} tarea(s) pendiente(s)</strong></p>
        ${alerta}
        ${taskListHtml}
        <hr />
        <p style="color: #6b7280; font-size: 0.875rem;">VIX — Tu asistente virtual de tareas</p>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'VIX <resumen@tudominio.com>',
          to: usuario.email,
          subject: `☀️ Resumen Diario VIX — ${pendientes.length} tarea(s) pendiente(s)`,
          html: emailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true, processed: usuarios.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

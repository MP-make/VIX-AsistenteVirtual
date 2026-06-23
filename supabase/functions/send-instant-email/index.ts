const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';

interface AlertaRequest {
  task_id: string;
  user_id: string;
  titulo: string;
  fecha_vencimiento: string | null;
}

interface UsuarioInfo {
  email: string;
  nombre: string;
}

async function getUsuario(userId: string): Promise<UsuarioInfo | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${userId}`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) return null;
  const users = await response.json();
  return users?.[0] ?? null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as AlertaRequest;
    const usuario = await getUsuario(body.user_id);

    if (!usuario?.email) {
      return new Response(JSON.stringify({ ok: false, error: 'Usuario no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fecha = body.fecha_vencimiento
      ? new Date(body.fecha_vencimiento).toLocaleDateString('es-PE', {
          timeZone: 'America/Lima',
          dateStyle: 'long',
        })
      : 'Sin fecha definida';

    const emailHtml = `
      <h2>⚠️ Tarea Crítica Detectada</h2>
      <p><strong>${usuario.nombre}</strong>, se ha registrado una tarea con urgencia <strong>Crítico</strong>:</p>
      <ul>
        <li><strong>Título:</strong> ${body.titulo}</li>
        <li><strong>Vencimiento:</strong> ${fecha}</li>
      </ul>
      <p>Revisa tu Dashboard de VIX para más detalles.</p>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VIX <notificaciones@tudominio.com>',
        to: usuario.email,
        subject: `⚠️ Tarea Crítica: ${body.titulo}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      throw new Error(`Resend error: ${errorText}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
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

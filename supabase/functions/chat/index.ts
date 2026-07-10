import { withSupabase } from 'jsr:@supabase/server@^1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function addCors(response: Response): Response {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

const supabaseHandler = withSupabase({ auth: 'user' }, async (req: Request, ctx: { supabase: any; userClaims: { id: string } | null }) => {
  const supabaseClient = ctx.supabase;
  const user_id = ctx.userClaims?.id ?? '';
  const body = await req.json();
  const messages: { role: string; content: string }[] = body.messages;
  const hijo_id: string | null = body.hijo_id ?? null;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, error: 'messages es requerido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
  const lastMessage = messages[messages.length - 1]?.content ?? '';

  const systemPrompt = `Eres VIX, un asistente inteligente que conversa de forma natural y también organiza tareas.

Tu trabajo:
1. Lee el mensaje del usuario y determina si está describiendo una tarea/actividad/compromiso o si solo está conversando.
2. Si es una tarea (algo que hay que hacer, comprar, estudiar, preparar, etc.), extrae la información estructurada en el campo "tarea".
3. Si es conversación normal, responde de forma natural y amable sin rellenar el campo "tarea".
4. Siempre responde en "respuesta" de forma natural y conversacional, como un amigo.
5. IMPORTANTE: Si el usuario menciona una fecha, plazo o día específico (ej: "mañana", "en 3 días", "próximo lunes", "viernes", "para el 15 de julio"), calcula correctamente dias_plazo basándote en la fecha actual.
6. Si el usuario menciona una hora específica (ej: "antes de las 8", "a las 3pm", "para las 9:30"), extrae la hora en hora_limite (0-23) y minuto_limite (0-59).

La fecha actual es: ${new Date().toISOString()}

Ejemplos de tareas con fechas:
  - "comprar pan mañana" → dias_plazo: 1
  - "estudiar para el examen en 3 días" → dias_plazo: 3
  - "entregar tesis el próximo lunes" → dias_plazo: calcular según fecha actual
  - "tarea urgente para hoy" → dias_plazo: 0
  - "enviar informe antes de las 8pm" → dias_plazo: 0, hora_limite: 20, minuto_limite: 0
  - "presentación a las 9:30 am del viernes" → dias_plazo: calcular, hora_limite: 9, minuto_limite: 30
Ejemplos de chat: "hola", "ok", "gracias", "buenos días", "quién eres?", cualquier pregunta general.`;

  const schema = {
    type: 'object',
    properties: {
      respuesta: { type: 'string' },
      tipo: { type: 'string', enum: ['chat', 'tarea'] },
      tarea: {
        type: 'object',
        properties: {
          texto_pulido: { type: 'string' },
          titulo: { type: 'string' },
          descripcion: { type: 'string' },
          categoria: { type: 'string', enum: ['Dashboard', 'Tarea Pendiente', 'Idea', 'Práctica Calificada', 'Tesis'] },
          nivel_urgencia: { type: 'string', enum: ['Crítico', 'Medio', 'Baja', 'Idea'] },
          dias_plazo: { type: 'integer' },
          hora_limite: { type: 'integer' },
          minuto_limite: { type: 'integer' },
        },
        required: ['texto_pulido', 'titulo', 'categoria', 'nivel_urgencia'],
      },
    },
    required: ['respuesta', 'tipo'],
  };

  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const aiResponse = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.3,
      },
    }),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    throw new Error(`Error en Gemini: ${aiResponse.statusText} - ${errorText}`);
  }

  const aiData = await aiResponse.json();
  const rawTextResult = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawTextResult) throw new Error('Gemini devolvió respuesta vacía');

  const result = JSON.parse(rawTextResult);

  let tareaGuardada = null;
  if (result.tipo === 'tarea' && result.tarea) {
    let fecha_vencimiento: string | null = null;
    const t = result.tarea;
    if (t.dias_plazo !== null && t.dias_plazo !== undefined) {
      const dateCalculated = new Date();
      dateCalculated.setDate(dateCalculated.getDate() + t.dias_plazo);
      if (t.hora_limite !== null && t.hora_limite !== undefined) {
        dateCalculated.setHours(t.hora_limite, t.minuto_limite ?? 0, 0, 0);
      } else {
        dateCalculated.setHours(23, 59, 0, 0);
      }
      fecha_vencimiento = dateCalculated.toISOString();
    } else if (t.hora_limite !== null && t.hora_limite !== undefined) {
      const dateCalculated = new Date();
      dateCalculated.setHours(t.hora_limite, t.minuto_limite ?? 0, 0, 0);
      if (dateCalculated <= new Date()) {
        dateCalculated.setDate(dateCalculated.getDate() + 1);
      }
      fecha_vencimiento = dateCalculated.toISOString();
    }

    const { data: saved, error: dbError } = await supabaseClient
      .from('tareas')
      .insert({
        user_id,
        texto_original: lastMessage,
        texto_pulido: result.tarea.texto_pulido,
        titulo: result.tarea.titulo,
        descripcion: result.tarea.descripcion || null,
        categoria: result.tarea.categoria,
        nivel_urgencia: result.tarea.nivel_urgencia,
        fecha_vencimiento,
        hijo_id,
      })
      .select()
      .single();

    if (dbError) throw dbError;
    tareaGuardada = saved;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      tipo: result.tipo,
      respuesta: result.respuesta,
      tarea: tareaGuardada,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});

export default {
  fetch: async (req: Request) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const res = await supabaseHandler(req);
      return addCors(res);
    } catch (err) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};

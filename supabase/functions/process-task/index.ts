import { type TareaEstructurada, type ProcesarTareaRequest, type ProcesarTareaResponse } from './types.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Eres un asistente de organización de tareas. Analiza el texto del usuario y extrae la información estructurada de una tarea.

Reglas:
1. Corrige errores ortográficos y de redacción → texto_pulido
2. Genera un título corto y descriptivo
3. Extrae o infiere una descripción y fecha de vencimiento si es posible (formato ISO 8601)
4. Clasifica la categoría: Dashboard | Tarea Pendiente | Idea | Práctica Calificada | Tesis
5. Clasifica la urgencia: Crítico | Medio | Baja | Idea
6. Si no hay suficiente info para fecha_vencimiento, devuelve null
7. Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones

Formato de respuesta:
{
  "titulo": "string",
  "descripcion": "string | null",
  "categoria": "Dashboard | Tarea Pendiente | Idea | Práctica Calificada | Tesis",
  "nivel_urgencia": "Crítico | Medio | Baja | Idea",
  "fecha_vencimiento": "string (ISO 8601) | null",
  "texto_pulido": "string"
}`;

async function procesarConGemini(texto: string): Promise<TareaEstructurada> {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nTexto del usuario:\n${texto}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 1,
        topP: 1,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const cleaned = rawText.replace(/```json?/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as TareaEstructurada;
}

async function guardarEnDB(
  userId: string,
  textoOriginal: string,
  taskData: TareaEstructurada,
): Promise<ProcesarTareaResponse['saved_task']> {
  const body = {
    user_id: userId,
    texto_original: textoOriginal,
    texto_pulido: taskData.texto_pulido,
    titulo: taskData.titulo,
    descripcion: taskData.descripcion,
    categoria: taskData.categoria,
    nivel_urgencia: taskData.nivel_urgencia,
    fecha_vencimiento: taskData.fecha_vencimiento,
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/tareas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`DB insert error ${response.status}: ${errorBody}`);
  }

  const saved = await response.json();
  return Array.isArray(saved) ? saved[0] : saved;
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { texto_original, user_id, confirmed, task_data } = (await req.json()) as ProcesarTareaRequest;

    if (!texto_original?.trim()) {
      return new Response(JSON.stringify({ ok: false, error: 'texto_original es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!user_id) {
      return new Response(JSON.stringify({ ok: false, error: 'user_id es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Paso 2: Confirmación → guardar en DB
    if (confirmed && task_data) {
      const saved_task = await guardarEnDB(user_id, texto_original, task_data);
      return new Response(JSON.stringify({ ok: true, saved_task } satisfies ProcesarTareaResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Paso 1: Procesar con Gemini
    const task = await procesarConGemini(texto_original);

    return new Response(JSON.stringify({ ok: true, task } satisfies ProcesarTareaResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ ok: false, error: message } satisfies ProcesarTareaResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

import { withSupabase } from 'jsr:@supabase/server@^1';

type CategoriaTarea = 'Dashboard' | 'Tarea Pendiente' | 'Idea' | 'Práctica Calificada' | 'Tesis';
type UrgenciaTarea = 'Crítico' | 'Medio' | 'Baja' | 'Idea';

interface GeminiStructuredOutput {
  texto_pulido: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaTarea;
  nivel_urgencia: UrgenciaTarea;
  dias_plazo: number | null;
  hora_limite: number | null;
  minuto_limite: number | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default {
  fetch: withSupabase({ auth: true }, async (req: Request, ctx: { supabase: any; user: { id: string } }) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const user_id = ctx.user.id;
    let texto_original = '';

    try {
      const supabaseClient = ctx.supabase;
      const body = await req.json();
      texto_original = body.texto_original;

      if (!texto_original?.trim()) {
        return new Response(
          JSON.stringify({ ok: false, error: 'texto_original es requerido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const apiKey = Deno.env.get('GEMINI_API_KEY') ?? '';

      const promptSistema = `Actúas como un organizador personal de alta precisión.
Objetivos obligatorios:
1. Corrige errores gramaticales, muletillas y malas transcripciones en 'texto_pulido'.
2. Extrae metadatos estructurales de la tarea basándote lógicamente en los plazos.
3. Si el usuario menciona una hora específica (ej: "antes de las 8", "a las 3pm", "para las 9:30"), extrae la hora en hora_limite (0-23) y minuto_limite (0-59).
La fecha actual es: ${new Date().toISOString()}`;

      const schemaEstructurado = {
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
      };

      const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const aiResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Procesa esta entrada: "${texto_original}"` }] }],
          systemInstruction: { parts: [{ text: promptSistema }] },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schemaEstructurado,
            temperature: 0.1,
          },
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`Error en Gemini: ${aiResponse.statusText}`);
      }

      const aiData = await aiResponse.json();
      const rawTextResult = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawTextResult) throw new Error('Gemini devolvió respuesta vacía');

      const aiResult: GeminiStructuredOutput = JSON.parse(rawTextResult);

      let fecha_vencimiento: string | null = null;
      if (aiResult.dias_plazo !== null && aiResult.dias_plazo !== undefined) {
        const dateCalculated = new Date();
        dateCalculated.setDate(dateCalculated.getDate() + aiResult.dias_plazo);
        if (aiResult.hora_limite !== null && aiResult.hora_limite !== undefined) {
          dateCalculated.setHours(aiResult.hora_limite, aiResult.minuto_limite ?? 0, 0, 0);
        } else {
          dateCalculated.setHours(23, 59, 0, 0);
        }
        fecha_vencimiento = dateCalculated.toISOString();
      } else if (aiResult.hora_limite !== null && aiResult.hora_limite !== undefined) {
        const dateCalculated = new Date();
        dateCalculated.setHours(aiResult.hora_limite, aiResult.minuto_limite ?? 0, 0, 0);
        if (dateCalculated <= new Date()) {
          dateCalculated.setDate(dateCalculated.getDate() + 1);
        }
        fecha_vencimiento = dateCalculated.toISOString();
      }

      const { data: tareaGuardada, error: dbError } = await supabaseClient
        .from('tareas')
        .insert({
          user_id,
          texto_original,
          texto_pulido: aiResult.texto_pulido,
          titulo: aiResult.titulo,
          descripcion: aiResult.descripcion || null,
          categoria: aiResult.categoria,
          nivel_urgencia: aiResult.nivel_urgencia,
          fecha_vencimiento,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return new Response(
        JSON.stringify({ ok: true, gemini_processed: true, data: tareaGuardada }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      try {
        if (!texto_original?.trim()) throw new Error('No hay texto para fallback');

        const { data: fallbackTask, error: fallbackError } = await ctx.supabase
          .from('tareas')
          .insert({
            user_id,
            texto_original,
            texto_pulido: texto_original,
            titulo: texto_original.substring(0, 50) + '...',
            descripcion: 'Procesamiento de IA no disponible. Guardado en modo fallback.',
            categoria: 'Tarea Pendiente',
            nivel_urgencia: 'Medio',
            fecha_vencimiento: null,
          })
          .select()
          .single();

        if (fallbackError) throw fallbackError;

        return new Response(
          JSON.stringify({ ok: true, gemini_processed: false, fallback_applied: true, data: fallbackTask }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fallbackCriticalError) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: 'Fallo crítico irrecuperable',
            details: fallbackCriticalError instanceof Error ? fallbackCriticalError.message : String(fallbackCriticalError),
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  }),
};

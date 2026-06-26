import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';

if (!GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  systemInstruction:
    'Eres un transcriptor de audio. Transcribe el audio exactamente como se habla, '
    + 'incluyendo pausas naturales. No añadas, resumas ni interpretes el contenido. '
    + 'Responde ÚNICAMENTE con el texto transcrito, sin introducciones ni explicaciones.',
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const { audio_base64, mime_type } = await req.json();

    if (!audio_base64) {
      return new Response(JSON.stringify({ error: 'audio_base64 es requerido' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const result = await model.generateContent([
      { text: 'Transcribe este audio:' },
      { inlineData: { mimeType: mime_type || 'audio/webm', data: audio_base64 } },
    ]);

    const transcript = result.response.text().trim();

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});

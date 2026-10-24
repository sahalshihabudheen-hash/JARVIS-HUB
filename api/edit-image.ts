export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const prompt = (formData.get('prompt') as string) || '';
    const model = (formData.get('model') as string) || 'black-forest-labs/flux.1-kontext-pro';
    const userApiKey = (formData.get('apiKey') as string) || '';
    const apiKey = userApiKey || process.env.POLLINATIONS_API_KEY || '';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No source image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'NO_API_KEY',
          message: 'Pollinations Gen API requires an API key for true image-to-image editing. Get a free key at enter.pollinations.ai/keys',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Pollinations gen v1/images/edits
    const upstreamForm = new FormData();
    upstreamForm.append('image', file);
    upstreamForm.append('prompt', prompt);
    upstreamForm.append('model', model);

    const res = await fetch('https://gen.pollinations.ai/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: upstreamForm,
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = `Pollinations returned HTTP ${res.status}`;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error?.message || errJson.message || errMsg;
      } catch {
        // fallback
      }
      return new Response(JSON.stringify({ error: errMsg }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const resultUrl = data.data?.[0]?.url || data.output?.[0] || data.url;

    if (!resultUrl) {
      return new Response(JSON.stringify({ error: 'No image URL returned by Pollinations edit model' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: resultUrl,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Server error while editing image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

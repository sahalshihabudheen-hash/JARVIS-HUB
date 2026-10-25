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
    const model = (formData.get('model') as string) || 'kontext';
    const imageUrl = (formData.get('imageUrl') as string) || '';
    const userApiKey = (formData.get('apiKey') as string) || '';
    const apiKey = userApiKey || process.env.POLLINATIONS_API_KEY || '';

    if (!file && !imageUrl) {
      return new Response(JSON.stringify({ error: 'No source image provided' }), {
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

    // Forward to Pollinations OpenAI-compatible edits endpoint.
    // Prefer JSON with a public image URL; fall back to multipart upload.
    let res: Response;
    if (imageUrl) {
      res = await fetch('https://gen.pollinations.ai/v1/images/edits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          image: imageUrl,
          response_format: 'b64_json',
        }),
      });
    } else {
      const upstreamForm = new FormData();
      upstreamForm.append('image', file as File);
      upstreamForm.append('prompt', prompt);
      upstreamForm.append('model', model);
      upstreamForm.append('response_format', 'b64_json');
      res = await fetch('https://gen.pollinations.ai/v1/images/edits', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: upstreamForm,
      });
    }

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
    const item = data.data?.[0];
    let resultUrl: string | undefined = item?.url || data.output?.[0] || data.url;
    if (!resultUrl && item?.b64_json) {
      resultUrl = item.b64_json.startsWith('data:')
        ? item.b64_json
        : `data:image/png;base64,${item.b64_json}`;
    }

    if (!resultUrl) {
      return new Response(JSON.stringify({ error: 'No image returned by Pollinations edit model' }), {
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

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

    if (!file) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: 'Unsupported file format. Please upload JPG, PNG, or WebP.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit. Please upload a smaller image.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert to base64 for upstream API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // Upload to freeimage.host server-side
    const uploadForm = new FormData();
    uploadForm.append('key', '6d207e02198a847aa98d0a2a901485a5');
    uploadForm.append('action', 'upload');
    uploadForm.append('source', base64Data);
    uploadForm.append('format', 'json');

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: uploadForm,
    });

    if (!res.ok) {
      throw new Error(`Upload service returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const publicUrl = data.image?.url || data.image?.display_url;

    if (!publicUrl) {
      throw new Error(data.error?.message || 'Failed to obtain public image URL');
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        thumb: data.image?.thumb?.url || publicUrl,
        width: data.image?.width,
        height: data.image?.height,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Image upload failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

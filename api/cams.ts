export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const gender = searchParams.get('gender') || 'female';
  const tag = searchParams.get('tag') || '';
  const limit = searchParams.get('limit') || '48';

  try {
    let url = `https://go.stripchat.com/api/models?limit=${limit}`;
    if (gender) {
      url += `&gender=${encodeURIComponent(gender)}`;
    }
    if (tag) {
      url += `&tag=${encodeURIComponent(tag)}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 30 }
    });

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ models: [], error: 'Upstream returned ' + response.status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ models: [], error: err?.message || 'Server error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

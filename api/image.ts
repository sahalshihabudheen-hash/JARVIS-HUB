export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new Response('Missing URL', { status: 400 });
  }

  // Dynamically determine the correct referer based on image host
  let referer = 'https://www.pornhub.com/';
  try {
    const host = new URL(imageUrl).hostname;
    if (host.includes('redtube')) referer = 'https://www.redtube.com/';
    else if (host.includes('eporner')) referer = 'https://www.eporner.com/';
    else if (host.includes('xvideos')) referer = 'https://www.xvideos.com/';
    else if (host.includes('pornhub') || host.includes('phncdn')) referer = 'https://www.pornhub.com/';
  } catch (_) {}

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'Referer': referer,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status });
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

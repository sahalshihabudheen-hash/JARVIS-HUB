export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || 'all';
  const page = searchParams.get('page') || '1';

  // Use Pornhub Webmasters API - Server-side fetch from Vercel US bypasses India blocks
  const query = search === 'all' ? '' : search;
  const pornhubUrl = `https://www.pornhub.com/webmasters/search?search=${encodeURIComponent(query)}&page=${page}&thumbsize=large_number`;

  try {
    const response = await fetch(pornhubUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        videos: [], 
        error: `Pornhub API error: ${response.status}`,
        debug: pornhubUrl
      }), {
        status: 200, // Return 200 so frontend doesn't crash
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    // Normalize Pornhub API response
    const videos = (data.videos || []).map((v: any) => ({
      video_id: v.video_id,
      title: v.title,
      url: v.url,
      default_thumb: v.default_thumb,
      duration: v.duration,
      views: v.views,
      rating: v.rating,
      publish_date: v.publish_date,
    }));

    return new Response(JSON.stringify({ videos }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      videos: [], 
      error: 'Internal Server Error fetching from Pornhub',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

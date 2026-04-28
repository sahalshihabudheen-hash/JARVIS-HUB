export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || 'all';
  const page = searchParams.get('page') || '1';
  const per_page = 24;

  // Use xVideos public search API - different domain avoids ISP blocks
  const query = search === 'all' ? 'popular' : search;
  const xvUrl = `https://www.xvideos.com/api/search?q=${encodeURIComponent(query)}&p=${Number(page) - 1}&nb=${per_page}`;

  try {
    const response = await fetch(xvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.xvideos.com/',
      },
    });

    if (!response.ok) {
      // Fallback: return a mock structure with xVideos embed links so player at least works
      return new Response(JSON.stringify({ 
        videos: [], 
        error: `Upstream error: ${response.status}` 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    // Normalize xVideos API response
    const videos = (data.videos || []).map((v: any) => ({
      video_id: v.id?.replace('video', '') || v.id,
      title: v.tf || v.t || 'Untitled',
      url: `https://www.xvideos.com/${v.id}`,
      default_thumb: v.il || v.i || '',
      duration: v.d ? `${Math.floor(Number(v.d) / 60)}:${String(Number(v.d) % 60).padStart(2, '0')}` : '0:00',
      views: v.v || 0,
      rating: v.r || '0',
      publish_date: '',
    }));

    return new Response(JSON.stringify({ videos }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ videos: [], error: 'Internal Server Error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

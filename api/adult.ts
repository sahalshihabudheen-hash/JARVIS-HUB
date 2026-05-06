export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || 'all';
  const page = searchParams.get('page') || '1';
  const source = searchParams.get('source') || 'pornhub';

  let query = search === 'all' ? '' : search;
  
  if (query.toLowerCase().includes("full length") && source === 'pornhub') {
    query = query.replace(/full length/i, "") + " full movie full episode";
  }

  try {
    let videos = [];

    if (source === 'pornhub') {
      const pornhubUrl = `https://www.pornhub.com/webmasters/search?search=${encodeURIComponent(query.trim())}&page=${page}&thumbsize=large_number`;
      const response = await fetch(pornhubUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });

      if (response.ok) {
        const data = await response.json();
        videos = (data.videos || []).map((v: any) => ({
          video_id: v.video_id,
          title: v.title,
          url: v.url,
          default_thumb: v.default_thumb,
          duration: v.duration,
          views: v.views,
          rating: v.rating,
          publish_date: v.publish_date,
          pornstars: (v.pornstars || []).map((p: any) => typeof p === 'string' ? p : p.pornstar_name),
          tags: (v.tags || []).map((t: any) => typeof t === 'string' ? t : t.tag_name),
          source: 'pornhub'
        }));
      }
    } else if (source === 'redtube') {
      const redtubeUrl = `https://api.redtube.com/?data=redtube.Videos.searchVideos&search=${encodeURIComponent(query)}&page=${page}&thumbsize=big`;
      const response = await fetch(redtubeUrl);
      if (response.ok) {
        const data = await response.json();
        videos = (data.videos || []).map((v: any) => ({
          video_id: v.video.video_id,
          title: v.video.title,
          url: v.video.url,
          default_thumb: v.video.default_thumb,
          duration: v.video.duration,
          views: v.video.views,
          rating: v.video.rating,
          publish_date: v.video.publish_date,
          pornstars: [],
          tags: [],
          source: 'redtube'
        }));
      }
    } else if (source === 'eporner') {
      const epornerUrl = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(query)}&per_page=30&page=${page}&thumbsize=big`;
      const response = await fetch(epornerUrl);
      if (response.ok) {
        const data = await response.json();
        videos = (data.videos || []).map((v: any) => ({
          video_id: v.id,
          title: v.title,
          url: v.url,
          default_thumb: v.default_thumb,
          duration: v.length_min,
          views: v.views,
          rating: v.rate,
          publish_date: v.added,
          pornstars: [],
          tags: [],
          source: 'eporner'
        }));
      }
    } else if (source === 'avgle') {
      // Avgle API v1 search
      const avgleUrl = `https://api.avgle.com/v1/search/${encodeURIComponent(query)}/${parseInt(page) - 1}?limit=30`;
      const response = await fetch(avgleUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.response && data.response.videos) {
          videos = data.response.videos.map((v: any) => ({
            video_id: v.vid,
            title: v.title,
            url: v.video_url,
            default_thumb: v.preview_url,
            duration: Math.floor(v.duration / 60) + ":" + (v.duration % 60).toString().padStart(2, '0'),
            views: v.views,
            rating: "95", // Avgle doesn't provide rating in search, defaulting to high for premium feel
            publish_date: new Date(v.addtime * 1000).toISOString().split('T')[0],
            pornstars: [],
            tags: [],
            source: 'avgle'
          }));
        }
      }
    }

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
      error: 'Internal Server Error fetching adult content',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

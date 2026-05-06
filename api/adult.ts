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
      const isJavCode = /^[a-z0-9]+-[0-9]+$/i.test(query.trim()) || (query.trim().includes("-") && query.length > 4);
      let endpoint = isJavCode ? 'jav' : 'search';
      const avglePage = Math.max(0, parseInt(page) - 1);
      
      const fetchFromAvgle = async (q: string, targetEndpoint: string) => {
        const avgleUrl = `https://api.avgle.com/v1/${targetEndpoint}/${encodeURIComponent(q)}/${avglePage}`;
        const response = await fetch(avgleUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          }
        });
        if (!response.ok) return [];
        const data = await response.json();
        if (data.success && data.response && data.response.videos) {
          return data.response.videos.map((v: any) => ({
            video_id: v.vid,
            title: v.title,
            url: v.embedded_url || v.video_url,
            default_thumb: v.preview_url,
            duration: typeof v.duration === 'number' ? Math.floor(v.duration / 60) + ":" + (v.duration % 60).toString().padStart(2, '0') : (v.duration || ""),
            views: v.viewnumber || v.views || 0,
            rating: "95",
            publish_date: v.addtime ? new Date(v.addtime * 1000).toISOString().split('T')[0] : (v.created_at || ""),
            pornstars: [],
            tags: [],
            source: 'avgle'
          }));
        }
        return [];
      };

      videos = await fetchFromAvgle(query, endpoint);
      
      // Try without hyphen if it failed
      if (videos.length === 0 && query.includes("-")) {
        videos = await fetchFromAvgle(query.replace("-", ""), endpoint);
      }
      
      // Fallback: If JAV endpoint returned nothing, try regular search
      if (videos.length === 0 && endpoint === 'jav') {
        videos = await fetchFromAvgle(query, 'search');
      }

      // GLOBAL FALLBACK: If Avgle is completely failing (possibly IP blocked), fallback to Pornhub with JAV tags
      if (videos.length === 0) {
        const phQuery = isJavCode ? `${query} JAV Japanese` : query;
        const pornhubUrl = `https://www.pornhub.com/webmasters/search?search=${encodeURIComponent(phQuery.trim())}&page=${page}&thumbsize=large_number`;
        const response = await fetch(pornhubUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
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
    console.error("Adult API Error:", error);
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

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
      try {
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
      } catch (e) {
        console.warn("Pornhub fetch failed, attempting RedTube fallback:", e);
      }

      // Auto-fallback to RedTube if Pornhub returned zero videos (e.g. ISP or region block)
      if (videos.length === 0) {
        try {
          const rtFallback = `https://api.redtube.com/?data=redtube.Videos.searchVideos&search=${encodeURIComponent(query)}&page=${page}&thumbsize=big`;
          const res = await fetch(rtFallback, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (res.ok) {
            const data = await res.json();
            videos = (data.videos || []).map((v: any) => ({
              video_id: v.video.video_id,
              title: v.video.title,
              url: v.video.url,
              default_thumb: v.video.default_thumb,
              duration: v.video.duration,
              views: v.video.views,
              rating: v.video.rating ? Math.round(parseFloat(v.video.rating)) : "95",
              publish_date: v.video.publish_date,
              pornstars: [],
              tags: Array.isArray(v.video.tags) ? v.video.tags.map((t: any) => t.tag_name || t) : [],
              source: 'redtube'
            }));
          }
        } catch (err) {
          console.error("RedTube fallback error:", err);
        }
      }
    } else if (source === 'redtube') {
      const redtubeUrl = `https://api.redtube.com/?data=redtube.Videos.searchVideos&search=${encodeURIComponent(query)}&page=${page}&thumbsize=big`;
      try {
        const response = await fetch(redtubeUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (response.ok) {
          const data = await response.json();
          videos = (data.videos || []).map((v: any) => ({
            video_id: v.video.video_id,
            title: v.video.title,
            url: v.video.url,
            default_thumb: v.video.default_thumb,
            duration: v.video.duration,
            views: v.video.views,
            rating: v.video.rating ? Math.round(parseFloat(v.video.rating)) : "96",
            publish_date: v.video.publish_date,
            pornstars: [],
            tags: Array.isArray(v.video.tags) ? v.video.tags.map((t: any) => t.tag_name || t) : [],
            source: 'redtube'
          }));
        }
      } catch (e) {
        console.error("RedTube fetch failed:", e);
      }
    } else if (source === 'eporner') {
      const epornerUrl = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(query)}&per_page=30&page=${page}&thumbsize=big`;
      try {
        const response = await fetch(epornerUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
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
      } catch (e) {
        console.warn("ePorner failed, falling back to RedTube:", e);
      }

      // If ePorner fails (e.g. DNS or block), fallback to RedTube
      if (videos.length === 0) {
        try {
          const rtFallback = `https://api.redtube.com/?data=redtube.Videos.searchVideos&search=${encodeURIComponent(query)}&page=${page}&thumbsize=big`;
          const res = await fetch(rtFallback, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (res.ok) {
            const data = await res.json();
            videos = (data.videos || []).map((v: any) => ({
              video_id: v.video.video_id,
              title: v.video.title,
              url: v.video.url,
              default_thumb: v.video.default_thumb,
              duration: v.video.duration,
              views: v.video.views,
              rating: v.video.rating ? Math.round(parseFloat(v.video.rating)) : "95",
              publish_date: v.video.publish_date,
              pornstars: [],
              tags: Array.isArray(v.video.tags) ? v.video.tags.map((t: any) => t.tag_name || t) : [],
              source: 'redtube'
            }));
          }
        } catch (err) {
          console.error("RedTube fallback error:", err);
        }
      }
    } else if (source === 'avgle' || source === 'jav') {
      const isJavCode = /^[a-z0-9]+-[0-9]+$/i.test(query.trim()) || (query.trim().includes("-") && query.length > 4);
      let endpoint = isJavCode ? 'jav' : 'search';
      const avglePage = Math.max(0, parseInt(page) - 1);
      
      const fetchFromAvgle = async (q: string, targetEndpoint: string) => {
        try {
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
              rating: "98",
              publish_date: v.addtime ? new Date(v.addtime * 1000).toISOString().split('T')[0] : (v.created_at || ""),
              pornstars: [],
              tags: ['JAV', 'Japanese', 'HD'],
              source: 'avgle'
            }));
          }
        } catch (err) {
          console.warn("Avgle fetch error:", err);
        }
        return [];
      };

      videos = await fetchFromAvgle(query, endpoint);
      
      if (videos.length === 0 && query.includes("-")) {
        videos = await fetchFromAvgle(query.replace("-", ""), endpoint);
      }
      
      if (videos.length === 0 && endpoint === 'jav') {
        videos = await fetchFromAvgle(query, 'search');
      }

      // If Avgle returns zero videos, search JAV on RedTube
      if (videos.length === 0) {
        try {
          const javSearch = isJavCode ? `${query} japanese` : (query ? `${query} japanese` : "japanese jav");
          const rtUrl = `https://api.redtube.com/?data=redtube.Videos.searchVideos&search=${encodeURIComponent(javSearch)}&page=${page}&thumbsize=big`;
          const response = await fetch(rtUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (response.ok) {
            const data = await response.json();
            videos = (data.videos || []).map((v: any) => ({
              video_id: v.video.video_id,
              title: v.video.title,
              url: v.video.url,
              default_thumb: v.video.default_thumb,
              duration: v.video.duration,
              views: v.video.views,
              rating: v.video.rating ? Math.round(parseFloat(v.video.rating)) : "97",
              publish_date: v.video.publish_date,
              pornstars: [],
              tags: ['JAV', 'Japanese'],
              source: 'redtube'
            }));
          }
        } catch (e) {
          console.error("JAV Redtube fallback error:", e);
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

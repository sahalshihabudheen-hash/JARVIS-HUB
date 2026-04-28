export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const source = searchParams.get('source') || 'pornhub';

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let videoData: any = null;

    if (source === 'pornhub') {
      const pornhubUrl = `https://www.pornhub.com/webmasters/video_by_id?id=${id}`;
      const response = await fetch(pornhubUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.video) {
          const v = data.video;
          videoData = {
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
          };
        }
      }
    } else if (source === 'redtube') {
      const redtubeUrl = `https://api.redtube.com/?data=redtube.Videos.getVideoById&video_id=${id}&thumbsize=big`;
      const response = await fetch(redtubeUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.video) {
          const v = data.video;
          videoData = {
            video_id: v.video_id,
            title: v.title,
            url: v.url,
            default_thumb: v.default_thumb,
            duration: v.duration,
            views: v.views,
            rating: v.rating,
            publish_date: v.publish_date,
            pornstars: [],
            tags: []
          };
        }
      }
    } else if (source === 'eporner') {
      const epornerUrl = `https://www.eporner.com/api/v2/video/id/?id=${id}`;
      const response = await fetch(epornerUrl);
      if (response.ok) {
        const v = await response.json();
        videoData = {
          video_id: v.id,
          title: v.title,
          url: v.url,
          default_thumb: v.default_thumb,
          duration: v.length_min,
          views: v.views,
          rating: v.rate,
          publish_date: v.added,
          pornstars: [],
          tags: []
        };
      }
    }

    if (!videoData) {
      return new Response(JSON.stringify({ error: 'Video not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ video: videoData }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

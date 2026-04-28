export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const pornhubUrl = `https://www.pornhub.com/webmasters/video_by_id?id=${id}`;

  try {
    const response = await fetch(pornhubUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch from Pornhub' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    if (!data.video) {
        return new Response(JSON.stringify({ error: 'Video not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const v = data.video;
    const video = {
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

    return new Response(JSON.stringify({ video }), {
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

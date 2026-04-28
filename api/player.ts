export const config = {
  runtime: 'edge',
};

// This endpoint fetches an xVideos embed page server-side (from Vercel, which is not in India)
// and extracts the actual video stream URLs so the client can play them
// The CDN URLs (cdn77-vid.xvideos-cdn.com) are not blocked by Indian ISPs
export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('id');

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Missing video ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch the xVideos embed page from Vercel's server (bypasses India ISP block)
    const embedPage = await fetch(`https://www.xvideos.com/embedframe/${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.xvideos.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const html = await embedPage.text();

    // Extract HLS stream URL from the embed page JavaScript
    const hlsMatch = html.match(/setVideoHLS\("([^"]+)"\)/);
    const mp4Match = html.match(/setVideoUrlHigh\("([^"]+)"\)/) || html.match(/html5player\.setVideoUrlHigh\('([^']+)'\)/);
    const mp4LowMatch = html.match(/setVideoUrlLow\("([^"]+)"\)/) || html.match(/html5player\.setVideoUrlLow\('([^']+)'\)/);

    const hls = hlsMatch ? hlsMatch[1] : null;
    const mp4High = mp4Match ? mp4Match[1] : null;
    const mp4Low = mp4LowMatch ? mp4LowMatch[1] : null;

    if (!hls && !mp4High) {
      return new Response(JSON.stringify({ 
        error: 'Could not extract video URL', 
        debug: html.substring(0, 500)
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ hls, mp4High, mp4Low }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=3600',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch video info' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

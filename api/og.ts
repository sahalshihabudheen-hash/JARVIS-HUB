import { VercelRequest, VercelResponse } from '@vercel/node';

const TMDB_API_KEY = "4e44d9029b1270a757cddc766a1bcb63";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { type, id, season, episode } = req.query;

  if (!id) {
    return res.status(400).send('Missing id');
  }

  try {
    let title = "JARVIS HUB";
    let description = "Stream movies, TV shows, and anime for free on JARVIS HUB.";
    let image = "https://jarvis-hub-eight.vercel.app/JARVIS2.gif";
    let watchUrl = `https://jarvis-hub-eight.vercel.app/`;

    // Handle Adult Content (Hub)
    if (type === 'adult' || req.url?.includes('/hub/watch/')) {
      try {
        const hubResponse = await fetch(`https://www.pornhub.com/webmasters/video_by_id?id=${id}&thumbsize=large_number`);
        const hubData = await hubResponse.json();
        if (hubData.video) {
          const v = hubData.video;
          title = `▶ WATCH NOW: ${v.title}`;
          description = `Duration: ${v.duration} | Views: ${v.views} | Rating: ${v.rating}%`;
          image = v.default_thumb;
          watchUrl = `https://jarvis-hub-eight.vercel.app/watch/adult/${id}`;
        }
      } catch (e) {
        title = "Premium Entertainment | JARVIS HUB";
      }
    } 
    // Handle TMDB Content (Movie/TV)
    else {
      const mediaType = type === 'tv' ? 'tv' : 'movie';
      const response = await fetch(`${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}`);
      const data = await response.json();

      title = data.title || data.name || "JARVIS HUB";
      description = data.overview || "Stream movies and TV shows on JARVIS HUB.";
      image = data.poster_path ? `https://image.tmdb.org/t/p/w780${data.poster_path}` : image;
      watchUrl = `https://jarvis-hub-eight.vercel.app/${mediaType}/${id}`;

      // If it's a TV show with specific season and episode
      if (mediaType === 'tv' && season && episode) {
        try {
          const epResponse = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`);
          const epData = await epResponse.json();
          
          if (epData.name) {
            title = `${data.name} - S${season}E${episode}: ${epData.name}`;
            description = epData.overview || description;
            if (epData.still_path) {
              image = `https://image.tmdb.org/t/p/w780${epData.still_path}`;
            }
          }
          watchUrl = `https://jarvis-hub-eight.vercel.app/watch/tv/${id}/${season}/${episode}`;
        } catch (e) {}
      } else if (req.url?.includes('/watch/')) {
        watchUrl = `https://jarvis-hub-eight.vercel.app/watch/${mediaType}/${id}`;
      }
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>▶ WATCH NOW: ${title} | JARVIS HUB</title>
        <meta name="description" content="${description}">
        
        <!-- OpenGraph -->
        <meta property="og:title" content="▶ WATCH NOW: ${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${image}">
        <meta property="og:url" content="${watchUrl}">
        <meta property="og:type" content="video.movie">
        <meta property="og:site_name" content="JARVIS HUB">
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="▶ WATCH NOW: ${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${image}">
        
        <!-- Redirect to the actual app -->
        <meta http-equiv="refresh" content="0;url=${watchUrl}">
      </head>
      <body>
        <p>Redirecting to <a href="${watchUrl}">${title}</a>...</p>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=86400');
    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}

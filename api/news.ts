export const config = { runtime: 'edge' };

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

// News sources — RSS feeds focused on OTT / films / TV
const FEEDS = [
  {
    url: 'https://timesofindia.indiatimes.com/rss/4719148.cms',
    source: 'TOI',
    region: 'india',
  },
  {
    url: 'https://www.ndtv.com/rss/entertainment',
    source: 'NDTV',
    region: 'india',
  },
  {
    url: 'https://variety.com/feed/',
    source: 'Variety',
    region: 'global',
  },
  {
    url: 'https://deadline.com/feed/',
    source: 'Deadline',
    region: 'global',
  },
  {
    url: 'https://www.hollywoodreporter.com/feed/',
    source: 'THR',
    region: 'global',
  },
  {
    url: 'https://screenrant.com/feed/category/movies/',
    source: 'ScreenRant',
    region: 'global',
  },
];

// Keywords to keep — OTT / streaming / movies / TV related
const KEEP = [
  'ott', 'netflix', 'amazon', 'prime', 'disney', 'hotstar', 'sony',
  'jio', 'zee5', 'apple', 'hbo', 'streaming', 'release', 'trailer', 
  'movie', 'film', 'series', 'season', 'episode', 'cinema', 'theatre',
  'bollywood', 'hollywood', 'malayalam', 'tamil', 'telugu', 'kannada',
  'hindi', 'review', 'premiere', 'box office', 'award', 'cast', 'actor',
  'actress', 'director', 'teaser', 'poster', 'shoot', 'sets', 'gossip',
];

function isRelevant(title: string, description: string): boolean {
  const text = (title + ' ' + description).toLowerCase();
  return KEEP.some(k => text.includes(k));
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 180);
}

function extractImage(item: any): string {
  // Try thumbnail field
  if (item.thumbnail && item.thumbnail.startsWith('http')) return item.thumbnail;
  // Try enclosure
  if (item.enclosure?.link) return item.enclosure.link;
  // Try media
  if (item['media:content']?.url) return item['media:content'].url;
  // Try to extract from description HTML
  const imgMatch = (item.description || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  return '';
}

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 20;

  try {
    const results = await Promise.allSettled(
      FEEDS.map(async (feed) => {
        const res = await fetch(`${RSS2JSON}${encodeURIComponent(feed.url)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (!res.ok) return [];
        const data = await res.json();
        if (data.status !== 'ok') return [];
        return (data.items || []).map((item: any) => ({
          id: item.guid || item.link,
          title: item.title?.trim() || '',
          description: cleanHtml(item.description || item.content || ''),
          image: extractImage(item),
          link: item.link,
          source: feed.source,
          region: feed.region,
          pubDate: item.pubDate,
        }));
      })
    );

    let all = results
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .filter(item => item.title);

    // Category filter
    if (category === 'ott') {
      const ottKw = ['netflix', 'amazon', 'prime', 'disney', 'hotstar', 'jio', 'zee5', 'apple', 'hbo', 'streaming', 'ott', 'series', 'original', 'premiere'];
      all = all.filter(a => ottKw.some(k => (a.title + a.description).toLowerCase().includes(k)));
    } else if (category === 'regional') {
      const regKw = ['malayalam', 'tamil', 'telugu', 'kannada', 'india', 'regional', 'mollywood', 'kollywood', 'tollywood', 'south', 'kerala'];
      all = all.filter(a => regKw.some(k => (a.title + a.description).toLowerCase().includes(k)));
    } else if (category === 'hollywood') {
      // For Hollywood, we take ALL global items + any items with Hollywood keywords
      const holKw = ['hollywood', 'marvel', 'dc', 'oscar', 'cannes', 'series', 'english', 'global', 'star', 'actor'];
      all = all.filter(a => a.region === 'global' || holKw.some(k => (a.title + a.description).toLowerCase().includes(k)));
    } else if (category === 'bollywood') {
      const bwKw = ['bollywood', 'hindi', 'khan', 'bwood', 'mumbai', 'kapoor', 'singh'];
      all = all.filter(a => bwKw.some(k => (a.title + a.description).toLowerCase().includes(k)));
    }

    // Deduplicate by title similarity
    const seen = new Set<string>();
    all = all.filter(item => {
      const key = item.title.substring(0, 40).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort newest first
    all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    const total = all.length;
    const paginated = all.slice((page - 1) * perPage, page * perPage);

    return new Response(JSON.stringify({ articles: paginated, total, page, perPage }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=600, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch news', articles: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

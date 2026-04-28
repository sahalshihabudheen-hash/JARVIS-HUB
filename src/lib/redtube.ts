const BASE_URL = "https://api.redtube.com/";

export interface RedTubeVideo {
  video_id: string;
  title: string;
  url: string;
  default_thumb: string;
  thumb: string;
  publish_date: string;
  duration: string;
  views: number;
  rating: string;
}

export interface RedTubeResponse {
  count: number;
  videos: { video: RedTubeVideo }[];
}

export const searchRedTubeVideos = async (search: string = 'all', page: number = 1): Promise<RedTubeResponse> => {
  const url = new URL(BASE_URL);
  url.searchParams.set('data', 'redtube.Videos.searchVideos');
  url.searchParams.set('output', 'json');
  url.searchParams.set('search', search);
  url.searchParams.set('page', page.toString());

  // Using a faster CORS proxy to improve loading speeds
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url.toString())}`;

  const response = await fetch(proxyUrl);

  if (!response.ok) throw new Error(`RedTube API error: ${response.status}`);
  return response.json();
};

export const getRedTubeEmbedUrl = (videoId: string): string => {
  return `https://embed.redtube.com/?id=${videoId}`;
};


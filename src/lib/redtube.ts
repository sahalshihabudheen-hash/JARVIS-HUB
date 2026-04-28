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
  const url = new URL('/api/adult', window.location.origin);
  url.searchParams.set('search', search);
  url.searchParams.set('page', page.toString());

  const response = await fetch(url.toString());

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};


export const getRedTubeEmbedUrl = (videoId: string): string => {
  return `https://embed.redtube.com/?id=${videoId}`;
};


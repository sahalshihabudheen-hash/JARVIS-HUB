const BASE_URL = "/api/eporner";

export interface EpornerVideo {
  id: string;
  title: string;
  url: string;
  default_thumb: {
    src: string;
    width: number;
    height: number;
  };
  thumbs: {
    src: string;
    width: number;
    height: number;
  }[];
  length_min: string;
  views: number;
  rate: number;
  added: string;
}

export interface EpornerResponse {
  count: number;
  start: number;
  per_page: number;
  page: number;
  total_pages: number;
  total_count: number;
  videos: EpornerVideo[];
}

export const searchVideos = async (query: string = 'all', page: number = 1): Promise<EpornerResponse> => {
  const url = new URL('/api/adult', window.location.origin);
  url.searchParams.set('search', query);
  url.searchParams.set('page', page.toString());

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};

export const getEpornerEmbedUrl = (id: string): string => {
  // Typical Eporner embed format
  return `https://www.eporner.com/embed/${id}/`;
};


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

export const searchVideos = async (query: string = 'all', page: number = 1, thumbsize: string = 'big'): Promise<EpornerResponse> => {
  const url = new URL(`${BASE_URL}/search/`);
  url.searchParams.set('query', query);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('thumbsize', thumbsize);
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Eporner API error: ${response.status}`);
  return response.json();
};

export const getVideoById = async (id: string): Promise<EpornerVideo> => {
  const url = new URL(`${BASE_URL}/id/`);
  url.searchParams.set('id', id);
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Eporner API error: ${response.status}`);
  return response.json();
};

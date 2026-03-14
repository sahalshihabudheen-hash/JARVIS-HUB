const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "4e44d9029b1270a757cddc766a1bcb63";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
  genre_ids?: number[];
}

export interface MediaDetails extends MediaItem {
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres: { id: number; name: string }[];
  status: string;
  tagline?: string;
  seasons?: Season[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string;
  runtime: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SearchResult {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}

export const getImageUrl = (path: string | null, size: string = "w500"): string => {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: string = "original"): string => {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

const fetchTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
  return response.json();
};

export const getTrending = async (mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week"): Promise<MediaItem[]> => {
  const data = await fetchTMDB<{ results: MediaItem[] }>(`/trending/${mediaType}/${timeWindow}`);
  return data.results;
};

export const getPopularMovies = async (page: number = 1): Promise<SearchResult> => {
  return fetchTMDB<SearchResult>("/movie/popular", { page: page.toString() });
};

export const getPopularTVShows = async (page: number = 1): Promise<SearchResult> => {
  return fetchTMDB<SearchResult>("/tv/popular", { page: page.toString() });
};

export const getTopRatedMovies = async (page: number = 1): Promise<SearchResult> => {
  return fetchTMDB<SearchResult>("/movie/top_rated", { page: page.toString() });
};

export const getTopRatedTVShows = async (page: number = 1): Promise<SearchResult> => {
  return fetchTMDB<SearchResult>("/tv/top_rated", { page: page.toString() });
};

export const getUpcomingMovies = async (page: number = 1): Promise<SearchResult> => {
  return fetchTMDB<SearchResult>("/movie/upcoming", { page: page.toString() });
};

export const getNowPlayingMovies = async (page: number = 1): Promise<SearchResult> => {
  return fetchTMDB<SearchResult>("/movie/now_playing", { page: page.toString() });
};

export const getMovieDetails = async (id: number): Promise<MediaDetails> => {
  return fetchTMDB<MediaDetails>(`/movie/${id}`);
};

export const getTVDetails = async (id: number): Promise<MediaDetails> => {
  return fetchTMDB<MediaDetails>(`/tv/${id}`);
};

export const getSeasonDetails = async (tvId: number, seasonNumber: number): Promise<{ episodes: Episode[] }> => {
  return fetchTMDB<{ episodes: Episode[] }>(`/tv/${tvId}/season/${seasonNumber}`);
};

export const searchMulti = async (query: string, page: number = 1): Promise<SearchResult> => {
  return fetchTMDB<SearchResult>("/search/multi", { query, page: page.toString() });
};

export const getMovieGenres = async (): Promise<Genre[]> => {
  const data = await fetchTMDB<{ genres: Genre[] }>("/genre/movie/list");
  return data.genres;
};

export const getTVGenres = async (): Promise<Genre[]> => {
  const data = await fetchTMDB<{ genres: Genre[] }>("/genre/tv/list");
  return data.genres;
};

export const discoverMovies = async (genreId: number, page: number = 1): Promise<SearchResult> => {
  return fetchTMDB<SearchResult>("/discover/movie", { 
    with_genres: genreId.toString(), 
    page: page.toString(),
    sort_by: "popularity.desc"
  });
};

export const discoverTV = async (genreId: number, page: number = 1): Promise<SearchResult> => {
  return fetchTMDB<SearchResult>("/discover/tv", { 
    with_genres: genreId.toString(), 
    page: page.toString(),
    sort_by: "popularity.desc"
  });
};

export const getSimilar = async (mediaType: "movie" | "tv", id: number): Promise<MediaItem[]> => {
  const data = await fetchTMDB<{ results: MediaItem[] }>(`/${mediaType}/${id}/similar`);
  return data.results;
};

export const getRecommendations = async (mediaType: "movie" | "tv", id: number): Promise<MediaItem[]> => {
  const data = await fetchTMDB<{ results: MediaItem[] }>(`/${mediaType}/${id}/recommendations`);
  return data.results;
};

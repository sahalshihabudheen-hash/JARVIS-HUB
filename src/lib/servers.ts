export interface VideoServer {
  id: string;
  name: string;
  getMovieUrl: (tmdbId: number, imdbId?: string) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number, imdbId?: string) => string;
}

export const videoServers: VideoServer[] = [
  {
    id: "superembed",
    name: "SuperEmbed (Best/Clean)",
    getMovieUrl: (tmdbId, imdbId) => imdbId ? `https://multiembed.mov/?video_id=${imdbId}` : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTVUrl: (tmdbId, season, episode, imdbId) => imdbId ? `https://multiembed.mov/?video_id=${imdbId}&s=${season}&e=${episode}` : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "vidsrcin",
    name: "Indian Mirror (Stable)",
    getMovieUrl: (tmdbId) => `https://vidsrc.in/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "moviesapi",
    name: "MoviesAPI (Fast)",
    getMovieUrl: (tmdbId) => `https://moviesapi.club/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}`,
  },
  {
    id: "vidsrcvip",
    name: "VIP Mirror (Less Ads)",
    getMovieUrl: (tmdbId) => `https://vidsrc.vip/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.vip/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcpro",
    name: "VidSrc Pro",
    getMovieUrl: (tmdbId) => `https://vidsrc.pro/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrccc",
    name: "VidSrc.cc",
    getMovieUrl: (tmdbId) => `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcme",
    name: "Vidsrc Standard",
    getMovieUrl: (tmdbId, imdbId) => imdbId ? `https://vidsrc.me/embed/movie?imdb=${imdbId}` : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode, imdbId) => imdbId ? `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}` : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
  }
];

export const getDefaultServer = (): string => {
  return localStorage.getItem("preferredServer") || "superembed";
};

export const setDefaultServer = (serverId: string): void => {
  localStorage.setItem("preferredServer", serverId);
};

export interface VideoServer {
  id: string;
  name: string;
  getMovieUrl: (tmdbId: number) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number) => string;
}

export const videoServers: VideoServer[] = [
  {
    id: "vidlink",
    name: "VidLink (Multi)",
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}?primaryColor=00d1ff&autoplay=true`,
    getTVUrl: (tmdbId, season, episode) => `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=00d1ff&autoplay=true`,
  },
  {
    id: "vidsrcto",
    name: "Vidsrc.to (Mirror 1)",
    getMovieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcpro",
    name: "Vidsrc.pro (Mirror 2)",
    getMovieUrl: (tmdbId) => `https://vidsrc.pro/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcxyz",
    name: "Vidsrc.xyz (Mirror 3)",
    getMovieUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "superembed",
    name: "SuperEmbed (Mirror 4)",
    getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTVUrl: (tmdbId, season, episode) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed (Mirror 5)",
    getMovieUrl: (tmdbId) => `https://autoembed.to/movie/tmdb/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://autoembed.to/tv/tmdb/${tmdbId}/${season}/${episode}`,
  },
];

export const getDefaultServer = (): string => {
  return localStorage.getItem("preferredServer") || "vidlink";
};

export const setDefaultServer = (serverId: string): void => {
  localStorage.setItem("preferredServer", serverId);
};

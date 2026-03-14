export interface VideoServer {
  id: string;
  name: string;
  getMovieUrl: (tmdbId: number) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number) => string;
}

export const videoServers: VideoServer[] = [
  {
    id: "vidlink",
    name: "VidLink",
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}?primaryColor=ffffff&secondaryColor=4a4a4a&iconColor=ffffff&autoplay=true`,
    getTVUrl: (tmdbId, season, episode) => `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=ffffff&secondaryColor=4a4a4a&iconColor=ffffff&autoplay=true`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    getMovieUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "embed",
    name: "Embed",
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTVUrl: (tmdbId, season, episode) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
];

export const getDefaultServer = (): string => {
  return localStorage.getItem("preferredServer") || "vidlink";
};

export const setDefaultServer = (serverId: string): void => {
  localStorage.setItem("preferredServer", serverId);
};

export interface VideoServer {
  id: string;
  name: string;
  getMovieUrl: (tmdbId: number) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number) => string;
}

export const videoServers: VideoServer[] = [
  {
    id: "vidlink",
    name: "VidLink (Multi-Source)",
    getMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}?primaryColor=00d1ff&autoplay=true`,
    getTVUrl: (tmdbId, season, episode) => `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=00d1ff&autoplay=true`,
  },
  {
    id: "embedsu",
    name: "Embed.su (Fast)",
    getMovieUrl: (tmdbId) => `https://embed.su/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "smashy",
    name: "SmashyStream",
    getMovieUrl: (tmdbId) => `https://player.smashy.stream/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`,
  },
  {
    id: "vidbinge",
    name: "VidBinge",
    getMovieUrl: (tmdbId) => `https://vidbinge.dev/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidbinge.dev/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcme",
    name: "Vidsrc.me",
    getMovieUrl: (tmdbId) => `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
  },
  {
    id: "2embed",
    name: "2Embed UI",
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    getMovieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTVUrl: (tmdbId, season, episode) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
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

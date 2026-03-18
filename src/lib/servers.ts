export interface VideoServer {
  id: string;
  name: string;
  getMovieUrl: (tmdbId: number, imdbId?: string) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number, imdbId?: string) => string;
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
    getMovieUrl: (tmdbId, imdbId) => imdbId ? `https://vidsrc.me/embed/movie?imdb=${imdbId}` : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode, imdbId) => imdbId ? `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}` : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
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
    getMovieUrl: (tmdbId, imdbId) => imdbId ? `https://multiembed.mov/?video_id=${imdbId}` : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    getTVUrl: (tmdbId, season, episode, imdbId) => imdbId ? `https://multiembed.mov/?video_id=${imdbId}&s=${season}&e=${episode}` : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "vidsrcin",
    name: "Indian Mirror",
    getMovieUrl: (tmdbId) => `https://vidsrc.in/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcxyz",
    name: "Vidsrc.xyz",
    getMovieUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcpm",
    name: "Vidsrc.pm",
    getMovieUrl: (tmdbId) => `https://vidsrc.pm/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcto",
    name: "Vidsrc.to",
    getMovieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcpro",
    name: "Vidsrc.pro",
    getMovieUrl: (tmdbId) => `https://vidsrc.pro/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrccu",
    name: "VidSrc.icu",
    getMovieUrl: (tmdbId) => `https://vidsrc.icu/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcvip",
    name: "VIP Mirror",
    getMovieUrl: (tmdbId) => `https://vidsrc.vip/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.vip/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcsu",
    name: "VidSrc.su",
    getMovieUrl: (tmdbId) => `https://vidsrc.su/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.su/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "moviesapi",
    name: "MoviesAPI",
    getMovieUrl: (tmdbId) => `https://moviesapi.club/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}`,
  },
  {
    id: "vidsrccc",
    name: "VidSrc.cc",
    getMovieUrl: (tmdbId) => `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcrip",
    name: "VidSrc.rip",
    getMovieUrl: (tmdbId) => `https://vidsrc.rip/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.rip/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcnet",
    name: "VidSrc.net",
    getMovieUrl: (tmdbId) => `https://vidsrc.net/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.net/embed/tv/${tmdbId}/${season}/${episode}`,
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

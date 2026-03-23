import { getMovieEmbedUrl, getTVEmbedUrl } from "./vidlink";

export interface VideoServer {
  id: string;
  name: string;
  getMovieUrl: (tmdbId: number, imdbId?: string, lang?: string) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number, imdbId?: string, lang?: string) => string;
  supportsSandbox: boolean;
}

export const videoServers: VideoServer[] = [
  {
    id: "superembed",
    name: "SuperEmbed (Best/Clean)",
    getMovieUrl: (tmdbId, imdbId, lang) => {
      const base = imdbId ? `https://multiembed.mov/?video_id=${imdbId}` : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      return lang ? `${base}&lang=${lang === 'ml' ? 'ml' : lang}` : base;
    },
    getTVUrl: (tmdbId, season, episode, imdbId, lang) => {
      const base = imdbId ? `https://multiembed.mov/?video_id=${imdbId}&s=${season}&e=${episode}` : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
      return lang ? `${base}&lang=${lang}` : base;
    },
    supportsSandbox: true,
  },
  {
    id: "vidlink",
    name: "VidLink (Premium)",
    getMovieUrl: (tmdbId) => getMovieEmbedUrl(tmdbId),
    getTVUrl: (tmdbId, season, episode) => getTVEmbedUrl(tmdbId, season, episode),
    supportsSandbox: true,
  },
  {
    id: "vidsrcto",
    name: "VidSrc To (Stable)",
    getMovieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: true,
  },
  {
    id: "vidsrcin",
    name: "Indian Mirror (Stable)",
    getMovieUrl: (tmdbId, _, lang) => `https://vidsrc.in/embed/movie/${tmdbId}${lang ? `?ds_lang=${lang}` : ""}`,
    getTVUrl: (tmdbId, season, episode, _, lang) => `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${episode}${lang ? `?ds_lang=${lang}` : ""}`,
    supportsSandbox: true,
  },
  {
    id: "moviesapi",
    name: "MoviesAPI (Fast)",
    getMovieUrl: (tmdbId, _, lang) => `https://moviesapi.club/movie/${tmdbId}${lang ? `?lang=${lang}` : ""}`,
    getTVUrl: (tmdbId, season, episode, _, lang) => `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}${lang ? `?lang=${lang}` : ""}`,
    supportsSandbox: true,
  },
  {
    id: "embedsu",
    name: "Embed.su (Clean)",
    getMovieUrl: (tmdbId) => `https://embed.su/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    getMovieUrl: (tmdbId) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
    supportsSandbox: false,
  },
  {
    id: "autoembed",
    name: "AutoEmbed (Fast)",
    getMovieUrl: (tmdbId) => `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "vidsrcvip",
    name: "VIP Mirror (Less Ads)",
    getMovieUrl: (tmdbId, _, lang) => `https://vidsrc.vip/embed/movie/${tmdbId}${lang ? `?lang=${lang}` : ""}`,
    getTVUrl: (tmdbId, season, episode, _, lang) => `https://vidsrc.vip/embed/tv/${tmdbId}/${season}/${episode}${lang ? `?lang=${lang}` : ""}`,
    supportsSandbox: false,
  },
  {
    id: "vidsrcpro",
    name: "VidSrc Pro",
    getMovieUrl: (tmdbId, _, lang) => `https://vidsrc.pro/embed/movie/${tmdbId}${lang ? `?lang=${lang}` : ""}`,
    getTVUrl: (tmdbId, season, episode, _, lang) => `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}${lang ? `?lang=${lang}` : ""}`,
    supportsSandbox: false,
  },
  {
    id: "vidsrccc",
    name: "VidSrc.cc",
    getMovieUrl: (tmdbId, _, lang) => `https://vidsrc.cc/v2/embed/movie/${tmdbId}${lang ? `?lang=${lang}` : ""}`,
    getTVUrl: (tmdbId, season, episode, _, lang) => `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}${lang ? `?lang=${lang}` : ""}`,
    supportsSandbox: false,
  },
  {
    id: "vidsrcme",
    name: "Vidsrc Standard",
    getMovieUrl: (tmdbId, imdbId, lang) => {
      const base = imdbId ? `https://vidsrc.me/embed/movie?imdb=${imdbId}` : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
      return lang ? `${base}&lang=${lang}` : base;
    },
    getTVUrl: (tmdbId, season, episode, imdbId, lang) => {
      const base = imdbId ? `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}` : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      return lang ? `${base}&lang=${lang}` : base;
    },
    supportsSandbox: false,
  }
];

export const getDefaultServer = (): string => {
  return localStorage.getItem("preferredServer") || "superembed";
};

export const setDefaultServer = (serverId: string): void => {
  localStorage.setItem("preferredServer", serverId);
};

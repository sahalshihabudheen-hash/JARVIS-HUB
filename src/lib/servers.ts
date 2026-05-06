import { getMovieEmbedUrl, getTVEmbedUrl } from "./vidlink";

export interface VideoServer {
  id: string;
  name: string;
  getMovieUrl: (tmdbId: number, imdbId?: string, lang?: string) => string;
  getTVUrl: (tmdbId: number, season: number, episode: number, imdbId?: string, lang?: string) => string;
  supportsSandbox: boolean;
}

export const videoServers: VideoServer[] = [
  // ── Cleanest / Less-Ads (Recommended first) ─────────────────────────────────
  {
    id: "rivestream",
    name: "🧹 RiveStream (Cleanest)",
    getMovieUrl: (tmdbId) => `https://rivestream.live/embed?type=movie&id=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://rivestream.live/embed?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`,
    supportsSandbox: false,
  },
  {
    id: "vidsrcrip",
    name: "🧹 VidSrc RIP (Clean)",
    getMovieUrl: (tmdbId) => `https://vidsrc.rip/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.rip/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "nontongo",
    name: "🧹 NontonGo (Clean)",
    getMovieUrl: (tmdbId) => `https://www.nontongo.win/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://www.nontongo.win/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "embedsu",
    name: "🧹 Embed.su (Clean)",
    getMovieUrl: (tmdbId) => `https://embed.su/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "vidsrcin",
    name: "🇮🇳 Indian Mirror",
    getMovieUrl: (tmdbId, _, lang) => `https://vidsrc.in/embed/movie/${tmdbId}${lang ? `?ds_lang=${lang}` : ""}`,
    getTVUrl: (tmdbId, season, episode, _, lang) => `https://vidsrc.in/embed/tv/${tmdbId}/${season}/${episode}${lang ? `?ds_lang=${lang}` : ""}`,
    supportsSandbox: true,
  },
  {
    id: "111movies",
    name: "🇮🇳 111Movies (Indian)",
    getMovieUrl: (tmdbId) => `https://111movies.com/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://111movies.com/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "frembed",
    name: "🧹 Frembed (Less Ads)",
    getMovieUrl: (_, imdbId) => imdbId ? `https://frembed.pro/api/film.php?id=${imdbId}` : ``,
    getTVUrl: (_, season, episode, imdbId) => imdbId ? `https://frembed.pro/api/serie.php?id=${imdbId}&sa=${season}&epi=${episode}` : ``,
    supportsSandbox: false,
  },
  // ── Standard Servers ────────────────────────────────────────────────────────
  {
    id: "superembed",
    name: "SuperEmbed",
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
    name: "VidSrc To",
    getMovieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: true,
  },
  {
    id: "vidsrcxyz",
    name: "VidSrc XYZ",
    getMovieUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: true,
  },
  {
    id: "moviesapi",
    name: "MoviesAPI",
    getMovieUrl: (tmdbId, _, lang) => `https://moviesapi.club/movie/${tmdbId}${lang ? `?lang=${lang}` : ""}`,
    getTVUrl: (tmdbId, season, episode, _, lang) => `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}${lang ? `?lang=${lang}` : ""}`,
    supportsSandbox: true,
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    getMovieUrl: (tmdbId) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
    supportsSandbox: false,
  },
  {
    id: "vidsrcnet",
    name: "VidSrc Net",
    getMovieUrl: (tmdbId) => `https://vidsrc.net/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.net/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "vidsrcstream",
    name: "VidSrc Stream",
    getMovieUrl: (tmdbId) => `https://vidsrc.stream/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidsrc.stream/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    getMovieUrl: (tmdbId) => `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "twoembed",
    name: "2Embed",
    getMovieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
    supportsSandbox: false,
  },
  {
    id: "flicky",
    name: "Flicky",
    getMovieUrl: (tmdbId) => `https://flicky.host/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://flicky.host/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "vidapi",
    name: "VidAPI",
    getMovieUrl: (tmdbId) => `https://vidapi.dev/embed/movie/${tmdbId}`,
    getTVUrl: (tmdbId, season, episode) => `https://vidapi.dev/embed/tv/${tmdbId}/${season}/${episode}`,
    supportsSandbox: false,
  },
  {
    id: "vidsrcvip",
    name: "VIP Mirror",
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
  },
];

export const getDefaultServer = (): string => {
  return localStorage.getItem("preferredServer") || "rivestream";
};

export const setDefaultServer = (serverId: string): void => {
  localStorage.setItem("preferredServer", serverId);
};

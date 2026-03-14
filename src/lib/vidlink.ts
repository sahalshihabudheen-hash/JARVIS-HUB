const VIDLINK_BASE = "https://vidlink.pro";

export interface VidLinkOptions {
  primaryColor?: string;
  secondaryColor?: string;
  iconColor?: string;
  icons?: "vid" | "default";
  title?: boolean;
  poster?: boolean;
  autoplay?: boolean;
  nextButton?: boolean;
  player?: "default" | "jwplayer";
}

const defaultOptions: VidLinkOptions = {
  primaryColor: "ffffff",
  secondaryColor: "4a4a4a",
  iconColor: "ffffff",
  icons: "vid",
  title: true,
  poster: true,
  autoplay: true,
  nextButton: true,
  player: "default",
};

const buildParams = (options: VidLinkOptions): string => {
  const params = new URLSearchParams();
  const opts = { ...defaultOptions, ...options };
  
  if (opts.primaryColor) params.set("primaryColor", opts.primaryColor);
  if (opts.secondaryColor) params.set("secondaryColor", opts.secondaryColor);
  if (opts.iconColor) params.set("iconColor", opts.iconColor);
  if (opts.icons) params.set("icons", opts.icons);
  if (opts.title !== undefined) params.set("title", opts.title.toString());
  if (opts.poster !== undefined) params.set("poster", opts.poster.toString());
  if (opts.autoplay !== undefined) params.set("autoplay", opts.autoplay.toString());
  if (opts.nextButton !== undefined) params.set("nextbutton", opts.nextButton.toString());
  if (opts.player) params.set("player", opts.player);
  
  return params.toString();
};

export const getMovieEmbedUrl = (tmdbId: number, options?: VidLinkOptions): string => {
  const params = buildParams(options || {});
  return `${VIDLINK_BASE}/movie/${tmdbId}?${params}`;
};

export const getTVEmbedUrl = (
  tmdbId: number,
  season: number,
  episode: number,
  options?: VidLinkOptions
): string => {
  const params = buildParams(options || {});
  return `${VIDLINK_BASE}/tv/${tmdbId}/${season}/${episode}?${params}`;
};

export const getAnimeEmbedUrl = (
  malId: number,
  episodeNumber: number,
  subOrDub: "sub" | "dub" = "sub",
  options?: VidLinkOptions & { fallback?: boolean }
): string => {
  const params = buildParams(options || {});
  const fallback = options?.fallback ? "&fallback=true" : "";
  return `${VIDLINK_BASE}/anime/${malId}/${episodeNumber}/${subOrDub}?${params}${fallback}`;
};

export interface WatchProgress {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string;
  backdrop_path?: string;
  progress: {
    watched: number;
    duration: number;
  };
  last_season_watched?: string;
  last_episode_watched?: string;
  show_progress?: Record<string, {
    season: string;
    episode: string;
    progress: {
      watched: number;
      duration: number;
    };
  }>;
  last_updated?: number;
}

export const getWatchProgress = (): Record<string, WatchProgress> => {
  try {
    const data = localStorage.getItem("vidLinkProgress");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const getContinueWatching = (): WatchProgress[] => {
  const progress = getWatchProgress();
  return Object.values(progress)
    .filter(item => {
      const percentage = (item.progress.watched / item.progress.duration) * 100;
      return percentage > 5 && percentage < 95;
    })
    .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0))
    .slice(0, 10);
};

export const clearWatchProgress = (): void => {
  localStorage.removeItem("vidLinkProgress");
};

export const setupProgressListener = (): void => {
  window.addEventListener("message", (event) => {
    if (event.origin !== "https://vidlink.pro") return;
    
    if (event.data?.type === "MEDIA_DATA") {
      const mediaData = event.data.data;
      localStorage.setItem("vidLinkProgress", JSON.stringify(mediaData));
    }
  });
};

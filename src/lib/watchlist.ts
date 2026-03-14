export interface WatchlistItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  added_at: number;
}

const WATCHLIST_KEY = "strelix_watchlist";

export const getWatchlist = (): WatchlistItem[] => {
  try {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addToWatchlist = (item: Omit<WatchlistItem, "added_at">): void => {
  const watchlist = getWatchlist();
  const exists = watchlist.some(
    (w) => w.id === item.id && w.type === item.type
  );
  
  if (!exists) {
    watchlist.unshift({ ...item, added_at: Date.now() });
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }
};

export const removeFromWatchlist = (id: number, type: "movie" | "tv"): void => {
  const watchlist = getWatchlist();
  const filtered = watchlist.filter(
    (item) => !(item.id === id && item.type === type)
  );
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
};

export const isInWatchlist = (id: number, type: "movie" | "tv"): boolean => {
  const watchlist = getWatchlist();
  return watchlist.some((item) => item.id === id && item.type === type);
};

export const toggleWatchlist = (item: Omit<WatchlistItem, "added_at">): boolean => {
  if (isInWatchlist(item.id, item.type)) {
    removeFromWatchlist(item.id, item.type);
    return false;
  } else {
    addToWatchlist(item);
    return true;
  }
};

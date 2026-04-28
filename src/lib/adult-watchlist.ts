
export interface AdultWatchlistItem {
  id: string;
  title: string;
  thumbnail: string;
  addedAt: number;
  duration?: string;
}

const STORAGE_KEY = "jarvis_adult_watchlist";

export const getAdultWatchlist = (): AdultWatchlistItem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const toggleAdultWatchlist = (item: Omit<AdultWatchlistItem, "addedAt">) => {
  if (typeof window === "undefined") return false;
  
  const watchlist = getAdultWatchlist();
  const existingIndex = watchlist.findIndex(h => h.id === item.id);
  
  if (existingIndex > -1) {
    watchlist.splice(existingIndex, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    return false; // Removed
  } else {
    const newItem: AdultWatchlistItem = {
      ...item,
      addedAt: Date.now()
    };
    watchlist.unshift(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    return true; // Added
  }
};

export const isInAdultWatchlist = (id: string): boolean => {
  if (typeof window === "undefined") return false;
  const watchlist = getAdultWatchlist();
  return watchlist.some(h => h.id === id);
};

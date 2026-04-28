
export interface AdultHistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  timestamp: number;
  progress?: number;
  duration?: string;
}

const STORAGE_KEY = "jarvis_adult_history";

export const getAdultHistory = (): AdultHistoryItem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addToAdultHistory = (item: Omit<AdultHistoryItem, "timestamp">) => {
  if (typeof window === "undefined") return;
  
  // Check if private mode is on
  const isPrivate = localStorage.getItem("adult_private_mode") === "true";
  if (isPrivate) return;

  const history = getAdultHistory();
  const existingIndex = history.findIndex(h => h.id === item.id);
  
  const newItem: AdultHistoryItem = {
    ...item,
    timestamp: Date.now()
  };

  if (existingIndex > -1) {
    history.splice(existingIndex, 1);
  }
  
  history.unshift(newItem);
  
  // Keep last 100 items
  const limitedHistory = history.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
};

export const removeFromAdultHistory = (id: string) => {
  if (typeof window === "undefined") return;
  const history = getAdultHistory();
  const filtered = history.filter(h => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearAdultHistory = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

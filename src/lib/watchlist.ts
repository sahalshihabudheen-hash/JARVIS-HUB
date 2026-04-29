import { db } from "./firebase";
import { doc, setDoc, getDocs, collection, query, where, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore";

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

export const getWatchlist = (userId?: string): WatchlistItem[] => {
  try {
    const key = userId ? `${WATCHLIST_KEY}_${userId}` : WATCHLIST_KEY;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveWatchlistCloud = async (userId: string, item: WatchlistItem): Promise<void> => {
  try {
    const docId = `${userId}_wl_${item.type}_${item.id}`;
    const docRef = doc(db, "watchlist", docId);
    await setDoc(docRef, {
      ...item,
      userId,
      added_at: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error("Failed to save watchlist to cloud", e);
  }
};

export const syncWatchlistFromCloud = async (userId: string): Promise<WatchlistItem[]> => {
  try {
    const q = query(
      collection(db, "watchlist"),
      where("userId", "==", userId),
      orderBy("added_at", "desc")
    );
    const snapshot = await getDocs(q);
    const cloudWatchlist: WatchlistItem[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data() as any;
      cloudWatchlist.push({
        ...data,
        added_at: data.added_at?.toMillis?.() || Date.now()
      });
    });

    const key = `${WATCHLIST_KEY}_${userId}`;
    const localWatchlist = getWatchlist(userId);
    
    const watchlistMap = new Map<string, WatchlistItem>();
    cloudWatchlist.forEach(item => watchlistMap.set(`${item.type}_${item.id}`, item));
    localWatchlist.forEach(item => {
      const id = `${item.type}_${item.id}`;
      if (!watchlistMap.has(id) || item.added_at > (watchlistMap.get(id)?.added_at || 0)) {
        watchlistMap.set(id, item);
      }
    });

    const finalWatchlist = Array.from(watchlistMap.values())
      .sort((a, b) => b.added_at - a.added_at);

    localStorage.setItem(key, JSON.stringify(finalWatchlist));
    return finalWatchlist;
  } catch (e) {
    console.error("Watchlist cloud sync failed", e);
    return getWatchlist(userId);
  }
};

export const addToWatchlist = (item: Omit<WatchlistItem, "added_at">, userId?: string): void => {
  const watchlist = getWatchlist(userId);
  const exists = watchlist.some(
    (w) => w.id === item.id && w.type === item.type
  );
  
  if (!exists) {
    const newItem = { ...item, added_at: Date.now() };
    watchlist.unshift(newItem);
    const key = userId ? `${WATCHLIST_KEY}_${userId}` : WATCHLIST_KEY;
    localStorage.setItem(key, JSON.stringify(watchlist));

    if (userId) {
      saveWatchlistCloud(userId, newItem);
    }
  }
};

export const removeFromWatchlist = async (id: number, type: "movie" | "tv", userId?: string): Promise<void> => {
  const watchlist = getWatchlist(userId);
  const filtered = watchlist.filter(
    (item) => !(item.id === id && item.type === type)
  );
  const key = userId ? `${WATCHLIST_KEY}_${userId}` : WATCHLIST_KEY;
  localStorage.setItem(key, JSON.stringify(filtered));

  if (userId) {
    try {
      const docId = `${userId}_wl_${type}_${id}`;
      await deleteDoc(doc(db, "watchlist", docId));
    } catch (e) {
      console.error("Failed to delete from cloud watchlist", e);
    }
  }
};

export const isInWatchlist = (id: number, type: "movie" | "tv", userId?: string): boolean => {
  const watchlist = getWatchlist(userId);
  return watchlist.some((item) => item.id === id && item.type === type);
};

export const toggleWatchlist = (item: Omit<WatchlistItem, "added_at">, userId?: string): boolean => {
  if (isInWatchlist(item.id, item.type, userId)) {
    removeFromWatchlist(item.id, item.type, userId);
    return false;
  } else {
    addToWatchlist(item, userId);
    return true;
  }
};

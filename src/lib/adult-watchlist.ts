import { db } from "./firebase";
import { doc, setDoc, getDocs, collection, query, where, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore";

export interface AdultWatchlistItem {
  id: string;
  title: string;
  thumbnail: string;
  addedAt: number;
  duration?: string;
  source?: string;
}

const STORAGE_KEY = "jarvis_adult_watchlist";

export const getAdultWatchlist = (userId?: string): AdultWatchlistItem[] => {
  if (typeof window === "undefined") return [];
  const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const saveAdultWatchlistCloud = async (userId: string, item: AdultWatchlistItem): Promise<void> => {
  try {
    const docId = `${userId}_awl_${item.id}`;
    const docRef = doc(db, "adult_watchlist", docId);
    await setDoc(docRef, {
      ...item,
      userId,
      addedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error("Failed to save adult watchlist to cloud", e);
  }
};

export const syncAdultWatchlistFromCloud = async (userId: string): Promise<AdultWatchlistItem[]> => {
  try {
    const q = query(
      collection(db, "adult_watchlist"),
      where("userId", "==", userId),
      orderBy("addedAt", "desc")
    );
    const snapshot = await getDocs(q);
    const cloudWatchlist: AdultWatchlistItem[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data() as any;
      cloudWatchlist.push({
        ...data,
        addedAt: data.addedAt?.toMillis?.() || Date.now()
      });
    });

    const key = `${STORAGE_KEY}_${userId}`;
    const localWatchlist = getAdultWatchlist(userId);
    
    const watchlistMap = new Map<string, AdultWatchlistItem>();
    cloudWatchlist.forEach(item => watchlistMap.set(item.id, item));
    localWatchlist.forEach(item => {
      if (!watchlistMap.has(item.id) || item.addedAt > (watchlistMap.get(item.id)?.addedAt || 0)) {
        watchlistMap.set(item.id, item);
      }
    });

    const finalWatchlist = Array.from(watchlistMap.values())
      .sort((a, b) => b.addedAt - a.addedAt);

    localStorage.setItem(key, JSON.stringify(finalWatchlist));
    return finalWatchlist;
  } catch (e) {
    console.error("Adult watchlist cloud sync failed", e);
    return getAdultWatchlist(userId);
  }
};

export const toggleAdultWatchlist = (item: Omit<AdultWatchlistItem, "addedAt">, userId?: string) => {
  if (typeof window === "undefined") return false;
  
  const watchlist = getAdultWatchlist(userId);
  const existingIndex = watchlist.findIndex(h => h.id === item.id);
  
  const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;

  if (existingIndex > -1) {
    watchlist.splice(existingIndex, 1);
    localStorage.setItem(key, JSON.stringify(watchlist));
    
    if (userId) {
      const docId = `${userId}_awl_${item.id}`;
      deleteDoc(doc(db, "adult_watchlist", docId)).catch(console.error);
    }
    
    return false; // Removed
  } else {
    const newItem: AdultWatchlistItem = {
      ...item,
      addedAt: Date.now()
    };
    watchlist.unshift(newItem);
    localStorage.setItem(key, JSON.stringify(watchlist));

    if (userId) {
      saveAdultWatchlistCloud(userId, newItem);
    }
    
    return true; // Added
  }
};

export const isInAdultWatchlist = (id: string, userId?: string): boolean => {
  if (typeof window === "undefined") return false;
  const watchlist = getAdultWatchlist(userId);
  return watchlist.some(h => h.id === id);
};

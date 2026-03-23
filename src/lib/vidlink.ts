const VIDLINK_BASE = "https://vidlink.pro";
import { db } from "./firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp, orderBy, limit, deleteDoc } from "firebase/firestore";


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
  isAnimation?: boolean;
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

export const getWatchProgress = (userId?: string): Record<string, WatchProgress> => {
  try {
    const key = userId ? `vidLinkProgress_${userId}` : "vidLinkProgress";
    const data = localStorage.getItem(key);
    const history: Record<string, WatchProgress> = data ? JSON.parse(data) : {};
    
    // Migration: If we find old keys (numeric IDs without type_prefix), migrate them
    let migrated = false;
    Object.keys(history).forEach(k => {
      // Check if key is purely numeric or doesn't have the expected prefix
      if (!k.includes("_") && history[k].type && history[k].id) {
        const newKey = `${history[k].type}_${history[k].id}`;
        // Move to new key if it doesn't exist or is older
        if (!history[newKey] || (history[k].last_updated || 0) > (history[newKey].last_updated || 0)) {
          history[newKey] = history[k];
        }
        delete history[k];
        migrated = true;
      }
    });

    if (migrated) {
      localStorage.setItem(key, JSON.stringify(history));
    }

    return history;
  } catch {
    return {};
  }
};

export const getContinueWatching = (userId?: string): WatchProgress[] => {
  const progress = getWatchProgress(userId);
  return Object.values(progress)
    .filter(item => {
      const percentage = (item.progress.watched / item.progress.duration) * 100;
      return percentage > 5 && percentage < 95;
    })
    .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0))
    .slice(0, 10);
};

export const clearWatchProgress = async (userId?: string): Promise<void> => {
  const key = userId ? `vidLinkProgress_${userId}` : "vidLinkProgress";
  localStorage.removeItem(key);
  
  if (userId) {
    try {
      const q = query(collection(db, "watch_history"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.error("Failed to clear cloud history", e);
    }
  }
};

export const syncHistoryFromCloud = async (userId: string): Promise<Record<string, WatchProgress>> => {
  try {
    const q = query(
      collection(db, "watch_history"), 
      where("userId", "==", userId),
      orderBy("last_updated", "desc")
    );
    const snapshot = await getDocs(q);
    const cloudHistory: Record<string, WatchProgress> = {};
    
    snapshot.forEach(doc => {
      const data = doc.data() as any;
      cloudHistory[data.id.toString()] = {
        ...data,
        last_updated: data.last_updated?.toMillis?.() || Date.now()
      };
    });

    const key = `vidLinkProgress_${userId}`;
    const localStr = localStorage.getItem(key);
    const localHistory = localStr ? JSON.parse(localStr) : {};
    
    // Merge: cloud wins unless local is newer
    const finalHistory = { ...cloudHistory, ...localHistory };
    localStorage.setItem(key, JSON.stringify(finalHistory));
    
    return finalHistory;
  } catch (e) {
    console.error("Cloud sync failed", e);
    return getWatchProgress(userId);
  }
};

export const saveWatchProgressCloud = async (userId: string, progress: WatchProgress): Promise<void> => {
  try {
    const docId = `${userId}_${progress.type}_${progress.id}`;
    const docRef = doc(db, "watch_history", docId);
    await setDoc(docRef, {
      ...progress,
      userId,
      last_updated: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error("Failed to save progress to cloud", e);
  }
};

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export const saveSearchHistory = async (userId: string, searchQuery: string): Promise<void> => {
  if (!searchQuery.trim()) return;
  try {
    const userDocId = userId.replace(/\./g, "_");
    const docRef = doc(collection(db, "users", userDocId, "search_history"));
    await setDoc(docRef, {
      query: searchQuery,
      timestamp: serverTimestamp()
    });
    
    // Also save to local for immediate feedback
    const localKey = `searchHistory_${userId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    const updated = [{ query: searchQuery, timestamp: Date.now() }, ...existing].slice(0, 20);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save search history", e);
  }
};

export const getSearchHistory = async (userId: string): Promise<SearchHistoryItem[]> => {
  try {
    const userDocId = userId.replace(/\./g, "_");
    const q = query(
      collection(db, "users", userDocId, "search_history"), 
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      query: doc.data().query,
      timestamp: doc.data().timestamp?.toMillis?.() || Date.now()
    }));
  } catch (e) {
    console.error("Failed to fetch search history", e);
    return [];
  }
};

export const setupProgressListener = (userId?: string): (() => void) => {
  const handleMessage = async (event: MessageEvent) => {
    // Both origins are common for VidLink mirrors
    if (event.origin !== "https://vidlink.pro" && event.origin !== "https://vidsrc.pro") return;
    
    if (event.data?.type === "MEDIA_DATA") {
      const mediaData = event.data.data;
      if (mediaData && typeof mediaData === "object") {
        const key = userId ? `vidLinkProgress_${userId}` : "vidLinkProgress";
        const existing = getWatchProgress(userId);
        
        // Normalize keys and merge
        const normalizedData: Record<string, WatchProgress> = {};
        Object.entries(mediaData).forEach(([k, v]: [string, any]) => {
          // VidLink usually uses keys like "movie_123" or "tv_123"
          // We ensure our internal keys match this or are normalized to it
          normalizedData[k] = v;
        });

        const updated = { ...existing, ...normalizedData };
        localStorage.setItem(key, JSON.stringify(updated));

        // Sync to Cloud if logged in
        if (userId) {
          Object.values(normalizedData).forEach((item: WatchProgress) => {
            saveWatchProgressCloud(userId, item);
          });
        }
      }
    }
  };

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
};

import { db } from "./firebase";
import { doc, setDoc, getDocs, collection, query, where, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore";

export interface AdultHistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  timestamp: number;
  progress?: number;
  duration?: string;
  source?: string;
}

const STORAGE_KEY = "jarvis_adult_history";

export const getAdultHistory = (userId?: string): AdultHistoryItem[] => {
  if (typeof window === "undefined") return [];
  const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const saveAdultHistoryCloud = async (userId: string, item: AdultHistoryItem): Promise<void> => {
  try {
    const docId = `${userId}_adult_${item.id}`;
    const docRef = doc(db, "adult_history", docId);
    await setDoc(docRef, {
      ...item,
      userId,
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error("Failed to save adult history to cloud", e);
  }
};

export const syncAdultHistoryFromCloud = async (userId: string): Promise<AdultHistoryItem[]> => {
  try {
    const q = query(
      collection(db, "adult_history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    const cloudHistory: AdultHistoryItem[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data() as any;
      cloudHistory.push({
        ...data,
        timestamp: data.timestamp?.toMillis?.() || Date.now()
      });
    });

    const key = `${STORAGE_KEY}_${userId}`;
    const localHistory = getAdultHistory(userId);
    
    // Merge logic: Map by ID, cloud results are already sorted by desc timestamp
    const historyMap = new Map<string, AdultHistoryItem>();
    cloudHistory.forEach(item => historyMap.set(item.id, item));
    localHistory.forEach(item => {
      if (!historyMap.has(item.id) || item.timestamp > (historyMap.get(item.id)?.timestamp || 0)) {
        historyMap.set(item.id, item);
      }
    });

    const finalHistory = Array.from(historyMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);

    localStorage.setItem(key, JSON.stringify(finalHistory));
    return finalHistory;
  } catch (e) {
    console.error("Adult cloud sync failed", e);
    return getAdultHistory(userId);
  }
};

export const addToAdultHistory = (item: Omit<AdultHistoryItem, "timestamp">, userId?: string) => {
  if (typeof window === "undefined") return;
  
  // Check if private mode is on
  const isPrivate = localStorage.getItem("adult_private_mode") === "true";
  if (isPrivate) return;

  const history = getAdultHistory(userId);
  const existingIndex = history.findIndex(h => h.id === item.id);
  
  const newItem: AdultHistoryItem = {
    ...item,
    timestamp: Date.now()
  };

  if (existingIndex > -1) {
    history.splice(existingIndex, 1);
  }
  
  history.unshift(newItem);
  
  const limitedHistory = history.slice(0, 100);
  const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  localStorage.setItem(key, JSON.stringify(limitedHistory));

  if (userId) {
    saveAdultHistoryCloud(userId, newItem);
  }
};

export const removeFromAdultHistory = async (id: string, userId?: string) => {
  if (typeof window === "undefined") return;
  const history = getAdultHistory(userId);
  const filtered = history.filter(h => h.id !== id);
  const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  localStorage.setItem(key, JSON.stringify(filtered));

  if (userId) {
    try {
      const docId = `${userId}_adult_${id}`;
      await deleteDoc(doc(db, "adult_history", docId));
    } catch (e) {
      console.error("Failed to delete adult history from cloud", e);
    }
  }
};

export const clearAdultHistory = async (userId?: string) => {
  if (typeof window === "undefined") return;
  const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  localStorage.removeItem(key);

  if (userId) {
    try {
      const q = query(collection(db, "adult_history"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.error("Failed to clear adult cloud history", e);
    }
  }
};

import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

export type StreamType = "mp4" | "hls" | "iframe" | "magnet";

export interface CustomStream {
  id: string; // Firestore doc id: `movie_<tmdbId>` or `tv_<tmdbId>`
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string;
  streamUrl: string;
  streamType: StreamType;
  language: string; // e.g. "ml", "en", "hi"
  quality: string; // e.g. "1080p", "720p", "HDRip"
  note?: string; // admin note e.g. "From Telegram @malayalammovies"
  addedBy: string;
  addedAt: any;
}

const COLLECTION = "custom_streams";

// ─── Admin: Save / Update ─────────────────────────────────────────────────────

export const saveCustomStream = async (
  stream: Omit<CustomStream, "id" | "addedAt">
): Promise<void> => {
  const docId = `${stream.mediaType}_${stream.tmdbId}`;
  await setDoc(
    doc(db, COLLECTION, docId),
    {
      ...stream,
      id: docId,
      addedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// ─── Admin: Delete ────────────────────────────────────────────────────────────

export const deleteCustomStream = async (
  mediaType: "movie" | "tv",
  tmdbId: number
): Promise<void> => {
  const docId = `${mediaType}_${tmdbId}`;
  await deleteDoc(doc(db, COLLECTION, docId));
};

// ─── Player: Fetch single stream for a movie/show ────────────────────────────

export const getCustomStream = async (
  mediaType: "movie" | "tv",
  tmdbId: number
): Promise<CustomStream | null> => {
  try {
    const docId = `${mediaType}_${tmdbId}`;
    const snap = await getDoc(doc(db, COLLECTION, docId));
    if (snap.exists()) return snap.data() as CustomStream;
    return null;
  } catch {
    return null;
  }
};

// ─── Admin: List all streams ──────────────────────────────────────────────────

export const listCustomStreams = async (): Promise<CustomStream[]> => {
  try {
    const q = query(collection(db, COLLECTION), orderBy("addedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as CustomStream);
  } catch {
    return [];
  }
};

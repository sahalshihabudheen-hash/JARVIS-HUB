import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, getDocs } from "firebase/firestore";

interface AppBranding {
  appName: string;
  appLogo: string;
  tagline: string;
  copyrightText: string;
  poweredBy: string;
}

interface AdminContextType {
  branding: AppBranding;
  updateBranding: (newBranding: Partial<AppBranding>) => void;
  // Activity
  activityLog: ActivityEntry[];
  addActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => void;
  // Users
  users: AdminUser[];
  refreshData: () => void;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  location: string;
  device: string;
  os: string;
  browser: string;
  isp: string;
  status: "online" | "offline";
  isAdmin: boolean;
  isVerified: boolean;
  countryCode: string;
  photoURL?: string;
}

export interface ActivityEntry {
  id: string;
  userEmail: string;
  mediaTitle: string;
  mediaType: "movie" | "tv";
  mediaPoster: string;
  timestamp: string;
}

const defaultBranding: AppBranding = {
  appName: "JARVIS HUB",
  appLogo: "/JARVIS2.gif",
  tagline: "ADVANCED MEDIA INTERFACE",
  copyrightText: "© 2026 JARVIS HUB",
  poweredBy: "Powered by AI",
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<AppBranding>(defaultBranding);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const refreshData = async () => {
    toast.success("Syncing with JARVIS database...", { icon: "🔄" });
    try {
      const q = query(collection(db, "users"), orderBy("lastSeen", "desc"));
      const snapshot = await getDocs(q);
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("jarvis_admin_branding");
    if (saved) {
      setBranding({ ...defaultBranding, ...JSON.parse(saved) });
    }

    // Real-time Users from Firestore
    const q = query(collection(db, "users"), orderBy("lastSeen", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setUsers(fetchedUsers);
    });

    // Real-time Activity (if you have an activity collection, for now keeping local or empty)
    const qAct = query(collection(db, "activity"), orderBy("timestamp", "desc"), limit(20));
    const unsubAct = onSnapshot(qAct, (snapshot) => {
      const fetchedAct = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setActivityLog(fetchedAct);
    });

    return () => {
      unsubscribe();
      unsubAct();
    };
  }, []);

  const updateBranding = (newBranding: Partial<AppBranding>) => {
    const updated = { ...branding, ...newBranding };
    setBranding(updated);
    localStorage.setItem("jarvis_admin_branding", JSON.stringify(updated));
  };

  const addActivity = (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
    const newEntry: ActivityEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    
    setActivityLog(prev => {
      const newLog = [newEntry, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem("jarvis_admin_activity", JSON.stringify(newLog));
      return newLog;
    });
  };

  return (
    <AdminContext.Provider value={{ branding, updateBranding, activityLog, addActivity, users, refreshData }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, getDocs, doc, addDoc, serverTimestamp } from "firebase/firestore";

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
  addActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => Promise<void>;
  // Users
  users: AdminUser[];
  refreshData: () => void;
  toggleAdmin: (userId: string, currentStatus: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  setUserPassword: (email: string, newPassword: string) => Promise<void>;
  toggleAdultAccess: (userId: string, currentStatus: boolean) => Promise<void>;
  isMaintenanceMode: boolean;
  toggleMaintenanceMode: () => Promise<void>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  device: string;
  os: string;
  browser: string;
  status: "online" | "offline";
  isAdmin: boolean;
  isVerified: boolean;
  countryCode: string;
  photoURL?: string;
  location?: string;
  isp?: string;
  ip?: string;
  password?: string;
  hasAdultAccess?: boolean;
  sessions?: Record<string, any>;
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
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

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
    try {
      const saved = localStorage.getItem("jarvis_admin_branding");
      if (saved && saved !== "undefined") {
        setBranding({ ...defaultBranding, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error("Admin hydration failed:", e);
      localStorage.removeItem("jarvis_admin_branding");
    }

    let unsubscribe: (() => void) | null = null;
    let unsubAct: (() => void) | null = null;
    let unsubMaintenance: (() => void) | null = null;

    // Real-time Users from Firestore
    try {
      const q = query(collection(db, "users"), orderBy("lastSeen", "desc"));
      unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const fetchedUsers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as any[];
          setUsers(fetchedUsers);
        },
        (err) => console.error("Users listener error:", err)
      );
    } catch (e) { console.error("Failed to subscribe to users:", e); }

    // Real-time Activity — may fail if collection doesn't exist yet
    try {
      const qAct = query(collection(db, "activity"), orderBy("timestamp", "desc"), limit(20));
      unsubAct = onSnapshot(qAct, 
        (snapshot) => {
          const fetchedAct = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as any[];
          setActivityLog(fetchedAct);
        },
        (err) => console.error("Activity listener error (check Firestore rules):", err)
      );
    } catch (e) { console.error("Failed to subscribe to activity:", e); }

    // Real-time Maintenance Mode
    try {
      const maintenanceRef = doc(db, "settings", "maintenance");
      unsubMaintenance = onSnapshot(maintenanceRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            setIsMaintenanceMode(docSnap.data().active || false);
          }
        },
        (err) => console.error("Maintenance listener error:", err)
      );
    } catch (e) { console.error("Failed to subscribe to maintenance:", e); }

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubAct) unsubAct();
      if (unsubMaintenance) unsubMaintenance();
    };
  }, []);

  const updateBranding = (newBranding: Partial<AppBranding>) => {
    const updated = { ...branding, ...newBranding };
    setBranding(updated);
    localStorage.setItem("jarvis_admin_branding", JSON.stringify(updated));
  };

  const addActivity = async (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
    try {
      // Write to Firestore so it persists and shows in admin panel
      await addDoc(collection(db, "activity"), {
        ...entry,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to write activity to Firestore:", err);
      // Fallback: add to local state only
      const newEntry: ActivityEntry = {
        ...entry,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
      };
      setActivityLog(prev => [newEntry, ...prev].slice(0, 50));
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const userDocId = userId.replace(/\./g, "_");
      const { doc: fsDoc, updateDoc } = await import("firebase/firestore");
      await updateDoc(fsDoc(db, "users", userDocId), {
        isAdmin: !currentStatus
      });
      toast.success(`Permissions updated for ${userId}`, { icon: "🔐" });
    } catch (err) {
      console.error("Toggle Admin Error:", err);
      toast.error("Failed to update permissions");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const userDocId = userId.replace(/\./g, "_");
      const { doc: fsDoc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(fsDoc(db, "users", userDocId));
      toast.success(`User ${userId} deleted from system`, { icon: "🗑️" });
      refreshData();
    } catch (err) {
      console.error("Delete User Error:", err);
      toast.error("Failed to delete user");
    }
  };

  const resetUserPassword = async (email: string) => {
    try {
      const { auth } = await import("@/lib/firebase");
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset email sent to ${email}`, { 
        icon: "📧",
        description: "User should check their inbox/spam folder."
      });
    } catch (err) {
      console.error("Reset Password Error:", err);
      toast.error("Failed to send reset email");
    }
  };

  const setUserPassword = async (email: string, newPass: string) => {
    try {
      const userDocId = email.replace(/\./g, "_");
      const { doc: fsDoc, updateDoc } = await import("firebase/firestore");
      await updateDoc(fsDoc(db, "users", userDocId), {
        password: newPass
      });
      toast.success(`System Key updated for ${email}`, { 
        icon: "🔑",
        description: `New key: ${newPass}. Share this with the user.`
      });
    } catch (err) {
      console.error("Set Password Error:", err);
      toast.error("Failed to set manual password");
    }
  };

  const toggleAdultAccess = async (userId: string, currentStatus: boolean) => {
    try {
      const userDocId = userId.replace(/\./g, "_");
      const { doc: fsDoc, updateDoc } = await import("firebase/firestore");
      await updateDoc(fsDoc(db, "users", userDocId), {
        hasAdultAccess: !currentStatus
      });
      toast.success(`Adult access ${!currentStatus ? "enabled" : "disabled"} for ${userId}`, { 
        icon: !currentStatus ? "🔥" : "🔒" 
      });
    } catch (err) {
      console.error("Toggle Adult Access Error:", err);
      toast.error("Failed to update access");
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const { doc: fsDoc, setDoc } = await import("firebase/firestore");
      const maintenanceRef = fsDoc(db, "settings", "maintenance");
      await setDoc(maintenanceRef, { active: !isMaintenanceMode }, { merge: true });
      toast.success(`Maintenance mode ${!isMaintenanceMode ? "activated" : "deactivated"}`, { 
        icon: !isMaintenanceMode ? "🚧" : "✅"
      });
    } catch (err) {
      console.error("Maintenance Toggle Error:", err);
      toast.error("Failed to toggle maintenance mode");
    }
  };

  return (
    <AdminContext.Provider value={{ 
      branding, 
      updateBranding, 
      activityLog, 
      addActivity, 
      users, 
      refreshData, 
      toggleAdmin, 
      deleteUser, 
      resetUserPassword,
      setUserPassword,
      toggleAdultAccess,
      isMaintenanceMode,
      toggleMaintenanceMode
    }}>
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

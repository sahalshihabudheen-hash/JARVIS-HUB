import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, getDocs, doc } from "firebase/firestore";

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
  toggleAdmin: (userId: string, currentStatus: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
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

    // Real-time Maintenance Mode
    const maintenanceRef = doc(db, "settings", "maintenance");
    const unsubMaintenance = onSnapshot(maintenanceRef, (doc) => {
      if (doc.exists()) {
        setIsMaintenanceMode(doc.data().active || false);
      }
    });

    return () => {
      unsubscribe();
      unsubAct();
      unsubMaintenance();
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

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const userDocId = userId.replace(/\./g, "_");
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", userDocId), {
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
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "users", userDocId));
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

  const toggleMaintenanceMode = async () => {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      const maintenanceRef = doc(db, "settings", "maintenance");
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

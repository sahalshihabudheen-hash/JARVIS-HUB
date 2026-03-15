import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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
  countryCode: string; // e.g., "IN"
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

  const refreshData = () => {
    // In a real app, this would re-fetch from Firestore/API
    toast.success("Syncing with JARVIS database...", { icon: "🔄" });
  };

  useEffect(() => {
    const saved = localStorage.getItem("jarvis_admin_branding");
    if (saved) {
      setBranding({ ...defaultBranding, ...JSON.parse(saved) });
    }

    const savedActivity = localStorage.getItem("jarvis_admin_activity");
    if (savedActivity) {
      setActivityLog(JSON.parse(savedActivity));
    } else {
      // populate with fake data initially based on user's screenshot
      setActivityLog([
        {
          id: "1",
          userEmail: "admin@gmail.com",
          mediaTitle: "Aadu 3",
          mediaType: "movie",
          mediaPoster: "https://image.tmdb.org/t/p/w200/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        },
        {
          id: "2",
          userEmail: "abhijithvazhuvelil@gmail.com",
          mediaTitle: "Inception",
          mediaType: "movie",
          mediaPoster: "https://image.tmdb.org/t/p/w200/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
          timestamp: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
        },
        {
          id: "3",
          userEmail: "sahal.shihabudheen@gmail.com",
          mediaTitle: "Stranger Things (S4, Ep1)",
          mediaType: "tv",
          mediaPoster: "https://image.tmdb.org/t/p/w200/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
          timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
        },
        {
          id: "4",
          userEmail: "abhijithvazhuvelil@gmail.com",
          mediaTitle: "The Dark Knight",
          mediaType: "movie",
          mediaPoster: "https://image.tmdb.org/t/p/w200/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ]);
    }

    // Mock Users
    setUsers([
      {
        id: "u1",
        name: "JARVIS",
        email: "admin@gmail.com",
        location: "Malappuram, Kerala, India",
        device: "Desktop PC",
        os: "Windows 10/11 Desktop",
        browser: "Firefox",
        isp: "BSNL Internet",
        status: "online",
        isAdmin: true,
        isVerified: true,
        countryCode: "IN"
      },
      {
        id: "u2",
        name: "SAHAL_PRO",
        email: "sahalshihabudheen@gmail.com",
        location: "Malappuram, Kerala, India",
        device: "Desktop PC",
        os: "Windows 10/11 Desktop",
        browser: "Firefox",
        isp: "BSNL Internet",
        status: "online",
        isAdmin: true,
        isVerified: true,
        countryCode: "IN"
      },
      {
        id: "u3",
        name: "",
        email: "cj873785@gmail.com",
        location: "Kottayam, Kerala, India",
        device: "Phone",
        os: "Android",
        browser: "Chrome",
        isp: "Kerala Vision Broad Band",
        status: "online",
        isAdmin: false,
        isVerified: true,
        countryCode: "IN"
      },
      {
        id: "u4",
        name: "",
        email: "abhijithvazhuvelil@gmail.com",
        location: "Malappuram, Kerala, India",
        device: "Phone",
        os: "Android",
        browser: "Chrome",
        isp: "Kerala Fibre Optic Networ...",
        status: "online",
        isAdmin: false,
        isVerified: true,
        countryCode: "IN"
      }
    ]);
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

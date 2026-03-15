import React, { createContext, useContext, useState, useEffect } from "react";

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
  // Mocked activity
  activityLog: ActivityEntry[];
  addActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => void;
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
          userEmail: "abhijithvazhuvelil@gmail.com",
          mediaTitle: "Inception",
          mediaType: "movie",
          mediaPoster: "https://image.tmdb.org/t/p/w200/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        },
        {
          id: "2",
          userEmail: "sahal.shihabudheen@gmail.com",
          mediaTitle: "Stranger Things (S4, Ep1)",
          mediaType: "tv",
          mediaPoster: "https://image.tmdb.org/t/p/w200/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: "3",
          userEmail: "abhijithvazhuvelil@gmail.com",
          mediaTitle: "The Dark Knight",
          mediaType: "movie",
          mediaPoster: "https://image.tmdb.org/t/p/w200/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ]);
    }
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
    <AdminContext.Provider value={{ branding, updateBranding, activityLog, addActivity }}>
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

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

interface User {
  email: string;
  name?: string;
  isAdmin?: boolean;
  photoURL?: string;
  countryCode?: string;
  location?: string;
  isp?: string;
  ip?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, photoURL?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; photoURL?: string }) => Promise<void>;
  resetPassword: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("jarvis_user");
      if (savedUser && savedUser !== "undefined") {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      }
    } catch (e) {
      console.error("Auth hydration failed:", e);
      localStorage.removeItem("jarvis_user");
    }
  }, []);

  // Real-time user data listener
  useEffect(() => {
    if (!user?.email) return;

    let unsubscribe: () => void;
    const userDocId = user.email.replace(/\./g, "_");
    
    // Dynamic import to keep everything tidy
    import("firebase/firestore").then(({ onSnapshot, doc: fsDoc }) => {
      let isInitial = true;
      unsubscribe = onSnapshot(fsDoc(db, "users", userDocId), (snapshot: any) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          
          // Detect if user became admin
          if (!isInitial && !user.isAdmin && data.isAdmin) {
             import("sonner").then(({ toast }) => {
               toast("JARVIS: PROMOTED TO ADMIN", {
                 description: "Access your new Admin Dashboard via the profile icon in the top right corner.",
                 icon: "🤖",
                 duration: 8000
               });
             });
          }
          
          const currentDataStr = JSON.stringify(data);
          const userDataStr = JSON.stringify(user);

          if (currentDataStr !== userDataStr) {
            setUser(prev => ({ ...prev, ...data }));
            localStorage.setItem("jarvis_user", JSON.stringify({ ...user, ...data }));
          }
        }
        isInitial = false;
      });
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, [user?.email]);

  // Status Heartbeat & Cleanup
  useEffect(() => {
    if (!user?.email) return;
    const userDocId = user.email.replace(/\./g, "_");

    const updateStatus = async (status: "online" | "offline") => {
      try {
        const userRef = doc(db, "users", userDocId);
        await setDoc(userRef, { 
          status, 
          lastSeen: serverTimestamp() 
        }, { merge: true });
      } catch (e) {
        console.error("Status update failed:", e);
      }
    };

    // Heartbeat every 2 minutes
    const interval = setInterval(() => {
      updateStatus("online");
    }, 120000);

    // Set offline on tab close
    const handleUnload = () => {
      // Use navigator.sendBeacon or a synchronous fetch if possible, 
      // but Firestore setDoc is async. 
      // Best effort here without Realtime DB.
      updateStatus("offline");
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [user?.email]);

  const login = async (email: string, name?: string, photoURL?: string) => {
    let location = "Unknown";
    let isp = "Unknown";
    let countryCode = "🌐";
    let ip = "0.0.0.0";

    const fetchWithTimeout = async (url: string, timeout = 5000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    try {
      // Primary: ipapi.co
      const geoResponse = await fetchWithTimeout("https://ipapi.co/json/");
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        location = geoData.city && geoData.region ? `${geoData.city}, ${geoData.region}, ${geoData.country_name}` : "Unknown Location";
        isp = geoData.org || "Unknown ISP";
        countryCode = geoData.country_code || "🌐";
        ip = geoData.ip || "0.0.0.0";
      } else {
        throw new Error("ipapi failed");
      }
    } catch (e) {
      console.error("Geo sensing failed (ipapi):", e);
      // Fallback 1: ipwho.is (HTTPS supported)
      try {
        const fallbackRes = await fetchWithTimeout("https://ipwho.is/");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success) {
            location = `${fallbackData.city}, ${fallbackData.region}, ${fallbackData.country}`;
            isp = fallbackData.connection?.isp || "Unknown ISP";
            countryCode = fallbackData.country_code || "🌐";
            ip = fallbackData.ip || "0.0.0.0";
          } else {
            throw new Error("ipwho.is failed");
          }
        }
      } catch (err) {
        console.error("Geo sensing fallback failed (ipwho.is):", err);
        // Fallback 2: ipify (IP only)
        try {
          const res = await fetchWithTimeout("https://api.ipify.org?format=json");
          const data = await res.json();
          ip = data.ip;
        } catch (ipErr) {
          console.error("IP detection final fallback failed:", ipErr);
        }
      }
    }

    // Correct BSNL ISP name if detected as NIB
    if (isp?.toUpperCase().includes("NATIONAL INTERNET BACKBONE")) {
      isp = "BSNL Internet";
    }

    const isAdmin = email.toLowerCase() === "admin@gmail.com";
    const userData: User = { 
      email: email.toLowerCase(), 
      name: name || email.split("@")[0],
      isAdmin,
      photoURL,
      location,
      isp,
      ip,
      countryCode
    };

    // Save/Update in Firestore
    try {
      const userRef = doc(db, "users", email.toLowerCase().replace(/\./g, "_"));
      
      // Check existing admin status to prevent overwriting manual admins
      let finalUserData = { ...userData };
      const existingDoc = await getDoc(userRef);
      if (existingDoc.exists() && existingDoc.data().isAdmin) {
        finalUserData.isAdmin = true;
      }

      // Get device info
      const ua = navigator.userAgent;
      let device = "Desktop PC";
      if (/Mobi|Android/i.test(ua)) device = "Phone";
      if (/Tablet|iPad/i.test(ua)) device = "Tablet";

      await setDoc(userRef, {
        ...finalUserData,
        lastSeen: serverTimestamp(),
        status: "online",
        device,
        browser: navigator.userAgent.split(" ").slice(-1)[0],
      }, { merge: true });

      setUser(finalUserData);
      localStorage.setItem("jarvis_user", JSON.stringify(finalUserData));
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      setUser(userData);
      localStorage.setItem("jarvis_user", JSON.stringify(userData));
    }
  };

  const updateProfile = async (data: { name?: string; photoURL?: string }) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.email.replace(/\./g, "_"));
      await setDoc(userRef, data, { merge: true });
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("jarvis_user", JSON.stringify(updatedUser));
    } catch (error) {
       console.error("Update profile failed:", error);
       throw error;
    }
  };

  const resetPassword = async () => {
    if (!user) return;
    const { auth } = await import("@/lib/firebase");
    const { sendPasswordResetEmail } = await import("firebase/auth");
    await sendPasswordResetEmail(auth, user.email);
  };

   const logout = async () => {
    if (user) {
      const userDocId = user.email.replace(/\./g, "_");
      try {
        const userRef = doc(db, "users", userDocId);
        await setDoc(userRef, { status: "offline", lastSeen: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.error("Logout status update failed:", e);
      }
    }
    setUser(null);
    localStorage.removeItem("jarvis_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

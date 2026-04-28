import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

interface User {
  uid: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  photoURL?: string;
  countryCode?: string;
  location?: string;
  isp?: string;
  ip?: string;
  password?: string;
  hasAdultAccess?: boolean;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, isSocial?: boolean, name?: string, photoURL?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; photoURL?: string }) => Promise<void>;
  resetPassword: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem("jarvis_user") : null;
      if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error("Auth hydration failed:", e);
    }
    return null;
  });

  // Hydration is now handled synchronously in useState initializer.

  // Real-time user data listener
  useEffect(() => {
    if (!user?.email) return;

    let unsubscribe: () => void;
    const userDocId = user.email.replace(/\./g, "_");
    
    // Dynamic import to keep everything tidy
    import("firebase/firestore").then(({ onSnapshot, doc: fsDoc }) => {
      let isInitial = true;
      unsubscribe = onSnapshot(fsDoc(db, "users", userDocId), async (snapshot: any) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          
          // Get verification status from Firebase Auth directly
          const { auth } = await import("@/lib/firebase");
          let emailVerified = auth.currentUser?.emailVerified || false;
          
          // If not verified, try to reload the user to see if they verified
          if (!emailVerified && auth.currentUser) {
            await auth.currentUser.reload();
            emailVerified = auth.currentUser.emailVerified;
          }
          
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
          
          // Only update state, avoid triggering recursive effects if data is same
          setUser(prev => {
            if (!prev) return data;
            const updated = { ...prev, ...data };
            if (JSON.stringify(prev) !== JSON.stringify(updated)) {
               localStorage.setItem("jarvis_user", JSON.stringify(updated));
               return updated;
            }
            return prev;
          });
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
        const deviceId = localStorage.getItem("jarvis_device_id");
        const userRef = doc(db, "users", userDocId);
        
        const updates: any = { 
          status, 
          lastSeen: serverTimestamp() 
        };

        if (deviceId) {
          updates[`sessions.${deviceId}.lastSeen`] = new Date().toISOString();
        }

        await setDoc(userRef, updates, { merge: true });
      } catch (e) {
        console.error("Status update failed:", e);
      }
    };

    // Heartbeat every 2 minutes
    const interval = setInterval(() => {
      updateStatus("online");
    }, 120000);

    // Set offline best-effort on tab close
    const handleUnload = () => {
      const deviceId = localStorage.getItem("jarvis_device_id");
      const userRef = doc(db, "users", userDocId);
      const updates: any = { status: "offline" };
      if (deviceId) {
        updates[`sessions.${deviceId}.status`] = "offline";
      }
      setDoc(userRef, updates, { merge: true });
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [user?.email]);

  const login = async (email: string, password?: string, isSocial = false, name?: string, photoURL?: string) => {
    let location = "Unknown";
    let isp = "Unknown";
    let countryCode = "🌐";
    let ip = "0.0.0.0";

    // FETCH USER FIRST TO VERIFY PASSWORD (unless Social login)
    const userDocId = email.toLowerCase().replace(/\./g, "_");
    const userRef = doc(db, "users", userDocId);
    let existingDoc: any = null;
    
    try {
      existingDoc = await getDoc(userRef);
      if (!isSocial && existingDoc.exists()) {
        const storedPass = existingDoc.data().password;
        if (storedPass && password !== storedPass) {
          // Special exception for hardcoded admin password
          const isHardAdmin = email.toLowerCase() === "admin@gmail.com" && (password === "jarvisadmin" || password === "admin123");
          if (!isHardAdmin) {
            throw new Error("Invalid access key: credentials do not match stored protocol.");
          }
        }
      }
    } catch (err: any) {
      if (err.message.includes("Invalid access key")) throw err;
      console.error("User pre-fetch error:", err);
    }


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
      uid: userDocId,
      email: email.toLowerCase(), 
      name: name || email.split("@")[0],
      isAdmin,
      photoURL,
      location,
      isp,
      ip,
      countryCode,
      emailVerified: false
    };

    // Save/Update in Firestore
    try {
      // Check existing admin status to prevent overwriting manual admins
      let finalUserData = { ...userData };
      if (existingDoc?.exists() && existingDoc.data().isAdmin) {
        finalUserData.isAdmin = true;
      }
      if (existingDoc?.exists() && existingDoc.data().password) {
        finalUserData.password = existingDoc.data().password;
      }

      // Get device info
      const ua = navigator.userAgent;
      let device = "Desktop PC";
      
      // Detailed Detection
      if (/smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast.tv|webos|vizio|sharp-tv|tizen|philips-tv|sonydtv/i.test(ua)) {
        device = "Smart TV";
      } else if (/Xbox|PlayStation|Nintendo/i.test(ua)) {
        device = "Console";
      } else if (/Tablet|iPad|PlayBook|Kindle/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        device = "Tablet";
      } else if (/Mobi|Android|iPhone|BlackBerry/i.test(ua)) {
        device = "Phone";
      }

      // Session Tracking (Multi-device support)
      let deviceId = localStorage.getItem("jarvis_device_id");
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("jarvis_device_id", deviceId);
      }

      const os = navigator.userAgent.includes("Windows") ? "Windows" : 
                 navigator.userAgent.includes("Mac") ? "MacOS" :
                 navigator.userAgent.includes("Android") ? "Android" :
                 navigator.userAgent.includes("iPhone") ? "iOS" :
                 navigator.userAgent.includes("Linux") ? "Linux" : "Unknown OS";
                 
      const browser = ua.includes("Chrome") ? "Chrome" :
                      ua.includes("Firefox") ? "Firefox" :
                      ua.includes("Safari") ? "Safari" :
                      ua.includes("Edge") ? "Edge" : "Other Browser";

      const sessionData = {
        device,
        os,
        browser,
        lastSeen: new Date().toISOString(),
      };

      await setDoc(userRef, {
        ...finalUserData,
        lastSeen: serverTimestamp(),
        status: "online",
        device, // Keep legacy for simplicity in logic
        browser,
        os,
        [`sessions.${deviceId}`]: sessionData // Modern multi-session tracking
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
      const deviceId = localStorage.getItem("jarvis_device_id");
      try {
        const userRef = doc(db, "users", userDocId);
        const updates: any = { status: "offline", lastSeen: serverTimestamp() };
        if (deviceId) {
          updates[`sessions.${deviceId}.status`] = "offline";
        }
        await setDoc(userRef, updates, { merge: true });
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

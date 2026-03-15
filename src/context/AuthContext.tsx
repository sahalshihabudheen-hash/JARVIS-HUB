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
    const savedUser = localStorage.getItem("jarvis_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, name?: string, photoURL?: string) => {
    let location = "Unknown";
    let isp = "Unknown";
    let countryCode = "🌐";
    let ip = "0.0.0.0";

    try {
      // Primary: ipapi.co
      const geoResponse = await fetch("https://ipapi.co/json/");
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
        const fallbackRes = await fetch("https://ipwho.is/");
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
          const res = await fetch("https://api.ipify.org?format=json");
          const data = await res.json();
          ip = data.ip;
        } catch (ipErr) {
          console.error("IP detection final fallback failed:", ipErr);
        }
      }
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
      
      // Get device info
      const ua = navigator.userAgent;
      let device = "Desktop PC";
      if (/Mobi|Android/i.test(ua)) device = "Phone";
      if (/Tablet|iPad/i.test(ua)) device = "Tablet";

      await setDoc(userRef, {
        ...userData,
        lastSeen: serverTimestamp(),
        status: "online",
        device,
        browser: navigator.userAgent.split(" ").slice(-1)[0],
      }, { merge: true });

      setUser(userData);
      localStorage.setItem("jarvis_user", JSON.stringify(userData));
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

  const logout = () => {
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

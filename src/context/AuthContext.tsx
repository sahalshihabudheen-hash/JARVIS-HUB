import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

interface User {
  email: string;
  name?: string;
  isAdmin?: boolean;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, photoURL?: string) => Promise<void>;
  logout: () => void;
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
    const isAdmin = email.toLowerCase() === "admin@gmail.com";
    const userData: User = { 
      email: email.toLowerCase(), 
      name: name || email.split("@")[0],
      isAdmin,
      photoURL
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
        location: "Detected by IP", // Placeholder for actual IP geolocation
      }, { merge: true });

      setUser(userData);
      localStorage.setItem("jarvis_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      setUser(userData);
      localStorage.setItem("jarvis_user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jarvis_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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

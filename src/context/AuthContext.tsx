import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
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

  const login = (email: string) => {
    const newUser = { email, name: email.split("@")[0] };
    setUser(newUser);
    localStorage.setItem("jarvis_user", JSON.stringify(newUser));
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

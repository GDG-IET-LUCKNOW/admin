import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const isTokenValid = (token: string | null) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false; // Token is expired
    }
    return true;
  } catch (e) {
    return true; // Not a JWT or unknown format, fallback to api interceptor mechanism
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("admin_token");
    if (storedToken && !isTokenValid(storedToken)) {
      localStorage.removeItem("admin_token");
      return null;
    }
    return storedToken ? storedToken : null;
  });

  useEffect(() => {
    if (token && !isTokenValid(token)) {
      localStorage.removeItem("admin_token");
      setToken(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

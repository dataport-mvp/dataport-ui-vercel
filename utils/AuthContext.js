// utils/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(null);
  const [user, setUser]     = useState(null);   // { email, name, phone, role }
  const [ready, setReady]   = useState(false);

  // Rehydrate from localStorage on first load
  useEffect(() => {
    try {
      const t = localStorage.getItem("dg_token");
      const u = localStorage.getItem("dg_user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch (_) {}
    setReady(true);
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem("dg_token", token);
    localStorage.setItem("dg_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("dg_token");
    localStorage.removeItem("dg_user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

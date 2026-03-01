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

  const clearFormCache = () => {
    // Remove all form draft keys — prevents data leaking between users
    ["dg_personal", "dg_education", "dg_employments", "dg_ack",
     "dg_uan", "dg_uan_acks", "dg_employee_id"].forEach(k => localStorage.removeItem(k));
  };

  const login = (token, userData) => {
    // Before logging in new user, check if a different user was logged in
    // If so, clear their cached form data
    try {
      const prevUser = JSON.parse(localStorage.getItem("dg_user") || "null");
      if (prevUser && prevUser.email !== userData.email) {
        clearFormCache();
      }
    } catch (_) {}
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
    clearFormCache();
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

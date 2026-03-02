// utils/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  // Rehydrate from localStorage on first load
  useEffect(() => {
    try {
      const t = localStorage.getItem("dg_token");
      const u = localStorage.getItem("dg_user");
      // Guard: reject the string "undefined" that was stored by the broken API
      if (t && t !== "undefined" && t !== "null") setToken(t);
      if (u && u !== "undefined" && u !== "null") setUser(JSON.parse(u));
    } catch (_) {}
    setReady(true);
  }, []);

  const clearFormCache = () => {
    ["dg_personal", "dg_education", "dg_employments", "dg_ack",
     "dg_uan", "dg_uan_acks", "dg_employee_id"].forEach(k => localStorage.removeItem(k));
  };

  const login = (newToken, userData) => {
    // Guard: if API returned undefined/null token, do not store it
    // This prevents the "Bearer undefined" bug where bad token persists across sessions
    if (!newToken || newToken === "undefined" || newToken === "null") {
      console.error("[Auth] login() called with invalid token — ignoring");
      return;
    }

    try {
      const prevUser = JSON.parse(localStorage.getItem("dg_user") || "null");
      if (prevUser && prevUser.email !== userData.email) {
        clearFormCache();
      }
    } catch (_) {}

    setToken(newToken);
    setUser(userData);
    localStorage.setItem("dg_token", newToken);
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

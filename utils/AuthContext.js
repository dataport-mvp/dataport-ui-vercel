// utils/AuthContext.js
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AuthContext = createContext(null);
const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const INACTIVITY_LIMIT = 60 * 60 * 1000; // 60 minutes

export function AuthProvider({ children }) {
  const accessTokenRef   = useRef(null);
  const [user, setUser]  = useState(null);
  const [ready, setReady] = useState(false);
  const inactivityTimer  = useRef(null);
  const isRefreshing     = useRef(false);
  const refreshQueue     = useRef([]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logoutRef.current?.("inactivity");
    }, INACTIVITY_LIMIT);
  }, []);

  const logoutRef = useRef(null);

  useEffect(() => {
    const events  = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handler = () => { if (accessTokenRef.current) resetInactivityTimer(); };
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, [resetInactivityTimer]);

  const doRefresh = useCallback(async () => {
    const rt = localStorage.getItem("dg_refresh_token");
    if (!rt) return null;
    // AbortController timeout — prevents Lambda cold start from hanging indefinitely
    // and force-clearing localStorage (which caused the relogin-on-reload bug)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refresh_token: rt }),
        signal:  controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data     = await res.json();
      const newToken = data.access_token;
      if (!newToken) return null;
      accessTokenRef.current = newToken;
      return newToken;
    } catch {
      clearTimeout(timer);
      return null;
    }
  }, []);

  // Rehydrate on page load
  useEffect(() => {
    const init = async () => {
      try {
        const rt = localStorage.getItem("dg_refresh_token");
        const u  = localStorage.getItem("dg_user");
        if (rt && rt !== "undefined" && rt !== "null" && u && u !== "undefined" && u !== "null") {
          const newToken = await doRefresh();
          if (newToken) {
            // Refresh succeeded — full session restore
            setUser(JSON.parse(u));
            resetInactivityTimer();
          } else {
            // Refresh failed — Lambda cold start or network error
            // Restore user from cache so role guards work correctly
            // The next real API call will 401 and trigger proper re-auth if token is expired
            try {
              const cached = JSON.parse(u);
              if (cached?.email && cached?.role) {
                setUser(cached);
                resetInactivityTimer();
              } else {
                localStorage.removeItem("dg_refresh_token");
                localStorage.removeItem("dg_user");
              }
            } catch (_) {
              localStorage.removeItem("dg_refresh_token");
              localStorage.removeItem("dg_user");
            }
          }
        }
      } catch (_) {}
      setReady(true);
    };
    init();
  }, [doRefresh, resetInactivityTimer]);

  const apiFetch = useCallback(async (url, options = {}) => {
    const makeRequest = (token) => fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    let res = await makeRequest(accessTokenRef.current);

    if (res.status === 401) {
      if (isRefreshing.current) {
        return new Promise((resolve, reject) => {
          refreshQueue.current.push({ resolve, reject });
        }).then(newToken => makeRequest(newToken));
      }

      isRefreshing.current = true;
      const newToken       = await doRefresh();
      isRefreshing.current = false;

      if (newToken) {
        refreshQueue.current.forEach(({ resolve }) => resolve(newToken));
        refreshQueue.current = [];
        res = await makeRequest(newToken);
      } else {
        refreshQueue.current.forEach(({ reject }) => reject(new Error("Session expired")));
        refreshQueue.current = [];
        logoutRef.current?.("expired");
        return res;
      }
    }

    return res;
  }, [doRefresh]);

  const login = useCallback((accessToken, refreshToken, userData) => {
    if (!accessToken || accessToken === "undefined") return;
    if (!refreshToken || refreshToken === "undefined") return;

    accessTokenRef.current = accessToken;
    setUser(userData);
    localStorage.setItem("dg_refresh_token", refreshToken);
    localStorage.setItem("dg_user", JSON.stringify(userData));
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const logoutFull = useCallback(async (reason = "explicit") => {
    // Read role from state OR localStorage — state may be null if refresh failed on load
    const storedUser = localStorage.getItem("dg_user");
    const role = user?.role || (storedUser ? JSON.parse(storedUser)?.role : null);
    const rt   = localStorage.getItem("dg_refresh_token");
    if (rt) {
      fetch(`${API}/auth/logout`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refresh_token: rt }),
      }).catch(() => {});
    }
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    accessTokenRef.current = null;
    setUser(null);
    localStorage.removeItem("dg_refresh_token");
    localStorage.removeItem("dg_user");

    const dest = role === "employer" ? "/employer/login" : "/employee/login";
    if (typeof window !== "undefined") window.location.href = dest;
  }, [user]);

  useEffect(() => { logoutRef.current = logoutFull; }, [logoutFull]);

  const getToken = useCallback(() => accessTokenRef.current, []);

  return (
    <AuthContext.Provider value={{ user, login, logout: logoutFull, apiFetch, getToken, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
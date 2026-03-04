// utils/AuthContext.js
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AuthContext = createContext(null);
const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const INACTIVITY_LIMIT = 60 * 60 * 1000; // 60 minutes

export function AuthProvider({ children }) {
  // access_token lives in memory ONLY — never touches localStorage
  const accessTokenRef = useRef(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const inactivityTimer = useRef(null);
  const isRefreshing = useRef(false);
  const refreshQueue = useRef([]); // pending requests waiting on refresh

  // ── Form cache helpers ────────────────────────────────────────────────────
  const clearFormCache = useCallback(() => {
    ["dg_personal", "dg_education", "dg_employments", "dg_ack",
     "dg_uan", "dg_uan_acks", "dg_employee_id"].forEach(k => localStorage.removeItem(k));
  }, []);

  // ── Inactivity timer ──────────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logoutFull("inactivity");
    }, INACTIVITY_LIMIT);
  }, []); // logoutFull defined below via ref to avoid circular dep

  // Store logout fn in ref so resetInactivityTimer can call it without stale closure
  const logoutRef = useRef(null);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handler = () => {
      if (accessTokenRef.current) resetInactivityTimer();
    };
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, [resetInactivityTimer]);

  // ── Core: call /auth/refresh using stored refresh_token ───────────────────
  const doRefresh = useCallback(async () => {
    const rt = localStorage.getItem("dg_refresh_token");
    if (!rt) return null;
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newToken = data.access_token;
      if (!newToken) return null;
      accessTokenRef.current = newToken;
      return newToken;
    } catch {
      return null;
    }
  }, []);

  // ── Rehydrate on page load ────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const rt = localStorage.getItem("dg_refresh_token");
        const u = localStorage.getItem("dg_user");
        if (rt && rt !== "undefined" && rt !== "null") {
          const newToken = await doRefresh();
          if (newToken && u && u !== "undefined" && u !== "null") {
            setUser(JSON.parse(u));
            resetInactivityTimer();
          } else {
            // Refresh failed — clean slate
            localStorage.removeItem("dg_refresh_token");
            localStorage.removeItem("dg_user");
          }
        }
      } catch (_) {}
      setReady(true);
    };
    init();
  }, [doRefresh, resetInactivityTimer]);

  // ── apiFetch: authenticated fetch with auto-retry on 401 ─────────────────
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
      // If already refreshing, queue this request
      if (isRefreshing.current) {
        return new Promise((resolve, reject) => {
          refreshQueue.current.push({ resolve, reject });
        }).then(newToken => makeRequest(newToken));
      }

      isRefreshing.current = true;
      const newToken = await doRefresh();
      isRefreshing.current = false;

      if (newToken) {
        // Drain queue
        refreshQueue.current.forEach(({ resolve }) => resolve(newToken));
        refreshQueue.current = [];
        res = await makeRequest(newToken);
      } else {
        // Refresh failed — drain queue with rejection, log out
        refreshQueue.current.forEach(({ reject }) => reject(new Error("Session expired")));
        refreshQueue.current = [];
        logoutRef.current?.("expired");
        return res; // caller will handle the 401
      }
    }

    return res;
  }, [doRefresh]);

  // ── login: called after register or login API success ────────────────────
  const login = useCallback((accessToken, refreshToken, userData) => {
    if (!accessToken || accessToken === "undefined") {
      console.error("[Auth] Invalid access token — ignoring login()");
      return;
    }
    if (!refreshToken || refreshToken === "undefined") {
      console.error("[Auth] Invalid refresh token — ignoring login()");
      return;
    }
    try {
      const prevUser = JSON.parse(localStorage.getItem("dg_user") || "null");
      if (prevUser && prevUser.email !== userData.email) clearFormCache();
    } catch (_) {}

    accessTokenRef.current = accessToken;
    setUser(userData);
    localStorage.setItem("dg_refresh_token", refreshToken);
    localStorage.setItem("dg_user", JSON.stringify(userData));
    resetInactivityTimer();
  }, [clearFormCache, resetInactivityTimer]);

  // ── logout: clears auth session and calls API ─────────────────────────────
  const logoutFull = useCallback(async (reason = "explicit") => {
    const role = user?.role;
    const rt = localStorage.getItem("dg_refresh_token");
    if (rt) {
      // Best effort — don't await, don't block UI
      fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: rt }),
      }).catch(() => {});
    }
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    accessTokenRef.current = null;
    setUser(null);
    localStorage.removeItem("dg_refresh_token");
    localStorage.removeItem("dg_user");

    // Keep in-progress draft cache across logout/re-login for the same user.
    // Cache is still cleared when a different user logs in (see login()).
    // For forced expiry, we also keep cache so users can continue after re-auth.

    // Redirect to appropriate login
    const dest = role === "employer" ? "/employer/login" : "/employee/login";
    if (typeof window !== "undefined") window.location.href = dest;
  }, [user]);

  // Keep ref in sync so inactivity timer can call it
  useEffect(() => { logoutRef.current = logoutFull; }, [logoutFull]);

  // Expose getToken for pages that need it directly
  const getToken = useCallback(() => accessTokenRef.current, []);

  return (
    <AuthContext.Provider value={{ user, login, logout: logoutFull, apiFetch, getToken, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

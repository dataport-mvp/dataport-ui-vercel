// utils/AuthContext.js
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AuthContext = createContext(null);
const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const INACTIVITY_LIMIT = 60 * 60 * 1000; // 60 minutes

export function AuthProvider({ children }) {
  const accessTokenRef   = useRef(null);
  const [user, setUser]  = useState(undefined);
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

  // doRefresh now returns a precise result instead of a bare token|null:
  //   { ok: true, token }               — refresh succeeded
  //   { ok: false, invalid: true }      — backend explicitly said this refresh token is dead
  //   { ok: false, invalid: false }     — couldn't confirm either way (network/timeout/5xx),
  //                                        already retried a few times — NOT proof of an
  //                                        invalid session, so callers must not force-logout
  //                                        on this outcome, only on invalid:true.
  const doRefresh = useCallback(async (attempt = 1) => {
    const rt = localStorage.getItem("dg_refresh_token");
    if (!rt) return { ok: false, invalid: true };

    const controller = new AbortController();
    // 15s instead of the old 10s — Lambda cold starts can legitimately take longer than 10s,
    // and a timeout here must never be mistaken for "this token is invalid".
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refresh_token: rt }),
        signal:  controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 401) {
        // Backend explicitly rejected this refresh token — genuinely dead, not a fluke.
        return { ok: false, invalid: true };
      }

      if (!res.ok) {
        // Some other server-side hiccup (500/502/503/etc.) — says nothing about whether
        // the token itself is valid. Retry a few times before giving up.
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          return doRefresh(attempt + 1);
        }
        return { ok: false, invalid: false };
      }

      const data     = await res.json();
      const newToken = data.access_token;
      if (!newToken) return { ok: false, invalid: false };

      accessTokenRef.current = newToken;
      return { ok: true, token: newToken };
    } catch (err) {
      clearTimeout(timer);
      // Network error, timeout, or aborted request — not proof the refresh token is invalid,
      // just that we couldn't reach the server this time. Retry before giving up.
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return doRefresh(attempt + 1);
      }
      return { ok: false, invalid: false };
    }
  }, []);

  // Rehydrate on page load
  useEffect(() => {
    const init = async () => {
      try {
        // Clean up old wrong-key tokens left by old BGV login code
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        const rt = localStorage.getItem("dg_refresh_token");
        const u  = localStorage.getItem("dg_user");
        if (rt && rt !== "undefined" && rt !== "null" && u && u !== "undefined" && u !== "null") {
          const result = await doRefresh();
          if (result.ok) {
            setUser(JSON.parse(u));
            resetInactivityTimer();
          } else if (result.invalid) {
            // Genuinely dead refresh token — clear storage, user must log in fresh.
            localStorage.removeItem("dg_refresh_token");
            localStorage.removeItem("dg_user");
          } else {
            // Could not confirm either way (server unreachable after retries). Don't wipe
            // the stored refresh token — it may still be valid. Just show the login screen
            // for now; a normal reload once connectivity returns will pick it back up
            // without forcing a fresh password login.
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
      const result          = await doRefresh();
      isRefreshing.current = false;

      if (result.ok) {
        refreshQueue.current.forEach(({ resolve }) => resolve(result.token));
        refreshQueue.current = [];
        res = await makeRequest(result.token);
      } else if (result.invalid) {
        // Genuinely dead session — this is the only case that should force a logout.
        refreshQueue.current.forEach(({ reject }) => reject(new Error("Session expired")));
        refreshQueue.current = [];
        logoutRef.current?.("expired");
        return res;
      } else {
        // Temporary failure (network/timeout/5xx) even after retries inside doRefresh.
        // Do NOT log the user out or navigate away — that would silently discard whatever
        // they're in the middle of filling. Just let this one request fail; the page's own
        // error handling shows a normal "couldn't save, try again" message, and the next
        // action (e.g. clicking Save again) will attempt a fresh refresh.
        refreshQueue.current.forEach(({ reject }) => reject(new Error("Network error")));
        refreshQueue.current = [];
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

    const dest = role === "employer" ? "/employer/login" : role === "bgv" ? "/bgv/login" : "/employee/login";
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

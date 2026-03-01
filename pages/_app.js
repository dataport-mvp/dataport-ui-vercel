import { useRouter } from "next/router";
import { AuthProvider } from "../utils/AuthContext";
import "../styles/globals.css";

// Pages where the top "Home" nav should NOT appear
const NO_NAV_ROUTES = [
  "/employee/personal",
  "/employee/education",
  "/employee/previous",
  "/employee/uan",
  "/employee/login",
  "/employer/login",
  "/employer/dashboard",
  "/consent",
];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const showNav = !NO_NAV_ROUTES.some(r => router.pathname.startsWith(r));

  return (
    <AuthProvider>
      {showNav && (
        <nav style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "0.75rem 2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}>
          <a href="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
            Datagate
          </a>
        </nav>
      )}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

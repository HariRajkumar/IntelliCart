import {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AuthContext = createContext();

const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

export const AuthProvider = ({
  children,
}) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return decodeToken(savedToken);
  });

  const login = (jwtToken) => {
    localStorage.setItem(
      "token",
      jwtToken
    );

    setToken(jwtToken);
    setUser(decodeToken(jwtToken));
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  }, []);

  // ── Global token-expiry handler ───────────────────────────────────────────
  // Listens for the custom DOM event fired by the axios response interceptor
  // whenever the backend returns 401 (token expired / invalid).
  useEffect(() => {
    const handleTokenExpired = () => {
      logout();

      toast.error("Session expired — please sign in again.", {
        id: "session-expired",           // prevent duplicate toasts
        duration: 4000,
        style: {
          background: "#1e1e2e",
          color: "#f8f8f2",
          border: "1px solid #f43f5e",
          borderRadius: "12px",
          fontWeight: "600",
          fontSize: "14px",
        },
        iconTheme: {
          primary: "#f43f5e",
          secondary: "#fff",
        },
      });

      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("auth:token-expired", handleTokenExpired);
    };
  }, [logout, navigate]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
import {
  createContext,
  useState,
} from "react";

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

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

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
import { Navigate } from "react-router-dom";
import { useContext } from "react";

import AuthContext from "../context/AuthContext";

const NonAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default NonAdminRoute;

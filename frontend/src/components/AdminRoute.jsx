import { Navigate } from "react-router-dom";
import { useContext } from "react";

import AuthContext from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;

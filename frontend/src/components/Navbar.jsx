import { Link } from "react-router-dom";
import { useContext } from "react";

import AuthContext from "../context/AuthContext";
import Button from "./ui/Button";

const Navbar = () => {
  const {
    isAuthenticated,
    logout,
  } = useContext(AuthContext);

  return (
    <nav className="bg-surface border-b border-border text-text p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/" className="text-lg font-bold text-primary hover:text-primary-hover transition">
          IntelliCart
        </Link>

        <Link to="/products" className="hover:text-primary transition">
          Products
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to="/cart" className="hover:text-primary transition">
              Cart
            </Link>

            <Link to="/orders" className="hover:text-primary transition">
              Orders
            </Link>

            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-primary transition">
              Login
            </Link>

            <Link to="/register" className="hover:text-primary transition">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
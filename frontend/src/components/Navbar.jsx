import { Link } from "react-router-dom";
import { useContext } from "react";

import AuthContext from "../context/AuthContext";

const Navbar = () => {
  const {
    isAuthenticated,
    logout,
  } = useContext(AuthContext);

  return (
    <nav className="bg-black text-white p-4 flex gap-4">
      <Link to="/">Home</Link>

      <Link to="/products">
        Products
      </Link>

      {isAuthenticated ? (
        <>
          <Link to="/cart">Cart</Link>

          <Link to="/orders">
            Orders
          </Link>

          <button onClick={logout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";

import AuthContext from "../context/AuthContext";

const Navbar = () => {
  const {
    isAuthenticated,
    logout,
    user,
  } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border/60 text-text px-6 py-4 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition duration-300"
          >
            <svg 
              className="w-7 h-7 text-primary animate-float" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h.01M15 13h.01M12 17h.01" />
            </svg>
            <span>IntelliCart</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/products" 
              className={`font-semibold text-sm transition-colors duration-200 hover:text-primary ${
                isActive("/products") ? "text-primary" : "text-muted"
              }`}
            >
              Products
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/products" 
            className={`md:hidden font-semibold text-sm transition-colors duration-200 hover:text-primary ${
              isActive("/products") ? "text-primary" : "text-muted"
            }`}
          >
            Products
          </Link>

          {isAuthenticated ? (
            <>
              <Link 
                to="/cart" 
                className={`relative font-semibold text-sm transition-colors duration-200 hover:text-primary flex items-center gap-1 ${
                  isActive("/cart") ? "text-primary" : "text-muted"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Cart</span>
              </Link>

              <Link 
                to="/orders" 
                className={`font-semibold text-sm transition-colors duration-200 hover:text-primary flex items-center gap-1 ${
                  isActive("/orders") ? "text-primary" : "text-muted"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Orders</span>
              </Link>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface hover:bg-border/30 border border-border hover:shadow-sm transition-all duration-300 focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shadow-sm select-none uppercase ring-2 ring-primary/10">
                    {(user?.full_name || user?.email?.split('@')[0] || 'U').charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-text max-w-[120px] truncate select-none hidden sm:inline-block pr-0.5">
                    {user?.full_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-surface/95 border border-border shadow-xl backdrop-blur-md py-2 z-50 animate-fade-in-up origin-top-right">
                    <div className="px-4 py-2.5 border-b border-border/60">
                      <p className="text-[10px] font-bold text-muted tracking-wider uppercase">Signed in as</p>
                      <p className="text-xs font-bold text-text truncate mt-0.5">{user?.full_name || 'User'}</p>
                      <p className="text-[11px] text-muted truncate">{user?.email}</p>
                    </div>

                    <div className="px-1.5 py-1">
                      <Link
                        to="/cart"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-text hover:bg-border/30 rounded-xl transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>My Cart</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-text hover:bg-border/30 rounded-xl transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>My Orders</span>
                      </Link>
                    </div>

                    <div className="border-t border-border/60 px-1.5 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-error hover:bg-error/10 rounded-xl transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`font-semibold text-sm transition-colors duration-200 hover:text-primary ${
                  isActive("/login") ? "text-primary" : "text-muted"
                }`}
              >
                Login
              </Link>

              <Link 
                to="/register" 
                className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-hover shadow-md hover:shadow-lg transition-all duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
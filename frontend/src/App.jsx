import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
const RegisterOTP = Register;
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Checkout from "./pages/Checkout";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import NonAdminRoute from "./components/NonAdminRoute";

function App() {
  return (
    <main className="min-h-screen bg-background text-text">
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <NonAdminRoute>
              <Home />
            </NonAdminRoute>
          }
        />

        <Route
          path="/login"
          element={
            <NonAdminRoute>
              <Login />
            </NonAdminRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <NonAdminRoute>
              <ForgotPassword />
            </NonAdminRoute>
          }
        />

        <Route
          path="/register"
          element={
            <NonAdminRoute>
              <Register />
            </NonAdminRoute>
          }
        />

        <Route
          path="/register-otp"
          element={
            <NonAdminRoute>
              <RegisterOTP />
            </NonAdminRoute>
          }
        />

        <Route
          path="/products"
          element={
            <NonAdminRoute>
              <Products />
            </NonAdminRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <NonAdminRoute>
              <ProductDetail />
            </NonAdminRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

      </Routes>
    </main>
  );
}

export default App;
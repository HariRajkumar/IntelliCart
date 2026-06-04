import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
        
        <Route
          path="/products"
          element={<Products />}
        />
      </Routes>
    </>
  );
}

export default App;
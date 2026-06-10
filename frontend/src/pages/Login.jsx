import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import AuthContext from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { loginUser } from "../services/authService";

import { getErrorMessage } from "../utils/errorHandler";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await loginUser(email, password);

      login(data.access_token);

      toast.success("Login successful");

      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-surface p-8 rounded-3xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-text">Login</h1>

        <Input
          type="email"
          placeholder="Email"
          className="mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          className="mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default Login;

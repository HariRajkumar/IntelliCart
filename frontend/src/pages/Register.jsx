import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { registerUser } from "../services/authService";
import { getErrorMessage } from "../utils/errorHandler";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await registerUser(formData);

      toast.success("Registration successful");

      setFormData({
        full_name: "",
        email: "",
        password: "",
      });

      navigate("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-surface p-8 rounded-3xl shadow w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-text">Register</h1>

        <Input
          className="mb-4"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({
              ...formData,
              full_name: e.target.value,
            })
          }
        />

        <Input
          className="mb-4"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />

        <Input
          className="mb-4"
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating Account..." : "Register"}
        </Button>
      </form>
    </div>
  );
};

export default Register;

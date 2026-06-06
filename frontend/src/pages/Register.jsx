import { useState } from "react";
import toast from "react-hot-toast";
import { registerUser } from "../services/authService";
import { getErrorMessage } from "../utils/errorHandler";

const Register = () => {
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
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Register</h1>

        <input
          className="w-full border p-3 mb-3"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({
              ...formData,
              full_name: e.target.value,
            })
          }
        />

        <input
          className="w-full border p-3 mb-3"
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

        <input
          className="w-full border p-3 mb-3"
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

        <button
          disabled={loading}
          className="
          w-full
          bg-black
          text-white
          p-3
          rounded
          disabled:opacity-50
          disabled:cursor-not-allowed
          "
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;

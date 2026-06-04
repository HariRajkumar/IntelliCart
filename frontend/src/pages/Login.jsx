import {
  useContext,
  useState,
} from "react";

import AuthContext from "../context/AuthContext";

import {
  loginUser,
} from "../services/authService";

const Login = () => {
  const { login } =
    useContext(AuthContext);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(
        email,
        password
      );

      login(data.access_token);

      alert("Login successful");
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
    "
    >
      <form
        onSubmit={handleSubmit}
        className="
        bg-white
        p-8
        rounded-lg
        shadow-md
        w-full
        max-w-md
      "
      >
        <h1
          className="
          text-2xl
          font-bold
          mb-6
        "
        >
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="
          w-full
          border
          p-3
          mb-4
          rounded
        "
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="
          w-full
          border
          p-3
          mb-4
          rounded
        "
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <button
          className="
          w-full
          bg-black
          text-white
          p-3
          rounded
        "
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

const Login: React.FC = () => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${backendUrl}/users/login`, {
        email,
        password,
      });

      console.log("Login successful:", response.data);
      login(response.data.token);
      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || "Login failed");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleLogin();
  };

  const isButtonDisabled = loading || !email || !password;

  return (
    <div className="min-h-screen flex items-center justify-center p-2 lg:p-8 md:p-8 bg-gradient-to-br from-gray-900 to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 shadow-2xl rounded-3xl p-8 w-full max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center"
      >
        <div className="w-full md:w-1/2 mb-8 md:mb-0 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-100">Welcome to</h1>
            <h2 className="text-3xl font-semibold text-[#FFC107]">
              Inventory Mate
            </h2>
          </div>
          <img
            src="inventorymate_logo_circular_bg.png"
            alt="Inventory Mate Logo"
            className="w-48 h-48 object-contain"
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-700 p-8 rounded-2xl shadow-lg w-full max-w-md"
          >
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-100">
              User Login
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-200 mb-1 pl-1 font-bold"
                >
                  Email ID
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-600 bg-gray-800 text-gray-100 focus:outline-none focus:border-[#FFC107] transition duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-200 mb-1 pl-1 font-bold"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-600 bg-gray-800 text-gray-100 focus:outline-none focus:border-[#FFC107] transition duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm text-center">{error}</div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className={`w-full bg-[#FFC107] text-gray-900 text-lg py-2 rounded-xl hover:bg-[#FFD54F] transition duration-300 mt-6 ${
                  isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isButtonDisabled}
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>
            <div className="text-center mt-6">
              <p className="text-gray-300">
                Don't have an account?{" "}
                <RouterLink
                  to="/signup"
                  className="text-[#FFC107] hover:underline font-medium"
                >
                  Sign up here
                </RouterLink>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

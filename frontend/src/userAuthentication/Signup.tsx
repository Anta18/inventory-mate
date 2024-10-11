// Signup.tsx

import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

const Signup: React.FC = () => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  // Destructure the login function from AuthContext
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard"); // Redirect to dashboard if token exists
    }
  }, [navigate]);

  const handleSignup = async () => {
    // Basic client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(""); // Reset error before new signup attempt
    try {
      const response = await axios.post(`${backendUrl}/users`, {
        name,
        email,
        password,
      });

      console.log("Signup successful:", response.data);

      // Use AuthContext's login function
      login(response.data.token);

      navigate("/dashboard"); // Navigate directly to dashboard
    } catch (error) {
      // Type narrowing for error
      if (axios.isAxiosError(error)) {
        // Access Axios error properties
        if (error.response) {
          // Server responded with a status other than 2xx
          setError(error.response.data.message || "Signup failed");
        } else if (error.request) {
          // Request was made but no response received
          setError("No response from server. Please try again later.");
        } else {
          // Something happened in setting up the request
          setError(error.message);
        }
      } else if (error instanceof Error) {
        // Non-Axios error
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSignup();
  };

  const isButtonDisabled =
    loading || !name || !email || !password || !confirmPassword;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-2 lg:p-8 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center"
      >
        <div className="w-full md:w-1/2 mb-8 md:mb-0 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Welcome to</h1>
            <h2 className="text-3xl font-semibold text-[#EBB251]">
              Warehouse Assist Services
            </h2>
          </div>
          <img
            src="logo_bhavya.png"
            alt="Warehouse Assist Services Logo"
            className="w-48 h-48 object-contain"
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-50 p-8 rounded-2xl shadow-lg w-full max-w-md"
          >
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Create an Account
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-black mb-1 pl-1 font-bold"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#EBB251] transition duration-200"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-black mb-1 pl-1 font-bold"
                >
                  Email ID
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#EBB251] transition duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-black mb-1 pl-1 font-bold"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#EBB251] transition duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-black mb-1 pl-1 font-bold"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#EBB251] transition duration-200"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className={`w-full bg-[#EBB251] text-white text-lg py-2 rounded-xl hover:bg-[#D49A1F] transition duration-300 mt-6 ${
                  isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isButtonDisabled}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </motion.button>
            </form>
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <RouterLink
                  to="/login"
                  className="text-[#EBB251] hover:underline font-medium"
                >
                  Login here
                </RouterLink>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

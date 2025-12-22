import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/slices/userSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Valid email is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err || "Failed to log in");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
      >
        <h2 className="text-xl sm:text-3xl font-bold text-center text-white mb-8 flex items-center justify-center gap-2">
          <span>🎥 Welcome to Youtube</span>
        </h2>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-6 text-center font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            error={errors.email}
            icon={<FaEnvelope />}
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
              error={errors.password}
              icon={<FaLock />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[2.5rem] text-white/80 hover:text-white transition-colors duration-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </button>
          </div>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Logging In...
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
        <div className="mt-6 text-center text-sm text-white/80">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-purple-400 font-semibold hover:underline"
          >
            Sign up here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;

const Input = ({ label, type = "text", error, icon, ...props }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-white/80 mb-2">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80">
        {icon}
      </span>
      <input
        type={type}
        {...props}
        className={`w-full p-3 pl-10 rounded-lg bg-white/10 border ${
          error ? "border-red-400" : "border-white/20"
        } text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-white/50 transition-all duration-200`}
        placeholder={props.placeholder}
      />
    </div>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

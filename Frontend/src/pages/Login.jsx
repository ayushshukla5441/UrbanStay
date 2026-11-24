import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Login = () => {
  const { axios, loginUser, setOwner } = useContext(AppContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isOwner: false, // <--- Owner Checkbox State added
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend Login Request (sending role or isOwner flag if backend expects it)
      const { data } = await axios.post("/api/user/login", {
        email: formData.email,
        password: formData.password,
        role: formData.isOwner ? "owner" : "user", // Pass role based on checkbox
      });

      if (data.success) {
        if (formData.isOwner && data.user?.role !== "owner") {
          toast.error("This account is registered as a customer. Please sign in with a hotel owner account.");
          return;
        }

        toast.success(data.message || "Logged in successfully!");

        // Context update (User state)
        if (loginUser) {
          loginUser(data.user);
        }

        // Role-based Navigation
        if (data.user?.role === "owner") {
          if (setOwner) setOwner(data.user);
          navigate("/owner"); // Hotel Owner -> Owner Dashboard
        } else {
          navigate("/"); // Normal User -> Home Page
        }
      } else {
        toast.error(data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome Back to <span className="text-violet-600">UrbanStay</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Please enter your details to sign in
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="access-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Checkboxes: Remember Me & Login as Owner */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium">
              <input
                type="checkbox"
                name="isOwner"
                checked={formData.isOwner}
                onChange={handleChange}
                className="w-4 h-4 text-violet-600 rounded border-gray-300 cursor-pointer focus:ring-violet-500"
              />
              <span>Login as Owner</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-violet-600 rounded border-gray-300 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:bg-violet-400"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-violet-600 hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
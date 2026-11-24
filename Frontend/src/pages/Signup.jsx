import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ShieldCheck } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Signup = () => {
  const { axios } = useContext(AppContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "user",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
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

    // 1. Password Match Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // 2. Terms Checkbox Validation
    if (!formData.agreeTerms) {
      toast.warn("Please agree to the Terms & Conditions!");
      return;
    }

    setLoading(true);

    try {
      // Backend ko 'fullName' ki jagah 'name' keys required hain
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      const { data } = await axios.post("/api/user/signup", payload);

      if (data.success) {
        toast.success(data.message || "Account created successfully!");
        navigate("/login");
      } else {
        toast.error(data.message || "Signup failed!");
      }
    } catch (error) {
      console.error("Signup Request Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong while connecting to server!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Create an Account on <span className="text-violet-600">UrbanStay</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Join us to book your favorite rooms & hotels easily
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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

          {/* Role Select Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Select Your Role
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition bg-white text-gray-700 cursor-pointer appearance-none"
              >
                <option value="user">User (Customer)</option>
                <option value="owner">Hotel Owner</option>
              </select>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center gap-2 text-xs text-gray-600 pt-1">
            <input
              type="checkbox"
              name="agreeTerms"
              required
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="w-4 h-4 text-violet-600 rounded border-gray-300 cursor-pointer"
            />
            <span>
              I agree to the{" "}
              <a href="#" className="text-violet-600 hover:underline font-medium">
                Terms & Conditions
              </a>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg shadow-md transition flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer disabled:bg-violet-400"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Creating Account..." : "Sign Up"}</span>
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-violet-600 hover:underline">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
import { useState, useContext } from "react";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // AppContext se user aur logoutUser extract kar rahe hain
  const { user, logoutUser } = useContext(AppContext);

  const links = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/hotels" },
    { name: "Bookings", path: "/bookings" },
    { name: "About", path: "/about" },
  ];

  // Role check: Adjust 'user.role === "owner"' or 'user.isOwner' as per your backend schema
  const isOwner = user && (user.role === "owner" || user.isOwner);

  return (
    <div>
      {/* Top Offer Bar */}
      <div className="text-center py-2 text-xs font-semibold text-blue-950 bg-blue-100">
        Summer stay sale — save more on selected hotels
      </div>

      {/* Navbar */}
      <nav className="h-[72px] sticky top-0 z-40 flex items-center justify-between px-6 md:px-16 lg:px-24 bg-white border-b border-slate-200 shadow-sm relative">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={assets.logo}
            alt="UrbanStay Logo"
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold text-slate-900">
            UrbanStay
          </h1>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-slate-700 pb-1 border-b-2 transition-all duration-300 ${
                  isActive
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent hover:border-blue-300"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {/* Conditional Role-Based Link (e.g., Owner/Dashboard) */}
          {isOwner && (
            <Link
              to="/owner"
              className="bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Owner Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Right Side: Login or Profile Avatar */}
        <div className="hidden md:flex items-center">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-slate-50 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="w-7 h-7 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
                <span className="text-sm font-medium">
                  {user.fullName || "User"}
                </span>
                <ChevronDown size={16} />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 text-gray-800">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900">{user.fullName || "User"}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email || user.identifier}</p>
                  </div>
                  
                  <Link
                    to="/bookings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-violet-50 hover:text-violet-600"
                  >
                    My Bookings
                  </Link>

                  {/* Role-based link inside dropdown if preferred */}
                  {isOwner && (
                    <Link
                      to="/owner"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-violet-600 font-semibold hover:bg-violet-50"
                    >
                      Owner Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logoutUser();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100 mt-1"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="border border-blue-700 text-blue-700 px-7 py-2 rounded-lg hover:bg-blue-700 hover:text-white transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-800 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu */}
        {open && (
          <div className="absolute top-[70px] left-0 w-full bg-white shadow-lg p-6 md:hidden z-50 border-t">
            <div className="flex flex-col gap-5">

              {/* User Greeting on Mobile if logged in */}
              {user && (
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-9 h-9 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-base">
                    {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.fullName || "User"}</p>
                    <p className="text-xs text-gray-500">{user.email || user.identifier}</p>
                  </div>
                </div>
              )}

              {links.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `w-fit pb-1 border-b-2 transition ${
                      isActive
                        ? "border-violet-600 text-violet-600"
                        : "border-transparent text-gray-700"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              {/* Conditional Owner Button for Mobile */}
              {isOwner && (
                <Link
                  to="/owner"
                  onClick={() => setOpen(false)}
                  className="bg-violet-600 text-white px-5 py-2 rounded-full w-fit hover:bg-violet-700 transition"
                >
                  Owner Dashboard
                </Link>
              )}

              {/* Login or Logout Button for Mobile */}
              {user ? (
                <button
                  onClick={() => {
                    logoutUser();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 border border-red-500 text-red-500 px-5 py-2 rounded-full w-fit hover:bg-red-50 transition cursor-pointer text-sm font-medium"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="border border-violet-600 text-violet-600 px-5 py-2 rounded-full w-fit hover:bg-violet-600 hover:text-white transition"
                >
                  Login
                </Link>
              )}

            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
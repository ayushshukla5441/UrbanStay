import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets.js";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10 border-t border-gray-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          
          {/* Brand Info with Logo */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-2">
              <img
                src={assets?.logo}
                alt="UrbanStay Logo"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-xl font-bold text-white">
                UrbanStay
              </h1>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Book rooms & hotels at affordable prices easily.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/hotels" className="hover:text-white transition">Hotels</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About UrbanStay</Link></li>
              <li><Link to="/bookings" className="hover:text-white transition">My Bookings</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-2">Company</h3>
            <ul className="space-y-1 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-2">Contact</h3>
            <div className="space-y-1 text-gray-400">
              <p>Email: support@urbanstay.com</p>
              <p>Phone: +91 90261 30511</p>
              <p>Location: Lucknow, UP</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} UrbanStay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
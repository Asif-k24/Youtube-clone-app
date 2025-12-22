import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/slices/userSlice";
import { FaSearch, FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Youtube from "../assets/Youtube Logo.png";

function Header({ toggleSidebar, isSidebarOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        setIsUserMenuOpen(false);
        navigate("/login");
      })
      .catch((err) => {
        console.error("Logout error:", err);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <header className="bg-slate-900 text-gray-200 fixed top-0 z-50 w-full shadow-md">
      <div className="mx-auto max-w-7xl   py-3 sm:py-4 flex items-center justify-between">
        {/* Menu Icon and Logo */}
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle Button (hidden on mobile) */}
          <button
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="hidden sm:flex p-2 rounded-full hover:bg-slate-600 hover:text-amber-400 transition-all duration-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          >
            <FaBars className="text-xl sm:text-2xl" />
          </button>

          {/* Logo + Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            {/* Logo Image */}
            <img
              src={Youtube}
              alt="YouTube Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />

            {/* Title */}
            <span className="text-xl sm:text-2xl font-extrabold bg-clip-text text-white">
              YouTube
            </span>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 mx-4 max-w-xs hidden sm:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search videos..."
              aria-label="Search videos"
              className="w-full pl-10 pr-10 py-2 rounded-full bg-slate-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors duration-200"
              aria-label="Submit search"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* User Menu */}
        <div className="relative">
          {currentUser ? (
            <>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label={`User menu for ${currentUser.name}`}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-600 hover:text-amber-400 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all duration-200"
              >
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={`Profile picture of ${currentUser.name}`}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/default-profile.png")} // Fallback image
                  />
                ) : (
                  <FaUserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                )}
                <span className="hidden sm:inline text-sm">
                  {currentUser.name}
                </span>
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl py-2 z-50"
                  >
                    <Link
                      to="/user-profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 hover:text-amber-400"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      {currentUser.profileImage ? (
                        <img
                          src={currentUser.profileImage}
                          alt="Profile"
                          className="h-5 w-5 rounded-full object-cover"
                          onError={(e) =>
                            (e.target.src = "/default-profile.png")
                          }
                        />
                      ) : (
                        <FaUserCircle className="h-5 w-5 text-gray-400" />
                      )}
                      Profile
                    </Link>
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-600 hover:text-amber-400 w-full text-left"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-lg hover:bg-slate-600 hover:text-amber-400 transition-all duration-200"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FaUserEdit, FaSignOutAlt, FaTrashAlt, FaUpload } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchCurrentUser,
  logoutUser,
  deleteUser,
} from "../../store/slices/userSlice";
import { toast } from "react-toastify";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    currentUser,
    updateUserLoading: loading,
    error,
  } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, currentUser]);

  const formatJoinDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed: " + (err.message || "Unknown error"));
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await dispatch(deleteUser(currentUser._id)).unwrap();
        toast.success("Account deleted successfully!");
        navigate("/signup");
      } catch (err) {
        toast.error(
          "Delete account failed: " + (err.message || "Unknown error")
        );
      }
    }
  };

  if (loading || (!currentUser && !error)) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="h-8 w-8 border-4 border-t-purple-500 border-white/20 rounded-full"
        />
      </div>
    );
  }

  if (!currentUser && error) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/20 text-red-200 rounded-lg text-center font-medium backdrop-blur-lg border border-white/20"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-white/20 shadow-xl"
        >
          <img
            src={currentUser.profileImage}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-purple-500/50 shadow-md"
            onError={(e) => (e.target.src = "/default-profile.png")}
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {currentUser.name || "N/A"}
            </h1>
            <p className="text-white/80">@{currentUser.username || "N/A"}</p>
            <p className="text-white/80">
              Joined: {formatJoinDate(currentUser.createdAt)}
            </p>
          </div>
        </motion.div>

        {/* Account and Creator Sections */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
              Account
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Link
                to={`/update-user/${currentUser._id}`}
                className="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 border border-white/20"
              >
                <FaUserEdit className="text-lg" />
                <span>Edit Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className={`flex items-center gap-3 p-4 bg-white/10 rounded-lg transition-all duration-300 text-left border border-white/20 ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-purple-500/20 hover:text-purple-300"
                }`}
              >
                <FaSignOutAlt className="text-lg" />
                <span>{loading ? "Logging out..." : "Logout"}</span>
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className={`flex items-center gap-3 p-4 bg-white/10 rounded-lg transition-all duration-300 text-left border border-white/20 ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-500/20 hover:text-red-300"
                }`}
              >
                <FaTrashAlt className="text-lg" />
                <span>{loading ? "Deleting..." : "Delete Account"}</span>
              </button>
            </div>
          </motion.div>

          {/* Creator Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
              Creator
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/upload-video"
                className="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 border border-white/20"
              >
                <FaUpload className="text-lg" />
                <span>Upload Video</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../../store/slices/userSlice";
import { Link, useLocation } from "react-router-dom";
import { FaRedo, FaPlayCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";

const Library = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  // Fetch user data on mount or when navigating back from VideoPlayer
  useEffect(() => {
    dispatch(fetchCurrentUser()).catch(() => {
      toast.error("Failed to load library. Please try again.");
    });
  }, [dispatch, location.pathname]); // Re-fetch when pathname changes

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle retry on error
  const handleRetry = () => {
    dispatch(fetchCurrentUser());
  };

  // Loading skeleton for cards
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg"
        >
          <Skeleton
            height={160}
            width="100%"
            baseColor="#ffffff1a"
            highlightColor="#ffffff33"
          />
          <div className="p-4">
            <Skeleton
              height={20}
              width="80%"
              baseColor="#ffffff1a"
              highlightColor="#ffffff33"
              className="mb-2"
            />
            <Skeleton
              height={16}
              width="60%"
              baseColor="#ffffff1a"
              highlightColor="#ffffff33"
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Render video card
  const renderVideoCard = (item, type) => (
    <motion.li
      key={item._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <Link
        to={`/video/${item.videoId._id}`}
        className="block"
        aria-label={`View video: ${item.videoId.title || "Untitled Video"}`}
      >
        <div className="relative">
          <img
            src={item.videoId.thumbnailUrl || "/default-thumbnail.png"}
            alt={item.videoId.title || "Untitled Video"}
            className="w-full h-40 object-cover rounded-t-2xl"
            loading="lazy"
            onError={(e) => (e.target.src = "/default-thumbnail.png")}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
            <FaPlayCircle className="text-white text-4xl" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-white truncate">
            {item.videoId.title || "Untitled Video"}
          </h3>
          <p className="text-white/80 text-xs mt-1">
            {type === "liked" ? "Liked" : "Saved"}:{" "}
            {formatDate(type === "liked" ? item.likedAt : item.savedAt)}
          </p>
        </div>
      </Link>
    </motion.li>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Library Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold mb-8 flex items-center gap-2"
        >
          <span>🎥 Your  Library</span>
        </motion.h1>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 bg-red-500/20 text-red-200 rounded-lg flex items-center justify-between border border-white/20"
            >
              <span>{error}</span>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/30 rounded hover:bg-red-500/50 transition-colors duration-200"
                aria-label="Retry loading library"
              >
                <FaRedo />
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && !currentUser ? (
          renderSkeleton()
        ) : (
          <div className="space-y-12">
            {/* Liked Videos Section */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Liked Videos
              </h2>
              {currentUser?.likedVideos?.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentUser.likedVideos.map((item) =>
                    item.videoId && typeof item.videoId === "object" ? (
                      renderVideoCard(item, "liked")
                    ) : (
                      <li
                        key={item._id}
                        className="p-4 bg-white/10 rounded-lg text-white/80 border border-white/20"
                      >
                        Invalid video data (ID: {item.videoId})
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-white/80">No liked videos yet.</p>
              )}
            </div>

            {/* Saved Videos Section */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Saved Videos
              </h2>
              {currentUser?.savedVideos?.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentUser.savedVideos.map((item) =>
                    item.videoId && typeof item.videoId === "object" ? (
                      renderVideoCard(item, "saved")
                    ) : (
                      <li
                        key={item._id}
                        className="p-4 bg-white/10 rounded-lg text-white/80 border border-white/20"
                      >
                        Invalid video data (ID: {item.videoId})
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-white/80">No saved videos yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchAllVideos } from "../../store/slices/videoSlice";

const VideoSearchResults = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { videos, loading, error, totalPages } = useSelector(
    (state) => state.video
  );

  const [page, setPage] = useState(1);

  // Parse query parameter
  const query = new URLSearchParams(location.search);
  const searchTerm = query.get("q") || "";

  // Fetch search results
  useEffect(() => {
    if (searchTerm.trim()) {
      dispatch(fetchAllVideos({ search: searchTerm, page, limit: 6 }))
        .unwrap()
        .catch((err) => console.error("Fetch videos error:", err));
    }
  }, [dispatch, searchTerm, page]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 to-slate-800 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-10 tracking-tight"
        >
          Search Results for "{searchTerm}"
        </motion.h2>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                baseColor="#202020"
                highlightColor="#444"
                height={280}
                className="rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/50 border-l-4 border-red-600 text-red-200 p-4 rounded-lg shadow-sm mb-10"
          >
            <p className="font-medium">Error: {error}</p>
          </motion.div>
        )}

        {/* Search Results: Videos */}
        <div className="mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6">
            Videos
          </h3>
          <AnimatePresence>
            {videos?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Link
                    key={video._id}
                    to={`/video/${video._id}`}
                    className="block group"
                    aria-label={`View details for ${
                      video.title || "Untitled Video"
                    }`}
                  >
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      whileHover={{
                        y: -4,
                        transition: { duration: 0.2 },
                      }}
                      className="bg-[#181818] rounded-lg shadow-lg overflow-hidden border border-[#303030] hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300"
                    >
                      <div className="relative aspect-[16/9]">
                        <img
                          src={
                            video.thumbnailUrl ||
                            "https://via.placeholder.com/300x150?text=Video"
                          }
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
                          loading="lazy"
                          onError={(e) =>
                            (e.target.src = "/default-thumbnail.png")
                          }
                        />
                      </div>
                      <div className="p-4 sm:p-5 space-y-3">
                        <h4 className="text-base sm:text-lg font-semibold text-white truncate group-hover:text-red-500 transition-colors">
                          {video.title || "Untitled Video"}
                        </h4>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {video.description || "No description available."}
                        </p>
                        <div className="space-y-1 text-sm text-gray-400">
                          <p>
                            <span className="font-medium text-gray-300">
                              Category:
                            </span>{" "}
                            {video.category || "Uncategorized"}
                          </p>
                          <p>
                            <span className="font-medium text-gray-300">
                              Tags:
                            </span>{" "}
                            {video.tags?.join(", ") || "None"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <p>Views: {video.viewCount || 0}</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-center text-lg py-8"
              >
                No videos found.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {!loading && videos?.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="py-2 px-4 rounded-lg bg-[#282828] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-all duration-200"
            >
              Previous
            </motion.button>
            <span className="text-gray-300">
              Page {page} of {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="py-2 px-4 rounded-lg bg-[#282828] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-all duration-200"
            >
              Next
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSearchResults;

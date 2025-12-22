import React, { useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const VideoCardGrid = ({
  title,
  thunk,
  selector,
  linkPrefix = "/video",
  className = "",
}) => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(selector, shallowEqual);

  useEffect(() => {
    dispatch(thunk({ page: 1, limit: 6 }));
  }, [dispatch, thunk]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <section
      className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 ${className}`}
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl sm:text-3xl font-bold text-white mb-6 tracking-tight flex items-center gap-2"
      >
        <span>🎥 {title}</span>
      </motion.h2>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-500/20 border-l-4 border-red-500 text-red-200 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20"
            >
              <Skeleton
                height={180}
                baseColor="#ffffff1a"
                highlightColor="#ffffff33"
              />
              <Skeleton
                count={2}
                baseColor="#ffffff1a"
                highlightColor="#ffffff33"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {items?.length > 0 ? (
              items?.map((item) => (
                <Link
                  key={item._id}
                  to={`${linkPrefix}/${item._id}`}
                  className="block group"
                  aria-label={`View details for ${
                    item.title || "Untitled Video"
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
                    className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={item.thumbnailUrl || "/default-thumbnail.png"}
                        alt={item.title || "Untitled Video"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-2xl"
                        loading="lazy"
                        onError={(e) =>
                          (e.target.src = "/default-thumbnail.png")
                        }
                      />
                    </div>
                    <div className="p-3 sm:p-4 space-y-2">
                      <h3 className="text-base font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                        {item.title || "Untitled Video"}
                      </h3>
                      {item.category && (
                        <p className="text-sm text-white/80 font-medium line-clamp-1 capitalize">
                          <span className="text-white/90">Category:</span>{" "}
                          {item.category}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/80 text-center text-lg py-8 col-span-full"
              >
                No videos found.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};

export default VideoCardGrid;
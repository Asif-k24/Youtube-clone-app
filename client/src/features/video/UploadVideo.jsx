import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaVideo, FaImage, FaTimes, FaTag } from "react-icons/fa";
import { uploadVideo } from "../../store/slices/videoSlice";

const UploadVideo = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.video);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    tags: [],
  });
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!thumbnailImage)
      newErrors.thumbnailImage = "Thumbnail image is required";
    if (!videoFile) newErrors.videoFile = "Video file is required";
    if (formData.tags.length === 0)
      newErrors.tags = "At least one tag is required";
    // Validate tags format
    const tagRegex = /^[a-zA-Z0-9\s-_]+$/;
    formData.tags.forEach((tag, index) => {
      if (!tagRegex.test(tag)) {
        newErrors.tags =
          "Tags can only contain letters, numbers, spaces, hyphens, or underscores";
      }
      if (tag.length > 50) {
        newErrors.tags = "Each tag must be 50 characters or less";
      }
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTagInput = (e) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.endsWith(",") || e.key === "Enter") {
      e.preventDefault();
      const newTag = value.replace(",", "").trim();
      const tagRegex = /^[a-zA-Z0-9\s-_]+$/;
      if (newTag && !formData.tags.includes(newTag)) {
        if (!tagRegex.test(newTag)) {
          toast.error(
            "Tags can only contain letters, numbers, spaces, hyphens, or underscores"
          );
          return;
        }
        if (newTag.length > 50) {
          toast.error("Each tag must be 50 characters or less");
          return;
        }
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
        setTagInput("");
        setErrors((prev) => ({ ...prev, tags: "" }));
      }
    }
  };

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type
      )
    ) {
      toast.error("Please upload a valid image (JPEG, PNG, GIF, or WebP)");
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error("Thumbnail image must be less than 10MB");
      return;
    }
    setThumbnailImage(file);
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
    setErrors((prev) => ({ ...prev, thumbnailImage: "" }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && !["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
      toast.error("Please upload a valid video (MP4, WebM, or OGG)");
      return;
    }
    if (file && file.size > 100 * 1024 * 1024) {
      toast.error("Video file must be less than 100MB");
      return;
    }
    setVideoFile(file);
    setErrors((prev) => ({ ...prev, videoFile: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("tags", formData.tags.join(",")); // Send tags as comma-separated string
    formDataToSend.append("thumbnailImage", thumbnailImage);
    formDataToSend.append("videoFile", videoFile);

    try {
      const result = await dispatch(uploadVideo(formDataToSend)).unwrap();
      toast.success(result.message || "Video uploaded successfully!");
      setFormData({ title: "", category: "", description: "", tags: [] });
      setThumbnailImage(null);
      setVideoFile(null);
      setThumbnailPreview(null);
      setTagInput("");
      setErrors({});
    } catch (err) {
      toast.error(err?.message || "Failed to upload video");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 flex items-center justify-center gap-2">
          <FaVideo /> Upload Your Video
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
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Video Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter video title"
              error={errors.title}
              icon={<FaVideo />}
            />
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Entertainment, Education"
              error={errors.category}
              icon={<FaTag />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your video"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 h-32 resize-none"
              aria-label="Video description"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Tags
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80">
                <FaTag />
              </span>
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInput}
                onKeyDown={handleTagInput}
                placeholder="Add tags (press Enter or comma)"
                className={`w-full p-3 pl-10 rounded-lg bg-white/10 border ${
                  errors.tags ? "border-red-400" : "border-white/20"
                } text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
                aria-label="Video tags"
              />
            </div>
            {errors.tags && (
              <p className="text-red-400 text-xs mt-1">{errors.tags}</p>
            )}
            {formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-300 bg-purple-500/20 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-purple-300 hover:text-purple-400 focus:outline-none"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Thumbnail Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="thumbnailImage"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  aria-label="Upload thumbnail image"
                />
                <label
                  htmlFor="thumbnailImage"
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 cursor-pointer transition-all duration-200"
                >
                  <FaImage className="text-white/80" />
                  <span>
                    {thumbnailImage ? "Change Thumbnail" : "Upload Thumbnail"}
                  </span>
                </label>
              </div>
              {errors.thumbnailImage && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.thumbnailImage}
                </p>
              )}
              {thumbnailPreview && (
                <div className="mt-4">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-32 w-32 object-cover rounded-lg border border-white/20 shadow-md"
                    onError={(e) => (e.target.src = "/default-thumbnail.png")}
                  />
                </div>
              )}
              {thumbnailImage && (
                <p className="mt-1 text-sm text-white/80">
                  Selected: {thumbnailImage.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Video File
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="videoFile"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleVideoChange}
                  className="hidden"
                  aria-label="Upload video file"
                />
                <label
                  htmlFor="videoFile"
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 cursor-pointer transition-all duration-200"
                >
                  <FaVideo className="text-white/80" />
                  <span>{videoFile ? "Change Video" : "Upload Video"}</span>
                </label>
              </div>
              {errors.videoFile && (
                <p className="text-red-400 text-xs mt-1">{errors.videoFile}</p>
              )}
              {videoFile && (
                <p className="mt-1 text-sm text-white/80">
                  Selected: {videoFile.name}
                </p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-5 w-5 border-2 border-t-white border-white/20 rounded-full"
                />
                Uploading...
              </>
            ) : (
              "Upload Video"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadVideo;

const Input = ({ label, error, icon, ...props }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-white/80 mb-2">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80">
        {icon}
      </span>
      <input
        {...props}
        className={`w-full p-3 pl-10 rounded-lg bg-white/10 border ${
          error ? "border-red-400" : "border-white/20"
        } text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
        aria-label={label}
      />
    </div>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

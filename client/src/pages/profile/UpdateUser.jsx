import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, fetchCurrentUser } from "../../store/slices/userSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaImage, FaTimes } from "react-icons/fa";

function UpdateUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    currentUser,
    updateUserLoading: loading,
    error,
  } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    gender: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        password: "",
        gender: currentUser.gender || "",
      });
      setPreview(currentUser.profileImage || null);
    }
  }, [currentUser]);

  useEffect(() => {
    return () => {
      if (preview && preview !== currentUser?.profileImage) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, currentUser]);

  const isOwnAccount = (currentUser?._id || currentUser?.id) === id;
  const canEdit = isOwnAccount;

  if (!currentUser && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 border-4 border-t-purple-500 border-white/20 rounded-full"
        />
      </div>
    );
  }

  if (!canEdit) {
    navigate("/user-profile");
    return null;
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Valid email is required";
    if (formData.password && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.gender) newErrors.gender = "Gender is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
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
      toast.error("Image size must be less than 10MB");
      return;
    }
    setProfileImage(file);
    setPreview(
      file ? URL.createObjectURL(file) : currentUser?.profileImage || null
    );
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    const updateData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "" && value !== undefined) {
        updateData.append(key, value);
      }
    });
    if (profileImage) {
      updateData.append("profileImage", profileImage);
    }

    try {
      await dispatch(
        updateUser({
          userId: currentUser._id || currentUser.id,
          formData: updateData,
        })
      ).unwrap();
      toast.success("Profile updated successfully!");
      navigate("/user-profile");
    } catch (err) {
      toast.error(err?.message || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
      >
        <h2 className="text-xl sm:text-3xl font-bold text-center text-white mb-8 flex items-center justify-center gap-2">
          <span>🎥 Update Your Profile</span>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            error={errors.name}
            icon={<FaUser />}
          />
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="johndoe123"
            error={errors.username}
            icon={<FaUser />}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            error={errors.email}
            icon={<FaEnvelope />}
          />
          <Input
            label="Password (leave blank to keep current)"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••"
            error={errors.password}
            icon={<FaLock />}
          />
          <div className="relative">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg bg-white/10 border ${
                errors.gender ? "border-red-400" : "border-white/20"
              } text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-white/50 transition-all duration-200`}
            >
              <option value="" className="text-gray-900">
                Select Gender
              </option>
              <option value="male" className="text-gray-900">
                Male
              </option>
              <option value="female" className="text-gray-900">
                Female
              </option>
              <option value="other" className="text-gray-900">
                Other
              </option>
            </select>
            {errors.gender && (
              <p className="text-red-400 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Profile Picture
            </label>
            <div className="relative">
              <input
                type="file"
                name="profileImage"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
                id="profileImage"
              />
              <label
                htmlFor="profileImage"
                className="flex items-center gap-2 p-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 cursor-pointer transition-all duration-200"
              >
                <FaImage className="text-white/80" />
                <span>{profileImage ? "Change Image" : "Upload Image"}</span>
              </label>
            </div>
            {preview && (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-16 h-16 rounded-full object-cover border border-white/20"
                  onError={(e) => (e.target.src = "/default-profile.png")}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <FaTimes /> Remove
                </button>
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-5 w-5 border-2 border-t-white border-white/20 rounded-full"
                />
                Updating Profile...
              </span>
            ) : (
              "Update Profile"
            )}
          </motion.button>
        </form>
        <Link
          to="/user-profile"
          className="flex items-center justify-center gap-2 mt-6 text-white/80 hover:text-purple-400 transition-colors duration-200"
        >
          <span>Back to Profile</span>
          <span className="text-purple-400 font-medium hover:underline">
            Cancel
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

export default UpdateUser;

const Input = ({ label, type = "text", error, icon, ...props }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-white/80 mb-2">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80">
        {icon}
      </span>
      <input
        type={type}
        {...props}
        className={`w-full p-3 pl-10 rounded-lg bg-white/10 border ${
          error ? "border-red-400" : "border-white/20"
        } text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-white/50 transition-all duration-200`}
        placeholder={props.placeholder}
      />
    </div>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

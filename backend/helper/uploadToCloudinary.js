import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    // Check if Cloudinary is configured (not using demo credentials)
    const isDemoMode = !process.env.CLOUDINARY_CLOUD_NAME ||
                      !process.env.CLOUDINARY_API_KEY ||
                      !process.env.CLOUDINARY_API_SECRET ||
                      process.env.CLOUDINARY_CLOUD_NAME === 'demo' ||
                      process.env.CLOUDINARY_API_KEY === 'demo_key';

    if (isDemoMode) {
      console.warn('Cloudinary is in demo mode - skipping actual upload');
      // Return a mock response for demo mode
      return {
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/demo.jpg',
        public_id: 'demo_id',
        format: path.extname(filePath).replace('.', ''),
        resource_type: options.resource_type || 'image'
      };
    }

    const ext = path.extname(filePath).toLowerCase();

    if (!options.resource_type) {
      if ([".mp3", ".wav", ".aac", ".m4a", ".ogg", ".mp4", ".mov", ".avi"].includes(ext)) {
        options.resource_type = "video";
      } else {
        options.resource_type = "image";
      }
    }

    console.log('Uploading to Cloudinary:', {
      filePath,
      resource_type: options.resource_type,
      folder: options.folder
    });

    const result = await cloudinary.uploader.upload(filePath, options);
    console.log('Cloudinary upload successful:', result.secure_url);
    return result;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);
    // Don't crash the app - throw a more specific error
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  } finally {
    // Clean up temp file if it exists
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError.message);
      }
    }
  }
};

export default uploadToCloudinary;

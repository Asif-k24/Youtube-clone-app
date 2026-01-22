import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ silent: true });

const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo_secret',
};

// Only configure if we have values
if (config.cloud_name && config.api_key && config.api_secret) {
  try {
    cloudinary.config(config);
    console.log('Cloudinary configured successfully');
  } catch (error) {
    console.error('Cloudinary configuration error:', error.message);
  }
} else {
  console.warn('Cloudinary not configured - using demo mode or local storage');
}

export default cloudinary;

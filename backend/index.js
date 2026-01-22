import dotenv from "dotenv";
import connectDB from "./config/mongoDB.js";
import app from "./app.js";

dotenv.config({ silent: true, debug: false });

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB, retrying in 5 seconds...", error.message);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Start the server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}!`);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason.message);
});

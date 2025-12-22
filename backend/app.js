import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import Routes
import userRouter from "./routes/user.route.js";
import videosRouter from "./routes/video.route.js";

dotenv.config();
const app = express();
const BASE_URL = process.env.API

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", BASE_URL],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes path

app.use("/api/users", userRouter);
app.use("/api/videos", videosRouter);


export default app;

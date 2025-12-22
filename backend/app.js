import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import Routes
import userRouter from "./routes/user.route.js";
import videosRouter from "./routes/video.route.js";


const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.56.101:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes path

app.use("/api/users", userRouter);
app.use("/api/videos", videosRouter);


export default app;

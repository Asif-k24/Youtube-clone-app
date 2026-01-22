import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import Routes
import userRouter from "./routes/user.route.js";
import videosRouter from "./routes/video.route.js";

dotenv.config({ silent: true });
const app = express();

const allowedOrigins = [
  "http://youtube.local",
  "http://youtube.local:32301",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools like curl / postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "YouTube Clone Backend"
  });
});

// Routes path

app.use("/api/users", userRouter);
app.use("/api/videos", videosRouter);


export default app;

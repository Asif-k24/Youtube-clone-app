import express from "express";
import multer from "multer";
import storage from "../config/multerStorage.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";

import {
  uploadVideo,
  getAllVideo,
  getPopularVideos,
  getVideoById,
  toggleLikeVideo,
  toggleBookmarkVideo,
  updateVideoAsViewed,
  addCommentToVideo,
} from "../controllers/video.controller.js"

const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
});

router.post(
  "/",
  isLoggedIn,
  upload.fields([
    { name: "thumbnailImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "videoFile", maxCount: 1 },
  ]),
  uploadVideo
);

router.get("/", getAllVideo);
router.get("/popular-videos", getPopularVideos);
router.get("/:videoId", getVideoById);
router.put("/:videoId/like", isLoggedIn, toggleLikeVideo);
router.put("/:videoId/bookmark", isLoggedIn, toggleBookmarkVideo);
router.put("/:videoId/viewed", isLoggedIn, updateVideoAsViewed);
router.post("/:videoId/comment", isLoggedIn, addCommentToVideo);

export default router;

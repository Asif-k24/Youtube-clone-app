import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        match: /^[a-z0-9-_]+$/,
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    viewCount: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        userId: {
          type: String,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    duration: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);

export default Video;

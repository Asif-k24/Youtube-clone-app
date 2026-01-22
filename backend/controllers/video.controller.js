import User from "../models/user.model.js";
import Comment from "../models/comment.model.js"
import uploadToCloudinary from "../helper/uploadToCloudinary.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose"


export const uploadVideo = async (req, res) => {
  try {
    const { title, category, description, tags } = req.body;
    const authorId = req.user?.userId; // Comes from auth middleware
    const { thumbnailImage, videoFile } = req.files || {};

    // Ensure user is authenticated
    if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    // Validate required files
    if (!thumbnailImage || !videoFile) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail and video files are required",
      });
    }

    // Validate and process tags
    let processedTags = [];
    if (tags) {
      try {
        // Handle JSON string (e.g., ["tag1","tag2"])
        if (typeof tags === "string" && tags.startsWith("[")) {
          processedTags = JSON.parse(tags).map((tag) =>
            tag.trim().toLowerCase()
          );
        }
        // Handle comma-separated string (e.g., "tag1,tag2")
        else if (typeof tags === "string") {
          processedTags = tags
            .split(",")
            .map((tag) => tag.trim().toLowerCase());
        }
        // Handle array (e.g., ["tag1", "tag2"])
        else if (Array.isArray(tags)) {
          processedTags = tags.map((tag) => tag.trim().toLowerCase());
        }
        // Validate tags: allow alphanumeric, spaces, hyphens, underscores
        const tagRegex = /^[a-zA-Z0-9\s-_]+$/;
        processedTags = processedTags.filter(
          (tag) => tag && tagRegex.test(tag)
        );
        // Limit tag length (e.g., 50 characters per tag)
        processedTags = processedTags.filter((tag) => tag.length <= 50);
        // Ensure unique tags
        processedTags = [...new Set(processedTags)];
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid tags format",
        });
      }
    }

    // Upload files concurrently to Cloudinary
    const [thumbnailUpload, videoUpload] = await Promise.all([
      uploadToCloudinary(thumbnailImage[0].path, {
        folder: "video-thumbnails",
      }),
      uploadToCloudinary(videoFile[0].path, {
        folder: "video-files",
        resource_type: "video",
      }),
    ]);

    // Create Video document
    const newVideo = new Video({
      author: authorId,
      title,
      description,
      category,
      thumbnailUrl: thumbnailUpload.secure_url,
      videoUrl: videoUpload.secure_url,
      tags: processedTags,
      duration: videoUpload.duration,
    });

    await newVideo.save();

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video: newVideo,
    });
  } catch (error) {
    console.error("Upload video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload video",
      error: error.message,
    });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Find video and populate author and comments with their authors
    const video = await Video.findById(videoId)
      .populate("author", "name profileImage")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name profileImage",
        },
        options: { sort: { createdAt: -1 } }, // Sort comments by newest first
      });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video successfully fetched",
      video,
    });
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllVideo = async (req, res) => {
  try {
    let {
      firstQueryTime,
      page = 1,
      limit = 8,
      author,
      category,
      search,
      sort,
    } = req.query;

    // Convert page and limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // If it's the first request, set the query time to the current timestamp
    if (!firstQueryTime) {
      firstQueryTime = new Date().toISOString();
    }

    // Base query: Fetch videos created before or at the first query time to ensure consistency
    const query = { createdAt: { $lte: new Date(firstQueryTime) } };

    // Filter by author if provided
    if (author) {
      query.author = author;
    }

    // Filter by category if provided
    if (category) {
      query.category = category; // Ensure category matches exactly
    }

    // Search functionality across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } }, // Search in title (case-insensitive)
        { description: { $regex: search, $options: "i" } }, // Search in description
        { category: { $regex: search, $options: "i" } }, // Search in category
        { tags: { $in: [new RegExp(search, "i")] } }, // Search in tags (array)
      ];
    }

    // Sorting logic: Default to latest videos
    let sortOptions = { createdAt: -1 };
    if (sort === "popularity") {
      sortOptions = { viewCount: -1 }; // Sort by most viewed if 'popularity' is selected
    }

    // Count total matching videos for pagination
    const totalVideos = await Video.countDocuments(query);
    const totalPages = Math.ceil(totalVideos / limit);

    // Fetch videos with pagination and sorting
    const videos = await Video.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit) // Skip items for pagination
      .limit(limit) // Limit results per page
      .populate("author", "name profileImage"); // Populate author details

    return res.status(200).json({
      success: true,
      message: "Videos fetched successfully",
      firstQueryTime, // Keep track of initial fetch time for consistency
      page,
      limit,
      totalPages,
      totalVideos,
      videos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getPopularVideos = async (req, res) => {
  try {
    let { firstQueryTime, limit = 8, search } = req.query;

    // Convert limit to number
    limit = parseInt(limit) || 6;

    // If it's the first request, set the query time to the current timestamp
    if (!firstQueryTime) {
      firstQueryTime = new Date().toISOString();
    }

    // Base query: Fetch videos created before or at the first query time
    const query = { createdAt: { $lte: new Date(firstQueryTime) } };

    // Search functionality across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Fetch videos sorted by popularity (viewCount + likes.length)
    const videos = await Video.aggregate([
      { $match: query },
      {
        $addFields: {
          popularityScore: { $add: ["$viewCount", { $size: "$likes" }] },
        },
      },
      { $sort: { popularityScore: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          category: 1,
          thumbnailUrl: 1,
          videoUrl: 1,
          tags: 1,
          viewCount: 1,
          createdAt: 1,
          "author._id": 1,
          "author.name": 1,
          "author.profileImage": 1,
        },
      },
    ]);

    console.log("getPopularVideos response", {
      limit,
      totalVideos: videos.length,
      videoIds: videos.map((v) => v._id),
    });

    return res.status(200).json({
      success: true,
      message: "Popular videos fetched successfully",
      firstQueryTime,
      limit,
      videos,
    });
  } catch (error) {
    console.error("getPopularVideos error", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleLikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const authenticatedUserId = req.user?.userId;

    // Validate authentication
    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to like or unlike video.",
      });
    }

    // Validate videoId
    if (!mongoose.isValidObjectId(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID.",
      });
    }

    // Check if video exists
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // Check if user exists
    const userDocument = await User.findById(authenticatedUserId);
    if (!userDocument) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Determine if the user has already liked the video
    const userHasAlreadyLiked = existingVideo.likes.some(
      (id) => id.toString() === authenticatedUserId.toString()
    );

    // Update Video's likes array
    const updateLikesAction = userHasAlreadyLiked
      ? { $pull: { likes: authenticatedUserId } } // Unlike
      : { $addToSet: { likes: authenticatedUserId } }; // Like

    const updatedVideoDocument = await Video.findByIdAndUpdate(
      videoId,
      updateLikesAction,
      { new: true }
    ).populate("author", "name profileImage");

    // Update User's likedVideos array
    if (userHasAlreadyLiked) {
      // Remove from likedVideos
      await User.findByIdAndUpdate(
        authenticatedUserId,
        { $pull: { likedVideos: { videoId } } },
        { new: true }
      );
    } else {
      // Add to likedVideos with videoId and likedAt
      await User.findByIdAndUpdate(
        authenticatedUserId,
        {
          $addToSet: {
            likedVideos: {
              videoId,
              likedAt: new Date(),
            },
          },
        },
        { new: true }
      );
    }

    // Fetch updated user with populated likedVideos.videoId
    const updatedUser = await User.findById(authenticatedUserId).populate({
      path: "likedVideos.videoId",
      select: "title thumbnailUrl author",
      populate: {
        path: "author",
        select: "name profileImage",
      },
    });

    return res.status(200).json({
      success: true,
      message: userHasAlreadyLiked
        ? "Like removed from this video."
        : "Video successfully liked.",
      liked: !userHasAlreadyLiked,
      videoId,
      userId: authenticatedUserId,
      totalLikes: updatedVideoDocument.likes.length,
      user: updatedUser, // Return updated user to reflect likedVideos
    });
  } catch (error) {
    console.error("Error toggling like on video:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating the like status.",
      error: error.message,
    });
  }
};

export const toggleBookmarkVideo = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.userId;
    const { videoId } = req.params;

    if (!authenticatedUserId) {
      return res.status(401).json({
        message: "Unauthorized: Please log in to save or unsave videos.",
      });
    }

    const videoToBookmark = await Video.findById(videoId);
    if (!videoToBookmark) {
      return res.status(404).json({
        message: "Video not found. It may have been deleted.",
      });
    }

    const userDocument = await User.findById(authenticatedUserId);
    if (!userDocument) {
      return res.status(404).json({
        message: "User not found. Please re-login and try again.",
      });
    }

    const alreadyBookmarked = userDocument.savedVideos.some(
      (saved) => saved.videoId?.toString() === videoId
    );

    if (alreadyBookmarked) {
      // Remove bookmark
      userDocument.savedVideos = userDocument.savedVideos.filter(
        (saved) => saved.videoId?.toString() !== videoId
      );
    } else {
      // Add bookmark
      userDocument.savedVideos.push({ videoId });
    }

    await userDocument.save();

    const updatedUserWithBookmarks = await User.findById(
      authenticatedUserId
    ).populate("savedVideos.videoId");

    res.status(200).json({
      message: alreadyBookmarked
        ? "Video removed from your saved list."
        : "Video added to your saved list.",
      bookmarked: !alreadyBookmarked,
      user: updatedUserWithBookmarks,
      videoId,
    });
  } catch (error) {
    console.error("Error toggling video bookmark:", error.message);
    res.status(500).json({
      message: "Something went wrong while bookmarking the video.",
      error: error.message,
    });
  }
};

export const updateVideoAsViewed = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.userId;

    // Check if the video has already been viewed by the current user
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const viewedByCurrentUser = video.viewedBy.some(
      (view) => view.userId === userId
    );

    if (!viewedByCurrentUser) {
      // If the video hasn't been viewed by the current user, update it as viewed
      await Video.findByIdAndUpdate(
        videoId,
        {
          $addToSet: { viewedBy: { userId: userId } },
          $inc: { viewCount: 1 }, // Incrementing the viewCount
        },
        { new: true }
      ).populate("author", "name profileImage");

      // Return the updated video
      return res.status(200).json({
        success: true,
        message: "Video updated as viewed",
        video,
      });
    } else {
      // If the video has already been viewed by the current user, return a message
      return res.status(200).json({
        success: true,
        message: "Video already viewed by the user",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addCommentToVideo = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const videoId = req.params.videoId;
    const { content } = req.body;

    // Validate user authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not logged in",
      });
    }

    // Validate comment content
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment content is required and must be a non-empty string",
      });
    }

    // Find the video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Create and save the comment
    const newComment = new Comment({
      content: content.trim(),
      author: userId,
      video: videoId, // Link comment to video
    });

    await newComment.save();

    // Add comment to video's comments array
    video.comments = video.comments || []; // Ensure comments array exists
    video.comments.push(newComment._id);
    await video.save();

    // Populate author details
    const populatedComment = await Comment.findById(newComment._id).populate(
      "author",
      "name profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error adding comment to video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment to video",
      error: error.message,
    });
  }
};


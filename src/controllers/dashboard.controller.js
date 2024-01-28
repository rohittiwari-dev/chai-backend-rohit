import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  try {
    const totalVideoViews = await Video.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    const totalSubscribers = await Subscription.countDocuments({
      channel: req.user._id, // Assuming req.user contains the logged-in user's information
    });

    const totalVideos = await Video.countDocuments({ owner: req.user._id });

    const totalLikes = await Like.countDocuments({ likedBy: req.user._id });

    new ApiResponse(
      200,
      {
        totalVideoViews:
          totalVideoViews.length > 0 ? totalVideoViews[0].totalViews : 0,
        totalSubscribers,
        totalVideos,
        totalLikes,
      },
      "Successfully Fetched"
    );
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    new ApiError(500, "Internal Server Error");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  try {
    // Assuming req.user contains the logged-in user's information
    const channelVideos = await Video.find({ owner: req.user._id })
      .populate("owner", "username") // Populate owner field with username
      .sort({ createdAt: -1 }); // Sort by creation date in descending order

    res.status(200).json({
      success: true,
      data: {
        channelVideos,
      },
    });
    new ApiResponse(200, channelVideos, "Successfully Fetched");
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    new ApiError(500, "Internal Server Error");
  }
});

export { getChannelStats, getChannelVideos };

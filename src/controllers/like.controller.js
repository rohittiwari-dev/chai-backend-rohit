import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const userId = req.user?._id;
  if (!isValidObjectId(videoId))
    throw new ApiError(404, "Please Provide Valid Video Id");
  let video = await Like.findOne({ likedBy: userId, video: videoId });
  let message = "You Successfully ";
  if (video) {
    video.remove();
    message += "Unliked";
  } else {
    video = await Like.create({ likedBy: userId, video: videoId });
    message += "Liked";
  }
  new ApiResponse(200, video, "You Successfully Liked");
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user?._id;
  if (!isValidObjectId(commentId))
    throw new ApiError(404, "Please Provide Valid Comment Id");
  let comment = await Like.findOne({ likedBy: userId, comment: commentId });
  let message = "You Successfully ";
  if (comment) {
    comment.remove();
    message += "Unliked";
  } else {
    comment = await Like.create({ likedBy: userId, comment: commentId });
    message += "Liked";
  }
  new ApiResponse(200, comment, "You Successfully Liked");
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user?._id;
  if (!isValidObjectId(tweetId))
    throw new ApiError(404, "Please Provide Valid Tweet Id");
  let tweet = await Like.findOne({ likedBy: userId, tweet: tweetId });
  let message = "You Successfully ";
  if (tweet) {
    tweet.remove();
    message += "Unliked";
  } else {
    tweet = await Like.create({ likedBy: userId, tweet: tweetId });
    message += "Liked";
  }
  new ApiResponse(200, tweet, "You Successfully Liked");
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;
  const videoLikedList = await Like.find({
    likedBy: userId,
    video: { $not: null },
  });
  new ApiResponse(200, videoLikedList, "Fetched List Of Video");
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

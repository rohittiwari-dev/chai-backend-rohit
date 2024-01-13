import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const errorList = [];
  const { content, ownerId } = req.body;
  if (!ownerId) errorList.push("ownerId");
  if (!content) errorList.push("content");
  if (errorList.length)
    throw new ApiError(
      400,
      "Please Provide this required Fields:" + errorList.toString()
    );

  const createdTweet = await Tweet.create({ content, owner: ownerId });

  res
    .status(201)
    .json(new ApiResponse(201, createdTweet, "Tweet Successfully Done."));
});

const getUserTweets = asyncHandler(async (req, res, next) => {
  // TODO: get user tweets
  const userId = req.params.userId;
  if (!userId) throw new ApiError(400, "Please Provide user id");
  const tweetInfo = await Tweet.find({ owner: userId });
  if (!tweetInfo) throw new ApiError(400, "No Tweet Found with this tweet id");
  if (!tweetInfo.length)
    throw new ApiError(400, "No Tweets Found with this user ID");

  res
    .status(200)
    .json(new ApiResponse(200, tweetInfo, "Tweets successfully fetched."));
});

const updateTweet = asyncHandler(async (req, res, next) => {
  //TODO: update tweet
  const tweetId = req.params.tweetId;
  if (!tweetId) throw new ApiError(400, "Please Provide user id");
  const tweetInfo = await Tweet.findByIdAndUpdate(tweetId);
  if (!tweetInfo) throw new ApiError(400, "No Tweet Found with this tweet id");
  tweetInfo.set({ ...req.body }); // Did this way because find and update function does not returns the updated data
  // we can also use $set and new true inside the find and update function but to maintain clean code i am using this method
  await tweetInfo.save();
  res
    .status(200)
    .json(new ApiResponse(200, tweetInfo, "Tweet Successfully Updated"));
});

const deleteTweet = asyncHandler(async (req, res, next) => {
  //TODO: update tweet
  const tweetId = req.params.tweetId;
  if (!tweetId) throw new ApiError(400, "Please Provide user id");
  const tweetInfo = await Tweet.findByIdAndDelete(tweetId, { ...req.body });
  if (!tweetInfo) throw new ApiError(400, "No Tweet Found with this tweet id");
  res
    .status(200)
    .json(new ApiResponse(200, tweetInfo, "Tweet Successfully Deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };

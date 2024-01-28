import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const videoCommentList = await Comment.find({ video: videoId })
    .skip(parseInt(skip))
    .limit(parseInt(limit || 10))
    .exec();
  new ApiResponse(200, videoCommentList, "Fetching Video Successfully done");
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const videoId = req.params.videoId;
  const { content } = req.body;
  const userId = req.user?._id;
  if (!isValidObjectId(videoId))
    throw new ApiError(404, "Please provide valid video id");
  if (!content) throw new ApiError(404, "Please provide Video Comment");
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });
  new ApiResponse(201, comment, "your commented successfully");
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const commentId = req.params.commentId;
  const { content } = req.body;
  if (!isValidObjectId(commentId))
    throw new ApiError(404, "Please provide valid video id");
  if (!content) throw new ApiError(404, "Please provide Video Comment");
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );
  new ApiResponse(201, comment, "your comment successfully updated");
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const commentId = req.params.commentId;
  if (!isValidObjectId(commentId))
    throw new ApiError(404, "Please provide valid video id");
  const comment = await Comment.findByIdAndRemove(
    commentId,
    { content },
    { new: true }
  );
  new ApiResponse(201, comment, "your comment successfully deleted");
});

export { getVideoComments, addComment, updateComment, deleteComment };

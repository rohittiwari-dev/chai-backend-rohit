import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const queryObject = {};
  if (query) {
    queryObject.title = { $regex: query, $options: "i" };
  }

  if (userId) {
    queryObject.userId = userId;
  }

  const sortObject = {};
  if (sortBy) {
    sortObject[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const skip = (page - 1) * limit;

  const videos = await Video.find(queryObject)
    .sort(sortObject)
    .skip(skip)
    .limit(parseInt(limit, 10))
    .exec();

  const totalVideos = await Video.countDocuments(queryObject);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalVideos,
      },
      "this is the List"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const errorList = [];
  const { title, description } = req.body;
  const { videoFile, thumbnail } = req.files;

  if (!title) errorList.push("title");
  if (!description) errorList.push("description");
  if (!videoFile) errorList.push("videoFile");
  if (!thumbnail) errorList.push("thumbnail");

  if (errorList.length)
    throw new ApiError(
      "Please Provide Required Fields:" + errorList.toString()
    );
  let videoUploadResult = await uploadOnCloudinary(videoFile[0].path);
  let thumbnailUploadResult = await uploadOnCloudinary(thumbnail[0].path);

  const videoObject = {
    title,
    description,
    videoFile: {
      id: videoUploadResult.public_id,
      url: videoUploadResult.secure_url,
    },
    thumbnail: {
      id: thumbnailUploadResult.public_id,
      url: thumbnailUploadResult.secure_url,
    },
    duration: videoUploadResult.duration,
  };
  const publishedVideo = await Video.create(videoObject);
  res
    .status(201)
    .json(new ApiResponse(201, publishedVideo, "Successfully published Video"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const userId = req.user?.id;
  if (!videoId) throw new ApiError("Please Provide a Valid Video Id");
  const videoInfo = await Video.findById(videoId);
  if (!videoInfo) throw new ApiError("No Video Published with this id");

  // if (videoInfo.owner != userId) {
  //   videoInfo.set({ views: videoInfo.views + 1 });
  //   await videoInfo.save();
  // }

  res
    .status(200)
    .json(new ApiResponse(200, videoInfo, "Video Successfully Fetched"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) throw new ApiError("Please Provide a Valid Video Id");
  const videoInfo = await Video.findById(videoId);
  if (!videoInfo) throw new ApiError("No Video Published with this id");
  videoInfo.set({ ...req.body }); // Did this way because find and update function does not returns the updated data
  // we can also use $set and new true inside the find and update function but to maintain clean code i am using this method
  videoInfo.save();
  res
    .status(200)
    .json(new ApiResponse(200, videoInfo, "Video Successfully Updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) throw new ApiError("Please Provide a Valid Video Id");

  const videoInfo = await Video.findByIdAndDelete(videoId);

  if (!videoInfo) throw new ApiError("No Video Published with this id");

  if (videoInfo.videoFile && videoInfo.videoFile.id)
    await cloudinary.uploader.destroy(videoInfo.videoFile.id, {
      resource_type: "video",
    });

  if (videoInfo.thumbnail && videoInfo.thumbnail.id)
    await cloudinary.uploader.destroy(videoInfo.thumbnail.id);

  res
    .status(200)
    .json(new ApiResponse(200, videoInfo, "Video Successfully Updated"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError("Please Provide a Valid Video Id");
  const videoInfo = await Video.findById(videoId);
  if (!videoInfo) throw new ApiError("No Video Published with this id");
  let message = "video successfully ";
  // Did this way because find and update function does not returns the updated data
  // we can also use $set and new true inside the find and update function but to maintain clean code i am using this method
  if (videoInfo.isPublished == true) {
    videoInfo.set({ isPublished: false });
    message += "unpublished";
  } else {
    message += "published";
    videoInfo.set({ isPublished: true });
  }
  await videoInfo.save();
  res.status(200).json(new ApiResponse(200, videoInfo, message));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

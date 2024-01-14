import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?.id;
  const requiredFields = [];
  //TODO: create playlist
  if (!name) requiredFields.push("name");
  if (!description) requiredFields.push("description");
  if (requiredFields.length)
    throw new ApiError(
      400,
      "Please Provide required fields:" + requiredFields.toString()
    );

  const playlistInfo = await Playlist.create({
    name,
    description,
    owner: userId,
  });
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        playlistInfo,
        "Playlist Created, please add your videos"
      )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId))
    throw new ApiError(400, "Please Provide valid user id");
  //TODO: get user playlists

  const list_playlists = await Playlist.findOne({ owner: userId }).exec();
  let message = "Playlists ";
  if (!list_playlists.length) {
    message += "successfully fetched.";
  } else {
    message += "not found.";
  }
  res.status(200).json(new ApiResponse(200, list_playlists, message));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Please Provide valid playlist id");
  }
  const playlistInfo = await Playlist.findById(playlistId);
  if (!playlistId) throw new ApiError(404, "no playlist found with this");
  res
    .status(200)
    .json(
      new ApiResponse(200, playlistInfo, "Playlist info successfully fetched.")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Please Provide valid playlistId and videoId");
  }
  const video = await Video.countDocuments({ _id: videoId });
  if (video <= 0) {
    throw new ApiError(404, "No video found with this video Id.");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } },
    { new: true }
  );
  if (!playlist) throw new ApiError(404, "no Playlist found with this id");
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Added video to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Please Provide valid playlistId and videoId");
  }
  const video = await Video.countDocuments({ _id: videoId });
  if (video <= 0) {
    throw new ApiError(404, "No video found with this video Id.");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
  );
  if (!playlist) throw new ApiError(404, "no Playlist found with this id");
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Removed video from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Please provide valid playlist Id");
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist) throw new ApiResponse("No Playlist found with this Id");
  res
    .status(200)
    .json(
      new ApiResponse(200, deletePlaylist, "Playlist Deleted Successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Please provide valid playlist Id");
  if (!name && !description)
    throw new ApiError(
      400,
      "Please Provide any one fields of playlist to be updated"
    );

  const playlistInfo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );
  if (!playlistInfo)
    throw new ApiError(404, "no playlist not found with this playlist id");
  res
    .status(200)
    .json(new ApiResponse(200, playlistInfo, "Playlist Updated Successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};

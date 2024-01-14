import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  const userId = req.user?.id;
  if (!channelId || !isValidObjectId(channelId))
    throw new ApiError("Channel Id Required");
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Please Provide Valid Channel Id");
  }

  if (channelId == userId)
    throw new ApiError(400, "You Cannot Subscribe to your channel");
  const isChannelExists = await User.countDocuments({ _id: channelId });
  if (isChannelExists <= 0)
    throw new ApiError(404, "Channel with this id does not exists.");
  let subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });
  let message = "You have successfully";
  if (subscription) {
    await subscription.deleteOne();
    message += "Unsubscribed";
  } else {
    subscription = await Subscription.create({
      channel: channelId,
      subscriber: userId,
    });
    message += "Subscribed";
  }
  res
    .status(201)
    .json(
      new ApiResponse(201, subscription, "You have successfully Subscribed")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId || !isValidObjectId(channelId))
    throw new ApiError("Channel Id Required");
  const subscriberList = await Subscription.find({
    subscriber: { $ne: channelId },
    channel: channelId,
  }).exec();
  res
    .status(201)
    .json(
      new ApiResponse(201, subscriberList, "List of Subscriber to this Channel")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId || !isValidObjectId(subscriberId))
    throw new ApiError(400, "subscriber Id Required");
  const channelList = await Subscription.find({
    $where: { subscriber: subscriberId, channel: { $ne: subscriberId } },
  }).exec();
  res
    .status(201)
    .json(new ApiResponse(201, channelList, "List of Channel Subscribed"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

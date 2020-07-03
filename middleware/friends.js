const User = require('../models/User');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const checkRequestById = async (acceptingUserId, requestId) => {
  const response = {
    isAlreadyFriend: false,
    isRequestFound: false,
    acceptingUser: null,
    requestingUser: null,
    friendRequest: null
  };
  try {
    let acceptingUser = await User.findOne(
      { _id: acceptingUserId },
      '-password'
    )
      .populate({ path: 'friends', model: User })
      .populate({ path: 'friendRequests.user', model: User });

    // request.id : all requests in friendRequests
    // requestId : what we received from frontend

    let friendRequest = acceptingUser.friendRequests.find((request) => {
      return ObjectId(request.id).equals(requestId);
    });

    response.isAlreadyFriend =
      acceptingUser.friends &&
      acceptingUser.friends.some((friend) =>
        ObjectId(friend.id).equals(friendRequest.user.id)
      );
    response.isRequestFound = friendRequest !== null;
    response.acceptingUser = acceptingUser;
    response.requestingUser = friendRequest.user;
    response.friendRequest = friendRequest;
    return response;
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Remove the request from the arrays
const removeFriendRequest = async (requestInfo) => {
  try {
    // Remove from the accepting user array
    await User.updateOne(
      { _id: requestInfo.acceptingUser.id },
      { $pull: { friendRequests: { _id: requestInfo.friendRequest.id } } }
    );

    // Remove from the requesting user array
    await User.updateOne(
      { _id: requestInfo.requestingUser.id },
      { $pull: { friendRequests: { user: requestInfo.acceptingUser.id } } }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add users as friend from a friend request
const makeFriendshipFromRequest = async (requestInfo) => {
  try {
    await User.updateOne(
      { _id: requestInfo.acceptingUser.id },
      { $addToSet: { friends: requestInfo.requestingUser } }
    );
    await User.updateOne(
      { _id: requestInfo.requestingUser.id },
      { $addToSet: { friends: requestInfo.acceptingUser } }
    );
  } catch (err) {
    console.error(err.mesaage);
    res.status(500).send('server error');
  }
};

const checkFriendById = async (deletedFriendId, userId) => {
  const response = {
    // isAlreadyFriend: false,
    IsFriendFound: false,
    deletedFriend: null,
    deleterFriend: null,
    friend: null
  };
  try {
    let deletedFriend = await User.findOne(
      { _id: deletedFriendId },
      '-password'
    )
      .populate({ path: 'friends', model: User })
      .populate({ path: 'friends._id', model: User });

    let friend = deletedFriend.friends
      .map((item) => item._id)
      .map((item) => item.map((item) => item._id))
      .map((item) => item[0])
      .filter((id) => id == userId)[0];
    response.IsFriendFound = friend !== null;
    response.deletedFriend = deletedFriend;
    response.deleterFriend = friend;
    response.friend = friend;
    return response;
  } catch (err) {
    console.error(err.mesaage);
    res.status(500).send('server error');
  }
};

// Remove friend from the arrays
const removeFriend = async (friendInfo) => {
  try {
    // Remove from the deleted friend array
    await User.updateOne(
      { _id: friendInfo.deletedFriend._id },
      { $pull: { friends: friendInfo.deleterFriend } }
    );
    // Remove from the deleter user array
    await User.updateOne(
      { _id: friendInfo.deleterFriend },
      { $pull: { friends: friendInfo.deletedFriend._id } }
    );
  } catch (err) {
    console.error(err.mesaage);
    res.status(500).send('server error');
  }
};

module.exports = {
  checkRequestById,
  removeFriendRequest,
  makeFriendshipFromRequest,
  checkFriendById,
  removeFriend
};

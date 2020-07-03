const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const { ObjectId } = mongoose.Types;
const {
  checkRequestById,
  makeFriendshipFromRequest,
  removeFriendRequest,
  checkFriendById,
  removeFriend
} = require('../../middleware/friends');

const {
  friendAddedNotification,
  friendAcceptedNotification
} = require('../../emails/account');

// @route           GET api/friends
// @description     Get all friends
// @access          Private
router.get('/', auth, async (req, res) => {
  let user;
  try {
    user = await User.findOne({ _id: req.user.id }).populate({
      path: 'friends',
      model: User
    });
    res.json({
      friends: user.friends
        ? user.friends
            .map((friend) => friend.toObject())
            .map((friend) => ({
              id: friend._id,
              name: friend.name,
              email: friend.email,
              avatar: friend.avatar,
              friends: friend.friends
            }))
        : []
    });
  } catch (err) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route           POST api/friends/friendId
// @description     Send friend request
// @access          Private
router.post('/:friendId', auth, async (req, res) => {
  const { friendId } = req.params;
  const { id } = req.user;
  let user;
  let friend;
  try {
    // Get the user
    user = await User.findOne({ _id: id }, '-password')
      .populate({ path: 'friends', model: User })
      .populate({ path: 'friendRequests.user', model: User });

    // Check if the user is friend with the person before sending a request?
    if (
      user.friends &&
      user.friends.some((friend) => ObjectId(friend.id).equals(friendId))
    ) {
      return res
        .status(200)
        .json({ message: `You are already friends  with  ` });
    }

    // Check if there is an existing request before sending a request?
    if (
      user.friendRequests &&
      user.friendRequests.some((request) =>
        ObjectId(request.user.id).equals(friendId)
      )
    ) {
      return res
        .status(400)
        .json({ msg: `There is already a request related with  ` });
    }

    // If not friends and There are no previous request.
    friend = await User.findOne({ _id: friendId }, '-password');

    if (!friend) {
      return res
        .status(400)
        .json({ message: 'Could not find friend to sent request!' });
    }

    const sentRequest = {
      user: ObjectId(friendId),
      date: Date(),
      isSent: true
    };

    const receivedRequest = {
      user: ObjectId(id),
      date: sentRequest.date,
      isSent: false
    };
    // ensure that the user can not send friend request to him self
    if (friendId === id) {
      return res.status(400).json({ mes: 'can not send request to ur self' });
    }
    // Update user data
    await User.findOneAndUpdate(
      { _id: id },
      { $addToSet: { friendRequests: sentRequest } }
    );
    // Update friend data
    await User.findOneAndUpdate(
      { _id: friendId },
      { $addToSet: { friendRequests: receivedRequest } }
    );
    // Email notification
    if (friend.notifications) {
      friendAddedNotification(friend.name, user.name, friend.email);
    }
    const newNotification = new Notification({
      sender: req.user.id,
      receiver: [friend._id],
      message: `${user.name} send you friend request`,
      kind: 'friend request',
      path: `/profiles`
    });
    await newNotification.save();
    res.status(200).json(sentRequest);
  } catch (err) {
    console.error(err.mesaage);
    res.status(500).send('server error');
  }
});

// @route           GET api/friends/requests
// @description     Get all friend requests
// @access          Private
router.get('/requests', auth, async (req, res) => {
  const { id } = req.user;
  try {
    let user = await User.findById(id, '-password').populate({
      path: 'friendRequests.user',
      model: User
    });
    const friendRequests = user.friendRequests
      .toObject()
      .filter((request) => request.isSent === false)
      .map((request) => ({
        ...request,
        user: {
          id: request.user._id,
          name: request.user.name,
          email: request.user.email,
          avatar: request.user.avatar
        }
      }));

    res.status(200).json({ friendRequests });
  } catch (err) {
    console.error(err.mesaage);
    res.status(500).send('server error');
  }
});

// @route           PUT api/friends/requests/:requestId
// @description     Accept friend request
// @access          Private
router.put('/requests/:requestId', auth, async (req, res) => {
  const { requestId } = req.params;
  const { id } = req.user;
  const user = await User.findById(id);
  try {
    // Check if there is a request
    const requestInfo = await checkRequestById(id, requestId);

    // If there is one, remove it from both users friendRequests arrays (filter and set)
    if (requestInfo.isRequestFound) {
      await removeFriendRequest(requestInfo);
    }
    // Add both users to each others friends arrays (addToSet)
    if (!requestInfo.isAlreadyFriend) {
      await makeFriendshipFromRequest(requestInfo);
      const accepting = await User.findById(requestInfo.acceptingUser.id);
      const requesting = await User.findById(requestInfo.requestingUser.id);
      // Todo ask Mosleh about this code and also about the clientside
    }

    /* Start Notification*/
    // Email notification
    if (requestInfo.acceptingUser.notifications) {
      friendAcceptedNotification(
        requestInfo.requestingUser.name,
        requestInfo.acceptingUser.name,
        requestInfo.requestingUser.email
      );
    }
    // Notification inside the app
    const newNotification = new Notification({
      sender: req.user.id,
      receiver: [requestInfo.requestingUser._id],
      message: `${requestInfo.acceptingUser.name} accepted you as friend`,
      kind: 'accepted you firnd request',
      path: `/profiles`
    });
    await newNotification.save();
    /* End Notification*/

    res.status(200).json({
      message: 'Friend request has been approved successfully!',
      requestInfo
    });
  } catch (err) {
    console.error(err.mesaage);
    res.status(500).send('server error');
  }
});

// @route           DELETE api/friends/requests/:requestId
// @description     Reject friend request
// @access          Private
router.delete('/requests/:requestId', auth, async (req, res) => {
  const { requestId } = req.params;
  const { id } = req.user;
  try {
    // Check if there is a request
    const requestInfo = await checkRequestById(id, requestId);
    // If there is one, remove it from both users friendRequests arrays (filter and set)
    if (requestInfo.isRequestFound) {
      await removeFriendRequest(requestInfo);
    }
    // return a success message
    res.status(200).json({
      message: 'Friend request has been declined successfully!',
      requestInfo
    });
  } catch (err) {
    console.error(err.mesaage);
    res.status(500).send('server error');
  }
});

// @route           DELETE api/friends/:friendId
// @description     Delete friend
// @access          Private
router.delete('/:friendId', auth, async (req, res) => {
  const { friendId } = req.params;
  const { id } = req.user;

  try {
    // Check if there is a request
    const friendInfo = await checkFriendById(friendId, id);
    // If there is one, remove it from both users friendRequests arrays (filter and set)
    if (friendInfo.IsFriendFound) {
      await removeFriend(friendInfo);
    }
    // return a success message
    res
      .status(200)
      .json({ message: 'Friend has been removed successfully!', friendInfo });
  } catch (err) {
    console.error(err.mesaage);
    res.status(500).send('server error');
  }
});

// @route           DELETE api/friends/:friendId
// @description     cancel friend request
// @access          Private
router.delete('/cancel/:UserIdOfRequest', auth, async (req, res) => {
  const { UserIdOfRequest } = req.params;
  const { id } = req.user;
  const senderOfRequest = await User.findById(id);
  const selectedRequest = await senderOfRequest.friendRequests.find(
    (request) => {
      return ObjectId(request.user).equals(UserIdOfRequest);
    }
  );

  try {
    // Remove from the sender user array
    await User.updateOne(
      { _id: senderOfRequest.id },
      { $pull: { friendRequests: { user: selectedRequest.user } } }
    );

    // Remove from the receiver user array
    await User.updateOne(
      { _id: selectedRequest.user },
      { $pull: { friendRequests: { user: senderOfRequest.id } } }
    );

    res.status(200).json(selectedRequest);
  } catch (err) {
    console.error(err.mesaage);
    res.status(500).send('server error');
  }
});

module.exports = router;

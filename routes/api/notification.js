const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../../models/Notification');
const auth = require('../../middleware/auth');

// @route  GET api/notification
// @desc    Get the Notification
// @access  Private
router.get('/', auth, async (req, res) => {
  const readerId = req.user.id;

  try {
    const notification = await Notification.find({
      receiver: { $in: mongoose.Types.ObjectId(readerId) }
    })
      .populate('sender', ['name', 'avatar'])
      .sort('-created_at');
    res.json(notification);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route  DELETE api/notification/:notificationId
// @desc    Delete notification
// @access  Private
router.delete('/:notificationId', auth, async (req, res) => {
  const notificationId = req.params.notificationId;
  const receiverId = req.user.id;

  try {
    const notification = await Notification.findById(
      notificationId
    ).populate('sender', ['name', 'avatar']);
    if (notification.receiver.length <= 1) {
      await notification.remove();
      return res.json({ msg: 'Notification deleted' });
    }

    // Get remove index
    const removeIndex = notification.receiver
      .map((receiver) => receiver.toString())
      .indexOf(receiverId);
    notification.receiver.splice(removeIndex, 1);
    console.log(notification);
    await notification.save();
    res.json({ msg: 'Notification deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

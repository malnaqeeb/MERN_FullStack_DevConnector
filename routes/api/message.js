const express = require('express');
const router = express.Router();

const Message = require('../../models/Message');
const auth = require('../../middleware/auth');

// @route  GET api/users/message
// @desc    Get the conversation users
// @access  Private

router.get('/', auth, async (req, res) => {
  let corresponders;
  try {
    corresponders = await Message.find(
      { owner: req.user.id },
      'corresponder hasNewMessage -_id'
    )
      .populate({
        path: 'corresponder',
        select: 'name avatar'
      })
      .sort('-updatedAt')
      .exec();
    res.json({ corresponders });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/message/:corresponderId
// @desc    Get Message with specific user
// @access  Private
router.get('/:corresponderId', auth, async (req, res) => {
  let messages;

  try {
    messages = await Message.findOneAndUpdate(
      { owner: req.user.id, corresponder: req.params.corresponderId },
      { $set: { hasNewMessage: true } },
      { new: true, upsert: true }
    )
      .populate({
        path: 'corresponder',
        select: 'name avatar'
      })
      .exec();
    res.json({ messages: messages });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/message/:corresponderId/:messageId
// @desc    Delete specific message by id
// @access  Private
router.delete('/:corresponderId/:messageId', auth, async (req, res) => {
  try {
    const messages = await Message.findOneAndUpdate(
      { owner: req.user.id, corresponder: req.params.corresponderId },
      { $pull: { messages: { _id: req.params.messageId } } },
      { new: true, upsert: true }
    )
      .populate({
        path: 'corresponder',
        select: 'name avatar'
      })
      .exec();

    res.json(messages);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/message/:corresponderId
// @desc    Delete all messages
// @access  Private
router.patch('/:corresponderId', auth, async (req, res) => {
  try {
    await Message.findOneAndDelete({
      owner: req.user.id,
      corresponder: req.params.corresponderId
    }).exec();
    res.json({ msg: 'Messages deleted' });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

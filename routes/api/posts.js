const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Posts');
const Notification = require('../../models/Notification');

const {
  likeNotification,
  emojiNotification,
  addCommentNotification,
  addCommentEmojiNotification
} = require('../../emails/account');
// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [auth, [check('text', 'Text is required.').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
        link: req.body.link || ''
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name avatar')
      .sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});
// @route   GET api/posts/:id
// @desc    Get post bu id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    if (!posts) {
      return res.status(404).json({ msg: 'Post not found.' });
    }
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Post not found.' });
    }
    res.status(500).send('Server error!');
  }
});

// @route   GET api/post
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/post/:id
// @desc    delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found.' });
    }
    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    } else {
      await post.remove();
    }

    res.json({ msg: 'Post removed' });
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Post not found.' });
    }
    res.status(500).send('Server error!');
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const postOwner = await User.findById(post.user);
    const userLiked = await User.findById(req.user.id);

    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });

    /* Statrt Notification*/
    // Emil notification
    if (postOwner.notifications && post.user.toString() !== req.user.id) {
      likeNotification(
        postOwner.name,
        userLiked.name,
        post.text,
        postOwner.email
      );
    }
    if (post.user.toString() !== req.user.id) {
      const newNotification = new Notification({
        sender: req.user.id,
        receiver: [postOwner._id],
        message: `${userLiked.name} liked your ${post.text} post.`,
        kind: 'like post',
        path: `/posts`
      });
      await newNotification.save();
    }

    /* END Notification*/
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/posts/emoji/:id
// @desc    add emoji to a post
// @access  Private

router.put('/emoji/:id', auth, async (req, res) => {
  try {
    const {
      colons,
      emoticons,
      id,
      name,
      native,
      skin,
      short_names,
      unified
    } = req.body;

    const emoji = {
      colons,
      emoticons,
      id,
      name,
      native,
      skin,
      short_names,
      unified
    };

    const post = await Post.findById(req.params.id);
    // Check if the emoji has already been chosen
    const { emojis } = post;
    const existingEmoji = emojis.find(
      (emoji) => emoji.emoji.unified === unified
    );

    const isEmojiAddedByUser =
      !!existingEmoji &&
      existingEmoji.users.map((user) => user.toString()).includes(req.user.id);

    if (isEmojiAddedByUser) {
      return res
        .status(400)
        .json({ msg: 'You already chose it. Please add another one...' });
    }

    if (existingEmoji) {
      existingEmoji.users.unshift(req.user.id);
    } else {
      emojis.unshift({ users: [req.user.id], emoji });
    }

    emojis.forEach((emoji) => (emoji.amount = emoji.users.length));
    // get the post owner and the user that add emoji
    const postOwner = await User.findById(post.user);
    const userAddedEmoji = await User.findById(req.user.id);

    await post.save();

    /* Start Notification system*/

    // sent notification email
    if (postOwner.notifications && post.user.toString() !== req.user.id) {
      emojiNotification(
        postOwner.name,
        userAddedEmoji.name,
        post.text,
        postOwner.email
      );
    }
    if (post.user.toString() !== req.user.id) {
      const newNotification = new Notification({
        sender: req.user.id,
        receiver: [postOwner._id],
        message: `${userAddedEmoji.name} add emoji to your ${post.text} post.`,
        kind: 'emoji post',
        path: `/posts`
      });
      await newNotification.save();
    }

    /* End Notification system*/
    res.json({
      emojis: emojis
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Check if the post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }
    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/posts/emoji/:id/emoji_id
// @desc    Remove emoji from a post
// @access  Private
router.delete('/emoji/:id/:emoji_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const emojiId = req.params.emoji_id;

    // Check if the emoji has already been chosen
    const emojiAddedByUser = post.emojis.find(
      (emoji) =>
        emoji.id.toString() === emojiId && emoji.users.includes(req.user.id)
    );

    if (!emojiAddedByUser) {
      return res.status(400).json({ msg: 'No emoji to be removed' });
    }
    // Get remove index

    const updatedEmojiUsers = emojiAddedByUser.users.filter(
      (user) => user.toString() !== req.user.id
    );

    emojiAddedByUser.users = updatedEmojiUsers;
    emojiAddedByUser.amount = emojiAddedByUser.users.length;

    if (emojiAddedByUser.users.length === 0) {
      const updatedEmojiArray = post.emojis.filter(
        (emoji) => emoji.id.toString() !== emojiId
      );

      post.emojis = updatedEmojiArray;
    }

    await post.save();
    res.json({
      emojis: post.emojis
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required.').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(400).json({ msg: 'Post not found.' });
      }
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      // get the post owner and the user that add comment
      const postOwner = await User.findById(post.user);
      const userAddedComment = await User.findById(req.user.id);

      // sent notification email
      if (postOwner.notifications && post.user.toString() !== req.user.id) {
        addCommentNotification(
          postOwner.name,
          userAddedComment.name,
          post.text,
          postOwner.email,
          req.body.text
        );
      }
      if (post.user.toString() !== req.user.id) {
        const newNotification = new Notification({
          sender: req.user.id,
          receiver: [postOwner._id],
          message: `${userAddedComment.name} commented this ${post.text} post.`,
          kind: 'add comment',
          path: `/posts/${post._id}`
        });
        await newNotification.save();
      }

      await post.save();

      res.json(post.comments);
    } catch (error) {
      console.error(error.message);

      if (error.message.includes('Cast to ObjectId failed')) {
        return res.status(400).json({ msg: 'Post not found.' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/post/comment/:id/:comment_id
// @desc    Delete a comment from a post
// @access  Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    //  Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment dose not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'User not authorized' });
    }
    // Get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);

    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Post not found.' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/posts/comment/emoji/:id/:comment_id
// @desc    add emoji to a comment
// @access  Private

router.put('/comment/emoji/:id/:comment_id', auth, async (req, res) => {
  try {
    const {
      colons,
      emoticons,
      id,
      name,
      native,
      skin,
      short_names,
      unified
    } = req.body;

    const emoji = {
      colons,
      emoticons,
      id,
      name,
      native,
      skin,
      short_names,
      unified
    };

    const post = await Post.findById(req.params.id);
    // Check if the emoji has already been chosen
    const { comments } = post;
    const comment = comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    const { emojis } = comment;

    // .emojis.find((emoji) => emoji.emoji.unified === unified);

    const existingEmoji = emojis.find(
      (emoji) => emoji.emoji.unified === unified
    );

    const isEmojiAddedByUser =
      !!existingEmoji &&
      existingEmoji.users.map((user) => user.toString()).includes(req.user.id);

    if (isEmojiAddedByUser) {
      return res
        .status(400)
        .json({ msg: 'You already chose it. Please add another one...' });
    }

    if (existingEmoji) {
      existingEmoji.users.unshift(req.user.id);
    } else {
      emojis.unshift({ users: [req.user.id], emoji });
    }

    emojis.forEach((emoji) => (emoji.amount = emoji.users.length));

    // get the comment owner and the user that add emoji
    const commentOwner = await User.findById(comment.user);
    const userAddedEmoji = await User.findById(req.user.id);

    // sent notification email
    if (
      commentOwner.notifications &&
      commentOwner._id.toString() !== req.user.id
    ) {
      addCommentEmojiNotification(
        commentOwner.name,
        userAddedEmoji.name,
        comment.text,
        commentOwner.email
      );
    }
    if (commentOwner._id.toString() !== req.user.id) {
      const newNotification = new Notification({
        sender: req.user.id,
        receiver: [comment.user],
        message: `${userAddedEmoji.name} added emoji to your ${comment.text} comment.`,
        kind: 'add comment',
        path: `/posts/${post._id}`
      });
      await newNotification.save();
    }

    await post.save();

    res.json({ emojis });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/posts/emoji/comment/:id/:comment_id
// @desc    Remove an emoji from comment
// @access  Private

router.delete(
  '/comment/emoji/:id/:comment_id/:emoji_id',
  auth,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const emojiId = req.params.emoji_id;
      const comment = post.comments.find(
        (comment) => comment.id === req.params.comment_id
      );
      const emojiAddedByUser = comment.emojis.find(
        (emoji) =>
          emoji.id === emojiId &&
          emoji.users.map((user) => user.toString()).includes(req.user.id)
      );

      // Check if the emoji exists
      if (!emojiAddedByUser) {
        return res.status(404).json({ msg: 'No emoji to be removed' });
      }

      // Get remove index
      const updatedEmojiUsers = emojiAddedByUser.users.filter(
        (user) => user.toString() !== req.user.id
      );

      emojiAddedByUser.users = updatedEmojiUsers;
      emojiAddedByUser.amount = emojiAddedByUser.users.length;

      if (emojiAddedByUser.users.length === 0) {
        const updatedEmojiArray = post.emojis.filter(
          (emoji) => emoji.id.toString() !== emojiId
        );
        post.emojis = updatedEmojiArray;
      }

      await post.save();
      res.json({ emojis: comment.emojis });
    } catch (error) {
      console.error(error.message);
      if (error.message.includes('Cast to ObjectId failed')) {
        return res.status(400).json({ msg: 'Post not found.' });
      }
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;

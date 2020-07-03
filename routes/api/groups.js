const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Group = require('../../models/Groups');
const Notification = require('../../models/Notification');
const {
  JoinedGroupNotification,
  leftGroupNotification,
  deleteGroupNotification,
  addPostGroupNotification,
  addEventGroupNotification,
  addCommentGroupNotification,
  addEmojiPostGroupNotification
} = require('../../emails/account');
/* GROUPS--- CREATE GROUPS - GET GROUPS - DELETE GROUPS - ADD/REMOVE MEMBERS */
/***************************************************************************************************/

// @route   POST api/groups
// @desc    Create a group
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required.').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const loggedInUser = await User.findById(req.user.id);
      const currentUser = {
        dateJoined: Date.now(),
        user: req.user.id,
        name: loggedInUser.name,
        avatar: loggedInUser.avatar
      };

      const newGroup = new Group({
        name: req.body.name,
        description: req.body.description,
        creator: req.user.id,
        posts: [],
        members: [currentUser],
        createdAt: Date.now(),
        isPublic: req.body.isPublic
      });
      loggedInUser.myGroups.push(newGroup);
      await loggedInUser.save();
      const group = await newGroup.save();
      res.json(group);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/groups
// @desc    Get all groups
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('creator', 'name')
      .sort({ date: -1 });
    res.json(groups);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/groups/:groupID
// @desc    Get the groups by id
// @access  Public
router.get('/:groupID', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupID)
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar');
    if (!group) {
      return res.status(404).json({ msg: 'Group not found.' });
    }
    res.json(group);
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Group not found.' });
    }
    res.status(500).send('Server error!');
  }
});

// @route   DELETE api/groups/:groupID
// @desc    delete a group by id
// @access  Private
router.delete('/:groupID', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupID);
    const usersWithGroup = await User.find({
      myGroups: { _id: group._id.toString() }
    });
    if (!group) {
      return res.status(404).json({ msg: 'Group not found.' });
    }
    // Check user
    if (group.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    } else {
      await group.remove();
    }
    userWithGroup = usersWithGroup.map((user) => {
      user.myGroups = user.myGroups.filter(
        (myGroup) => myGroup._id.toString() !== group._id.toString()
      );
      user.save();
    });

    /*
        Send email notifications
        1-first remove the sender from the group members.
        2-loop through The user schema to get the users info
        2-check the notifications prop if true then send the email notifications.
        */

    const ownerGroup = await User.findById(group.creator);

    group.members
      .filter((member) => member.user.toString() !== req.user.id)
      .forEach(async (user) => {
        const users = await User.findById(user.user);
        if (users.notifications) {
          deleteGroupNotification(
            users.name,
            ownerGroup.name,
            group.name,
            users.email
          );
        }
        const newNotification = new Notification({
          sender: req.user.id,
          receiver: [users._id],
          message: `${ownerGroup.name} removed the ${group.name} group.`,
          kind: 'removed group',
          path: group._id
        });
        await newNotification.save();
      });
    
    res.json({ msg: 'Group removed' });
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Group not found.' });
    }
    res.status(500).send('Server error!');
  }
});

// @route   PUT api/groups/:groupID
// @desc    update group settings
// @access  Private
router.put(
  '/:groupID',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let group = await Group.findById(req.params.groupID);
      if (!group) {
        return res.status(404).json({ msg: 'Group not found.' });
      }
      // Check user
      if (group.creator.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      } else {
        group.name = req.body.name;
        group.description = req.body.description;
        group.isPublic = req.body.isPublic;
        await group.save();
      }
      res.json({ msg: 'Group info updated' });
    } catch (error) {
      console.error(error.message);
      if (error.message.includes('Cast to ObjectId failed')) {
        return res.status(400).json({ msg: 'Group not found.' });
      }
      res.status(500).send('Server error!');
    }
  }
);

// @route   PUT api/groups/join/:groupID
// @desc    Add a member to a group
// @access  Private
router.put('/join/:groupID', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupID);
    if (!group) {
      return res.status(404).json({ msg: 'Group not found.' });
    }
    // Check if user is already a member
    if (
      group.members.filter((member) => member.user.toString() === req.user.id)
        .length > 0
    ) {
      return res.status(400).json({ msg: 'Already a member!' });
    } else {
      const currentUser = await User.findById(req.user.id);
      const newMember = {
        dateJoined: Date.now(),
        user: req.user.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      };
      const newGroup = {
        _id: group._id,
        name: group.name
      };
      currentUser.myGroups.push(newGroup);
      await currentUser.save();
      group.members.push(newMember);
      await group.save();
      /*
        Send email notifications
        1-first remove the sender from the group members.
        2-loop through The user schema to get the users info
        2-check the notifications prop if true then send the email notifications.
        */

      const userJoined = await User.findById(req.user.id);
      group.members
        .filter((member) => member.user.toString() !== req.user.id)
        .forEach(async (user) => {
          const users = await User.findById(user.user);
          if (users.notifications) {
            JoinedGroupNotification(
              users.name,
              userJoined.name,
              group.name,
              users.email
            );
          }
          const newNotification = new Notification({
            sender: req.user.id,
            receiver: [users._id],
            message: `${userJoined.name} joined in ${group.name} group.`,
            kind: 'join group',
            path: group._id
          });
          await newNotification.save();
        });

      res.send(group.members);
    }
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Group not found.' });
    }
    res.status(500).send('Server error!');
  }
});

// @route   PUT api/groups/leave/:groupID
// @desc    Remove a member from a group
// @access  Private
router.put('/leave/:groupID', auth, async (req, res) => {
  try {
    let group = await Group.findById(req.params.groupID);
    if (!group) {
      return res.status(404).json({ msg: 'Group not found.' });
    }
    const user = await User.findById(req.user.id);
    // Check user
    if (
      group.members.filter((member) => member.user.toString() === req.user.id)
        .length <= 0
    ) {
      return res.status(401).json({ msg: 'Not a member!' });
    } else {
      group.members = group.members.filter(
        (member) => member.user.toString() !== req.user.id
      );
    }
    user.myGroups = user.myGroups.filter(
      (myGroup) => myGroup._id.toString() !== group._id.toString()
    );
    await user.save();
    await group.save();
    /*
        Send email notifications
        1-first remove the sender from the group members.
        2-loop through The user schema to get the users info
        2-check the notifications prop if true then send the email notifications.
        */
    const userLeft = await User.findById(req.user.id);
    group.members
      .filter((member) => member.user.toString() !== req.user.id)
      .forEach(async (user) => {
        const users = await User.findById(user.user);
        if (users.notifications) {
          leftGroupNotification(
            users.name,
            userLeft.name,
            group.name,
            users.email
          );
        }
        const newNotification = new Notification({
          sender: req.user.id,
          receiver: [users._id],
          message: `${userLeft.name} left ${group.name} group.`,
          kind: 'left group',
          path: group._id
        });
        await newNotification.save();
      });
    res.send(group.members);
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Post not found.' });
    }
    res.status(500).send('Server error!');
  }
});

/***************************************************************************************************/

/*GET - DELETE - ADD - EDIT POSTS IN THE GROUPS*/
/***************************************************************************************************/

// @route   GET api/groups/:groupID/posts
// @desc    Get all the posts(with comments) in the particular group
// @access  Public
router.get('/:groupID/posts/:postID', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupID).populate(
      'posts.creator posts.comments.creator',
      'name avatar'
    );
    if (!group) {
      return res.status(404).json({ msg: 'Group not found.' });
    }
    const groupPost = group.posts.filter((post) => {
      return post._id.toString() === req.params.postID;
    });
    res.json(groupPost[0]);
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Group not found.' });
    }
    res.status(500).send('Server error!');
  }
});
//  @route   POST api/groups/:groupID/posts/
//  @desc    create a post in group
//  @access  Private
router.post(
  '/:groupID/posts',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('text', 'Text is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const group = await Group.findById(req.params.groupID);
      const user = await User.findById(req.user.id);
      // Check if the user is a member
      if (
        group.members.filter((member) => member.user.toString() === req.user.id)
          .length <= 0
      ) {
        return res.status(401).json({ msg: 'User not Authorized' });
      } else {
        const newPost = {
          title: req.body.title,
          creator: req.user.id,
          text: req.body.text,
          link: req.body.link || '',
          avatar: user.avatar,
          name: user.name,
          date: Date.now(),
          comments: []
        };
        group.posts.push(newPost);
        await group.save();

        /*
        Send email notifications
        1-first remove the sender from the group members.
        2-loop through The user schema to get the users info
        2-check the notifications prop if true then send the email notifications.
        */

        const personAddPost = user.name;
        group.members
          .filter((member) => member.user.toString() !== req.user.id)
          .forEach(async (user) => {
            const users = await User.findById(user.user);
            if (users.notifications) {
              addPostGroupNotification(
                users.name,
                personAddPost,
                group.name,
                users.email
              );
            }
            const newNotification = new Notification({
              sender: req.user.id,
              receiver: [users._id],
              message: `${personAddPost} add post in ${group.name} group`,
              kind: 'post in group',
              path: group._id
            });
            await newNotification.save();
          });
        res.send(group.posts);
      }
    } catch (error) {
      console.error(error.message);
      if (error.message.includes('Cast to ObjectId failed')) {
        return res.status(400).json({ msg: 'Group not found.' });
      }
      res.status(500).send('Server error!');
    }
  }
);

// // @route   PUT api/groups/:groupID/posts/:postID
// // @desc    update a post in group
// // @access  Private
router.put('/:groupID/posts/:postID', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupID);
    // Pull out post
    const post = group.posts.find((post) => post.id === req.params.postID);
    //  Make sure post exists
    if (!post) {
      return res.status(404).json({ msg: 'Post does not exist' });
    }
    // check if the current user is authorized
    if (post.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not Authorized' });
    }
    post.title = req.body.title;
    post.text = req.body.text;
    await group.save();
    res.send(post);
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Group not found.' });
    }
    res.status(500).send('Server error!');
  }
});

// // @route   DELETE api/groups/:groupID/posts/:postID
// // @desc    delete a post in group
// // @access  Private
router.delete('/:groupID/posts/:postID', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupID);
    // Pull out post
    const post = group.posts.find((post) => post.id === req.params.postID);
    //  Make sure post exists
    if (!post) {
      return res.status(404).json({ msg: 'Post does not exist' });
    }
    // check if the current user is authorized
    if (post.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not Authorized' });
    }
    // Get remove index
    const removeIndex = group.posts
      .map((post) => post.id.toString())
      .indexOf(req.params.postID);
    group.posts.splice(removeIndex, 1);

    await group.save();
    res.json(group.posts);
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Event not found.' });
    }
    res.status(500).send('Server error!');
  }
});

// // @route   PUT api/groups/:groupID/events
// // @desc    add an event to the group
// // @access  Private
router.put(
  '/:groupID/events',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('start', 'Start date is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const group = await Group.findById(req.params.groupID);
      const user = await User.findById(req.user.id);
      // Check if the user is a member
      if (
        group.members.filter((member) => member.user.toString() === req.user.id)
          .length <= 0
      ) {
        return res.status(401).json({ msg: 'User not Authorized' });
      } else {
        const newEvent = {
          title: req.body.title,
          creator: req.user.id,
          description: req.body.description,
          place:req.body.place,
          start: req.body.start,
          end: req.body.end
        };
        group.events.push(newEvent);
        await group.save();
        /*
        Send email notifications
        1-first remove the sender from the group members.
        2-loop through The user schema to get the users info
        2-check the notifications prop if true then send the email notifications.
        */
        const personAddEvent = user.name;
        group.members
          .filter((member) => member.user.toString() !== req.user.id)
          .forEach(async (user) => {
            const users = await User.findById(user.user);
            if (users.notifications) {
              addEventGroupNotification(
                users.name,
                personAddEvent,
                group.name,
                users.email,
                newEvent.start,
                newEvent.end,
                newEvent.title
              );
            }

            const newNotification = new Notification({
              sender: req.user.id,
              receiver: [users._id],
              message: `${personAddEvent} add an event in ${group.name} group`,
              kind: 'add event',
              path: group._id
            });
            await newNotification.save();
          });
        res.send(group.events);
      }
    } catch (error) {
      console.error(error.message);
      if (error.message.includes('Cast to ObjectId failed')) {
        return res.status(400).json({ msg: 'Group not found.' });
      }
      res.status(500).send('Server error!');
    }
  }
);

// // @route   PUT api/groups/:groupID/events/:eventID
// // @desc    delete an event in group
// // @access  Private
router.put('/:groupID/events/:eventID', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupID);
    // Pull out the event
    const event = group.events.find(
      (event) => event._id.toString() === req.params.eventID
    );
    //  Make sure post exists
    if (!event) {
      return res.status(404).json({ msg: 'Event does not exist' });
    }
    // check if the current user is authorized
    if (event.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not Authorized' });
    }
    // Get remove index
    const removeIndex = group.events
      .map((event) => event._id.toString())
      .indexOf(req.params.eventID);
    group.events.splice(removeIndex, 1);

    await group.save();
    res.json(group.events);
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Event not found.' });
    }
    res.status(500).send('Server error!');
  }
});

// /***************************************************************************************************/

// /*ADDING COMMENTS TO THE POSTS*/
// /***************************************************************************************************/

// // @route   PUT api/groups/:groupID/posts/:postID
// // @desc    Add a comment to the post
// // @access  Private
router.put(
  '/:groupID/posts/:postID/comments',
  [auth, [check('text', 'Text is required.').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const group = await Group.findById(req.params.groupID);
      // Pull out post
      const post = group.posts.find((post) => post.id === req.params.postID);
      //  Make sure post exists
      if (!post) {
        return res.status(404).json({ msg: 'Post does not exist' });
      }
      const currentUser = await User.findById(req.user.id);
      const newComment = {
        creator: req.user.id,
        text: req.body.text,
        date: Date.now(),
        name: currentUser.name,
        userId: req.user.id,
        avatar: currentUser.avatar
      };
      post.comments.push(newComment);
      await group.save();

      /*
        Send email notifications
        1-first remove the sender from the group members.
        2-loop through The user schema to get the users info
        2-check the notifications prop if true then send the email notifications.
        */

      group.members
        .filter((member) => member.user.toString() !== req.user.id)
        .forEach(async (user) => {
          const users = await User.findById(user.user);
          if (users.notifications) {
            addCommentGroupNotification(
              users.name,
              currentUser.name,
              group.name,
              users.email,
              post.title,
              newComment.text
            );
          }

          const newNotification = new Notification({
            sender: req.user.id,
            receiver: [users._id],
            message: `${currentUser.name} add a comment on ${post.title} in ${group.name} group`,
            kind: 'add comment post group',
            path: `${group._id}/posts/${post._id}`
          });
          await newNotification.save();
        });

      res.send(post.comments);
    } catch (error) {
      console.error(error.message);
      if (error.message.includes('Cast to ObjectId failed')) {
        return res.status(400).json({ msg: 'Post not found.' });
      }
      res.status(500).send('Server error');
    }
  }
);

// // @route   PUT api/groups/:groupID/posts/:postID/:commentID
// // @desc    Delete a comment from the post
// // @access  Private
router.put(
  '/:groupID/posts/:postID/comments/:commentID',
  auth,
  async (req, res) => {
    try {
      const group = await Group.findById(req.params.groupID);
      // Pull out post
      const post = group.posts.find((post) => post.id === req.params.postID);
      //  Make sure post exists
      if (!post) {
        return res.status(404).json({ msg: 'Post does not exist' });
      }

      // Get remove index
      const removeIndex = post.comments
        .map((comment) => comment._id.toString())
        .indexOf(req.params.commentID);
      // check if user is authorized to delete the comment
      if (post.comments[removeIndex].creator.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
      post.comments.splice(removeIndex, 1);
      await group.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/groups/:groupID/posts/:postID/emoji
// @desc    add emoji to a post
// @access  Private

router.put('/:groupID/posts/:postID/emoji', auth, async (req, res) => {
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

    const group = await Group.findById(req.params.groupID);
    const post = group.posts.find(
      (post) => post._id.toString() === req.params.postID
    );
    //  Make sure post exists
    if (!post) {
      return res.status(404).json({ msg: 'Post does not exist' });
    }
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

    await group.save();

    /*
        Send email notifications
        1-first remove the sender from the group members.
        2-loop through The user schema to get the users info
        2-check the notifications prop if true then send the email notifications.
        */
    const userAddEmoji = await User.findById(req.user.id);
    group.members
      .filter((member) => member.user.toString() !== req.user.id)
      .forEach(async (user) => {
        const users = await User.findById(user.user);
        if (users.notifications) {
          addEmojiPostGroupNotification(
            users.name,
            userAddEmoji.name,
            group.name,
            users.email,
            post.title
          );
        }

        const newNotification = new Notification({
          sender: req.user.id,
          receiver: [users._id],
          message: `${userAddEmoji.name} add a emoji to your ${post.title} post in ${group.name} group`,
          kind: 'add comment post group',
          path: `${group._id}/posts/${post._id}`
        });
        await newNotification.save();
      });
    res.json({
      emojis: emojis
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/groups/:groupID/posts/:postsID/:emojiID
// @desc    Remove emoji from a post
// @access  Private
router.put('/:groupID/posts/:postID/:emojiID', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupID);
    const emojiId = req.params.emojiID;
    //pull out post
    const post = group.posts.find(
      (post) => post._id.toString() === req.params.postID
    );
    //  Make sure post exists
    if (!post) {
      return res.status(404).json({ msg: 'Post does not exist' });
    }
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

    await group.save();
    res.json({
      emojis: post.emojis
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// /***************************************************************************************************/

module.exports = router;

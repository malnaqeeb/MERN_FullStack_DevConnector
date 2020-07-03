const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const cloudinary = require('cloudinary');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Posts');
const auth = require('../../middleware/auth');
const config = require('config');
const scret = config.get('jwtSecret');
const fileUpload = require('../../middleware/file-upload');
const { accountVerifyEmail } = require('../../emails/account');
// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required.').not().isEmpty(),
    check('email', 'Pleace include a valid email.').isEmail(),
    check(
      'password',
      'Pleace enter a password with 6 or more characters.'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists!' }] });
      }

      user = new User({
        name,
        email,
        avatar:
          '//www.gravatar.com/avatar/4f3488d24174fc7d950cfe39a72827c0?s=200&r=pg&d=mm',
        password
      });

      user.generateAccountVerify();
      // send email
      let link = 'https://dev-connector-hyf.herokuapp.com/' + 'confirm/' + user.verifyAccountToken;
      accountVerifyEmail(user.name, user.email, link);

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(payload, scret, { expiresIn: 36000 }, (error, token) => {
        if (error) throw error;
        if (!user.active) {
          return res
            .status(401)
            .json({ errors: [{ msg: 'Verify your account' }] });
        }

        res.json({ token });
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error!');
    }
  }
);

// @route   PATCH api/users
// @desc    Edit user name  and add avatar
// @access  Pivate
router.patch(
  '/',
  auth,
  check('name', 'Name is required'),
  fileUpload.single('avatar'),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findOne({ user: req.user.id });

      if (!user) {
        return res.status(404).json({ msg: 'Ther is not user' });
      }
      // Update user avatar
      if (req.file) {
        // Delete the old avatar from cloudinary by id
        if (user.avatar_id) {
          await cloudinary.uploader.destroy(user.avatar_id, () => {});
        }
        user.avatar = req.file.secure_url;
        user.avatar_id = req.file.public_id;
      } else if (
        req.body.notification == 'true' ||
        req.body.notification == 'false'
      ) {
        // change the Notifiction mode
        user.notifications = req.body.notification;
      } else {
        // Update user name
        user.name = req.body.name;
      }
      //Here I change the user avatar from his post
      if (post !== null) {
        post.name = user.name;
        post.avatar = user.avatar;

        await post.save();
      }
      await user.save();
      res.json(user);
    } catch (error) {
      console.error(error.message);
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ msg: error.message });
  }
);

router.put('/privacyoptions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const profile = await Profile.findOne({ user: req.user.id });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    (profile.visible = user.privacyOptions.profileVisibleEveryone =
      req.body.profileVisibleEveryone),
      (user.privacyOptions.messagesEveryone = req.body.messagesEveryone);

    await profile.save();
    await user.save();
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

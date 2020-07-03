const express = require('express');
const axios = require('axios');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Posts');
const Message = require('../../models/Message');

// @route   GET api/profile/me
// @desc    Get curent users profile
// @access  Privet
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user.' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error!');
  }
});
// @route   POST api/profile
// @desc    Create or update user profile
// @access  Privet

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required.').not().isEmpty(),
      check('skills', 'Skills is required.').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const user = await User.findById(req.user.id);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: erros.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook
    } = req.body;
    // Build Profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.name = user.name;
    visible = user.privacyOptions.profileVisibleEveryone;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }
    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      // Create Profile
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error!');
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find({
      visible: true
    }).populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error!');
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', [
      'name',
      'avatar',
      'friends',
      'privacyOptions'
    ]);
    let publicProfiles = [];
    profiles.forEach((profile) => {
      if (
        profile &&
        profile.user.privacyOptions.profileVisibleEveryone === true
      ) {
        publicProfiles.push(profile);
      }
    });
    let friendProfiles = [];
    profiles.forEach((profile) => {
      if (profile.user.friends.includes(req.user.id) || profile.user._id.toString()===req.user.id) {
        friendProfiles.push(profile);
      }
    });

    const profileArray = publicProfiles.concat(friendProfiles);
    const visibleProfiles = [...new Set(profileArray)]
    res.json(visibleProfiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error);
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    if (!profile) return res.status(400).json({ msg: 'Profile not found.' });
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('Cast to ObjectId failed')) {
      return res.status(400).json({ msg: 'Profile not found.' });
    }
    res.status(500).send('Server error!');
  }
});

// @route   DELETE api/profile
// @desc    Delete profiles, user, posts
// @access  Private

router.delete('/', auth, async (req, res) => {
  try {
    // Remove Posts
    await Post.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove messages by user
    await Message.findOneAndRemove({corresponder: req.user.id})
    //  Remove user
    await User.findOneAndRemove({ _id: req.user.id });
    // remove group created by user
    const userGroups = await Group.find({ creator: req.user.id });
    userGroups.forEach((group) => {
      group.posts = group.posts.filter(
        (post) => post.creator.toString() !== req.user.id
      );
      group.members = group.members.filter(
        (member) => member.user._id.toString() !== req.user.id
      );
      group.posts.forEach((post) => {
        post.comments = post.comments.filter(
          (comment) => comment.creator.toString() !== req.user.id
        );
      });
      group.save();
    });

    res.json({ msg: 'User deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error!');
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [check('title', 'Title is required.').not().isEmpty()],
    check('company', 'Company is required.').not().isEmpty(),
    check('from', 'From date is required.').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      from,
      location,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error!');
    }
  }
);
// @route   DELETE api/profile/experience/:exp_id
// @desc   Delete profile experience
// @access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error!');
  }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
  '/education',
  [
    auth,
    [check('school', 'School is required.').not().isEmpty()],
    check('degree', 'Degree is required.').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required.').not().isEmpty(),
    check('from', 'From date is required.').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      location,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      location,
      to,
      current,
      description
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error!');
    }
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc   Delete profile education
// @access  Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error!');
  }
});

// @route   GET api/profile/github/:username
// @desc    Get user's repos from GitHub
// @access  Public
router.get('/github/:username', async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('githubToken')}`
    };

    const gitHubResponse = await axios.get(uri, { headers });

    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: 'No Github profile found' });
  }
});

module.exports = router;

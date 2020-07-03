const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const Group = require('../../models/Groups');
const Post = require('../../models/Posts');

router.post('/profile', async (req, res) => {
  try {
    const q = req.body.query;
    if (!q) {
      return res.status(400).json({ msg: 'Query cannot be empty' });
    }
    let query = { name: { $regex: q, $options: 'i' } };
    let output = [];
    Profile.find(query)
      .populate('user')
      .limit(6)
      .then((usrs) => {
        if (usrs && usrs.length && usrs.length > 0) {
          usrs.forEach((user) => {
            let obj = {
              id: user.user._id,
              avatar: user.user.avatar,
              label: user.name,
              status: user.status
            };
            output.push(obj);
          });
        }
        res.json(output);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error!');
  }
});

router.post('/groups', async (req, res) => {
  try {
    const q = req.body.query;
    if (!q) {
      return res.status(400).json({ msg: 'Query cannot be empty' });
    }
    let query = { name: { $regex: q, $options: 'i' } };
    let output = [];
    await Group.find(query)
      .limit(6)
      .then((groups) => {
        if (groups && groups.length && groups.length > 0) {
          groups.forEach((group) => {
            let obj = {
              id: group._id.toString(),
              description: group.description,
              label: group.name,
              isPublic: group.isPublic
            };
            output.push(obj);
          });
        }
        res.json(output);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error!');
  }
});

router.post('/posts', (req, res) => {
  try {
    const q = req.body.query;
    if (!q) {
      return res.status(400).json({ msg: 'Query cannot be empty' });
    }
    let query = { text: { $regex: q, $options: 'i' } };
    let output = [];
    Post.find(query)
      .limit(6)
      .then((posts) => {
        if (posts && posts.length && posts.length > 0) {
          posts.forEach((post) => {
            let obj = {
              id: post._id,
              label: post.text,
              date: post.date,
              name: post.name
            };
            output.push(obj);
          });
        }
        res.json(output);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error!');
  }
});

module.exports = router;

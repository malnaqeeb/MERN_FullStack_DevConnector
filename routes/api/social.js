const express = require('express');
const passport = require('passport');
const router = express.Router();
const passportSetup = require('../../middleware/passport-setup')

const redirectOptions = {
  failureRedirect: 'https://dev-connector-hyf.herokuapp.com/',
  session: false,
};

const sendToken = (req, res) => {
  const token = req.user;
  res.redirect('https://dev-connector-hyf.herokuapp.com/login?token=' + token);
};
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);
router.get('/google/redirect', passport.authenticate('google', redirectOptions), (req, res) =>
  sendToken(req, res),
);
router.get('/github', passport.authenticate('github'));
router.get('/github/redirect', passport.authenticate('github', redirectOptions), (req, res) =>
  sendToken(req, res),
);
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
  })
);
router.get('/facebook/redirect', passport.authenticate('facebook', redirectOptions), (req, res) =>
  sendToken(req, res),
);

module.exports = router;
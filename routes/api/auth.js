const express = require('express');
const router = express.Router();
const config = require('config');
const scret = config.get('jwtSecret');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const {
  forgetPasswordEmail,
  resetPasswordEmail
} = require('../../emails/account');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { accountActivatedEmail } = require('../../emails/account');
// @route   GET api/auth
// @desc    Test route
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('myGroups._id')
      .select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth
// @desc    Authenticate & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Pleace include a valid email.').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials!' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials!' }] });
      }

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
      res.status(500).send('Server error!');
    }
  }
);
// get the token and check it with the user token and check the time to ensure that it still withen one hour
router.patch('/confirmation/:token', async (req, res) => {
  const user = await User.findOne({
    verifyAccountToken: req.params.token,
    verifyAccountExpires: { $gt: Date.now() }
  });

  try {
    if (!user) {
      return res.status(401).json({
        errors: [
          {
            msg:
              'Verify account token is invalid or has expired. Please sign up once again'
          }
        ]
      });
    }
    const payload = {
      user: {
        id: user.id
      }
    };
    jwt.sign(payload, scret, { expiresIn: 36000 }, (error, token) => {
      if (error) throw error;
      user.active = true;
      user.verifyAccountToken = undefined;
      user.verifyAccountExpires = undefined;
      accountActivatedEmail(user.name, user.email);
      user.save();
      res.json({ token });
    });
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
  res.status(201).json();
});
router.post(
  '/forgetpassword',
  check('email', 'Please include a valid email.').isEmail(),
  async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({ email });
    try {
      if (!user) {
        res.status(401).json({
          message: `The email address ${req.body.email} is not associated with any account. Double-check your email address and try again.`
        });
      }
      //Generate and set password reset token
      user.generatePasswordReset();
      // Save the updated user object
      user.save();
      // send email
      let link =
        'https://dev-connector-hyf.herokuapp.com/' +
        'resetpassword/?token=' +
        user.resetPasswordToken;

      forgetPasswordEmail(user.name, user.email, link);
      res.status(200).json({
        message: 'A reset e-mail has been sent to ' + user.email + '.'
      });
    } catch (error) {
      res.status(500).send('ServerError');
    }
  }
);

router.post(
  '/resetpassword/:token',
  check('password').isLength({ min: 6 }),
  async (req, res) => {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    try {
      if (!user) {
        res.status(404).send('User not found!');
      }
      if (req.body.password !== req.body.confirmPassword) {
        res
          .status(400)
          .send('The password and confirmation password do not match.');
      }
      //Set the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
      user.active = true;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      // Save
      user.save();
      // send email
      resetPasswordEmail(user.name, user.email);
      res.status(200).json({ message: 'Your password has been updated.' });
    } catch (error) {
      res.status(500).send('ServerError');
    }
  }
);
module.exports = router;

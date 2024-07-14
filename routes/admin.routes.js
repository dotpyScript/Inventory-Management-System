const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/user.schema');
const passport = require('passport');

const router = express.Router();

// Registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Register Route
router.post(
  '/register',
  [
    check('firstName', 'First name is required').notEmpty(),
    check('lastName', 'Last name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number should be at least 5 characters').isLength({
      min: 5,
    }),
    check('password', 'Password should be at least 6 characters').isLength({
      min: 6,
    }),
    check('confirmPassword', 'Passwords do not match').custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash(
        'error_msg',
        errors.array().map(error => error.msg)
      );
      return res.redirect('/register');
    }

    const { firstName, lastName, email, phone, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        req.flash('error_msg', 'User already exists');
        return res.redirect('/register');
      }

      const newUser = new User({ firstName, lastName, email, phone, password });
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
      await newUser.save();

      req.flash('success_msg', 'You are now registered and can log in');
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server error');
      res.redirect('/register');
    }
  }
);

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Login Route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

// initialize router to express
const { ensureAuthenticated } = require('../passport/authenticated');

// homepage
router.get('/index', ensureAuthenticated, async (req, res) => {
  res.render('index', {
    name: req.user.firstName,
  });
});

module.exports = router;

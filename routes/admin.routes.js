const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user.schema');
const Role = require('../models/role.schema');

const router = express.Router();

// registration page
// description: Get Request
router.get('/register', (req, res) => {
  res.render('register');
});

// Registration page
// Description: POST request

router.post('/register', async function (req, res) {
  const { firstName, lastName, email, phone, password, confirmPassword } =
    req.body;
  let errors = [];
  const data = {
    errors,
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
  };

  // check required fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword
  ) {
    errors.push({ msg: 'please fill in all field' });
  }

  // check for password
  if (password !== confirmPassword) {
    errors.push({ msg: 'password do not match' });
  }

  // check if its atleast 6 characters
  if (password < 5) {
    errors.push({ msg: 'phone should be atleast 5 characters' });
  }

  // check if its atleast 6 characters
  if (password < 5) {
    errors.push({ msg: 'password should be atleast 5 characters' });
  }

  if (errors.length > 0) {
    res.render('register', data);
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'User exist' });
        res.render('register', data);
      } else {
        const newUser = new User({
          firstName,
          lastName,
          email,
          phone,
          password,
          confirmPassword,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            // check for error
            if (err) throw new err();
            // set password to hash
            newUser.password = hash;
            // save new user
            newUser
              .save()
              .then(() => {
                req.flash(
                  'success_msg',
                  'you are now registerd and can now login'
                );
                res.redirect('/users/login');
              })
              .catch(err => {
                console.log(err);
              });
          });
        });
      }
    });
  }
});

module.exports = router;

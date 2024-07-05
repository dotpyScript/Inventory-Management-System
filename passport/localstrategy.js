const localstrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user.schema');

module.exports = async function (passport) {
  passport.use(
    new localstrategy(
      {
        usernameField: 'email',
      },
      async function (email, password, done) {
        // Find User in the Database
        await User.findOne({ email: email })
          .then(user => {
            if (!user) {
              return done(null, false, {
                message: 'Email is not registered',
              });
            }
            // compare hash password with plain text password
            bcrypt.compare(password, user.password, (err, ismatch) => {
              if (err) {
                throw err;
              }
              if (ismatch) {
                return done(null, user);
              } else {
                return done(null, false, {
                  message: 'Incorrect email or Password',
                });
              }
            });
          })
          .catch(err => {
            console.error(err);
          });
      }
    )
  );

  // serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

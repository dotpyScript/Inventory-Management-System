const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const path = require('path');

require('./passport/localstrategy')(passport);

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect('mongodb://127.0.0.1:27017/registrationDB')
  .then(() => console.log('Successfully Connected'))
  .catch(err => {
    console.error(`Failed to connect: ${err}`);
    process.exit(1);
  });

// Express session middleware
app.use(
  session({
    secret: 'myComplexAndRandomSecretKey123!',
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Router middleware
const productRoutes = require('./routes/product.route');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');

app.use('/users', productRoutes);
app.use('/', adminRoutes);
app.use('/users', userRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

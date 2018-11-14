var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const db = require('./config/keys');
const passport = require('passport');
const Sentry = require('@sentry/node');

var profileRouter = require('./routes/profile');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');

var app = express();

Sentry.init({ dsn: 'https://34411398f2f6443c9a84fce1306e1aee@sentry.io/1322500' });
//mongo connect
mongoose.connect(db.mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

app.use(Sentry.Handlers.errorHandler());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/profile', profileRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

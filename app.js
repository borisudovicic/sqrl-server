var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var dotenv = require('dotenv').config();
var session = require('express-session');
var passport = require('passport');
var cors = require('cors')
const rateLimit = require("express-rate-limit");
require('./scripts/passportIndex.js'); //i think this just forces this code to run
// var sslRedirect = require('heroku-ssl-redirect'); //it only runs if enviornment=production

var app = express();

// app.use(favicon(path.join(__dirname, './', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/build')));
app.use(session({
  store: new(require('connect-pg-simple')(session))(),
  secret: process.env.SESSION_SECRET, //use a real secret
  resave: false, //resave means update whenever page is reloaded even if theres no changes made to it
  saveUninitialized: false, //false means only make sessions when user logs in, not on any page visit
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
  //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
// app.use(sslRedirect());

// ------ rate limits ------
let rateMessage = {
  status: 'failed',
  message: 'You made too many requests to the server. Please wait 15 minutes and try again.'
}
app.use(rateLimit({ // applies to all routes
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: rateMessage
}));
app.use("/login", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: rateMessage
}));
app.use("/textlink", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: rateMessage
}));
app.use("/invitestudent", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 7,
  message: rateMessage
}));

//--------ROUTES--------------
app.use('/', require('./routes/index')); 
app.use('/acceptFeedback', require('./routes/communication/acceptFeedback'));
app.use('/textlink', require('./routes/communication/textlink'));
app.use('/reportuser', require('./routes/communication/reportUser'));
app.use('/contact', require('./routes/communication/contact'));
app.use('/acceptform', require('./routes/communication/acceptform'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/getuser', require('./routes/getUser'));
app.use('/changeprofile', require('./routes/changeProfile'));
app.use('/profile', require('./routes/profile'));
app.use('/groups', require('./routes/groups'));
app.use('/classes', require('./routes/classes'));
app.use('/directmessage', require('./routes/directmessage'));
app.use('/search', require('./routes/search'));
app.use('/invitestudent', require('./routes/communication/invitestudent'));

// app.use('/chatimage', require('./routes/chatimage'));
// app.use('/', require('./routes/'));


app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/build/index.html")
})

//we handle 404s in react router

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.error('ERROR: '+err.message);
  console.error(err.stack.length>600 ? err.stack.substring(0,600)+'...' : err.stack);

  // // render the error
  // res.status(err.status || 500);
  // res.send({status: 'error'});
});

module.exports = app;

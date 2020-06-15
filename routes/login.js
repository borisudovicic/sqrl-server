
// object returned from class scripts should look like:
// {
//   status: "success", 
//   message: 'Success!', 
//   classList: [
//     {
//       name: Intro to Math, 
//       id: classidgoeshere, 
//       type: 'class', 
//       disabled: false, 
//       professorEmail: profEmail,
//       professorName: profName
//     },
//   ], 
//   fullName: 'Dean Barker'
// }

var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var dotenv = require('dotenv').config();
var path = require('path');
const url = require('url');
var models = require('../models/index');
var passport = require('passport');
var filterUser = require('../scripts/filterUser')
var validateClassList = require('../scripts/validateClassList');
var formatLoginUsername = require('../scripts/formatLoginUsername');
var testClassInfo = require('../class-scripts/test_classes/test_classes');
const saltRounds=10;
var bcrypt = require('bcryptjs');
var getUserGroups = require('../scripts/getUserGroups'); 
var nodemailer = require('nodemailer');
let getSchoolName = require('../scripts/getSchoolName');

const testers = ['agates10@kent.edu', 'budovici@kent.edu', 'dbarker8@kent.edu'];

function randomColor() {
  //every user gets a random color incase they dont have a profile pic
  const colorList = [Math.floor(Math.random() * 254), Math.floor(Math.random() * 254), Math.floor(Math.random() * 254)];
  return "rgba(" + colorList[0] + "," + colorList[1] + "," + colorList[2] + ", .7)";
}

router.post('/', function (req, res, next) {
  let email = req.body.email.toLowerCase();
  let password = req.body.password;

  models.User.findOne({
    where: { email: email }
  }).then(account => {
    if (account) {
      if (account.status == 'disabled')
        return res.send({ status: 'failed', message: 'Your account has been disabled. Please contact Sqrl for more information.' });

      //user exists! verify password is correct
      if (account.password) { //log in normalls
        passport.authenticate('local1', function (err, user, info) {
          if (err) { console.log(err); return next(err); }
          if (!user) { return res.send({ status: 'failed', message: info.message }); }
          req.logIn(user, function (err) {
            if (err) { console.log(err); return next(err); }
            console.log('login success!');
            getUserGroups(account.id).then(chatlist => {
              return res.send({ status: 'success', user: filterUser(account), chatlist: chatlist });
            })
          });
        })(req, res, next);

      } else { // this means its one of our OG users. user needs to make a password then sign in
        res.send({ status: 'failed', message: 'Please create an account before logging in' })
      }
    } else { //user doesnt exist. they need to make an acct first...
      res.send({ status: 'failed', message: 'User ' + email + ' does not exist. Please create an account' });
    }
  })

});


router.post('/create', function (req, res, next) {
  //register for account
  let email = req.body.email.toLowerCase().trim();
  let defaultName = email.split('@')[0];
  let password = req.body.password;
  let school = getSchoolName(email);

  models.User.findOne({
    where: {email: email}
  }).then(user => {
    if(user){
      if(!user.password){
        //this is someone invited that has groups already added for them
        bcrypt.hash(password, saltRounds, function (err, hash) {
          user.updateAttributes({
            password: hash,
            schoolName: school,
            sqrlNotes: user.sqrlNotes+req.body.notes || '',  
            name: defaultName,
            schoolName: school,
            realName: '',
            classList: '[]',
            major: '',
            sqrlNotes: req.body.notes || '',
            color: randomColor()       
          }).then((newUser) => {
            //new password created! now auth them and theyre in.
            //should be confirming the email here instead of letting anyone use anyopnes email TODO
            passport.authenticate('local1', function (err, user, info) {
              if (err) { console.log(err); return next(err); }
              if (!user) { return res.send({ status: 'failed', message: info.message }); }
              req.logIn(user, function (err) {
                if (err) { console.log(err); return next(err); }
                console.log('Creation + login success!');
                getUserGroups(user.id).then(chatlist => {
                  return res.send({ status: 'success', user: filterUser(user), chatlist: chatlist });
                })
              });
            })(req, res, next);
          })
        })
      }else{
        res.send({status: 'failed', message: 'This account already exists! Please log in. \nIf you forgot your password, or believe this is an error, please select "login help" below to reset your password.'})
      }
    }else{
      //brand new user! make them an acct
      if(!email.includes('.edu')) return res.send({status: 'failed', message: 'Please use a valid .edu email address'});
      bcrypt.hash(password, saltRounds, function (err, hash) {
        models.User.create({
          email: email,
          password: hash,
          name: defaultName,
          schoolName: school,
          realName: '',
          classList: '[]',
          major: '',
          sqrlNotes: req.body.notes || '',
          color: randomColor()
        }).then((user2) => {
          //user created in db! now authenticate + send response
            passport.authenticate('local1', function (err, user, info) {
              if (err) { console.log(err); return next(err); }
              if (!user) { return res.send({ status: 'failed', message: info.message }); }
              req.logIn(user, function (err) {
                if (err) { console.log(err); return next(err); }
                console.log('Creation + login success!');
                getUserGroups(user.id).then(chatlist => {
                  return res.send({ status: 'success', user: filterUser(user), chatlist: chatlist });
                })
              });
            })(req, res, next);
        });

      })

    }
  })

});

router.post('/resetpassword', function (req, res, next) {
  //maybe make sessions unique so that someone gets kicked out when a new person logs in? or make this function also log out the person with that email
  let tempPass = '';
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 8; i++)
    tempPass += possible.charAt(Math.floor(Math.random() * possible.length));

  let messageString = 'You recently requested a new password for your Sqrl account. Your temporary password is  '+tempPass+' \n\nhttps://www.sqrl.chat' ;
  var mailOptions = {
    from: 'mailbot@sqrl.chat',
    to: req.body.email,
    subject: 'Password Change',
    text: messageString,
  };

  var transporter = nodemailer.createTransport({
      host: 'mail.sqrl.chat',
      post: 587,
      secure: false,
      auth: {
          user: 'mailbot@sqrl.chat',
          pass: process.env.MAILBOT_PASSWORD,
      },
      tls: {
          rejectUnauthorized: false,
      }
  });

  models.User.findOne({
      where: { email: req.body.email }
  }).then(User => {
      if(User){
          bcrypt.hash(tempPass, saltRounds, function (err, hash) {
              User.updateAttributes({
                  password: hash,
              }).then(function () {
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                          console.log(error);
                          res.send({status: 'failed', message:"an error has occoured"});
                    } else {
                        res.send({ status: 'success', message: 'Temporary password has been sent to ' + req.body.email });
                    }
                  }); 
              })
          });
      }else{
          res.send({status: 'failed', message: 'Could not find user: '+req.body.email});
      }
  });

})

module.exports = router;


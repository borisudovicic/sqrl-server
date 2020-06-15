var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer'); 
var dotenv = require('dotenv').config();
var path = require('path');
const url = require('url');

router.post('/', function(req, res, next) {

	var transporter = nodemailer.createTransport({
	  host: 'mail.sqrl.chat',
	  post: 587,
	  secure: false,
	  auth: {
	    user: 'mailbot@sqrl.chat',
	    pass: process.env.MAILBOT_PASSWORD,
	  },
	  tls:{
	  	rejectUnauthorized: false,
	  }
	});

	let messageString = 'App feedback\n' + '\nname: ' +req.body.name + '\nemail: ' +req.body.email+ '\nmessage: ' +req.body.message;

	var mailOptions = {
	  from: 'mailbot@sqrl.chat',
	  to: 'info@sqrl.chat',
	  subject: 'Sqrl App Feedback',
	  text: messageString,
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
			console.log(error);
			res.send({submitted: false})
	  } else {
	    console.log('Email sent: ' + info.response);
			res.send({submitted: true});
	  }
	}); 


});

module.exports = router;
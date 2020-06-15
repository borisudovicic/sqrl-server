var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var dotenv = require('dotenv').config();
var path = require('path');
const url = require('url');
var models = require('../../models/index');
var authenticate = require('../auth/authenticate');

var getEmailTemplate = require('./email_template');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;
const twilioClient = require('twilio')(accountSid, authToken);

const androidLink ='https://play.google.com/store/apps/details?id=com.sqrl';
const iosLink ='https://itunes.apple.com/us/app/sqrl-chat/id1350589058';


router.post('/text', authenticate.check(), function(req, res, next) {
    let group_name = req.body.group_name;
    let number = req.body.phonenumber;
    let messageString = req.user.email+' ('+req.user.name+') '+' invited you to join their group on Sqrl: '+group_name+' \n\nGet the app and join in! at https://www.sqrl.chat/download';

	twilioClient.messages.create({
	    to: '+1' + number,
	    from: twilioNumber,
	    body: messageString,
	}).then(() => {
		res.send({status: 'success'});
	})
	.catch(function(err) {
      console.error(err);
    });
});


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

router.post('/email', authenticate.check(), function (req, res, next) {
  let send_to = req.body.send_to.toLowerCase().trim();
  let group_name = req.body.group_name;
  let groupId = req.body.groupId;
  
    // let messageString = req.user.email+' ('+req.user.name+') '+' invited you to join their group on Sqrl: '+group_name+' \n\nGet the app and join in! at https://www.sqrl.chat/download';

    var mailOptions = {
        from: 'mailbot@sqrl.chat',
        to: send_to,
        subject: req.user.name+' invited you to join '+group_name,
        // text: messageString,
        html: getEmailTemplate(req.user.name+' ('+req.user.email+')', group_name)
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(500);
            res.send({status: 'failed'});
        } else {
            console.log('Email sent: ' + info.response);
            res.send({status: 'success'});
            // add user to group so when they log in its there
            if(groupId){
                models.User.findOne({
                    where:{
                        email: send_to
                    }
                }).then(existing => {
                    if(!existing){
                        models.User.create({
                            email: send_to
                        }).then(newUser => {
                            models.UserGroup.create({
                                UserId: newUser.id,
                                GroupId: groupId
                            })
                        })
                    }else{
                        //user invited to multiple groups before logging in
                        models.UserGroup.create({
                            UserId: existing.id,
                            GroupId: groupId
                        })
                    }
                })
            }
        }
    });
});



module.exports = router;

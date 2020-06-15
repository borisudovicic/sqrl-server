var express = require('express');
var router = express.Router();
var path = require('path');
const url = require('url');
var models = require('../models/index');    
var authenticate = require('./auth/authenticate');

router.post('/get', authenticate.check(), function (req, res, next) {
  if(req.body.email){
    models.User.findOne({
      where: {email: req.body.email}
    }).then(the_user => {
      if(the_user){
        if(the_user.accountActive){
          res.send({status: 'success', user: {
            nickname: the_user.name,
            email: the_user.email,
            avatarUrl: the_user.avatarUrl ? the_user.avatarUrl : '',
            major: the_user.major,
            bio: the_user.bio,
            id: the_user.id
          }})
        }else{
          res.send({status: 'failed', message: 'Sorry, this user does not exist, or is inactive.'});
        }
      }else{
        res.send({status: 'failed', message: 'Cannot find user with email address: '+req.body.email})
      }
    })
  }else if(req.body.userId){
    //more efficent ? 
  }
});



module.exports = router;

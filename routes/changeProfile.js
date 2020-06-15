var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var dotenv = require('dotenv').config();
var path = require('path');
const url = require('url');
var models = require('../models/index');    
var authenticate = require('./auth/authenticate');

router.post('/', authenticate.check(), function (req, res, next) {
    if(req.user){
      models.User.findById(req.user.id).then(user => {
        if(user){
          
          if(req.body.newName) user.updateAttributes({name: req.body.newName});
          if(req.body.imageUrl) user.updateAttributes({avatarUrl: req.body.imageUrl});
          if(req.body.major) user.updateAttributes({major: req.body.major});
          if(req.body.bio) user.updateAttributes({bio: req.body.bio});
            
          res.send({status: 'success', message: 'Succesfully updated profile info.'});
        }else{
          res.status(401);
          res.send({status: 'failed', message: 'account not found for user'})
        }
      })
    }else{
      res.status(401);
      res.send({status: 'failed', message: 'Cannot modify profile. User not found, or not logged in.'});
    }
});



module.exports = router;

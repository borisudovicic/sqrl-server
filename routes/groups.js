var express = require('express');
var router = express.Router();
var authenticate = require('./auth/authenticate');
var models = require('../models/index');   
var shortid = require('shortid'); 
var sqlstring = require('sqlstring');
var getSchoolName = require('../scripts/getSchoolName');


router.post('/new', authenticate.check(), function(req, res, next) {
  // user creates a new group
  let school = getSchoolName(req.user);
  models.Group.create({
    name: req.body.name.trim(),
    isPublic: req.body.isPublic,
    pubnubChatID: shortid.generate(),
    school: school
  }).then(group => {
    models.UserGroup.create({ //the group creator
      UserId: req.user.id,
      GroupId: group.id
    }).then(() => {
      res.send({status: 'success', group: group});
    })
    if(req.body.members){
      req.body.members.forEach(member => {
        models.UserGroup.create({
          UserId: member.id,
          GroupId: group.id
        })
      })
    }
  })

    // res.send({status: 'success', group: {
    //   name: 'asd',
    //   id: 22,
    //   groupid:99
    // }});

});

router.get('/leavegroup/:groupid', authenticate.check(), function(req, res, next) {
  //a user leaves a group
  models.UserGroup.destroy({ 
    where: {UserId: req.user.id, GroupId: req.params.groupid}
  }).then(() => {
    res.send({status: 'success'});
  })
});

router.get('/joingroup/:groupid', authenticate.check(), function(req, res, next) {
  //a user joins an existing public group
  models.Group.findOne({
    where: {isPublic: true, id: req.params.groupid}
  }).then(group => {
    if(group){
      models.UserGroup.findOne({
        where: {UserId: req.user.id, GroupId: req.params.groupid}
      }).then(exists => {
        if(!exists){
          models.UserGroup.create({
            UserId: req.user.id,
            GroupId: req.params.groupid
          }).then(() => {
            res.send({status: 'success', group: group});
          })
        }else{
          return res.send({status: 'failed', message: 'You are already in this group'});
        }
      })
    }else{
      res.send({status: 'failed', message: 'Could not find that group'});
    }
  })
});

router.post('/addusers', authenticate.check(), function(req, res, next) {
//a user part of a private group adds an outsider in
  models.UserGroup.findOne({//make sure the person sending request is in the group and can add them
    where: {
      GroupId: req.body.groupId,
      UserId: req.user.id
    }
  }).then(usergroup => {
    if(usergroup){
      //user is authorized, lets add the new people
      let status='success';
      let message = '';
      req.body.newUsers.forEach(newUser => {
        models.UserGroup.findOne({
          where: {UserId: newUser.id, GroupId: req.body.groupId}
        }).then(exists => {
          if(!exists){
            models.UserGroup.create({
              UserId: newUser.id,
              GroupId: req.body.groupId
            })
          }else{
            //dont add user
            status='failed';
            message='Some of the users are already in this group'
          }
        })
      })
      res.send({status: status, message: message});
    }else{
      return res.send({status: 'failed', message: 'You are not authorized to add someone to that group'});
    }
  })
});

router.post('/setavatar', authenticate.check(), function(req, res, next) {
//a user changes the avatar for a given group
  models.UserGroup.findOne({
    where: {
      UserId: req.user.id,
      GroupId: req.body.groupId
    }
  }).then(usergroup => {
    if(usergroup){
      models.Group.findById(req.body.groupId).then(group => {
        if(group){
          group.updateAttributes({
            avatarUrl: req.body.avatarUrl
          }).then(() => {
            res.send({status: 'success'});
          })
        }else{
          return res.send({status: 'failed', message: 'could not find that group'});
        }
      })
    }else{
      return res.send({status: 'failed', message: 'you are not authorized to change this groups avatar'});
    }
  })
});

router.get('/getmembers/:groupid', authenticate.check(), function(req, res, next) {
  models.Group.findById(req.params.groupid).then(group => {
    if(group){
      models.UserGroup.findOne({
        where: {
          UserId: req.user.id,
          GroupId: req.params.groupid
        }
      }).then(user_in_group => {
        //if private group, check to make sure the requester is in the group first
        if(group.isPublic==false && !user_in_group) return res.send({status: 'failed', message: 'You are not authorized to view this groups members'});
        models.UserGroup.findAll({
          where: {GroupId: req.params.groupid},
          attributes: [],
          include: {
            model: models.User,
            attributes: ['name', 'email', 'id', 'avatarUrl'],
            where: {
              schoolName: getSchoolName(req.user) // prevent email invited users from showing up that havent logged in to that acct yet
            }
          }
        }).then(members => {
          return res.send({status: 'success', members: members});
        })
      })   
    }else{
      return res.send({status: 'failed', message: 'Could not find that group'});
    }
  })
});

module.exports = router;
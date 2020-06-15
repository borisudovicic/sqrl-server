var express = require('express');
var router = express.Router();
var authenticate = require('./auth/authenticate');

//DMs will just be private groups with 2 people

router.post('/new', authenticate.check(), function(req, res, next) {
  //this route wants req.body to look like: 
  // {
  //   targetUserId: 1443,
  //   pubnubChatID: 'dm-1332-1443'  
  // }
  models.UserGroup.findOne({
    where: {UserId: req.body.targetUserId}
  }).then(existingDM => {
    if(existingDM){
      if(existingDM.blocked==true){
        // tell the user they got blocked by this person in a nice / not obvious way
        return res.send({status: 'error', message: 'Cannot process message to this user'});
      }
      return res.send({status: 'success', message: 'This direct message group already exists'});
    }else{
      //create the new DM!
      models.Group.create({
        name: '',
        isDirectMessage: true,
        pubnubChatID: req.body.pubnubChatID
      }).then(dmGroup => {
        //make users group
        models.UserGroup.create({
          UserId: req.user.id,
          GroupId:dmGroup.id
        })
        //add their target to group
        models.UserGroup.create({
          UserId:  req.body.targetUserId,
          GroupId: dmGroup.id
        })
      })
    }
  })
  
  //user has initiated a DM with another person
  //check to see if they have blocked eachother here. create a usergroup that has status:BLOCKED
});

router.post('/blockuser', authenticate.check(), function(req, res, next) {
  //do this by email address

});


module.exports = router;
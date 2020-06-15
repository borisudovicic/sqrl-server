var express = require("express");
var router = express.Router();
var authenticate = require("./auth/authenticate");
var models = require("../models/index");
var shortid = require("shortid");
var sqlstring = require("sqlstring");
const Op = models.sequelize.Op;
var getSchoolName = require("../scripts/getSchoolName");

router.get("/all", authenticate.check(), function(req, res, next) {
  let schoolName = getSchoolName(req.user);
  models.Group.findAll({
    where: {
      groupType: "class",
      school: schoolName
    }
  }).then(theclasses => {
    if (theclasses) {
      let classes = [];
      theclasses.forEach(item => {

        //convert times to hh:mm
        let st = item.startTime ? item.startTime : '';
        let sh = parseInt(st.slice(0,2));
        sh = sh>12 ? sh-12 : sh;
        let sm = st.slice(3,5);
        let startTime = `${sh}:${sm}`;
        if(st == '') startTime = '';

        let et = item.endTime ? item.endTime : '';
        let eh = parseInt(et.slice(0,2));
        eh = eh>12 ? eh-12 : eh;
        let em = et.slice(3,5);
        let endTime = `${eh}:${em}`;
        if(et == '') endTime = '';


        classes.push({
          name: item.name,
          id: item.id,
          startTime: startTime,
          startTimeSort: st,
          endTime: endTime,
          days: item.daysOfWeek,
          professorName: item.professorName,
          section: item.section
        });
      });
      res.send({ status: "success", classes: classes });
    } else {
      res.send({ status: "success", classes: [] });
    }
  });
});

router.get("/join/:classid", authenticate.check(), function(req, res, next) {
  //a user joins a school class
  let classid = req.params.classid;
  if (!classid)
    return res.send({
      status: "failed",
      message: "You did not specify a classid"
    });

  models.Group.findOne({
    where: {
      groupType: "class",
      id: req.params.classid
    }
  }).then(theclass => {
    if (theclass) {
      models.UserGroup.findOne({
        where: { UserId: req.user.id, GroupId: classid }
      }).then(exists => {
        if (!exists) {
          models.UserGroup.create({
            UserId: req.user.id,
            GroupId: classid
          }).then(() => {
            res.send({ status: "success", classInfo: theclass });
          });
        } else {
          return res.send({
            status: "failed",
            message: "You are already in this group"
          });
        }
      });
    } else {
      res.send({ status: "failed", message: "Could not find that class" });
    }
  });
});

module.exports = router;

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  req.logout();
  res.send({status: 'success'});
})

module.exports = router;

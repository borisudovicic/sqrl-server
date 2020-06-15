var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
   res.sendFile('/index'); //i dont think this even does anything, it automaticalyl is sending the index from the /public folder... because we set it in app.js
});

module.exports = router;

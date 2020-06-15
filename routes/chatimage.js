///NOT USING THIS ROUTE RIGHT NOW dean 3/13/2018


var express = require('express');
var router = express.Router();
var dotenv = require('dotenv').config();
var path = require('path');
const url = require('url');
const aws = require('aws-sdk');

router.post('/getsignedurl', function (req, res, next) {
  const s3 = new aws.S3();
  const fileName = req.body.filename;
  const fileType = req.body.filetype;
  const s3Params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.status(400).end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });

});

module.exports = router;

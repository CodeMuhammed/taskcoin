var express = require('express');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

module.exports = function(dbResource){
    console.log('/questioneer loaded');

    router.route('/')
      .get(function(req , res){
           res.status(200).send('questioneer get called');
      });
   //
   return router;
}

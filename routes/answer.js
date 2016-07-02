var express = require('express');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

module.exports = function(dbResource){
    console.log('/answer loaded');

    router.route('/')
      .get(function(req , res){
           res.status(200).send('answer get called');
      })

      //
      .post(function(req , res){
           res.status(200).send('987674667');
      });
   //
   return router;//
}

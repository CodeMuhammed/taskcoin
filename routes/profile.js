var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

module.exports = function(dbResource){
    var Users = dbResource.model('Users');

    //
    router.route('/')
        .get(function(req , res){
             console.log(req.user);
             res.status(200).send(req.user);
        });

    return router;
}

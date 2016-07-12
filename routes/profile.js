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
        })
        .put(function(req , res){
            console.log(req.body);
            req.body._id = ObjectId(req.body._id);
            Users.update({_id:req.body._id} , req.body , function(err , stats){
                if(err){
                   console.log(err);
                   res.status(500).send('Err creating updating user');
                }
                else{
                  res.status(200).send('User updated succcessfully');
                }
           });
        });

    return router;
}

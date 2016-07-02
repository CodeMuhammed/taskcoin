var express = require('express');
var request = require('request');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

module.exports = function(dbResource){
   console.log('/survey loaded');
   request.post({url:'http://localhost:5001/questioneer', form: {key:'value'}}, function(err,httpResponse,body){
       if(err){
           console.log(err);
       }
       console.log(body);
   });
   
   //define data schemas
   var Surveys = dbResource.model('Surveys');

   router.route('/')
      //
      .get(function(req , res){
           console.log(req.query);
           //construct query from query
           var query = {}; //getAll surveys in the database
           if(req.query.creator){
                query = {creator:req.query.creator}; // All sureveys by a particular user
           }

           //
           Surveys.find(query).toArray(function(err , results){
               if(err){
                   res.status(500).send(err);
               }
               else{
                  res.status(200).send(results);
               }
           });
      })

      //
      .post(function(req , res){
           //Mock out questioneerId and answersId in survey object for now
           req.body.questioneerId = '1234567898';
           req.body.answerId = '876543232';

           function saveSurvey(){
               //construct query
               var query = {'_':'_'}; //look for non-existent entity: good for creation of database
               if(req.body._id){
                   req.body._id = ObjectId(req.body._id);
                   query = {_id:req.body._id};
               }

               //
               Surveys.update(query, req.body , {upsert:true} , function(err , stats){
                   if(err){
                       res.status(500).send(err);
                   }
                   else{
                      if(stats.result.upserted){
                          req.body._id = stats.result.upserted[0]._id;
                      }
                      res.status(200).send(req.body);
                   }
               });
           }

      });

   //
   return router;
}

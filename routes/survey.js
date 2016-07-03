var express = require('express');
var request = require('request');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

module.exports = function(dbResource , questioneerApi , answerApi){
   console.log('/survey loaded');

   //define data schemas
   var Surveys = dbResource.model('Surveys');

   router.route('/')
      //
      .get(function(req , res){
           console.log(req.query);
           //construct query from query
           var query;
           if(req.query.creator){
                query = {creator:req.query.creator}; // All sureveys by a particular user
           }
           else{
                query = {'_':'_'}; // query to search for nothing when no creator is provided
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
           if(!req.body._id){
               //Create a new questioneer and answer documents for this survey Obj
               questioneerApi.post(null , req.body.creator , function(err , data){
                   if(err){
                       res.status(500).send('Could not create survey questioneer');
                   }
                   else{
                       req.body.questioneerId = data._id;
                       console.log(data);
                       answerApi.post(null , req.body.creator , function(err , data){
                           if(err){
                               res.status(500).send('Could not create survey answers');
                           }
                           else{
                               req.body.answerId = data._id;
                               console.log(data);
                               saveSurvey();
                           }
                       });
                   }
               });
           }
           else{
             saveSurvey();
           }

           function saveSurvey(){
               //construct query
               var query = {'_':'_'}; //look for non-existent entity: good for creation of database
               if(req.body._id){
                   req.body._id = ObjectId(req.body._id);
                   query = {_id:req.body._id};
                   req.body.modified = Date.now();
               }
               else{
                   req.body.created = Date.now();
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
                      console.log(req.body);
                      res.status(200).send(req.body);
                   }
               });
           }
      });

      //
      router.route('/preview')
         .post(function(req , res){
              console.log(req.body.user);

              //Transform the array of ids to mongoDB $OId's
              var served = req.body.served;
              for(var i=0; i<served.length; i++){
                  served[i] = ObjectId(served[i]);
              }

              //Get a survey that passes the following criteria
              //1.Not already served in this session
              //2.Not already answered by this user
              Surveys.findOne(
                  {
                   _id : {
                      "$nin":served
                    },
                    respondents : {
                       "$nin":req.body.user
                    }
                  },
                  {
                     title:1,
                     description:1,
                     questioneerId:1,
                     answerId:1,
                     responses:1
                  } , function(err , result ){
                  if(err){
                      res.status(500).send('Unable to get preview data');
                  }
                  else{
                      if(!result){
                          res.status(400).send('Sorry no more survey available');
                      }
                      else{
                          res.status(200).send(result);
                      }
                  }
              });
         });

   //
   return router;
}

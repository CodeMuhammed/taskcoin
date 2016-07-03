var express = require('express');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

module.exports = function(dbResource){
    console.log('/answer loaded');

    //define data schemas
    var Answers = dbResource.model('Answers');

    //Exposes this api to other local modules
    var api = {
      post : function(data , creator , callback){
          var answerSchema = {
              creator : creator,
              created : Date.now(),
              modified: Date.now(),
              answers:[],
          };

          //
          var query;
          if(creator){//POST like operation
              var query = {'_':'_'}; //non existent query
              data = answerSchema;
          }
          else{//PUT like operation
              query= {_id:ObjectId(data._id)}; //specific when we are updating old data
          }

          //
          Answers.update(query, data , {upsert:true} , function(err , stats){
              if(err){
                  callback(err , null);
              }
              else{
                 if(stats.result.upserted){
                     data._id = stats.result.upserted[0]._id;
                 }
                 callback(null , data);
              }
          });
       }
    }

    router.route('/')
       //
      .get(function(req , res){
           res.status(200).send('answer get called');
      })

      //The web api for PUT only
      .post(function(req , res){
          api.post(req.body , null , function(err , data){
              if(err){
                  res.status.send('Error trying to update answers');
              }
              else{
                  res.status.send(data);
              }
          });
      });

   //
   return {
      router : router,
      api : api
   };
}

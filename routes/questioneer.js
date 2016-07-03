var express = require('express');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

module.exports = function(dbResource){
    console.log('/questioneer loaded');

    //define data schemas
    var Questioneers = dbResource.model('Questioneers');

    //Exposes this api to other local modules
    var api = {
        post : function(data , creator , callback){
            var questioneerSchema = {
                creator : creator,
                created : Date.now(),
                modified: Date.now(),
                questions:[],
            };

            //
            var query;
            if(creator){//POST like operation
                var query = {'_':'_'}; //non existent query
                data = questioneerSchema;
            }
            else{
                query= {_id:ObjectId(data._id)}; //specific when we are updating old data
            }

            //
            Questioneers.update(query, data , {upsert:true} , function(err , stats){
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
           console.log(req.query);
           Questioneers.findOne({_id:ObjectId(req.query.id)} , {questions:1} , function(err , result){
                if(err){
                    res,status(500).send('Error getting questions');
                }
                else{
                    res.status(200).send(result.questions);
                }
           });
      })

      //The web api for PUT only
      .post(function(req , res){
          api.post(req.body , null , function(err , data){
              if(err){
                  res.status.send('Error trying to update questioneer');
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

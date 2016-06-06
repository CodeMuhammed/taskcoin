var express = require('express');
var router = express.Router();
var path = require('path');

/*This api handles sending thank-you emails to users who joins the beta list
*And adds their email details to Betalist collection in the database*/
module.exports = function(emailClient , dbResource){
	console.log('taskcoin beta route loaded');

	//Init collections
	var Betalist = dbResource.model('Betalist');
  Betalist.find({}).toArray(function(err , results){
		  console.log(results);
	});
	router.route('/')
	   .post(function(req , res){
					req.body.date = Date.now();
					console.log(req.body);

					Betalist.update({email:req.body.email} , req.body, {upsert:true} , function(err , stats){
						   if(err){
								  console.log(err);
							 }
							 else{
								 console.log(stats);
								 //@TODO send an email to user telling them that their request has been recieved
								 res.status(200).send('Thanks for joining the betalist '+req.body.email);
							 }
					});
	   });

   	//This router exposes certain api needed by client
    return router;
};

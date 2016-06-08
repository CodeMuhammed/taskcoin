var express = require('express');
var router = express.Router();
var path = require('path');
var ObjectId = require('mongodb').ObjectId;
var bCrypt = require('bcrypt-nodejs');

/*This api handles sending thank-you emails to users who joins the beta list
*And adds their email details to Betalist collection in the database
*It also takes care of sending out beta invites to selected users
*/
module.exports = function(emailClient , dbResource){

	//Init collections
	var Betalist = dbResource.model('Betalist');
	var Users = dbResource.model('Users');
	var defaultId = 346798;

	router.route('/')
	   .get(function(req , res){
			    //Get the first 100 uninvited users who are either merchant or feedback - interested
					Betalist.find({"$or":[{purpose:'feedback'} , {purpose:'merchant'}], inviteId:''})
					        .sort({date:1})
									.limit(100)
									.toArray(function(err , results){
                       if(err){
												   res.status(500).send('Internal server error in database layer');
											 }
											 else{
												   if(results[0]){
														   res.status(200).send(results);
													 }
													 else{
														   //When there are no documents that matches that query
														   res.status(200).send([]);
													 }
											 }
									});
		 })
	   .post(function(req , res){
					req.body.date = Date.now();

					Betalist.update({email:req.body.email} , req.body, {upsert:true} , function(err , stats){
						   if(err){
								  console.log(err);
							 }
							 else{
								 //@TODO send an email to user telling them that their request has been recieved
								 res.status(200).send('Thanks for joining the betalist '+req.body.email);
							 }
					});
	   });

     //
		 router.route('/invite')
        .post(function(req , res){
					   //
					   (function generateId(cb){
                  Betalist.find({})
								     .sort({"inviteId":-1})
										 .limit(1)
										 .toArray(function(err , result){
											    if(err){
														  console.log(err);
														  res.status(500).send('Err generating inviteId');
													}
													else{
														 if(result[0]){
																req.body.inviteId = (++result[0].inviteId)+'';
																console.log(req.body.inviteId);
																req.body._id = ObjectId(req.body._id);
																updateBetalist(req.body)
														 }
														 else{
																req.body.inviteId = defaultId+'';
																console.log(req.body.inviteId);
																req.body._id = ObjectId(req.body._id);
																updateBetalist(req.body)
														 }
													}
										 });
						 })();

						 //
						 function updateBetalist(betauser){
							  Betalist.update({email:betauser.email} , betauser, {upsert:false} , function(err , stats){
										if(err){
											 console.log(err);
											 res.status(500).send('Err updating betalist');
										}
										else{
										    createUser(betauser);
										}
							  });
						 }

						 //
						 function createUser(betauser){
							   var newUser = {
									   auth: {
											  username:betauser.email,
												password:bCrypt.hashSync(betauser.inviteId , null , null)
										 }
										 //@TODO design user schema
								 };

							   Users.update({'auth.username':betauser.email} , newUser, {upsert:true} , function(err , stats){
			 						   if(err){
			 								  console.log(err);
												res.status(500).send('Err creating new user');
			 							 }
			 							 else{
											 //@TODO send email to user informing them of the invite
											 res.status(200).send(betauser.inviteId);
			 							 }
			 					});

						 }

				});

   	//This router exposes certain api needed by client
    return router;
};

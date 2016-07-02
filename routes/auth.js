var express = require('express');
var router = express.Router();
module.exports = function(passport){
   //
   var authorize = function(options){
      if(options){
          options.except ? '' : options.except = [];
      }
      else{
         options = {except:[]};
      }
      return function(req , res , next){
           console.log(req.method , options);
           if(req.isAuthenticated() || options.except.indexOf(req.method)>=0 ){
               console.log('User authorized');
               next();
           }
           else{
              res.status(500).send('User is not authorized');
           }
      }
   }

   router.post('/signup' , passport.authenticate('signup'));
   router.post('/login' , passport.authenticate('login') , function(req , res){
       if(req.isAuthenticated()){
           res.status(200).send(req.user);
       }
       else{
           console.log('here not auth donno why');
       }
   });

	 router.get('/logout' , function(req, res){
		   req.logout();
		   res.status(200).send('Logged out successfully');
	 });

	 return {
      router:router,
      authorize : authorize
   };
};

var express = require('express');
var router = express.Router();

module.exports = function(dbResource){
   //
   console.log('/survey loaded');

   router.route('/')
      .get(function(req , res){
           res.status(200).send('surveys route all active');
      });

   //    
   return router;
}

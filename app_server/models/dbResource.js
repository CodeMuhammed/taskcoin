var MongoClient  = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var assert = require('assert');
var DBOpened = false;

//This object will hold opened connections to the collections the app uses
var openedColls = {};
var url = '';

//import the language driver
module.exports = function(dbName , app){

	//This functions accesses the database and creates a pool of opened
	//connections to the required collections needed by the app
	var initColls = function (collsArr , cb) {
		if(!isDBOpened()){
			MongoClient.connect(url , function(err , db){
				if(err){
					throw new Error('DB connection error ');
				} else {
					assert.equal(null ,err);
					console.log('Connected correcctly to the database');

					//
					for(var i=0; i<collsArr.length; i++){
						openedColls[collsArr[i]] = db.collection(collsArr[i]);
					}

					DBOpened = true;
					return cb();
				}
			});
		} else {
			return cb();
		}

	};

    //This function returns the valid collection to the client module
	var model = function(coll){
		if(!openedColls[coll]){
			throw new Error('The model or collection required does not exists');
		}
		return openedColls[coll];
	};

	//
	var isDBOpened = function(){
		return DBOpened;
	}

	//Set db connection string based on the current environment being worked in...
	if(app.get('env') ==='development'){
       url = 'mongodb://127.0.0.1:27017/taskcoin';
	} else {
       url = 'mongodb://'+ process.env.dbuser+ ':'+process.env.dbpassword+'@ds011725.mlab.com:11725/taskcoin';
	}

	return {
		initColls : initColls,
		model : model
	};
};

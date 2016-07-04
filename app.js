//Require dependencies phase
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var errorHandler = require('errorhandler');
var logger = require('morgan');
var compression = require('compression');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var cors  = require('cors');
var path = require('path');
var passport  = require('passport');

//Instantiate a new express app
var app = express();

//set the model source
var dbResource = require('./app_server/models/dbResource')('restapi' , app);

//initialize database
dbResource.initColls(['Betalist','Users','Surveys','Questioneers','Answers'] , function(){
		//Email client
		var emailClient = require('./app_server/controllers/emailClient')();

		//Initializing passport local strategy
		var localStrategy  = require('./app_server/controllers/passportCtrl')(passport , dbResource);

		//Auth module
		var Auth =  require('./routes/auth')(localStrategy);

		//Qusestioneer module
		var questioneer = require('./routes/questioneer')(dbResource);

		//answers module
    var answer = require('./routes/answer')(dbResource);

		//Configure the express app
		app.set('view cache' , true);
	  app.set('views' , 'views');
	  app.set('view engine' , 'ejs');
		app.set('port' , process.env.PORT || 5001);

	    //configure functions that matches all routes
		app.use(cors({credentials: true, origin: true}));
		app.use(compression({threshold:1}));
		app.use(methodOverride('_method'));

		//configure router to use cookie-parser  ,body-parser
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended:true}));
		app.use(cookieParser());
		app.use(session({resave:true , secret:'taskcoin' , saveUninitialized:true}));

		//start passport
		app.use(localStrategy.initialize());
		app.use(localStrategy.session());

		//configure express static
	  app.use(express.static(path.join(__dirname , 'public')));

		//routes implementations
		app.use('/betalist' , require('./routes/betalist')(emailClient , dbResource));
    app.use('/auth' , Auth.router);
		app.use('/profile' , Auth.authorize({}) , require('./routes/profile')(dbResource));
		app.use('/questioneer' , Auth.authorize({}) , questioneer.router);
		app.use('/answer' , Auth.authorize({}) , answer.router);
		app.use('/survey' , Auth.authorize({}) , require('./routes/survey')(dbResource , questioneer.api , answer.api));

		app.use('/demourl' , function(req , res){
			    var url = process.NODE_ENV == 'production'? 'https://minicards.herokuapp.com' : 'http://localhost:5000';
					res.status(200).send(url);
		});


		//handle errors using custom or 3rd party middle-wares
		app.use(errorHandler());

		//Start the main Express server
		app.listen(app.get('port'), function() {
		     console.log("Listening on " + app.get('port'));
		});
});

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
		app.use('/survey' , Auth.authorize({except:['GET']}) , require('./routes/survey')(dbResource));
		app.use('/questioneer' , Auth.authorize({except:['GET']}) , require('./routes/questioneer')(dbResource));
		app.use('/answer' , Auth.authorize({except:['GET']}) , require('./routes/answer')(dbResource));

		//handle errors using custom or 3rd party middle-wares
		app.use(errorHandler());

		//Start the main Express server
		app.listen(app.get('port'), function() {
		     console.log("Listening on " + app.get('port'));
		});
});

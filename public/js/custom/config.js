angular.module('config' , ['LocalStorageModule'])
    //state configuration and routing setup
    .config([
        '$stateProvider' , '$urlRouterProvider'  , '$locationProvider',
        function($stateProvider , $urlRouterProvider  , $locationProvider){
              //enabling HTML5 mode
               $locationProvider.html5Mode(false).hashPrefix('!');
               $stateProvider
                 .state('pay' , {
                     url : '/pay',
                     templateUrl : 'views/pay.html',
                     controller : 'payController',
                 })
                 .state('pay.survey' , {
                     url : '/survey',
                     templateUrl : 'views/pay.survey.html',
                     controller : 'paySurveyController',
                 })
                 .state('home' , {
                     url : '/home',
                     templateUrl : 'views/home.html',
                     controller : 'homeController',
                 })
                 .state('dashboard' , {
                     url : '/dashboard',
                     abstract : true,
                     templateUrl : 'views/dashboard.html',
                     controller : 'dashboardController',
                 })
                     .state('dashboard.surveys' , {
                         url : '/surveys',
                         abstract : true,
                         templateUrl : 'views/dashboard.surveys.html',
                         controller : 'surveysController',
                     })
                         .state('dashboard.surveys.overview' , {
                             url : '/overview',
                             templateUrl : 'views/dashboard.surveys.overview.html',
                             controller : 'surveysOverviewController',

                         })
                         .state('dashboard.surveys.edit' , {
                             url : '/edit',
                             abstract : true,
                             templateUrl : 'views/dashboard.surveys.edit.html'
                         })
                             .state('dashboard.surveys.edit.setup' , {
                                 url : '/setup?id',
                                 templateUrl : 'views/dashboard.surveys.edit.setup.html',
                                 controller : 'surveysEditSetupController',
                             })
                             .state('dashboard.surveys.edit.builder' , {
                                 url : '/builder?id',
                                 templateUrl : 'views/dashboard.surveys.edit.builder.html',
                                 controller : 'surveysEditBuilderController',
                             })
                             .state('dashboard.surveys.edit.billing' , {
                                 url : '/billing?id',
                                 templateUrl : 'views/dashboard.surveys.edit.billing.html',
                                 controller : 'surveysEditBillingController',
                             })
                         .state('dashboard.surveys.preview' , {
                             url : '/preview?id',
                             templateUrl : 'views/dashboard.surveys.preview.html',
                             controller : 'surveysPreviewController',
                         })
                         .state('dashboard.surveys.stats' , {
                             url : '/stats?id',
                             templateUrl : 'views/dashboard.surveys.stats.html',
                             controller : 'surveysStatsController',
                         })

                 .state('dashboard.merchant' , {
                     url : '/merchant',
                     templateUrl : 'views/dashboard.merchant.html',
                     controller : 'merchantController',
                 })
                 .state('dashboard.history' , {
                     url : '/history',
                     templateUrl : 'views/dashboard.history.html',
                     controller : 'historyController',
                 })
                 .state('dashboard.search' , {
                     url : '/search',
                     templateUrl : 'views/dashboard.search.html',
                     controller : 'searchController',
                 })
                 .state('dashboard.betalist' , {
                     url : '/betalist',
                     templateUrl : 'views/dashboard.betalist.html',
                     controller : 'betalistController',
                 });

                 $urlRouterProvider.otherwise('/home');
            }
    ])

    //BS dropdown to allow html compilation
    .config(function($dropdownProvider) {
        angular.extend($dropdownProvider.defaults, {
          html: true
        });
    })

    // cors configurations to enable consuming the rest api
    .config([
        '$httpProvider' ,
        function($httpProvider){
           $httpProvider.defaults.useXDomain = true;
           $httpProvider.defaults.withCredentials = true;
           delete $httpProvider.defaults.headers.common['X-Requested-With'];
        }
    ])

    //Setting to save all data as a property of taskcoin to avoid conflict
    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
          .setPrefix('tskcoin');
    });

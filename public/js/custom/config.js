angular.module('config' , [])
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
                     data :{}
                 })
                 .state('home' , {
                     url : '/home',
                     templateUrl : 'views/home.html',
                     controller : 'homeController',
                     data :{}
                 })
                 .state('dashboard' , {
                     url : '/dashboard',
                     abstract : true,
                     templateUrl : 'views/dashboard.html',
                     controller : 'dashboardController',
                     data :{}
                 })
                 .state('dashboard.survey' , {
                     url : '/survey',
                     templateUrl : 'views/dashboard.survey.html',
                     controller : 'surveyController',
                     data :{}
                 })
                 .state('dashboard.merchant' , {
                     url : '/merchant',
                     templateUrl : 'views/dashboard.merchant.html',
                     controller : 'merchantController',
                     data :{}
                 })
                 .state('dashboard.history' , {
                     url : '/history',
                     templateUrl : 'views/dashboard.history.html',
                     controller : 'historyController',
                     data :{}
                 })
                 .state('dashboard.search' , {
                     url : '/search',
                     templateUrl : 'views/dashboard.search.html',
                     controller : 'searchController',
                     data :{}
                 })
                 .state('dashboard.betalist' , {
                     url : '/betalist',
                     templateUrl : 'views/dashboard.betalist.html',
                     controller : 'betalistController',
                     data :{}
                 });

                 $urlRouterProvider.otherwise('/home');
            }
    ])

    //
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

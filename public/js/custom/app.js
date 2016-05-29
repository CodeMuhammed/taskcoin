angular.module('taskcoin' , ['ui.router' ,'mgcrea.ngStrap'])

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
             });

             $urlRouterProvider.otherwise('/pay');
        }
])

// cors configurations to enable consuming the rest api
.config([
    '$httpProvider' ,
    function($httpProvider){
       $httpProvider.defaults.useXDomain = true;
       $httpProvider.defaults.withCredentials = true;
       delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])

//============================ pay auth factory ============================
.factory('taskcoinAuth' , function($timeout  , $q){
     //Mocked out host data registered at taskcoin.io
     var hostNames = ['http://localhost:5000'];
     var users = [
         {
            username:'codemuhammed',
            password:'12345'
         }
     ];

     //
     function find(person){
        for(var i=0; i<users.length; i++){
            if(person.username == users[i].username && person.password == users[i].password){
                return true;
            }
        }
        return false;
     }

     //
     function verifyHost(hostName){
          var promise = $q.defer();
          $timeout(function(){
              if(hostNames.indexOf(hostName)>=0){
                   promise.resolve('Host verified successfully');
              }
              else{
                  promise.reject('Failed to verify host');
              }
          } , 3000);
          return promise.promise;
     }

     //
     function verifyUser(person){
          console.log(person);
          var promise = $q.defer();
          $timeout(function(){
              if(find(person)){
                   promise.resolve('user logged in successfully');
              }
              else{
                  promise.reject('Failed to authenticate user');
              }
          } , 3000);
          return promise.promise;
     }

     //public facing functions
     return {
         verifyHost: verifyHost,
         verifyUser: verifyUser
     };
})

//============================ Home controller =============================
.controller('homeController' , function($scope){

})

//============================ pay controller ==============================
.controller('payController' , function($scope , $window , $state , $timeout , taskcoinAuth){
     //send a message to host to send back his credentials for authentication
     $scope.hostName = '';
     $scope.init = {
         host:false,
         auth:false,
         loginError:false,
         msg:'Verifying host. please wait'
     };

     $window.parent.postMessage({msg:'Please send a message', status:'verify'}, '*');
     $window.addEventListener('message', function(event) {
          var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
          if(event.data.status === 'verify'){
             $scope.hostName = origin;
          }
     });

     //
     $timeout(function(){
        taskcoinAuth.verifyHost($scope.hostName).then(
            function(status){
                $scope.init.msg = status;
                $scope.init.host = true;
            },
            function(err){
                $scope.init.msg = err;
                $state.go('home');
            }
        );
     } , 4000);

     //
     $scope.person = {};
     $scope.login = function(person){
          $scope.authenticating = true;
          taskcoinAuth.verifyUser(person).then(
              function(status){
                  $scope.authenticating = false;
                  $scope.init.auth = true;
              } ,
              function(err){
                  $scope.authenticating = false;
                  $scope.init.msg = err;
                  $scope.init.auth = false;
                  $scope.init.loginError = true;
              }
          );
     }

     $scope.resetError = function(){
         $scope.init.loginError = false;
     }

     //send a message to host to signal the status of the survey
     $scope.cancelTask = function(){
         $window.parent.postMessage({msg:'User cancelled the task', status:'cancel'}, '*');
     }

     $scope.doneTask = function(){
         $scope.doneMsg = "Thank you !"
         $timeout(function(){
             $window.parent.postMessage({greet:'User successfully completed the task', status:'done'}, '*');
         } , 3000)
     }
});

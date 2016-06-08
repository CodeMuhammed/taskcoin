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

//
.factory('Mailer'  , function($q , $http , $timeout){
     //
     function reserveSpot(betaUser){
         var promise = $q.defer();
         $http({
			 method:'POST',
			 url:'/betalist',
			 data:betaUser
		 })
		 .success(function(status){
			 promise.resolve(status);
		 })
		 .error(function(err){
			 promise.reject(err);
		 });

         return promise.promise;
     }

     //
     return{
        reserveSpot:reserveSpot
     }
})

//============================ Home controller =============================
.controller('homeController' , function($scope , $document ,  Mailer){
      //
      $scope.betaUser = {
          email: '',
          purpose: '',
          date: '',
          inviteStatus: '',
          inviteId: ''
      };

      //
      $scope.purpose = '';
      $scope.changePurpose = function(purpose){
          $scope.purpose = purpose;
          $scope.betaUser.purpose = purpose;
      }

      //
      $scope.thankYou = {show:false , msg:''};
      $scope.reserveSpot = function(betaUser){
          Mailer.reserveSpot(betaUser).then(
              function(status){
                   $scope.thankYou.msg = status;
                   $scope.thankYou.show = true;
                   $document.find('html').css({overflow:'hidden'});
              },
              function(err){
                  console.log(err);

              }
          );
      }

      //
      $scope.cancelThank = function(){
        $scope.thankYou.show = false;
        $document.find('html').css({overflow:'auto' , overflowX:'hidden'});
      }

     //
     $scope.auth = false;
})

//
.controller('dashboardController' , function($scope , $state ,  authy){
       //Logic that requires user to be authenticated goes here
       authy.isAuth().then(
          function(stutus){
             console.log(status);
          },
          function(err){
              console.log(err);
              $state.go('home');
          }
       );
       //

       var currentState = '';
       $scope.isActiveClass = function(state){
           return currentState==state ? 'active' : '';
       }

       //Listen to state change events
       $scope.$on('$stateChangeSuccess' , function(e , toS){
            currentState = toS.url.substr(1);
       });
})

//
.controller('surveyController' , function($scope){
       $scope.hello = 'survey';
})

//
.controller('merchantController' , function($scope){
       $scope.hello = 'merchant';
})

//
.controller('historyController' , function($scope){
       $scope.hello = 'history';
})

//
.controller('searchController' , function($scope){
       $scope.hello = 'search';
})

//
.controller('betalistController' , function($scope , betalistFactory){
       $scope.hello = 'betalist';
       betalistFactory.getList().then(
           function(data){
                $scope.betalistArr = data;
           },
           function(err){
              //@TODO handle error case here
              alert('err');
           }
       );

       //
       $scope.inviteUser = function(user){
           betalistFactory.inviteUser(user).then(
               function(data){
                   user.inviteId =  data;
               },
               function(err){
                   //@TODO handle error case here
                   alert('err');
               }
           );
       }

       //
       $scope.isInvited = function(user){
            return user.inviteId != '';
       }
})

//
.factory('betalistFactory' , function($q , $http , $timeout){
      //
      var betalist = [];

      //
      function getList(){
          var promise = $q.defer();
          if(betalist.length>0){
              promise.resolve(betalist);
          }
          else{
            //@TODO get betalist from database
            $http({
                method: 'GET',
                url: '/betalist',
            })
            .success(function(data){
                 betalist = data;
                 promise.resolve(data);
            })
            .error(function(err){
                promise.reject(err);
            });
          }

          return promise.promise;
      }

      //
      function inviteUser(user){
           var promise = $q.defer();

           $http({
               method: 'POST',
               url: '/betalist/invite',
               data:user
           })
           .success(function(inviteId){
                promise.resolve(inviteId);
           })
           .error(function(err){
               promise.reject(err);
           });

           return promise.promise;
      }

      //
      return {
           getList : getList,
           inviteUser:inviteUser
      };
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
})

//
.directive('authy' , function(){
    return{
       scope: {
          auth:'=auth'
       },
       template:'<div class="col-xs-12 invite-auth">'+
                   '<h2>Enter your username and password below</h2>'+
                   '<form name="login" novalidate>'+
                      '<input type="text" ng-model="userAuth.username" class="form-control" placeholder="Email address" required/>'+
                      '<input type="password" ng-model="userAuth.password" class="form-control" placeholder="Password" required/>'+
                      '<span class="btn btn-default pull-right" ng-disabled="login.$invalid"ng-click="loginUser(userAuth)">continue</span>'+
                   '</form>'+
                   '<span class="pull-left" ng-click="auth=!auth">cancel</span>'+
                '</div>',
       controller: 'authController'
    };
})

.factory('authy' , function($http , $timeout , $q){
     var authStatus = false;

     //
     function isAuth(){
         var promise = $q.defer();
         if(authStatus){
             promise.resolve();
         }
         else{
             //The _ is when you don't really provide useful variables
             login({username:'_' , password:'_'}).then(
                  function(user){
                      promise.resolve();
                  },
                  function(err){
                      promise.reject(err);
                  }
             );
         }
         return promise.promise;
     }

     //
     function login(userAuth){
       var promise = $q.defer();
       $http({
           method: 'POST',
           url: '/auth/login',
           data:userAuth
       })
       .success(function(user){
           authStatus = true;
           promise.resolve(user);
       })
       .error(function(err){
           promise.reject(err);
       });

       return promise.promise;
     }

     //
     function logout(){
         var promise = $q.defer();
         $timeout(function(){
           authStatus = false;
           promise.resolve('logged out successfully');
         } , 3000);

         var promise = $q.defer();
     }

     //
     return {
         isAuth : isAuth,
         login : login,
         logout:logout
     };
})

.controller('authController' , function($scope  , $state , $timeout , authy){
    $scope.hello ='Here';
    $scope.userAuth = {};
    //
    $scope.loginUser = function(userAuth){
         authy.login(userAuth).then(
             function(user){
                console.log('logged iin');
                $state.go('dashboard.survey');
             },
             function(err){
                 alert(err)
             }
         );
    }
});

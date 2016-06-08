angular.module('authyComponent' , [])
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

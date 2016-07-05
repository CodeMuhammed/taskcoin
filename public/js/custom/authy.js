angular.module('authyComponent' , [])
    //
    .directive('authy' , function(){
        return{
           link:function(scope , elem , attrs){
               scope.destination = attrs.destination;
               attrs.notify ? scope.notify = attrs.notify : '';
           },
           transclude:true,
           templateUrl:'views/auth.html',
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
             $http({
                 method: 'GET',
                 url: '/auth/logout'
             })
             .success(function(user){
                 authStatus = false;
                 promise.resolve(true);
             })
             .error(function(err){
                 promise.reject(err);
             });

             return promise.promise;
         }

         //
         return {
             isAuth : isAuth,
             login : login,
             logout:logout
         };
    })

    .controller('authController' , function($scope  , $state , $timeout , authy , localStorageService){
        //initialize local storage for user auth
        var lastpass = localStorageService.get('lastpass');
        if(!lastpass){
            localStorageService.set('lastpass' , {username:'' , password:''});
            lastpass = localStorageService.get('lastpass');
        }
        console.log(lastpass);

        $scope.hello ='Here';
        $scope.userAuth = lastpass;
        //
        $scope.loginUser = function(userAuth){
             $scope.loggingin =true;
             authy.login(userAuth).then(
                 function(user){
                    console.log('logged iin');
                    localStorageService.set('lastpass' , userAuth);
                    if($scope.notify){
                         $scope.$eval($scope.notify);
                    }
                    $scope.loggingin = false;
                    $state.go($scope.destination);
                 },
                 function(err){
                     $scope.loggingin  = false;
                     alert(err)
                 }
             );
        }
    });

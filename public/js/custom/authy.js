angular.module('authyComponent' , ['LocalStorageModule'])
    //
    .directive('authy' , function(){
        return{
           scope: {
              auth:'=auth'
           },
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
             authy.login(userAuth).then(
                 function(user){
                    console.log('logged iin');
                    localStorageService.set('lastpass' , userAuth);
                    $state.go('dashboard.surveys.overview');
                 },
                 function(err){
                     alert(err)
                 }
             );
        }
    });

angular.module('taskcoin' , [
     'ui.router' ,'mgcrea.ngStrap' ,
     'LocalStorageModule','ngSanitize',
     'config' , 'authyComponent' ,
     'general.factories' ,'general.directives',
     'checkoutModule', 'betalistModule' ,
     'homeModule', 'surveysModule',
     'alertModule' , 'locationDetector'
])

//
.factory('profile' , function($q , $http , $timeout){
      var user;

      //
      function getUser(){
          var promise = $q.defer();
          if(user){
             console.log('here');
             promise.resolve(user);
          }
          else{
             $http({
                method:'GET',
                url:'/profile'
             })
             .success(function(data){
                 user = data;
                 promise.resolve(user);
             })
             .error(function(err){
                promise.reject(err);
             });
          }

          return promise.promise;
      }

      //
      function reset(){
          user = undefined;
      }

      //
      function save(userData){

          var promise = $q.defer();
          
          $http({
             method:'PUT',
             url:'/profile',
             data:user
          })
          .success(function(status){
              user = userData;
              promise.resolve(status);
          })
          .error(function(err){
             promise.reject(err);
          });

          return promise.promise;
      }

      ///
      return{
          getUser:getUser,
          reset:reset,
          save:save
      };
})

//======================== Dashboard controller logged in state=============================
.controller('dashboardController' , function($scope , $state ,$timeout,  authy , myMedia , Surveys ,  profile , betalistFactory){
       //Logic that requires user to be authenticated goes here
       authy.isAuth().then(
          function(stutus){
             profile.getUser().then(
                 function(user){
                     $scope.user = user;
                 },
                 function(err){
                      console.log(err);
                 }
             );
          },
          function(err){
              $state.go('home');
          }
       );

       //create a new survey schema and send user to editor
       $scope.createSurvey = function(){
           profile.getUser().then(
               function(user){
                   console.log('Called');
                   Surveys.initNew(user.userInfo.email);
                   $state.go('dashboard.surveys.edit.setup' , {id:1});
               },
               function(err){
                   console.log(err);
               }
           );
       }

       //logic for logging out
      $scope.logout = function(){
          authy.logout().then(
              function(){
                  console.log('logged out');
                  profile.reset();
                  betalistFactory.reset();
                  $state.go('home');
              },
              function(err){
                  alert(err);
              }
          );
      }

       var currentState = '';
       $scope.isActiveClass = function(state){
           return currentState==state ? 'active' : '';
       }

       //Media query for small screen
       $scope.isSmall = function(){
           if(myMedia['gt-xs']){
               $scope.submenuVisible = true;
           }
           return myMedia.xs;
       }

       //
       $scope.submenuVisible = myMedia['gt-xs'];

       $scope.toggleSubmenu = function(){
            $scope.submenuVisible = !$scope.submenuVisible;
       }

       //Listen to state change events
       $scope.$on('$stateChangeSuccess' , function(e , toS){
             if(myMedia.xs){
                 $scope.submenuVisible = false;
             }
             currentState = $state.$current.url.source.split('/')[2];
       });

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
});

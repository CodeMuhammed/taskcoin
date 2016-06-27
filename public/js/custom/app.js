angular.module('taskcoin' , [
     'ui.router' ,'mgcrea.ngStrap' ,
     'config' , 'authyComponent' ,
     'general.factories' , 'checkoutModule',
     'betalistModule' , 'ngSanitize',
     'homeModule'
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
      return{
          getUser:getUser,
          reset:reset
      };
})

//======================== Dashboard controller logged in state=============================
.controller('dashboardController' , function($scope , $state ,$timeout,  authy , myMedia , profile , betalistFactory){
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

       $scope.dropdown = [
           {text: '<i class="fa fa-user"></i>&nbsp;Profile', href: '#', active: true},
           {divider: true},
           {text: '<i class="fa fa-code"></i>&nbsp;API', href: '#', active: true},
           {divider: true},
           {text: '<i class="fa fa-dollar"></i>&nbsp;Pricing', href: '#', active: true},
           {divider: true},
           {text: '<i class="fa fa-phone-square"></i>&nbsp;Help center', href: '#', active: true},
           {divider: true},
           {text: '<i class="fa fa-sign-out"></i>&nbsp;Logout', active: true , click:"logout()"},
      ];

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
.factory('Surveys' , function($q , $http , $timeout){
     var surveys = [
        {
          _id:'236496586',
          title:'Taskcoin User Experience Survey',
          created:Date.now(),
          modified:Date.now(),
          responses:'568'
        },
        {
          _id:'236487886',
          title:'Taskcoin User Experience Survey',
          created:Date.now(),
          modified:Date.now(),
          responses:'568'
        },
        {
          _id:'2368797886',
          title:'Microsoft Windows 10 Survey',
          created:Date.now(),
          modified:Date.now(),
          responses:'568'
        },
        {
          _id:'236489786',
          title:'Music Taste survey',
          created:Date.now(),
          modified:Date.now(),
          responses:'568'
        },
     ];

     //
     function all(){
          var promise = $q.defer();

          //
          $timeout(function(){
              promise.resolve(surveys);
          } , 3000);
          return promise.promise;
     }

     //
     return {
        all:all
     };
})

//Abstract state controller for surveys route
.controller('surveysController' , function($scope , $state){
       console.log('surveys abstract controller loaded');
       //Act as a God to all its child-views
})

//
.controller('surveysOverviewController' , function($scope , $state , myMedia , Surveys){
       //
       Surveys.all().then(
            function(data){
                $scope.surveys = data;
            },
            function(err){
                console.log(err);
            }
       );
})

//
.controller('surveysEditController' , function($scope , $state , $stateParams){
       //Setup default stage
       $scope.stage = 'setup';

       //
       $scope.changeStage = function(newStage){
           $scope.stage = newStage;
       }

       //
       $scope.getActiveStage = function(stage){
            return stage == $scope.stage?'active':'inactive';
       }

       //
       $scope.infoActive = false;
       $scope.info = '';

       //
       $scope.setAndDisplayInfo = function(info){
           if($scope.infoActive && $scope.info == info){
             $scope.infoActive = false;
             $scope.info = '';
           }
           else{
             $scope.infoActive = true;
             $scope.info = info;
           }
       }

       //
       $scope.getInfoClass = function(info){
           if($scope.infoActive){
              return $scope.info == info ?'active':'';
           }
           else{
             return '';
           }
       }
})

//
.controller('surveysPreviewController' , function($scope , $state, $stateParams){
       $scope.hello = 'surveys/preview '+$stateParams.id;
})

//
.controller('surveysStatsController' , function($scope , $state, $stateParams){
       $scope.hello = 'surveys/stats '+$stateParams.id;
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

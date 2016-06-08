angular.module('taskcoin' , [
     'ui.router' ,'mgcrea.ngStrap' ,
     'config' , 'authyComponent' ,
     'general.factories' , 'checkoutModule',
     'betalistModule' , 'ngSanitize'
])

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

//============================ Home controller logged out state=============================
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

//======================== Dashboard controller logged in state=============================
.controller('dashboardController' , function($scope , $state ,$timeout,  authy , myMedia){
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

       $scope.dropdown = [
   {text: '<i class="fa fa-download"></i>&nbsp;Another action', href: '#anotherAction', active: true},
   {text: '<i class="fa fa-globe"></i>&nbsp;Display an alert', click: '$alert("Holy guacamole!")'},
   {text: '<i class="fa fa-external-link"></i>&nbsp;External link', href: '/auth/facebook', target: '_self'},
   {divider: true},
   {text: 'Separated link', href: '#separatedLink'}
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
});

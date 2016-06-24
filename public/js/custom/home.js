angular.module('homeModule' , [])
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
              inviteId: ''
          };

          //
          $scope.features = [
              {
                title:'RESEARCHERS',
                text:'Create micro-surveys and Gather genuine feedbacks in realtime from millions of taskcoin users across the web for as low as $500 per 1000 feedbacks.',
                url:'#!/home'
              },
              {
                title:'MERCHANTS',
                text:'Get rid of those pesky banner ads and monetize your mobile apps, blogs, digital contents the right way by Integrating taskcoin checkout in your websites and apps.',
                url:'#!/home'
              },
              {
                title:'SHOPPERS',
                text:'Think about it for a second. Why use your credit card or mobile phone voucher to make payments below $1 when your opinion counts? ',
                url:'#!/home'
              }
          ];

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

         //
         $scope.concept = false;
    });

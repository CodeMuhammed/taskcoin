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
    });

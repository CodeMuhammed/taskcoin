angular.module('betalistModule' , [])
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
    });

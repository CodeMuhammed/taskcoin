angular.module('checkoutModule' , [])
    //============================ pay auth factory ============================
    .factory('taskcoinAuth' , function($timeout  , $q){
         //Mocked out host data registered at taskcoin.io
         var hostNames = ['http://localhost:5000' , 'https://minicards.herokuapp.com' , 'http://minicards.herokuapp.com']; //@TODO update hostnames from database

         //
         function verifyHost(hostName){
              console.log(hostName);
              var promise = $q.defer();
              $timeout(function(){
                  if(hostNames.indexOf(hostName)>=0){
                       promise.resolve('Host verified successfully');
                  }
                  else{
                      promise.reject('Failed to verify host');
                  }
              } , 2000);
              return promise.promise;
         }

         //public facing functions
         return {
             verifyHost: verifyHost
         };
    })

    //============================ questioneer factory ============================
    .factory('Questioneer' , function($http , $q , $timeout){
          //Tracks surveys that has been served so far
          var served = [];

          //
          function refresh(user){
              var promise = $q.defer();

              console.log(user);
              $http({
                 method:'POST',
                 url:'/survey/preview',
                 data:{served:served , user:[user]}
              })
              .success(function(data){
                  getQuestions(data.questioneerId).then(
                       function(questions){
                           data.questions = questions;
                           served.indexOf(data._id)<0 ? served.push(data._id) : '';
                           promise.resolve(data);
                       },
                       function(err){
                           promise.reject(err);
                       }
                  );
              })
              .error(function(err){
                  promise.reject(err);
              });

              return promise.promise
          }

          //
          function getQuestions(id){
              var promise = $q.defer();

              $http({
                method:'GET',
                url:'/questioneer?id='+id
              })
              .success(function(data){
                  promise.resolve(data);
              })
              .error(function(err){
                  promise.reject(err);
              });

              return promise.promise;
          }
          //
          return {
              refresh:refresh
          }
    })
    //============================ pay controller =================================
    .controller('payController' , function($scope , $window , $state , $timeout , taskcoinAuth){
         //
         $window.parent.postMessage({msg:'Please send a message', status:'verify'}, '*');
         $window.addEventListener('message', function(event) {
             var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
             if(event.data.status === 'verify'){
                console.log(event.data.config);
                $scope.hostName = origin;
                taskcoinAuth.verifyHost($scope.hostName).then(
                    function(status){
                        $scope.init.msg = status;
                        $scope.init.host = true;
                    },
                    function(err){
                        $scope.init.msg = err;
                    }
                );
             }
         });

         //send a message to host to send back his credentials for authentication
         $scope.hostName = '';
         $scope.init = {
             host:false,
             auth:false,
             loginError:false,
             msg:'Verifying host. please wait'
         };

         //
         $scope.notifyLogin = function(){
            $scope.init.auth = true;
         }

         //
         $scope.resetError = function(){
             $scope.init.loginError = false;
         }
    })

    //
    .controller('paySurveyController' , function($scope ,  $window , $timeout , Questioneer , profile){
          $scope.userData;
          //Serves a new surveys
          $scope.refresh = function(user){
              $scope.refreshing = true;
              Questioneer.refresh(user).then(
                  function(data){
                      $timeout(function(){
                        $scope.warning = true;
                        $scope.questioneer = data;
                        $scope.refreshing = false;
                      } , 3000);
                  },
                  function(err){
                      $scope.error = err;
                      $scope.questioneer = [];
                  }
              );
          };

          //Serves the first survey automatically
          $scope.refreshing = true;
          profile.getUser().then(
              function(data){
                    console.log(data);
                    $scope.userData = data;
                    $scope.refresh(data.userInfo.email);
              },
              function(err){
                   $scope.error = err;
              }
          );

          //send a message to host to signal the status of the survey
          $scope.cancelTask = function(){
              $window.parent.postMessage({msg:'User cancelled the task', status:'cancel'}, '*');
          }

          //
          $scope.doneTask = function(){
              $scope.doneMsg = "Thank you !";
              $scope.processingCheckout = true;
              $timeout(function(){
                  $window.parent.postMessage({greet:'User successfully completed the task', status:'done'}, '*');
                  $scope.processingCheckout = false;
              } , 3000)
          }

    });

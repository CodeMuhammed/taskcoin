angular.module('checkoutModule' , [])
    //============================ pay auth factory ============================
    .factory('taskcoinAuth' , function($timeout  , $q){
         //Mocked out host data registered at taskcoin.io
         var hostNames = ['http://localhost:5000']; //@TODO update hostnames from database

         //
         function find(person){
            for(var i=0; i<users.length; i++){
                if(person.username == users[i].username && person.password == users[i].password){
                    return true;
                }
            }
            return false;
         }

         //
         function verifyHost(hostName){
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
    //============================ pay controller ==============================
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

         //send a message to host to signal the status of the survey
         $scope.cancelTask = function(){
             $window.parent.postMessage({msg:'User cancelled the task', status:'cancel'}, '*');
         }

         //
         $scope.doneTask = function(){
             $scope.doneMsg = "Thank you !"
             $timeout(function(){
                 $window.parent.postMessage({greet:'User successfully completed the task', status:'done'}, '*');
             } , 3000)
         }
    })

    //
    .controller('paySurveyController' , function($scope){
          $scope.hello = 'pay survey controller';
    });

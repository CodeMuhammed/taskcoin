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
    .factory('QuestioneerPreview' , function($http , $q , $timeout){
          //Tracks surveys that has been served so far
          var served = [];

          //
          function refresh(user , location , interests ){
              var promise = $q.defer();

              console.log(user , location , interests);
              $http({
                 method:'POST',
                 url:'/survey/preview',
                 data:{served:served , user:user , country:location.info.country_name ,interests:interests}
              })
              .success(function(data){
                  getQuestions(data.questioneerId).then(
                       function(questions){
                           data.questioneer = questions;
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

    //
    .factory('WindowMessege' , function($window , $q){
        //callbacks to be executed
        var refresh;
        var verify;
        var config; //Config object used by taskcoin to verify auth
        //
        function init(){
            var promise = $q.defer()
            $window.addEventListener('message', function(event) {
                var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
                if(event.data.status === 'verifyMerchant'){
                   verify(origin);
                }
                else if(event.data.status === 'refresh'){
                   config = event.data.config;
                   if(refresh){
                       refresh(config);
                   }
                }
            });

            //
            return promise.promise;
        }

        //
        function onRefresh(callback){
            refresh = callback;
        };

        //
        function onVerifyHost(callback){
            verify = callback;
        }

        //
        function getConfig(){
           return config;
        }

        //
        return {
          init:init,
          onRefresh:onRefresh,
          onVerifyHost:onVerifyHost,
          getConfig:getConfig
        }
    })

    //============================ pay controller =================================
    .controller('payController' , function($scope , $window , $state , $timeout , taskcoinAuth , WindowMessege){

         //send a message to host to send back his credentials for authentication
         WindowMessege.init();
         $window.parent.postMessage({msg:'Verify', status:'verify'}, '*');

         //
         WindowMessege.onVerifyHost(function(hostName){
             //@TODO user hostname to grab the merchant information
             taskcoinAuth.verifyHost(hostName).then(
                 function(status){
                     $scope.init.msg = status;
                     $scope.init.host = true;
                 },
                 function(err){
                     $scope.init.msg = err;
                 }
             );
         });

         //
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
    .controller('paySurveyController' , function($scope ,  $window , $timeout , QuestioneerPreview , profile , WindowMessege , GeoLocation){

          //
          $scope.userData;

          //Serves the first survey automatically
          $scope.refreshing = true;
          profile.getUser().then(
              function(data){
                    console.log(data);
                    $scope.userData = data;

                    //Always ask a user for their location if the detection mode was navigator //for now
                    var location = $scope.userData.userInfo.location;
                    if(location && location.detectionMode == 'STUN'){
                        initialize(location);
                    }
                    else{
                        GeoLocation.getLocation().then(
                          function(location){
                              $scope.userData.userInfo.location = location;
                              //@TODO save user data
                              initialize(location);
                          },
                          function(err){
                              console.log('Could not resolve users location');
                          }
                      );
                    }

                    //
                    function initialize(location){
                        //Register a callback with window messenger service to auto refresh when user clicks the checkout button
                        WindowMessege.onRefresh(function(config , location){
                             $scope.refresh($scope.userData.userInfo.email , location);
                        });

                        //refresh for the first time
                        $scope.config = WindowMessege.getConfig();
                        console.log($scope.config); // used when the manual refresh button is pushed
                        $scope.refresh($scope.userData.userInfo.email ,location);
                    }
              },
              function(err){
                   $scope.error = err;
              }
          );

          //Serves a new surveys
          $scope.refresh = function(user , location){
              var interests = []; //@TODO merge user interests with Merchants interests
              $scope.refreshing = true;
              QuestioneerPreview.refresh(user , location , interests).then(
                  function(data){
                    $scope.warning = true;
                    //@TODO spoof questions by introducing foreign options to data
                    $scope.survey = data;
                    $scope.refreshing = false;
                    $scope.answers = []; //Collect answers as users answer them in real time

                    //Calculate for number of questions
                    $scope.questionsCount = 0;
                    angular.forEach($scope.survey.questioneer.questions , function(question){
                        question.type != 'Segment_Title' ? $scope.questionsCount++ : '';
                    });
                  },
                  function(err){
                      $scope.error = err;
                  }
              );
          };

          //Lets watch and see how answer changes
          $scope.completed = false;
          $scope.answered = 0;
          $scope.$watch('answers' , function(newVal){
                if(newVal){
                   console.log(newVal);
                   $scope.answered = 0;
                   angular.forEach($scope.answers , function(answer){
                        if(answer){
                           answer.status? $scope.answered++ : '';
                        }
                        $scope.answered == $scope.questionsCount ? $scope.completed = true : $scope.completed = false;
                   });
                }
          } , true);

          //send a message to host to signal the status of the survey
          $scope.cancelTask = function(){
              $window.parent.postMessage({msg:'User cancelled the task', status:'cancel'}, '*');
          }

          //
          $scope.doneTask = function(){
              $scope.doneMsg = "Thank you !";
              $scope.processingCheckout = true;

              //
              (function analyzeDefinite(){
                  //@TODO analyze for definitive answers if a wrong results goes beyound allowed treshold of 75%,refresh and show user another survey and reduce karma
                  analyzeSpoofing();
              })();

              //
              function analyzeSpoofing(){
                 //@TODO analyze answers to see if users did'nt pick spoofed answers else show them another survey and reduce karma points
                 analyzeOpenEnded();
              }

              //
              function analyzeOpenEnded(){
                 //@TODO analyze open ended with NLP engine to see how correct answer provided was, spelling, sentence construct, correlation of
                 //answer to the context of the description and the question
                 checkout();
              }

              //
              function checkout(){
                  $timeout(function(){
                      $scope.processingCheckout = false;
                      alert('Survey completed checked out');
                  } , 3000);
              }
          }
    });

angular.module('surveysModule' , [])

//
.factory('Surveys' , function($q , $http , $timeout){
     //New Survey schema
     var surveySchema = {
          title:'Generic survey title',
          description:'Describe your survey here',
          target:{
              countries:[],
              interests:[]
          },
          package:{
             type:'',
             responses:'0'
          },
          questioneerId:'',
          answersId:'',
          creator:'palingramblog@gmail.com',
          billingInfo:{
              //@TODO contains info about the payment made
          },
          created:Date.now(), // will be modified on the server
          modified:Date.now(), // will be modified on server
          responses:'0',
          respondents:[],
          campaignStatus:'paused'
     };

     //
     var surveys;
     var activeSurvey;

     //
     function all(user){
          var promise = $q.defer();
          //
          if(!surveys){
              $http({
                  method: 'GET',
                  url:'/survey'+ (user ? '?creator='+user : '')
              })
              .success(function(data){
                   surveys = data;
                   promise.resolve(surveys);
              })
              .error(function(err){
                  promise.reject(err);
              });
          }
          else{
             promise.resolve(surveys);
          }

          return promise.promise;
     }

     //
     function getActive(){
         return activeSurvey;
     }

     //
     function setActive(survey){
         activeSurvey = survey;
     }

     //
     function save(survey){
         var promise = $q.defer();


         $http({
            method: 'POST',
            url: '/survey',
            data: survey
         })
         .success(function(data){
              console.log(data);
               activeSurvey = data;
               if(survey._id){
                   console.log('old');
                   for(var i=0; i<surveys.length; i++){
                       surveys[i]._id == data._id ?
                          surveys[i]=data : '';
                   }
               }
               else{
                  console.log('new');
                  surveys.unshift(data);
               }
               console.log(surveys.length);
               promise.resolve();
         })
         .error(function(err){
              promise.reject(err);
         });

         return promise.promise;
     }

     //
     function initNew(user){
          activeSurvey = surveySchema;
          activeSurvey.creator = user;
          return true;
     }

     //
     return {
        all:all,
        setActive:setActive,
        getActive:getActive,
        save:save,
        initNew : initNew
     };
})

//Abstract state controller for surveys route
.controller('surveysController' , function($scope , $state){
       console.log('surveys abstract controller loaded');
       //Act as a God to all its child-views
})

//
.controller('surveysOverviewController' , function($scope , $state , myMedia , Surveys , profile){
       //
       profile.getUser().then(
          function(user){
            Surveys.all(user.userInfo.email).then(
                 function(data){
                     $scope.surveys = data;
                 },
                 function(err){
                     console.log(err);
                 }
            );
          },
          function(err){
              console.log(err);
          }
       );

       //trasition to /surveys' child view
       $scope.transition = function(survey , view){
            Surveys.setActive(survey);
            console.log(view);

            switch (view) {
              case 'edit':
                 $state.go('dashboard.surveys.edit.setup' , {id:survey._id});
                 break;
              case 'preview':
                 $state.go('dashboard.surveys.preview' , {id:survey._id});
                 break;
              case 'stats':
                 $state.go('dashboard.surveys.stats' , {id:survey._id});
                 break;
            }
       }

       //create a new survey schema and send user to editor
       $scope.createSurvey = function(){
           profile.getUser().then(
               function(user){
                   console.log('Called');
                   Surveys.initNew(user.userInfo.email);
                   $state.go('dashboard.surveys.edit' , {id:1});
               },
               function(err){
                   console.log(err);
               }
           );
       }
})

//
.controller('surveysEditSetupController' , function($scope , $state , Surveys){
    //In case user cancels editing
    var original = Surveys.getActive();

    //
    if(!angular.isDefined(original)){
       $state.go('dashboard.surveys.overview');
    }

    //For use in this scope only
    $scope.survey = angular.copy(original);


    //Setup partial view controls defined here============================//
    $scope.packages = [
         {
            title:'10',
            highlight:false
         },
         {
            title:'20',
            highlight:true
         },
         {
            title:'30',
            highlight:false
         },
    ];

    //
    $scope.setPackage = function(package){
        $scope.survey.package.type = package.title;
        console.log($scope.survey.package.type);
    }

    //
    $scope.invalidPackage = function(){
      if($scope.survey){
          return $scope.survey.package.type == '';
      }
      else{
         return false;
      }
    }

    //
    $scope.invalidTarget = function(){
      if($scope.survey){
          return $scope.survey.target.countries.length ==0 || $scope.survey.target.interests.length==0;
      }
      else{
         return false;
      }
    }

    //
    $scope.activePackageClass = function(package){
         if($scope.survey){
             return $scope.survey.package.type == package.title;
         }
         return '';
    }

    //For country options and interests
    $scope.suggessions = {
        interest:{
            'music':['hiphop' , 'jazz' , 'r&b'],
            'movies':['triller' , 'animation' , 'comedy']
        },
        country:{
             'nigeria':['lagos' , 'porthacourt' , 'kano'],
             'united states':['califonia' , 'newyork']
        }
    };

    //
    $scope.cancel=function(){
         $scope.survey = angular.copy(original);
    }

    //
    $scope.save = function(survey){
         $scope.saving = true;
         Surveys.save(survey).then(
             function(){
                 original = Surveys.getActive();
                 $scope.survey = angular.copy(original);
                 $scope.saving = false;
             },
             function(err){
                 console.log(err);
             }
         );
    }
})

//Questions factory
.factory('Questioneer' , function($q , $http , $timeout){

       //
       var questionSchemas = {
            'Multiple_Choice' : {
                 type:'Multiple_Choice',
                 query:'What is the question again ?',
                 answers:[
                     'Option here',
                     'Option here',
                     'Option here',
                     'Option here'
                 ],
                 answer:-1,
                 options:{
                    multi:false,
                    definite:false
                 }
            }
       };

       //
       function getSchema(schema){
           if(!questionSchemas[schema]){
               alert(schema+' does not exist');
           }
           else{
             return questionSchemas[schema];
           }
       }

       //
       function getQuestions(questioneerId){
            var promise = $q.defer();

            $http({
                method: 'GET',
                url:'/questioneer',
                params:{id:questioneerId}
            })
            .success(function(data){
                 console.log(data);
                 promise.resolve(data);
            })
            .error(function(err){
                 console.log(err);
            });

            return promise.promise;
       }

       //
       function saveQuestioneer(questioneer){
            var promise = $q.defer();
            console.log(questioneer);
            $http({
                method: 'POST',
                url:'/questioneer',
                data:questioneer
            })
            .success(function(data){
                console.log(data);
                promise.resolve(true);
            })
            .error(function(err){
                 console.log(err);
                 promise.reject(err);
            });

            return promise.promise;
       }

       //
       return {
           getSchema : getSchema,
           getQuestions:getQuestions,
           saveQuestioneer:saveQuestioneer
       }
})

//
.controller('surveysEditBuilderController' , function($scope , $state, $timeout,  Surveys , Questioneer , Spinners){
      //In case user cancels editing
      $scope.survey = Surveys.getActive();

      //
      var original;
      if(!angular.isDefined($scope.survey)){
         $state.go('dashboard.surveys.overview');
      }
      else{
          Questioneer.getQuestions($scope.survey.questioneerId).then(
              function(data){
                  original = data;
                  $scope.questioneer = angular.copy(original);
              },
              function(err){
                  console.log(err);
              }
          );
      }

      //This triggers this view to create a new question when user click on a type in the sidemenu
      $scope.createQuestion = function(type){
          $scope.questioneer.questions.push(angular.copy(Questioneer.getSchema(type)));
      }

      //this is triggered when a question is saved
      $scope.saveQuestioneer = function(spinnerName){
          console.log(spinnerName+' herrrre' );
          Questioneer.saveQuestioneer($scope.questioneer).then(
              function(status){
                  console.log(status);
                  Spinners.spinner(spinnerName).hide();
              },
              function(err){
                  Spinners.spinner(spinnerName).error();
              }
          );
      }

      //This is the callback triggered by the question types directive
      $scope.removeQuestion = function(index , spinnerName){
          var temp = angular.copy($scope.questioneer);
          temp.questions.splice(index , 1);
          Questioneer.saveQuestioneer(temp).then(
              function(status){
                  console.log(status);
                  $scope.questioneer = angular.copy(temp);
                  temp = undefined;
                  Spinners.spinner(spinnerName).hide();
              },
              function(err){
                  Spinners.spinner(spinnerName).error();
              }
          );
      }
})

//
.controller('surveysEditBillingController' , function($scope , $state, Surveys){
      //In case user cancels editing
      var original = Surveys.getActive();

      //
      if(!angular.isDefined(original)){
         $state.go('dashboard.surveys.overview');
      }

      //For use in this scope only
      $scope.survey = angular.copy(original);
})

//
.controller('surveysPreviewController' , function($scope , $state, $stateParams){
       $scope.hello = 'surveys/preview '+$stateParams.id;
})

//
.controller('surveysStatsController' , function($scope , $state, $stateParams){
       $scope.hello = 'surveys/stats '+$stateParams.id;
})

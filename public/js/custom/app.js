angular.module('taskcoin' , [
     'ui.router' ,'mgcrea.ngStrap' ,
     'config' , 'authyComponent' ,
     'general.factories' , 'checkoutModule',
     'betalistModule' , 'ngSanitize',
     'homeModule'
])

//
.directive('minResponse' , function(){
    return {
       restrict:'A',
       require: 'ngModel',
   	   link: function(scope , elem , attrs , ngModel){
         ngModel.$validators.minResponse = function(modelValue){
               return modelValue >= 500 && /^[0-9]+$/.test(modelValue);
          }
   	   }
    }
})

//
.directive('inputOptions' , function(){
     return {
         scope:{
             selected:'=selected'
         },

         link: function(scope , elem , attrs){
             scope.placeholder  = attrs.placeholder;
             scope.list = scope.$eval(attrs.list);
         },

         template:['<span class="options-c col-xs-12">',
                       '<span class="options-input">',
                             '<input type="text" placeholder="{{placeholder}}" ng-model="newItem" input-focused="focused" ng-readonly="true">',
                             '<span class="icon-c"  ng-click="addItem(newItem)">',
                                   '<i class="icon fa fa-plus"></i>',
                             '</span>',
                             '<suggestions list="list" select="newItem" ng-show="focused" focused="focused"></suggestions>',
                       '</span>',
                       '<span class="option" ng-repeat="option in selected" ng-click="removeItem(item)">',
                            '<label class="">{{option}}</label>',
                            '<i class="icon fa fa-times"></i>',
                         '</span>',
                   '</span>'].join(''),

         controller: function($scope , $timeout){
             //
             $scope.$watch('list' , function(newVal){
                  if(newVal){
                      $scope.list = newVal;
                  }
             });

             //
             $scope.removeItem = function(item){
                  $scope.selected.splice($scope.selected.indexOf(item),1);
             }

             //
             $scope.addItem = function(item){
                  if(item && $scope.selected.indexOf(item) == -1){
                       $scope.selected.push(item);
                       $scope.newItem = '';
                  }
                  else{
                      console.log('invalid option');
                  }
             }
         }
     }
})

//
.directive('inputFocused' , function($timeout){
     return{
         scope:{focused:'=inputFocused'},
         link:function(scope , elem , attrs){
             elem.bind('focus' , function(e){
                  console.log('focus');
                  scope.focused = true;
             }).bind('blur' , function(e){
                 console.log('Blur');
                 $timeout(function(){
                      scope.focused = false;
                 } , 300);
             });
         }
     }
})

//
.directive('suggestions'  , function(){
      return{
           scope: {
               list:'=list',
               select:'=select',
               focused:'=focused'
           },

           template:[
               '<div class="suggestions">',
                    '<ul class="list">',
                        '<li ng-repeat="(key , val) in list" ng-mouseenter="setSubIndex($index , val)">',
                           '<div ng-show="$index==subIndex" class="sub">',
                              '<ul class="sub-list">',
                                  '<li ng-repeat="item in subVal" ng-click="selectItem(item)">',
                                      '{{item}}',
                                  '</li>',
                              '</ul>',
                           '</div>',
                           '{{key}}',
                        '</li>',
                    '</ul>',
               '</div>',
           ].join(''),
           controller:function($scope){
               //
               $scope.$watch('list' , function(newVal){
                    if(newVal){
                        $scope.list = newVal;
                    }
               });

               //
               $scope.subIndex = -1;
               $scope.subVal = [];
               $scope.setSubIndex = function(index , val){
                    $scope.subIndex = index;
                    $scope.subVal = val;
               }

               //
               $scope.selectItem = function(item){
                    $scope.select  = item;
                    $scope.subIndex = -1;
               }
           }
      }
})

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
                 $state.go('dashboard.surveys.edit' , {id:survey._id});
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
.controller('surveysEditController' , function($scope , $state , $stateParams , Surveys){
       //In case user cancels editing
       var original = Surveys.getActive();

       //@TODO for now redirect to surveys overview on refresh
       if(!angular.isDefined(original)){
          $state.go('dashboard.surveys.overview');
       }

       //For use in this scope only
       $scope.survey = angular.copy(original);

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
                return $scope.survey.package.type == package.title ? 'active' : '';
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

       //console.log(Object.keys($scope.suggessions));

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

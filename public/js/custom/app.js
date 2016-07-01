angular.module('taskcoin' , [
     'ui.router' ,'mgcrea.ngStrap' ,
     'config' , 'authyComponent' ,
     'general.factories' , 'checkoutModule',
     'betalistModule' , 'ngSanitize',
     'homeModule'
])

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
                             '<input type="text" placeholder="{{placeholder}}" ng-model="newItem" input-focused="focused">',
                             '<span class="icon-c"  ng-click="addItem(newItem)">',
                                   '<i class="icon fa fa-plus"></i>',
                             '</span>',
                             '<suggestions list="list" select="newItem" ng-show="focused"></suggestions>',
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
             $scope.$watch('selected' , function(newVal){
                  console.log(newVal);
             });

             $scope.removeItem = function(item){
                  $scope.selected.splice($scope.selected.indexOf(item),1);
             }

             //
             $scope.addItem = function(item){
                  if(item && $scope.selected.indexOf(item) == -1 && $scope.list.indexOf(item) != -1){
                       $scope.selected.push(item);
                  }
                  else{
                      console.log('invalid option');
                  }
             }

             $timeout(function () {

             }, 1000);
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
               select:'=select'
           },

           template:[
               '<div class="suggestions">',
                    '<ul class="list">',
                        '<li ng-repeat="item in list | filter:select"><a href="" ng-click="selectItem(item)">{{item}}</a></li>',
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
               $scope.selectItem = function(item){
                    console.log(item);
                    $scope.select
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
          } , 100);
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
       $scope.activePackage  = '';
       $scope.setPackage = function(package){
           $scope.activePackage = package;
           console.log($scope.activePackage);
       }

       //
       $scope.activePackageClass = function(package){
            return $scope.activePackage == package ? 'active' : '';
       }

       $scope.interest = {
           suggessions:['merron' , 'jay'],
           selected:[]
       };

       $scope.country = {
           suggessions:['nigeria' , 'united states' , 'united kingdom' , 'ghana' , 'kenya' , 'merge' , 'hera' , 'jerr'  ,'puri' ,'juni'],
           selected:[]
       };

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

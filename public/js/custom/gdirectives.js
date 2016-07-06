angular.module('general.directives' , [])

//MAkes sure that an input box meets the criteria
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

.directive('surveyeditormenu' ,  function(){
      return {
          restrict:'E',
          templateUrl : '/views/directiveviews/survey.editor.menu.html',
          scope:{
              select:'&select'
          },
          link:function(scope , elem , attrs){
              scope.view = attrs.view;
          },
          controller:function($scope , $state, $stateParams){
                //
                $scope.questionsTypes = [
                   {icon:'fa-list-alt', name:'Multiple Choice'},
                   {icon:'fa-chevron-circle-down', name:'Dropdown'},
                   {icon:'fa-thumbs-o-up',name:'Net Promoter Score'},
                   {icon:'fa-credit-card',name:'Single Textbox'},
                   {icon:'fa-user',name:'Contact Information'},
                   {icon:'fa-outdent',name:'New Segment'}
                ];

                //
                $scope.selectItem = function(type){
                    type = type.trim().split(' ').join('_');
                    if($scope.select){
                       $scope.select({type:type});
                    }
                }

                //
                $scope.changeState = function(state){
                    $state.go('dashboard.surveys.edit.'+state.trim() , {id:$stateParams.id});
                }

                //
                $scope.isViewActive = function(view){
                     return view == $scope.view?'active':'inactive';
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
          }
      }
})

//directive for multiple choice question
.directive('multipleChoice' , function(){
     return {
        scope:{
            notifyRemove: '&remove',
            notifySave: '&save',
            mode: '@mode',
            index:'@index',
            question:'=question'

        },
        templateUrl:'/views/directiveviews/question.multiplechoice.html',
        controller:function($scope, $timeout){
            //
            var original;
            //
            $scope.addAnswer = function(index){
                $scope.question.answers.splice(index+1 , 0 , '');
            }

            //
            $scope.removeAnswer = function(index){
                $scope.question.answers.splice(index , 1);
            }

            //
            $scope.cancel = function(){
                 $scope.question = original;
                 $scope.edit = false;
            }

            //
            $scope.save = function(){
                original = angular.copy($scope.question);
                $scope.edit = false;
                $scope.notifySave();
            }

            //
            $scope.deleteQuestion = function(){
                console.log('delete called');
                $scope.notifyRemove({index:$scope.index});
            }

            //
            $scope.editQuestion = function(){
                console.log('edit called');
                $scope.edit = true;
                original = angular.copy($scope.question);
           }
        }
     }
});

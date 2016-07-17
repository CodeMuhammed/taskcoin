angular.module('general.directives' , [])

//A custom affix module
.directive('affix' , function($window , $document , $timeout){
     return{
         restrict: 'A',
         scope:{
             affix: '@affix'
         },
         link:function(scope, element , attrs){
             var marginTop;
             $window.addEventListener('scroll' , function(e){
                 var elem = document.querySelector('[affix="'+scope.affix+'"]');
                 var rect = elem.getBoundingClientRect();
                 if(rect.top >= 0){
                   $timeout(function(){
                     marginTop = 0 + 'px';
                     elem.setAttribute('style' , 'margin-top:'+marginTop);
                   } , 500);
                 }
                 if(rect.top < 0){
                    $timeout(function(){
                      marginTop = e.pageY-150 + 'px';
                      elem.setAttribute('style' , 'margin-top:'+marginTop);
                    } , 500);
                 }
             });
         }
     }
})


//Makes sure that an input box meets the criteria
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
                       '<span class="option" ng-repeat="option in selected" ng-click="removeItem($index)">',
                            '<label class="">{{option}}</label>',
                            '<i class="icon fa fa-times"></i>',
                         '</span>',
                   '</span>'].join(''),

         controller: function($scope , $timeout , alertService){
             //
             $scope.$watch('list' , function(newVal){
                  if(newVal){
                      $scope.list = newVal;
                  }
             });

             //
             $scope.removeItem = function(index){
                  $scope.selected.splice(index,1);
             }

             //
             $scope.addItem = function(item){
                  if(item && $scope.selected.indexOf(item) == -1){
                       $scope.selected.push(item);
                       $scope.newItem = '';
                  }
                  else{
                      alertService.alert({msg:'Item already added' , class:'info'});
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
                        '<li ng-repeat="(key , val) in list" ng-mouseenter="setSubIndex($index , val)" ng-click="selectItem(key , 0)">',
                           '<div ng-show="$index==subIndex && subVal.length>0" class="sub">',
                              '<ul class="sub-list">',
                                  '<li ng-repeat="item in subVal" ng-click="selectItem(item , 1)">',
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
               $scope.selectItem = function(item , layer){
                    if(layer == 1){
                       $scope.select  = item;
                    }
                    else{
                       if($scope.subVal.length > 0){
                           //
                       }
                       else{
                          $scope.select  = item;
                       }
                    }
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
                   {icon:'fa-outdent',name:'Segment Title'},
                   {icon:'fa-list-alt', name:'Multiple Choice'},
                   {icon:'fa-credit-card',name:'Textbox'},
                   {icon:'fa-thumbs-o-up',name:'Net Promoter Score'}
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
              notifyRemove: '&remove', //Notifies the parent directive to delete the question
              notifySave: '&save',  //Notify the parent directive to save chages made to the question
              mode: '@mode', //Tell the directive wether or not to enable editor
              index:'@index', //Tells the directive the index position of question in the array
              question:'=question', // The question to be used by the directive view
              answer:'=answer'// The answer to be exported from this directive
          },
          templateUrl:'/views/directiveviews/question.multiplechoice.html',

          controller:function($scope, $timeout){
                /**================================BEGINS EDITOR LOGIC==================================================**/
                //This keeps track of the prestine version of the question incase a user ever wants to revert
                var original;

                //This saves the prestine state and switch to the editor mode
                $scope.editQuestion = function(){
                    $scope.edit = true;
                    initOptions();
                    original = angular.copy($scope.question);
               }

               //This binds to the answers checkboxes
               function initOptions(){
                   $scope.answerOptions  = [];
                   for(var i=0; i<$scope.question.answers.length; i++){
                       $scope.answerOptions[i] = false;
                       if($scope.question.answer == i && $scope.question.options.definite){
                           $scope.answerOptions[i] = true;
                       }
                   }
               };
               initOptions();

                //This adds an option to the answers
                $scope.addAnswer = function(index){
                     $scope.question.answers.splice(index+1 , 0 , '');
                     $scope.question.answer = '';
                     initOptions();
                }

                //As function name implies
                $scope.removeAnswer = function(index){
                    $scope.question.answers.splice(index , 1);
                    $scope.question.answer = -1;
                    initOptions();
                }

                //When definite answer is set to true, users can pick an options as the answer to be expected from users : Good for validation
                $scope.pickAsAnswer = function(index){
                    for(var i=0; i<$scope.answerOptions.length; i++){
                        if(i == index){
                          $scope.answerOptions[i] = true;
                        }
                        else{
                          $scope.answerOptions[i] = false;
                        }
                    }
                    $scope.question.answer = index;
                    console.log(index);
                }

                //Reverts to previous prestine state
                $scope.cancel = function(){
                     $scope.question = original;
                     $scope.edit = false;
                }

                //This method triggers the callback set on the parent scope to commence with saving the data
                $scope.save = function(){
                    $scope.notifySave({callback:function(status){
                         if(status){
                            original = angular.copy($scope.question);
                         }
                    }});
                }

                //This method triggers the callback set on the parent scope to commence with deleting the data
                $scope.deleteQuestion = function(){
                    $scope.notifyRemove({index:$scope.index});
                }

               //This rule ascertain that user actually selected an option when definete is true
               $scope.definiteInValid = function(){
                     if($scope.question.options.definite){
                         return $scope.question.answer == -1;
                     }
                     return false;
               }

              /**================================BEGINS LLIVE PREVIEW LOGIC=========================================**/
              $scope.answer = {
                  type:$scope.question.type,
                  option: $scope.question.options.multi? [] : '',
                  comment:'',
                  status:false
              };

              //
              $scope.isInAnswer = function(option){
                  if($scope.answer.option == '' || $scope.answer.option == []){
                      return false;
                  }
                  else{
                      if($scope.question.options.multi){
                          return  $scope.answer.option.indexOf(option) >= 0;
                      }
                      else{
                          return $scope.answer.option == option;
                      }
                  }
              }

              //Normal options logic
              $scope.toggleAnswer = function(option){
                  if($scope.question.options.multi){ //where multi-option is required
                      var index = $scope.answer.option.indexOf(option);
                      if(index >= 0){
                          $scope.answer.option.splice(index , 1);
                          $scope.answer.option.length>0 ? ($scope.answer.status = true) : $scope.answer.status = false;
                      }
                      else{
                          $scope.answer.option.push(option);
                          $scope.answer.status = true;
                      }
                  }
                  else{ //where single option is required
                         $scope.commentSelected = false;
                         console.log(option);
                         $scope.answer.option = option+'';
                         $scope.answer.status = true;
                         $scope.answer.comment = '';
                  }
              }

              //Comment answer logic
              $scope.commentSelected = false;
              $scope.selectComment = function(option){
                  $scope.toggleAnswer(option);
                  $scope.commentSelected = true;
              }
          }
     }
})

//Directive for open ended questions
.directive('textbox' , function(){
     return{
         scope:{
             notifyRemove: '&remove', //Notifies the parent directive to delete the question
             notifySave: '&save',  //Notify the parent directive to save chages made to the question
             mode: '@mode', //Tell the directive wether or not to enable editor
             index:'@index', //Tells the directive the index position of question in the array
             question:'=question', // The question to be used by the directive view
             answer:'=answer'// The answer to be exported from this directive
         },
         templateUrl:'/views/directiveviews/question.textbox.html',
         controller:function($scope){
            var original = $scope.question;
             //
             $scope.answer = {
                 type:$scope.question.type,
                 option:'',
                 comment:'',
                 status:false
             };

             //
             //This method triggers the callback set on the parent scope to commence with saving the data
             $scope.save = function(){
                 $scope.notifySave({callback:function(status){
                      if(status){
                         original = angular.copy($scope.question);
                      }
                 }});
             }

             //This method triggers the callback set on the parent scope to commence with deleting the data
             $scope.deleteQuestion = function(){
                 $scope.notifyRemove({index:$scope.index});
             }

             //This saves the prestine state and switch to the editor mode
             $scope.editQuestion = function(){
                 $scope.edit = true;
                 original = angular.copy($scope.question);
            }

            //Reverts to previous prestine state
            $scope.cancel = function(){
                 $scope.question = original;
                 $scope.edit = false;
            }




             //Watch the answer and see if it is a valid one
             $scope.$watch('answer.option' , function(newVal){
                  if(newVal){
                       //@TODO apply actual validation logic for the different input types
                       newVal.length>2 ? ($scope.answer.status = true) : $scope.answer.status = false;
                  }
             });
         }
     }
})

//New segment directive
.directive('segmentTitle' , function(){
    return {
        scope:{
            notifyRemove: '&remove',
            notifySave: '&save',
            text:'=text',
            mode:'@mode',
            index:'@index'
        },
        templateUrl:'/views/directiveviews/question.segmenttitle.html',
        controller:function($scope){
             var original = angular.copy($scope.text);

             //
             $scope.saveTitle = function(){
                 $scope.notifySave({callback:function(status){
                    if(status){
                        original = angular.copy($scope.text);
                    }
                 }});
                 $scope.edit = false;
             }

             //
             $scope.deleteTitle = function(){
                  $scope.notifyRemove({index:$scope.index});
             }
        }
    }
});

angular.module('alertModule' , [])

.factory('alertService' , function(){
     var alertApi;

     //
     function register(api){
          alertApi = api;
     }

     //
     function alert(alertObj){
          alertApi.addAlert(alertObj);
     }

     //
     return{
         register:register,
         alert:alert
     }
})
.directive('taskcoinAlert' , function(){
     return {
         template:[
            '<div class="taskcoin-alert">',
              '<div ng-repeat="alert in alerts" class="alert {{alert.class}}">{{alert.msg}}<i class="icon fa fa-times pull-right"></i></div>',
            '</div>'
         ].join(''),
         controller:function($scope , $timeout , alertService){
              //
              $scope.alerts = [];

              //Register this directive functions with the service
              alertService.register({
                   addAlert:function(alertObj){
                       $scope.alerts.push(alertObj);
                       var timeout = $timeout(function(){
                           $scope.alerts.splice(0 , 1);
                           $timeout.cancel(timeout);
                       } , 5000);
                   }
              });
         }
     }
});

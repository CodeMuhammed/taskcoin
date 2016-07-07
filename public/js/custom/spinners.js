angular.module('spinnersModule' , [])

   .factory('Spinners' , function($q){
        //An object to hold the spinners objects
        var Spinners = {};
        var spinnerId = 10000;

        //
        function register(spinnerObj){
             var promise = $q.defer();

             // give this spinner a unique id
             spinnerObj.id = 'spinner'+spinnerId++;

             //Do not register spinner with the same name twice
             if(!Spinners[spinnerObj.id]){
                 Spinners[spinnerObj.id] = (function(spinnerObj){
                     var promise = $q.defer();
                     return{
                         show: function(){
                             spinnerObj.show();
                             return promise.promise;
                         },
                         hide: function(){
                             promise.notify(true);
                             spinnerObj.hide();
                         },
                         error: function(){
                           promise.notify(false);
                           spinnerObj.hide();
                         }
                     }
                 })(spinnerObj);
             }
             promise.resolve(spinnerObj.id);

             return promise.promise;
        }

        //
        function spinner(id){
             console.log('here ', id);
             return Spinners[id];
        }

        //
        return{
            register:register,
            spinner: spinner
        }
   })

   .directive('spinner' , function(){
        return {
            restrict: 'E',
            transclude:true,
            scope:{
               id:'=id'
            },
            template: [
              '<span>',
              '  <i class="icon fa fa-spinner fa-spin" ng-show="show"></i>',
              '  <ng-transclude ng-hide="show"></ng-transclude>',
              '</span>'
            ].join(''),
            controller:function($scope , $timeout , Spinners){
                 //
                 $scope.show = false;

                 //Registers this spinner with the factory
                 Spinners.register({
                     show:function(){
                         $timeout(function(){
                             console.log('show recieved');
                             $scope.show = true;
                         });
                     },
                     hide:function(){
                         $scope.show = false;
                     }
                 }).then(function(spinnerId){
                       $scope.id = spinnerId;
                 });
            }
        }
   });

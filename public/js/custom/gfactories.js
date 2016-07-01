angular.module('general.factories' , [])

    //
    .factory('myMedia' , function($rootScope , $window , $timeout , $interval){
        //@TODO get media breakpoints constants
        //Define media queries on the returned object
        //Set up a watch function on the window property
        $rootScope.window  = $window;
        //All values for media in px
        var MAX = 100000000;

        var mediaQueries = {
            'xs':{min:0 , max:599},
            'gt-xs':{min:600, max:MAX},
            'sm':{min:600 , max:959},
            'gt-sm':{min:960 , max:MAX},
            'md':{min:960 , max:1279},
            'gt-md':{min:1280, max:MAX},
            'lg':{min:1920 , max:1919},
            'gt-lg':{min:1920, max:MAX},
            'xl':{min:1920 , max:MAX}
        };

        //init media querybool object to reflect the true falses
        //values of the media queries based on screen size
        var mediaBool = {};

        function initBool(initialWidth){
            angular.forEach(mediaQueries , function(val , key){
                 mediaBool[key] = initialWidth >= val.min && initialWidth <= val.max
            });
        };


        //Setup a watch to update values when width changePurpose
        //Research a more optimal solution that does not use interval
        $rootScope.$watch('window.outerWidth' , function(newVal , oldVal){
            initBool($window.outerWidth);
            console.log('Width changed');
        });

        //why does this work ?
        $interval(function(){} , 10);

        return mediaBool;
    });

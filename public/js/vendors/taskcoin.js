//Taskcoin API v_1.0
//@2016. https://www.taskcoin.io/docs?api=1

(function(window , document){

    //This prevents multiple initialzation of the API
    var ensure = function(obj , name , factory){
         return obj[name] || (obj[name] = factory());
    };

    //Taskcoin object definition
    var Taskcoin = ensure(window , 'Taskcoin' , function(){

        //This function fires up the messaging channel between merchant domain and taskcoin.io
        var setupMessenger = function (){
             var initialized = false;
             return {
                 initOnce:function(options){
                     if(!initialized){
                         //@TODO how to remove element by ID in JavaScript
                         /*window.addEventListener('message', function(event) {
                            var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
                            if (origin === 'http://localhost:5001'){
                                if(event.data.status === 'cancel'){
                                     document.findElementById('taskcoin').remove()
                                     document.find('html').css({overflow:'auto'});
                                     options.cancel();
                                }
                                else if(event.data.status === 'done'){
                                    document.findElementById('taskcoin').remove();
                                    options.success();
                                }
                                else if(event.data.status === 'verify'){
                                    event.source.postMessage({msg:'Verify host', status:'verify' , config:options.config}, '*');
                                }
                            }
                        });*/
                        initialized = true;
                     }
                 }
             }
        }

        //
        var initialize = function(options){
              (function(){
                   console.log(document);
                   /*var taskcoin = document.element(
                     '<div id="taskcoin" class="col-xs-12">'+
                        '<iframe id="frame" src="http://localhost:5001#!/pay" class="col-xs-12 col-sm-6 col-sm-offset-3"'+
                             'style="padding:0; height:100%; border:none; box-shadow:0px 5px 10px rgba(100 , 100 , 100 , .3);">'+
                        '</iframe>'+
                     '</div>'
                   );
                   taskcoin.css({
                      width:'100%',
                      height:'100%',
                      padding:0,
                      position:'fixed',
                      backgroundColor:'rgba(0,0,0,.5)',
                      zIndex:'100000000000000'
                   });
                   
                   document.find('body').eq(0).prepend(taskcoin);
                   document.find('html').css({overflow:'hidden'});*/
              })();

              //initialize the event listener that will recieve messages from paystack.io
              setupMessenger().initOnce(options);
        }

        //Method exposed to merchant domain
        return {
            initialize:initialize
        };
    });
})(window , document);

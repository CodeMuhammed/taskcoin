//Taskcoin MERCHANT API v_1.0
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
                         window.addEventListener('message', function(event) {
                            var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
                            if (origin === 'http://localhost:5001'){ //@TODO point to online resource online
                                if(event.data.status === 'cancel'){
                                     document.getElementById('taskcoin').remove();
                                     document.getElementsByTagName('html')[0].setAttribute('style' , 'overflow:auto');
                                     options.cancel();
                                }
                                else if(event.data.status === 'done'){
                                    document.getElementById('taskcoin').remove();
                                    options.success();
                                }
                                else if(event.data.status === 'verify'){
                                    event.source.postMessage({msg:'Verify host', status:'verify' , config:options.config}, '*');
                                }
                            }
                        });
                        initialized = true;
                     }
                 }
             }
        }

        //
        var initialize = function(options){
              (function(){
                   //Append taskcoin css to  the head
                   (function(el){
                       var div = document.createElement('div');
                       div.innerHTML = '<link rel="stylesheet" type="text/css" href="http://localhost:5001/css/taskcoin.css"/>';
                       while (div.children.length > 0) {
                         el.appendChild(div.children[0]);
                       }
                       appendHtml(document.body);
                   })(document.head);

                   //Append taskcoin iframe to the body
                   function appendHtml(el) {
                        var div = document.createElement('div');
                        div.innerHTML = '<div class="taskcoin" id="taskcoin">'+
                                           '<iframe src="http://localhost:5001#!/pay" class="frame"></iframe>'+
                                         '</div>';
                        while (div.children.length > 0) {
                          el.appendChild(div.children[0]);
                        }
                   };

                   //Temporarily disable the scroll for parent frame
                   document.getElementsByTagName('html')[0].setAttribute('style' , 'overflow:hidden');
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

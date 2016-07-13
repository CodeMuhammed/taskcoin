//Taskcoin MERCHANT API v_1.0
//@2016. https://www.taskcoin.io/docs?api=1

(function(window , document){
    //
    var baseUrl = 'http://localhost:5001';
    //var baseUrl = 'https://taskcoin-demo.herokuapp.com';

    //This prevents multiple initialzation of the API
    var ensure = function(obj , name , factory){
         return obj[name] || (obj[name] = factory());
    };

    //Taskcoin object definition
    var Taskcoin = ensure(window , 'Taskcoin' , function(){

        //Append taskcoin css to  the head
        (function(el){
            var div = document.createElement('div');
            div.innerHTML = '<link rel="stylesheet" type="text/css" href="'+baseUrl+'/css/taskcoin.css"/>';
            while (div.children.length > 0) {
              el.appendChild(div.children[0]);
            }
            appendHtml(document.body);
        })(document.head);

        //Append taskcoin iframe to the body
        function appendHtml(el) {
             var div = document.createElement('div');
             div.innerHTML = '<div id="taskcoin">'+
                                 '<iframe src="'+baseUrl+'#!/pay"></iframe>'+
                              '</div>';
             while (div.children.length > 0) {
               el.appendChild(div.children[0]);
             }

             //
             listenForMerchant();
        };

        //Create an event listener for merchants messages
        var Options;
        var Source;
        function listenForMerchant(){
            var initialized = false;
            if(!initialized){
                window.addEventListener('message', function(event) {
                   var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.

                   if (origin === baseUrl){
                       Source = event.source;
                       if(event.data.status === 'verify'){
                           event.source.postMessage({msg:'Verify merchants website', status:'verifyMerchant'}, '*');
                       }
                       else if(event.data.status === 'cancel'){
                            document.getElementsByTagName('html')[0].setAttribute('style' , 'overflow:auto');
                            document.getElementById('taskcoin').classList.toggle("show");
                            Options.cancel();
                       }
                       else if(event.data.status === 'done'){
                            document.getElementsByTagName('html')[0].setAttribute('style' , 'overflow:auto');
                            document.getElementById('taskcoin').classList.add("hide");
                            Options.success();
                       }
                   }
               });
               initialized = true;
            }
        }

        //This kick starts the authorization, survey dance
        //This function fires up the messaging channel between merchant domain and taskcoin.io.
        var checkout = function(options){
            if(Source){
                //Show overlay
                document.getElementsByTagName('html')[0].setAttribute('style' , 'overflow:hidden');
                document.getElementById('taskcoin').classList.toggle("show");

                Options = options;
                Source.postMessage({msg:'Refresh surveys for user', status:'refresh' , config:Options.config}, '*');
            }

        }

        //Method exposed to merchant domain
        return {
            checkout:checkout
        };
    });
})(window , document);

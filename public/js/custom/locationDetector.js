angular.module('locationDetector' , [])

//This module gets user ip addresses using stun if available or simply use the navigator object
//To ask for the users location

.factory('GeoLocation' , function($q , $timeout , $http , $window){
    var location = {
       detectionMode:'', // STUN or GEO
       info:{}, // country name in lower case
       lat:'', // latitude from GEO
       long:'' // longitude from GEO
    };

    //get the IP addresses associated with an account using STUN method
    function getCountryIp(callback){

       //Function to get an rtc connection
       //compatibility for firefox and chrome
       function rtcGetPeerConnection(){
            // Based on work by https://github.com/diafygi/webrtc-ips

            var RTCPeerConnection = window.RTCPeerConnection
                          || window.mozRTCPeerConnection
                          || window.webkitRTCPeerConnection;

            //bypass naive webrtc blocking
            if (!RTCPeerConnection) {
                var iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                var win = iframe.contentWindow;
                window.RTCPeerConnection = win.RTCPeerConnection;
                window.mozRTCPeerConnection = win.mozRTCPeerConnection;
                window.webkitRTCPeerConnection = win.webkitRTCPeerConnection;
                RTCPeerConnection = window.RTCPeerConnection
                    || window.mozRTCPeerConnection
                    || window.webkitRTCPeerConnection;
            }

            return RTCPeerConnection;
        }

        var ip_dups = {};
        var RTCPeerConnection = rtcGetPeerConnection();

        //minimal requirements for data connection
        var mediaConstraints = {
            optional: [{RtpDataChannels: true}]
        };

        var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

        //construct a new RTCPeerConnection
        //@TODO check to see if pc is online
        var pc = new RTCPeerConnection(servers, mediaConstraints);

        function handleCandidate(candidate){
            //match just the IP address
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
            var ip_addr = ip_regex.exec(candidate)[1];

            //remove duplicates
            if(ip_dups[ip_addr] === undefined){
                return ip_addr;
            }

            ip_dups[ip_addr] = true;
        }

        //listen for candidate events
        pc.onicecandidate = function(ice){
            //skip non-candidate events
            if(ice.candidate)
                handleCandidate(ice.candidate.candidate);
        };

        //create a bogus data channel
        pc.createDataChannel("");

        //create an offer sdp
        pc.createOffer(function(result){

            //trigger the stun server request
            pc.setLocalDescription(result, function(){}, function(){});

        }, function(){});

        //wait for a while to let everything done
        $timeout(function(){
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');
            var ips = [];

            lines.forEach(function(line){
                if(line.indexOf('a=candidate:') === 0){
                    ips.push(handleCandidate(line));
                }
            });

            //Return array of ip addresses to calling function
            callback(ips[ips.length-1]);

        }, 3000);
    }

    //Gets location information from ip address
    function getLocationInfo(ip , callback){
        console.log(ip);
        $http({
          method:'GET',
          url:'http://freegeoip.net/json/'+ip
        })
        .success(function(data){
             callback(null , data);
        })
        .error(function(err){
             callback(err , null);
        });
    }


    //public function to get location
    function getLocation(){
         var promise = $q.defer();

         //check if user is online
         if($window.navigator.onLine){
             //Get clients ip addresses using STUN server
             getCountryIp(function(ip){
                 if(ip){
                     getLocationInfo(ip , function(err , info){
                          if(err){
                              console.log('could not get location info');
                              //@TODO use alternative mode like asking user for location
                          }
                          else{
                             location.detectionMode = 'STUN';
                             location.info = info;
                             console.log(location);
                          }
                     });
                 }
                 else{
                    //@TODO use GeoLocation method instead
                 }
             });
         }
         else{
            alert('You are currently offline');
         }

         return promise.promise;
    }

     //
     return {
         getLocation:getLocation
     }
});
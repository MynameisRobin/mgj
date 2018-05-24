(function() {

    var self = amGloble.page.videoDemo = new $.am.Page({
        id: "page-videoDemo",
        backButtonOnclick: function() {
            var self = this;
            this.player.pause();
        },

        init: function() {
            /*this.video=document.getElementById("video");
            this.player = new Clappr.Player({
              source: 'http://www.w3school.com.cn/example/html5/mov_bbb.mp4',
              poster: 'http://clappr.io/poster.png',
              mute: true,
              height: 360,
              width: 640
            });*/
            var playerElement = document.getElementById("videoBox");

            this.player = new Clappr.Player({
                events: {
                    onReady: function() { 

                    }, //Fired when the player is ready on startup
                    onResize: function() { 
                        
                    },//Fired when player resizes
                    onPlay: function() { 
                        console.log(this);

                    },//Fired when player starts to play
                    onPause: function() { 

                    },//Fired when player pauses
                    onStop: function() { 

                    },//Fired when player stops
                    onEnded: function() { 

                    },//Fired when player ends the video
                    onSeek: function() { 

                    },//Fired when player seeks the video
                    onError: function() { 

                    },//Fired when player receives an error
                    onTimeUpdate: function() { 

                    },//Fired when the time is updated on player
                    onVolumeUpdate: function() { 
                        console.log("111");
                    },//Fired when player updates its volume
                },
                source: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
                poster: 'http://clappr.io/poster.png',
                mute: false,
                width: $(window).width()
            });

            

            this.player.on(Clappr.Events.PLAYER_FULLSCREEN, function() {
                var w=$(window).width();
                var h=$(window).height();
                if(w<h){//竖屏
                    navigator.appplugin.rotateToLandscape();
                }else{
                    navigator.appplugin.rotateToPortrait();
                }
            })

            this.player.attachTo(playerElement);
            this.player.setVolume(80);
            $(playerElement).find("video")[0].setAttribute("webkit-playsinline",true);
            this.$.find("#video_start").on("vclick",function(){
                $.am.debug.log("video: click");
                try{
                    self.player.play();
                }catch(e){
                    $.am.debug.log(e);
                }
                
            });
            this.$.find(".back").on("vclick",function(){
                $.am.changePage($.am.history[$.am.history.length-1],"slideleft");
                self.player.pause();
            });

            var players=new MediaElementPlayer($("#player1")[0], {
                success: function (media) {
                

                    media.addEventListener('error', function (e) {
                        console.log(e);
                    });
                    media.addEventListener('pause', function (e) {
                        console.log("暂停");
                    });  
                    media.addEventListener('loadedmetadata', function (e) {
                        console.log(e);
                    }); 
                },
                // 额外扩展的方法
                fullCallback:function(info){
                    if(info=="enter"){
                        navigator.appplugin.rotateToLandscape();
                    }else{
                        navigator.appplugin.rotateToPortrait();
                    }
                    setTimeout(function() {
                        if($.am.checkScroll(true)>=11){
                            $("body").height(window.innerHeight + 20);
                        }else{
                            $("body").height(window.innerHeight);
                        }
                        $.am.getActivePage().refresh();
                    }, 100);
                }
            });
            console.log(players);



        },

        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }
        },
        afterShow: function(paras) {
            this.player.play();
            
            //this.player.attachTo(this.video);
            //$.am.debug.log("video: " + this.video);
        },
        beforeHide: function() {},

    });

})();
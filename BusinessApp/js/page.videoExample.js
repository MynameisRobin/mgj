(function() {

    var self = amGloble.page.videoExample = new $.am.Page({
        id: "page-videoExample",
        init: function() {
            
        },

        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }
        },
        afterShow: function(paras) {
            //this.video.play();
            SewisePlayer.setup({
				server: "vod",
				type: "mp4",
				lang: 'zh_CN',
				logo: "http://onvod.sewise.com/libs/swfplayer/skin/images/logo.png",
		        poster: "http://jackzhang1204.github.io/materials/poster.png",
				videosjsonurl: {
	                "programname":"JSON URL",
	                "videos": [
	                    {
							"key": 0,
							"clarity": "low",
							"name": "流畅",
							"url": "http://jackzhang1204.github.io/materials/mov_bbb.mp4"
						},
						{
							"key": 1,
							"clarity": "normal",
							"name": "标清",
							"url": "http://jackzhang1204.github.io/materials/mov_bbb.mp4"
						},
						{
							"key": 3,
							"clarity": "original",
							"name": "原画",
							"url": "http://jackzhang1204.github.io/materials/mov_bbb.mp4"
						}
	                ]
	            },
		        skin: "vodFlowPlayer",
		        topbardisplay: "disable",
		        fallbackurls:{
					ogg: "http://jackzhang1204.github.io/materials/mov_bbb.ogg",
					webm: "http://jackzhang1204.github.io/materials/mov_bbb.webm"
				}
			});
        },
        beforeHide: function() {}

    });

})();
videojs.addLanguage('zh-CN', {
    "Play": "播放",
    "Pause": "暂停",
    "Current Time": "当前时间",
    "Duration": "时长",
    "Remaining Time": "剩余时间",
    "Fullscreen": "全屏",
    "Non-Fullscreen": "退出全屏",
    "Mute": "静音",
    "Unmute": "取消静音",
    "You aborted the media playback": "视频播放被终止",
    "A network error caused the media download to fail part-way.": "网络错误导致视频下载中途失败。",
    "The media could not be loaded, either because the server or network failed or because the format is not supported.": "视频因格式不支持或者服务器或网络的问题无法加载。",
    "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.": "由于视频文件损坏或是该视频使用了你的浏览器不支持的功能，播放终止。",
    "No compatible source was found for this media.": "无法找到此视频兼容的源。",
    "The media is encrypted and we do not have the keys to decrypt it.": "视频已加密，无法解密。",
    "Play Video": "播放视频",
    "Close": "关闭",
    "Modal Window": "弹窗",
});

window.VideoPlayer = {
    bindEvent: function () {
        // bind click event for video dialog
        var _this = this;
        var videoCloseWrap = document.getElementById("videoCloseWrap"); // close the video 
        if (videoCloseWrap) {
            videoCloseWrap.onclick = function (e) {
                e.stopPropagation();
                _this.disposeVideoPlayer(_this.videoInfo.viewUrl);
            }
        }
        var videoMask = document.getElementById('videoMask');
        if (videoMask) {
            videoMask.onclick = function (e) {
                e.stopPropagation();
                _this.disposeVideoPlayer(_this.videoInfo.viewUrl);
            }
        }
    },
    initVideoDom: function (videoInfo) {
        // init the video dom for video
        var html = ['<div class="videoMask" id="videoMask"></div><div class="videoWrap" id="videoWrap"><div id="videoCloseWrap" class="closeWrap"><div class="videoClose"></div></div><div class="videoHeader"><div class="videoHeraderWrap"><span id="videoTitle" class="videoTitle">',
            videoInfo.title, '</span><p id="videoNote" class="videoNote">',
            videoInfo.outline, '</p></div></div><div id="videoWrapper">',
            '<video id="myVideo" class="video-js  vjs-big-play-centered" x5-playsinline="true" webkit-playsinline="true" playsinline="true" x-webkit-airplay="allow" controls preload="auto" width="654" height="368"  data-setup="{}"><source id="videoSrc" src="',
            videoInfo.viewUrl,
            '" type="video/mp4"></video>', '</div><div id="videoFooter" class="videoFooter"><span class="videoTip">美管加视频帮助系统</span></div></div>'
        ].join("");
        var div = document.createElement('div');
        div.setAttribute('id', 'dialogVideoWrap');
        div.innerHTML = html;
        document.body.appendChild(div);
        this._$dialogVideoWrap = div; // video dialog wrap
        this._$videoTitle = document.getElementById('videoTitle'); // video title node
        this._$videoNote = document.getElementById('videoNote'); // video note node
        this._$videoWrapper = document.getElementById('videoWrapper'); // video wrapper node
        this.bindEvent();
    },
    decrypt: function(word,key){
        var key = CryptoJS.enc.Utf8.parse(key);
        var decrypt = CryptoJS.AES.decrypt(word, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    },
    showVideo: function (videoInfo) {
        // show video dom
        this.videoInfo = videoInfo;
        videoInfo.viewUrl=this.decrypt(videoInfo.viewUrl,"MGJAESCRYPTO2019");
        if (!this._$dialogVideoWrap) {
            this.initVideoDom(videoInfo);
        } else {
            this._$dialogVideoWrap.style.display = "block";
            this._$videoTitle.innerText = videoInfo.title;
            this._$videoNote.innerText = videoInfo.outline;
            this._$videoWrapper.innerHTML = '<video id="myVideo" class="video-js  vjs-big-play-centered" x5-playsinline="true" webkit-playsinline="true" playsinline="true" x-webkit-airplay="allow" controls preload="auto" width="654" height="368"  data-setup="{}"><source id="videoSrc" src="' +
                videoInfo.viewUrl + '" type="video/mp4"></video>';
        }
        this.initVideoPlayer(videoInfo);
    },
    initVideoPlayer:function(videoInfo){
        // init the palyer for video 
        this.myPlayer = videojs('myVideo', {
            "autoplay": false,
            "preload": "auto",
            "language": 'zh-CN',
            // playbackRates: [0.5, 1, 1.5, 2], 倍速播放
            controlBar: {
                captionsButton: false,
                chaptersButton: false,
                liveDisplay: false,
                playbackRateMenuButton: false,
                subtitlesButton: false,
            }
        }, function () {
            this.on('loadeddata', function () {
                var lasTime = localStorage.getItem('videoTime' + videoInfo.viewUrl);
                if (lasTime && lasTime < this.duration()) {
                    this.currentTime(lasTime);
                }
            })
        });
    },
    disposeVideoPlayer:function(viewUrl){
        // dispose the player and set the video play time as local variate
        localStorage.setItem('videoTime' + viewUrl, this.myPlayer.currentTime());
        this.myPlayer.pause();
        this.myPlayer.dispose();
        this.myPlayer = null;
        this.hideVideo();
    },
    hideVideo: function () {
        // hide the video dom
        this._$dialogVideoWrap.style.display = "none";
    }
}
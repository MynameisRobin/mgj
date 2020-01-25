window.VideoList = {
         offset:function(obj, direction) {
            // 获取元素相对浏览器窗口的偏移量
            var offsetDir = 'offset' + direction[0].toUpperCase() + direction.substring(1);
            var realNum = obj[offsetDir];
            var positionParent = obj.offsetParent;
            while (positionParent != null) {
                realNum += positionParent[offsetDir];
                positionParent = positionParent.offsetParent;
            }
            return realNum;
        },
        initVideoListWrap: function (listLi) {
            var ulHtml = '<div id="videoListMask" class="videoListMask"></div><div id="videoListWrap" class="videoListWrap"><div class="videoListTitle">视频帮助</div><div class="videoListWrapper"><ul id="videoList" class="videoList">' +
                listLi +
                '</ul></div></div>';
            var div = document.createElement('div');
            div.setAttribute('id', 'dialogListWrap');
            div.innerHTML = ulHtml;
            document.body.appendChild(div);
            this.$dialogListWrap = div;
            this.$videoListWrap = div.querySelector('#videoListWrap'); // ul 及‘视频帮助’
            this.$videoList = div.querySelector('#videoList');// ul
            // this._ul=div.get
        },
        bindListEvent: function () {
            var _this = this;
            var videoListMask = document.getElementById('videoListMask');
            if (videoListMask) {
                // mask点击事件
                videoListMask.onclick = function (e) {
                    e.stopPropagation();
                    _this.hideVideoList();
                }
            }
            var videoListUl = document.getElementById('videoList');
            if (videoListUl) {
                // 视频li点击事件
                videoListUl.addEventListener('click', function (ev) {
                    var target = ev.target;
                    ev.stopPropagation();
                    if (target.tagName.toLowerCase() == 'li') {
                        var videoInfo = JSON.parse(target.dataset.video);
                        console.log('点击的视频 li', videoInfo);
                        _this.hideVideoList();
                        VideoPlayer.showVideo(videoInfo);
                    }
                });
            }
        },
        renderVideolist: function ($dom, videoList) {
            var listLi = '';
            for (var i = 0, len = videoList.length; i < len; i++) {
                var item = videoList[i];
                var data = JSON.stringify(item);
                listLi += "<li class='videoLi' data-video=" + data + ">" + item.title + "</li>";
            }
            if (!this.$dialogListWrap) {
                this.initVideoListWrap(listLi);
                this.bindListEvent();
            }else{
                this.$videoList.innerHTML=listLi;
            }
            var positionLeft = this.offset($dom, 'left') - 20; // 点击元素左边界向左20
            var positionTop = this.offset($dom, 'top') + $dom.offsetHeight + 10; // 点击元素左边界向下20
            var windowWidth = window.outerWidth;
            if (windowWidth - positionLeft >= 178) {
                this.$videoListWrap.style.left = positionLeft+"px";
                this.$videoListWrap.setAttribute("class","videoListWrap");
            }else{
                this.$videoListWrap.style.right = windowWidth - positionLeft - $dom.offsetWidth - 20 +"px";
                this.$videoListWrap.setAttribute("class","videoListWrap rightAlign");
            }
            this.$videoListWrap.style.top = positionTop+"px";
        },
        showVideoList: function ($dom, videoList) {
            this.renderVideolist($dom, videoList);
            this.$dialogListWrap.style.display = "block";
        },
        hideVideoList: function () {
            this.$dialogListWrap.style.display = "none";
        }
    }

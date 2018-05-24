(function($){
    function replaceTemple (str,data,rule) {
       return str.replace(/\{(.*?)\}/g,function(a,b){
           return (rule && rule[b])?rule[b].call(null,data,data[b]):(data[b] || "");
       })
    }
    document.addEventListener("pause", function(){//挂起
        amGloble.page.videodetails.clearPlayers();
        if($.am.getActivePage().id=="page-videodetails"){
            amGloble.page.videodetails.exitFullScreen();
        }else{
            amGloble.page.videodetails.exitFullScreen(true);
        }
        //amGloble.page.videodetails.exitFullScreen();
    }, false);
    document.addEventListener("resume", function(){//恢复
        if($.am.getActivePage().id=="page-videodetails"){
            amGloble.page.videodetails.exitFullScreen();
        }else{
            amGloble.page.videodetails.exitFullScreen(true);
        }
        amGloble.page.videodetails.afterShow("back");
    }, false);
    var mediaTemp='<video id="player1" width="320" height="240" webkit-playsinline="true" style="max-width:100%;" preload="none">'+
                    '<source src="" type="video/mp4">'+
                '</video>';//解决放在html里有圆圈的bug
	var self = amGloble.page.videodetails = new $.am.Page({
        id: "page-videodetails",
        backButtonOnclick : function() {
            $.am.debug.log("back:安卓机返回");
            this.exitFullScreen(true);
            $.am.page.back();
        },
        exitFullScreen:function(isdestory){
            $.am.debug.log("进入退出全屏流程。。");
            var players=amGloble.page.videodetails.players;
            $.am.debug.log(players);
            if(players){
                $.am.debug.log("视频状态："+players.isFullScreen);
                try{
                    players && players.exitFullScreen();//退出全屏
                }catch(e){
                    $.am.debug.log("back报错："+e);
                    if(isdestory){
                        $.am.debug.log("开始销毁播放器");
                        self.clearPlayers();
                    }
                }
                self.resetFull("exit");
                players.pause();
            }
        },
        init: function(){
            // 分段视频
            this.$nav=this.$.find(".nav");
            this.$navul=this.$nav.find(".nav-wrap");
            this.$navTemp=this.$navul.find(".item:first")[0].outerHTML;//视频分段模板
            this.$navul.empty();
            //视频简介
            this.$introduce=this.$.find(".introduce");
            this.$introduceTemp=this.$introduce[0].innerHTML;
            this.$introduce.empty();
            //讲师
            this.$teacher=this.$.find(".teacher");
            this.$teacherTemp=this.$teacher[0].innerHTML;
            this.$teacher.empty();
            //机构
            this.$organization=this.$.find(".organization");
            this.$organizationTemp=this.$organization[0].innerHTML;
            this.$organization.empty();
            //评论
            this.$comment=this.$.find(".comment .common-item-content");
            this.$commentTemp=this.$comment.find(".itemList")[0].outerHTML;
            this.$comment.empty();
            //视频盒子
            this.$media=this.$.find(".media-wrapper");
            this.$mediaTemp=mediaTemp;
            this.$media.empty();

            //底部渲染
            this.$footer=this.$.find(".footer");
            this.$footerTemp=this.$footer.find("[data-key]");

            this.playerNums={};//播放次数缓存
            this.currentVideoList=[];//当前课程下的视频列表
            this.usable=true;


            this.detailsList=null;//每次获取请求的数据
            this.errorTime=new Date().getTime();

            this.scrollview.pauseTouchTop=true;//禁用上拉刷新

            this.$error = this.$.find("div.am-page-error");
            this.$error.find(".button-common").vclick(function() {
                self.getData();
            });

            this.$.on("vclick",".footer .likes_btn",function(){//点赞
                if(!$(this).find(".likes").hasClass('selected')){
                    self.updataLikes(self.params.id);
                }else{
                    amGloble.msg("已经点过赞了！");
                }
            }).on("vclick",".footer .collection_btn",function(){//收藏
                if(!$(this).find(".collection").hasClass('selected')){
                    self.setStorage("educationCollection",self.params);
                    amGloble.msg("收藏成功！");
                }else{
                    self.delStorage("educationCollection",self.params);
                    amGloble.msg("取消成功！");
                }
                self.renderFooter({});
            }).on("vclick",".nav .item",function(){
                if($(this).hasClass('active')){
                    return;
                }
                var idx=$(this).index();
                self.gotoplayIndex(idx,true);
                
            }).on("vclick",".teacher",function(){

                $.am.changePage(amGloble.page.teacher,'slideleft',self.detailsList);

            }).on("vclick",".organization",function(){

                $.am.changePage(amGloble.page.organization,'slideleft',self.detailsList);

            }).on("vclick",".media-back",function(){
                self.backButtonOnclick();
            }).on("vclick",".footer .comment_btn",function(){//评论
                var hash = amGloble.hash.get();
                if(config.token && hash.type != "logout"){
                    $.am.changePage(amGloble.page.userinfoEditor, "slideleft", {
                        key:"comment",
                        save:function(){
                            var data=this.getValue();
                            this.$.find("[ischeck]").each(function(){
                                $(this).trigger("checkValue");
                            });
                            if(this.errorText){
                                amGloble.msg(this.errorText);
                                return;
                            }
                            self.updataComment(data);
                        }
                    });
                }else{
                    amGloble.confirm("提示信息","您还没有登录,暂不能评论,是否现在去登录！","确定", "返回",function() {
                        amGloble.hash.remove(["type"]);
                        $.am.changePage(amGloble.page.login, "slideright", self.params);
                    });
                }
            }).on("vclick",".complain",function(){//投诉
                var cValue;
                if(config.token){
                    try{
                        cValue=amGloble.metadata.userInfo.mobile || "";
                    }catch(e){}
                }
                if($(this).text()=="已投诉"){
                    amGloble.msg("我们已经收到您的投诉,我们的工作人员会及时联系您,请您耐心等待！");
                    return;
                }
                $.am.changePage(amGloble.page.userinfoEditor, "slideleft", {
                        key:"complain",
                        cValue:cValue,
                        save:function(editorCfg){
                            var _config=editorCfg['complain'];
                            var data=_config.getValue.call(this);
                            // this.$.find("[ischeck]").each(function(){
                            //     $(this).trigger("checkValue");
                            // });
                            _config.components[0].checkValue(data.contact,this);
                            if(this.errorText){
                                amGloble.msg(this.errorText);
                                return;
                            }
                            _config.components[1].checkValue(data.comment,this);
                            if(this.errorText){
                                amGloble.msg(this.errorText);
                                return;
                            }
                            console.log(data)
                            self.updataComplain(data);
                        }
                    });
            }).on("vclick",".organizationList .leftImg",function(){
                try{
                    $.am.changePage(amGloble.page.organizationList,"slideleft",{type:"organization"});
                }catch(e){
                    $.am.debug.log(e);
                }
                
            }).on("vclick",".organizationList .rightImg",function(){
                $.am.changePage(amGloble.page.organizationList,"slideleft",{type:"teacher"});
            }).on("vclick",".icon_spread",function(){
                console.log(1);
            });
        },
        setLast:function(second,currentItem){//创建上一次播放
            if(second>0){
                var lastData=$.extend({},currentItem,{
                    current:second
                });
                var _t=$.extend({},self.params);
                _t.currentItem=lastData;
                if(self.usable){
                    self.setStorage("educationHistory",_t);
                }
            }
        },
        removeLastvideo:function(){//移除上次播放
            var last=self.players.currentItem;
            var lastData=$.extend({},last);

            var _t=$.extend({},self.params);
            _t.currentItem=lastData;

            self.delStorage("educationHistory",_t);
        },
        nextVideo:function(){//播放下一个视频
            var currentItem=self.players.currentItem,
                playIndex=this.getCurrentVideo(currentItem.id);
            if(playIndex!=null){

                var $data=this.$nav.find(".item").eq(playIndex),
                    item=$data.data("item");
                if(self.players){
                    self.players.media.currentTime=0;
                }
                var _t=self.players;
                self.createPlayers(self.params.id);
                $data.addClass('active').siblings().removeClass("active");
                var item=$data.data("item");
                if(_t.isFullScreen){
                    self.players && self.players.enterFullScreen();//退出全屏
                    self.resetFull("enter");
                    
                }
                self.play(item,true);
                
            }else{//没有最后一个了
                self.exitFullScreen();
                
                //self.players.pause();
            }
            
        },
        play:function(item,flag){//播放视频
            var url=Gallery.imgConfig.getUrl(item.videofile,"videoList","n");
            this.setVideoBackground(url);
            
            var _current=self.players.currentItem;

            if(!_current || item.videofile!=_current.videofile){
                self.players.setSrc(url);
            }
            if(flag || this.playType=="last"){
                self.players.play();
            }else{
                self.players.pause();
            }
            self.players.currentItem=item;
            
        },
        addplayNums:function(item){
            var plays=this.playerNums;
            if(!plays[item.videoid]){
                plays[item.videoid]=item;
                self.updataVideoNum(item.id);
            }
        },
        updataVideoNum:function(videoid){
           this.sendPost("videoPlay",{
                videoDetailId:videoid
           },function(ret){
                console.log(ret);
           }); 
        },
        extendFunction:function(page,array){
            if(!self.isExtend){
                for(var i=0;i<array.length;i++){
                    self[array[i]]=page[array[i]];
                };
                self.isExtend=true;
            }
        },
        saveCurrentVideo:function(detail){
            if(detail && detail.length){
                self.currentVideoList=detail.sort(function(a,b){
                    return a.no-b.no;
                });
            }else{
                self.currentVideoList=[];
            }
        },
        getCurrentVideo:function(id){
            var list=self.currentVideoList;
            for(var i=0;i<list.length;i++){
                var item=list[i];
                if(item.id==id && i!=list.length-1){
                    return i+1;
                }
            }
            return null;
        },
        getbeforeVideo:function(id){
            var list=self.currentVideoList;
            for(var i=0;i<list.length;i++){
                var item=list[i];
                if(item.id==id){
                    return i;
                }
            }
            return null;
        },
        gotoplayIndex:function(idx,flag){//跳到第几段 flag 是否播放
            var $data=this.$nav.find(".item").eq(idx),
                item=$data.data("item");
                if(self.players){
                    self.players.media.currentTime=0;
                }
                self.createPlayers(self.params.id);
                $data.addClass('active').siblings().removeClass("active");
                if(self.players.isFullScreen){
                    self.players && self.players.enterFullScreen();//退出全屏
                    self.resetFull("enter");
                    
                }
                self.play(item,flag);
        },
        gotoCurrent:function(currentItem){
            var playIndex=this.getbeforeVideo(currentItem.id);
            self.gotoplayIndex(playIndex);
            //self.players.media.currentTime=currentItem.current;
        },
        beforeShow: function(params){
            //self.scrollview.scrollTo("top");
            this.extendFunction(amGloble.page.education,['setStorage','getStorage','delStorage']);//拷贝属性
            if(params=='back'){

                //this.createPlayers(self.params.id);
                //this.players && this.players.pause();
                return;
            };
            this.players=null;
            this.params=params;
            if(params.currentItem && params.isPlay){//从上次播放进来的
                this.playType="last";
            }else{
                this.playType="normal";
            }

            var last=self.getlastPlay(self.params.id);
            if(last && last.currentItem){//上次播放进度
                this.params.currentItem=last.currentItem;
            }

            amGloble.loading.show();
            //this.createPlayers(self.params.id);
            this.getData(self.params.id);
            
           
           
        },
        clearPlayers:function(){
            
            self.setLast(this.players.getCurrentTime(),$.extend({},self.players.currentItem || {}));
            this.players && this.players.remove();
            this.$media.empty();
            //this.players.remove();
        },
        createPlayers:function(id){//每次重新创建  避免IOS加载不出视频
            this.$media.html(this.$mediaTemp);
            this.videoChange=[];
            var features;
            if($('html').hasClass('ios')){
                features=['playpause','current','progress','tracks','jumpforward','skipback','loop','markers','postroll','sourcechooser','speed','stop','duration','volume'];
            }else{
                features=['playpause','current','progress','tracks','jumpforward','skipback','loop','markers','postroll','sourcechooser','speed','stop','duration','volume','fullscreen'];
            }
            this.players=new MediaElementPlayer($("#player1")[0], {
                features:features,
                enableKeyboard:false,
                keyActions:[],
                success: function (media) {
                    media.addEventListener('error', function (e) {
                        $.am.debug.log("error:");
                        $.am.debug.log(e);
                        // var t=new Date().getTime();
                        // if(Math.round(t-self.errorTime)/1000>60){
                        //     amGloble.msg("网络加载出错，请稍后重试！");
                        //     self.errorTime=new Date().getTime();
                        // }
                        
                    });
                    media.addEventListener('pause', function (e) {
                        console.log("暂停");
                        self.setLast(media.currentTime,$.extend({},self.players.currentItem || {}));
                    }); 
                    media.addEventListener('ended', function (e) {
                        self.removeLastvideo();
                        self.nextVideo();
                    }); 
                    media.addEventListener('stalled', function (e) {//在浏览器不论何种原因未能取回媒介数据时运行的脚本
                        $.am.debug.log("stalled:");
                        $.am.debug.log("取不到媒介数据了");
                        /*var t=new Date().getTime();
                        if(Math.round(t-self.errorTime)/1000>60){
                            amGloble.msg("视频正在努力加载中，请稍后！");
                            self.errorTime=new Date().getTime();
                        }*/
                       // media.pause();
                    });
                    media.addEventListener('play', function (e) {
                        if(this.usable){
                            self.setStorage("educationHistory",self.params);
                        }
                        self.addplayNums(self.players.currentItem);
                        self.setVideoBackground("");
                    });
                    
                    media.addEventListener('playing', function (e) {//播放中
                        $.am.debug.log(media.networkState);
                        console.log(media.networkState);
                    });
                    media.addEventListener('timeupdate', function (e) {
                        if(self.videoChange.length<2){//部分android机拖动进度条会卡住播放图标
                            self.videoChange.push(media.currentTime);
                        }else{
                            self.videoChange.shift();
                            self.videoChange.push(media.currentTime);
                        }
                        if(Math.abs(self.videoChange[1]-self.videoChange[0])>10){
                            // media.pause();
                            //media.play();
                        }
                    });
                    media.addEventListener('waiting', function(e){
                        console.log(media.networkState);//网络状况 大于1卡顿
                    });

                    media.addEventListener('progress', function(e){
                        console.log("缓存中");
                        //$.am.debug.log("莫名的缓存视频中。。。");
                    });

                       
                    media.addEventListener('loadedmetadata', function (e) {
                        var last=self.getlastPlay(id);
                        var currentItem;
                        
                        if(self.params.currentItem){
                            currentItem=self.params.currentItem;
                        }

                        if(currentItem && self.players.currentItem.id==currentItem.id){//上次播放
                           self.players.media.currentTime=currentItem.current;
                           /*if(self.players.media.currentSrc.indexOf(currentItem.videofile)!=-1){
                             self.players.media.currentTime=currentItem.current;
                           }*/
                           // if(self.segmentedVideo.hasOwnProperty(currentItem.id)){
                           //   self.players.media.currentTime=currentItem.current;
                           // }
                        }
                        
                    }); 
                },
                // 额外扩展的方法
                fullCallback:function(info){
                    self.resetFull(info);
                },
                exitfullCallback:function(){//计算退出全屏之前的回调
                    navigator.appplugin.rotateToPortrait();
                }
            });
            var $a=$(self.players.layers).find(".mejs__overlay-play");
            var $b=$a.find(".mejs__overlay-button");
            var _t=$b.attr("aria-pressed");
        },
        resetFull:function(info){
            var _this=this;
            if(info=="enter"){
                self.$.find(".footer").hide();
                navigator.appplugin.rotateToLandscape();
            }else{
                self.$.find(".footer").show();
                $.am.debug.log("旋转屏幕了");
                navigator.appplugin.rotateToPortrait();
            }
            setTimeout(function() {
                //_this.players.play();
                var w,h,t;
                w=$('body').width();
                h=$('body').height();
                if(info=="enter"){
                    t=Math.min(w,h);
                }else{
                    t=Math.max(w,h);
                }
                //$("body").height(t);
                $.am.getActivePage().refresh();
            }, 300);
        },
        setCategoryScroll:function(){
            if(!this.categoryScroll){
                this.categoryScroll = new $.am.ScrollView({
                    $wrap : self.$nav,
                    $inner : self.$navul,
                    direction : [true, false],
                    hasInput: false
                });
            }
            
        },
        pausePage:function(){//挂起保存状态
            self.playerscurrentItem=self.players.currentItem;
        },
        afterShow: function(params){
            if(params=='back'){
                $.am.debug.log("back:创建播放器");

                var last=self.getlastPlay(self.params.id);
                if(last && last.currentItem){//上次播放进度
                    this.params.currentItem=last.currentItem;
                }

                this.createPlayers(self.params.id);
                if(self.playerscurrentItem && self.playerscurrentItem.current){
                    self.players.currentItem=self.playerscurrentItem;
                }
                
                setTimeout(function(){//同步操作会导致找不到dom
                    self.gotolastplay(self.params.id);
                },100);
                
                //this.players && this.players.pause();
                return;
            };
            if(!this.usable){
                amGloble.msg("该视频已下架！");
                $.am.page.back({});
            }
        },
        creatHideText:function(){
            var self = this;
            var $textHitDom = $('.text_hit_box.video p');
            $textHitDom.each(function(i,item){
                var oHeight = $(this).outerHeight();
                console.log($(this),oHeight);
                self.bindToggleText($(this).parent(),oHeight);
            })
        },
        bindToggleText:function($dom,height){
            var self =this;
            if(height>48){
                $dom.addClass('drawback');
                $dom.off("vclick").on("vclick",function(e){
                    e.stopPropagation();
                    if($dom.hasClass("drawback")){
                        $dom.removeClass("drawback").addClass("drawdown");
                    }else{
                        $dom.removeClass("drawdown").addClass("drawback");
                    }
                    self.scrollview.refresh();
                })
            }else{
                $dom.removeClass('drawback').removeClass('drawdown');
            }
        },
        beforeHide: function(){
            
        },
        afterHide: function(){
            self.playerscurrentItem=self.players.currentItem;
            try{
               this.clearPlayers();
                $.am.debug.log("销毁播放器完成！"); 
            }catch(e){
                $.am.debug.log("销毁播放器出错！"); 
            }
            
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        pageSize: 10,
        pageNumber:1,
        updataComplain:function(data){
            this.sendPost("submitComplaint",{
                videoId:self.params.id,
                comment:data.comment,
                contact:data.contact
            },function(ret){
                amGloble.msg("投诉成功！");
                self.setStorage("userComplain",self.params);
                var params=$.extend({},self.params);
                delete params.currentItem;
                $.am.changePage(amGloble.page.videodetails, "slideright",params);
            });
        },
        updataComment:function(data){
            this.sendPost("submitComment",{
                videoId:self.params.id,
                comment:data.submitComment
            },function(ret){
                amGloble.msg("评论成功！");
                //amGloble.page.videodetails.clearPlayers();
                setTimeout(function(){
                    //$.am.page.back();//返回
                    var params=$.extend({},self.params);
                    delete params.currentItem;
                    $.am.changePage(amGloble.page.videodetails, "slideright",params);
                },500);
                
                //self.getData(self.params.id);
            });
        },
        updataLikes:function(id){
            this.sendPost("videoLikes",{
                videoId:id
            },function(ret){
                if(ret.code==0){
                    self.setStorage("videoDetailLikes",{id:id});
                    self.renderFooter({likes:self.$footer.find("[data-key='likes']").text()*1+1});
                }
            });
        },
        getTime:function(value){
            if(value<60){//只有秒
                return value.length<2?("0"+value+"'"):(value+"'");
            }
            if(value>=60){
                var min=parseInt(value/60),
                    second=value%60;
                second=second.toString().length<2?("0"+second.toString()+"'"):(second.toString()+"'");
                min=min.toString().length<2?("0"+min.toString()+"'"):(min.toString()+"'");
                return min+second;
            }
        },
        renderTimeRule:{//时长段
            videotime:function(data,value){
                return self.getTime(value);
            }
        },
        getlastPlay:function(id){//获取上次播放
            var list=this.getStorage("educationHistory");
            if(list && list.length){
                for(var i=0,l=list.length;i<l;i++){
                    var item=list[i];
                    if(item.id==id){
                        return item;
                    }
                }
            }
        },
        gotolastplay:function(id){
            var last=this.getlastPlay(id),//获取上次播放并跳到进度
                cplay;

            if(last && last.currentItem){
                cplay=last.currentItem;
            }
            if(self.params.currentItem){
                cplay=self.params.currentItem;
            }

            if(cplay){//上次播放
                this.gotoCurrent(cplay);
            }else{
                this.gotoplayIndex(0,false);
            }
        },
        renderTime:function(detail,video){
            this.saveCurrentVideo(detail);
            this.$navul.empty();
            if(detail && detail.length){
                for(var i=0;i<detail.length;i++){
                    var item=detail[i];
                    item.index=i+1;
                    item.active="";
                    var temp=$(replaceTemple(this.$navTemp,detail[i],self.renderTimeRule)).data("item",item);
                    this.$navul.append(temp);
                }
                var _h=60*detail.length<$(window).width()?$(window).width():60*detail.length;
                if(_h>$(window).width()){
                    this.setCategoryScroll();
                }
                this.$navul.width(_h+"px");
                if(self.categoryScroll){
                    self.categoryScroll.refresh();
                }
                this.gotolastplay(video.id);
                
            }else{
                if(this.players){
                    this.players.setSrc("");
                }
                
                this.setVideoBackground(Gallery.imgConfig.getUrl(video.cover,"videoCover","s"));

            }
        },
        setVideoBackground:function(src){
            var _temp=src?("url("+src+")"):"#000";
            try{
                // $(this.players.container).css({
                //     "background":_temp,
                //     "background-repeat": "no-repeat",
                //     "background-size": "contain"
                // });
                this.players.setPoster(src);
            }catch(e){
                setTimeout(function(){
                    $.am.page.back();//返回
                },500);
            }
            
        },
        VideoDetailRule:{//视频简介规则
            totaltime:function(data,value){
                return self.getTime(value);
            },
            createtime:function(data,value){
                try{
                    return new Date(value).format("yyyy/mm/dd").replace(/\//g,".");
                }catch(e){
                    return new Date().format("yyyy/mm/dd").replace(/\//g,".");
                }
            },
            keyword:function(data,value){
                var arr=value?value.replace(/\，/g,",").split(","):[],
                    _html="";
                for(var i=0;i<arr.length;i++){
                    var item=arr[i];
                    _html += "<span>"+ item +"</span>";
                }
                return _html;
            },
            plays:function(data,value){
                return value || 0;
            },
        },
        commentRule:{
            createtime:function(data,value){
                return amGloble.time2str(value/1000);
            }
        },
        render:function(item){
            if(item.video.status==1){//校验是否下架
                self.delStorage("educationHistory",self.params);
                self.delStorage("educationCollection",self.params);
                this.usable=false;
            }else{
                this.usable=true;
            }
            this.detailsList=item;
            //render 时长
            self.renderTime(item.detail,item.video);
            //render 简介
            var videodetail=replaceTemple(this.$introduceTemp,item.video,self.VideoDetailRule);
            this.$introduce.html(videodetail);
            //render 讲师
            if(item.teacher){
                var $teacher=$(replaceTemple(this.$teacherTemp,item.teacher,self.teacherRule));
                $teacher.find(".teacher_imgBox").html(Gallery.imgConfig.createImage(item.teacher.icon,"teacherLogo","s"));
                this.$teacher.empty().show().append($teacher);
                var headertips = this.$teacher.find('.headertips');
                var title = headertips.find('span').html();
                if(title){
                    headertips.show();
                }else {
                    headertips.hide();
                }

            }else{
                this.$teacher.hide();
            }
            //render 学院
            if(item.organization){
                var $organization=$(replaceTemple(this.$organizationTemp,item.organization,self.organizationRule));
                //$organization.find(".organization_img").html(Gallery.imgConfig.createImage(item.organization.logo,"institutionLogo","n"));
                var src=Gallery.imgConfig.getUrl(item.organization.logo,"institutionLogo","n");
                (function(src,self,item){
                    self.resetWidth(src,function(_w,_h,ml,mt,tw){
                        $organization.find(".organization_img").html(Gallery.imgConfig.createImage(item.organization.logo,"institutionLogo","n"));
                        $organization.find(".organization_img").css({
                            "width":tw+"px",
                            "height":tw+"px",
                            "border":"1px solid rgb(229,229,229)"
                        });
                        $organization.find(".organization_img img").css({
                            "width":_w+"px",
                            "height":_h+"px",
                            "margin-left":ml+"px",
                            "margin-top":mt+"px"
                        }).show();
                    });
                })(src,self,item);

                this.$organization.empty().show().append($organization);
            }else{
                this.$organization.hide();
            }
            //render 评论
            this.rendComment(true);

            //render投诉
            this.renderComplain(item.video);

            this.renderFooter(item.video);
        },
        resetWidth:function(src,callback){
            var tw=65;
            var img=new Image();
            img.onload=function(){
                var w=img.width,
                    h=img.height,
                    factor=w/h,
                    _w,_h,ml,mt;

                if(w>=h){//宽大于高
                    _w=tw;
                    _h=tw/factor;
                    ml=0;
                    mt=(tw-_h)/2;
                }else{
                    _h=tw;
                    _w=factor*tw;
                    ml=(tw-_w)/2;
                    mt=0;
                }
                callback && callback(_w,_h,ml,mt,tw+2);
            }
            img.src=src;
        },
        hasComplain:function(list,id){
            if(list && list.length){
                return list.some(function(item){
                    return item.id==id;
                });
            }
            return false;
        },
        renderComplain:function(video){
            var Complain=this.getStorage("userComplain");
            var isComplain=this.hasComplain(Complain,self.params.id);
            if(isComplain){
                this.$introduce.find(".complain").text("已投诉");
            }else{
                this.$introduce.find(".complain").text("投诉");
            }
            if(!video.ispartner){
                this.$introduce.find(".complain").hide();
            }else{
                this.$introduce.find(".complain").show();
            }
        },
        getIsLikes:function(key,id){
            var data=this.getStorage(key);
            return data.some(function(arg){
                return id==arg.id;
            });
        },
        renderFooter:function(data){//渲染底部
            var islike=this.getIsLikes("videoDetailLikes",self.params.id);
            var isCollection=this.getIsLikes("educationCollection",self.params.id);
            self.$footerTemp.each(function(i,item){
                var key=$(this).data("key");
                if(data[key]!=undefined || data[key]!=null){
                    $(this).html(data[key] || 0);
                }
                if(key=="likes"){//
                    if(islike){
                        $(this).siblings().addClass('selected');
                    }else{
                        $(this).siblings().removeClass('selected');
                    }
                }
                if(key=="collection"){
                    if(isCollection){
                        $(this).addClass('selected');
                    }else{
                        $(this).removeClass('selected');
                    }
                }
            });

        },
        rendComment:function(refresh,type){
            if(refresh){
                amGloble.loading.show();
                self.$comment.empty();
                self.pageNumber=1;
            }else{
                self.pageNumber++;
            }
            amGloble.api.listComment.exec({
                videoId:self.params.id,//
                pageNumber:self.pageNumber,
                pageSize:self.pageSize
            },function(ret){

                amGloble.loading.hide();
                self.closeBottomLoading();
                self.bottomLoading = false;
                self.scrollview.pauseTouchBottom=false;

                var list=ret.content;
                list=self.getCurrentList(list);
                if(list.length){
                    var l=list.length,
                        i;
                    for(i=0;i<l;i++){
                        var item=list[i],
                            comment;
                        if(item.status==0){
                            continue;
                        }
                        comment=replaceTemple(self.$commentTemp,item,self.commentRule);
                        var $comment=$(comment);
                        var type = item.usertype == 1 ? "artisan" : "manager";
                        $comment.find(".imgBox").html(amGloble.photoManager.createImage(type, {
                            parentShopId: item.parentshopid,
                            updateTs: item.createtime
                        }, item.userid + ".jpg", "s"));

                        self.$comment.append($comment);
                    }
                }
                if(!list.length && refresh){
                    self.$comment.append("<p>暂无评论</p>");
                    self.scrollview.pauseTouchBottom = true;
                }

                if(self.$comment.find(".itemList").size()>=ret.totalCount){
                    self.scrollview.pauseTouchBottom = true;
                }

                self.renderFooter({comment:ret.totalCount || 0});

                self.scrollview.refresh();
                
            });
        },
        getCurrentList:function(list){
            var res=[];
            if(list && $.isArray(list)){
               res=$.grep(list,function(item){
                   return item.status==1;
               }); 
            }
            return res;
        },
        touchTop: function(){
            if(this.topLoading){
                return;
            }
            this.rendComment();
        },
        touchBottom: function(){
            if(this.bottomLoading){
                return;
            }
            this.rendComment();
        },
        getData:function(id){
            var self = this;
            this.sendPost("videoDetail",{
                videoId:self.params.id
            },function(ret){
                self.render(ret.content);
                self.creatHideText();//隐藏文字
            });
        },
        sendPost:function(url,data,callback,errorcallback){
            amGloble.loading.show();
            amGloble.api[url].exec(data,function(ret){
                amGloble.loading.hide();
                if(ret && ret.code==0){
                    //self.setStatus("normal");
                    callback && callback(ret);
                }else{
                    errorcallback && errorcallback(ret);
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                    //self.setStatus("error");
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.getData(self.params.id);
                    }, function(){
                        
                    });
                }
            });
            
        }
    });
})(jQuery);
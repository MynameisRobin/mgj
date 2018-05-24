(function () {
    var self = (amGloble.page.communityDetail = new $.am.Page({
        id: "page-communityDetail",
        init: function () {
            this.$.on("vclick", ".operate", function () {//操作页面 
                var topic = self.$topicWrap.data('topic');
                amGloble.communityOperate.show({
                    options: topic.options,
                    callback: function (type) {
                        if (type == 0) {
                            amGloble.page.community.setEssence(topic, function () {
                                amGloble.msg("设为精华成功");
                                topic.elite = 1;
                                topic.options = amGloble.page.community.getOperateOption(topic);
                                self.$topicWrap.find(".title").addClass("essence");
                            });
                        } else if (type == 1) {
                            amGloble.page.community.setEssence(topic, function () {
                                amGloble.msg("取消精华成功");
                                topic.elite = 0;
                                topic.options = amGloble.page.community.getOperateOption(topic);
                                self.$topicWrap.find(".title").removeClass("essence");
                            });
                        } else if (type == 2) {
                            $.am.changePage(amGloble.page.communityPublish, "slideleft", { community: topic });
                        } else if (type == 3) {
                            atMobile.nativeUIWidget.confirm({
                                caption: '确定删除吗？',
                                description: '',
                                okCaption: '确定',
                                cancelCaption: '取消'
                            }, function() {
                                amGloble.page.community.deleteTopic(topic, function () {
                                    amGloble.msg("删除成功");
                                    $.am.changePage(amGloble.page.community, "slideright", topic.id);
                                });
                            }, function() {
                                
                            });
                        }
                    }
                });
            }).on("vclick", ".edit_icon ", function () {//跳转编辑页面
                $.am.changePage(amGloble.page.communityPublish, "slideleft");
            }) .on("keyup", '.comment_input', function (e) {//评论
                self.setHeight($(this));
                if( $.trim( $(this).val() ) ){
                    self.$sendBtn.removeClass('disabled');
                }else{
                    self.$sendBtn.addClass('disabled');
                }
            }) .on("focus", '.comment_input', function (e) {//评论
                var $parent = $(this).parents('.am-footer');
                $parent.addClass('send');
                $('body').addClass('inputfocus');
            }) 
            .on("blur", '.comment_input', function (e) {//评论
                var $parent = $(this).parents('.am-footer');
                $parent.removeClass('send');
                $('body').removeClass('inputfocus');
            }).on("vclick", '.send_btn', function (e) {//评论
                self.$input.blur();
                $(this).addClass('disabled');
                var $input = $(this).prev().find('.comment_input');
                var comment = $.trim($input.val());
                var topic = self.$topicWrap.data('topic');
                if (!comment) {
                    amGloble.msg('请输入有效评论！');
                    return;
                }
                self.actComment(topic, comment);
            }).on('vclick', '.act_thumbs', function () {//详情点赞
                if ($(this).hasClass('done')) {
                    amGloble.msg('您已经点过赞了！');
                    return;
                }
                var topic = self.$topicWrap.data('topic');
                self.actLike(topic);
            }).on('vclick', '.photos div', function (e) {
                e.stopPropagation();
                var items = [];
                var index = $(this).parent().children().index($(this));
                $(this).parent().find("img").each(function () {
                    items.push({
                        src: $(this).attr("src").replace("_s", "_l"),
                        w: 1024,
                        h: 1024
                    });
                });
                self.pswpTimer && clearTimeout(self.pswpTimer);
                amGloble.loading.show();
                self.pswpTimer = setTimeout(function () {
                    amGloble.loading.hide();
                    amGloble.pswp(items, index);
                }, 500);
            })
            this.$wrapper = this.$.find('.am-body-wrap');
            this.$topicWrap = this.$.find('.top_wrap');
            this.$title = this.$topicWrap.find('.title')
            this.$thumbs = this.$.find('.thumbs');
            this.$supports = this.$thumbs.find('.headers');
            this.$support = this.$supports.find('li').remove();
            this.$supportNum = this.$thumbs.find('.text');
            this.$commentTit = this.$.find('.comment_tit');
            this.$comments = this.$.find(".comments_list");
            this.$comment = this.$comments.find('li').remove();
            this.$labelWrap = this.$.find('.topics');
            this.$label = this.$labelWrap.find('p').remove();
            this.$foot = this.$.find('.am-footer');
            this.$actThumb = this.$.find('.act_thumbs');
            this.$sendBtn = this.$.find('.send_btn');
            this.$input = this.$.find('.comment_input');
            this.$cover = this.$.find('.replacer');
            this.loading = this.$.find(".loadingContent");
            this.error = this.$.find(".error");
            this.reload = this.$.find(".reload");
            this.topicId = 0;
        },
        setHeight:function($dom,flag){
            $dom.css({'height':'auto','overflow-y':'hidden'}).height($dom.prop('scrollHeight'));
        },
        beforeShow: function (ret) {
            if(ret == 'back'){
                return;
            }
            this.resetPage();
            this.refreshTimeStamp();
            if (ret && ret.id) {
                this.topicId = ret.id;
                this.meta = ret;
                this.renderTopic(ret);
                this.supported = ret.supported;
                this.getDetails();
                this.$input.val('');
                var banFlag = ( ret.shopId != amGloble.metadata.userInfo.shopId );
                this.switchFooter(banFlag);
            } else {
                return;
            }
            // this.calBodyHeight();
        },
        // calBodyHeight:function(){
        //     var headerHeight = this.$.find('.am-header').outerHeight();
        //     var footHeight = this.$.find('.am-footer').outerHeight();
        //     var clientHeight = $('body').outerHeight();
        //     this.$wrapper.css({
        //         "height": Math.round(clientHeight-headerHeight-footHeight) + 'px',
        //     });
        // },
        afterShow: function () {
            this.refreshTimeStamp();
            this.avoidThrough();
        },
        avoidThrough:function(flag){
            if(flag){
                this.$.find('.am-disabled').prop('disabled',true);
            }else{
                this.$.find('.am-disabled').prop('disabled',false);
            }          
        },
        refreshTimeStamp:function(){
            amGloble.page.dashboard.saveCommunityRefreshTimeByUserId();
        },
        resetPage:function(){
            this.$title.removeClass('essence');
            this.$foot.show();
            this.$sendBtn.addClass('disabled');
            this.$thumbs.find('ul.headers').empty();
            this.$topicWrap.find('.photos').empty();
            this.$actThumb.removeClass('done');
            this.$labelWrap.empty();
            this.$commentTit.text('全部评论(' + 0 + ')');
            this.$comments.empty();
            this.$topicWrap.find('.operate').hide();
            this.$.find('.header').removeClass('f');
            this.$cover.hide();
            this.avoidThrough(1);
            this.scrollview.scrollTo('top');
            this.scrollview.refresh();
        },
        publicDate: null,
        pageSize: 8,
        beforeHide: function () {
            
        },
        afterHide: function () { 
            this.avoidThrough(1);
        },
        getDetails: function (top, bottom) {
            if (top) {
                this.publicDate = null;
            }
            if (!top && !bottom) {
                this.loading.show();
                this.$cover.show();
                this.publicDate = null;
            }
            var opt = {
                topicId: this.topicId,
                loginUserId: amGloble.metadata.userInfo.userId,
                loginUserType: amGloble.metadata.userInfo.userType,
                pageNumber: 0,
                pageSize: this.pageSize,
                publicDate: this.publicDate,
                supportNum:30
            },
                self = this;
            this.error.hide();
            this.scrollview.pauseTouchBottom = true;
            this.$.find('.am-drag.bottom').hide();
            amGloble.api.getCommunityDetails.exec(opt, function (ret) {
                self.loading.hide();
                self.$cover.hide();
                if (top) {
                    self.closeTopLoading();
                    self.topLoading = false;
                    self.$comments.empty();
                }
                if (!top && !bottom) {
                    self.$comments.empty();
                }
                if (bottom) {
                    self.closeBottomLoading();
                    self.bottomLoading = false;
                }
                if (ret && ret.code == 0) {
                    self.renderComment(ret);
                    self.scrollview.refresh();
                    if (ret.comments && ret.comments.length) {
                        self.publicDate = ret.comments[ret.comments.length - 1].commentDate;
                        if (top) {
                            self.scrollview.scrollTo('top');
                        }
                        if (bottom) {
                            self.scrollview.scrollTo('bottom');
                        }
                        if (ret.comments.length < self.pageSize) {
                            self.scrollview.pauseTouchBottom = true;
                            self.$.find('.am-drag.bottom').hide();
                        } else {
                            self.scrollview.pauseTouchBottom = false;
                            self.$.find('.am-drag.bottom').show();
                        }
                    } else {
                        if (top || (!top && !bottom)) {
                            self.error.show();
                            self.$cover.show();
                            self.scrollview.scrollTo('top');
                        }
                        if (bottom) {
                            self.scrollview.scrollTo('bottom');
                        }
                        self.scrollview.pauseTouchBottom = true;
                        self.$.find('.am-drag.bottom').hide()
                    }
                    self.renderSupport(ret.topic, ret.supports);
                    self.renderActThumb(ret.topic.supported);
                } else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function () {
                        self.getDetails(top, bottom);
                    }, function () {

                    });
                }
            });
        },
        actComment: function (data, content) {//做评论
            var now = new Date(),
                opt = {
                    "topicId": this.topicId,						//主题id
                    "parentShopId": data.parentShopId, //总部id
                    "shopId": data.shopId,       //门店id
                    "commentDate": now.getTime(), //评论时间
                    "content": content,  //内容
                    "commentUserId": amGloble.metadata.userInfo.userId,		//评论或者回复人id
                    "commentUserType": amGloble.metadata.userInfo.userType,	//评论或者回复人用户类型，
                    "type": 1,    //1评论，2回复
                };
            this.loading.show();
            amGloble.api.actComment.exec(opt, function (ret) {
                self.loading.hide();
                if (ret && ret.code == 0) {//接口成功
                    amGloble.msg('评论成功！');
                    self.getDetails();
                    self.$input.val('');
                    self.setHeight(self.$input,true);
                    self.refreshTimeStamp();
                } else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '评论失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function () {
                        self.actComment(data, content);
                    }, function () {

                    });
                }
            });
        },
        actLike: function (data) {
            var now = new Date(),
                opt = {
                    "topicId": this.topicId,						//主题id
                    "parentShopId": data.parentShopId, //总部id
                    "shopId": data.shopId,       //门店id
                    "supportUserId": amGloble.metadata.userInfo.userId,		//点赞人id
                    "supportUserType": amGloble.metadata.userInfo.userType,	//点赞人类型
                };
            this.loading.show();
            amGloble.api.actLike.exec(opt, function (ret) {
                self.loading.hide();
                if (ret && ret.code == 0) {//接口成功
                    amGloble.msg('点赞成功！');
                    self.supported = 1;
                    self.getDetails();
                } else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '点赞失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function () {
                        self.actLike(data);
                        self.refreshTimeStamp();
                    }, function () {

                    });
                }
            });
        },
        renderTopic: function (data) {
            var self = this;
            var labelArr = data.labelids.substring(1, data.labelids.length - 1).split(',');
            this.$topicWrap.find('.photos').empty();
            if (data.pics) {
                var w = Math.floor(($(".am-widthLimite").width() - 38) / 3);
                var arr = data.pics.split(',');
                for (var j = 0; j < arr.length; j++) {
                    var $img = amGloble.photoManager.createImage('community', {
                        parentShopId: data.parentShopId,
                    }, arr[j], "s");
                    this.$topicWrap.find('.photos').append($("<div class='am-clickable'></div>").css({
                        width: w,
                        height: w
                    }).append($img));
                }
            }
            var options = amGloble.page.community.getOperateOption(data);
            if(!options.length){
                this.$topicWrap.find('.operate').hide();
            }else {
                this.$topicWrap.find('.operate').show();
            }
            data.options = options;
            var preTime = amGloble.time2str( parseInt(data.publicDate)/1000 );
            this.$labelWrap.empty();
            $.each(labelArr, function (i, item) {
                var $label = self.$label.clone().text('#' + item);
                self.$labelWrap.append($label);
            })
            var userinfo = amGloble.metadata.userInfo;
            var shopId = amGloble.metadata.userInfo.shopId;
            var banFlag = false;
            if(shopId != data.shopId){
                banFlag = true;
            }
            var type = userinfo.userType == 1 ? "artisan" : "manager";
            this.$topicWrap.find('.title .text').html(data.title)
                .end().find('.des').text(data.content)
                .end().find('.marker .left').find('.header').html(
                    amGloble.photoManager.createImage(type, {
                        parentShopId: userinfo.parentShopId,
                        updateTs: userinfo.lastphotoupdatetime
                    }, data.publicUserId + ".jpg", "s")
                ).end().find('.name').text(data.publicUserName)
                .end().find('.time').text(preTime)
            // .end().end().find('.thumbs')
            if(data.publicUserSex=='F'){
                this.$topicWrap.find('.marker .left .header').addClass('f');
            }else{
                this.$topicWrap.find('.marker .left .header').removeClass('f');
            }
            if (data.elite) {
                this.$topicWrap.find('.title').addClass('essence');
            }
            
            this.$topicWrap.data('topic', data);
        },
        switchFooter:function(banFlag){
            if(banFlag){
                this.$foot.hide().removeClass('am-placeholder');
            }else{
                this.$foot.show().addClass('am-placeholder');
            }
            self.setBodyHeight();
        },
        renderSupport: function (data, supports) {
            var self = this;
            this.$supports.empty();
            var userinfo = amGloble.metadata.userInfo;
            var type = userinfo.userType == 1 ? "artisan" : "manager";
            if (data.supportNum && supports.length) {
                if (data.supportNum == supports.length) {
                    self.$supportNum.text(data.supportNum + '人为您点赞');
                } else {
                    self.$supportNum.text('等' + data.supportNum + '人为您点赞');
                }
                for(var i=0;i<supports.length;i++){
                    var item = supports[i];
                    var flag = self.calWidth();
                    if(!flag){
                        var $support = self.$support.clone().data('support', item).html(
                            amGloble.photoManager.createImage(type, {
                                parentShopId: userinfo.parentShopId,
                                updateTs: userinfo.lastphotoupdatetime
                            }, item.supportUserId + ".jpg", "s")
                        )
                        if(item.supportUserSex=='F'){
                            $support.addClass('f'); 
                        }
                        self.$supports.append($support);
                    }else{
                        var $support = self.$support.clone().data('support', null).addClass('iconfont icon-gengduo1');
                        self.$supports.append($support);
                        break;
                    }
                }
                this.$.find('.act_thumbs .num').text(data.supportNum);
            } else {
                self.$supportNum.text(data.supportNum + '人为您点赞');
                this.$.find('.act_thumbs .num').text(data.supportNum);
            }
        },
        calWidth:function(){
            var allWidth = this.$thumbs.outerWidth(),
                picWidth = this.$supports.outerWidth(),
                textWidth = this.$supportNum.outerWidth();
            if(picWidth+textWidth > allWidth - 40){
                return true;
            }else{
                return false;
            } 
        },
        renderActThumb: function (flag) {
            if (flag) {
                this.$actThumb.addClass('done');
            } else {
                this.$actThumb.removeClass('done');
            }
        },
        renderComment: function (data) {
            var self = this,
                now = new Date(),
                comments = data.comments;
            var userinfo = amGloble.metadata.userInfo;
            var type = userinfo.userType == 1 ? "artisan" : "manager";
            this.$commentTit.text('全部评论(' + data.topic.commentNum + ')');
            if (comments.length) {
                $.each(comments, function (i, item) {
                    var $comment = self.$comment.clone().data('comment', item);
                    var preTime = amGloble.time2str(parseInt(item.commentDate)/1000);
                    $comment.find('.comment_con').text(item.content)
                        .end().find('.info_right').text(preTime)
                        .end().find('.info_left .header').html(
                            amGloble.photoManager.createImage(type, {
                                parentShopId: userinfo.parentShopId,
                                updateTs: userinfo.lastphotoupdatetime
                            }, item.commentUserId + ".jpg", "s") )
                        .end().find('.info_left .name').text(item.commentUserName);
                    if(item.commentUserSex=='F'){
                        $comment.find('.header').addClass('f');
                    }
                    self.$comments.append($comment);
                });
            }
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function () {
            if (this.topLoading) {
                return;
            }
            this.getDetails(true, false);
        },
        touchBottom: function () {
            if (this.bottomLoading) {
                return;
            }
            this.getDetails(false, true);
        }
    }));
})();

(function(){
    var self = amGloble.page.community = new $.am.Page({
        id: 'page-community',
        init: function(){

            this.$header.find('.title').vclick(function(){
                if(amGloble.metadata.allShopsByPinyin.length==1){
                    return;
                }
                var _this = $(this);
                amGloble.allShops.show({
                    target: _this,
                    callback:function(data){
                        if(self.shopId==data.shopId){
                            return;
                        }
                        _this.find('.text').html(data.shopFullName);
                        self.shopId = data.shopId;
                        self.publicUser = {};
                        self.labelids = [];
                        self.elite = null;
                        self.$header.find('.condition').html('全部');
                        self.$ul.empty();
                        self.getList(true,false);
                    }
                });
            });

            this.$publish = this.$.find('.publish').vclick(function(){
                $.am.changePage(amGloble.page.communityPublish,'slideleft')
            });

            this.sv_search = new $.am.ScrollView({
                $wrap: self.$.find('.openSearch .container'),
                $inner: self.$.find('.openSearch .container .wrapper'),
                direction: [0, 1]
            });

            this.$.find('.right').vclick(function(){
                self.getAssociation();
            });

            this.$openSearch = this.$.find('.openSearch');
            this.$authors = this.$.find('.author ul');
            this.$labels = this.$.find('.topic ul');
            this.$openSearch.find('.top,.cover').vclick(function(){
                self.hideOpenSearch();
            });
            this.$openSearch.on('vclick','li',function(){
                $(this).parents('.wrapper').find('li').removeClass('active');
                $(this).addClass('active');
                var dataType = $(this).data('type'),
                    dataAuthor = $(this).data('author'),
                    dataLabel = $(this).data('label');
                    if(dataType){
                        if(dataType=='all'){
                            self.publicUser = {};
                            self.labelids = [];
                            self.elite = null;
                        }else if(dataType=='elite'){
                            self.publicUser = {};
                            self.labelids = [];
                            self.elite = 1;
                        }else if(dataType=='self'){
                            self.publicUser = {
                                publicUserId: amGloble.metadata.userInfo.userId,
                                publicUserType: amGloble.metadata.userInfo.userType
                            };
                            self.labelids = [];
                            self.elite = null;
                        }
                    }else if(dataAuthor){
                        self.publicUser = {
                            publicUserId: dataAuthor.id,
                            publicUserType: dataAuthor.userType
                        };
                        self.labelids = [];
                        self.elite = null;
                    }else if(dataLabel){
                        self.publicUser = {};
                        self.labelids = [dataLabel.labelName];
                        self.elite = null;
                    }
                    self.$header.find('.condition').html($(this).html());
                    self.hideOpenSearch();
                    self.$ul.empty();
                    self.getList(true,false);
                })

            this.$.find('.operate').vclick(function(e){
                
            });

            this.$ul = this.$.find('.list').on('vclick','li',function(){//跳转详情页
                var data = $(this).data('data');
                console.log(data);
                $.am.changePage(amGloble.page.communityDetail, "slideleft", data);
            }).on('vclick','.operate',function(e){
                e.stopPropagation();
                var _this = $(this).parents('li');
                var data = _this.data('data');
                amGloble.communityOperate.show({
                    options: data.options,
                    callback:function(type){
                        if(type==0){
                            self.setEssence(data,function(){
                                amGloble.msg('设为精华成功');
                                data.elite = 1;
                                data.options = self.getOperateOption(data);
                                _this.find('.title').addClass('essence');
                                self.getList(true,false);
                            });
                        }else if(type==1){
                            self.setEssence(data,function(){
                                amGloble.msg('取消精华成功');
                                data.elite = 0;
                                data.options = self.getOperateOption(data);
                                _this.find('.title').removeClass('essence');
                                self.getList(true,false);
                            });
                        }else if(type==2){
                            $.am.changePage(amGloble.page.communityPublish, "slideleft", {community:data});
                        }else if(type==3){
                            atMobile.nativeUIWidget.confirm({
                                caption: '确定删除吗？',
                                description: '',
                                okCaption: '确定',
                                cancelCaption: '取消'
                            }, function() {
                                self.deleteTopic(data,function(){
                                    amGloble.msg('删除成功');
                                    _this.remove();
                                    self.scrollview.refresh();
                                });
                            }, function() {
                                
                            });
                        }
                    }
                });
            }).on('vclick','.photos div',function(e){
                e.stopPropagation();
                var items = [];
                var index = $(this).parent().children().index($(this));
                $(this).parent().find("img").each(function() {
                    items.push({
                        src: $(this).attr("src").replace("_s", "_l"),
                        w: 1024,
                        h: 1024
                    });
                });
                self.pswpTimer && clearTimeout(self.pswpTimer);
                amGloble.loading.show();
                self.pswpTimer = setTimeout(function() {
                    amGloble.loading.hide();
                    amGloble.pswp(items, index);
                }, 500);
            }).on('vclick','.topics p',function(e){
                e.stopPropagation();
                var val = $(this).html();
                self.publicUser = {};
                self.labelids = [val];
                self.elite = null;
                self.$header.find('.condition').html(val);
                self.$ul.empty();
                self.getList(true,false);
            });
            this.$li = this.$ul.find('li').remove();

            this.loading = this.$.find('.loadingContent');
            this.error = this.$.find('.error');
            this.reload = this.$.find('.reload');
        },
        beforeShow:function(para){
            console.log(para)
            if(!this.shopId){
                var user = amGloble.metadata.userInfo,
                    name = (user.osName==' ' || user.osName=='')?user.shopName:user.osName;
                this.$header.find('.title .text').html(name);
                this.shopId = user.shopId;
            }
            amGloble.page.dashboard.saveCommunityRefreshTimeByUserId();
            if(para && para.PUBLICUSERID){
                var shops = amGloble.metadata.allShops;
                for(var i=0;i<shops.length;i++){
                    if(shops[i].shopId==para.shopId){
                        shopName = (shops[i].osName==' ' || shops[i].osName=='')?shops[i].shopName:shops[i].osName;
                    }
                }
                this.$.find('.title .text').html(shopName);
                this.shopId = para.shopId;
                this.publicUser = {
                    publicUserId: para.PUBLICUSERID,
                    publicUserType: para.EMPTYPE,
                };
                this.labelids = [];
                this.elite = null;
                this.$header.find('.condition').html(para.NAME);
                this.$ul.empty();
            }
            if(amGloble.metadata.allShopsByPinyin.length==1){
                this.$header.find('.subtitle').addClass('single');
            }else {
                this.$header.find('.subtitle').removeClass('single');
            }
            this.getList(true,false);
        },
        afterShow:function(para){
            
        },
        beforeHide:function(){

        },
        afterHide:function(){

        },
        publicDate: null,
        pageSize: 20,
        publicUser: {},
        labelids: [],
        elite: null,
        getList:function(top,bottom){
            if(top){
                this.publicDate = null;
            }
            var opt = {
                shopId: this.shopId || amGloble.metadata.userInfo.shopId,
                pageNumber: 0,
                pageSize: this.pageSize,
                publicDate: this.publicDate,
                elite: this.elite,
                loginUserId: amGloble.metadata.userInfo.userId,
                loginUserType: amGloble.metadata.userInfo.userType,
            }
            if(this.publicUser){
                opt.publicUserId = this.publicUser.publicUserId;
                opt.publicUserType = this.publicUser.publicUserType;
            }
            if(this.labelids.length){
                opt.labelids = this.labelids;
            }
            this.error.hide();
            this.scrollview.pauseTouchBottom = true;
            this.$.find('.am-drag.bottom').hide();
            if(!this.$ul.find('li').length){
                this.loading.show();
            }
            // if(this.api){
            //     this.api.abort();
            // }
            this.api = amGloble.api.communityList.exec(opt, function (ret) {
                self.loading.hide();
                if(top){
                    self.closeTopLoading();
                    self.topLoading = false;
                    self.$ul.empty();
                }
                if(bottom){
                    self.closeBottomLoading();
                    self.bottomLoading = false;
                }
                if (ret && ret.code == 0) {
                    if(ret.content && ret.content.length){
                        console.log(ret);
                        var _last = ret.content[ret.content.length-1];
                        if(_last.elite){
                            self.publicDate = _last.publicDate + 86400000;
                        }else {
                            self.publicDate = _last.publicDate;
                        }
                        self.render(ret.content);
                        self.scrollview.refresh();
                        if(top){
                            self.scrollview.scrollTo('top');
                        }
                        if(ret.content.length<self.pageSize){
                            self.scrollview.pauseTouchBottom = true;
                            self.$.find('.am-drag.bottom').hide();
                        }else {
                            self.scrollview.pauseTouchBottom = false;
                            self.$.find('.am-drag.bottom').show();
                        }
                    }else {
                        self.scrollview.refresh();
                        if(top){
                            self.error.show();
                            self.scrollview.scrollTo('top');
                        }
                        self.scrollview.pauseTouchBottom = true;
                        self.$.find('.am-drag.bottom').hide();
                        if(bottom){
                            self.scrollview.scrollTo('bottom');
                        }  
                    }
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.getList(top,bottom);
                    }, function() {
                        
                    });
                }
            });
        },
        render:function(data){
            for(var i=0;i<data.length;i++){
                var $li = this.$li.clone();
                var tags = data[i].labelids.substring(1,data[i].labelids.length-1).split(',');
                for(var j=0;j<tags.length;j++){
                    $li.find('.topics').append('<p class="am-clickable">'+tags[j]+'</p>');
                }
                var options = this.getOperateOption(data[i]);
                if(!options.length){
                    $li.find('.operate').hide();
                }
                data[i].options = options;
                $li.find('.title').html(data[i].title);
                if(data[i].elite){
                    $li.find('.title').addClass('essence');
                }
                $li.find('.des').html(data[i].content);
                if(data[i].pics){
                    var w = Math.floor(($(".am-widthLimite").width() - 38) / 3);
                    var arr = data[i].pics.split(',');
                    for(var j=0;j<arr.length;j++){
                        var $img = amGloble.photoManager.createImage('community', {
                            parentShopId: data[i].parentShopId,
                        }, arr[j], "s");
                        $li.find('.photos').append($("<div class='am-clickable'></div>").css({
                            width: w,
                            height: w
                        }).append($img));
                    }
                }
                var userinfo = amGloble.metadata.userInfo;
                var type = data[i].publicUserType == 1 ? "artisan" : "manager";
                $li.find('.header').html(amGloble.photoManager.createImage(type, {
                    parentShopId: userinfo.parentShopId,
                    updateTs: new Date().getTime(),
                }, data[i].publicUserId + ".jpg", "s"));
                if(data[i].publicUserSex=='F'){
                    $li.find('.header').addClass('f');
                }
                $li.find('.name').html(data[i].publicUserName);
                $li.find('.time').html(amGloble.time2str(parseInt(data[i].publicDate / 1000)));
                $li.find('.comment .num').html(data[i].commentNum);
                $li.find('.praise .num').html(data[i].supportNum);
                if(data[i].supportNum>0){
                    $li.find('.praise').addClass('has').find('.iconfont').addClass('icon-dianzan1').removeClass('icon-dianzan11');
                }
                $li.data('data',data[i]);
                this.$ul.append($li);
            }
        },
        getAssociation:function(){
            amGloble.loading.show();
            amGloble.api.communityAssociation.exec({
                shopId: self.shopId
            }, function (ret) {
                amGloble.loading.hide();
                if (ret && ret.code == 0) {
                    self.showOpenSearch(ret.content);
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据获取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.getAssociation();
                    }, function() {
                        
                    });
                }
            });
        },
        showOpenSearch:function(data){
            if(amGloble.metadata.userInfo.shopId==this.shopId){
                this.$openSearch.find(".type li:last-child").show();
            }else {
                this.$openSearch.find(".type li:last-child").hide();
            }
            this.$authors.empty();
            if(data.authors && data.authors.length){
                for(var i=0;i<data.authors.length;i++){
                    this.$authors.append($('<li class="am-clickable">'+data.authors[i].name+'</li>').data('author',data.authors[i]));
                }
            }
            this.$labels.empty();
            if(data.labels && data.labels.length){
                for(var i=0;i<data.labels.length;i++){
                    this.$labels.append($('<li class="am-clickable">'+data.labels[i].labelName+'</li>').data('label',data.labels[i]));
                }
            }
            this.$header.find('.right').addClass('up');
            this.$.find('.openSearch').show().find('.container').slideDown(200);
            this.sv_search.refresh();
            this.sv_search.scrollTo('top');
            var condition = this.$header.find('.condition').html();
            var lis = this.$openSearch.find('li');
            lis.removeClass('active');
            for(var i=0;i<lis.length;i++){
                if($(lis[i]).html()==condition){
                    $(lis[i]).addClass('active');
                    return;
                }
            }
        },
        hideOpenSearch:function(){
            this.$openSearch.hide().find('.container').hide();
            this.$.find('.right').removeClass('up');
        },
        getOperateOption:function(data){
            var user = amGloble.metadata.userInfo;
            if(user.newRole==2 || user.newRole==3){
                if(data.shopId==user.shopId){
                    if(data.publicUserId==user.userId){
                        if(data.elite==1){
                            return [1,2,3];
                        }else {
                            return [0,2,3];
                        }
                    }else {
                        if(data.elite==1){
                            return [1,3];
                        }else {
                            return [0,3];
                        }
                    }
                }else {
                    return [];
                }
            }else {
                if(data.publicUserId==user.userId){
                    return [2,3];
                }else {
                    return [];
                }
            }
        },
        // 0 设为精华，1 取消精华
        setEssence:function(data,callback){
            amGloble.loading.show();
            amGloble.api.communityPublish.exec({
                id: data.id,
                elite: data.elite==0?1:0,
            }, function (ret) {
                amGloble.loading.hide();
                if (ret && ret.code == 0) {
                    callback && callback();
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '删除失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.communityDeleteTopic(data,callback);
                    }, function() {
                        
                    });
                }
            });
        },
        // 3 删除
        deleteTopic:function(data,callback){
            amGloble.loading.show();
            amGloble.api.communityDeleteTopic.exec({
                topicId: data.id
            }, function (ret) {
                amGloble.loading.hide();
                if (ret && ret.code == 0) {
                    callback && callback();
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '删除失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function() {
                        self.communityDeleteTopic(data,callback);
                    }, function() {
                        
                    });
                }
            });
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function(){
            if(this.topLoading){
                return;
            }
            this.getList(true,false);
        },
        touchBottom: function(){
            if(this.bottomLoading){
                return;
            }
            this.getList(false,true);
        },
    });
})();
// para options
// 0 设为精华，1 取消精华，2，编辑，3 删除
// [0,1,2,3] || [] 管理员操作自己的帖子
// [0,1,3] 管理员操作他人帖子
// [2,3] 员工操作帖子
// amGloble.communityOperate.show({
//     options: [2,3],
//     callback:function(type){
//         console.log(type);
//     }
// });
(function(){
    var communityOperate = {
        init:function(){
            var self = this;
            var $dom = $('<div id="community-edit">'+
                '<div class="mask"></div>'+
                '<div class="wrapper">'+
                    '<div class="option">'+
                        '<div class="content">'+
                            '<ul>'+
                                '<li type="0">设为精华</li>'+
                                '<li type="1">取消精华</li>'+
                                '<li type="2">编辑</li>'+
                                '<li type="3">删除</li>'+
                            '</ul>'+
                        '</div>'+
                    '</div>'+
                    '<div class="cancle">取消</div>'+
                '</div>'+
            '</div>');
            $('body').append($dom);
            this.$ = $dom;

            this.$mask = this.$.find('.mask').vclick(function(){
                self.hide();
            });
            this.$cancle = this.$.find('.cancle').vclick(function(){
                self.hide();
            });
            this.$wrapper = this.$.find('.wrapper');
            this.$li = this.$wrapper.find('li').vclick(function(){
                var type = $(this).attr('type');
                self.callback && self.callback(type);
                self.hide();
            });

            this.sv = new $.am.ScrollView({
                $wrap: self.$.find('.content'),
                $inner: self.$.find('.content ul'),
                direction: [0, 1]
            });
        },
        show:function(opt){
            if(!this.$){
                this.init();
            }
            this.callback = opt.callback;
            if(!opt.options || !opt.options.length){
                this.$li.show();
            }else {
                for(var i=0;i<opt.options.length;i++){
                    this.$li.eq(opt.options[i]).show();
                }
            }
            this.$.show();
            setTimeout(function(){
                communityOperate.$wrapper.addClass('show');
            },0);
            this.sv.refresh();
            this.sv.scrollTo('top');
        },
        hide:function(){
            this.$.hide();
            this.$wrapper.removeClass('show');
            this.$li.hide();
        }
    };  
    amGloble.communityOperate = communityOperate;
})();

(function(){
    var allShops = {
        init:function(){
            var self = this;
            var $dom = $('<div id="allShops">'+
                '<div class="mask"></div>'+
                '<div class="container">'+
                    '<div class="cover"></div>'+
                    '<div class="content"></div>'+
                '</div>'+
            '</div>');
            $('body').append($dom);
            this.$ = $dom;

            this.$mask = this.$.find('.mask').vclick(function(){
                self.hide();
            });

            this.$cover = this.$.find('.cover').vclick(function(){
                self.hide();
            });
            this.$container = this.$.find('.container');
            this.$content = this.$.find('.content').on('vclick','li',function(){
                var data = $(this).data('data');
                self.callback && self.callback(data);
                self.hide();
            });

            this.sv = new $.am.ScrollView({
                $wrap: self.$.find('.container'),
                $inner: self.$.find('.content'),
                direction: [0, 1]
            });

            this.render();
        },
        render:function(){
            var allShopsByPinyin = amGloble.metadata.allShopsByPinyin;
            for (var i = 0; i < allShopsByPinyin.length; i++) {
                var item = allShopsByPinyin[i];
                var shops = item.shops;
                var $wrap = $('<div class="wrap"><p class="py">' + item.key + '</p></div>')
                var $ul = $('<ul></ul>');
                for (var j = 0; j < shops.length; j++) {
                    var shop = shops[j];
                    var $li = $('<li class="am-clickable">' + shop.shopFullName + '</li>');
                    $li.data('data', shop);
                    $ul.append($li);
                }
                $wrap.append($ul);
                this.$content.append($wrap);
            }
        },
        show:function(opt){
            if(!this.$){
                this.init();
            }
            this.$.show();
            var self = this;
            this.$container.slideDown(200,function(){
                self.sv.refresh();
                self.sv.scrollTo('top');
            });
            this.callback = opt.callback;
            this.target = opt.target;
            if(opt.target){
                opt.target.addClass('up');
            }
        },
        hide:function(){
            var self = this;
            this.$container.slideUp(200,function(){
                self.$.hide();
                if(self.target){
                    self.target.removeClass('up');
                }
            });
        }
    }
    amGloble.allShops = allShops;
})();
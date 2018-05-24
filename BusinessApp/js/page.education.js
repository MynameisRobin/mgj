(function(){

    var category = [
        {
            id: 0,
            type: '热门'
        },
        {
            id: 1,
            type: '修剪造型'
        },
        {
            id: 2,
            type: '染色设计'
        },
        {
            id: 3,
            type: '沟通咨询'
        },
        {
            id: 4,
            type: '互联网运营'
        },
        {
            id: 5,
            type: '管理课程'
        },
        {
            id: 6,
            type: '其他'
        }
    ];

	var that = amGloble.page.education = new $.am.Page({
        id: "page-education",
        init: function(){
        	var self = this;
        	this.logo = this.$.find('.logo');
        	this.searchContainer = this.$.find('.search-container');
        	this.searchHistory = this.searchContainer.find('.search-history');
        	this.searchResult = this.searchContainer.find('.search-result');
            this.nav = this.$.find('.nav')
            this.navWrap = this.nav.find('.nav-wrap');
            this.mainList = this.$.find('.main-list');
            this.searchList = this.$.find('.search-list');
            this.error = this.$.find('.error');
            this.searchError = this.$.find('.search-error');
            this.searchHistory = this.$.find('.search-history');
            this.searchHistoryList = this.searchHistory.find('.search-history-list');
            this.searchResult = this.$.find('.search-result');
            this.HAC = this.$.find('.history-and-collection');
            this.searchMask = this.$.find('.search-mask');
            this.loading = this.$.find('.loadingContent');

            //搜索框
        	this.search = this.$.find('.search').focus(function(){
                var _this = $(this);
                if(!self.logo.hasClass('active')){
            		setTimeout(function(){
                        self.logo.addClass('active');
                        _this.parent().parent().parent().addClass('active');
                    },100);
                }
                self.searchContainer.show();
                self.getSearchList();
        	});

            this.searchForm = this.$.find('.searchForm').on('search',function(){
                var keyword = self.search.val();
                if(keyword==''){
                    that.search.blur();
                    amGloble.msg('请输入搜索内容');
                    return;
                }
                that.getFindData(keyword);
            });

            //取消搜索
        	this.cancle = this.$.find('.cancle').vclick(function(){
        		self.logo.removeClass('active');
        		$(this).parent().removeClass('active');
        		self.searchContainer.hide();
                self.searchHistory.hide();
                self.searchResult.hide();
                self.search.val('');

                self.searchMask.show();
                setTimeout(function(){
                    self.searchMask.hide();
                },500);
        	});

            //删除搜索框文字
        	this.deleteWords = this.$.find('.del-words').vclick(function(){
        		self.search.val('');
        	});

            //删除最近搜索项
            this.searchHistoryList.on('vclick','span',function(e){
                e.stopPropagation();
                var data = $(this).parent().data('data');
                self.delStorage('educationSearch',data);
                $(this).parent().remove();
            });

            //最近搜索项搜索
            this.searchHistoryList.on('vclick','li',function(){
                var data = $(this).data('data');
                self.getFindData(data.id);
            });

            //查看我看过的和我的收藏
        	this.historyAndCollection = this.$.find('.history-and-collection').on('vclick','li',function(){
        		var index = $(this).index();
        		$.am.changePage(amGloble.page.educationHAC,'slideleft',index);
        	});

            //分类点击
            this.nav.on('vclick','.item',function(){
                if($(this).hasClass('active')){
                    return;
                }
                that.scrollview.scrollTo('top');
                $(this).addClass('active').siblings().removeClass('active');
                $(this).attr('data-pageNumber',1);
                var pageNumber = $(this).attr('data-pageNumber'),
                    category = $(this).attr('data-category');
                that.getListData(pageNumber,category,true,false,true);
            });

            //视频列表点击
            this.videoList = this.$.find('.list').on('vclick','li',function(){
                var data = $(this).data('data');
                console.log(data);
                //切换视频详情页
                $.am.changePage(amGloble.page.videodetails,'slideleft',data);
            });

            //继续观看
            this.continue = this.$.find('.continue').vclick(function(){
                var data = $(this).data('data');
                console.log(data);
                var _data=$.extend({},data,{isPlay:true});
                //切换视频详情页
                $.am.changePage(amGloble.page.videodetails,'slideleft',_data);
            });

            //关闭继续观看
            this.closeContinue = this.continue.find('.close-continue').vclick(function(e){
                e.stopPropagation();
                that.continue.hide();
                that.setBodyHeight();
                that.scrollview.refresh();
                that.hasSetLastPlay = true;
            });
            this.carrousel = new $.am.Carrousel({
                id: "main_carrousel",
                height: (window.innerWidth > 500 ? 500 : window.innerWidth) * 126 / 640,
                onchange: function (i) {
                    that.$carrouselCounter.find("p").removeClass("selected").eq(i).addClass("selected");
                }
            });
            this.$carrouselCounter = this.carrousel.$.find("div.count");
            this.carrousel.$inner.on("vclick", "li", function () {
                var link = $(this).prop("link");
                window.open(link, '_blank', 'location=no');
            });     
           this.getCarousel();
        },
        beforeShow: function(){
            if(!this.hasSetCategory){
                this.setCategory();
                this.getListData(1,0,true,false,true);
            }            
            this.setHistoryNumber();
            this.setCollectionNumber();
        },
        afterShow: function(){
            // this.setLastPlay();
            if(this.canSetLastPlay){
                this.setLastPlay();
            }
            this.searchMask.hide();
        },
        beforeHide: function(){},
        afterHide: function(){
            this.searchContainer.hide();
            this.searchHistory.hide();
            this.searchResult.hide();
            this.search.val('');
            this.logo.removeClass('active');
            this.cancle.parent().removeClass('active');

            this.searchMask.show();
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        setCategory: function(){
            var html = ''; 
            for(var i=0;i<category.length;i++){
                html += '<div class="item am-clickable" data-pageNumber="1" data-category="'+ category[i].id +'">'+ category[i].type +'</div>'
            }
            this.navWrap.html(html);
            this.navWrap.find('.item').eq(0).addClass('active');
            var width = 0;
            for(var i=0;i<this.navWrap.find('.item').length;i++){
                width += this.navWrap.find('.item').eq(i).outerWidth(true);
            }
            this.navWrap.css('width',width+'px');
            this.categoryScroll = new $.am.ScrollView({
                $wrap : that.nav,
                $inner : that.navWrap,
                direction : [true, false],
                hasInput: false
            });

            this.hasSetCategory = true;
        },
        pageSize: 10,
        getListData: function(pageNumber,category,top,bottom,first){
            that.error.hide();
            that.continue.hide();
            that.scrollview.pauseTouchBottom = true;
            that.$.find('.am-drag.bottom').hide();
            if(top){
                that.mainList.empty();
            }
            if(first){
                that.loading.show();
            }
            amGloble.api.videoList.exec({
                pageNumber: pageNumber,
                pageSize: that.pageSize,
                category: category
            },function(ret){
                if(first){
                    that.loading.hide();
                }
                if(top){
                    that.closeTopLoading();
                    that.topLoading = false;
                }
                if(bottom){
                    that.closeBottomLoading();
                    that.bottomLoading = false;
                }
                if(ret && ret.code == 0){
                    if(ret.content && ret.content.length){
                        that.nav.find('.active').attr('data-pageNumber',parseInt(pageNumber)+1)
                        that.render(ret.content,that.mainList);
                        if(that.mainList.find('li').length>=ret.totalCount){
                            that.scrollview.pauseTouchBottom = true;
                            that.$.find('.am-drag.bottom').hide();
                        }else {
                            that.scrollview.pauseTouchBottom = false;
                            that.$.find('.am-drag.bottom').show();
                        }
                        that.canSetLastPlay = true;
                    }else {
                        if(top){
                            that.error.html('暂无课程').show();
                        }
                        that.scrollview.refresh();
                        that.scrollview.pauseTouchBottom = true;
                        that.$.find('.am-drag.bottom').hide()
                    }
                }else if(ret && ret.code == -1){
                    that.scrollview.refresh();
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        that.getListData(pageNumber,category,top,bottom,first);
                    }, function(){
                        
                    });
                }
            });
        },
        getCarousel:function(){
            that.loading.show();
            amGloble.api.adslist.exec({
                
            },function(ret){
                that.loading.hide();
                if(ret && ret.code == 0){
                    that.$.find(".swiper-wrapper").empty();
                    if(ret.content.length <=0 ){
                        that.carrousel.$.hide();
                    }else {
                    	that.carrousel.$.show();
                         for(var i=0;i<ret.content.length;i++){
                                if(ret.content[i].status == 1){
                                    var url=Gallery.imgConfig.getUrl(ret.content[i].images,'carousel','m');
                                var $img = $('<img src="'+url+'" />'), $li = $('<li class="am-clickable"></li>');
                                $li.html($img);
                                $li.prop("link",ret.content[i].link);
                                that.carrousel.$inner.append($li);
                                that.$carrouselCounter.append("<p></p>");
                            }
                             
                        }
                        that.carrousel.refresh();
                    }
                }else if(ret && ret.code == -1){
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    });
                }
            });
        },
        getFindData: function(keyword){
            this.searchError.hide();
            this.searchList.empty();
            that.loading.show();
            amGloble.api.videoFind.exec({
                pageNumber: 1,
                pageSize: 9999,
                keyword: keyword
            },function(ret){
                that.loading.hide();
                if(ret && ret.code == 0){
                    if(ret.content && ret.content.length){
                        that.render(ret.content,that.searchList);
                        var data = {id:keyword};
                        that.setStorage('educationSearch',data);
                    }else {
                        that.searchHistory.hide();
                        that.searchResult.show();
                        that.searchError.show();
                    }
                    that.search.val('').blur();
                }else if(ret && ret.code == -1){
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        that.getFindData(keyword);
                    }, function(){
                        
                    });
                }
            });
        },
        template: '<li class="am-clickable">\
                    <div class="left">\
                        <div class="img-wrap">\
                            <img data-src="{{src}}">\
                            <div class="count-wrap">播放<span class="play-count">{{plays}}</span>次</div>\
                        </div>\
                    </div>\
                    <div class="right">\
                        <p class="title">{{title}}</p>\
                        <p class="college">{{organizationname}}{{teachername}}</p>\
                        <div class="keywords">\
                        </div>\
                    </div>\
                </li>',
        render: function(data,parent){
            for(var i=0;i<data.length;i++){
                var html = '';
                html += this.template.replace('{{src}}',Gallery.imgConfig.getUrl(data[i].cover,'videoCover','s')).replace('{{plays}}',data[i].plays).replace('{{title}}',data[i].title);
                var li = $(html);

                var college = '';
                if(data[i].organizationname && data[i].teachername){
                    college = data[i].organizationname + ' / ' + data[i].teachername;
                }else if(data[i].organizationname && !data[i].teachername){
                    college = data[i].organizationname;
                }else if(!data[i].organizationname && data[i].teachername){
                    college = data[i].teachername
                }
                li.find('.college').html(college);

                if(data[i].keyword){
                    var keywordsArr = data[i].keyword.replace(/，/g,',').split(',');
                    var keywords = '';
                    for(var j=0;j<keywordsArr.length;j++){
                        keywords += '<span>'+ keywordsArr[j] +'</span>';
                    }
                    li.find('.keywords').html(keywords);
                }

                parent.append(li.data('data',data[i]));
            }
            if(parent==this.mainList){
                this.scrollview.refresh();
                this.setLastPlay();
            }
            if(parent==this.searchList){
                this.searchHistory.hide();
                this.searchResult.show();
                this.initSearchScroll();
            }
            //关键字显示不全隐藏
            for(var i=0;i<parent.find('li').length;i++){
                var width = 0;
                var wrapperWidth = parent.find('li').eq(i).find('.keywords').width();
                for(var j=0;j<parent.find('li').eq(i).find('.keywords span').length;j++){
                    width += parent.find('li').eq(i).find('.keywords span').eq(j).outerWidth(true);
                    if(width>wrapperWidth){
                        parent.find('li').eq(i).find('.keywords span').eq(j).hide();
                    }
                }
            }

            var imgList = parent.find('img');
            imgList.each(function() {
                var self = $(this);
                if (self.attr('data-src')) {
                    var img = new Image();
                    img.src = self.attr('data-src');
                    img.onload = function() {
                        self.attr('src', self.attr('data-src')).show();
                        
                    };
                }
            });
        },
        initSearchScroll: function(){
            if(this.searchScroll){
                this.searchScroll.refresh();
                this.searchScroll.scrollTo('top');
            }else {
                this.searchScroll = new $.am.ScrollView({
                    $wrap : that.$.find('.search-container'),
                    $inner : that.$.find('.search-container-wrapper'),
                    direction : [false, true],
                    hasInput: false
                });
                this.searchScroll.refresh();
                this.searchScroll.scrollTo('top');
            }
        },
        touchTop: function(){
            if(this.topLoading){
                return;
            }
            this.getCarousel();
            this.nav.find('.active').attr('data-pageNumber',1)
            var pageNumber = this.nav.find('.active').attr('data-pageNumber'),
                category = this.nav.find('.active').attr('data-category');
            this.getListData(pageNumber,category,true,false);
        },
        touchBottom: function(){
            if(this.bottomLoading){
                return;
            }
            var pageNumber = this.nav.find('.active').attr('data-pageNumber'),
                category = this.nav.find('.active').attr('data-category');
            this.getListData(pageNumber,category,false,true);
        },
        getSearchList: function(){
            this.searchHistoryList.empty();
            var data = this.getStorage('educationSearch');
            for(var i=0;i<data.length;i++){
                var html = '';
                html += '<li class="am-clickable"><p>'+ data[i].id +'</p><span class="am-clickable"></span></li>';
                var li = $(html);
                this.searchHistoryList.append(li.data('data',data[i]));
            }
            this.searchHistory.show();
            this.searchResult.hide();
            this.initSearchScroll();
        },
        setHistoryNumber: function(){
            var data = this.getStorage('educationHistory');
            this.HAC.find('li:first-child span').html(data.length);
        },
        setCollectionNumber: function(){
            var data = this.getStorage('educationCollection');
            this.HAC.find('li:last-child span').html(data.length);
        },
        setLastPlay: function(){
            if(!this.hasSetLastPlay){
                var data = this.getStorage('educationHistory');
                if(data[0] && data[0].currentItem){
                    this.continue.find('.continue-course').html('点击继续观看'+data[0].title).end().data('data',data[0]).show();
                }else {
                    this.continue.hide();
                }
                this.setBodyHeight();
                this.scrollview.refresh();
            }
        },
        setStorage: function(storageItem,data){
            var originStorage = JSON.parse(localStorage.getItem(storageItem)) || [];
            for(var i=0;i<originStorage.length;i++){
                if(data.id==originStorage[i].id){
                    originStorage.splice(i, 1);
                }
            }
            originStorage.unshift(data);
            localStorage.setItem(storageItem,JSON.stringify(originStorage));
        },
        getStorage: function(storageItem){
            return JSON.parse(localStorage.getItem(storageItem)) || [];
        },
        delStorage: function(storageItem,data){
            var originStorage = JSON.parse(localStorage.getItem(storageItem)) || [];
            if(originStorage.length){
                for(var i=0;i<originStorage.length;i++){
                    if(data.id==originStorage[i].id){
                        originStorage.splice(i, 1);
                    }
                }
                localStorage.setItem(storageItem,JSON.stringify(originStorage));
            }
        }
    });
})();

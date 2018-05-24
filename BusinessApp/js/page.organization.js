(function(){
	var that = amGloble.page.organization = new $.am.Page({
        id: "page-organization",
        init: function(){
            this.top = this.$.find('.top');
            this.title = this.top.find('.title');
            this.logo = this.top.find('.logo img');
            this.background = this.top.find('.background img');
            this.text = this.top.find('.text');
            this.container = this.$.find('.container');
            this.teacher = this.container.find('.teacher-wrap');
            this.introduction = this.container.find('.introduction');
            this.organization = this.container.find('.organization-wrap');
            this.list = this.container.find('.list');
            this.error = this.$.find('.error');


            this.intro = this.top.find('.intro').vclick(function(){
                var url = $(this).attr('href');
                if(url){
                    window.open(url, '_blank', 'location=no');
                }
            });

            this.back = this.$.find('.top .left').vclick(function(){
                $.am.page.back('slideright');
            });

            this.tab = this.$.find('.tab').on('vclick','li',function(){
                var index = $(this).index();
                if($(this).hasClass('active')){
                    return;
                }
                that.scrollview.scrollTo('top');
                $(this).addClass('active').siblings().removeClass('active');
                that.container.find('.item').eq(index).show().siblings().hide();
                if(index==1){
                    that.getList();
                }else {
                    that.scrollview.refresh();
                }
            });

            this.list.on('vclick','li',function(){
                var data = $(this).data('data');
                console.log(data);
                //切换视频详情页
                $.am.changePage(amGloble.page.videodetails,'slideleft',data);
            });
        },
        beforeShow: function(para){
            console.log(para);
            if(para=='back'){
                return;
            }
            this.organizationid = para.organization.id;
            this.backInfo = para.video;

            this.title.html('');
            this.text.html('');
            this.logo.attr('src','').hide();
            this.background.attr('src','').hide();
            this.tab.find('span').html('');
            this.organization.empty();
            this.tab.find('li').eq(0).addClass('active').siblings().removeClass('active');
            this.container.find('.item').eq(0).show().siblings().hide();
            
            this.getInfo(this.organizationid);
        },
        afterShow: function(para){
            
        },
        beforeHide: function(){},
        afterHide: function(){
            this.scrollview.scrollTo('top');
        },
        getList: function(){  
            this.list.empty();
            amGloble.loading.show();
            amGloble.api.videoList.exec({
                pageNumber: 1,
                pageSize: 9999,
                organizationid: that.organizationid
            },function(ret){
                amGloble.loading.hide();                
                if(ret && ret.code == 0){
                    that.render(ret.content);
                }else if(ret && ret.code == -1){
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        that.getList();
                    }, function(){
                        
                    });
                }
            });
        },
        getInfo: function(id){
            amGloble.loading.show();
            amGloble.api.listOrganization.exec({
                pageNumber:1,
                pageSize:9999,
                organizationid: id
            },function(ret){       
                amGloble.loading.hide();      
                if(ret && ret.code == 0){
                    if(ret.content && ret.content.length){
                        var data = ret.content[0];
                        that.title.html(data.name);
                        //that.logo.attr('src',Gallery.imgConfig.getUrl(data.logo,'institutionLogo','s')).show();
                        var src=Gallery.imgConfig.getUrl(data.logo,"institutionLogo","n");
                        (function(src,self,item){
                            self.resetWidth(src,function(_w,_h,ml,mt,tw){
                                self.$.find(".top .logo").html(Gallery.imgConfig.createImage(item.logo,"institutionLogo","n"));
                                self.$.find(".top .logo").css({
                                    "width":tw+"px",
                                    "height":tw+"px",
                                });
                                self.$.find(".top .logo img").css({
                                    "width":_w+"px",
                                    "height":_h+"px",
                                    "margin-left":ml+"px",
                                    //"margin-top":mt+"px"
                                }).show();
                            });
                        })(src,that,data);

                        that.background.attr('src',Gallery.imgConfig.getUrl(data.logo,'institutionLogo','m')).show();
                        that.text.html(data.introduction);
                        that.introduction.html(data.introduction);
                        that.tab.find('span').html(data.videocount);
                        if(data.url){
                            that.intro.attr('href',data.url);
                            that.intro.find('.more').show();
                        }else {
                            that.intro.attr('href','');
                            that.intro.find('.more').hide();
                        }
                        if(data.images){
                            var images = data.images.split(',');
                            for(var i=0;i<images.length;i++){
                                that.organization.append('<img class="preload" data-src="'+Gallery.imgConfig.getUrl(images[i],'institutionAbout','n')+'">');
                            }
                            that.lazyLoad(that.organization);
                        }
                    }
                }else if(ret && ret.code == -1){
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        that.getList();
                    }, function(){
                        
                    });
                }
            });
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
        render: function(data){
            if(!data.length){
                this.error.show();
                this.scrollview.refresh();
                this.scrollview.scrollTo('top');
                this.tab.find('span').html(0);
                return;
            }
            this.tab.find('span').html(data.length);
            for(var i=0;i<data.length;i++){
                var html = '';
                html += amGloble.page.education.template.replace('{{src}}',Gallery.imgConfig.getUrl(data[i].cover,'videoCover','s')).replace('{{plays}}',data[i].plays).replace('{{title}}',data[i].title);
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

                this.list.append(li.data('data',data[i]));
            }
            //关键字显示不全隐藏
            for(var i=0;i<this.list.find('li').length;i++){
                var width = 0;
                var wrapperWidth = this.list.find('li').eq(i).find('.keywords').width();
                for(var j=0;j<this.list.find('li').eq(i).find('.keywords span').length;j++){
                    width += this.list.find('li').eq(i).find('.keywords span').eq(j).outerWidth(true);
                    if(width>wrapperWidth){
                        this.list.find('li').eq(i).find('.keywords span').eq(j).hide();
                    }
                }
            }

            var imgList = this.list.find('img');
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
            
            this.scrollview.refresh();
        },
        lazyLoad: function(parent){
            var imgList =  parent.find('.preload')
            imgList.each(function() {
                var self = $(this);
                if (self.attr('data-src')) {
                    var img = new Image();
                    img.src = self.attr('data-src');
                    img.onload = function() {
                        self.attr('src', self.attr('data-src'));
                        that.scrollview.refresh();
                    };
                    img.onerror = function(){
                        self.hide();
                    }
                }
            });
        }
    });
})();

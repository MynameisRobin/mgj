(function(){
    var self = amGloble.page.auditArchives = new $.am.Page({
        id: 'page-auditArchives',
        init:function(){
            this.$name = this.$header.find('.title .name');

            this.reportFilter = new amGloble.ReportFilter({
                $: this.$.find('.am-body-wrap'),
                onchange: function() {
                    var currentPage = $.am.getActivePage();
                    if(currentPage.id=='page-auditArchives'){
                        self.getList(true,false);
                    }
                }
            });

            this.$list = this.$.find('.list').on('vclick','.photos div',function(){
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
            });
            this.$li = this.$list.find('li').remove();

            this.loading = this.$.find('.loadingContent');
            this.error = this.$.find('.error');
        },
        backButtonOnclick:function(){
            $('.mbsc-fr-btn-c div').trigger('click');
            $.am.page.back();
        },
        beforeShow:function(para){
            console.log(para);
            this.data = para;
            this.$name.html(para.NAME);
            
            this.reportFilter.setOpt();

            this.reportFilter.setDate(this.data.time[0],this.data.time[1]);
            
            this.getList(true,false);

        },
        afterShow:function(para){
            
        },
        beforeHide:function(){

        },
        afterHide:function(){
            this.$list.empty();
        },
        getPeriod:function(arr){
            var start = arr[0],end = arr[1];
            var period = new Date(start).format('yyyy-mm-dd')+'_'+new Date(end).format('yyyy-mm-dd');
            this.period = period;
        },
        pageNumber: 0,
        pageSize: 20,
        getList:function(top,bottom){
            this.getPeriod(this.reportFilter.getDate());
            if(top){
                this.pageNumber = 0;
            }
            this.error.hide();
            this.scrollview.pauseTouchBottom = true;
            this.$.find('.am-drag.bottom').hide();
            if(!this.$list.find('li').length){
                this.loading.show();
            }

            amGloble.api.audit_achivesList.exec({
                shopid: self.data.shopId,
                // period: '2016-01-01_2018-05-05',
                period: self.period,
                pageNumber: self.pageNumber,
                pageSize: self.pageSize,
                empid: self.data.EMPID,
                userType: self.data.TYPE
            }, function (ret) {
                self.loading.hide();
                if(top){
                    self.closeTopLoading();
                    self.topLoading = false;
                    self.$list.empty();
                }
                if(bottom){
                    self.closeBottomLoading();
                    self.bottomLoading = false;
                }
                if (ret && ret.code == 0) {
                    if(ret.content && ret.content.length){
                        console.log(ret);
                        self.pageNumber++;
                        self.render(ret.content);
                        self.scrollview.refresh();
                        if(top){
                            self.scrollview.scrollTo('top');
                        }
                        if(self.$list.find('li').length>=ret.totalCount){
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
                $li.find('.createTime').html(amGloble.time2str(parseInt(data[i].createTime / 1000)));
                $li.find('.member').html(data[i].memName);
                $li.find('.title').html(data[i].archives);
                if(data[i].imgs){
                    var w = Math.floor(($(".am-widthLimite").width() - 52) / 3);
                    var arr = data[i].imgs.split(',');
                    for(var j=0;j<arr.length;j++){
                        var $img = amGloble.photoManager.createImage('customerFile', {
                            parentShopId: amGloble.metadata.userInfo.parentShopId,
                        }, arr[j], "s");
                        $li.find('.photos').append($("<div class='am-clickable'></div>").css({
                            width: w,
                            height: w
                        }).append($img));
                    }
                }
                $li.find('.l').html(amGloble.photoManager.createImage('customer', {
                    parentShopId: data[i].parentShopId,
                }, data[i].memId + ".jpg", "s"));
                if(data[i].sex=='F'){
                    $li.find('.l').addClass('f');
                }
                $li.find('.name').html(data[i].memName);
                $li.find('.time').html(data[i].lastConsumeTime?amGloble.time2str(parseInt(data[i].lastConsumeTime / 1000)):'无');
                $li.data('data',data[i]);
                this.$list.append($li);
            }
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
    })
})();
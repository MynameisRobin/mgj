(function() {
    var self = amGloble.page.msgRecord = new $.am.Page({
        id: "page-msg-record",
        init: function() {
            this.$list = this.$.find('.list');
            this.$li = this.$list.find('li').eq(0);
            this.$changeShop = this.$.find('.am-header .right').vclick(function(){
                var _this = $(this);
                _this.addClass('up');
                amGloble.page.treasure.getMsg(function(data){
                    var shops = amGloble.page.treasure.getControlShops(data);
                    amGloble.msgSelectShop({
                        data: shops,
                        target: _this
                    },function(shop){
                        self.pageNumber = 0;
                        self.scrollview.scrollTo('top');
                        self.shopId = shop.shopId;
                        if(shop.osName && shop.osName.replace(/(^\s*)|(\s*$)/g,'')){
                            self.$changeShop.html(shop.osName);
                        }else {
                            if(shop.shopId==amGloble.metadata.userInfo.parentShopId){
                                self.$changeShop.html(shop.name);
                            }else {
                                self.$changeShop.html('门店名称未设定');
                            }
                        }
                        self.getRecord(true,false,true);
                    });
                });
            });

            this.$empty = this.$.find('.empty');
        },
        beforeShow: function(para) {
            this.$list.empty();
            this.pageNumber = 0;
            this.scrollview.scrollTo('top');
            if(amGloble.metadata.userInfo.newRole==2 || amGloble.metadata.userInfo.shopType==1){
                this.$changeShop.hide();
            }else {
                this.$changeShop.show();
            }
            console.log(para)
            if(para){
                if(para.osName && para.osName.replace(/(^\s*)|(\s*$)/g,'')){
                    this.$changeShop.html(para.osName);
                }else {
                    if(para.shopId==amGloble.metadata.userInfo.parentShopId){
                        this.$changeShop.html(para.name);
                    }else {
                        this.$changeShop.html('门店名称未设定');
                    }
                }
            }
        },
        afterShow: function(para) {
            if(para){
                this.shopId = para.shopId;
                if(para.osName && para.osName.replace(/(^\s*)|(\s*$)/g,'')){
                    this.$changeShop.html(para.osName);
                }else {
                    if(para.shopId==amGloble.metadata.userInfo.parentShopId){
                        this.$changeShop.html(para.name);
                    }else {
                        this.$changeShop.html('门店名称未设定');
                    }
                }
                this.getRecord(true,false,true);
            }
        },
        beforeHide: function() {

        },
        pageNumber: 0,
        pageSize: 20,
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function(){
            if(this.topLoading){
                return;
            }
            this.pageNumber = 0;
            this.getRecord(true,false);
        },
        touchBottom: function(){
            if(this.bottomLoading){
                return;
            }
            this.pageNumber++;
            this.getRecord(false,true);
        },
        getRecord:function(top,bottom,first){
            if(first){
                amGloble.loading.show();
            }
            if(top){
                this.$list.empty();
            }
            amGloble.api.msgRecord.exec({
                pageNumber: self.pageNumber,
                pageSize: self.pageSize,
                shopId: self.shopId
            }, function(ret) {
                amGloble.loading.hide();
                if(top){
                    self.closeTopLoading();
                    self.topLoading = false;
                }
                if(bottom){
                    self.closeBottomLoading();
                    self.bottomLoading = false;
                }
                if(ret && ret.code==0){
                    self.render(ret.content);
                    if(self.$list.find('li').length>=ret.totalCount){
                        self.scrollview.pauseTouchBottom = true;
                        self.$.find('.am-drag.bottom').hide();
                    }else {
                        self.scrollview.pauseTouchBottom = false;
                        self.$.find('.am-drag.bottom').show();
                    }
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.getRecord();
                    }, function(){
                        
                    });
                }
            });
        },
        render:function(data){
            if(data.length){
                this.$empty.hide();
                for(var i=0;i<data.length;i++){
                    var $li = this.$li.clone();
                    var des = '';
                    if(data[i].payflag==1){
                        $li.addClass('charge').find('.left').html('充值');
                        $li.find('.top p:last-child').html('+'+data[i].count+'条');
                        $li.find('.bottom p:last-child').html('金额：￥'+data[i].chargefee);
                        if(data[i].adminname.indexOf('自助充值')<0){
                            des = data[i].adminname+' 后台充值';
                        }else {
                            des = data[i].adminname;
                        }
                    }else if(data[i].payflag==3){
                        $li.addClass('transOut').find('.left').html('转出');
                        $li.find('.top p:last-child').html('-'+data[i].count+'条');
                        $li.find('.bottom p:last-child').html(data[i].remark || '');
                        des = data[i].adminname;
                    }else if(data[i].payflag==4){
                        $li.addClass('transIn').find('.left').html('转入');
                        $li.find('.top p:last-child').html('+'+data[i].count+'条');
                        $li.find('.bottom p:last-child').html(data[i].remark || '')
                        des = data[i].adminname;
                    }
                    $li.find('.top p:first-child').html(data[i].shopname);
                    $li.find('.bottom p:first-child').html(new Date(data[i].chargetime).format('yyyy-mm-dd')+'('+des+')'); 
                    this.$list.append($li);
                }
                self.scrollview.refresh();
            }else {
                this.$empty.show();
            }
        }
    });
})();
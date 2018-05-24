(function() {
    var self = amGloble.page.msgTrans = new $.am.Page({
        id: "page-msg-trans",
        init: function() {
            this.$from = this.$.find('.from').vclick(function(){
                if(amGloble.metadata.userInfo.newRole==2 || amGloble.metadata.userInfo.shopType==1){
                    return;
                }
                var _this = $(this);
                amGloble.page.treasure.getMsg(function(data){
                    var shops = amGloble.page.treasure.getControlShops(data);
                    var arr = [];
                    for(var i=0;i<shops.length;i++){
                        if(shops[i].shopId!=self.$to.data('data').shopId){
                            arr.push(shops[i]);
                        }
                    }
                    amGloble.msgSelectShop({
                        data: arr,
                        target: _this
                    },function(shop){
                        if(shop.smsFee<=0){
                            amGloble.msg('短信不足无法转出');
                            return;
                        }
                        self.renderFrom(shop);
                    });
                });
            });
            this.$to = this.$.find('.to').vclick(function(){
                var _this = $(this);
                amGloble.page.treasure.getMsg(function(data){
                    var arr = [];
                    for(var i=0;i<data.length;i++){
                        if(data[i].shopId!=self.$from.data('data').shopId){
                            arr.push(data[i]);
                        }
                    }
                    amGloble.msgSelectShop({
                        data: arr,
                        target: _this
                    },function(shop){
                        self.renderTo(shop);
                    });
                });
            });
            this.$num = this.$.find('.transnum');
            this.$trans = this.$.find('.trans').vclick(function(){
                self.smt();
            });
        },
        beforeShow: function(para) {
            this.$to.find('.top,.bottom').hide();
            this.$to.find('.placeholder').show();
            this.$to.data('data',{});
            this.$num.val('');
            this.renderFrom(para);
        },
        afterShow: function() {

        },
        beforeHide: function() {

        },
        renderFrom:function(data){
            if(data.osName && data.osName.replace(/(^\s*)|(\s*$)/g,'')){
                this.$from.find('.name').html(data.osName);
            }else {
                if(data.shopId==amGloble.metadata.userInfo.parentShopId){
                    this.$from.find('.name').html(data.name);
                }else {
                    this.$from.find('.name').html('门店名称未设定');
                }
            }
            this.$from.find('.num').html(data.smsFee+'条');
            if(data.smsFee<100){
                this.$from.find('.num').addClass('warn');
            }else {
                this.$from.find('.num').removeClass('warn');
            }
            // if(data.recent3Mth){
            //     this.$from.find('.rencent').html('最近3个月月均使用'+data.recent3Mth+'条').show();
            // }else {
            //     this.$from.find('.rencent').hide();
            // }
            if(amGloble.metadata.userInfo.newRole==2){
                this.$from.addClass('no-select');
            }else {
                this.$from.removeClass('no-select');
            }
            this.$from.data('data',data);
        },
        renderTo:function(data){
            this.$to.find('.top,.bottom').show();
            this.$to.find('.placeholder').hide();
            if(data.osName && data.osName.replace(/(^\s*)|(\s*$)/g,'')){
                this.$to.find('.name').html(data.osName);
            }else {
                if(data.shopId==amGloble.metadata.userInfo.parentShopId){
                    this.$to.find('.name').html(data.name);
                }else {
                    this.$to.find('.name').html('门店名称未设定');
                }
            }
            this.$to.find('.num').html(data.smsFee+'条');
            if(data.smsFee<100){
                this.$to.find('.num').addClass('warn');
            }else {
                this.$to.find('.num').removeClass('warn');
            }
            // if(data.recent3Mth){
            //     this.$to.find('.rencent').html('最近3个月月均使用'+data.recent3Mth+'条').show();
            // }else {
            //     this.$to.find('.rencent').hide();
            // }
            this.$to.data('data',data);
        },
        smt:function(){
            var from = this.$from.data('data'),
                to = this.$to.data('data'),
                num  = this.$num.val()*1;
            if(!to.shopId){
                amGloble.msg('请选择转入门店');
                return;
            }
            if(from.shopId==to.shopId){
                amGloble.msg('同一门店无法转账');
                return;
            }
            if(!num){
                amGloble.msg('请出入转账条数');
                return;
            }
            if(num>from.smsFee){
                amGloble.msg('超过最大转账条数');
                return;
            }
            amGloble.loading.show();
            amGloble.api.msgTrans.exec({
                fromShopId: from.shopId,
                toShopId: to.shopId,
                quantity: num,
                operator: amGloble.metadata.userInfo.userName
            },function(ret){
                amGloble.loading.hide();
                if(ret && ret.code==0){
                    amGloble.msg('转账成功');
                    self.$to.find('.top,.bottom').hide();
                    self.$to.find('.placeholder').show();
                    self.$to.data('data',{});
                    self.$num.val('');
 
                    from.smsFee -= num;
                    self.$from.data('data',from);
                    self.renderFrom(from);

                    to.smsFee += num;
                    self.$to.data('data',to);
                    self.renderTo(to);

                    var msg = JSON.parse(localStorage.getItem('msg'));
                    for(var i=0;i<msg.data.length;i++){
                        if(msg.data[i].shopId==from.shopId){
                            msg.data[i].smsFee -=num;
                        }
                        if(msg.data[i].shopId==to.shopId){
                            msg.data[i].smsFee +=num;
                        }
                    }
                    localStorage.setItem('msg',JSON.stringify(msg));
                    $.am.changePage(amGloble.page.msgDetail, "slideright");
                }else if(ret && ret.code==-1){
                    amGloble.msg(ret.message);
                    self.touchTop();
                }else {
                    atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '转账失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.smt();
                    }, function(){
                        
                    });
                }
            });
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        touchTop: function(){
            if(this.topLoading){
                return;
            }
            amGloble.page.treasure.getMsg(function(data){
                for(var i=0;i<data.length;i++){
                    if(self.$from.data('data').shopId==data[i].shopId){
                        self.renderFrom(data[i]);
                    }
                    if(self.$to.data('data') && self.$to.data('data').shopId==data[i].shopId){
                        self.renderTo(data[i]);
                    }
                }
                self.closeTopLoading();
                self.topLoading = false;
            },function(){
                self.closeTopLoading();
                self.topLoading = false;
            },true);
        },
    });
})();
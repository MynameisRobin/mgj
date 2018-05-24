(function() {
    var self = amGloble.page.msgCharge = new $.am.Page({
        id: "page-msg-charge",
        init: function() {
            this.$checkRecord = this.$.find('.am-header .right').vclick(function(){
                $.am.changePage(amGloble.page.msgRecord, "slideleft",self.$shop.data('data'));
            });

            this.$shop = this.$.find('.shop').vclick(function(){
                if(amGloble.metadata.userInfo.newRole==2 || amGloble.metadata.userInfo.shopType==1){
                    return;
                }
                var _this = $(this);
                amGloble.page.treasure.getMsg(function(data){
                    var shops = amGloble.page.treasure.getControlShops(data);
                    amGloble.msgSelectShop({
                        data: shops,
                        target: _this
                    },function(shop){
                        self.renderChargeShop(shop);
                    });
                });
            });

            this.$list = this.$.find('.list').on('vclick','li',function(){
                $(this).addClass('active').siblings().removeClass('active');
                self.$charge.addClass('active');
                self.chargeData = $(this).data('data');
            });

            this.$charge = this.$.find('.charge').vclick(function(){
                if(!$(this).hasClass('active')){
                    return;
                }
                self.alipayCharge();
            });

            this.$promotion = this.$.find('.promotion');
            this.$chargeList = this.$.find('.list');
            this.$li = this.$chargeList.find('li').eq(0);
        },
        beforeShow: function(para) {
            if(para=='back'){
                return;
            }
            this.$chargeList.empty();
            this.$charge.removeClass('active');
            if(!para){
                amGloble.page.treasure.getMsg(function(data){
                    for(var i=0;i<data.length;i++){
                        if(data[i].shopId==amGloble.metadata.userInfo.shopId){
                            self.renderChargeShop(data[i]);
                        }
                    }
                });
            }else {
                self.renderChargeShop(para);
            }
            
            amGloble.page.treasure.getRule(function(data){
                if(data.act){
                    self.$promotion.find('p').html(data.act.title).end().show();
                }
                if(data.item){
                    self.renderChargeList(data.item);
                }
            });
        },
        afterShow: function() {

        },
        beforeHide: function() {

        },
        renderChargeShop:function(data){
            if(data.osName && data.osName.replace(/(^\s*)|(\s*$)/g,'')){
                this.$shop.find('.name').html(data.osName);
            }else {
                if(data.shopId==amGloble.metadata.userInfo.parentShopId){
                    this.$shop.find('.name').html(data.name);
                }else {
                    this.$shop.find('.name').html('门店名称未设定');
                }
            }
            this.$shop.find('.num').html(data.smsFee+'条');
            if(data.smsFee<100){
                this.$shop.find('.num').addClass('warn');
            }else {
                this.$shop.find('.num').removeClass('warn');
            }
            // if(data.recent3Mth){
            //     this.$shop.find('.rencent').html('最近3个月月均使用'+data.recent3Mth+'条').show();
            // }else {
            //     this.$shop.find('.rencent').hide();
            // }
            if(amGloble.metadata.userInfo.newRole==2 || amGloble.metadata.userInfo.shopType==1){
                this.$shop.addClass('no-select');
            }else {
                this.$shop.removeClass('no-select');
            }
            this.$shop.data('data',data).show();
        },
        renderChargeList:function(data){
            for(var i=0;i<data.length;i++){
                var $li = this.$li.clone();
                $li.find('.price').html('￥'+data[i].price);
                $li.find('.num').html('短信'+data[i].num+'条');
                if(data[i].tip){
                     $li.find('.sepcial').html(data[i].tip).show()
                }else {
                    $li.find('.sepcial').hide();
                }
                $li.data('data',data[i]);
                this.$chargeList.append($li);
            }
            this.$chargeList.show();
            self.$charge.removeClass('active');
        },
        alipayCharge:function(){
            var activeIndex = this.$list.find('.active').index();
            console.log(activeIndex);
            if(activeIndex<0){
                amGloble.msg('请选择充值金额');
                return;
            }
            amGloble.loading.show();
            amGloble.api.msgAlipayCharge.exec({
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                shopId: self.$shop.data('data').shopId,
                type: 1,
                itemId: self.chargeData.id
            },function(ret){
                amGloble.loading.hide();
                console.log(ret);
                if(ret && ret.code==0){
                    amGloble.loading.show();
                    setTimeout(function() {
                        amGloble.loading.hide();
                    }, 3000);
                    atMobile.payment.alipay(ret.content.payJson, function(msg) {
                        amGloble.loading.hide();

                        // 9000:订单支付成功
                        // *8000:正在处理中（"支付结果确认中"）  代表支付结果因为支付渠道原因或者系统原因还在等待支付结果确认，最终交易是否成功以服务端异步通知为准（小概率状态）
                        // *4000:订单支付失败
                        // *6001:用户中途取消
                        // *6002:网络连接出错
                        if (msg == "9000") {
                            var payData = ret.content;

                            amGloble.loading.show();
                            amGloble.api.msgCheckOrderStatus.exec({
                                parentShopId: amGloble.metadata.userInfo.parentShopId,
                                shopId: amGloble.metadata.userInfo.shopId,
                                orderId: payData.order.id,
                            }, function(ret) {
                                console.log(ret);
                                amGloble.loading.hide();
                                if(ret && ret.code == 0) {
                                    if (ret.content.status == 2) {
                                        amGloble.msg("充值成功");
                                    } else {
                                        amGloble.msg("充值成功，服务器暂未收到消息!");
                                    }
                                    var data = self.$shop.data('data');
                                    data.smsFee += self.chargeData.num;
                                    self.$shop.data('data',data);
                                    self.renderChargeShop(data);
                                    var msg = JSON.parse(localStorage.getItem('msg'));
                                    for(var i=0;i<msg.data.length;i++){
                                        if(msg.data[i].shopId==data.shopId){
                                            msg.data[i].smsFee += self.chargeData.num;
                                        }
                                    }
                                    localStorage.setItem('msg',JSON.stringify(msg));
                                    $.am.changePage(amGloble.page.msgDetail, "slideleft");
                                }else{
                                    amGloble.msg("数据获取失败,请检查网络!");
                                }
                            });
                        } else if (msg == "8000") {
                            amGloble.msg("正在处理中");
                        } else if (msg == "4000") {
                            amGloble.msg("订单支付失败");
                        } else if (msg == "6001") {
                            amGloble.msg("用户中途取消");
                        } else if (msg == "6002") {
                            amGloble.msg("网络连接出错");
                        } else {
                            amGloble.msg("支付失败");
                        }

                    }, function(msg) {
                        amGloble.loading.hide();
                        // *4000:订单支付失败
                        // *6001:用户中途取消
                        // *6002:网络连接出错
                        if (msg == "4000") {
                            amGloble.msg("订单支付失败");
                        } else if (msg == "6001") {
                            amGloble.msg("用户中途取消");
                        } else if (msg == "6001") {
                            amGloble.msg("网络连接出错");
                        } else {
                            amGloble.msg("支付失败");
                        }
                    });
                }else if(ret.code == 1060101) {
                    
                }else{
                    amGloble.msg(ret.message || "数据获取失败,请检查网络!");
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
                    if(self.$shop.data('data').shopId==data[i].shopId){
                        self.renderChargeShop(data[i]);
                    }
                }
                self.closeTopLoading();
                self.topLoading = false;
            },function(){
                self.closeTopLoading();
                self.topLoading = false;
            },true);
            
            amGloble.page.treasure.getRule(function(data){
                if(data.act){
                    self.$chargeList.empty();
                    self.$charge.removeClass('active');
                    self.$promotion.find('p').html(data.act.title).end().show();
                }
                if(data.item){
                    self.renderChargeList(data.item);
                }
            },function(){

            },true);
        },
    });
})();

(function(){
    var msgSelectShop = {
        init: function(){
            var $dom = $('<div id="msgSelectShop">'+
                '<div class="mask am-clickable"></div>'+
                '<div class="container">'+
                    '<ul>'+
                        '<li class="wrap am-clickable">'+
                            '<div class="content">'+
                                '<div class="top">'+
                                    '<p class="name">光谷店</p>'+
                                    '<p class="num">580条</p>'+
                                '</div>'+
                                '<div class="bottom">'+
                                    // '<p class="rencent">最近3个月月均使用300条</p>'+
                                    '<p class="balance">余量</p>'+
                                '</div>'+
                            '</div>'+
                        '</li>'+
                    '</ul>'+
                '</div>'+
            '</div>');
            $('body').append($dom)
            this.$ = $dom;
            this.$ul = $dom.find('ul').on('vclick','li',function(){
                var data = $(this).data('data');
                msgSelectShop.hide(data);
            });
            this.$li = this.$ul.find('li').eq(0);
            this.$mask = this.$.find(".mask").vclick(function(){
                msgSelectShop.$.hide();
                msgSelectShop.target.removeClass('up');
            });
            this.sv = new $.am.ScrollView({
                $wrap : this.$ul.parent(),
                $inner : this.$ul,
                direction : [false, true],
                hasInput: false
            });
        },
        show:function(opt){
            this.$ul.empty();
            for(var i=0;i<opt.data.length;i++){
                var $item = this.$li.clone();
                $item.data('data',opt.data[i]);
                if(opt.data[i].osName && opt.data[i].osName.replace(/(^\s*)|(\s*$)/g,'')){
                    $item.find('.name').html(opt.data[i].osName);
                }else {
                    if(opt.data[i].shopId==amGloble.metadata.userInfo.parentShopId){
                        $item.find('.name').html(opt.data[i].name);
                    }else {
                        $item.find('.name').html('门店名称未设定');
                    }
                }
                $item.find('.num').html(opt.data[i].smsFee+'条');
                if(opt.data[i].smsFee<100){
                    $item.find('.num').addClass('warn');
                }
                // if(opt.data[i].recent3Mth){
                //     $item.find('.rencent').html('最近3个月月均使用'+opt.data[i].recent3Mth+'条').show();
                // }else {
                //     $item.find('.rencent').hide();
                // }
                this.$ul.append($item);
            }
            this.$.show();
            if(opt.target){
                var top = opt.target.offset().top + opt.target.outerHeight();
                this.$ul.parent().css({
                    'top': top-1+'px',
                    'max-height': $(window).height()-top-80+'px'
                })
            }
            this.sv.refresh();
            this.sv.scrollTo("top");
        },
        hide:function (data) {
            this.$.hide();
            this.target.removeClass('up');
            if(data){
                this.cb && this.cb(data);
            }
        }
    }
    amGloble.msgSelectShop = function(opt,cb){
        msgSelectShop.cb = cb;
        msgSelectShop.target = opt.target;
        if(!msgSelectShop.$){
            msgSelectShop.init();
        }
        msgSelectShop.show(opt);
    }
})();
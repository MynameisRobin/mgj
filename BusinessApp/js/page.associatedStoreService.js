(function() {

    var self = amGloble.page.associatedStoreService = new $.am.Page({
        id: "page-associatedStoreService",
        init: function() {
            var self = this;

            //切换
            this.$listBoxUl = this.$.find('.listBox ul').on('vclick','li',function(){
                var $this = $(this);
                $this.addClass('on').siblings('li').removeClass('on');
            });

            //确认
            this.$.find('.okbtn').vclick(function(){
                var _li = self.$listBoxUl.find('.on');
                if(_li.length == 0){
                    amGloble.msg("请选择关联商品服务项！");
                    return;
                }

                var item = _li.data('item');
                var opt = {
                    itemId : item.id,
                    itemName : item.name,
                    itemType : item.category
                };
                var data = {
                    price : item.price
                };
                $.am.page.back();
                self.callback(opt,data);
            });
        },
        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }

            //this.category = ret.category;
            this.subCategory = ret.subCategory;
            this.callback = ret.callback;

            this.getData();
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        // amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        // amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        // touchTop: function() {

        // },
        // touchBottom: function() {

        // },
        getData: function(){
            var self = this;

            amGloble.loading.show("正在获取,请稍候...");
            amGloble.api.queryMallItem.exec({
                //category : self.category,
                category : 1,
                // subCategory : self.subCategory
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    self.render( ret.content );
                } else {
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                }
            });
        },
        render: function(data){
            //模拟数据
            // data = [{
            //     "id": 285,
            //     "parentshopid": 288920,
            //     "name": "蛤蟆",
            //     "starttime": 1464278400000,
            //     "endtime": 1527523200000,
            //     "amount": 10000,
            //     "useamount": 25,
            //     "images": "b5138360-724e-41e6-9b89-4d4be7bc2abb.jpg",
            //     "originalprice": 0,
            //     "price": 15,
            //     "sharediscount": 0,
            //     "category": 1,
            //     "subcategory": 184,
            //     "order": 1,
            //     "quickdescription": "1",
            //     "status": 1,
            //     "allowmemcardpay": 0,
            //     "allowluckymoneypay": 1,
            //     "allowcashcouponpay": 0,
            //     "requiredcredit": null,
            //     "purchaselimit": 0,
            //     "shopids": "288922,920843,288921,288923",
            //     "top": null,
            //     "createtime": 1464337114000,
            //     "lastupdatetime": 1465204915000
            // }];

            this.$listBoxUl.empty();
            for(var i=0; i<data.length; i++){
                var $li = $('<li class="am-clickable">' +
                                '<p class="liprice">¥'+ data[i].price +'</p>' +
                                '<span class="liradio"></span>' +
                                '<p class="liname">'+ data[i].name +'</p>' +
                            '</li>');
                $li.data('item',data[i]);
                this.$listBoxUl.append($li);
            }
        }
    });

})();

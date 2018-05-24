(function() {
    var self = amGloble.page.msgDetail = new $.am.Page({
        id: "page-msg-detail",
        init: function() {
            this.$parentShop = this.$.find('.parent');
            this.$parentShopItem = this.$parentShop.find('.wrap').eq(0);
            this.$shops = this.$.find('.shops')
            this.$shopsItem = this.$shops.find('.wrap').eq(0);

            this.$.on('vclick','.btn',function(){
                var data = $(this).parent().data('data');
                if(!self.isControledShop(data.shopId) || !data.smsFee){
                    return;
                }
                $.am.changePage(amGloble.page.msgTrans, "slideleft",data);
            }).on('vclick','.toRecharge',function(){
                var data = $(this).parent().data('data');
                if(!self.isControledShop(data.shopId)){
                    return;
                }
                $.am.changePage(amGloble.page.msgCharge, "slideleft",data);
            });

            this.$promotion = this.$.find('.promotion');
        },
        beforeShow: function(clearCache) {
            this.$parentShop.empty();
            this.$shops.empty();
            this.scrollview.scrollTo('top');
            amGloble.page.treasure.getMsg(function(data){
                self.render(data);
            });
            amGloble.page.treasure.getRule(function(data){
                if(data.act){
                    self.$promotion.find('p').html(data.act.title).end().show();
                }
            });
        },
        afterShow: function() {
            
        },
        beforeHide: function() {

        },
        render:function(shops){
            var data = amGloble.page.treasure.getControlShops(shops);
            for(var i=0;i<data.length;i++){
                var $item;
                if(data[i].shopId==amGloble.metadata.userInfo.parentShopId){
                    $item = self.$parentShopItem.clone();
                }else {
                    $item = self.$shopsItem.clone();
                }
                $item.data('data',data[i]);
                if(data[i].osName && data[i].osName.replace(/(^\s*)|(\s*$)/g,'')){
                    $item.find('.name').html(data[i].osName);
                }else {
                    if(data[i].shopId==amGloble.metadata.userInfo.parentShopId){
                        $item.find('.name').html(data[i].name);
                    }else {
                        $item.find('.name').html('门店名称未设定');
                    }
                }
                $item.find('.num').html(data[i].smsFee+'条');
                if(data[i].smsFee<100){
                    $item.find('.num').addClass('warn')
                }
                // if(data[i].recent3Mth){
                //     $item.find('.rencent').html('最近3个月月均使用'+data[i].recent3Mth+'条').show();
                // }else {
                //     $item.find('.rencent').hide();
                // }
                if(amGloble.metadata.userInfo.shopType==1){
                    $item.addClass('single');
                }
                if(!this.isControledShop(data[i].shopId) || !data[i].smsFee){
                    $item.find('.btn').addClass('disabled');
                }
                if(!this.isControledShop(data[i].shopId)){
                    $item.find('.toRecharge').addClass('disabled');
                }
                if(data[i].shopId==amGloble.metadata.userInfo.parentShopId){
                    self.$parentShop.append($item);
                }else {
                    self.$shops.append($item);
                }
            }
        },
        isControledShop:function(shopId){
            var data = JSON.parse(localStorage.getItem('msg')).data;
            var shops = amGloble.page.treasure.getControlShops(data);
            for(var i=0;i<shops.length;i++){
                if(shops[i].shopId==shopId){
                    return true;
                }
            }
            return false;
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        touchTop: function(){
            if(this.topLoading){
                return;
            }
            amGloble.page.treasure.getMsg(function(data){
                self.$parentShop.empty();
                self.$shops.empty();
                self.render(data);
                self.closeTopLoading();
                self.topLoading = false;
            },function(){
                self.closeTopLoading();
                self.topLoading = false;
            },true);
            
            amGloble.page.treasure.getRule(function(data){
                if(data.act){
                    self.$promotion.find('p').html(data.act.title).end().show();
                }
            },function(){

            },true);
        },
    });
})();
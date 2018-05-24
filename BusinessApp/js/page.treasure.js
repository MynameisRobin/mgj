(function() {

    var self = amGloble.page.treasure = new $.am.Page({
        id: "page-treasure",
        init: function() {
            var self = this;

            this.$.find(".treasurewrap li").vclick(function() {
                var $this = $(this),
                    page = $this.attr("page");
                if(!page){
                    return;
                }
                if ($this.hasClass("disabled")) {
                    if (amGloble.checkVersion()) {
                        return;
                    };
                }
                $.am.changePage(amGloble.page[page], "slideleft", "forceRefresh");
            });

            this.$.find('.treasurelist-more-btn').vclick(function(){
                $.am.changePage(amGloble.page.msgDetail, "slideleft");
            });

            this.$.find('.treasure-charge-btn').vclick(function(){
                $.am.changePage(amGloble.page.msgCharge, "slideleft");
            });

            this.$msgWrapper = this.$.find('.msg-wrapper')
            this.$msg = this.$msgWrapper.find('.msg');
            this.$msgTip = this.$msgWrapper.find('.msg-tip');
        },
        beforeShow: function(ret) {
            this.getMsg(function(data){
                self.render(self.getControlShops(data));
            });
            if (ret == "back") {
                return;
            }
            var newRole = amGloble.metadata.userInfo.newRole;
            if(newRole==3){
                 this.$.find(".treasurewrap li:first-child").show();
                 if(amGloble.metadata.userInfo.mgjVersion!=3){
                    this.$.find(".treasurewrap li:first-child").addClass('disabled');
                 }
            }else {
                this.$.find(".treasurewrap li:first-child").hide();
            }
        },
        afterShow: function(paras) {
            
        },
        beforeHide: function() {},
        render: function(data){
            var less = [];
            var sum = 0;
            for(var i=0;i<data.length;i++){
                sum += data[i].smsFee;
                if(data[i].smsFee<100){
                    less.push(data[i]);
                }
                if(data[i].shopId==amGloble.metadata.userInfo.shopId){
                    this.$msg.html('短信余量'+data[i].smsFee+'条');
                }
            }
            if(amGloble.metadata.userInfo.newRole==3){
                if(less.length){
                    if(less.length==1){
                        this.$msgTip.html(less[0].osName+'短信余量已不足100条').show();
                    }else {
                        this.$msgTip.html('目前有'+less.length+'家门店短信余量已不足100条').show();
                    } 
                }else {
                    this.$msgTip.hide();
                }
            }else{
                this.$msgTip.hide();
            }

            this.$msgWrapper.show();
        },
        getMsg:function(successCallback,errorCallback,clearCache){
            var msg = JSON.parse(localStorage.getItem('msg'));
            var lastDate = msg? msg.ts:0,
                newDate = new Date().getTime(),
                d = (newDate - lastDate)/(1000 * 60);
            if(!msg || ((lastDate && d>15) || !lastDate || clearCache)){
                if(!clearCache){
                    amGloble.loading.show();
                }
                amGloble.api.msgShops.exec({

                }, function(ret) {
                    amGloble.loading.hide();
                    if(ret && ret.code==0){
                        var obj = {
                            data: ret.content,
                            ts: new Date().getTime()
                        }
                        localStorage.setItem('msg',JSON.stringify(obj));
                        successCallback && successCallback(obj.data);
                    }else if(ret && ret.code == -1){
                        errorCallback && errorCallback();
                    }
                });
            }else {
                successCallback(msg.data);
            }
        },
        getRule:function(successCallback,errorCallback,clearCache){
            var rule = JSON.parse(localStorage.getItem('rule'));
            var lastDate = rule? rule.ts:0,
                newDate = new Date().getTime(),
                d = (newDate - lastDate)/(1000 * 60);
            if(!rule || ((lastDate && d>15) || !lastDate || clearCache)){
                amGloble.api.msgRule.exec({

                }, function(ret) {
                    if(ret && ret.code==0){
                        var obj = {
                            data: ret.content,
                            ts: new Date().getTime()
                        }
                        localStorage.setItem('rule',JSON.stringify(obj));
                        successCallback && successCallback(obj.data);
                    }else if(ret && ret.code == -1){
                        errorCallback && errorCallback();
                    }
                });
            }else {
                successCallback(rule.data);
            }
        },
        getControlShops:function(data){
            var arr = [];
            var shopIds = [];
            for(var i=0;i<amGloble.metadata.shops.length;i++){
                shopIds.push(amGloble.metadata.shops[i].shopId);
            }
            if(shopIds.indexOf(amGloble.metadata.userInfo.shopId)<0){
                shopIds.push(amGloble.metadata.userInfo.shopId);
            }
            for(var i=0;i<data.length;i++){
                for(var j=0;j<shopIds.length;j++){
                    if(data[i].shopId==shopIds[j]){
                        arr.push(data[i]);
                    }
                }
            }
            return arr;
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        touchTop: function(){
            if(this.topLoading){
                return;
            }
            this.getMsg(function(data){
                self.render(data);
                self.closeTopLoading();
                self.topLoading = false;
            },function(){
                self.closeTopLoading();
                self.topLoading = false;
            },true);
        },
    });

})();
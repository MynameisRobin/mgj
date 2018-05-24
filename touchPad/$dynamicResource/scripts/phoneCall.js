
    am.phoneCall = {
        init:function(){
            this.$ = $("#itemMember");
        },
        show:function(){
            this.init();
            this.$.show();
            this.searchMember("123456");
        },
        selectItem:function(){
            this.$.find('').on('vclick','',function(){

            })
        },
        getPhoneNumber:function(number){
            
        },
        searchMember:function(number){
            console.log(am.metadata);
            var that = this;
            var idx = 0;
            if (this.$.find('.depart li.active').index() == 1) {
                idx = 1;
            }
            var shopIds;
            if (idx == 0) {
                shopIds = am.metadata.userInfo.shopId;
            } else {
                shopIds = this.getshopIds(am.metadata.userInfo.shopId);
            }
            am.loading.show();
            am.api.searchmember.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId,
                shopIds: shopIds,
                keyword: number,
                pageSize: 9999,
                pageNumber: 0
            }, function (ret) {
                am.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    that.data = ret.content;
                    that.render(ret.content);
                } else {
                    am.msg(ret.message || "数据获取失败，请重试！");
                } 
            });
        },
        render:function(data){
            var memberId = [];
            var allId = $.map(data,function(obj){
                return obj.id;
            });
            allId.forEach(function(id){
                if(memberId.indexOf(id) == -1){
                    memberId.push(id)
                }
            })
            console.log(memberId);
        }
    }
    setTimeout(function(){
        //am.phoneCall.show();
    },3000)
    
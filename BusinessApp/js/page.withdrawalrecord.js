(function() {

    var self = amGloble.page.withdrawalrecord = new $.am.Page({
        id: "page-withdrawalrecord",
        init: function() {
            var self = this;


        },
        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }
            this.getData(0);
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function() {
            this.getData(0);
        },
        touchBottom: function() {
            this.getData( this.pageNumber );
        },
        pageNumber : 0,
        pageSize : 10,
        getData: function(pageNumber){
            var self = this;

            if(pageNumber == 0){
                self.pageNumber = 0;
                self.$.find('ul').html('');
            }

            amGloble.loading.show("查询中,请稍候...");
            //【生意宝】查询打赏提现历史
            amGloble.api.rewardHistory.exec({
                "pageNumber": pageNumber,
                "pageSize": self.pageSize,
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {

                    var _len = ret.content.length;
                    if(_len == 10){
                        self.pageNumber ++;
                    }

                    if(self.pageSize > _len){
                        self.scrollview.pauseTouchBottom = true;
                    }else{
                        self.scrollview.pauseTouchBottom = false;
                    }

                    if(ret.content.length == 0 && self.pageNumber == 0){
                        self.showEmpty();
                    }else{
                        if(self.pageNumber == 0){
                            self.$.find('ul').html('');
                        }
                        self.render(ret.content);
                    }

                } else {
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                }

                self.closeTopLoading();
                self.closeBottomLoading();

            });
        },
        render: function(data){
            var self = this;
            var userInfo = amGloble.metadata.userInfo;

            for(var i=0; i<data.length; i++){
                var strarr = ['提现失败','已提交申请','提现成功'];  //status 0:失败 1:提现中 2:成功
                var colorarr = ['red','grey','green'];
                var _html = '<li>' +
                                '<div class="left">' +
                                    '<div>' +
                                        //'<p class="custname">'+ ( userInfo.wechatExt ? JSON.parse(userInfo.wechatExt).nickname : data[i].empname ) +'</p>' +
                                        //'<span class="wechatbg"></span>' +
                                    '</div>' +
                                    '<p class="timep">'+ amGloble.time2str(data[i].createtime / 1000) +'</p>' +
                                '</div>' +
                                '<div class="right">' +
                                    '<p class="r_money">￥'+ data[i].money +'</p>' +
                                    '<p class="r_intro '+ colorarr[data[i].status] +'">'+ strarr[data[i].status] +'</p>' +
                                '</div>' +
                            '</li>';
                self.$.find('ul').append(_html);
            }
            self.refresh();
        },
        showEmpty: function(){
            var _li = '<li class="emptyli">空空哒,还木有记录~</li>';
            self.$.find('ul').html( _li );
            this.refresh();
        }
    });

})();

(function() {

    var self = amGloble.page.exceptional = new $.am.Page({
        id: "page-exceptional",
        init: function() {
            var self = this;

            //返回
            this.$.find(".am-body-inner").delegate(".am-backbutton", "vclick", function() {
                $.am.page.back();
            });

            //提现
            this.$.find(".run_ico").parents('.data-exceptionalMoney').vclick(function(){
                $.am.changePage(amGloble.page.withdrawdeposit, "slideleft", {'userid' : self.userid, 'balance' : self.balance});
            });
            //提现记录
            this.$.find(".look_icon").parents('li').vclick(function(){
                $.am.changePage(amGloble.page.withdrawalrecord, "slideleft");
            });
        },
        beforeShow: function(ret) {
            // if (ret == "back") {
            //     return;
            // }
            this.getData();
            this.getRewardRewards(0);   //默认第一页
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function() {
            this.getRewardRewards(0);
        },
        touchBottom: function() {
            this.getRewardRewards( this.pageNumber );
        },
        pageNumber : 0,
        pageSize : 10,
        getData: function(){
            var self = this;

            //【生意宝】查询打赏可提现额度
            amGloble.api.rewardBalance.exec({

            }, function(ret) {
                if (ret.code == 0) {
                    var _content = ret.content;
                    if(_content){
                        self.userid = _content.empid;
                        self.balance = _content.balance;
                        self.totalbalance = _content.totalbalance;
                    }else{
                        self.userid = '';
                        self.balance = 0;
                        self.totalbalance = 0;
                    }
                    $('.page-exceptional .inner_header .money_content .value').html( self.balance );  //可提现金额||余额
                    $('.page-exceptional .moneywrap li').eq(0).find('.moneyp').html(self.totalbalance );  //历史总计
                    $('.page-exceptional .moneywrap li').eq(1).find('.moneyp').html( (self.totalbalance - self.balance).toFixed(2) );   //提现记录
                } else {
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                }
            });
        },
        getRewardRewards: function(pageNumber){
            var self = this;

            if(pageNumber == 0){
                self.pageNumber = 0;
                self.$.find('ul.recordlist').html('');
            }

            amGloble.loading.show("查询中,请稍候...");
            //【生意宝】查询打赏记录
            amGloble.api.rewardRewards.exec({
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
                            self.$.find('ul.recordlist').html('');
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
        render : function(data){
            for(var i=0; i<data.length; i++){

                if(data[i].status != 2) continue;

                var sex = $.trim(data[i].memgender) == 'F' ? 'gender' : 'male';
                var _html = $('<li>' +
                                '<div class="left"></div>' +
                                '<div class="right">' +
                                    '<p class="r_money">￥'+ data[i].reward +'</p>' +

                                '</div>' +
                                '<div class="middle">' +
                                    '<div>' +
                                        '<span class="custname">'+ data[i].memname +'</span>' +
                                        '<span class="'+ sex +'"></span>' +
                                    '</div>' +
                                    '<p class="timep">'+ amGloble.time2str(data[i].createtime / 1000) +'</p>' +
                                    '<p class="r_intro">'+ ( data[i].remark ? data[i].remark : '' ) +'</p>' +
                                '</div>' +
                            '</li>');
                _html.find('.left').html( this.getImg(data[i].memid,sex,_html) );
                this.$.find('ul.recordlist').append(_html);
            }
            this.refresh();
        },
        getImg : function(memid,sex,li){
            if(memid == -1){    //散客
                if(sex == 'gender'){    //女
                    return '<img src="css/img/bg-woman.gif"/>';
                }else{  //男
                    return '<img src="css/img/bg-man.gif"/>';
                }
            }else{

                if(sex == 'gender'){    //女
                    var imgbg = "css/img/bg-woman.gif";
                }else{  //男
                    var imgbg = "css/img/bg-man.gif";
                }
                $(li).find('.left').css({
                    'background' : 'url('+ imgbg +')' + 'no-repeat center center',
                    'background-size' : '45px 45px'
                });

                var $img = amGloble.photoManager.createImage("customer", {
                    parentShopId: amGloble.metadata.userInfo.parentShopId
                }, memid + ".jpg", "s");
                return $img;
            }
        },
        showEmpty: function(){
            var _li = '<li class="emptyli">暂无人打赏，要努力吖~</li>';
            this.$.find('ul.recordlist').html( _li );
            this.refresh();
        }
    });

})();

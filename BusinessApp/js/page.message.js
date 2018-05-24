(function() {

    var self = amGloble.page.message = new $.am.Page({
        id: "page-message",
        init: function() {
            var self = this;
            //
            //列表页相关逻辑

            this.$ul = this.$.find(".messageList");
            this.$li = this.$ul.find(":first").remove();
            this.$ul.empty();
            this.$ul.on("vclick", "li", function() {
                self.takeAction($(this).data('actionData'));
            });

            //error

            this.$error = this.$.find("div.am-page-error");
            this.$error.find(".button-common").vclick(function() {
                self.scrollview.touchTop(3);
            });

            this.$empty = this.$.find("div.am-page-empty");
            this.$empty.find(".button-common").vclick(function() {
                self.scrollview.touchTop(3);
            });
        },
        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }
            // this.render();
        },
        afterShow: function(paras) {

            if (paras == "forceRefresh" || new Date().getTime() - this.refreshTime > 300000) {
                this.scrollview.touchTop(3);
            }
        },
        beforeHide: function() {},

        //列表加载逻辑
        refreshTime: 0,

        refreshPage: function(callback) {
            this.getOnePage(true,callback);
        },
        getOnePage: function(clear,callback) {

            var self = this;

            opt = {
                currentId: clear ? null : this.currentId,
                pageSize: this.pageSize,
            };
            this.getData(opt, function(data) {

                if (data.code == 0) {

                    var list = data.content;
                    //刷新时的处理
                    if (clear) {

                        //当前页最后一条id
                        self.currentId = null;
                        self.refreshTime = new Date().getTime();
                        self.$ul.empty();
                        //self.scrollview.scrollTo("top");

                    }

                    if (list.length) {
                        self.currentId = list[list.length - 1].id;
                    }
                    if (self.pageSize > list.length) {
                        self.scrollview.pauseTouchBottom = true;
                    } else {
                        self.scrollview.pauseTouchBottom = false;
                    }

                    self.appendList(list);
                    callback && callback(list);
                } else {
                    callback && callback();
                }

                self.closeTopLoading();
                self.closeBottomLoading();
            });
        },
        amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
        touchTop: function() {
            this.refreshPage();
        },
        touchBottom: function() {
            this.getOnePage();
        },

        //私有逻辑
        pageSize: 10,
        clearDom: function() {
            this.$ul.empty();
        },
        appendList: function(list) {
            var self = this;
            var $ul = this.$ul;
            //list = [];
            if (list && list.length) {
                $.each(list, function(i, item) {
                    var $li = self.$li.clone(true, true);

                    //租户LOGO
                    $li.find(".photo").empty();

                    $li.find(".title").html(item.title);
                    $li.find(".line2").html(item.content);
                    $li.find(".time").html(amGloble.time2str(item.createtime / 1000));

                    //点击逻辑
                    try {
                        var actionData = JSON.parse(item.data);
                    } catch (err) {
                        var actionData = {};
                    }

                    if (actionData && (actionData.url || actionData.module)) {
                        $li.find(".line3").show();
                        actionData.title = item.title;
                        $li.data("actionData", actionData);
                    }else{
	                    $li.removeClass('am-clickable').find(".line3").hide();
                    }

                    $li.data("item", item);
                    $ul.append($li);
                });
            }

            if ($ul.is(":empty")) {
                //$ul.append("<li class='empty'>暂无内容</li>");
                self.setStatus("empty");
            } else {
                self.setStatus("normal");
            }

            self.refresh();
        },
        getData: function(opt, scb) {

            amGloble.api.messageList.exec($.extend({
                appUserId: amGloble.metadata.userInfo.appUserId
            }, opt), function(ret) {
                if (ret.code == 0) {
                    console.log(ret);
                    amGloble.setMessageDot(0);
                    scb && scb(ret);
                } else {
                    if (self.$ul.children(":not(.empty)").length) {
                        amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                    } else {
                        self.setStatus("error");
                    }
                    scb && scb({
                        code: -1,
                        msg: ""
                    });
                }
            });
        },
        takeAction: function(data) {
            //location.href = "m_custMgmt/index.html#type=reservation";
            //return;
            $.am.debug.log(JSON.stringify(data));
            if (data.url) {
                atMobile.nativeUIWidget.popupWebsite({
                    title: data.title,
                    url: data.url
                });
            } else if (parseInt(data.module) === 5) {
                //预约
                $.am.changePage(amGloble.page.reservation, "slideleft");
            } else if(parseInt(data.module) === 99){
	            $.am.changePage(amGloble.page.msgDetail, "slideleft");
            }else if(data.module == 97){
                $.am.changePage(amGloble.page.customerGrouping, "slideleft");
            }
            else if(data.module == 101){
                $.am.changePage(amGloble.page.empGoalCheck, "slideleft");
            }
            else if(data.module == 103){
                $.am.changePage(amGloble.page.shopGoal, "slideleft");
            }
            else if(data.module == 105){
                var now=new Date();
                var month=now.getMonth()<11?(now.getMonth()+2)+'':'01';
                if(month.length<2){
                    month='0'+month;
                }
                var year=now.getMonth()!=11?now.getFullYear():(now.getFullYear()+1);
                var nextM=year+"/"+month
                $.am.changePage(amGloble.page.shopGoal, "slideleft",{time:nextM});
            }

        }
    });

})();









//

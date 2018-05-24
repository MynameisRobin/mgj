(function() {
    var _this = amGloble.page.todoList = new $.am.Page({
        id: "page_todoList",
        init: function() {
            var self = this;
            this.$tab = this.$header.find("ul.tab").on("vclick", "li", function() {
                if (self.loading) {
                    return;
                }
                var $this = $(this);
                $this.addClass("selected").siblings().removeClass("selected");
                self.refreshPage();
            });


            this.$ul = this.$.find(".todoList");
            this.$ul.on("vclick", "span.icon1", function() {
                var _item = $(this).parents('li').data('item');
                setTimeout(function(){
                    //预约
                    $.am.changePage(amGloble.page.reservation, "slideleft", {user:{id:_item.customerId,name:_item.customerName,sex:_item.gender,mobile:_item.mobile,lastconsumetime:_item.mobile}});
                    console.log(_item,"传的啥玩意")
                },500);
            }).on("vclick", "span.icon4", function() {
                //处理
                var item = $(this).parent().parent().data("item");
                $.am.changePage(amGloble.page.todoProcess, "slideup", item);
            }).on("vclick", ".photo", function() {
                //头像
                var item = $(this).parent().parent().data("item");
                $.am.changePage(amGloble.page.customerDetail, "slideleft", {
                    custId: item.customerId
                });
            })

            this.$li = this.$ul.children(":first").remove();

        },
        beforeShow: function(paras) {
            var self = this;
            if (paras == "back") {
                return false;
            }
            if(paras && paras.EMPID){
                this.EMPID = paras.EMPID;
                this.TIME = paras.time;
            }
            this.setStatus("loading");
            this.resetList();
        },
        afterShow: function(paras) {
            if (paras == "back") {
                return false;
            }
            this.getOnePage();
        },
        beforeHide: function(paras) {
            this.EMPID = null;
            this.TIME = null;
        },
        refreshPage: function() {
            this.resetList();
            this.getOnePage();
        },
        //重新加载列表
        resetList: function() {
            this.pageSize = 6;
            //每页条数
            this.pageIndex = 0;
            //当前页数 -1表示未加载
            this.pageCount = -1;
            //列表总页数 -1表示未知
            this.$ul.empty();
            this.scrollview.scrollTo("top");
            // this.setStatus("normal");


        },
        getPeriod:function(arr){
            var start = arr[0],end = arr[1];
            var period = new Date(start).format('yyyy-mm-dd')+'_'+new Date(end).format('yyyy-mm-dd');
            return period;
        },
        getOnePage: function(animation) {
            var self = this;


            var user = amGloble.metadata.userInfo;
            var status = this.$tab.children(".selected").attr("data-id") * 1;

            if (this.$ul.is(":empty")) {
                this.setStatus("loading");
            }

            this.loading = true;
            var opt = {
                "userId": self.EMPID?self.EMPID:user.userId, //员工id
                // "type": 1, //1 周期提醒 2 客户闹钟 可选
                "status": status, //1 已处理 0 未处理  可选
                "pageSize": this.pageSize,
                "pageNumber": this.pageIndex
            }
            if(this.TIME){
                opt.period = this.getPeriod(this.TIME);
            }
            amGloble.api.todoList.exec(opt, function(ret) {
                self.loading = false;
                self.setStatus("normal");
                if (ret.code == 0) {
                    console.log(ret);
                    var data = ret.content;

                    self.pageIndex += 1;
                    if (!ret.content || (ret.content && ret.content.length < self.pageSize)) {
                        self.scrollview.pauseTouchBottom = true;
                    } else {
                        self.scrollview.pauseTouchBottom = false;
                    }

                    self.appendList(data, status);
                    self.closeBottomLoading();
                } else {
                    if (self.$ul.is(":empty")) {
                        self.setStatus("error");
                    }
                    amGloble.msg("数据加载失败,点击重试!");
                }

            });

        },
        appendList: function(data, status) {
            var self = this;
            var $ul = this.$ul;

            if (data && data.length) {
                $.each(data, function(i, item) {
                    $ul.append(self.createItem(item, status));
                });
            }

            if ($ul.is(":empty")) {
                this.setStatus("empty");
            }
            self.refresh();
        },
        createItem: function(item, status) {
            var self = this;
            var $li = this.$li.clone(true, true);

            if (item.gender == "M") {
                $li.find(".photo").addClass("male");
            }
            $li.find(".photo").html(amGloble.photoManager.createImage("customer", {
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                updateTs: item.lastphotoupdatetime
            }, item.customerId + ".jpg", "s"));



            $li.find(".title").html(item.customerName);
            $li.find(".type").html(item.typeId == 1 ? "周期提醒" : "闹钟");
            $li.find(".text").html(item.content);
            if (status == 1) {
                $li.find(".processText").show().html(item.handleResult);
                $li.find(".action > .icon4").hide();
            }

            // if (user.phone && user.phone.length > 4 && amGloble.allowViewTel) {
            if (item.mobile && item.mobile.length && amGloble.metadata.permissions.allowphone) {
                $li.find(".action > .icon2").attr("href", "tel:" + item.mobile).css("display", "block");
                $li.find(".action > .icon3").attr("href", "sms:" + item.mobile).css("display", "block");
            } else {
                $li.find(".action > .icon2").hide();
                $li.find(".action > .icon3").hide();
            }

            if(this.EMPID){
                $li.find('.action').remove();
            }
            $li.data("item", item);
            return $li;
        },
        touchBottom: function() {
            var _this = this;
            this.getOnePage();
        },
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."]
    });
})();

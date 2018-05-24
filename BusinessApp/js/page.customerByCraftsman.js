amGloble.page.customerByCraftsman = new $.am.Page({
    id: "page-customerByCraftsman",
    init: function () {
        var self = this;



        //类型bar
        var $tabc = this.$.find(".page-customerByCraftsman-type");
        this.$tab = $tabc.find("ul").on("vclick", "li", function () {
            if (self.loading) {
                return;
            }
            $(this).addClass("selected").siblings().removeClass("selected");
            self.refreshPage();
        });

        this.$.find(".am-header .left").vclick(function () {
            var type = self.$tab.find(".selected").data("type")
            $.am.changePage(amGloble.page.customerGrouping, "", { type: type });
        })

        this.sv_tab = new $.am.ScrollView({
            $wrap: $tabc,
            $inner: this.$tab,
            direction: [1, 0]
        });



        //滚动加载

        this.$ul = this.$.find(".craftsmanList").on("vclick", "li", function () {
            var type = self.$tab.find(".selected").data("type")
            $.am.changePage(amGloble.page.customerGrouping, null, { emp: $(this).data("emp"), type: type });
        });
        this.$.on("vclick", ".not_assigned-bar", function () {
            var type = self.$tab.find(".selected").data("type")
            $.am.changePage(amGloble.page.customerGrouping, null, { emp: $(this).data("emp"), type: type });
        })
        this.$li = this.$ul.find(":first").remove();
        //重试
        this.$.find(".am-page-error .button-common").vclick(function () {
            self.refreshPage();
        });

    },

    beforeShow: function (paras) {
        var self = this;
        amGloble.storeSelect.onShopChange = function (shops) {
            self.refreshPage();
        };
        if (paras == "back") {
            return false;
        }
        this.setStatus("loading");
        this.initPageParas(paras)
        this.resetList();
        this.getSummaryData();
    },

    afterShow: function (paras) {
        this.sv_tab.refresh();
        if (paras == "back") {
            return false;
        }
        this.getOnePage();
    },
    refreshPage: function () {

        this.resetList();
        this.getSummaryData();
        this.getOnePage();
    },

    initPageParas: function (paras) {
        if (!paras) {
            paras = {}
        }
        if (typeof paras.type != 'undefined') {
            paras.type = paras.type == 4 ? 0 : paras.type;
            $(this.$tab.find("li")[paras.type]).addClass("selected").siblings().removeClass("selected");
        }
    },
    //重新加载列表
    resetList: function () {
        this.pageLength = 10;
        //每页条数
        this.pageIndex = 0;
        //当前页数 -1表示未加载
        this.pageCount = -1;
        //列表总页数 -1表示未知
        this.$ul.empty();
        this.scrollview.scrollTo("top");
        // this.setStatus("normal");
        //获取当前门店，如果是全企业则自动选中第一个门店
        var shop = amGloble.storeSelect.getCurrentShops();
        if (!shop) {
            amGloble.metadata.shopsGroupByPinyin.forEach(function (val) {
                if (!shop) {
                    if (val.shops.length > 0) {
                        shop = val.shops.filter(function (item) {
                            return item.mgjversion == 3;
                        });
                    }
                } else {
                    return;
                }
            })
            amGloble.storeSelect.setCurrentShops(shop[0]);
        }

    },
    getSummaryData: function () {
        var self = this;
        var user = amGloble.metadata.userInfo;
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            //单个门店
            if (shop.mgjversion != 3) {
                console.log("-----------------------------------------------------")
                var $tabitems = self.$tab.find("li");
                $tabitems.find(".num").html(0);
                return false;
            }
            shop = [shop];
        } else {

            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };

        amGloble.api.customerDashboard.exec({
            "type": this.$tab.find(".selected").data("type"),
            "empid": user.userId,
            "shopIds": amGloble.getKeyArr(shop, "shopId", true, true).join(","),
            "userType": user.userType, // 1 管理员 0 员工
            "searchType": 1
        }, function (ret) {
            if (ret.code == 0) {
                var data = ret.content;
                var $tabitems = self.$tab.find("li");
                $tabitems.eq(0).find(".num").html(data.totalCount || 0);
                $tabitems.eq(1).find(".num").html(data.highQualityCount || 0);
                $tabitems.eq(2).find(".num").html(data.lostCount || 0);
                $tabitems.eq(3).find(".num").html(data.staticCount || 0);
                $tabitems.eq(4).find(".num").html(data.favorCount || 0);
            } else {
                amGloble.msg("数据加载失败,点击重试!");
            }

        });
    },
    getOnePage: function (animation) {
        var self = this;

        var user = amGloble.metadata.userInfo;
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            //单个门店
            if (shop.mgjversion != 3) {
                self.setStatus("normal");
                self.appendList("此门店是风尚版，不可使用客户管理");
                return false;
            }
            shop = [shop];
        } else {

            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };
        this.setStatus("loading");
        this.loading = true;
        amGloble.api.querEmpCusts.exec({
            "type": this.$tab.find(".selected").data("type"),
            "empid": user.userId,
            "shopIds": amGloble.getKeyArr(shop, "shopId", true, true).join(","),
            "userType": user.userType, // 1 管理员 0 员工
            "pageNumber": this.pageIndex,
            "pageSize": this.pageLength
        }, function (ret) {
            self.loading = false;
            if (ret.code == 0) {
                // console.log(ret);
                console.log("-------------------------------------------------------------------------------");
                var data = ret.content;
                self.pageIndex += 1;
                if (!ret.content || (ret.content && ret.content.length < self.pageLength)) {
                    self.scrollview.pauseTouchBottom = true;
                } else {
                    self.scrollview.pauseTouchBottom = false;
                }

                self.appendList(data);
                self.closeBottomLoading();
            } else {
                if (self.$ul.is(":empty")) {
                    self.setStatus("error");
                }
                amGloble.msg("数据加载失败,点击重试!");
            }
            self.setStatus("normal");
        });
    },
    createCustItem: function (item, sort) {
        var $li = this.$li.clone(true, true);
        $li.find(".img_box").html(amGloble.photoManager.createImage("artisan", {
            parentShopId: amGloble.metadata.userInfo.parentShopId,
            updateTs: item.lastphotoupdatetime
        }, item.id + ".jpg", "s"));
        $li.find(".name").html(item.name);
        $li.find(".num").html(item.consumeTotal + '个顾客');

        $li.data("emp", item);
        if (item.sex == "M") {
            $li.find(".img_box").addClass("male");
        }
        return $li;
    },
    appendList: function (data) {
        var self = this;
        var $ul = this.$ul;
        if (typeof data == "string") {
            $ul.append("<p>" + data + "</p>");
            return;
        }
        if (data && data.length) {
            $.each(data, function (i, item) {
                if (item.id != -1) {
                    $ul.append(self.createCustItem(item));
                } else {
                    self.$.find(".not_assigned-bar").data("emp", item);
                    self.$.find(".not_assigned-bar .num").text(item.consumeTotal + '个顾客');
                }
            });
        }
        if ($ul.is(":empty")) {
            this.setStatus("empty");
        }
        self.refresh();
    },
    touchBottom: function () {
        var _this = this;
        this.getOnePage();
    },
    amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."]
});
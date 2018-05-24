amGloble.page.assignCustomer = new $.am.Page({
    id: "page-assignCustomer",
    init: function () {
        var self = this;

        this.$.find(".am-header .left").vclick(function () {
            var type = self.$tab.find(".selected").data("type")
            var $sort = self.$sortbar.find(".selected");
            var sort = $sort.data("sort");
            var isReverse = $sort.find("span.sort").hasClass("up") ? 0 : 1;
            var params = { type: type, sort: sort, isReverse: isReverse, cData: self.cData, pageIndex: self.pageIndex, totalData: self.totalData };
            if (self.emp) {
                params.emp = self.emp;
                params.aback = true;
            }
            $.am.changePage(amGloble.page.customerGrouping, "", params);
        })


        this.$.find(".c-custList").on("vclick", "li", function () {
            if ($(this).find(".left_checkbox").hasClass("checked")) {
                $(this).find(".left_checkbox").removeClass("checked")
            } else {
                $(this).find(".left_checkbox").addClass("checked")
            }
        })

        this.$.find(".craftsman-list-mask").vclick(function () {
            self.$.find(".craftsman-list").hide();
            self.$.find(".craftsman-list-mask").hide();
        })




        this.$eul = this.$.find(".craftsman-list ul").on("vclick", "li", function () {
            if (!$(this).hasClass("checked")) {
                $(this).addClass("checked")
            } else {
                $(this).removeClass("checked")
            }
        })
        this.$.find(".craftsman-list .top_title").on("vclick", "a", function () {
            self.assignCustomer();
        })
        this.$header.children(".right.button").vclick(function () {
            var display = self.$.find(".craftsman-list").css('display');
            if (display == 'none') {
                self.$.find(".craftsman-list").show();
                self.$.find(".craftsman-list-mask").show();
                self.$list_sv.refresh();
            }
        });

        //类型bar
        var $tabc = this.$.find(".page-assignCustomer-type");
        this.$tab = $tabc.find("ul").on("vclick", "li", function () {
            if (self.loading) {
                return;
            }
            $(this).addClass("selected").siblings().removeClass("selected");
            self.refreshPage();
        });

        this.sv_tab = new $.am.ScrollView({
            $wrap: $tabc,
            $inner: this.$tab,
            direction: [1, 0]
        });


        this.$list_sv = new $.am.ScrollView({
            $wrap: this.$.find(".craftsman-list .list"),
            $inner: this.$eul,
            direction: [0, 1]
        });

        //排序
        this.$sortbar = this.$.find(".page-assignCustomer-sort ul").on("vclick", "li", function () {
            if (self.loading) {
                return;
            }
            var $this = $(this);
            if ($this.hasClass("selected")) {
                $this.find("span.sort").toggleClass("up");
            } else {
                $this.addClass("selected").siblings().removeClass("selected");
            }
            self.refreshPage();
        });
        this.$header.on("vclick", ".title>.c-empsSelectBtn", function () {
            if (!self.$.find("#ac-empsSelect").is(":hidden")) {
                self.$.find("#ac-empsSelect").slideUp(200)
                $(this).removeClass("up");
            } else {
                self.$.find("#ac-empsSelect").slideDown(200)
                $(this).addClass("up");
                self.$emps_sc.refresh();
            }
        })
        this.$.find("#ac-empsSelect .empList").on("vclick", "ul>li", function () {
            var emp = $(this).data("emp");
            emp.id = emp.empid;
            self.eid = emp.empid;
            self.emp = emp;
            self.$header.find(".title>.c-empsSelectBtn>.text").text(emp.empname ? emp.empname : emp.pname ? emp.pname : emp.name)
            self.$header.find(".title>.c-empsSelectBtn>.emp_tenantLogo").html(amGloble.photoManager.createImage("artisan", {
                parentShopId: amGloble.metadata.userInfo.parentShopId,
            }, emp.empid + ".jpg", "s"));
            self.refreshPage();
            self.$header.find(".title>.c-empsSelectBtn").removeClass("up");
        });

        this.$ul = this.$.find(".c-custList").on("vclick", "li", function () {
            //$.am.page.back(null,{eid:$(this).data("id")});
        });

        this.$li = this.$ul.find(":first").remove();

        //重试
        this.$.find(".am-page-error .button-common").vclick(function () {
            self.refreshPage();
        });

        this.$emps_sc = new $.am.ScrollView({
            $wrap: this.$.find(".c-empsSelect-inner"),
            $inner: this.$.find(".c-empsSelect-inner .scrollInner"),
            direction: [0, 1]
        });
    },

    beforeShow: function (paras) {
        var self = this;
        amGloble.storeSelect.onShopChange = function (shops) {
            self.refreshPage();
        };
        if (paras && paras.emp) {
            var emp = paras.emp;
            this.emp = emp;
            this.eid = emp.id;
            this.$header.find(".title>.c-storeSelectBtn").hide();
            this.$header.find(".title>.c-empsSelectBtn").show();
            this.$header.find(".title>.c-empsSelectBtn>.text").text(emp.empname ? emp.empname : emp.pname ? emp.pname : emp.name)
            this.$header.find(".title>.c-empsSelectBtn>.emp_tenantLogo").html(amGloble.photoManager.createImage("artisan", {
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                updateTs: emp.lastphotoupdatetime
            }, emp.id + ".jpg", "s"));
            this.$header.children(".right").addClass("active_cra");
        } else {
            this.emp = null;
            this.$header.find(".title>.c-storeSelectBtn").show();
            this.$header.find(".title>.c-empsSelectBtn").hide();
            this.$header.children(".right").removeClass("active_cra");
        }
        if (paras) {
            this.initPageParas(paras);
        }
    },
    afterShow: function (paras) {

    },
    initPageParas: function (paras) {
        if (typeof paras.type != 'undefined') {
            $(this.$tab.find("li")[paras.type]).addClass("selected").siblings().removeClass("selected");
        }
        if (typeof paras.sort != 'undefined') {
            $(this.$sortbar.find("li")[paras.sort]).addClass("selected").siblings().removeClass("selected");
        }
        if (typeof paras.isReverse != 'undefined') {
            if (paras.isReverse == 0) {
                $(this.$sortbar.find("li")[paras.sort]).find("span.sort").toggleClass("up");
            }
        }
        var shop = amGloble.storeSelect.getCurrentShops();
        if (!shop) {
            this.refreshPage();
        } else {
            if (paras.cData) {
                this.refreshPage(true);
                this.appendList(paras.cData);
                this.cData = paras.cData;
            }
            if (paras.totalData) {
                var data = paras.totalData;
                this.totalData = data;
                var $tabitems = this.$tab.find("li");
                $tabitems.eq(0).find(".num").html(data.totalCount || 0);
                $tabitems.eq(1).find(".num").html(data.highQualityCount || 0);
                $tabitems.eq(2).find(".num").html(data.lostCount || 0);
                $tabitems.eq(3).find(".num").html(data.staticCount || 0);
                $tabitems.eq(4).find(".num").html(data.favorCount || 0);
            }
            if (typeof paras.pageIndex != 'undefined') {
                this.pageIndex = paras.pageIndex;
            }
        };
    },
    assignCustomer: function () {
        var self = this;
        var $celi = this.$eul.find("li.checked");
        var $cli = this.$ul.find("li .left_checkbox.checked");
        if ($celi.length == 0) {
            amGloble.msg("请选择要分配的手艺人!");
            return;
        }
        if ($cli.length == 0) {
            amGloble.msg("请选择需要分配的顾客!");
            return;
        }
        var params = [];
        for (var i = 0; i < $celi.length; i++) {
            var eid = $($celi[i]).data("id");
            for (var j = 0; j < $cli.length; j++) {
                var cid = $($cli[j]).data("id");
                params.push({
                    memid: cid,
                    empid: eid
                });
            }
        }
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            //单个门店
            shop = [shop];
        } else {
            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };
        if (this.isloding) {
            return;
        }
        this.setStatus("loading")
        this.isloding = true;
        amGloble.api.updEmpCusts.exec({
            "parentShopId":shop[0].parentShopId,
            "shopid": shop[0].shopId,
            'params': JSON.stringify(params)
        }, function (ret) {
            self.setStatus("normal")
            self.isloding = false;
            if (ret.code == 0) {
                amGloble.msg("客户分配成功!");
                self.refreshPage();
                self.$.find(".craftsman-list").hide();
                self.$.find(".craftsman-list-mask").hide();
                var type = self.$tab.find(".selected").data("type")
                var $sort = self.$sortbar.find(".selected");
                var sort = $sort.data("sort");
                var isReverse = $sort.find("span.sort").hasClass("up") ? 0 : 1;
                var params = { type: type, sort: sort, isReverse: isReverse };
                if (self.emp) {
                    params.emp = self.emp;
                    params.aback = true;
                }
                $.am.page.back("", params);
            } else {
                amGloble.msg(ret.message);
            }
        });
    },
    refreshPage: function (flag) {
        this.setStatus("loading")
        this.restList();
        this.getEmsList();
        if (!flag) {
            this.getSummaryData();
            this.getOnePage();
        } else {
            this.setStatus("normal");
        }
    },
    restList: function () {
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
                }else{
                    return;
                }
            })
            amGloble.storeSelect.setCurrentShops(shop[0]);
        }
        this.pageLength = 10;
        //每页条数
        this.pageIndex = 0;
        //当前页数 -1表示未加载
        this.pageCount = -1;
        //列表总页数 -1表示未知
        this.$ul.empty();
        this.$eul.empty();
        this.scrollview.scrollTo("top");
        this.$list_sv.refresh();
        this.$list_sv.scrollTo("top");
        this.$emps_sc.refresh();
        this.$.find("#ac-empsSelect").hide();
        this.cData = null;
        var type = this.$tab.find(".selected").data("type");
        switch (type) {
            case 0:
                this.$sortbar.removeClass("disableSort");
                break;
            case 1:
                this.$sortbar.addClass("disableSort");
                break;
            case 2:
                this.$sortbar.removeClass("disableSort");
                break;
            case 3:
                this.$sortbar.removeClass("disableSort");
                break;
            case 4:
                this.$sortbar.removeClass("disableSort");
                break;
        }
    },
    getSummaryData: function () {
        var self = this;
        var user = amGloble.metadata.userInfo;
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            //单个门店
            if (shop.mgjversion != 3) {
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
            "empid": self.eid ? self.eid : user.userId,
            "shopIds": amGloble.getKeyArr(shop, "shopId", true, true).join(","),
            "userType": self.eid ? 1 : user.userType, // 0管理员  1员工
        }, function (ret) {
            if (ret.code == 0) {
                var data = ret.content;
                self.totalData = data;
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
    getEmsList: function () {
        var self = this;
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            //单个门店
            shop = [shop];
        } else {
            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };
        amGloble.api.employeeGetEmpByShopid.exec({
            "shopid": shop[0].shopId
        }, function (ret) {
            if (ret.code == 0) {
                self.emps = ret.content;
                self.emps.forEach(function (item) {
                    var $li = $("<li></li>").addClass("am-clickable");
                    $li.html(item.empname)
                    $li.data("id", item.empid)
                    self.$eul.append($li);
                });
                self.$list_sv.refresh();
                self.$list_sv.scrollTo("top");


                // 间隔
                var empsGroupByPinyin = {};
                for (var i = 0; i < self.emps.length; i++) {
                    var item = self.emps[i];
                    // item.shopFullName = item.shopName + (item.osName || "");
                    item.pinyin = codefans_net_CC2PY(item.empname ? item.empname : "帅帅的设计师");
                    var py = item.pinyin.substr(0, 1).toUpperCase() || "#";
                    item.pname = item.empname ? item.empname : "帅帅的设计师";
                    if (empsGroupByPinyin[py]) {
                        empsGroupByPinyin[py].push(item);
                    } else {
                        empsGroupByPinyin[py] = [item];
                    }
                }
                self.$.find(".c-empsSelect-inner .scrollInner .empList").empty();
                for (var key in empsGroupByPinyin) {
                    var emps = empsGroupByPinyin[key];
                    // var shops = item.shops;
                    var $index = $('<div class="index">' + key + '</div>');
                    var $ul = $('<ul class="subList"></ul>');
                    for (var j = 0; j < emps.length; j++) {
                        var emp = emps[j];
                        var $li = $('<li class="am-clickable">' + emp.pname + '</li>');
                        if (emp.empid == self.eid) {
                            $li.addClass("selected");
                        }
                        $li.data("emp", emp);
                        $ul.append($li);
                    }
                    self.$.find(".c-empsSelect-inner .scrollInner .empList").append($index).append($ul);
                }

            } else {
                amGloble.msg("数据加载失败,点击重试!");
            }
        });
    },
    getOnePage: function () {
        var self = this;
        var user = amGloble.metadata.userInfo;
        var shop = amGloble.storeSelect.getCurrentShops();
        var $sort = this.$sortbar.find(".selected");
        var sort = $sort.data("sort");
        var isReverse = $sort.find("span.sort").hasClass("up") ? 0 : 1;
        if (shop) {
            //单个门店
            if (shop.mgjversion != 3) {
                self.setStatus("normal");
                if (shop.mgjversion == 1) {
                    self.appendList("此门店是盛传版，不可使用客户管理");
                } else if (shop.mgjversion == 2) {
                    self.appendList("此门店是风尚版，不可使用客户管理");
                } else if (shop.mgjversion == 4) {
                    self.appendList("此门店是青春版，不可使用客户管理");
                }
                return false;
            }
            shop = [shop];
        } else {
            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };


        this.loading = true;
        amGloble.api.customerQuerCusts.exec({
            "type": this.$tab.find(".selected").data("type"),
            "empid": self.eid ? self.eid : user.userId,
            "shopIds": amGloble.getKeyArr(shop, "shopId", true, true).join(","),
            "userType": self.eid ? 1 : user.userType, // 1 管理员 0 员工
            "pageNumber": this.pageIndex,
            "pageSize": this.pageLength,
            "orderByType": sort,
            "isReverse": isReverse
        }, function (ret) {
            self.loading = false;
            self.setStatus("normal");
            if (ret.code == 0) {
                console.log(ret);
                var data = ret.content;
                console.log(!ret.content || (ret.content && ret.content.length < self.pageLength))
                self.pageIndex += 1;
                if (!ret.content || (ret.content && ret.content.length < self.pageLength)) {
                    self.scrollview.pauseTouchBottom = true;
                } else {
                    self.scrollview.pauseTouchBottom = false;
                }
                if (!self.cData) {
                    self.cData = data
                } else {
                    self.cData = self.cData.concat(data)
                }
                self.appendList(data);
                self.closeBottomLoading();
            } else {
                if (self.$ul.is(":empty")) {
                    self.setStatus("error");
                }
                amGloble.msg("数据加载失败,点击重试!");
            }

        });
    },
    createCustItem: function (item, sort) {
        var $li = this.$li.clone(true, true);
        $li.find(".header").html(amGloble.photoManager.createImage("customer", {
            parentShopId: amGloble.metadata.userInfo.parentShopId,
            updateTs: item.lastphotoupdatetime
        }, item.id + ".jpg", "s"));

        if (!amGloble.metadata.permissions.allowphone) {
            $li.find(".phone").parent().hide();
        } else {
            $li.find(".phone").html(item.mobile).parent().show();
        }

        $li.find(".name").html(item.name);
        $li.find(".store").html(amGloble.getStoresById(item.shopid).shopFullName);
        $li.find(".ename").html(item.empname ? item.empname : '无~');
        $li.find(".custlevel").html(item.className || "--");

        if (item.sex == "M") {
            $li.find(".gender").addClass("male");
            $li.find(".header").addClass("male");
        }
        if (!item.isHighQuality) {
            $li.find(".type1").hide();
        }
        if (!item.isLost) {
            $li.find(".type2").hide();
        }
        if (!item.isStatic) {
            $li.find(".type3").hide();
        }
        if (!item.isFavor) {
            $li.find(".type4").hide();
        }

        $li.find(".showValue").html(item.req || 0);

        sort = sort == null ? 1 : sort;
        switch (sort) {
            case 0:
                $li.find(".showName").html("来店时间 ");
                $li.find(".showValue").html((item.lastconsumetime && item.lastconsumetime > 631152000000) ? amGloble.time2str(item.lastconsumetime / 1000) : "--");
                break;
            case 1:
                $li.find(".showName").html("客单价");
                $li.find(".showValue").html((item.req ? amGloble.cashierRound(item.req, 1) : 0) + " <span class='gray'>元<span>");
                break;
            case 2:
                //无来电用1000000表示
                $li.find(".showName").html("来店频率");
                $li.find(".showValue").html(item.consumeFreq < 999999 ? Math.ceil(item.consumeFreq) + " <span class='gray'>天/次<span>" : "无");
                break;
            case 3:
                $li.find(".showName").html("消费总额");
                $li.find(".showValue").html(item.consumeTotal ? amGloble.cashierRound(item.consumeTotal, 1) : 0);
                break;
        }
        $li.find(".left_checkbox").data("id", item.id)
        $li.data("item", item);
        return $li;
    },
    appendList: function (data) {
        var self = this;
        var $ul = this.$ul;
        if (typeof data == "string") {
            $ul.append("<p>" + data + "</p>");
            return;
        }
        var sort = this.$sortbar.find(".selected").data("sort");
        if (data && data.length) {
            $.each(data, function (i, item) {
                $ul.append(self.createCustItem(item, sort));
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
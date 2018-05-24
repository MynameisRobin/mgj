(function () {
    var page ;
    
    page = amGloble.page.appointmentView = new $.am.Page({
        id: "page-appointmentView",
        init: function () {
            var self = this;
            this.$selectMenu = this.$.find(".am-header .right").vclick(function () {
                amGloble.storeSelect.show({
                    disableAllStore: 1
                });
            })
            this.$tab = this.$.find(".appointment-view_tab ul");
            this.$ul = this.$.find(".appointContainer").on("vclick", "li", function () { 
                var shop = amGloble.storeSelect.getCurrentShops();
                $.am.changePage(amGloble.page.reservation, "", {
                    shopId: shop.shopId,
                    eid: $(this).data("emp").barberId,
                    currentDate:timeBar.currentDate
                });
            });
            this.$li = this.$ul.find("li:first").remove();
            this.$.find(".am-page-error .button-common").vclick(function () {
                self.refreshPage();
            });
        },
        initappointment: function () {
            timeBar.init();
            this.inited = true;
        },
        beforeShow: function (paras) {
            var self = this;
            this.renderShopSelect();
            if (!this.inited) {
                this.initappointment();
            } else {
                timeBar.refresh();
            }
        },
        afterShow: function (paras) {

        },
        afterHide:function(){//预约bug
            amGloble.storeSelect.onShopChange = null;
        },
        refreshPage: function () {
            page.setStatus("loading");
            this.restList();
            this.getOnePage();
        },
        restList: function () {
            this.pageIndex = 0;
            this.pageLength = 10;
            this.$ul.empty();
        },
        renderShopSelect: function () {
            var self = this;
            amGloble.storeSelect.onShopChange = function (shop) {
                self.$.find(".am-header .right").text(shop.shopFullName)
                self.refreshPage();

            };
            var shop = amGloble.storeSelect.getCurrentShops();
            if (amGloble.metadata.userInfo.shopType == 0) {
                this.$selectMenu.removeClass("am-disabled");
            }
            if (shop) {
                shop = [shop];
            } else {
                //多门店
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
            };
            this.$.find(".am-header .right").text(shop[0].shopFullName)
        },
        getOnePage: function () {
            var self = this;
            var shop = amGloble.storeSelect.getCurrentShops();
            if (shop) {
                //单个门店
                if (shop.mgjversion==1) {
                    self.setStatus("normal");
                    self.append("此门店是盛传版，不可查看预约");
                    return false;
                }
                shop = [shop];
            } else {
                //多门店
                shop = amGloble.metadata.shops.filter(function (item) {
                    return item.mgjversion != 1;
                });
            };
            this.loading = true;
            amGloble.api.queryReservationByEmpAll.exec({
                "shopId": shop[0].shopId,
                "reserTime": timeBar.currentDate.format("yyyy-mm-dd"),
                "start": this.pageLength * this.pageIndex+1,
                "end": this.pageLength * this.pageIndex + this.pageLength
            }, function (ret) {
                self.loading = false;
                page.setStatus("normal");
                if (ret.code == 0) {
                    var data = ret.content;
                    self.pageIndex += 1;
                    if (!ret.content || (ret.content && ret.content.rvlist.length < self.pageLength)) {
                        self.scrollview.pauseTouchBottom = true;
                    } else {
                        self.scrollview.pauseTouchBottom = false;
                    }
                    self.append(data)
                    self.closeBottomLoading();
                } else {
                    if (self.$ul.is(":empty")) {
                        self.setStatus("error");
                    }
                    amGloble.msg("数据加载失败,点击重试!");
                }
            });

        },
        append: function (item) {
            var self = this;
            if (typeof item == "string") {
                this.$ul.empty();
                this.$ul.append("<p>" + item + "</p>");
                return;
            }
            var shop = amGloble.storeSelect.getCurrentShops();
            if (shop) {
                //单个门店
                shop = [shop];
            } else {
                //多门店
                shop = amGloble.metadata.shops.filter(function (item) {
                    return item.mgjversion != 1;
                });
            };
            $(this.$tab.find("li")[0]).find(".num").html(item.countOfDays[0])
            $(this.$tab.find("li")[1]).find(".num").html(item.countOfDays[1])
            $(this.$tab.find("li")[2]).find(".num").html(item.countOfDays[2])
            item.rvlist.forEach(function (val) {
                var $li = self.$li.clone(true, true);
                $li.find(".img_box").html(amGloble.photoManager.createImage("artisan", {
                    parentShopId: amGloble.metadata.userInfo.parentShopId,
                    updateTs: val.lastphotoupdatetime
                }, val.barberId + ".jpg", "s"));
                $li.find(".name").html(val.barberName);
                $li.find(".dot").html(val.count);
                if(val.count==0){
                    $li.find(".dot").hide()
                }else{
                    $li.find(".dot").show();
                }
                $li.data("emp", val);
                self.$ul.append($li)
            });

            if (this.$ul.is(":empty")) {
                this.setStatus("empty");
            }
            self.refresh();
        },
        touchBottom: function () {
            this.getOnePage();
        },
        amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."]
    });
    var timeBar;
    timeBar = amGloble.page.appointmentView.timeBar = {
        init: function () {
            var self = this;
            //类型bar

            var $tabc = page.$.find(".appointment-view_tab");
            this.$tab = $tabc.find("ul").on("vclick", "li", function () {
                var $this = $(this);
                var idx = $this.index();
                $(this).addClass("selected").siblings().removeClass("selected");
                if (idx == 0) {
                    self.today();
                } else if (idx == 1) {
                    self.tomorrow();
                } else if (idx == 2) {
                    self.aftertomorrow();
                } else if (idx == 3) {
                    setTimeout(function () {
                        self.$currentDate.mobiscroll('setVal', new Date(self.$currentDate.text()));
                        self.$currentDate.mobiscroll('show');
                    }, 50);
                }
            });

            this.$currentDate = this.$tab.find("#appoint_timePicker_custom .text");
            //chali 最大可选择日期
            var maxDate = new Date(amGloble.now().setDate(amGloble.now().getDate() + (amGloble.metadata.configs.mgjReservationDays?amGloble.metadata.configs.mgjReservationDays*1:30)));
            this.$currentDate.mobiscroll().date({
                dateFormat: "yyyy-mm-dd",
                display: 'bottom',
                animate: 'slideup',
                lang: "zh",
                max:maxDate,
                mode: "scroller",
                onSet: function (valueText, inst) {
                    self.gotoDate(valueText.valueText);
                }
            });

            timeBar.today();

        },
        gotoDate: function (date, disableTip, disableScroll) {
            this.currentDate = parseDate(date);
            this.renderDate(disableTip, disableScroll);
        },
        prevDay: function () {
            var cd = this.currentDate;
            cd.setDate(cd.getDate() - 1);
            this.renderDate();
        },
        nextDay: function () {
            var cd = this.currentDate;
            cd.setDate(cd.getDate() + 1);
            this.renderDate();
        },
        today: function () {
            this.currentDate = amGloble.now();
            this.renderDate();
        },
        tomorrow: function () {
            var cd = this.currentDate = amGloble.now();
            cd.setDate(cd.getDate() + 1);
            this.renderDate();
        },
        aftertomorrow: function () {
            var cd = this.currentDate = amGloble.now();
            cd.setDate(cd.getDate() + 2);
            this.renderDate();
        },
        renderDate: function (disableTip, disableScroll) {
            // console.log("是哪一天，",this.currentDate.format("yyyy-mm-dd"))
            this.$currentDate.html(this.currentDate.format("yyyy-mm-dd"));
            this.refresh(disableTip, disableScroll);
        },
        refresh: function (disableTip, disableScroll) {
            page.refreshPage();
        },
        isToday: function () {
            return this.currentDate.format("yyyy-mm-dd") == amGloble.now().format("yyyy-mm-dd");
        },
        thatday: function () {
            var thatday = parseDate(this.currentDate.format("yyyy-mm-dd")).getTime();
            var today = parseDate(amGloble.now().format("yyyy-mm-dd")).getTime();

            if (thatday < today) {
                return -1;
            } else if (thatday == today) {
                return 0;
            } else if (thatday > today) {
                return 1;
            }

        },
    };


})();
amGloble.page.craftsmanWheel = new $.am.Page({
    id: "page-craftsmanWheel",
    init: function () {
        var self = this;
        var $right_list = this.$.find(".wheel-right_list");
        var $inner = this.$.find(".wheel-right_list_inner");
        this.sv_wheel = new $.am.ScrollView({
            $wrap: $right_list,
            $inner: $inner,
            direction: [0, 1]
        });
        this.$selectMenu = this.$.find(".am-header .right").vclick(function () {
            amGloble.storeSelect.show({
                disableAllStore: 1
            });
        })
        // this.timeouts = [];
        this.$leftMenu = this.$.find(".wheel-left_list").on("vclick", "li", function (i) {
            // self.timeouts.forEach(function (item) {
            //     clearTimeout(item)
            // });
            // self.timeouts = [];
            self.sv_wheel._stopAnimation();
            self.$.find(".wheel-left_list li").removeClass("checked");
            $(this).addClass("checked");
            self.chooseIndex = $(this).data("index");
            var totlePos = 0;
            for (var i = 0; i < self.chooseIndex; i++) {
                totlePos += self.heightArr[i];
            }
            self.sv_wheel.scrollTo([0, -totlePos])

        });
        this.sv_wheel._onupdate = function (pos, flag) {
            this.$inner.setTransformPos(pos, "xy", this.hasInput);
            if (!flag) {
                self.calMenuIndex();
                setTimeout(function () {
                    self.calMenuIndex();
                }, 1000);
            }
        }
        this.$weelBox = this.$.find(".wheel_item_box");
        this.$lli = this.$leftMenu.find(":first").remove();
        this.$weelItem = this.$.find(".wheel_item_box :first");
        this.$weelItemLi = this.$weelItem.find("ul li").remove();
        this.$weelItem.remove();
        this.$no_permissions=this.$.find(".no-permissions_box").hide();
        // this.sv_wheel.$wrap.on("vtouchstart", function (e, p) {
        //     self.calMenuIndex();
        // });
        // this.sv_wheel.$wrap.on("vtouchmove", function (e, p) {
        //     self.calMenuIndex();
        // });
        // this.sv_wheel.$wrap.on("vtouchend", function (e, p) {
        //     self.calMenuIndex();
        //     self.timeouts=[];
        //     for (var i = 0; i < 10; i++) {
        //         self.timeouts.push(setTimeout(function () {
        //             self.calMenuIndex();
        //         }, 200 * i));
        //     }
        // });
    },
    beforeShow: function (paras) {
        var self = this;
        this.renderShopSelect();
        this.setStatus("loading");
        this.restList();
        this.getEmsList(this.getOnePage);
    },
    afterShow: function (paras) {
        this.sv_wheel.refresh();
        this.getWheelBoxHeight();
    },
    beforeHide: function () {
        clearInterval(this.interval)
    },
    renderShopSelect: function () {
        var self = this;
        amGloble.storeSelect.onShopChange = function (shop) {
            self.$.find(".am-header .right").text(shop.shopFullName);
            self.refreshPage();
        };
        var shop = amGloble.storeSelect.getCurrentShops();
        if (amGloble.metadata.userInfo.shopType == 0) {
            this.$selectMenu.removeClass("am-disabled");
        }
        if (shop) {
            //单个门店
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
    calMenuIndex: function () {

        var self = this;
        var ePos = Math.abs(self.sv_wheel._currentPos[1]);
        var min = Math.abs(self.sv_wheel._min[1]);
        var totlePos = 0;
        var eIndex = -1;
        if (ePos == 0) {
            eIndex = 0;
        } else if (ePos >= min && self.sv_wheel._currentPos[1] < 0) {
            eIndex = self.heightArr.length - 1;
        } else {
            for (var i = 0; i < self.heightArr.length; i++) {
                totlePos += self.heightArr[i];
                if (totlePos >= ePos && eIndex == -1) {
                    eIndex = i;
                    eIndex = eIndex > self.heightArr.length ? self.heightArr.length : eIndex;
                }
            }
        }
        if (eIndex != -1) {
            this.$leftMenu.find("li").removeClass("checked")
            $(this.$leftMenu.find("li")[eIndex]).addClass("checked")
        }
    },
    getWheelBoxHeight: function () {
        this.heightArr = [];
        var wheelBoxs = this.$.find(".wheel_item_box .wheel_item");
        for (var i = 0; i < wheelBoxs.length; i++) {
            this.heightArr.push(wheelBoxs[i].clientHeight)
        }
    },
    restList: function () {
        var self = this;
        this.$leftMenu.empty();
        this.$weelBox.empty();
        self.sv_wheel.scrollTo("top")
        this.$no_permissions.hide();
        clearInterval(this.interval)
        this.interval = setInterval(function () {
            var ndate = (new Date()).getTime();
            var pTimes = self.$weelBox.find(".wheel_item .time")
            for (var i = 0; i < pTimes.length; i++) {
                var item = pTimes[i];
                var status=$(item).data("status");
                if(status==0){
                    continue;
                }
                var newTime = self.calTime(parseInt($(item).data("stime")), ndate);
                if (newTime == '00:00:00') {
                    setTimeout(function () {
                        self.refreshPage();
                    }, 1000);

                }
                $(item).html(newTime)
            }
        }, 1000)
    },
    refreshPage: function () {
        this.setStatus("loading");
        this.restList();
        this.getEmsList(this.getOnePage);
    },
    getOnePage: function (self) {
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            if (shop.mgjversion != 3) {
                self.setStatus("normal");
                if(shop.mgjversion==1){
                    self.$no_permissions.html("此门店是盛传版，不可使用轮牌");
                }else if(shop.mgjversion==2){
                    self.$no_permissions.html("此门店是风尚版，不可使用轮牌");
                }else if(shop.mgjversion==4){
                    self.$no_permissions.html("此门店是青春版，不可使用轮牌");
                }
                self.$no_permissions.show();
                return false;
            }
            
            //单个门店
            shop = [shop];
        } else {
            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };
        amGloble.api.rotateList.exec({
            "shopId": shop[0].shopId
        }, function (ret) {
            self.setStatus("normal");
            if (ret.code == 0) {
                self.dealData(ret.content)
            } else {
                amGloble.msg("数据加载失败,点击重试!");
            }

        });
    },
    getEmsList: function (call) {
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
            } else {
                amGloble.msg("数据加载失败,点击重试!");
            }
            call(self);
        });
    },
    calTime: function (t1, t2) {
        var total = Math.abs(t1 - t2) / 1000;
        var hour = parseInt(total / (60 * 60)); //计算整数小时数
        var afterHour = total - hour * 60 * 60; //取得算出小时数后剩余的秒数
        var min = parseInt(afterHour / 60); //计算整数分
        var afterMin = parseInt(total - hour * 60 * 60 - min * 60); //取得算出分后剩余的秒数
        return (hour >= 10 ? hour : '0' + hour) + ":" + (min >= 10 ? min : '0' + min) + ":" + (afterMin >= 10 ? afterMin : '0' + afterMin)
    },
    dealData: function (item) {
        var self = this;
        var shop = amGloble.storeSelect.getCurrentShops();
        if (shop) {
            // if (shop.mgjversion != 3) {
            //     self.setStatus("normal");
            //     if(shop.mgjversion==1){
            //         self.appendList("此门店是盛传版，不可使用客户管理");
            //     }else if(shop.mgjversion==2){
            //         self.appendList("此门店是风尚版，不可使用客户管理");
            //     }else if(shop.mgjversion==4){
            //         self.appendList("此门店是青春版，不可使用客户管理");
            //     }
            //     return false;
            // }
            //单个门店
            shop = [shop];
        } else {
            //多门店
            shop = amGloble.metadata.shops.filter(function (item) {
                return item.mgjversion == 3;
            });
        };
        if (item && item.length > 0) {
            var i = 0;
            item.forEach(function (ele) {
                if (ele.users.length > 0) {
                    var $li = self.$lli.clone(true, true);
                    $li.html(ele.name);
                    if (i != 0) {
                        $li.removeClass("checked")
                    } else {
                        $li.addClass("checked")
                    }
                    $li.data("index", i);
                    self.$leftMenu.append($li);
                    var $weelItem = self.$weelItem.clone(true, true);
                    $weelItem.find("header").html(ele.name);
                    ele.users.forEach(function (val) {
                        var $weelItemLi = self.$weelItemLi.clone(true, true);
                        var cemp;
                        self.emps.forEach(function (emp) {
                            if (emp.empid == val.empId) {
                                cemp = emp;
                                return;
                            }
                        });
                        if (!cemp) {
                            return;
                        }
                        var $p = $("<p></p>");
                        var $a = $("<a></a>");
                        var $img_box = $("<div></div>").addClass("img_box");
                        if(ele.status==0){
                            $weelItemLi.addClass("green");
                            $a.html("&nbsp;")
                            $weelItemLi.find('.time').html("&nbsp;")
                            $weelItemLi.find('.time').data("status", ele.status)
                        }else{
                            if (val.status == 4) {
                                $weelItemLi.addClass("yellow");
                                $a.html("临休")
                            } else if (val.status == 1) {
                                $weelItemLi.addClass("green");
                                $a.html("待客")
                            } else if (val.status == 3) {
                                $weelItemLi.addClass("gray");
                                $a.html("点客")
                            } else if (val.status == 2) {
                                $weelItemLi.addClass("red");
                                $a.html("轮牌")
                            }
                            if (val.status == 4) {
                                $weelItemLi.find('.time').data("stime", val.restTime)
                            }else{
                                $weelItemLi.find('.time').data("stime", val.statusTime)
                            } 
                            $weelItemLi.find('.time').html(self.calTime(parseInt(val.statusTime), (new Date()).getTime()))
                            $weelItemLi.find('.time').data("status", ele.status)
                        }      
                        $img_box.html(amGloble.photoManager.createImage("artisan", {
                            parentShopId: amGloble.metadata.userInfo.parentShopId
                        }, cemp.empid + ".jpg", "s"));
                        $p.append($img_box)
                        $p.append($a)
                        $weelItemLi.append($p);
                        if (cemp.empname) {
                            $weelItemLi.find(".name").html(cemp.empname);
                        } else {
                            $weelItemLi.find(".name").html("---");
                        }
                        if (cemp.empno) {
                            $weelItemLi.find(".num").html(cemp.empno);
                        } else {
                            $weelItemLi.find(".num").html("---");
                        }                 
                        $weelItem.find("ul").append($weelItemLi);
                    });
                    if (!$weelItem.is(":empty")) {
                        self.$weelBox.append($weelItem)
                        i++;
                    }

                }
            });
            if (this.$leftMenu.is(":empty")) {
                this.setStatus("empty");
            }
            this.sv_wheel.refresh();
            this.refresh();
            this.getWheelBoxHeight();
        } else {
            this.setStatus("empty");
        }
    }
});
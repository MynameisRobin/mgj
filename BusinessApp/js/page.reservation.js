(function() {

    var page = amGloble.page.reservation = new $.am.Page({
        id: "page-reservation",
        init: function() {
            //chali 初始化
            page.$showItemConfirm = page.$.find(".showItemConfirm");
            page.$itemClone = page.$showItemConfirm.find(".content .reservationItems .item").clone();
            page.$showItemConfirm.vclick(function(){
                page.$showItemConfirm.hide();
            });
        },
        initReservation: function() {
            timeBar.init();
            table.init();
            table.createFrame();
            this.inited = true;
        },
        beforeShow: function(paras) {
            this.paras = paras;
            console.log(paras,"看看顾客列表返回了啥")
            if (!this.inited) {
                this.initReservation();
            } else {
                if(paras != 'back'){
                    timeBar.refresh();
                }
            }
            this.setStatus("loading");
            timeBar.currentDate = paras && paras.currentDate?paras.currentDate:amGloble.now();
           
            timeBar.gotoDate(timeBar.currentDate);
            var tm = timeBar.currentDate.getDate() - amGloble.now().getDate();
            var lis = page.$.find(".reservation_tab ul li");
            if(tm == 0 ){
                $(lis[0]).addClass("selected").siblings().removeClass("selected");
            }else if(tm == 1 ){
                $(lis[1]).addClass("selected").siblings().removeClass("selected");
            }else if(tm == 2 ) {
                $(lis[2]).addClass("selected").siblings().removeClass("selected");
            }else{
                $(lis[3]).addClass("selected").siblings().removeClass("selected");
            }
        },
        afterShow: function(paras) {
            if (paras == "back") {
                return;
            }
            this.setStatus("normal");
            setTimeout(function() {
                table.scroll();
            }, 300);
        }
    });

    var timeBar = amGloble.page.reservation.timeBar = {
        init: function() {
            var self = this;
            //类型bar

            var $tabc = page.$.find(".reservation_tab");
            this.$tab = $tabc.find("ul").on("vclick", "li", function() {
                var $this = $(this);
                var idx = $this.index();

                if (table.loading) {
                    return;
                }
                $(this).addClass("selected").siblings().removeClass("selected");

                if (idx == 0) {
                    self.today();
                } else if (idx == 1) {
                    self.tomorrow();
                } else if (idx == 2) {
                    self.aftertomorrow();
                } else if (idx == 3) {
                    setTimeout(function() {
                        self.$currentDate.mobiscroll('setVal', new Date(self.$currentDate.text()));
                        self.$currentDate.mobiscroll('show');
                    }, 50);
                }
            });
            //chali
            this.$currentDate = this.$tab.find("#timePicker_custom .text");
            //chali 最大可选择日期
            var maxDate = new Date(amGloble.now().setDate(amGloble.now().getDate() + (amGloble.metadata.configs.mgjReservationDays?amGloble.metadata.configs.mgjReservationDays*1:30)));
            this.$currentDate.mobiscroll().date({
                dateFormat: "yyyy-mm-dd",
                display: 'bottom',
                animate: 'slideup',
                lang: "zh",
                mode: "scroller",
                max: maxDate,
                onSet: function(valueText, inst) {
                    self.gotoDate(valueText.valueText);
                }
            });
            timeBar.today();

        },
        gotoDate: function(date, disableTip, disableScroll) {
            this.currentDate = parseDate(date);
            this.renderDate(disableTip, disableScroll);
        },
        prevDay: function() {
            var cd = this.currentDate;
            cd.setDate(cd.getDate() - 1);
            this.renderDate();
        },
        nextDay: function() {
            var cd = this.currentDate;
            cd.setDate(cd.getDate() + 1);
            this.renderDate();
        },
        today: function() {
            this.currentDate = amGloble.now();
            this.renderDate();
        },
        tomorrow: function() {
            var cd = this.currentDate = amGloble.now();
            cd.setDate(cd.getDate() + 1);
            this.renderDate();
        },
        aftertomorrow: function() {
            var cd = this.currentDate = amGloble.now();
            cd.setDate(cd.getDate() + 2);
            this.renderDate();
        },
        renderDate: function(disableTip, disableScroll) {
            this.$currentDate.html(this.currentDate.format("yyyy-mm-dd"));
            this.refresh(disableTip, disableScroll);
        },
        refresh: function(disableTip, disableScroll) {
            table.getData(this.currentDate.getTime(), disableTip, disableScroll);
        },
        isToday: function() {
            return this.currentDate.format("yyyy-mm-dd") == amGloble.now().format("yyyy-mm-dd");
        },
        thatday: function() {
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

    var table = window.mainTable = {
        init: function() {
            var self = this;
            var configs = amGloble.metadata.configs;

            var sts = (configs.reservationFrom || "9:00").split(":");
            var ets = (configs.reservationTo || "22:00").split(":");

            this.startTs = parseDate(amGloble.now().format("yyyy-mm-dd ") + (configs.reservationFrom || "9:00") + ":00");
            this.endTs = parseDate(amGloble.now().format("yyyy-mm-dd ") + (configs.reservationTo || "22:00") + ":00");

            //TODO
            this.startHour = sts[0] * 1;
            if (ets[1] * 1 > 0) {
                this.endHour = ets[0] * 1;
            } else {
                this.endHour = ets[0] * 1 - 1;
            }
            page.$showItemConfirmScroll = new $.am.ScrollView({
                $wrap: page.$.find(".showItemConfirm > .content .contentItems"),
                $inner: page.$.find(".showItemConfirm > .content > .contentItems .reservationItems"),
                direction: [false, true],
                hasInput: false
            });


            //  chali点击查看预约的项目
            this.$tbody = page.$.find("#panel_table").children("tbody").on("vclick", ".reservation .showItem", function() {
                var item = $(this).parent().parent().data("item");
                item.itemProp = JSON.parse(item.itemProp);
                if(!item.itemProp || !item.itemProp.items){
                    return false;
                }
                var itemList = item.itemProp.items;
                var packages = item.itemProp.packages;
                if(item.itemProp.packages){
                    for (var key in packages) {
                        if (packages.hasOwnProperty(key)) {
                            // if(key != "name" || packages[key]){
                            //     item[key] = packages[key];
                            // }
                            packages[key].name = packages[key].serviceItemName;
                            itemList[key] = packages[key];
                        }
                    }
                }
                page.$showItemConfirm.find(".content .reservationItems").empty();
                $.each(item.itemProp.packages?$.extend(item.itemProp.items, item.itemProp.packages):item.itemProp.items, function(i, it) {
                    var itClone = page.$itemClone.clone();
                    var items = page.$showItemConfirm.find(".content .reservationItems");
                    itClone.find(".text").text(it.name);
                    items.append(itClone);
                });
                page.$showItemConfirm.show();
                // console.log(page.$showItemConfirmScroll,"dayinsha")
                page.$showItemConfirmScroll.refresh();
                page.$showItemConfirmScroll.scrollTo("top");
                return false;
            }).on("vclick", ".reservation .headerImg", function() {//点击查看预约会员信息
                var item = $(this).parent().data("item");
                // var item = $(this).parent().parent().data("item");
                console.log("点击到了头像",page.barberId)
                var shop = amGloble.storeSelect.getCurrentShops();
                $.am.changePage(amGloble.page.customerDetail, "slideleft", {
                    custId: item.custId,
                    currentDate:timeBar.currentDate,
                    eid:page.barberId,
                    shopId: shop.shopId,
                    

                });
                return false;
            });

            this.$tr = this.$tbody.children("tr:first").remove();

            this.$nocontent = this.$tr.find(".nocontent").remove();
            this.$leave = this.$tr.find(".leave").remove();
            this.$placehold = this.$tr.find(".placehold").remove();
            //chali 预约占用
            this.$reservationPlaceHold = this.$tr.find(".reservationPlaceHold").remove();
            this.$reservation = this.$tr.find(".reservation").remove();

            this.$timeline = page.$.find(".timeline");

            //鼠标点击占位 休假和过去时间提示无法预约
            this.$tbody.on("vclick", ".createPlaceHolderBtn", function() {
                self.createHolder($(this).parent().parent().parent());
            });

            //鼠标点击创建 休假和过去时间提示无法预约
            this.$tbody.on("vclick", ".createReservationBtn", function() {
                if (amGloble.checkVersion()) {
                    return;
                }
                var $tr = $(this).parent().parent().parent();
                var timeData = $tr.data("data");
                var time = timeData.time;
                time = parseDate(timeBar.currentDate.format("yyyy-mm-dd") + time.format(" HH:MM:ss"));
                $.am.changePage(amGloble.page.reservationCreate,"slideup", {
                    reservationTime: time,
                    timeNum:timeData.timeNum,
                    trTimes:self.$trTimes,
                    user:page.paras && page.paras.user ?page.paras.user:'',
                });
            });
            //取消占位/预约
            this.$tbody.on("vclick", ".block .cancel", function() {
                var $this = $(this);
                var item = $this.parent().data("item");

                if (item.type == 0) {
                    atMobile.nativeUIWidget.confirm({
                        caption: "取消预约",
                        description: "确定取消这一单预约么？",
                        okCaption: "是",
                        cancelCaption: "否"
                    }, function() {
                        self.cancel(item);
                    }, function() {});
                } else {
                    self.cancel(item);
                }

                return false;

            });

            this.$tabnum = page.$.find(".reservation_tab .num");

        },

        createHolder: function($td) {
            var self = this;
            var time = $td.data("data").time;
            time = parseDate(timeBar.currentDate.format("yyyy-mm-dd") + time.format(" HH:MM:ss"));

            amGloble.loading.show("正在提交，请稍候...");
            amGloble.api.reservationAdd.exec({
                "shopId": amGloble.metadata.userInfo.shopId,
                "type": 1,
                "reservationTime": time.getTime(),
                "barberId": amGloble.metadata.userInfo.userId,
                "barberName": amGloble.metadata.userInfo.userName,
                "channel": 3, //0收银 1美一客web 2美一客app 3生意宝
                "custId": -1,
                "categoryId": -1,
                "number": 1,
                "reservationType": 1 //反预约
            }, function(ret) {
                amGloble.loading.hide();
                // console.log(ret);
                if (ret.code == 0) {
                    amGloble.msg("预约已经登记！");
                    timeBar.gotoDate(parseDate(time), true, true);
                } else {
                    amGloble.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        },

        //创建空的框架

        createFrame: function() {
            //TODO
            var self = this;
            var startHour = this.startHour;
            var endHour = this.endHour;
            var startTs = this.startTs.getTime();
            var endTs = this.endTs.getTime();

            var strategy = amGloble.metadata.configs.strategy;

            var $tbody = this.$tbody.empty();

            var blocks = (endTs - startTs) / 1800000;
            for (var i = 0; i < blocks; i++) {

                var $tr = this.$tr.clone(true, true);

                var time = parseDate(startTs + i * 1800000);
                var min = time.format("MM");
                if (strategy == "1" && min == "30") {
                    continue;

                } else if (min == "30") {
                    $tr.addClass("small").find(".time").html("<span>" + time.format("HH") + "</span>:" + min + "");
                } else {
                    $tr.find(".time").html("<span>" + time.format("HH") + "</span>:" + min + "");
                }

                // $tr.data("ts", time); chali
                $tr.data("data", {time:time,timeNum:null});
                $tbody.append($tr);
            }

        },

        //清空框架

        clearFrame: function() {
            var self = this;
            this.$tbody.find("td.content").each(function() {
                $(this).empty().append(self.$nocontent.clone(true, true));
            });

        },

        //render数据
        renderData: function(data) {
            this.clearFrame();
            var self = this;
            var $trs = this.$tbody.children("tr");
            
            //chali判断是否开启高级预约模式
            // var mgjReservationConfig = amGloble.metadata.configs.mgjReservationItem;
            var vacation = false;
            //判断是否休假
            if (data.vacations && data.vacations.length) {
                $.each(data.vacations, function(i, item) {
                    if (item.empId == amGloble.metadata.userInfo.userId || item.empId ==  page.barberId) {
                        vacation = true;
                        return false;
                    }
                });
            }

            //显示数字
            var total = 0;
            this.$tabnum.each(function(i) {
                var dayCount = data.countOfDays[i];
                total += dayCount;
                $(this).text(dayCount || 0);
            });
           
            // console.log("loop data", i);
            self.$trTimes = [];
            $trs.each(function(j, tr) {
                var trShow = false;
                var $this = $(tr);
                var timeData = $this.data("data");
                var ts = timeData.time;//chali
                var bool = true;
                var endTs = self.endTs.getTime();
                var strategy = amGloble.metadata.configs.strategy;
                timeData.timeNum = strategy == "1"?parseInt((endTs-ts)/1800000/2):parseInt((endTs-ts)/1800000);
                
                var $content = $this.find(".content");

                if (vacation) {
                    //休假
                    var $leave = self.$leave.clone(true, true);
                    $content.empty().append($leave);
                    // console.log("休假中，哈哈哈哈",)
                    trShow = true;
                } else {

                    // console.log("loop tr", ts);

                    $.each(data.reservations, function(i, item) {
                        //遍历所有预约

                        

                        var reservationTime = parseDate(item.reservationTime);

                        //查找对应行，美发师匹配&&并且是同一天
                        if (timeBar.currentDate.format("yyyy-mm-dd") != reservationTime.format("yyyy-mm-dd")) {
                            return true;
                        } else {
                            //TODO
                            var hour = ts.getHours();
                            var thour = reservationTime.getHours();
                            var minute = ts.getMinutes();
                            var tminute = reservationTime.getMinutes();
                            // console.log("loop td", k, hour, thour);

                            var dMin = tminute - minute;
                            //计算本日后面有预约或者占用的情况下，本时间段的最长可用时间段
                            if(ts <= reservationTime && bool){
                                if (strategy == "1"){
                                    timeData.timeNum = parseInt((reservationTime - ts)/1800000/2);
                                }else{
                                    timeData.timeNum = parseInt((reservationTime - ts)/1800000);
                                }
                                $this.data("data",timeData);
                                bool = false;
                            }
                            if (hour == thour && dMin < 30 && dMin >= 0 && item.status != 2) {
                                // console.log(hour, tminute, minute);
                                //添加一个预约模块
                                if (item.type) {
                                    var $holder = self.$placehold.clone(true, true);
                                    //前面预约引起的占用,不可取消
                                    if(item.reservId){
                                        $holder = self.$reservationPlaceHold.clone(true, true);
                                    }
                                    // //占用
                                    $holder.data("item", item);
                                    if(amGloble.metadata.userInfo.newRole < 4){
                                        $holder.find(".cancel").remove();
                                    }
                                    

                                    $content.empty().append($holder);
                                } else{
                                    // console.log("添加一个正常预约模块", item);
                                    //正常预约
                                    
                                    var $rvitem = self.$reservation.clone(true, true);
                                    $rvitem.find(".header").html(amGloble.photoManager.createImage("customer", {
                                        parentShopId: amGloble.metadata.userInfo.parentShopId
                                    }, item.custId + ".jpg", "s"));

                                    if (item.gender == "M") {
                                        $rvitem.find(".header").addClass("male");
                                    }

                                    if ($.trim(item.comment)) {
                                        $rvitem.find(".comment").html(item.comment);
                                    } else {
                                        $rvitem.find(".comment").hide();
                                    }
                                    $rvitem.find(".cati").html(item.categoryName);
                                    // console.log(amGloble.metadata.configs.mgjReservationItem,"amGloble.metadata.configs.mgjReservationItem",item.itemProp?1:0)
                                    //查理是否显示项目详情 chali
                                    if(item.itemProp){
                                        $rvitem.find(".cati").hide();
                                    }else{
                                        $rvitem.find(".showItem").hide();
                                    }
                                    
                                    if(item.number == 4){
                                        $rvitem.find(".num").html("多人");
                                    } else if (item.number > 1 ) {
                                        $rvitem.find(".num").html(item.number + "位");
                                    }else{
                                        $rvitem.find(".num").hide();
                                    }

                                    $rvitem.find(".name").html(item.custName);

                                    if (item.status == 1) {
                                        //已到店
                                        $rvitem.addClass("green");
                                        $rvitem.find(".cancel").hide();
                                    } else {
                                        if (amGloble.now().getTime() > item.reservationTime) {
                                            //已逾期
                                            $rvitem.addClass("red");
                                        } else {
                                            //预约中
                                        }
                                    }
                                    if(amGloble.metadata.userInfo.newRole < 4){
                                        $rvitem.find(".cancel").remove()
                                    }
                                    $rvitem.data("item", item);
                                    $content.empty().append($rvitem);
                                }
                                trShow = true;
                                return false;
                            }
                        }

                    });
                    if(ts > amGloble.now() && timeData.timeNum){
                        timeData.name = timeData.time.format("yyyy-mm-dd HH:MM");
                        self.$trTimes.push(timeData);
                    }
                }
                //chali tr没有预约跟占用, 登陆角色不是4 手艺人,或者员工不允许预约 清空tr
                if(!trShow && amGloble.metadata.userInfo.newRole < 4 ||(amGloble.metadata.userInfo.newRole >= 4 && amGloble.metadata.userInfo.mgjshowmyk == '0')){
                    $content.empty()
                }
            });

            //时间线
            this.renderTimeline();

        },

        renderTimeline: function() {
            var self = this;
            var strategy = amGloble.metadata.configs.strategy;
            var now = amGloble.now();

            var nowTs = now.getTime();

            var startTs = this.startTs.getTime();
            var endTs = this.endTs.getTime();

            if (timeBar.isToday() && nowTs >= startTs && nowTs <= endTs) {
                if (strategy == "1") {
                    if (this.endTs.format("MM") == "30") {
                        endTs += 1800000;
                    }
                } else {}
                var percent = (nowTs - startTs) / (endTs - startTs);
                // console.log(startTs, nowTs, endTs, (endTs - startTs), (nowTs - startTs), percent);
                this.$timeline.show().css("top", percent * 100 + "%");

                clearTimeout(this.timer);
                this.timer = setTimeout(function() {
                    self.renderTimeline();
                }, 3000);

            } else {
                this.$timeline.hide();
            }

            //

            var $trs = this.$tbody.find("tr").removeClass("passed");

            var thatday = timeBar.thatday();

            if (thatday < 0) {
                $trs.addClass("passed");

            } else if (thatday == 0) {

                $trs.each(function() {
                    //TODO
                    var $this = $(this);
                    var ts = $this.data("data").time.getTime();
                    // console.log(thour, hour);
                    if (nowTs > ts) {
                        $this.addClass("passed");
                        // var tmData = $this.data("data")
                        // tmData.timeNum = 0;
                        // $this.data("data",tmData)
                    }

                });

            } else if (thatday > 0) {}

        },

        getData: function(ts, disableTip, disableScroll) {
            var self = this;

            if (!disableTip) {
                page.setStatus("loading");
            }
            this.loading = true;
            page.barberId = page.paras&&page.paras.eid?page.paras.eid:amGloble.metadata.userInfo.userId;
            amGloble.api.reservationList.exec({
                // parentShopId:amGloble.metadata.userInfo.realParentShopId,
                "shopId":page.paras&&page.paras.shopId?page.paras.shopId:amGloble.metadata.userInfo.shopId,
                "reservationTime": ts,
                "barberId": page.barberId
            }, function(ret) {
                self.loading = false;
                if (!disableTip) {
                    page.setStatus("normal");
                }
                if (ret.code == 0) {
                    console.log(ret.content);
                    self.data = ret.content;
                    self.renderData(self.data);
                    if (!disableScroll) {
                        // self.scroll("current");
                    }
                    console.log(ret);
                } else {
                    amGloble.msg("数据加载失败,点击重试!");
                }
            });
        },
        cancel: function(item) {
            var self = this;
            amGloble.loading.show("正在提交，请稍候...");
            amGloble.api.reservationCancel.exec({
                "storeId": amGloble.metadata.userInfo.shopId,
                "id": item.id,
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    item.status = 2;
                    table.getData(timeBar.currentDate.getTime());
                    amGloble.msg("已成功取消！");
                } else {
                    amGloble.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        },
        scroll: function(direction) {
            var scrollview = page.scrollview;
            var $timeline = this.$timeline;

            if ($timeline.is(":visible")) {
                var top = $timeline.position().top;
                scrollview.scrollTo([0, -top + 30]);
            }

        }
    };

})();

(function () {


    var self = am.page.reservation = new $.am.Page({
        id: "page_reservation",
        disableScroll: 1,
        init: function () {
            this.$.find('.appointment-btn').vclick(function () {
                $.am.changePage(am.page.appointment, 'slideup');
            });

        },
        beforeShow: function (paras) {


            am.tab.main.show();
            am.tab.main.select(0);

            if (paras && paras.openbill == 1) {
                this.$.addClass("am-full");
            } else {
                this.$.removeClass("am-full");
            }
            this.paras = paras;

            if (!this.initialized) {
                timeBar.init(this.$);
                reservationDetail.init();
                reservation.init(this.$);
                // reservation.createFrame();
                this.initialized = 1;
            }
            reservation.createFrame();
            timeBar.startPolling();


        },
        afterShow: function (paras) {

            // reservation.scroll("current");
        },
        beforeHide: function () {
            timeBar.stopPolling();
        },
        refreshData: function (disableTip, disableScroll) {
            timeBar.refresh(disableTip, disableScroll)
        }
    }); 

    var timeBar = {
        init: function ($dom) {
            var self = this;
            this.$ = $dom.children(".rv_btns");
            this.$date = this.$.children(".date");
            var maxDate = amGloble.now();
	       
            this.$date.mobiscroll().calendar({
                theme: 'mobiscroll',
                lang: 'zh',
                display: 'bottom',
                months: "auto",
                setOnDayTap: true,
                // max:maxDate,
                buttons: [],

                onSet: function (valueText, inst) {
                    console.log(valueText)
                    self.gotoDate(new Date(valueText.valueText));
                    // self.renderDate();
                }
            });
            this.$prev = this.$.children(".left").vclick(function () {
                self.prevDay();
            });
            this.$next = this.$.children(".right").vclick(function () {
                self.nextDay();
            });
        },
        gotoDate: function (date, disableTip, disableScroll) {
            if (date) {
                this.currentDate = date;
                this.renderDate(disableTip, disableScroll);
            }
        },
        prevDay: function () {
            console.log(this.currentDate)
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
            this.currentDate = am.now();
            this.renderDate();
        },
        tomorrow: function () {
            var cd = this.currentDate = am.now();
            cd.setDate(cd.getDate() + 1);
            this.renderDate();
        },
        aftertomorrow: function () {
            var cd = this.currentDate = am.now();
            cd.setDate(cd.getDate() + 2);
            this.renderDate();
        },
        renderDate: function (disableTip, disableScroll) {
            this.$date.text(this.currentDate.format("yyyy-mm-dd"));
            this.refresh(disableTip, disableScroll);
        },
        refresh: function (disableTip, disableScroll) {
            reservation.getData(this.currentDate.getTime(), disableTip, disableScroll);
        },
        isToday: function () {
            return this.currentDate.format("yyyy/mm/dd") == am.now().format("yyyy/mm/dd");
        },
        thatday: function () {
            var thatday = new Date(this.currentDate.format("yyyy/mm/dd")).getTime();
            var today = new Date(am.now().format("yyyy/mm/dd")).getTime();

            if (thatday < today) {
                return -1;
            } else if (thatday == today) {
                return 0;
            } else if (thatday > today) {
                return 1;
            }

        },
        startPolling: function () {
            var self = this;
            self.today();
            this.timer = setInterval(function () {
                self.today();
            }, 300000);
        },
        stopPolling: function () {
            clearInterval(this.timer);
        }
    };

    var reservation = {
        init: function ($root) {
            this.$ = $root;

            var self = this;
            var configs = am.metadata.configs;
            console.log(configs)
            var sts = (configs.reservationFrom || "9:00").split(":");
            var ets = (configs.reservationTo || "22:00").split(":");

            this.startTs = new Date(am.now().format("yyyy/mm/dd ") + (configs.reservationFrom || "9:00") + ":00");
            this.endTs = new Date(am.now().format("yyyy/mm/dd ") + (configs.reservationTo || "22:00") + ":00");

            //TODO
            this.startHour = sts[0] * 1;
            if (ets[1] * 1 > 0) {
                this.endHour = ets[0] * 1;
            } else {
                this.endHour = ets[0] * 1 - 1;
            }

            console.log(this.startHour, this.endHour);

            this.$scroll = this.$.find(".rv_scroll");
            this.$tb = this.$.find("#page-mainTable");
            this.$tbx = this.$.find("#page-tableHeaderX");
            this.$tby = this.$.find("#page-tableHeaderY");
            this.$theader = this.$tb.children("thead");
            this.$theaderx = this.$tbx.children("thead");
            this.$tbody = this.$tb.children("tbody");
            this.$tbodyy = this.$tby.children("tbody");

            this.$tr = this.$tbody.children("tr:first").remove();

            this.$tuser = this.$tr.find("td.user").remove();
            this.$td = this.$tr.find("td:first").remove();

            // this.$createIcon = this.$td.find(".rv_creat").remove();
            this.$holder = this.$td.find(".rv_holder").remove();
            this.$rest = this.$td.find(".rv_rest").remove();
            this.$rvshow = this.$td.find(".rv_show").remove();

            this.$rvitem = this.$rvshow.find(".rv_item").remove();


            this.$tb.on("vclick", ".rv_item", function () {
                var $this = $(this);
                var item = $this.data("item");
                if(am.page.reservation.paras && am.page.reservation.paras.openbill==1){
                    reservationDetail.data = item;
                    if (item.status != 1) {
                        reservationDetail.goToCash(item,1);
                    }else{
                        reservationDetail.goToCash(item);
                    }
                    // reservationDetail.goToCash(item);
                }else{
                    reservationDetail.open(item);
                }
                
                return false;

            }).on("vclick", ".rv_holder", function () {

                var $this = $(this);
                am.confirm("取消占用", "取消占用？", "确定", "取消", function () {
                    // self.createHolder($this);
                    reservationDetail.cancel($this.data('item'));
                }, function () {});
                return false;
            }).on("vclick", "td", function () {
                var $this = $(this);
                if ($this.find('.rv_item').length) {
                    return false;
                }
                if ($this.hasClass("passed") || $this.parent().hasClass("rest")) {
                    return false;
                }
                am.confirm("占用", "占用后客户将不可预约此时间段，确定要这样做吗？", "确定", "取消", function () {
                    self.createHolder($this);
                }, function () {});
            }).on('vclick', '.toggleItem', function () {
                var itemLength = $(this).parent().find('.rv_item').length;
                var activeindex = $(this).attr('data-activeindex'),
                    number = $(this).attr('data-number');
                activeindex++;
                if (activeindex > number - 1) {
                    activeindex = 0;
                }
                $(this).attr('data-activeindex', activeindex);
                $(this).find('span:first-child').html(activeindex + 1);
                $(this).parent().find('.rv_item').eq(itemLength - 1).insertBefore($(this).parent().find('.rv_item').eq(0));
            });

            this.$timeline = $(".rv_timeline");

            this.sc_table = new $.am.ScrollView({
                $wrap: this.$scroll,
                $inner: this.$scroll.children(),
                direction: [1, 1]
            });

            this.sc_table._onupdate = function (pos) {
                //主区域
                var x = pos[0];
                var y = pos[1];
                this.$inner.setTransformPos(pos, "xy", this.hasInput);
                var x1 = x > 0 ? x : 0;
                var y1 = y > 0 ? y : 0;
                self.$tbx.setTransformPos([x, y1], "xy", this.hasInput);
                self.$tby.setTransformPos([x1, y], "xy", this.hasInput);

                //pos[0]
            };

            this.$.find("#reservationBack").vclick(function () {
                page.show("enterCode");
            });

        },

        //创建空的框架
        createFrame: function () {
            this.clearFrame();
            // $.am.debug.log("createFrame:");
            //TODO
            var self = this;
            var startHour = this.startHour;
            var endHour = this.endHour;
            var startTs = this.startTs.getTime();
            var endTs = this.endTs.getTime();
            var employees = am.metadata.employeeList;

            var $theader = this.$theader.find("tr").empty().append("<th></th>");
            var $theaderx = this.$theaderx.find("tr").empty().append("<th></th>");
            var $tbody = this.$tbody.empty();
            var $tbodyy = this.$tbodyy.empty();

            var strategy = am.metadata.configs.strategy;

            var blocks = (endTs - startTs) / 1800000;
            // $.am.debug.log("createFrame:" + blocks);
            for (var i = 0; i < blocks; i++) {
                var time = new Date(startTs + i * 1800000);
                var min = time.format("MM");
                if (min == "30") {
                    var str = $("<th class='small'><span>" + time.format("HH") + "</span>:" + min + "</th>");
                } else {
                    var str = $("<th><span>" + time.format("HH") + "</span>:" + min + "</th>");
                }

                if (strategy == "1" && min == "30") {
                    str.hide();
                }

                $theader.append(str);
                $theaderx.append(str);

                // $.am.debug.log("hour:" + i);
            };

            if (strategy == "1") {
                var twidth = 110 * (Math.floor(blocks / 2) + 1);
            } else {
                var twidth = 110 * (blocks + 1);
            }
            this.$tb.parent().width(twidth);
            this.$tb.width(twidth);
            this.$tbx.width(twidth);

            //过滤不可预约的员工 mgjshowinmyk 0 为不可预约
            var employeesFilted = [];
            $.each(employees, function (key, item) {
                employees[key].mgjshowinmyk == 1 && employeesFilted.push(employees[key]);
            })
            //console.log(employeesFilted);

            $.each(employeesFilted, function (i, item) {
                // console.log(item);
                var $tr = self.$tr.clone(true, true);
                var $tuser = self.$tuser.clone(true, true);
                $tuser.find(".name").html(item.name);
                //头像 三块table会有重叠部分 找到上面的.header
                $tuser.find(".header").html(am.photoManager.createImage("artisan", {
                    parentShopId: am.metadata.userInfo.parentShopId
                }, item.id + ".jpg", "s"));
                //添加员工职位名称——dutyName
                $tuser.find(".level").html(item.dutyName);

                $tr.append($tuser);
                $tbodyy.append($tr);
                $tr = $tr.clone(true, true);

                for (var j = 0; j < blocks; j++) {
                    var time = new Date(startTs + j * 1800000);
                    var min = time.format("MM");
                    var $td = self.$td.clone(true, true);
                    $td.data("ts", time);

                    if (strategy == "1" && min == "30") {
                        $td.hide();
                    }

                    $tr.append($td);
                };

                $tr.data("item", item);
                $tbody.append($tr);
            });

            this.sc_table.refresh();
        },

        //清空框架

        clearFrame: function () {
            var self = this;
            this.$tbody.find("td:not(.user)").each(function () {
                $(this).empty().append(self.$rvshow.clone(true, true)).removeClass("hasContent");
            });

        },

        //render数据
        renderData: function (data) {
            console.log("renderData");
            console.log(data);
            this.clearFrame();
            var self = this;
            var $trs = this.$tbody.children("tr").removeClass("rest");

            $.each(data.reservations, function (i, item) {
                //遍历所有预约
                // console.log("loop data", i);
                $trs.each(function (j, itemj) {

                    // console.log("loop tr", j);
                    var $this = $(itemj);
                    var $tds = $(itemj).children("td:not(.user)");
                    var itemData = $this.data("item"); //得到员工信息

                    var reservationTime = new Date(item.reservationTime);

                    //查找对应行，美发师匹配&&并且是同一天
                    if (itemData.id == item.barberId && timeBar.currentDate.format("yyyy/mm/dd") == reservationTime.format("yyyy/mm/dd")) {
                        $tds.each(function (k, itemk) {
                            //TODO
                            var $this = $(itemk);
                            var ts = $this.data("ts");
                            var hour = ts.getHours();
                            var thour = reservationTime.getHours();
                            var minute = ts.getMinutes();
                            var tminute = reservationTime.getMinutes();
                            // console.log("loop td", k, hour, thour);
                            if (hour == thour && tminute - minute < 30 && item.status != 2) {
                                //添加一个预约模块
                                if (item.type) {
                                    if (item.reservId) { //高级预约项目占用
                                        self.findPreData(item.reservId, data.reservations, function (preData) {
                                            // console.log("111111111111", preData)
                                            var $holder = self.$holder.clone(true, true);
                                            $holder.data("item", item);
                                            if (preData.status == 1) {
                                                //已到店
                                                $holder.addClass("green");
                                            } else {
                                                var newD = new Date(preData.reservationTime);

                                                var strategy = am.metadata.configs.strategy;
                                                var itemProp = JSON.parse(preData.itemProp)
                                                var time = parseInt(itemProp.times);

                                                if (strategy == "0") { //半小时
                                                    newD.setTime(newD.setHours(newD.getHours() + 0.5 * (time - 1)));
                                                } else { //1小时
                                                    newD.setTime(newD.setHours(newD.getHours() + 1 * (time - 1)));
                                                }
                                                if (am.now().getTime() > preData.reservationTime && am.now().getTime() > newD.getTime()) {
                                                    //已逾期
                                                    $holder.addClass("red");
                                                } else {
                                                    //预约中
                                                    $holder.addClass("black");
                                                }
                                            }
                                            $this.append($holder);
                                        });
                                    } else {
                                        //普通占用
                                        var $holder = self.$holder.clone(true, true);
                                        $holder.data("item", item);
                                        $this.append($holder);
                                    }

                                    return false;
                                } else {
                                    //正常预约

                                    var $rvitem = self.$rvitem.clone(true, true);
                                    $rvitem.find(".rvtime").html(am.processPhone(item.memmobile));

                                    if (item.channel == 1 || item.channel == 2) {
                                        $rvitem.find(".fromPhone").show();
                                    } else {
                                        $rvitem.find(".fromPhone").hide();
                                    }
                                    if (!item.itemProp) {
                                        $rvitem.find(".seeItems").hide();
                                    } else {
                                        $rvitem.find(".seeItems").show();
                                        $rvitem.find(".item").hide();
                                    }
                                    // $rvitem.find(".item").html(item.categoryName.substr(0, 1));
                                    $rvitem.find(".item").html(self.getCategoryNameById(item.categoryId).substr(0, 1));
                                    $rvitem.find(".comment").html(!item.comment ? '无备注~' : item.comment);

                                    if (item.number > 1) {
                                        var numbertext = item.number + "人";
                                        if (item.number >= 4) {
                                            numbertext = "多人"
                                            $rvitem.find(".badge").css("width", "30px");
                                        } else {
                                            $rvitem.find(".badge").css("width", "17px");
                                        }
                                        $rvitem.find(".badge").html(numbertext).show();
                                    } else {
                                        $rvitem.find(".badge").hide();
                                    }

                                    $rvitem.find(".rvname").html(item.custName);
                                    if (item.status == 1) {
                                        //已到店
                                        $rvitem.addClass("green");
                                    } else {
                                        if (item.itemProp) { //高级预约模式
                                            var newD = new Date(item.reservationTime);
                                            var strategy = am.metadata.configs.strategy;
                                            var itemProp = JSON.parse(item.itemProp)
                                            var time = parseInt(itemProp.times);
                                            if (strategy == "0") { //半小时
                                                newD.setTime(newD.setHours(newD.getHours() + 0.5 * (time - 1)));
                                            } else { //1小时
                                                newD.setTime(newD.setHours(newD.getHours() + 1 * (time - 1)));
                                            }
                                            console.log("am.now().getTime() > newD.getTime()====", am.now().getTime() > newD.getTime())
                                            if (am.now().getTime() > item.reservationTime && am.now().getTime() > newD.getTime()) {
                                                //已逾期
                                                $rvitem.addClass("red");
                                            } else {
                                                //预约中
                                            }
                                        } else { //普通预约模式
                                            if (am.now().getTime() > item.reservationTime) {
                                                //已逾期
                                                $rvitem.addClass("red");
                                            } else {
                                                //预约中
                                            }
                                        }

                                    }

                                    $this.find(".rv_show").append($rvitem);

                                    $rvitem.data("item", item);
                                    $this.addClass("hasContent");
                                    return false;
                                }
                            }
                        });
                        return false;
                    }
                });
            });


            //休假
            $.each(data.vacations, function (i, item) {
                // console.log("loop data", i);
                $trs.each(function (j, itemj) {
                    // console.log("loop tr", j);
                    var $this = $(itemj);
                    var $tds = $(itemj).children("td.user");
                    var itemData = $this.data("item");
                    if (itemData.id == item.empId) {
                        $this.addClass("rest");
                        $this.children("td:nth-child(2)").append(self.$rest.clone(true, true));
                    }
                });
            });
            console.log("render oncen");

            var $tds = this.$tbody.find('td');
            for (var i = 0; i < $tds.length; i++) {
                var rvitem = $($tds[i]).find('.rv_item').length;
                var html = $($tds[i]).html();
                if (rvitem > 1) {
                    $($tds[i]).find('.rv_show').append('<div class="toggleItem am-clickable" data-activeindex="0" data-number="' + rvitem + '"><span>1</span>/<span>' + rvitem + '</span></div>');
                }
            }

            //时间线
            this.renderTimeline();
        },
        //高级预约占用找到根节点
        findPreData: function (reservId, reservations, cb) {
            // console.log(dom)
            for (var k = 0; k < reservations.length; k++) {
                if (reservId == reservations[k].id) {
                    cb(reservations[k]);
                    break;
                }
            }
        },
        renderTimeline: function () {
            //TODO
            var strategy = am.metadata.configs.strategy;
            var now = am.now();

            var nowTs = now.getTime();

            var startTs = this.startTs.getTime();
            var endTs = this.endTs.getTime();

            if (timeBar.isToday() && nowTs >= startTs && nowTs <= endTs) {
                if (strategy == "1") {
                    if (this.endTs.format("MM") == "30") {
                        endTs += 1800000;
                    }
                    var addDuration = 3600000;
                } else {
                    var addDuration = 1800000;
                }
                var percent = ((nowTs - startTs + addDuration) / (endTs - startTs + addDuration));
                // console.log(startTs, nowTs, endTs, (endTs - startTs), (nowTs - startTs), percent);
                this.$timeline.show().css("left", percent * 100 + "%");
            } else {
                this.$timeline.hide();
            }

            //

            var $tds = this.$tbody.find("td:not(.user)").removeClass("passed");

            var thatday = timeBar.thatday();

            if (thatday < 0) {
                $tds.addClass("passed");

            } else if (thatday == 0) {

                $tds.each(function () {
                    //TODO
                    var $this = $(this);
                    var ts = $this.data("ts").getTime();
                    // console.log(thour, hour);
                    if (nowTs > ts) {
                        $this.addClass("passed");
                    }

                });

            } else if (thatday > 0) {}

        },

        getCategoryNameById: function (id) {
            for (var i = 0; i < am.metadata.classes.length; i++) {
                if (am.metadata.classes[i].id == id) {
                    return am.metadata.classes[i].name;
                }
            }
            return '';
        },

        getData: function (ts, disableTip, disableScroll) {
            var self = this;

            if (!disableTip) {
                am.loading.show("正在下载数据，请稍候...");
            }

            am.api.reservationList.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId,
                reservationTime: ts
            }, function (ret) {
                console.log(ret)
                if (!disableTip) {
                    am.loading.hide();
                }
                if (ret.code == 0) {
                    self.data = ret.content;
                    self.renderData(self.data);
                    if (!disableScroll) {
                        self.scroll("current");
                    }
                    console.log(ret);
                } else {
                    am.msg(ret.message || "获取数据失败，请刷新页面！", true);
                }
            });
        },
        scroll: function (direction) {
            var self = this;
            var $scroller = this.$scroll;
            var $timeline = this.$timeline;

            if (direction == "current") {
                if ($timeline.is(":visible")) {
                    var left = $timeline.position().left;
                    console.log("scrollLeft", left);
                    setTimeout(function () {
                        self.sc_table.scrollTo([-(left - self.$scroll.width() / 2), 0]);
                    }, 200)
                }
            } else {}

        },
        createHolder: function ($td) {
            var self = this;
            var $tr = $td.parent();
            var time = $td.data("ts");
            time = new Date(timeBar.currentDate.format("yyyy/mm/dd") + time.format(" HH:MM:ss"));
            var barber = $tr.data("item");

            am.loading.show("正在提交，请稍候...");
            am.api.reservationAdd.exec({
                "parentShopId": am.metadata.userInfo.parentShopId,
                "shopId": am.metadata.userInfo.shopId,
                "reservationTime": time.getTime(),
                "barberId": barber.id,
                "barberName": barber.name,
                "channel": 0, //0收银台 1美一客web 2美一客app 3生意宝
                "type": 1, //0预约 1占位
                "custId": -1,
                "categoryId": -1,
                "number": 1,
                "reservationType": 0 //0预约 1反预约
            }, function (ret) {
                am.loading.hide();
                if (ret.code == 0) {
                    am.msg("预约已经登记！");
                    self.getData(timeBar.currentDate.getTime(), 1, 1)
                } else {
                    am.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        }
    };

    var reservationDetail = {
        goToCash:function(data,ischeck){
            var self=this;
            var pages = 'service';
            if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
                pages = 'openbill';
            }
            if(ischeck){
                atMobile.nativeUIWidget.confirm({
                    caption: '是否设置为已到店',
                    description: '收银之后，是否设为已到店？',
                    okCaption: '是',
                    cancelCaption: '否'
                }, function () {
                    self.activate(data);

                    $.am.changePage(am.page[pages], "", {
                        reservation: data
                    });
                }, function () {
                    $.am.changePage(am.page[pages], "", {
                        reservation: data
                    });
                });
            }else{
                $.am.changePage(am.page[pages], "", {
                    reservation: data
                });
            }
            

        },
        init: function () {
            var self = this;
            this.$ = $("#popup_reservationDetail").vclick(function () {
                self.hide();
            });
            this.$content = this.$.children(".content");
            this.$gotoCashier = this.$.find(".gotoCashier").vclick(function () {
                var item = $(this).parents('.popup_reservationDetail').data('item');
                if (item.status != 1) {
                    self.goToCash(self.data,1);
                }else{
                    self.goToCash(self.data);
                }
                
                
            });
            this.$arrived = this.$.find(".arrived").vclick(function () {
                self.activate(self.data);
            });
            this.$cancel = this.$.find(".cancel").vclick(function () {
                self.cancel(self.data);
            });
            this.$modifyBtn = this.$.find(".modifyBtn");

            var configs = am.metadata.configs;
            this.$modifyBtn.mobiscroll().datetime({
                theme: 'mobiscroll',
                lang: 'zh',
                display: 'bottom',
                dateWheels: 'yyyy mm dd',
                timeWheels: 'HHii',
                showOnTap: false,
                closeOnOverlayTap: false,
                min: am.now(),
                steps: {
                    minute: am.metadata.configs.strategy == 1 ? 60 : 30,
                    zeroBased: true
                },
                invalid: [{
                    start: "00:00",
                    end: configs.reservationFrom || "9:00"
                }, {
                    start: configs.reservationTo || "22:00",
                    end: "23:59"
                }],
                showLabel: true,
                onSet: function (valueText, inst) {
                    console.log(new Date(valueText.valueText).getTime());
                    // self.renderDate();
                    self.changeTime(self.data, new Date(valueText.valueText).getTime());
                }
            });
            var mobiscroll = this.$modifyBtn.mobiscroll('getInst');
            this.$modifyBtn.vclick(function (event) {
                console.log(mobiscroll);

                mobiscroll.setVal(new Date(self.data.reservationTime));
                mobiscroll.show();
                event.stopPropagation();
            });

            this.$itemline2 = this.$.find(".itemline2");
            this.$items = this.$.find(".items");

            this.sc = new $.am.ScrollView({
                $wrap: this.$itemline2,
                $inner: this.$items,
                direction: [false, true],
                hasInput: false
            });
        },
        open: function (item) {
            this.data = item;
            this.render(item);
            this.show();
        },
        show: function () {
            this.$.fadeIn();
        },
        hide: function () {
            this.$.fadeOut();
        },
        render: function (item) {
            var $dom = this.$;
            $dom.find(".name").html(item.custName);
            $dom.find(".phone").html(am.processPhone(item.memmobile));

            $dom.find(".itemP").remove();
            $dom.find(".category").remove();
            if (!item.itemProp) {
                $dom.find(".comment").html(item.comment);
                $dom.find(".infoarea").removeClass("newInfoarea");
                var itemSpan = $('<span class="category">洗剪吹</span>');
                $dom.find(".itemarea").hide();
                $dom.find(".line2").append(itemSpan);
                $dom.find(".category").html(reservation.getCategoryNameById(item.categoryId));
            } else {
                $dom.find(".infoarea").addClass("newInfoarea");
                $dom.find(".comment").html("");
                $dom.find(".itemComment").html(item.comment);
                //预约项目显示
                var items = JSON.parse(item.itemProp).items;
                var html = ''
                for (var key in items) {
                    html += '<p class="itemP">' + items[key].name + '</p>'
                }

                //预约套餐显示
                var packages = JSON.parse(item.itemProp).packages;
                for (var key in packages) {
                    html += '<p class="itemP">' + packages[key].serviceItemName + '</p>'
                }

                this.$items.html(html)
                $dom.find(".itemarea").show();

                var _this = this;
                setTimeout(function () {
                    _this.sc.refresh();
                    _this.sc.scrollTo("top");
                }, 500)
                // $dom.find(".category").html(name);
            }

            $dom.find(".time").html(new Date(item.reservationTime).format("mm月dd日 HH:MM"))

            if (item.number > 1) {
                var numbertext = item.number + "人";
                if (item.number >= 4) {
                    numbertext = "多人"
                }
                $dom.find(".number").html(numbertext).show();
            } else {
                $dom.find(".number").hide();
            }

            if (item.status == 1) {
                //已到店
                this.$content.removeClass("red").addClass("green");
                $dom.find(".title").html("已到店");
            } else {
                if (item.itemProp) { //高级预约模式
                    var newD = new Date(item.reservationTime);
                    var strategy = am.metadata.configs.strategy;
                    var itemProp = JSON.parse(item.itemProp)
                    var time = parseInt(itemProp.times);
                    if (strategy == "0") { //半小时
                        newD.setTime(newD.setHours(newD.getHours() + 0.5 * (time - 1)));
                    } else { //1小时
                        newD.setTime(newD.setHours(newD.getHours() + 1 * (time - 1)));
                    }
                    if (am.now().getTime() > item.reservationTime && am.now().getTime() > newD.getTime()) {
                        //已逾期
                        this.$content.removeClass("green").addClass("red");
                        $dom.find(".title").html("已逾期");
                    } else {
                        //预约中
                        this.$content.removeClass("green red");
                        $dom.find(".title").html("待客");
                    }
                } else {
                    if (am.now().getTime() > item.reservationTime) {
                        //已逾期
                        this.$content.removeClass("green").addClass("red");
                        $dom.find(".title").html("已逾期");
                    } else {
                        //预约中
                        this.$content.removeClass("green red");
                        $dom.find(".title").html("待客");
                    }
                }

            }

            $dom.data("item", item);
        },
        changeTime: function (item, newTime) {
            console.log(item, newTime);
            // return;
            var self = this;
            am.loading.show("正在提交，请稍候...");
            am.api.reservationUpdateTime.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId,
                id: item.id,
                reservationTime: newTime,
                channel: 0
            }, function (ret) {
                am.loading.hide();
                if (ret.code == 0) {
                    var tempTimes=newTime-item.reservationTime;
                    console.log("tempTimes=====",tempTimes)
                    item.reservationTime = newTime;
                    var reservations = reservation.data.reservations;
                    if (item.itemProp) { //高级预约模式改时间
                        var strategy = am.metadata.configs.strategy;
                        for (var i = 0; i < reservations.length; i++) {
                            if (reservations[i].reservId == item.id) { //占用的时长的该项目(加半小时或1小时)
                                reservations[i].reservationTime += tempTimes;
                                // if (strategy == "0") { //半小时
                                   
                                // } else {
                                //     reservations[i].reservationTime = newD.setTime(newD.setHours(newD.getHours() + 1));
                                // }

                            }
                        }
                    }
                    console.log("reservation.data=====",reservation.data)
                    reservation.renderData(reservation.data);
                    am.socketPush.getReservationNum();
                    self.hide();
                    am.msg("预约已成功改期！");
                } else {
                    am.msg(ret.message || "提交失败，请刷新页面！", true);
                }
            });
        },
        activate: function (item) {
            var self = this;
            am.loading.show("正在提交，请稍候...");
            am.api.reservationChangestatus.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId,
                id: item.id,
                status: 1,
            }, function (ret) {
                am.loading.hide();
                if (ret.code == 0) {
                    item.status = 1;
                    reservation.renderData(reservation.data);
                    am.socketPush.getReservationNum();
                    self.hide();
                } else {
                    am.msg(ret.message || "提交失败，请刷新页面！", true);
                }
            });
        },
        cancel: function (item) {
            var self = this;
            am.loading.show("正在提交，请稍候...");
            am.api.reservationCancel.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId,
                id: item.id,
                channel: 4
            }, function (ret) {
                am.loading.hide();
                if (ret.code == 0) {
                    item.status = 2;
                    var reservations = reservation.data.reservations;
                    var reservationsNew = [];
                    for (var i = 0; i < reservations.length; i++) {
                        if (reservations[i].id != item.id && reservations[i].reservId != item.id) {
                            reservationsNew.push(reservations[i]);
                        }
                    }
                    reservation.data.reservations = reservationsNew;
                    reservation.renderData(reservation.data);
                    am.socketPush.getReservationNum();
                    self.hide();
                } else {
                    am.msg(ret.message || "提交失败，请刷新页面！", true);
                }
            });
        }
    }

})();
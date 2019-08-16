(function () {
    var self = am.page.reservation = new $.am.Page({
        id: "page_reservation",
        disableScroll: 1,
        init: function () {
            $("#page-mainTable").on('vclick', '.good', function (e) {
                //优质客
                e.stopPropagation();
                am.goodModal.show();
            });
            this.$.find('.appointment-btn').vclick(function () {
                $.am.changePage(am.page.appointment, 'slideup',{
                    shifts:self.shifts,
                    date:timeBar.currentDate.format("yyyy-mm-dd")
                });
            });
        },
        beforeShow:function(paras){
            am.tab.main.show();
            am.tab.main.select(0);
            if (paras && paras.openbill == 1) {
                this.$.addClass("am-full");
            } else {
                this.$.removeClass("am-full");
            }
        },
        afterShow: function (paras) {
            this.paras = paras;
            if (!this.initialized) {
                timeBar.init(this.$);
                reservationDetail.init();
                reservation.init(this.$);
                this.initialized = 1;
                reservation.createFrame();
            }
            timeBar.startPolling();
        },
        beforeHide: function () {
            timeBar.stopPolling();
            reservation.endToggleBarber();
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
                endYear: amGloble.now().getFullYear()+50,
                onSet: function (valueText, inst) {
                    console.log(valueText)
                    self.currentDate = new Date(valueText.valueText);
                    self.gotoDate(new Date(valueText.valueText));
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
            this.currentDate = cd;
            this.renderDate();
        },
        nextDay: function () {
            var cd = this.currentDate;
            cd.setDate(cd.getDate() + 1);
            this.currentDate = cd;
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
        weekDay: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
        renderDate: function (disableTip, disableScroll) {
            this.$date.find('.time').text(this.currentDate.format("yyyy-mm-dd"));
            this.$date.find('.week').text(this.weekDay[this.currentDate.getDay()]);
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
            this.$holder = this.$td.find(".rv_holder").remove();
            this.$remark = this.$td.find(".rv_remark").remove();
            this.$rest = this.$td.find(".rv_rest").remove();
            this.$rvshow = this.$td.find(".rv_show").remove();
            this.$rvitem = this.$rvshow.find(".rv_item").remove();
            this.$toggleBarber = this.$.find('.toggleBarber').on('vclick','.cancel',function(){
                self.endToggleBarber();
            });
            this.$.on('vclick', ".user .iconfont", function () {
                var $this = $(this); // 所点击的icon按钮
                if ($(this).hasClass('icon-xiujia')) {
                    am.confirm("取消休假", "确认取消休假？", "确定", "取消", function () {
                        // 取消休假
                        am.loading.show("正在取消休假，请稍候...");
                        var restObj = $this.data('restObj');
                        var delParams = {
                            parentShopId: am.metadata.userInfo.parentShopId,
                            shopId: am.metadata.userInfo.shopId,
                            id: restObj.id
                        }
                        am.api.delVacation.exec(delParams, function (ret) {
                            am.loading.hide();
                            if (ret.code == 0) {
                                reservation.getData(timeBar.currentDate.getTime(), 1, 1);
                            } else {
                                am.msg(ret.message || "取消休假失败，请刷新页面后重试！", true);
                            }
                        });
                    }, function () {});
                } else {
                    // 添加休假
                    am.confirm("设置休假", "确认设置休假？", "确定", "取消", function () {
                        am.loading.show("正在设置休假，请稍候...");
                        var empNameText = $this.parent().children('.name').text();
                        var restDate = timeBar.currentDate.format("yyyy-mm-dd").split('-');
                        var empObj =$this.parents('.user').data('empItem');
                        // for (var i = 0; i < $('#page-mainTable tbody tr').length; i++) {
                        //     var $td = $('#page-mainTable tbody').find('tr').eq(i);
                        //     if ($td.find('.name').text() == empNameText) {
                        //         empObj = $td.data('item');
                        //     }
                        // }
                        var addParams = {
                            parentShopId: am.metadata.userInfo.parentShopId,
                            shopId: am.metadata.userInfo.shopId,
                            empId: empObj.id,
                            empName: empObj.name,
                            year: restDate[0],
                            month: restDate[1],
                            day: restDate[2]
                        }

                        if (!addParams.empId) {
                            am.msg("您在此时间有预约服务，无法设置休假");
                            am.loading.hide();
                            return
                        } else {
                            am.api.addVacation.exec(addParams, function (ret) {
                                am.loading.hide();
                                if (ret.code == 0) {
                                    reservation.getData(timeBar.currentDate.getTime(), 1, 1);
                                } else {
                                    am.msg(ret.message || "设置休假失败，请刷新页面后重试！", true);
                                }
                            });
                        }
                    }, function () {});
                }
            });
            // 设置休假end
            this.$tb.on("vclick", ".rv_item", function () {
                if(self.togglingData) {
                    am.msg('请选择空闲的方格');
                    return false;
                } 
                var $this = $(this);
                var item = $this.data("item");
                if (am.page.reservation.paras && am.page.reservation.paras.openbill == 1) {
                    reservationDetail.data = item;
                    if (item.status != 1) {
                        reservationDetail.goToCash(item, 1);
                    } else {
                        reservationDetail.goToCash(item);
                    }
                } else {
                    reservationDetail.open(item);
                }
                return false;
            }).on('vhold','.rv_item',function(){
                var data = $(this).data('item');
                if(data.status==3){
                    am.msg('已结算预约无法修改');
                    return;
                }
                self.startToggleBarber($(this));
                return false;
            }).on("vclick", ".rv_holder", function () {
                if(self.togglingData) {
                    am.msg('请选择空闲的方格');
                    return false;
                } 
                var data = $(this).data('item');
                am.popupMenu("请选择相应的操作",[{name:"取消占用"},{name:"添加备注"}],function(res){
                    if(res.name == "取消占用"){
                        am.confirm("取消占用", "取消占用？", "确定", "取消", function () {
                            reservationDetail.cancel(data);
                        });
                    }else if(res.name == "添加备注"){
                        $("#common_addremark").show().find(".save_btn").data(data);
                        $("#common_addremark").find(".addremark_title").text("添加备注").end().find("textarea").val(data.comment || "");
                    }
                });
                return false;
            }).on("vclick", ".rv_remark", function (e) {
                e.stopPropagation();
                if(self.togglingData) {
                    am.msg('请选择空闲的方格');
                    return false;
                } 
                var data = $(this).data("item");
                am.popupMenu("请选择相应的操作",[{name:"取消占用"},{name:"编辑备注"}],function(res){
                    if(res.name == "取消占用"){
                        am.confirm("取消占用", "取消占用？", "确定", "取消", function () {
                            reservationDetail.cancel(data);
                        });
                    }else if(res.name == "编辑备注"){
                        $("#common_addremark").show().find(".save_btn").data(data);
                        $("#common_addremark").find(".addremark_title").text("编辑").end().find("textarea").val(data.comment || "");
                    }
                });
                return false;
            }).on("vclick", "td", function () {
                var $this = $(this);
                if ($this.find('.rv_item').length) {
                    return false;
                }
                if ($this.hasClass("passed") || $this.parent().hasClass("rest")) {
                    return false;
                }
                if(self.togglingData){
                    self.togglingBarber($this);
                    return false;
                }
                self.createHolder($this);
            }).on('vclick', '.toggleItem', function () {
                if(self.togglingData) {
                    am.msg('请选择空闲的方格');
                    return false;
                } 
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
            })

            //编辑备注保存
            $("#common_addremark").on("vclick",".save_btn",function(){
                var remark = $("#common_addremark").find("textarea").val();
                var data = $(this).data();
                if(data.id){
                    self.updateComment({
                        val: remark,
                        id: data.id
                    });
                }else{
                    self.updateComment({
                        val: remark
                    },data);
                }
            }).on("vclick",".cancel_btn,.right_btn",function(){
                $("#common_addremark").hide();
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
            };
            this.$.find("#reservationBack").vclick(function () {
                page.show("enterCode");
            });
            this.$.find('.delAfterBoxWrap .icon-close').vclick(function () {
                self.$.find('.delAfterBoxWrap').hide();
            })
        },
        startToggleBarber: function($this){
            this.$toggleBarber.addClass('fadeIn');
            this.$.find('.rv_item').removeClass('hilight');
            $this.addClass('hilight');
            this.togglingData = $this.data('item');
        },
        endToggleBarber: function(){
            this.$toggleBarber.removeClass('fadeIn');
            this.$.find('.rv_item').removeClass('hilight');
            this.togglingData = null;
        },
        togglingBarber: function($this){
            var data = this.togglingData;

            var autoHolders = this.$.find('.hilight').parents('td').nextAll();
            var autoHolderNum = 0;
            for(var i=0;i<autoHolders.length;i++){
                var $autoHolder = $(autoHolders[i]);
                var holderData = $autoHolder.find('.rv_holder').data('item');
                if(holderData && holderData.reservId==data.id){
                    autoHolderNum ++;
                }else {
                    break;
                }
            }
            var targetAfters =$this.nextAll();
            var targetAftersEmptyNum = 0;
            for(var i=0;i<targetAfters.length;i++){
                var $targetAfters = $(targetAfters[i]);
                if(!$targetAfters.find('.rv_show').children().length && !$targetAfters.find('.rv_holder').length){
                    targetAftersEmptyNum ++;
                }else {
                    break;
                }
            }
            if(autoHolderNum>targetAftersEmptyNum){
                am.msg('没有足够的空闲时间');
                return;
            }
            var index = $this.parent('tr').index(),
                newBarberId = this.$tby.find('tbody .user').eq(index).data('empItem').id,
                currentY = timeBar.currentDate.getFullYear(),
                currentM = timeBar.currentDate.getMonth(),
                currentD = timeBar.currentDate.getDate(),
                newTime = $this.data('ts');
            newTime.setFullYear(currentY);
            newTime.setMonth(currentM);
            newTime.setDate(currentD);
            reservationDetail.changeTime(data,newTime.getTime(),newBarberId);        
        },
        //更新备注
        updateComment: function (data,$this) {
            var self = this;
            if($this){
                self.createHolder($this,data.val);
                return;
            }
            am.loading.show();
            am.api.reservationUpdateComment.exec({
                "comment": data.val,
                "id": data.id,
            }, function (ret) {
                am.loading.hide();
                if (ret.code == 0) {
                    am.msg("保存成功");
                    $("#common_addremark").hide().find(".save_btn").data(null).end().find("textarea").val("");
                    self.getData(timeBar.currentDate.getTime(), 1, 1);
                } else {
                    am.msg(ret.message || "保存失败，请稍后再试！", true);
                }
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
            $.each(employeesFilted, function (i, item) {
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
                $tuser.data('empItem',item);
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
        renderShiftInfo:function(data){
            var $tds=this.$.find('#page-tableHeaderY td.user');
            $tds.find('.prefix-shift').text(''); // 班次信息置空
            var arr=data && data.scheduleShift && data.scheduleShift.scheduleShift;
            self.shifts=arr;
            for(var i=0,len=$tds.length;i<len;i++){
                var emp=$($tds[i]).data('empItem');
                if(emp){
                    for(var j=0,arrLen=arr.length;j<arrLen;j++){
                        var obj=arr[j].scheduleShift[0];
                        if(obj && (obj.employeeId==emp.id)){
                            // var shiftText=obj.shiftName && (obj.shiftName +'('+obj.goWorkTime+'~'+obj.outWorkTime+')');
                            var shiftText=obj.shiftName;
                            if($($tds[i]).find('.iconfont').hasClass('icon-dian') && shiftText){
                                $($tds[i]).find('.prefix-shift').text((shiftText&&shiftText.substring(0,1))||'');
                            }else if($($tds[i]).find('.iconfont').hasClass('icon-xiujia')){
                                $($tds[i]).find('.prefix-shift').text('');
                            }
                        }
                    }
                }
            }
        },
        renderData:function(data){
            this.$.find('.delAfterBoxWrap').hide();
            console.log("renderData");
            console.log(data);
            //当天的预约数据按员工暂存
            var reservations = {},self=this;
            var strategy = am.metadata.configs.strategy;
            //选择的日期string
            var currentDate=timeBar.currentDate.format("yyyy/mm/dd");
            for(var i = 0;i<data.reservations.length;i++){
                var reservationTime = new Date(data.reservations[i].reservationTime);
                if(currentDate !== reservationTime.format("yyyy/mm/dd")){
                    //过滤不是今天的数据
                    continue;
                }
                //员工ID
                var barberId = data.reservations[i].barberId;
                if(!reservations[barberId]){
                    //此员工没有暂存对象，创建
                    reservations[barberId] = [];
                }
                reservations[barberId].push(data.reservations[i]);
            }
            this.$tbody.children("tr").removeClass("rest").each(function (j, itemj) {
                var $tr = $(itemj);
                //取到员工信息
                var itemData = $tr.data("item");
                $tr.children("td:not(.user)").each(function (k, itemk) {
                    var $this = $(itemk);
                    //此单元格的时间
                    var ts = $this.data("ts");
                    //取到员工今天所有的预约数据
                    var arrRes = reservations[itemData.id];
                    var hasContent = false;
                    if(arrRes && arrRes.length){
                        for(var i=0;i<arrRes.length;i++){
                            //单个预约数据
                            var item = arrRes[i];
                            var reservationTime = new Date(item.reservationTime);
                            var hour = ts.getHours();
                            var thour = reservationTime.getHours();
                            var minute = ts.getMinutes();
                            var tminute = reservationTime.getMinutes();

                            if (hour == thour && (strategy=="1" || tminute == minute) && item.status != 2) {
                                //如果
                                //此单元格有预约
                                hasContent = true;
                                //清空并重置
                                $this.empty().append(self.$rvshow.clone(true, true)).removeClass("hasContent");
                                //渲染预约
                                self.renderTdForReservation(item,arrRes,$this);
                                break;
                            }
                        }
                    }
                    if(hasContent===false){
                        //如果这次渲染没有内容，但DOM里面有内容,重置
                        $this.empty().append(self.$rvshow.clone(true, true)).removeClass("hasContent");
                    }
                });
            });
            var $thUsers = this.$.find('#page-tableHeaderY td.user');
            var vacationsMap = {};
            for(var i in data.vacations){
                vacationsMap[data.vacations[i].empId] = data.vacations[i];
            }
            this.$tbody.children("tr").removeClass("rest").each(function (j, itemj) {
                
                var $this = $(itemj);
                var $restUsertd = $thUsers.eq(j);
                var itemData = $this.data("item");
                var item = vacationsMap[itemData.id];
                if (item) {
                    $restUsertd.children('span').removeClass('icon-dian').addClass('icon-xiujia');
                    $restUsertd.children('div').addClass('rest_bg');
                    $restUsertd.children('span').data('restObj', item);
                    $this.find('.rv_holder').css('background-color', '#f6f6f6'); //休假状态下的占用背景置灰
                    $this.find('td').removeClass('am-clickable'); //休假状态下不可点击
                    $this.addClass("rest");
                    $this.children("td:nth-child(2)").append(self.$rest.clone(true, true));
                }else{
                    $this.find('td').addClass('am-clickable');
                    $restUsertd.children('span').addClass('icon-dian').removeClass('icon-xiujia');
                    $restUsertd.children('div').removeClass('rest_bg');
                }
            });
            //时间线
            this.renderTimeline();
            this.renderShiftInfo(data); // 渲染员工的排班信息
        },
        /**
         *  渲染一个单元格
         *  item 当前单元格的预约数据
         *  reservations 所有的预约数据，要查询关联预约，高级预约模式下的跨格占用
         *  $this 当单元格的DOM
         */
        renderTdForReservation:function(item,reservations,$this){
            var self=this;
            //添加一个预约模块
            if (item.type) {
                if (item.reservId) { //高级预约项目占用
                    self.findPreData(item.reservId, reservations, function (preData) {
                        // console.log("111111111111", preData)
                        var $holder = self.$holder.clone(true, true);
                        $holder.data("item", item);
                        if (preData.status == 1) {
                            //已到店
                            $holder.addClass("green");
                        }else if (item.status == 3) {
                            //已结算
                            $rvitem.addClass("green payed");
                            $rvitem.find('.seeItems').hide();
                        }  else {
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
                        for(var i=0;i<reservations.length;i++){
                            if(item.reservId==reservations[i].id && reservations[i].status==3){
                                $holder.addClass('green').removeClass('red black');
                                break;
                            }
                        }
                        $this.append($holder);
                    });
                } else {
                    //普通占用
                    var comment = item.comment || "";
                    var $holder = self.$holder.clone(true, true);
                    var $remark = self.$remark.clone(true, true);
                    $holder.data("item", item);
                    $remark.data("item", item);
                    $holder.show();
                    $remark.hide().html('');
                    $this.append($holder);
                    if(comment){
                        if(item.comment.length > 20){
                            comment = item.comment.substring(0,20)+"...";
                        }
                        $remark.show().html('<span class="iconfont icon-shijianbiao"></span><span>' + comment + "</span>");
                        $holder.hide();
                        $this.append($remark);
                    }
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
                if(item.pledgeStatus*1 && item.pledgeMoney){
                    $rvitem.find('.promise').show();
                }else {
                    $rvitem.find('.promise').hide();
                }
                // $rvitem.find(".item").html(item.categoryName.substr(0, 1));
                $rvitem.find(".item").html(self.getCategoryNameById(item.categoryId).substr(0, 1));
                $rvitem.find(".comment").html(!item.comment ? '无备注~' : item.comment);
                if($rvitem.find(".item").is(':visible')){//如果没有item则多人居右显示
                    $rvitem.find(".badge").css("right", "22px");
                }else{
                    $rvitem.find(".badge").css("right", "0");
                }
                if (item.number > 1) {
                    var numbertext = item.number + "人";
                    if (item.number >= 4) {
                        numbertext = "多人"
                        $rvitem.find(".badge").css("width", "30px");
                    } else {
                        $rvitem.find(".badge").css("width", "25px");
                    }
                    $rvitem.find(".badge").html(numbertext).show();
                } else {
                    $rvitem.find(".badge").hide();
                }
                if (item.mgjIsHighQualityCust == 1) {
                    $rvitem.find(".rvname").html(item.custName + "<span class='good am-clickable'></span>");
                } else {
                    $rvitem.find(".rvname").html(item.custName);
                }
                if (item.status == 1) {
                    //已到店
                    $rvitem.addClass("green");
                }else if (item.status == 3) {
                    //已结算
                    $rvitem.addClass("green payed");
                    $rvitem.find('.seeItems').hide();
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
                if(this.togglingData && this.togglingData.id==item.id){
                    this.startToggleBarber($rvitem.addClass('hilight'));
                }
                return false;
            }
        },
        //高级预约占用找到根节点
        findPreData: function (reservId, reservations, cb) {
            for (var k = 0; k < reservations.length; k++) {
                if (reservId == reservations[k].id) {
                    cb(reservations[k]);
                    break;
                }
            }
        },
        renderTimeline: function () {
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
            var $tds = this.$tbody.find("td:not(.user)").removeClass("passed");
            var thatday = timeBar.thatday();
            if (thatday < 0) {
                $tds.addClass("passed");
            } else if (thatday == 0) {
                $tds.each(function () {
                    var $this = $(this);
                    var ts = $this.data("ts").getTime();
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
                reservationTime: ts,
                period:new Date(ts).format('yyyy-mm-dd')  // 2019-01 月  / 2019-01-02   /"employeeIds":[92807] 查询具体员工的排班信息
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
        createHolder: function ($td,val) {
            var self = this;
            if($td){
                var $tr = $td.parent();
            }
            var time = $td.data("ts");
            time = new Date(timeBar.currentDate.format("yyyy/mm/dd") + time.format(" HH:MM:ss"));
            var barber = $tr.data("item");

            am.loading.show("正在提交，请稍候...");
            am.api.reservationAdd.exec({
                "comment":val,
                "parentShopId": am.metadata.userInfo.parentShopId,
                "shopId": am.metadata.userInfo.shopId,
                "reservationTime": time.getTime(),
                "barberId": barber.id,
                "barberName": barber.name,
                "barberNickname": barber.nickname || barber.name,
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
                    self.getData(timeBar.currentDate.getTime(), 1, 1);
                    if(val){
                        $("#common_addremark").hide().find(".save_btn").data(null).end().find("textarea").val("");
                    }
                } else {
                    am.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        }
    };
    var reservationDetail = {
        goToCash: function (data, ischeck) {
            if (am.page.reservation.paras && am.page.reservation.paras.displayId) {
                data.displayId = am.page.reservation.paras.displayId;
            }
            var self = this;            
            if (ischeck) {
                atMobile.nativeUIWidget.confirm({
                    caption: '是否设置为已到店',
                    description: '收银之后，是否设为已到店？',
                    okCaption: '是',
                    cancelCaption: '否'
                }, function () {
                    self.activate(data);
                    self.changePageFn(data);
                }, function () {
                    self.changePageFn(data);
                });
            } else {
                self.changePageFn(data);
            }
		},
        //判断跳转开单或收银
        changePageFn:function(data){
            var self = this;
            var member={
                id:data.custId,
                realMobile:data.memmobile||'',
                passwd:data.passwd||''
            };
			if(am.isMemberLock(data.lastconsumetime || data.lastConsumeTime,data.locking)){
				//会员已锁,查看是否有U.允许过期或锁定的会员仍然可以输入水单
				if(am.metadata.userInfo.operatestr.indexOf("U,") == -1){
					am.unLock({
						memberId: data.custId,
						locking: 1,
						cb: function() {
							//带入其他页面的会员锁定状态
							data.locking = 1;
							change();
						}
					});
					return;
				}
			}
			change();
            function change(){
				// data.src = "reservation";//来自预约页面
				if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
                    var fn=function(){
                        if (am.metadata.configs.mgjReservationItem == "true" && am.metadata.configs.mgjReservationItemAuto == "true") {
                            // 如果配置了高级预约的自动入单 则将配置自动入单的项目去除走自动入单的逻辑 避免重复添加该项目
                            var obj=JSON.parse(data.itemProp);
                            $.each(obj.items,function(i,v){
                                if(v.autointoorder==1){
                                    delete obj.items[i]  //非自动入单则将预约项目清空
                                    return false;
                                }
                            });
                            data.itemProp=JSON.stringify(obj);
                            $.am.changePage(am.page.openbill, "slidedown", {
                                reservation: data,
                                src: 'reservation'
                            });
                        }else{
                            $.am.changePage(am.page.openbill, "slidedown", {
                                reservation: data,
                                src: 'reservation'
                            });
                        }
                    };
                    if(amGloble.metadata.configs.typePasswordtToSelectMember == 'true' && member){
                        am.pw.check(member, function (verifyed) {
                            if (verifyed) {
                                fn();
                            }
                        });
                    }else{
                        fn();
                    }
				}else{
					$.am.changePage(am.page.service, "", {
						reservation: data
					});
				}
			}
        },
        init: function () {
            var self = this;
            this.$ = $("#popup_reservationDetail").vclick(function () {
                self.hide();
            });
            this.$content = this.$.children(".content");
            this.$gotoCashier = this.$.find(".gotoCashier").vclick(function () {
				var $this = $(this);
				var item = $(this).parents('.popup_reservationDetail').data('item');
				
				if(am.isMemberLock(item.lastconsumetime || item.lastConsumeTime,item.locking)){
					//会员已锁,查看是否有U.允许过期或锁定的会员仍然可以输入水单
					if(am.metadata.userInfo.operatestr.indexOf("U,") == -1){
						am.unLock({
							memberId: item.custId,
							locking: 1,
							cb: function() {
								item.locking = 1;
								$this.parents('.popup_reservationDetail').data('item',item);
								if (item.status != 1) {
									self.goToCash(self.data, 1);
								} else {
									self.goToCash(self.data);
								}
							}
						});
						return;
					}
				}
                if (item.status != 1) {
                    self.goToCash(self.data, 1);
                } else {
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
            var _reservationFrom = '';
            if(configs.reservationFrom){
                if(configs.reservationFrom=='00:00'){
                    _reservationFrom = configs.reservationFrom; 
                }else {
                    var _reservationFromArr = configs.reservationFrom.split(':');
                    var h,m;
                    if(_reservationFromArr[1]=='00'){
                        h = _reservationFromArr[0]*1-1;
                        m = 59;
                    }else if(_reservationFromArr[1]=='30'){
                        h = _reservationFromArr[0];
                        m = 29;
                    }
                    _reservationFrom = h+':'+m;
                }
            }
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
                    end: _reservationFrom || "8:59"
                }, {
                    start: configs.reservationTo || "22:00",
                    end: "23:59"
                }],
                showLabel: true,
                onSet: function (valueText, inst) {
                    console.log(new Date(valueText.valueText).getTime());
                    // self.renderDate();
                    self.changeTime(self.data, new Date(valueText.valueText).getTime(),self.data.barberId);
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
            $dom.find('.promise').show();
            if(item.pledgeStatus=='1'){
                if(item.status==1){
                    $dom.find('.promise').html('<svg class="icon" aria-hidden="true"><use xlink:href="#icon-deposit_s_icon"></use></svg>您已到店，保证金将退回到原支付方式');
                }else{
                    $dom.find('.promise').html('<svg class="icon" aria-hidden="true"><use xlink:href="#icon-deposit_s_icon"></use></svg>用户已缴纳预约保证金￥<b>'+item.pledgeMoney+'</b>元');
                }
            }else if(item.pledgeStatus=='2'){
                $dom.find('.promise').html('<svg class="icon" aria-hidden="true"><use xlink:href="#icon-deposit_s_icon"></use></svg>保证金已退回到原支付方式')
            }else{
                $dom.find('.promise').hide();
            }

            if (item.status == 1) {
                //已到店
                this.$content.removeClass("red payed").addClass("green");
                $dom.find(".title").html("已到店");
            } else if (item.status == 3) {
                this.$content.removeClass("red").addClass("green payed");
                $dom.find(".title").html("已结算");
            }else {
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
                        this.$content.removeClass("green payed").addClass("red");
                        $dom.find(".title").html("已逾期");
                    } else {
                        //预约中
                        this.$content.removeClass("green red payed");
                        $dom.find(".title").html("待客");
                    }
                } else {
                    if (am.now().getTime() > item.reservationTime) {
                        //已逾期
                        this.$content.removeClass("green payed").addClass("red");
                        $dom.find(".title").html("已逾期");
                    } else {
                        //预约中
                        this.$content.removeClass("green red payed");
                        $dom.find(".title").html("待客");
                    }
                }
            }
            $dom.data("item", item);
        },
        changeTime: function (item, newTime, newBarberId) {
            console.log(item, newTime);
            // return;
            var self = this;
            am.loading.show("正在提交，请稍候...");
            am.api.reservationUpdateTime.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId,
                id: item.id,
                reservationTime: newTime,
                barberId: newBarberId,
                channel: 0,
                status: item.status
            }, function (ret) {
                am.loading.hide();
                if (ret.code == 0) {
                    if(item.barberId!=newBarberId || new Date(timeBar.currentDate).format('yyyy-mm-dd')!=new Date(item.reservationTime).format('yyyy-mm-dd')){
                        timeBar.gotoDate(new Date(newTime),0,1);
                    }else {
                        var tempTimes = newTime - item.reservationTime;
                        console.log("tempTimes=====", tempTimes)
                        item.reservationTime = newTime;
                        var reservations = reservation.data.reservations;
                        if (item.itemProp) { //高级预约模式改时间
                            var strategy = am.metadata.configs.strategy;
                            for (var i = 0; i < reservations.length; i++) {
                                if (reservations[i].reservId == item.id) { //占用的时长的该项目(加半小时或1小时)
                                    reservations[i].reservationTime += tempTimes;
                                }
                            }
                        }
                        console.log("reservation.data=====", reservation.data)
                        reservation.renderData(reservation.data);
                        am.socketPush.getReservationNum();
                        self.hide();
                    }
                    am.msg("预约已成功修改！");
                    reservation.endToggleBarber();
                } else {
                    am.msg(ret.message || "提交失败！", true);
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
                    $("#common_addremark").hide().find(".save_btn").data(null).end().find("textarea").val("");
                } else {
                    am.msg(ret.message || "提交失败，请刷新页面！", true);
                }
            });
        }
    }
})();
amGloble.page.setEmpGoal = new $.am.Page({
    id: "page-setEmpGoal",
    backButtonOnclick: function () {
        this.jumpBack(this.meta);
    },
    extraData: null,
    init: function () {
        var self = this;
        this.$wrap = this.$.find(".am-body-wrap")
            .on("vclick", ".emps_switch", function () {
                //员工切换
                var empList = $(this).data("emps");
                amGloble.popupMenu("请选择员工", empList, function (ret) {
                    console.log(ret);
                    var res = {
                        empId: ret.empId,
                        empName: ret.name,
                        dutyId: ret.dutyId,
                        dutyType: ret.dutyType
                    };
                    self.getData(res);
                });
            })
            .on("change", ".item_input input", function () {
                self.checkAllInput();
                var me = this;
                var item = $(this).parents("li").data("item");
                $.each(self.meta.empTarget.targets, function (j, jtem) {
                    if (jtem.type == item.type) {
                        var val = $(me).val() * 1;
                        var change = val - jtem.target ;
                        jtem.target = val;
                        self.meta.empTargetTotal[self.targetMap[jtem.type].total] += change;
                    }
                });
                self.render(self.meta);
            }).on("focus", ".item_input input", function () {
                var $body = $('body'),
                    $this = $(this),
                    top = $this.offset().top,
                    height = $body.outerHeight(),
                    isNeed = (top > height/2);
                if(isNeed){
                    $body.addClass('inputfocus');
                }
            }).on("blur", ".item_input input", function () {
                $('body').removeClass('inputfocus');
            })
        this.$.on("vclick", ".save_btn", function () {
                if ($(this).hasClass("disabled")) {
                    return;
                }
                self.saveData();
            });
        this.$header = this.$.find(".am-header");
        this.$owner = this.$wrap.find(".goal_owner");
        this.$list = this.$wrap.find(".goal_list ul");
        this.$li = this.$list.find("li").clone().remove();
        this.opt = null;
        this.meta = null;
        this.targetMap = {
            "1": { name: "现金业绩", icon: "icon-zhanghuyue" ,total:'CASHACHITARGETTOTAL'},
            "2": { name: "劳动业绩", icon: "icon-meihua" ,total:'WORKACHITARGETTOTAL'}
        };
        this.itemListScroll = new $.am.ScrollView({
            $wrap: this.$.find(".goal_list"),
            $inner: this.$.find(".goal_list ul"),
            direction: [0, 1]
        });
        this.itemListScroll.scrollTo('top');
        this.itemListScroll.refresh();
        this.$goalList = this.$.find('.goal_list');
    },
    beforeShow: function (para) {
        console.log(para);
        if (para && para.targetYear) {
            this.meta = para;
            if(!this.meta.empTargetTotal){
                this.meta.empTargetTotal = {
                    CASHACHITARGETTOTAL:0,
                    WORKACHITARGETTOTAL:0
                }
            }
            this.transData(para);
            this.render(para);
            this.checkAllInput();
        }
    },
    afterShow: function () {
        
    },
    beforeHide: function () { },
    afterHide: function () { },
    transData: function (para) {
        var res = {};
        res.shopId = para.shop.shopId;
        res.parentShopId = para.shop.parentShopId;
        res.empId = para.empTarget.empId;
        res.dutyId = para.empTarget.dutyId;
        res.empName = para.empTarget.empName;
        res.targetYear = para.empTarget.targetYear;
        res.targetMonth = para.empTarget.targetMonth;
        res.empList = [];
        res.empMap = {};
        res.empLevelMap = {};
        res.empDutyMap = {};
        res.empTypeMap = {};
        res.roleMap = {};
        if (para.empLevels) {
			$.each(para.empLevels, function(i, item) {
				res.empLevelMap[item.dutyId] = item.name;
				res.empTypeMap[item.dutyId] = item.dutyType;
			});
        }
        if (para.empRoles) {
			$.each(para.empRoles, function(i, item) {
				res.roleMap[item.id] = item.name;
			});
		}
		if (para.empTargets) {
			$.each(para.empTargets, function(i, item) {
				item.name = item.empName;
				res.empList.push({
					name: item.empName+'-'+res.empLevelMap[item.dutyId],
					innerName:item.empName,
					empId: item.empId,
					dutyId: item.dutyId,
					dutyType: res.empTypeMap[item.dutyId]
				});
				res.empMap[item.empId] = item.name;
                res.empDutyMap[item.empId] = item.dutyId;
			});
		}
        this.extraData = res;
        console.log(res);
    },
    getData: function (res) {
        var self = this;
        amGloble.loading.show();
        var parentShopId = amGloble.metadata.userInfo.parentShopId;
        amGloble.api.queryEmpTarget.exec(
            {
                shopId: this.meta.empTarget.shopId,
                parentShopId: parentShopId,
                empId: res.empId,
                targetYear: this.meta.targetYear,
                targetMonth: this.meta.targetMonth,
                dutyType: res.dutyType
            },
            function (ret) {
                console.log(ret);
                amGloble.loading.hide();
                if (ret.code == 0 && ret.message == "success") {
                    var data = ret.content;
                    $.extend(true, self.meta, data);
                    console.log(self.meta);
                    self.$wrap.data("cell", self.meta);
                    self.render(self.meta);
                } else {
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                }
            }
        );
    },
    render: function (data) { //显示与否要根据 targetTypes中的配置来进行渲染
        var self = this,
            empName = this.extraData.empMap[data.empTarget.empId],
            levelName = this.extraData.empLevelMap[
                this.extraData.empDutyMap[data.empTarget.empId]
            ],
            roleName = this.extraData.roleMap[this.extraData.empTypeMap[this.extraData.empDutyMap[data.empTarget.empId]]],
            empTargetConfig = {},
            opt = {};
        this.$header.find(".title").text( data.empTarget.targetYear +"年" + data.empTarget.targetMonth +"月" + empName +"目标设定" );
        this.$owner.find(".lf_pic").html(
                                            amGloble.photoManager.createImage( "artisan", { 
                                                parentShopId: amGloble.metadata.userInfo.parentShopId
                                            }, data.empTarget.empId + ".jpg","s" )
                                        )
            .end().find(".lf_info .info_name").text(empName)
            .end().find(".lf_info .info_level").text(levelName)
            .end().find(".emps_switch").data("emps", this.extraData.empList);
        var targets = data.empTarget.targets;
        if(data.empTarget.targetTypes){//根据配置
			empTargetConfig = data.empTarget.targetTypes;
		}
        this.$list.empty();
        $.each(targets, function (i, item) {
            if(empTargetConfig.indexOf(item.type)>-1){//配置了的数据就显示
                var $li = self.$li.clone().data("item", item);
                $li.find('.toal_tip').text(roleName+'已分配目标总计');
                var typeData = self.targetMap[item.type];
                $li.find(".tit_icon").addClass(typeData.icon)
                    .end().find(".tit_text").text(typeData.name);
                if (item.target) { //目标
                    $li.addClass("done").find(".item_input input").val( item.target );
                    var $tartgetText = $li.find(".cur_comparison");
                    self.switchText( $tartgetText, item.lastMonthTarget, item.lastYearTarget, item.target );
                } else {
                    var $tartgetText = $li.find(".cur_comparison").hide();
                    $li.removeClass("done");
                }
                if (data.shopTarget) { //员工目标在门店占比
                    var $itemStatus = $li.find(".item_status").show();
                    var config = self.calShopData( item.target, data.shopTarget, data.empTargetTotal, item.type );
                    $itemStatus.find(".cur_amount").text( self.toMoneyStyle(config.total) )
                        .end().find(".shop_goal").text( "门店目标" +( self.toMoneyStyle(config.shop) ) );
                    var chart = new ChartBar({
                        target: $itemStatus.find(".chart_thick"),
                        config: {
                            color0: "#173576"
                        },
                        datasets: [
                            {
                                color0: "#C0CEEC",
                                percent1: config.percent1,
                                percent2: config.percent2,
                                single: config.single,
                                tiptext: config.tiptext ? config.tiptext : "",
                                bgcolor: "#EEEEEE",
                                color0: "#C0CEEC",
                                color1: "#C0CEEC",
                                color2: "#C0CEEC",
                                color3: "#C0CEEC",
                                color4: "#A7BBE7"
                            }
                        ]
                    });
                    chart.animation();
                } else {
                    var $itemStatus = $li.find(".item_status").hide();
                }
                var $itemRefer = $li.find(".item_refer");
                var $preMonth = $itemRefer.find(".preMonth");
                var $preYear = $itemRefer.find(".preYear");
                if(!item.lastMonthAchi && !item.lastYearAchi ){
                    $itemRefer.hide();
                }else{
                    $itemRefer.show();
                }
                if (item.lastMonthAchi) {
                    //去年上月对比
                    var config = self.switchTip(
                        $preMonth.find(".line_tip"),
                        item.lastMonthAchi,
                        item.lastMonthTarget,
                        1
                    ); //上个月
                    var monChart = new ChartBar({
                        target: $preMonth.find(".chart_thin_mon"),
                        datasets: [
                            {
                                percent1: config.percent1,
                                percent2: config.percent2,
                                thin: true,
                                bgcolor: "#EEEEEE",
                                color0: "#EEEEEE",
                                color1: "#F2A957",
                                color2: "#F2A957",
                                color3: "#34D57E",
                                color4: "#23C16C",
                                single: config.single
                            }
                        ]
                    });
                    monChart.animation();
                } else {
                    $preMonth.hide();
                }
                if (item.lastYearAchi) {
                    var config1 = self.switchTip(
                        $preYear.find(".line_tip"),
                        item.lastYearAchi,
                        item.lastYearTarget,
                        2
                    ); //去年
                    var yearChart = new ChartBar({
                        target: $preYear.find(".chart_thin_mon"),
                        datasets: [
                            {
                                percent1: config1.percent1,
                                percent2: config1.percent2,
                                thin: true,
                                bgcolor: "#EEEEEE",
                                color0: "#EEEEEE",
                                color1: "#F2A957",
                                color2: "#F2A957",
                                color3: "#34D57E",
                                color4: "#23C16C",
                                single: config1.single
                            }
                        ]
                    });
                    yearChart.animation();
                } else {
                    $preYear.hide();
                }
                self.$list.append($li).data("empTarget", data.empTarget);
            }
        });
        this.itemListScroll.scrollTo('top');
        this.itemListScroll.refresh();
    },
    toMoneyStyle:function(money){
        return parseInt(new Number(money).toFixed(0)).toLocaleString();
    },
    switchText: function ($dom, lastMonth, lastYear, target) {
        //比较目标
        $dom.empty();
        if (!lastMonth && !lastYear) {
            $dom.hide();
            return;
        } else {
            $dom.show();
            if (lastMonth) {
                var rise = Math.round(target - lastMonth);
                var rate = Math.abs(Math.round(rise / lastMonth * 100));
                $dom.append(
                    "本月目标：" +
                    '<span class="compare_mon">' +
                    '<span class="text">较上月-</span>' +
                    '<span class="verbal">' +
                    (rise > 0 ? "增长" : "下降") +
                    rate +
                    "%</span>" +
                    "</span>"
                );
            }
            if (lastYear) {
                var rise1 = Math.round(target - lastYear);
                var rate1 = Math.abs(Math.round(rise1 / lastYear * 100));
                $dom.append(
                    "本月目标：" +
                    '<span class="compare_mon">' +
                    '<span class="text">较上年度-</span>' +
                    '<span class="verbal">' +
                    (rise1 > 0 ? "增长" : "下降") +
                    rate1 +
                    "%</span>" +
                    "</span>"
                );
            }
        }
    },
    switchTip: function ($dom, achi, target, type) {
        //type 1 月 2 年
        $dom.empty();
        var typeMap = {
            1: {
                name: "上月目标："
            },
            2: {
                name: "去年本月："
            }
        },
            config = {};
        if (!target) {
            $dom.append(
                '<span class="tip_lf">' +
                '<span class="target_text">' +
                typeMap[type].name +
                "</span>" +
                '<span class="target_num">' +
                this.toMoneyStyle(achi) +
                "</span>" +
                "</span>"
            );
            config.percent1 = 100;
            config.single = true;
        } else {
            var rate = Math.round(achi / target * 100);
            $dom.append(
                '<span class="tip_lf">' +
                '<span class="target_text">' +
                typeMap[type].name +
                "</span>" +
                '<span class="target_num">' +
                this.toMoneyStyle(achi) +
                "/" +
                this.toMoneyStyle(target) +
                "</span>" +
                "</span>" +
                '<span class="tip_rt">' +
                '<span class="completion_text">完成度</span>' +
                '<span class="completion_num">' +
                rate + '%' +
                "</span>" +
                "</span>"
            );
            if (achi > target) {
                config.percent1 = Math.round(target / achi * 100);
                config.percent2 = 100;
            } else {
                config.percent1 = 100;
                config.percent2 = Math.round(achi / target * 100);
            }
        }
        console.log(config);
        return config;
    },
    calShopData: function (target, shopTarget, empTargetTotal, type) {
        console.log(target, shopTarget, empTargetTotal);
        var config = {},dataMap={};
        if(empTargetTotal){
            dataMap = {
                1: {
                    total: empTargetTotal.CASHACHITARGETTOTAL,
                    shopTarget: shopTarget.cashAchiTarget
                },
                2: {
                    total: empTargetTotal.WORKACHITARGETTOTAL,
                    shopTarget: shopTarget.workAchiTarget
                }
            },
            total = dataMap[type].total,
            shop = dataMap[type].shopTarget,
            percent1 = Math.round(
                (total-target) /shop * 100
            ),
            percent2 = Math.round(
                total /shop * 100
            ),
            proportion = Math.round(
                target / total * 100
            );
            if (target && percent1 < 100 && percent2 <= 100 ) {
                config.percent1 = percent1;
                config.percent2 = percent2;
                config.tiptext = "占比" + proportion + "%";
            } else {
                if( percent1 >= 100 || percent2 >= 100){
                    percent1 = 100;
                }
                config.percent1 = percent1;
                config.single = true;
                config.tiptext = '';
            }
            config.total = total;
            config.shop = shop;
        }else{
            dataMap = {
                1: {
                    shopTarget: shopTarget.cashAchiTarget
                },
                2: {
                    shopTarget: shopTarget.workAchiTarget
                }
            },
            config.total = 0;
            config.shop = dataMap[type].shopTarget;
            config.percent1 = 0;
            percent2 = Math.round(
                target/config.shop * 100
            ),
            proportion = Math.round(
                target /config.shop * 100
            );
            if( percent2 > 100 ){
                percent2 = 100;
            }
            if(target){
                config.percent2 = percent2;
                config.tiptext = "占比" + proportion + "%";
            }else{
                config.single = true;
            }
        }
        return config;
    },
    calPercentArr: function (p1, p2) {
        var resultArr = [];
        if (p1 > p2) {
            resultArr.push((p2 / p1 * 100).toFixed(0));
            resultArr.push(100);
        } else {
            resultArr.push(100);
            resultArr.push((p1 / p2 * 100).toFixed(0));
        }
        return resultArr;
    },
    checkAllInput: function () {
        var flag = true;
        var $inputs = this.$list.find("input");
        $inputs.each(function (i, item) {
            if (!$(item).val() || parseFloat($(item).val()) == 0) {
                flag = false;
            }
        });
        if (!flag) {
            this.$.find(".save_btn").addClass("disabled");
        } else {
            this.$.find(".save_btn").removeClass("disabled");
        }
    },
    saveData: function () {
        var self = this;
        amGloble.loading.show();
        amGloble.api.saveEmpTarget.exec(
            {
                id: this.meta.empTarget.id,
                empId: this.meta.empTarget.empId,
                shopId: this.meta.empTarget.shopId,
                parentShopId: this.meta.empTarget.parentShopId,
                targetYear: this.meta.empTarget.targetYear,
                targetMonth: this.meta.empTarget.targetMonth,
                cashAchiTarget: this.meta.empTarget.targets[0].target,
                workAchiTarget: this.meta.empTarget.targets[1].target,
                operatorId: amGloble.metadata.userInfo.userId
            },
            function (ret) {
                console.log(ret);
                amGloble.loading.hide();
                if (ret.code == 0 && ret.message == "success") {
                    self.jumpBack(self.meta);
                } else {
                    amGloble.msg(ret.message || "数据获取失败,请重试!");
                }
            }
        );
    },
    jumpBack: function (data) {
        $.am.changePage(amGloble.page.empGoalCheck, "slideright", data);
    }
});

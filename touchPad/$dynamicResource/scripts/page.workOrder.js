(function () {
    var self = (am.page.workOrder = new $.am.Page({
        id: "page_workOrder",
        backButtonOnclick: function () {
            am.goBackToInitPage();
            am.page.login.getWorkTip(am.metadata.userInfo,0);
        },
        init: function () {
            var self = this;
            this.$ = $("#page_workOrder");
            this.json = null;
            this.phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
            this.table = new $.am.ScrollView({
                $wrap: this.$.find(".table-content"),
                $inner: this.$.find(".table-content table"),
                direction: [false, true],
                hasInput: false
            });
            this.table.refresh();
            this.$.find(".qq-btn").vclick(function (e) {
                e.stopPropagation();
                try {
                    if (wPlugin && wPlugin.openTencent) {
                        wPlugin.openTencent("800800967");
                        return;
                    }
                } catch (e) {
                    console.log(e);
                    if ($("html").hasClass("android") || $("html").hasClass("ios")) {
                        try {
                            var $text = $(this).find("input");
                            $text.select();
                            $text[0].setSelectionRange(0, $text[0].value.length);
                            document.execCommand("copy");
                            am.qqModal.show();
                        } catch (e) {
                            am.msg("客服QQ号复制失败");
                            $.am.debug.log(e.message);
                        }
                    } else {
                        window.open("http://crm2.qq.com/page/portalpage/wpa.php?uin=800800967&f=1&ty=1&aty=0&a=&from=5", "_system", "location=yes");
                    }
                }
            });
            this.$.find(".complain-btn").vclick(function () {
                //window.open("http://form.mikecrm.com/f.php?t=J9ldR5&from=singlemessage&isappinstalled=0", "_blank", "location=yes");
                $.am.changePage(am.page.complain, "slideup");
            });
            this.$
                .find("table")
                .on("vclick", ".listTr", function () {
                    var id = $(this).data("id");
                    am.workOrderDetail.show(id);
                })
                .on("vclick", ".icon-fuzhi", function (e) {
                    e.stopPropagation();
                    try {
                        var $text = $(this).siblings("input");
                        $text.select();
                        $text[0].setSelectionRange(0, $text[0].value.length);
                        document.execCommand("copy");
                        am.msg("工单号复制成功");
                    } catch (e) {
                        am.msg("工单号复制失败");
                        $.am.debug.log(e.message);
                    }
                });
            this.$.find(".description").keyup(function () {
                var phoneNumber = self.$.find(".phoneNumber").val();
                var description = $(this).val();
                if (!self.phoneReg.test(self.$.find(".phoneNumber").val())) {
                    return false;
                }
                if (!am.isNull(phoneNumber) && !am.isNull(description) && phoneNumber.length == 11) {
                    self.$.find(".submit-btn").addClass("active");
                } else {
                    self.$.find(".submit-btn").removeClass("active");
                }
            });
            this.$.find(".phoneNumber").vclick(function () {
                var description = self.$.find(".description").val();
                am.keyboard.show({
                    title: "请输入数字", //可不传
                    hidedot: true,
                    submit: function (value) {
                        if (value.toString().length > 11) {
                            value = value.substring(0, 11);
                        }
                        self.$.find(".phoneNumber").val(value.replace(/[\s\r\n\D\\\/\'\"\‘\’\“\”]/g, ""));
                        var len = self.$.find(".phoneNumber").val().length;
                        if (!self.phoneReg.test(self.$.find(".phoneNumber").val())) {
                            am.msg("请输入有效的手机号码");
                            return false;
                        }
                        if (len == 11 && !am.isNull(description)) {
                            self.$.find(".submit-btn").addClass("active");
                        } else {
                            self.$.find(".submit-btn").removeClass("active");
                        }
                    },
                    hidecb: function () {}
                });
            });
            self.$.find(".submit-btn").vclick(function () {
                if(am.isNull(self.$.find(".first_category").val())){
                    am.msg("请选择归属板块");
                    return false;
                }
                if ($(this).hasClass("active")) {
                    self.submit();
                }
            });
            // 清空未处理投诉单数量
            $('#suenum').hide();
        },
        beforeShow: function () {
            self.$.find(".phoneNumber,.description").val("");
            self.$.find(".table-content").hide();
            self.$.find(".table-empty").show();
            this.getCategory();
        },
        beforeHide: function () {},
        afterShow: function (data) {
            this.getData(this.json, data);
            this.getSueNum();
            this.table.refresh();
        },
        afterHide: function () {},
        getTd: function (v, json) {
            var self = this,
                tr = "";
            $.each(v, function (i, d) {
                var first_category = d.first_category >= 0 ? json[d.first_category].name : "";
                var noevaluate = d.status == 2 ? "noevaluate" : "";
                tr += "<tr class='listTr am-clickable' data-id='" + d.id + "'><td class='phoneNumber'><input type='text' readonly='readonly' value='" + d.id + "'><i class='am-clickable iconfont icon-fuzhi'></i></td>";
                tr += "<td>" + (d.description || "") + "</td>";
                tr += "<td>" + first_category + "</td>";
                tr += "<td>" + self.formatDate(d.createTime) + "</td>";
                tr += "<td>" + (d.submiterName || "") + "</td>";
                tr += "<td>" + self.getStatus(d.status, d.remindSubmiter) + "</td>";
                tr += "<td>" + (d.operaterName || "") + "</td>";
                tr += "<td class='" + noevaluate + "'>" + self.getEvaluate(d.evaluate, d.status) + "</td></tr>";
            });
            return tr;
        },
        getCategory: function () {
            this.json = [{
                    "name": "小掌柜",
                    "second_categorys": [
                        "登录",
                        "预约",
                        "开单",
                        "项目收银",
                        "卖品收银",
                        "挂单",
                        "轮牌",
                        "开卡充值",
                        "套餐",
                        "搜索会员",
                        "会员详情",
                        "顾客",
                        "流水",
                        "库存",
                        "小计",
                        "收款",
                        "商城验券",
                        "其他"
                    ]
                },
                {
                    "name": "报表类",
                    "second_categorys": [
                        "财务-门店营收汇总",
                        "财务-收款",
                        "财务-员工工资管理",
                        "财务-支出收入汇总",
                        "财务-日常开支统计",
                        "财务-损益表",
                        "财务-现金流水账",
                        "财务-跨店消费对账",
                        "财务-卡金变动流水",
                        "财务-交班记录",
                        "财务-自助充值",
                        "统计-店内业绩统计",
                        "统计-员工业绩统计",
                        "统计-项目分类统计",
                        "统计-卡储值消费统计",
                        "统计-套餐统计",
                        "统计-顾客分析",
                        "其他"
                    ]
                },
                {
                    "name": "收银台",
                    "second_categorys": [
                        "收银",
                        "轮牌",
                        "无纸化",
                        "预约",
                        "开支",
                        "营业记录",
                        "营业汇总",
                        "会员管理",
                        "库存管理",
                        "考勤",
                        "其他"
                    ]
                },
                {
                    "name": "配置",
                    "second_categorys": [
                        "服务项目设置",
                        "会员卡设置",
                        "基础分类设置",
                        "工资方案配置",
                        "自定义配置"
                    ]
                },
                {
                    "name": "美一客",
                    "second_categorys": [
                        "登录",
                        "推送",
                        "预约",
                        "作品",
                        "首页",
                        "商城",
                        "我的"
                    ]
                },
                {
                    "name": "美管家APP",
                    "second_categorys": [
                        "登录",
                        "推送",
                        "预约",
                        "轮牌",
                        "作品",
                        "代办事项",
                        "服务",
                        "考勤",
                        "排行榜",
                        "数据",
                        "商城",
                        "推广收益",
                        "打赏",
                        "营销",
                        "财务优化",
                        "代收代付",
                        "短信充值",
                        "其他"
                    ]
                },
                {
                    "name": "其他",
                    "second_categorys": [
                        "其他"
                    ]
                }
            ]
        },
        getStatus: function (d, remindSubmiter) {
            var status = "";
            switch (d) {
                case 0:
                    status = "<span style='color:#e82742'>未接单</span>";
                    break;
                case 1:
                    status = "<span style='color:#f09c08'>处理中</span>";
                    break;
                case 2:
                    status = "已结单";
                    break;
                case 3:
                    status = "已结单";
                    // status = "已评价";
                    break;
                case 4:
                    status = "关闭";
                    break;
            }
            if (d == 1 && remindSubmiter) {
                status = "<span style='color:#00b7ee'>可结单</span>";
            }
            return status;
        },
        getEvaluate: function (d, r) {
            var status = "";
            switch (d) {
                case 0:
                    status = "<span class='iconfont icon-haoping' style='color:#ffbd3e;'></span>";
                    break;
                case 1:
                    status = "<span class='iconfont icon-zhongping' style='color:#ffbd3e;'></span>";
                    break;
                case 2:
                    status = "<span class='iconfont icon-chaping1' style='color:#e82742;'></span>";
                    break;
            }
            if (r == 2) {
                status = "<span style='color:#e82742'>未评价</span>";
            }
            return status;
        },
        formatDate: function (time) {
            if (!time) {
                return "";
            }
            return new Date(time).format("HH:MM") + "</br>" + new Date(time).format("yyyy-mm-dd");
        },
        getData: function (json, data) {
            var self = this;
            am.loading.show("正在获取,请稍候...");
            var opt = {
                submiterId: am.metadata.userInfo.userId
            };
            am.api.workQuery.exec(opt, function (res) {
                am.loading.hide();
                if (res.code == 0 && !am.isNull(res.content)) {
                    self.$.find(".table-content").show();
                    self.$.find(".table-empty").hide();
                    self.$.find("tbody").html(self.getTd(res.content, json));
                    if (data && data.detail == "1") {
                        if (self.$.find("tbody tr").find(".noevaluate").length == 1) {
                            var id = self.$
                                .find("tbody tr")
                                .find(".noevaluate")
                                .parent("tr")
                                .find(".phoneNumber input")
                                .val();
                            id && am.workOrderDetail.show(id);
                        }
                    }
                } else {
                    self.$.find(".table-content").hide();
                    self.$.find(".table-empty").show();
                }
                self.table.refresh();
                self.table.scrollTo("top");
            });
        },
        submit: function (d) {
            var self = this;
            am.loading.show("正在提交,请稍候...");
            var opt = {
                phoneNumber: self.$.find(".phoneNumber").val(),
                description: self.$.find(".description").val(),
                submiterId: am.metadata.userInfo.userId,
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId,
                feedbackChannel: 0,//0 小掌柜   1 收银台
                first_category:self.$.find(".first_category").val(),//0 小掌柜   2 收银台  6 其他
                // createTime: new Date().getTime()
            };
            am.api.workCreate.exec(opt, function (res) {
                am.loading.hide();
                if (res.code == 0) {
                    self.$.find(".phoneNumber,.description,.first_category").val("");
                    self.$.find(".submit-btn").removeClass("active");
                    am.msg("您已成功提交");
                    self.getData(self.json);
                } else {
                    am.msg(res.message || "提交失败，请稍后再试!~");
                }
            });
        },
        getSueNum: function(){
            am.loading.show("正在获取,请稍候...");
            var opt = {
                sueid: am.metadata.userInfo.userId,
            };
            am.api.sueCount.exec(opt,function (res) {
                am.loading.hide();
                if(res.code == 0 && !am.isNull(res.content) && Number(res.content) > 0){
                    $('#suenum').text(res.content).show();
                }
            });
        }
    }));
})();
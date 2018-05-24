(function() {
    var self = (am.page.workOrder = new $.am.Page({
        id: "page_workOrder",
        backButtonOnclick: function() {
            am.goBackToInitPage();
            self.getWorkTipCount(am.metadata.userInfo.userId);
        },
        init: function() {
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
            this.$.find(".qq-btn").vclick(function(e) {
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
            this.$.find(".complain-btn").vclick(function() {
                window.open("http://form.mikecrm.com/f.php?t=J9ldR5&from=singlemessage&isappinstalled=0", "_blank", "location=yes");
            });
            this.$.find("table")
                .on("vclick", ".listTr", function() {
                    var id = $(this).data("id");
                    am.workOrderDetail.show(id);
                })
                .on("vclick", ".icon-fuzhi", function(e) {
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
            this.$.find(".description").keyup(function() {
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
            this.$.find(".phoneNumber").vclick(function() {
                var description = self.$.find(".description").val();
                am.keyboard.show({
                    title: "请输入数字", //可不传
                    hidedot: true,
                    submit: function(value) {
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
                    hidecb: function() {}
                });
            });
            self.$.find(".submit-btn").vclick(function() {
                if ($(this).hasClass("active")) {
                    self.submit();
                }
            });
        },
        getWorkTipCount: function(userId) {
            var self = this;
            am.loading.show("正在获取,请稍候...");
            var opt = { submiterId: userId };
            am.api.workTipCount.exec(opt, function(res) {
                am.loading.hide();
                if (res.code == 0) {
                    if (am.isNull(res.content)) {
                        $("#tab_main .logo").html("");
                        return;
                    }
                    var count = "";
                    if (res.content.COUNT_1 == 0) {
                        count = "<div class='num act bounceIn'></div>";
                        if (res.content.COUNT_2 == 0) {
                            count = "";
                        }
                    } else {
                        count = "<div class='num bounceIn'>" + res.content.COUNT_1 + "</div>";
                    }
                    $("#tab_main .logo").html(count);
                } else {
                    am.msg(res.msg || "哎呀出错啦");
                }
            });
        },
        beforeShow: function() {
            self.$.find(".phoneNumber,.description").val("");
            self.$.find(".table-content").hide();
            self.$.find(".table-empty").show();
            this.getCategory();
            this.table.refresh();
        },
        beforeHide: function() {},
        afterShow: function() {
            this.getData(this.json);
            this.table.refresh();
        },
        afterHide: function() {},
        getTd: function(v, json) {
            var self = this,
                tr = "";
            $.each(v, function(i, d) {
                var first_category = d.first_category >= 0 ? json[d.first_category].name : "";
                tr += "<tr class='listTr am-clickable' data-id='" + d.id + "'><td class='phoneNumber'><input type='text' readonly='readonly' value='" + d.id + "'><i class='am-clickable iconfont icon-fuzhi'></i></td>";
                tr += "<td>" + (d.description || "") + "</td>";
                tr += "<td>" + first_category + "</td>";
                tr += "<td>" + self.formatDate(d.createTime) + "</td>";
                tr += "<td>" + (d.submiterName || "") + "</td>";
                tr += "<td>" + self.getStatus(d.status) + "</td>";
                tr += "<td>" + (d.operaterName || "") + "</td>";
                tr += "<td>" + self.getEvaluate(d.evaluate) + "</td></tr>";
            });
            return tr;
        },
        getCategory: function() {
            var self = this;
            $.ajax({
                type: "get",
                url: "$dynamicResource/scripts/workOrder.category.json",
                data: {},
                dataType: "json",
                success: function(res) {
                    self.json = res;
                },
                error: function(error) {
                    console.log(error);
                }
            });
        },
        getStatus: function(d) {
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
                    status = "已评价";
                    break;
                case 4:
                    status = "关闭";
                    break;
            }
            return status;
        },
        getEvaluate: function(d) {
            var status = "";
            switch (d) {
                case 0:
                    status = "好评";
                    break;
                case 1:
                    status = "中评";
                    break;
                case 2:
                    status = "<span style='color:#e82742'>差评</span>";
                    break;
            }
            return status;
        },
        formatDate: function(time) {
            if (!time) {
                return "";
            }
            return new Date(time).format("HH:MM") + "</br>" + new Date(time).format("yyyy-mm-dd");
        },
        getData: function(json) {
            var self = this;
            am.loading.show("正在获取,请稍候...");
            var opt = { submiterId: am.metadata.userInfo.userId };
            am.api.workQuery.exec(opt, function(res) {
                am.loading.hide();
                if (res.code == 0 && !am.isNull(res.content)) {
                    self.$.find(".table-content").show();
                    self.$.find(".table-empty").hide();
                    self.$.find("tbody").html(self.getTd(res.content, json));
                } else {
                    self.$.find(".table-content").hide();
                    self.$.find(".table-empty").show();
                }
                self.table.refresh();
                self.table.scrollTo("top");
            });
        },
        submit: function(d) {
            var self = this;
            am.loading.show("正在提交,请稍候...");
            var opt = {
                phoneNumber: self.$.find(".phoneNumber").val(),
                description: self.$.find(".description").val(),
                submiterId: am.metadata.userInfo.userId,
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId
                // createTime: new Date().getTime()
            };
            am.api.workCreate.exec(opt, function(res) {
                am.loading.hide();
                if (res.code == 0) {
                    self.$.find(".phoneNumber,.description").val("");
                    self.$.find(".submit-btn").removeClass("active");
                    am.msg("您已成功提交");
                    self.getData(self.json);
                } else {
                    am.msg(res.message || "提交失败，请稍后再试!~");
                }
            });
        }
    }));
})();

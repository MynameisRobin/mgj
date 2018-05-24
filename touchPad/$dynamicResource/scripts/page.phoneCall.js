(function() {
    // var self = (am.page.phoneCall = new $.am.Page({
    am.phoneCall = {
        id: "page_phoneCall",
        backButtonOnclick: function() {
            // am.goBackToInitPage();
            this.$.hide();
        },
        init: function() {
            var self = this;
            this.$ = $("#page_phoneCall");
            // this.selectScroll = new $.am.ScrollView({
            //   $wrap: this.$.find(".select"),
            //   $inner: this.$.find(".select ul"),
            //   direction: [false, true],
            //   hasInput: false
            // });
            this.cardScroll = new $.am.ScrollView({
                $wrap: this.$.find(".comboBox .cardBox"),
                $inner: this.$.find(".comboBox .cardBox .inner"),
                direction: [false, true],
                hasInput: false
            });
            this.comboScroll = new $.am.ScrollView({
                $wrap: this.$.find(".comboBox .combobox"),
                $inner: this.$.find(".comboBox .combobox .inner"),
                direction: [false, true],
                hasInput: false
            });
            this.cardScroll.refresh();
            this.comboScroll.refresh();
            this.$.find(".btn").vclick(function() {
                var type = $(this).data("type");
                var cid = self.$.find(".leftUl li.active").attr("cid");
                var memberid = self.$.find(".leftUl li.active").attr("memberid");
                var mobile = self.$.find(".mobile").text();
                // var len = self.$.find(".leftUl li").length;
                if (type == 1) {
                    // 散客
                    var data = { phoneCall: mobile, type: 1 };
                    if ($.am.getActivePage().id == "page_appointment") {
                        self.backButtonOnclick();
                        am.page.appointment.beforeShow({ data: data });
                    } else {
                        self.backButtonOnclick();
                        $.am.changePage(am.page.appointment, "slideup", { data });
                    }
                    $("#page_appointment")
                        .find(".new")
                        .trigger("vclick");
                } else {
                    if (self.$.find(".leftUl li.active").length < 1) {
                        return am.msg("请选择一张会员卡");
                    }
                    am.searchMember.getMemberById(memberid, cid, function(card) {
                        var data = { phoneCall: card };
                        if ($.am.getActivePage().id == "page_appointment") {
                            self.backButtonOnclick();
                            am.page.appointment.beforeShow({ data: data });
                        } else {
                            self.backButtonOnclick();
                            $.am.changePage(am.page.appointment, "slideup", { data });
                        }
                    });
                }
            });
            this.$.find(".leftUl").on("vclick", "li", function() {
                $(this)
                    .addClass("active")
                    .siblings()
                    .removeClass("active");
            });
            this.$.find(".select ul").on("vclick", "li", function() {
                var id = $(this).data("id");
                self.$.find(".vip-select").hide();
                self.$.find(".vip-info").show();
                self.getDetailData({
                    memberid: id,
                    shopId: am.metadata.userInfo.shopId,
                    parentShopId: am.metadata.userInfo.parentShopId
                });
            });
            this.$.find(".close").vclick(function() {
                self.backButtonOnclick();
            });
        },
        beforeShow: function(callerNumber) {
            this.callerNumber = callerNumber;
            if (!this.flag) {
                this.init();
                this.flag = true;
            }
            this.$.show();
            this.cardScroll.refresh();
            this.comboScroll.refresh();
        },
        // 清空并重置
        resetDom: function() {
            var self = this;
            self.$.find(".header,.mobile,.page,.leftUl,.rightUl").html("");
            self.$.find(".name").html("非会员用户");
            self.$.find(".default").show();
            self.$.find(".vip-select,.vip-info").hide();
            this.cardScroll.refresh();
            this.comboScroll.refresh();
        },
        // 获取会员卡dom
        getCardBoxDom: function(d) {
            var li = "";
            //到期日
            if (d.invaliddate) {
                var _str = new Date(d.invaliddate - 0).format("yyyy.mm.dd");
            } else {
                var _str = "无";
            }
            if (d.cardtype == "1") {
                if (d.timeflag == "2") {
                    li += '<li class="am-clickable type_zero" cid="' + d.id + '" memberid="' + d.memberid + '">';
                } else {
                    li += '<li class="am-clickable type_one" cid="' + d.id + '" memberid="' + d.memberid + '">';
                }
            } else {
                li += '<li class="am-clickable type_two" cid="' + d.id + '" memberid="' + d.memberid + '">';
            }
            li += '<div class="card_base_info">';
            li += '<div class="info_left">';
            li += '<div class="card_name">' + (d.cardtypename || "") + "</div>";
            li += '<div class="card_no">' + (d.cardid || "") + "</div>";
            li += "</div>";
            li += '<div class="info_right">';
            li += '<div class="card_fee">';
            li += '<div class="fee_num">￥' + (d.cardfee || 0) + "</div>";
            li += '<div class="fee_name">余额</div>';
            li += "</div>";
            li += '<div class="card_present">';
            li += '<div class="fee_num">￥' + (d.presentfee || 0) + "</div>";
            li += '<div class="fee_name">赠送金</div>';
            li += "</div>";
            li += '<div class="nofee">现金消费卡</div>';
            li += "</div>";
            li += "</div>";
            li += '<div class="duedatewrap">';
            li += '<span class="duedate">到期日：' + _str + "</span>";
            li += '<div class="clear"></div>';
            li += "</div>";
            li += '<div class="line" />';
            li += '<div class="free">';
            li += '<div class="remarkWrap">';
            li += '<div class="remarkWrap">';
            li += '<div class="remarkCon">备注:';
            li += '<span class="text">' + (d.cardRemark || "") + "</span>";
            li += "</div>";
            li += "</div>";
            li += "</div>";
            li += "</div>";
            li += "</li>";
            return li;
        },
        //获取右侧洗剪吹次数DOM
        getRightComboDom: function(d) {
            var sumtimes = d.sumtimes == -99 ? "不限" : d.sumtimes;
            var validdate = d.validdate ? "到期日：" + this.getTime(d.validdate) : "不限期";
            if (d.isNewTreatment && d.timesItemNOs) {
                d.itemname = am.page.comboCard.getItemNamesByNos(d.timesItemNOs).join(",");
            }
            var li = "";
            li += "<li>";
            li += '<div class="left">';
            li += '<span class="key">';
            if (d.treattype == 1) {
                li += '<strong class="highlight">[赠] </strong>';
            }
            li += '<span class="combo_tit">' + (d.itemname || "") + "</span>（" + (sumtimes || 0) + "次）</span>";
            li += '<span class="value">';
            li += '<span class="duedate">' + validdate + "</span>";
            li += "</span>";
            li += "</div>";
            li += '<div class="right">';
            li += '<canvas width="224" height="224"></canvas>';
            li += "</div>";
            li += "</li>";
            return li;
        },
        getData: function(data, value) {
            var self = this;
            self.resetDom();
            am.loading.show("正在获取,请稍候...");
            var opt = {
                shopId: am.metadata.userInfo.shopId,
                pageNumber: 0,
                pageSize: 9999,
                deleted: 0, //0为资料 1为已删
                keyword: value,
                searchType: "0"
            };
            if (data) $.extend(opt, data);
            am.api.memberList.exec(opt, function(res) {
                am.loading.hide();
                if (res.code == 0) {
                    if (res.content == "") {
                        self.$.find(".btn").data({
                            type: 1
                        });
                        self.$.find(".mobile").html(value);
                        self.$.find(".default").show();
                        self.$.find(".page,.vip-info").hide();
                        return;
                    }
                    // 填充左侧内容
                    self.$.find(".header").html(
                        am.photoManager.createImage(
                            "customer",
                            {
                                parentShopId: am.metadata.userInfo.parentShopId,
                                updateTs: new Date().getTime()
                            },
                            res.content[0].id + ".jpg",
                            "s"
                        )
                    );
                    $.each(res.content[0], function(i, v) {
                        self.$.find("." + i).text(v);
                    });
                    // 右侧内容
                    if (res.count == 1) {
                        self.$.find(".btn").data({
                            type: 2
                        });
                        self.$.find(".vip-info").show();
                        self.$.find(".default,.vip-select").hide();
                        self.getDetailData({
                            memberid: res.content[0].id,
                            shopId: am.metadata.userInfo.shopId,
                            parentShopId: am.metadata.userInfo.parentShopId
                        });
                    } else if (res.count > 1) {
                        self.$.find(".btn").data({
                            type: 3
                        });
                        self.$.find(".vip-select").show();
                        self.$.find(".default,.vip-info").hide();
                        var li = "";
                        $.each(res.content, function(q, r) {
                            li += "<li class='am-clickable' data-id='" + r.id + "'>" + r.name + "</li>";
                        });
                        self.$.find(".select ul").html(li);
                    }
                } else {
                    am.msg(res.message || "数据获取失败,请检查网络!");
                }
                self.cardScroll.refresh();
                self.comboScroll.refresh();
            });
        },
        // 详情
        getDetailData: function(d) {
            var self = this;
            self.$.find(".cardBox .leftUl,.combobox .rightUl").html("");
            am.loading.show("正在获取数据,请稍候...");
            am.api.memberDetails.exec(d, function(res) {
                am.loading.hide();
                if (res.code == 0) {
                    var treatMentItems = res.content.memberInfo.treatMentItems;
                    $.each(res.content.cards, function(i, v) {
                        self.$.find(".cardBox .leftUl").append(self.getCardBoxDom(v));
                    });
                    // 填充左侧内容
                    self.$.find(".header").html(
                        am.photoManager.createImage(
                            "customer",
                            {
                                parentShopId: am.metadata.userInfo.parentShopId,
                                updateTs: new Date().getTime()
                            },
                            res.content.memberInfo.id + ".jpg",
                            "s"
                        )
                    );
                    $.each(res.content.memberInfo, function(i, v) {
                        self.$.find("." + i).text(v);
                    });
                    if (!am.isNull(treatMentItems)) {
                        $.each(treatMentItems, function(q, r) {
                            self.$.find(".combobox .rightUl").append(self.getRightComboDom(r));
                        });
                        self.renderCircle(treatMentItems);
                    }
                    self.cardScroll.refresh();
                    self.comboScroll.refresh();
                } else {
                    am.msg(res.message || "数据获取失败,请检查网络!");
                }
            });
        },
        getTime: function(time) {
            if (!time) {
                return "无";
            }
            try {
                var date = new Date(time);
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                return year + "." + month + "." + day;
            } catch (e) {}
        },
        drawCircel: function(ctx, x, y, r, sAngle, eAngle, color, words, flag) {
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = color ? color : "#eeeeee";
            ctx.arc(x, y, r, sAngle, eAngle);
            ctx.stroke();

            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.font = "10px 华文细黑";
            ctx.fillStyle = "#999";
            ctx.fillText("剩余", 70, 68);
            ctx.stroke();

            ctx.beginPath();
            ctx.textAlign = "center";
            ctx.font = "13px Helvetica";
            ctx.fillStyle = "#222222";
            ctx.fillText(words ? words + "次" : "", 70, 55);
            ctx.stroke();
        },
        // 环形进度条
        renderCircle: function(data, flag) {
            var self = this;
            var canvas = self.$.find(".combobox .rightUl canvas");
            var num = [];
            for (var j = 0; j < data.length; j++) {
                if (data[j].leavetimes && data[j].sumtimes) {
                    num.push(data[j].leavetimes / data[j].sumtimes);
                }
            }
            for (var i = 0; i < canvas.length; i++) {
                var ctx = canvas[i].getContext("2d");
                !flag && ctx.scale(2, 2);
                ctx.clearRect(0, 0, 112, 112);
                (function(ctx, idx, self, words) {
                    if (!words) {
                        return;
                    }
                    var j = 0;
                    var timer = setInterval(function() {
                        ctx.clearRect(0, 0, 112, 112);
                        self.drawCircel(ctx, 70, 56, 25, 0, 2 * Math.PI);
                        j++;
                        self.drawCircel(ctx, 70, 56, 25, -(30 * 2 / 360) * Math.PI, 2 * Math.PI * (num[idx] / 10 * j), "#625593", words);
                        if (j >= 10) {
                            clearInterval(timer);
                        }
                    }, 50);
                })(ctx, i, this, data[i].leavetimes == -99 ? "不限" : data[i].leavetimes);
            }
        },
        beforeHide: function(paras) {},
        // 完全进来后
        afterShow: function(paras) {
            this.cardScroll.refresh();
            this.comboScroll.refresh();
        },
        // 完全退出之后
        afterHide: function() {},
        updateData: function(memberInfo) {},
        render: function() {}
    };
})();

(function() {
    window.usbPhoneCallIn = function(callerNumber) {
        // $.am.changePage(am.page.phoneCall, "slideup", {});
        console.log("调用电话宝容器方法");
        am.phoneCall.beforeShow(callerNumber);
        am.phoneCall.getData({}, callerNumber);
    };
})();

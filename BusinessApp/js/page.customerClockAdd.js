(function() {
    amGloble.page.customerClockAdd = new $.am.Page({

        id: "page_customerClockAdd",
        backButtonOnclick: function() {
            $.am.page.back("slidedown");
        },
        init: function() {
            var self = this;
            this.$back = this.$header.find(".left").vclick(function() {
                self.backButtonOnclick();
            });
            this.$text = this.$.find("#custClockText");
            this.$days = this.$.find("#custClockDays");
            this.$save = this.$header.find(".right").vclick(function() {
                self.save();
            });
        },
        beforeShow: function(paras) {
            this.data = paras;
            this.resetUI();
        },
        afterShow: function() {
            //处理点穿的问题
            this.$text.prop("disabled", false);
            this.$days.prop("disabled", false);
        },
        beforeHide: function() {
            this.$text.prop("disabled", true);
            this.$days.prop("disabled", true);
        },
        resetUI: function() {
            this.$text.val("");
            this.$days.val("");
        },
        save: function() {
            var self = this;
            var title = $.trim(this.$text.val());
            var days = $.trim(this.$days.val()) * 1;
            if (!title.length) {
                amGloble.msg("请输入闹钟标题！");
                return;
            }
            if (!days || isNaN(days) || days < 1) {
                amGloble.msg("请输入正确的提醒时间！（1-99999天）");
                return;
            }
            amGloble.loading.show();

            var user = amGloble.metadata.userInfo;
            var cust = this.data;
            amGloble.api.clockAdd.exec({
                "customerId": cust.id,
                "title": title,
                "days": days,
                "shopId": user.shopId,
                "operator": user.userId,
                "customerName": cust.name,
                "gender": cust.gender,
                "mobile": cust.phone
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    amGloble.msg("添加成功");
                    $.am.page.back("slidedown");

                    //将客户档案页码消0
                    cust.clockCount++;
                    amGloble.page.customerDetail.custClock.pageIndex = 0;
                    amGloble.page.customerDetail.custClock.$list.empty();
                    amGloble.page.customerDetail.tab.$inner.find("li:eq(5)").trigger("vclick").find("div.num").text(cust.clockCount);
                    amGloble.page.customerDetail.custClock.$title.text("共有" + cust.clockCount + "个客户闹钟");

                } else {
                    amGloble.msg(ret.message || "提交失败");

                }
            });
        }
    });
})();

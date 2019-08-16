(function() {
    var self = (am.page.evaluate = new $.am.Page({
        id: "page_evaluate",
        backButtonOnclick: function() {
            am.goBackToInitPage();
            am.page.login.getWorkTip(am.metadata.userInfo,0);
        },
        init: function() {
            var self = this;
            this.$.find(".yawp li").vclick(function() {
                self.$.find(".yawp li").removeClass("active");
                $(this).addClass("active");
            });
            this.$.find(".btn,.close").vclick(function() {
                self.backButtonOnclick();
            });
            this.$.find(".confirmBtn").vclick(function() {
                var evaluate_info = self.$.find(".yawp li.active span").text();
                var evaluate_info_id = self.$.find(".yawp li.active").data("type");
                if (evaluate_info == "其他") {
                    evaluate_info = self.$.find(".yawp li.active textarea").val();
                }
                self.update({
                    id: self.data.id,
                    status: 3,
                    evaluate: 2,
                    evaluate_info: evaluate_info,
                    evaluate_info_id: evaluate_info_id
                });
            });
            this.$.find(".warp li").vclick(function() {
                var type = $(this).data("type");
                $(this)
                    .addClass("active")
                    .siblings()
                    .removeClass("active");
                if (type == 2) {
                    self.$.find(".btn").hide();
                    self.$.find(".yawp").show();
                } else {
                    self.$.find(".yawp").hide();
                    self.$.find(".btn").show();
                    self.update({
                        id: self.data.id,
                        status: 3,
                        evaluate: type
                    });
                }
            });
        },
        update: function(opt) {
            var self = this;
            am.loading.show("请稍候...");
            am.api.workUpdate.exec(opt, function(res) {
                am.loading.hide();
                if (res.code == 0) {
                    am.msg("评价成功");
                    $.am.page.back();
                    // $.am.changePage(am.page.workOrder, "slideup", "");
                    am.workOrderDetail.show(opt.id);
                } else {
                    am.msg(res.message || "评价失败，请稍后再试");
                }
            });
        },
        beforeShow: function(data) {
            this.data = data;
            this.$.find(".warp li").removeClass("active");
            this.$.find(".yawp li").removeClass("active");
            this.$.find("textarea").val("");
            this.$.find(".btn").show();
            this.$.find(".yawp").hide();
        },
        beforeHide: function() {},
        afterShow: function() {},
        afterHide: function() {}
    }));
})();

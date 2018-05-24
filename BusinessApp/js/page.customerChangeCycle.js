
amGloble.page.customerChangeCycle = new $.am.Page({
    id: "page-customerChangeCycle",
    disableScroll: true,
    init: function() {
        var _this = this;
        this.$header.find(".left").vclick(function() {
            $.am.page.back("slidedown");
        });
        this.$header.find(".right").vclick(function() {
            _this.submit();
        });
        this.$wakeupPeriod = this.$.find("input");

        this.$title = this.$.find("div.title");
    },
    beforeShow: function(paras) {
        this.data = paras;
        this.$title.text("为" + paras.name + "设定消费周期");
        if (paras && paras.mgjconsumeperiod != -1) {
            this.$wakeupPeriod.val(paras.mgjconsumeperiod);
        }
    },

    afterShow: function(paras) {
        var _this = this;
        setTimeout(function() {
            _this.$wakeupPeriod.focus();
        }, 300);
    },
    submit: function() {
        var _this = this;
        var wakeupPeriod = _this.$wakeupPeriod.val();
        if (/\d/.test(wakeupPeriod) && wakeupPeriod >= 5 && wakeupPeriod <= 60) {

        } else {
            amGloble.msg("消费周期只能设定在5-60天之间");
            return;
        }
        amGloble.loading.show();
        amGloble.api.customerUpdateMemInfo.exec({
            "id": this.data.id,
            "mgjconsumeperiod": wakeupPeriod * 1
        }, function(ret) {
            amGloble.loading.hide();
            if (ret.code == 0) {
                amGloble.msg("设置成功！");
                $.am.page.back("slidedown");
                _this.data.mgjconsumeperiod = wakeupPeriod;
                amGloble.page.customerDetail.render();
            } else {
                amGloble.msg("设置失败！");
            }
        });
    }
});

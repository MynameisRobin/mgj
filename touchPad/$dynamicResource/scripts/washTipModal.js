/**洗发时长提示 */
am.washTipModal = {
    init: function () {
        var self = this;
        this.$ = $("#washTipModal");
        this.$.find(".close").vclick(function () {
            self.$.hide();
        });
    },
    show: function (data) {
        var self = this;
        if (!this.$) {
            this.init();
        }
        this.$.show();
        this.getData(data);
        if (/(iPhone|iPad|iPod|iOS|OS)/i.test(navigator.userAgent)) {
            this.$.find(".content .iconfont").css("marginTop", 60);
        }
        setTimeout(function () {
            self.$.fadeOut(300);
        }, 4000);
    },
    getData: function (data) {
        if (!data) {
            return console.info("洗发时长data为空");
        }
        if (data.flag == "start") {
            this.$.find(".icon-shijianbiao").css({
                color: "#ccc"
            })
            this.$.find(".black").html("洗发计时开始").css({
                fontSize: 18,
                fontWeight: "normal"
            })
            this.$.find(".gray").html('合格时间为' + (am.metadata.configs.washPassTime || "30") + "分钟").css({
                fontSize: 21,
                color: "#222",
                fontWeight: "bold"
            })
        } else if (data.flag == "pass") {
            this.$.find(".icon-shijianbiao").css({
                color: "#8ec05e"
            })
            this.$.find(".black").html(data.str).css({
                fontSize: 27,
                fontWeight: "bold"
            })
            this.$.find(".gray").html("洗发结束，<span style='color:#8ec05e;'>合格</span>").css({
                fontSize: 18,
                color: "#ccc",
                fontWeight: "normal"
            })
        } else if (data.flag == "nopass") {
            this.$.find(".icon-shijianbiao").css({
                color: "#e82742"
            })
            this.$.find(".black").html(data.str).css({
                fontSize: 27,
                fontWeight: "bold"
            })
            this.$.find(".gray").html("洗发结束，<span style='color:#e82742;'>不合格</span>").css({
                fontSize: 18,
                color: "#ccc",
                fontWeight: "normal"
            })
        }
    }
}
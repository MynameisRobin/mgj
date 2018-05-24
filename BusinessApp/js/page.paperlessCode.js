(function() {

    var self = amGloble.page.paperlessCode = new $.am.Page({
        id: "page-paperlessCode",
        init: function() {
            var self = this;
            this.$code = this.$.find(".code");
            this.$barcode = this.$.find(".barcode");
            // this.$back = this.$.find(".c-button").vclick(function() {
            //     $.am.page.back();
            // });
            this.$refreshCode = this.$.find(".refresh").vclick(function() {
                self.refreshCode();
            });
        },
        beforeShow: function(ret) {

            this.$.addClass("am-status-loading");
        },
        afterShow: function(paras) {
            this.refreshCode();
        },
        beforeHide: function() {},
        refreshCode: function() {
            var self = this;
            //clear
            self.$code.empty();
            self.$barcode.empty();

            this.$.addClass("am-status-loading");
            amGloble.api.getShortCode.exec({}, function(ret) {
                console.log(ret);
                if (ret.code == 0) {
                    var code = ret.content;
                    self.$code.html(code);
                    // self.$barcode.append('<img src="' + config.commonUrl + "/component/genbc?width=200&height=50&message=" + code + '"/>');
                    self.setStatus("normal");
                } else {
                    self.setStatus("error");
                }
            });
        }
    });

})();

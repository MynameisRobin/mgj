(function() {
    // qq模态框
    am.qqModal = {
        $: $("#qqModal"),
        init: function() {
            var self = this;
            this.$.find(".btn,.close").vclick(function() {
                self.$.hide();
            });
        },
        show: function() {
            this.init();
            this.$.show();
        }
    };
})();

am.goodModal = {
    backButtonOnclick: function () {
        this.$.hide();
    },
    init: function () {
        var self = this;
        this.$ = $("#goodModal");
        this.$.find(".close").vclick(function () {
            self.backButtonOnclick();
        });
        this.$.find(".inner").vclick(function (e) {
            e.stopPropagation();
        });
        this.$.vclick(function () {
            self.$.hide();
        });
    },
    show: function () {
        this.init();
        this.$.show();
    },
    hide: function () {
        this.$.hide();
    }
};
am.viewImgModal = {
    backButtonOnclick: function() {
        am.goBackToInitPage();
    },
    init: function() {
        var self = this;
        this.$ = $("#viewImgModal");
        self.$.find(".content").html("<img src='" + self.data + "'>");
        this.$.find(".close").vclick(function() {
            self.backButtonOnclick();
        });
    },
    show: function(data) {
        this.data = data;
        this.init();
        this.$.show();
    },
    hide: function() {
        this.$.hide();
    }
};

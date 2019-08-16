am.viewImgModal = {
    backButtonOnclick: function() {
        this.$.hide();
    },
    init: function() {
        var self = this;
        this.$ = $("#viewImgModal");
        this.$.find(".close").vclick(function() {
            self.backButtonOnclick();
        });
        this.$.find(".inner").vclick(function(e){
            e.stopPropagation();
        });
        this.$.vclick(function(){
            self.$.hide();
        });
    },
    show: function(data) {
        this.data = data;
        this.init();
        this.$.show();
        this.$.find(".content").html("<img src='" + this.data + "'>");
    },
    hide: function() {
        this.$.hide();
    }
};

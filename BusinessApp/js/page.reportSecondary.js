(function() {


    var self = amGloble.page.reportSecondary = new $.am.Page({
        id: "page-reportSecondary",
        disableScroll: 1,
        init: function() {
            var self = this;

            this.$title = this.$header.find("p");

            this.$dv = this.$.find(".mainTable");

        },
        beforeShow: function(paras) {
            console.log(paras);
            this.paras = paras;
            self.$dv.empty();
            amGloble.loading.show("正在加载,请稍候...");
        },
        afterShow: function(paras) {

            this.render();
        },
        beforeHide: function() {},
        render: function() {

            amGloble.loading.hide("");
            var content = this.paras.content;
            var title = this.paras.title;
            this.$title.text(title);
            self.$dv.rldataviewer(content);
        },
    });



})();

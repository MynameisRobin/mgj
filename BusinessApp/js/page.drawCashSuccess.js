(function() {
    var self = amGloble.page.drawCashSuccess = new $.am.Page({
        id: "page-drawCashSuccess",
        init: function() {
            this.$.find(".btnOk").vclick(function(){
                $.am.changePage(amGloble.page.withDraw, "slideleft");
            });

        },
        beforeShow: function(ret) {
            this.renderSuccess(ret);
        },
        afterShow: function(paras) {
            console.log(paras);
            this.paras = paras;
            
        },
        beforeHide: function() {},
        renderSuccess:function(data){
            var $dom=this.$.find(".listBox");
            $dom.find(".cash").text("￥"+data.cashMoney);
            $dom.find(".account").text(data.account);

        }

    });


})();

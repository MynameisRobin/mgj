(function() {
    var _this = amGloble.page.wechatBindTest = new $.am.Page({
        id: "page_wechatBind",
        init: function() {
            this.$.find(".page-button").vclick(function(){
                try{
                    navigator.appplugin.wxLogin(function(ret){
                        alert(JSON.stringify(ret));
                    },function(msg){
                        alert(JSON.stringify(msg));
                    });
                }catch(e){
                    alert(e);
                }
            });
        },
        beforeShow: function() {

        },
        afterShow: function(paras) {

        },
        beforeHide: function(paras) {

        },
    });
})();

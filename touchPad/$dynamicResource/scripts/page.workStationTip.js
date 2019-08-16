(function(){
    var self = am.page.workStationTip = new $.am.Page({
        id: 'page_workStationTip',
        backButtonOnclick: function(){
            $.am.page.back('slidedown');
        },
        init: function(){
            this.$setWorkStation = this.$.find('.setWorkStation').vclick(function(){
                if($(this).hasClass('openAndSet')){
                    self.toggleWorkStationBill(1,function(){
                        $.am.changePage(am.page.workStationSetting, "slideup");
                    });
                }else {
                    $.am.changePage(am.page.workStationSetting, "slideup");
                }
            });
            this.$openWorkStationBill = this.$.find('.openWorkStationBill').vclick(function(){
                if($(this).hasClass('selected')){
                    $(this).removeClass('selected');
                }else {
                    $(this).addClass('selected')
                }
                self.toggleWorkStationBill($(this).hasClass('selected'));
            });
        },
        beforeShow: function(){
            var workStationSwitch = amGloble.metadata.configs.workStationSwitch;
            if(workStationSwitch){
                this.$openWorkStationBill.show();
                this.$setWorkStation.removeClass('openAndSet').text('配置座位/房间');
                if(workStationSwitch=='true'){
                    this.$openWorkStationBill.addClass('selected');
                }else{
                    this.$openWorkStationBill.removeClass('selected');
                }
            }else {
                this.$openWorkStationBill.hide();
                this.$setWorkStation.addClass('openAndSet').text('开启并配置座位/房间');
            }
        },
        afterShow: function(){

        },
        beforeHide: function(){

        },
        afterHide: function(){

        },
        toggleWorkStationBill: function(selected,callback){
            am.loading.show();
            am.api.saveNormalConfig.exec({
                parentshopid: am.metadata.userInfo.parentShopId+'', 
                configkey: 'workStationSwitch',
                configvalue: selected?'true':'false',
                shopid: am.metadata.userInfo.shopId+'',
                setModuleid: 9
            },function(ret){
                am.loading.hide();
                if(ret && ret.code==0){
                    am.msg(selected?'扫码开单启用':'扫码开单已关闭');
                    amGloble.metadata.configs.workStationSwitch = selected?'true':'false';
                    callback && callback();
                }else {
                    am.msg('更改失败');
                }
            });
        }
    });
})();
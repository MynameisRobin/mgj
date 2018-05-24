(function(){
    amGloble.page.customerDetailMore = new $.am.Page({
        id: 'page-customerDetailMore',
        init: function(){
            this.$name = this.$header.find('.name');
            this.$phone = this.$.find('.phone');
            this.$birth = this.$.find('.birth');
            this.$online = this.$.find('.online');
            this.$offline = this.$.find('.offline');
            this.$tqk = this.$.find('.tqk');
            this.$myk = this.$.find('.myk');
            this.$download = this.$.find('.download');
            this.$shop = this.$.find('.shop');
            this.$emp = this.$.find('.emp');
            this.$from = this.$.find('.from');
        },
        beforeShow:function(para){
            console.log(para);
            this.$name.html(para.meta.name);

            this.$phone.html(para.meta.phone);

            if (amGloble.metadata.permissions.allowphone) {
                this.$phone.show();
            } else {
                this.$phone.hide();
            }
            var birth = '';
            if(para.meta.birthday){
                birth = para.meta.birthday.split('-').slice(1).join('-');
            }
            if (amGloble.metadata.userInfo.operatestr && amGloble.metadata.userInfo.operatestr.indexOf('MGJP')>0) {
                this.$phone.html(para.meta.phone.replace(/\d{4}$/, "****"));  
            }

            this.$birth.html(birth || '未设置');

            this.$online.html(para.meta.onlineCredit);
            this.$offline.html(para.meta.currpoint);
            
            this.$tqk.html(para.privilege?'是':'否');
            this.$myk.html(para.meta.openId?'是':'否');
            this.$download.html(para.meta.mgjappactivated?'是':'否');
            
            this.$shop.html(para.meta.shopname);
            this.$emp.html(para.meta.emps || '无');

            this.$from.html(this.mgjsource[para.meta.mgjsourceid] || '');
        },
        mgjsource:['','上门客人','员工带客','客带客','美一客拓客','生意宝拓客','WIFI拓客','大众点评','美团','支付宝','百度糯米'],
    })
})();
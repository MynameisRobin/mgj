(function(){
    var self = amGloble.page.setNickname = new $.am.Page({
        id: 'page-setNickname',
        init: function(){
            this.$header.find('.left').vclick(function() {
                $.am.page.back('slidedown');
            });
            
            this.$name = this.$.find('.name');

            this.$nickname = this.$.find('.nickname').change(function(){
                var val = $(this).val();
                if(val){
                    self.$del.show();
                }else {
                    self.$del.hide();
                }
            });

            this.$del = this.$.find('.del').vclick(function(){
                $(this).hide();
                self.$nickname.val('');
            });

            this.$header.find('.right').vclick(function() {
                self.setNickname();
            });
        },
        beforeShow:function(para){
            this.$name.html(para.customer.name);
            if(para.customer.nickname){
                this.$nickname.val(para.customer.nickname);
                this.$del.show();
            }else {
                this.$nickname.val('');
                this.$del.hide();
            }
            this.customer = para.customer;
        },
        setNickname:function(){
            var name = this.$nickname.val();
            if(!name){
                amGloble.msg('请输入昵称');
                return;
            }
            amGloble.loading.show();
            amGloble.api.customerUpdateMemInfo.exec({
                id: self.customer.id,
                nickname: name
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    amGloble.msg('设置成功！');
                    $.am.page.back("slidedown",{nickname:name});
                } else {
                    amGloble.msg("设置失败！");
                }
            });
        }
    });
})();
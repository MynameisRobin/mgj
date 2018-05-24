(function() {

    var self = amGloble.page.withdrawdeposit = new $.am.Page({
        id: "page-withdrawdeposit",
        init: function() {
            var self = this;
            this.$isbinding = this.$.find('.isbinding');
            this.$unbounded = this.$.find('.unbounded');
            this.$footbind = this.$.find(".footbind");
            this.$withdrawalprompt = this.$.find('.withdrawalprompt');
            this.$right = this.$.find(".bindwechat .right");
            this.$righttoo = this.$.find(".bindwechat .righttoo");
            this.$withdrawdepositmoney = this.$.find('#page-withdrawdeposit-money');
            this.$unboundedImg = this.$.find('.unbounded img');

            //提现至此微信账号
            this.$.find(".bindwechat .right").vclick(function(){
                self.share(true);
            });

            //确认提现
            this.$.find("#page-withdrawdeposit-okBtn").vclick(function(){
                self.rewardWithdraw();
            });

            //我已学会，去绑定帐号(分享) || 绑定成功，去提现
            this.$footbind.vclick(function(){
                var _html = $.trim($(this).html());
                self.share();
            });

            //点击图片触发绑定
            this.$unboundedImg.vclick(function(){
                self.$footbind.trigger('vclick');
            });

            //提现申请已提交中的完成按钮
            this.$.find('.withdrawalprompt .btnOk').vclick(function(){
                $.am.page.back();
            });

            //重新更改绑定后,点击刷新
            // this.$righttoo.vclick(function(){
            //     self.refreshMetaAction();
            // });

            $(document).bind("resume",function(){
                $.am.debug.log("resume");
                if($.am.getActivePage() == self){
                    $.am.debug.log("绑定账号，刷新metadata");
                    self.refreshMetaAction();
                }
            });
        },
        share: function(btn){
            var self = this;
            var shareObj = {
                title: "美管加生意宝-点我绑定微信进行打赏提现",
                link: config.bindShareUrl + amGloble.metadata.userInfo.userId,
                success: function(ret){
                    $.am.debug.log('分享成功:' + JSON.stringify(ret));
                    setTimeout(function(){
                        $.am.debug.log('atMobile.nativeUIWidget.confirm');
                        try{
                            atMobile.nativeUIWidget.confirm({
                                caption: "分享成功",
                                description: "请在微信中打开分享内容进行账号绑定！",
                                okCaption: "知道了",
                                cancelCaption: "返回"
                            }, function() {
                            }, function() {
                            });
                        }catch(e){
                            $.am.debug.log(e);
                        }
                    },500);
                },
                fail: function(ret){
                    $.am.debug.log('分享失败:' + JSON.stringify(ret));
                    if(self.loopTimer) clearTimeout(self.loopTimer);
                    self.looptimes=100;
                }
            };


            if(amGloble.metadata.configs.v4_tenantLogo){
                var $img = amGloble.photoManager.createImage("tenantLogo", {
                    parentShopId: amGloble.metadata.userInfo.parentShopId
                }, amGloble.metadata.configs.v4_tenantLogo);
                shareObj.imgUrl = $img.attr('src');
            }else{

            }

            amGloble.share(shareObj);
        },
        beforeShow: function(ret) {
            if (ret == "back") {
                return;
            }

            var self = this;
            this.$withdrawdepositmoney.attr("readonly",true).val("");
            setTimeout(function(){
                self.$withdrawdepositmoney.attr("readonly",false);
            },500);

            this.$unbounded.hide();
            this.$isbinding.hide();
            this.$footbind.hide();
            this.$withdrawalprompt.hide();
            if(!amGloble.metadata.userInfo.openId){ //未绑定微信
                this.$unbounded.show();
                this.$footbind.show();
            }else{  //已绑定微信
                this.$isbinding.show();
            }
            this.refresh();

            if(ret){
                this.paras=ret;
                this.$.find(".withdrawdepositwrap .right").html( '可提现金额：' + ret.balance );
            }

            if(amGloble.metadata.userInfo.openId){
                this.oldOpenId = amGloble.metadata.userInfo.openId;
            }

            if(amGloble.metadata.userInfo.wechatExt){
                var wechatExt = JSON.parse(amGloble.metadata.userInfo.wechatExt);
                var $img = $('<img src="'+ wechatExt.headimgurl +'" />');
                this.$.find(".bindwechat .left").html( $img );
                this.$.find(".bindwechat .middle .custname").html( wechatExt.nickname );
                if(wechatExt.sex == 1){ //男
                    this.$.find(".bindwechat .middle .custsex").removeClass('male gender').addClass('male');
                }else{
                    this.$.find(".bindwechat .middle .custsex").removeClass('male gender').addClass('gender');
                }
            }

            //this.getData();
        },
        afterShow: function(paras) {},
        beforeHide: function() {
        },
        getData: function(){

        },
        checkVal : function(){
            var _money = self.$.find('#page-withdrawdeposit-money').val();
            var _splitmoney = _money.split('.');
            if(/[a-zA-Z~!@#$%^&*()_+{}:"<>|-]/.test(_money)){
                amGloble.msg("提现金额含非法字符!");
                return false;
            }
            if(_splitmoney[1]){
                if(_splitmoney[1].length > 2){
                    amGloble.msg("提现金额不合法!");
                    return false;
                }
            }
            if( _money < 1 || _money > 200 ){
                amGloble.msg("提现金额应在1-200之间!");
                return false;
            }
            if(_money>this.paras.balance){
                amGloble.msg("输入的金额超出可提现金额!");
                return false;
            }
            return true;
        },
        rewardWithdraw: function(){
            var self = this;

            if( !self.checkVal() ){
                return;
            }

            var money=self.$.find('#page-withdrawdeposit-money').val();
            amGloble.loading.show("提现中,请稍候...");
            //【生意宝】打赏提现
            amGloble.api.rewardWithdraw.exec({
                'money' : money
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {

                    self.$isbinding.hide();
                    self.$withdrawalprompt.show();
                    self.$withdrawalprompt.find('.cash').html(money);
                    self.$withdrawalprompt.find('.account').html( JSON.parse(amGloble.metadata.userInfo.wechatExt).nickname );

                } else {
                    amGloble.msg(ret.message || "提现失败,请重试!");
                }
            });
        },
        refreshMetadata: function(scb){
            var self = this;
            amGloble.api.metadata.exec({
                parentShopId: config.parentShopId,
                token: config.token
            }, function(ret,isCached) {
                if (ret.code == 0 && ret.content) {
                    amGloble.metadata = amGloble.processMetadata($.extend(true, {}, ret.content));
                    self.beforeShow();
                    if(scb) scb();
                }
            },1);
        },
        amDragTopTips: ["下拉刷新微信账户信息", "松开开始刷新微信账户信息", "加载中..."],
        touchTop: function() {
            var self=this;
            //手动刷新
            this.refreshMetaAction();
        },
        //收到推送
        refreshMetaAction:function(){
            this.refreshMetadata(function(){
                self.closeTopLoading();
            });
        }
    });

})();

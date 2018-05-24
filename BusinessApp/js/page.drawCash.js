(function() {

    var self = amGloble.page.drawCash = new $.am.Page({
        id: "page-drawCash",
        init: function() {
            var self = this;
            this.$phone = this.$.find(".phone");

            this.$code = this.$.find(".code > input");

            this.$audioBtn = this.$.find(".audioBtn").vclick(function() {
                self.getAudioCode();
            });
            this.$captchaBtn = this.$.find(".captchaBtn").vclick(function() {
                self.getCode();
            });
            this.$subBtn=this.$.find(".btnOk").vclick(function() {
                self.getCash();
            });

            this.$.find(".am-backbutton").vclick(function() {
                $.am.page.back();
            });

            this.$code = this.$.find(".code > input");
            this.$password = this.$.find(".password > input");
            this.$passwordRepeat = this.$.find(".passwordRepeat > input");

            this.$maxmoney=this.$.find(".white .maxmoney");

            this.$passwordBox = this.$password.parent().parent();

            this.fixed=2;
        },
        backButtonOnclick: function() {
            
        },
        beforeShow: function(paras) {
            if (paras == "back") {
                return;
            }
            this.paras = paras;
            console.log(this.paras);
            this.render();
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        render: function() {
            this.$code.val("");
            this.$audioBtn.addClass("am-disabled");
            this.$phone.text(this.paras.account);
            this.$maxmoney.text(this.toFixed(this.paras.withdrableMoney)+"元");
        },
        toFixed:function(num){
            var number=new Number(num);
            return number.toFixed(this.fixed);
        },
        getCode: function() {
            var self = this;
            var paras = this.paras;
            var i = 60;

            amGloble.loading.show("正在发送，请稍候...");
            amGloble.api.sendCode.exec({
                codeKey: "agentCode", // 取验证码的唯一key
                phone:amGloble.metadata.userInfo.mobile,//amGloble.metadata.userInfo.mobile
                shopid: amGloble.metadata.userInfo.shopId,
            }, function(ret) {
                amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    amGloble.msg("验证码发送成功！");
                } else {
                    amGloble.msg(ret.message || "提交失败，请重试！", true);
                }
            });
            this.$audioBtn.removeClass("am-disabled");
            this.$captchaBtn.text("剩余" + i + "秒").addClass("am-disabled");
            this.$passwordBox.show();
            var timer = setInterval(function() {
                i--;
                if (i <= 0) {
                    self.$captchaBtn.text("发送验证码").removeClass("am-disabled");
                    clearInterval(timer);
                } else {
                    self.$captchaBtn.text("剩余" + i + "秒");
                }
            }, 1000);
            setTimeout(function() {
                self.$code.focus();
            }, 100);
        },
        getAudioCode: function() {
            var self = this;
            var paras = this.paras;

            amGloble.loading.show("正在发送，请稍候...");
            amGloble.api.sendCode.exec({
                codeKey: "agentCode", // 取验证码的唯一key
                phone:amGloble.metadata.userInfo.mobile,//amGloble.metadata.userInfo.mobile
                shopid: amGloble.metadata.userInfo.shopId,
                type: "z"
            }, function(ret) {
                amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    self.$audioBtn.addClass("am-disabled");
                    amGloble.msg("语音验证码发送成功！");
                } else {
                    amGloble.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        },
        successCash:function(cashMoney,account){
            var data={
                cashMoney:cashMoney,
                account:account
            }
            $.am.changePage(amGloble.page.drawCashSuccess, "slideleft",data);
        },
        getCash:function(){
            // var cashMoney=this.$.find(".white .password input").val();
            // this.successCash(cashMoney,this.paras.account);
            // return;
            var self=this;
            var code = this.$code.val();
            var cashMoney=this.$.find(".white .password input").val();
            var reg=/^([1-9]\d*|0)(\.\d{1,2})?$/;
            if(!reg.test(cashMoney)){
                amGloble.msg("提现金额小数点后的数字必须小于两位数");
                return;
            }
            if(!$.isNumeric(cashMoney)){
                amGloble.msg("提现金额必须为数字");
                return;
            }
            if(cashMoney<=0){
                amGloble.msg("提现金额必须大于0");
                return;
            }
            if(cashMoney>this.paras.withdrableMoney){
                amGloble.msg("超出最大可提现金额");
                return;
            }
            if(cashMoney>20000){
                amGloble.msg("单次提现金额不得超过20000");
                return;
            }
            if (!$.trim(code) || code.length != 4) {
                amGloble.msg("请输入正确的验证码");
                return;
            }
            amGloble.loading.show("正在请求数据，请稍候...");
            //cashMoney=self.toFixed(cashMoney);
            amGloble.api.getwithdraw.exec({
                codeKey: "agentCode", // 取验证码的唯一key
                parentShopId: amGloble.metadata.userInfo.parentShopId,
                mobile:amGloble.metadata.userInfo.mobile,
                withdrawAccount:self.paras.account,
                withdrawFee:"0.1",
                withdrawAmount:cashMoney,
                code:code

            }, function(ret) {
                amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    self.successCash(cashMoney,self.paras.account);
                } else {
                    amGloble.msg(ret.message || "提现失败，请重试！", true);
                }
            });
        }
    });

})();

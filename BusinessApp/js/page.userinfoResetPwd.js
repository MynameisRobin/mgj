(function() {


    var self = amGloble.page.userinfoResetPwd = new $.am.Page({
        id: "page-userinfoResetPwd",
        init: function() {
            var self = this;
            this.$phone = this.$.find(".phone");
            this.$phonenumwrap = this.$.find(".phonenumwrap");
            this.$amHeaderP = this.$.find('.am-header p');
            this.$cButton = this.$.find(".c-button");

            this.$code = this.$.find(".code > input");

            this.$captchaBtn = this.$.find(".captchaBtn").vclick(function() {
                self.getCode();
            });
            this.$audioBtn = this.$.find(".audioBtn").vclick(function() {
                self.getAudioCode();
            });

            this.$saveBtn = this.$.find(".c-button").vclick(function() {
                if(self.paras.boundPhone){  //绑定手机
                    self.bindMobile();
                }else{  //重设密码
                    self.savePwd();
                }
            });



            this.$code = this.$.find(".code > input");
            this.$password = this.$.find(".password > input");
            this.$passwordRepeat = this.$.find(".passwordRepeat > input");

            this.$passwordBox = this.$password.parent().parent();
        },
        backButtonOnclick: function() {
            if (this.paras && this.paras.backPage) {
                $.am.changePage(this.paras.backPage, "slideright");
            } else {
                $.am.page.back();
            }
        },
        beforeShow: function(paras) {
            this.paras = paras;
            this.showOrHide();
            this.render();
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        showOrHide: function(){
            if(this.paras.boundPhone){  //绑定手机
                this.$amHeaderP.html('手机绑定');
                this.$phone.hide();
                this.$phonenumwrap.val('').show();
                this.$cButton.html('绑定并继续登录');
            }else{  //重设密码
                this.$amHeaderP.html('重设密码');
                this.$phone.html('').show();
                this.$phonenumwrap.hide();
                this.$cButton.html('确认');
            }
        },
        render: function() {
            this.$phone.text(this.paras.phone);
            this.$code.val("");
            this.$password.val("");
            this.$passwordBox.hide();
            this.$audioBtn.addClass("am-disabled");
        },
        getCode: function() {
            var self = this;
            var paras = this.paras;
            var i = 60;

            if(self.paras.boundPhone){  //绑定手机
                var _phone = $.trim(this.$phonenumwrap.find('input').val());
                if (!_phone) {
                    amGloble.msg("请输入手机号");
                    return;
                }
                var _codeKey = "bindMobile";
                var _shopid = 0;
            }else{  //重设密码
                var _phone = paras.phone;
                var _codeKey = "resetPwd";
                //var _shopid = paras.shopId;
                var _shopid = 0;
            }

            amGloble.loading.show("正在发送，请稍候...");
            amGloble.api.sendCode.exec({
                codeKey: _codeKey, // 取验证码的唯一key
                phone: _phone,
                shopid: _shopid
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

            if(this.paras.boundPhone){  //绑定手机
                this.$passwordBox.hide();
            }else{  //重设密码
                this.$passwordBox.show();
            }

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

            if(self.paras.boundPhone){  //绑定手机
                var _phone = $.trim(this.$phonenumwrap.find('input').val());
                if (!_phone) {
                    amGloble.msg("请输入手机号");
                    return;
                }
                var _codeKey = "bindMobile";
            }else{  //重设密码
                var _phone = paras.phone;
                var _codeKey = "resetPwd";
            }

            amGloble.loading.show("正在发送，请稍候...");
            amGloble.api.sendCode.exec({
                codeKey: _codeKey, // 取验证码的唯一key
                phone: _phone,
                shopid: paras.shopId,
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
        setMenu:function(){
            if(amGloble.metadata.configs.hideEducation === "true"){
	            $("div.tab-main").hide();
	        }
        },
        bindMobile: function(flag,data){
            var _this = this;
            var paras = this.paras;
            var code = this.$code.val();
            var phone = $.trim(this.$phonenumwrap.find('input').val());

            if (!$.trim(code) || code.length != 4) {
                amGloble.msg("请输入正确的验证码");
                return;
            }
            if (!phone) {
                amGloble.msg("请输入手机号");
                return;
            }
            if(flag){
                code = data.code;
                phone = data.phone;
                paras = data.paras;
            }
            amGloble.loading.show("正在提交，请稍候...");
            amGloble.api.userBindMobile.exec({
                userId: paras.userId,
                userType: paras.userType,
                phone: phone,
                shopid: paras.shopId,
                code: code,
                codeKey: "bindMobile"
            }, function(ret) {
                amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    amGloble.msg("绑定成功！");
                    _this.setMenu();
                    $.am.page.back();
                } else {
                    amGloble.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        },
        savePwd: function(flag,data,cb) {
            var _this = this;
            if(!flag){
                var paras = this.paras;
                var code = this.$code.val();
                var password = this.$password.val();
                var passwordRepeat = this.$passwordRepeat.val();

                if (!$.trim(code) || code.length != 4) {
                    amGloble.msg("请输入正确的验证码");
                    return;
                }
                if (!$.trim(password)) {
                    amGloble.msg("请输入新密码");
                    return;
                }
                // if (passwordRepeat != password) {
                //     amGloble.msg("两次输入的密码不一致，请重新输入");
                //     return;
                // }
            }else{
                code  = data.code;
                paras = data.paras;
                password = data.password;
            }
            amGloble.loading.show("正在提交，请稍候...");
            amGloble.api.userModifypwd.exec({
                userId: paras.userId,
                userType: paras.userType,
                phone: paras.phone,
                shopid: paras.shopId,
                code: code,
                codeKey: "resetPwd",
                password: password
            }, function(ret) {
                amGloble.loading.hide();
                console.log(ret);
                if (ret.code == 0) {
                    _this.setMenu();
                    !flag && amGloble.msg("修改成功！");
                    if(cb){
                        cb();
                    }else{
                        if (paras.scb) {
                            paras.scb();
                        } else {
                            $.am.page.back();
                        }
                    }
                    
                } else {
                    amGloble.msg(ret.message || "提交失败，请重试！", true);
                }
            });
        }
    });

})();

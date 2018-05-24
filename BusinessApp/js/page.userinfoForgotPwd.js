(function() {


    var self = amGloble.page.userinfoForgotPwd = new $.am.Page({
        id: "page-userinfoForgotPwd",
        init: function() {
            var self = this;
            this.$.find(".c-button").vclick(function() {
                self.checkUser();
            })
            this.$username = this.$.find(".username > input");
        },
        beforeShow: function(paras) {
            if (paras == "back") {
                return;
            }
            if (paras && paras.phone) {
                this.$username.val(paras.phone);
            } else {
                this.$username.val("");
            }
        },
        afterShow: function(paras) {},
        beforeHide: function() {},
        checkUser: function(userName, pwd, user) {
            var self = this;

            var username = this.$username.val();
            if (!amGloble.reCellphone.test($.trim(username))) {
                amGloble.msg("请输入正确的手机号!");
                return;
            }

            amGloble.loading.show("正在登录,请稍候...");
            amGloble.api.userForgotpwd.exec({
                "userName": username,
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
                    //出现重复用户

                    var list = amGloble.dedup(ret.content, "parentShopId");

                    //选择商户
                    self.chooseParentShop(list, function(parentShop) {
                        var users = ret.content.filter(function(item) {
                            return item.parentShopId == parentShop.parentShopId;
                        });
                        console.log(users);
                        setTimeout(function() {
                            //选择用户
                            self.chooseUser(users, function(user) {
                                console.log("找到唯一用户！！", user);
                                self.next(user);
                            });
                        }, 1);
                    });

                } else {
                    //登录失败
                    amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                }
            }, true);
        },
        chooseParentShop: function(array, scb) {
            if (array.length > 1) {
                amGloble.popup.list.show({
                    title: "选择商户",
                    content: "登录名重复，请选择商户",
                    data: array,
                    shownKeys: ["hqName"],
                    scb: function(parentShop) {
                        scb && scb(parentShop);
                    }
                });
            } else {
                scb && scb(array[0]);
            }
        },
        chooseUser: function(array, scb) {
            if (array.length > 1) {
                amGloble.popup.list.show({
                    title: "选择角色",
                    content: "您有多个账号，请选择账号登录",
                    data: array,
                    shownKeys: ["shopName", "osName", "levelName", "userName"],
                    scb: function(user) {
                        scb && scb(user);
                    },
                });
            } else {
                scb && scb(array[0]);
            }
        },
        next: function(user) {
            $.am.changePage(amGloble.page.userinfoResetPwd, "slideleft", {
                phone: user.mobile,
                shopId: user.shopId,
                userId: user.userId,
                userType: user.userType,
                scb: function() {
                    $.am.changePage(amGloble.page.login, "slideleft");
                }
            });
        }
    });

})();

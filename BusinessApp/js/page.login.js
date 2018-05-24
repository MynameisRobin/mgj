(function() {

    // var findParentShop = function(array) {
    //     var ret = [];
    //     for (var i = 0; i < array.length; i++) {
    //         var item = array[i];
    //         if (item.shopId == item.parentShopId) {
    //             ret.push(item);
    //         }
    //     }
    //     return ret;
    // };

    amGloble.page.login = new $.am.Page({
        id: "page-login",
        backButtonOnclick: function() {
            atMobile.nativeUIWidget.confirm({
                caption: "退出",
                description: "是否退出?",
                okCaption: "退出",
                cancelCaption: "返回"
            }, function() {
                atMobile.appManager.exitApp();
            }, function() {

            });
        },
        init: function() {
            var self = this;

            this.$.find('.top .left').vclick(function(){
                $.am.page.back();
            })

            this.$title = this.$.find(".top .photo");

            this.$username = this.$.find("#page-login-username");
            this.$password = this.$.find("#page-login-password").keyup(function(e) {
                if (e.keyCode == 13) {
                    self.$loginBtn.trigger("vclick");
                }
            });
            this.$usernameClear = this.$username.next().vclick(function() {
                self.$username.val("");
            });

            this.$loginBtn = this.$.find("#page-login-loginBtn").vclick(function() {
                var login = function() {
                    var userName = self.$username.val();
                    var pwd = self.$password.val();

                    // if (!amGloble.reCellphone.test($.trim(userName))) {
                    //     amGloble.msg("请输入正确的手机号!");
                    //     return;
                    // }

                    // if (!$.trim(pwd)) {
                    //     amGloble.msg("请输入密码!");
                    //     return;
                    // }

                    self.login(userName, pwd);
                };
                if (navigator.appplugin && navigator.appplugin.hideIme) {
                    navigator.appplugin.hideIme();
                    setTimeout(login, 500);
                } else {
                    login();
                }
            });

            this.$reset = this.$.find("#page-login-reset").vclick(function() {
                atMobile.nativeUIWidget.confirm({
                    caption: "重置",
                    description: "重置将清除之前的登录信息，是否继续？",
                    okCaption: "是",
                    cancelCaption: "否"
                }, function() {
                    self.reset();
                }, function() {});
            });
            this.$demo = this.$.find("#page-login-demo").vclick(function() {
                amGloble.confirm("演示模式", "即将进入演示模式，是否继续？", "是", "否", function() {
                    config.demoUser = true;
                    self.login("17788889999", "1", {
                        parentShopId: 10000
                    });
                }, function() {});
            });

            //忘记密码
            this.$forgotPwd = this.$.find("#page-login-forgortPwd").vclick(function() {
                $.am.changePage(amGloble.page.userinfoForgotPwd, "slideleft", {
                    phone: self.$username.val()
                });
            });
        },
        beforeShow: function(ret) {
            if (ret == "logout") {
                this.logout();
            } else if (ret == "logoutWithoutReload") {
                this.reset(true, true);
            }
            if(ret && ret.id){
                this.backInfo = ret;
            }
            this.render();
        },
        afterShow: function() {
            //处理点穿的问题
            this.$username.prop("disabled", false);
            this.$password.prop("disabled", false);
        },
        beforeHide: function() {
            this.$username.prop("disabled", true);
            this.$password.prop("disabled", true);
        },
        afterHide: function() {
            this.backInfo = null;
        },
        saveConfig: function(userinfo) {
            $.extend(true, window.config, userinfo);
            localStorage.setItem("BusinessAppV2_config", JSON.stringify(window.config));
        },
        login: function(userName, pwd, user,cb,fcb,scb) {
            var self = this;
            amGloble.loading.show("正在登录,请稍候...");
            amGloble.api.login.exec({
                "parentShopId": user && user.parentShopId,
                "userId": user && user.userId,
                "userName": userName,
                "password": pwd,
                "userType": user && user.userType,
                "deviceType": device.platform != "Android" ? 1 : 2,
                "deviceId": device.uuid,
                "sysInfo": "",
                "pushToken": config.pushToken
            }, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0 && ret.content) {
                    //登录成功
                    console.log(ret);
                    self.saveConfig({
                        parentShopId: ret.content.userInfo.parentShopId,
                        token: ret.content.token
                    });
                    self.getMetadata(function() {
                        amGloble.page.community.shopId = null;
                        //有密码则正常进入，无密码则设置密码
                        var user = amGloble.metadata.userInfo;
                        if (user.password) {
                            // $.am.changePage(amGloble.page.dashboard, "slideleft");
                            if(self.backInfo){
                                $.am.changePage(amGloble.page.videodetails, "slideleft",self.backInfo);
                                return
                            }
                            if(amGloble.page.education.$.find('.tab-main .active').index()==1){

                                $.am.changePage(amGloble.page.dashboard, "slideleft");
                            }else if(amGloble.page.education.$.find('.tab-main .active').index()==2) {
                                $.am.changePage(amGloble.page.userinfo, "slideleft");
                            }
                            cb && cb();
                        } else {
                            if(scb){
                                scb();
                            }else{
                                $.am.changePage(amGloble.page.userinfoResetPwd, "slideleft", {
                                    phone: user.mobile,
                                    shopId: user.shopId,
                                    userId: user.userId,
                                    userType: user.userType,
                                    backPage: amGloble.page.login,
                                    scb: function() {
                                        // $.am.changePage(amGloble.page.dashboard, "slideleft");
                                        if(self.backInfo){
                                            $.am.changePage(amGloble.page.videodetails, "slideleft",self.backInfo);
                                            return
                                        }
                                        if(amGloble.page.education.$.find('.tab-main .active').index()==1){
                                            $.am.changePage(amGloble.page.dashboard, "slideleft");
                                        }else if(amGloble.page.education.$.find('.tab-main .active').index()==2) {
                                            $.am.changePage(amGloble.page.userinfo, "slideleft");
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else if (ret.code == 200001 && ret.content.length) {
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
                                self.login(userName, pwd, user);
                            });
                        }, 1);
                    });

                }else if(ret.code == 203017){
                    if(fcb){
                        fcb();
                    }else{
                        //需要绑定手机号
                        var _userInfo = ret.content.userInfo;
                        $.am.changePage(amGloble.page.userinfoResetPwd, "slideleft", {
                            shopId: _userInfo.shopId,
                            userId: _userInfo.userId,
                            userType: _userInfo.userType,
                            boundPhone: true
                        });
                    }
                    
                } else {
                    //登录失败
                    amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                }
            });
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
            for(var i=0;i<array.length;i++){
                array[i].shopName = (array[i].osName==' ' || array[i].osName=='' || array[i].osName==null)?((array[i].shopName==' ' || array[i].shopName=='' || array[i].shopName==null)?'门店名称未设定':array[i].shopName):array[i].osName;
            }
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
        getMetadata: function(scb, fcb) {
            var self = this;
            var callbacked = false;
            var getOnce = function() {
                amGloble.loading.show("正在登录,请稍候...");
                amGloble.api.metadata.exec({
                    parentShopId: config.parentShopId,
                    token: config.token
                }, function(ret, isLocal) {
                    amGloble.loading.hide();
                    if (!callbacked) {
                        if (ret.code == 0 && ret.content) {
                            callbacked = true;
                            amGloble.metadata = amGloble.processMetadata($.extend(true, {}, ret.content));
                            //初始化下拉菜单
                            amGloble.storeSelect.init();
                            scb && scb();
                        } else {
                            if(confirm("获取数据失败，确定重试吗？")){
                                getOnce();
                            }
                            // amGloble.messageBox("获取数据失败", "点击确认重试", function() {
                                
                            // });
                        }
                    }
                });
            }

            getOnce();

        },
        reset: function(logout, dontReload) {
            var isFirstSign = localStorage.getItem("isFirstSign");
            if (!config.demoUser && logout) {
                //如果不是演示账号，并且是登出操作，则只清理token
                this.saveConfig({
                    token: ""
                });
            } else {
                localStorage.clear();
            }
            if(isFirstSign){//保留这个缓存
                localStorage.setItem("isFirstSign",isFirstSign);
            }
            this.$username.val("");
            this.$password.val("");
            this.$title.empty();
            if (!dontReload) {
                location.reload();
            }
        },
        logout: function(dontReload) {
            var self = this;
            var user = amGloble.metadata.userInfo;
            amGloble.api.logout.exec({
                "userId": user.userId,
                "userType": user.userType,
            }, function(ret) {
                if (ret.code == 0) {} else {
                    amGloble.msg(ret.message || "数据获取失败,请检查网络!");
                }
                self.reset(true, dontReload);
            });
        },
        render: function() {
            this.$username.val(config.phone || "");
            this.$password.val("");
            delete this.demoUser;
        }
    });

})();

(function() {

    var cfg = {
        appids: [{
            name: "新_美一客_PRD",
            value: "n_meiyike",
        }, {
            name: "新_美一客_STA",
            value: "n_meiyike_staging",
        }, {
            name: "新_美一客_TEST",
            value: "n_meiyike_test",
        }, {
            name: "新_美一客_DEV",
            value: "n_meiyike_develop",
        }, {
            name: "新_生意宝_PRD",
            value: "n_shengyibao",
        }, {
            name: "新_生意宝_STA",
            value: "n_shengyibao_staging",
        }, {
            name: "新_生意宝_TEST",
            value: "shengyibao_test",
        }, {
            name: "新_生意宝_DEV",
            value: "shengyibao_develop",
        }, {
            name: "新_无纸化_PRD",
            value: "n_paperless",
        }, {
            name: "新_无纸化_STA",
            value: "n_paperless_staging",
        }, {
            name: "新_无纸化_DEV",
            value: "n_paperless_test",
        }, {
            name: "新_触屏版_PRD",
            value: "n_touchPad",
        }, {
            name: "新_触屏版_STA",
            value: "n_touchPad_staging",
        }, {
            name: "新_触屏版_TEST",
            value: "n_touchPad_test",
        }, {
            name: "新_触屏版_TEST1",
            value: "n_touchPad_test1",
        }, {
            name: "新_触屏版_DEV",
            value: "n_touchPad_develop",
        }, {
            name: "老_美一客_PRD",
            value: "MeiyikeApp",
        }, {
            name: "老_美一客_STA",
            value: "MeiyikeApp_staging",
        }, {
            name: "老_美一客_DEV",
            value: "MeiyikeApp_test",
        }, {
            name: "老_生意宝_PRD",
            value: "BusinessApp",
        }, {
            name: "老_生意宝_STA",
            value: "BusinessApp_staging",
        }, {
            name: "老_生意宝_DEV",
            value: "BusinessApp_test",
        }, {
            name: "老_无纸化_PRD",
            value: "Paperless",
        }, {
            name: "老_无纸化_STA",
            value: "Paperless_staging",
        }, {
            name: "老_无纸化_DEV",
            value: "Paperless_test",
        }, {
            name: "TestApp",
            value: "TestApp",
        }],
        servers: [{
            name: "生产(新)",
            value: "http://mas.reeli.cn",
        }],
        tenants: [{
            name: "通用版",
            value: "",
        }, {
            name: "演示租户1",
            value: "10160",
        }, {
            name: "演示租户2",
            value: "10005",
        }, {
            name: "演示租户3",
            value: "14573",
        }]
    };


    var self = am.page.engineering = new $.am.Page({
        id: "page_engineering",
        init: function() {
            var self = this;
            this.$.find(".buttonGroup > .cancel").vclick(function() {
                $.am.page.back();
            });

            this.$selAppid = this.$.find("#engineeringSelectAppid");
            this.$selServer = this.$.find("#engineeringSelectServer");
            this.$selTenant = this.$.find("#engineeringSelectTenant");

            this.$inputAppid = this.$.find("#engineeringInputAppid");
            this.$inputServer = this.$.find("#engineeringInputServer");
            this.$inputTenant = this.$.find("#engineeringInputTenant");

            this.$save = this.$.find("#engineering_save").vclick(function() {
                self.clearLocalStorage(function() {
                    self.resetConfig(function() {
                        self.saveConfig(function() {
                            self.renderConfig(function() {
                                alert("设置成功，干掉APP再打开！");
                            });
                        });
                    });
                });
            });
            this.$reset = this.$.find("#engineering_reset").vclick(function() {
                self.clearLocalStorage(function() {
                    self.resetConfig(function() {
                        self.renderConfig(function() {
                            alert("清除APP数据成功");
                        });
                    });
                });
            });
            this.$clear = this.$.find("#engineering_clear").vclick(function() {
                self.clearLocalStorage(function() {
                    alert("localStorage 已被清空！");
                });
            });

            //开启关闭debug操作
            this.$.debug = this.$.find("#engineering_debug").vclick(function() {
                if ($.am.debug.enable) {
                    $.am.debug.log("log close");
                    $.am.debug.enable = false;
                    localStorage.removeItem("WEIKEAPP_debug");
                    $(this).text('开');
                } else {
                    $.am.debug.enable = true;
                    localStorage.setItem("WEIKEAPP_debug", "open");
                    $.am.debug.log("log open");
                    $(this).text('关');
                }
            });

        },
        beforeShow: function(paras) {
            this.renderList(cfg.appids, this.$selAppid);
            this.renderList(cfg.servers, this.$selServer);
            this.renderList(cfg.tenants, this.$selTenant);
            this.renderConfig();
            $.am.debug.enable = true;
            localStorage.setItem("WEIKEAPP_debug", "open");
            $.am.debug.log("log open");

            //给debug按钮赋值
            this.$.debug.text('关');
        },
        afterShow: function() {},
        beforeHide: function() {},
        renderList: function(data, $select) {
            $select.empty();
            $.each(data, function(i, item) {
                $select.append("<option value='" + item.value + "'>" + item.name + "(" + item.value + ")</option>");
            });
        },

        renderConfig: function(scb) {
            var self = this;
            setTimeout(function() {
                navigator.appplugin.getAppInfo(function(ret) {
                    var text = JSON.stringify(JSON.parse(ret), null, "  ");
                    $.am.debug.log("getAppInfo:succ:" + text);
                    self.$.find(".info").text(text);
                    scb && scb();
                });
            }, 100);
        },
        saveConfig: function(scb) {
            var self = this;
            setTimeout(function() {

                navigator.appplugin.changeAppInfo({
                    "appid": self.$inputAppid.val() || self.$selAppid.val() || null,
                    "masserver": self.$inputServer.val() || self.$selServer.val() || null,
                    "tenantid": self.$inputTenant.val() || self.$selTenant.val() || "",
                }, function(msgCode) {
                    $.am.debug.log("changeAppInfo:succ");
                    scb && scb();
                }, function(msg) {
                    alert(msg);
                });
            }, 100);
        },
        resetConfig: function(scb) {

            setTimeout(function() {
                navigator.appplugin.removeAppInfo(function(msgCode) {
                    $.am.debug.log("resetConfig:succ");
                    scb && scb();
                }, function(msg) {
                    alert(msg);
                });
            }, 100);
        },
        clearLocalStorage: function(scb) {
            localStorage.clear();
            $.am.debug.log("clearLocalStorage:succ");
            scb && scb();
        }
    });
})();

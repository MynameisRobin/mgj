 //container.js for simulator

window.device = {
    name: "",
    platform: "",
    uuid: "moke uuid",
    version: "",
    webapp: false
};

$(function() {
    window.device.platform = device2.ios() ? "iOS" : "Android";
    setTimeout(function() {
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('deviceready', false, false);
        document.dispatchEvent(ev);
    }, 1);
});

navigator.appplugin = {
    appMetadata: function(scb, fcb) {
        var meta = {
            token: "mock token",
            tenantid: ""
        };
        scb && scb(JSON.stringify(meta));
    },
    share: function(content, title, image, url, scb, fcb) {
        scb && scb();
    },
    changeAppInfo: function(opt, scb) {
        console.log("changeAppInfo", opt);
        scb && scb();
    },
    removeAppInfo: function(scb) {
        console.log("removeAppInfo");
        scb && scb();
    },
    getAppInfo: function(scb) {
        console.log("getAppInfo");
        scb && scb(JSON.stringify({
            "appid": "test",
            "masserver": "test",
            "tenantid": "test",
        }));
    },
    rotateToLandscape: function(scb) {
        console.log("rotateToLandscape");
        scb && scb();
    },
    rotateToPortrait: function(scb) {
        console.log("rotateToPortrait");
        scb && scb();
    },
    btPrint: function(printData, p, scb, fcb) {
        console.log("btPrint", printData);
        scb && scb();
    }
};

navigator.notification = {
    confirm: function(content, callback, title, buttonsText) {
        setTimeout(function() {
            if (window.confirm(content)) {
                callback && callback(1);
            } else {
                callback && callback(2);
            }
        }, 100);
    },
    alert: function(content, callback, title, buttonText) {
        setTimeout(function() {
            window.alert(content);
            callback && callback();
        }, 100);
    }
};

if (!window.plugins) {
    window.plugins = {};
}

//

(function() {
    var html = "";
    html += '<div class="cordova-popup">';
    html += '<div class="cordova-popup-wrap">';
    html += '<div class="cordova-actionsheet">';
    html += '<div class="title">';
    html += '<span class="text">请在新页面完成支付</span>';
    html += '</div>';
    html += '<div class="sheetWrap">';
    html += '<ul class="sheet list">';
    html += '<li class="am-clickable"></li>';
    html += '</ul>';
    html += '</div>';
    html += '<ul class="sheet btn">';
    html += '</ul>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    var actionsheet = {
        init: function() {
            var self = this;
            this.$ = $(html).appendTo("body");

            this.$title = this.$.find(".title");

            this.$ul = this.$.find("ul.sheet");
            this.$li = this.$ul.children(":first");

            this.$ul.eq(0).on("vclick", "> li", function() {
                self.callback && self.callback($(this).index() + 1);
                self.$.hide();
            });
            this.$ul.eq(1).on("vclick", "> li", function() {
                self.callback && self.callback();
                self.$.hide();
            });
        },
        show: function(opt, callback) {
            var self = this;
            if (!this.scrollview) {
                this.scrollview = new $.am.ScrollView({
                    $wrap: self.$.find(".sheetWrap"),
                    $inner: self.$.find("ul.list"),
                    direction: [false, true],
                    hasInput: false
                });
            };
            this.callback = callback;
            this.$title.html(opt.title);
            var $ul = this.$ul.empty();
            $.each(opt.buttonLabels, function(i, item) {
                $ul.eq(0).append(self.$li.clone(true, true).html(item));
            });
            $ul.eq(1).append(this.$li.clone(true, true).html(opt.addCancelButtonWithLabel).addClass("dark"));
            this.$.show();

            this.scrollview.refresh();
        }
    };
    actionsheet.init();

    window.plugins.actionsheet = actionsheet;

})();

//imagePicker
(function() {
    var html = [];
    html.push('<div class="cordova-popup">');
    html.push('<div class="cordova-popup-wrap">');
    html.push('<div class="cordova-imagePicker">');
    html.push('<div class="input">选择图片<input type="file" accept="image/*"></div>');
    html.push('<div class="photo"></div>');
    html.push('<div class="buttonGroup">');
    html.push('<span class="button ok">确定</span>');
    html.push('<span class="button light cancel">取消</span>');
    html.push('</div></div></div></div>');
    html = html.join("\n");

    var imagePicker = {
        init: function() {
            var self = this;
            this.$ = $(html).appendTo("body");
            this.$inputContainer = this.$.find(".input");
            this.$input = this.$inputContainer.find("input");
            this.$photo = this.$.find(".photo");
            this.$ok = this.$.find(".button.ok").click(function() {
                var ret = self.result.split(",");
                self.scb && self.scb(ret[1]);
                self.hide();
            });
            this.$cancel = this.$.find(".button.cancel").click(function() {
                self.hide();
                self.fcb && self.fcb();
            });
            this.$inputContainer.on("change", "input", function(e) {
                console.log("change");
                var file = e.target.files || e.dataTransfer.files;
                if (file) {
                    try {
                        var reader = new FileReader();
                        reader.onload = function() {
                            //alert(this.result);
                            try {
                                self.result = this.result;
                                self.$photo.append("<img src='" + this.result + "'/>");
                            } catch (a) {
                                alert(a);
                            }
                        };

                        reader.readAsDataURL(file[0]);
                    } catch (e) {
                        alert(e);
                    }
                }
            });

        },
        show: function(a, b, c, d, e, scb, fcb) {
            this.scb = scb;
            this.fcb = fcb;
            this.$.show();
        },
        hide: function() {
            delete this.scb;
            delete this.fcb;
            this.$inputContainer.empty().append(this.$input.clone(true, true));
            this.$photo.empty();
            this.$.hide();
        }
    };
    imagePicker.init();

    navigator.appplugin.imagePicker = function(a, b, c, d, e, scb, fcb) {
        imagePicker.show(a, b, c, d, e, scb, fcb);
        console.log(a, b, c, d, e, scb, fcb);
    };

})();

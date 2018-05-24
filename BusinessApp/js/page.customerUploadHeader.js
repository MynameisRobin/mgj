
amGloble.page.uploadHeader = new $.am.Page({
    id: "page_uploadHeader",
    disableScroll: true,
    init: function() {
        var _this = this;
        this.$header.find(".left").vclick(function() {
            if (_this.seted) {
                atMobile.nativeUIWidget.confirm({
                    caption: "头像未保存",
                    description: "头像已修改,但未保存数据,是否要放弃此次操作?",
                    okCaption: "放弃",
                    cancelCaption: "保存"
                }, function() {
                    $.am.page.back("slidedown");
                }, function() {
                    _this.$save.trigger("vclick");
                });
            } else {
                $.am.page.back("slidedown");
            }
        });
        this.$title = this.$.find("div.title");

        // if (window.device && window.device.platform == "Android") {
        this.$photos = this.$.find("div.header").bind("vclick", function() {
            var $this = $(this);
            amGloble.photo.selectPhoto($this, function() {
                _this.seted = 1;

                var size = 124;
                if (size) {
                    var nW = $this.find("img")[0].naturalWidth;
                    var nH = $this.find("img")[0].naturalHeight;
                    if (nW > nH) {
                        $this.find("img").css({
                            "position": "relative",
                            "left": (-(size * nW / nH - size) / 2) + "px",
                            "height": size + "px",
                            "width": "auto"
                        });
                    } else {
                        $this.find("img").css({
                            "position": "relative",
                            "top": (-(size * nH / nW - size) / 2) + "px",
                            "width": size + "px",
                            "height": "auto"
                        });
                    }
                }
            }, {
                "dir": "customer/" + amGloble.metaData.userInfo.tenant + "/" + _this.data.storeId + "/",
	            "name": "UUID",
	            "trim": true,
                "variations": [{
                    "suffix": "l",
                    "resolution": "640*640"
                }, {
                    "suffix": "m",
                    "resolution": "480x480"
                }, {
                    "suffix": "s",
                    "resolution": "240X240"
                }, {
                    "suffix": "h",
                    "resolution": "100X100"
                }]
            });
        });

        this.$save = this.$.find("span.right").vclick(function() {
            var id = _this.$photos.data("id");
            if (!id) {
                amGloble.msg("请设置头像！");
            }
            amGloble.loading.show();
            amGloble.api.setCustomerParameters.exec({
                "id": _this.data.id,
                "tenantId": amGloble.tenantId,
                "photoPath": id
            }, function(ret) {
                amGloble.loading.hide();
                if (ret && ret.result == 0 && ret.responseData && ret.responseData.result == 0) {
                    amGloble.msg("设置成功！");
                    $.am.page.back("slidedown");
                    _this.data.photoPath = id;
                    amGloble.page.custDetail.render();
                } else {
                    amGloble.msg("设置失败！");
                }
            });
        });
        this.$.find("div.download").vclick(function() {
            atMobile.nativeUIWidget.openUrl({
                url: "http://meiyan.meitu.com/mobile/"
            }, function() {

            }, function() {
                amGloble.msg("打开失败");
            });
        });
    },
    beforeShow: function(paras) {
        $.am.tab.hideAll();
        this.data = paras;
        this.render();
    },

    afterShow: function() {},

    render: function() {
        var _this = this;
        // if (window.device && window.device.platform == "Android") {

        this.seted = false;
        this.$photos.empty();
        if (this.data.photoPath) {
            this.$photos.html($("<img />").getPicture(this.data.photoPath, null, null, "h").setCenter(124));
        }
        this.$title.text("为" + this.data.name + "设定头像");

        var lastAlertTime = localStorage.getItem("custDetail_setPicture_android_tips");

    }
});

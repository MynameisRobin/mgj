amGloble.page.addCustomer = new $.am.Page({
    id: "page-addCustomer",
    init: function () {
        var self = this;
        self.mainScroll = new $.am.ScrollView({
            $wrap: self.$.find(".am-body-wrap"),
            $inner: self.$.find(".add_customer-scroll"),
            direction: [0, 1]
        });

        self.$.on("vclick", ".save_btn", function () {
            //$.am.changePage($.am.history[$.am.history.length-1],"slideleft")
            // $.am.changePage(amGloble.page.customerDetail, "slideleft", {
            //     custId: item.id,
            //     shopid: item.shopid,
            //     $li: $this
            // });
            var $phone = self.$.find("input[name='memberPhone']");
            var val = $.trim($phone.val());
            if (!self.mbRepeatConfig && val) {
                self.checkmb(val,function(){
                    next();
                },function(){
                    $phone.val('');
                })
            } else {
                next();
            }
            function next() {
                var shop = amGloble.storeSelect.getCurrentShops();
                if (typeof shop == 'undefined') {
                    amGloble.msg("请选择门店后再添加新顾客!");
                    return;
                }
                var sex = self.$.find("input[name='sex']:checked").val();
                if (sex == 0) {
                    sex = 'F';
                } else {
                    sex = 'M';
                }
                var name = self.$.find("input[name='memberName']").val();
                var phone = self.$.find("input[name='memberPhone']").val();
                var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
                if (name == '' || name.length > 10) {
                    amGloble.msg("请输入0-10个字符的名字");
                    return;
                } else if (!myreg.test(phone)) {
                    amGloble.msg("请输入有效的手机号码！");
                    return;
                }
                var memberMark = self.$.find("textarea[name='memberMark']").val();
                var opt = {
                    sex: sex,
                    name: name,
                    shopId: shop.shopId,
                    parentShopId: shop.parentShopId,
                    sourceId: 5,
                    mobile: phone,
                    page: memberMark
                };
                if (amGloble.metadata.userInfo.userType == 1) {
                    opt.empId = amGloble.metadata.userInfo.userId;
                }

                self.submitInfo(opt);
            }
        });
    },
    mbRepeatConfig: false,
    checkmb: function (v, scb, fcb) {
        amGloble.api.checkMobile.exec({
            "mobile": v,
            "shopId": amGloble.metadata.userInfo.shopId
        }, function (res) {
            // am.loading.hide();
            console.log(res);
            if (res.code == 13001) {
                amGloble.msg("手机号码重复，请换个手机号码！");
                fcb && fcb();
            } else if (res.code == 0) {
                scb && scb();
            } else {
                amGloble.msg("手机号码校验失败！");
            }
        });
    },
    beforeShow: function (paras) {
        var self = this;

        this.setStatus("loading");
        var configs = amGloble.metadata.configs;
        if (configs && configs['mobileRepeat']) {
            this.mbRepeatConfig = JSON.parse(configs['mobileRepeat']);
        }

    },

    afterShow: function (paras) {
        var self = this;
        self.mainScroll.refresh();
        self.setStatus("normal");
    },

    submitInfo: function (opt) {
        var self = this;
        self.setStatus("loading");
        amGloble.api.addNewCustomer.exec(opt, function (ret) {
            self.setStatus("normal");
            if (ret.code == 0) {
                amGloble.msg("添加成功!");
                //还原设置
                self.$.find("input[name='sex']").removeAttr("checked")
                self.$.find("input[name='sex'].woman").prop("checked", true);
                self.$.find("input[name='memberPhone']").val("");
                self.$.find("input[name='memberName']").val("");
                self.$.find("textarea[name='memberMark']").val("");
                setTimeout(function () {
                    $.am.changePage($.am.history[$.am.history.length - 1], "slideleft")
                }, 1000);
            } else {
                amGloble.msg(ret.message);
            }
        });
    }
});

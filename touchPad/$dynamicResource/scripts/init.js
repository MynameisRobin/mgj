NativeDate = Date;
Date = function(){
    if(!arguments.length){
        return window.am.now();
    }else{
        var d = new (Function.prototype.bind.apply(NativeDate,[Date].concat(Array.prototype.slice.call(arguments))))();
        Object.setPrototypeOf(d, NativeDate.prototype);
        return d;
    }
}

var config;
window.am = {
    page: {},
    tab: {},
    popup: {},
    clone: function(data) {
        try {
            return JSON.parse(JSON.stringify(data));
        } catch (e) {
            return data;
        }
    },
    isNull: function(val) {
        if (val == null || val == undefined || val == "") {
            return true;
        }
        return false;
    },
    getCalenderSelector: function(cb) {
        this.calenderSelectorCb = cb;
        if (!this.calenderSelectorObj) {
            var $calenderSelector = $("<div></div>");
            var now = amGloble.now();
            now.setFullYear(now.getFullYear() + 10);
            this.calenderSelectorObj = $calenderSelector
                .mobiscroll()
                .calendar({
                    theme: "mobiscroll",
                    lang: "zh",
                    display: "bottom",
                    months: "auto",
                    min: amGloble.now(),
                    max: now,
                    setOnDayTap: true,
                    buttons: [],
                    onSet: function(obj, inst) {
                        am.calenderSelectorCb(obj.valueText);
                    }
                })
                .mobiscroll("getInst");
        }
        return this.calenderSelectorObj;
    },
    clearUserData: function(parentShopId, userId) {
        var lastLoginUser = localStorage.getItem("lastLoginUser");
        var currentLoginUser = parentShopId + "_" + userId;
        if (lastLoginUser != currentLoginUser) {
            $.am.debug.log("切换了账号");
            //如果切换了账号，清除缓存设置
            localStorage.removeItem("setting_seller");
            localStorage.removeItem("setting_cashierService");
            am.page.service.billMain.setting = null;
            am.page.product.billMain.setting = null;
            am.page.comboCard.billMain.setting = null;
            am.page.memberCard.billMain.setting = null;
        }
        localStorage.setItem("lastLoginUser", currentLoginUser);
    },
    getPriceRange: function(list, price) {
        list = am.clone(list);
        var res, max, min, maxArr, minArr;
        if (list && list.length) {
            list.unshift({
                name: "默认",
                price: price
            });
            list.sort(function(a, b) {
                return a.price - b.price;
            });
            maxArr = list.pop();
            minArr = list.slice(0, 1);
            min = minArr[0].price;
            max = maxArr.price;
        }
        if (min && max) {
            res = min + " ~ " + max;
        }
        return res;
    },
    setMetadata: function(data) {
        this.metadata = data;
        //处理configs
        this.metadata.configs = am.arr2obj(this.metadata.configs || []);
        //处理项目拼音
        data.serviceItemMap = {};
        data.serviceCodeMap = {};
        if (data.classes && data.classes.length) {
            for (var i = 0; i < data.classes.length; i++) {
                var sub = data.classes[i].sub;
                var depcode = data.classes[i].depcode;
                if(sub && sub.length){
                    for (var j = 0; j < sub.length; j++) {
                        try {
                            sub[j].pinyin = codefans_net_CC2PY(sub[j].name).substr(0, 1).toUpperCase();
                        } catch (e) {
                            sub[j].pinyin = "";
                        }
                        if (depcode) {
                            sub[j].depcode = depcode;
                        }

                        if(sub[j].mgjAdjustPrice && typeof (sub[j].mgjAdjustPrice) === 'string'){
                            try{
                                sub[j].mgjAdjustPrice = JSON.parse(sub[j].mgjAdjustPrice);
                                sub[j].priceRange     = this.getPriceRange(sub[j].mgjAdjustPrice.itemList,sub[j].price);
                            }catch (e){
                                throw 'data.mgjAdjustPrice  JSON.parse Error';
                            }
                        }

                        data.serviceItemMap[sub[j].id] = sub[j];
                        data.serviceCodeMap[sub[j].itemid] = sub[j];
                    }
                }
            }
        }

        //卡类型
        data.cardTypeMap = {};
        if (data.cardTypeList && data.cardTypeList.length) {
            for (var i = 0; i < data.cardTypeList.length; i++) {
                data.cardTypeMap[data.cardTypeList[i].cardtypeid] = data.cardTypeList[i];
            }
        }

        //处理卖品拼音
        data.categoryItemMap = {};
        if (data.category && data.category.length) {
            for (var i = 0; i < data.category.length; i++) {
                var sub = data.category[i].depotList;
                if(sub && sub.length){
                    for (var j = 0; j < sub.length; j++) {
                        try {
                            sub[j].pinyin = codefans_net_CC2PY(sub[j].name).substr(0, 1).toUpperCase();
                        } catch (e) {

                        }
                        sub[j].categoryName = data.category[i].type;
                        data.categoryItemMap[sub[j].id] = sub[j];
                    }
                }
            }
        }

        var sub = data.cardTypeList;
        var rule = data.cardpresruleList;
        if (sub && sub.length) {
            for (var j = 0; j < sub.length; j++) {
                try {
                    sub[j].pinyin = codefans_net_CC2PY(sub[j].cardtypename)
                        .substr(0, 1)
                        .toUpperCase();
                } catch (e) {}
                sub[j].bonusRule = [];
                for (var k = 0; k < rule.length; k++) {
                    if (rule[k].cardtypeid == sub[j].cardtypeid) {
                        sub[j].bonusRule.push(rule[k]);
                    }
                }
                if (sub[j].bonusRule.length > 1) {
                    sub[j].bonusRule.sort(function(a, b) {
                        return b.chargefee - a.chargefee;
                    });
                }
            }
        }

        var sub = data.tpList;
        if (sub && sub.length) {
            for (var j = 0; j < sub.length; j++) {
                try {
                    sub[j].pinyin = codefans_net_CC2PY(sub[j].packName)
                        .substr(0, 1)
                        .toUpperCase();
                } catch (e) {}
                sub[j].tpd = [];
                sub[j].price = 0;
                for (var k = 0; k < data.tpdList.length; k++) {
                    if (data.tpdList[k].packageId == sub[j].id) {
                        sub[j].tpd.push(data.tpdList[k]);
                        sub[j].price += data.tpdList[k].itemMoney;
                    }
                }
            }
        }

        var em = data.employeeList;
        var lv = data.employeeLevels;
        var ro = data.employeeRoles;

        ro.sort(function(a, b) {
            return a.id - b.id;
        });

        var deps = {};
        if (ro && ro.length) {
            for (var i = 0; i < ro.length; i++) {
                var dk = ro[i].depcode.toString();
                if (typeof deps[dk] != "number") {
                    deps[dk] = 0;
                } else {
                    deps[dk]++;
                }
                ro[i].pos = deps[dk];
            }
        }

        if (em && em.length) {
            data.empMap = {};
            for (var i = 0; i < em.length; i++) {
                for (var j = 0; j < lv.length; j++) {
                    if (lv[j].dutyId == em[i].dutyid) {
                        em[i].dutyType = lv[j].dutyType;
                        em[i].dutyName = lv[j].name;
                        break;
                    }
                }

                for (var j = 0; j < ro.length; j++) {
                    if (ro[j].id == em[i].dutyType) {
                        em[i].pos = ro[j].pos;
                        break;
                    }
                }
                data.empMap[em[i].id] = em[i];
            }
        }

        // if (data.configs.v4_tenantLogo) {
        //     var $img = am.photoManager.createImage(
        //         "tenantLogo",
        //         {
        //             parentShopId: am.metadata.userInfo.parentShopId
        //         },
        //         data.configs.v4_tenantLogo
        //     );
        //     $("#tab_main .logo").html(
        //         $img
        //             .load(function() {
        //                 $(this)
        //                     .show()
        //                     .parent()
        //                     .addClass("loaded");
        //                 localStorage.setItem("TP_logo", $(this).attr("src"));
        //             })
        //             .error(function() {
        //                 $("#tab_main .logo").addClass("mgj");
        //             })
        //     );
        // } else {
        //     $("#tab_main .logo").addClass("mgj");
        //     localStorage.removeItem("TP_logo");
        // }

        //websocket 初始化
        am.socketPush.login();

        am.operateArr = data.userInfo.operatestr.split(",");

        var payCfg = [
            {
                field: "CASH",
                fieldname: "现金",
                status: "1",
                type: "1",
                operateCode: "a01"
            },
            {
                field: "UNIONPAY",
                fieldname: "银联",
                status: "1",
                type: "1",
                operateCode: "a02"
            },
            {
                field: "PAY",
                fieldname: "支付宝",
                status: "1",
                type: "1",
                operateCode: "a03"
            },
            {
                field: "WEIXIN",
                fieldname: "微信",
                status: "1",
                type: "1",
                operateCode: "a04"
            },
            {
                field: "DIANPIN",
                fieldname: "大众点评",
                status: "1",
                type: "1",
                operateCode: "a05"
            },
            {
                field: "MALL",
                fieldname: "商场卡",
                status: "1",
                type: "1",
                operateCode: "a06"
            },
            {
                field: "COOPERATION",
                fieldname: "合作券",
                status: "1",
                type: "1",
                operateCode: "a07"
            },
            {
                field: "CARDFEE",
                fieldname: "划卡",
                status: "1",
                type: "0",
                operateCode: "a08"
            },
            {
                field: "PRESENTFEE",
                fieldname: "划赠送金",
                status: "1",
                type: "0",
                operateCode: "a09"
            },
            {
                field: "DIVIDEFEE",
                fieldname: "分期赠送金",
                status: "1",
                type: "0",
                operateCode: "a10"
            },
            {
                field: "VOUCHERFEE",
                fieldname: "代金券",
                status: "1",
                type: "0",
                operateCode: "a11"
            },
            {
                field: "DEBTFEE",
                fieldname: "欠款",
                status: "1",
                type: "2", //是非现，但是不管是什么情况都可以用，所以算2
                operateCode: "a12"
            },
            {
                field: "MDFEE",
                fieldname: "免单",
                status: "1",
                type: "0",
                operateCode: "a13"
            }
        ];

        if (!data.payConfigs) {
            data.payConfigs = [];
        }
        if (!data.payConsumeConfigs) {
            data.payConsumeConfigs = [];
        }

        for (var i = 0; i < data.payConfigs.length; i++) {
            if (data.payConfigs[i].field.indexOf("OTHERFEE") != -1) {
                data.payConfigs[i].operateCode = "a00";
                payCfg.push(data.payConfigs[i]);
            }
        }

        for (var i = 0; i < payCfg.length; i++) {
            if (am.operateArr.indexOf(payCfg[i].operateCode) != -1) {
                payCfg[i].status = "0";
            }
        }

        var consumeCfg = data.payConsumeConfigs;
        am.payConfigMap = [];
        for (var i = 0; i < 5; i++) {
            am.payConfigMap[i] = {};
            var tempConsumeCfg = null;
            for (var j = 0; j < consumeCfg.length; j++) {
                if (consumeCfg[j].consumetype * 1 == i) {
                    tempConsumeCfg = consumeCfg[j];
                }
            }
            for (var k = 0; k < payCfg.length; k++) {
                if (payCfg[k].status == "1") {
                    var key = payCfg[k].field;
                    if (tempConsumeCfg && tempConsumeCfg.paytypes) {
                        var paytypes = tempConsumeCfg.paytypes.split(",");
                        //有营业类别配置
                        if (paytypes.indexOf(key) == -1) {
                            //没有关闭
                            if (i == 2 || i == 3) {
                                //就算有配置，如果是开卡充值，也不显示非现，因为现金非现可能会在配置后改
                                if (payCfg[k].type == "1" || payCfg[k].type == "2") {
                                    am.payConfigMap[i][key] = payCfg[k];
                                }
                            } else {
                                am.payConfigMap[i][key] = payCfg[k];
                            }
                        }
                    } else if (i == 2 || i == 3) {
                        //开卡，充值, 只需要现金类
                        if (payCfg[k].type == "1" || payCfg[k].type == "2") {
                            am.payConfigMap[i][key] = payCfg[k];
                        }
                    } else if (key == "MDFEE") {
                        if (i == 0) {
                            am.payConfigMap[i][key] = payCfg[k];
                        }
                    } else if (key == "VOUCHERFEE") {
                        if (i == 0 || i == 1) {
                            am.payConfigMap[i][key] = payCfg[k];
                        }
                    } else {
                        //没有配置，按默认配置来
                        am.payConfigMap[i][key] = payCfg[k];
                    }
                }
            }
        }

        am.discountMap = {};
        var scd = data.serviceitemcarddiscountList;
        if (scd && scd.length) {
            for (var i = 0; i < scd.length; i++) {
                am.discountMap[scd[i].cardtypeid + "_" + scd[i].itemId] = scd[i];
            }
        }

        if (am.operateArr.indexOf("a1") != -1) {
            am.page.service.billMain.checkSpecified = 0;
            am.page.service.billServerSelector.checkSpecified = 0;
        }
        if (am.operateArr.indexOf("a32") != -1 && amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
            am.page.service.billServerSelector.hideServer = 1;
        }

        am.payConfigMap[5] = {};
        //混合收银，只找项目和卖品都支持的支付方式
        for (var i in am.payConfigMap[0]) {
            if (am.payConfigMap[1][i]) {
                am.payConfigMap[5][i] = am.payConfigMap[1][i];
            }
        }

        var pow1st = "",
            a21 = 0;
        //控制菜单权限
        am.tab.main._$items.each(function() {
            var pow = $(this).data("pow");
            if (am.operateArr.indexOf(pow) != -1 || pow == "a22") {
                $(this).hide();
            } else {
                //要显示的
                pow1st = pow;
                if (pow == "a21") a21 = 1;
                $(this).show();
            }
        });
        
        return a21 ? "a21" : pow1st;
    },
    confirm: function(caption, description, okCaption, cancelCaption, scb, fcb) {
        atMobile.nativeUIWidget.confirm(
            {
                caption: caption,
                description: description,
                okCaption: okCaption,
                cancelCaption: cancelCaption
            },
            scb,
            fcb
        );
    },
    msg: function(msg) {
        $.am.instanceMessage.show(msg);
    },
    checkCrossConsum: function(shopId) {
        //本店可消费
        if (shopId == this.metadata.userInfo.shopId) {
            return true;
        }
        //跨店
        //是否属于直营店
        var customerShopType = 0;
        for (var i = 0; i < this.metadata.shopList.length; i++) {
            if (this.metadata.shopList[i].shopId == shopId) {
                customerShopType = this.metadata.shopList[i].softgenre;
            }
        }
        if (customerShopType == 2) {
            //属于直营店
            var selfShopType = this.metadata.userInfo.shopType;
            if (selfShopType == 2) {
                //本店为直营店可消费
                return true;
            } else {
                //本店不为直营店不可消费
                return false;
            }
        } else {
            //不属于直营店不可消费
            return false;
        }
    },
    loading: {
        show: function(e, area) {
            $.am.modalLoading.show(e, area);
        },
        hide: function() {
            $.am.modalLoading.hide();
        }
    },
    loginout: {
        show: function() {
            $("#loading_out").show();
        },
        hide: function() {
            $("#loading_out").hide();
        }
    },
    //am.popupMenu("请选择客户级别", [{name:"普通用户"}, {name:"高级用户"}], function (ret) {_this.$level.find("p.text").text(ret.name);})
    popupMenu: function(title, items, cb, keyName, muti, cancel) {
        var itemsText = [];
        for (var i = 0; i < items.length; i++) {
            itemsText.push(items[i][keyName || "name"]);
        }
        atMobile.nativeUIWidget.showPopupMenu(
            //cancel 1、不传-返回 2、function - 取消的回调 3、null 不显示 cancel按钮
            {
                title: title,
                items: itemsText,
                muti: muti,
                cancel: cancel
            },
            function(idx) {
                if (typeof idx === "number") {
                    cb && cb(items[idx]);
                } else if (typeof idx === "object") {
                    var selected = [];
                    for (var i = 0; i < idx.length; i++) {
                        selected.push(items[idx[i]]);
                    }
                    cb && cb(selected);
                }
            }
        );
    },
    photo: {
        // $p 照片图片容器
        // e true-编辑照片,false-新增照片
        getPicture: function($p, e) {
            this.$p = $p;
            var self = this;
            var t = e ? "替换照片" : "添加照片";

            this.popmenuCb0 = function() {
                self.takePhoto();
            };
            this.popmenuCb1 = function() {
                self.selectPhoto();
            };
            //this.popmenuCb2 = function () {
            //    self.$p.empty();
            //}
            var items = [
                {
                    caption: "拍摄照片",
                    action: "am.photo.popmenuCb0()"
                },
                {
                    caption: "从相册中选取",
                    action: "am.photo.popmenuCb1()"
                }
            ];

            //e && items.push({
            //    "caption": "删除照片",
            //    "action": "am.photo.popmenuCb2()"
            //});
            // atMobile.nativeUIWidget.showPopupMenu({
            // title : t,
            // items : items
            // });
            this.popmenuCb1();
        }
    },
    reMail: /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i,
    //手机，座机
    rePhone: /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/,
    reCellphone: /^0?(13[0-9]|15[012356789]|18[0-9]|14[57])[0-9]{8}$/,
    //数组转换成map
    arr2obj: function(data) {
        var ret = {};
        $.each(data, function(i, item) {
            if(item.configKey === 'SERVICE_ITEM_GROUP' && item.shopId!==am.metadata.userInfo.shopId){

            }else{
                ret[item.configKey] = item.configValue;
            }
        });
        return ret;
    },
    ms2str: function(time) {
        var r = {};

        var ms = time % 1000;
        time = Math.floor(time / 1000);
        var s = time % 60;
        s = s < 10 ? "0" + s : "" + s;
        time = Math.floor(time / 60);
        var m = time % 60;
        m = m < 10 ? "0" + m : "" + m;
        var h = Math.floor(time / 60);
        h = h < 10 ? "0" + h : "" + h;

        return h + ":" + m;
    },
    time2str: function(publishTime) {
        var d_minutes, d_hours, d_days;
        var timeNow = parseInt(am.now().getTime() / 1000);
        var d;
        d = timeNow - publishTime;
        d_days = parseInt(d / 86400);
        d_hours = parseInt(d / 3600);
        d_minutes = parseInt(d / 60);
        if (d_days > 30) {
            return new Date(publishTime * 1000).format("yyyy-mm-dd");
        } else if (d_days > 0) {
            return d_days + "天前";
        } else if (d_days <= 0 && d_hours > 0) {
            return d_hours + "小时前";
        } else if (d_hours <= 0 && d_minutes > 0) {
            return d_minutes + "分钟前";
        } else {
            return "刚刚";
        }
    },
    time2strAfter: function(publishTime) {
        var d_minutes, d_hours, d_days;
        var timeNow = parseInt(am.now().getTime());
        var d = publishTime - timeNow;
        if (d > 86400000) {
            return "<span>" + new Date(publishTime).format("mm月dd日 HH:MM:ss") + "</span> ";
        } else {
            d_days = Math.floor(d / 86400000);
            d = d % 86400000;
            d_hours = Math.floor(d / 3600000);
            d = d % 3600000;
            d_minutes = Math.floor(d / 60000);
            d = d % 60000;
            d_sec = Math.floor(d / 1000);

            d_hours = d_hours < 10 ? "0" + d_hours : d_hours;
            d_minutes = d_minutes < 10 ? "0" + d_minutes : d_minutes;
            d_sec = d_sec < 10 ? "0" + d_sec : d_sec;
            return "<span>" + d_hours + "</span>:<span>" + d_minutes + "</span>:<span>" + d_sec + "</span> 后";
        }
    },
    syncTime: function(ts) {
        if (ts) {
            this.timeDuration = ts - new NativeDate().getTime();
        } else if (this.metaData && this.metaData.ts) {
            this.timeDuration = this.metaData.ts - new NativeDate().getTime();
        } else {
            this.timeDuration = 0;
        }
    },
    getTime: function(isLocalTime) {
        var localtime = new Date().getTime();
        if (!isLocalTime && this.metaData && this.metaData.ts) {
            localtime += this.timeDuration;
        }
        return localtime;
    },
    now: function(isLocalTime) {
        var localtime = new NativeDate().getTime();
        if (!isLocalTime && this.timeDuration != null) {
            localtime += this.timeDuration;
        }
        return new NativeDate(localtime);
    },
    getQRCode: function(message, width, height) {
        width = width || 200;
        height = height || 200;
        //return config.commonUrl + "/component/genqr?message=" + encodeURIComponent(message) + "&width=" + width + "&height=" + height;
        return "http://common.reeli.cn/component/genqr?message=" + encodeURIComponent(message) + "&width=" + width + "&height=" + height;
    },
    processPhone: function(phone) {
        // phone = phone || "";
        // var hidePhone = am.metadata.configs.encryptionCardNo != "false";
        // var hidePhone = true;
        // if (phone && hidePhone) {
        //     phone = phone.substr(0, phone.length - 4) + "****";
        // }
        if (am.operateArr.indexOf("MGJP") != -1) {
            return phone.replace(/\d{4}$/, "****");
        }
        return phone;
    },
    //处理很长的小数尾数的问题
    cashierRound: function(val, kept) {
        if (kept) {
            return Math.round(val * kept) / kept;
        }
        return Math.round(val * 100) / 100;
    },
    extendScrollView: function(obj) {
        $.extend(obj, $.am.scrollviewPaging);
    },
    pswp: function(items, index) {
        var pswpElement = $("#pswp_dom")[0];
        var options = {
            tapToClose: true,
            shareEl: false,
            index: index || 0
        };
        this.gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        this.gallery.init();
    },
    getmetadata: function(userInfo) {
        var self = this;
        am.loading.show("正在登录,请稍候...");
        am.api.metadata.exec(
            {
                parentShopId: userInfo.parentShopId,
                token: userInfo.mgjtouchtoken
            },
            function(ret) {
                am.loading.hide();
                if (ret && ret.code == 0 && ret.content) {
                    ret.content.ts = +new Date();
                    ret.content.userInfo = userInfo;
                    localStorage.setItem("METADATA_" + userInfo.userName, JSON.stringify(ret.content));
                    self.initGoto(am.setMetadata(ret.content));
                } else if(ret && ret.code == -1){
                    var metadata;
                    try {
                        metadata = JSON.parse(localStorage.getItem("METADATA_" + userInfo.userName));
                    } catch (e) {
                        $.am.debug.log("parse metadta error");
                    }
                    if (metadata) {
                        self.initGoto(am.setMetadata(metadata));
                    } else {
                        am.msg("登录失败，请重试！");
                        $.am.changePage(am.page.login, "");
                    }
                }else{
                    am.msg("登录失败，请重试！");
                    $.am.changePage(am.page.login, "");
                }
            }
        );
    },
    getWorkTipCount:function(userId){
        var self = this;
        am.loading.show("正在获取,请稍候...");
        var opt = { submiterId: userId };
        am.api.workTipCount.exec(opt, function(res) {
            am.loading.hide();
            if (res.code == 0) {
                if(am.isNull(res.content)){
                    return;
                }
                var count = "";
                if(res.content.COUNT_1 == 0){
                    count = "<div class='num act bounceIn'></div>";
                    if(res.content.COUNT_2 == 0){
                        count = "";
                    }
                }else{
                    count = "<div class='num bounceIn'>"+res.content.COUNT_1+"</div>";
                }
                $("#tab_main .logo").html(count);
            }else{
                am.msg(res.msg || "哎呀出错啦");
            }
        });
    },
    initGoto: function(pow) {
        var self = this;
        if (pow) {
            am.tab.main._idx = -1;
            am.tab.main._$items.filter("[data-pow=" + pow + "]").trigger("vclick");
            // 工单
            am.tips.workOrder($("#debug"));
            this.getWorkTipCount(am.metadata.userInfo.userId);
            var timer = setInterval(function(){
                self.getWorkTipCount(am.metadata.userInfo.userId);
            },1000*60*10);
        } else {
            am.msg("对不起，你无权登录！");
            $.am.changePage(am.page.login, "");
        }

        //初始化蓝牙扫码枪
        if(window.device && window.device.platform && window.device.platform.toUpperCase() === 'IOS' && localStorage.getItem('mgjBtScanner')){
            //打开蓝牙扫码枪支持
            am.startBTScanner();
        }
    },
    startBTScanner:function(){
        try{
            navigator.appplugin.startScanningGun(function(msgCode) {
                //$.am.debug.log('startScanningGun:'+msgCode);
            }, function(msg) {
                $.am.debug.log('startScanningGun:error'+msgCode);
            });
        }catch(e){
            $.am.debug.log("startScanningGun js error:"+e);
        }
        this.initBtScanner();
    },
    stopBTScanner:function(){
        try{
            navigator.appplugin.stopScanningGun(function(msgCode) {
                $.am.debug.log(msgCode);
            }, function(msg) {
                $.am.debug.log(msgCode);
            });
        }catch(e){
            $.am.debug.log("error:"+e);
        }
    },
    initBtScanner:function(){
        if(this.btScanner){
            return;
        }
        this.btScanner = 1;
        var self = this;
        document.addEventListener('scanningGunResult',function(result){
            $.am.debug.log(JSON.stringify(result));
            if(result && result.result){
                cardNumberRead(result.result);
            }else{
                am.msg('读卡器连接异常！');
            }
        }, false);
        document.addEventListener('scanningGunCancelled',function(result){
            if(!localStorage.getItem('mgjBtScanner')){
                return;
            }
            if(self.scanningGunCancelledTimer){
                clearTimeout(self.scanningGunCancelledTimer);
            }
            if(self.autoStartScanTimer){
                clearTimeout(self.autoStartScanTimer);
            }
            self.scanningGunCancelledTimer = setTimeout(function(){
                if(self.btScanner){
                    var ts = new Date().getTime();
                    if(self.autoStartScanTS && ts-self.autoStartScanTS<200){
                        //如果两次自动开始之间小于100ms,等一秒再重新开始
                        self.autoStartScanTimer = setTimeout(function(){
                            self.startBTScanner();
                            self.autoStartScanTS = new Date().getTime();
                        },1000);
                    }else{
                        self.startBTScanner();
                        self.autoStartScanTS = ts;
                    }
                }
            },50);
        }, false);
    },
    checkLogin: function() {
        var self = this;
        var newDate = +new Date();
        var user = JSON.parse(localStorage.getItem("userToken"));
        if (user && user != "undefined") {
            if (location.hash) {
                $.am.changePage(am.page.login, "");
            } else {
                var meta = JSON.parse(localStorage.getItem("METADATA_" + user.userName));
                if(meta && meta.ts){
                    var d = newDate - meta.ts;
                    if (d / (1000 * 60) > 12 * 60) {
                        //大于30分钟 重新登录
                        $.am.changePage(am.page.login, "");
                    } else {
                        //小于30分钟 直接进去 刷新metadata
                        self.getmetadata(meta.userInfo);
                    }
                }else{
                    self.getmetadata(meta.userInfo);
                }
            }
        } else {
            $.am.changePage(am.page.login, "");
        }
    },
    getShortUrl: function(longUrl, scb, fcb) {
        var apiAddress = "http://api.t.sina.com.cn/short_url/shorten.json";
        $.ajax({
            type: "get",
            data: {
                source: 2939463867,
                url_long: longUrl
            },
            url: apiAddress,
            timeout: 30000,
            async: false,
            dataType: "json",
            contentType: "application/json",
            success: function(ret) {
                // console.log(ret);
                if (ret && ret[0]) {
                    scb && scb(ret[0].url_short);
                } else {
                    fcb && fcb();
                }
            },
            error: function(ret) {
                fcb && fcb();
            }
        });
    },
    //一体机第二屏功能
    mediaShow: function(status, params) {
        /*
        *status 0 空闲，1结算
        *
        *空闲时，根据配置显示图片或公众号信息
        *结算页面显示付款总额1.会员显示称谓 2.散客无称谓
        *在线支付微信、支付宝对应二维码，付款成功显示
        *如果使用会员卡或赠送金支付，支付完成后，显示：卡金余额xxx元，赠送金余额xxx元，如果没有赠送金则只显示卡金
        *支付完成显示：谢谢惠顾，期待下次光临
        *再次进入空闲模式
        *configs = {
            type:""
            title:"",
            text:"",
            url:""
        }
        */
        try {
            if (status == 0) {
                if (params.cashMachImage && !params.machWechatText && !params.machWechatMark) {
                    /*空闲时图片模式*/
                    var $img = am.photoManager.createImage(
                        "cashMachImage",
                        {
                            parentShopId: ""
                        },
                        am.metadata.configs.cashMachImage
                    );
                    var configs = {
                        type: 2,
                        title: "",
                        text: "",
                        url: $img.attr("src")
                    };
                    console.log($img.attr("src"));
                } else if (!params.cashMachImage && params.machWechatMark) {
                    /*空闲时公众号信息*/
                    var configs = {
                        type: 3,
                        title: "欢迎光临",
                        text: params.machWechatText || "请扫码关注我们的公众号",
                        url: am.getQRCode(params.machWechatMark, 200, 200)
                    };
                } else if (!params.cashMachImage && !params.machWechatMark && !params.machWechatText) {
                    /*无设置*/
                    var configs = {
                        type: 0,
                        title: "",
                        text: "欢迎光临",
                        url: ""
                    };
                }
            } else if (status == 1) {
                //结算
                var text = "",
                    title = "";
                if (params.type == "wechat") {
                    title = "请使用微信扫码支付";
                    text = params.price + "元";
                } else if (params.type == "alipay") {
                    title = "请使用支付宝扫码支付";
                    text = params.price + "元";
                } else if (params.type == "dp") {
                    title = "请使用点评扫码支付";
                    text = params.price + "元";
                }
                var configs = {
                    type: 3,
                    title: title,
                    text: text,
                    url: params.url
                };
            } else if (status == 2) {
                //支付结果
                if (params.type == 0) {
                    var configs = {
                        type: 0,
                        text: params.text
                    };
                } else {
                    var configs = {
                        type: 1,
                        title: params.title,
                        text: params.text
                    };
                }
            } else if (status == 3) {
                //支付结算详情
                if (params.type == 0) {
                    var configs = {
                        type: 0,
                        text: params.text
                    };
                } else {
                    var configs = {
                        type: 1,
                        title: params.title,
                        text: params.text
                    };
                }
            }
            console.log(configs);
            if (configs.type == 0) {
                navigator.appplugin.secondScreen(
                    {
                        type: 0,
                        content: configs.text
                    },
                    function(msgCode) {
                        $.am.debug.log("进入第一个回调！");
                        $.am.debug.log(msgCode);
                    },
                    function(msgCode) {
                        $.am.debug.log("进入第二个回调！");
                        $.am.debug.log(msgCode);
                    }
                );
            }
            if (configs.type == 1) {
                navigator.appplugin.secondScreen(
                    {
                        type: 1,
                        title: configs.title,
                        content: configs.text
                    },
                    function(msgCode) {
                        $.am.debug.log("进入第一个回调！");
                        $.am.debug.log(msgCode);
                    },
                    function(msgCode) {
                        $.am.debug.log("进入第二个回调！");
                        $.am.debug.log(msgCode);
                    }
                );
            }
            if (configs.type == 2) {
                navigator.appplugin.secondScreen(
                    {
                        type: 2,
                        imgUrl: configs.url
                    },
                    function(msgCode) {
                        $.am.debug.log("进入第一个回调！");
                        $.am.debug.log(msgCode);
                    },
                    function(msgCode) {
                        $.am.debug.log("进入第二个回调！");
                        $.am.debug.log(msgCode);
                    }
                );
            }
            if (configs.type == 3) {
                navigator.appplugin.secondScreen(
                    {
                        type: 3,
                        title: configs.title,
                        content: configs.text,
                        imgUrl: configs.url
                    },
                    function(msgCode) {
                        $.am.debug.log("进入第一个回调！");
                        $.am.debug.log(msgCode);
                    },
                    function(msgCode) {
                        $.am.debug.log("进入第二个回调！");
                        $.am.debug.log(msgCode);
                    }
                );
            }
        } catch (e) {
            $.am.debug.log(JSON.stringify(e.message));
        }
    },
    initSound: function() {
        if (localStorage.getItem("mgjSoundDisabled")) {
            window.amClickAudio = null;
            window.successAudio = null;
        } else {
            window.amClickAudio = new Audio("$dynamicResource/libs/am/audio/click.mp3");
            //console.log(window.amClickAudio);
            window.successAudio = new Audio("$dynamicResource/libs/am/audio/success.mp3");
        }
    }
};

Number.prototype.toFloat = function() {
    if (am.metadata && am.metadata.userInfo) {
        var s = am.metadata.userInfo.fixedNum;
        if (s === 0) {
            return Math.round(this) || 0;
        } else if (s === 1) {
            return Math.round(this * 10) / 10 || 0;
        } else if (s === 2) {
            return Math.round(this * 100) / 100 || 0;
        } else if (s === 3) {
            return Math.ceil(this) || 0;
        }
    }
    return Math.round(this * 10) / 10 || 0;
};
String.prototype.toFloat = Number.prototype.toFloat;
var toFloat = function(n) {
    return Number.prototype.toFloat.call(n);
};

window.amGloble = window.am;

$(function() {});

$.am.init = function() {
    $.am.debug.log("am.init");
    $.am.debug.log(device.platform);
    $.am.debug.log("设备信息：" + navigator.userAgent);
    $.am.debug.log("设备platform信息：" + navigator.platform);
    /*setTimeout(function(){
        $("div.am-widthLimite").css({
            "height":window.innerHeight+"px",
            "position":"relative"
        });
    },100);*/

    //处理IOS系统栏
    if (device.platform == "iOS") {
        $("body").addClass("isios");
    }
    //
    atMobile.getMetadata({}, function(ret, error) {
        $.am.debug.log("pushToken: " + ret.token);
        //$.am.debug.log("tenantId: " + ret.tenantid);
    });
    try {
        window.plugins.message.push(
            function(data) {
                $.am.debug.log("push scb: " + JSON.stringify(data));
            },
            function(data) {},
            "push"
        );
    } catch (e) {}
    $("#loginout").on("vclick", function() {
        am.confirm(
            "登出",
            "确认登出？",
            "确定",
            "取消",
            function() {
                am.loginout.show();
                am.api.loginout.exec(
                    {
                        userId: am.metadata.userInfo.userId,
                        userType: am.metadata.userInfo.userType,
                        token: am.metadata.userInfo.mgjtouchtoken,
                        parentShopId: am.metadata.userInfo.parentShopId
                    },
                    function(res) {
                        am.loginout.hide();
                        if (res.code == 0) {
                        } else {
                            am.msg(res.message || "数据获取失败,请检查网络!");
                        }
                        console.log("登出成功");
                        localStorage.removeItem("userToken");
                        localStorage.removeItem("METADATA_" + am.metadata.userInfo.userName);
                        //$.am.changePage(am.page.login, "slideup");
                        window.location.reload();
                    }
                );
            },
            function() {}
        );
    });
    am.checkLogin();

    /*双屏显示未登录
     *mediaShow(config)
     *type 0 副屏单行
     *title
     *text 显示内容
     */
    if (am.metadata == undefined) {
        var configs = {};
        am.mediaShow(0, configs);
    }
    // am.api.metadata.exec({
    //     "token":"abcd"
    // },function(ret){
    //     if(ret && ret.code==0 && ret.content){
    //         am.setMetadata(ret.content);
    //         $.am.changePage(am.page.service, "");
    //     }
    // });
    $.ajax({
        url: "Info.txt",
        dataType: "json",
        contentType: "application/json",
        success: function(ret) {
            $(".app_version").text("v" + ret.version);
        },
        error: function() {}
    });

    /*if(navigator.userAgent.indexOf("Windows")!==-1){
	    //wPlugin.playSound("/src/create.mp3");
	    //wPlugin.playSound("src/cancel.mp3");
	    //wPlugin.playSound("http://yinyueshiting.baidu.com/data2/music/8a81815599e83717256b7c908298d56c/544224645/5442246000128.mp3?xcode=7af1762481ca08f76b73a0f684021956");
	    window.amClickAudio = {
            play:function () {
                try{
	                wPlugin.playSound("$dynamicResource/libs/am/audio/click.mp3");
                }catch (e){
                    //console.error(e);
                }
            }
        };
	    window.successAudio = {
		    play:function () {
			    try{
			        wPlugin.playSound("$dynamicResource/libs/am/audio/success.mp3");
			    }catch (e){
				    console.error(e);
			    }
		    }
	    };
    }else{*/
    //window.amClickAudio = new Audio("$dynamicResource/libs/am/audio/click.mp3");
    //console.log(window.amClickAudio);
    //window.successAudio = new Audio("$dynamicResource/libs/am/audio/success.mp3");
    //console.log(window.successAudio);
    /*}*/
    am.initSound();

    //工程模式
    var timeArr = [];
    var compareTime = function(time1, time2) {
        return time2 / 1000 - time1 / 1000;
    };
    $("#debug").vclick(function() {
        $.am.changePage(am.page.workOrder, "");
    });
    $("#debug_test").vclick(function(){
        var nowTime = new Date().getTime();
        timeArr.push(nowTime);
        var difference = compareTime(timeArr[0], nowTime);
        if (difference < 4) {
            //时差在3秒内
            if (timeArr.length > 4) {
                //点击了5次
                timeArr.length = 0;

                atMobile.nativeUIWidget.confirm(
                    {
                        caption: "调试模式",
                        description: "是否进入调试模式，没事别乱进！！！",
                        okCaption: "老子要进",
                        cancelCaption: "我怕怕"
                    },
                    function() {
                        $.am.changePage(am.page.test, "");
                    },
                    function() {}
                );
            } else {
                //$.am.changePage(am.page.workOrder, "");
            }
        } else {
            //时差大于3秒
            timeArr.length = 0;
        }
    });
    $("#debug,#debug1").vclick(function() {
        var nowTime = new Date().getTime();
        timeArr.push(nowTime);
        var difference = compareTime(timeArr[0], nowTime);
        if (difference < 4) {
            //时差在3秒内
            if (timeArr.length > 9) {
                //点击了10次
                timeArr.length = 0;

                atMobile.nativeUIWidget.confirm(
                    {
                        caption: "工程模式",
                        description: "是否进入工程模式，可能会让你的APP挂掉，你怕不怕？怕不怕？？",
                        okCaption: "老子要进",
                        cancelCaption: "我怕怕"
                    },
                    function() {
                        $.am.changePage(am.page.engineering, "");
                    },
                    function() {}
                );
            } else {
                //$.am.changePage(am.page.workOrder, "");
            }
        } else {
            //时差大于3秒
            timeArr.length = 0;
        }
    });
};

(function ($) {
    // opt.member 会员信息
    // opt.scb 点击确定的回调函数
    var self = am.sendRedPocketsDialog = {
        init: function () {
            var self = this;
            this.$sendPocketdialog = $('#redPocketsDialogWrap .sendPocketdialog'); //红包弹窗
            this.$redPocketItemBox = this.$sendPocketdialog.find('.scrollY'); // 红包弹窗Itembox
            this.sendPocketItemBox = new $.am.ScrollView({ // 红包弹窗滚动
                $wrap: this.$sendPocketdialog.find(".sendPocketItemBox"),
                $inner: this.$redPocketItemBox,
                direction: [false, true],
                hasInput: false
            });
            this.sendPocketItemBox.refresh();
            // 绑定事件
            this.$dom = $('#redPocketsDialogWrap').on('vclick', '.icon-guanbi2', function () {
                self.hide();
            }).on('vclick', '.cancelBox', function () {
                self.hide();
            }).on('vclick', '.confirmBox', function () {
                self.sendRedPockets();
            }).on('vclick', '.pocketItem', function () {
                var $icon = $(this).find('.pocketCheckBox .iconfont');
                $icon.hasClass('icon-danxuan') ? $icon.removeClass('icon-danxuan').addClass('icon-queren') : $icon.removeClass('icon-queren').addClass('icon-danxuan');
            });
        },
        sendRedPockets: function () {
            var member = this.member;
            var params = {
                "memId": member.id, //会员id
                "memName": member.name, //会员名称
                "shopId": am.metadata.userInfo.shopId, //门店id
                "parentShopId": am.metadata.userInfo.parentShopId, //总部id
                "senderId": am.metadata.userInfo.userId, //发送人id
                "senderName": am.metadata.userInfo.userName, //发送人名称
                luckyMoneys: []
            };
            var permission = JSON.parse(am.metadata.configs.privateSendRed ? am.metadata.configs.privateSendRed : '');
            if (permission && permission.cashierAndAdmin && permission.cashierAndAdmin.number && permission.cashierAndAdmin.templateIds.length > 0) {
                params.numLimit = permission.cashierAndAdmin.number;
                var currentTime = new Date(),
                    currentDate = currentTime.format('yyyy/mm/dd'),
                    startDayTime = new Date(currentDate + ' 00:00:00').format('yyyy/mm/dd HH:MM:ss'),
                    endDayTime = new Date(currentDate + ' 23:59:59').format('yyyy/mm/dd HH:MM:ss');
                switch (parseInt(permission.cashierAndAdmin.timeType)) {
                    case 0: //每天
                        params.startTime = startDayTime;
                        params.endTime = endDayTime;
                        break;
                    case 1: //每月
                        var tempTS = new Date(currentTime.getTime() - 86400000 * 30).format('yyyy/mm/dd');
                        params.startTime = new Date(tempTS + ' 00:00:00').format('yyyy/mm/dd HH:MM:ss');
                        params.endTime = endDayTime;
                        break;
                    case 2: //每年
                        var tempTS = new Date(currentTime.getTime() - 86400000 * 30 * 365).format('yy/mm/dd');
                        params.startTime = new Date(tempTS + ' 00:00:00').format('yyyy/mm/dd HH:MM:ss');
                        params.endTime = endDayTime;
                        break;
                }
            }

            function randomNum(minNum, maxNum) {
                switch (arguments.length) {
                    case 1:
                        return parseInt(Math.random() * minNum + 1, 10);
                    case 2:
                        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
                    default:
                        return 0;
                }
            }
            this.$dom.find('.icon-queren').each(function () {
                var data = $(this).parents('.pocketItem').data(),
                    rule = JSON.parse(data.rule),
                    tempContent = {
                        content: data,
                        useTemplate: true
                    },
                    startTime = 0;
                if (rule.validitymode == '0') {
                    startTime = new Date(new Date().getTime() + (parseInt(rule.days) * 24 * 60 * 60 * 1000)).format('yyyy/mm/dd') + ' 00:00:00';
                } else if (rule.validitymode == '1') {
                    startTime = rule.startTime + ' 00:00:00';
                }
                var obj = {
                    allowmallpay: rule.luckyMoneyRule.enableMallPay == true ? '1' : '0',
                    allowcashierpay: rule.luckyMoneyRule.enableCashierPay == true ? '1' : '0',
                    money: (rule.extraRule.type == '1' ? randomNum(parseInt(rule.extraRule.minMoney), parseInt(rule.extraRule.maxMoney)) : (rule.extraRule.money ? rule.extraRule.money : '')), //0:固定1：随机 2.折扣
                    discount: (rule.extraRule.type == '2' && rule.extraRule.discount ? rule.extraRule.discount : ''), //折扣红包
                    type: rule.extraRule.type ? rule.extraRule.type : '', //红包类型
                    templateId: data.id,
                    activityTitle: data.title,
                    shareRequire: rule.requiredShare,
                    startTime: startTime,
                    // startTime: new Date().format('yyyy/mm/dd HH:MM:ss'),
                     /**
                     * 天数红包默认到当天结束的23:59:59
                     * 如果是到 当前日期10 号 10天有效那么到 20 号 23:59:59
                     **/
                    expiretime: rule.endTime ? rule.endTime + ' 23:59:59' :new Date(new Date().getTime() + ((parseInt(rule.days) + parseInt(rule.afterDays)) * 24 * 60 * 60 * 1000)).format('yyyy/mm/dd 23:59:59'),
                    rule: JSON.stringify(tempContent)
                };
                var appShopInfo = data.appShopInfo;
                if (appShopInfo) {
                    if (appShopInfo.chosenShop == '1') {
                        appShopInfo.currentShop = {
                            id: amGloble.metadata.userInfo.shopId,
                            osName: amGloble.metadata.userInfo.osName,
                        }
                    }
                }
                obj.appShopInfo = JSON.stringify(appShopInfo) // 门店配置信息
                params.luckyMoneys.push(obj);
            });
            if (params.luckyMoneys.length == 0) {
                am.msg("请选择一种红包");
                return;
            } else {
                am.loading.show("正在发送，请稍候...");
                am.api.sendRedPacket.exec(params, function (ret) {
                    am.loading.hide();
                    if (ret && ret.code === 0) {
                        self.hide();
                        am.msg("发送成功");
                        // $("#luckyMoneyDetail .luckyMoneyRefresh").trigger("vclick");
                        // $("#itemLuckyMoneyDetail .luckyMoneyRefresh").trigger("vclick");
                        self.scb && self.scb();
                    } else {
                        am.msg(ret.message);
                    }
                });
            }
        },
        formatAppShops: function () {
            var data = JSON.parse(am.metadata.configs.privateSendRed);
            var res = {};
            if (data && data.enableCashierAndAdmin && data.cashierAndAdmin) {
                var appShops = data.cashierAndAdmin.appShops;
                if (appShops) {
                    for (var i = 0, len = appShops.length; i < len; i++) {
                        var item = appShops[i];
                        res[item.id] = item;
                    }
                }
            }
            this.appShopObj = res;
        },
        renderRedPocketsDialog: function () {
            if (!this.appShopObj) {
                this.formatAppShops();
            }
            var metadata = am.metadata;
            if (metadata.redPackageTemplates && metadata.redPackageTemplates.length && metadata.configs.privateSendRed) {
                var privateSendRedObj = JSON.parse(metadata.configs.privateSendRed);
                if (JSON.stringify(privateSendRedObj) != '{}' && privateSendRedObj.cashierAndAdmin && privateSendRedObj.cashierAndAdmin.templateIds) {
                    var arr = privateSendRedObj.cashierAndAdmin.templateIds;
                    var $wrap = $('.sendPocketItemBox .scrollY');
                    $wrap.empty();

                    function serverList(list) {
                        var str = '';
                        $.each(list, function (i, item) {
                            return str += '<span class="" data-id="' + item.id + '">' + item.name + (i == (list.length - 1) ? '' : '、') + '</span>'
                        })
                        return str;
                    };
                    //循环数据
                    if (arr && arr.length) {
                        $.each(metadata.redPackageTemplates, function (i, item) {
                            $.each(arr, function (index, value) {
                                if (value == item.id) {
                                    var data = JSON.parse(item.rule);
                                    if (data.validitymode == 1 && new Date(data.endTime).getTime() < new Date().getTime()) {
                                        return true;
                                    }
                                    if (JSON.stringify(data) != '{}') {
                                        var mountText = '';
                                        switch (parseInt(data.extraRule.type)) {
                                            case 0:
                                                mountText = data.extraRule.money + '元';
                                                break;
                                            case 1:
                                                mountText = data.extraRule.minMoney + '-' + data.extraRule.maxMoney + '元随机';
                                                break;
                                            case 2:
                                                mountText = data.extraRule.discount + '折';
                                                break;
                                            default:
                                                mountText = 0 + '元';
                                        }
                                        var allowCashierPay = data.luckyMoneyRule.allowCashierPay,
                                            allowMallPay = data.luckyMoneyRule.allowMallPay,
                                            domS = $('<div class="pocketItem am-clickable">' +
                                                '<div class="pocketCheckBox">' +
                                                '<i class="icon iconfont icon-danxuan"></i>' +
                                                '</div>' +
                                                '<div class="pocketContent">' +
                                                '<div class="baseInfo">' +
                                                '<span class="name">' +
                                                item.title +
                                                '</span>' +
                                                '<div class="rightDesc">' +
                                                '<span class="category">' +
                                                mountText + '</span>' +
                                                '<span class="cuttingLine">/</span>' +
                                                '<span class="availablePeriod">' +
                                                (data.validitymode == 0 ? '领取' + data.days + '天后' + data.afterDays + '天有效' : data.startTime + '-' + data.endTime) +
                                                '</span>' +
                                                '</div>' +
                                                '</div>' +
                                                '<div class="tips"></div>' +
                                                '</div>' +
                                                '</div>');
                                        var appShopInfo = self.appShopObj[item.id];
                                        $.extend(item, {
                                            appShopInfo: appShopInfo
                                        }); // 将门店配置存在红包上
                                        var shopTextInfo = '';
                                        if (appShopInfo) {
                                            if (appShopInfo.chosenShop == '0') {
                                                shopTextInfo = "全部门店可使用";
                                            } else if (appShopInfo.chosenShop == '1') {
                                                shopTextInfo = "仅在发送门店可使用";
                                            } else {
                                                shopTextInfo = "指定门店可使用:";
                                                var shopMap = amGloble.metadata.shopMap,
                                                    checkedDirectShops = appShopInfo.checkedDirectShops,
                                                    checkedIndirectShops = appShopInfo.checkedIndirectShops;
                                                for (var i = 0, dlen = checkedDirectShops.length; i < dlen; i++) {
                                                    shopTextInfo += shopMap[checkedDirectShops[i]].osName + '、'
                                                }
                                                for (var j = 0, ilen = checkedIndirectShops.length; j < ilen; j++) {
                                                    shopTextInfo += shopMap[checkedIndirectShops[j]].osName + '、';
                                                }
                                                shopTextInfo = shopTextInfo.substring(0, shopTextInfo.length - 1); // 去掉最后的，
                                            }
                                        }
                                        if (data.luckyMoneyRule.enableCashierPay) {
                                            var textObj = {};
                                            textObj.subtract = allowCashierPay.consumptionAmountFlag && allowCashierPay.consumptionAmount ? '满' + allowCashierPay.consumptionAmount + '元可以抵扣现金，' : '';
                                            textObj.memCard = allowCashierPay.memCard ? '仅允许散客使用（仅允许只有一张散客卡的会员使用），' : '';
                                            textObj.otherRedPackage = allowCashierPay.otherRedPackage ? '禁止同时使用其它红包，' : '';
                                            //是否启用店内消费抵扣
                                            // $(domS).find('.tips').append('<span class="tipsContent">店内抵扣 : 满' + allowCashierPay.consumptionAmount + '元可以抵扣现金，' + (allowCashierPay.items && allowCashierPay.items.length > 0 ? ('指定可用项目' + serverList(allowCashierPay.items)) : '') + '，' + data.requiredShare + '人共享此红包</span>')
                                            if (textObj.subtract || textObj.memCard || textObj.otherRedPackage) {
                                                $(domS).find('.tips').append('<span class="tipsContent">店内抵扣 :' + (textObj.subtract || '') + (textObj.memCard || '') + (textObj.otherRedPackage || '') + (allowCashierPay.items && allowCashierPay.items.length > 0 ? ('指定可用项目' + serverList(allowCashierPay.items)) : '') + '</span>');
                                            } else {
                                                $(domS).find('.tips').append('<span class="tipsContent">店内消费可用</span>');
                                            }
                                        } else {
                                        }
                                        if (data.luckyMoneyRule.enableMallPay) {
                                            //是否启用商城购物抵扣    订单金额满   禁止与线上积分同时使用
                                            // $(domS).find('.tips').append('<span class="tipsContent">商城抵扣 : 满' + allowMallPay.orderAmount + '元可以抵扣现金，' + (allowMallPay.items && allowMallPay.items.length > 0 ? ('指定可用项目' + serverList(allowMallPay.items)) : '') + '，' + data.requiredShare + '人共享此红包</span>')
                                            var objText = {};
                                            objText.orderAmount = allowMallPay.orderAmountFlag && allowMallPay.orderAmount ? '订单金额满' + allowMallPay.orderAmount + '元可以用，' : '';
                                            objText.onlineScore = allowMallPay.onlineScore ? '禁止与线上积分同时使用，' : '';
                                            objText.offlineScore = allowMallPay.offlineScore ? '禁止与线下积分同时使用，' : '';
                                            objText.memCard = allowMallPay.memCard ? '禁止同时使用会员卡支付，' : '';
                                            if (objText.orderAmount || objText.onlineScore || objText.offlineScore || objText.memCard) {
                                                $(domS).find('.tips').append('<span class="tipsContent">商城抵扣 : ' + (objText.orderAmount || '') + (objText.onlineScore || '') + (objText.offlineScore || '') + (objText.memCard || '') + (allowMallPay.items && allowMallPay.items.length > 0 ? ('指定可用项目' + serverList(allowMallPay.items)) : '') + '</span>');
                                            } else {
                                                $(domS).find('.tips').append('<span class="tipsContent">商城可用</span>');
                                            }
                                        } else {}
                                        if (data.luckyMoneyRule.enableMallPay && !data.luckyMoneyRule.enableCashierPay) {
                                            // 仅商城购物 则不显示门店
                                            shopTextInfo = "";
                                        }
                                        if (amGloble.metadata.userInfo.shopType == 1) {
                                            // 单店
                                            shopTextInfo = "";
                                        }
                                        var appShopText = '<span class="tipsContent">' + shopTextInfo + '</span>';
                                        $(domS).find('.tips').append(appShopText);
                                        //数据
                                        domS.data(item);
                                        $wrap.append(domS);
                                    } else {}
                                }
                            })
                        });
                    } else {
                        this.unavailable = true;
                    }
                    if (!this.unavailable) {
                        var $tipsContent = $wrap.find('span.tipsContent');
                        if ($tipsContent && $tipsContent.length) {
                            $tipsContent.each(function () {
                                var textString = $(this).text().trim(),
                                    $this = $(this),
                                    len = $this.children('span').length;

                                if (textString.lastIndexOf('，') != -1 && len == 0) {
                                    $this.text(textString.substring(0, textString.length - 1));
                                }
                            });
                        } else {
                            this.overdue = true;
                        }
                    }
                }
                this.rendered = true;
            } else {
                this.isEmpty = true;
            }
        },
        show: function (opt) {
            if (!this.rendered) {
                // 避免多次渲染
                this.renderRedPocketsDialog();
            }
            if (this.isEmpty) {
                // 总部未配置
                self.hide();
                am.msg("未配置红包模板");
            } else if (this.unavailable) {
                // 总部配置了模板而未配置到门店
                self.hide();
                am.msg("门店未配置红包模板");
            } else if (this.overdue) {
                // 总部配置了模板而门店只配置了过期的模板
                self.hide();
                am.msg("配置的红包模板已过期");
            } else {
                this.$dom.show();
                this.sendPocketItemBox.refresh();
                this.sendPocketItemBox.scrollTo("top");
                this.member = opt.member;
                this.scb = opt.scb;
            }
        },
        hide: function () {
            this.$dom.hide();
        }
    };
    $(function () {
        am.sendRedPocketsDialog.init();
    })
})(jQuery);
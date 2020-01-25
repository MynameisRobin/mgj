(function () {
    am.page.multiCardPay = new $.am.Page({
        id: "page_multiCardPay",
        backButtonOnclick: function () {
            var _this = this;
            if (this.paytool[this.paytool.type] && this.paytool[this.paytool.type].$.is(":visible")) {
                this.paytool.hide();
            } else {
                var $payed = this.$payTypes.filter(".payed");
                if ($payed.length) {
                    atMobile.nativeUIWidget.confirm({
                        caption: "用户已支付",
                        description: "用户已在线支付成功,返回后此支付流水将无法关联，确认要返回吗？",
                        okCaption: "去退款",
                        cancelCaption: "仍返回"
                    }, function () {
                        $payed.trigger('vclick');
                    }, function () {
                        $.am.page.back("slidedown");
                    });
                } else {
                    $.am.page.back("slidedown");
                }
            }
        },
        init: function () {
            var _this = this;
            this.$list = this.$.find("dl.payInfo");
            this.$cardLi = this.$list.find('.multiCarcLi').remove();
            this.$left = this.$.find(".left");
            this.$right = this.$.find(".right");
            this.$cashTipTotal = this.$.find('.cash .highlight');
            this.$posTipTotal = this.$.find('.pos .highlight');
            this.$checkedItemsTitle = this.$right.find('.payTip.card .checkedItemsTitle');
            this.$checkedItemsNames = this.$right.find('.payTip.card .checkedItemsNames');
            //回车键1秒内连敲3次结算
            _this.submitArr = [];
            _this.compareTime = function (time1, time2) {
                return time2 / 1000 - time1 / 1000;
            };

            if (device2.windows() || navigator.platform.indexOf("Mac") == 0) {
                $('#page_pay .submit').hide();
                $('#page_pay .submit.keypadPC').show();
                $('#page_pay .payTypes li b').show();
            } else {
                $('#page_pay .submit.keypadPC').hide();
                $('#page_pay .payTypes li b').hide();
            }
            this.cardListScroll = new $.am.ScrollView({
                $wrap: this.$left.find('.multiCardWrap'),
                $inner: this.$left.find('.multiCardWrap .multiCardList'),
                direction: [false, true],
                hasInput: false,
            });
            //卡升级规则提示关闭
            this.$.find(".ruleTag .close").vclick(function () {
                _this.$.find(".ruleTag").hide();
            });

            this.$.find(".userPrintType li").vclick(function () {
                var index = $(this).index();
                $(this).addClass("selected").siblings().removeClass("selected");
                var key = "USERPRINT_" + amGloble.metadata.userInfo.userName;
                var data = { type: "" };
                if (index == 0) {
                    data.type = "bt";
                }
                if (index == 1) {
                    data.type = "usb";
                }
                localStorage.setItem(key, JSON.stringify(data));
            });
            this.$payTypes = this.$.find(".payTypes li").vclick(function () {
                var $this = $(this);
                if ($this.hasClass('noJdSetting')) {
                    return am.msg('没有配置京东支付的支付方式，请前往 基础系统>基础设置>自定义配置>自定义付款方式 进行配置');
                }
                if ($this.hasClass("selected")) {
                    //return;
                } else {
                    var $selected = _this.$payTypes.filter('.selected');
                    if ($selected.length) {
                        var data = $selected.data('data');
                        var payed = 0;
                        if ($selected.hasClass('payed') && data && data.status == 3) {
                            payed = 1;
                        }
                        if (payed) {
                            atMobile.nativeUIWidget.showMessageBox({
                                title: "用户已完支付",
                                content: '用户已在线支付成功,修改支付方式将导致支付订单关联异常，请先退款'
                            });
                            return;
                        }
                    }
                }

                if (_this.paytool.type) {
                    _this.paytool[_this.paytool.type].hide();
                }
                $this.addClass("selected").siblings().removeClass("selected");
                _this.$right.removeClass("pay_pos")
                    .removeClass("pay_cash1")
                    .removeClass("pay_cash")
                    .removeClass("pay_wechat")
                    .removeClass("pay_alipay")
                    .removeClass("pay_jd");
                if ($this.hasClass("pay_pos")) {
                    _this.$right.addClass("pay_pos");
                    _this.$posTipTotal.text(_this.needPay + '元');
                    console.log(_this.opt);
                    //如果没配置走之前的逻辑,有配置则显示弹窗
                    if (am.metadata.configs && (!am.metadata.configs['jd_unionPOS'] || am.metadata.configs['jd_unionPOS'] === "[]")) {
                        _this.setMediaShow(_this.opt);
                    } else {
                        _this.paytool.show("pos");
                    }
                } else if ($this.hasClass("pay_cash")) {
                    _this.$right.addClass("pay_cash");
                    _this.$cashTipTotal.text(_this.needPay + '元');
                    console.log(_this.opt);
                    if (_this.opt.action && _this.opt.action == "recharge") {
                        _this.opt.card && _this.setMediaShow(_this.opt, 'xk');
                        !_this.opt.card && _this.setMediaShow(_this.opt, 'cz');
                    } else {
                        _this.setMediaShow(_this.opt);
                    }
                } else if ($this.hasClass("pay_wechat")) {
                    _this.$right.addClass("pay_wechat");
                    _this.paytool.show("wechat");
                } else if ($this.hasClass("pay_alipay")) {
                    _this.$right.addClass("pay_alipay");
                    _this.paytool.show("alipay");
                } else if ($this.hasClass("pay_jd")) {
                    _this.$right.addClass("pay_jd");
                    _this.paytool.show("jd");
                }
            });
            this.payTips = am.page.pay.payTips;
            this.payTips.init();

            //提未区

            this.checkedItemsScroll = new $.am.ScrollView({
                $wrap: this.$right.find('.checkedItemsWrap'),
                $inner: this.$right.find('.checkedItemsWrap .checkedItemsWrapper'),
                direction: [false, true],
                hasInput: false,
            });
            //提交
            this.$submit = this.$.find(".submit").vclick(function () {
                if (!_this.opt.member) {
                    _this.submit();
                } else {
                    if (_this.opt.member.passwdNewSet) {
                        _this.submit();
                    } else {
                        //校验密码和打印一样需要参数
                        _this.submit(0, 1);
                    }
                }
            });
            this.paytool.init();

            this.$confirm = $('#multiCardPayConfirm');
            $('#multiCardPayConfirm .goBack').vclick(function () {
                _this.paySuccess();
            });

            this.$.find('.print').vclick(function () {//绑定点击打印按钮事件
                _this.print();
            });

            for (var i = 1; i <= 10; i++) {
                this.payTypeMap['otherfee' + i] = 'otherfee' + i;
            }

            this.$signatureSwitch = this.$.find(".signatureSwitch").vclick(function () {
                var $this = $(this);
                var status = "";
                if ($this.hasClass("checked")) {
                    $this.removeClass("checked");
                    localStorage.setItem("signatureSwitch_" + am.metadata.userInfo.userId, "false");
                    status = "禁用";
                } else {
                    $this.addClass("checked");
                    localStorage.removeItem("signatureSwitch_" + am.metadata.userInfo.userId);
                    status = "启用";
                }

                atMobile.nativeUIWidget.showMessageBox({
                    title: status + "签名",
                    content: '结算签名仅在会员消费需要扣减【卡金/赠金】或【套餐项目次数】时启动，你已' + status + '此功能'
                });
            });

            this.$printSwitch = this.$.find(".printSwitch").vclick(function () {
                var $this = $(this);
                if ($this.hasClass("checked")) {
                    $this.removeClass("checked");
                    localStorage.removeItem("printSwitch_" + am.metadata.userInfo.userId);
                } else {
                    $this.addClass("checked");
                    localStorage.setItem("printSwitch_" + am.metadata.userInfo.userId, "true");
                }
            });

            this.$smsSendFlag = this.$.find(".smsSendFlag").vclick(function () {
                var $this = $(this);
                if ($this.hasClass("checked")) {
                    $this.removeClass("checked");
                } else {
                    $this.addClass("checked");
                }
            });

            this.$memberCount = this.$.find(".memberCount").vclick(function () {
                var $this = $(this);
                if ($this.hasClass("checked")) {
                    $this.removeClass("checked");
                } else {
                    $this.addClass("checked");
                }
            });

            this.$comment = this.$.find('.comment').vclick(function () {
                var $this = $(this);
                var reason = JSON.parse(am.metadata.configs.submitBillRemarks || "[]");// 门店配置
                var hqReason = [];
                if (!(reason && reason.length)) {
                    // 如果门店未配置删单理由则再取总部的配置
                    hqReason = JSON.parse(am.metadata.configs.submitBill || "[]");// 总部配置
                }
                var submitBillRemarks = (reason && reason.length ? reason : hqReason) || [];
                am.selectCancleReason.show({
                    title: '请选择收银理由',
                    // warn: '警告:请选择或输入明确的撤单理由，以便财务和管理层审核',
                    reason: submitBillRemarks,
                    currentValue: _this.opt.option.comment,
                    warn: '警告:请选择或输入明确的收银理由，以便财务和管理层审核',
                    type: 3,// 收银
                    callback: function (str) {
                        _this.opt.option.comment = str || "";
                        $this.text(str || "");
                    },
                    saveToRemarkList: function (val) {
                        var saveReason = [];
                        if (!am.isNull(reason) && reason.indexOf(val) > -1) {
                            // 常用已包含
                            am.msg(val + '已存在，请修改后再保存');
                            return;
                        } else if (!am.isNull(reason) && reason.indexOf(val) == -1) {
                            // 常用未包含
                            saveReason = reason.concat([val]);
                        } else if (am.isNull(reason)) {
                            // 没有常用
                            saveReason = [val];
                        }
                        am.loading.show();
                        am.api.saveNormalConfig.exec({
                            parentshopid: am.metadata.userInfo.parentShopId + '',
                            configkey: 'submitBillRemarks',
                            configvalue: JSON.stringify(saveReason),
                            shopid: am.metadata.userInfo.shopId + '',
                            setModuleid: 15
                        }, function (ret) {
                            am.loading.hide();
                            if (ret && ret.code == 0) {
                                am.metadata.configs.submitBillRemarks = JSON.stringify(saveReason);
                                am.msg('【' + val + '】' + '已保存为常用收银理由')
                            } else {
                                am.msg('保存失败');
                            }
                        });
                    }
                });
            });
            this.$customerSource = this.$.find('.customerSource').vclick(function () {
                var $this = $(this);
                var mgjsourceid = _this.opt.option.mgjsourceid
                am.sourceModal.show({
                    mgjsourceid: mgjsourceid,
                    sourceSave: function (data) {
                        $this.text(data.mgjsourcename)
                        if (_this.opt.servOption && _this.opt.prodOption) {
                            _this.opt.servOption.mgjsourceid = data.mgjsourceid;
                        } else {
                            _this.opt.option.mgjsourceid = data.mgjsourceid;
                        }
                    }
                })
            })

            this.$billNo = this.$header.find(".billno input").on("vclick", function () {
                if (am.metadata.shopPropertyField.manualInputBillno != 1 && am.metadata.shopPropertyField.mgjBillingType == 1 && am.operateArr.indexOf('a37') == -1) {
                    am.msg("没有权限修改单号！");
                    return;
                }
                var $this = $(this);
                am.keyboard.show({
                    title: "请输入单号",//可不传
                    hidedot: true,
                    submit: function (value) {
                        if (isNaN(value)) {
                            am.msg('请输入正确的数值！');
                            return;
                        }
                        // 只有项目才校验单号重复
                        if (_this.opt.option.expenseCategory == 0) {
                            _this.checkBillNo(value);
                            return false;
                        }
                        $this.val(value.substring(0, 20));
                    }
                });
            });
            this.$whynot = this.$.find('.whynot').vclick(function (e) {
                e.stopPropagation();
                if ($(this).find('.text').text()) {
                    am.msg($(this).find('.text').text());
                }
            });
            this.$.find('.multiCard').on('vclick', '.addCard', function () {
                if(_this.needPay==0){
                    am.msg('已支付足够金额，不用再选择其他的会员卡！')
                    return;
                }
                if(_this.unSelectCardList.length==0){
                    am.msg('已无会员卡可增加！')
                    return;
                }
                var carditems = [];
                $.each(_this.unSelectCardList, function (index, item) {
                    if (item.discount == 0 || item.discount == 10) {
                        var discount = '（无折扣，余额：'+ item.balance +'）';
                    } else {
                        var discount = '（' + item.discount + '折，余额：'+ item.balance +'）';
                    }
                    carditems.push({
                        'name': item.cardName + discount,
                        'data': item
                    })
                })
                am.popupMenu("请选择会员卡", carditems, function (item) {
                    _this.addselectCardList(item.data);
                    _this.setCard(item.data);
                    _this.setNeedPay();
                    _this.cardListScroll.refresh();
                    _this.cardListScroll.scrollTo('top');
                });
            }).on('vclick', '.cardDel', function () {
                var card = $(this).parents('.multiCarcLi').data('data');
                _this.addUnselectCardList(card);
                $(this).parents('.multiCarcLi').remove();
                _this.cardListScroll.refresh();
                _this.cardListScroll.scrollTo('top');
                _this.sumCards();
                _this.setNeedPay();
            }).on('vclick', '.costCardFee', function () {
                var $cardLi = $(this).parents('.multiCarcLi');
                var memCard = $cardLi.data('data');
                am.keyboard.show({
                    "title": "修改价格",
                    "submit": function (value) {
                        if (value == '') { return; }
                        if (value > memCard.balance) {
                            am.msg('不能大于卡金余额！')
                            return;
                        }
                        value = value * 1;
                        memCard.cardFee = value;
                        _this.sumCards();
                        _this.setNeedPay();
                    }
                });
            })
            $.am.on('instoreServiceHasBeenChanged', function (data) {
                if ($.am.getActivePage() == _this) {
                    if (_this.opt && _this.opt.option && _this.opt.option.instoreServiceId == data.instoreServiceId) {
                        am.billChangeToHangup();
                        am.autoPayCheck.reset();
                    }
                }
            });
        },
        addselectCardList: function (card) {
            var index = this.unSelectCardList.indexOf(card);
            this.unSelectCardList.splice(index, 1);
            this.selectCardList.push(card);
        },
        addUnselectCardList: function (card) {
            var index = this.selectCardList.indexOf(card);
            this.selectCardList.splice(index, 1);
            this.unSelectCardList.push(card);
        },
        toLowerCaseKey: function (obj) {
            var res = {};
            for (var key in obj) {
                res[key.toLocaleLowerCase()] = obj[key];
            }
            return res;
        },
        getProductTotalPrice: function () {
            var prodOption = this.opt.prodOption || this.opt.option;
            var productItems = prodOption.products && prodOption.products.depots;
            var productTotalPrice = 0;
            this.productTotalPrice = 0;
            if(productItems&&productItems.length){
                for (var i = 0; i < productItems.length; i++) {
                    productTotalPrice = Math.round((productTotalPrice + productItems[i].originalPrice) * 100) / 100;
                }
                this.productTotalPrice = productTotalPrice;
                prodOption.billingInfo.total = prodOption.billingInfo.eaFee = productTotalPrice;
            }
        },
        getProcessedData: function () {
            var serviceItems = [];
            var products = [];
            if (this.opt.option.expenseCategory == 1) {
                //单卖品结算
                products = this.opt.option.products.depots;
            } else if (this.opt.option.expenseCategory == 0) {
                //项目卖品混合结算
                if (this.opt.servOption && this.opt.prodOption) {
                    serviceItems = this.opt.servOption.serviceItems;
                    products = this.opt.prodOption.products.depots
                } else {
                    //单项目结算
                    serviceItems = this.opt.option.serviceItems;
                }
            }
            var comboitemTotalPrice = 0;
            var normalItemTotalPrice = 0;
            var comboItems = [];
            var normalItems = [];
            var memPriceItems = [];
            for (var i = 0; i < serviceItems.length; i++) {
                if (serviceItems[i].consumeType == 0) {
                    this.setOriginalPrice(serviceItems[i]);
                    var discount = am.discountMap[this.opt.member.cardTypeId + "_" + serviceItems[i].itemId];
                    if (discount && discount.dicmode == "1") {
                        serviceItems[i].memberPrice = discount.discount * 1;
                        memPriceItems.push(serviceItems[i]);
                    }else{
                        normalItemTotalPrice += serviceItems[i].originalPrice;
                        normalItems.push(serviceItems[i]);
                    }
                } else {
                    comboitemTotalPrice += serviceItems[i].salePrice * 1;
                    comboItems.push(serviceItems[i]);
                }
            }
            this.comboitemTotalPrice = Math.round(comboitemTotalPrice*100)/100;
            this.normalItemTotalPrice = Math.round(normalItemTotalPrice*100)/100;
            this.memPriceItems = memPriceItems;
            this.normalItems = normalItems;
            this.comboItems = comboItems;
            serviceItems = memPriceItems.concat(normalItems);
            for (var i = 0; i < products.length; i++) {
                this.setOriginalPrice(products[i]);
            }
            var items = serviceItems.concat(products);
            this.allItems = items;
        },
        clearPayDetail: function () {
            for (var i = 0; i < this.allItems.length; i++) {
                var item = this.allItems[i];
                delete item.backupDetail;
                delete item.detail;
            }
        },
        setItems: function (payDetail) {
            payDetail.rest = payDetail.money;
            var card = payDetail.$.data('data');
            for (var i = 0; i < this.allItems.length; i++) {
                this.allItems[i].backupDetail = am.clone(this.allItems[i].detail) || [];
            }
            for (var i = 0; i < this.allItems.length; i++) {
                var item = this.allItems[i];
                item.currentPrice = item.originalPrice;
                if (payDetail.rest) {
                    if (item.detail && item.detail.length) {
                        var hasmoney = 0;
                        var discount = 10;
                        for (var j = 0; j < item.detail.length; j++) {
                            hasmoney += item.detail[j].money / item.detail[j].discount * 10;
                        }
                        if (item.memberPrice) {
                            item.currentPrice = item.memberPrice;
                        } else {
                            if (!item.productid) {
                                discount = card.discount;
                            }
                        }
                        var needMoney = Math.round((item.currentPrice - hasmoney)*1000)/1000;
                        var money = payDetail.rest > Math.round(needMoney * discount * 100) / 1000 ? Math.round(needMoney * discount * 100) / 1000 : payDetail.rest;
                        if (needMoney > 0) {
                            item.detail.push({
                                id: payDetail.id,
                                money: money,
                                discount: discount
                            })
                        }
                        payDetail.rest = Math.round((payDetail.rest - money)*100)/100;

                    } else {
                        item.detail = [];
                        var discount = 10;
                        if (item.memberPrice) {
                            item.currentPrice = item.memberPrice;
                        } else {
                            if (!item.productid) {
                                discount = card.discount;
                            }
                        }
                        var money = payDetail.rest > Math.round(item.currentPrice * discount * 100) / 1000 ? Math.round(item.currentPrice * discount * 100) / 1000 : payDetail.rest;
                        item.detail.push({
                            id: payDetail.id,
                            money: money,
                            discount: discount
                        })
                        payDetail.rest = Math.round((payDetail.rest - money)*100)/100;
                    }
                }
            }
            if (payDetail.rest) {
                for (var i = 0; i < this.allItems.length; i++) {
                    this.allItems[i].detail = this.allItems[i].backupDetail;
                }
                this.setItems({
                    id: payDetail.id,
                    money: Math.round((payDetail.money - payDetail.rest)*100)/100,
                    $: payDetail.$
                })
                return;
            } else {
                payDetail.$.find('.costCardFee').text(payDetail.money);
                card.cardFee = payDetail.money;
                this.getDiscountMoney();
            }

        },
        getDiscountMoney:function(){
            this.discountMoney = 0;
            var _this = this;
            this.cardFee = 0;
            var memberCost = 0;
            for(var i=0;i<this.allItems.length;i++){
                var item = this.allItems[i];
                if(item.memberPrice){
                    if(item.detail&&item.detail.length){
                        this.discountMoney += item.memberPrice;
                        memberCost += item.memberPrice;
                    }else{
                        this.discountMoney += item.originalPrice;
                        memberCost += item.originalPrice;
                    }
                }else{
                    if(item.detail&&item.detail.length){
                        var money = 0;
                        for (var j=0;j<item.detail.length;j++){
                            money += item.detail[j].money / item.detail[j].discount * 10;
                            this.discountMoney += item.detail[j].money;
                        }
                        var notmoney = item.originalPrice - money;
                        this.discountMoney += notmoney;
                    }else{
                        this.discountMoney += item.originalPrice;
                    }
                }
            }
            this.$list.find('.multiCardList .multiCarcLi').each(function () {
                _this.cardFee += $(this).data('data').cardFee;
            });
            this.discountMoney = Math.round(this.discountMoney*100)/100;
            this.needPay = Math.round((this.discountMoney - this.cardFee)*100)/100;
            if(this.needPay==0.01){
                this.discountMoney = Math.round((this.discountMoney - 0.01)*100)/100;
                this.needPay=0;
            }else if(this.needPay==-0.01){
                this.discountMoney = Math.round((this.discountMoney + 0.01)*100)/100;
                this.needPay=0;
            }
            this.$.find('.discountMoney').text('￥'+this.discountMoney);
            this.getProductTotalPrice();
            this.discount = (this.discountMoney-this.productTotalPrice-memberCost)/this.normalItemTotalPrice;
        },
        setCard: function (card) {
            var $cardLi = this.getRenderCardLi(card);
            this.$list.find('.multiCardList').append($cardLi);
            this.setItems({
                id: card.id,
                money: card.balance,
                $: $cardLi
            });
        },
        sumCards: function () {
            var _this = this;
            this.clearPayDetail();
            this.$list.find('.multiCardList .multiCarcLi').each(function () {
                var card = $(this).data('data');
                _this.setItems({
                    id: card.id,
                    money: card.cardFee,
                    $: $(this)
                });
            });
        },
        getTotalPrice: function () {
            var items = this.allItems;
            var comboItems = this.comboItems;
            var total = 0;
            for (var i = 0; i < items.length; i++) {
                total += items[i].originalPrice;
            }
            for (var j = 0; j < comboItems.length; j++) {
                total += comboItems[j].salePrice;
            }
            return Math.round(total*100)/100;
        },
        setOriginalPrice: function (item) {
            if (item.productid) {
                var _item = amGloble.metadata.categoryItemMap[item.productid];
                if (!(_item.saleprice * 1)) {
                    item.originalPrice = item.salePrice * 1 * item.number;
                } else {
                    item.originalPrice = item.price * 1 * item.number;
                    item.salePrice = item.price * 1;
                }
            } else {
                if (item.consumeType == 0) {
                    var _item = amGloble.metadata.serviceItemMap[item.id];
                    if (!(_item.price * 1)) {
                        item.originalPrice = item.salePrice * 1;
                    } else {
                        item.originalPrice = item.oPrice * 1;
                    }
                }
            }
        },
        checkBillNo: function (billNo, cb) {
            var _this = this;
            if (billNo.length > 20) {
                am.msg('单号长度超过20位数字已自动截取');
            }
            _this.$header.find(".billno input").val(billNo.substring(0, 20));

            var _check = function () {
                // 单号不重复	
                _this.opt.option.billNo = billNo;
                if (_this.opt.servOption) {
                    _this.opt.servOption.billNo = billNo;
                }
                if (_this.opt.prodOption) {
                    _this.opt.prodOption.billNo = billNo;
                }
                cb && cb();
            };

            // 只有项目才校验重复单号
            if (_this.opt.option.expenseCategory != 0) {
                _check();
                return false;
            }

            am.api.checkBillNo.exec({
                billNo: billNo,
                shopId: amGloble.metadata.userInfo.shopId
            }, function (ret) {
                if (ret.code == 0) {
                    _this.checkBillNoSuccess = true;
                } else if (ret.code == 11009) {
                    am.msg('单号重复');
                    _this.checkBillNoSuccess = false;
                    return false;
                } else {
                    _this.checkBillNoSuccess = true;
                }
                _check();
            });
        },
        getPrintType: function () {
            var type = "bt",
                key = "USERPRINT_" + amGloble.metadata.userInfo.userName;
            local = localStorage.getItem(key);
            var data = null;
            try {
                if (local) {
                    data = JSON.parse(local);
                }
            } catch (e) {
                data = null;
            }
            if (data) {
                type = data.type;
            }
            return type;
        },
        setNeedPay: function (t) {//算还需付的钱
            this.$list.find('.val.payTotal').text("￥" + this.needPay);
            //支付区背景还原
            this.$right.removeClass("pay_memberCard")
                .removeClass("pay_pos")
                .removeClass("pay_cash1")
                .removeClass("pay_cash")
                .removeClass("pay_wechat")
                .removeClass("pay_alipay")
                .addClass("pay_cash1");
            this.$.find('.payDetail').hide();
            //根据结算数据，显示和隐藏支付方式
            if (this.needPay) {
                this.$payTypes.removeClass('am-disabled').removeClass("selected");
                var member = this.opt.member;
                if (member && member.cardfeePayLimit && (this.opt.option.expenseCategory == 0 || this.opt.option.expenseCategory == 1 || this.opt.option.expenseCategory == 4) && member.cardtype == 1 && member.timeflag != 1) {
                    this.$payTypes.addClass('am-disabled');
                } else {
                    this.$payTypes.removeClass('am-disabled');
                }
            } else {
                this.$payTypes.addClass('am-disabled').removeClass("selected").find('.whynot').hide();
            }
            this.jdDisplay();

            this.setMediaShow(this.opt);
        },
        getRenderCardLi: function (memCard) {
            var $cardLi = this.$cardLi.clone(true, true);
            if (memCard.major == 1) {
                $cardLi.find('.cardDel').remove();
            }
            $cardLi.find('.cardName').text(memCard.cardName)
            if (memCard.discount == 0 || memCard.discount == 10) {
                memCard.discount = 10;
                $cardLi.find('.cardInfo').text('无折扣，余额：￥' + memCard.balance)
            } else {
                $cardLi.find('.cardInfo').text(memCard.discount + '折，余额：￥' + memCard.balance)
            }
            $cardLi.data('data', memCard);
            return $cardLi;
        },

        render: function () {
            //套餐扣减金额
            var total = this.getTotalPrice();
            this.$.find('.total').text('￥'+total);
            this.comboDeduct = 0;
            this.comboItemCount();
            //设置需要支付的金额
            this.setNeedPay();
            //重置 并隐藏支付区
            this.paytool.reset();
            this.paytool.hide();
            if (localStorage.getItem("signatureSwitch_" + am.metadata.userInfo.userId) == "false") {
                this.$signatureSwitch.removeClass("checked");
            } else {
                this.$signatureSwitch.addClass("checked");
            }
            if (localStorage.getItem("printSwitch_" + am.metadata.userInfo.userId) == "true") {
                this.$printSwitch.addClass("checked");
            } else {
                this.$printSwitch.removeClass("checked");
            }

            if (this.opt.option.expenseCategory == 0) {
                this.$memberCount.addClass("checked");
                if (am.metadata.shopPropertyField && am.metadata.shopPropertyField.numberofnote !== "1") {
                    this.$memberCount.show();
                } else {
                    this.$memberCount.hide();
                }
            } else {
                this.$memberCount.hide().removeClass("checked");
            }
            this.$comment.text(this.opt.option.comment || "");
            this.showSmsSendFlag();
        },
        
        beforeShow: function (paras) {
            var _this = this;
            if (!this.checkedSubmitPermission) {
                this.checkSubmitPermission();
            }
            this.$comment.removeClass("showleft");
            this.checkBillNoSuccess = true;
            this.upgradeCardSuccess = false;
            this.upgradeCardSuccessAuto = false;
            this.selectCardList = [];
            this.unSelectCardList = [];
            if (paras.member) {
                var member = paras.member;
                this.$customerSource.hide();
                this.$comment.addClass("showleft");
                if (member.presentfeepayLimit === null) {
                    member.presentfeepayLimit = 100;
                }
                if (member.minfee === null) {
                    member.minfee = 0;
                }
                if (member.newcardPayLimit === null) {
                    member.newcardPayLimit = 100;
                }
                if (member.cardfeePayLimit === null) {
                    member.cardfeePayLimit = 0;
                }
                if (member.discount == 0) {
                    member.discount = 10;
                }
            } else {
                if (paras.option && paras.option.mgjsourceid) {
                    this.$customerSource.text(paras.option.mgjsourcename)
                    delete paras.option.mgjsourcename;
                } else if (paras.option && !paras.option.mgjsourceid) {
                    this.$customerSource.text("");
                };
                this.$customerSource.show();
                if (paras.servOption && paras.prodOption) {
                    delete paras.prodOption.mgjsourceid;
                    delete paras.prodOption.mgjsourcename;
                    delete paras.servOption.mgjsourcename;
                };
            };
            var printType = this.getPrintType();
            if (printType == "bt") {
                this.$.find(".userPrintType li").removeClass("selected").eq(0).addClass("selected");
            } else {
                this.$.find(".userPrintType li").removeClass("selected").eq(1).addClass("selected");
            }
            if (window.location.protocol.indexOf('http') != -1) {
                this.$.find(".userPrintType").addClass('web').find('.printType').hide();
            } else {
                this.$.find(".userPrintType").removeClass('web').find('.printType').show();
            }

            if (paras == "back") {
                //重置
            } else {
                this.opt = paras;
                var member = paras.member;
                am.searchMember.getcardListById(member.id, function (ret) {
                    $.each(ret, function (index, item) {
                        if (member.cid == item.cid) {
                            _this.selectCardList.push(item);
                        } else {
                            if(item.cardtype==2){
                                return true;
                            }else if(item.cardtype==1&&item.timeflag==1){
                                return true;
                            }else if(item.balance<=0){
                                return true;
                            }else {
                                _this.unSelectCardList.push(item);
                            }
                        }
                    })
                    _this.getProcessedData();
                    _this.$list.find('.multiCardList').empty();
                    var majorCard = _this.selectCardList[0];
                    majorCard.major = 1;
                    _this.setCard(majorCard)
                    _this.render();
                })
                //副屏支付结算详情
                this.setMediaShow(paras);
            }
            this.renderBillNo(paras);
            var configs = am.metadata.configs;
            if (configs && configs['mobileRepeat']) {
                this.mbRepeatConfig = JSON.parse(configs['mobileRepeat']);
            }
        },
        // 渲染单号
        renderBillNo: function (paras) {
            if (am.metadata.shopPropertyField.manualInputBillno == 1) {
                this.$billNo.val('');
                if (this.opt.option) {
                    this.opt.option.billNo = '';
                }
            } else {
                // 是否启动结单强制覆盖单号	
                if (paras && paras.option) {
                    this.$billNo.val(paras.option.billNo || "");
                } else if (paras && paras.billRemark) {
                    this.$billNo.val(paras.billRemark.serviceNO || "");
                }
            }
        },
        checkSubmitPermission: function () {
            // 判断当前员工是否有结算权限
            var config = am.metadata.userInfo.operatestr.indexOf('a39') > -1 ? 1 : 0;
            var $keypadPC = this.$.find('.submit.keypadPC');
            if (device2.windows() || navigator.platform.indexOf("Mac") == 0) {
                this.$.find('.submit').hide();
                if (config) {
                    $keypadPC.hide();
                } else {
                    $keypadPC.show();
                }
            } else {
                $keypadPC.hide();
                if (config) {
                    this.$submit.hide();
                } else {
                    this.$.find('.submit:not(.keypadPC)').show();
                }
            }
            this.checkedSubmitPermission = true;
        },
        afterShow: function (paras) {
            var self = this;
            am.metadata.configs.onlineCreditPay = am.metadata.configs.onlineCreditPay == "0" ? "" : am.metadata.configs.onlineCreditPay;
            am.metadata.configs.offlineCreditPay = am.metadata.configs.offlineCreditPay == "0" ? "" : am.metadata.configs.offlineCreditPay;
            this.paybackFlag = false;//副屏显示关闭
            this.$submit.removeClass("am-disabled");
            var member = this.opt.member;
            //隐藏卡升级规则标签
            self.$.find(".ruleTag").hide();
            //清空升级成功的内容
            $("#multiCardPayConfirm").find(".cardUpTip").text('');
            this.checkCardAboutCurrentDay();
        },
        beforeHide: function (paras) {
            var type = this.opt && this.opt.option && this.opt.option.expenseCategory
            this.getGainAndVoidFee(type);// 页面隐藏前调用虚业绩和提成接口 如果this.billId不存在则不调用
        },
        afterHide: function () {
            $('.transparentMask').hide();
            this.billId = '';// 将单号清空
            /*恢复初始副屏设置*/
            if (!this.paybackFlag) {
                var params = JSON.parse(JSON.stringify(am.metadata.configs));
                am.mediaShow(0, params);
            }
            try {
                am.signname.hide();
            } catch (e) {

            }
            this.currentDayCharge = null;

        },
        setMediaShow: function (paras, model) {
            //副屏支付结算详情
            var _this = this;
            if (paras.member == null) {//散客
                var params = {
                    "type": 0,
                    "text": "此次消费总额：" + this.needPay + "元"
                }
                if (model == "done") {
                    //params.text = "成功付款"+(paras.option.billingInfo.total || 0)+"元";
                    params.type = 1;
                    params.title = "谢谢惠顾,";
                    params.text = "期待下次光临";
                }
            } else {
                if (model == "cz" || model == 'xk') {//cz 充值 xk 续卡 done 支付完成
                    var params = {
                        "type": 1,
                        "title": paras.member.name + (paras.member.sex == "F" ? "小姐" : "先生") + ",此次" + (model == 'cz' ? "充值金额：" : "续卡金额："),
                        "text": (model == 'cz' ? "卡金" + paras.option.billingInfo.total + "元" + (paras.option.billingInfo.presentFee ? ("\n赠金" + paras.option.billingInfo.presentFee + "元") : '') : this.renewalOption.name)
                    }
                } else if (model == "done") {
                    if (paras.action == "recharge") {
                        //充值，续卡完成
                        console.log(this.renewalOption);
                        if (this.renewalOption) {
                            var params = {
                                "type": 0,
                                "text": "本次续卡共支付" + (paras.option.billingInfo.total) + "元"
                            }
                        } else {
                            var restSum;
                            restSum = "卡金余额" + (Math.round((paras.member.balance + paras.option.billingInfo.total) * 100) / 100) + "元" + (paras.member.gift ? ("\n赠金余额" + (Math.round((paras.member.gift + paras.option.billingInfo.presentFee) * 100) / 100) + "元") : '');
                            if (paras.option.billingInfo.presentFee) {
                                restSum = "卡金余额" + (Math.round((paras.member.balance + paras.option.billingInfo.total) * 100) / 100) + "元" + "\n赠金余额" + (Math.round((paras.member.gift + paras.option.billingInfo.presentFee) * 100) / 100) + "元";
                            }
                            var params = {
                                "type": 1,
                                "text": "本次充值共支付" + (Math.round((paras.option.billingInfo.total + (paras.option.cost || 0)) * 100) / 100) + "元",
                                "title": restSum
                            }
                        }
                    } else {
                        //1.使用现金 银联 zhifubao wx  不显示卡金 赠送金
                        var payFee;
                        if (paras.option.comboCard && paras.option.comboCard.costDetail.total == 0) {
                            //无成本价 只使用卡 只使用赠送金 混合支付
                            (paras.option.billingInfo.cardFee == paras.option.billingInfo.total || paras.option.billingInfo.cardFee)
                                && (payFee = "卡金余额" + (Math.round((paras.member.balance - paras.option.billingInfo.cardFee) * 100) / 100) + "元" + (paras.member.gift ? ("\n赠金余额" + paras.member.gift) : ''));
                            (paras.option.billingInfo.presentFee == paras.option.billingInfo.total || paras.option.billingInfo.presentFee)
                                && (payFee = "卡金余额" + paras.member.balance + "元" + "\n赠金余额" + (Math.round((paras.member.gift - paras.option.billingInfo.presentFee) * 100) / 100) + "元");
                            ((paras.option.billingInfo.cardFee && paras.option.billingInfo.presentFee))
                                && (payFee = "卡金余额" + (Math.round((paras.member.balance - paras.option.billingInfo.cardFee) * 100) / 100) + "元" + "\n赠金余额" + (Math.round((paras.member.gift - paras.option.billingInfo.presentFee) * 100) / 100) + "元");
                        } else if (paras.option.comboCard && !paras.option.comboCard.costDetail.total) {
                            //存在成本价 只使用卡 只使用赠送金 混合支付
                            (paras.option.cost == paras.option.comboCard.costDetail.cardFee || paras.option.comboCard.costDetail.cardFee)
                                && (payFee = "卡金余额" + (Math.round((paras.member.balance - paras.option.billingInfo.cardFee - paras.option.comboCard.costDetail.cardFee) * 100) / 100) + "元" + (paras.member.gift ? ("\n赠金余额" + paras.member.gift) : ''));
                            (paras.option.cost == paras.option.comboCard.costDetail.presentFee || paras.option.comboCard.costDetail.presentFee)
                                && (payFee = "卡金余额" + paras.member.balance + "元" + "\n赠金余额" + (Math.round(
                                    (paras.member.gift - paras.option.billingInfo.presentFee - paras.option.comboCard.costDetail.presentFee) * 100) / 100) + "元");
                            (paras.option.comboCard.costDetail.cardFee && paras.option.comboCard.costDetail.presentFee)
                                && (payFee = "卡金余额" + (Math.round((paras.member.balance - paras.option.billingInfo.cardFee - paras.option.comboCard.costDetail.cardFee) * 100) / 100) + "元" + "\n赠金余额" + (Math.round((paras.member.gift - paras.option.billingInfo.presentFee - paras.option.comboCard.costDetail.presentFee) * 100) / 100) + "元")
                            console.log((paras.option.billingInfo.cardFee + paras.option.comboCard.costDetail.cardFee), (paras.option.billingInfo.presentFee + paras.option.comboCard.costDetail.presentFee))
                        }
                        if (payFee) {
                            var params = {
                                "type": 1,
                                "text": "本次消费共支付" + (paras.option.billingInfo.total + (paras.option.cost || 0)) + "元",
                                "title": payFee
                            }
                        } else {
                            var params = {
                                "type": 0,
                                "text": "本次消费共支付" + (paras.option.billingInfo.total + (paras.option.cost || 0)) + "元"
                            }
                        }
                        console.log(params)
                    }
                } else if (model == undefined) {
                    var params = {
                        "type": 1,
                        "title": paras.member.name + (paras.member.sex == "F" ? "小姐" : "先生") + ",此次消费总额:",
                        "text": +this.needPay + "元"
                    }
                }
            }
            console.log(params)
            am.mediaShow(3, params);
        },
        jdDisplay: function () {
            this.jdSetting = null;
            var payTypes = am.payConfigMap[this.opt.option.expenseCategory];
            for (var key in payTypes) {
                if (payTypes[key].otherfeetype == 4) {
                    this.jdSetting = payTypes[key];
                    break;
                }
            }
            if (this.jdSetting) {
                this.$payTypes.filter('.pay_jd').show().removeClass('noJdSetting');
                this.payTypeNameMap.jd = this.jdSetting.field.toLocaleLowerCase();
            } else {
                this.$payTypes.filter('.pay_jd').show().addClass('noJdSetting');
            }
        },
        checkShopAvailable: function (appShopInfo) {
            var avaliable = 1,// 0 不可用 1 可用
                shopType = amGloble.metadata.userInfo.shopType,
                currentShopId = amGloble.metadata.userInfo.shopId;
            var checkedDirectShops = appShopInfo.checkedDirectShops,
                checkedIndirectShops = appShopInfo.checkedIndirectShops;
            if (shopType == 2 && appShopInfo.chosenShop == 2) {
                // 指定 直属 
                avaliable = am.checkShopAvailable({
                    shopIdsStr: checkedDirectShops.toString(),
                    targetShopId: currentShopId
                });
            } else if (shopType == 3 && appShopInfo.chosenShop == 2) {
                //  指定 附属
                avaliable = am.checkShopAvailable({
                    shopIdsStr: checkedIndirectShops.toString(),
                    targetShopId: currentShopId
                })
            }
            // 仅销售和全部门店可用已在渲染时做了判断 此处不需要再判断
            return avaliable;
        },
        showSmsSendFlag: function () {
            this.$smsSendFlag.removeClass('checked');
            if (!this.opt.member) {
                this.$smsSendFlag.hide();
                this.opt.option.smsflag = '0';
                return;
            }
            var isAllowed = amGloble.operateArr.indexOf('Q') == -1 ? false : true;
            var smsflag = '0';
            var cardList = amGloble.metadata.cardTypeList.concat(amGloble.metadata.defaultCardTypeList || []);
            if (cardList.length) {
                for (var i = 0; i < cardList.length; i++) {
                    if (cardList[i].cardtypeid == this.opt.member.cardTypeId) {
                        smsflag = cardList[i].smsflag;
                    }
                }
            }
            this.opt.option.smsflag = smsflag;

            if (!isAllowed) {
                this.$smsSendFlag.hide();
            } else {
                this.$smsSendFlag.show();
                if (smsflag == 0) {
                    this.$smsSendFlag.html('不发送微信消息请打勾');
                } else if (smsflag == 1) {
                    this.$smsSendFlag.html('不发送短信和微信消息请打勾');
                }
                if (this.opt.member.cardtype == 2) {
                    this.$smsSendFlag.hide();
                } else {
                    if (this.opt.option.expenseCategory == 3 || this.opt.option.expenseCategory == 0 || this.opt.option.expenseCategory == 1) {
                        this.$smsSendFlag.show();
                    } else {
                        this.$smsSendFlag.hide();
                    }
                }
            }

            if (this.opt.option.expenseCategory == 2) {
                this.opt.option.smsflag = '1';
            }
        },
        checkCardAboutCurrentDay: function () {
            var member = this.opt.member;
            var self = this;
            if (member && (this.opt.option.expenseCategory == 0 || this.opt.option.expenseCategory == 1 || this.opt.option.expenseCategory == 4) && member.cardtype == 1 && member.timeflag != 1
                && new Date(member.openDate).format('yyyy-mm-dd') == new Date().format('yyyy-mm-dd')) {
                am.api.checkCardAboutCurrentDay.exec({
                    cardId: member.cid,
                    parentShopId: amGloble.metadata.userInfo.parentShopId,
                    shopId: amGloble.metadata.userInfo.shopId,
                }, function (res) {
                    if (res.code == 0) {
                        self.currentDayCharge = res.content;
                        if (member.newcardPayLimit < 100 && self.currentDayCharge && (Math.round((self.needPay) * 100) + Math.round((self.currentDayCharge.CONSUMEFEE) * 100)) > (Math.round((self.currentDayCharge.CHARGEFEE) * 100) * (member.newcardPayLimit / 100))  //开卡当日消费超过设置的总额百分比
                        ) {
                            self.$payTypes.filter('.pay_memberCard').addClass('am-disabled');
                            self.$payTypes.filter('.pay_memberCard').find('.whynot').show().find('.text').text('开卡当日消费不得超过总额的' + member.newcardPayLimit + '%,(当日开卡总额' + Math.round(self.currentDayCharge.CHARGEFEE * 100) / 100 + ',已消费' + Math.round(self.currentDayCharge.CONSUMEFEE * 100) / 100 + ')');
                        }
                    } else {

                    }
                })
            }
        },
        comboItemCount: function () {
            var bill = this.opt.option.billingInfo, deduct = 0;
            this.unlimitTreatfee = 0;
            if (this.opt.comboitem && this.opt.comboitem.length) {
                var items = this.opt.comboitem,
                    merged = {},
                    tempComboNames = [];
                for (var i = 0; i < items.length; i++) {
                    if (merged[items[i].itemid]) {
                        merged[items[i].itemid].times++;
                        merged[items[i].itemid].price += items[i].price;
                    } else {
                        merged[items[i].itemid] = {
                            name: items[i].itemname,
                            times: 1,
                            price: items[i].price
                        };
                    }
                    if (items[i].sumtimes === -99) {
                        this.unlimitTreatfee += items[i].oncemoney;
                    } else {
                        var treatTotal = (items[i].cashFee + items[i].cardFee + items[i].otherFee) || 0;
                        var treatfeePer = treatTotal ? (items[i].cashFee + items[i].cardFee) / treatTotal : 1;
                        var treatfee = items[i].price * treatfeePer;
                        bill.treatfee += treatfee;
                        bill.treatpresentfee += items[i].price - treatfee;
                    }
                }
                for (var i in merged) {
                    deduct += merged[i].price;
                    tempComboNames.push(merged[i].name + merged[i].times + "次 (总价:￥" + merged[i].price + ")");
                }
                this.$list.find('dd.comboitemPay').show().find('.val').text(tempComboNames.join(","));
            } else {
                this.$list.find('dd.comboitemPay').hide();
            }
            this.comboDeduct = deduct;
        },
        payTypeNameMap: {
            "card": "cardFee",
            "bonus": "presentFee",
            "wechat": "weixin",
            "alipay": "pay",
            "dp": "dpFee",//"dpFee",
            "cash": "cashFee",
            "pos": "unionPay",
            //"coupon":"voucherFee"
        },
        // isPrint 时不会提交到服务器，但是会生成结算参数，走完提交前的逻辑
        submit: function (isPrint, pw) {
            var _this = this;
            var $type = this.$payTypes.filter(".selected");
            var bill = $.extend(this.opt.option.billingInfo, {
                "cardFee": 0, //卡金
                //"presentFee": 0, //赠送金
                "cashFee": 0, //现金
                "unionPay": 0, //银联
                "unionOrderId": null, //银联
                "cooperation": 0, //合作券
                "mall": 0, //商场卡
                "weixin": 0, //微信
                "pay": 0, //支付宝
                "voucherFee": 0, //代金券
                "mdFee": 0, //免单金额
                "divideFee": 0, //分期赠送进
                "pointFee": 0, //积分
                "debtFee": 0, //欠款
                "jdFee": 0,//京东
                "onlineCredit": 0,//线上积分
                "onlineCreditPay": 0,//线上积分抵扣金额
                "offlineCredit": 0,//线下积分
                "offlineCreditPay": 0,//线下积分抵扣金额
                "mallOrderFee": 0,//商城订单
                "dpFee": 0, //点评
                "dpId": null, //点评id
                "payId": null, //支付宝id
                "weixinId": null, //微信 id
                "dpCouponId": null, //微信 id
                "kBOrderid": null,
                "luckymoney": 0,
                "coupon": 0,
                //"dianpin": 0,
                "otherfee1": 0,
                "otherfee2": 0,
                "otherfee3": 0,
                "otherfee4": 0,
                "otherfee5": 0,
                "otherfee6": 0,
                "otherfee7": 0,
                "otherfee8": 0,
                "otherfee9": 0,
                "otherfee10": 0
            });
            this.opt.option.orderDetail = [];
            bill.eaFee = bill.total = Math.round((this.discountMoney + this.comboitemTotalPrice) * 100) / 100;
            var cardFee = 0;
            $.each(this.selectCardList, function (index, item) {
                cardFee += item.cardFee;
            })
            bill.cardFee = Math.round(cardFee * 100) / 100;
            if (this.needPay > 0) {
                if ($type.length) {
                    if ($type.hasClass("pay_cash")) {
                        bill.cashFee = this.needPay;
                    } else if ($type.hasClass("pay_pos")) {
                        bill.unionPay = this.needPay;
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.unionOrderId = paydata.id;
                            this.opt.option.orderDetail.push({
                                "payOrderId": paydata.id
                                , "amount": paydata.price
                                , "orderType": 6
                                , "billType": 1
                            });
                        }
                        if (am.operateArr.indexOf("a61") > -1) {
                            if (paydata && paydata.status == 3) {
                                console.log("勾选a61后并且银联支付成功")
                            } else {
                                return am.msg("不允许银联支付仅记账不收款");
                            }
                        }
                    } else if ($type.hasClass("pay_wechat")) {
                        bill.weixin = this.needPay;
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.weixinId = paydata.id;
                            this.opt.option.orderDetail.push({
                                "payOrderId": paydata.id
                                , "amount": paydata.price
                                , "orderType": 1
                                , "billType": 1
                            });
                        } else if (this.checkOnlinePayAuth('wechat')) {
                            return 1;
                        }
                    } else if ($type.hasClass("pay_alipay")) {
                        bill.pay = this.needPay;
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.payId = paydata.id;
                            this.opt.option.orderDetail.push({
                                "payOrderId": paydata.id
                                , "amount": paydata.price
                                , "orderType": 2
                                , "billType": 1
                            });
                        } else if (this.checkOnlinePayAuth('alipay')) {
                            return 1;
                        }
                    } else if ($type.hasClass("pay_jd")) {
                        bill[this.jdSetting.field.toLowerCase()] = this.needPay;
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.jdOrderId = paydata.id;
                            this.opt.option.orderDetail.push({
                                "payOrderId": paydata.id
                                , "amount": paydata.price
                                , "orderType": 7
                                , "billType": 1
                            });
                        } else if (this.checkOnlinePayAuth('jd')) {
                            return 1;
                        }
                    }
                } else {
                    am.msg("请选择一种支付方式");
                    return 1;
                }
            } else {
                //总价就是0，不需要支付
            }

            if (this.opt.member) {
                this.opt.option.memId = this.opt.member.id;
                this.opt.option.cardId = this.opt.member.cid;
                this.opt.option.discount = this.opt.member.discount || 10;
            } else {
                this.opt.option.memId = 0;
            }
            this.resetServOption();
            this.submitToServer(isPrint, pw);
        },
        resetServOption: function(){
            var _this = this;
            var servOption = this.opt.servOption || this.opt.option;
            var servTotal = 0;
            if(servOption.serviceItems&&servOption.serviceItems.length){
                servOption.serviceItems = [];
                $.each(_this.normalItems,function(index,item){
                    item.salePrice = Math.round(item.originalPrice*_this.discount*100)/100;
                    servOption.serviceItems.push(item);
                    servTotal += item.originalPrice*_this.discount;
                })
                $.each(_this.memPriceItems,function(index,item){
                    if(item.detail&&item.detail.length){
                        item.salePrice = item.memberPrice;
                    }else{
                        item.salePrice = item.originalPrice;
                    }
                    servOption.serviceItems.push(item);
                    servTotal += item.salePrice;
                })
                $.each(_this.comboItems,function(index,item){
                    servOption.serviceItems.push(item);
                    servTotal += item.salePrice;
                })
                servOption.billingInfo.total = servOption.billingInfo.eaFee = Math.round(servTotal*100)/100;
            }
        },
        getJsonstr: function () {
            var checkCards = [];
            $.each(this.selectCardList, function (index, item) {
                checkCards.push({
                    "cardId": item.cid,
                    "cardShopId": item.cardshopId,
                    "type": item.major ? 1 : 0,
                    "cardFee": item.cardFee,
                    "cardName": item.cardName
                })
            })
            this.opt.option.multiCardPay = 1;
            this.opt.option.marjorCardFee = this.selectCardList[0].cardFee;
            if (this.opt.servOption && this.opt.prodOption) {
                var jsonstr = JSON.parse(this.opt.servOption.jsonstr);
                var servCardFee = this.opt.servOption.billingInfo.cardFee;
                var protCardFee = this.opt.prodOption.billingInfo.cardFee;
                var servDiscount = servCardFee/(servCardFee+protCardFee);
                var servCheckCards = am.clone(checkCards);
                var proCheckCards = am.clone(checkCards);
                for(var i=0;i<servCheckCards.length;i++){
                    servCheckCards[i].cardFee = Math.round(servCheckCards[i].cardFee * servDiscount*100)/100;
                }
                for(var i=0;i<proCheckCards.length;i++){
                    proCheckCards[i].cardFee = Math.round(proCheckCards[i].cardFee * (1-servDiscount)*100)/100;
                }
                if (jsonstr) {
                    var serJsonstr = am.clone(jsonstr);
                    var proJsonstr = am.clone(jsonstr);
                    serJsonstr.checkCards = servCheckCards;
                    proJsonstr.checkCards = proCheckCards;
                    this.opt.servOption.jsonstr = JSON.stringify(serJsonstr);
                    this.opt.prodOption.jsonstr = JSON.stringify(proJsonstr);
                } else {
                    this.opt.servOption.jsonstr = JSON.stringify({
                        "checkCards": servCheckCards
                    });
                    this.opt.prodOption.jsonstr = JSON.stringify({
                        "checkCards": proCheckCards
                    });
                }
            } else {
                var jsonstr = JSON.parse(this.opt.option.jsonstr);
                if (jsonstr) {
                    jsonstr.checkCards = checkCards;
                    this.opt.option.jsonstr = JSON.stringify(jsonstr);
                } else {
                    this.opt.option.jsonstr = JSON.stringify({
                        "checkCards": checkCards
                    });
                }
            }
        },
        paramsEdit: function () {
            var opt = this.opt.option;
            if (this.opt.prodOption) {
                opt.products = this.opt.prodOption.products;
            }
            if (this.opt.option.cardType != 2 && this.opt.member && this.opt.member.cardtype != 2 && !this.opt.renewal) {
                if (this.opt.member) {
                    opt.cardBalance = Math.round((this.opt.member.balance - this.selectCardList[0].cardFee) * 100) / 100;
                    opt.presentBalance = this.opt.member.gift;
                    if(this.opt.option.comboCard){
                        if(this.opt.option.comboCard.costDetail.cardFee){
                            opt.cardBalance = Math.round((opt.cardBalance - this.opt.option.comboCard.costDetail.cardFee)*100)/100;
                        }
                        if(this.opt.option.comboCard.costDetail.presentFee){
                            opt.presentBalance = Math.round((opt.presentBalance - this.opt.option.comboCard.costDetail.presentFee)*100)/100;
                        }
                    }
                }
            }
            return opt;
        },
        print: function (isAutoPrint) {
            if (!isAutoPrint && this.submit(1)) {
                //如果是自动打印，不走进来，因为submit已经校验过了
                //如果不是自动打印，先调submit(1)，传1，走校验逻辑，校验失败return，
                //校验成功打印
                return;
            }
            var opt = this.opt.option;
            this.opt.option = this.paramsEdit();
            var user = this.opt.member;
            //解决欠款遗留bug
            opt.billingInfo.totalfeeanddebtfee = opt.billingInfo.debtFee;
            //解决积分打印抵扣金
            opt.billingInfo.onlineCredit = 0;
            opt.billingInfo.offlineCredit = 0;

            console.log('print:', user, opt);
            console.log(this.opt);
            var data = [user, opt];
            //$('.print').addClass('am-disabled').text('正在打印');
            $('.print').addClass('am-disabled');
            var _this = this;

            setTimeout(function () {//5秒自动移除
                $('.print').removeClass("am-disabled");
            }, 5000);

            am.print.print(
                data,
                function () {
                    //$('.print').removeClass("am-disabled").text("打印小票");
                    $('.print').removeClass("am-disabled");
                },
                function (msg) {
                    am.msg(msg || "打印失败");
                    //$('.print').removeClass("am-disabled").text("打印小票");
                    $('.print').removeClass("am-disabled");
                }
            );
        },
        checkOnlinePayAuth: function (type) {
            var operateMap = {
                'jd': {
                    value: 'a6',
                    des: '京东钱包未支付完成'
                },
                'wechat': {
                    value: 'a62',
                    des: '微信未支付完成'
                },
                'alipay': {
                    value: 'a63',
                    des: '支付宝未支付完成'
                },
                'dp': {
                    value: 'a64',
                    des: '点评支付未关联点评券'
                },
                'kb': {
                    value: 'a65',
                    des: '口碑支付未关联口碑券'
                }
            }
            if (operateMap[type] && am.operateArr.indexOf(operateMap[type].value) != -1 && sessionStorage._autoPay1214 != 'autoPay') {
                am.msg(operateMap[type].des);
                return 1;
            }
        },
        submitToServer: function (isPrint, pw) {
            var _this = this,
                b = this.opt.option.billingInfo,
                sum = b.cardFee + b.cashFee + b.unionPay + b.cooperation + b.mall + b.weixin + b.pay + b.voucherFee + b.mdFee + b.dpFee + b.treatfee + b.treatpresentfee + b.luckymoney + b.coupon + b.divideFee + b.debtFee + b.jdFee + b.mallOrderFee + b.onlineCreditPay + b.offlineCreditPay;
            if (this.opt.option.expenseCategory != 3 && this.opt.option.expenseCategory != 2) {
                //充值的时候,presentFee不算
                if (this.opt.member && !this.opt.member.allowPresentfeeDiscount && this.opt.member.discount && this.opt.option.expenseCategory != 4) {
                    if (this.$payTypes.filter(".selected").hasClass("pay_bonus")) {
                        sum += this.needPay;
                    } else {
                        sum += b.presentFee / (this.opt.member.discount / 10);
                    }
                } else {
                    sum += b.presentFee;
                }
            }
            for (var i = 1; i <= 10; i++) {
                if (b['otherfee' + i]) {
                    sum += b['otherfee' + i];
                }
            }
            if (Math.round(sum * 100) < Math.round(b.total * 100) && Math.abs(Math.round(sum * 100) - Math.round(b.total * 100)) > 1) {
                am.msg('结算金额有误！');
                return 1;
            }
            if (pw) {
                // this.opt.option = this.paramsEdit();
                var popupAgain = 0;
                if (am.metadata.shopPropertyField.manualInputBillno != 1 || _this.$header.find(".billno input").val().trim()) {
                    popupAgain = 0;
                } else {
                    popupAgain = 1;
                }
                this.opt.member.popupAgain = popupAgain;
                am.pw.check(this.opt.member, function (verifyed) {
                    if (verifyed) {
                        _this.submit();
                    }
                }, this.opt.option);
                return false;
            }
            if (this.opt.member && this.opt.member.cardshopId == am.metadata.userInfo.shopId) {
                if (this.opt.comboitem && this.opt.comboitem.length) {
                    if (this.getComboCrossNum(this.opt.comboitem)) {
                        this.opt.option.otherFlag = 1;//跨店
                    } else {
                        this.opt.option.otherFlag = 0;//本店
                    }
                } else {
                    this.opt.option.otherFlag = 0;//本店
                }
            } else if (this.opt.member && this.opt.member.cardshopId != am.metadata.userInfo.shopId) {
                if (this.opt.comboitem && this.opt.comboitem.length) {
                    if (!this.getComboCrossNum(this.opt.comboitem) && this.opt.option.serviceItems && this.opt.comboitem.length == this.opt.option.serviceItems.length) {
                        this.opt.option.otherFlag = 0;//本店
                    } else {
                        this.opt.option.otherFlag = 1;//跨店
                    }
                } else {
                    this.opt.option.otherFlag = 1;//跨店
                }
            } else {
                this.opt.option.otherFlag = 0;//本店
            }
            if (this.opt.option.expenseCategory == 2) {
                this.opt.option.otherFlag = 0;//本店
            }
            //总部会员不跨店
            if (this.opt.member && this.opt.member.cardshopId == am.metadata.userInfo.parentShopId) {
                this.opt.option.otherFlag = 0;//本店
            }
            if (isPrint) {
                return;
            }
            if (this.opt.option.expenseCategory === 0) {
                if (this.opt.servOption && this.opt.prodOption) {
                    //分账
                    this.splitBillPay();
                    var option = this.opt.option;
                    var servOption = this.opt.servOption;
                    var prodOption = this.opt.prodOption;
                    servOption.orderDetail = [];
                    prodOption.orderDetail = [];
                    if (!am.isNull(option.orderDetail)) {
                        for (var i = 0; i < option.orderDetail.length; i++) {
                            var orderDetail = option.orderDetail[i];
                            var servAmount = 0, prodAmount = 0;
                            if (orderDetail.orderType == 1) {
                                servAmount = Math.round(servOption.billingInfo.weixin * 100) / 100;
                                prodAmount = Math.round(prodOption.billingInfo.weixin * 100) / 100;
                            } else if (orderDetail.orderType == 2) {
                                servAmount = servOption.billingInfo.pay;//项目,支付宝
                                prodAmount = prodOption.billingInfo.pay;//卖品,支付宝
                            } else if (orderDetail.orderType == 6) {
                                servAmount = servOption.billingInfo.unionPay;
                                prodAmount = prodOption.billingInfo.unionPay;
                            } else if (orderDetail.orderType == 7) {
                                servAmount = servOption.billingInfo[this.jdSetting.field.toLocaleLowerCase()];
                                prodAmount = prodOption.billingInfo[this.jdSetting.field.toLocaleLowerCase()];
                            }
                            servOption.orderDetail.push({
                                "payOrderId": orderDetail.payOrderId//收款流水id
                                , "amount": servAmount //关联金额
                                , "orderType": orderDetail.orderType //收款流水类型 支付方式1微信2支付宝3点评
                                , "billType": 1//明细类型  1水单2开支
                            });
                            prodOption.orderDetail.push({
                                "payOrderId": orderDetail.payOrderId//收款流水id
                                , "amount": prodAmount //关联金额
                                , "orderType": orderDetail.orderType //收款流水类型 支付方式1微信2支付宝3点评
                                , "billType": 1//明细类型  1水单2开支
                            });
                        }
                    } else {
                        console.info("没有扫码")
                    }
                }
            }
            if (this.opt.option.expenseCategory == 0) {
                //项目业绩
                this.computePerf();
            }
            if (this.opt.option.expenseCategory == 1 || this.opt.prodOption) {
                //计算卖品支付明细
                this.computeProductPayDetail();
            }
            //给套餐项目分，现金，卡结，其它
            this.setTreatItemPerf();
            //计算非项目业绩
            this.computePerSetPerf();
            this.getJsonstr();
            if (this.$memberCount.hasClass("checked")) {
                this.opt.option.clientflag = 1;
            } else {
                this.opt.option.clientflag = 0;
            }
            if (this.opt.member) {
                if (this.opt.option.expenseCategory == 3) {
                    var $val = this.$list.find('.rechargeCardType').find('.val');
                    var upgradeCard = $val.data('data');
                    if (upgradeCard) {
                        upgradeCard = upgradeCard.data;
                    }
                    //手动升级
                    if ($val.is(":visible") && upgradeCard && upgradeCard.cardtypeid != this.opt.member.cardTypeId.toString()) {
                        this.opt.option.cardUpId = undefined;
                    } else {
                        //自动升级
                        if (!am.isNull(this.cardUpId)) {
                            this.opt.option.cardUpId = this.cardUpId;
                        }
                    }
                }
                if (this.$smsSendFlag.hasClass('checked')) {
                    this.opt.option.smssendflag = 'N';
                } else {
                    this.opt.option.smssendflag = 'Y';
                }
            } else {
                this.opt.option.smssendflag = 'N';
            }

            var _billNo = this.$billNo.val();
            if (this.opt.servOption) {
                var realOption = this.opt.servOption;
                realOption.clientflag = this.opt.option.clientflag;
                realOption.otherFlag = this.opt.option.otherFlag;
                realOption.memId = this.opt.option.memId;
                realOption.cardId = this.opt.option.cardId;
                realOption.discount = this.opt.option.discount;
                realOption.smssendflag = this.opt.option.smssendflag;
                realOption.smsflag = this.opt.option.smsflag;
                realOption.billingInfo.onlineCredit = Math.ceil(servOption.billingInfo.onlineCreditPay * (am.metadata.configs.onlineCreditPay || 1));
                realOption.billingInfo.offlineCredit = Math.ceil(servOption.billingInfo.offlineCreditPay * (am.metadata.configs.offlineCreditPay || 1));
                realOption.billingInfo.luckMoneys = this.opt.option.billingInfo.luckMoneys;

                if (_billNo) {
                    realOption.billNo = _billNo;
                }
            }
            if (this.opt.prodOption) {
                var realOption = this.opt.prodOption;
                realOption.clientflag = this.opt.option.clientflag;
                realOption.otherFlag = (this.opt.member && this.opt.member.cardshopId != am.metadata.userInfo.shopId) ? 1 : 0;
                realOption.memId = this.opt.option.memId;
                realOption.cardId = this.opt.option.cardId;
                realOption.discount = this.opt.option.discount;
                realOption.smssendflag = this.opt.option.smssendflag;
                realOption.smsflag = this.opt.option.smsflag;
                realOption.billingInfo.onlineCredit = this.opt.option.billingInfo.onlineCredit - this.opt.servOption.billingInfo.onlineCredit;
                realOption.billingInfo.offlineCredit = this.opt.option.billingInfo.offlineCredit - this.opt.servOption.billingInfo.offlineCredit;
                if (_billNo) {
                    realOption.billNo = _billNo;
                }
            }
            if (_billNo) {
                this.opt.option.billNo = _billNo;
            }
            _this.opt.option.lastDpTicketCode && delete _this.opt.option.lastDpTicketCode;
            _this.opt.option.lastKbTicketCode && delete _this.opt.option.lastKbTicketCode;
            var toPay = function () {
                if (_this.paying) {
                    return;
                }
                _this.paying = 1;
                _this.$submit.addClass("am-disabled");

                am.loading.show();
                var callback = function (ret) {
                    _this.paying = 0;
                    am.loading.hide();

                    // 性能监控点
                    if (ret && ret.code == 0) {
                        monitor.stopTimer('M05', 0)
                    } else {
                        monitor.stopTimer('M05', 1)
                    }

                    if (ret && ret.code == 0) {
                        //升级成功TODO
                        if (ret.content && !am.isNull(ret.content.newCardTypeId)) {
                            var discountStr = '';
                            var cardData = _this.ruleObj || {};
                            console.log('ruleObj====', _this.ruleObj);
                            // if(cardData.buydiscount > 0){
                            // discountStr += '套餐' + cardData.buydiscount + '折';
                            // }
                            if (cardData.discount > 0) {
                                discountStr += '可享项目' + cardData.discount + '折';
                            }
                            str = '恭喜您，此卡已升级为' + cardData.cardTypeName + discountStr;
                            $("#multiCardPayConfirm").find(".cardUpTip").text(str);
                            _this.upgradeCardSuccessAuto = true;//自动升级开启

                        }
                        _this.cardUpgradeObj = {
                            memId: _this.opt.option.memId,
                            cid: ret.content.memCardId
                        };

                        _this.billId = ret.content.billId;//将单号设置为全局变量
                        _this.billIds = ret.content.billIds; // 多单一起结算，返回多单的集合
                        if (_this.$printSwitch.hasClass("checked")) {
                            _this.print();
                        }
                        if (_this.opt.member) {
                            _this.opt.member.lastExpenseCategory = _this.opt.option.expenseCategory;
                            if (_this.opt.option && (_this.opt.option.expenseCategory == 0 || _this.opt.option.expenseCategory == 1)) {
                                _this.opt.member.lastConsumeTime = new Date().getTime();//更新会员最后消费时间记录
                            }
                            am.page.searchMember.saveLastSelectMember(_this.opt.member, "p");
                            if (_this.opt.debt || _this.opt.option.billingInfo.debtFee) {
                                //如果还款了，清除用户欠款的缓存数据
                                cashierDebt.clearCache(_this.opt.member.id);
                            }
                            if (_this.opt.member.needDeletedWaitedBillId) {
                                am.page.hangup.deleteWaitedBills([_this.opt.member.needDeletedWaitedBillId], '已开单单据选取待开单顾客作为会员后删除');
                            }
                            localStorage.removeItem('memPwd' + '_' + _this.opt.member.id);
                        }
                        _this.checkIfNeedUpgradeCardType(ret.content.billId);
                        // if (_this.opt.billRemark) {//如果是挂单备注 需将原单状态修改为已买单
                        //     _this.opt.remarkCallback && _this.opt.remarkCallback(_this.opt.member,ret.content);
                        // }
                        am.page.hangup.lastCheckedBillId = _this.opt.option.instoreServiceId;
                        if (_this.opt.member && ret.content.memCardId) {
                            _this.opt.member.cid = ret.content.memCardId;
                        }
                        if (_this.opt.member && ret.content.treatmentItmes) {
                            _this.opt.member.buyTreatmentItmes = ret.content.treatmentItmes;
                        }
                    } else if (ret.code == 100002) {//单号已存在
                        if (amGloble.metadata.shopPropertyField.aotomodifybillno == 1) {
                            payTips.open(function () {
                                if (_this.opt.servOption) {
                                    _this.opt.servOption.autoModifyBillNo = 1;
                                    _this.opt.prodOption.autoModifyBillNo = 1;
                                    am.api.mutiBillCheck.exec([_this.opt.servOption, _this.opt.prodOption], callback);
                                } else {
                                    _this.opt.option.autoModifyBillNo = 1;
                                    am.api.billCheck.exec(_this.opt.option, callback);
                                }
                            }, function () {
                                am.msg("单号重复！");
                                _this.$submit.removeClass("am-disabled");
                            }, _this.opt.option.billNo);
                        } else {
                            am.msg("单号重复！");
                            _this.$submit.removeClass("am-disabled");
                        }

                    } else if (ret.code == 10030) {
                        am.msg("买单过于频繁，请稍后重试！");
                        _this.$submit.removeClass("am-disabled");
                    } else if (ret.code == 1000) {
                        am.msg('token失效');
                        $.am.changePage(am.page.login, "");
                    } else if (ret.code == 1002034) {
                        am.billChangeToHangup();
                    } else {
                        _this.$submit.removeClass("am-disabled");
                        am.msg(ret.message || "结算失败！");
                    }
                };
                // console.log(_this.opt)
                // return;
                if (_this.opt.servOption) {
                    // 性能监控点
                    monitor.startTimer('M05', {
                        servOption: _this.opt.servOption,
                        prodOption: _this.opt.prodOption
                    })
                    if (!_this.opt.servOption.uuid) {
                        _this.opt.servOption.uuid = _this.getUniqueId();
                    }
                    if (!_this.opt.prodOption.uuid) {
                        _this.opt.prodOption.uuid = _this.getUniqueId();
                    }
                    if (isNaN(_this.opt.prodOption.billNo)) {
                        delete _this.opt.prodOption.billNo;
                    }
                    if (_this.opt.servOption.instoreServiceId && _this.opt.prodOption.instoreServiceId) {
                        delete _this.opt.servOption.instoreServiceId;
                    }
                    if (_this.opt.instoreServiceVersion) {
                        _this.opt.servOption.instoreServiceVersion = _this.opt.prodOption.instoreServiceVersion = _this.opt.instoreServiceVersion;
                    }
                    am.api.mutiBillCheck.exec([_this.opt.servOption, _this.opt.prodOption], callback);
                } else {
                    // 性能监控点
                    monitor.startTimer('M05', _this.opt.option)

                    if (!_this.opt.option.uuid) {
                        _this.opt.option.uuid = _this.getUniqueId();
                    }
                    if (_this.opt.option.expenseCategory == 1 && isNaN(_this.opt.option.billNo)) {
                        delete _this.opt.option.billNo;
                    }
                    if (_this.opt.billRemark && _this.opt.remarkCallback) {//如果是挂单备注 需将原单状态修改为已买单
                        _this.opt.option.instoreServiceId = _this.opt.billRemark.id;
                        _this.opt.option.instoreServiceData = _this.opt.remarkCallback(_this.opt.member);
                    }
                    if (_this.opt.instoreServiceVersion) {
                        _this.opt.option.instoreServiceVersion = _this.opt.instoreServiceVersion;
                    }
                    am.api.billCheck.exec(_this.opt.option, callback);
                }
            }

            if (!this.checkBillNoSuccess) {
                if (amGloble.metadata.shopPropertyField.aotomodifybillno == 1) {
                    payTips.open(function () {
                        if (_this.opt.servOption) {
                            _this.opt.servOption.autoModifyBillNo = 1;
                            _this.opt.prodOption.autoModifyBillNo = 1;
                        } else {
                            _this.opt.option.autoModifyBillNo = 1;
                        }
                        _this.getBillNo(toPay);
                    }, function () {
                        am.msg("单号重复！");
                        return;
                    }, _this.opt.option.billNo);
                } else {
                    am.msg('单号重复');
                    return;
                }
            } else {
                _this.getBillNo(toPay);
            }
        },
        getBillNo: function (cb) {
            var _this = this;
            if (am.metadata.shopPropertyField.manualInputBillno != 1) {
                cb && cb();
                return false;
            }
            if (_this.$header.find(".billno input").val().trim()) {
                cb && cb();
                return false;
            }
            am.keyboard.show({
                title: "请输入单号",//可不传
                hidedot: true,
                submit: function (value) {
                    if (!value) {
                        am.msg('请输入单号！');
                        return;
                    }
                    if (isNaN(value)) {
                        am.msg('请输入正确的单号！');
                        return;
                    }
                    _this.checkBillNo(value, cb);
                }
            });
        },
        recalcRoyalty: function (params, url, sc, item) {
            var _this = this;
            var gotoBillRecord = function () {
                $.am.changePage(am.page.billRecord, "");
            };
            am.confirm('', '该单提成计算失败，是否立即重算？', '返回流水', '立即重算', gotoBillRecord, function () {
                _this.getCalacAjax(params, url, sc, item);
            });
        },
        getCalacAjax: function (params, url, sc, item) {
            var _this = this;
            $.ajax({
                type: 'POST',
                url: url,
                data: JSON.stringify(params),
                dataType: 'json',
                contentType: 'application/json',
                success: function (res) {
                    if (res) {
                        sc && sc();
                    }
                    if (res.code == 0) {
                        console.log('getGainAndVoidFee success')
                    } else {
                        if (item == 0) {
                            _this.recalcRoyalty(params, url, sc, item)
                        }
                        // am.msg(res.message || "数据获取失败,请检查网络!");
                    }
                },
                error: function (res) {
                    console.log('计算提成及业绩出错', res)
                    _this.recalcRoyalty(params, url, sc, item)
                }
            });
        },
        getGainAndVoidFee: function (type, cb) {
            var enabledNewPerfModel = amGloble.metadata.enabledNewPerfModel,
                enabledNewBonusModel = amGloble.metadata.enabledNewBonusModel;
            if (this.billId && (enabledNewPerfModel == 1 || enabledNewBonusModel == 1)) {
                var calcFeeUri = enabledNewPerfModel == 1 ? '/empFee/multipleBillCalc' : '/empFee/calcVoidFee';
                var billdIds = [];
                this.billIds.forEach(function (item) {
                    billdIds.push(item.id)
                })
                var userInfo = am.metadata.userInfo,
                    shopid = userInfo.shopId,
                    parentShopId = userInfo.parentShopId,
                    userToken = JSON.parse(localStorage.getItem("userToken")),
                    urlPrefix = config.calcServerUrl,
                    paramsGain = {
                        billid: this.billId,
                        billdIds: billdIds,
                        shopid: shopid,
                        parentShopId: parentShopId,
                        parentId: userInfo.realParentShopId
                    },
                    urlGain = urlPrefix + '/empGain/multipleBillCalc' + "?" + $.param({
                        shopId: shopid,
                        parentShopId: parentShopId,
                        token: userToken ? userToken.mgjtouchtoken : null,
                        parentId: userInfo.realParentShopId
                    }),
                    paramsAchievement = {
                        billId: this.billId,
                        billdIds: billdIds,
                        shopId: enabledNewPerfModel ? shopid : userInfo.realParentShopId, //算业绩时取门店id，算虚业绩时取总部id
                        parentShopId: parentShopId, //租户ID
                        parentId: userInfo.realParentShopId
                    },
                    urlAchievement = urlPrefix + calcFeeUri + "?" + $.param({
                        shopId: userInfo.realParentShopId,
                        parentShopId: parentShopId,
                        token: userToken ? userToken.mgjtouchtoken : null,
                        parentId: userInfo.realParentShopId
                    }),
                    _this = this;
                // 非项目的时候不计算业绩
                this.getCalacAjax(paramsAchievement, urlAchievement,
                    function () {
                        if (amGloble.metadata.enabledNewBonusModel == 1) {
                            _this.getCalacAjax(paramsGain, urlGain, cb)

                        } else {
                            cb && cb();
                        }
                    }, type
                );
            }
        },
        getComboCrossNum: function (comboitem) {
            var num = 0;
            if (comboitem && comboitem.length) {
                for (var i = 0; i < comboitem.length; i++) {
                    if (comboitem[i].shopid != am.metadata.userInfo.shopId) {
                        num++;
                    }
                }
            }
            return num;
        },
        getUniqueId: function () {
            return am.metadata.userInfo.shopId + '_' + am.metadata.userInfo.userId + Math.uuid();
        },
        setTreatItemPerf: function () {
            var option = this.opt.option;
            if (option.expenseCategory === 4) {
                if (!this.isCashTreatMap) {
                    this.isCashTreatMap = this.getIsCashMap(4);
                }

                var cash = 0, card = 0, other = 0;
                var bill = option.billingInfo;
                for (var i in bill) {
                    var type = this.isCashTreatMap[i];

                    if (type === "1") {
                        //是现金
                        cash += bill[i] || 0;
                    } else if (i === 'cardFee' || i === 'debtFee') { // || i==='presentFee'
                        card += bill[i] || 0;
                    } else if (type === "0" || type === "2") {
                        other += bill[i] || 0;
                    }
                }
                cash = cash / bill.total;
                card = card / bill.total;
                other = other / bill.total;

                for (var i = 0; i < option.comboCard.treatments.length; i++) {
                    var items = option.comboCard.treatments[i].serviceItems;
                    for (var j = 0; j < items.length; j++) {
                        items[j].cashFee = items[j].money * cash;
                        items[j].cardFee = items[j].money * card;
                        items[j].otherFee = items[j].money * other;
                    }
                }
            }
        },
        checkIfNeedUpgradeCardType: function (billId) {
            if (this.opt.option.expenseCategory == 3) {
                var $val = this.$list.find('.rechargeCardType').find('.val');
                var upgradeCard = $val.data('data');
                if (upgradeCard) {
                    upgradeCard = upgradeCard.data;
                }
                if ($val.is(":visible") && upgradeCard && upgradeCard.cardtypeid != this.opt.member.cardTypeId.toString()) {
                    //需要升级
                    var _this = this;
                    am.loading.show();
                    am.api.editCardType.exec({
                        "memId": this.opt.member.id,     //会员id
                        "cardId": this.opt.member.cid,	//会员卡id
                        "cardtypeid": upgradeCard.cardtypeid,	//卡类型id
                        "discount": upgradeCard.discount,	//折扣
                        //"invaliddate":"",  //到期日期
                        "rechargefee": this.opt.option.billingInfo.total,  //充值金额
                        "beforcardtypeName": this.opt.member.cardName,  //原来的卡的名字
                        "newcardtypeName": upgradeCard.cardtypename,//修改后卡的名字
                    }, function (ret) {
                        am.loading.hide();
                        if (ret && ret.code == 0) {
                            _this.upgradeCardSuccess = true;
                            _this.showPayConfirm(billId);
                        } else if (ret.code == -1) {
                            am.confirm('会员卡升级失败！', "由于网络问题卡升级失败，是否重试？", "重试", "取消", function () {
                                _this.checkIfNeedUpgradeCardType();
                            }, function () {
                                _this.showPayConfirm(billId);
                            });
                        } else {
                            am.msg(ret.message || "会员卡升级失败！");
                            _this.showPayConfirm(billId);
                        }
                    });
                    return;
                }
            }
            this.showPayConfirm(billId);
        },
        showPayConfirm: function (billId) {
            var _this = this;
            if (
                //会员
                this.opt.member &&
                //项目 或 卖品 消费
                (this.opt.option.expenseCategory == 1 || this.opt.option.expenseCategory == 0) &&
                //使用了套餐项目，或卡金，或赠送金
                //treatfee(this.opt.comboitem && this.opt.comboitem.length)
                //(this.opt.option.billingInfo.treatfee || this.opt.option.billingInfo.treatpresentfee || this.opt.option.billingInfo.cardFee || this.opt.option.billingInfo.presentFee) &&
                ((this.opt.comboitem && this.opt.comboitem.length) || this.opt.option.billingInfo.cardFee || this.opt.option.billingInfo.presentFee) &&
                this.$signatureSwitch.hasClass("checked")
            ) {
                am.signname.show(this.opt, billId);
            } else {
                if (am.metadata.configs.serviceFeedbackInCashierSys === 'true' && this.opt.option.expenseCategory == 0) {//运营系统配置了权限并且使用了项目
                    var commentService = $('#commentService');
                    commentService.find('.settlementComment').hide();

                    am.commentService.show(this.opt, billId, function () {
                        _this.showPaySuccess();
                    }, true)
                } else {
                    this.showPaySuccess();
                    console.log(this.opt);
                    this.paybackFlag = true;
                    _this.setMediaShow(_this.opt, "done");
                }
            }
            if (amClickAudio) amClickAudio.currentTime = 0;
            if (window.successAudio) window.successAudio.play();
            if (this.opt.member == null) {//散客支付完成
                this.setMediaShow(this.opt, "done");
            }
            /*支付完成副屏*/
            //console.log(configs);
            this.successScreenTimer = setTimeout(function () {
                this.successScreenTimer && clearTimeout(this.successScreenTimer);
                var configs = {
                    type: 1,
                    title: "谢谢惠顾,",
                    text: '期待下次光临'
                }
                am.mediaShow(2, configs);
            }, 5 * 1000)
            this.freeScreenTimer = setTimeout(function () {
                this.freeScreenTimer && clearTimeout(this.freeScreenTimer);
                var configs = {
                    cashMachImage: am.metadata.configs.cashMachImage,
                    machWechatText: am.metadata.configs.machWechatText,
                    machWechatMark: am.metadata.configs.machWechatMark
                }
                am.mediaShow(0, configs);
            }, 9 * 1000);
        },
        showPaySuccess: function () {
            var _this = this;
            // _this.getGainAndVoidFee();//调用计算提成及业绩接口
            _this.$confirm.show();
            var i = 3;
            _this.$confirm.find('strong').text(i);
            _this.confirmTimer = setInterval(function () {
                i--;
                _this.$confirm.find('strong').text(i);
                if (i == 0) {
                    _this.paySuccess();
                }
            }, 1000);
        },
        paySuccess: function () {
            var _this = this;
            if (_this.confirmTimer) {
                clearInterval(_this.confirmTimer);
                _this.confirmTimer = null;
            }
            setTimeout(function () {
                _this.$confirm.hide();
            }, 300);
            if (amGloble.metadata.shopPropertyField && amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
                if (am.autoPay.json && _this.opt.member) {
                    if (am.autoPay.billRemark) {
                        if (this.opt.option.expenseCategory == 2) {
                            var cid = this.opt.member.cid;
                            am.autoPay.json.cid = cid;
                            am.autoPay.data.data = am.autoPay.json;
                            am.autoPay.billRemark.opencard.isbuy = true;
                            am.autoPay.data.version++;
                            am.autoPay.service();
                            return;
                        }
                        if (this.opt.option.expenseCategory == 3) {
                            am.autoPay.billRemark.recharge.isbuy = true;
                            am.autoPay.data.version++;
                            am.autoPay.service();
                            return;
                        }
                        if (this.opt.option.expenseCategory == 4) {
                            var buyTreatmentItmes = this.opt.member.buyTreatmentItmes && this.opt.member.buyTreatmentItmes[0];
                            if (buyTreatmentItmes) {
                                var serviceItems = am.autoPay.json.serviceItems;
                                for (var i = 0; i < serviceItems.length; i++) {
                                    if (serviceItems[i].itemId == buyTreatmentItmes.itemid && serviceItems[i].consumeType && !serviceItems[i].consumeId) {
                                        serviceItems[i].consumeId = buyTreatmentItmes.id;
                                    }
                                }
                            }
                            am.autoPay.billRemark.buypackage.isbuy = true;
                            am.autoPay.data.version++;
                            am.autoPay.service();
                            return;
                        }
                    }
                    if (this.opt.option.expenseCategory == 0) {
                        am.autoPay.reset();
                    }
                }
            }
            if (this.opt.from == 'recharge') {
                var opt = this.cardUpgradeObj;
                $.am.page.back('slidedown', { afterRecharge: opt });
                return;
            }
            if (amGloble.metadata.shopPropertyField && amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
                if (this.opt.from == 'memberCard' || this.opt.from == 'comboCard' || this.opt.action == 'recharge') {//开卡,充值，买套餐后返回
                    var arr = [];
                    if (am.page.hangup.tempData && am.page.hangup.tempData.length) {
                        for (var i = 0; i < am.page.hangup.tempData.length; i++) {
                            if (am.page.hangup.tempData[i].memId == this.opt.member.id) {
                                arr.push(am.page.hangup.tempData[i]);
                            }
                        }
                    }
                    if (arr.length) {
                        arr.sort(function (a, b) {
                            return a.createDateTime - b.createDateTime;
                        });
                        if (JSON.parse(arr[0].data).billRemark) {
                            var billRemark = JSON.parse(arr[0].data).billRemark;
                            if (this.opt.billRemark && this.opt.billRemark.id == arr[0].id) {
                                var _billRemark = JSON.parse(this.opt.billRemark.data).billRemark;
                                if (_billRemark) {
                                    if (this.opt.option.expenseCategory == 2) {
                                        if (_billRemark.opencard) {
                                            billRemark.opencard.isbuy = true;
                                        }
                                    } else if (this.opt.option.expenseCategory == 3) {
                                        if (_billRemark.recharge) {
                                            billRemark.recharge.isbuy = true;
                                        }
                                    } else if (this.opt.option.expenseCategory == 4) {
                                        if (_billRemark.buypackage) {
                                            billRemark.buypackage.isbuy = true;
                                        }
                                    }
                                }
                            }

                            // if((!billRemark.opencard || billRemark.opencard.isbuy) && (!billRemark.recharge || billRemark.recharge.isbuy) && (!billRemark.buypackage || billRemark.buypackage.isbuy)){
                            var data = JSON.parse(arr[0].data);
                            data.billRemark = billRemark;
                            data.cid = this.opt.member.cid;
                            arr[0].data = JSON.stringify(data);
                            if (this.opt.billRemark && this.opt.remarkCallback) {
                                arr[0].version++;
                            }
                            am.cashierTab.feedBill(arr[0], 1);
                            // }else {
                            // am.goBackToInitPage();
                            // }
                        } else {
                            arr[0].data.cid = this.opt.member.cid;
                            am.cashierTab.feedBill(arr[0], 1);
                        }
                    } else {
                        var opt = [
                            { name: '去开单', key: 'openBill' },
                        ]
                        am.popupMenu("请选择操作", opt, function (ret) {
                            if (ret.key == 'openBill') {
                                $.am.changePage(amGloble.page.openbill, "slidedown", {
                                    member: _this.opt.member
                                });
                            }
                        }, '', '', function () {
                            am.goBackToInitPage();
                        });
                    }
                } else {
                    am.goBackToInitPage();
                }
            } else {
                am.goBackToInitPage();
            }
            if (this.opt.member && (this.opt.option.expenseCategory == 1 || this.opt.option.expenseCategory == 0)) {
                am.socketPush.getReservationNum();
            }
        },
        /*          cardfee:1,//卡金
        * 			presentfee:2,//赠送金
        * 			cash:3,//现金
        * 			unionpay:1,//银联
        * 			cooperation:1,//合作券
        * 			mall:1,//商场卡
        * 			weixin:1,//微信
        * 			pay:1,//支付宝
        * 			voucherfee:1,//代金券
        * 			dividefee:1,//分期赠金
        * 			deductpoint:1,//积分
        * 			debtfee:10,//欠款
        * 			mdfee:2,//免单
        *           "jdFee":0,//京东
        *           "onlinecredit":"0",//线上积分
        *           "onlinecreditpay":"0",//线上积分抵扣金额
        *           "offlinecredit":"0",//线下积分
        *           "offlinecreditpay":"0",//线下积分抵扣金额 
        *           "mallorderfee":"0",//商城订单
        * 			luckymoney:1,//红包支付
        * 			coupon:1,//优惠券
        * 			dianpin:1,//点评支付
        * 			otherfee1:222,//自定义支付1
        * 			...
        * 			otherfee10:222//自定义支付10
        */
        payTypeMap: {
            "cardFee": "cardfee",
            "presentFee": "presentfee",
            "treatcardFee": "treatcardfee",
            "treatpresentFee": "treatpresentfee",
            "cashFee": "cash",
            "unionPay": "unionpay",
            "cooperation": "cooperation",
            "mall": "mall",
            "weixin": "weixin",
            "pay": "pay",
            "voucherFee": "voucherfee",
            "divideFee": "dividefee",
            "pointFee": "deductpoint",
            "debtFee": "debtfee",
            "mdFee": "mdfee",
            "luckymoney": "luckymoney",
            "coupon": "coupon",
            "dpFee": "dianpin",
            // "jdFee":"jdfee",
            "onlineCreditPay": "onlineCreditPay",
            "offlineCreditPay": "offlineCreditPay",
            "mallOrderFee": "mallorderfee",
        },
        computePerf: function () {
            var opt = {
                paid: {},
                card: null, //{cardtypeid:4,discount:9}
                itemList: []
            };
            var billOption = this.opt.servOption || this.opt.option;
            var billingInfo = JSON.parse(JSON.stringify(billOption.billingInfo)); //$.extend(true,{},billOption.billingInfo);
            billingInfo.treatfee += this.unlimitTreatfee;

            //billingInfo.cardFee += billingInfo.treatfee;
            //billingInfo.presentFee += billingInfo.treatpresentfee;
            for (var i in this.payTypeMap) {
                var v = billingInfo[i];
                if (v) {
                    var k = this.payTypeMap[i];
                    if (k == 'presentfee') {
                        if (this.opt.member && !this.opt.member.allowPresentfeeDiscount && this.opt.member.discount && this.opt.option.expenseCategory != 4) {
                            if (this.$payTypes.filter(".selected").hasClass("pay_bonus")) {
                                opt.paid[k] = billingInfo.total - billingInfo.treatfee - billingInfo.treatpresentfee - billingInfo.luckymoney - billingInfo.mallOrderFee - billingInfo.weixin - billingInfo.pay + this.unlimitTreatfee;
                            } else {
                                opt.paid[k] = v * (this.opt.member.discount / 10);
                            }
                        } else {
                            opt.paid[k] = v;
                        }
                    } else {
                        opt.paid[k] = v;
                    }
                } else if (typeof (v) == 'undefined') {
                    // throw ('支付方式key不匹配：' + i);
                }
            }

            var items = billOption.serviceItems;
            for (var i = 0; i < items.length; i++) {
                var itemdata = {
                    itemid: items[i].itemId,
                    //储值卡即为用卡消费 传1，资格卡和散客传2
                    consumetype: (this.opt.member && this.opt.member.cardtype == 1) ? 1 : 2,
                    //consumemode:1,//消费方式 （单次 0 套餐 1 计次2 赠送3 年卡4）
                    consumemode: items[i].consumeType,
                    price: items[i].perfPrice || items[i].salePrice,
                    cost: items[i].price,
                    empList: [],

                    cashFee: items[i].cashFee,
                    cardFee: items[i].cardFee,
                    otherFee: items[i].otherFee,
                };
                if (items[i].totalTimes === -99) {//不限次参考年卡
                    itemdata.consumemode = 4;
                    itemdata.unlimited = 1;
                }
                var servers = items[i].servers;
                if (servers && servers.length) {
                    for (var j = 0; j < servers.length; j++) {
                        itemdata.empList.push({
                            no: servers[j].empNo,
                            dutytype: servers[j].dutytypecode,
                            dutyid: servers[j].dutyid,
                            per: servers[j].per,
                            perf: servers[j].perf
                        });
                    }
                }
                opt.itemList.push(itemdata);
            }
            if (this.opt.member) {
                opt.card = {
                    cardtypeid: this.opt.member.cardTypeId,
                    discount: this.opt.member.discount || 10,//折扣
                    treatcardfee: (billingInfo.treatfee || 0) + (this.unlimitTreatfee || 0),//(this.opt.member.treatcardfee ||0)+this.unlimitTreatfee,
                    treatpresentfee: billingInfo.treatpresentfee || 0
                };
            }
            var _total = billingInfo.total - billingInfo.treatfee - billingInfo.treatpresentfee;
            opt.rate = amGloble.metadata.configs.debtFlag * 1 ? (_total ? (1 - billingInfo.debtFee / _total) : 1) : 1;
            //006 计算业绩
            console.log('computingPerformance:', opt);
            console.log(JSON.stringify(opt));
            var ret = computingPerformance.computing(opt);
            console.log('computingPerformance return:', ret);
            var eaFee = 0;
            for (var i = 0; i < items.length; i++) {
                var payDetail = ret[i].total;
                //员工列表
                var empper = ret[i].empper;
                //店内业绩
                items[i].storePerf = ret[i].shopper;
                items[i].thirdCommission = ret[i].unshopper;
                eaFee += ret[i].shopper;
                //项目的支付方式拆分
                items[i].payDetail = {};
                for (var j in this.payTypeMap) {
                    var k = this.payTypeMap[j];
                    if (items[i].consumeType === 1 && k === 'treatcardfee') {
                        //套餐项目
                        items[i].payDetail.treatfee = payDetail[k] || 0;
                    } else if (items[i].consumeType === 1 && k === 'treatpresentfee') {
                        //套餐项目
                        items[i].payDetail.treatpresentfee = payDetail[k] || 0;
                    } else {
                        items[i].payDetail[j] = payDetail[k] || 0;
                        //TODO
                        if (k === 'onlineCreditPay') {
                            items[i].payDetail.onlineCredit = payDetail[k] * am.metadata.configs.onlineCreditPay || 0;
                        } else if (k === 'offlineCreditPay') {
                            items[i].payDetail.offlineCredit = payDetail[k] * am.metadata.configs.offlineCreditPay || 0;
                        }
                    }
                }
                var servers = items[i].servers;
                // 判断是否开启新业绩模式，若开启走新逻辑
                if (amGloble.metadata.enabledNewPerfModel == 1) {
                    for (var k = 0; k < servers.length; k++) {
                        servers[k].automaticPerformance = servers[k].perf > 0 ? 0 : 1;
                        var perfDetail = {};
                        perfDetail.voidFee = items[i].salePrice * opt.rate;
                        servers[k].perfDetail = perfDetail;
                    }
                    continue;
                }
                var payFeePctObj = this.getPayFeePctObj({ total: items[i].salePrice, payDetail: items[i].payDetail });
                //拿员工业绩
                for (var k = 0; k < servers.length; k++) {
                    // 判断是否手动修改业绩
                    servers[k].automaticPerformance = servers[k].perf > 0 ? 0 : 1;
                    if (servers[k].perf > 0) {
                        servers[k].cardfee = empper[k].total.cardfee;
                        servers[k].cashfee = empper[k].total.cashfee;
                        servers[k].otherfee = empper[k].total.otherfee;
                        if (!servers[k].per) {
                            servers[k].per = this.getManualPer(servers[k], servers);
                        }
                    } else {
                        servers[k].perf = empper[k].pre * servers[k].per / 100;
                        servers[k].cardfee = empper[k].total.cardfee * servers[k].per / 100;
                        servers[k].cashfee = empper[k].total.cashfee * servers[k].per / 100;
                        servers[k].otherfee = empper[k].total.otherfee * servers[k].per / 100;
                    }
                    // 按每一种支付方式换算业绩
                    var perfDetail = {};
                    for (var payName in payFeePctObj) {
                        var pct = payFeePctObj[payName];
                        perfDetail[payName] = servers[k].perf * pct;
                    }
                    // 虚业绩
                    perfDetail.voidFee = items[i].salePrice * opt.rate;
                    servers[k].perfDetail = perfDetail;
                }
            }

            if (billOption.expenseCategory == 0) {
                billOption.billingInfo.eaFee = toFloat(eaFee);
                if (Math.abs(billOption.billingInfo.eaFee - billOption.billingInfo.total) < 1) {
                    //如果数值接近，认为相等，抹掉误差
                    billOption.billingInfo.eaFee = billOption.billingInfo.total;
                }
            }
        },
        getManualPer: function (server, servers) {
            var total = 0;
            for (var i = 0; i < servers.length; i++) {
                if (servers[i].dutytypecode == server.dutytypecode) {
                    total += servers[i].perf * 1;
                }
            }
            return Math.round((server.perf / total) * 100 * 100) / 100;
        },
        computeProductPayDetail: function () {
            var billOption = this.opt.prodOption || this.opt.option;
            var billingInfo = billOption.billingInfo;
            var depots = billOption.products.depots;
            for (var i = 0; i < depots.length; i++) {
                var p = depots[i].salePrice * depots[i].number / billingInfo.total;
                depots[i].payDetail = {};
                for (var j in this.payTypeMap) {
                    depots[i].payDetail[j] = Math.round(billingInfo[j] * p * 100) / 100;
                    //TODO
                    if (j === 'onlineCreditPay') {
                        depots[i].payDetail.onlineCredit = (Math.round(billingInfo[j] * p * am.metadata.configs.onlineCreditPay * 100) / 100);
                    } else if (j === 'offlineCreditPay') {
                        depots[i].payDetail.offlineCredit = (Math.round(billingInfo[j] * p * am.metadata.configs.offlineCreditPay * 100) / 100);
                    }
                }
            }
        },
        processTreatsBillParams: function () {
            // 处理组合套餐包数据格式 将组合套餐项目放到外层
            var comboCard = this.opt.option.comboCard;
            var treatments = comboCard.treatments;
            for (var i = 0, len = treatments.length; i < len; i++) {
                var treatInfo = treatments[i];
                if (treatInfo.packageId < 0) {
                    comboCard.serviceItems = treatInfo.serviceItems;
                    treatments.splice(i, 1);// 去掉组合套餐
                }
            }
        },
        distpachPayDetailToServiceItem: function (payDetail, treats, isCostDetail) {
            var total = this.opt.option.billingInfo.total;
            var combNotCalIntoAchiev = am.metadata.configs.combNotCalIntoAchiev == 'true' ? 1 : 0;// 1成本不算业绩 0 成本算业绩
            if (combNotCalIntoAchiev === 0) {
                total += this.opt.option.cost || 0;
            }
            if (treats && treats.length) {
                $.each(treats, function (i, v) {
                    if (v.packageId && v.packageId > -1) {
                        // var rate =  v.price / total ;
                        if (combNotCalIntoAchiev) {
                            var rate = v.price / total;
                        } else {
                            var rate = (v.price + v.treatsCost) / total;
                        }
                        v.payDetail = {};
                        if (isCostDetail) {
                            v.costDetail = {};
                        }
                        for (var key in payDetail) {
                            v.payDetail[key] = Math.round(payDetail[key] * rate * 100) / 100;
                            if (isCostDetail) {
                                v.costDetail[key] = Math.round(payDetail[key] * rate * 100) / 100;
                            }
                        }

                    } else {
                        var serviceItems = v.serviceItems;
                        $.each(serviceItems, function (index, value) {
                            if (combNotCalIntoAchiev) {
                                var innerRate = value.money / total;
                            } else {
                                var innerRate = value.allPrice / total;
                            }
                            value.payDetail = {};
                            if (isCostDetail) {
                                value.costDetail = {};
                            }
                            for (var k in payDetail) {
                                value.payDetail[k] = Math.round(payDetail[k] * innerRate * 100) / 100;
                                if (isCostDetail) {
                                    value.costDetail[k] = Math.round(payDetail[k] * innerRate * 100) / 100;
                                }
                            }
                        })
                    }
                })
            }
        },
        computePerSetPerf: function (type) {
            console.log('this.opt.option------start', this.opt.option)
            var _this = this;
            var combNotCalIntoAchiev = am.metadata.configs.combNotCalIntoAchiev == 'true' ? 1 : 0;// 1成本不算业绩 0 成本算业绩
            var isRepeat = this.opt.prodOption && this.opt.option;
            var expenseCategory = isRepeat ? this.opt.prodOption.expenseCategory : this.opt.option.expenseCategory;
            if (expenseCategory) {
                var billingInfo = isRepeat ? this.opt.prodOption.billingInfo : this.opt.option.billingInfo;
                var t = billingInfo.total - billingInfo.debtFee;
                if (expenseCategory === 4) {
                    // 套餐加上成本
                    if (!combNotCalIntoAchiev) {
                        t += this.opt.option.cost || 0;
                    }
                }
                var sellingItems = [];
                var payDetail = JSON.parse(JSON.stringify(billingInfo));
                if (expenseCategory === 1) {
                    // 卖品
                    sellingItems = sellingItems.concat(isRepeat ? this.opt.prodOption.products.depots : this.opt.option.products.depots);
                    console.log('卖品sellingItems======', sellingItems)
                } else if (expenseCategory === 4) {
                    // 套餐
                    var treatments = this.opt.option.comboCard.treatments;
                    $.each(treatments, function (key, treatInfo) {
                        // 待组合套餐
                        if (treatInfo.packageId > 0) {
                            sellingItems.push(treatInfo);
                        } else {
                            sellingItems = sellingItems.concat(treatInfo.serviceItems);
                        }
                    });
                } else if (expenseCategory === 2 || expenseCategory === 3) {
                    // 开卡 充值时card是对象 转为数组以备遍历
                    sellingItems = [this.opt.option.card];
                }
                if (this.opt.member && !this.opt.member.allowPresentfeeDiscount && this.opt.member.discount && expenseCategory != 4) {
                    if (payDetail.presentFee) {
                        if (this.$payTypes.filter(".selected").hasClass("pay_bonus")) {
                            payDetail.presentFee = billingInfo.total - billingInfo.treatfee - billingInfo.treatpresentfee - billingInfo.luckymoney - billingInfo.mallOrderFee - billingInfo.weixin - billingInfo.pay;
                        } else {
                            payDetail.presentFee = payDetail.presentFee * (this.opt.member.discount / 10);
                        }
                    }
                }


                if (expenseCategory == 4 && this.opt.option.comboCard.costDetail) {
                    // 分套餐包的costDetail
                    this.distpachPayDetailToServiceItem(this.opt.option.comboCard.costDetail, this.opt.option.comboCard.treatments, 1);
                    for (var key in payDetail) {
                        for (key2 in this.opt.option.comboCard.costDetail) {
                            if (key == key2) {
                                if (am.metadata.configs.combNotCalIntoAchiev != 'true') {
                                    payDetail[key] = payDetail[key] + this.opt.option.comboCard.costDetail[key];
                                }
                            }
                        }
                    }
                    this.distpachPayDetailToServiceItem(payDetail, this.opt.option.comboCard.treatments);
                }
                var rate = amGloble.metadata.configs.debtFlag * 1 ? (1 - billingInfo.debtFee / (billingInfo.total + (this.opt.option.cost || 0))) : 1;
                // 遍历每一个卖品       
                for (var d = 0, len = sellingItems.length; d < len; d++) {
                    var selledItem = sellingItems[d];
                    var servers = selledItem.servers;
                    var t2 = 0;
                    if (servers) {
                        if (expenseCategory === 1) {
                            t = selledItem.salePrice * selledItem.number - (selledItem.payDetail && selledItem.payDetail.debtFee || 0); // 每个卖品的实际售价
                            t2 = selledItem.salePrice * selledItem.number;
                        } else if (expenseCategory === 4) {
                            if (combNotCalIntoAchiev) {
                                // 成本不算业绩
                                if (selledItem.serviceItems) {
                                    // 套餐包
                                    t = selledItem.price - (selledItem.payDetail && selledItem.payDetail.debtFee || 0);
                                } else {
                                    // 单个项目
                                    t = selledItem.money - (selledItem.payDetail && selledItem.payDetail.debtFee || 0);
                                }
                            } else {
                                // 成本算业绩
                                if (selledItem.serviceItems) {
                                    // 套餐包
                                    // t = selledItem.price + selledItem.treatsCost // 服务项目加成本的总价
                                    t = selledItem.price + selledItem.treatsCost - (selledItem.payDetail && selledItem.payDetail.debtFee || 0); // 服务项目加成本的总价
                                    t2 = selledItem.price + selledItem.treatsCost;
                                } else {
                                    // 单个项目
                                    t = selledItem.allPrice - (selledItem.payDetail && selledItem.payDetail.debtFee || 0);
                                    t2 = selledItem.allPrice;
                                }
                            }
                        } else if (expenseCategory === 2 || expenseCategory === 3) {
                            t = billingInfo.total - billingInfo.debtFee;
                            t2 = billingInfo.total;
                        }
                        // 待 t可能有问题 内外
                        var payMoneyCategoryPctObj = this.getPayMoneyCategoryPctObj({
                            total: t,
                            payDetail: selledItem.payDetail || payDetail
                        });
                        var payFeePctObj = this.getPayFeePctObj({
                            total: t,
                            payDetail: selledItem.payDetail || payDetail,
                            isNotProject: true
                        });

                        for (var i = 0; i < servers.length; i++) {
                            // 判断是否手动修改业绩
                            servers[i].automaticPerformance = servers[i].perf > 0 ? 0 : 1;
                            if (!servers[i].perf) {
                                var perf;
                                perf = servers[i].perf = toFloat(t * servers[i].per / 100);
                                if ([1, 4].indexOf(expenseCategory) >= 0) {
                                    servers[i].cardfee = perf * payMoneyCategoryPctObj['card'];
                                    servers[i].cashfee = perf * payMoneyCategoryPctObj['cash'];
                                    servers[i].otherfee = perf * payMoneyCategoryPctObj['other'];
                                }
                            } else {
                                var servsersCount = servers.length;
                                if (_this.getPerfMode() === 0) {
                                    servsersCount = _this.getCorrectEmpsLength(servers[i].station, servers);
                                }
                                var per = Math.round(10000 / servsersCount) / 100;
                                var perf = toFloat((t2 || 0) * per / 100);
                                if (servers[i].perf == perf) {
                                    servers[i].perf *= rate;
                                }
                                servers[i].cardfee = servers[i].perf * payMoneyCategoryPctObj['card'];
                                servers[i].cashfee = servers[i].perf * payMoneyCategoryPctObj['cash'];
                                servers[i].otherfee = servers[i].perf * payMoneyCategoryPctObj['other'];
                            }
                            // 按每一种支付方式换算业绩
                            var perfDetail = {};
                            for (var payName in payFeePctObj) {
                                var pct = payFeePctObj[payName];
                                perfDetail[payName] = servers[i].perf * pct;
                            }
                            servers[i].perfDetail = perfDetail;
                        }
                    }
                }
                var debtFlag = amGloble.metadata.configs.debtFlag * 1;
                if (debtFlag) {
                    billingInfo.eaFee = billingInfo.total - billingInfo.debtFee;
                }
                if (expenseCategory == 4) {
                    // 套餐购买 将组合套餐数据提到外层与treatments同级
                    this.processTreatsBillParams();
                }
            }
        },
        // 计算当前工位有多少员工
        getPerfMode: function () {
            if (this.$.selector.indexOf('#page_service') == -1) {
                //默认为2 员工共享100%业绩 bug 0027015 后端觉得数据库设置默认值影响较大 不同意加 所以前端设置默认值 造成基础系统配置必须点击保存才真正数据库有值
                return (amGloble.metadata.shopPropertyField && amGloble.metadata.shopPropertyField.notSharedPerformance || 0) * 1;
            } else {
                return 0;
            }
        },
        getCorrectEmpsLength: function (stationNo, servers) {
            var count = 0;
            $.each(servers, function (index, server) {
                if (server.station === stationNo) {
                    count++;
                }
            })
            return count;
        },
        // 获取每种支付方式的金额占比，以及相应业绩字段
        getPayFeePctObj: function (params) {
            var payTypeMaps = {
                "cardFee": "cardfee",
                "presentFee": "presentfee",
                "cashFee": "cash",
                "unionPay": "unionpay",
                "cooperation": "cooperation",
                "mall": "mall",
                "weixin": "weixin",
                "pay": "pay",
                "voucherFee": "voucherfee",
                "divideFee": "dividefee",
                "debtFee": "debtfee",
                "mdFee": "mdfee",
                "luckymoney": "luckymoney",
                "coupon": "coupon",
                "dpFee": "dianpin",
                "onlineCreditPay": "onlineCreditPay",
                "offlineCreditPay": "offlineCreditPay",
                "mallOrderFee": "mallorderfee",
                "treatfee": "treatfee",
                "treatpresentfee": "treatpresentfee",
                "otherfee1": "otherfee1",
                "otherfee2": "otherfee2",
                "otherfee3": "otherfee3",
                "otherfee4": "otherfee4",
                "otherfee5": "otherfee5",
                "otherfee6": "otherfee6",
                "otherfee7": "otherfee7",
                "otherfee8": "otherfee8",
                "otherfee9": "otherfee9",
                "otherfee10": "otherfee10"
            };
            var feeTotal = 0;
            var feeDetail = {};
            var payDetail = params.payDetail;
            var payTotal = params.total;
            var isNotProject = params.isNotProject;
            var payFeePctObj = {};

            if (isNotProject) {
                // 非项目不算基准业绩
                feeTotal = payTotal;
                feeDetail = payDetail;
            } else {
                var empperBaseFeeConfig = {};
                am.metadata.payConfigs.forEach(function (item) {
                    var payKey = item.field.toLowerCase();
                    var empperBaseFeePct = item.empper / 100; // 员工支付方式的基准业绩占比
                    empperBaseFeeConfig[payKey] = empperBaseFeePct;
                });
                for (var i in payTypeMaps) {
                    if (isNotProject && i === 'debtFee') continue;
                    var payKey = payTypeMaps[i];
                    var baseFeePct = empperBaseFeeConfig[payKey];
                    if (baseFeePct === undefined) baseFeePct = 1;
                    var currentPayVal = payDetail[i];
                    if (currentPayVal > 0) {
                        var currentFee = currentPayVal * baseFeePct;
                        feeDetail[i] = currentFee;
                        feeTotal += currentFee;
                    }
                }
            }
            for (var i in feeDetail) {
                if (isNotProject && i === 'debtFee') continue; // 项目以外的欠款不算业绩
                var currentFee = feeDetail[i];
                var payKey = payTypeMaps[i];
                if (!payKey) continue;
                var pct = currentFee / feeTotal;
                if (pct > 0) {
                    payFeePctObj[payKey] = pct;
                }
            }
            return payFeePctObj;
        },
        getPayMoneyCategoryPctObj: function (params) {
            var payDetail = params.payDetail;
            var total = params.total;
            var payMoneyCategoryObj = this.getPayMoneyCategoryObj(params);
            var payMoneyCategoryPctObj = {};
            for (var i in payMoneyCategoryObj) {
                var currentMoney = payMoneyCategoryObj[i];
                payMoneyCategoryPctObj[i] = currentMoney / total;
            }
            return payMoneyCategoryPctObj;
        },
        getPayMoneyCategoryObj: function (params) {
            var payDetail = params.payDetail;
            var total = params.total;
            var cash = 0,
                card = 0,
                other = 0;
            for (var i in payDetail) {
                var currentVal = payDetail[i];
                if (this.isCashPay(i)) {
                    cash += currentVal
                } else if (['cardFee', 'presentFee', 'divideFee', 'treatfee', 'treatpresentfee'].indexOf(i) > -1) {
                    card += currentVal
                }
            }
            return {
                cash: cash,
                card: card,
                other: total - cash - card
            }
        },
        splitBillPay: function () {
            var bill = this.opt.option.billingInfo;
            var servBill = this.opt.servOption.billingInfo;
            var prodBill = this.opt.prodOption.billingInfo;

            this.opt.servOption.gender = this.opt.prodOption.gender = this.opt.option.gender;
            this.opt.servOption.comment = this.opt.prodOption.comment = this.opt.option.comment;
		    /*
            "dpId": null, //点评id
            "payId": null, //支付宝id
            "weixinId": null, //微信 id
            "unionOrderId": null, //银联 id
            "dpCouponId": null, //微信 id
             bill.mallId = mallOrder.id;
             bill.mallNo = mallOrder.code;
		    */
            var cpKeys = { 'dpId': 1, 'payId': 1, 'weixinId': 1, 'unionOrderId': 1, 'dpCouponId': 1, luckyMoneyId: 1 };
            for (var k in cpKeys) {
                servBill[k] = prodBill[k] = bill[k];
            }
            if (bill.mallId) {
                if (bill.mallCategory == 1) {
                    servBill.mallId = bill.mallId;
                    servBill.mallNo = bill.mallNo;
                } else {
                    prodBill.mallId = bill.mallId;
                    prodBill.mallNo = bill.mallNo;
                }
            }

            servBill.treatfee = bill.treatfee;
            servBill.treatpresentfee = bill.treatpresentfee;

            var cashTotal = 0, noCashTotal = 0;
            for (var i in bill) {
                if (this.isCashPay(i)) {
                    //是现金
                    cashTotal += bill[i];
                }
            }
            noCashTotal = bill.total - cashTotal - bill.treatfee - bill.treatpresentfee;

            var prodCash = 0, prodNoCash = 0, servCash = 0, servNoCash = 0;
            if (cashTotal >= prodBill.total) {
                //现金足够卖品的钱
                //卖品所以钱都是现金
                prodCash = prodBill.total;
                //卖品无非现
                prodNoCash = 0;
                //项目现金=总现金- 全部卖品金额
                servCash = cashTotal - prodBill.total;
                //非现全部归项目
                servNoCash = noCashTotal;
            } else {
                //现金不足
                //卖品全部现金
                prodCash = cashTotal;
                //卖品除去现金部分，归卖品非现
                prodNoCash = prodBill.total - cashTotal;
                //项目现金为0
                servCash = 0;
                //项目所以钱都是非现
                servNoCash = servBill.total - bill.treatfee - bill.treatpresentfee;
            }

            for (var key in bill) {
                if (this.isCashMap[key] === "1") {
                    //现金
                    if (bill[key]) {
                        //如果有钱分钱
                        servBill[key] = bill[key] * servCash / cashTotal;
                        prodBill[key] = bill[key] - servBill[key];
                    } else {
                        servBill[key] = 0;
                        prodBill[key] = 0;
                    }
                } else if (this.isCashMap[key] === "0" || this.isCashMap[key] === "2") {
                    //非现
                    if (bill[key]) {
                        //如果有钱分钱
                        servBill[key] = bill[key] * servNoCash / noCashTotal;
                        prodBill[key] = bill[key] - servBill[key];
                    } else {
                        servBill[key] = 0;
                        prodBill[key] = 0;
                    }
                } else if (key.indexOf('otherfee') === 0) {
                    servBill[key] = 0;
                    prodBill[key] = 0;
                } else {
                    //servBill[key] = prodBill[key] = bill[key];
                }
            }
        },
        //项目专用
        isCashPay: function (key) {
            if (!this.isCashMap) {
                this.isCashMap = this.getIsCashMap(0);
            }
            return this.isCashMap[key] === "1";
        },
        getIsCashMap: function (c) {
            var payConfigs = am.payConfigMap[c || 0];
            var isCashMap = {
                luckymoney: "0",
                coupon: "0"
            };
            for (var j in this.payTypeMap) {
                var key = this.payTypeMap[j].toUpperCase();
                var config = payConfigs[key];
                if (config) {
                    isCashMap[j] = payConfigs[key].type;
                }
            }

            return isCashMap;
        },
        getCardTypePopMenuData: function () {
            var cardTypeList = am.metadata.cardTypeList;
            var upgradeCard = [];
            for (var i = 0; i < cardTypeList.length; i++) {
                if (cardTypeList[i].cardtype == "1" && (cardTypeList[i].timeflag == 0 || cardTypeList[i].timeflag == 2)) {
                    var discount = ' (无折扣)';
                    if (cardTypeList[i] && cardTypeList[i].discount != 10 && cardTypeList[i].discount != 0) {
                        discount = ' (' + cardTypeList[i].discount + '折)';
                    }
                    upgradeCard.push({
                        name: cardTypeList[i].cardtypename + discount,
                        data: cardTypeList[i]
                    });
                }
            }
            this.cardTypeList = upgradeCard;
        },
        keyboardCtrl: function (keyCode) {
            var _this = this;
            var ctrl = window.keyboardCtrl;
            if (document.activeElement && $(document.activeElement).hasClass('input_no')) {

            } else {
                if ($('.payDetail').is(':visible') || $('#common_addremark').is(':visible')
                    || $('#maskBoard').is(':visible') || $('.nativeUIWidget-showPopupMenu').is(':visible')
                    || $('#setMutiPerf').is(':visible') || $("#phoneCodeModal").is(':visible')
                    || $('#selectCancleReason').is(':visible')) {
                    return;
                }
                var num = ctrl.getNum(keyCode);
                if (typeof (num) === 'number') {
                    var keyCodeEq = null;
                    if ($("#maskBoard").is(":visible")) {
                        return;
                    }

                    if (keyCode >= 97 && keyCode <= 103) {
                        keyCodeEq = 97;
                    } else if (keyCode >= 49 && keyCode <= 55) {
                        keyCodeEq = 49;
                    }

                    //判断重复选择return
                    if ($("#page_pay .payTypes li").eq(keyCode - keyCodeEq).hasClass('am-disabled')) {
                        return;
                    } else {
                        $("#page_pay .payTypes li").eq(keyCode - keyCodeEq).trigger('vclick');
                    }

                } else if (keyCode == 13) {
                    if ($("#maskBoard").is(":visible") || $('#commentService').is(':visible')) {
                        return;
                    } else if ($('#multiCardPayConfirm').is(':visible')) {
                        //点击评价成功后,点击回车键让评价成功后的弹窗消失
                        $('#multiCardPayConfirm .goBack').trigger('vclick');
                        sessionStorage.cardPreventKeyB = 'prevent';
                        return;
                    }

                    //结算
                    var nowTime = new Date().getTime();
                    this.submitArr.push(nowTime);

                    var num = this.compareTime(this.submitArr[0], nowTime);
                    console.log(num, this.submitArr);
                    if (num >= 0.3) {
                        if (this.submitArr.length >= 2) {
                            this.submitArr = [];
                            var config = am.metadata.userInfo.operatestr.indexOf('a39') > -1 ? 1 : 0;
                            if (!config) {
                                // 0 允许结算  1允许结算
                                $("#page_pay .submit").trigger('vclick');
                            }
                            // $("#page_pay .submit").trigger('vclick');

                        } else { }
                    } else { }
                } else if (keyCode == 107 && !$('#commentService').is(':visible')) {
                    // +号键 蓝牙打印
                    $("#page_pay .print").trigger('vclick');
                } else if (keyCode === 111) {
                    +
                        this.backButtonOnclick();
                } else if (keyCode === 109 && $('#commentService').is(':visible')) {
                    // -号键 不想评价
                    $('.cancel_comment').trigger('vclick');
                }
            }
        },
    });
})();
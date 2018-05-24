(function () {
    var payTips = {
        $: $(".billTips"),
        init: function () {
            var _this = this;
            this.$.on("vclick", ".ok", function () {
                _this.submit && _this.submit();
                _this.hide();
            }).on("click", ".close", function () {
                _this.cancel && _this.cancel();
                _this.hide();
            }).on('vclick','.cancle',function(){
                _this.hide();
                am.page.pay.$submit.removeClass("am-disabled");
            });
        },
        open: function (submit, cancel) {
            this.submit = submit;
            this.cancel = cancel;
            if(am.metadata.shopPropertyField.mgjBillingType==1 && am.operateArr.indexOf('a37')==-1){
                this.$.addClass('onlyCover');
            }else {
                this.$.removeClass('onlyCover');
            }
            this.show();
        },
        show: function () {
            this.$.show();
        },
        hide: function () {
            this.$.hide();
        }
    }
    am.page.pay = new $.am.Page({
        id: "page_pay",
        backButtonOnclick: function () {
            if (this.paytool[this.paytool.type] && this.paytool[this.paytool.type].$.is(":visible") && this.paytool.type != 'mix') {
                this.paytool.hide();
            } else {
                var $payed = this.$payTypes.filter(".payed");
                var $input = this.paytool.mix.$.find('.mixval.payed');
                if ($payed.length || $input.length) {
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
                }else if(this.opt.billRemark){
                    if(this.opt.from == 'comboCard' || this.opt.from == 'memberCard'){
                        $.am.page.back("slidedown");
                    }else{
                        am.goBackToInitPage();
                    }
                    
                } else {
                    $.am.page.back("slidedown");
                }
            }
        },
        init: function () {
            var _this = this;
            this.$list = this.$.find("dl.payInfo");
            this.$list.find('.rechargePriceItem').vclick(function () {//充值卡金
                var $this = $(this);
                if (!_this.opt.renewal) {
                    am.keyboard.show({
                        "title": "输入充值金额",
                        "submit": function (value) {
                            if (_this.opt.debt) {
                                if (value * 1 > _this.opt.debt.remainFee) {
                                    am.msg('充值金额不能超出欠款余额');
                                    return 1;
                                }
                                $this.find('.val').text("￥" + value);
                                _this.opt.option.billingInfo.total = value * 1 || 0;
                                _this.opt.option.billingInfo.eaFee = _this.opt.option.billingInfo.total;
                                _this.setNeedPay(value);
                            } else {
                                var mgj_minRecharge = $this.find('.val').attr("mgj_minRecharge");
                                if (mgj_minRecharge && value && value * 1 < mgj_minRecharge * 1) {
                                    value = mgj_minRecharge;
                                    am.msg('此卡已限制最低充值金额为￥' + mgj_minRecharge);
                                }
                                value *= 1;
                                $this.find('.val').text("￥" + value);
                                _this.opt.option.billingInfo.total = value * 1 || 0;
                                _this.opt.option.billingInfo.eaFee = _this.opt.option.billingInfo.total;
                                _this.setNeedPay(value);
                                if (_this.opt.cardType) {
                                    var bonus = am.page.memberCard.getBonusRule(_this.opt.cardType, value);
                                    _this.$list.find('.val.rechargeBonus').text(("￥" + bonus) || "");
                                }
                            }
                            //副屏支付结算详情
                            _this.setMediaShow(_this.opt, "cz");
                        }
                    });
                } else {
                    //续卡金额
                    var settings = JSON.parse(_this.opt.cardType.mgjCardRenewal);
                    for (var i = 0; i < settings.length; i++) {
                        settings[i].name = settings[i].moneys + '元' + settings[i].months + '个月';
                    }
                    am.popupMenu("请选择续卡时间", settings, function (ret) {
                        console.log(ret);
                        $this.find('.val').text("￥" + ret.moneys * 1 + '(' + ret.months + '个月)');
                        _this.opt.option.billingInfo.total = ret.moneys * 1 || 0;
                        _this.opt.option.billingInfo.eaFee = _this.opt.option.billingInfo.total;
                        _this.setNeedPay(ret.moneys * 1);
                        _this.renewalOption = ret;
                        //副屏支付结算详情
                        _this.setMediaShow(_this.opt, "xk");
                    });
                }
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

            this.$list.find('.rechargeBonusItem').vclick(function () {//充值赠送金
                var $this = $(this);
                am.keyboard.show({
                    "title": "输入赠送金额",
                    "submit": function (value) {
                        value *= 1;
                        _this.opt.option.billingInfo.presentFee = value * 1;
                        $this.find('.val').text("￥" + value);
                        _this.setMediaShow(_this.opt, 'cz');
                    }
                });
            });
            this.$list.find('.rechargeCardType').vclick(function () {
                var $this = $(this);
                var arr = [];
                for (var i = 0; i < _this.cardTypeList.length; i++) {
                    if (_this.cardTypeList[i].data.cardtypeid == _this.opt.member.cardTypeId) {

                    } else if (_this.cardTypeList[i].data.newflag == "1" && _this.cardTypeList[i].data.timeflag == _this.opt.member.timeflag) {
                        arr.push(_this.cardTypeList[i]);
                    }
                }

                if (!arr.length) {
                    atMobile.nativeUIWidget.showMessageBox({
                        title: "会员卡无法升级",
                        content: '没有可升级的同类型会员卡'
                    });
                    return;
                }

                am.popupMenu("请选择会员卡类型升级", arr, function (ret) {
                    if (ret) {
                        $this.find('.val').text(ret.name).data('data', ret);
                    } else {
                        $this.find('.val').text('').removeData('data');
                    }
                });
            });
            this.$list.find('.rechargeSales').vclick(function () {
                var $this = $(this);
                var sales = [], emps = am.metadata.employeeList;
                var setting = localStorage.getItem("setting_seller_" + am.metadata.userInfo.parentShopId), map = {};
                if (setting) {
                    try {
                        setting = JSON.parse(setting);
                    } catch (e) {
                        setting = null;
                    }

                    for (var j = 0; j < setting.length; j++) {
                        map[setting[j].key] = setting[j].flag;
                    }
                }
                for (var i = 0; i < emps.length; i++) {
                    if (map["emps_" + emps[i].id] != 0) {
                        sales.push(emps[i]);
                    }
                }
                am.popupMenu("请选择销售", sales, function (ret) {
                    if (ret && ret.length) {
                        _this.opt.option.card.servers = [];
                        var name = [];
                        for (var i = 0; i < ret.length; i++) {
                            _this.opt.option.card.servers.push({
                                "empId": ret[i].id,
                                "empName": ret[i].name,
                                "empNo": ret[i].no,
                                "station": ret[i].pos,
                                "pointFlag": 1, // 是否指定 0指定 1非指定
                                "dutyid": ret[i].dutyType
                            });
                        }
                        _this.setRechargePerf();
                        /*}
                        if(ret && ret.id){
                            _this.opt.option.card.servers = [{
                                "empId": ret.id,
                                "empName": ret.name,
                                "empNo": ret.no,
                                "station":ret.pos,
                                "pointFlag": 1, // 是否指定 0指定 1非指定
                                "dutyid": ret.dutyType
                            }];
                            $this.find(".val").text(ret.name);*/
                    } else {
                        _this.opt.option.card.servers = [];
                        $this.find(".val").text("");
                    }
                }, false, 1);
            });
            this.$list.find('dd.luckymoney').vclick(function () {
                if (_this.needPay > 0 || $(this).data('data')) {
                    _this.paytool.luckyMoney.show(_this.opt.member, _this.opt.option.expenseCategory);
                } else {
                    am.msg('不需要支付更多金额了！');
                }
            });
            this.$list.find('dd.mallOrder').vclick(function () {
                if (_this.needPay > 0) {
                    _this.paytool.mallOrder.show(_this.opt.member, _this.opt.option.expenseCategory);
                } else {
                    am.msg('不需要支付更多金额了！');
                }
            });
            this.$list.find('dd.prePay').vclick(function () {
                if (_this.needPay > 0) {
                    _this.paytool.prePay.show(undefined, _this.opt.option.expenseCategory);
                } else {
                    am.msg('不需要支付更多金额了！');
                }
            });
            this.$payTypes = this.$.find(".payTypes li").vclick(function () {
                var $this = $(this);
                if ($this.hasClass("selected")) {
                    //return;
                } else {
                    var $selected = _this.$payTypes.filter('.selected');
                    if ($selected.length) {
                        var data = $selected.data('data');
                        var payed = 0;
                        if ($selected.hasClass('payed') && data && data.status == 3) {
                            payed = 1;
                        } else if ($selected.hasClass('pay_mix')) {
                            var $payed = _this.paytool.mix.$.find('.payed');
                            payed = $payed.length;
                        }
                        if (payed) {
                            atMobile.nativeUIWidget.showMessageBox({
                                title: "用户已完支付",
                                content: '用户已在线支付成功,修改支付方式请导致支付订单无关联异常，请先退款'
                            });
                            return;
                        }
                    }
                }

                if (_this.paytool.type) {
                    _this.paytool[_this.paytool.type].hide();
                }
                $this.addClass("selected").siblings().removeClass("selected");
                _this.$right.removeClass("pay_memberCard")
                    .removeClass("pay_pos")
                    .removeClass("pay_cash1")
                    .removeClass("pay_cash")
                    .removeClass("pay_wechat")
                    .removeClass("pay_alipay")
                    .removeClass("pay_dp").removeClass("pay_bonus");
                if ($this.hasClass("pay_memberCard")) {
                    _this.$right.addClass("pay_memberCard");
                    _this.renderMemberCard();
                } else if ($this.hasClass("pay_pos")) {
                    _this.$right.addClass("pay_pos");
                    _this.$posTipTotal.text(_this.needPay + '元');
                    console.log(_this.opt);
                    if (_this.opt.action && _this.opt.action == "recharge") {
                        _this.opt.card && _this.setMediaShow(_this.opt, 'xk');
                        !_this.opt.card && _this.setMediaShow(_this.opt, 'cz');
                    } else {
                        _this.setMediaShow(_this.opt);
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
                } else if ($this.hasClass("pay_dp")) {
                    _this.$right.addClass("pay_dp");
                    _this.paytool.show("dp");
                } else if ($this.hasClass("pay_mix")) {
                    _this.paytool.show("mix");
                } else if ($this.hasClass("pay_bonus")) {
                    _this.$right.addClass("pay_memberCard");
                    _this.renderMemberCard(1);
                }
            });

            payTips.init();

            //提未区
            this.$right = this.$.find(".right");
            this.$cashTipTotal = this.$.find('.cash .highlight');
            this.$posTipTotal = this.$.find('.pos .highlight');
            this.renderMemberCard = function (isBonus) {
                if (!this.$cardTipTotal) {
                    this.$cardTipTotal = this.$.find('.card .highlight');
                    this.$cardTipInfo = this.$.find('.cardBg');
                    this.$isBonus = this.$.find(".balanceORbonus");
                }
                if (isBonus) {
                    this.$isBonus.text("赠送金");
                } else {
                    this.$isBonus.text("卡金");
                }

                this.$cardTipTotal.text(this.needPay + '元');
                var member = this.opt.member;
                if (member.timeflag == 2) {
                    this.$cardTipInfo.addClass('combo');
                } else {
                    this.$cardTipInfo.removeClass('combo');
                }
                this.$cardTipInfo.find('.name').text(member.cardName);
                this.$cardTipInfo.find('.no').text(member.cardNo);
                this.$cardTipInfo.find('.price').text("￥" + (Math.round((member.balance) * 100) / 100));
                this.$cardTipInfo.find('.bonus').text("赠送金：￥" + (Math.round((member.gift) * 100) / 100));
            };

            //提交
            this.$submit = this.$.find(".submit").vclick(function () {
                if(!_this.opt.member){
                    _this.submit();
                }else {
                    am.pw.check(_this.opt.member,function(verifyed){
                        if(verifyed){
                            _this.submit();
                        }
                    });
                }
                                
            });
            this.paytool.init();

            this.$confirm = $('#payConfirm').vclick(function () {
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
                am.addRemark.show({
                    value: _this.opt.option.comment,
                    cb: function (val) {
                        _this.opt.option.comment = val;
                        $this.text(val || "");
                    },
                    maxlength: 100
                });
            });

            this.$billNo = this.$header.find(".billno input").on("vclick",function(){
                if($(this).prop("readonly")){
                    am.msg("开单模式下单号自动生成！");
                    return;
                }
                if(am.metadata.shopPropertyField.mgjBillingType==1 && am.operateArr.indexOf('a37')==-1){
                    am.msg("没有权限修改单号！");
                    return;
                }
                var _this = $(this);
                am.keyboard.show({
					title:"请输入单号",//可不传
					hidedot:true,
				    submit:function(value){
                        if(isNaN(value)){
                            am.msg('请输入正确的数值！');
                            return;
                        }
                        _this.val(value.substring(0,20));
                        if(value.length>20){
                            am.msg('单号长度超过20位数字已自动截取');
                        }
				    }
				});
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
        beforeShow: function (paras) {
            var printType = this.getPrintType();
            if (printType == "bt") {
                this.$.find(".userPrintType li").removeClass("selected").eq(0).addClass("selected");
            } else {
                this.$.find(".userPrintType li").removeClass("selected").eq(1).addClass("selected");
            }
            if(window.location.protocol.indexOf('http')!=-1){
                this.$.find(".userPrintType").addClass('web').find('.printType').hide();
            }else {
                this.$.find(".userPrintType").removeClass('web').find('.printType').show();
            }
            this.$billNo.val('');
            if(paras && paras.option){
                this.$billNo.val(paras.option.billNo || "");
                // if(amGloble.metadata.shopPropertyField && amGloble.metadata.shopPropertyField.mgjBillingType == 1){
                //     this.$billNo.prop("readonly","readonly");
                // }else{
                //     this.$billNo.prop("readonly",false);
                // }
            }else if(paras && paras.billRemark){
                this.$billNo.val(paras.billRemark.serviceNO || "");
            }
            
            if (paras == "back") {
                //重置

            } else if (paras && paras.reset) {
                //重置 , 大众点评新创建会员会从这里回来
                this.opt.member = paras.reset;
                //this.render();
                this.paytool.hide();
            } else {
                this.opt = paras;
                console.log(paras);
                this.render();
                //副屏支付结算详情
                if (this.opt.action == "recharge") {
                    return;
                }
                this.setMediaShow(paras);
            }
            var configs = am.metadata.configs;
            if (configs && configs['mobileRepeat']) {
                this.mbRepeatConfig = JSON.parse(configs['mobileRepeat']);
            }

            
        },
        afterShow: function (paras) {
            this.paybackFlag = false;//副屏显示关闭
            this.$submit.removeClass("am-disabled");
            var member = this.opt.member;
            if(member){
                if(member.cardtype != 2){
                    this.$.find(".pay_memberCard p").html('余额：'+Math.round((member.balance) * 100) / 100);
                    this.$.find(".pay_bonus p").html('余额：'+Math.round((member.gift) * 100) / 100);
                    this.$.find(".mixPayScrollInner input[name='card']").attr("placeholder",'余额：'+Math.round((member.balance) * 100) / 100);
                    this.$.find(".mixPayScrollInner input[name='bonus']").attr("placeholder",'余额：'+Math.round((member.gift) * 100) / 100);
                }else{
                    this.$.find(".pay_memberCard p").html('');
                    this.$.find(".pay_bonus p").html('');
                    this.$.find(".mixPayScrollInner input[name='card']").attr("placeholder","")
                    this.$.find(".mixPayScrollInner input[name='bonus']").attr("placeholder","")
                }
            }else{
                this.$.find(".pay_memberCard p").html('');
                this.$.find(".pay_bonus p").html('');
                this.$.find(".mixPayScrollInner input[name='card']").attr("placeholder","")
                this.$.find(".mixPayScrollInner input[name='bonus']").attr("placeholder","")
            }
        },
        beforeHide: function (paras) {

        },
        afterHide: function () {
            /*恢复初始副屏设置*/
            if (!this.paybackFlag) {
                var params = JSON.parse(JSON.stringify(am.metadata.configs));
                am.mediaShow(0, params);
            }
            //this.opt = null;
            try {
                am.signname.hide();
            }catch (e){
                
            }
            
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
        setRechargePerf: function (cb) {
            var _this = this;
            am.setPerf.show({
                total: this.needPay || 0,
                emps: this.opt.option.card.servers,
                submit: function (pers,perfs,gains) {
                    var html = [];
                    for (var i = 0; i < _this.opt.option.card.servers.length; i++) {
                        var emp = _this.opt.option.card.servers[i];
                        emp.per = pers[i];
                        emp.perf = perfs[i];
                        emp.gain = gains[i];
                        // html.push('<span per="' + emp.per + '">' + emp.empName + '(业绩' + emp.perf +',提成'+emp.gain+')' + '</span>');
                        if(am.operateArr.indexOf('a9')==-1){
                            html.push('<span per="' + emp.per + '">' + emp.empName + '(业绩' + emp.perf +')' + '</span>');
                        }else {
                            var $gain = emp.gain?',提成'+emp.gain:'';
                            html.push('<span per="' + emp.per + '">' + emp.empName + '(业绩' + emp.perf +$gain+')' + '</span>');
                        }
                    }
                    _this.$list.find('.rechargeSales .val').html(html.join(","));
                }
            });
        },
        setNeedPay: function (t) {//算还需付的钱
            this.needPay = this.opt.option.billingInfo.total - this.comboDeduct + (this.opt.option.cost || 0);
            var coupon = this.$list.find('dd.dpCoupon').data('data');
            if (coupon) {
                //点评支付的钱
                this.needPay -= coupon.marketprice;
            }
            var luckymoney = this.$list.find('dd.luckymoney').data('data');
            if (luckymoney) {
                this.needPay -= luckymoney.money;
            }
            var mallOrder = this.$list.find('dd.mallOrder').data('data');
            if (mallOrder) {
                this.needPay -= ((mallOrder.cashPay * 1 || 0) + (mallOrder.luckyMoneyPay || 0));
            }
            var prePay = this.$list.find('dd.prePay').data('data');//加入当面付之后 会重算待付金额
            if (prePay) {
                this.needPay -= prePay.price;
            }
            if (this.needPay < 0) {
                this.needPay = 0;
            }
            this.needPay = Math.round(this.needPay * 100) / 100;

            this.$list.find('.val.payTotal').text("￥" + this.needPay);
            //支付区背景还原
            this.$right.removeClass("pay_memberCard")
                .removeClass("pay_pos")
                .removeClass("pay_cash1")
                .removeClass("pay_cash")
                .removeClass("pay_wechat")
                .removeClass("pay_alipay")
                .removeClass("pay_dp").removeClass("pay_bonus").addClass("pay_cash1");
            this.$.find('.payDetail').hide();
            //根据结算数据，显示和隐藏支付方式
            if (this.needPay) {
                this.$payTypes.removeClass('am-disabled').removeClass("selected");
                var member = this.opt.member;

                if (this.opt.option.expenseCategory == 0 && !coupon && !this.opt.prodOption) {
                    //收银类型是0，而且没有使用点评券，而且没有卖品
                    //才允许用点评支付
                    this.$payTypes.filter('.pay_dp').removeClass('am-disabled');
                } else {
                    this.$payTypes.filter('.pay_dp').addClass('am-disabled');
                }

                if (prePay) {
                    if (prePay.type == 1) {
                        this.$payTypes.filter('.pay_wechat').addClass('am-disabled');
                    } else if (prePay.type == 2) {
                        this.$payTypes.filter('.pay_alipay').addClass('am-disabled');
                    } else if (prePay.type == 3) {
                        this.$payTypes.filter('.pay_dp').addClass('am-disabled');
                    }
                }

                if (member && (this.opt.option.expenseCategory == 0 || this.opt.option.expenseCategory == 1 || this.opt.option.expenseCategory == 4) && member.cardtype == 1 && member.timeflag != 1) {
                    //开卡充值，不能用卡金支付，套餐包也不能用卡金买
                    //也就是说，只有项目，卖品会进来
                    //资格卡不能用
                    //计次卡不能用
                    if (Math.round((member.balance) * 100) < Math.round((this.needPay) * 100)) {
                        this.$payTypes.filter('.pay_memberCard').addClass('am-disabled');
                    }
                    if (Math.round((member.gift) * 100) < Math.round((this.needPay) * 100)) {
                        this.$payTypes.filter('.pay_bonus').addClass('am-disabled');
                    }
                } else {
                    this.$payTypes.filter('.pay_memberCard,.pay_bonus').addClass('am-disabled');
                }
            } else {
                this.$payTypes.addClass('am-disabled').removeClass("selected");
            }

            var expenseCategory = this.opt.option.expenseCategory;
            if (this.opt.prodOption) {
                expenseCategory = 5;
            }
            this.$payTypes.each(function () {
                var $this = $(this);
                $this.removeData('data');
                //预先已处理好数据，am.payConfigMap
                //新业绩模式下，按5大类分别配置支付方式
                var key = $this.attr('paytype');
                if (key && !am.payConfigMap[expenseCategory][key]) {
                    $this.hide();
                } else {
                    $this.show();
                }
            });
            this.setMediaShow(this.opt);
            //console.log(this.needPay)
        },
        showSmsSendFlag:function(){
            this.$smsSendFlag.removeClass('checked');
            if(!this.opt.member){
                this.$smsSendFlag.hide();
                this.opt.option.smsflag = '0';
                return;
            }
            var isAllowed = amGloble.operateArr.indexOf('Q')==-1?false:true;
            var smsflag = '0';
            var cardList = amGloble.metadata.cardTypeList;
            if(cardList.length){
                for(var i=0;i<cardList.length;i++){
                    if(cardList[i].cardtypeid==this.opt.member.cardTypeId){
                        smsflag = cardList[i].smsflag;
                    }
                }
            }
            this.opt.option.smsflag = smsflag;
            
            if(!isAllowed){
                this.$smsSendFlag.hide();
            }else {
                this.$smsSendFlag.show();
                if(smsflag==0){
                    this.$smsSendFlag.html('不发送微信消息请打勾');
                }else if(smsflag==1){
                    this.$smsSendFlag.html('不发送短信和微信消息请打勾');
                }
                if(this.opt.member.cardtype==2){
                    this.$smsSendFlag.hide();
                }else {
                    if(this.opt.option.expenseCategory==3 || this.opt.option.expenseCategory==0 || this.opt.option.expenseCategory==1){
                        this.$smsSendFlag.show();
                    }else{
                        this.$smsSendFlag.hide();
                    }
                } 
            }

            if(this.opt.option.expenseCategory==2){
                this.opt.option.smsflag = '1';
            }
        },
        render: function () {
            if (this.opt.member && this.opt.member.memberInfo && this.opt.member.card) {
                //用户详情的数据格式与收银台的数据格式不一致，做转换
                this.opt.member = am.convertMemberDetailToSearch(this.opt.member);
            }

            this.debt = null; //无论如何，先设置欠款为null;
            this.$header.find("p").text('支付');//header重置为 【支付】
            console.log(this.opt)
            //先根据不同的结算类型控制界面显示
            if (!this.opt.option && this.opt.action == "recharge") {
                //总额隐藏，充值金额，赠送金栏显示，
                this.$list.find('dt.totalprice').hide();
                this.$list.find('.rechargeItem').show().find('.val').text("");
                this.$list.find('dd.mallOrder').hide();
                this.$list.find('dd.luckymoney').hide();
                this.$list.find('dd.prePay').show().find('.val').addClass("add").removeClass("edit").text("");
                this.$list.find('.rechargeBonusItem').removeClass('am-disabled');
                if (this.opt.renewal) {
                    this.$list.find('.rechargePriceItem').show().find('.label').html('续卡金额：');
                    this.$list.find('.rechargeBonusItem').hide();
                } else {
                    this.$list.find('.rechargePriceItem').show().find('.label').html('充值金额：');
                    this.$list.find('.rechargeBonusItem').show();
                }
                var $rechargeCardType = this.$list.find('.rechargeCardType').hide();//卡升级

                //充值时 option内容由自己组装， 其它情况由相应页面传参
                this.rechargeOptionPrepear();

                if (this.opt.billRemark) {//备注充值
                    this.$list.find('.val.rechargePrice').text("￥" + this.opt.rechargeMoney);
                    this.opt.option.billingInfo.total = this.opt.rechargeMoney * 1 || 0;
                    this.opt.option.billingInfo.eaFee = this.opt.option.billingInfo.total;
                    this.setNeedPay(this.opt.rechargeMoney);
                    this.setMediaShow(this.opt, "cz");
                }

                if (this.opt.debt) {
                    //如果是还欠款
                    this.$list.find('.rechargeBonusItem').hide();
                    this.$header.find("p").text('还款充值');
                    var remainFee = this.opt.debt.remainFee;
                    this.$list.find('.val.rechargePrice').text("￥" + remainFee);
                    this.opt.option.billingInfo.total = remainFee;
                    this.opt.option.billingInfo.eaFee = remainFee;
                } else {
                    //正常充值
                    if (!this.cardTypeList) {
                        //拿卡列表
                        this.getCardTypePopMenuData();
                    }

                    $rechargeCardType.find('.val').text('').removeData('data');
                    if (this.cardTypeList && this.cardTypeList.length) {
                        if (this.opt.member.shopId == am.metadata.userInfo.shopId) {
                            //本门店
                            if (this.opt.renewal) {
                                $rechargeCardType.hide();
                            } else {
                                $rechargeCardType.show();
                            }
                        } else if (am.metadata.userInfo.shopType == 2) {
                            //跨门店而且是直营店
                            for (var i = 0; i < am.metadata.shopList.length; i++) {
                                if (this.opt.member.shopId == am.metadata.shopList[i].shopId && am.metadata.shopList[i].softgenre == 2) {
                                    //顾客的开卡门店也是直营店
                                    if (this.opt.renewal) {
                                        $rechargeCardType.hide();
                                    } else {
                                        $rechargeCardType.show();
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    var cardTypeId = this.opt.member.cardTypeId;
                    //查找卡类型
                    var cardType = am.metadata.cardTypeList.filter(function (a) {
                        return a.cardtypeid == cardTypeId;
                    });
                    this.$list.find('.val.rechargePrice').removeAttr("mgj_minRecharge");
                    if (cardType && cardType[0]) {
                        this.opt.cardType = cardType[0];
                        //查看充值规则
                        if (cardType[0].mgj_minRecharge) {
                            if(this.opt.billRemark && this.opt.rechargeMoney<cardType[0].mgj_minRecharge){
                                this.opt.option.billingInfo.total = cardType[0].mgj_minRecharge;
                                this.opt.option.billingInfo.eaFee = this.opt.option.billingInfo.total;
                                this.$list.find('.val.rechargePrice').text("￥" + cardType[0].mgj_minRecharge).attr("mgj_minRecharge", cardType[0].mgj_minRecharge);
                            }
                            
                        }
                        var rechargeMoney = cardType[0].mgj_minRecharge;
                        if(this.opt.billRemark){
                            rechargeMoney = this.opt.rechargeMoney;
                        }
                        
                        var bonus = am.page.memberCard.getBonusRule(cardType[0], rechargeMoney);
                        
                        this.$list.find('.val.rechargeBonus').text(("￥" + bonus) || "");
                        if (am.metadata.userInfo.operatestr && am.metadata.userInfo.operatestr.indexOf("A0") == -1) {
                            this.$list.find('.rechargeBonusItem').addClass('am-disabled');
                        } else {
                            this.$list.find('.rechargeBonusItem').removeClass('am-disabled');
                        }
                    }
                }
            } else {
                //总额显示，充值金额，赠送金栏隐藏，
                this.$list.find('dt.totalprice').show();
                this.$list.find('.rechargeItem').hide()
                if (this.opt.option.expenseCategory > 1) {
                    this.$list.find('dd.mallOrder').hide().find('.val').addClass("add").removeClass("edit").text("");
                } else {
                    this.$list.find('dd.mallOrder').show().find('.val').addClass("add").removeClass("edit").text("");
                }

                this.$list.find('dd.luckymoney').show().find('.val').addClass("add").removeClass("edit").text("");
                this.$list.find('dd.prePay').show().find('.val').addClass("add").removeClass("edit").text("");
                if (this.opt.member && this.opt.option.expenseCategory < 2) {
                    this.$list.find('dd.mallOrder,dd.luckymoney').removeClass('am-disabled');
                } else {
                    this.$list.find('dd.mallOrder,dd.luckymoney').addClass('am-disabled');
                }
            }
            var $costItem = this.$list.find('dt.comboitemItem');
            if ((this.opt.option.expenseCategory == 4 || this.opt.option.expenseCategory == 2) && this.opt.option.cost) {
                $costItem.show().find(".combocost").text("￥" + Math.round(this.opt.option.cost * 100) / 100);
                var costLabel = "开卡成本：";
                if (this.opt.option.expenseCategory == 4) {
                    costLabel = "套餐成本：";
                }
                $costItem.find(".label").text(costLabel);
            } else {
                $costItem.hide();
            }

            this.$list.find('dd.luckymoney').removeData('data');
            this.$list.find('dd.mallOrder').removeData('data');
            this.$list.find('dd.prePay').removeData('data');
            //点评券总是先隐藏
            this.$list.find('dd.dpCoupon').hide().removeData('data').find('val').text('');//.find('.val').addClass("add").removeClass("edit").text("");
            console.log(this.opt);
            var bill = this.opt.option.billingInfo;
            bill.total = Math.round(bill.total * 100) / 100;
            //显示整单金额
            this.$list.find('.total').text("￥" + bill.total);
            //套餐扣减金额
            this.comboDeduct = 0;
            this.comboItemCount();
            //设置需要支付的金额
            this.setNeedPay();
            //重置 并隐藏支付区
            this.paytool.reset();
            this.paytool.hide();

            if (am.operateArr.indexOf("a14") != -1) {
                this.$list.find('dd.luckymoney').hide();
            }

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

            if (this.opt.prodOption) {
                this.$payTypes.filter('.pay_dp').addClass('mixProdPay');
            } else {
                this.$payTypes.filter('.pay_dp').removeClass('mixProdPay');
            }

            this.showDepPerfSet();
            if (this.opt.renewal) {
                this.$.find('dd.depPerf').hide();
            }

            this.showSmsSendFlag();

        },
        showDepPerfSet: function () {
            if (am.metadata.deparList && am.metadata.deparList.length > 1) {
                var _this = this;
                if (!this.$depPerfSet) {
                    this.$depPerfSet = this.$.find('dd.depPerf').show();
                    this.$depPerfSet.find('.depPerfVal').vclick(function () {
                        am.popupMenu("请选择部门", am.metadata.deparList, function (ret) {
                            if (ret && ret.length) {
						        /*for(var i=0;i<ret.length;i++){
							        var dep = ret[i];
							        _this.$depPerfSet.find('.depPerfItem').append('<div class="depName" depcode="'+dep.code+'"><span class="depNameText">'+dep.name+'</span><span class="depPerText"></span></div>');
							        _this.$depPerfSet.find('.depPer').append('<div class="depVal"></div>');
						        }*/
                                var emps = [];
                                var p = Math.round(10000 / ret.length) / 100;
                                for (var i = 0; i < ret.length; i++) {
                                    emps.push({
                                        empNo: ret[i].code,
                                        empName: ret[i].name,
                                        per: p
                                    });
                                }
                                am.setPerf.show({
                                    total: am.page.pay.opt.option.billingInfo.total, //+(am.page.pay.opt.option.cost || 0)
                                    emps: emps,
                                    submit: function (pers) {
								        /*console.log('am.setPerf.show.submit',pers);
								        var $depVal= _this.$depPerfSet.find('.depVal');
								        var $depPerText = _this.$depPerfSet.find('.depPerText');

								        for(var i=0;i<pers.length;i++){
									        $depVal.eq(i).css({width:pers[i]+'%'});
									        $depPerText.eq(i).text(pers[i]+'%');
								        }*/
                                        //_this.$depPerfSet.find('.depPerfItem').empty();
                                        //_this.$depPerfSet.find('.depPer').empty();
                                        var html = [];
                                        for (var i = 0; i < emps.length; i++) {
                                            var emp = emps[i];
                                            html.push('<span per="' + emp.per + '" depcode="' + emp.empNo + '">' + emp.empName + '(' + emp.perf + ')' + '</span>');
                                            //var dep = ret[i];
                                            //_this.$depPerfSet.find('.depPerfItem').append('<div class="depName" depcode="'+dep.code+'"><span class="depNameText">'+dep.name+'</span><span class="depPerText">('+emps[i].perf+')</span></div>');
                                            /*_this.$depPerfSet.find('.depPer').append('<div class="depVal" style="width:'+emps[i].per+'%"></div>');*/
                                        }
                                        _this.$depPerfSet.find('.depPerfItem').html(html.join(","));
                                    }
                                });
                            } else {
                                _this.$depPerfSet.find(".depPerfItem").text("");
                            }
                        }, false, 1);
                    });
                }
                if (this.opt.option.expenseCategory > 1) {
                    this.$depPerfSet.find('.depPerfItem').html('');
                    if (this.opt.option.expenseCategory === 2 && this.opt.option.cardType === "2") {
                        this.$depPerfSet.hide();
                    } else {
                        this.$depPerfSet.show();
                    }
                } else {
                    this.$depPerfSet.hide().find('.depPerfItem').html('');
                }
            } else {
                this.$.find('dd.depPerf').hide();
            }
        },
        comboItemCount: function () {
            var bill = this.opt.option.billingInfo, deduct = 0;
            /*var treatcardfee =0,treatpresentfee=0;
            if(this.opt.member){
                treatcardfee = this.opt.member.treatcardfee;
                treatpresentfee = this.opt.member.treatpresentfee;
            }*/
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


	                /*if(treatcardfee >= items[i].price){
		                //套餐卡金
		                treatcardfee-=items[i].price;
		                bill.treatfee+=items[i].price;
	                }else if(treatpresentfee >= items[i].price){
		                //套餐赠金
		                treatpresentfee-=items[i].price;
		                bill.treatpresentfee+=items[i].price;
	                }else{
		                //走到这里，说明卡金和赠金都比 price
		                bill.treatfee += treatcardfee;
		                var t = items[i].price-treatcardfee;
		                bill.treatpresentfee+=t;
		                treatcardfee = 0;
		                treatpresentfee -=t;
	                }
                    */
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
        addDpCoupon: function (data) {
            var that = this;
            var $dd = this.$list.find('dd.dpCoupon').show();
            $dd.data('data', data).find('.val').html('<span class="name">' + data.dealtitle + '</span><span class="price">' + data.marketprice + '</span>');
            var bill = this.opt.option.billingInfo;
            bill.dpCouponId = data.id;
            this.setNeedPay(this.needPay - data.marketprice);
            this.paytool.mix.$input.filter('[name=dp]').val("");
            // if (!this.opt.member) {
            //     am.loading.show("正在获取数据，请稍候...");
            //     am.api.searchmember.exec({
            //         "parentShopId": am.metadata.userInfo.parentShopId,
            //         "shopId": am.metadata.userInfo.shopId,
            //         "shopIds": am.metadata.userInfo.shopId,
            //         "keyword": data.mobile,
            //         "pageSize": 1500,
            //         "pageNumber": 0
            //     }, function (ret) {
            //         am.loading.hide();
            //         if (ret && ret.code === 0 && ret.content && ret.content.length) {
            //             if (!that.mbRepeatConfig) {
            //                 am.popupMenu("请选择会员", ret.content, function (res) {
            //                     am.page.pay.beforeHide();
            //                     am.page.pay.afterHide();
            //                     am.page.pay.beforeShow({
            //                         reset: res
            //                     });
            //                     am.page.pay.afterShow({
            //                         reset: res
            //                     });
            //                 }, false, false, null);
            //             }else{
            //                 am.popupMenu("请选择会员", ret.content, function (ret) {
            //                     am.page.pay.beforeHide();
            //                     am.page.pay.afterHide();
            //                     am.page.pay.beforeShow({
            //                         reset: ret
            //                     });
            //                     am.page.pay.afterShow({
            //                         reset: ret
            //                     });
            //                 }, false, false, function () {
            //                     am.page.pay.addDpMember(data.mobile);
            //                 });
            //             }
            //         }else{
            //             am.page.pay.addDpMember(data.mobile);
            //         }
            //     });
            // }
        },
        addDpMember: function (mobile) {
            //增加新顾客;
            $.am.changePage(am.page.addMember, "slideup", {
                defultInfo: {
                    mobile: mobile
                },
                from: "点评优惠券",
                onSelect: function (member) {
                    $.am.changePage(am.page.pay, "slidedown", {
                        reset: member
                    });
                }
            });
        },
        rechargeOptionPrepear: function () {
            var member = this.opt.member;
            var user = am.metadata.userInfo;
            this.opt.option = {
                "parentShopId": user.realParentShopId,
                "shopId": user.shopId,
                "memId": member.id,
                "cardId": member.cid,
                "expenseCategory": 3,
                "gender": member.sex,
                "custSource": 0, //常规，内创外创
                "comment": "",
                "clientflag": 1, //记客数
                "otherFlag": 1, //是否跨店，0 本店， 1 跨店
                "token": user.mgjtouchtoken,
                "card": {
                    "isJc": 0,			// 是否计次充值 （null || 0：否 1：是）
                    "costFee": 0,		// 会员卡工本费
                    "costmoney": 0,		// 套餐成本金额
                    "costunionfee": 0,	// 会员卡成本银联费
                    "servers": []
                },
                "billingInfo": {
                    "total": 0,
                    "eaFee": 0, //入账金额
                    "treatfee": 0,
                    "treatpresentfee": 0,
                }
            };
            if (this.opt.billRemark) {
                this.opt.option.billNo = this.opt.billRemark.serviceNO;
            }
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
        submit: function (isPrint) {
            var $type = this.$payTypes.filter(".selected");
            var bill = $.extend(this.opt.option.billingInfo, {
                "cardFee": 0, //卡金
                //"presentFee": 0, //赠送金
                "cashFee": 0, //现金
                "unionPay": 0, //银联
                "cooperation": 0, //合作券
                "mall": 0, //商场卡
                "weixin": 0, //微信
                "pay": 0, //支付宝
                "voucherFee": 0, //代金券
                "mdFee": 0, //免单金额
                "divideFee": 0, //分期赠送进
                "pointFee": 0, //积分
                "debtFee": 0, //欠款
                "dpFee": 0, //点评
                "dpId": null, //点评id
                "payId": null, //支付宝id
                "weixinId": null, //微信 id
                "dpCouponId": null, //微信 id

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
            console.log(bill)
            if (this.opt.option.expenseCategory != 2) {
                //如果是开卡，presentFee要保留之前的设定
                bill.presentFee = 0;
            }
            console.log(this.needPay)
            if (this.needPay > 0) {
                if ($type.length) {
                    if ($type.hasClass("pay_memberCard")) {
                        bill.cardFee = this.needPay;
                    } if ($type.hasClass("pay_bonus")) {
                        bill.presentFee = this.needPay;
                    } else if ($type.hasClass("pay_cash")) {
                        bill.cashFee = this.needPay;
                    } else if ($type.hasClass("pay_pos")) {
                        bill.unionPay = this.needPay;
                    } else if ($type.hasClass("pay_wechat")) {
                        bill.weixin = this.needPay;
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.weixinId = paydata.id;
                        } else if (this.checkOnlinePayAuth()) {
                            return 1;
                        }
                    } else if ($type.hasClass("pay_alipay")) {
                        bill.pay = this.needPay;
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.payId = paydata.id;
                        } else if (this.checkOnlinePayAuth()) {
                            return 1;
                        }
                    } else if ($type.hasClass("pay_dp")) {
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.dpFee = (paydata.userpayamount * 1 || 0) + (paydata.dpactivityamount * 1 || 0);
                            bill.voucherFee = this.needPay - bill.mall;
                            bill.dpId = paydata.id;
                        } else if (this.checkOnlinePayAuth()) {
                            return 1;
                        } else {
                            bill.dpFee = this.needPay;
                        }
                    } else if ($type.hasClass("pay_mix")) {
                        if (typeof (this.paytool.mix.checkTotalPrice()) == "undefined") {
                            var $input = this.paytool.mix.$input;
                            for (var i = 0; i < $input.length; i++) {
                                var $thisInput = $input.eq(i);
                                var val = $thisInput.val() * 1;
                                if (val > 0) {
                                    var payTypeName = $thisInput.attr('name');
                                    bill[this.payTypeNameMap[payTypeName] || payTypeName] = val;
                                    if (payTypeName == "wechat") {
                                        var paydata = $thisInput.data('data');
                                        if (paydata) {
                                            bill.weixinId = paydata.id;
                                        } else if (this.checkOnlinePayAuth()) {
                                            return 1;
                                        }
                                    }
                                    if (payTypeName == "alipay") {
                                        var paydata = $thisInput.data('data');
                                        if (paydata) {
                                            bill.payId = paydata.id;
                                        } else if (this.checkOnlinePayAuth()) {
                                            return 1;
                                        }
                                    }
                                    if (payTypeName == "dp") {
                                        var paydata = $thisInput.data('data');
                                        if (paydata) {
                                            var dpt = (paydata.userpayamount * 1 || 0) + (paydata.dpactivityamount * 1 || 0);
                                            bill.voucherFee = bill.dpFee - dpt;
                                            bill.dpFee = dpt;
                                            bill.dpId = paydata.id;
                                        } else if (this.checkOnlinePayAuth()) {
                                            return 1;
                                        }
                                    }
                                }
                            }
                        } else {
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

            var data = this.$list.find('dd.dpCoupon').data('data');
            if (data) {
                //商城卡支付加上 点评优惠券的钱
                bill.dpFee += data.price;
                bill.voucherFee += (data.marketprice - data.price);
                bill.dpCouponId = data.id;
            } else {
                bill.dpCouponId = null;
            }

            var luckyMoney = this.$list.find('dd.luckymoney').data('data');
            if (luckyMoney) {
                var realLuckyMoney = luckyMoney.money || 0;
                if (bill.total < luckyMoney.money) {
                    realLuckyMoney = bill.total;
                }
                bill.luckymoney += realLuckyMoney;
                bill.luckyMoneyId = luckyMoney.id;
            }
            var mallOrder = this.$list.find('dd.mallOrder').data('data');
            if (mallOrder) {
                bill.luckymoney += (mallOrder.luckyMoneyPay || 0);
                bill.mallId = mallOrder.id;
                bill.mallNo = mallOrder.code;
                bill.mallCategory = mallOrder.category;
                if (mallOrder.cashPay) {
                    if (mallOrder.payType == 0) {
                        bill.weixin += mallOrder.cashPay;
                    } else if (mallOrder.payType == 1) {
                        bill.pay += mallOrder.cashPay;
                    } else {
                        alert('error: 请向shuwu报告');
                    }
                }
            }
            var prepay = this.$list.find('dd.prePay').data('data');
            if (prepay) {
                if (prepay.type == 1) {
                    bill.weixin += prepay.price;
                    bill.weixinId = prepay.id;
                } else if (prepay.type == 2) {
                    bill.pay += prepay.price;
                    bill.payId = prepay.id;
                } else {
                    alert('error: 请向shuwu报告');
                }
            }
            if (this.opt.option.expenseCategory == 3) {
                //如果是充值
                var bonus = this.$list.find("div.rechargeBonus").text().replace("￥", "") * 1;
                if (bonus) {
                    bill.presentFee = bonus;
                }
                if (this.opt.renewal) {
                    var oldTime = this.opt.card.invaliddate * 1 > new Date().getTime() ? new Date(this.opt.card.invaliddate * 1) : new Date(),
                        oldMonth = oldTime.getMonth(),
                        addedMonths = this.renewalOption.months * 1;
                    oldTime.setMonth(oldMonth + addedMonths);
                    this.opt.option.card.invaliddate = oldTime.getTime();
                    this.opt.option.card.month = this.renewalOption.months * 1;
                }

                if (this.opt.debt) {
                    console.log('todo');
                    //alert('todo');
                    var debtOption = cashierDebt.getRepayOption(bill.total, this.opt.member, this.opt.debt);
                    this.opt.option.debtId = debtOption.debtLogId;
                    this.opt.option.debtContent = debtOption.content;
                    this.opt.option.debtfee = debtOption.debtFee;
                    this.opt.option.remainfee = debtOption.remainFee;
                }
            } else if ((this.opt.option.expenseCategory == 4 || this.opt.option.expenseCategory == 2) && this.opt.option.cost) {
                //如果是买套餐，而且有成本
                //现在开卡也可以用成本了
                //套餐成本不能使用欠款支付
                if (this.opt.option.billingInfo.debtFee > this.opt.option.billingInfo.total) {
                    am.msg("成本不允许使用欠款支付！");
                    return 1;
                } else {
                    var costPayDetail = {};

                    //除开欠款之外的钱，算成本所占比例
                    var p = this.opt.option.cost / (this.opt.option.billingInfo.total - this.opt.option.billingInfo.debtFee + this.opt.option.cost);

                    for (var i in this.payTypeMap) {
                        var key = i;
                        if (this.opt.option.expenseCategory == 2 && (key == "presentFee" || key == "cardFee")) {
                            continue;
                        }
                        var v = this.opt.option.billingInfo[key];
                        //遍历支付方式，对不是欠款的支付金额做拆分
                        if (v && key != 'debtFee') {
                            this.opt.option.billingInfo[key] = Math.round(v * (1 - p) * 100) / 100;
                            costPayDetail[key] = Math.round(v * p * 100) / 100;
                        }
                    }

                    if (this.opt.option.expenseCategory == 4) {
                        this.opt.option.comboCard.costDetail = costPayDetail;
                    } else {
                        this.opt.option.card.cost = costPayDetail;
                    }
                }
            }

            bill.eaFee = bill.total;

            if (this.opt.member) {
                this.opt.option.memId = this.opt.member.id;
                this.opt.option.cardId = this.opt.member.cid;
                this.opt.option.discount = this.opt.member.discount || 10;
            } else {
                this.opt.option.memId = 0;
            }

            if (this.opt.option.expenseCategory > 1 && this.$depPerfSet) {
                var $depSpan = this.$depPerfSet.find('span');
                if (this.$depPerfSet.find('span').length) {
                    var deptPerfs = [];
                    $depSpan.each(function () {
                        var $this = $(this);
                        deptPerfs.push({
                            depcode: $this.attr('depcode'),
                            per: $this.attr('per') * 1
                        });
                    });
                    var billingInfo = this.opt.option.billingInfo;
                    //var cost =  this.opt.option.comboCard ? this.opt.option.comboCard.costDetail : this.opt.option.card.cost;
                    for (var i = 0; i < deptPerfs.length; i++) {
                        deptPerfs[i].perf = {};
                        for (var j in this.payTypeMap) {
                            if (billingInfo[j]) {
                                deptPerfs[i].perf[j] = Math.round(billingInfo[j] * deptPerfs[i].per) / 100;
                            }
                        }
                        if (this.opt.option.expenseCategory < 4) {
                            deptPerfs[i].perf.cardFee = billingInfo.total;
                        }
		                /*if(cost){
			                deptPerfs[i].cost = {};
			                for(var k in cost){
				                deptPerfs[i].cost[k] = Math.round(cost[k]*deptPerfs[i].per)/100;
			                }
                        }*/
                    }
                    if (this.opt.option.comboCard) {
                        this.opt.option.comboCard.deptPerfs = deptPerfs;
                    } else {
                        this.opt.option.card.deptPerfs = deptPerfs;
                    }
                    console.log(deptPerfs);
                }
            }

            return this.submitToServer(isPrint);
        },
        print: function (isAutoPrint) {
            if (!isAutoPrint && this.submit(1)) {
                //如果是自动打印，不走进来，因为submit已经校验过了
                //如果不是自动打印，先调submit(1)，传1，走校验逻辑，校验失败return，
                //校验成功打印
                return;
            }
            var opt = this.opt.option;
            if (this.opt.prodOption) {
                opt.products = this.opt.prodOption.products;
            }

            if(this.opt.option.cardType!=2 && this.opt.member && this.opt.member.cardtype!=2 && !this.opt.renewal){
                if(this.opt.member){
                    var cardBalance = 0;
                    var presentBalance = 0;
                    if(this.opt.option.expenseCategory == 2){//开卡
                        if(this.opt.option.cardType==1){//储值卡
                            opt.cardBalance = this.opt.option.billingInfo.total;
                            opt.presentBalance = this.opt.option.billingInfo.presentFee;
                        }
                    }else if(this.opt.option.expenseCategory == 3) {//充值
                        opt.cardBalance = Math.round((this.opt.member.balance + this.opt.option.billingInfo.total)*100)/100;
                        opt.presentBalance = Math.round((this.opt.member.gift + this.opt.option.billingInfo.presentFee)*100)/100;
                    }else {
                        opt.cardBalance = Math.round((this.opt.member.balance - this.opt.option.billingInfo.cardFee)*100)/100;
                        opt.presentBalance = Math.round((this.opt.member.gift - this.opt.option.billingInfo.presentFee)*100)/100;
                        if(this.opt.option.comboCard){
                            if(this.opt.option.comboCard.costDetail.cardFee){
                                opt.cardBalance = Math.round((opt.cardBalance - this.opt.option.comboCard.costDetail.cardFee)*100)/100;
                            }
                            if(this.opt.option.comboCard.costDetail.presentFee){
                                opt.presentBalance = Math.round((opt.presentBalance - this.opt.option.comboCard.costDetail.presentFee)*100)/100;
                            }
                        }
                    }
                    if(this.opt.option.expenseCategory == 3 || this.opt.option.expenseCategory == 4){
                        opt.cardBalance = Math.round((opt.cardBalance - this.opt.option.billingInfo.debtFee)*100)/100;
                    } 
                }
            }
            var user = this.opt.member;

            //解决欠款遗留bug
            opt.billingInfo.totalfeeanddebtfee = opt.billingInfo.debtFee;

            console.log('print:', user, opt);
            console.log(this.opt);
            var data = [user, opt];
            //$('.print').addClass('am-disabled').text('正在打印');
            $('.print').addClass('am-disabled');
            var _this = this;

            setTimeout(function(){//5秒自动移除
                $('.print').removeClass("am-disabled");
            },5000);

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
        checkOnlinePayAuth: function () {
            if (am.operateArr.indexOf("a6") != -1) {
                am.msg("当面付未支付完成");
                return 1;
            }
        },
        submitToServer: function (isPrint) {
            var _this = this,
                b = this.opt.option.billingInfo,
                sum = b.cardFee + b.cashFee + b.unionPay + b.cooperation + b.mall + b.weixin + b.pay + b.voucherFee + b.mdFee + b.dpFee + b.treatfee + b.treatpresentfee + b.luckymoney + b.coupon + b.divideFee + b.debtFee;
            // console.log(this.opt.option);
            // return;
            if (this.opt.option.expenseCategory != 3 && this.opt.option.expenseCategory != 2) {
                //充值的时候,presentFee不算
                sum += b.presentFee;
            }
            for (var i = 1; i <= 10; i++) {
                if (b['otherfee' + i]) {
                    sum += b['otherfee' + i];
                }
            }
            if(Math.round(sum*100) < Math.round(b.total*100)){
                am.msg('结算金额有误！');
                return 1;
            }
            if (this.opt.member && this.opt.member.shopId != am.metadata.userInfo.shopId) {
                //客户跟收银员不是同一个门店
                this.opt.option.otherFlag = 1;//跨店
            } else {
                this.opt.option.otherFlag = 0;//本店
            }
            if (isPrint) {
                return;
            }
            if (this.opt.option.expenseCategory === 0) {
                if (this.opt.servOption && this.opt.prodOption) {
                    this.splitBillPay();
                    //return;
                }
            }

            if (this.opt.option.expenseCategory == 0) {
                //项目业绩
                this.computePerf();
                //return;
            }
            if (this.opt.option.expenseCategory == 1 || this.opt.prodOption) {
                //计算卖品支付明细
                this.computeProductPayDetail();
            }

            //计算非项目业绩
            this.computePerSetPerf();

            if (this.$memberCount.hasClass("checked")) {
                this.opt.option.clientflag = 1;
            } else {
                this.opt.option.clientflag = 0;
            }
            //给疗程项目分，现金，卡结，其它
            this.setTreatItemPerf();

            if(this.opt.member){
                if(this.$smsSendFlag.hasClass('checked')){
                    this.opt.option.smssendflag = 'N';
                }else {
                    this.opt.option.smssendflag = 'Y';
                }
            }else {
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
                if(_billNo){
                    realOption.billNo = _billNo;
                }
            }
            if (this.opt.prodOption) {
                var realOption = this.opt.prodOption;
                realOption.clientflag = this.opt.option.clientflag;
                realOption.otherFlag = this.opt.option.otherFlag;
                realOption.memId = this.opt.option.memId;
                realOption.cardId = this.opt.option.cardId;
                realOption.discount = this.opt.option.discount;
                realOption.smssendflag = this.opt.option.smssendflag;
                realOption.smsflag = this.opt.option.smsflag;
                if(_billNo){
                    realOption.billNo = _billNo;
                }
            }
            if(_billNo){
                this.opt.option.billNo = _billNo;
            }
            if (this.paying) {
                return;
            }
            this.paying = 1;
            this.$submit.addClass("am-disabled");
            
            am.loading.show();
            var callback = function (ret) {
                _this.paying = 0;
                am.loading.hide();
                if (ret && ret.code == 0) {
                    if (_this.$printSwitch.hasClass("checked")) {
                        _this.print();
                    }
                    if (_this.opt.member) {
                        _this.opt.member.lastExpenseCategory = _this.opt.option.expenseCategory;
                        am.page.searchMember.saveLastSelectMember(_this.opt.member, "p");
                        if (_this.opt.debt || _this.opt.option.billingInfo.debtFee) {
                            //如果还款了，清除用户欠款的缓存数据
                            cashierDebt.clearCache(_this.opt.member.id);
                        }
                    }
                    _this.checkIfNeedUpgradeCardType(ret.content.billId);
                    if (_this.opt.billRemark) {//如果是挂单备注 需将原单状态修改为已买单
                        _this.opt.remarkCallback && _this.opt.remarkCallback(_this.opt.member,ret.content);
                    }
                    am.page.hangup.lastCheckedBillId = _this.opt.option.instoreServiceId;
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
                        });
                    } else {
                        am.msg("单号重复！");
                        _this.$submit.removeClass("am-disabled");
                    }

                }else if(ret.code == 10030){
                    am.msg("买单过于频繁，请稍后重试！");
                    _this.$submit.removeClass("am-disabled");
                } else {
                    _this.$submit.removeClass("am-disabled");
                    am.msg(ret.message || "结算失败！");
                }
            };
            // console.log(this.opt)
            // return;
            if (this.opt.servOption) {
                am.api.mutiBillCheck.exec([this.opt.servOption, this.opt.prodOption], callback);
            } else {
                am.api.billCheck.exec(this.opt.option, callback);
            }
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
	        if(amClickAudio) amClickAudio.currentTime = 0;
	        if(window.successAudio) window.successAudio.play();
            if(this.opt.member == null){//散客支付完成
                this.setMediaShow(this.opt,"done");
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
            //$.am.changePage(am.page.service,'slidedown');
            am.goBackToInitPage();
            setTimeout(function () {
                _this.$confirm.hide();
            }, 300);
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
                    opt.paid[k] = v;
                } else if (typeof (v) == 'undefined') {
                    throw ('支付方式key不匹配：' + i);
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
                    otherFee: items[i].otherFee
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
                            perf:servers[j].perf
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
                    treatpresentfee: 0//this.opt.member.treatpresentfee||0
                };
            }
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
                eaFee += ret[i].shopper;
                //项目的支付方式拆分
                items[i].payDetail = {};
                for (var j in this.payTypeMap) {
                    var k = this.payTypeMap[j];
                    if (items[i].consumeType === 1 && k === 'cardfee') {
                        //疗程项目
                        items[i].payDetail.treatfee = payDetail[k] || 0;
                    } else if (items[i].consumeType === 1 && k === 'presentfee') {
                        //疗程项目
                        items[i].payDetail.treatpresentfee = payDetail[k] || 0;
                    } else {
                        items[i].payDetail[j] = payDetail[k] || 0;
                    }
                }
                //拿员工业绩
                var servers = items[i].servers;
                for (var k = 0; k < servers.length; k++) {
                    if(servers[k].perf>0){
                        servers[k].cardfee = empper[k].total.cardfee;
                        servers[k].cashfee = empper[k].total.cashfee;
                        servers[k].otherfee = empper[k].total.otherfee;
                    }else {
                        servers[k].perf = empper[k].pre * servers[k].per / 100;
                        servers[k].cardfee = empper[k].total.cardfee * servers[k].per / 100;
                        servers[k].cashfee = empper[k].total.cashfee * servers[k].per / 100;
                        servers[k].otherfee = empper[k].total.otherfee * servers[k].per / 100;
                    }
                }
            }

            if (billOption.expenseCategory == 0) {
                billOption.billingInfo.eaFee = Math.round(eaFee * 100) / 100;
            }
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
                }
            }
        },
        computePerSetPerf: function (type) {
            //项目不算
            var isRepeat = this.opt.prodOption && this.opt.option;
            var expenseCategory = isRepeat?this.opt.prodOption.expenseCategory:this.opt.option.expenseCategory;
            if (expenseCategory) {
                var billingInfo = isRepeat?this.opt.prodOption.billingInfo:this.opt.option.billingInfo;
                var t = billingInfo.total - billingInfo.debtFee;
                var servers;
                if (expenseCategory === 1) {
                    servers = isRepeat?this.opt.prodOption.products.servers:this.opt.option.products.servers;
                } else if (expenseCategory === 2) {
                    servers = this.opt.option.card.servers;
                } else if (expenseCategory === 3) {
                    servers = this.opt.option.card.servers;
                } else if (expenseCategory === 4) {
                    servers = this.opt.option.comboCard.servers;
                }
                if (servers && servers.length) {
                    for (var i = 0; i < servers.length; i++) {
                        if(!servers[i].perf){
                            servers[i].perf = toFloat(t * servers[i].per / 100);
                        }
                    }
                }
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
            "dpCouponId": null, //微信 id
             bill.mallId = mallOrder.id;
             bill.mallNo = mallOrder.code;
		    */
            var cpKeys = { 'dpId': 1, 'payId': 1, 'weixinId': 1, 'dpCouponId': 1, luckyMoneyId: 1 };
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
        }
    });
})();

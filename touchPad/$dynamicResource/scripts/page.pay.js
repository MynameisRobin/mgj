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
                _this.cancel && _this.cancel();
                _this.hide();
                am.page.pay.$submit.removeClass("am-disabled");
                am.page.itemPay.$submit.removeClass("am-disabled");
            });
        },
        open: function (submit, cancel, billNo) {
            this.submit = submit;
            this.cancel = cancel;
            if(am.metadata.shopPropertyField.mgjBillingType==1 && am.operateArr.indexOf('a37')==-1){
                this.$.addClass('onlyCover');
            }else {
                this.$.removeClass('onlyCover');
            }
            this.show(billNo);
        },
        show: function (billNo) {
            this.$.show();
            this.$.find(".tip").text("在历史单据中发现单号" + billNo + "已经存在，本单提交后为保证单号唯一，将修改之前的单据号为" + billNo + "-1");
        },
        hide: function () {
            this.$.hide();
        }
    }
    am.page.pay = new $.am.Page({
        id: "page_pay",
        backButtonOnclick: function () {
            var _this = this;
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
                }else if(this.opt && this.opt.billRemark){
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

             //回车键1秒内连敲3次结算
			_this.submitArr = [];
            _this.compareTime = function(time1, time2) {
                    return time2 / 1000 - time1 / 1000;
                };

            if(device2.windows() || navigator.platform.indexOf("Mac") == 0 ) {
                $('#page_pay .submit').hide();
                $('#page_pay .submit.keypadPC').show();
                $('#page_pay .payTypes li b').show();
            }else {
                $('#page_pay .submit.keypadPC').hide();
                $('#page_pay .payTypes li b').hide();
            }
			
			//卡升级规则提示关闭
			this.$.find(".ruleTag .close").vclick(function(){
				_this.$.find(".ruleTag").hide();
			});

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
                                    var bonus = am.page.memberCard.getBonusRule(_this.opt.cardType, value,2);
                                    _this.$list.find('.val.rechargeBonus').text(("￥" + bonus) || "");
                                }
							}
							_this.cardUpId = _this.matchCardTypeUpRule(value,_this.opt.member)['rid'];
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
				var emps = am.metadata.employeeList || [];
				if(am.metadata.configs && am.metadata.configs['EMP_SORT']){
					emps = JSON.parse(am.metadata.configs['EMP_SORT']);
					emps = am.getConfigEmpSort(emps);
				}
				
                var sales = [];
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
						emps[i]['keyName'] = emps[i]['no'] + '　' + emps[i]['name'];
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
                }, 'keyName', 1);
            });
            this.$list.find('dd.luckymoney').vclick(function () {
                if (_this.needPay > 0 || $(this).data('data')) {
                    _this.paytool.luckyMoney.show(_this.opt.member, _this.opt.option.expenseCategory);
                } else {
                    am.msg('不需要支付更多金额了！');
                }
            });
            this.$luckyMoneyWrap = $('#page_pay #luckyMoneyDetail .luckyMoney');

            this.$luckyMoneyWrap.on('vclick','.sendBtn',function(){
                am.sendRedPocketsDialog.show({
					member:_this.opt.member,
					scb:function(){
                        _this.$luckyMoneyRefresh.trigger('vclick');
                    }
                    
				 });
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
            //修改收款
            this.$list.find('dd.prePay').on('vclick','.icon-juxingkaobei',function (e) {
                e.stopPropagation();
                var $this = $(this);
                var d = $(this).data('data');
                am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
                        if(am.isNull(value)){
                            return am.msg("请输入正确的数字");
                        }
                        if(value > $("#prePayDetail").find(".mallOrderList li.selected .price").html()-0){
                            return am.msg("不能超过可用金额");
                        }
                        if(_this.opt.option.billingInfo.eaFee < value){
                            return am.msg("不能超过总金额");
                        }
                        console.info(d)
                        d.price = value*1;//修改金额
                        $this.siblings(".price").html('￥' + value*1);
                        if(d.type == 1){
                            _this.opt.option.billingInfo.weixinId = d.id;
                            _this.opt.option.billingInfo.weixin = value * 1;
                        }else if(d.type == 2){
                            _this.opt.option.billingInfo.payId = d.id;
                            _this.opt.option.billingInfo.pay = value * 1;
                        }else if(d.type == 4){
                            _this.opt.option.billingInfo.unionOrderId = d.id;
                            _this.opt.option.billingInfo.unionPay = value * 1;
                        }
                        _this.opt.option.orderDetail = [
                            {
                            "payOrderId":d.id//收款流水id
                            ,"amount":value * 1 //关联金额
                            ,"orderType":d.type == 4 ? 6 : d.type //收款流水类型 支付方式1微信2支付宝3点评
                            ,"billType":1//明细类型  1水单2开支
                            }
                        ]
                        _this.setNeedPay();
				    }
				});
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
                    .removeClass("pay_dp").removeClass("pay_bonus").removeClass("pay_kb").removeClass("pay_jd");
                if ($this.hasClass("pay_memberCard")) {
                    _this.$right.addClass("pay_memberCard");
                    _this.renderMemberCard();
                } else if ($this.hasClass("pay_pos")) {
                    _this.$right.addClass("pay_pos");
                    _this.$posTipTotal.text(_this.needPay + '元');
					console.log(_this.opt);
					//如果没配置走之前的逻辑,有配置则显示弹窗
					if(am.metadata.configs && (!am.metadata.configs['jd_unionPOS'] || am.metadata.configs['jd_unionPOS'] === "[]")){
						if (_this.opt.action && _this.opt.action == "recharge") {
							_this.opt.card && _this.setMediaShow(_this.opt, 'xk');
							!_this.opt.card && _this.setMediaShow(_this.opt, 'cz');
						} else {
							_this.setMediaShow(_this.opt);
						}
					}else{
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
                } else if ($this.hasClass("pay_dp")) {
                    _this.$right.addClass("pay_dp");
                    _this.paytool.show("dp");
                } else if ($this.hasClass("pay_mix")) {
                    _this.paytool.show("mix");
                } else if ($this.hasClass("pay_bonus")) {
                    _this.$right.addClass("pay_memberCard");
                    _this.renderMemberCard(1);
                }else if($this.hasClass("pay_kb")){
                    _this.$right.addClass("pay_kb");
                    _this.paytool.show("kb");
                }else if($this.hasClass("pay_jd")){
                    _this.$right.addClass("pay_jd");
                    _this.paytool.show("jd");
                }
            });
            this.payTips = payTips;
            payTips.init();

            //提未区
            this.$right = this.$.find(".right");
            this.$cashTipTotal = this.$.find('.cash .highlight');
            this.$posTipTotal = this.$.find('.pos .highlight');
            this.$checkedItemsTitle = this.$right.find('.payTip.card .checkedItemsTitle');
            this.$checkedItemsNames = this.$right.find('.payTip.card .checkedItemsNames');
            this.checkedItemsScroll = new $.am.ScrollView({
                $wrap: this.$right.find('.checkedItemsWrap'),
                $inner: this.$right.find('.checkedItemsWrap .checkedItemsWrapper'),
                direction: [false, true],
                hasInput: false,
            });
            this.renderMemberCard = function (isBonus) {
                if (!this.$cardTipTotal) {
                    this.$cardTipTotal = this.$.find('.card .highlight');
                    this.$cardTipInfo = this.$.find('.cardBg');
                    this.$isBonus = this.$.find(".balanceORbonus");
                }
                var member = this.opt.member;
                if (isBonus) {
                    if(member && !member.allowPresentfeeDiscount && member.discount && this.opt.option.expenseCategory != 4){
                        this.$isBonus.text("赠送金(不打折)");
                        this.$cardTipTotal.text(this.originalPay + '元');
                    }else {
                        this.$isBonus.text("赠送金");
                        this.$cardTipTotal.text(this.needPay + '元');
                    }
                    var checkedCardInfo=am.metadata.cardTypeMap[member.cardTypeId];
                    if (checkedCardInfo) {
                        var restricteditems = am.metadata.cardTypeMap[member.cardTypeId].restricteditems;
                        var restrictedtype = am.metadata.cardTypeMap[member.cardTypeId].restrictedtype;
                        var itemsNameStr = '',
                            itemsNameTitle = (restrictedtype == 1 ? '赠送金指定项目可用:' : '赠送金指定项目不可用:');
                        if (restricteditems) {
                            var restricteditemsArr = restricteditems.split(',');
                            if (restricteditemsArr && restricteditemsArr.length) {
                                for (var i = 0, len = restricteditemsArr.length; i < len; i++) {
                                    var serviceItemCode = restricteditemsArr[i];
                                    var serviceItem = am.metadata.serviceCodeMap[serviceItemCode];
                                    if (serviceItem) {
                                        itemsNameStr += '、' + serviceItem.name;
                                    }
                                }
                            }
                            if (itemsNameStr.length) {
                                itemsNameStr = itemsNameStr.substring(1);
                            }
                            this.$checkedItemsTitle.text(itemsNameTitle);
                            this.$checkedItemsNames.text(itemsNameStr);
                            this.checkedItemsScroll.refresh();
                        }
                    }

                } else {
                    this.$checkedItemsTitle.text('');
                    this.$checkedItemsNames.text('');
                    this.checkedItemsScroll.refresh();
                    this.$isBonus.text("卡金");
                    this.$cardTipTotal.text(this.needPay + '元');
                }
                if (member.timeflag == 2) {
                    this.$cardTipInfo.addClass('combo');
                } else {
                    this.$cardTipInfo.removeClass('combo');
                }
                this.$cardTipInfo.find('.name').text(member.cardName);
                this.$cardTipInfo.find('.no').text(member.cardNo);
                if(member.combinedUseFlag==1){
                    this.$cardTipInfo.find('.price').text("￥" + (Math.round((member.balance+member.gift) * 100) / 100));
                    this.$cardTipInfo.find('.bonus').text('');
                }else {
                    this.$cardTipInfo.find('.price').text("￥" + (Math.round((member.balance) * 100) / 100));
                    this.$cardTipInfo.find('.bonus').text("赠送金：￥" + (Math.round((member.gift) * 100) / 100));
                }
            };

            //提交
            this.$submit = this.$.find(".submit").vclick(function () {
                if(!_this.opt.member){
                    _this.submit();
                }else {
                    //自动结算无需走 核实密码步骤
                    if(_this.opt.settlementPayDetail != undefined) {
                        _this.submit();
                    }else {
                        if(_this.opt.member.passwdNewSet){
                            _this.submit();
                        }else {
							//校验密码和打印一样需要参数
							_this.submit(0,1);
                        }
                    }
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
                var $this = $(this);
                am.keyboard.show({
					title:"请输入单号",//可不传
					hidedot:true,
				    submit:function(value){
                        if(isNaN(value)){
                            am.msg('请输入正确的数值！');
                            return;
                        }
                        $this.val(value.substring(0,20));
                        if(value.length>20){
                            am.msg('单号长度超过20位数字已自动截取');
                        }
                        if(_this.opt.option.expenseCategory==0){
                            _this.checkBillNo($this.val());
                        }
				    }
				});
            });

            this.$luckyMoneyRefresh = this.$.find('.luckyMoneyRefresh').vclick(function(){
                _this.paytool.luckyMoney.redPackageArr = [];
                _this.paytool.luckyMoney.ajax();
            });

            this.$whynot = this.$.find('.whynot').vclick(function(e){
                e.stopPropagation();
                if($(this).find('.text').text()){
                    am.msg($(this).find('.text').text());
                }
            });

            this.$dpTip = this.$.find('.pay_dp .tip,.pay_kb .tip').vclick(function(e){
                e.stopPropagation();
                am.msg($(this).find('.text').text());
            });
            // 券的列表区域
            this.$ticketsList=this.$.find('.tickets-list')
            // kb
            this.$listKbBox=this.$ticketsList.find('.kb-box').on('vclick','.item-li',function(){
                $(this).addClass('selected').siblings().removeClass('selected last-checked');
                var data=$(this).data('data');
                // $(this).find('svg').attr('class','icon svg-icon');
                console.log('选中的口碑券',data);
                am.page.pay.addKbCoupon(data);
                am.msg('优惠券已关联！');
                am.page.pay.paytool.hide();
                _this.$payTypes.filter('.pay_kb').removeClass('am-disabled');// 使可以再次点击
            });
            this.$ticketKbScrollView = new $.am.ScrollView({ //券滚动
				$wrap: _this.$listKbBox,
				$inner: _this.$listKbBox.find('.kb-ul'),
				direction: [false, true],
				hasInput: false,
            });
            // dp
            this.$listDpBox=this.$ticketsList.find('.dp-box').on('vclick','.item-li',function(){
                $(this).addClass('selected').siblings().removeClass('selected last-checked');
                var data=$(this).data('data')
                console.log('选中的点评券',data);
                am.page.pay.addDpCoupon(data);
                am.msg('优惠券已关联！');
                am.page.pay.paytool.hide();
                _this.$payTypes.filter('.pay_dp').removeClass('am-disabled');// 使可以再次点击
            });
            this.$ticketDpScrollView = new $.am.ScrollView({ //券滚动
				$wrap: _this.$listDpBox,
				$inner: _this.$listDpBox.find('.dp-ul'),
				direction: [false, true],
				hasInput: false,
            });
        },
        toLowerCaseKey:function(obj){
            var res={};
            for(var key in obj){
                res[key.toLocaleLowerCase()]=obj[key];
            }
            return res;
        },
        renderTicketsList:function(data,category){
            var self=this,$ul;
            var ticketInfo='';
            var lastKbTicketCode=self.opt && self.opt.option && self.opt.option.lastKbTicketCode;
            var lastDpTicketCode=self.opt && self.opt.option && self.opt.option.lastDpTicketCode;
            if(category=='kb'){
                $ul=this.$.find('.list-ul.kb-ul').empty();
                ticketInfo=$('.kbCoupon').data('data');
            }else{
                $ul=this.$.find('.list-ul.dp-ul').empty();
                ticketInfo=$('.dpCoupon').data('data');
            }
            if(data && data.length){
                for(var i=0,len=data.length;i<len;i++){
                    var item=self.toLowerCaseKey(data[i]),usedDate=new Date(item.usedate||item.consumedate).format('yyyy-mm-dd HH:MM');
                    var svg='<svg class="icon svg-icon" aria-hidden="true"><use xlink:href="#icon-ziyuan32-copy"></use></svg>';
                    if(!item.billid){
                        //只渲染支付成功未关联的券
                        var $li=$('<li class="item-li am-clickable"><div class="right-content"><div class="item-title"><span class="ticket-name">'+
                        (item.itemname||item.dealtitle)+'</span><span class="ticket-price">￥'+
                        (item.originalprice||item.marketprice)+'</span></div><div class="item-time">'+'<span class="ticket-code">'+(item.serialnumber||item.ticketcode)+'</span>'+'<span class="ticket-time">核销时间'+
                        usedDate+'</span></div></div>'+ svg +'</li>').data('data',item);
                        // 上次选中高亮显示
                        if(item.ticketcode && lastKbTicketCode && item.ticketcode==lastKbTicketCode){
                            $li.addClass('last-checked');
                        }
                        if(item.serialnumber && lastDpTicketCode && item.serialnumber==lastDpTicketCode){
                            $li.addClass('last-checked');
                        }
                        // 显示选中按钮
                        if(ticketInfo && ticketInfo.id==item.id){
                            $li.addClass('selected');
                        }
                        $ul.append($li);
                    }
                }
                if($ul.find('.selected').length){
                    $ul.find('.last-checked').removeClass('last-checked');
                }
                if($ul.find('.item-li').length){
                    self.$ticketsList.show();
                }else{
                    self.$ticketsList.hide();
                }
                this.$ticketKbScrollView.refresh();
            }else{
                self.$ticketsList.hide();
            }
        },
        getPeriod:function(){
            var s=new Date().getTime();
            var temp=new Date(Number(s)-86400000*6).format("yyyy/mm/dd");
			var e=new Date(temp+" 00:00:00").getTime();
			return e+"_"+s;
		},
        getTicketsList:function(apiName,cb){
            var self=this;
            var period=self.getPeriod();
			var metadata=am.metadata;
			var opt={
				"parentShopId":metadata.userInfo.parentShopId,
				"shopId":metadata.userInfo.shopId,
				"pageNumber": 0,
                "pageSize": 1000,
				"period":period
            };
            am.loading.show("正在获取数据,请稍候...");
			am.api[apiName].exec(opt, function(res) {
			    am.loading.hide();
			    if (res.code == 0) {
			    	cb && cb(res.content);
			    }else {
			    	self.$billRecordContent.removeClass('normal empty').addClass("error");
			    	// self.pager.refresh(0,0);
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});
        },
        checkBillNo:function(billNo){
            var _this = this;
            am.api.checkBillNo.exec({
                billNo: billNo,
                shopId: amGloble.metadata.userInfo.shopId
            },function(ret){
                console.log(ret);
                if(ret.code==0){
                    _this.checkBillNoSuccess = true;
                }else if(ret.code==11009){
                    am.msg('单号重复');
                    _this.checkBillNoSuccess = false;
                }else {
                    _this.checkBillNoSuccess = true
                }
            })
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
            if(!this.checkedSubmitPermission){
                this.checkSubmitPermission();
            }
            this.checkBillNoSuccess = true;
            this.usedDpCoupon = false;
            this.usedKbCoupon = false;
			this.upgradeCardSuccess = false;
			this.upgradeCardSuccessAuto = false;
            if(paras.member){
                var member = paras.member;
                if(member.presentfeepayLimit===null){
                    member.presentfeepayLimit = 100;
                }
                if(member.minfee===null){
                    member.minfee = 0;
                }
                if(member.newcardPayLimit===null){
                    member.newcardPayLimit = 100;
                }
                if(member.cardfeePayLimit===null){
                    member.cardfeePayLimit = 0;
                }
                if(member.discount==0){
                    member.discount = 10;
                }
            }
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
            
			if(paras.action == "recharge"){
				this.getOtherRules(member);
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

            //红包按钮做判断
            if(am.metadata.configs.privateSendRed && JSON.parse(am.metadata.configs.privateSendRed).enableCashierAndAdmin == true && am.metadata.userInfo.mgjVersion ===3) {
                $('.sendBtn').show();
            }else {
                $('.sendBtn').hide();
            }
            
			this.paytool.luckyMoney.redPackageArr = [];
        },
        checkSubmitPermission: function () {
            // 判断当前员工是否有结算权限
            var config = am.metadata.userInfo.operatestr.indexOf('a39') > -1 ? 1 : 0;
            var $keypadPC=this.$.find('.submit.keypadPC');
            if(device2.windows() || navigator.platform.indexOf("Mac") == 0 ) {
                this.$.find('.submit').hide();
                if(config){
                    $keypadPC.hide();
                }else{
                    $keypadPC.show();
                }
            }else {
                $keypadPC.hide();
                if(config){
                    this.$submit.hide();
                }else{
                    this.$.find('.submit:not(.keypadPC)').show();
                }
            }
            this.checkedSubmitPermission=true;
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
			$("#payConfirm").find(".cardUpTip").text('');
            if(member){
				console.log(2222, member)
				if (this.opt.action == "recharge") {
					if(this.$list.find('.val.rechargePrice').html().indexOf("￥") > -1){
						var val = this.$list.find('.val.rechargePrice').html().replace("￥","");
						this.cardUpId = self.matchCardTypeUpRule(val,member)['rid'] || undefined;
					}
				}
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
                if(member.combinedUseFlag==1){
                    this.$.find(".pay_memberCard p").html('余额：'+Math.round((member.balance+member.gift) * 100) / 100);
                    this.$.find(".mixPayScrollInner input[name='card']").attr("placeholder",'余额：'+Math.round((member.balance+member.gift) * 100) / 100);
                    this.$.find(".pay_bonus").hide();
                    this.$.find(".mixPayScrollInner input[name='bonus']").parents('.mixPayItem').hide();
                }
                this.paytool.luckyMoney.show(this.opt.member, this.opt.option.expenseCategory,1);
                this.paytool.mallOrder.show(this.opt.member, this.opt.option.expenseCategory,1);
            }else{
                this.$.find(".pay_memberCard p").html('');
                this.$.find(".pay_bonus p").html('');
                this.$.find(".mixPayScrollInner input[name='card']").attr("placeholder","")
                this.$.find(".mixPayScrollInner input[name='bonus']").attr("placeholder","")
            }
            this.paytool.prePay.show(undefined, this.opt.option.expenseCategory,1);

            if(paras.settlementPayDetail != undefined) {
                //自动结算
                console.log('pay settlementPayDetail', paras.settlementPayDetail)
                setTimeout(function(){
                    self.autoSettleFun(paras.settlementPayDetail);
                },1000)
            }else {}

            this.checkCardAboutCurrentDay();
        },
        beforeHide: function (paras) {
            this.getGainAndVoidFee();// 页面隐藏前调用虚业绩和提成接口 如果this.billId不存在则不调用
        },
        afterHide: function () {
            $('.transparentMask').hide();
            this.billId='';// 将单号清空
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

            this.$.find('dd.luckymoney,dd.mallOrder,dd.prePay').removeClass('hasGetData');  

            this.hasRender = false;

            this.currentDayCharge = null;
            
		},
		//获取卡升级规则列表
		getCardTypeUpRules: function(member) {
			var cardTypeUpRules = am.metadata.cardTypeUpRules || [];
			var arr = [];
			if(am.isNull(cardTypeUpRules)) return;
			$.each(cardTypeUpRules,function(i,v){
				if(v.cardTypeId == member.cardTypeId){
					arr.push(v);
				}
			});
			return arr;
		},
		//获取跨店规则
		getOtherRules: function(member){
			var self = this;
			am.api.cardUpDetail.exec({
                cardTypeId: member.cardTypeId,
                shopId: member.cardshopId
            },function(ret){
                console.log(ret);
                if(ret.code==0){
					self.ruleList = ret.content;
                }else {
					console.log("获取规则失败");
                }
            });
		},
		//目前选中的卡的全部规则列表
		ruleList:[],
		//匹配到的某一条规则
		ruleObj:{},
		/**
		 * 匹配卡类型规则某一列
		 * @param {*} cardTypeId   当前充值的卡ID
		 * @param {*} arr 	按照卡类型已经匹配到的规则列表
		 * @param {*} sum 	输入的充值金额
		 * @param {*} member 会员信息
		 */
		matchCardTypeUpRule: function(sum,member){
			var self = this;
			self.$.find(".ruleTag").hide();
			// var cardTypeMap = am.metadata.cardTypeMap || [];
			var arr = self.ruleList || [];
			console.log(3333333,arr);
			if(am.isNull(arr)) return {};
			arr.sort(function(a,b){
				return b.money - a.money;
			});
			var obj = {
				ruleStr : '',	//规则字符
				cardTypeName : '', //可升级的卡名称
				discount: '', //新卡的折扣
				sumCardFee : (member.sumCardFee || member.sumcardfee) - 0 || 0, // 累计充值金额
				balance: member.balance - 0 || 0, //卡金余额
			};
			$.each(arr,function(i,v){
				var money = v.money - 0 || 0,
				ruleType = v.ruleType;
				//单次充值1,累计充值2,剩余卡金3
				obj.ruleType = ruleType;
				if(ruleType == "1"){
					if(sum >= money){
						obj.cardTypeId = v.newCardTypeId;
						obj.money = v.money;
						obj.rid = v.rid;
						obj.discount = v.discount;
						obj.cardTypeName = v.newCardTypeName;
						return false;
					}
				}else if(ruleType == "2"){
					if((obj.sumCardFee + sum) >= money){
						obj.cardTypeId = v.newCardTypeId;
						obj.money = v.money;
						obj.rid = v.rid;
						obj.discount = v.discount;
						obj.cardTypeName = v.newCardTypeName;
						return false;
					}
				}else if(ruleType == "3"){
					if((obj.balance + sum) >= money){
						obj.cardTypeId = v.newCardTypeId;
						obj.money = v.money;
						obj.rid = v.rid;
						obj.discount = v.discount;
						obj.cardTypeName = v.newCardTypeName;
						return false;
					}
				}
			});

			//一个都不满足(取最小值,因为倒叙取最后一个)
			if(!obj.cardTypeId){
				var len = arr.length-1;
				//因为没有达到升级的条件只是个提醒所以不需要rid
				obj.rid = undefined;
				obj.money = arr[len].money;
				obj.ruleType = arr[len].ruleType;
				obj.discount = arr[len].discount;
				obj.cardTypeId = arr[len].newCardTypeId;
				obj.cardTypeName = arr[len].newCardTypeName;
				// return false;
			}

			if(obj.ruleType == "1"){
				obj.ruleStr = '本次充值满';
			}else if(obj.ruleType == '2'){
				obj.ruleStr = '累计充值满';
			}else if(obj.ruleType == '3'){
				obj.ruleStr = '剩余卡金';
			}
			self.$.find(".ruleTag").show();
			self.$.find(".ruleTag .ruleSpan").text(obj.ruleStr + obj.money + "元");
			self.$.find(".ruleTag .red").text('升级为' + obj.cardTypeName);
			var offset = self.$.find(".rechargePrice").offset();
			var bodyWidth = $("body").outerWidth();
			if(bodyWidth > 1024){
				self.$.find(".ruleTag").css({
					left: offset.left + 110,
					top: offset.top + 10
				});
			} else {
				self.$.find(".ruleTag").css({
					left: offset.left + 110,
					top: 55
				});
			}
			self.ruleObj = obj;
			return obj;
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
        getOriginalPay: function(){
            //优惠价
            var discountPay = this.opt.option.billingInfo.total - this.comboDeduct + (this.opt.option.cost || 0);
            //原始价
            var originalPay = 0;
            if(this.opt.member){
                if(this.opt.option.expenseCategory==1 || this.opt.option.expenseCategory==0){
                    var serviceItems = [];
                    var products = [];
                    if(this.opt.option.expenseCategory==1){
                        //单卖品结算
                        products = this.opt.option.products.depots;
                    }else if(this.opt.option.expenseCategory==0){
                        //项目卖品混合结算
                        if(this.opt.servOption && this.opt.prodOption){
                            serviceItems = this.opt.servOption.serviceItems;
                            products = this.opt.prodOption.products.depots
                        }else {
                            //单项目结算
                            serviceItems = this.opt.option.serviceItems;
                        }
                    }
                    if(serviceItems.length){
                        for(var i=0;i<serviceItems.length;i++){
                            if(serviceItems[i].consumeType==0){
                                var item = amGloble.metadata.serviceItemMap[serviceItems[i].id];
                                if(!(item.price*1)){
                                    originalPay += serviceItems[i].salePrice*1;
                                }else {
                                    originalPay += serviceItems[i].oPrice*1;
                                }
                            }
                        }
                    }
                    if(products.length){
                        for(var i=0;i<products.length;i++){
                            var item = amGloble.metadata.categoryItemMap[products[i].productid];
                            if(!(item.saleprice*1)){
                                originalPay += products[i].salePrice*1*products[i].number;
                            }else {
                                originalPay += products[i].price*1*products[i].number;
                            }
                        }
                    }
                }else {
                    originalPay = discountPay;
                }
            }else {
                originalPay = discountPay;
            }
            return originalPay;
        },
        setNeedPay: function (t) {//算还需付的钱
            this.needPay = this.opt.option.billingInfo.total - this.comboDeduct + (this.opt.option.cost || 0);
            this.originalPay = this.getOriginalPay();
            var coupon = this.$list.find('dd.dpCoupon').data('data');
            if (coupon) {
                //点评支付的钱
                this.needPay -= coupon.marketprice;
                this.originalPay -= coupon.marketprice;
            }

            var kbCoupon = this.$list.find('dd.kbCoupon').data('data');
            if (kbCoupon) {
                //口碑支付的钱
                this.needPay -= kbCoupon.originalprice;
                this.originalPay -= kbCoupon.originalprice;
            }

            // var luckymoney = this.$list.find('dd.luckymoney').data('data');
            // if (luckymoney) {
            //     this.needPay -= luckymoney.money;
            // }
            
            var luckymoney = this.redPackageDiscount();
            console.log(luckymoney);
            if(luckymoney && luckymoney.length){
                var luckymoneyTotal = 0;
                var html = '';
                for(var i=0;i<luckymoney.length;i++){
                    luckymoneyTotal += luckymoney[i].realMoney;
                    html += '<span class="name">' + luckymoney[i].activityTitle + '</span><span class="price">￥'+ Math.round(luckymoney[i].realMoney*100)/100 + '</span>';
                }
                this.needPay -= luckymoneyTotal;
                this.originalPay -= luckymoneyTotal;
                this.$list.find('dd.luckymoney').find('.val').html(html).removeClass('add').addClass('edit');
            }else {
                if(this.hasRender){
                    // am.msg('未选择可用红包');
                }
                this.$list.find('dd.luckymoney').find('.val').html('');
            }

            var mallOrder = this.$list.find('dd.mallOrder').data('data');
            if (mallOrder) {
                this.needPay -= mallOrder.price;
                this.originalPay -= mallOrder.price;
                // this.needPay -= ((mallOrder.cashPay * 1 || 0) + (mallOrder.luckyMoneyPay || 0));
            }
            var prePay = this.$list.find('dd.prePay').data('data');//加入收款之后 会重算待付金额
            if (prePay) {
                this.needPay -= prePay.price;
                this.originalPay -= prePay.price;
            }
            if (this.needPay < 0) {
                this.needPay = 0;
            }
            this.needPay = Math.round(this.needPay * 100) / 100;
            this.originalPay = Math.round(this.originalPay * 100) / 100;

            this.$list.find('.val.payTotal').text("￥" + this.needPay);
            //支付区背景还原
            this.$right.removeClass("pay_memberCard")
                .removeClass("pay_pos")
                .removeClass("pay_cash1")
                .removeClass("pay_cash")
                .removeClass("pay_wechat")
                .removeClass("pay_alipay")
                .removeClass("pay_dp").removeClass("pay_bonus").removeClass('pay_kb').addClass("pay_cash1");
            this.$.find('.payDetail').hide();
            //根据结算数据，显示和隐藏支付方式
            if (this.needPay) {
                this.$payTypes.removeClass('am-disabled').removeClass("selected");
                var member = this.opt.member;
                if(member && member.cardfeePayLimit && (this.opt.option.expenseCategory == 0 || this.opt.option.expenseCategory == 1 || this.opt.option.expenseCategory == 4) && member.cardtype == 1 && member.timeflag != 1){
                    this.$payTypes.addClass('am-disabled');
                    this.$payTypes.filter('.pay_memberCard,.pay_bonus,.pay_mix').removeClass('am-disabled');
                }else {
                    this.$payTypes.removeClass('am-disabled');
                }
                // this.opt.option.expenseCategory == 0 && !coupon && !this.opt.prodOption && (!member || !member.cardfeePayLimit)
                if (this.opt.option.expenseCategory == 0 && !this.opt.prodOption && (!member || !member.cardfeePayLimit)) {
                    //收银类型是0，而且没有使用点评券，而且没有卖品
                    //才允许用点评支付
                    this.$payTypes.filter('.pay_dp').removeClass('am-disabled');
                } else {
                    this.$payTypes.filter('.pay_dp').addClass('am-disabled');
                }

                // this.opt.option.expenseCategory == 0 && !kbCoupon &&  !this.opt.prodOption && (!member || !member.cardfeePayLimit)
                if (this.opt.option.expenseCategory == 0 &&  !this.opt.prodOption && (!member || !member.cardfeePayLimit)){
                    this.$payTypes.filter('.pay_kb').removeClass('am-disabled');
                }else {
                    this.$payTypes.filter('.pay_kb').addClass('am-disabled');
                }

                if (prePay) {
                    if (prePay.type == 1) {
                        this.$payTypes.filter('.pay_wechat').addClass('am-disabled');
                    } else if (prePay.type == 2) {
                        this.$payTypes.filter('.pay_alipay').addClass('am-disabled');
                    } else if (prePay.type == 3) {
                        this.$payTypes.filter('.pay_dp').addClass('am-disabled');
                    } else if (prePay.type == 4) {
                        this.$payTypes.filter('.pay_pos').addClass('am-disabled');
                    } else if (prePay.type == 5) {
                        this.$payTypes.filter('.pay_jd').addClass('am-disabled');
                    }
                }

                if (member && (this.opt.option.expenseCategory == 0 || this.opt.option.expenseCategory == 1 || this.opt.option.expenseCategory == 4) && member.cardtype == 1 && member.timeflag != 1) {
                    //开卡充值，不能用卡金支付，套餐包也不能用卡金买
                    //也就是说，只有项目，卖品会进来
                    //资格卡不能用
                    //计次卡不能用

                    var balance = member.balance;
                        gift = member.gift,
                        balanceDiscount = this.needPay,
                        giftDiscount = this.needPay;
                    if(member.combinedUseFlag==1){
                        balance += gift;
                        var balanceAndGift = this.getCardFeeAndPresentFee(this.needPay,member);
                        balanceDiscount = balanceAndGift.cardFee;
                        giftDiscount = balanceAndGift.presentFee;
                        this.$payTypes.filter('.pay_bonus').hide();
                    }else {
                        this.$payTypes.filter('.pay_bonus').show();
                    }
                    var total = this.opt.option.billingInfo.total - this.comboDeduct + (this.opt.option.cost || 0);
                    if (
                        (Math.round((balance) * 100) < Math.round((this.needPay) * 100))  //卡金不够支付
                    ||  (Math.round((member.balance) * 100) - Math.round((balanceDiscount) * 100) < (member.minfee || 0) * 100 ) //卡扣后低于设置的最低金额
                    ||  (member.newcardPayLimit<100 && this.currentDayCharge && (Math.round((balanceDiscount) * 100)+Math.round((this.currentDayCharge.CONSUMEFEE) * 100))>Math.round((this.currentDayCharge.CHARGEFEE) * 100)*(member.newcardPayLimit/100))  //开卡当日消费超过设置的总额百分比
                    ){ 
                        this.$payTypes.filter('.pay_memberCard').addClass('am-disabled');

                        if(Math.round((balance) * 100) < Math.round((this.needPay) * 100)){
                            this.$payTypes.filter('.pay_memberCard').find('.whynot').hide().find('.text').text('');
                        }else {
                            if(Math.round((member.balance) * 100) - Math.round((balanceDiscount) * 100) < (member.minfee || 0) * 100){
                                this.$payTypes.filter('.pay_memberCard').find('.whynot').show().find('.text').text('支付后卡内最低卡金金额不能少于'+(member.minfee || 0));
                            }
                            if(member.newcardPayLimit<100 && this.currentDayCharge && (Math.round((balanceDiscount) * 100)+Math.round((this.currentDayCharge.CONSUMEFEE) * 100))>Math.round((this.currentDayCharge.CHARGEFEE) * 100)*(member.newcardPayLimit/100)){
                                this.$payTypes.filter('.pay_memberCard').find('.whynot').show().find('.text').text('开卡当日消费不得超过总额的'+member.newcardPayLimit+'%,(当日开卡总额'+Math.round(this.currentDayCharge.CHARGEFEE*100)/100+',已消费'+Math.round(this.currentDayCharge.CONSUMEFEE*100)/100+')');
                            }
                        }
                    }else {
                        this.$payTypes.filter('.pay_memberCard').find('.whynot').hide().find('.text').text('');
                    }
                    // 判断所要结算的项目是否可以用赠金支付 如果包含赠金不可支付项目 则不能，如果全部可赠金支付 则支付，否则弹框高级结算
                    var allowedPresent=1,disableUseStr='';// 允许赠金支付
                    //选择了会员卡并且要购买服务项目
                    if(this.opt.member && this.opt.member.cardTypeId && this.opt.option && this.opt.option.serviceItems && this.opt.option.serviceItems.length){
                        var checkedServiceItems=this.opt.option.serviceItems;
                        var cardInfo=am.metadata.cardTypeMap[this.opt.member.cardTypeId];
                        if(cardInfo && cardInfo.restricteditems){
                            var restricteditemsStr=cardInfo.restricteditems.split(',');// 指定的项目itemid 字符串
                            var restrictedtype=cardInfo.restrictedtype;  // 0 指定不可用  1指定可用 
                            if(restrictedtype===1){
                                // 指定了服务项目可用
                                for(var ss=0,sslen=checkedServiceItems.length;ss<sslen;ss++){
                                    var checkedItemId=checkedServiceItems[ss].itemId;
                                    if(restricteditemsStr && restricteditemsStr.indexOf(checkedItemId)==-1 && checkedServiceItems[ss].salePrice>0){
                                        disableUseStr+='、'+checkedServiceItems[ss].itemName;
                                        allowedPresent=0;
                                    }
                                }
                            }else if(restrictedtype===0){
                                // 指定服务项目不可用
                                for(var ss=0,sslen=checkedServiceItems.length;ss<sslen;ss++){
                                    var checkedItemId=checkedServiceItems[ss].itemId;
                                    if(restricteditemsStr && restricteditemsStr.indexOf(checkedItemId)!=-1 && checkedServiceItems[ss].salePrice>0){
                                        disableUseStr+='、'+checkedServiceItems[ss].itemName;
                                        allowedPresent=0;
                                    }
                                }
                            }
                        }
                    }
                    if(allowedPresent){
                        if(!member.allowPresentfeeDiscount && member.discount && this.opt.option.expenseCategory != 4){ //赠送金不打折
                            var discountNeedPay = this.originalPay;
                            if (Math.round((member.gift) * 100) < Math.round((discountNeedPay) * 100)) {
                                this.$payTypes.filter('.pay_bonus').addClass('am-disabled');
                                if(Math.round((member.gift) * 100)>=Math.round((this.needPay) * 100)){
                                    this.$payTypes.filter('.pay_bonus').find('.whynot').show().find('.text').text('赠送金不打折,实际需支付'+Math.round(discountNeedPay*100)/100);
                                }else {
                                    this.$payTypes.filter('.pay_bonus').find('.whynot').hide().find('.text').text('');
                                }
                            }
                        }else {
                            if (Math.round((member.gift) * 100) < Math.round((this.needPay) * 100)) {
                                this.$payTypes.filter('.pay_bonus').addClass('am-disabled');
                            }
                        }                        
                    }else{
                        // 包含不允许赠金支付
                        this.$payTypes.filter('.pay_bonus').addClass('am-disabled');
                        if(disableUseStr && disableUseStr.length){
                            var orignalArr=disableUseStr.split('、');
                            var res=[];
                            for(var o=0,olen=orignalArr.length;o<olen;o++){
                                if(res.indexOf(orignalArr[o])==-1){
                                    res.push(orignalArr[o])
                                }
                            }
                            disableUseStr=res.join('、');
                            disableUseStr='【'+disableUseStr.substring(1)+'】不可使用赠送金支付';
                            this.$payTypes.filter('.pay_bonus').find('.whynot').show().find('.text').text(disableUseStr);
                        }
                        // 卡金赠金合并使用并且该卡有赠金，该单包含不可用卡金支付项目 灰掉卡金
                        if (member && member.combinedUseFlag == 1 && member.gift > 0) {
                            this.$payTypes.filter('.pay_memberCard').addClass('am-disabled');
                            this.$payTypes.filter('.pay_memberCard').find('.whynot').show().find('.text').text('卡金赠金合并使用，' + disableUseStr);
                        }
                    }

                    if(member.combinedUseFlag==1){
                        member.presentfeepayLimit = 100;
                    }
                    if(Math.round((giftDiscount) * 100)>Math.round((total*(member.presentfeepayLimit/100)) * 100)){  //赠送金支付额不得超过设置的总金额的百分比
                        this.$payTypes.filter('.pay_bonus').addClass('am-disabled');
                        this.$payTypes.filter('.pay_bonus').find('.whynot').show().find('.text').text('赠送金支付额不得超过总金额的'+member.presentfeepayLimit+'%');
                    }else {
                        if(!this.$payTypes.filter('.pay_bonus').hasClass('am-disabled')){
                            this.$payTypes.filter('.pay_bonus').find('.whynot').hide().find('.text').text('');
                        }
                    }
                } else {
                    this.$payTypes.filter('.pay_memberCard,.pay_bonus').addClass('am-disabled').find('.whynot').hide();
                }
            } else {
                this.$payTypes.addClass('am-disabled').removeClass("selected").find('.whynot').hide();
            }

            var expenseCategory = this.opt.option.expenseCategory;
            if (this.opt.prodOption) {
                expenseCategory = 5;
            }
            var _this = this;
            this.$payTypes.each(function () {
                var $this = $(this);
                $this.removeData('data');
                //预先已处理好数据，am.payConfigMap
                //新业绩模式下，按5大类分别配置支付方式
                var key = $this.attr('paytype');
                if (key && !am.payConfigMap[expenseCategory][key]) {
                    $this.hide();
                } else {
                    // $this.show();
                    if((key!='CARDFEE' && key!='PRESENTFEE') || _this.opt.member){
                        if(_this.opt.member && _this.opt.member.combinedUseFlag==1 && key=='PRESENTFEE'){
                            $this.hide();
                        }else {
                            $this.show();
                        }
                    }else {
                        $this.hide();
                    }
                }
            });

            this.kbDisplay();
            this.jdDisplay();

            this.setMediaShow(this.opt);
            //console.log(this.needPay)
        },
        kbDisplay: function(){
            this.kbSetting = null;
            var payTypes = am.payConfigMap[this.opt.option.expenseCategory];
            for(var key in payTypes){
                if(payTypes[key].otherfeetype==3){
                    this.kbSetting = payTypes[key];
                    break;
                }
            }
            if(this.kbSetting){
                this.$payTypes.filter('.pay_kb').show();
            }else {
                this.$payTypes.filter('.pay_kb').hide();
            }
        },
        jdDisplay: function(){
            this.jdSetting = null;
            var payTypes = am.payConfigMap[this.opt.option.expenseCategory];
            for(var key in payTypes){
                if(payTypes[key].otherfeetype==4){
                    this.jdSetting = payTypes[key];
                    break;
                }
            }
            if(this.jdSetting){
                this.$payTypes.filter('.pay_jd').show();
                this.payTypeNameMap.jd = this.jdSetting.field.toLocaleLowerCase();
            }else {
                this.$payTypes.filter('.pay_jd').hide();
            }
        },
        redPackageDiscount:function(){
            var redPackages = this.$list.find('dd.luckymoney').data('data');
            if(redPackages && redPackages.length){
                var hasOld = 0;
                var hasNew = 0;
                for(var i=0;i<redPackages.length;i++){
                    if(!redPackages[i].templateId){
                        hasOld ++;
                    }else {
                        hasNew ++;
                    }
                }
                var needPay = 0;
                if(hasOld){
                    needPay = this.opt.option.billingInfo.total - this.comboDeduct + (this.opt.option.cost || 0);
                }
                if(hasNew){
                    if(this.opt.option.serviceItems){
                        needPay = this.getAppointServiceItemsTotal(this.opt.option.serviceItems);
                    }
                }
                var discountDetail = [];
                var serviceDiscountTotal = 0;
                console.log(needPay)
                for(var i=0;i<redPackages.length;i++){
                    var package = redPackages[i];
                    console.log(package)
                    if(!package.templateId){
                        //旧红包
                        var billMoney = package.money;
                        if(needPay<billMoney){
                            billMoney = needPay;
                        }
                        //旧红包只能同时使用一个
                        if(!this.checkOldPackageNum(discountDetail)){
                            discountDetail.push({
                                id: package.id,
                                realMoney: billMoney,
                                money: package.money,
                                oldPackage: 1,
                                activityTitle: package.activityTitle
                            });
                            needPay -= billMoney;
                            if(needPay<0){
                                needPay = 0;
                            }
                        }
                    }else {
                        if(this.opt.option && this.opt.option.serviceItems && this.opt.option.serviceItems.length){
                            //新型模板红包仅项目抵扣
                            if(package.rule && JSON.parse(package.rule).content){
                                var rule = JSON.parse(JSON.parse(JSON.parse(package.rule).content).rule);
                                if(rule.luckyMoneyRule.enableCashierPay){
                                    //允许店内消费抵扣
                                    if(!rule.luckyMoneyRule.allowCashierPay.memCard || (this.opt.member && this.opt.member.cardNum==1 && this.opt.member.cardTypeId == '20151212')){
                                        //没有禁止同时使用会员卡 ||  禁止同时使用会员卡时使用散客卡
                                        if(!rule.luckyMoneyRule.allowCashierPay.otherRedPackage || !discountDetail.length){
                                            //没有禁止使用其他红包 || 禁止使用其他红包抵扣时之前没有抵扣过红包
                                            if(!rule.luckyMoneyRule.allowCashierPay.enableItems){
                                                //没有指定项目使用
                                                if(!rule.luckyMoneyRule.allowCashierPay.consumptionAmountFlag || needPay - serviceDiscountTotal >= rule.luckyMoneyRule.allowCashierPay.consumptionAmount){
                                                    //没有指定满减 || 消费金额达到满减金额
                                                    if(rule.extraRule.type==2){
                                                        //折扣
                                                        var billMoney = toFloat((needPay-serviceDiscountTotal)*((100-rule.extraRule.discount*10)/100));
                                                    }else {
                                                        //金额
                                                        var billMoney = package.money;
                                                    }
                                                    if(needPay<billMoney){
                                                        billMoney = needPay - serviceDiscountTotal;
                                                    }
                                                    discountDetail.push({
                                                        id: package.id,
                                                        realMoney: billMoney,
                                                        money: package.money,
                                                        discount: rule.extraRule.discount,
                                                        activityTitle: JSON.parse(JSON.parse(package.rule).content).title
                                                    });
                                                    serviceDiscountTotal += billMoney;
                                                }
                                            }else{
                                                var appointServiceItems = this.getAppointServiceItems(this.opt.option.serviceItems,rule.luckyMoneyRule.allowCashierPay.items);
                                                if(appointServiceItems.length){
                                                    // 指定项目使用 消费项目包含指定项目
                                                    var sum = this.getAppointServiceItemsTotal(appointServiceItems);
                                                    sum = sum - serviceDiscountTotal;
                                                    if(sum<0){
                                                        sum = 0;
                                                    }
                                                    if(!rule.luckyMoneyRule.allowCashierPay.consumptionAmountFlag || sum >= rule.luckyMoneyRule.allowCashierPay.consumptionAmount){
                                                        //没有指定满减 || 指定项目消费金额达到满减金额
                                                        if(rule.extraRule.type==2){
                                                            //折扣
                                                            var billMoney = toFloat(sum*((100-rule.extraRule.discount*10)/100));
                                                        }else {
                                                            //金额
                                                            var billMoney = package.money;
                                                            if(billMoney>sum){
                                                                billMoney = sum;
                                                            }
                                                        }
                                                        if(needPay<billMoney){
                                                            billMoney = needPay - serviceDiscountTotal;
                                                        }
                                                        discountDetail.push({
                                                            id: package.id,
                                                            realMoney: billMoney,
                                                            money: package.money,
                                                            discount: rule.extraRule.discount,
                                                            activityTitle: JSON.parse(JSON.parse(package.rule).content).title
                                                        });
                                                        serviceDiscountTotal += billMoney;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return discountDetail;
            }
        },
        changeRedPackageStatus:function(data,lis){ //选择红包后判断其他是否还满足使用条件
            if(!data || !data.length){
                for(var i=0;i<lis.length;i++){
                    $(lis[i]).removeClass('notUseThisBill am-disabled');
                }
                return;
            }
            var selectedReds = data;
            var hasOld = 0;
            var hasNew = 0;
            for(var i=0;i<selectedReds.length;i++){
                if(!selectedReds[i].templateId){
                    hasOld ++;
                }else {
                    hasNew ++;
                }
            }
            if(hasOld){
                for(var j=0;j<lis.length;j++){
                    $(lis[j]).addClass('notUseThisBill am-disabled');
                }
                return;
            }
            if(hasNew){
                for(var j=0;j<lis.length;j++){
                    var oldRed = $(lis[j]).data('data');
                    if(!oldRed.templateId){
                        $(lis[j]).addClass('notUseThisBill am-disabled');
                    }
                }
            }
            if(this.opt.option.serviceItems){
                var needPay = this.getAppointServiceItemsTotal(this.opt.option.serviceItems);
            }else {
                var needPay = 0;
            }
            var serviceDiscountTotal = 0;
            for(var i=0;i<selectedReds.length;i++){
                var sRed = selectedReds[i];
                var sOther = false;
                if(!sRed.templateId){
                    var billMoney = sRed.money;
                    if(needPay<billMoney){
                        billMoney = needPay;
                    }
                    needPay -= billMoney;
                    if(needPay<0){
                        needPay = 0;
                    }
                }else {
                    if(sRed.rule && JSON.parse(sRed.rule).content){
                        var sRule = JSON.parse(JSON.parse(JSON.parse(sRed.rule).content).rule);
                        if(!sRule.luckyMoneyRule.allowCashierPay.enableItems){
                            if(sRule.extraRule.type==2){
                                //折扣
                                var billMoney = toFloat((needPay-serviceDiscountTotal)*((100-sRule.extraRule.discount*10)/100));
                            }else {
                                //金额
                                var billMoney = sRed.money;
                            }
                            serviceDiscountTotal += billMoney;
                        }else {
                            var appointServiceItems = this.getAppointServiceItems(this.opt.option.serviceItems,sRule.luckyMoneyRule.allowCashierPay.items);
                            if(appointServiceItems.length){
                                var sum = this.getAppointServiceItemsTotal(appointServiceItems);
                                sum = sum -serviceDiscountTotal;
                                if(sum<0){
                                    sum = 0;
                                }
                                if(sRule.extraRule.type==2){
                                    //折扣
                                    var billMoney = toFloat(sum*((100-sRule.extraRule.discount*10)/100));
                                }else {
                                    //金额
                                    var billMoney = sRed.money;
                                    if(billMoney>sum){
                                        billMoney = sum;
                                    }
                                }
                                serviceDiscountTotal += billMoney;
                            }
                        }
                        if(sRule.luckyMoneyRule.allowCashierPay.otherRedPackage){
                            sOther = true;
                        }
                    }
                }
                for(var j=0;j<lis.length;j++){
                    if(sOther){
                        $(lis[j]).addClass('notUseThisBill am-disabled');
                    }else {
                        var red = $(lis[j]).data('data');
                        if(!red.templateId){
                            //旧红包只能同时使用一个
                            if(hasOld){
                                $(lis[j]).addClass('notUseThisBill am-disabled');
                            }else {
                                // $(lis[j]).removeClass('notUseThisBill am-disabled');
                            }
                        }else {
                            $(lis[j]).removeClass('notUseThisBill am-disabled');
                            if(red.rule && JSON.parse(red.rule).content){
                                var rule = JSON.parse(JSON.parse(JSON.parse(red.rule).content).rule);
                                if(rule.luckyMoneyRule.allowCashierPay.otherRedPackage){
                                    $(lis[j]).addClass('notUseThisBill am-disabled');  //禁止使用其他红包
                                }else {
                                    $(lis[j]).removeClass('notUseThisBill am-disabled');
                                    if(rule.luckyMoneyRule.allowCashierPay.consumptionAmountFlag){
                                        // 指定满减
                                        if(rule.luckyMoneyRule.allowCashierPay.enableItems){
                                            //指定项目
                                            var appointServiceItems = this.getAppointServiceItems(this.opt.option.serviceItems,rule.luckyMoneyRule.allowCashierPay.items);
                                            if(appointServiceItems.length){
                                                var sum = this.getAppointServiceItemsTotal(appointServiceItems);
                                                sum = sum -serviceDiscountTotal;
                                                if(sum<0){
                                                    sum = 0;
                                                }
                                                if(rule.luckyMoneyRule.allowCashierPay.consumptionAmount<sum){
                                                    $(lis[j]).removeClass('notUseThisBill am-disabled');
                                                }else {
                                                    $(lis[j]).addClass('notUseThisBill am-disabled'); //抵扣未达到满减条件
                                                }
                                            }
                                        }else {
                                            // 未指定项目
                                            if(rule.luckyMoneyRule.allowCashierPay.consumptionAmount<= needPay - serviceDiscountTotal){
                                                $(lis[j]).removeClass('notUseThisBill am-disabled');
                                            }else {
                                                $(lis[j]).addClass('notUseThisBill am-disabled'); //抵扣未达到满减条件
                                            }
                                        }
                                    }else {
                                        $(lis[j]).removeClass('notUseThisBill am-disabled');
                                    } 
                                }
                            }else {
                                $(lis[j]).addClass('notUseThisBill am-disabled'); //无配置规则
                            }
                        }
                    }
                }
            }
        },
        checkSingleUse:function(){ //单个红包是否可用，不可用的禁用
            var lis = this.$.find('.luckyMoneyList .canUse');
            if(lis && lis.length){
                for(var i=0;i<lis.length;i++){
                    var red = $(lis[i]).data('data');
                    if(red.templateId){
                        if(this.opt.option && this.opt.option.serviceItems && this.opt.option.serviceItems.length){
                            if(red.rule && JSON.parse(red.rule).content){
                                var rule = JSON.parse(JSON.parse(JSON.parse(red.rule).content).rule);
                                if(rule.luckyMoneyRule.enableCashierPay){
                                    if(!rule.luckyMoneyRule.allowCashierPay.memCard || (this.opt.member && this.opt.member.cardNum==1 && this.opt.member.cardTypeId == '20151212')){
                                        if(rule.luckyMoneyRule.allowCashierPay.enableItems){
                                            //指定项目
                                            var appointServiceItems = this.getAppointServiceItems(this.opt.option.serviceItems,rule.luckyMoneyRule.allowCashierPay.items);
                                            if(!appointServiceItems.length){
                                                $(lis[i]).addClass('notUseThisBill am-disabled').removeClass('canUse'); // 不包含指定项目
                                            }else {
                                                var sum = this.getAppointServiceItemsTotal(appointServiceItems);
                                                if(!rule.luckyMoneyRule.allowCashierPay.consumptionAmountFlag || sum >= rule.luckyMoneyRule.allowCashierPay.consumptionAmount){
                                                    
                                                }else {
                                                    $(lis[i]).addClass('notUseThisBill am-disabled').removeClass('canUse'); // 包含指定项目 指定项目总和未达到满减额
                                                }
                                            }
                                        }else {
                                            //未指定项目
                                            if(this.opt.option.serviceItems){
                                                var sum = this.getAppointServiceItemsTotal(this.opt.option.serviceItems);
                                            }else {
                                                var sum = 0;
                                            }
                                            if(!rule.luckyMoneyRule.allowCashierPay.consumptionAmountFlag || sum >= rule.luckyMoneyRule.allowCashierPay.consumptionAmount){

                                            }else {
                                                $(lis[i]).addClass('notUseThisBill am-disabled').removeClass('canUse'); // 项目总和未达到满减额
                                            }
                                        }

                                    }else {
                                        $(lis[i]).addClass('notUseThisBill am-disabled').removeClass('canUse');  //禁止使用其他会员卡
                                    }
                                }else {
                                    $(lis[i]).addClass('notUseThisBill am-disabled').removeClass('canUse'); // 不可店内消费
                                }
                            }
                        }else {
                            $(lis[i]).addClass('notUseThisBill am-disabled').removeClass('canUse'); //没有项目
                        }
                    }
                }
            }
        },
        getAppointServiceItems:function(serviceItems,appointServiceItems){
            var arr = [];
            if(serviceItems.length && appointServiceItems.length){
                for(var i=0;i<appointServiceItems.length;i++){
                    for(var j=0;j<serviceItems.length;j++){
                        if(appointServiceItems[i].itemId==serviceItems[j].itemId){
                            arr.push(serviceItems[j]);
                        }
                    }
                }
            }
            return arr;
        },
        getAppointServiceItemsTotal:function(appointServiceItems){
            var sum = 0;
            if(appointServiceItems.length){
                for(var i=0;i<appointServiceItems.length;i++){
                    if(!appointServiceItems[i].consumeId){
                        sum += appointServiceItems[i].salePrice;
                    }
                }
            }
            return sum;
        },
        checkOldPackageNum:function(discountDetail){
            var num = 0;
            if(discountDetail.length){
                for(var i=0;i<discountDetail.length;i++){
                    if(discountDetail[i].oldPackage){
                        num ++;
                    }
                }
            }
            return num;
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
            var cardList = amGloble.metadata.cardTypeList.concat(amGloble.metadata.defaultCardTypeList || []);
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
                        
                        var bonus = am.page.memberCard.getBonusRule(cardType[0], rechargeMoney,2);
                        this.$list.find('.val.rechargeBonus').text(("￥" + bonus) || "");
                    }else if(cardTypeId=='20151212' || cardTypeId=='20161012'){
                        // 默认卡充值赠送金权限
                    }
                    if (am.metadata.userInfo.operatestr && am.metadata.userInfo.operatestr.indexOf("A0") == -1) {
                        this.$list.find('.rechargeBonusItem').addClass('am-disabled');
                    } else {
                        this.$list.find('.rechargeBonusItem').removeClass('am-disabled');
                    }
                }
            } else {
                //总额显示，充值金额，赠送金栏隐藏，
                this.$list.find('dt.totalprice').show();
                this.$list.find('.rechargeItem').hide()
                this.$list.find('dd.luckymoney').show().find('.val').addClass("add").removeClass("edit").text("");
                this.$list.find('dd.prePay').show().find('.val').addClass("add").removeClass("edit").text("");
                if (this.opt.member && this.opt.option.expenseCategory < 2) {
                    this.$list.find('dd.mallOrder').show().find('.val').addClass("add").removeClass("edit").text("");
                    this.$list.find('dd.mallOrder,dd.luckymoney').removeClass('am-disabled');
                } else {
                    this.$list.find('dd.mallOrder').hide().find('.val').addClass("add").removeClass("edit").text("");
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
            //点评口碑券总是先隐藏
            this.$list.find('dd.dpCoupon,dd.kbCoupon').hide().removeData('data').find('val').text('');//.find('.val').addClass("add").removeClass("edit").text("");
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
                this.$payTypes.filter('.pay_kb').addClass('mixProdPay');
            } else {
                this.$payTypes.filter('.pay_dp').removeClass('mixProdPay');
                this.$payTypes.filter('.pay_kb').removeClass('mixProdPay');
            }

            this.showDepPerfSet();
            if (this.opt.renewal) {
                this.$.find('dd.depPerf').hide();
            }

            this.showSmsSendFlag();

            this.hasRender = true;

        },
        checkCardAboutCurrentDay:function(){
            var member = this.opt.member;
            var self = this;
            if (member && (this.opt.option.expenseCategory == 0 || this.opt.option.expenseCategory == 1 || this.opt.option.expenseCategory == 4) && member.cardtype == 1 && member.timeflag != 1
            && new Date(member.openDate).format('yyyy-mm-dd') == new Date().format('yyyy-mm-dd')){
                am.api.checkCardAboutCurrentDay.exec({
                    cardId: member.cid,
                    parentShopId: amGloble.metadata.userInfo.parentShopId,
                    shopId: amGloble.metadata.userInfo.shopId,
                },function(res){
                    if(res.code==0){
                        self.currentDayCharge = res.content;
                        if (member.newcardPayLimit<100 && self.currentDayCharge && (Math.round((self.needPay) * 100)+Math.round((self.currentDayCharge.CONSUMEFEE) * 100))>(Math.round((self.currentDayCharge.CHARGEFEE) * 100)*(member.newcardPayLimit/100))  //开卡当日消费超过设置的总额百分比
                        ){ 
                            self.$payTypes.filter('.pay_memberCard').addClass('am-disabled');
                            self.$payTypes.filter('.pay_memberCard').find('.whynot').show().find('.text').text('开卡当日消费不得超过总额的'+member.newcardPayLimit+'%,(当日开卡总额'+Math.round(self.currentDayCharge.CHARGEFEE*100)/100+',已消费'+Math.round(self.currentDayCharge.CONSUMEFEE*100)/100+')');
                        }
                    }else {

                    }
                })
            }
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
                                    isDepart: 1,
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
            this.usedDpCoupon = true;
            am.page.service.billData.lastDpTicketCode=data.serialnumber;
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
        addKbCoupon: function(data){
            var that = this;
            var $dd = this.$list.find('dd.kbCoupon').show();
            $dd.data('data', data).find('.val').html('<span class="name">' + data.itemname + '</span><span class="price">' + data.originalprice + '</span>');
            var bill = this.opt.option.billingInfo;
            bill.kBOrderid = data.id;
            this.setNeedPay(this.needPay - data.originalprice);
            this.paytool.mix.$input.filter('[name=kb]').val("");
            this.usedKbCoupon = true;
            // 将券与单关联
            am.page.service.billData.lastKbTicketCode=data.ticketcode;
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
        submit: function (isPrint,pw) {
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
                "onlineCredit":0,//线上积分
                "onlineCreditPay":0,//线上积分抵扣金额
                "offlineCredit":0,//线下积分
                "offlineCreditPay":0,//线下积分抵扣金额
                "mallOrderFee":0,//商城订单
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
            console.log(bill)
            if (this.opt.option.expenseCategory != 2) {
                //如果是开卡，presentFee要保留之前的设定
                bill.presentFee = 0;
            }
            console.log(this.needPay)
            this.opt.option.orderDetail = [];
            if (this.needPay > 0) {
                if ($type.length) {
                    if ($type.hasClass("pay_memberCard")) {
                        bill.cardFee = this.needPay;
                        if(this.opt.member && this.opt.member.combinedUseFlag==1){
                            var result = this.getCardFeeAndPresentFee(bill.cardFee,this.opt.member);
                            bill.cardFee = result.cardFee;
                            bill.presentFee = result.presentFee;
                        }
                    } if ($type.hasClass("pay_bonus")) {
                        if(this.opt.member && !this.opt.member.allowPresentfeeDiscount && this.opt.member.discount && this.opt.option.expenseCategory!=4){
                            bill.presentFee = this.originalPay;
                        }else {
                            bill.presentFee = this.needPay;
                        }                        
                    } else if ($type.hasClass("pay_cash")) {
                        bill.cashFee = this.needPay;
                    } else if ($type.hasClass("pay_pos")) {
						bill.unionPay = this.needPay;
						var paydata = $type.data("data");
                        if (paydata) {
                            bill.unionOrderId = paydata.id;
                            this.opt.option.orderDetail.push({
                                "payOrderId":paydata.id
                                ,"amount":paydata.price 
                                ,"orderType":6
                                ,"billType":1
                            });
                        }
						if(am.operateArr.indexOf("a61") > -1){
							if(paydata && paydata.status == 3){
								console.log("勾选a61后并且银联支付成功")
							}else{
								return am.msg("不允许银联支付仅记账不收款");
							}
						}
                    } else if ($type.hasClass("pay_wechat")) {
                        bill.weixin = this.needPay;
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.weixinId = paydata.id;
                            this.opt.option.orderDetail.push({
                                "payOrderId":paydata.id
                                ,"amount":paydata.price 
                                ,"orderType":1
                                ,"billType":1
                            });
                        } else if (this.checkOnlinePayAuth()) {
                            return 1;
                        }
                    } else if ($type.hasClass("pay_alipay")) {
                        bill.pay = this.needPay;
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.payId = paydata.id;
                            this.opt.option.orderDetail.push({
                                "payOrderId":paydata.id
                                ,"amount":paydata.price 
                                ,"orderType":2
                                ,"billType":1
                            });
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
                    } else if ($type.hasClass("pay_jd")) {
                        bill[this.jdSetting.field.toLowerCase()] = this.needPay;
                        var paydata = $type.data("data");
                        if (paydata) {
                            bill.jdOrderId = paydata.id;
                            this.opt.option.orderDetail.push({
                                "payOrderId":paydata.id
                                ,"amount":paydata.price 
                                ,"orderType":7
                                ,"billType":1
                            });
                        } else if (this.checkOnlinePayAuth()) {
                            return 1;
                        }
                    } else if ($type.hasClass("pay_kb")) {
                        bill[this.kbSetting.field.toLocaleLowerCase()] = this.needPay;
                    }else if ($type.hasClass("pay_mix")) {
                        if (typeof (this.paytool.mix.checkTotalPrice()) == "undefined") {
                            var $input = this.paytool.mix.$input;
                            for (var i = 0; i < $input.length; i++) {
                                var $thisInput = $input.eq(i);
                                var val = $thisInput.val() * 1;
                                if (val > 0) {
                                    var payTypeName = $thisInput.attr('name');
                                    bill[this.payTypeNameMap[payTypeName] || payTypeName] = val;
                                    if (payTypeName == "onlineCreditPay") {
                                        bill.onlineCredit = Math.ceil(val * (am.metadata.configs.onlineCreditPay || 1));
                                    }
                                    if (payTypeName == "offlineCreditPay") {
                                        bill.offlineCredit = Math.ceil(val * (am.metadata.configs.offlineCreditPay || 1));
									}
									if (payTypeName == "pos") {
										var paydata = $thisInput.data('data');
                                        if (paydata) {
                                            bill.unionOrderId = paydata.id;
                                            this.opt.option.orderDetail.push({
                                                "payOrderId":paydata.id
                                                ,"amount":paydata.price 
                                                ,"orderType":6
                                                ,"billType":1
                                            });
                                        }
										if(am.operateArr.indexOf("a61") > -1){
											if(paydata && paydata.status == 3){
												console.log("勾选a61后并且银联支付成功")
											}else{
												return am.msg("不允许银联支付仅记账不收款");
											}
										}
                                    }
                                    if (payTypeName == "wechat") {
                                        var paydata = $thisInput.data('data');
                                        if (paydata) {
                                            bill.weixinId = paydata.id;
                                            this.opt.option.orderDetail.push({
                                                "payOrderId":paydata.id
                                                ,"amount":paydata.price 
                                                ,"orderType":1
                                                ,"billType":1
                                            });
                                        } else if (this.checkOnlinePayAuth()) {
                                            return 1;
                                        }
                                    }
                                    if (payTypeName == "alipay") {
                                        var paydata = $thisInput.data('data');
                                        if (paydata) {
                                            bill.payId = paydata.id;
                                            this.opt.option.orderDetail.push({
                                                "payOrderId":paydata.id
                                                ,"amount":paydata.price 
                                                ,"orderType":2
                                                ,"billType":1
                                            });
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
                                    if (payTypeName == 'jd'){
                                        var paydata = $thisInput.data("data");
                                        if (paydata) {
                                            bill.jdOrderId = paydata.id;
                                            this.opt.option.orderDetail.push({
                                                "payOrderId":paydata.id
                                                ,"amount":paydata.price 
                                                ,"orderType":7
                                                ,"billType":1
                                            });
                                        } else if (this.checkOnlinePayAuth()) {
                                            return 1;
                                        }
                                    }
                                    if(this.opt.member && this.opt.member.combinedUseFlag==1){
                                        if(payTypeName=='card'){
                                            var result = this.getCardFeeAndPresentFee(bill.cardFee,this.opt.member);
                                            bill.cardFee = result.cardFee;
                                            bill.presentFee = result.presentFee;
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

            var kbData = this.$list.find('dd.kbCoupon').data('data');
            if (kbData) {
                //商城卡支付加上 口碑优惠券的钱
                bill[this.kbSetting.field.toLowerCase()] += kbData.price*1;
                bill.voucherFee += (kbData.originalprice - kbData.price*1);
                bill.kBOrderid = kbData.id;
            } else {
                bill.kBOrderid = null;
                if(bill.kb){
                    bill[this.kbSetting.field.toLowerCase()] = bill.kb;
                    delete bill.kb;
                }
            }

            // var luckyMoney = this.$list.find('dd.luckymoney').data('data');
            // if (luckyMoney) {
            //     var realLuckyMoney = luckyMoney.money || 0;
            //     if (bill.total < luckyMoney.money) {
            //         realLuckyMoney = bill.total;
            //     }
            //     bill.luckymoney += realLuckyMoney;
            //     bill.luckyMoneyId = luckyMoney.id;
            // }

            var luckymoney = this.redPackageDiscount();
            if(luckymoney && luckymoney.length){
                var luckymoneyTotal = 0;
                for(var i=0;i<luckymoney.length;i++){
                    luckymoneyTotal += luckymoney[i].realMoney;
                }
                var realLuckyMoney = luckymoneyTotal;
                if (bill.total < realLuckyMoney) {
                    realLuckyMoney = bill.total;
                }
                bill.luckymoney += realLuckyMoney;
                bill.luckyMoneyId = -1;
                bill.luckMoneys = luckymoney;
            }

            var prepay = this.$list.find('dd.prePay').data('data');
            if (prepay) {
                //因为orderType和type是两张表对应关系不一致，所以type=4银联orderType=6银联,兼容处理!!!
                var orderType = prepay.type;
                if(orderType==4){
                    orderType = 6;
                }else if(orderType==5){
                    orderType = 7;
                }
                this.opt.option.orderDetail.push({
                    "payOrderId":prepay.id//收款流水id
                    ,"amount":prepay.price //关联金额
                    ,"orderType":orderType //收款流水类型 支付方式1微信 2支付宝 3点评 4口碑 5闪惠 6POS银联 7京东钱包
                    ,"billType":1//明细类型  1水单2开支
                })
                if (prepay.type == 1) {
                    bill.weixin += prepay.price;
                    bill.weixinId = prepay.id;
                } else if (prepay.type == 2) {
                    bill.pay += prepay.price;
                    bill.payId = prepay.id;
                } else if (prepay.type == 4) {
                    bill.unionPay += prepay.price;
                    bill.unionOrderId = prepay.id;
                } else if (prepay.type == 5) {
                    bill[this.jdSetting.field.toLowerCase()] += prepay.price;
                    bill.jdOrderId = prepay.id;
                }else {
                    alert('error: 请向shuwu报告');
                }
            }

            if(this.opt.settlementPayDetail) {
                var settlementPayDetail = this.opt.settlementPayDetail;
                if(settlementPayDetail.payType == 'pay_wechat') {
                    var payMoney = settlementPayDetail.payMoney;
                    //微信收款数据
                    var wechatOrder = JSON.parse(payMoney.wechatOrder);
                    console.log('微信收款', wechatOrder);

                    this.opt.option.orderDetail = [
                        {
                            "payOrderId": wechatOrder.id,
                            "amount": wechatOrder.price,
                            "orderType":1,
                            "billType":1
                        }
                    ];

                    console.log('微信收款22', this.opt);
     
                }
            }

            var mallOrder = this.$list.find('dd.mallOrder').data('data');
            if (mallOrder) {
                bill.mallId = mallOrder.id;
                bill.mallNo = mallOrder.code;
                bill.mallCategory = mallOrder.category;
                bill.mallOrderFee += (mallOrder.price || 0);
                // bill.luckymoney += (mallOrder.luckyMoneyPay || 0);
                // bill.mallOrderFee += (mallOrder.cashPay || 0);
                // if (mallOrder.cashPay) {
                //     if (mallOrder.payType == 0) {
                //         bill.weixin += mallOrder.cashPay;
                //     } else if (mallOrder.payType == 1) {
                //         bill.pay += mallOrder.cashPay;
                //     } else {
                //         alert('error: 请向shuwu报告');
                //     }
                // }
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

                if(this.opt.action=='recharge'){
                    if(this.opt.cardType){
                        var min = this.opt.cardType.mgj_minRecharge;
                        if(this.opt.option.billingInfo.total<min){
                            am.msg('此卡已限制最低充值金额为￥' + min);
                            return;
                        }
                    }
                }

                if (this.opt.debt) {
                    console.log(this.opt.debt);
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
                                if(amGloble.metadata.configs.debtFlag*1 && j=='debtFee'){
                                    continue;
                                }
                                deptPerfs[i].perf[j] = Math.round(billingInfo[j] * deptPerfs[i].per) / 100;
                            }
                        }
                        if (this.opt.option.expenseCategory < 4) {
                            if(amGloble.metadata.configs.debtFlag*1){
                                deptPerfs[i].perf.cardFee = billingInfo.total - billingInfo.debtFee || 0;
                            }else {
                                deptPerfs[i].perf.cardFee = billingInfo.total;
                            }
                            
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
            this.submitToServer(isPrint,pw);
		},
        getCardFeeAndPresentFee:function(total,member){
            if(!member.balance){
                return {
                    cardFee: 0,
                    presentFee: total
                }
            }
            if(!member.gift){
                return {
                    cardFee: total,
                    presentFee: 0
                }
            }
            var factor = total<1?10000:100;
            var cardPer = member.balance/(member.balance+member.gift),
                cardFee = Math.ceil(cardPer*total*factor)/factor,
                presentFee = Math.round((total-cardFee)*100)/100;
            return {
                cardFee: cardFee,
                presentFee: presentFee
            }
		},
		paramsEdit: function(){
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
            if (am.operateArr.indexOf("a6") != -1 && sessionStorage._autoPay1214 != 'autoPay') {
                am.msg("收款未支付完成");
                return 1;
            }
        },
        submitToServer: function (isPrint,pw) {
            var _this = this,
                b = this.opt.option.billingInfo,
                sum = b.cardFee + b.cashFee + b.unionPay + b.cooperation + b.mall + b.weixin + b.pay + b.voucherFee + b.mdFee + b.dpFee + b.treatfee + b.treatpresentfee + b.luckymoney + b.coupon + b.divideFee + b.debtFee + b.jdFee + b.mallOrderFee + b.onlineCreditPay + b.offlineCreditPay;
            if (this.opt.option.expenseCategory != 3 && this.opt.option.expenseCategory != 2) {
                //充值的时候,presentFee不算
                if(this.opt.member && !this.opt.member.allowPresentfeeDiscount && this.opt.member.discount && this.opt.option.expenseCategory!=4){
                    if(this.$payTypes.filter(".selected").hasClass("pay_bonus")){
                        sum += this.needPay;
                    }else {
                        sum += b.presentFee/(this.opt.member.discount/10);
                    }
                }else {
                    sum += b.presentFee;
                }
            }
            for (var i = 1; i <= 10; i++) {
                if (b['otherfee' + i]) {
                    sum += b['otherfee' + i];
                }
            }
            if(Math.round(sum*100) < Math.round(b.total*100) && Math.abs(Math.round(sum*100)-Math.round(b.total*100))>1){
                am.msg('结算金额有误！');
                return 1;
			}
			if(pw){
				this.opt.option = this.paramsEdit();
				am.pw.check(this.opt.member,function(verifyed){
					if(verifyed){
						_this.submit();
					}
				},this.opt.option);
				return false;
			}
            if(this.opt.member && this.opt.member.cardshopId == am.metadata.userInfo.shopId){
                if(this.opt.comboitem && this.opt.comboitem.length){
                    if(this.getComboCrossNum(this.opt.comboitem)){
                        this.opt.option.otherFlag = 1;//跨店
                    }else {
                        this.opt.option.otherFlag = 0;//本店
                    }
                }else {
                    this.opt.option.otherFlag = 0;//本店
                }
            }else if(this.opt.member && this.opt.member.cardshopId != am.metadata.userInfo.shopId) {
                if(this.opt.comboitem && this.opt.comboitem.length){
                    if(!this.getComboCrossNum(this.opt.comboitem) && this.opt.option.serviceItems && this.opt.comboitem.length==this.opt.option.serviceItems.length ){
                        this.opt.option.otherFlag = 0;//本店
                    }else {
                        this.opt.option.otherFlag = 1;//跨店
                    }
                }else {
                    this.opt.option.otherFlag = 1;//跨店
                }
            }else {
                this.opt.option.otherFlag = 0;//本店
            }
            if(this.opt.option.expenseCategory==2){
                this.opt.option.otherFlag = 0;//本店
            }
            //总部会员不跨店
            if(this.opt.member && this.opt.member.cardshopId == am.metadata.userInfo.parentShopId){
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
                    if(!am.isNull(option.orderDetail)){
                        for(var i=0;i<option.orderDetail.length;i++){
                            var orderDetail = option.orderDetail[i];
                            var servAmount = 0,prodAmount = 0;
                            if(orderDetail.orderType == 1){
                                servAmount = servOption.billingInfo.weixin;
                                prodAmount = prodOption.billingInfo.weixin;
                            }else if(orderDetail.orderType == 2){
                                servAmount = servOption.billingInfo.pay;//项目,支付宝
                                prodAmount = prodOption.billingInfo.pay;//卖品,支付宝
                            }else if(orderDetail.orderType == 6){
                                servAmount = servOption.billingInfo.unionPay;
                                prodAmount = prodOption.billingInfo.unionPay;
							}else if(orderDetail.orderType == 7){
                                servAmount = servOption.billingInfo[this.jdSetting.field.toLocaleLowerCase()];
                                prodAmount = prodOption.billingInfo[this.jdSetting.field.toLocaleLowerCase()];
							}
                            servOption.orderDetail.push({
                                "payOrderId":orderDetail.payOrderId//收款流水id
                                ,"amount":servAmount //关联金额
                                ,"orderType":orderDetail.orderType //收款流水类型 支付方式1微信2支付宝3点评
                                ,"billType":1//明细类型  1水单2开支
                            });
                            prodOption.orderDetail.push({
                                "payOrderId":orderDetail.payOrderId//收款流水id
                                ,"amount":prodAmount //关联金额
                                ,"orderType":orderDetail.orderType //收款流水类型 支付方式1微信2支付宝3点评
                                ,"billType":1//明细类型  1水单2开支
                            });
                        }
                    }else{
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

            //计算非项目业绩
            this.computePerSetPerf();

            if (this.$memberCount.hasClass("checked")) {
                this.opt.option.clientflag = 1;
            } else {
                this.opt.option.clientflag = 0;
            }
            //给套餐项目分，现金，卡结，其它
            this.setTreatItemPerf();

            if(this.opt.member){
				if (this.opt.option.expenseCategory == 3) {
					var $val = this.$list.find('.rechargeCardType').find('.val');
					var upgradeCard = $val.data('data');
					if (upgradeCard) {
						upgradeCard = upgradeCard.data;
					}
					//手动升级
					if ($val.is(":visible") && upgradeCard && upgradeCard.cardtypeid != this.opt.member.cardTypeId.toString()) {
						this.opt.option.cardUpId = undefined;
					}else{
						//自动升级
						if(!am.isNull(this.cardUpId)){
							this.opt.option.cardUpId = this.cardUpId;
						}
					}
				}
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
                realOption.billingInfo.onlineCredit = Math.ceil(servOption.billingInfo.onlineCreditPay  * (am.metadata.configs.onlineCreditPay || 1));
                realOption.billingInfo.offlineCredit = Math.ceil(servOption.billingInfo.offlineCreditPay  * (am.metadata.configs.offlineCreditPay || 1));
                realOption.billingInfo.luckMoneys = this.opt.option.billingInfo.luckMoneys;

                if(_billNo){
                    realOption.billNo = _billNo;
                }
            }
            if (this.opt.prodOption) {
                var realOption = this.opt.prodOption;
                realOption.clientflag = this.opt.option.clientflag;
                realOption.otherFlag = (this.opt.member && this.opt.member.cardshopId != am.metadata.userInfo.shopId)?1:0;
                realOption.memId = this.opt.option.memId;
                realOption.cardId = this.opt.option.cardId;
                realOption.discount = this.opt.option.discount;
                realOption.smssendflag = this.opt.option.smssendflag;
                realOption.smsflag = this.opt.option.smsflag;
                realOption.billingInfo.onlineCredit = this.opt.option.billingInfo.onlineCredit - this.opt.servOption.billingInfo.onlineCredit;
                realOption.billingInfo.offlineCredit = this.opt.option.billingInfo.offlineCredit - this.opt.servOption.billingInfo.offlineCredit;
                if(_billNo){
                    realOption.billNo = _billNo;
                }
            }
            if(_billNo){
                this.opt.option.billNo = _billNo;
            }    
            _this.opt.option.lastDpTicketCode && delete _this.opt.option.lastDpTicketCode;
            _this.opt.option.lastKbTicketCode && delete _this.opt.option.lastKbTicketCode;        
            var toPay = function(){
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
						if(ret.content && !am.isNull(ret.content.newCardTypeId)){
							var discountStr = '';
							var cardData = _this.ruleObj || {};
							console.log('ruleObj====',_this.ruleObj);
							// if(cardData.buydiscount > 0){
								// discountStr += '套餐' + cardData.buydiscount + '折';
							// }
							if(cardData.discount > 0){
								discountStr += '可享项目' + cardData.discount + '折';
							}
							str = '恭喜您，此卡已升级为' + cardData.cardTypeName + discountStr;
							$("#payConfirm").find(".cardUpTip").text(str);
							_this.upgradeCardSuccessAuto = true;//自动升级开启

						}
						_this.cardUpgradeObj = {
							memId: _this.opt.option.memId,
							cid: ret.content.memCardId
						};

						_this.billId=ret.content.billId;//将单号设置为全局变量
						_this.billIds = ret.content.billIds; // 多单一起结算，返回多单的集合
                        if (_this.$printSwitch.hasClass("checked")) {
                            _this.print();
                        }
                        if (_this.opt.member) {
							_this.opt.member.lastExpenseCategory = _this.opt.option.expenseCategory;
							if(_this.opt.option && (_this.opt.option.expenseCategory == 0 || _this.opt.option.expenseCategory == 1)){
								_this.opt.member.lastConsumeTime = new Date().getTime();//更新会员最后消费时间记录
							}
                            am.page.searchMember.saveLastSelectMember(_this.opt.member, "p");
                            if (_this.opt.debt || _this.opt.option.billingInfo.debtFee) {
                                //如果还款了，清除用户欠款的缓存数据
                                cashierDebt.clearCache(_this.opt.member.id);
                            }
                            if(_this.opt.member.needDeletedWaitedBillId){
                                am.page.hangup.deleteWaitedBills([_this.opt.member.needDeletedWaitedBillId],'已开单单据选取待开单顾客作为会员后删除');
                            }
                            localStorage.removeItem('memPwd'+'_'+_this.opt.member.id);
                        }
                        _this.checkIfNeedUpgradeCardType(ret.content.billId);
                        if (_this.opt.billRemark) {//如果是挂单备注 需将原单状态修改为已买单
                            _this.opt.remarkCallback && _this.opt.remarkCallback(_this.opt.member,ret.content);
                        }
                        am.page.hangup.lastCheckedBillId = _this.opt.option.instoreServiceId;
                        if(_this.opt.member && ret.content.memCardId){
                            _this.opt.member.cid = ret.content.memCardId;
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
                            },_this.opt.option.billNo);
                        } else {
                            am.msg("单号重复！");
                            _this.$submit.removeClass("am-disabled");
                        }

                    }else if(ret.code == 10030){
                        am.msg("买单过于频繁，请稍后重试！");
                        _this.$submit.removeClass("am-disabled");
                    }else if(ret.code == 1000){
                        am.msg('token失效');
                        $.am.changePage(am.page.login, "");
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
                    if(!_this.opt.servOption.uuid){
                        _this.opt.servOption.uuid = _this.getUniqueId();
                    }
                    if(!_this.opt.prodOption.uuid){
                        _this.opt.prodOption.uuid = _this.getUniqueId();
                    }
                    if(isNaN(_this.opt.prodOption.billNo)){
                        delete _this.opt.prodOption.billNo;
                    }
                    if(_this.opt.servOption.instoreServiceId && _this.opt.prodOption.instoreServiceId){
                        delete _this.opt.servOption.instoreServiceId;
                    }
                    am.api.mutiBillCheck.exec([_this.opt.servOption, _this.opt.prodOption], callback);
                } else {
                    // 性能监控点
                    monitor.startTimer('M05', _this.opt.option)

                    if(!_this.opt.option.uuid){
                        _this.opt.option.uuid = _this.getUniqueId();
                    }
                    if(_this.opt.option.expenseCategory==1 && isNaN(_this.opt.option.billNo)){
                        delete _this.opt.option.billNo;
                    }
                    am.api.billCheck.exec(_this.opt.option, callback);
                }
            }

            if(!this.checkBillNoSuccess){
                if(amGloble.metadata.shopPropertyField.aotomodifybillno == 1){
                    payTips.open(function () {
                        if (_this.opt.servOption) {
                            _this.opt.servOption.autoModifyBillNo = 1;
                            _this.opt.prodOption.autoModifyBillNo = 1;
                        } else {
                            _this.opt.option.autoModifyBillNo = 1;
                        }
                        toPay();
                    }, function () {
                        am.msg("单号重复！");
                        return;
                    },_this.opt.option.billNo);
                }else {
                    am.msg('单号重复');
                    return;
                }
            }else {
                toPay();
            }
		},
        getCalacAjax: function (params, url, sc) {
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
                            // am.msg(res.message);
                            console.log('getGainAndVoidFee success')
                        } else {
                            // am.msg(res.message || "数据获取失败,请检查网络!");
                        }
                    },
                    error: function (res) {
                        console.log('计算提成及业绩出错', res)
                    }
                });
        },
        getGainAndVoidFee: function () {
            var enabledNewPerfModel = amGloble.metadata.enabledNewPerfModel,
                enabledNewBonusModel = amGloble.metadata.enabledNewBonusModel;
            if (this.billId && (enabledNewPerfModel == 1 || enabledNewBonusModel == 1)) {
				var calcFeeUri = enabledNewPerfModel == 1 ? '/empFee/multipleBillCalc' : '/empFee/calcVoidFee';
				var billdIds = [];
				this.billIds.forEach(function(item) {
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
                        parentShopId: parentShopId
                    },
                    urlGain = urlPrefix + '/empGain/multipleBillCalc' + "?" + $.param({
                        shopId: shopid,
                        parentShopId: parentShopId,
                        token: userToken ? userToken.mgjtouchtoken : null
                    }),
                    paramsAchievement = {
						billId: this.billId,
						billdIds: billdIds,
                        shopId: enabledNewPerfModel ? shopid : userInfo.realParentShopId, //算业绩时取门店id，算虚业绩时取总部id
                        parentShopId: parentShopId, //租户ID
                    },
                    urlAchievement = urlPrefix + calcFeeUri + "?" + $.param({
                        shopId: userInfo.realParentShopId,
                        parentShopId: parentShopId,
                        token: userToken ? userToken.mgjtouchtoken : null
                    }),
                    _this = this;
                this.getCalacAjax(paramsAchievement, urlAchievement,
                    function () {
                        if (amGloble.metadata.enabledNewBonusModel == 1) {
                            _this.getCalacAjax(paramsGain, urlGain)
                        }
                    }
                );
            }
        },
        getComboCrossNum:function(comboitem){
            var num = 0;
            if(comboitem && comboitem.length){
                for(var i=0;i<comboitem.length;i++){
                    if(comboitem[i].shopid!=am.metadata.userInfo.shopId){
                        num ++;
                    }
                }
            }
            return num;
        },
        getUniqueId:function(){
            return am.metadata.userInfo.shopId+ '_'+am.metadata.userInfo.userId+Math.uuid();
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
            if(this.opt.from=='recharge'){
                // var opt = {
                //     cardFee: this.$list.find("div.rechargePrice").text().replace("￥", "") * 1,
                //     presentFee: this.$list.find("div.rechargeBonus").text().replace("￥", "") * 1
				// }
				// //手动升级
                // if(this.upgradeCardSuccess){
                //     var upgradeCard = this.$list.find('.rechargeCardType').find('.val').data('data').data;
                //     opt.upgradeCard = {
                //         discount: upgradeCard.discount*1,
                //         buydiscount: upgradeCard.buydiscount*1,
                //         cardName: upgradeCard.cardtypename
                //     }
				// }
				// //自动升级
				// if(!this.upgradeCardSuccess && this.upgradeCardSuccessAuto){
				// }
				var opt = this.cardUpgradeObj;
				$.am.page.back('slidedown', {afterRecharge: opt});
				return;
            }
            if(amGloble.metadata.shopPropertyField && amGloble.metadata.shopPropertyField.mgjBillingType==1){
                if(this.opt.from=='memberCard' || this.opt.from=='comboCard' || this.opt.action=='recharge'){//开卡,充值，买套餐后返回
                    var arr = [];
                    if(am.page.hangup.tempData && am.page.hangup.tempData.length){
                        for(var i=0;i<am.page.hangup.tempData.length;i++){
                            if(am.page.hangup.tempData[i].memId==this.opt.member.id){
                                arr.push(am.page.hangup.tempData[i]);
                            }
                        }
                    }
                    if(arr.length){
                        arr.sort(function(a,b){
                            return a.createDateTime - b.createDateTime;
                        });
                        if(JSON.parse(arr[0].data).billRemark){
                            var billRemark = JSON.parse(arr[0].data).billRemark;
                            if(this.opt.billRemark && this.opt.billRemark.id==arr[0].id){
                                var _billRemark = JSON.parse(this.opt.billRemark.data).billRemark;
                                if(_billRemark){
                                    if(this.opt.option.expenseCategory==2){
                                        if(_billRemark.opencard){
                                            billRemark.opencard.isbuy = true;
                                        }
                                    }else if(this.opt.option.expenseCategory==3){
                                        if(_billRemark.recharge){
                                            billRemark.recharge.isbuy = true;
                                        } 
                                    }else if(this.opt.option.expenseCategory==4){
                                        if(_billRemark.buypackage){
                                            billRemark.buypackage.isbuy = true;
                                        }
                                    }
                                }
                            }
                            
                            // if((!billRemark.opencard || billRemark.opencard.isbuy) && (!billRemark.recharge || billRemark.recharge.isbuy) && (!billRemark.buypackage || billRemark.buypackage.isbuy)){
                                var data = JSON.parse(arr[0].data);
                                data.billRemark = billRemark;
                                arr[0].data = JSON.stringify(data);
                                arr[0].data.cid = this.opt.member.cid;
                                am.cashierTab.feedBill(arr[0],1);
                            // }else {
                                // am.goBackToInitPage();
                            // }
                        }else {
                            arr[0].data.cid = this.opt.member.cid;
                            am.cashierTab.feedBill(arr[0],1);
                        }
                    }else {
                        var opt = [
                            {name:'去开单',key:'openBill'},
                        ]
                        am.popupMenu("请选择操作", opt , function (ret) {
                            if(ret.key=='openBill'){
                                $.am.changePage(amGloble.page.openbill, "slidedown",{
                                    member: _this.opt.member
                                });
                            }
                        },'','',function(){
                            am.goBackToInitPage();
                        });
                    }
                }else {
                    am.goBackToInitPage();
                }
            }else {
                am.goBackToInitPage();
            }
            if(this.opt.member && (this.opt.option.expenseCategory==1 || this.opt.option.expenseCategory==0)){
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
            "onlineCreditPay":"onlineCreditPay",
            "offlineCreditPay":"offlineCreditPay",
            "mallOrderFee":"mallorderfee",
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
                    if(k=='presentfee'){
                        if(this.opt.member && !this.opt.member.allowPresentfeeDiscount && this.opt.member.discount && this.opt.option.expenseCategory!=4){
                            if(this.$payTypes.filter(".selected").hasClass("pay_bonus")){
                                opt.paid[k] = billingInfo.total-billingInfo.treatfee-billingInfo.treatpresentfee-billingInfo.luckymoney-billingInfo.mallOrderFee-billingInfo.weixin-billingInfo.pay+this.unlimitTreatfee;
                            }else {
                                opt.paid[k] = v*(this.opt.member.discount/10);
                            }
                        }else {
                            opt.paid[k] = v;
                        }
                    }else {
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
            var _total = billingInfo.total-billingInfo.treatfee-billingInfo.treatpresentfee;
            opt.rate = amGloble.metadata.configs.debtFlag*1?(_total?(1 - billingInfo.debtFee/_total):1):1;
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
                        //套餐项目
                        items[i].payDetail.treatfee = payDetail[k] || 0;
                    } else if (items[i].consumeType === 1 && k === 'presentfee') {
                        //套餐项目
                        items[i].payDetail.treatpresentfee = payDetail[k] || 0;
                    } else {
                        items[i].payDetail[j] = payDetail[k] || 0;
                        //TODO
                        if(k === 'onlineCreditPay'){
                            items[i].payDetail.onlineCredit = payDetail[k] * am.metadata.configs.onlineCreditPay || 0;
                        }else if(k === 'offlineCreditPay'){
                            items[i].payDetail.offlineCredit = payDetail[k] * am.metadata.configs.offlineCreditPay || 0;
                        }
                    }
                }
				var servers = items[i].servers;
				// 判断是否开启新业绩模式，若开启走新逻辑
				if (amGloble.metadata.enabledNewPerfModel == 1) {
					for(var k = 0; k < servers.length; k++) {
						servers[k].automaticPerformance = servers[k].perf > 0 ? 0 : 1;
						var perfDetail = {};
						perfDetail.voidFee = items[i].salePrice*opt.rate;
                   		servers[k].perfDetail = perfDetail;
					}
					continue;
				}
                var payFeePctObj = this.getPayFeePctObj({total: items[i].salePrice, payDetail: items[i].payDetail});
                //拿员工业绩
                for (var k = 0; k < servers.length; k++) {
					// 判断是否手动修改业绩
					servers[k].automaticPerformance = servers[k].perf > 0 ? 0 : 1;
                    if(servers[k].perf>0){
                        servers[k].cardfee = empper[k].total.cardfee;
                        servers[k].cashfee = empper[k].total.cashfee;
                        servers[k].otherfee = empper[k].total.otherfee;
                        if(!servers[k].per){
                            servers[k].per = this.getManualPer(servers[k],servers);
                        }
                    }else {
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
					perfDetail.voidFee = items[i].salePrice*opt.rate;
                    servers[k].perfDetail = perfDetail;
                }
            }

            if (billOption.expenseCategory == 0) {
                billOption.billingInfo.eaFee = toFloat(eaFee);
                if(Math.abs(billOption.billingInfo.eaFee - billOption.billingInfo.total)<1){
                    //如果数值接近，认为相等，抹掉误差
                    billOption.billingInfo.eaFee = billOption.billingInfo.total;
                }
            }
        },
        getManualPer: function(server,servers){
            var total = 0;
            for(var i=0;i<servers.length;i++){
                if(servers[i].dutytypecode==server.dutytypecode){
                    total += servers[i].perf*1;
                }
            }
            return Math.round((server.perf/total)*100*100)/100;
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
        computePerSetPerf: function (type) {
            //项目不算
            var isRepeat = this.opt.prodOption && this.opt.option;
            var expenseCategory = isRepeat?this.opt.prodOption.expenseCategory:this.opt.option.expenseCategory;
            if (expenseCategory) {
                var billingInfo = isRepeat?this.opt.prodOption.billingInfo:this.opt.option.billingInfo;
                var t = billingInfo.total - billingInfo.debtFee;
                if(expenseCategory === 4){
                    if(am.metadata.configs.combNotCalIntoAchiev!='true'){
                        t += this.opt.option.cost || 0;
                    }
                }
                var servers;
                if (expenseCategory === 1) {
                    var currentOption = isRepeat?this.opt.prodOption.products:this.opt.option.products;
                    servers = currentOption.servers;
                } else if (expenseCategory === 2) {
                    servers = this.opt.option.card.servers;
                } else if (expenseCategory === 3) {
                    servers = this.opt.option.card.servers;
                } else if (expenseCategory === 4) {
                    servers = this.opt.option.comboCard.servers;
                }
                if (servers && servers.length) {
                    var payDetail = JSON.parse(JSON.stringify(billingInfo));
                    if(this.opt.member && !this.opt.member.allowPresentfeeDiscount && this.opt.member.discount && expenseCategory!=4){
                        if(payDetail.presentFee){
                            if(this.$payTypes.filter(".selected").hasClass("pay_bonus")){
                                payDetail.presentFee = billingInfo.total-billingInfo.treatfee-billingInfo.treatpresentfee-billingInfo.luckymoney-billingInfo.mallOrderFee-billingInfo.weixin-billingInfo.pay;
                            }else {
                                payDetail.presentFee = payDetail.presentFee*(this.opt.member.discount/10);
                            }
                        }
                    }
                    if(expenseCategory==4 && this.opt.option.comboCard.costDetail){
                        for(var key in payDetail){
                            for(key2 in this.opt.option.comboCard.costDetail){
                                if(key==key2){
                                    if(am.metadata.configs.combNotCalIntoAchiev!='true'){
                                        payDetail[key] = payDetail[key] + this.opt.option.comboCard.costDetail[key];
                                    }
                                }
                            }
                        }
					}
					// 判断是否开启新业绩模式，若开启走新逻辑
					// if (amGloble.metadata.enabledNewPerfModel == 1) {
					// 	for(var i = 0; i < servers.length; i++) {
					// 		servers[i].automaticPerformance = servers[i].perf > 0 ? 0 : 1;
					// 	}
					// 	return;
					// }
                    var payMoneyCategoryPctObj = this.getPayMoneyCategoryPctObj({total: t, payDetail: payDetail});
                    var payFeePctObj = this.getPayFeePctObj({total: t, payDetail: payDetail, isNotProject: true});
                    var rate = amGloble.metadata.configs.debtFlag*1?(1 - billingInfo.debtFee/billingInfo.total):1;
                    for (var i = 0; i < servers.length; i++) {
						// 判断是否手动修改业绩
						servers[i].automaticPerformance = servers[i].perf > 0 ? 0 : 1;
                        if(!servers[i].perf){
                            var perf;
                            perf = servers[i].perf = toFloat(t * servers[i].per / 100);
                            if ([1, 4].indexOf(expenseCategory) >= 0) {
                                servers[i].cardfee = perf * payMoneyCategoryPctObj['card'];
                                servers[i].cashfee = perf * payMoneyCategoryPctObj['cash'];
                                servers[i].otherfee = perf * payMoneyCategoryPctObj['other'];
                            }
                        }else{
                            // if(expenseCategory === 4 && am.metadata.configs.combNotCalIntoAchiev!='true'){
                            //     servers[i].perf *= t / (billingInfo.total+(this.opt.option.cost || 0));
                            // }else {
                            //     servers[i].perf *= (t-(this.opt.option.cost || 0)) / billingInfo.total;
                            // }
                            var per = Math.round(10000/servers.length)/100;
                            var perf = toFloat((this.needPay || 0)*per/100);
                            if(servers[i].perf==perf){
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
                var debtFlag = amGloble.metadata.configs.debtFlag*1;
                if(debtFlag){
                    billingInfo.eaFee = billingInfo.total - billingInfo.debtFee;
                }
            }
        },
        // 获取每种支付方式的金额占比，以及相应业绩字段
        getPayFeePctObj: function(params) {
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
                "onlineCreditPay":"onlineCreditPay",
                "offlineCreditPay":"offlineCreditPay",
                "mallOrderFee":"mallorderfee",
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
				am.metadata.payConfigs.forEach(function(item){
                    var payKey = item.field.toLowerCase();
                    var empperBaseFeePct = item.empper / 100; // 员工支付方式的基准业绩占比
                    empperBaseFeeConfig[payKey] = empperBaseFeePct;
                });
				for(var i in payTypeMaps) {
					if (isNotProject && i === 'debtFee') continue;
					var payKey = payTypeMaps[i];
					var baseFeePct = empperBaseFeeConfig[payKey];
					if (baseFeePct === undefined) baseFeePct = 1;
					var currentPayVal = payDetail[i];
					if (currentPayVal > 0) {
						var currentFee =  currentPayVal * baseFeePct;
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
        getPayMoneyCategoryPctObj:function(params) {
            var payDetail = params.payDetail;
            var total = params.total;
            var payMoneyCategoryObj = this.getPayMoneyCategoryObj(params);
            var payMoneyCategoryPctObj = {};
            for(var i in payMoneyCategoryObj) {
                var currentMoney = payMoneyCategoryObj[i];
                payMoneyCategoryPctObj[i] = currentMoney / total;
            }
            return payMoneyCategoryPctObj;
        },
        getPayMoneyCategoryObj:function(params) {
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
        keyboardCtrl:function(keyCode){ 
            var _this=this;
            var ctrl = window.keyboardCtrl;
            if(document.activeElement && $(document.activeElement).hasClass('input_no')){

            }else{
                if($('.payDetail').is(':visible') || $('#common_addremark').is(':visible') 
                    || $('#maskBoard').is(':visible') || $('.nativeUIWidget-showPopupMenu').is(':visible') 
                    || $('#setMutiPerf').is(':visible') || $("#phoneCodeModal").is(':visible') ){
                    return;
                }
                var num = ctrl.getNum(keyCode);
                if(typeof(num) === 'number'){
                    var keyCodeEq = null;
                    if($("#maskBoard").is(":visible")){
                        return;
                    }

                    if(keyCode >= 97 && keyCode <= 103) {
                        keyCodeEq = 97;
                    }else if(keyCode >= 49 && keyCode <= 55) {
                        keyCodeEq = 49;
                    }
                    
                    //判断重复选择return
                    if($("#page_pay .payTypes li").eq(keyCode-keyCodeEq).hasClass('am-disabled')) {
                        return;
                    }else {
                        $("#page_pay .payTypes li").eq(keyCode-keyCodeEq).trigger('vclick');
                    }

                }else if(keyCode == 13) {
                    if($("#maskBoard").is(":visible") || $('#commentService').is(':visible') ){
                        return;
                    }else if($('#payConfirm').is(':visible') ) {
                        //点击评价成功后,点击回车键让评价成功后的弹窗消失
                        $('#payConfirm').trigger('vclick');
                        sessionStorage.cardPreventKeyB = 'prevent';
                        return;
                    }
                
                    //结算
					var nowTime = new Date().getTime();
                        this.submitArr.push(nowTime);
                    
                    var num = this.compareTime(this.submitArr[0], nowTime);
                        console.log(num, this.submitArr);
                    if(num >= 0.3) {
                        if(this.submitArr.length >= 2) {
                            this.submitArr = [];
                            var config = am.metadata.userInfo.operatestr.indexOf('a39') > -1 ? 1 : 0;
                            if (!config) {
                                // 0 允许结算  1允许结算
                                $("#page_pay .submit").trigger('vclick');
                            }
                            // $("#page_pay .submit").trigger('vclick');

                        }else {}
                    }else {}
                }else if(keyCode == 107 && !$('#commentService').is(':visible')) {
                    // +号键 蓝牙打印
                    $("#page_pay .print").trigger('vclick');
                }else if(keyCode === 111) {+
					this.backButtonOnclick();
				}else if(keyCode === 109 && $('#commentService').is(':visible')) {
                    // -号键 不想评价
                    $('.cancel_comment').trigger('vclick');
                }
            }
        },
        autoSettleFun : function(params) {

            if(navigator.connection && navigator.connection.type == 'none') {
                //断网提示
                var gotoHangup = function () {
                    $.am.changePage(am.page.hangup,"",{openbill:1,setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
                };
                am.confirm('网络断开','由于网络断开，无法进行后续操作！','知道了','返回', gotoHangup, gotoHangup);
                return;
            }

            //自动结算函数
            var _this = this,
                payType = params.payType ? params.payType : null, //支付方式有可能没有
                payMoney = params.payMoney,
                comment = params.comment ? JSON.parse(params.comment) : false;

            //是否选择有红包
            if(payMoney.luckMoneyIds && payMoney.luckMoneyIds.length > 0) {
                $('#page_pay .left .luckymoney').trigger('vclick');

                $.each(payMoney.luckMoneyIds, function(iLuck_i, iLuck_item) {
                    $.each($('#page_pay .luckyMoneyList li'), function(i, item) {
                        var data = $(item).data('data');
                        if( data.id == payMoney.luckMoneyIds[iLuck_i]) {
                            console.log(payMoney.luckMoneyIds[iLuck_i]);
                            $(item).trigger('vclick');
                        }else {}
                    })
                })
                $('#page_pay #luckyMoneyDetail .sureBtn').trigger('vclick');

            }else {}
            
            if(payType) {
                $('li.'+payType).trigger('vclick');
               
                if(payType == 'pay_mix') {
                    //混合支付

                    for(var i in payMoney) {
                        $('.payDetail:visible input[name=' + i + ']').val(payMoney[i]);
                    }

                }else {

                    if(params.billNo){
                        try{
                            $('.billno input').trigger('vclick');
                            var time1 = setTimeout(function() {
                                clearTimeout(time1);
                                $('##maskBoard').trigger('vclick');
                            }, 2000);
                            $('#maskBoard .input_value input').val(params.billNo);
                            
                            $('#maskBoard .btnOk').trigger('vclick');

                        }catch(er){
                            throw('没有权限修改单号！');
                        }
                    }else {
                        console.info('不需要手动设置单号 ');
                    }

                    var billCode = $('#page_pay .billno').find('input').val();
                        params.billCode = billCode?billCode : "非项目在结算前获取不到单号";  

                    // 设置 计客次
                    if(params.memberCount == false){
                        try {
                            $('.memberCount').click();
                        } catch (error) {
                            throw ' 基础系统中没有开启 结算时开启计客次的权限'
                        }
                    }
                }
            }

            // 结算
            var time2 = setTimeout(function(){
                clearInterval(time2);
                $('#page_pay .submit.keypadPC').trigger('vclick');

                var time3 = setTimeout(function(){
                    clearInterval(time3);
                    //签名
                    var sign = $('#signname').is(':visible') ? true : false;
                    if(sign) {
                        $('#signname .btns .cancel').trigger('vclick');   
                    } else {
                        console.info('不需要签名')
                    };

                    var time4 = setTimeout(function(){
                        clearInterval(time4);
                        if(comment) {
                            var commentService = $('#commentService');
                                commentService.find('.settlementComment').show();

                            //顾客评价内容
                            if(comment.feedbackComment) {
                                //以__截取成数组 获得内容和标签
                                var feedbackComment = comment.feedbackComment.split('__');

                                    _this.opt.feedbackComment = {};

                                //feedbackComment[0] 为评论内容
                                if(feedbackComment[0] != "") {
                                    _this.opt.feedbackComment.content = feedbackComment[0];
                                    commentService.find('.settlementComment .commentP').text(feedbackComment[0]);
                                }else {}

                                //feedbackComment[0] 为评论标签
                                if(feedbackComment.length > 1) {
                                    var labelArr = [],
                                        labelS = commentService.find('.settlementComment .labelS');
                                        labelS.empty();
                                    // i = 1 过滤掉下标为零数据这条数据
                                    for(var i = 1; i < feedbackComment.length; i++){
                                        labelArr.push(feedbackComment[i]);
                                        labelS.append('<span>' + feedbackComment[i] + '</span>');
                                    }
                                    _this.opt.feedbackComment.label = labelArr.join(',');
                                }else {}

                            }else {}

                            //点评部分
                            if(comment.overallScore == 'false') {
                                //不点评
                                $('.cancel_comment').trigger('vclick');
                            }else {
                                $('#commentService .comment_val .val').eq(comment.overallScore).trigger('vclick');
                            }
                            

                        }else {
                            $('.cancel_comment').trigger('vclick');
                        }
                        
                        var time5 = setTimeout(function(){
                            clearInterval(time5);
                            $('#payConfirm').trigger('vclick');
                        }, 2000);

                    }, 2000);

                }, 2000);

            },1500);

            //测试验证结算数据
            // var goPay = function () {
            //     // 结算
            //     var time2 = setTimeout(function(){
            //         clearInterval(time2);
            //         $('#page_pay .submit.keypadPC').trigger('vclick');

            //         var time3 = setTimeout(function(){
            //             clearInterval(time3);
            //             //签名
            //             var sign = $('#signname').is(':visible') ? true : false;
            //             if(sign) {
            //                 $('#signname .btns .cancel').trigger('vclick');   
            //             } else {
            //                 console.info('不需要签名')
            //             };

            //             var time4 = setTimeout(function(){
            //                 clearInterval(time4);
            //                 if(comment) {
            //                     var commentService = $('#commentService');
            //                         commentService.find('.settlementComment').show();

            //                     //顾客评价内容
            //                     if(comment.feedbackComment) {
            //                         //以__截取成数组 获得内容和标签
            //                         var feedbackComment = comment.feedbackComment.split('__');

            //                             _this.opt.feedbackComment = {};

            //                         //feedbackComment[0] 为评论内容
            //                         if(feedbackComment[0] != "") {
            //                             _this.opt.feedbackComment.content = feedbackComment[0];
            //                             commentService.find('.settlementComment .commentP').text(feedbackComment[0]);
            //                         }else {}

            //                         //feedbackComment[0] 为评论标签
            //                         if(feedbackComment.length > 1) {
            //                             var labelArr = [],
            //                                 labelS = commentService.find('.settlementComment .labelS');
            //                                 labelS.empty();
            //                             // i = 1 过滤掉下标为零数据这条数据
            //                             for(var i = 1; i < feedbackComment.length; i++){
            //                                 labelArr.push(feedbackComment[i]);
            //                                 labelS.append('<span>' + feedbackComment[i] + '</span>');
            //                             }
            //                             _this.opt.feedbackComment.label = labelArr.join(',');
            //                         }else {}

            //                     }else {}

            //                     //点评部分
            //                     if(comment.overallScore == 'false') {
            //                         //不点评
            //                         $('.cancel_comment').trigger('vclick');
            //                     }else {
            //                         $('#commentService .comment_val .val').eq(comment.overallScore).trigger('vclick');
            //                     }
                                

            //                 }else {
            //                     $('.cancel_comment').trigger('vclick');
            //                 }
                            
            //                 var time5 = setTimeout(function(){
            //                     clearInterval(time5);
            //                     $('#payConfirm').trigger('vclick');
            //                 }, 2000);

            //             }, 2000);

            //         }, 2000);

            //     },1500);
            // };
            // var goBack = function () {
            //     location.reload();
            // }
            // am.confirm('方便测试验证结算数据', JSON.stringify(params),'继续', '返回', goPay, goBack);   
        },

    });
})();

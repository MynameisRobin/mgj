(function(){
    var self = am.page.itemPay = new $.am.Page({
        id: 'page_itemPay',
        backButtonOnclick: function(){
            var _this = this;
            if (this.paytool[this.paytool.type] && this.paytool[this.paytool.type].$.is(":visible")) {
                this.paytool.hide();
            }else {
                if (this.onlineData && this.onlineData.length) {
                    atMobile.nativeUIWidget.confirm({
                        caption: "用户已支付",
                        description: "用户已在线支付成功,返回后此支付流水将无法关联，确认要返回吗？",
                        okCaption: "继续完成支付",
                        cancelCaption: "仍返回"
                    }, function () {
                        
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
        init: function(){
            var _this = this;

            // 券的列表区域
            this.$ticketsList=this.$.find('.tickets-list')
            // kb
            this.$listKbBox=this.$ticketsList.find('.kb-box').on('vclick','.item-li',function(){
                var data=$(this).data('data');
                $(this).find('svg').attr('class','icon svg-icon selected');
                if(_this.koubeiData && _this.koubeiData.id!=data.id){
                    atMobile.nativeUIWidget.confirm({
                        caption: '只能使用一个口碑券',
                        description: '更换口碑券将清除之前口碑券的价格配置，是否继续？',
                        okCaption: '继续',
                        cancelCaption: '取消'
                    }, function(){
                        _this.setPayItem('KOUBEI',data);
                    }, function(){

                    });
                }else {
                    _this.setPayItem('KOUBEI',data);
                }
                _this.paytool.hide();
            });
            this.$ticketKbScrollView = new $.am.ScrollView({ //券滚动
				$wrap: _this.$listKbBox,
				$inner: _this.$listKbBox.find('.kb-ul'),
				direction: [false, true],
				hasInput: false,
            });
            // dp
            this.$listDpBox=this.$ticketsList.find('.dp-box').on('vclick','.item-li',function(){
                var data=$(this).data('data')
                if(_this.dianpinData && _this.dianpinData.id!=data.id){
                    atMobile.nativeUIWidget.confirm({
                        caption: '只能使用一个点评券',
                        description: '更换点评券将清除之前点评券的价格配置，是否继续？',
                        okCaption: '继续',
                        cancelCaption: '取消'
                    }, function(){
                        _this.setPayItem('DIANPIN',data);
                    }, function(){

                    });
                }else {
                    _this.setPayItem('DIANPIN',data);
                }
                _this.paytool.hide();
            });
            this.$ticketDpScrollView = new $.am.ScrollView({ //券滚动
				$wrap: _this.$listDpBox,
				$inner: _this.$listDpBox.find('.dp-ul'),
				direction: [false, true],
				hasInput: false,
            });

            //修改单号
            this.$billNo = this.$header.find(".billno input").on("vclick",function(){
                if(am.metadata.shopPropertyField.manualInputBillno != 1 && am.metadata.shopPropertyField.mgjBillingType==1 && am.operateArr.indexOf('a37')==-1){
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
						// 只有项目才校验单号重复
						if (_this.opt.option.expenseCategory == 0) {
							_this.checkBillNo(value);
							return false;
						}
						$this.val(value.substring(0, 20));
					}
				});
            });

            //打印
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

            this.$.find('.print').vclick(function () {//绑定点击打印按钮事件
                if(!_this.checkItemPayed()){
                    return;
                }
                _this.print();
            });

            //计客次
            this.$memberCount = this.$.find(".memberCount").vclick(function () {
                var $this = $(this);
                if ($this.hasClass("checked")) {
                    $this.removeClass("checked");
                } else {
                    $this.addClass("checked");
                }
            });

            //结算签字
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

            //自动打印小票
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

            //不发送短信和微信
            this.$smsSendFlag = this.$.find(".smsSendFlag").vclick(function () {
                var $this = $(this);
                if ($this.hasClass("checked")) {
                    $this.removeClass("checked");
                } else {
                    $this.addClass("checked");
                }
            });

            //备注
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
            this.$customerSource = this.$.find('.customerSource').vclick(function(){
                var $this = $(this);
                var mgjsourceid = _this.opt.option.mgjsourceid
				am.sourceModal.show({
					mgjsourceid: mgjsourceid,
					sourceSave: function (data) {                       
                        $this.text(data.mgjsourcename)
                        if(_this.opt.servOption && _this.opt.prodOption){
                            _this.opt.servOption.mgjsourceid = data.mgjsourceid;
                        }else{
                            _this.opt.option.mgjsourceid = data.mgjsourceid;
                        }                        
					}
				})
            })
            this.$container = this.$.find('.container');
            this.$footer = this.$.find('.footer');
            this.$listContainer = this.$container.find('.listContainer');
            this.$listWrapper = this.$container.find('.listWrapper');
            this.$summaryWrapper = this.$container.find('.summaryWrapper');
            this.$summary = this.$summaryWrapper.find('.detail');
            this.$summaryItem = this.$summary.find('.item').remove();
            this.$listItem = this.$listWrapper.find('.item');
            this.$listItemDetail = this.$listItem.find('.details');
            this.$payInfoWrapper = this.$listItem.find('.payInfos');
            this.$payInfoItem = this.$payInfoWrapper.find('.payInfo');
            this.$payTypes = this.$listItem.find('.payTypes');

            this.$mallIntro = $('<p class="note"><span></span><span>-￥</span><span></span></p>');
            this.$prepayIntro = $('<p class="note"><span></span><span></span><span class="pay">关联收款</span></p>');
            this.$pointIntro = $('<p class="note point"><span>积分&nbsp;&nbsp;</span><span>111</span><span>&nbsp;&nbsp;可抵现&nbsp;&nbsp;</span><span>222</span></p>');
            this.$remainIntro = $('<p class="note remainWrap"><span class="remain"></span></p>');

            this.$prePayTarget = this.$.find('.prePayTarget');

            this.listScroll = new $.am.ScrollView({
                $wrap : this.$listWrapper,
                $inner : this.$listWrapper.find('.list'),
                direction : [0, 1],
                hasInput: false
            });

            this.summaryScroll = new $.am.ScrollView({
                $wrap : this.$summaryWrapper.find('.detail'),
                $inner : this.$summaryWrapper.find('.detailInner'),
                direction : [0, 1],
                hasInput: false
            });

            var payType = {};
            var _payTypeList = this.$payTypes.find('.payItem');
            for(var i=0;i<_payTypeList.length;i++){
                payType[$(_payTypeList[i]).data('type')] = $(_payTypeList[i]).text();
            }
            payType['PREPAY'] = '收款';
            this.payType = payType;

            this.$payTypes.remove();
            this.$payInfoItem.remove();
            this.$listItem.remove();

            this.paytool.init();

            this.payTips = am.page.pay.payTips;
            this.payTips.init();

			this.$confirm = $('#itemPayConfirm');
            $('#itemPayConfirm .goBack').vclick(function () {
                _this.paySuccess();
            });

            this.$.on('vclick','.payItem',function(){
                if($(this).hasClass('noJdSetting')){
                    return am.msg('没有配置京东支付的支付方式，请前往 基础系统>基础设置>自定义配置>自定义付款方式 进行配置');
                }
                if($(this).hasClass('disabled')){
                    return;
                }
                var type = $(this).data('type');
                if(type){
                    _this.editIndex = $(this).parents('.item').index();
                    _this.currentType = type;
                    var siblings = $(this).parents('.payTypes').prev('.payInfos').find('.payInfo');
                    var isExsit = false;
                    if(siblings.length){
                        for(var i=0;i<siblings.length;i++){
                            if($(siblings[i]).data('type')==type){
                                isExsit = true;
                                break;
                            }
                        }
                    }
                    if(isExsit){
                        am.msg('此支付方式已添加');
                    }else {
                        _this.payItem(type);
                    }
                }
            }).on('vclick','.addPayType',function(){
                $(this).parent().find('.payTypes').show();
                _this.editIndex = $(this).parents('.item').index();
                _this.display();
                _this.setPayTypeScroll($(this).parent().find('.payTypes'));
                _this.setHeight();
            }).on('vclick','.payInfos .del',function(){
                var type = $(this).parents('.payInfo').data('type');
                var data = $(this).parents('.payInfo').data('data');
                if(data){
                    if(type=='REDPAPER'){
                        _this.delPaper($(this).parents('.payInfo'))
                    }else if(type=='MALLORDER' || type=='DIANPIN' || type=='KOUBEI') {
                        _this.delItem(type,$(this).parents('.payInfo'))
                    }else if(type=='WEIXIN' || type=='PAY' || type=='UNIONPAY' || type=='JINGDONG'){
                        _this.delItem(['WEIXIN','PAY','UNIONPAY'],$(this).parents('.payInfo'))
                    }
                }
                _this.reCalPrice($(this));
                _this.editIndex = $(this).parents('.item').index();
                $(this).parent().remove();
                _this.display();
                _this.change();
                _this.setHeight();
            }).on('vclick','.payTypes .del',function(){
                _this.editIndex = $(this).parents('.item').index();
                $(this).parent().hide();
                _this.display();
                _this.setHeight();
            }).on('vclick','.noteWrap',function(){
                var type = $(this).parents('.payInfo').data('type');
                var data = $(this).parents('.payIntro').data('data');
                _this.editIndex = $(this).parents('.item').index();
                if(type=='WEIXIN' || type=='PAY' || type=='UNIONPAY' || type=='JINGDONG'){
                    _this.currentType = type;
                    if(_this.prepayData && $(this).find('.pay').length && !((_this.prepayData.type==1 && type=='PAY') || (_this.prepayData.type==2 && type=='WEIXIN') || (_this.prepayData.type==4 && type=='UNIONPAY') || (_this.prepayData.type==5 && type=='JINGDONG'))){
                        _this.setPayItem(type,_this.prepayData);
                    }else {
                        _this.paytool.prePay.show(undefined, _this.opt.option.expenseCategory);
                    }
                }else if(type=='KOUBEI'){
                    if(_this.koubeiData && $(this).find('.pay').length){
                        _this.setPayItem(type,_this.koubeiData);
                    }else {
                        _this.paytool.show('kb');
                        _this.getTicketsList('getkoubeiFlow',function (data) {
                            console.log('渲染口碑列表数据',data);
                            _this.renderTicketsList(data,'kb');
                        });
                    }
                }else if(type=='DIANPIN'){
                    if(_this.dianpinData && $(this).find('.pay').length){
                        _this.setPayItem(type,_this.dianpinData);
                    }else {
                        _this.paytool.show('dp');
                        _this.getTicketsList('getdianpingFlow',function (data) {
                            console.log('渲染点评列表数据');
                            _this.renderTicketsList(data);
                        });
                    }
                }else {
                    _this.payItem(type,1);
                }
            }).on('vclick','.payMoney',function(){
                if($(this).parents('.details').hasClass('comboitem')){
                    return;
                }
                _this.editIndex = $(this).parents('.item').index();
                var $this = $(this);
                var $item = $(this).parents('.item');
                var $payInfo = $(this).parents('.payInfo');
                var type = $payInfo.data('type');
                _this.currentType = type;
                var item= $payInfo.data('data');
                var member = _this.opt.member;
                var noDiscount = $item.find('.payTypes .'+type).hasClass('noDiscount') && member;
                var redpaperDiscount = _this.getItemPaperDiscount($item);
                if(type=='REDPAPER'){
                    var paperInfo = _this.getPaperInfo(item);
                    if(!paperInfo.money){
                        return am.msg('折扣红包已打折');
                    }
                }
                am.keyboard.show({
                    title:"请输入金额",//可不传
                    hidedot:false,//是否隐藏点
                    submit:function(value){
                        value = Math.round(value*100)/100;
                        var restMoney = _this.getItemRestMoney($item,$payInfo);
                        if(value>restMoney){
                            value = restMoney;
                        }
                        var remain = 0;
                        if(type=='REDPAPER'){
                            for(var i=0;i<item.length;i++){
                                if(item[i].money && _this.paperData[item[i].id] && _this.paperData[item[i].id].usedMoney){
                                    _this.paperData[item[i].id].usedMoney -= item[i].usedMoney || 0;
                                }
                            }
                            var usedMoney = 0;
                            usedMoney = _this.getUsedPaperMoney(item);
                            var money = paperInfo.money - usedMoney;
                            if(value>money){
                                am.msg('超出最大可用金额，已自动调整');
                                value = money;
                            }
                            remain = money - value;
                            _this.setPaperPayInfo($payInfo,item,value);
                        }
                        if(type=='MALLORDER'){
                            var usedMoney = _this.getUsedMoney($item,item,[type]);
                            var money = item.realmoney - usedMoney;
                            if(value>money){
                                am.msg('超出最大可用金额，已自动调整');
                                value = money;
                            }
                            remain = money - value;
                        }
                        if(type=='CARDFEE'){
                            var usedMoney = _this.getUsedCardFee($item,[type]);
                            var cash = 0;
                            if(member.combinedUseFlag==1){
                                cash = member.balance + member.gift;
                            }else {
                                cash = member.balance;
                            }
                            var money = cash - usedMoney;
                            if(value>money){
                                am.msg('超出最大可用金额，已自动调整');
                                value = money;
                            }
                        }
                        if(type=='PRESENTFEE'){
                            var usedMoney = _this.getUsedCardFee($item,[type]);
                            var money = member.gift - usedMoney;
                            if(value>money){
                                am.msg('超出最大可用金额，已自动调整');
                                value = money;
                            }
                        }
                        if(type=='WEIXIN' || type=='PAY' || type=='UNIONPAY' || type=='JINGDONG'){
                            if(item){
                                var usedMoney = _this.getUsedMoney($item,item,['WEIXIN','PAY','UNIONPAY','JINGDONG']);
                                var prepayList = $payInfo.siblings();
                                var prepayType = _this.currentType;
                                if(prepayList.length){
                                    for(var i=0;i<prepayList.length;i++){
                                        if($(prepayList[i]).data('related'+prepayType)){
                                            usedMoney += $(prepayList[i]).data('related'+prepayType)*1;
                                            break;
                                        }
                                    }
                                }
                                var money = _this.getPrePayPrice(item) - usedMoney;
                                if(_this.prepayData){
                                    if(value<=money){
                                        $payInfo.data('related'+type,value);
                                    }else {
                                        $payInfo.data('related'+type,money);
                                    }
                                }
                                remain = money - value;
                            }
                        }
                        if(type=='DIANPIN'){
                            if(item){
                                var usedMoney = _this.getUsedMoney($item,item,[type]);
                                var money = item.marketprice - usedMoney;
                                if(value>money){
                                    am.msg('超出最大可用金额，已自动调整');
                                    value = money;
                                }
                                remain = money - value;
                            }
                        }
                        if(type=='KOUBEI'){
                            if(item){
                                var usedMoney = _this.getUsedMoney($item,item,[type]);
                                var money = item.originalprice - usedMoney;
                                if(value>money){
                                    am.msg('超出最大可用金额，已自动调整');
                                    value = money;
                                }
                                remain = money - value;
                            }
                        }
                        if(type=='ONLINECREDITPAY'){
                            var usedMoney = _this.getUsedCardFee($item,[type]);
                            var worth = Math.round((member.onlineCredit / am.metadata.configs.onlineCreditPay) * 100) / 100;
                            var money = worth - usedMoney;
                            if(value>money){
                                am.msg('超出最大抵扣可用金额，已自动调整');
                                value = money;
                            }
                        }if(type=='OFFLINECREDITPAY'){
                            var usedMoney = _this.getUsedCardFee($item,[type]);
                            var worth = Math.round((member.points / am.metadata.configs.offlineCreditPay) * 100) / 100;
                            var money = worth - usedMoney;
                            if(value>money){
                                am.msg('超出最大抵扣可用金额，已自动调整');
                                value = money;
                            }
                        }
                        $this.text(Math.round(value*100)/100);
                        if(noDiscount){
                            var data = $payInfo.data('detail');
                            var itemData = $item.data('data');

                            var discount = itemData.modifyedDiscount?itemData.modifyedDiscount*10:(itemData.id?member.discount:member.buydiscount);
                            if(redpaperDiscount){
                                discount = redpaperDiscount;
                            }
                            var moreMoney = value*(10-discount)/10;

                            itemData.salePrice -= data.moreMoney/(itemData.number || 1) || 0;
                            _this.opt.option.billingInfo.total -= data.moreMoney || 0;
                            if(_this.opt.servOption && itemData.id){
                                _this.opt.servOption.billingInfo.total -= data.moreMoney || 0;
                            }
                            if(_this.opt.prodOption && itemData.productid){
                                _this.opt.prodOption.billingInfo.total -= data.moreMoney || 0;
                            }
                            _this.onPriceChange($item,moreMoney);
                        }
                        var payDetail = {
                            price: value,
                            moreMoney: moreMoney || 0
                        }
                        if(type=='DIANPIN' && item){
                            payDetail.voucherFee = Math.round((item.marketprice - item.price)*(value/item.marketprice)*1000)/1000;
                        }
                        if(type=='KOUBEI' && item){
                            payDetail.voucherFee = Math.round((item.originalprice - item.price*1)*(value/item.originalprice)*1000)/1000;
                        }
                        if($payInfo.data('detail').beforeRedPaperDiscount){
                            payDetail.beforeRedPaperDiscount = $payInfo.data('detail').beforeRedPaperDiscount;
                        }
                        $payInfo.data('detail',payDetail);
                        if(item){
                            if(type=='REDPAPER'){
                                _this.setPaperRemain();
                            }
                            if(type=='MALLORDER' || type=='DIANPIN' || type=='KOUBEI'){
                                _this.setRemain([type],remain);
                            }
                            if(type=='WEIXIN' || type=='PAY' || type=='UNIONPAY' || type=='JINGDONG'){
                                _this.setRemain(['WEIXIN','PAY','UNIONPAY','JINGDONG'],remain);
                            }
                        }
                        _this.change();
                        _this.display();
                    },
                    cancel:function(){

                    }
                });
            })

            this.$submit = this.$.find('.footer .submit').vclick(function(){
                if(!_this.checkItemPayed()){
                    return;
                }
                if(!_this.checkCardLimit()){
                    return;
                }
                if(!_this.checkCouponRelated('DIANPIN',_this.dianpinData)){
                    return;
                }
                if(!_this.checkCouponRelated('KOUBEI',_this.koubeiData)){
                    return;
                }
                if(!_this.opt.member){
                    _this.submit();
                }else {
                    if(_this.opt.member.passwdNewSet){
                        _this.submit();
                    }else {
                       //校验密码和打印一样需要参数
						_this.submit(0,1);
                    }
                }     
            });

            this.$summaryItem.on('vclick','.am-clickable',function(){
                var data = $(this).parents('.item').data('detail');
                _this.unPayedMondy = Math.round(data.price*100)/100;
                if(data.type=='WEIXIN'){
                    _this.paytool.show('wechat')
                }else if(data.type=='PAY'){
                    _this.paytool.show('alipay');
                }else if(data.type=='UNIONPAY'){
                    _this.paytool.show('pos');
                }else if(data.type=='JINGDONG'){
                    _this.paytool.show('jd');
                }
            });
            
            //送红包
            this.$luckyMoneyWrap = $('#page_itemPay #itemLuckyMoneyDetail .luckyMoney');
            this.$luckyMoneyWrap.on('vclick','.sendBtn',function(){
                am.sendRedPocketsDialog.show({
					member:_this.opt.member,
					scb:function(){
                        _this.$luckyMoneyRefresh.trigger('vclick');
					}
				 });
            });
            
            this.$luckyMoneyRefresh = this.$.find('.luckyMoneyRefresh').vclick(function(){
                _this.paytool.luckyMoney.redPackageArr = [];
                _this.paytool.luckyMoney.ajax();
            });

            $.am.on('instoreServiceHasBeenChanged',function(data){
				if($.am.getActivePage() == self){
                    if(_this.opt && _this.opt.option && _this.opt.option.instoreServiceId == data.instoreServiceId){
                        am.billChangeToHangup();
                    }
				}
			});

        },
        beforeShow: function(paras){
            this.checkBillNoSuccess = true;
            this.$comment.removeClass("showleft");
            this.payDetail = null;

            if(paras.member){
                var member = paras.member;
                this.$customerSource.hide();
                this.$comment.addClass("showleft");
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
                if(member.buydiscount==0){
                    member.buydiscount = 10;
                }
            }else{
                if(paras.option&&paras.option.mgjsourceid){
                    this.$customerSource.text(paras.option.mgjsourcename)
                    delete paras.option.mgjsourcename;
                }else if(paras.option&&!paras.option.mgjsourceid){
                    this.$customerSource.text("");
                };
                this.$customerSource.show();
                if (paras.servOption&&paras.prodOption){
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
            if(window.location.protocol.indexOf('http')!=-1){
                this.$.find(".userPrintType").addClass('web').find('.printType').hide();
            }else {
                this.$.find(".userPrintType").removeClass('web').find('.printType').show();
			}

            if (paras == "back") {
                
            } else if (paras && paras.reset) {
                this.opt.member = paras.reset;
            } else {
                this.opt = paras;
                this.render();
                // //副屏支付结算详情
                if (this.opt.action == "recharge") {
                    return;
                }
                this.setMediaShow(paras);
			}
			// 是否启动结单强制覆盖单号
			if (am.metadata.shopPropertyField.manualInputBillno == 1) {
				this.$billNo.val('');
				if(this.opt.option) {
					this.opt.option.billNo = '';
				}
			}else{
				// 是否启动结单强制覆盖单号	
				if(paras && paras.option){
					this.$billNo.val(paras.option.billNo || "");
					
				}else if(paras && paras.billRemark){
					this.$billNo.val(paras.billRemark.serviceNO || "");
				}
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
        afterShow: function(){
            am.metadata.configs.onlineCreditPay = am.metadata.configs.onlineCreditPay == "0" ? "" : am.metadata.configs.onlineCreditPay;
            am.metadata.configs.offlineCreditPay = am.metadata.configs.offlineCreditPay == "0" ? "" : am.metadata.configs.offlineCreditPay;
            this.paybackFlag = false;//副屏显示关闭
            this.$submit.removeClass("am-disabled");
            var member = this.opt.member;
            if(member){
                this.paytool.luckyMoney.show(this.opt.member, this.opt.option.expenseCategory,1);
                this.paytool.mallOrder.show(this.opt.member, this.opt.option.expenseCategory,1);
            }
            this.paytool.prePay.show(undefined, this.opt.option.expenseCategory,1);

            this.checkCardAboutCurrentDay();
        },
        beforeHide: function(){
            this.getGainAndVoidFee();
        },
        afterHide: function(){
            this.billId='';// 将单号清空
            /*恢复初始副屏设置*/
            if (!this.paybackFlag) {
                var params = JSON.parse(JSON.stringify(am.metadata.configs));
                am.mediaShow(0, params);
            }
            try {
                am.signname.hide();
            }catch (e){
                
            }
            this.reset();
        },
        checkBillNo: function(billNo, cb){
            am.page.pay.checkBillNo.call(this, billNo, cb);
        },
        getPrintType: function(){
            am.page.pay.getPrintType();
		},
		paramsEdit: function(){
            return am.page.pay.paramsEdit.call(this);
        },
        print: function(isAutoPrint){
            am.page.pay.print.call(this,isAutoPrint);
        },
        kbDisplay: function(){
            var kbSetting = null;
            var payTypes = am.payConfigMap[this.opt.option.expenseCategory];
            for(var key in payTypes){
                if(payTypes[key].otherfeetype==3){
                    kbSetting = payTypes[key];
                    break;
                }
            }
            return kbSetting;
        },
        jdDisplay: function(){
            var jdSetting = null;
            var payTypes = am.payConfigMap[this.opt.option.expenseCategory];
            for(var key in payTypes){
                if(payTypes[key].otherfeetype==4){
                    jdSetting = payTypes[key];
                    break;
                }
            }
            if(jdSetting){
                this.key.JINGDONG = jdSetting.field.toLocaleLowerCase();
            }
            return jdSetting;
        },
        getOtherfee: function(){
            if(!this.$otherfee){
                var pc = am.metadata.payConfigs;
                var str = '';
                var kbSetting = this.kbDisplay();
                var jdSetting = this.jdDisplay();
                this.kbSetting = kbSetting;
                this.jdSetting = jdSetting;
                for(var i=0;i<pc.length;i++){
                    if(pc[i].status=="1" && pc[i].field.indexOf('OTHERFEE')!=-1 && (!kbSetting || pc[i].field!=kbSetting.field) && (!jdSetting || pc[i].field!=jdSetting.field)){
                        str += '<div data-type="' + pc[i].field.toLocaleUpperCase() +'" class="am-clickable payItem '+ pc[i].field.toLocaleUpperCase() +'">'+pc[i].fieldname+'</div>';
                        this.payType[pc[i].field] = pc[i].fieldname;
                    }
                }
                this.$otherfee = $(str);
                this.$payTypes.find('.payTypesInner').append($(str));
            }
        },
        getPayTypes: function(item){
            this.getOtherfee();
            var member = this.opt.member;
            var expenseCategory = this.opt.option.expenseCategory;
            var $payTypes =  this.$payTypes.clone(true,true);
            if(member && (expenseCategory==0 || expenseCategory==1)){
                var cash = 0;
                if(member.combinedUseFlag==1){
                    cash = member.balance + member.gift;
                    $payTypes.find('.PRESENTFEE').hide();
                }else {
                    cash = member.balance;
                }

                if (cash<=0) {
                    $payTypes.find('.CARDFEE').addClass('disabled');
                }

                if(member.balance<(member.minfee || 0)){
                    $payTypes.find('.CARDFEE').addClass('disabled');
                }
                // 判断该项目是否可以赠金支付
                var allowedPresent=1;
                var checekedCardInfo=am.metadata.cardTypeMap[member.cardTypeId];
                if(checekedCardInfo && checekedCardInfo.restricteditems){
                    var restricteditems = checekedCardInfo.restricteditems.split(',');
                    var restrictedtype = checekedCardInfo.restrictedtype;
                    if (restricteditems && restricteditems.indexOf(item.itemId) !== -1 && restrictedtype === 0) {
                        // 指定项目不可用 该项目包含指定项目
                        allowedPresent = 0;
                    } else if (restricteditems && restricteditems.indexOf(item.itemId) == -1 && restrictedtype === 1) {
                        // 指定项项目可用 但是该项目不在指定可用项目内
                        allowedPresent = 0;
                    } else {
                        // 未设置
                    }
                }
                if(allowedPresent){
                    if(member.gift<=0) {
                        $payTypes.find('.PRESENTFEE').addClass('disabled');
                    }
                }else{
                    $payTypes.find('.PRESENTFEE').addClass('disabled');
                    // 卡金赠金合并使用
                    if(member && member && member.combinedUseFlag == 1 && member.gift > 0){
                        $payTypes.find('.CARDFEE').addClass('disabled');
                    }
                }

                if(member.onlineCredit <= 0){
                    $payTypes.find('.ONLINECREDITPAY').addClass('disabled');
                }

                if(member.points <= 0){
                    $payTypes.find('.OFFLINECREDITPAY').addClass('disabled');
                }
                
            }else {
                $payTypes.find('.CARDFEE,.PRESENTFEE,.MALLORDER').remove();
                $payTypes.find('.REDPAPER,.CARDFEE,.PRESENTFEE,.ONLINECREDITPAY,.OFFLINECREDITPAY,.DEBTFEE').addClass('disabled');
            }
            if((expenseCategory==0 || expenseCategory==1) && item.id){

            }else {
                $payTypes.find('.DIANPIN,.KOUBEI').addClass('disabled');
            }

            if (am.isNull(am.metadata.configs.onlineCreditPay)) {
                $payTypes.find('.ONLINECREDITPAY').addClass('disabled');
            }
            if (am.isNull(am.metadata.configs.offlineCreditPay)) {
                $payTypes.find('.OFFLINECREDITPAY').addClass('disabled');
            }

            var configIndex = 0;
            if(item.productid){
                configIndex = 1;
            }
            $payTypes.find('.payItem').each(function() {
                var $this = $(this);
                var key = $this.attr('data-type');
                if(key=='REDPAPER' || key=='MALLORDER' || key=='KOUBEI' || key=='JINGDONG'){
                    return true;
                }
                if(key && !am.payConfigMap[configIndex][key]){
                    $this.remove();
                }else{
                    if((key!='CARDFEE' && key!='PRESENTFEE') || member){
                        if(member && member.combinedUseFlag==1 && key=='PRESENTFEE'){
                            $this.remove();
                        }
                    }else {
                        $this.remove();
                    }
                }
            });

            if(!this.kbDisplay()){
                $payTypes.find('.KOUBEI').remove();
            }
            if(!this.jdDisplay()){
                $payTypes.find('.JINGDONG').addClass('noJdSetting');
            }
            if(amGloble.metadata.configs.debtFlag*1){
                $payTypes.find('.DEBTFEE').remove();
            }
            //不打折配置
            if(member){
                var noDiscountSetting = this.getNoDiscountSetting(member.cardTypeId);
                $payTypes.find('.payItem').each(function(index){
                    var type = $(this).data('type');
                    if(type=='REDPAPER'){
                        type = 'LUCKYMONEY';
                    }
                    if(self.kbSetting && type=='KOUBEI'){
                        type = self.kbSetting.field;
                    }
                    if(self.jdSetting && type=='JINGDONG'){
                        type = self.jdSetting.field;
                    }
                    if(noDiscountSetting && noDiscountSetting.indexOf(','+type+',')!=-1){
                        $(this).addClass('noDiscount');
                    }
                });
            }else {
                $payTypes.find('.payItem').addClass('noDiscount');
            }
            if(am.metadata.configs.mgjOldFunctionEnable==1){
                $payTypes.find('.VOUCHERFEE').remove();
                $payTypes.find('.COOPERATION').remove();
                $payTypes.find('.MALL').remove();
            }
            return $payTypes;
        },
        getNoDiscountSetting:function(cardTypeId){
            var cardType = amGloble.metadata.cardTypeMap[cardTypeId];
            var setting = '';
            if(cardType && cardType.noDiscountSetting){
                setting = cardType.noDiscountSetting;
            }
            return setting;
        },
        render: function(){
            console.log(this.opt)
            if (this.opt.member && this.opt.member.memberInfo && this.opt.member.card) {
                //用户详情的数据格式与收银台的数据格式不一致，做转换
                this.opt.member = am.convertMemberDetailToSearch(this.opt.member);
            }
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
            var items = serviceItems.concat(products);
            if(items.length){
                for(var i=0;i<items.length;i++){
                    var item = items[i];
                    console.log(item);
                    var $item = this.$listItem.clone(true,true).data('data',item);
                    var salePrice = item.salePrice*(item.number || 1);
                    if(item.id){
                        if(item.modifyed || item.cardDiscount || item.timeDiscount){
                            if(item.salePrice>item.oPrice){
                                item.oPrice = item.salePrice;
                            }
                            item.modifyedDiscount = item.salePrice/item.oPrice;
                        }
                        $item.find('.info .itemName').text(item.itemName);
                        var originalPrice = 0;
                        var _item;
                        if(item.productid){
                            // 卖品
                            _item = am.metadata.categoryCodeMap[item.no];
                        }else{
                            _item = amGloble.metadata.serviceItemMap[item.id]
                        }
                        if(!(_item && _item.price*1)){
                            originalPrice = item.salePrice;
                        }else {
                            originalPrice = item.oPrice;
                        }
                        $item.find('.info .originPrice').text(Math.round(originalPrice*100)/100);
                        $item.find('.info .salePrice').text(Math.round(item.salePrice*100)/100);
                        var discountInfo = '';
                        if(originalPrice && item.salePrice && item.salePrice<originalPrice){
                            var discount = item.modifyedDiscount ? Math.round((item.salePrice/originalPrice)*100)/10 : this.opt.member.discount;
                            discountInfo = '全额折扣价 ￥'+(Math.round(item.salePrice*100)/100)+'('+discount+'折)';
                        }
                        $item.find('.info .discountInfo').text(discountInfo);
                    }else if(item.productid){
                        if(item.modifyed || item.cardDiscount){
                            if(item.salePrice>item.price){
                                item.price = item.salePrice;
                            }
                            item.modifyedDiscount = item.salePrice/item.price;
                        }
                        $item.find('.info .itemName').text(item.productName);
                        $item.find('.info .itemNum').text(item.number);
                        var originalPrice = 0;
                        var _item = amGloble.metadata.categoryItemMap[item.productid];
                        if(!(_item && _item.saleprice*1)){
                            originalPrice = item.salePrice*1;
                        }else {
                            originalPrice = item.price*1;
                        }
                        $item.find('.info .originPrice').text(Math.round(originalPrice*item.number*100)/100);
                        $item.find('.info .salePrice').text(Math.round(item.salePrice*item.number*100)/100);
                        var discountInfo = '';
                        if(originalPrice && item.salePrice && item.salePrice<originalPrice){
                            var discount = item.modifyedDiscount ? Math.round((item.salePrice/originalPrice)*100)/10 : this.opt.member.buydiscount;
                            discountInfo = '全额折扣价 ￥'+(Math.round(item.salePrice*item.number*100)/100)+'('+discount+'折)';
                        }
                        $item.find('.info .discountInfo').text(discountInfo);
                    }
                    if(salePrice){
                        var $payTypes = this.getPayTypes(item).addClass('disableDel');
                        $item.find('.details').append($payTypes);
                    }else {
                        $item.find('.details').find('.selectPayTip,.addPayType,.payTypes').remove().end().addClass('settled');
                        var $payInfoItem = this.$payInfoItem.clone(true,true);
                        $payInfoItem.find('.payName').text('');
                        $payInfoItem.find('.payMoney,.del,.payIntro').remove();
                        $item.find('.payInfos').append($payInfoItem);
                    }
                    this.$listWrapper.find('.list').append($item);

                    if(item.id && item.consumeType!=0){
                        var combo = null;
                        if (this.opt.comboitem && this.opt.comboitem.length){
                            var comboitem = this.opt.comboitem;
                            for(var j=0;j<comboitem.length;j++){
                                if(item.consumeId && item.consumeId==comboitem[j].consumeId){
                                    combo = comboitem[j];
                                    break;
                                }
                            }
                        }
                        if(combo){
                            $item.find('.details').find('.selectPayTip,.addPayType,.payTypes,.payInfo').remove().end().addClass('comboitem settled');
                            var $payInfoItem = this.$payInfoItem.clone(true,true);
                            $payInfoItem.find('.payName').text('套餐卡金');
                            $payInfoItem.find('.payMoney').text(Math.round(combo.oncemoney*100)/100);
                            $payInfoItem.find('.payIntro').remove();
                            $payInfoItem.find('.del').css('visibility','hidden');
                            $item.find('.payInfos').append($payInfoItem);
                        } 
                    }
                    if($item.find('.payTypes').length){
                        this.setPayTypeScroll($payTypes);
                    }
                }
            }

            var bill = this.opt.option.billingInfo;
            bill.total = Math.round(bill.total * 100) / 100;
            this.$summaryWrapper.find('.total .amount').text('￥'+(Math.round(bill.total*100)/100));

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

            this.comboDeduct = 0;
            this.comboItemCount();
            this.change();
            this.setHeight(1);
        },
        setPayTypeScroll: function($dom){
            if($dom){
                var items = $dom.find('.payItem');
                if(items.length){
                    var w = 0;
                    for(var i=0;i<items.length;i++){
                        w += $(items[i]).outerWidth(true) + 1;
                    }
                    $dom.find('.payTypesInner').css('width',w+'px');
                    var scroll = new $.am.ScrollView({
                        $wrap : $dom.find('.payTypesWrapper'),
                        $inner : $dom.find('.payTypesInner'),
                        direction : [1, 0],
                        hasInput: false
                    });
                }
            }
        },
        payItem: function(type,reSelect){
            var _this = this;
            if(type=='REDPAPER'){
                var itemData = this.$listWrapper.find('.item').eq(this.editIndex || 0).data('data');
                this.paytool.luckyMoney.show(this.opt.member, this.opt.option.expenseCategory,null,itemData);
            }
            else if(type=='MALLORDER'){
                //商城订单
                if(this.mallorderData && !reSelect){
                    this.setPayItem(type,this.mallorderData);
                }else {
                    this.paytool.mallOrder.show(this.opt.member, this.opt.option.expenseCategory);
                }
            }
            else {
                this.setPayItem(type);
            }

        },
        getDepotsInBill:function(){
            return am.page.pay.getDepotsInBill.call(this,this.opt);
        },
        checkAppointItem:function(data){
            this.paytool.luckyMoney.redPackageArr = [];
            this.$.find('.luckyMoneyList li').removeClass('selected').find('.circular').removeClass('icon-queren');
            this.$.find('.luckyMoneyList .notUseThisItem').removeClass('notUseThisItem am-disabled').addClass('canUse');
            this.$.find('.luckyMoneyList .notEnoughMoney').removeClass('notEnoughMoney am-disabled').addClass('canUse');
            this.$.find('.luckyMoneyList .notUseThisBill').removeClass('notUseThisBill am-disabled').addClass('canUse');
            this.$.find('.luckyMoneyList .usedInThisBill').removeClass('usedInThisBill am-disabled').addClass('canUse');
            var lis = this.$.find('.luckyMoneyList .canUse');
            var itemData = this.$listWrapper.find('.item').eq(this.editIndex || 0).data('data');
            var paper = this.getCurrentItemPaperData();
            var paperData = paper.paperData;
            var paperIds = paper.ids;
            if(lis && lis.length){
                for(var i=0;i<lis.length;i++){
                    var red = $(lis[i]).data('data');
                    if(red.money && paperIds.indexOf(red.id)==-1 && this.paperData && this.paperData[red.id] && this.paperData[red.id].usedMoney>=red.money){
                        $(lis[i]).addClass('notEnoughMoney am-disabled').removeClass('canUse');
                    }
                    if(!red.money && paperIds.indexOf(red.id)==-1 && this.paperData && this.paperData[red.id]){
                        $(lis[i]).addClass('usedInThisBill am-disabled').removeClass('canUse');
                    }
                    if(red.templateId){
                        if(red.rule && JSON.parse(red.rule).content){
                            var rule = JSON.parse(JSON.parse(JSON.parse(red.rule).content).rule);
                            var include = 0;
                            var enough = 0;
                            var allowCashierPay = rule.luckyMoneyRule.enableCashierPay && rule.luckyMoneyRule.allowCashierPay;
                            // 避免只勾选了店内消费抵扣
                            if(rule.luckyMoneyRule.enableCashierPay || allowCashierPay){
                                var consumptionAmount = allowCashierPay.consumptionAmount*1;
                                if(allowCashierPay.enableItems && allowCashierPay.enableDepots!==true && data.productid===undefined){
                                    var items = rule.luckyMoneyRule.allowCashierPay.items;
                                    if(items.length==0){
                                        // 全部项目可用
                                        include ++;
                                    }else{
                                        for(var j=0;j<items.length;j++){
                                            if(items[j].id==data.id){
                                                include ++;
                                                break;
                                            }
                                        }
                                    }
                                    if(isNaN(consumptionAmount) || data.salePrice>=consumptionAmount){
                                        enough ++;
                                    }
                                }else if(allowCashierPay.enableTreats === undefined && allowCashierPay.enableDepots!==true){
                                    // 历史红包仅勾选店内消费可用（默认全部项目可用）
                                    include ++;
                                }else if(data && data.productid!==undefined && allowCashierPay.enableDepots && allowCashierPay.enableItems!==true){
                                    // 卖品 高级结算
                                    var depotsInRule = allowCashierPay.depots;
                                    if(depotsInRule){
                                        var depotsArr = depotsInRule.split(',');
                                        if(depotsArr[0]=='a'){
                                            // 全部卖品可用
                                            include ++;
                                        }else if(depotsArr[0]=='r'){
                                            // 指定卖品不能用
                                            if(depotsArr.indexOf(data.no+'')==-1){
                                                include ++;
                                            }
                                        }else{
                                            // 指定卖品能用
                                            if(depotsArr.indexOf(data.no)>-1){
                                                include ++;
                                            }
                                        }
                                    }
                                    if(isNaN(consumptionAmount) || data.salePrice*data.number>=consumptionAmount){
                                        enough++;
                                    }
                                }
                                if(!include || !enough){
                                    $(lis[i]).addClass('notUseThisItem am-disabled').removeClass('canUse');
                                }
                                // 判断散客 
                                var isTempMember = 1; // 1 散客,0 会员
                                var memberStage = this.opt.member && (this.opt.member.memberstage || this.opt.member.memberStage);
                                if (memberStage > 2) {
                                    // memberstage :   1-新客 2-潜在会员 3-会员 4临界会员,默认1, 1 2都是散客
                                    isTempMember = 0;
                                }
                                if(!(!rule.luckyMoneyRule.allowCashierPay.memCard || isTempMember)){
                                    // 当前会员不可用(会员不能用散客红包)
                                    $(lis[i]).addClass('notUseThisMem am-disabled').removeClass('canUse');
                                }
                                // 判断门店
                            }else{
                                $(lis[i]).addClass('notUseThisItem am-disabled').removeClass('canUse');// 不能店内抵扣
                            }
                        }
                        // if(itemData.productid){
                        //     $(lis[i]).addClass('notUseThisItem am-disabled').removeClass('canUse');
                        // }
                    }
                    if(paperData && paperData.length){
                        for(var m=0;m<paperData.length;m++){
                            if(red.id==paperData[m].id){
                                $(lis[i]).trigger('vclick');
                            }
                        }
                    }
                }
            }
        },
        getCurrentItemPaperData:function(){
            var $item = this.$listWrapper.find('.item').eq(this.editIndex || 0);
            var payInfos = $item.find('.payInfo');
            var paperData = payInfos.data('data') || [];
            var ids = [];
            if(paperData.length){
                for(var i=0;i<paperData.length;i++){
                    ids.push(paperData[i].id);
                }
            }
            return {
                paperData: paperData,
                ids: ids,
            };
        },
        checkRedPaper:function(data){
            var discountNum = 0;
            for(var i=0;i<data.length;i++){
                if(!data[i].money){
                    discountNum ++;
                }
            }
            if(discountNum>1){
                return am.msg('只能选择一个折扣红包');
            }
            this.setPayItem('REDPAPER',data);
        },
        getPaperInfo:function(item){
            var money = 0;
            var redpaperDiscount = 0;
            for(var i=0;i<item.length;i++){
                var $intro = this.$mallIntro.clone(true,true);
                var data = item[i];
                if(data.money){
                    money += data.money;
                }else {
                    if(data.rule && JSON.parse(data.rule).useTemplate){
                        var rule = JSON.parse(JSON.parse(JSON.parse(data.rule).content).rule);
                        if(rule && rule.extraRule && rule.extraRule.type==2){
                            redpaperDiscount = rule.extraRule.discount;
                        }
                    }  
                }
            }
            return {
                money: money,
                discount: redpaperDiscount
            }
        },
        setPaperPayInfo:function($item,item,usedMoney){
            item = JSON.parse(JSON.stringify(item));
            for(var i=0;i<item.length;i++){
                if(!item[i].money){
                    continue;
                }
                if(usedMoney>0){
                    item[i].usedMoney = item[i].money < usedMoney ? item[i].money : usedMoney;
                    usedMoney -= item[i].usedMoney
                }else {
                    item[i].usedMoney = 0;
                }
            }
            console.log(item);
            $item.data('data',item);
            this.setPaperData(item);
        },
        setPaperData:function(item){
            if(!this.paperData){
                this.paperData = {};
            }
            for(var i=0;i<item.length;i++){
                var isExsit = false;
                for(var key in this.paperData){
                    if(item[i].id==key){
                        isExsit = true;
                        break;
                    }
                }
                if(isExsit){
                    this.paperData[item[i].id].usedMoney += item[i].usedMoney;
                }else {
                    this.paperData[item[i].id] = item[i];
                }
            }
        },
        delItem: function(type,$payInfo){
            var detail = $payInfo.data('detail')
            var remain = $payInfo.find('.remain').text()?$payInfo.find('.remain').text().replace('余','')*1:0;
            this.setRemain(type,detail.price+remain);
        },
        delPaper:function($payInfo){
            var data = $payInfo.data('data');
            var hasDiscount = 0;
            for(var i=0;i<data.length;i++){
                if(this.paperData[data[i].id].usedOnProd!==undefined){
                    delete this.paperData[data[i].id].usedOnProd
                }
                if(data[i].money){
                    this.paperData[data[i].id].usedMoney -= data[i].usedMoney || 0;
                }else {
                    hasDiscount ++;
                    delete this.paperData[data[i].id];
                }
            }
            this.setPaperRemain();
            if(hasDiscount){
                var itemData = $payInfo.parents('.item').data('data');
                var detail = $payInfo.data('detail');
                var originalPrice = 0;
                var _item ;
                if(itemData.productid){
                    // 卖品
                    _item = am.metadata.categoryCodeMap[itemData.no];
                }else{
                    _item = amGloble.metadata.serviceItemMap[itemData.id];
                }
                if(!(_item.price*1)){
                    originalPrice = itemData.salePrice;
                }else {
                    originalPrice = itemData.oPrice;
                }
                var discountInfo = '';
                if(originalPrice && detail.beforeRedPaperDiscount && detail.beforeRedPaperDiscount<originalPrice){
                    var discount = itemData.modifyedDiscount ? Math.round((itemData.salePrice/originalPrice)*100)/10 : this.opt.member.discount;
                    discountInfo = '全额折扣价 ￥'+(Math.round(detail.beforeRedPaperDiscount*100)/100)+'('+discount+'折)';
                }
                $payInfo.parents('.item').find('.info .discountInfo').text(discountInfo);
            }
            if(hasDiscount && $payInfo.siblings() && $payInfo.siblings().length){
                $payInfo.siblings().find('.del').trigger('vclick');
                am.msg('取消折扣红包需要重新设置支付金额');
            }
        },
        setPayItem: function(type,item,index){
            var member = this.opt.member;
            var bacIndex = typeof(index)=='undefined'?(this.editIndex || 0):index;
            this.editIndex = bacIndex;
            var $item = this.$listWrapper.find('.item').eq(bacIndex);
            var itemData = $item.data('data');
            var isProduct = itemData.productid? 1 : 0;
            var $parent = $item.find('.payInfos');
            var payInfos = $parent.find('.payInfo');
            var $payInfoItem;
            var isExsit = false;
            var noDiscount = $item.find('.payTypes .'+type).hasClass('noDiscount') && member;
            var redpaperDiscount = this.getItemPaperDiscount($item);
            if(payInfos.length){
                if(type=='REDPAPER' && item && item.length){
                    var paper = this.getCurrentItemPaperData();
                    var paperData = paper.paperData;
                    var paperIds = paper.ids;
                    for(var i=0;i<item.length;i++){
                        if(paperIds.indexOf(item[i].id)!=-1 && this.paperData && this.paperData[item[i].id]){
                            for(var j=0;j<paperData.length;j++){
                                if(item[i].id==paperData[j].id){
                                    this.paperData[item[i].id].usedMoney -= paperData[j].usedMoney || 0;
                                    break;
                                }
                            }
                        }
                    }
                }
                for(var i=0;i<payInfos.length;i++){
                    if($(payInfos[i]) && $(payInfos[i]).data('type')==type){
                        $payInfoItem = $(payInfos[i]);
                        $payInfoItem.find('.noteWrap .note').remove();
                        var detailData = $payInfoItem.data('detail');
                        var moreMoney = detailData.moreMoney || 0;
                        itemData.salePrice -= moreMoney;
                        this.opt.option.billingInfo.total -= moreMoney;
                        if(this.opt.servOption && itemData.id){
                            this.opt.servOption.billingInfo.total -= moreMoney;
                        }
                        if(this.opt.prodOption && itemData.productid){
                            this.opt.prodOption.billingInfo.total -= moreMoney;
                        }
                        this.onPriceChange($item,0);
                        $payInfoItem.find('.payMoney').text(0);
                        $payInfoItem.data('detail',{price: 0,moreMoney: 0});
                        isExsit = true;
                        break;
                    }
                }
            }
            if(!$payInfoItem){
                $payInfoItem = this.$payInfoItem.clone(true,true).data('type',type);
            }
           
            var remain = 0;
            var only = $item.find('.payInfo').length == 0;
            if(type=='REDPAPER' && item && item.length){
                var money = 0;
                var redpaperDiscount = 0;
                var discountPaper = null;
                for(var i=0;i<item.length;i++){
                    var $intro = this.$mallIntro.clone(true,true);
                    var data = item[i];
                    if (isProduct) {
                        data.usedOnProd = 1;
                    }
                    if(data.rule && JSON.parse(data.rule).content && JSON.parse(JSON.parse(data.rule).content).title){
                       $intro.find('span:last-child').text(JSON.parse(JSON.parse(data.rule).content).title);
                    }else{
                        $intro.find('span:last-child').text(data.activityTitle);
                    }
                    if(data.money){
                        $intro.find('span:first-child').text(Math.round(data.money*100)/100);
                        money += data.money;
                    }else {
                        if(data.rule && JSON.parse(data.rule).useTemplate){
                            var rule = JSON.parse(JSON.parse(JSON.parse(data.rule).content).rule);
                            if(rule && rule.extraRule && rule.extraRule.type==2){
                                $intro.find('span:first-child').text(rule.extraRule.discount+'折');
                                redpaperDiscount = rule.extraRule.discount;
                                discountPaper = data;
                            }
                        }  
                    }
                    $payInfoItem.find('.noteWrap').prepend($intro.data('data',data));
                }
                if(redpaperDiscount){
                    var beforeRedPaperDiscount = itemData.salePrice;
                }
                if(redpaperDiscount>0 && redpaperDiscount<10){
                    this.opt.option.billingInfo.total -= itemData.salePrice;
                    if(this.opt.servOption && itemData.id){
                        this.opt.servOption.billingInfo.total -= itemData.salePrice;
                    }
                    if(this.opt.prodOption && itemData.productid){
                        this.opt.prodOption.billingInfo.total -= itemData.salePrice;
                    }
                    itemData.salePrice = toFloat(itemData.oPrice*redpaperDiscount/10);
                    discountPaper.usedMoney = itemData.oPrice - itemData.salePrice;
                    this.opt.option.billingInfo.total += itemData.salePrice;
                    if(this.opt.servOption && itemData.id){
                        this.opt.servOption.billingInfo.total += itemData.salePrice;
                    }
                    if(this.opt.prodOption && itemData.productid){
                        this.opt.prodOption.billingInfo.total += itemData.salePrice;
                    }
                    $item.find('.info .salePrice').text(Math.round(itemData.salePrice*100)/100);
                    this.$summaryWrapper.find('.total .amount').text('￥'+Math.round(this.opt.option.billingInfo.total*100)/100);
                    var originalPrice = 0;
                    var _item;
                    if(itemData.productid){
                        // 卖品
                        _item = am.metadata.categoryCodeMap[itemData.no];
                    }else{
                        _item = amGloble.metadata.serviceItemMap[itemData.id]
                    }
                    if(!(_item.price*1)){
                        originalPrice = itemData.salePrice;
                    }else {
                        originalPrice = itemData.oPrice;
                    }
                    if(originalPrice && itemData.salePrice && itemData.salePrice<originalPrice){
                        var discountInfo = '全额折扣价 ￥'+(Math.round(itemData.salePrice*100)/100)+'('+redpaperDiscount+'折)';
                        $item.find('.info .discountInfo').text(discountInfo);
                    }
                }
                var usedMoney = 0;
                usedMoney = this.getUsedPaperMoney(item);
                money -= usedMoney;
                var restMoney = this.getItemRestMoney($item);
                if(noDiscount){
                    restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                }

                var fillMoney = restMoney<=money?restMoney:money;
                $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                if(noDiscount){
                    var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                    this.onPriceChange($item,moreMoney);
                }
                
                $payInfoItem.data('detail',{
                    price: fillMoney,
                    beforeRedPaperDiscount: beforeRedPaperDiscount,
                    moreMoney: moreMoney || 0
                });

                remain = money-fillMoney;

                this.setPaperPayInfo($payInfoItem,item,fillMoney);
            }else if(type=='MALLORDER' && item){
                var usedMoney = 0;
                if(this.mallorderData){
                    if(this.mallorderData.id==item.id){
                        usedMoney = this.getUsedMoney($item,item,[type]);
                    }else {
                        this.clearUsed($item,[type]);
                        this.mallorderData = item;
                        this.setPayItem(type,item,bacIndex);
                        return;
                    }
                }
                this.mallorderData = item;
                var money = item.realmoney - usedMoney;
                if(money>0){
                    var $intro = this.$mallIntro.clone(true,true);
                    $intro.find('span:last-child').text(item.mallItemName);
                    $intro.find('span:first-child').text(Math.round(item.realmoney*100)/100);
                    $payInfoItem.find('.noteWrap').prepend($intro);

                    var restMoney = this.getItemRestMoney($item);
                    if(noDiscount){
                        restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                    }

                    var fillMoney = restMoney<=money?restMoney:money;
                    $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                    if(noDiscount){
                        var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                        this.onPriceChange($item,moreMoney);
                    }

                    $payInfoItem.data('data',item);
                    $payInfoItem.data('detail',{
                        price: fillMoney,
                        moreMoney: moreMoney || 0
                    });

                    remain = money-fillMoney;
                }else {
                    return am.msg('该商场订单金额已使用完');
                }
            }else if(type=='DIANPIN'){
                if(item){
                    var usedMoney = 0;
                    if(this.dianpinData){
                        if(this.dianpinData.id==item.id){
                            usedMoney = this.getUsedMoney($item,item,[type]);
                        }else {
                            this.clearUsed($item,[type]);
                            this.dianpinData = item;
                            this.setPayItem(type,item,bacIndex);
                            return;
                        }
                    }
                    this.dianpinData = item;
                    var money = item.marketprice - usedMoney;
                    if(money>0){
                        var $intro = this.$mallIntro.clone(true,true);
                        $intro.find('span:last-child').text(item.dealtitle);
                        $intro.find('span:first-child').text(Math.round(item.marketprice*100)/100);
                        $payInfoItem.find('.noteWrap').prepend($intro);

                        var restMoney = this.getItemRestMoney($item);
                        if(noDiscount){
                            restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                        }

                        var fillMoney = restMoney<=money?restMoney:money;
                        $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                        if(noDiscount){
                            var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                            this.onPriceChange($item,moreMoney);
                        }

                        $payInfoItem.data('data',item);
                        $payInfoItem.data('detail',{
                            price: fillMoney,
                            moreMoney: moreMoney || 0,
                            voucherFee: Math.round((item.marketprice - item.price)*(fillMoney/item.marketprice)*1000)/1000
                        });

                        remain = money-fillMoney;
                    }else {
                        this.display();
                        this.change();
                        return am.msg('该点评券金额已使用完');
                    }
                }else {
                    var $intro = this.$prepayIntro.clone(true,true);
                    $intro.find('.pay').text('关联点评券')
                    $payInfoItem.find('.noteWrap').show().prepend($intro);

                    var restMoney = this.getItemRestMoney($item); 
                    if(noDiscount){
                        restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                    }
                    var fillMoney = restMoney;
                    $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                    if(noDiscount){
                        var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                        this.onPriceChange($item,moreMoney);
                    }

                    $payInfoItem.data('detail',{
                        price: restMoney,
                        moreMoney: moreMoney || 0
                    });
                }
            }else if(type=='KOUBEI'){
                if(item){
                    var usedMoney = 0;
                    if(this.koubeiData){
                        if(this.koubeiData.id==item.id){
                            usedMoney = this.getUsedMoney($item,item,[type]);
                        }else {
                            this.clearUsed($item,[type]);
                            this.koubeiData = item;
                            this.setPayItem(type,item,bacIndex);
                            return;
                        }
                    }
                    this.koubeiData = item;
                    var money = item.originalprice - usedMoney;
                    if(money>0){
                        var $intro = this.$mallIntro.clone(true,true);
                        $intro.find('span:last-child').text(item.itemname);
                        $intro.find('span:first-child').text(Math.round(item.originalprice*100)/100);
                        $payInfoItem.find('.noteWrap').prepend($intro);

                        var restMoney = this.getItemRestMoney($item);
                        if(noDiscount){
                            restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                        }

                        var fillMoney = restMoney<=money?restMoney:money;
                        $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                        if(noDiscount){ 
                            var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                            this.onPriceChange($item,moreMoney);
                        }

                        $payInfoItem.data('data',item);
                        $payInfoItem.data('detail',{
                            price: fillMoney,
                            moreMoney: moreMoney,
                            voucherFee: Math.round((item.originalprice - item.price*1)*(fillMoney/item.originalprice)*1000)/1000
                        });

                        remain = money-fillMoney;
                    }else {
                        this.display();
                        this.change();
                        return am.msg('该口碑券金额已使用完');
                    }
                }else {
                    var $intro = this.$prepayIntro.clone(true,true);
                    $intro.find('.pay').text('关联口碑券')
                    $payInfoItem.find('.noteWrap').show().prepend($intro);

                    var restMoney = this.getItemRestMoney($item); 
                    if(noDiscount){
                        restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                    }
                    var fillMoney = restMoney;
                    $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                    if(noDiscount){
                        var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                        this.onPriceChange($item,moreMoney);
                    }

                    $payInfoItem.data('detail',{
                        price: restMoney,
                        moreMoney: moreMoney || 0
                    });
                }
            }else if(type=='CARDFEE'){
                var usedMoney = this.getUsedCardFee($item,[type]);
                var cash = 0;
                if(member.combinedUseFlag==1){
                    cash = member.balance + member.gift;
                }else {
                    cash = member.balance;
                }
                var money = cash - usedMoney;

                if(money>0){
                    $payInfoItem.find('.payName ._wrap').find('span').remove().end().append('<span>余额 '+Math.round(cash*100)/100+'</span>');

                    var restMoney = this.getItemRestMoney($item);
                    if(noDiscount){
                        restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                    }

                    var fillMoney = restMoney<=money?restMoney:money;
                    $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);
                    
                    if(noDiscount){
                        var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                        this.onPriceChange($item,moreMoney);
                    }

                    $payInfoItem.data('detail',{
                        price: fillMoney,
                        moreMoney: moreMoney || 0
                    });
                }else {
                    return am.msg('卡金已分配完');
                }
            }else if(type=='PRESENTFEE'){
                var usedMoney = this.getUsedCardFee($item,[type]);
                var money = member.gift - usedMoney;
                if(money>0){
                    $payInfoItem.find('.payName ._wrap').find('span').remove().end().append('<span>余额 '+Math.round(member.gift*100)/100+'</span>');

                    var restMoney = this.getItemRestMoney($item);
                    if(noDiscount){
                        restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                    }

                    var fillMoney = restMoney<=money?restMoney:money;
                    $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                    if(noDiscount){
                        var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                        this.onPriceChange($item,moreMoney);
                    }

                    $payInfoItem.data('detail',{
                        price: fillMoney,
                        moreMoney: moreMoney || 0
                    });
                }else {
                    return am.msg('赠送金已分配完');
                }
            }else if(type=='WEIXIN' || type=='PAY' || type=='UNIONPAY' || type=='JINGDONG'){
                if(item){
                    var usedMoney = 0;
                    if(this.prepayData){
                        if(this.prepayData.id==item.id){
                            usedMoney = this.getUsedMoney($item,item,['WEIXIN','PAY','UNIONPAY','JINGDONG']);
                            var prepayList = $payInfoItem.siblings();
                            var prepayType = this.currentType;
                            if(prepayList.length){
                                for(var i=0;i<prepayList.length;i++){
                                    if($(prepayList[i]).data('related'+prepayType)){
                                        usedMoney += $(prepayList[i]).data('related'+prepayType)*1;
                                        break;
                                    }
                                }
                            }
                        }else {
                            this.clearUsed($item,['WEIXIN','PAY','UNIONPAY','JINGDONG']);
                            this.prepayData = item;
                            this.setPayItem(type,item,bacIndex);
                            return;
                        }
                    }
                    this.prepayData = item;
                    var money = this.getPrePayPrice(item) - usedMoney;
                    if(money>0){
                        var $intro = this.$mallIntro.clone(true,true);
                        $intro.find('span:last-child').text(item.outtradeno);
                        var sum = 0;
                        if(!am.isNull(item.details)){
                            $.each(item.details,function(k,v){
                                sum += v.amount*1;
                            });
                        }
                        $intro.find('span:first-child').text(Math.round((item.price-sum)*100)/100);
                        $payInfoItem.find('.noteWrap').prepend($intro);

                        var restMoney = this.getItemRestMoney($item);
                        if(noDiscount){
                            restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                        }

                        var fillMoney = restMoney<=money?restMoney:money;
                        $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                        if(noDiscount){
                            var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                            this.onPriceChange($item,moreMoney);
                        }

                        $payInfoItem.data('data',item);

                        $payInfoItem.data('detail',{
                            price: fillMoney,
                            moreMoney: moreMoney || 0
                        });
                        $payInfoItem.data('related'+type,fillMoney);
                        remain = money-fillMoney;
                    }else {
                        var $intro = this.$prepayIntro.clone(true,true);
                        $payInfoItem.find('.noteWrap').prepend($intro);
                    
                        var restMoney = this.getItemRestMoney($item);
                        if(noDiscount){
                            restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                        }
                        var fillMoney = restMoney;
                        $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);
                        
                        if(noDiscount){
                            var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                            this.onPriceChange($item,moreMoney);
                        }
                        $payInfoItem.data('detail',{
                            price: restMoney,
                            moreMoney: moreMoney || 0
                        });
                        return am.msg('该收款金额已使用完');
                    }
                }else {
                    if(this.$prePayTarget.hasClass('hasGetData') && this.$prePayTarget.hasClass('hasGetData-'+type)){
                        var $intro = this.$prepayIntro.clone(true,true);
                        $payInfoItem.find('.noteWrap').show().prepend($intro);
                    }else {
                        $payInfoItem.find('.noteWrap').hide();
                    }

                    var restMoney = this.getItemRestMoney($item); 
                    if(noDiscount){
                        restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                    }
                    var fillMoney = restMoney;
                    $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                    if(noDiscount){
                        var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                        this.onPriceChange($item,moreMoney);
                    }

                    $payInfoItem.data('detail',{
                        price: restMoney,
                        moreMoney: moreMoney || 0
                    });
                }
                
            }else if(type=='ONLINECREDITPAY'){
                var usedMoney = this.getUsedCardFee($item,[type]);
                var worth = Math.round((member.onlineCredit / am.metadata.configs.onlineCreditPay) * 100) / 100;

                var money = worth - usedMoney;
                if(money>0){
                    var $intro = this.$pointIntro.clone(true,true);
                    $intro.find('span:nth-child(2)').text(member.onlineCredit);
                    $intro.find('span:nth-child(4)').text(worth);
                    $payInfoItem.find('.noteWrap').prepend($intro);

                    var restMoney = this.getItemRestMoney($item);
                    if(noDiscount){
                        restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                    }

                    var fillMoney = restMoney<=money?restMoney:money;
                    $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                    if(noDiscount){
                        var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                        this.onPriceChange($item,moreMoney);
                    }

                    $payInfoItem.data('detail',{
                        price: fillMoney,
                        moreMoney: moreMoney
                    });
                }else {
                    return am.msg('线上积分已抵扣完');
                }
            }else if(type=='OFFLINECREDITPAY'){
                var usedMoney = this.getUsedCardFee($item,[type]);
                var worth = Math.round((member.points / am.metadata.configs.offlineCreditPay) * 100) / 100;
                var money = worth - usedMoney;
                if(money>0){
                    var $intro = this.$pointIntro.clone(true,true);
                    $intro.find('span:nth-child(2)').text(member.points);
                    $intro.find('span:nth-child(4)').text(worth);
                    $payInfoItem.find('.noteWrap').prepend($intro);

                    var restMoney = this.getItemRestMoney($item);
                    if(noDiscount){
                        restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                    }

                    var fillMoney = restMoney<=money?restMoney:money;
                    $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);

                    if(noDiscount){
                        var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                        this.onPriceChange($item,moreMoney);
                    }

                    $payInfoItem.data('detail',{
                        price: fillMoney,
                        moreMoney: moreMoney
                    });
                }else {
                    return am.msg('门店积分已抵扣完');
                }
            }else {
                var restMoney = this.getItemRestMoney($item);
                if(noDiscount){
                    restMoney = this.getNoDiscountRestMoney(member,itemData,redpaperDiscount,restMoney,only);
                }
                var fillMoney = restMoney;
                $payInfoItem.find('.payMoney').text(Math.round(fillMoney*100)/100);
                
                if(noDiscount){
                    var moreMoney = this.getNoDiscountMoreMoney(member,itemData,redpaperDiscount,fillMoney,only);
                    this.onPriceChange($item,moreMoney);
                }

                $payInfoItem.data('detail',{
                    price: restMoney,
                    moreMoney: moreMoney || 0
                });
            }

            if(type!='REDPAPER' && type!='MALLORDER' && type!='DIANPIN' && type!='KOUBEI' && type!='WEIXIN' && type!='PAY' && type!='UNIONPAY' && type!='JINGDONG' && type!='ONLINECREDITPAY' && type!='OFFLINECREDITPAY'){
                $payInfoItem.find('.payIntro').remove();
            }

            if(type=='ONLINECREDITPAY' || type=='OFFLINECREDITPAY'){
                $payInfoItem.find('.payIntro .edit').remove();
            }

            $payInfoItem.find('.payName p').text(this.payType[type] || '');
            if(!isExsit){
                $parent.append($payInfoItem);
            }
            $item.find('.payTypes').hide();

            if(item){
                if(type=='REDPAPER'){
                    this.setPaperRemain();
                }
                if(type=='MALLORDER' || type=='DIANPIN' || type=='KOUBEI'){
                    this.setRemain([type],remain);
                }
                if((type=='WEIXIN' || type=='PAY' || type=='UNIONPAY' || type=='JINGDONG')){
                    this.setRemain(['WEIXIN','PAY','UNIONPAY','JINGDONG'],remain);
                }
            }
            this.display();
            this.change();
            this.setHeight();
        },
        getNoDiscountMoreMoney:function(member,itemData,redpaperDiscount,fillMoney,only){
            var discount = itemData.modifyedDiscount?itemData.modifyedDiscount*10:(itemData.id?member.discount:member.buydiscount);
            if(redpaperDiscount){
                discount = redpaperDiscount;
            }
            var moreMoney = 0;
            if(only && !itemData.modifyedDiscount && !redpaperDiscount){
                var money = itemData.id?itemData.oPrice:itemData.price*itemData.number;
                if(fillMoney<money){
                    moreMoney = fillMoney*(10-discount)/10;
                }else {
                    moreMoney = money - itemData.salePrice*(itemData.number || 1);
                }
            }else {
                moreMoney = fillMoney*(10-discount)/10;
            }
            return moreMoney;
        },
        getNoDiscountRestMoney:function(member,itemData,redpaperDiscount,restMoney,only){
            if(redpaperDiscount){
                restMoney = Math.round((restMoney/(redpaperDiscount/10))*100)/100;
            }else if(itemData.modifyedDiscount){
                restMoney = Math.round((restMoney/itemData.modifyedDiscount)*100)/100;
            }else {
                if(only){
                    restMoney = itemData.id?itemData.oPrice:itemData.price*itemData.number;
                }else {
                    restMoney = Math.round((restMoney/((itemData.id?member.discount:member.buydiscount)/10))*100)/100;
                }
            }
            return restMoney;
        },
        getItemPaperDiscount: function($item){
            var payInfos = $item.find('.payInfo');
            if(payInfos.length){
                for(var i=0;i<payInfos.length;i++){
                    if($(payInfos[i]).data('type')=='REDPAPER'){
                        var items = $(payInfos[i]).data('data');
                        for(var j=0;j<items.length;j++){
                            if(!items[i].money){
                                var data = items[i];
                                if(data.rule && JSON.parse(data.rule).useTemplate){
                                    var rule = JSON.parse(JSON.parse(JSON.parse(data.rule).content).rule);
                                    if(rule && rule.extraRule && rule.extraRule.type==2){
                                        redpaperDiscount = rule.extraRule.discount;
                                        return redpaperDiscount;
                                    }
                                }  
                            }
                        }
                        break;
                    }
                }
            }
        },
        onPriceChange:function($item,moreMoney){
            var itemData = $item.data('data');
            itemData.salePrice += moreMoney/(itemData.number || 1);
            $item.find('.info .salePrice').text(Math.round(itemData.salePrice*(itemData.number || 1)*100)/100);
            this.opt.option.billingInfo.total += moreMoney;
            if(this.opt.servOption && itemData.id){
                this.opt.servOption.billingInfo.total += moreMoney;
            }
            if(this.opt.prodOption && itemData.productid){
                this.opt.prodOption.billingInfo.total += moreMoney;
            }
            this.$summaryWrapper.find('.total .amount').text('￥'+Math.round(this.opt.option.billingInfo.total*100)/100);
        },
        checkItemPayed:function(){
            var allPayed = true;
            var list = this.$listWrapper.find('.item');
            for(var i=0;i<list.length;i++){
                var data = $(list[i]).data('data');
                if((data.id && data.consumeType!=0) || !data.salePrice*(data.number || 1)){
                    continue;
                }
                var salePrice = data.salePrice*(data.number || 1);
                var details = $(list[i]).find('.payInfo');
                if(!details.length){
                    $(list[i]).find('.details').addClass('error');
                    allPayed = false;
                }
                var payed = 0;
                for(var j=0;j<details.length;j++){
                    var detail =$(details[j]).data('detail');
                    payed += detail.price;
                }
                if(Math.round(payed*100) < Math.round(salePrice*100) && Math.abs(Math.round(payed*100)-Math.round(salePrice*100))>1){
                    $(list[i]).find('.details').addClass('error');
                    allPayed = false;
                }
            }
            if(!allPayed){
                am.msg('有商品未全额支付');
            }
            return allPayed;
        },
        checkCardLimit:function(){
            var member = this.opt.member;
            if (member && member.cardtype == 1 && member.timeflag != 1){
                var total = this.opt.option.billingInfo.total;

                var balance = 0;
                var balanceDiscount = 0;
                var giftDiscount = 0;
                if(member.combinedUseFlag==1){
                    balance = member.balance + member.gift;
                    balanceDiscount = this.getCardFeeAndPresentFee(this.payed.CARDFEE || 0,member).cardFee;
                    giftDiscount = this.getCardFeeAndPresentFee(this.payed.CARDFEE || 0,member).presentFee;
                }else {
                    balance = member.balance;
                    balanceDiscount = this.payed.CARDFEE || 0;
                    giftDiscount = this.payed.PRESENTFEE || 0;
                }

                if(Math.round(member.balance*100)-Math.round(balanceDiscount*100) <  member.minfee * 100 && balanceDiscount){
                    am.msg('卡内最低卡金金额不能低于'+ member.minfee);
                    return false;
                }
                if(member.combinedUseFlag==1){
                    if(Math.round(giftDiscount * 100)>Math.round((total*(member.presentfeepayLimit/100)) * 100)){
                        am.msg('赠送金支付额不得超过总金额的'+ member.presentfeepayLimit +'%('+(Math.round((total*(member.presentfeepayLimit/100))*100)/100)+')！');
                        return false;
                    }
                }

                if(member.newcardPayLimit<100 && this.currentDayCharge && (Math.round((balanceDiscount) * 100)+Math.round((this.currentDayCharge.CONSUMEFEE) * 100))>Math.round((this.currentDayCharge.CHARGEFEE) * 100)*(member.newcardPayLimit/100)){
                    am.msg('开卡当日消费不得超过总额的'+ member.newcardPayLimit+'%,当日已消费'+this.currentDayCharge.CONSUMEFEE);
                    return false;
                }

                if(Math.round(giftDiscount * 100)>Math.round((total*(member.presentfeepayLimit/100)) * 100)){
                    am.msg('赠送金支付额不得超过总金额的'+ member.presentfeepayLimit +'%('+(Math.round((total*(member.presentfeepayLimit/100))*100)/100)+')！');
                    return false;
                }

                return true;
                
            }
            return true;
        },
        checkCouponRelated: function(type,couponData){
            if(!couponData){
                return true;
            }
            var voucherFee = 0;
            var list = this.$listWrapper.find('.item');
            for(var i=0;i<list.length;i++){
                var payInfo = $(list[i]).find('.payInfo');
                for(var j=0;j<payInfo.length;j++){
                    var info = $(payInfo[j]);
                    var _type = info.data('type');
                    var data = info.data('data');
                    if(_type==type && data){
                        var _voucherFee = info.data('detail')?info.data('detail').voucherFee * 1:0;
                        voucherFee += _voucherFee;
                    }
                }
            }
            if(!voucherFee){
                return true;
            }
            var total = 0;
            var text = '';
            if(type=='DIANPIN'){
                total = couponData.marketprice - couponData.price;
                text = '点评券';
            }else if(type=='KOUBEI'){
                total = couponData.originalprice - couponData.price;
                text = '口碑券';
            }
            
            if(Math.round(voucherFee*1000)/1000!=Math.round(total*1000)/1000){
                am.msg(text+'金额未全部关联，请修改项目价格与'+text+'原价相等');
                return false;
            }
            return true;
        },
        checkCardAboutCurrentDay:function(){
            var member = this.opt.member;
            if (member && (this.opt.option.expenseCategory == 0 || this.opt.option.expenseCategory == 1 || this.opt.option.expenseCategory == 4) && member.cardtype == 1 && member.timeflag != 1
            && new Date(member.openDate).format('yyyy-mm-dd') == new Date().format('yyyy-mm-dd')){
                am.api.checkCardAboutCurrentDay.exec({
                    cardId: member.cid,
                    parentShopId: amGloble.metadata.userInfo.parentShopId,
                    shopId: amGloble.metadata.userInfo.shopId,
                },function(res){
                    if(res.code==0){
                        self.currentDayCharge = res.content;
                    }else {
                    }
                })
            }
        },
        getCardFeeAndPresentFee:function(total,member){
            return am.page.pay.getCardFeeAndPresentFee(total,member);
        },
        getUsedMoney:function($dom,item,type){
            var list = $dom.siblings('.item');
            var used = 0;
            for(var i=0;i<list.length;i++){
                var payInfo = $(list[i]).find('.payInfo');
                for(var j=0;j<payInfo.length;j++){
                    if(type.indexOf($(payInfo[j]).data('type'))!=-1 && $(payInfo[j]).data('data') && $(payInfo[j]).data('data').id==item.id){
                        used += $(payInfo[j]).data('detail').price*1;
                    }
                }
            }
            return used;
        },
        getUsedPaperMoney: function(item){
            var used = 0;
            for(var i=0;i<item.length;i++){
                if(this.paperData && this.paperData[item[i].id] && this.paperData[item[i].id].usedMoney){
                    used += this.paperData[item[i].id].usedMoney;
                }
            }
            return used;
        },
        getUsedCardFee: function($dom,type){
            var list = $dom.siblings('.item');
            var used = 0;
            for(var i=0;i<list.length;i++){
                var payInfo = $(list[i]).find('.payInfo');
                for(var j=0;j<payInfo.length;j++){
                    if(type.indexOf($(payInfo[j]).data('type'))!=-1){
                        used += $(payInfo[j]).data('detail').price*1;
                    }
                }
            }
            return used;
        },
        clearUsed:function($dom,type){
            var list = this.$listWrapper.find('.item');
            for(var i=0;i<list.length;i++){
                var payInfo = $(list[i]).find('.payInfo');
                for(var j=0;j<payInfo.length;j++){
                    if(type.indexOf($(payInfo[j]).data('type'))!=-1){
                        $(payInfo[j]).find('.del').trigger('vclick');
                    }
                }
            }
        },
        setRemain:function(type,money){
            var list = this.$listWrapper.find('.item');
            for(var i=0;i<list.length;i++){
                var payInfo = $(list[i]).find('.payInfo');
                for(var j=0;j<payInfo.length;j++){
                    if(type.indexOf($(payInfo[j]).data('type'))!=-1 && $(payInfo[j]).data('data')){
                        $(payInfo[j]).find('.remainWrap').remove();
                        if(money>0){
                            var $remain = this.$remainIntro.clone(true,true);
                            $remain.find('.remain').text('余'+Math.round(money*100)/100)
                            $(payInfo[j]).find('.noteWrap').append($remain);
                        }
                    }
                }
            }
        },
        setPaperRemain:function(){
            var list = this.$listWrapper.find('.item');
            for(var i=0;i<list.length;i++){
                var payInfo = $(list[i]).find('.payInfo');
                for(var j=0;j<payInfo.length;j++){
                    var type = $(payInfo[j]).data('type');
                    if(type!='REDPAPER'){
                        continue;
                    }
                    var data = $(payInfo[j]).data('data');
                    var rest = [];
                    for(var m=0;m<data.length;m++){
                        if(data[m].templateId && data[m].money){
                            rest[m] = data[m].money - this.paperData[data[m].id].usedMoney;
                        }
                    }
                    var money = this.sum(rest);
                    $(payInfo[j]).find('.remainWrap').remove();
                    if(money>0){
                        var $remain = this.$remainIntro.clone(true,true);
                        $remain.find('.remain').text('余'+Math.round(money*100)/100)
                        $(payInfo[j]).find('.noteWrap').append($remain);
                    }
                }
            }
        },
        sum:function(arr){
            var sum = 0;
            for(var i=0;i<arr.length;i++){
                sum += arr[i];
            }
            return sum;
        },
        getItemRestMoney: function($dom,$payInfo){
            var data = $dom.data('data');
            var total = data.salePrice * (data.number || 1);
            var payed = 0;
            var payInfos = $dom.find('.payInfo');
            for(var i=0;i<payInfos.length;i++){
                var price = $(payInfos[i]).find('.payMoney').text()*1;
                if(!$payInfo || $payInfo.data('type')!=$(payInfos[i]).data('type')){
                    payed += price;
                }
            }
            var rest = total - payed;
            return Math.round(rest*100)/100;
        },
        reCalPrice:function($del){
            var $payInfo = $del.parents('.payInfo');
            var detail = $payInfo.data('detail');
            var $item = $del.parents('.item');
            var item = $item.data('data');
            if(detail.beforeRedPaperDiscount){
                this.opt.option.billingInfo.total -= item.salePrice;
                if(this.opt.servOption && item.id){
                    this.opt.servOption.billingInfo.total -= item.salePrice;
                }
                if(this.opt.prodOption && item.productid){
                    this.opt.prodOption.billingInfo.total -= item.salePrice;
                }
                item.salePrice = detail.beforeRedPaperDiscount;
                this.opt.option.billingInfo.total += item.salePrice;
                if(this.opt.servOption && item.id){
                    this.opt.servOption.billingInfo.total += item.salePrice;
                }
                if(this.opt.prodOption && item.productid){
                    this.opt.prodOption.billingInfo.total += item.salePrice;
                }
            }else if(detail.moreMoney){                
                item.salePrice -= detail.moreMoney/(item.number || 1);
                this.opt.option.billingInfo.total -= detail.moreMoney;
                if(this.opt.servOption && item.id){
                    this.opt.servOption.billingInfo.total -= detail.moreMoney;
                }
                if(this.opt.prodOption && item.productid){
                    this.opt.prodOption.billingInfo.total -= detail.moreMoney;
                }
            }
            $item.find('.info .salePrice').text(Math.round(item.salePrice*(item.number || 1)*100)/100);
            this.$summaryWrapper.find('.total .amount').text('￥'+Math.round(this.opt.option.billingInfo.total*100)/100);
        },
        display: function(){
            var $item = this.$listWrapper.find('.item').eq(this.editIndex || 0)
            var $details = $item.find('.details');
            var $selectPayTip = $details.find('.selectPayTip');
            var $addPayType = $details.find('.addPayType');
            var $payTypes =$details.find('.payTypes');
            if($details.find('.payInfos .payInfo').length){
                $selectPayTip.hide();
                $payTypes.removeClass('disableDel');
            }else {
                $selectPayTip.show();
                $payTypes.addClass('disableDel');
                $payTypes.show();
            }
            var data = $item.data('data');
            var salePrice = data.salePrice*(data.number || 1);
            var details =  $item.find('.payInfo');
            var payed = 0;
            for(var j=0;j<details.length;j++){
                var detail =$(details[j]).data('detail');
                payed += detail.price;
            }
            $details.removeClass('settled unSettled error');
            if(Math.round(payed*100) < Math.round(salePrice*100) && Math.abs(Math.round(payed*100)-Math.round(salePrice*100))>=1){
                $details.addClass('unSettled');
                if($payTypes.is(':visible')){
                    $addPayType.hide();
                }else {
                    $addPayType.show();
                }
                if($selectPayTip.is(':visible')){
                    $details.removeClass('settled unSettled error');
                }else {
                    $details.addClass('unSettled');
                }
            }else {
                $addPayType.hide();
                $details.addClass('settled');
            }
            var list = this.$listWrapper.find('.item');
            for(var i=0;i<list.length;i++){
                var data = $(list[i]).data('data');
                if((data.id && data.consumeType!=0) || !data.salePrice*(data.number || 1)){
                    continue;
                }
                var salePrice = data.salePrice*(data.number || 1);
                var details = $(list[i]).find('.payInfo');
                if(!details.length){
                    this.$summaryWrapper.find('.total').removeClass('allPayed');
                    return;
                }
                var payed = 0;
                for(var j=0;j<details.length;j++){
                    var detail =$(details[j]).data('detail');
                    payed += detail.price;
                }
                if(Math.round(payed*100) < Math.round(salePrice*100) && Math.abs(Math.round(payed*100)-Math.round(salePrice*100))>1){
                    this.$summaryWrapper.find('.total').removeClass('allPayed');
                    return;
                }
            }
            this.$summaryWrapper.find('.total').addClass('allPayed');
        },
        reset: function(){
            this.$listWrapper.find('.list').empty();
            this.payed = {};
            this.unpayed = {};
            this.mallorderData = null;
            this.dianpinData = null;
            this.koubeiData = null;
            this.prepayData = null;
            this.paperData = null;
            this.onlineData = null;
            this.currentDayCharge = null;
            this.$summaryWrapper.find('.total').removeClass('allPayed');
        },
        getPeriod: function(){
            return am.page.pay.getPeriod();
        },
        getTicketsList:function(apiName,cb){
            am.page.pay.getTicketsList.call(this,apiName,cb);
        },
        renderTicketsList:function(data,category){
            var self=this,$ul;
            var ticketInfo='';
            if(category=='kb'){
                $ul=this.$.find('.list-ul.kb-ul').empty();
                ticketInfo=this.koubeiData;
            }else{
                $ul=this.$.find('.list-ul.dp-ul').empty();
                ticketInfo=this.dianpinData;
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
                        // 显示选中按钮
                        if(ticketInfo && ticketInfo.id==item.id){
                            $li.addClass('selected');
                        }
                        $ul.append($li);
                    }
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
        toLowerCaseKey:function(obj){
            return am.page.pay.toLowerCaseKey(obj);
        },
        showSmsSendFlag:function(){
            am.page.pay.showSmsSendFlag.call(this);
        },
        getComboCrossNum:function(comboitem){
            return am.page.pay.getComboCrossNum(comboitem);
        },
        comboItemCount:function(){
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
            } else {
                
            }
            this.comboDeduct = deduct;
        },
        getPrePayPrice:function(item){
            var sum = 0;
            if(!am.isNull(item.details)){
                $.each(item.details,function(k,v){
                    sum += v.amount*1;
                });
            }
            sum = sum.toFixed(2);
            return (item.price - sum).toFixed(2);
        },
        change: function(){
            var list = this.$listWrapper.find('.item');
            var payed = {};
            var weixinRelated = 0;
            var payRelated = 0;
            var unionPayRelated = 0;
            var jdRelated = 0;
            this.voucherFeeDiscount = 0;
            for(var i=0;i<list.length;i++){
                var payInfo = $(list[i]).find('.payInfo');
                for(var j=0;j<payInfo.length;j++){
                    var info = $(payInfo[j]);
                    var type = info.data('type');
                    if(!type){
                        continue;
                    }
                    var price = info.data('detail')?info.data('detail').price * 1:0,
                        _voucherFee = info.data('detail')?(info.data('detail').voucherFee * 1 || 0):0,
                        data = info.data('data'),
                        related = info.data('related'+type) * 1;
                    if(price){
                        price -= _voucherFee;
                        if(!payed['VOUCHERFEE']){
                            payed['VOUCHERFEE'] = _voucherFee;
                        }else {
                            payed['VOUCHERFEE'] += _voucherFee;
                        }
                        if(!payed[type]){
                            payed[type] = price;
                        }else {
                            payed[type] += price;
                        }
                    }
                    if(related){
                        if(type=='WEIXIN'){
                            weixinRelated += related;
                        }else if(type=='PAY'){
                            payRelated += related;
                        }else if(type=='UNIONPAY'){
                            unionPayRelated += related;
                        }
                        else if(type=='JINGDONG'){
                            jdRelated += related;
                        }
                    }
                }
            }
            var unpayed = {};
            if(payed['WEIXIN']){
                unpayed['WEIXIN'] = payed['WEIXIN'] - weixinRelated;
            }
            if(payed['PAY']){
                unpayed['PAY'] = payed['PAY'] - payRelated;
            }
            if(payed['UNIONPAY']){
                unpayed['UNIONPAY'] = payed['UNIONPAY'] - unionPayRelated;
            }
            if(payed['JINGDONG']){
                unpayed['JINGDONG'] = payed['JINGDONG'] - jdRelated;
            }
            delete payed['WEIXIN'];
            delete payed['PAY'];
            delete payed['UNIONPAY'];
            delete payed['JINGDONG'];
            if(weixinRelated + payRelated + unionPayRelated + jdRelated){
                payed['PREPAY'] = weixinRelated + payRelated + unionPayRelated + jdRelated;
            }
            for(var key in payed){
                if(key=='CARDFEE' && this.opt.member && this.opt.member.combinedUseFlag==1){
                    var balanceDiscount = this.getCardFeeAndPresentFee(payed[key],this.opt.member).cardFee;
                    var giftDiscount = this.getCardFeeAndPresentFee(payed[key],this.opt.member).presentFee;
                    payed[key] = balanceDiscount;
                    payed['PRESENTFEE'] = giftDiscount;
                }
            }
            if(this.onlineData && this.onlineData.length){
                for(var i=0;i<this.onlineData.length;i++){
                    if(this.onlineData[i].type==1 && unpayed['WEIXIN']){
                        unpayed['WEIXIN'] -= this.onlineData[i].price;
                        if(!payed['WEIXIN']){
                            payed['WEIXIN'] = 0;
                        }
                        payed['WEIXIN'] += this.onlineData[i].price;
                    }
                    if(this.onlineData[i].type==2 && unpayed['PAY']){
                        unpayed['PAY'] -= this.onlineData[i].price;
                        if(!payed['PAY']){
                            payed['PAY'] = 0;
                        }
                        payed['PAY'] += this.onlineData[i].price;
                    }
                    if(this.onlineData[i].type==4 && unpayed['UNIONPAY']){
                        unpayed['UNIONPAY'] -= this.onlineData[i].price;
                        if(!payed['UNIONPAY']){
                            payed['UNIONPAY'] = 0;
                        }
                        payed['UNIONPAY'] += this.onlineData[i].price;
                    }
                    if(this.onlineData[i].type==5 && unpayed['JINGDONG']){
                        unpayed['JINGDONG'] -= this.onlineData[i].price;
                        if(!payed['JINGDONG']){
                            payed['JINGDONG'] = 0;
                        }
                        payed['JINGDONG'] += this.onlineData[i].price;
                    }
                }
            }
            console.log(payed);
            console.log(unpayed);
            if(!payed.MALLORDER){
                this.mallorderData = null;
            }
            if(!payed.PREPAY){
                this.prepayData = null;
            }
            if(!payed.DIANPIN){
                this.dianpinData = null;
            }
            if(!payed.KOUBEI){
                this.koubeiData = null;
            }

            for(var key in payed){
                payed[key] = Math.round(payed[key]*100)/100;
            }

            for(var key in unpayed){
                unpayed[key] = Math.round(unpayed[key]*100)/100;
            }
               
            this.payed = payed;
            this.unpayed = unpayed;
            this.setSummary()
            this.setMediaShow(this.opt);
        },
        setSummary:function(){
            this.$summary.find('.detailInner').empty();
            if(this.unpayed){
                for(key in this.unpayed){
                    if(this.unpayed[key]){
                        var $item = this.$summaryItem.clone(true,true);
                        $item.find('.name').text(this.payType[key] || key);
                        $item.find('.amount').text('￥'+Math.round(this.unpayed[key]*100)/100);
                        $item.addClass('unpay');
                        this.$summary.find('.detailInner').append($item.data('detail',{
                            type: key,
                            price: this.unpayed[key]
                        }));
                    }
                }
            }
            if(this.payed){
                for(key in this.payed){
                    if(this.payed[key]){
                        var $item = this.$summaryItem.clone(true,true);
                        $item.find('.name').text(this.payType[key] || key);
                        $item.find('.amount').text('￥'+Math.round(this.payed[key]*100)/100);
                        this.$summary.find('.detailInner').append($item);
                    }  
                }
            }
            if(this.comboDeduct){
                var $item = this.$summaryItem.clone(true,true);
                $item.find('.name').text('套餐卡金');
                $item.find('.amount').text('￥'+Math.round(this.comboDeduct*100)/100);
                this.$summary.find('.detailInner').append($item);
            }
            this.summaryScroll.refresh();
        },
        onlinePay:function(type,data){
            if(data.status!=3){
                return;
            }
            if(this.checkOnlinePayRepeated(data)){
                return;
            }
            if(!this.payed[type]){
                this.payed[type] = 0;
            }
            if(!this.unpayed[type]){
                this.unpayed[type] = 0;
            }
            if(!this.onlineData){
                this.onlineData = [];
            }
            this.onlineData.push(data);
            this.payed[type] = Math.round((this.payed[type] + data.price)*100)/100;
            this.unpayed[type] = Math.round((this.unpayed[type] - data.price)*100)/100;
            
            this.setSummary();
        },
        checkOnlinePayRepeated: function(data){
            if(this.onlineData && this.onlineData.length){
                for(var i=0;i<this.onlineData.length;i++){
                    if(this.onlineData[i].id == data.id){
                        return true;
                    }
                }
            }
            return false;
        },
        key: {
            'CARDFEE':'cardFee',
            'PRESENTFEE':'presentFee',
            'WEIXIN':'weixin',
            'PAY':'pay',
            'CASH':'cashFee',
            'UNIONPAY':'unionPay',
            'COOPERATION':'cooperation',
            'MALL':'mall',
            'VOUCHERFEE':'voucherFee',
            'MDFEE':'mdFee',
            'DEBTFEE':'debtFee',
            'ONLINECREDITPAY':'onlineCreditPay',
            'OFFLINECREDITPAY':'offlineCreditPay',
            'OTHERFEE1':'otherfee1',
            'OTHERFEE2':'otherfee2',
            'OTHERFEE3':'otherfee3',
            'OTHERFEE4':'otherfee4',
            'OTHERFEE5':'otherfee5',
            'OTHERFEE6':'otherfee6',
            'OTHERFEE7':'otherfee7',
            'OTHERFEE8':'otherfee8',
            'OTHERFEE9':'otherfee9',
            'OTHERFEE10':'otherfee10',
            'MALLORDER':'mallOrderFee',
            'DIANPIN':'dpFee',
            'REDPAPER':'luckymoney'
        },
        exchangeKey:function(key){
            return this.key[key];
        },
        submit: function (isPrint,pw) {
			var _this = this;
            var $type = this.$payTypes.filter(".selected");
            var bill = $.extend(this.opt.option.billingInfo, {
                "cardFee": 0, //卡金
                "presentFee": 0, //赠送金
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
            this.opt.option.orderDetail = [];
            if(am.operateArr.indexOf('a6') != -1){
                if(this.unpayed['JINGDONG']){
                    return am.msg('京东钱包未支付完成');
                }
            }
            if(am.operateArr.indexOf('a61') != -1){
                if(this.unpayed['UNIONPAY']){
                    return am.msg('银联刷卡未支付完成');
                }
            }
            if(am.operateArr.indexOf('a62') != -1){
                if(this.unpayed['WEIXIN']){
                    return am.msg('微信未支付完成');
                }
            }
            if(am.operateArr.indexOf('a63') != -1){
                if(this.unpayed['PAY']){
                    return am.msg('支付宝未支付完成');
                }
            }
            if(am.operateArr.indexOf('a64') != -1){
                if(this.payed.DIANPIN && !this.dianpinData){
                    return am.msg('点评支付未关联点评券');
                }
            }
            if(am.operateArr.indexOf('a65') != -1){
                if(this.payed.KOUBEI && !this.koubeiData){
                    return am.msg('口碑支付未关联口碑券');
                }
            }
            for(var key in this.unpayed){
                if(!this.payed[key]){
                    this.payed[key] = 0;
                }  
                this.payed[key] += this.unpayed[key];
                delete this.unpayed[key]; 
            }
            for(var key in this.payed){
                if(this.exchangeKey(key)){
                    bill[this.exchangeKey(key)] = this.payed[key];
                }
            }
            console.log(bill);

            if (this.payed.DIANPIN) {
                //商城卡支付加上 点评优惠券的钱
                if(this.dianpinData){
                    bill.dpCouponId = this.dianpinData.id;
                }else {
                    bill.dpCouponId = null;
                }
            } else {
                bill.dpCouponId = null;
            }

            if (this.payed.KOUBEI) {
                //商城卡支付加上 口碑优惠券的钱
                bill[this.kbSetting.field.toLowerCase()] = this.payed.KOUBEI;
                if(this.koubeiData){
                    bill.kBOrderid = this.koubeiData.id;
                }else {
                    bill.kBOrderid = null; 
                }
            } else {
                bill.kBOrderid = null;
            }

            if(this.paperData){
                var luckymoney = [];
                for(var key in this.paperData){
                    var package = this.paperData[key];
                    var rule = JSON.parse(JSON.parse(JSON.parse(package.rule).content).rule);
                    var type = rule.extraRule.type;
                    if(type==2 || package.usedMoney*1){
                        luckymoney.push({
                            id: package.id,
                            realMoney: package.usedMoney,
                            money: package.money,
                            discount: rule.extraRule.discount,
                            type: rule.extraRule.type,
                            activityTitle: JSON.parse(JSON.parse(package.rule).content).title,
                            usedOnProd:package.usedOnProd
                        })
                    }
                }
                var serviceLuckMoneys=[],productLuckMoneys=[];
                if(luckymoney && luckymoney.length){
                    var luckymoneyTotal = 0;
                    for(var i=0;i<luckymoney.length;i++){
                        var luckyMoneyItem=luckymoney[i];
                        if(luckyMoneyItem.type!=2){
                            luckymoneyTotal += luckyMoneyItem.realMoney;
                        }
                        if (luckyMoneyItem.usedOnProd && luckyMoneyItem.usedOnProd === 1) {
                            productLuckMoneys.push(luckyMoneyItem);
                        }else{
                            serviceLuckMoneys.push(luckyMoneyItem);
                        }
                    }
                    var realLuckyMoney = luckymoneyTotal;
                    if (bill.total < realLuckyMoney) {
                        realLuckyMoney = bill.total;
                    }
                    bill.luckymoney = realLuckyMoney;
                    bill.luckyMoneyId = -1;
                    bill.luckMoneys = luckymoney;
                    bill.productLuckMoneys=productLuckMoneys;
                    bill.serviceLuckMoneys=serviceLuckMoneys;
                }
            }
            
            if (this.prepayData && this.payed.PREPAY) {
                var orderType = this.prepayData.type;
                if(orderType==4){
                    orderType = 6;
                }else if(orderType==5){
                    orderType = 7;
                }
                this.opt.option.orderDetail = [
                    {
                    "payOrderId":this.prepayData.id//收款流水id
                    ,"amount":this.payed.PREPAY //关联金额
                    ,"orderType":orderType //收款流水类型 支付方式1微信2支付宝3点评
                    ,"billType":1//明细类型  1水单2开支
                    }
                ]
                if (this.prepayData.type == 1) {
                    bill.weixin += this.payed.PREPAY;
                    bill.weixinId = this.prepayData.id;
                } else if (this.prepayData.type == 2) {
                    bill.pay += this.payed.PREPAY;
                    bill.payId = this.prepayData.id;
                }else if (this.prepayData.type == 4) {
                    bill.unionPay += this.payed.PREPAY;
                    bill.unionOrderId =this.prepayData.id;
                }else if (this.prepayData.type == 5) {
                    bill[this.jdSetting.field.toLowerCase()] += this.payed.PREPAY;
                    bill.jdOrderId =this.prepayData.id;
                } else {
                    alert('error: 请向shuwu报告');
                }
            }

            if(this.onlineData && this.onlineData.length){
                if(!this.opt.option.orderDetail || !this.opt.option.orderDetail.length){
                    this.opt.option.orderDetail = [];
                }
                for(var i=0;i<this.onlineData.length;i++){
                    var orderType = this.onlineData[i].type;
                    if(orderType==4){
                        orderType = 6;
                    }else if(orderType==5){
                        orderType = 7;
                    }
                    this.opt.option.orderDetail.push({
                        "payOrderId":this.onlineData[i].id//收款流水id
                        ,"amount":this.onlineData[i].price //关联金额
                        ,"orderType":orderType //收款流水类型 支付方式1微信2支付宝3点评
                        ,"billType":1//明细类型  1水单2开支
                    })
                }
            }

            if (this.mallorderData && this.payed.MALLORDER) {
                bill.mallId = this.mallorderData.id;
                bill.mallNo = this.mallorderData.code;
                bill.mallCategory = this.mallorderData.category;
                bill.mallOrderFee = (this.payed.MALLORDER || 0);
            }

            bill.eaFee = bill.total;

            if(this.opt.servOption){
                this.opt.servOption.billingInfo.eaFee =  this.opt.servOption.billingInfo.total;
            }
            if(this.opt.prodOption){
                this.opt.prodOption.billingInfo.eaFee =  this.opt.prodOption.billingInfo.total;
            }

            if (this.opt.member) {
                this.opt.option.memId = this.opt.member.id;
                this.opt.option.cardId = this.opt.member.cid;
                this.opt.option.discount = this.opt.member.discount || 10;
            } else {
                this.opt.option.memId = 0;
            }
            return this.submitToServer(isPrint,pw);
        },
        submitToServer: function (isPrint,pw) {
            var _this = this,
                b = this.opt.option.billingInfo,
                sum = b.cardFee + b.presentFee + b.cashFee + b.unionPay + b.cooperation + b.mall + b.weixin + b.pay + b.voucherFee + b.mdFee + b.dpFee + b.treatfee + b.treatpresentfee + b.luckymoney + b.coupon + b.divideFee + b.debtFee + b.jdFee + b.mallOrderFee + b.onlineCreditPay + b.offlineCreditPay;
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
				var popupAgain = 0;
				if(this.opt.settlementPayDetail || am.metadata.shopPropertyField.manualInputBillno != 1 || _this.$header.find(".billno input").val().trim()){
					popupAgain = 0;
				} else {
					popupAgain = 1;
				}
				this.opt.member.popupAgain = popupAgain;
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
                    this.setMutiBillingInfo();
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
                }else {
                    this.getServAndProdPay();
                }
            }else {
                this.getServAndProdPay();
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
            if(this.opt.member){
				//如果有卡升级的那么把卡升级的id传过去
				if(!am.isNull(this.cardUpId)){
					this.opt.option.cardUpId = this.cardUpId;
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
            this.opt.option.billingInfo.onlineCredit = Math.ceil(this.opt.option.billingInfo.onlineCreditPay  * (am.metadata.configs.onlineCreditPay || 1));
            this.opt.option.billingInfo.offlineCredit = Math.ceil(this.opt.option.billingInfo.offlineCreditPay  * (am.metadata.configs.offlineCreditPay || 1));
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
                realOption.billingInfo.luckMoneys = this.opt.option.billingInfo.serviceLuckMoneys;

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
                realOption.billingInfo.luckMoneys = this.opt.option.billingInfo.productLuckMoneys;
                if(_billNo){
                    realOption.billNo = _billNo;
                }
            }
            if(_billNo){
                this.opt.option.billNo = _billNo;
            }            
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
						if(ret.content && ret.content.newCardTypeId){
							var discountStr = '';
							var cardData = am.metadata.cardTypeMap[ret.content.newCardTypeId] || {};
							if(cardData.buydiscount > 0){
								// discountStr += '套餐' + cardData.buydiscount + '折';
							}
							if(cardData.discount > 0){
								discountStr += '项目' + cardData.discount + '折';
							}
							str = '恭喜您，此卡已升级为' + cardData.cardtypename + '可享' + discountStr;
							$("#itemPayConfirm").find(".cardUpTip").text(str);
						}

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
                            _this.payTips.open(function () {
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
                    }else if(ret.code == 1002034){
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
                    if(_this.opt.instoreServiceVersion){
                        _this.opt.servOption.instoreServiceVersion = _this.opt.prodOption.instoreServiceVersion = _this.opt.instoreServiceVersion;
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
                    if(_this.opt.instoreServiceVersion){
                        _this.opt.option.instoreServiceVersion = _this.opt.instoreServiceVersion;
                    }
                    am.api.billCheck.exec(_this.opt.option, callback);
                }
            }

            if(!this.checkBillNoSuccess){
                if(amGloble.metadata.shopPropertyField.aotomodifybillno == 1){
                    _this.payTips.open(function () {
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
                    },_this.opt.option.billNo);
                }else {
                    am.msg('单号重复');
                    return;
                }
            }else {
				_this.getBillNo(toPay);
            }
        },
        payTypeMap: am.page.pay.payTypeMap,
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
                if(items[i].paySetting){
                    var _payDetail = {};
                    for(var key in items[i].paySetting){
                        _payDetail[this.payTypeMap[this.exchangeKey(key)]] = items[i].paySetting[key];
                    }
                    itemdata.payDetail = _payDetail;
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
                    treatpresentfee: billingInfo.treatpresentfee || 0
                };
            }
            opt.rate = 1;
            //006 计算业绩
            console.log('computingPerformance:', opt);
            console.log(JSON.stringify(opt));
            var ret = computingPerformance.computing(opt);
            console.log('computingPerformance return:', ret);
            var eaFee = 0;
            for (var i = 0; i < items.length; i++) {
                var payDetail;
                if(items[i].paySetting){
                    var _payDetail = {};
                    for(var key in items[i].paySetting){
                        _payDetail[this.payTypeMap[this.exchangeKey(key)]] = items[i].paySetting[key];
                    }
                    payDetail = _payDetail;
                    delete items[i].paySetting;
                }else {
                    payDetail = ret[i].total;
                }
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
						perfDetail.voidFee = items[i].salePrice;
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
					perfDetail.voidFee = items[i].salePrice;
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
        computeProductPayDetail: function () {
            var billOption = this.opt.prodOption || this.opt.option;
            var billingInfo = billOption.billingInfo;
            var depots = billOption.products.depots;
            for (var i = 0; i < depots.length; i++) {
                var _payDetail = {};
                for(var key in depots[i].paySetting){
                    _payDetail[this.payTypeMap[this.exchangeKey(key)]] = depots[i].paySetting[key];
                }
                depots[i].payDetail = {};
                for (var j in this.payTypeMap) {
                    var k = this.payTypeMap[j];
                    depots[i].payDetail[j] = _payDetail[k] || 0;
                    //TODO
                    if (k === 'onlineCreditPay') {
                        depots[i].payDetail.onlineCredit = _payDetail[k] * am.metadata.configs.onlineCreditPay || 0;
                    } else if (k === 'offlineCreditPay') {
                        depots[i].payDetail.offlineCredit = _payDetail[k] * am.metadata.configs.offlineCreditPay || 0;
                    }
                }
                delete depots[i].paySetting;
            }
        },
        computePerSetPerf: function (type) {
            var isRepeat = this.opt.prodOption && this.opt.option;
            var expenseCategory = isRepeat ? this.opt.prodOption.expenseCategory : this.opt.option.expenseCategory;
            if (expenseCategory) {
                var billingInfo = isRepeat ? this.opt.prodOption.billingInfo : this.opt.option.billingInfo;
                var sellingItems = [];
                if (expenseCategory === 1) {
                    sellingItems = sellingItems.concat(isRepeat ? this.opt.prodOption.products.depots : this.opt.option.products.depots);
                }
                for (var d = 0, len = sellingItems.length; d < len; d++) {
                    var servers = sellingItems[d].servers;
                    if (servers && servers.length) {
                        t = sellingItems[d].salePrice * sellingItems[d].number - (sellingItems[d].payDetail.debtFee || 0); // 每个卖品的实际售价 欠款不算业绩
                        var payMoneyCategoryPctObj = this.getPayMoneyCategoryPctObj({
                            total: t,
                            payDetail: sellingItems[d].payDetail
                        });
                        var payFeePctObj = this.getPayFeePctObj({
                            total: t,
                            payDetail: sellingItems[d].payDetail,
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
                                if (expenseCategory === 4 && am.metadata.configs.combNotCalIntoAchiev != 'true') {
                                    servers[i].perf *= (t - (this.opt.option.cost || 0)) / billingInfo.total;
                                } else {
                                    servers[i].perf *= t / billingInfo.total;
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
            }
        },
        getPayMoneyCategoryPctObj: function(params){
            return am.page.pay.getPayMoneyCategoryPctObj(params);
        },
        getPayFeePctObj: function(params){
            return am.page.pay.getPayFeePctObj(params);
        },
        getPayMoneyCategoryObj:function(params){
            return am.page.pay.getPayMoneyCategoryObj(params);
        },
        checkIfNeedUpgradeCardType:function(billId){
            am.page.pay.checkIfNeedUpgradeCardType.call(this,billId);
        },
        showPayConfirm:function(billId){
            am.page.pay.showPayConfirm.call(this,billId);
        },
        showPaySuccess:function(billId){
            am.page.pay.showPaySuccess.call(this);
        },
        paySuccess:function(billId){
            am.page.pay.paySuccess.call(this);
        },
        setMediaShow:function(paras, model){
            this.needPay = this.opt.option.billingInfo.total - this.comboDeduct + (this.opt.option.cost || 0)
            am.page.pay.setMediaShow.call(this,paras, model);
        },
        getUniqueId:function(){
            return am.page.pay.getUniqueId();
		},
		getBillNo:function(cb){
            am.page.pay.getBillNo.call(this, cb);
        },
        getCalacAjax:function(params, url, sc, item){
            am.page.pay.getCalacAjax.call(this,params, url, sc, item);
        },
        recalcRoyalty:function(params, url, sc, item){
            am.page.pay.recalcRoyalty.call(this,params, url, sc, item);
        },
        getGainAndVoidFee:function(){
            var type = this.opt && this.opt.option && this.opt.option.expenseCategory
            am.page.pay.getGainAndVoidFee.call(this,type);
        },
        changeRedPackageStatus:function(data,lis){
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
            for(var i=0;i<selectedReds.length;i++){
                var sRed = selectedReds[i];
                var sOther = false;
                if(!sRed.templateId){

                }else {
                    if(sRed.rule && JSON.parse(sRed.rule).content){
                        var sRule = JSON.parse(JSON.parse(JSON.parse(sRed.rule).content).rule);
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
                            if(hasOld){
                                $(lis[j]).addClass('notUseThisBill am-disabled');
                            }
                        }else {
                            $(lis[j]).removeClass('notUseThisBill am-disabled');
                            if(red.rule && JSON.parse(red.rule).content){
                                var rule = JSON.parse(JSON.parse(JSON.parse(red.rule).content).rule);
                                if(rule.luckyMoneyRule.allowCashierPay.otherRedPackage){
                                    $(lis[j]).addClass('notUseThisBill am-disabled');
                                }else {

                                }
                            }else {
                                $(lis[j]).addClass('notUseThisBill am-disabled');
                            }
                        }
                    }
                }
            }
        }, 
        checkSingleUse:function(){
            am.page.pay.checkSingleUse.call(this);
        },
        // 可用卖品
        getUseableDepots:function(depotsInBill,depotsInRule){
            var arr= [];
            if(depotsInBill.length){
                if(depotsInRule.length){
                    var depotsArr=depotsInRule.split(',');
                    if(depotsArr[0]=='a'){
                        // 全部卖品可用
                        arr=depotsInBill;
                    }else if(depotsArr[0]=='r'){
                        // 指定卖品不能用
                        for(var j=0,jlen=depotsInBill.length;j<jlen;j++){
                            if(depotsArr.indexOf(depotsInBill[j].no+'')==-1){
                                arr.push(depotsInBill[j])
                            }
                        }
                    }else{
                        // 指定卖品能用
                        for(var i=0,len=depotsArr.length;i<len;i++){
                            for(var j=0,jlen=depotsInBill.length;j<jlen;j++){
                                if(depotsArr[i]==depotsInBill[j].no){
                                    arr.push(depotsInBill[j])
                                }
                            }
                        }
                    }
                }else{
                    arr=depotsInBill;
                }
            }
            return arr;
        },
        getAppointServiceItems:function(serviceItems,appointServiceItems){
            return am.page.pay.getAppointServiceItems(serviceItems,appointServiceItems);
        },
        getAppointServiceItemsTotal:function(appointServiceItems){
            return am.page.pay.getAppointServiceItemsTotal(appointServiceItems);
        }, 
        getAppointTreatmentsTotal:function(treatmentsInBill){
            return am.page.pay.getAppointServiceItemsTotal(treatmentsInBill);
        },
        setMutiBillingInfo: function () {
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

            var payDetail = this.getServAndProdPay();
            var servDetail = payDetail.serviceDetail,
                prodDetail = payDetail.productDetail;
            for(var key in servDetail){
                if(this.exchangeKey(key)){
                    servBill[this.exchangeKey(key)] = servDetail[key];
                }
            }
            for(var key in prodDetail){
                if(this.exchangeKey(key)){
                    prodBill[this.exchangeKey(key)] = prodDetail[key];
                }
            }
            console.log(this.opt);
        },
        getServAndProdPay: function(){
            var list = this.$listWrapper.find('.item');
            var service = [],
                product = [];
            for(var i=0;i<list.length;i++){
                var $item = $(list[i]);
                var item = $item.data('data');
                if(item.id && item.consumeType==0){
                    service.push(this.getItemPayDetail($item));
                }else if(item.productid) {
                    product.push(this.getItemPayDetail($item));
                }
            }
            var serviceDetail = {};
            for(var i=0;i<service.length;i++){
                for(var key in service[i]){
                    if(!serviceDetail[key]){
                        serviceDetail[key] = 0;
                    }
                    serviceDetail[key] += service[i][key];
                }
            }
            var productDetail = {};
            for(var i=0;i<product.length;i++){
                for(var key in product[i]){
                    if(!productDetail[key]){
                        productDetail[key] = 0;
                    }
                    productDetail[key] += product[i][key];
                }
            }
            return {
                serviceDetail: serviceDetail,
                productDetail: productDetail
            }
        },
        getItemPayDetail: function($item){
            var data = $item.data('data');
            var payDetail = {};
            var payInfos = $item.find('.payInfo');
            var voucherFee = 0;
            for(var i=0;i<payInfos.length;i++){
                var payInfo = $(payInfos[i]);
                var type = payInfo.data('type'),
                    detail = payInfo.data('detail');
                if(type && detail && detail.price){
                    if(type=='KOUBEI'){
                        type = this.kbSetting.field.toUpperCase()
                    }
                    if(type=='JINGDONG'){
                        type = this.jdSetting.field.toUpperCase()
                    }
                    var _voucherFee = detail.voucherFee || 0;
                    detail.price = Math.round((detail.price-_voucherFee)*100)/100;
                    voucherFee += _voucherFee;
                    payDetail[type] = detail.price;
                }
            }
            if(voucherFee){
                payDetail['VOUCHERFEE'] = Math.round(voucherFee*100)/100;
            }
            data.paySetting = payDetail;
            return payDetail;
        },
        setHeight: function(toTop){
            this.$listWrapper.css('height','auto');
            var height = this.$listContainer.height();
            this.$listWrapper.css('height',height+'px');
            this.listScroll.refresh();
            if(toTop){
                this.listScroll.scrollTo('top');
            }
        },
    });

})();
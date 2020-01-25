(function ($) {
    am.consumeDetail = {
        init: function () {
            var _this = this;
            this.$ = $("#billDetail"),
            this.$content = this.$.find(".content");
            this.$package = this.$.find(".package").remove();
            this.ItemsScroll = new $.am.ScrollView({
                $wrap: this.$.find('.selectItem'),
                $inner: this.$.find('.scollItem>ul'),
                direction: [false, true],
                hasInput: false,
            });
            this.$.on("vclick", ".ok", function () {
                $.each(_this.comboitems,function(i,v){
                    v.tleavetimes = v.leavetimes;
                });
                _this.billData.instorecomment = _this.$content.find('.billRemark').val();
                _this.submit && _this.submit({
                    'comboitems':_this.comboitems,
                    'billData':_this.billData
                });
                _this.hide();
            }).on("click", ".mask", function () {
                _this.cancel && _this.cancel();
                _this.hide();
            }).on('vclick','.cancle',function(){
                _this.cancel && _this.cancel();
                _this.hide();
            }).on('vclick','.itemContent .itemName',function(){
                var $li = $(this).parent();
                var $ul = $li.parent();
                if($li.find(".package").length>0){
                    var flag = 1;
                }else{
                    var flag = 0;
                }
                $ul.find('li').each(function(){
                    $(this).find('.itemName').removeClass('open');
                    $(this).find('.package').remove();
                })
                if(flag){return};
                var serviceItem = $li.data('data');
                $(this).addClass('open');
                var $package = _this.renderComboInfo(serviceItem,_this.comboitems);
                $li.append($package);
                _this.ItemsScroll.refresh();
                _this.ItemsScroll.scrollTo('top');
            }).on('vclick','.package li',function(){
                if($(this).hasClass('selected')){return};
                var toSelectedComboItem = $(this).data('data');
                var hasSelectedComboItem = $(this).parent().find('.selected').data('data');
                var serviceItem = $(this).parents('.itemLi').data('data');
                if(typeof(toSelectedComboItem)=="undefined"){
                    _this.notUseComboItem(serviceItem,hasSelectedComboItem);
                }else if(typeof(hasSelectedComboItem)=="undefined"){
                    if(toSelectedComboItem.tleavetimes==0){
                        am.msg('套餐余量不足，请重新选择套餐！')
                        return;
                    }else{
                        _this.useComboItem(serviceItem,toSelectedComboItem);
                    }
                }else{
                    if(toSelectedComboItem.tleavetimes==0){
                        am.msg('套餐余量不足，请重新选择套餐！')
                        return;
                    }else{
                        _this.notUseComboItem(serviceItem,hasSelectedComboItem);
                        _this.useComboItem(serviceItem,toSelectedComboItem);
                    }
                }
                _this.renderBillInfo(_this.billData);
                // $(this).siblings().removeClass("selected");
                // $(this).addClass("selected");
                // var $package = _this.renderComboInfo(serviceItem,_this.comboitems);
                // $(this).parents('.itemLi').find('.itemName').removeClass('open');
                // $li = $(this).parents('.itemLi');
                // $li.find('.itemCost').text('￥'+serviceItem.discountPrice)
                // $li.find('.package').remove();
                // $li.append($package);
            });
        },
        useComboItem:function(serviceItem,comboitem){
            serviceItem.consumeId = comboitem.id;
            serviceItem.discountPrice = 0;
            serviceItem.sumtimes = comboitem.sumtimes;
            serviceItem.consumeType = 1;
            serviceItem.useComboItem = 1;
            if(comboitem.tleavetimes != -99){
                comboitem.tleavetimes--;
            }
            serviceItem.comboitem = comboitem;
        },
        notUseComboItem:function(serviceItem,comboitem){
            delete serviceItem.consumeId;
            delete serviceItem.sumtimes;
            delete serviceItem.comboitem;
            serviceItem.discountPrice = serviceItem.odiscountPrice;
            serviceItem.consumeType = 0;
            serviceItem.useComboItem = 0;
            if((comboitem.tleavetimes != -99) || (comboitem.tleavetimes!=comboitem.sumtimes)){
                comboitem.tleavetimes++;
            }
        },
        show: function (paras,submit) {
            if (!this.$){
                this.init();
            }
            var _this = this;
            this.billData = am.clone(paras.billData);
            this.comboitems = am.clone(paras.comboitems);
            this.submit = submit;
            this.renderBillInfo(this.billData);
            this.ItemsScroll.refresh();
            this.ItemsScroll.scrollTo('top');
            this.$.removeClass("dark").show().children().removeClass("show");
            this.animateTimer && clearTimeout(this.animateTimer);
            this.animateTimer = setTimeout(function() {
                _this.$.addClass("dark");
                _this.$content.addClass("show");
                _this.animateTimer = null;
			}, 100);
        },
        findComboItemByItem:function(serviceItem,comboitems){
            var itemId = serviceItem.itemId;
            var matchedItems = [];
            $.each(comboitems,function(i,comboitem){
                if(comboitem.itemid==itemId){
                    matchedItems.push(comboitem);
                }else if(comboitem.timesItemNOs&&comboitem.timesItemNOs.split(",").indexOf(itemId) !=-1){
                    matchedItems.push(comboitem);
                }else if(comboitem.itemid==-1 && !comboitem.timesItemNOs){
                    matchedItems.push(comboitem);
                }
            });
            return matchedItems;
        },
        renderBillInfo: function(billData){
            var _this = this;
            var serviceItems = billData.data && billData.data.serviceItems;
            var productItems = billData.data&&billData.data.products&&billData.data.products.depots;
            this.$content.find('.billNo').text(billData.displayId);
            this.$content.find('.name').text(billData.memName?billData.memName:"散客");
            this.$content.find('.sex').text(billData.data.genderGuest == 0?"女客":"男客");
            this.$content.find('.billRemark').val(billData.instorecomment);
            this.$content.find('.itemContent').empty();
            if(productItems){
                $.each(productItems,function(i,productItem){
                    var productCost;
                    if(typeof(productItem.discountPrice)=="undefined"){
                        productCost = productItem.salePrice
                    }else{
                        productCost = productItem.discountPrice
                    }
                    var $li = $(['<li>',
                    '			  	  <span class="itemName">'+productItem.productName+'</span>',
                    '			  	  <span class="itemCost">￥'+(productCost*productItem.number)+'</span>',
                    '			  	  <span class="itemNum">×'+productItem.number+'</span>',
                    '			  </li>'].join(""));
                    _this.$content.find('.itemContent').append($li);
                })
            }
            if(serviceItems){
                $.each(serviceItems,function(i,serviceItem){
                    var serviceCost;
                    if(typeof(serviceItem.discountPrice)=="undefined"){
                        serviceCost = serviceItem.price;
                    }else{
                        serviceCost = serviceItem.discountPrice;
                    }
                    var $li = $(['<li class="itemLi">',
                    '			  	  <span class="itemName">'+serviceItem.name+'</span>',
                    '			  	  <span class="itemCost">￥'+serviceCost+'</span>',
                    '			  	  <span class="itemNum"></span>',
                    '			  </li>'].join(""));
                    if(serviceItem.isComboItem&&serviceItem.isComboItem==1){
                        $li.find('.itemName').addClass('isComboItem am-clickable');

                    }
                    if(serviceItem.comboitem){
                        $li.find('.itemName').text(serviceItem.name + '(套餐)');
                        $li.find('.itemCost').text('￥' + serviceItem.comboitem.oncemoney);
                        $li.find('.itemCost').css('color','#999');
                    }
                    $li.data('data',serviceItem);
                    _this.$content.find('.itemContent').append($li);
                })
            }
        },
        renderComboInfo: function(serviceItem,comboitems){
            var matchedItems = this.findComboItemByItem(serviceItem,comboitems);
            var $package = this.$package.clone(true,true);
            var hasSelectd = 0;
            $package.find('li').removeClass("selected");
            if(matchedItems){
                $.each(matchedItems,function(i,matchedItem){
                    var $li = $(['<li class="am-clickable selected">',
                    '			  	  <div class="times">余'+(matchedItem.tleavetimes==-99?"无限":matchedItem.tleavetimes)+'次<span>(总'+(matchedItem.sumtimes==-99?"无限":matchedItem.sumtimes)+'次)</span></div>',
                    '			  	  <div class="itemName1"></div>',
                    '			  	  <div class="invalidDate">'+ (matchedItem.validdate==null?"不限期":new Date(matchedItem.validdate).format('yyyy-mm-dd')+"到期") +'</div>',
                    '			  </li>'].join(""));
                    if(matchedItem.timesItemNOs){
                        var itemname = am.page.comboCard.getItemNamesByNos(matchedItem.timesItemNOs).join(",");
                        $li.find('.itemName1').text(itemname);
                    }else{
                        $li.find('.itemName1').text(serviceItem.name);
                    }
                    $li.data('data',matchedItem);
                    $package.find('ul').append($li);
                    if(serviceItem.consumeId==matchedItem.id){
                        $li.addClass("selected");
                        hasSelectd = 1;
                    }else{
                        $li.removeClass("selected");
                    }
                })
                if(hasSelectd){
                    $package.find('ul').prepend($('<li class="am-clickable">不使用套餐项目</li>'));
                }else{
                    $package.find('ul').prepend($('<li class="am-clickable selected">不使用套餐项目</li>'));
                }
            }
            return $package
        },
        hide: function () {
            var _this = this;
            if(this.animateTimer){
                return;
            };
            this.$content.removeClass("show");
            this.$.removeClass("dark");
            this.animateTimer && clearTimeout(this.animateTimer);
            this.animateTimer = setTimeout(function() {
                _this.$.hide();
                _this.animateTimer = null;
            }, 250);
        }
    }
    var self = am.page.mergePay = new $.am.Page({
        id: "page_mergePay",
        backButtonOnclick: function () {
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
            }else{
                $.am.page.back("slidedown");
            }
        },
        init: function () {
            //初始化
            var _this = this;
            this.$right = this.$.find(".right");
            this.$left = this.$.find(".left");
            this.$cashTipTotal = this.$.find('.cash .highlight');
            this.$submit = this.$.find(".submit");
            this.$posTipTotal = this.$.find('.pos .highlight');
            this.$billLi = this.$.find('.billInfoTemp').remove();
            this.$checkedItemsTitle = this.$right.find('.payTip.card .checkedItemsTitle');
            this.$checkedItemsNames = this.$right.find('.payTip.card .checkedItemsNames');
            this.submitbillList = [];
            _this.submitArr = [];
            _this.compareTime = function(time1, time2) {
                    return time2 / 1000 - time1 / 1000;
                };

            if(device2.windows() || navigator.platform.indexOf("Mac") == 0 ) {
                $('#page_mergePay .submit').hide();
                $('#page_mergePay .submit.keypadPC').show();
                $('#page_mergePay .payTypes li b').show();
            }else {
                $('#page_mergePay .submit.keypadPC').hide();
                $('#page_mergePay .payTypes li b').hide();
            }
            this.paytool.init();
            this.paytool.reset();
            this.payTips = am.page.pay.payTips;
            this.payTips.init();
            this.$confirm = $('#mergePayConfirm');
            $('#mergePayConfirm .goBack').vclick(function () {
                _this.paySuccess();
            });
            this.checkedItemsScroll = new $.am.ScrollView({
                $wrap: this.$right.find('.checkedItemsWrap'),
                $inner: this.$right.find('.checkedItemsWrap .checkedItemsWrapper'),
                direction: [false, true],
                hasInput: false,
            });
            this.billsScroll = new $.am.ScrollView({
                $wrap: this.$left.find('.billsDetail'),
                $inner: this.$left.find('.scollBills>ul'),
                direction: [false, true],
                hasInput: false,
            });
            this.$.on('vclick','.billInfoTemp',function(){
                var _this = this;
                var $li = $(this);
                var billData = $li.data("data");
                var index = $li.index();
                var params = {
                    billData : billData,
                    comboitems : self.comboitems
                }
                am.consumeDetail.show(params, 
                    function (data) {
                        self.comboitems = data.comboitems;
                        self.billDataList[index] = data.billData;
                        self.renderBillList(self.billDataList);
                        self.onPriceChange();
                    }
                );
            }).on('vclick','.submit',function(){
                var $type = self.$payTypes.filter(".selected");
                if($type.length==0&&self.needPay!=0){
                    am.msg("请选择一种支付方式");
                    return;
                };
                if(am.metadata.shopPropertyField.manualInputBillno==1){
                    var modifyFlag = self.checkBillsNo();
                    if(modifyFlag == false){
                        am.msg('请手动输入修改单号');
                        return;
                    }
                }
                self.submitbillList = [];
                var optList = self.translateBillData(self.billDataList);
                if(optList.length){
                    self.submitToServer(optList);
                }
            }).on('vclick','.memberCount',function(e){
                e.stopPropagation();
                var $li = $(this).parents('.billInfoTemp');
                var index = $li.index();
                var $this = $(this);
                if ($this.hasClass("checked")) {
                    $this.removeClass("checked");
                    self.billDataList[index].clientflag = 0;
                } else {
                    $this.addClass("checked");
                    self.billDataList[index].clientflag = 1;
                }
            }).on('vclick','.serviceNO',function(e){
                e.stopPropagation();
                if(am.metadata.shopPropertyField.manualInputBillno != 1 && am.metadata.shopPropertyField.mgjBillingType==1 && am.operateArr.indexOf('a37')==-1){
                    am.msg("没有权限修改单号！");
                    return;
                }
                var $li = $(this).parents('.billInfoTemp');
                var index = $li.index();
				var $this = $(this);
                am.keyboard.show({
					title:"请输入单号",//可不传
					hidedot:true,
				    submit:function(value){
                        if(isNaN(value)){
                            am.msg('请输入正确的数值！');
                            return;
                        }
                        var serviceNOs = [];
                        serviceNOs.push(value);
                        self.$.find('.serviceNO').each(function(){
                            serviceNOs.push($(this).text())
                        })
                        var isRepeat = self.isRepeat(serviceNOs);
                        if(isRepeat&&($this.text()!=value)){
                            am.msg('新开单号之间不允许重复');
                            return false;
                        }
                        if(value.length > 20){
                            am.msg('单号长度超过20位数字已自动截取');
                        }
                        delete self.billDataList[index].autoModifyBillNo;
                        value = value.substring(0, 20)
						am.api.checkBillNo.exec({
                            billNo: value,
                            shopId: amGloble.metadata.userInfo.shopId
                        },function(ret){
                            if(ret.code==0){
                                self.billDataList[index].serviceNO = value;
                                $this.addClass('modified');
                                $this.removeClass('red');
						        $this.text(value);
                            }else if(ret.code==11009){
                                if(amGloble.metadata.shopPropertyField.aotomodifybillno != 1){
                                    am.msg('单号重复');
                                    return false;
                                }else{
                                    self.payTips.open(function () {
                                        self.billDataList[index].serviceNO = value;
                                        self.billDataList[index].autoModifyBillNo = 1;
                                        $this.addClass('modified');
                                        $this.removeClass('red');
						                $this.text(value);
                                    }, function () {
                                        am.msg('单号重复');
                                        return;
                                    },value);
                                    
                                }
                            }
                        });
					}
				});
            }).on('vclick','.cusSource',function(e){
                e.stopPropagation();
                var $li = $(this).parents('.billInfoTemp');
                var index = $li.index();
                var $this = $(this);
                var billData =  self.billDataList[index];
                var sourcedata = billData.data.sourcedata;
                am.sourceModal.show({
					mgjsourceid: sourcedata?sourcedata.mgjsourceid:"",
					sourceSave: function (data) {
						$this.text(data.mgjsourcename);
						billData.data.sourcedata = data;
					}
				})
            });
            this.$whynot = this.$.find('.whynot').vclick(function(e){
                e.stopPropagation();
                if($(this).find('.text').text()){
                    am.msg($(this).find('.text').text());
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
                    .removeClass("pay_jd");
                if ($this.hasClass("pay_memberCard")) {
                    _this.$right.addClass("pay_memberCard");
                    _this.renderMemberCard();
                } else if ($this.hasClass("pay_pos")) {
                    _this.$right.addClass("pay_pos");
                    _this.$posTipTotal.text(_this.needPay + '元');
					//如果没配置走之前的逻辑,有配置则显示弹窗
					_this.paytool.show("pos");
                } else if ($this.hasClass("pay_cash")) {
                    _this.$right.addClass("pay_cash");
                    _this.$cashTipTotal.text(_this.needPay + '元');
                } else if ($this.hasClass("pay_wechat")) {
                    _this.$right.addClass("pay_wechat");
                    _this.paytool.show("wechat");
                } else if ($this.hasClass("pay_alipay")) {
                    _this.$right.addClass("pay_alipay");
                    _this.paytool.show("alipay");
                } else if($this.hasClass("pay_jd")){
                    _this.$right.addClass("pay_jd");
                    _this.paytool.show("jd");
                } else if ($this.hasClass("pay_bonus")) {
                    _this.$right.addClass("pay_memberCard");
                    _this.renderMemberCard(1);
                }
            });

            $.am.on('instoreServiceHasBeenChanged',function(data){
				if($.am.getActivePage() == _this){
                    var bills = _this.billDataList;
                    for(var i=0;i<bills.length;i++){
                        if(bills[i].id==data.instoreServiceId){
                            am.billChangeToHangup();
                            return;
                        }
                    }
				}
			});

        },
        showSmsSendFlag:function(){
            this.$smsSendFlag.removeClass('checked');
            if(this.member==-1){
                this.$smsSendFlag.hide();
                this.smsflag = '0';
                return;
            }
            var isAllowed = amGloble.operateArr.indexOf('Q')==-1?false:true;
            var smsflag = '0';
            var cardList = amGloble.metadata.cardTypeList.concat(amGloble.metadata.defaultCardTypeList || []);
            if(cardList.length){
                for(var i=0;i<cardList.length;i++){
                    if(cardList[i].cardtypeid==this.member.cardTypeId){
                        smsflag = cardList[i].smsflag;
                    }
                }
            }
            this.smsflag = smsflag;
            
            if(!isAllowed){
                this.$smsSendFlag.hide();
            }else {
                this.$smsSendFlag.show();
                if(smsflag==0){
                    this.$smsSendFlag.html('不发送微信消息请打勾');
                }else if(smsflag==1){
                    this.$smsSendFlag.html('不发送短信和微信消息请打勾');
                }
                if(this.member.cardtype==2){
                    this.$smsSendFlag.hide();
                }
            }
        },
        renderMemberCard : function (isBonus) {
            if (!this.$cardTipTotal) {
                this.$cardTipTotal = this.$.find('.card .highlight');
                this.$cardTipInfo = this.$.find('.cardBg');
                this.$isBonus = this.$.find(".balanceORbonus");
            }
            var member = this.member;
            if (isBonus) {
                this.$isBonus.text("赠送金");
                this.$cardTipTotal.text(this.needPay + '元');
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
        },
        renderBillList: function (billDataList) {
            //渲染订单列表
            this.$.find('.scollBills>ul').empty();
            $.each(billDataList,function(i,billData){
                $li = self.renderBill(billData);
                self.$.find('.scollBills>ul').append($li);
            })
        },
        renderBill:function(billData){
            var sumfee = 0;
            var prodSumfee = 0;
            var comboItemCost = 0;
            var hasService = 0;
            var hasProduct = 0;
            var usedComboItems = {};
            var serviceItems = billData.data && billData.data.serviceItems;
            var productItems = billData.data&&billData.data.products&&billData.data.products.depots;
            if(serviceItems&&serviceItems.length){
                this.hasService = 1;
                hasService = 1;
                $.each(serviceItems,function(i,serviceItem){
                    self.serviceItemsMap[serviceItem.itemId] = serviceItem;
                    if(self.member==-1){
                        sumfee+=serviceItem.price*100;
                    }else{
                        self.processComboItem(serviceItem);
                        if(serviceItem && serviceItem.comboitem){
                            var comboItemName = serviceItem.name;
                            if(usedComboItems[comboItemName]){
                                usedComboItems[comboItemName]++;
                            }else{
                                usedComboItems[comboItemName] = 1;
                            }
                            comboItemCost += serviceItem.comboitemPrice *100;
                            sumfee+=serviceItem.discountPrice *100;
                        }else{
                            sumfee+=serviceItem.discountPrice *100;
                        }
                    }
                })
            }
            if(productItems&&productItems.length){
                this.hasProduct = 1;
                hasProduct = 1;
                if(self.member==-1){
                    $.each(productItems,function(i,productItem){
                        prodSumfee+=productItem.salePrice * productItem.number*100;
                    })
                }else{
                    $.each(productItems,function(i,productItem){
                        prodSumfee+=productItem.discountPrice * productItem.number*100;
                    })
                }
            }
            billData.data.sumfee = sumfee/100;
            billData.data.prodSumfee = prodSumfee/100;
            var $li = self.$billLi.clone(true,true);
            if(billData.memId==-1){
                $li.find('.detailMiddle').show()
                $li.find('.cusSource').text((billData.data.sourcedata&&billData.data.sourcedata.mgjsourcename) || "")
            }else{
                $li.find('.detailMiddle').hide();
            }
            if(hasProduct == 1&&hasService==0){
                $li.find('.detailMiddle').hide();
                $li.find('.memberCount').hide();
            }
            $li.find('.billNo').text(billData.displayId);
            $li.find('.name').text(billData.memName?billData.memName:"散客");
            $li.find('.sex').text(billData.data.genderGuest == 0?"女客":"男客");
            $li.find('.serviceNO').text(billData.serviceNO);
            $li.find('.billCost').text('￥'+(billData.data.sumfee*100+billData.data.prodSumfee*100)/100);
            if(billData.clientflag==0){
                $li.find('.memberCount').removeClass('checked');
            };
            if(JSON.stringify(usedComboItems) == '{}'){
                $li.find('.usedComboItems').remove();
            }else{
                var text = ''
                for (key in usedComboItems){
                    text += key + '*' + usedComboItems[key]+' '
                }
                $li.find('.usedComboItems .detailRight span').text(text+'(总价￥'+ comboItemCost/100 +')');
            }
            $li.data('data',billData);
            return $li;
        },
        consumeComboItem:function(serviceItem,comboitem){
            serviceItem.consumeId = comboitem.id;
            serviceItem.discountPrice = 0;
            serviceItem.comboitemPrice = comboitem.oncemoney;
            serviceItem.sumtimes = comboitem.sumtimes;
            serviceItem.consumeType = 1;
            serviceItem.useComboItem = 1;
            if(comboitem.tleavetimes != -99){
                comboitem.tleavetimes--;
            }
            serviceItem.comboitem = comboitem;
        },
        processComboItem:function(serviceItem){
            var comboitems = this.comboitems;
            var hasUsed = 0;
            var matchedItems = this.findComboItemByItem(serviceItem,comboitems);
            if(matchedItems&&matchedItems.length>0){
                $.each(matchedItems,function(i,matchedItem){
                    if(serviceItem.consumeId==matchedItem.id){
                        self.consumeComboItem(serviceItem,matchedItem);
                        hasUsed = 1
                    }
                })
                if(hasUsed==0){
                    self.consumeComboItem(serviceItem,matchedItems[0]);
                }
            }
        },
        isRepeat: function (arr) {
            var hash = {};
            for (var i in arr) {
                if (hash[arr[i]]) {
                    return true;
                }
                // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
                hash[arr[i]] = true;
            }
            return false;
        },
        findComboItemByItem:function(serviceItem,comboitems){
            if(serviceItem&&serviceItem.useComboItem == 0){
                return;
            };
            var itemId = serviceItem.itemId;
            var hasMatch = 0;
            var matchedItems = [];
            $.each(comboitems,function(i,comboitem){
                if(comboitem.itemid==itemId){
                    serviceItem.isComboItem = 1;
                    if(comboitem.tleavetimes>0 || comboitem.tleavetimes == -99){
                        hasMatch = 1;
                        matchedItems.push(comboitem);
                    }
                }else if(comboitem.timesItemNOs&&comboitem.timesItemNOs.split(",").indexOf(itemId) !=-1){
                    serviceItem.isComboItem = 1;
                    if(comboitem.tleavetimes>0 || comboitem.tleavetimes == -99){
                        hasMatch = 1;
                        matchedItems.push(comboitem);
                    }
                }else if(comboitem.itemid==-1 && !comboitem.timesItemNOs){
                    serviceItem.isComboItem = 1;
                    if(comboitem.tleavetimes>0 || comboitem.tleavetimes == -99){
                        hasMatch = 1;
                        matchedItems.push(comboitem);
                    }
                }
            });
            if(hasMatch == 0){
                delete serviceItem.consumeId;
                delete serviceItem.sumtimes;
                serviceItem.consumeType == 0;
            };
            return matchedItems;
        },
        onPriceChange: function () {
            var needPay = 0;
            $.each(self.billDataList,function(i,billData){
                var onceBillCost = billData.data.sumfee*100 + billData.data.prodSumfee*100
                needPay += onceBillCost
            })
            this.needPay = Math.round(needPay)/100;
            this.$left.find('.totalMoney').text('￥'+ self.needPay);
            if(this.needPay==0){
                this.$.find('.payTypes li').addClass('am-disabled');
                return;
            }
            if(this.member!=-1){
                this.$.find('.payTypes li').removeClass('am-disabled');
                if(this.member.combinedUseFlag == 1){
                    this.$.find(".pay_memberCard").addClass('am-disabled');
                    this.$.find(".pay_bonus").addClass('am-disabled');
                    return;
                }
                if(this.needPay>this.member.balance||this.member.balance==0){
                    this.$.find(".pay_memberCard").addClass('am-disabled');
                }
                if(this.needPay>this.member.gift||this.member.gift==0){
                    this.$.find(".pay_bonus").addClass('am-disabled');
                    return;
                }
                if(this.member.presentfeepayLimit!=100){
                    this.$.find(".pay_bonus").addClass('am-disabled');
                    this.$payTypes.filter('.pay_bonus').find('.whynot').show().find('.text').text('您的会员卡赠金无法全额付款！');
                    return;
                }
                if(!this.member.allowPresentfeeDiscount){
                    if((this.member.discount!=0 && this.hasService==1)||(this.member.buydiscount!=0 && this.hasProduct==1)){
                        this.$.find(".pay_bonus").addClass('am-disabled');
                        this.$payTypes.filter('.pay_bonus').find('.whynot').show().find('.text').text('您的会员卡赠金无法购买打折项目或卖品！');
                        return;
                    }
                }
            }else{
                this.$.find(".pay_memberCard").addClass('am-disabled');
                this.$.find(".pay_bonus").addClass('am-disabled');
            }
            var flag = this.checkBonusitem();
            if(flag==1){return};
            this.checkCardAboutCurrentDay();
        },
        billingInfo: {
            "total": 0,
            "eaFee": 0, //入账金额
            "treatfee": 0,
            "treatpresentfee": 0,
            //"pointFee":0,
            //"coupon":0,

            "cardFee": 0, //卡金
            "presentFee": 0, //赠送金
            "cashFee": 0, //现金
            "unionPay": 0, //银联
            "jdFee":0, //京东钱包
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
        },
        translateBillData:function(billDataList){
            var optList = [];
            $.each(billDataList,function(i,billData){
                var serviceItems = billData.data && billData.data.serviceItems;
                var productItems = billData.data&&billData.data.products&&billData.data.products;
                if(serviceItems.length>0&&productItems!=null){
                    var serv = self.translateServiceData(billData);
                    var prod = self.translateProductData(billData);
                    if(serv&&prod){
                        delete prod.prodOption.mgjsourceid;
                        optList.push({
                            'comboitem':serv.comboitem,
                            'servOption': serv.servOption,
                            'prodOption': prod.prodOption,
                            'member': self.member
                        })
                    }
                }else if (productItems==null){
                    var serv = self.translateServiceData(billData);
                    if(serv){
                        optList.push({
                            'comboitem':serv.comboitem,
                            'option':serv.servOption,
                            'member': self.member
                        })
                    }
                }else if (serviceItems.length==0){
                    var prod = self.translateProductData(billData);
                    if(prod){
                        optList.push({
                            'comboitem':prod.comboitem,
                            'option':prod.prodOption,
                            'member': self.member
                        })
                    }
                }
            })
            return optList
        },
        translateServiceData: function (billData) {
            //转换数据格式
            var user = am.metadata.userInfo;
            var serviceItems = billData.data && billData.data.serviceItems;
            var opt = {
                mergeBill: 1,
                parentShopId: user.realParentShopId,
                shopId: user.shopId,
                expenseCategory: 0,
                discount: 10,
                gender: billData.data.genderGuest == 0?"F":"M",
                custSource: 0,
                comment: "",
                clientflag: 0,
                otherFlag: 0,
                jsonstr: "",
                token: user.mgjtouchtoken,
                orderDetail: [],
                serviceItems: [],
                billingInfo: am.clone(self.billingInfo),
                instoreServiceVersion: billData.version
            };
            opt.instoreServiceId = billData.id;
            if (billData.instorecomment) {
                opt.comment = billData.instorecomment;
            }
            if(billData.autoModifyBillNo==1){
                opt.autoModifyBillNo = 1
            }
            //洗发时长
            if (billData.jsonstr) {
                var jsonstr = JSON.parse(billData.jsonstr);
                if (billData.shampooworkbay) {
                    jsonstr.empName = billData['emp' + billData.shampooworkbay + 'Name'];
                    jsonstr.empId = billData['emp' + billData.shampooworkbay];
                    var empNo = amGloble.metadata.empMap[billData['emp' + billData.shampooworkbay]] && amGloble.metadata.empMap[billData['emp' + billData.shampooworkbay]].no;
                    if (empNo) {
                        jsonstr.empNo = empNo;
                    }
                }
                opt.jsonstr = JSON.stringify(jsonstr);
            }
            if (billData.displayId) {
                opt.displayId = billData.displayId;
                opt.billNo = billData.serviceNO;
            }
            if (this.member == -1) {
                opt.memId = 0;
            } else {
                opt.memId = this.member.id;
                opt.cardId = this.member.cid;
                opt.discount = this.member.discount || 10;
            }
            if(this.member!=-1){
                if(this.$smsSendFlag.hasClass('checked')){
                    opt.smssendflag = 'N';
                    opt.smsflag = this.smsflag;
                }else {
                    opt.smssendflag = 'Y';
                    opt.smsflag = this.smsflag;
                }
            }else {
                opt.smssendflag = 'N';
                opt.smsflag = '0';
            }
            opt.clientflag = billData.clientflag == 0 ? 0 : 1;
            var arrComboitems = [];
            var comboitemFee = 0;
            $.each(serviceItems, function (i, data) {
                var item = {
                    id: data.id,
                    itemId: data.itemId,
                    itemName: data.name,
                    noTreat: data.noTreat,
                    price: data.hasOwnProperty('oPrice') ? data.oPrice : (data.price || 0),
                    oPrice: data.hasOwnProperty('oPrice') ? data.oPrice : (data.price || 0),
                    salePrice: self.member == -1 ? data.price:data.discountPrice,
                    consumeType: 0, //0普通  1 套餐 2 计次 3 年卡
                    //"consumeId":12,//根据consumeType决定ID类型
                    depcode: self.getDepCode(data.id),
                    servers: [],
                };
                if(data.servers && data.servers.length){
                    for(var i=0;i<data.servers.length;i++){
                        var emp = data.servers[i];
                        var _emp = amGloble.metadata.empMap[emp.id];
                        item.servers.push({
                            "empId": emp.id,
                            "empName": emp.name,
                            "empNo": _emp.no,
                            "station":emp.station,
                            "pointFlag": emp.specified,
                            "dutyid": _emp.dutyid,
                            "perf":emp.perf,
                            "per": emp.per,
                            "gain": emp.gain,
                            "dutytypecode": _emp.dutyType
                        })
                    }
                }
                var comboitem = data.comboitem;
                if (comboitem) {
                    item.consumeType = 1;
                    item.consumeId = comboitem.id;
                    item.totalTimes = comboitem.leavetimes;
                    item.salePrice = comboitem.oncemoney;
                    item.cashFee = comboitem.cashFee;
                    item.cardFee = comboitem.cardFee;
                    item.otherFee = comboitem.otherFee;

                    if (comboitem.sumtimes == -99) {
                        //不限次套餐   任务006  业绩修改 item.consumeType = 4（不限次套餐相当于年卡）
                        item.perfPrice = comboitem.oncemoney;
                    }

                    arrComboitems.push({
                        itemname: data.name,
                        itemid: data.itemId,
                        consumeId: comboitem.id,
                        price: comboitem.oncemoney,
                        leavetimes: comboitem.leavetimes,
                        tleavetimes: comboitem.tleavetimes,
                        oncemoney: comboitem.oncemoney,
                        sumtimes: comboitem.sumtimes,

                        cashFee: comboitem.cashFee,
                        cardFee: comboitem.cardFee,
                        otherFee: comboitem.otherFee,

                        shopid: comboitem.shopid
                    });
                    comboitemFee += comboitem.oncemoney;
                    if (comboitem.treattype == 1 || comboitem.treattype == 2) {
                        item.consumeType = 3;
                    }
                }
                opt.serviceItems.push(item);
            })
            opt.billingInfo.total = billData.data.sumfee + comboitemFee;
            opt.billingInfo.treatfee = comboitemFee;
            opt.billingInfo.eaFee = billData.data.sumfee;
            var $payType = this.$.find(".payTypes li.selected");
            if ($payType.hasClass('pay_memberCard')) {
                opt.billingInfo.cardFee = billData.data.sumfee;
            } else if ($payType.hasClass('pay_bonus')) {
                opt.billingInfo.presentFee = billData.data.sumfee;
            } else if ($payType.hasClass('pay_cash')) {
                opt.billingInfo.cashFee = billData.data.sumfee;
            } else if ($payType.hasClass('pay_pos')) {
                opt.billingInfo.unionPay = billData.data.sumfee;
                var paydata = $payType.data("data");
                if (paydata) {
                    opt.billingInfo.unionOrderId = paydata.id;
                    opt.orderDetail.push({
                        "payOrderId": paydata.id
                        , "amount": billData.data.sumfee
                        , "orderType": 6
                        , "billType": 1
                    });
                }
                if (am.operateArr.indexOf("a61") > -1) {
                    if (paydata && paydata.status == 3) {
                        console.log("勾选a61后并且银联支付成功")
                    } else {
                        am.msg("不允许银联支付仅记账不收款")
                        return false;
                    }
                }
            } else if ($payType.hasClass('pay_jd')) {
                opt.billingInfo.jdFee = billData.data.sumfee;
                var paydata = $payType.data("data");
                if (paydata) {
                    opt.billingInfo.jdOrderId = paydata.id;
                    opt.orderDetail.push({
                        "payOrderId": paydata.id
                        , "amount": billData.data.sumfee
                        , "orderType": 7
                        , "billType": 1
                    });
                } else if (this.checkOnlinePayAuth('jd')) {
                    return false;
                }
            } else if ($payType.hasClass('pay_wechat')) {
                opt.billingInfo.weixin = billData.data.sumfee;
                var paydata = $payType.data("data");
                if (paydata) {
                    opt.billingInfo.weixinId = paydata.id;
                    opt.orderDetail.push({
                        "payOrderId": paydata.id
                        , "amount": billData.data.sumfee
                        , "orderType": 1
                        , "billType": 1
                    });
                } else if (self.checkOnlinePayAuth('wechat')) {
                    return false;
                }
            } else if ($payType.hasClass('pay_alipay')) {
                opt.billingInfo.pay = billData.data.sumfee;
                var paydata = $payType.data("data");
                if (paydata) {
                    opt.billingInfo.payId = paydata.id;
                    opt.orderDetail.push({
                        "payOrderId": paydata.id
                        , "amount": billData.data.sumfee
                        , "orderType": 2
                        , "billType": 1
                    });
                } else if (self.checkOnlinePayAuth('alipay')) {
                    return false;
                }
            }
            if (billData && billData.data && billData.data.sourcedata) {
                opt.mgjsourceid = billData.data.sourcedata.mgjsourceid;
            };
            return {
                comboitem: arrComboitems,
                servOption: opt,
            };

        },
        translateProductData: function (billData) {
            var user = am.metadata.userInfo;
            var productItems = billData.data && billData.data.products && billData.data.products.depots;
            var opt = {
                "mergeBill": 1,
                "parentShopId": user.realParentShopId,
                "shopId": user.shopId,
                //"memId": -1,
                //"cardId": -1,
                //"billNo": "",
                "expenseCategory": 1,
                "gender": billData.data.genderGuest == 0?"F":"M",
                "custSource": 0,
                "comment": "",
                "clientflag": 0,
                "otherFlag": 1,
                "token": user.mgjtouchtoken,
                "orderDetail": [],
                "serviceItems": [],
                "products": {
                    "depots": [],
                    "servers":[]
                },
                "billingInfo": am.clone(self.billingInfo),
                "instoreServiceVersion": billData.version
            };
            if (billData) {
                opt.instoreServiceId = billData.id;
                opt.billNo = billData.serviceNO;
            }
            if(billData.autoModifyBillNo==1){
                opt.autoModifyBillNo = 1
            }
            if (this.member == -1) {
                opt.memId = 0;
            } else {
                opt.memId = this.member.id;
                opt.cardId = this.member.cid;
                opt.discount = this.member.discount || 10;
            }
            if(this.member!=-1){
                if(this.$smsSendFlag.hasClass('checked')){
                    opt.smssendflag = 'N';
                    opt.smsflag = this.smsflag;
                }else {
                    opt.smssendflag = 'Y';
                    opt.smsflag = this.smsflag;
                }
            }else {
                opt.smssendflag = 'N';
                opt.smsflag = '0';
            }
            $.each(productItems, function (i, data) {
                var item = {
                    "productid": data.productid * 1,
                    "productName": data.productName,
                    "price": data.price || 0,
                    "salePrice": self.member == -1 ? data.salePrice : data.discountPrice,
                    "depcode": data.depcode,
                    "number": data.number,
                    "cardDiscount": data.cardDiscount,
                    "modifyed": data.modifyed,
                    "servers": []

                };
                if(data.servers && data.servers.length){
                    for(var i=0;i<data.servers.length;i++){
                        var emp = data.servers[i];
                        var _emp = amGloble.metadata.empMap[emp.empId];
                        item.servers.push({
                            "empId": emp.empId,
                            "empName": emp.empName,
                            "empNo": _emp.no,
                            "station":emp.station,
                            "pointFlag": emp.pointFlag,
                            "dutyid": _emp.dutyid,
                            "perf":emp.perf,
                            "per": emp.per,
                            "gain": emp.gain,
                            "dutytypecode": _emp.dutyType
                        })
                    }
                }
                opt.products.depots.push(item);
            })
            opt.billingInfo.total = billData.data.prodSumfee;
            opt.billingInfo.eaFee = opt.billingInfo.total;
            var $payType = this.$.find(".payTypes li.selected");
            if ($payType.hasClass('pay_memberCard')) {
                opt.billingInfo.cardFee = opt.billingInfo.total;
            } else if ($payType.hasClass('pay_bonus')) {
                opt.billingInfo.presentFee = opt.billingInfo.total;
            } else if ($payType.hasClass('pay_cash')) {
                opt.billingInfo.cashFee = opt.billingInfo.total;
            } else if ($payType.hasClass('pay_pos')) {
                opt.billingInfo.unionPay = opt.billingInfo.total;
                var paydata = $payType.data("data");
                if (paydata) {
                    opt.billingInfo.unionOrderId = paydata.id;
                    opt.orderDetail.push({
                        "payOrderId": paydata.id
                        , "amount": opt.billingInfo.total
                        , "orderType": 6
                        , "billType": 1
                    });
                }
                if (am.operateArr.indexOf("a61") > -1) {
                    if (paydata && paydata.status == 3) {
                        console.log("勾选a61后并且银联支付成功")
                    } else {
                        am.msg("不允许银联支付仅记账不收款")
                        return false;
                    }
                }
            } else if ($payType.hasClass('pay_jd')) {
                opt.billingInfo.jdFee = opt.billingInfo.total;
                var paydata = $payType.data("data");
                if (paydata) {
                    opt.billingInfo.jdOrderId = paydata.id;
                    opt.orderDetail.push({
                        "payOrderId": paydata.id
                        , "amount": opt.billingInfo.total
                        , "orderType": 7
                        , "billType": 1
                    });
                } else if (this.checkOnlinePayAuth('jd')) {
                    return false;
                }
            } else if ($payType.hasClass('pay_wechat')) {
                opt.billingInfo.weixin = opt.billingInfo.total;
                var paydata = $payType.data("data");
                if (paydata) {
                    opt.billingInfo.weixinId = paydata.id;
                    opt.orderDetail.push({
                        "payOrderId": paydata.id
                        , "amount": opt.billingInfo.total
                        , "orderType": 1
                        , "billType": 1
                    });
                } else if (self.checkOnlinePayAuth('wechat')) {
                    return false;
                }
            } else if ($payType.hasClass('pay_alipay')) {
                opt.billingInfo.pay = opt.billingInfo.total;
                var paydata = $payType.data("data");
                if (paydata) {
                    opt.billingInfo.payId = paydata.id;
                    opt.orderDetail.push({
                        "payOrderId": paydata.id
                        , "amount": opt.billingInfo.total
                        , "orderType": 2
                        , "billType": 1
                    });
                } else if (self.checkOnlinePayAuth('alipay')) {
                    return false;
                }
            }
            if (billData && billData.data && billData.data.sourcedata) {
                opt.mgjsourceid = billData.data.sourcedata.mgjsourceid;
            };
            return {
                comboitem: [],
                prodOption: opt,
            };
        },
        getAllOpt:function(){
            var billingInfo = am.clone(self.billingInfo);
            var option = {};
            var serviceItems = [];
            var productItems = [];
            $.each(self.submitbillList,function(i,v){
                for (key in v.billingInfo){
                    billingInfo[key] = (billingInfo[key] *100 + v.billingInfo[key] * 100)/100
                }
                if(v.serviceItems.length){
                    serviceItems = serviceItems.concat(v.serviceItems);
                }
                if(v.products&&v.products.depots&&v.products.depots.length){
                    productItems = productItems.concat(v.products.depots);
                }
            })
            billingInfo["eaFee"]= billingInfo["total"];
            option.billingInfo = billingInfo;
            if(this.hasService==1&&this.hasProduct==0){
                option.expenseCategory = 0;
                option.serviceItems = serviceItems;
            }else if(this.hasService==1&&this.hasProduct==1){
                option.expenseCategory = 0;
                option.serviceItems = serviceItems;
                option.products = {};
                option.products.depots = productItems;
            }else if(this.hasService==0&&this.hasProduct==1){
                option.expenseCategory = 1;
                option.products = {};
                option.products.depots = productItems;
            }
            return option;
        },
        checkOnlinePayAuth: function (type) {
            return am.page.pay.checkOnlinePayAuth(type)
        },
        getDepCode: function (id) {
			var classes = am.metadata.classes;
			for (var i = 0; i < classes.length; i++) {
				for (var j = 0; j < classes[i].sub.length; j++) {
					if (classes[i].sub[j].id == id) {
						return classes[i].depcode || "";
					}
				}
			}
			// 停用项目在停用里面匹配
			var stopclasses = am.metadata.stopClasses;
			for (var i = 0; i < stopclasses.length; i++) {
				for (var j = 0; j < stopclasses[i].sub.length; j++) {
					if (stopclasses[i].sub[j].id == id) {
						return stopclasses[i].depcode || "";
					}
				}
			}
			return "";
		},
        beforeShow: function (paras) {
            if(!this.checkedSubmitPermission){
                this.checkSubmitPermission();
            }
            this.paytool.reset();
            this.$.find(".payTypes li").removeClass('selected am-disabled');
            this.$payTypes.find('.whynot').hide().find('.text').text('');
            this.$right.removeClass("pay_memberCard")
                    .removeClass("pay_pos")
                    .removeClass("pay_cash1")
                    .removeClass("pay_cash")
                    .removeClass("pay_wechat")
                    .removeClass("pay_alipay")
                    .removeClass("pay_bonus").removeClass("pay_jd");
            if(!this.hasDisplayJdPay){
                var jdSetting = null;
                var payTypes = am.payConfigMap[0];
                for(var key in payTypes){
                    if(payTypes[key].otherfeetype==4){
                        jdSetting = payTypes[key];
                        break;
                    }
                }
                if(jdSetting){
                    this.$.find(".payTypes .pay_jd").show();
                }else {
                    this.$.find(".payTypes .pay_jd").hide();
                }
                this.hasDisplayJdPay = true;
            }
            this.member = paras.member;
            this.billDataList = paras.items;
            this.submitbillList = [];
            this.serviceItemsMap = {};
            this.hasService = 0;
            this.hasProduct = 0;
            this.smsflag = '0';
            paras.comboitems.sort(function(a,b){
                if ((a.validdate < b.validdate)||(a.validdate!=null && b.validdate==null)) {
                    return -1;
                }
                if ((a.validdate > b.validdate)||(a.validdate==null&&b.validdate!=null)) {
                    return 1;
                }
                if((a.validdate==null && b.validdate==null)||(a.validdate==b.validdate)){
                    return 0;
                }
            })
            this.comboitems = [];
            var ts = am.now();
			ts.setHours(0);
			ts.setMinutes(0);
			ts.setSeconds(0);
            ts.setMilliseconds(0);
            $.each(paras.comboitems, function (i, v) {
                if (!v.validdate || v.validdate >= ts.getTime() || (am.operateArr.indexOf("a47") > -1)) {
                    var shopFlag = true;
                    if(v.cashshopids){
                        var obj={
                            shopIdsStr:v.cashshopids,// ',r,234,43,'
                            targetShopId:amGloble.metadata.userInfo.shopId,
                            itemShopId:v.shopid
                        }
                        shopFlag= am.checkShopAvailable(obj)===0?false:true;
                    }
                    if(shopFlag){
                        v.tleavetimes = v.leavetimes
                        self.comboitems.push(v);
                    }
                }
            })
            this.renderBillList(self.billDataList);
            this.showSmsSendFlag();
            this.onPriceChange();
        },
        beforeHide: function(){
            this.getGainAndVoidFee();
        },
        getCalacAjax:function(params, url, sc, item){
            am.page.pay.getCalacAjax.call(this,params, url, sc, item);
        },
        getGainAndVoidFee: function(){
            if(this.hasProduct == 1&&this.hasService==0){
                var type = 1;
            }else if(this.hasService==1){
                var type = 0;
            }
            am.page.pay.getGainAndVoidFee.call(this,type);
        },
        checkCardAboutCurrentDay:function(){
            var member = this.member;
            if (member != -1  && member.cardtype == 1 && member.timeflag != 1
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
                        }else{
                            self.$payTypes.filter('.pay_memberCard').removeClass('am-disabled');
                            self.$payTypes.filter('.pay_memberCard').find('.whynot').hide();
                        }
                    }
                })
            }
        },
        checkBonusitem:function(){
            var allowedPresent=1,disableUseStr='';// 允许赠金支付
            var checkedServiceItems = [];
            var serviceItemsMap = this.serviceItemsMap;
            for(key in serviceItemsMap){
                checkedServiceItems.push(serviceItemsMap[key]);
            }
            if(this.member!=-1 && this.member.cardTypeId &&checkedServiceItems.length){
                var cardInfo=am.metadata.cardTypeMap[this.member.cardTypeId];
                if(cardInfo && cardInfo.restricteditems){
                    var restricteditemsStr=cardInfo.restricteditems.split(',');// 指定的项目itemid 字符串
                    var restrictedtype=cardInfo.restrictedtype;  // 0 指定不可用  1指定可用 
                    if(restrictedtype===1){
                        // 指定了服务项目可用
                        for(var ss=0,sslen=checkedServiceItems.length;ss<sslen;ss++){
                            var checkedItemId=checkedServiceItems[ss].itemId;
                            if(restricteditemsStr && restricteditemsStr.indexOf(checkedItemId)==-1 && checkedServiceItems[ss].discountPrice>0){
                                disableUseStr+='、'+checkedServiceItems[ss].name;
                                allowedPresent=0;
                            }
                        }
                    }else if(restrictedtype===0){
                        // 指定服务项目不可用
                        for(var ss=0,sslen=checkedServiceItems.length;ss<sslen;ss++){
                            var checkedItemId=checkedServiceItems[ss].itemId;
                            if(restricteditemsStr && restricteditemsStr.indexOf(checkedItemId)!=-1 && checkedServiceItems[ss].discountPrice>0){
                                disableUseStr+='、'+checkedServiceItems[ss].name;
                                allowedPresent=0;
                            }
                        }
                    }
                }
            }
            if(allowedPresent==0&&disableUseStr && disableUseStr.length){
                var orignalArr=disableUseStr.split('、');
                var res=[];
                for(var o=0,olen=orignalArr.length;o<olen;o++){
                    if(res.indexOf(orignalArr[o])==-1){
                        res.push(orignalArr[o])
                    }
                }
                disableUseStr=res.join('、');
                disableUseStr='【'+disableUseStr.substring(1)+'】不可使用赠送金支付';
                this.$.find(".pay_bonus").addClass('am-disabled');
                this.$payTypes.filter('.pay_bonus').find('.whynot').show().find('.text').text(disableUseStr);
                return 1;
            }else{
                return 0
            }
        },
        afterShow: function () {
            this.billsScroll.refresh();
            this.billsScroll.scrollTo('top');
            var member = this.member;
            if(member!=-1){
                if(member.cardtype != 2){
                    this.$.find(".pay_memberCard p").html('余额：'+Math.round((member.balance) * 100) / 100);
                    this.$.find(".pay_bonus p").html('余额：'+Math.round((member.gift) * 100) / 100);
                }else{
                    this.$.find(".pay_memberCard p").html('');
                    this.$.find(".pay_bonus p").html('');
                }
                if(member.balance==0){
                    this.$.find(".pay_memberCard").addClass('am-disabled');
                }
                if(member.gift==0){
                    this.$.find(".pay_bonus").addClass('am-disabled');
                }

            }else{
                this.$.find(".pay_memberCard p").html('');
                this.$.find(".pay_bonus p").html('');
                this.$.find(".pay_memberCard").addClass('am-disabled');
                this.$.find(".pay_bonus").addClass('am-disabled');
            }
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
            am.goBackToInitPage();
        },
        keyboardCtrl:function(keyCode){ 
            var _this=this;
            var ctrl = window.keyboardCtrl;
            if(document.activeElement && $(document.activeElement).hasClass('input_no')){

            }else{
                if($('.payDetail').is(':visible') || $('#common_addremark').is(':visible') 
                    || $('#maskBoard').is(':visible') || $('.nativeUIWidget-showPopupMenu').is(':visible') 
                    || $('#setMutiPerf').is(':visible') || $("#phoneCodeModal").is(':visible') 
                    || $('#selectCancleReason').is(':visible') || $("#billDetail").is(':visible')){
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
                    if($("#page_mergePay .payTypes li").eq(keyCode-keyCodeEq).hasClass('am-disabled')) {
                        return;
                    }else {
                        $("#page_mergePay .payTypes li").eq(keyCode-keyCodeEq).trigger('vclick');
                    }

                }else if(keyCode == 13) {
                    if($("#maskBoard").is(":visible") || $('#commentService').is(':visible') ){
                        return;
                    }else if($('#mergePayConfirm').is(':visible') ) {
                        //点击评价成功后,点击回车键让评价成功后的弹窗消失
                        $('#mergePayConfirm .goBack').trigger('vclick');
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
                                $("#page_mergePay .submit").trigger('vclick');
                            }
                            // $("#page_pay .submit").trigger('vclick');

                        }else {}
                    }else {}
                }else if(keyCode === 111) {
					this.backButtonOnclick();
				}else if(keyCode === 109 && $('#commentService').is(':visible')) {
                    // -号键 不想评价
                    $('.cancel_comment').trigger('vclick');
                }
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
        submitToServer:function(optList){
            $.each(optList,function(i,opt){
                self.getSubmitBillList(opt);
            })
            var option = this.getAllOpt();
            if(this.member!=-1){
                if(option.billingInfo.cardFee>0){
                    option.cardBalance = Math.round((this.member.balance - option.billingInfo.cardFee)*100)/100;
                    option.presentBalance = this.member.gift;
                }else if (option.billingInfo.presentFee>0){
                    option.cardBalance = this.member.balance;
                    option.presentBalance = Math.round((this.member.gift - option.billingInfo.presentFee)*100)/100;
                }else{
                    option.cardBalance = this.member.balance;
                    option.presentBalance = this.member.gift;
                }
                am.pw.check(self.member,function(verifyed){
                    if(verifyed){
                        self.toPay();
                    }
                },option);
            }else{
                self.toPay();
            }
        },
        checkBillsNo:function(){
            var isAllModify = 1;
            this.$.find('.serviceNO').each(function(){
                if($(this).hasClass('modified')){
                    $(this).removeClass('red')
                }else{
                    $(this).addClass('red')
                    isAllModify = 0;
                }
            })
            if(isAllModify==1){
                return true;
            }else{
                return false;
            }
        },
        getSubmitBillList: function (opt) {
            var _this = this;
            if (opt.servOption) {
                if (opt.member && opt.member.cardshopId == am.metadata.userInfo.shopId) {
                    if (opt.comboitem && opt.comboitem.length) {
                        if (this.getComboCrossNum(opt.comboitem)) {
                            opt.servOption.otherFlag = 1;//跨店
                        } else {
                            opt.servOption.otherFlag = 0;//本店
                        }
                    } else {
                        opt.servOption.otherFlag = 0;//本店
                    }
                } else if (opt.member && opt.member.cardshopId != am.metadata.userInfo.shopId) {
                    if (opt.comboitem && opt.comboitem.length) {
                        if (!this.getComboCrossNum(opt.comboitem) && opt.servOption.serviceItems && opt.comboitem.length == opt.servOption.serviceItems.length) {
                            opt.servOption.otherFlag = 0;//本店
                        } else {
                            opt.servOption.otherFlag = 1;//跨店
                        }
                    } else {
                        opt.servOption.otherFlag = 1;//跨店
                    }
                } else {
                    opt.servOption.otherFlag = 0;//本店
                }
                if (opt.member && opt.member.cardshopId == am.metadata.userInfo.parentShopId) {
                    opt.servOption.otherFlag = 0;//本店
                }
            } else if (opt.option.expenseCategory == 0) {
                if (opt.member && opt.member.cardshopId == am.metadata.userInfo.shopId) {
                    if (opt.comboitem && opt.comboitem.length) {
                        if (this.getComboCrossNum(opt.comboitem)) {
                            opt.option.otherFlag = 1;//跨店
                        } else {
                            opt.option.otherFlag = 0;//本店
                        }
                    } else {
                        opt.option.otherFlag = 0;//本店
                    }
                } else if (opt.member && opt.member.cardshopId != am.metadata.userInfo.shopId) {
                    if (opt.comboitem && opt.comboitem.length) {
                        if (!this.getComboCrossNum(opt.comboitem) && opt.option.serviceItems && opt.comboitem.length == opt.option.serviceItems.length) {
                            opt.option.otherFlag = 0;//本店
                        } else {
                            opt.option.otherFlag = 1;//跨店
                        }
                    } else {
                        opt.option.otherFlag = 1;//跨店
                    }
                } else {
                    opt.option.otherFlag = 0;//本店
                }
                //总部会员不跨店
                if (opt.member && opt.member.cardshopId == am.metadata.userInfo.parentShopId) {
                    opt.option.otherFlag = 0;//本店
                }
            }
            
            if (opt.servOption || (opt.option&&opt.option.expenseCategory == 0)) {
                //项目业绩
                this.computePerf(opt);
            }
            if (opt.prodOption || (opt.option&&opt.option.expenseCategory == 1)) {
                //项目业绩
                this.computeProductPayDetail(opt);
                this.computePerSetPerf(opt);
            }
            //计算非项目业绩

            if (opt.servOption) {
                // 性能监控点
                monitor.startTimer('M05', {
                    servOption: opt.servOption,
                    prodOption: opt.prodOption
                })
                if(!opt.servOption.uuid){
                    opt.servOption.uuid = _this.getUniqueId();
                }
                if(!opt.prodOption.uuid){
                    opt.prodOption.uuid = _this.getUniqueId();
                }
                if(isNaN(opt.prodOption.billNo)){
                    delete opt.prodOption.billNo;
                }
                if(opt.servOption.instoreServiceId && opt.prodOption.instoreServiceId){
                    delete opt.servOption.instoreServiceId;
                }
                self.submitbillList.push(opt.servOption);
                self.submitbillList.push(opt.prodOption);
            } else {
                // 性能监控点
                monitor.startTimer('M05', opt.option)

                if(!opt.option.uuid){
                    opt.option.uuid = _this.getUniqueId();
                }
                if(opt.option.expenseCategory==1 && isNaN(opt.option.billNo)){
                    delete opt.option.billNo;
                }
                self.submitbillList.push(opt.option);
            }
            // if(opt.member){
            //     if(this.$smsSendFlag.hasClass('checked')){
            //         opt.option.smssendflag = 'N';
            //     }else {
            //         opt.option.smssendflag = 'Y';
            //     }
            // }else {
            //     opt.option.smssendflag = 'N';
            // }
            
        },       
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
            "jdFee":"jdfee",
            "onlineCreditPay":"onlineCreditPay",
            "offlineCreditPay":"offlineCreditPay",
            "mallOrderFee":"mallorderfee",
        },
        toPay: function () {
            var _this =this;
            if (this.paying) {
                return;
            }
            this.paying = 1;
            this.$submit.addClass("am-disabled");

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
                    am.msg("支付成功！");
                    _this.$submit.removeClass("am-disabled");
                    _this.showPaySuccess();
                    _this.billId=ret.content.billId;//将单号设置为全局变量
					_this.billIds = ret.content.billIds; // 多单一起结算，返回多单的集合
                } else if (ret.code == 100002) {//单号已存在
                    am.msg("单号重复！");
                    _this.$submit.removeClass("am-disabled");
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
                    am.goBackToInitPage();
                }
            };
            am.api.mutiBillCheck.exec(_this.submitbillList, callback);
        },
        computePerf: function (optt) {
            var opt = {
                paid: {},
                card: null, //{cardtypeid:4,discount:9}
                itemList: []
            };
            var billOption = optt.servOption || optt.option;
            var billingInfo = JSON.parse(JSON.stringify(billOption.billingInfo)); //$.extend(true,{},billOption.billingInfo);
            for (var i in this.payTypeMap) {
                var v = billingInfo[i];
                if (v) {
                    var k = this.payTypeMap[i];
                    opt.paid[k] = v;
                }
            }
            var items = billOption.serviceItems;
            for (var i = 0; i < items.length; i++) {
                var itemdata = {
                    itemid: items[i].itemId,
                    //储值卡即为用卡消费 传1，资格卡和散客传2
                    consumetype: (optt.member && optt.member.cardtype == 1) ? 1 : 2,
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
                            perf:servers[j].perf
                        });
                    }
                }
                opt.itemList.push(itemdata);
            }
            if (optt.member) {
                opt.card = {
                    cardtypeid: optt.member.cardTypeId,
                    discount: optt.member.discount || 10,//折扣
                    treatcardfee: (billingInfo.treatfee || 0),
                    treatpresentfee: 0
                };
            }
            opt.rate = 1;
            //006 计算业绩
            var ret = computingPerformance.computing(opt);
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
        computeProductPayDetail: function (opt) {
            var billOption = opt.prodOption || opt.option;
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
        computePerSetPerf: function (opt) {
            var combNotCalIntoAchiev = am.metadata.configs.combNotCalIntoAchiev == 'true'?1:0;// 1成本不算业绩 0 成本算业绩
            var isRepeat = opt.prodOption?1:0;
            var expenseCategory = isRepeat?opt.prodOption.expenseCategory:opt.option.expenseCategory;
            if (expenseCategory) {
                var billingInfo = isRepeat?opt.prodOption.billingInfo:opt.option.billingInfo;
                var t = billingInfo.total - billingInfo.debtFee;
                var sellingItems = [];
                if (expenseCategory === 1) {
                    // 卖品
                    sellingItems = sellingItems.concat(isRepeat ? opt.prodOption.products.depots : opt.option.products.depots);
                }
                var payDetail = JSON.parse(JSON.stringify(billingInfo));
                    if (opt.member && !opt.member.allowPresentfeeDiscount && opt.member.discount && expenseCategory != 4) {
                        if (payDetail.presentFee) {
                            if (this.$payTypes.filter(".selected").hasClass("pay_bonus")) {
                                payDetail.presentFee = billingInfo.total - billingInfo.treatfee - billingInfo.treatpresentfee - billingInfo.luckymoney - billingInfo.mallOrderFee - billingInfo.weixin - billingInfo.pay;
                            } else {
                                payDetail.presentFee = payDetail.presentFee * (opt.member.discount / 10);
                            }
                        }
                    }
                    // 待 t可能有问题 内外
                    var payMoneyCategoryPctObj = this.getPayMoneyCategoryPctObj({
                        total: t,
                        payDetail: payDetail
                    });
                    var payFeePctObj = this.getPayFeePctObj({
                        total: t,
                        payDetail: payDetail,
                        isNotProject: true
                    });
                    var rate = 1;
                    // 遍历每一个卖品
                    for(var d=0,len=sellingItems.length;d<len;d++){
                        var servers=sellingItems[d].servers;
                        if(servers){
                            if (expenseCategory === 1) {
                                t = sellingItems[d].salePrice * sellingItems[d].number; // 每个卖品的实际售价
                            }
                            // 欠款不算业绩
                            t = Math.round(100*rate*t)/100;
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
                                    var per = Math.round(10000 / servers.length) / 100;
                                    var perf = toFloat((this.needPay || 0) * per / 100);
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
            }
        },
        getUniqueId:function(){
            return am.metadata.userInfo.shopId+ '_'+am.metadata.userInfo.userId+Math.uuid();
        },
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
    })
})($);
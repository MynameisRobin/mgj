(function () {
	var self = am.phoneCodeModal = {
		payTypeNameMap: {
			//现金类收款
			"cashFee": "现金",
			"unionPay": "银联",
			"pay": "支付宝",
			"weixin": "微信",
			"dpFee": "大众点评",
			"mall": "商场卡",
			"cooperation": "合作券",
			//非现金类收款
			"cardFee": "划卡",
			"presentFee": "划赠送金",
			"divideFee": "分期赠送金",
			"voucherFee": "代金券",
			"debtFee": "欠款",
			"mdFee": "免单",
			"luckymoney": "红包",
			"coupon": "优惠券",
			"onlineCreditPay": "线上积分抵扣金",
			"offlineCreditPay": "线下积分抵扣金",
			"mallOrderFee": "商城订单",
			//套餐独立
			"treatfee": "划套餐卡金",
			"treatpresentfee": "划套餐赠金"
		},
		init: function () {
			this.$ = $("#phoneCodeModal");
			this.$.on("vclick", ".toggleBox", function () {
				self.hide();
                am.keyboard.show(self.opt);
			}).on("vclick", ".close", function () {
				if(self.opt.needPsw){
					am.msg("您目前没有权限关闭，如果想关闭请联系管理员！");
				}else{
					self.hide();
					self.opt.cb && self.opt.cb(1);
					localStorage.setItem("memPwd"+'_'+self.opt.member.id,'true');
					localStorage.setItem("togglePhoneCode_"+am.metadata.userInfo.userId,"1");
				}
			}).on("vclick", ".cancel", function () {
				self.hide();
			}).on("vclick", ".sendCodeBtn", function () {
				self.sendCode();
				self.calTime();
			}).on("vclick",".btnOk",function(){
				self.checkCode();
			});
		},
		show: function (opt) {
			this.opt = opt;
			console.log('this.opt====================', opt)
			if (am.isNull(opt)) {
				return;
			}
			this.times = 60;
			this.timer && clearTimeout(this.timer);
			this.timer = null;
			if (!this.$) {
				this.init();
			}
			this.render();
			this.$.show();
		},
		hide: function () {
			this.$.hide();
		},
		render: function () {
			var phone = this.opt.phone;
			if (am.isNull(this.opt)) return;
			self.getPayName();
			self.$.find(".sendCodeBtn").removeClass("am-disabled").text("发送验证码");
			self.$.find(".phone").text(phone.substring(0, 3) + '****' + phone.substr(phone.length - 4, phone.length));
			if(self.opt.togglePhoneCode){
				self.$.find(".toggleBox").show();
			}else{
				self.$.find(".toggleBox").hide();
			}
		},
		calTime: function () {
			var $sendCodeBtn = self.$.find(".sendCodeBtn");
			self.times--;
			if (self.times > 0) {
				self.timer = setTimeout(function () {
					self.calTime();
				}, 1000);
				$sendCodeBtn.addClass("am-disabled").text(self.times + "s后重新发送");
			} else {
				self.times = 60;
				self.timer && clearTimeout(self.timer);
				$sendCodeBtn.removeClass("am-disabled").text("发送验证码");
			}
		},
		//获取当前消费方式的名称
		getPayName: function(){
			var getPayNameArr = [];
			var typeName = '消费';
			if(am.isNull(self.opt.option)) return;
			var option = JSON.parse(JSON.stringify(self.opt.option));
			var member = self.opt.member;
			var products = option.products;
			var serviceItem = option.serviceItems;
				serviceItem = serviceItem && am.print.mergeSameItems(serviceItem);
			var billingInfo = option.billingInfo;
			var cost = option.cost;
			var card = option.card;
			var comboCard = option.comboCard;
			var expenseCategory = option.expenseCategory;
			var itemTotal = '';
			var productMoney = 0;

			//卖品或者混合
			if (expenseCategory == 1 || (expenseCategory==0 && products) ) { 
				for (var j = 0; j < products.depots.length; j++) {
					var item = products.depots[j];
					productMoney += item.salePrice * item.number;
				}
				if(expenseCategory == 0){
					//混合项目总价减去卖品的钱得到项目的钱区分显示
					itemTotal = Math.round((billingInfo.total - productMoney)*100)/100;
				}
				var name = "卖品消费￥" + Math.round(productMoney*100)/100;
				getPayNameArr.push(name);
			}

			//项目分两种消费 普通项目消费和套餐消费
			if(expenseCategory == 0){
				for (var i = 0; i < serviceItem.length; i++) {
					var item = serviceItem[i];
					var originPrice = 0;
					var _item = am.metadata.serviceCodeMap[item.itemId || item.itemNo];
					if(_item && _item.price*1){
						originPrice = _item.price;
					}else {
						originPrice = item.salePrice;
					}
					var itemName = item.itemName + '(￥'+originPrice+')';
					var lineString = itemName;
					if(item.consumeId || item.isComboConsume){
						var itemTimes = '';
						if(item.leaveTimes){
                            itemTimes=item.leaveTimes;
                        }
						if(item.totalTimes==-99){
							itemTimes = item.totalTimes;
						}
						var name = lineString + '扣减' + (item.times || 1) + '次，套餐剩余次数' + (itemTimes?(itemTimes==-99?'不限次':(itemTimes+"次")):'0次');
						getPayNameArr.push(name);
						itemTotal = Math.round((billingInfo.total - billingInfo.treatfee - billingInfo.treatpresentfee)*100)/100;
						if(!am.isNull(products)){
							itemTotal = Math.round((itemTotal - productMoney)*100)/100;
						}
						//重置
						item.times = 0;
					}
				}
				if(am.isNull(products)){
					//混合消费
					typeName = "消费总额";
				}else{
					typeName = "项目消费";
				}
			}
			//开卡
			else if (expenseCategory == 2) {
				typeName = "开卡总额";
			} 
			//充值
			else if (expenseCategory == 3) { 
				typeName = "充值总额";
				self.payTypeNameMap['presentFee'] = "赠送";
			}

			//其他自定义方式
			if (!self.otherfeeNames) {
                self.otherfeeNames = {}; 
                var pc = am.metadata.payConfigs;
                for (var i = 0; i < pc.length; i++) {
                    if (pc[i].field.indexOf('OTHERFEE') != -1) {
                        var field = pc[i].field;
                        self.otherfeeNames[field] = pc[i].fieldname;
                    }
                }
			}
			console.log('self.otherfeeNames-----------------',self.otherfeeNames);

			//套餐卡 结算前 添加 工本费明细
			if(expenseCategory == 4 || expenseCategory == 2){
				var costItem = 0;
				if(cost){
					var costFeeObj = expenseCategory == 4 ? comboCard.costDetail : card.cost;
					$.each(costFeeObj,function(i,item){
						if(item!=0&&i.indexOf('Id') == -1&&i!="total"){
							if (i.indexOf('otherfee') != -1) {
								//是自定义支付方式
								var key = i.toUpperCase();
								if(expenseCategory == 4){
									costItem += (item-0);
									billingInfo[i] += (item-0);
								}else{
									getPayNameArr.push("开卡成本：" + self.otherfeeNames[key] + " <span class='red'>￥" + item + "</span>");
								}
							}else{
								//不是自定义支付方式,套餐不显示开卡成本
								if(expenseCategory == 4){
									costItem += (item-0);
									billingInfo[i] += (item-0);
								}else{
									getPayNameArr.push("开卡成本：" + self.payTypeNameMap[i] + " <span class='red'>￥" + item + "</span>");
								}
							}
						}
					})
				}
			}

			//选择的消费方式
			$.each(billingInfo, function(i, v) {
				if(v > 0){
                	if (v != 0 && v != null && i != "luckyMoneyId" && i!= "kBOrderid" && i!= "luckMoneys" && i != "weixinId" && i != "payId" && i != "dpId" && i != "eaFee" && i != "total" && i != "mallId" && i != "mallNo" && i != "dpCouponId"  && i != "totalfeeanddebtfee" && i != "treatfee" && i != "treatpresentfee" && i != "onlineCredit" && i != "offlineCredit") {
						if (i.indexOf('otherfee') != -1) {
                            var key = i.toUpperCase();
							getPayNameArr.push(self.otherfeeNames[key] + "￥" + v);
                        }else{
							getPayNameArr.push(self.payTypeNameMap[i] + "￥" + v);
						}
					}
				}
			})
			
			//卡金余额
			if(option.hasOwnProperty('cardBalance')){
				if((option.expenseCategory!=2 && member.combinedUseFlag==1) || (option.expenseCategory==2 && option.card.combinedUseFlag==1)){
					var balance = "卡金余额: ￥" + Math.round((option.cardBalance+option.presentBalance)*100)/100;
				}else {
					var balance = "卡金余额: ￥" + option.cardBalance + "，赠金余额:￥" + option.presentBalance;
				}
				getPayNameArr.push(balance);
			}
			console.log('getPayNameArr--------------------',getPayNameArr)

			var getPayNameStr = getPayNameArr.join('，') || '';
			self.$.find(".sendCondeInfo").html('发送内容：您此次' + typeName + '￥' + (itemTotal === 0 || itemTotal > 0 ? itemTotal : billingInfo.total) + '，' + getPayNameStr + '，验证码：******');

			//套餐单独算
			if (expenseCategory == 4) {
				var total = ((costItem-0) + (billingInfo.total-0)) || 0;
				typeName = "购买套餐";
				self.$.find(".sendCondeInfo").html('发送内容：您此次' + typeName + '总额￥' + toFloat(total) + '，' + getPayNameStr + '，验证码：******');
			}
			//还原
			self.payTypeNameMap['presentFee'] = "划赠送金";
		},
		//发送验证码
		sendCode: function () {
			var content = self.$.find(".sendCondeInfo").text().replace('******','').replace("发送内容：","");
			if(am.isNull(content)) return;
			am.loading.show("正在获取,请稍候...");
			var opt = {
				content:content+'',
				phone: self.opt.phone,
				shopId: am.metadata.userInfo.shopId
			};
			am.api.sendCode.exec(opt, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					am.msg("验证码发送成功");
				} else {
					am.msg(res.message);
				}
			});
		},
		//确认验证码
		checkCode: function () {
			var code = self.$.find(".input input").val().trim();
			if(am.isNull(code)){
				am.msg("请输入验证码");
				return false;
			}
			am.loading.show();
			var opt = {
				code: code,
				phone: self.opt.phone,
				shopId: am.metadata.userInfo.shopId
			};
			am.api.checkCode.exec(opt, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					self.hide();
					am.msg("验证码校验成功");
					self.$.find(".input input").val("");
					am.pw.cache[(self.opt.member && self.opt.member.id)] = new Date().getTime();
					self.opt.cb && self.opt.cb(1);
					localStorage.setItem("memPwd"+'_'+(self.opt.member && self.opt.member.id),'true');
					localStorage.setItem("togglePhoneCode_"+am.metadata.userInfo.userId,"1");
				} else {
					am.msg(res.message);
				}
			});
		}
	};
})();
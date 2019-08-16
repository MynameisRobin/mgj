(function(){
    var self = am.page.addIncome = new $.am.Page({
        id: 'page_addIncome',
        backButtonOnclick: function () {
			var $selected = self.$payTypes.filter('.selected');
			if ($selected.length) {
				var data = $selected.data('data');
				var payed = 0;
				if ($selected.hasClass('payed') && data && data.status == 3) {
					payed = 1;
				}
				if (payed) {
					atMobile.nativeUIWidget.confirm({
                        caption: "用户已支付",
                        description: "用户已在线支付成功,返回后此支付流水将无法关联，确认要返回吗？",
                        okCaption: "去退款",
                        cancelCaption: "仍返回"
                    }, function () {
                        $selected.trigger('vclick');
                    }, function () {
                        $.am.page.back("slidedown");
                    });
				}else {
					$.am.page.back("slidedown");
				}
			}else {
				$.am.page.back("slidedown");
			}
        },
        init: function(){
            this.$title = this.$.find('.am-header .md p');
            this.$container = this.$.find('.container');
            this.$right = this.$container.find('.right');
        

            this.$payTypes = this.$.find(".payTypes li").vclick(function(){
				self.$prepay.find('.val').empty();
				self.$prepay.find('.val').removeClass('edit').addClass('add');
				self.facePayData = null;
				self.type = $(this).attr('paytype');
				var $this = $(this);
				if ($this.hasClass("selected")) {
					var $selected = self.$payTypes.filter('.selected');
					var data = $selected.data('data');
					var payed = 0;
					if ($selected.hasClass('payed') && data && data.status == 3) {
						payed = 1;
					}
                    if(payed){
						self[self.type](self.needPay,1);
					}else {
						self[self.type](self.needPay);
					}
                } else {
                    if(!self.check()){
						return;
					}
					$this.addClass("selected").siblings().removeClass("selected");
					self.$right
                    .removeClass("pos")
                    .removeClass("pay_cash1")
                    .removeClass("cash")
                    .removeClass("wechat")
					.removeClass("alipay")
					.addClass(self.type);
					if ($this.hasClass("pay_pos")) {
						self.pos(self.needPay);
					} else if ($this.hasClass("pay_cash")) {
						self.cash(self.needPay);
					} else if ($this.hasClass("pay_wechat")) {
						self.wechat(self.needPay);
					} else if ($this.hasClass("pay_alipay")) {
						self.alipay(self.needPay);
					}
                }
            });

            this.$prepay = this.$.find('.prePay').vclick(function () {
				if(!self.check()){
					return;
				}
				self.$.find('.payTypes li').removeClass('selected');
				self.$right.removeClass('cash pos wechat alipay pay_cash1')
				self.prePay(this.data?this.data.type:undefined);
			});

			this.$price = this.$.find('.price').vclick(function(){
				if(!self.check()){
					return;
				}
				var _this = $(this);
				am.keyboard.show({
					title:"请输入金额",//可不传
					hidedot:false,
				    submit:function(value){
						if(value*1){
							_this.addClass('hasInput');
				    		_this.find('.num').text(value);
						}else {
							_this.removeClass('hasInput');
							_this.find('.num').text('');
						}
						self.needPay = value*1;
						self.$payTypes.filter('.selected').trigger('vclick');
				    }
				});
			});
			
			this.$debtPrice = this.$.find('.debtPrice');

			this.$debtPrice.find('.num').vclick(function(){
				if(!self.check()){
					return;
				}
				var _this = $(this);
				am.keyboard.show({
					title:"请输入金额",//可不传
					hidedot:false,
				    submit:function(value){
						if(value*1>self.data.remainFee){
							return am.msg('金额超出此笔欠款最大金额');
						}
						if(!(value*1)){
							return am.msg('每次还款金额不能为0');
						}
						_this.text(value)
						self.needPay = value*1;
						self.$payTypes.filter('.selected').trigger('vclick');
				    }
				});
			});

			this.$depart = this.$.find('.depart').vclick(function(){
				if(!self.deparList.length){
					am.msg('部门未设置');
					return;
				}
				var _this = $(this);
				am.popupMenu("请选择收入部门", self.deparList , function (ret) {
					_this.find('.val').html('<span>'+ret.name+'</span>').removeClass('add').addClass('edit');
					_this.data('depcode',ret.code);
				});
			});

			this.$dayExpendType = this.$.find('.dayExpendType').vclick(function(){
				if(!self.dayExpendTypeList.length){
					am.msg('未设置收入类型,请前往系统设置');
					return;
				}
				var _this = $(this);
				am.popupMenu("请选择收入类型", self.dayExpendTypeList , function (ret) {
					_this.find('.val').html('<span>'+ret.name+'</span>').removeClass('add').addClass('edit');
					_this.data('dayExpendType',ret.id);
				});
			});

			this.$intro = this.$.find('.intro').vclick(function(){
				var _this = $(this)
				am.addRemark.show({
					maxlength: 200,
					cb: function(val){
						if(val){
							_this.find('.val').html('<span>'+val+'</span>').removeClass('add').addClass('edit');
						}else {
							_this.find('.val').html('').removeClass('edit').addClass('add');
						}
					}
				})
			});

			this.$smt = this.$.find('.smt').vclick(function(){
				self.addIncome();
			});

			this.$prepay.on('vclick','.icon-juxingkaobei',function (e) {
                e.stopPropagation();
                var $this = $(this);
				var d = JSON.parse(JSON.stringify($(this).data('data')));
				console.log(d);
                am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
                        if(am.isNull(value)){
                            return am.msg("请输入正确的数字");
                        }
                        if(value > d.aviablePrice){
                            return am.msg("不能超过可用金额");
						}
						self.$prepay.find('.price').text('￥'+value);
						d.price = value*1;
						self.facePayData = d;
				    }
				});
            });
		},
		checkSubmitPermission:function(){
			var config = am.metadata.userInfo.operatestr.indexOf('a39') > -1 ? 1 : 0;
			if (config) {
				// 0 允许结算  1允许结算
				this.$smt.hide();
			}else{
				this.$smt.show();
			}
			this.checkedSubmitPermission=true;
		},
        beforeShow: function(paras){
			if(!this.checkedSubmitPermission){
                this.checkSubmitPermission();
            }
			this.reset();
            if(paras && paras.debtLogId){
                this.$title.text('还款');
                this.$container.addClass('debt');
				this.data = paras;
				this.$debtPrice.find('.num').text(this.data.remainFee);
				this.needPay = this.data.remainFee;
            }else {
                this.$title.text('其他收入收款');
                this.$container.removeClass('debt');
				this.data = null;
				this.needPay = 0;
			}
			
			if(!this.deparList){
				this.deparList = JSON.parse(JSON.stringify(am.metadata.deparList));
			}

			if(!this.dayExpendTypeList){
				this.dayExpendTypeList = [];
				for(var i=0;i<am.metadata.dayExpendTypeList.length;i++){
					if(am.metadata.dayExpendTypeList[i].dayexpendtypeid==5){
						this.dayExpendTypeList.push(am.metadata.dayExpendTypeList[i]);
					}
				}
			}

			// this.needPay = 0.01;  //test
			
        },
        afterShow: function(paras){
			this.prePay(this.data?this.data.type:undefined,1);
		},
		reset: function(){
			this.$price.removeClass('hasInput').find('.num').text('');
			this.$depart.data('depcode','').removeClass('edit').addClass('add').find('.val').empty();
			this.$dayExpendType.removeClass('edit').addClass('add').data('dayExpendType','').find('.val').empty();
			this.$intro.find('.val').empty();
			this.$prepay.find('.val').empty();
			this.$prepay.find('.val').removeClass('edit').addClass('add');
			this.$payTypes.removeClass('selected payed');
			this.data = null;
			this.facePayData = null;
			this.onlineData = null;
			this.needPay = 0;
			this.$right.removeClass('cash pos wechat alipay pay_cash1')
			this.$.find('.hasGetData').removeClass('hasGetData');
		},
        beforeHide: function(){

        },
        afterHide:function(){
			
		},
		check:function(){
			var $selected = self.$payTypes.filter('.selected');
			if ($selected.length) {
				var data = $selected.data('data');
				var payed = 0;
				if ($selected.hasClass('payed') && data && data.status == 3) {
					payed = 1;
				}
				if (payed) {
					atMobile.nativeUIWidget.showMessageBox({
						title: "用户已完支付",
						content: '用户已在线支付成功,修改会导致支付订单无关联异常，请先退款'
					});
					return false;
				}else {
					return true;
				}
			}else{
				return true;
			}
		},
		prePay:function(type,backstage){
			if(!this.prePayObj){
				this.prePayObj = new PayToolRedeem({
					$: $("#prePayDebtDetail"),
					target: $('#page_addIncome .prePay'),
					getData: function(opt, cb) {
						opt.status=[3];//接口参数
						delete opt.memId;
						var start = new Date();
						start.setDate(start.getDate()-6);
						start.setHours(0);
						start.setMinutes(0);
						start.setSeconds(0);
						opt.period=(start.getTime())+"_"+new Date().getTime();
						var shopId=[];
						shopId.push(am.metadata.userInfo.shopId);
						opt.shopIds=shopId;
						opt.united=0;
						am.api.facePay.exec(opt, cb);//接口
					},
					bindData: function($li, data) {//渲染样式
						if(data.type==5){
							return;
						}
						var sum = 0;
						var payName = ["微信","支付宝","大众点评","银联支付","京东钱包"];//支付类型
						var payType=["美管加代收","自收","收钱吧","京东聚合支付"];//收款类型
						$li.data('data', data);
						console.log(data)
						$li.find('.title').text(payName[data.type*1-1]);
						if(data.type == 4 || data.type == 5){
							$li.find('.code').text(data.outtradeno);
						}else{
							$li.find('.code').text(data.tradeno);
						}
						$li.find('.from').text(payType[data.payType*1]);
						if(!am.isNull(data.details)){
							$.each(data.details,function(k,v){
								sum += v.amount*1;
							});
						}
						$li.find('.price').text((data.price-sum).toFixed(2));
						if(sum == data.price){
							$li.addClass("am-disabled").addClass('hide').find('.status').text("已关联");
						}else{
							$li.removeClass("am-disabled").removeClass('hide').find('.status').text("未关联");
						}
			
						$li.find('.time').text(data.createtime?(new Date(data.createtime*1).format('yyyy.mm.dd')+'-付款'):'');

						var str = '';
						if(data.billno){
							str += '<span>'+data.billno+'</span>' + (data.billno.split('、').length>1?'合并收款；':'收款；');
						}
						if(data.ordercomment){
							str += data.ordercomment;
						}
						if(str){
							$li.find('.remark').html(str);
						}else {
							$li.find('.remark').remove();
						}
					
						return $li;
					},
					complete: function(data) {//回渲染的样式
						var payName = ["微信","支付宝","大众点评","银联支付","京东钱包"];//支付类型
						var payType=["美管加代收","自收","收钱吧","京东聚合支付"];//收款类型
						if(data){
							var sum = 0;
							if(!am.isNull(data.details)){
								$.each(data.details,function(k,v){
									sum += v.amount*1;
								});
							}
							data.price = data.price - sum;
							data.aviablePrice = data.price;
							var needPay = 0;
							if(self.data){
								needPay =  $("#page_addIncome").find('.debtPrice.debtMode').find(".val .num").text();
							}else {
								needPay = $("#page_addIncome").find('.price.incomeMode').find(".val .num").text();
							}
							if(data.price > needPay){
								data.price = needPay-0;
								am.msg("选择的金额大于"+(self.data?'还款':'收款')+"金额");
							}
							var html = '<span class="name">' + payName[data.type*1-1] +' '+payType[data.payType*1]+ '</span>';
							html+='<span class="price">￥' + (data.price).toFixed(2) + '</span>';
							html+='<span class="iconfont icon-juxingkaobei am-clickable"></span>';
							am.page.addIncome.$.find('.prePay').data('data', data).find('.val').html(html).removeClass('add').addClass('edit');
							am.page.addIncome.$.find('.prePay .icon-juxingkaobei').data('data', data)
							console.log(data);
							self.facePayData = data;
						}
					}
				});
			}
			this.prePayObj.show(undefined,type,backstage);
		},
        cash:function(price){
            this.$.find('.payTip.cash .highlight').text(price+'元');
        },
        pos:function(price,reset){
			this.$.find('.payTip.pos .highlight').text(price+'元');
			if(!this.posObj){
				this.posObj = new Paytool({
					$: $("#posDebtPayDetail"),
					pay: function(opt, cb) {
						am.api.posPrecreate.exec(opt, cb);
					},
					query: function(opt, cb) {
						am.api.posQuery.exec(opt, cb);
					},
					cancel: function(opt, cb) {
					},
					refund: function(opt, cb) {
						am.api.posRefund.exec(opt, cb);
					},
					qrpay: function(opt, cb) {
					},
					complete: function(opt) {
						self.payComplete(opt);
					},
					beforeClose: function(data,callback){
						if(data && (data.status!=3 || data.status == 3 && data.payStatus == "refund")){
							var confirmData = {
								caption: "关闭将取消银联支付",
								description: "支付尚未完成，确认关闭吗？",
								okCaption: "确认",
								cancelCaption: "取消"
							};
							if(data.status == 3 && data.payStatus == "refund"){
								confirmData.caption = "提示";
							}
							atMobile.nativeUIWidget.confirm(confirmData, function() {
								callback && callback();
							}, function() {});
						}else {
							callback && callback();
						}
					}
				});
			}
			if(!reset){
				this.posObj.reset();
			}
			if(price){
				this.posObj.show(price,"pos");
			}
        },
		wechat:function (price,reset) {
			if(!this.wechatObj){
				this.wechatObj = new Paytool({
					$: $("#wechatDebtPayDetail"),
					pay: function(opt, cb) {
						am.api.wechatPay.exec(opt, cb);
					},
					query: function(opt, cb) {
						am.api.wechatQuery.exec(opt, cb);
					},
					cancel: function(opt, cb) {
						am.api.wechatCancel.exec(opt, cb);
					},
					refund: function(opt, cb) {
						am.api.wechatRefund.exec(opt, cb);
					},
					qrpay: function(opt, cb) {
						am.api.wechatQrpay.exec(opt, cb);
					},
					complete: function(opt) {
						self.payComplete(opt);
					},
					beforeClose: function(data,callback){
						if(data && (data.status!=3 || data.status == 3 && data.payStatus == "refund")){
							var confirmData = {
								caption: "关闭将取消微信支付",
								description: "支付尚未完成，确认关闭吗？",
								okCaption: "确认",
								cancelCaption: "取消"
							};
							if(data.status == 3 && data.payStatus == "refund"){
								confirmData.caption = "提示";
							}
							atMobile.nativeUIWidget.confirm(confirmData, function() {
								callback && callback();
							}, function() {});
						}else {
							callback && callback();
						}
					}
				});
			}
			if(!reset){
				this.wechatObj.reset();
			}
			if(price){
				this.wechatObj.show(price,"wechat");
			}
        },
        alipay:function (price,reset) {
			if(!this.alipayObj){
				this.alipayObj = new Paytool({
					$: $("#alipayDebtPayDetail"),
					pay: function(opt, cb) {
						//扫码枪支付
						am.api.alipayPay.exec(opt, cb);
					},
					query: function(opt, cb, isQrcode) {
						if (isQrcode) {
							//支付宝特殊处理，没有扫码时支付宝不会生成订单，会报error
							opt.qrcode = 1;
						}
						am.api.alipayQuery.exec(opt, cb);
					},
					cancel: function(opt, cb) {
						am.api.alipayCancel.exec(opt, cb);
					},
					refund: function(opt, cb) {
						am.api.alipayRefund.exec(opt, cb);
					},
					qrpay: function(opt, cb) {
						am.api.alipayQrpay.exec(opt, cb);
					},
					complete: function(opt) {
						self.payComplete(opt);						
					},
					beforeClose: function(data,callback){
						if(data && (data.status!=3 || data.status == 3 && data.payStatus == "refund")){
							var confirmData = {
								caption: "关闭将取消支付宝支付",
								description: "支付尚未完成，确认关闭吗？",
								okCaption: "确认",
								cancelCaption: "取消"
							};
							if(data.status == 3 && data.payStatus == "refund"){
								confirmData.caption = "提示";
							}
							atMobile.nativeUIWidget.confirm(confirmData, function() {
								callback && callback();
							}, function() {});
						}else {
							callback && callback();
						}
					}
				});
			}
			if(!reset){
				this.alipayObj.reset();
			}
			if(price){
				this.alipayObj.show(price,"alipay");
			}
		},
        payComplete: function(data){
			if(data && data.status == 3){
				var $paytype = this.$payTypes.filter('.pay_' + this.type);
				if ($paytype.hasClass("selected")) {
					$paytype.addClass('payed').data('data', data);
					this.onlineData = data;
				}
			}else{
				this.$payTypes.filter('.pay_' + this.type).removeClass('payed').removeData('data');
			}
		},
		addIncome: function(){
			if(!this.data){
				var depcode = this.$depart.data('depcode'),
				dayExpendType = this.$dayExpendType.data('dayExpendType'),
				price = this.$price.find('.num').text(),
				intro = this.$intro.find('.val').text();
				if(!price){
					am.msg('请输入收入金额');
					return;
				}
				if(!dayExpendType){
					am.msg('请选择收入类型');
					return;
				}
				var data = {
					depcode: depcode || '',
					dayExpendType: dayExpendType,
					seFlag: 0,
					price: price,
					profile: '',
					intro: intro,
					type: 1
				}
				var index = this.$.find('.payTypes li.selected').index();
				if(index==-1){
					if(!this.facePayData){
						am.msg('请选择收款方式');
						return;
					}
					if(price!=this.facePayData.price){
						am.msg('收入金额与收款金额不符，请调整');
						return;
					}
				}else {
					// if(index==2 || index==3){
					// 	if(!this.onlineData){
					// 		am.msg('请支付');
					// 		return;
					// 	}
					// }
				}
				data.payWay = index;
				if(index==-1){
					data.payWay = this.facePayData.type+1;
					data.orderId = this.facePayData.id;
				}else if((index==2 || index==3) && this.onlineData) {
					data.orderId = this.onlineData.id;
				}else if(index==0){
					data.orderId = '';
				}else if(index==1){
					//银联pos
					data.payWay = 5;
					data.orderId = '';
					if(this.onlineData){
						data.orderId = this.onlineData.id;
						console.log("银联pos支付成功")
					}else{
						if(am.operateArr.indexOf("a61") > -1){
							return am.msg("不允许银联支付仅记账不收款");
						}
					}
				}

				this.addExps(data);
			}else {
				var index = this.$.find('.payTypes li.selected').index();
				if(index==-1){
					if(!this.facePayData){
						am.msg('请选择还款方式');
						return;
					}
				}else {
					if(index==2 || index==3){
						if(amGloble.operateArr.indexOf('a6')!=-1){
							if(!this.onlineData){
								am.msg('请支付');
								return;
							}
						}
					}
				}
				if(index==-1){
					this.data.repayFee = this.facePayData.price;
					this.data.payWay = this.facePayData.type+1;
					this.data.orderId = this.facePayData.id;
				}else if(index==1 || index==2 || index==3) {
					this.data.payWay = index;
					if(index == 1){
						this.data.payWay = 5;
					}
					if(this.onlineData){
						this.data.repayFee = this.onlineData.price;
						this.data.orderId = this.onlineData.id;
					}else {
						this.data.repayFee = this.needPay;
						this.data.orderId = '';
					} 
				}else if(index==0){
					this.data.repayFee = this.needPay;
					// this.data.repayFee = 0.01;
					this.data.payWay = index;
					this.data.orderId = '';
				}
				this.checkDebtFlag();
				am.loading.show();
				am.api.repayDebt.exec(self.data,function(ret){
					am.loading.hide();
					if(ret && ret.code==0){
						self.queryRemain();
						if(self.data.debtFlag==1 && ret.content){
							self.calNewPerformance(ret.content.id);
						}
					}else if(ret.code == -1){
						am.msg('网络异常，请检查网络后重试');
					}else{
						am.msg('还款失败！');
					}
				});
			}
			
		},
		addExps: function(data){
			am.loading.show();
			am.api.addExps.exec({
				parentShopId:  am.metadata.userInfo.realParentShopId,
				shopId: am.metadata.userInfo.shopId,
				intro: data.intro,
				price: data.price,
				type: data.type,
				seFlag: data.seFlag,
				operateId: am.metadata.userInfo.userId,
				dayExpendType: data.dayExpendType,
				autoFlag: 0,
				depcode: data.depcode,
				profile: data.profile,
				payWay: data.payWay,
				orderId: data.orderId
			},function(ret){
				am.loading.hide();
				console.log(ret);
				if(ret && ret.code == 0){
					am.msg('保存成功');
					if(!self.data){
						$.am.changePage(am.page.about,'slidedown','refreshIncome');
					}
				}else if(ret && ret.code == -1){
					atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据保存失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.addExps(data);
                    }, function(){
                        
                    });
				}else {
					am.msg(ret.message || '保存失败');
				}
			});		
		},
		queryRemain: function(){
			am.loading.show();
			setTimeout(function(){
				am.api.queryDebt.exec({
					memberid: self.data.memberid,
					shopId: self.data.shopId
				},function(ret){
					am.loading.hide();
					if(ret && ret.code==0){
						if(ret.content && ret.content.length){
							var remain = {};
							for(var i=0;i<ret.content.length;i++){
								if(ret.content[i].id==self.data.debtLogId){
									remain = ret.content[i];
								}
							}
							if(remain && remain.remainFee){
								self.remain.show({
									remainFee: remain.remainFee,
									sure:function(){
										self.data.remainFee = remain.remainFee;
										self.beforeShow(self.data);
										self.prePay(self.data.type,1);
									},
									cancel:function(){
										self.debetBack();
									}
								});
							}else {
								am.msg('该欠款已还清');
								self.debetBack();
							}
						}else {
							am.msg('该欠款已还清');
							self.debetBack();
						}
					}else {
						am.msg('还款完成');
						self.debetBack();
					}
				});
			},2000);
		},
		remain:{
			init:function(){
				var _this = this;
				this.$ = $('#page_addIncome .remain');
				this.$.find('.colse,.mask,.right').vclick(function(){
					_this.hide();
					_this.cancel && _this.cancel();
				});
				this.$.find('.left').vclick(function(){
					_this.hide();
					_this.sure && _this.sure();
				});
				this.remainFee = this.$.find('.des span');
			},
			show:function(opt){
				if(!this.$){
		            this.init();
                }
                this.cancel = opt.cancel;
                this.sure = opt.sure;
                this.remainFee.text('￥'+opt.remainFee);
                this.$.show();
			},
			hide:function(){
				this.$.hide();
			}
		},
		debetBack:function(){
			var lastPageId = $.am.history[$.am.history.length-1].id;
			if(lastPageId=='page_memberDetails'){
				$.am.changePage(am.page.memberDetails,"slidedown","refreshIncome")
			}else {
				$.am.page.back("slidedown");
			}
		},
		checkDebtFlag:function(){
			if(this.data.debtFlag!=1){
				return;
			}
			if(this.data.type==1){
				this.calIServicePerformance();
			}else {
				this.calOtherPerformance();
			}
		},
		payTypes: ['cash','','weixin','pay','','unionpay'],
		calIServicePerformance:function(){
			var opt = {
                paid: {},
                card: {
					cardtypeid: this.data.bill.cardTypeId,
					discount: this.data.bill.discount || 10,
					treatcardfee: 0,
					treatpresentfee: 0
				},
				itemList: []
			};
			var _total = this.data.bill.consumeFee;
			if(this.data.cards && this.data.cards.length){
				_total = _total - this.data.cards[0].treatFee - this.data.cards[0].treatPresentFee;
			}
			opt.rate = (this.data.repayFee/this.data.debtFee)*(this.data.debtFee/_total)
			opt.paid[this.payTypes[this.data.payWay]] = this.data.repayFee;

			var allItems = this.data.billDetails;
			var items = [];
			for(var i=0;i<allItems.length;i++){
				if(allItems[i].consumeType!=0 || allItems[i].price==0){
					var servers = allItems[i].empfee;
					if (servers && servers.length) {
						for (var j = 0; j < servers.length; j++) {
							servers[j].automaticPerformance = 1;
							servers[j].fee = 0;
							servers[j].cardfee = 0;
							servers[j].cashfee = 0;
							servers[j].otherfee = 0;
							servers[j].perfDetail = {
								voidFee: 0
							};
						}
					}
				}else {
					items.push(allItems[i]);
				}
			}
			for (var i = 0; i < items.length; i++){
				var itemdata = {
                    itemid: items[i].itemNo,
                    consumetype: this.data.bill.cardType == 1 ? 1 : 2,
                    consumemode: items[i].consumeType,
                    price: items[i].price,
                    cost: items[i].itemPrice,
                    empList: [],
                    cashFee: items[i].cashFee,
                    cardFee: items[i].cardFee,
                    otherFee: items[i].otherFee
                };
                if (items[i].totalTimes === -99) {//不限次参考年卡
                    itemdata.consumemode = 4;
                    itemdata.unlimited = 1;
                }
                var servers = items[i].empfee;
                if (servers && servers.length) {
                    for (var j = 0; j < servers.length; j++) {
						var emp = amGloble.metadata.empMap[servers[j].empId];
						if(emp){
							itemdata.empList.push({
								no: emp.no,
								dutytype: emp.dutyType,
								dutyid: emp.dutyid
							});
						}
                    }
                }
                opt.itemList.push(itemdata);
			}
			var ret = computingPerformance.computing(opt);
			console.log(ret);
			var eaFee = 0;
            for (var i = 0; i < items.length; i++) {
                var payDetail = ret[i].total;
                //员工列表
                var empper = ret[i].empper;
                //店内业绩
                items[i].money = ret[i].shopper;
                eaFee += ret[i].shopper;
                //项目的支付方式拆分
                items[i].payDetail = {};
                for (var j in am.page.pay.payTypeMap) {
                    var k = am.page.pay.payTypeMap[j];
                    items[i].payDetail[j] = payDetail[k] || 0;
                }
				var servers = items[i].empfee;
				// 判断是否开启新业绩模式，若开启走新逻辑
				if (amGloble.metadata.enabledNewPerfModel == 1) {
					for(var k = 0; k < servers.length; k++) {
						servers[k].automaticPerformance = 1;
						var perfDetail = {};
						perfDetail.voidFee = items[i].price*opt.rate;
                   		servers[k].perfDetail = perfDetail;
					}
					continue;
				}
                var payFeePctObj = am.page.pay.getPayFeePctObj({total: items[i].price, payDetail: items[i].payDetail});
                //拿员工业绩
                for (var k = 0; k < servers.length; k++) {
					// 判断是否手动修改业绩
					servers[k].automaticPerformance = 1;
					servers[k].fee = empper[k].pre * servers[k].percent / 100;
					servers[k].cardfee = empper[k].total.cardfee * servers[k].percent / 100;
					servers[k].cashfee = empper[k].total.cashfee * servers[k].percent / 100;
					servers[k].otherfee = empper[k].total.otherfee * servers[k].percent / 100;
                    // 按每一种支付方式换算业绩
                    var perfDetail = {};
                    for (var payName in payFeePctObj) {
                        var pct = payFeePctObj[payName];
                        perfDetail[payName] = servers[k].fee * pct;
                    }
                    // 虚业绩
					perfDetail.voidFee = items[i].price*opt.rate;
                    servers[k].perfDetail = perfDetail;
                }
			}
			this.data.bill.eafee = toFloat(eaFee);
		},
		calOtherPerformance:function(){
			var item = this.data.billDetails[0];
			var servers = item.empfee;
			if(servers && servers.length){
				var t = this.data.repayFee;
				var payDetail = {};
				payDetail[this.payTypes[this.data.payWay]] = t;
				item.payDetail = {};
				for (var j in am.page.pay.payTypeMap) {
                    var k = am.page.pay.payTypeMap[j];
                    item.payDetail[j] = payDetail[k] || 0;
                }
				var payMoneyCategoryPctObj = am.page.pay.getPayMoneyCategoryPctObj({total: t, payDetail: item.payDetail});
				var payFeePctObj = am.page.pay.getPayFeePctObj({total: t, payDetail: item.payDetail, isNotProject: true});
				for (var i = 0; i < servers.length; i++){
					servers[i].automaticPerformance = 1;
					fee = servers[i].fee = toFloat(t/servers.length);
					servers[i].cardfee = fee * payMoneyCategoryPctObj['card'];
					servers[i].cashfee = fee * payMoneyCategoryPctObj['cash'];
					servers[i].otherfee = fee * payMoneyCategoryPctObj['other'];
					// 按每一种支付方式换算业绩
					var perfDetail = {};
					for (var payName in payFeePctObj) {
						var pct = payFeePctObj[payName];
						perfDetail[payName] = servers[i].fee * pct;
					}
					servers[i].perfDetail = perfDetail;
				}
			}
			this.getDeptData();
			this.data.bill.eafee = toFloat(this.data.repayFee);
		},
		getDeptData:function(){
			var dept = am.metadata.deparList;
			var cashList = this.data.cashs,cardList = this.data.cards;
			var arr = [];
			for(var i=0;i<dept.length;i++){
				for(var j=0;j<cashList.length;j++){
					if(cashList[j].depcode === dept[i].code && cashList[j].consumeType !==2 && cashList[j].consumeType !==3){
						arr.push(cashList[j])
						break;
					}
				}
				for(var k=0;k<cardList.length;k++){
					if(cardList[k].depcode === dept[i].code && cardList[k].type===3 && cardList[k].consumeType !==4  && cardList[k].consumeType !==16){
						arr.push(cardList[k])
						break;
					}
				}
			}
			var t = this.data.repayFee;
			var _payDetail = {};
			_payDetail[this.payTypes[this.data.payWay]] = t;
			var payDetail = {};
			for (var j in am.page.pay.payTypeMap) {
				var k = am.page.pay.payTypeMap[j];
				payDetail[j] = _payDetail[k] || 0;
			}
			if(arr.length){
				var total = 0;
				for(var i=0;i<arr.length;i++){
					var _total = 0;
					for (var j in am.page.billRecord.payKey){
						var k = am.page.billRecord.payKey[j];
						if(arr[i][j]){
							total += arr[i][j];
							_total += arr[i][j];
							arr[i][j] = 0;
						}
					}
					arr[i]._total = _total;	
				}
				for(var i=0;i<arr.length;i++){
					for (var j in am.page.billRecord.payKey) {
						var k = am.page.billRecord.payKey[j];
						arr[i][j] = payDetail[k]*(arr[i]._total/total) || 0;
						delete arr[i]._total;
					}
				}
			}
		},
		getCalacAjax:function(params,url,sc){
			am.page.pay.getCalacAjax.call(this,params,url,sc);
		},
		getGainAndVoidFee:function(){
			am.page.pay.getGainAndVoidFee.call(this);
		},
		calNewPerformance:function(id){
			this.billId = id;
			this.billIds = [{id:id}];
			this.getGainAndVoidFee();
		}
    })
})();
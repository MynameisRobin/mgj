(function() {
	var self = am.page.prepay = new $.am.Page({
		id: "page_prepay",
		isWin:navigator.platform.indexOf('Win') == 0,
		backButtonOnclick: function() {
			if(this.backEvent && this.backEvent==1){
                this.changeresult(false);
            }else{
                //$.am.page.back("slidedown");
                am.goBackToInitPage();
            }
		},
		init: function() {
			this.$input = $('.prepayContent').find('.money_input');
			this.$input.on("keyup", function(e) {
                if (e.keyCode == 13) {
                    // self.getData();
                }
            }).on("focus",function(){
                am.keyboard.hide();
            }).on("blur",function(){
                am.keyboard.hide(true);
            });
		},

		beforeShow: function(paras) {
			if(!this.$alipay||!this.$wechat){
				this.bindEvt();
			}
			if(this.isWin){
				this.$input.focus();
			}
			this.$input.val('');
			this.showkeyboard();
			this.changeresult();
		},
		afterShow: function(paras) {
			am.tab.main.hide();
			setTimeout(function(){
			    self.$.find("[isdisabled=1]").attr("disabled",false).removeAttr("isdisabled");
			    if(self.isWin){
					self.$input.focus();
				}
			},50);
		},
		beforeHide: function(paras) {

		},
		afterHide:function () {
			this.$.find("input,textarea").attr("disabled",true).attr("isdisabled",1);
		},
		changeresult:function(flag){
            if(flag){
                self.$.find(".prepayContent").hide().end().find(".searchresult").show();
                self.backEvent=1;
            }else{
                self.$.find(".prepayContent").show().end().find(".searchresult").hide();
                self.backEvent=0;
                self.$input.val("");
                this.showkeyboard();
            }

        },
		bindEvt:function () {
			this.$alipay = $('#alipayPrepay').vclick(function () {
				var val=self.$input.val();
				var res=self.checkValue(val);
				if(!res){
					am.msg('请输入正确金额！');
					return;
				}
				self.alipay(val);
			});
			this.$wechat = $('#wechatPrepay').vclick(function () {
				var val=self.$input.val();
				var res=self.checkValue(val);
				if(!res){
					am.msg('请输入正确金额！');
					return;
				}
				self.wechat(val);
			});
		},
		checkValue:function(val){
			var res=/^\d+(\.\d{1,2})?$/.test($.trim(val));
			if(res&&Number($.trim(val))){
				return true;
			}else{
				return false;
			}
		},
		alipay:function (price) {
			if(!this.alipayObj){
				this.alipayObj = new Paytool({
					$: $("#alipayPrepayDetail"),
					pay: function(opt, cb) {
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
					}
				});
			}
			this.alipayObj.reset();
			this.alipayObj.show(price,"alipay");
		},
		wechat:function (price) {
			if(!this.wechatObj){
				this.wechatObj = new Paytool({
					$: $("#wechatPrepayDetail"),
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
					}
				});
			}
			this.wechatObj.reset();
			this.wechatObj.show(price,"wechat");
		},
		payComplete:function (order) {
			console.log(order);
			if(typeof order=='object'){
				var para={
					form:'prepay',
					querytime:order.createtime
				}
				$.am.changePage(am.page.billRecord, "slideup",para);
			}
		},
        showkeyboard:function(){//收款页面
            var self = this;
            am.keyboard.show({
            	hidedot:false,
                onKeyup:function(value){
                    self.$input.val(value);
                },
                $:$(".prepayContent .searchnumber_box"),
                submit:function(value){
                    // self.getData();
                },
                onConfirm:function(){
                    am.msg('金额输入完之后，请选择收款方式，进行收款！');
                },
            });
        },
	});
})();

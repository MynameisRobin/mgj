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
			
			this.$title = this.$.find('.title');
			this.$remark = this.$.find('.remark');
			this.$addRemark = this.$remark.find('.addRemark').vclick(function(){
				var $this = $(this);
                am.addRemark.show({
                    value: '',
                    cb: function (val) {
						if(val){
							self.$remarkContent.text(val).removeClass('hide');
							$this.addClass('hide');
							self.ordercomment = val;
						}
                    },
                    maxlength: 100
                });
			});
			this.$remarkContent = this.$remark.find('.remarkContent').vclick(function(){
				var $this = $(this);
                am.addRemark.show({
                    value: $this.text(),
                    cb: function (val) {
						$this.text(val);
						self.ordercomment = val;
                        if(!val){
							self.$addRemark.removeClass('hide');
							$this.addClass('hide');
						}else {
							self.$addRemark.addClass('hide');
							$this.removeClass('hide');
						}
                    },
                    maxlength: 100
                });
			});
		},

		beforeShow: function(paras) {
			//如果没配置走之前的逻辑,有配置则显示弹窗
			if(am.metadata.configs && (!am.metadata.configs['jd_unionPOS'] || am.metadata.configs['jd_unionPOS'] === "[]")){
				$("#posPrepay").hide();
			}else{
				$("#posPrepay").show();
			}
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
					$("#jdPrepay").show();
				}else {
					$("#jdPrepay").hide();
				}
				this.hasDisplayJdPay = true;
			}
			if(!this.$alipay||!this.$wechat){
				this.bindEvt();
			}
			if(this.isWin){
				this.$input.focus();
			}
			this.$input.val('');
			this.showkeyboard();
			this.changeresult();

			this.setTitle(paras);
			this.setComment();
			
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
		setTitle: function(paras){
			this.billno = '';
			this.$title.find('p:first-child').text('');
			if(paras && paras.bill && paras.bill.length){
				this.$title.show();
				if(paras.bill.length==1){
					this.$title.find('p:last-child').text('收款');
				}else {
					this.$title.find('p:last-child').text('合并收款');
				}
				var str = '';
				var sum = 0;
				for(var i=0;i<paras.bill.length;i++){
					str += paras.bill[i].displayId+'-'+(paras.bill[i].memId!=-1?paras.bill[i].memName:'散客')+'、';
					sum += paras.bill[i].sumfee;
					sum += paras.bill[i].prodSumfee;
				}
				this.billno = str.substring(0,str.length-1);
				this.$title.find('p:first-child').text(this.billno);
				this.$input.val(Math.round(sum*100)/100);
			}else {
				this.$title.hide();
			}
		},
		setComment:function(){
			this.ordercomment = '';
			this.$addRemark.removeClass('hide');
			this.$remarkContent.addClass('hide').text('');
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
			this.$pos = $('#posPrepay').vclick(function () {
				var val=self.$input.val();
				var res=self.checkValue(val);
				if(!res){
					am.msg('请输入正确金额！');
					return;
				}
				self.pos(val);
			});
			this.$jd = $('#jdPrepay').vclick(function () {
				var val=self.$input.val();
				var res=self.checkValue(val);
				if(!res){
					am.msg('请输入正确金额！');
					return;
				}
				self.jd(val);
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
		pos:function (price) {
			if(!this.posObj){
				this.posObj = new Paytool({
					$: $("#posPrepayDetail"),
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
			this.posObj.reset();
			this.posObj.show(price,"pos");
		},
		alipay:function (price) {
			if(!this.alipayObj){
				this.alipayObj = new Paytool({
					$: $("#alipayPrepayDetail"),
					pay: function(opt, cb) {
						//扫码枪支付
						self.extend(opt);
						am.api.alipayPay.exec(opt, cb);
					},
					query: function(opt, cb, isQrcode) {
						if (isQrcode) {
							//支付宝特殊处理，没有扫码时支付宝不会生成订单，会报error
							opt.qrcode = 1;
						}
						self.extend(opt);
						am.api.alipayQuery.exec(opt, cb);
					},
					cancel: function(opt, cb) {
						am.api.alipayCancel.exec(opt, cb);
					},
					refund: function(opt, cb) {
						am.api.alipayRefund.exec(opt, cb);
					},
					qrpay: function(opt, cb) {
						self.extend(opt);
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
			this.alipayObj.reset();
			this.alipayObj.show(price,"alipay");
		},
		wechat:function (price) {
			if(!this.wechatObj){
				this.wechatObj = new Paytool({
					$: $("#wechatPrepayDetail"),
					pay: function(opt, cb) {
						self.extend(opt);
						am.api.wechatPay.exec(opt, cb);
					},
					query: function(opt, cb) {
						self.extend(opt);
						am.api.wechatQuery.exec(opt, cb);
					},
					cancel: function(opt, cb) {
						am.api.wechatCancel.exec(opt, cb);
					},
					refund: function(opt, cb) {
						am.api.wechatRefund.exec(opt, cb);
					},
					qrpay: function(opt, cb) {
						self.extend(opt);
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
					},
				});
			}
			this.wechatObj.reset();
			this.wechatObj.show(price,"wechat");
		},
		jd:function (price) {
			if(!this.jdObj){
				this.jdObj = new Paytool({
					$: $("#jdPrepayDetail"),
					pay: function(opt, cb) {
						self.extend(opt);
						am.api.jdPay.exec(opt, cb);
					},
					query: function(opt, cb) {
						self.extend(opt);
						am.api.jdQuery.exec(opt, cb);
					},
					cancel: function(opt, cb) {
						am.api.jdCancel.exec(opt, cb);
					},
					refund: function(opt, cb) {
						am.api.jdRefund.exec(opt, cb);
					},
					qrpay: function(opt, cb) {
						self.extend(opt);
 						am.api.jdQrpay.exec(opt, cb);
					},
					complete: function(opt) {
						self.payComplete(opt);
					},
					beforeClose: function(data,callback){
						if(data && (data.status!=3 || data.status == 3 && data.payStatus == "refund")){
							var confirmData = {
								caption: "关闭将取消京东钱包支付",
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
					},
				});
			}
			this.jdObj.reset();
			this.jdObj.show(price,"jd");
		},
		payComplete:function (order) {
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
		extend:function(opt){
			$.extend(opt,{
				billno: this.billno,
				ordercomment: this.ordercomment
			})
		}
	});
})();

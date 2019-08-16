(function() {
    Paytool = function(opt) {

		var _this = this;
        this.onPay = opt.pay;
        this.onQuery = opt.query;
        this.onCancel = opt.cancel;
        this.onBeforeClose = opt.beforeClose;
        this.onRefund = opt.refund;
        this.onQrpay = opt.qrpay;
        this.onComplete = opt.complete;
        this.$i=3;
		this.$refundNum=0;
        this.$qx=function(){
         _this.cxsetTime();
        };
        this.$continue='';
        this.$ = opt.$;
        // this.$ = opt.$.vclick(function() {
        //     _this.hide();
        // });
        this.$mask = this.$.find('.mask').vclick(function() {
            if(_this.onBeforeClose){
				if(am.isNull(_this.tradeData)) return _this.hide();
				var data = _this.tradeData;
				data ? data.payStatus = _this.payStatus : null;
                _this.onBeforeClose(data,function(){
					_this.hide();
					if(data && data.status!=3){
						_this.tradeData = null;
					}
                });
            }else {
                _this.hide();
            }
        });
        this.$inner = this.$.children(".onlinePay")
        // this.$inner = this.$.children(".onlinePay").vclick(function() {
        //     return false;
        // });

        this.$input = this.$.find("input[name=code]").keyup(function (evt) {
            if(evt.keyCode === 13){
	            _this.$button.trigger('vclick');
            }
        });
        this.$button = this.$inner.find(".paybutton").vclick(function() {
            var dynamic = _this.$input.val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g,'');
            _this.$input.val(dynamic);
            if (!dynamic) {
                am.msg("请输入支付条码！");
                return;
            }
            // 性能监控点
            monitor.startTimer('M06')

            
            _this.render(1);
            _this.onPay({
                "price": _this.price,
                "dynamic_id": dynamic,
                "subject": (am.metadata.userInfo.shopName || "") + " " + (am.metadata.userInfo.osName || ""),
            }, function(ret) {
                _this.payCallback(ret);
            });
		});
		this.$posStatus = this.$inner.find(".posStatus");
        this.$status = this.$inner.find(".statusBox").eq(0);
        this.$statusPos = this.$inner.find(".pos .statusBox");
		this.$posList = this.$inner.find(".posList");
		this.$wechatPosList = this.$inner.find(".wechatPosList");
		this.$alipayPosList = this.$inner.find(".alipayPosList");
        this.$loading = this.$status.find(".loading");
        this.$loadingPos = this.$statusPos.find(".loading");
		this.$success = this.$status.find(".success");
		this.$successPos = this.$statusPos.find(".success");
		this.$error = this.$status.find(".error");
		this.$errorPos = this.$statusPos.find(".error");
		this.$paySelect = this.$inner.find(".paySelect");

		//支付宝和微信选择pos机支付
		this.$.on("vclick", ".paySelect li", function () {
			var type = $(this).data("type");
			_this.$.find(".qrReload,.qrcodeimg,.paytip").hide();
			_this.$wechatPosList.hide();
			_this.$alipayPosList.hide();
			_this.qrLoopTimer && clearTimeout(_this.qrLoopTimer);
			$(this).addClass("act").siblings().removeClass("act");
			_this.isNoPos = type === "wechat" || type === "alipay";
			_this.$isAutoShowCode && _this.$isAutoShowCode.addClass('notAutoShowCode').hide();
			_this.$clickToShowCode && _this.$clickToShowCode.hide();
			if(_this.isNoPos){
				_this.getPosList(type);
				if(type === "wechat"){
					_this.$wechatPosList.show();
					var len = _this.$wechatPosList.find("li").length;
					if(len === 1){
						_this.$wechatPosList.find("li").eq(0).trigger("vclick");
					}
				}else{
					_this.$alipayPosList.show();
					var len = _this.$alipayPosList.find("li").length;
					if(len === 1){
						_this.$alipayPosList.find("li").eq(0).trigger("vclick");
					}
				}
			}else{
				_this.$input.attr('disabled', false);
				_this.$button.removeClass("am-disabled");
				var notAutoShowCode = localStorage.getItem('notAutoShowCode');
				if(notAutoShowCode=='true'){
					_this.$isAutoShowCode && _this.$isAutoShowCode.addClass('notAutoShowCode').hide();
					_this.$clickToShowCode && _this.$clickToShowCode.show();
					_this.$.find(".paytip").hide();
				}else {
					//二维码定时器恢复
					_this.getQrPay && _this.getQrPay();
					_this.$isAutoShowCode && _this.$isAutoShowCode.removeClass('notAutoShowCode').show();
					_this.$clickToShowCode && _this.$clickToShowCode.hide();
					_this.$.find(".paytip").show();
				}
				if(_this.$.find(".qrcodeimg").html()){
					_this.$.find(".qrcodeimg").show();
				}else{
					_this.$.find(".qrReload").show();
				}
			}
		});

		this.$.on("vclick", ".alipayPosList li,.wechatPosList li", function () {
			var $this = $(this);
			if ($this.hasClass('am-disabled')) {
				return;
			}
			$this.addClass('am-disabled');
			var sn = $(this).data("sn"),
				payWay = _this.type === "wechat" ? 3 : _this.type === "alipay" ? 1 : undefined;
			console.log(sn)
			am.api.posPrecreate.exec({
				"sn": sn,
				"price": _this.price,
				"subject": (am.metadata.userInfo.shopName || "") + " " + (am.metadata.userInfo.osName || ""),
				"piType": 1, //0刷卡，1扫码
				"payway": payWay //1支付宝 3微信 7pos银联
			}, function(ret) {
				$this.removeClass('am-disabled');
				_this.payCallback(ret);
				if(ret.code === 0){
					am.api.posQuery.exec({
						"payway": _this.type === "wechat" ? 3 : _this.type === "alipay" ? 1 : undefined,
						"out_trade_no": _this.tradeData.outtradeno
					},function(ret){
						if(_this.type === "wechat"){
							_this.$wechatPosList.hide();
						}else{
							_this.$alipayPosList.hide();
						}
						_this.posStatusRender(ret);
					});
				}
			});
		});

		this.$posList.on("vclick","li",function(){
            var $this = $(this);
            if($this.hasClass('am-disabled')){
                return;
            }
            $this.addClass('am-disabled');
			var sn = $(this).data("sn");
			console.log(sn)
			_this.$status.show();
			_this.$loading.show();
			_this.$posList.hide();
			_this.onPay({
				"sn": sn,
                "price": _this.price,
                "subject": (am.metadata.userInfo.shopName || "") + " " + (am.metadata.userInfo.osName || ""),
            }, function(ret) {
                $this.removeClass('am-disabled');
				_this.$loading.hide();
				_this.payCallback(ret);
				if(ret.code === 0){
					_this.onQuery({
						"out_trade_no": _this.tradeData.outtradeno
					},function(ret){
						_this.posStatusRender(ret);
					});
				}else{
					_this.$status.hide();
					_this.$posList.show();
				}
			});
		});
		this.$posStatus.on("vclick","li",function(){
			//刷新重试
			if($(this).hasClass("refresh")){
				if(_this.isNoPos){
					_this.$loadingPos.show();
					_this.$statusPos.show();
					_this.$errorPos.hide();
					_this.$posStatus.hide();
				}else{
					_this.$loading.show();
					_this.$status.show();
					_this.$error.hide();
					_this.$posStatus.hide();
				}
				
				_this.qrLoopTimer && clearTimeout(_this.qrLoopTimer);
				am.api.posQuery.exec({
					"payway": _this.type === "wechat" ? 3 : _this.type === "alipay" ? 1 : undefined,
					"out_trade_no": _this.tradeData.outtradeno
				},function(ret){
					_this.posStatusRender(ret);
				});
			}
			//重选pos机
			if($(this).hasClass("reset")){
				_this.resetting();
			}
		});
        this.$complete = this.$status.find(".complete").vclick(function() {
            var $this = $(this).addClass('am-disabled');
            _this.onQuery({
                "out_trade_no":  _this.tradeData.outtradeno
            }, function(ret) {
                $this.removeClass('am-disabled');
                _this.payCallback(ret);
            });
        });
        this.$cancel = this.$status.find(".cancel").vclick(function() {
            var $this = $(this).addClass('am-disabled');
            _this.onCancel({
                "out_trade_no":  _this.tradeData.outtradeno
            }, function(ret) {
                $this.removeClass('am-disabled');
                _this.$input.val("");
                _this.payCallback(ret);
            });
        });
        this.$refund = this.$.find(".refund").vclick(function() {
            //清楚定时器 避免跳转
            _this.successTimer && clearInterval(_this.successTimer);
            //取消添加事件,
            //给取消按钮添加vclick事件,继续定时器
            $('#refundVccode .qx').one('vclick',_this.$qx);
            if (am.metadata.userInfo && am.metadata.userInfo.operatestr && am.metadata.userInfo.operatestr.indexOf("MGJZ7") != -1) {
                am.msg("对不起，您没有退款权限!");// 支付三秒内退款受权限控制
                return false;
            } else { 
                var opt={
					parentShopId:am.metadata.userInfo.parentShopId,
                    token:am.metadata.userInfo.mgjtouchtoken,
				};
                var $this = $(this).addClass('am-disabled');
                var vc_code=config.gateway+am.api.refundVcCode.serviceName+'?parentShopId='+opt.parentShopId+'&token='+opt.token+'&ts='+new Date().getTime();
                $('#refundVccode .qd').unbind('vclick').on('vclick',function(){
                    var vcCodeText=$('#vcCodeIpt').val();
                    if(!vcCodeText.trim()){
                        am.msg('请输入验证码!');
                        return;
                    }
					am.loading.show("请稍后...");
					var paras = {
						"payway": _this.type === "wechat" ? 3 : _this.type === "alipay" ? 1 : _this.type === "pos" ? 7 : undefined,
                        "out_trade_no": _this.tradeData.outtradeno,
                        "valiCode":vcCodeText,
                        "parentShopId":am.metadata.userInfo.parentShopId
					};
					var callback = function (ret) {
                        am.loading.hide();
                        $this.removeClass('am-disabled');
                        // _this.qrRender(ret);
						_this.$input.val("");
						if(ret.code == 0 && (_this.type == "pos" || _this.isNoPos )){
							_this.posRefundRender();
							return;
						}else if(ret.code != 0){
							return am.msg(ret.message || '哎呀出错啦!~');
						}
                        _this.payCallback(ret);
                        // _this.successTimer();
					};
					//如果是支付宝或者微信的pos机退款就走pos退款
					if(_this.isNoPos){
						am.api.posRefund.exec(paras, callback);
					} else{
						_this.onRefund(paras, callback);
					}
                });
                
				$('#vc_code').unbind('vclick').on("vclick",function(){
					_this.vc_coderefresh(vc_code);
				});
                _this.vc_coderefresh(vc_code);
                $('#vcCodeIpt').val('');
                $('#refundVccode').show();
                $this.removeClass('am-disabled');
            }
            
        });

        this.$qrcode = this.$inner.find(".qrcodeimg");
        this.$qrReload = this.$inner.find(".qrReload").vclick(function() {
            _this.getQrPay();
        });
        this.$qrLoading = this.$inner.find(".qrLoading");
        this.$qrSuccess = this.$inner.find('.qrSuccess');
        this.$qrSuccess.find('.refund').vclick(function() {
            //清楚定时器 避免跳转
            _this.successTimer && clearInterval(_this.successTimer);
            //取消添加事件,
            //给取消按钮添加vclick事件,继续定时器
            $('#refundVccode .qx').one('vclick',_this.$qx);
            if (am.metadata.userInfo && am.metadata.userInfo.operatestr && am.metadata.userInfo.operatestr.indexOf("MGJZ7") != -1) {
                am.msg("对不起，您没有退款权限!");// 支付三秒内退款受权限控制
                return false;
            } else { 
                var opt={
					parentShopId:am.metadata.userInfo.parentShopId,
					token:am.metadata.userInfo.mgjtouchtoken,
				};
                var $this = $(this).addClass('am-disabled');
                var vc_code=config.gateway+am.api.refundVcCode.serviceName+'?parentShopId='+opt.parentShopId+'&token='+opt.token+'&ts='+new Date().getTime();

                $('#refundVccode .qd').unbind('vclick').on('vclick',function(){
                    var vcCodeText=$('#vcCodeIpt').val();
                    if(!vcCodeText.trim()){
                        am.msg('请输入验证码!');
                        return;
                    }
                    am.loading.show("请稍后...");
                    _this.onRefund({
                        "out_trade_no": _this.qrTradeData.outtradeno,
                        "valiCode":vcCodeText,
                        "parentShopId":am.metadata.userInfo.parentShopId
                    }, function (ret) {
                        am.loading.hide();
						$this.removeClass('am-disabled');
						_this.qrRender(ret);
                        // _this.successTimer();
                    });
                });
                
				$('#vc_code').unbind('vclick').on("vclick",function(){
					_this.vc_coderefresh(vc_code);
				});
                _this.vc_coderefresh(vc_code);
                $('#vcCodeIpt').val('');
                $('#refundVccode').show();
                $this.removeClass('am-disabled');
            }
        });

        this.$price = this.$.find('strong.price');

        this.$.find('.barcodeScan').vclick(function(){
            _this.scan($(this));
        });

        this.$isAutoShowCode = this.$.find('.showCode').vclick(function(){
            if($(this).hasClass('notAutoShowCode')){
                $(this).removeClass('notAutoShowCode');
                localStorage.setItem('notAutoShowCode',false);
            }else {
                $(this).addClass('notAutoShowCode');
                localStorage.setItem('notAutoShowCode',true);
            }
        });

        this.$clickToShowCode = this.$.find('.clickToShowCode').vclick(function(){
            $(this).hide();
			_this.$isAutoShowCode.show();
			_this.$.find(".paytip").show();
            _this.getQrPay && _this.getQrPay();
        });
    };
    Paytool.prototype = {
        scan:function($this){
            var _this=this;
            $this.addClass("am-disabled");
            try{
                if(typeof(cordova)=='undefined'){
                    return;
                }
                cordova.plugins.barcodeScanner.scan(function(result) {
                    $this.removeClass("am-disabled");
                    $.am.debug.log("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
                    if(result && result.text){
                        var $siblings = $this.siblings();
                        $siblings.filter('input').val(result.text).next(".mixPayButton").trigger('vclick');
                    }
                }, function(error) {
                    $this.removeClass("am-disabled");
                    //alert("Scanning failed: " + error);
                    amGloble.msg(error);
                });
            }catch(e){
                $.am.debug.log(e);
            }
        },
        vc_coderefresh:function(url){
            $('#vc_code').attr('src',url+'&ts='+new Date().getTime());
        },
        show: function(price,type,itemData) {
        	var u = navigator.userAgent;
			var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
            var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
            var _this = this;
            this.price = price;
            this.type = type;
			this.$price && this.$price.text(price);
            //this.price = 0.01; //0.01;
            this.$.removeClass("dark").show().children().removeClass("show");
            this.animateTimer && clearTimeout(this.animateTimer);
            this.animateTimer = setTimeout(function() {
                _this.$.addClass("dark");
                _this.$inner.addClass("show");
                if(!isAndroid){              	                
                    if(_this.onPay){
                        setTimeout(function () {
                            _this.$input.focus();
                        },500);
                    }
                }

			}, 100);

			//POS机支付成功点击申请退款关闭弹窗，打开后继续轮询
			if(this.tradeData && this.tradeData.status == 3 && this.payStatus == "refund"){
				this.startPosLoopQuery();
			}

			//判断微信支付宝
			if(type === "wechat" || type === "alipay" || type === "jd"){
				this.$paySelect.show();
				//没有配置pos机隐藏选择
				if(am.metadata.configs && (!am.metadata.configs['jd_unionPOS'] || am.metadata.configs['jd_unionPOS'] === "[]")){
					this.$paySelect.hide();
				}
				//支付成功隐藏选择
				if(this.qrTradeData && this.qrTradeData.status == 3 || this.tradeData && this.tradeData.status == 3){
					this.$paySelect.hide();
				}
				else if(!this.isNoPos){
					var notAutoShowCode = localStorage.getItem('notAutoShowCode');
					if(notAutoShowCode=='true'){
						this.$isAutoShowCode && this.$isAutoShowCode.addClass('notAutoShowCode').hide();
						this.$clickToShowCode && this.$clickToShowCode.show();
						_this.$.find(".paytip").hide();
					}else {
						this.$isAutoShowCode && this.$isAutoShowCode.removeClass('notAutoShowCode').show();
						this.$clickToShowCode && this.$clickToShowCode.hide();
						_this.$.find(".paytip").show();
						this.getQrPay && this.getQrPay();
					}
				}else{
					if(!this.tradeData || !this.tradeData.status){
						this.resetting && this.resetting();
						if(type === "wechat"){
							var len = _this.$wechatPosList.find("li").length;
							if(len === 1){
								_this.$wechatPosList.find("li").eq(0).trigger("vclick");
							}
						}else if(type === "alipay"){
							var len = _this.$alipayPosList.find("li").length;
							if(len === 1){
								_this.$alipayPosList.find("li").eq(0).trigger("vclick");
							}
						}else if(type === "jd"){
							var len = _this.$alipayPosList.find("li").length;
							if(len === 1){
								_this.$alipayPosList.find("li").eq(0).trigger("vclick");
							}
						}
						return false;
					}else if(this.tradeData.status > 0){
						//如果上一单状态没走完那么不会重新自动下单
						if(this.tradeData.status == 5 || this.tradeData.status == 1 || this.tradeData.status == 2){
							if(this.tradeData.status == 5){
								this.tradeData = null;
								this.payStatus = "";
							}
							this.resetting && this.resetting();
						}
					}
				}
			}

            if(type=='kb'){
                am.page.pay.getTicketsList('getkoubeiFlow',function (data) {
                    console.log('渲染口碑列表数据',data);
                    am.page.pay.renderTicketsList(data,'kb');
                });
            }else if(type=='dp'){
                am.page.pay.getTicketsList('getdianpingFlow',function (data) {
                    console.log('渲染点评列表数据');
                    am.page.pay.renderTicketsList(data);
                });
            }else if(type=='pos'){
				//如果是银联支付
				console.log(this.tradeData,"===================");
				if(this.tradeData && this.tradeData.status==3){}else{
					this.resetting && this.resetting();
					this.getPosList();
				}
			}
            if(itemData){
                am.page.itemPay.checkAppointItem(itemData);
			}
        },
        payCallback: function(ret) {
            var _this = this,
				configs = {};
            if (ret.code == 0) {
                // 性能监控点
                monitor.stopTimer('M06', 0, ret)

				_this.tradeData = ret.content;
                if (ret.content.status == 0) {
                    //支付失败
                    _this.render(0);
                    am.msg("支付失败,请选择其它方支付方式或重试！");
                } else if (ret.content.status == 1) {
                    //已提交
                    _this.render(2);
                } else if (ret.content.status == 2) {
                    //支付中
                    _this.render(2);
                } else if (ret.content.status == 3) {
                    //支付成功;
                    _this.render(3);
                    am.msg("支付成功！");
                } else if (ret.content.status == 4) {
                    //已撤销
                    _this.render(0);
                    am.msg("支付已取消！");
                } else if (ret.content.status == 5) {
                    //已退款
                    //隐藏弹框
                    $('#refundVccode').hide();
                    //继续定时器,从而跳转页面
                    _this.cxsetTime();
                    _this.getQrPay();
                    //判断是否是退款
                    _this.$refundNum=1;
                    //移除取消按钮绑定事件
                    //给取消按钮添加vclick事件,继续定时器
                     $('#refundVccode .qx').unbind('vclick',_this.$qx);
                    _this.render(0);
                    am.msg("已退款");
                    configs.text = "已退款！";
                }
            } else if (ret.code == -1) {
                // 性能监控点
                monitor.stopTimer('M06', 1)

                am.msg("网络连接异常，请检查网络连接状态！！");
                _this.render(0);
            } else {
                // 性能监控点
                monitor.stopTimer('M06', 1)

                
                am.msg(ret.message || "操作失败，请刷新条码后重试!");
                _this.render(0);
                configs.text = ret.message || "操作失败，请刷新条码后重试!";
            }
            am.mediaShow(2,configs);
        },
        getQrPay: function() {
            var _this = this;
            this.$qrSuccess.hide();
			this.$qrReload.hide();
			this.$qrLoading.show();
            this.onQrpay({
                "price": _this.price,
                "subject": (am.metadata.userInfo.shopName || "") + " " + (am.metadata.userInfo.osName || ""),
            }, function(ret) {
                _this.$qrLoading.hide();
                if (ret && ret.code == 0 && ret.content) {
                    _this.qrts = new Date().getTime();
                    _this.qrTradeData = ret.content.order;
                    var $img = $('<img src="http://common.reeli.cn/component/genqr?message=' + encodeURIComponent(ret.content.qrcode) + '&width=300&height=300"/>');
                    $img.bind({
                        "load": function() {
							$(this).show();
							_this.$.find(".qrcodeimg").show();
                            _this.qrLoopTimer = setTimeout(function() {
                                _this.startQrLoopQuery();
                            }, 4 * 1000);
                        },
                        "error": function() {
                            _this.$qrcode.empty();
                            _this.$qrReload.show();
							_this.$.find(".qrcodeimg").hide();
						}
                    });
                    _this.$qrcode.html($img);
                    //_this.ssqrImgUrl = $img.attr('src');
                    //console.log(_this.ssqrImgUrl)
                    _this.settingMediaScreenQr(_this.type,_this.price,$img.attr('src'));
                } else {
                    ret.message && am.msg(ret.message);
                    _this.$qrcode.empty();
					_this.$qrReload.show();
					_this.$.find(".qrcodeimg").hide();
                }
            });
        },
        startQrLoopQuery: function() {
            var _this = this;
            _this.qrLoopTimer && clearTimeout(_this.qrLoopTimer);
            if(!_this.$.is(':visible')){
                return;
            }
            if (new Date().getTime() - this.qrts > 4.5 * 60 * 1000) {
                //二维码的时间大于5分钟
                _this.getQrPay();
                return;
            }
            if(am.isNull(_this.qrTradeData)){
                return;
            }
            _this.onQuery({
                "out_trade_no": _this.qrTradeData.outtradeno
            }, function(ret) {
				_this.qrRender(ret);
            }, 1);
		},
		//银联
		startPosLoopQuery: function() {
            var _this = this;
            _this.qrLoopTimer && clearTimeout(_this.qrLoopTimer);
            if(!_this.$.is(':visible')){
                return;
			}
			if(sessionStorage.posDate){
				//退款超过两分钟,初始化回来
				if(sessionStorage.posDate <= am.now().getTime()){
					if(_this.isNoPos){
						_this.$loadingPos.hide();
						_this.$successPos.show();
					}else{
						_this.$loading.hide();
						_this.$success.show();
					}
					_this.$refund.show();
					_this.payStatus = "";
					sessionStorage.posDate = null;
					return;
				}
			}
            am.api.posQuery.exec({
				"payway": _this.type === "wechat" ? 3 : _this.type === "alipay" ? 1 : undefined,
                "out_trade_no": _this.tradeData.outtradeno
            }, function(ret) {
				_this.posStatusRender(ret);
            }, 1);
		},
		posStatusRender: function(ret) {
            var _this = this;
			_this.$refundNum=0;
			_this.qrLoopTimer && clearTimeout(_this.qrLoopTimer);
            if (ret.code === 0) {
				_this.tradeData = ret.content;
				if(!ret.content){
					return false;
				}
				_this.$paySelect && _this.$paySelect.hide();
				if(_this.payStatus == "refund"){
					if(ret.content.status != 5){
						//下单中继续loading
						_this.qrLoopTimer = setTimeout(function() {
							_this.startPosLoopQuery();
						}, 4 * 1000);
						return;
					}
				}
                if(ret.content.status == 1 || ret.content.status == 2){
					if(_this.isNoPos){
						_this.$loadingPos.show();
					}else{
						_this.$loading.show();
					}
					//下单中继续loading
					_this.qrLoopTimer = setTimeout(function() {
						_this.startPosLoopQuery();
					}, 4 * 1000);
				} else if (ret.content.status == 3) {
					//支付成功;
					if(_this.isNoPos){
						this.$loadingPos.hide();
						this.$successPos.show();
						this.success(this.$successPos.find('.text'));
					}else{
						this.$loading.hide();
						this.$success.show();
						this.success(this.$success.find('.text'));
					}
					this.$refund.show();
                } else if(ret.content.status == 4){
					if(_this.isNoPos){
						_this.$loadingPos.hide();
						_this.$errorPos.show().find(".info").text('订单已取消');
					}else{
						_this.$loading.hide();
						_this.$error.show().find(".info").text('订单已取消');
					}
					_this.$posStatus.show();
				} else if(ret.content.status == 5){
					//退款完成该清空的该隐藏的一起处理
					sessionStorage.posDate = null;
					_this.payStatus = "";
					_this.resetting();
					_this.hide();
                    //给取消按钮添加vclick事件,继续定时器
                    $('#refundVccode').hide();
					$('#refundVccode .qx').unbind('vclick',_this.$qx);
                    am.msg("已退款！");
				}else {
					if(_this.isNoPos){
						_this.$loadingPos.hide();
						_this.$posStatus.show();
						_this.$errorPos.show().find(".info").text('错误代码：' + (ret.message || '') + '，您可以');
					}else{
						_this.$loading.hide();
						_this.$posStatus.show();
						_this.$error.show().find(".info").text('错误代码：' + (ret.message || '') + '，您可以');
					}
					_this.qrLoopTimer = setTimeout(function() {
						_this.startPosLoopQuery();
					}, 4 * 1000);
				}
			}else{
				if(_this.isNoPos){
					_this.$loadingPos.hide();
					_this.$posStatus.show();
					_this.$errorPos.show().find(".info").text('错误代码：' + (ret.message || '') + '，您可以');
				}else{
					_this.$loading.hide();
					_this.$posStatus.show();
					_this.$error.show().find(".info").text('错误代码：' + (ret.message || '') + '，您可以');
				}
				am.msg(ret.message || '');
			}
		},
		payStatus:"",
		//pos机退款在pos上面
		posRefundRender: function(){
			var _this = this;
			//2分钟超时
			var date = am.now().getTime() + 1000*60*2;
			sessionStorage.posDate = date;
			am.msg("退款申请成功，请在POS机上完成退款操作！");
			$("#refundVccode").hide();
			_this.payStatus = "refund";
			if(_this.isNoPos){
				_this.$loadingPos.show();
				_this.$successPos.hide();
				_this.$wechatPosList.hide();
				_this.$alipayPosList.hide();
			}else{
				_this.$loading.show();
				_this.$success.hide();
				_this.$posList.hide();
			}
			_this.$refund.hide();
			_this.qrLoopTimer && clearTimeout(_this.qrLoopTimer);
			_this.qrLoopTimer = setTimeout(function() {
				_this.startPosLoopQuery();
			}, 4 * 1000);
		},
		//二维码
        qrRender: function(ret) {
            var _this = this;
            _this.$refundNum=0;
            if (ret.code === 0) {
                _this.qrTradeData = ret.content;
                this.$qrSuccess.hide();
                if (ret.content.status == 0) {
                    //支付失败
                    //_this.getQrPay();
                    _this.$qrcode.empty();
					_this.$qrReload.show();
					am.msg("支付失败或支付二维码过期，请重试！");
                } else if (ret.content.status == 1 || ret.content.status == 2) {
                    //已提交
                    _this.qrLoopTimer = setTimeout(function() {
                        _this.startQrLoopQuery();
                    }, 5 * 1000);
                } else if (ret.content.status == 3) {
                    //支付成功;
					//am.msg("支付成功！");
                    this.$qrSuccess.show().find(".refund").show();
					this.success(this.$qrSuccess.find('.text'));
                } else if (ret.content.status == 4) {
                    //已撤销
                    _this.getQrPay();
                    am.msg("支付已取消！");
                } else if (ret.content.status == 5) {
                    //已退款
                    //隐藏弹框
                    $('#refundVccode').hide();
                    //继续定时器,从而跳转页面
                    _this.cxsetTime();
                    _this.getQrPay();
                    //判断是否是退款
                    _this.$refundNum=1;
                    //移除取消按钮绑定事件
                    //给取消按钮添加vclick事件,继续定时器
                     $('#refundVccode .qx').unbind('vclick',_this.$qx);
                    am.msg("已退款！");
                }
            } else if (ret.code == -1) {
                am.msg("网络连接异常，请检查网络连接状态！");
                _this.qrLoopTimer = setTimeout(function() {
                    _this.startQrLoopQuery();
                }, 4 * 1000);
            } else if(ret.code == 1){
                am.msg(ret.message);
                $('#vc_code').trigger('vclick');
            } else {
                am.msg(ret.message || "操作失败，请刷新条码后重试!");
                _this.qrLoopTimer = setTimeout(function() {
                    _this.startQrLoopQuery();
                }, 4 * 1000);
            }
        },
        success: function($text) {
            
            this.$continue=$text;
            $text.text('支付成功,(3)秒后返回');
            // var i = this.$i,         
              var  _this = this;

            _this.$i=3;
            //支付成功后的播报
            try {
                if(localStorage.getItem("mgjpaySoundDisabled") !== '1') {
                    console.log(_this.type === 'alipay');
                    if((_this.type === 'alipay' || _this.type === 'wechat') && !_this.isNoPos) {
                        var paySoundText = _this.type === 'alipay' ? ('支付宝到账' + _this.price + '元') : ('微信到账' + _this.price + '元')
                        console.log(paySoundText)
                        window.attendanceSoket.getAudio(paySoundText)
                    }else {}
                }
            }
            catch(err) {console.log(err.message)}

            
            this.settingMediaScreenQr(this.type,this.price);    
            // console.log(this.type,this.price)
            this.successTimer && clearInterval(this.successTimer);
            this.successTimer = setInterval(function() {
                _this.$i--;
                if (_this.$i == 0) {
					_this.successTimer && clearInterval(_this.successTimer);
					
                    _this.hide();
                    $text.text('支付成功');
                } else {
                    $text.text('支付成功,(' + _this.$i + ')秒后返回');
                }
            }, 1000);
        },
        //重新启用定时器
        cxsetTime:function(){
            console.log(1)
            var _this=this;  
            var $text=_this.$continue;
			var i=_this.$i;
            this.successTimer && clearInterval(this.successTimer);
            this.successTimer = setInterval(function() {
				i--;
				if (i <= 0) {
					_this.successTimer && clearInterval(_this.successTimer);

                    _this.hide();
                    $text.text('支付成功');
                } else {
                    $text.text('支付成功,(' + i + ')秒后返回');
                }
            }, 1000);
        },
        hide: function() {
            var _this = this,
                payData;
            if (this.tradeData && this.tradeData.status == 3 && this.qrTradeData && this.qrTradeData.status == 3) {
                atMobile.nativeUIWidget.showMessageBox({
                    title: "多次支付错误",
                    content: '一单中同时支付两次将无法结算，请将其中一笔支付退款'
                });
                return 1;
            } else if (this.tradeData && this.tradeData.status == 3) {
                payData = this.tradeData;
            } else if (this.qrTradeData && this.qrTradeData.status == 3) {
                payData = this.qrTradeData;
            } 
            else if (this.qrTradeData && this.qrTradeData.status == 2 && _this.$refundNum==1){
                payData = this.qrTradeData;
            } 
            // console.log(this.qrTradeData,'会触发什么')
            this.$inner.removeClass("show");
            this.$.removeClass("dark");
            this.qrLoopTimer && clearTimeout(this.qrLoopTimer);
            if(this.successTimer){
                clearInterval(this.successTimer);
                this.$success.find('.text').text('支付成功');
                this.$qrSuccess.find('.text').text('支付成功');
            }
            this.animateTimer && clearTimeout(this.animateTimer);
            this.animateTimer = setTimeout(function() {
                _this.$.hide();
            }, 250);

            this.onComplete && this.onComplete(payData);
		},
		getPosList: function(type){
			var self = this;
			var jd_unionPOS = am.metadata.configs && am.metadata.configs['jd_unionPOS'];
			if(!jd_unionPOS){
				// self.$posList.html('请先配置好京东聚合支付!~');
				return false;
			};
			jd_unionPOS = JSON.parse(jd_unionPOS);
			console.log(jd_unionPOS,"jd_unionPOS=============");
			this.$posList.empty();
			this.$wechatPosList.empty();
			this.$alipayPosList.empty();
			$.each(jd_unionPOS,function(i,v){
				var $li = $('<li class="am-clickable"><span class="iconfont icon-posji"></span><span class="name"></span><span class="loading"></span></li>').clone(true,true);
				$li.data('sn',v.sn).find(".name").html(v.name || "");
				if(type === "wechat" || type === "alipay"){
					self.$wechatPosList.append($li);
					self.$alipayPosList.append($li);
				}else{
					//银联
					self.$posList.append($li);
				}
			});
		},
        render: function(status) {
            if (status == 0) {
                //初始状态
                this.$input.attr('disabled', false).val("");
				this.$button.removeClass("am-disabled");
				if(this.type !== "pos"){
					this.$status.hide();
					this.$statusPos.hide();
				}
            } else {
                //状态窗口弹出
                this.$input.attr('disabled', true);
				this.$button.addClass("am-disabled");
				if(this.isNoPos){
					this.$statusPos.show();
					if (status == 3) {
						//支付完成
						this.$loadingPos.hide();
						this.$successPos.show();
						this.$complete.hide();
						this.$refund.show();
						this.success(this.$successPos.find('.text'));
					} else {
						this.$loadingPos.show();
						this.$successPos.hide();
						this.$refund.hide();
						if (status == 1) {
							//请求中
							this.$complete.hide();
						} else if (status == 2) {
							//支付中，轮询中
						}
					}
				}else{
					this.$status.show();
					if (status == 3) {
						//支付完成
						this.$loading.hide();
						this.$complete.hide();
						this.$cancel.hide();
						this.$refund.show();
						if(this.type !== "pos"){
							this.$statusPos.find(".refund").hide();
						}
						this.$success.show();
						this.success(this.$success.find('.text'));
					} else {
						this.$loading.show();
						this.$refund.hide();
						this.$success.hide();
						if (status == 1) {
							//请求中
							this.$complete.hide();
							this.$cancel.hide();
						} else if (status == 2) {
							//支付中，轮询中
							if(this.type !== "pos"){
								this.$complete.show();
								this.$cancel.show();
							}
						}
					}
				}
            }
        },
        reset: function() {
            this.render(0);
            this.tradeData = null;
			this.qrTradeData = null;
			this.resetting();
		},
		resetting: function(){
			if(this.type === "pos"){
				this.$posList.show();
				this.$loading.hide();
				this.$success.hide();
				this.$error.hide();
			}else if(this.type === "wechat" || this.type === "alipay"){
				this.$wechatPosList.hide();
				this.$alipayPosList.hide();
				if(this.type === "wechat" && this.isNoPos){
					this.$wechatPosList.show();
				}else if(this.type === "alipay" && this.isNoPos){
					this.$alipayPosList.show();
				}
				this.$loadingPos.hide();
				this.$successPos.hide();
				this.$errorPos.hide();
				//没有配置pos机则不显示选择pos
				if(am.metadata.configs && (!am.metadata.configs['jd_unionPOS'] || am.metadata.configs['jd_unionPOS'] === "[]")){
					this.$paySelect.hide();
				}else{
					this.$paySelect.show();
				}
			}
			this.$complete.hide();
			this.$cancel.hide();
			this.$refund.hide();
			this.$posStatus.hide();
			this.qrLoopTimer && clearTimeout(this.qrLoopTimer);
			sessionStorage.posDate = null;
		},
        settingMediaScreenQr:function(type,price,url){
            if(url){
                var configs = {
                    type:type,
                    price:price,
                    url:url
                }
                am.mediaShow(1,configs);    
            }else{
                var configs = {
                    type:0,
                    text:"成功付款"+price+"元"
                }
                console.log(configs);
                am.mediaShow(2,configs);
            }
            
        }
    };

    PayToolRedeem = function(opt) {
        this.getData = opt.getData;
        this.bindData = opt.bindData;
        this.onComplete = opt.complete;
        this.target = opt.target;
        this.onGetSingleUse = opt.getSingleUse;
		this.onChangeRedPackageStatus = opt.changeRedPackageStatus;
		this.renderValid = opt.renderValid;
        var _this = this;
        this.$ = opt.$.vclick(function() {
            _this.hide();
        });
        this.$inner = this.$.children(".onlinePay").vclick(function() {
            return false;
        });
        this.$sureBtn = this.$.find('.sureBtn').vclick(function(){
            if(!$('div.luckyMoney').is(':visible')){
                return;
            }
            console.log(_this.redPackageArr);
            _this.hide(_this.redPackageArr);
        });
        this.$list = this.$.find(".list ul").on('vclick', 'li', function() {
            // if($(this).hasClass('disabled')){
            //     //目前只有会员卡结算的订单会加上disabled
            //     //其它不允许使用的情况都是am-disabled
            //     am.confirm('会员卡支付订单','顾客使用会员卡卡金支付此订单，无法在收银台核销，请在：其它>商城订单验券 中核销此订单','知道了','去核销',function () {
                    
            //     },function () {
	        //         $.am.changePage(am.page.about, "");
            //     });
            // }else{

            // $(this).addClass('selected').siblings().removeClass('selected');
            // _this.hide($(this).data('data'));

            // }

            if($('div.luckyMoney').is(':visible')) {
                if(!_this.redPackageArr){
                    _this.redPackageArr = [];
                }
                var data = $(this).data('data');
                if($(this).hasClass('selected')){
                    $(this).removeClass('selected');
                    $(this).find('.circular').removeClass('icon-queren');
                    for(var i=0;i<_this.redPackageArr.length;i++){
                        if(_this.redPackageArr[i].id==data.id){
                            _this.redPackageArr.splice(i,1);
                        }
                    }
                }else {
                    $(this).addClass('selected');
                    $(this).find('.circular').addClass('icon-queren');
                    _this.redPackageArr.push(data);
                }
                _this.onChangeRedPackageStatus && _this.onChangeRedPackageStatus(_this.redPackageArr,_this.$list.find('.canUse:not(.selected)'));
            }else {
                $(this).addClass('selected').siblings().removeClass('selected');
                _this.hide($(this).data('data'));
            }
        }).on('vclick','.status',function(event){
            event.stopPropagation();

            var par = $(this).parents('.contentDiv');
            par.toggleClass('open');

            if(par.hasClass('open')) {
                par.find('.explainDiv').show();
                par.find('.explainBtn i').removeClass('icon-icon-arrow-down').addClass('icon-icon-arrow-top');
            }else {
                par.find('.explainDiv').hide();
                par.find('.explainBtn i').removeClass('icon-icon-arrow-top').addClass('icon-icon-arrow-down');
            }
            _this.scrollview.refresh();
        })
        this.scrollview = new $.am.ScrollView({
            $wrap: this.$list.parent(),
            $inner: this.$list,
            direction: [false, true],
            hasInput: false,
        });
        this.$li = this.$list.find("li").remove();
        this.$loading = this.$.find('.c_loading');
        this.$error = this.$.find('.c_error');
        this.$error.find('.button').vclick(function() {
            _this.ajax();
        });
    };
    PayToolRedeem.prototype = {
        show: function(member,expenseCategory,backstage,itemData) {
            this.backstage = backstage;
            if(!this.member || (member.id != this.member.id)){
                if(typeof member!='undefined'){
                    this.member = member;
                }
                this.ajax(itemData);
            }else if(this.isEmpty){
                am.msg('没有记录！');
                Paytool.prototype.show.call(this);
                return;
            }else if(!this.isEmpty) {
                if(!this.backstage){
                    Paytool.prototype.show.call(this,null,null,itemData);
                    // this.onGetSingleUse && this.onGetSingleUse();
                }
            }
            this.expenseCategory=expenseCategory;
            var _this = this;
            setTimeout(function(){
                _this.scrollview.$wrap.css({
                    "height": (_this.$.height() - _this.$.find('.paytitle').outerHeight(true) - _this.$.find('.sureBtn').outerHeight() - 1) + "px"
                });
                _this.scrollview.refresh();
            },100);
        },
        ajax: function(itemData) {
            var _this = this;
            this.$error.hide();
            this.$loading.show();
            this.isEmpty = 0;
            var opt={
                parentShopId: am.metadata.userInfo.parentShopId,
            };
            if(this.member){
                opt.memId=this.member.id;
            }
            this.getData(opt, function(ret) {
                _this.$loading.hide();
                if (ret && ret.code == 0) {
                    if(typeof opt.united!='undefined' && ret.content && ret.content.length){//未关联流水单 过滤数据
                        var container=[];
                        for(var i=0;i<ret.content.length;i++){
                            var item=ret.content[i];
                            // if(!item.displayId){//过滤存在displayId
                            container.push(item);
                            // }
                        }
                        ret.content=container;
                    }
                    if (ret.content && ret.content.length) {
                        _this.$sureBtn.show();
                        _this.render(ret.content);
                        if(!_this.backstage && !_this.$.is(':visible')){
                            Paytool.prototype.show.call(_this,null,null,itemData);
                        }
                    } else {
                        _this.$list.empty();
                        if(!_this.backstage){
                            am.msg('没有记录！');
                        }
                        _this.$sureBtn.hide();
                        _this.hide();
                        _this.isEmpty=1;
                    }
                } else if (ret && ret.code == -1) {
                    _this.$list.empty();
                    _this.$error.show();
                } else {
                    _this.hide();
                    _this.$list.empty();
                    if(!_this.backstage){
                        am.msg('数据读取异常');
                    }
                }
            });
        },
        render: function(data) {
            this.$list.empty();
            for (var i = 0; i < data.length; i++) {
                /*if(data[i].displayId){
                    continue;
                }*/
                this.$list.append(this.bindData(this.$li.clone(), data[i]));
            }
            var target = this.target?(this.target.length?this.target:$(this.target.selector)):null;
            if(target){
                if(data.length){
                    target.addClass('hasGetData');
                    if(target.hasClass("prePay") || target.hasClass("prePayTarget")){
                        var list = this.$list.find("li:not(.hide)");
                        var weixinNum = 0;
                        var payNum = 0;
                        var unipayNum = 0;
                        var jdNum = 0;
                        for(var i=0;i<list.length;i++){
                            var _item = $(list[i]).data('data');
                            if(_item.type==1){
                                weixinNum ++;
                            }
                            if(_item.type==2){
                                payNum ++;
                            }
                            if(_item.type==4){
                                unipayNum ++;
                            }
                            if(_item.type==5){
                                jdNum ++;
                            }
                        }
                        if(weixinNum){
                            target.addClass('hasGetData-WEIXIN');
                        }
                        if(payNum){
                            target.addClass('hasGetData-PAY');
                        }
                        if(unipayNum){
                            target.addClass('hasGetData-UNIONPAY');
                        }
                        if(jdNum){
                            target.addClass('hasGetData-JINGDONG');
                        }
                        if(this.$list.find("li.hide").length == this.$list.find("li").length){
                            target.removeClass('hasGetData');
                        }
                    }
                    if(target.hasClass("luckymoney")){
                        if((this.$list.find("li.hide").length+this.$list.find("li.am-disabled").length) == this.$list.find("li").length){
                            target.removeClass('hasGetData');
                        }
                    }
                }else {
                    target.removeClass('hasGetData');
                }
            }
            this.onGetSingleUse && this.onGetSingleUse();
            var _this = this;
            setTimeout(function(){
                _this.scrollview.$wrap.css({
                    "height": (_this.$.height() - _this.$.find('.paytitle').outerHeight(true) - _this.$.find('.sureBtn').outerHeight() - 1) + "px"
                });
                _this.scrollview.refresh();
            },100);
        },
        hide: function(data) {
            var _this = this;
            this.$inner.removeClass("show");
            this.$.removeClass("dark");
            this.qrLoopTimer && clearTimeout(this.qrLoopTimer);
            this.successTimer && clearInterval(this.successTimer);
            this.animateTimer && clearTimeout(this.animateTimer);
            this.animateTimer = setTimeout(function() {
                _this.$.hide();
            }, 250);
            this.onComplete && this.onComplete(data);
            this.backstage = 1;
        },
        reset: function() {
            this.member = null;
        },
    };


    am.page.pay.paytool = {
        init: function() {
            var _this = this;
            this.luckyMoney = new PayToolRedeem({
                $: $("#luckyMoneyDetail"),
                target: $('dd.luckymoney'),
                getData: function(opt, cb) {
                    opt.status="1,2,4";
                    am.api.getLuckyMoney.exec(opt, cb);
                },
                bindData: function($li, data) {
                    // console.log(111111111111, data);

                    if(data.expiretime<new Date().getTime()){
                        return;
                    }

                    $li.data('data', data);
                    if(data.rule && JSON.parse(data.rule).content && JSON.parse(JSON.parse(data.rule).content).title){
                        $li.find('.title').text(JSON.parse(JSON.parse(data.rule).content).title);
                    }else{
                        $li.find('.title').text(data.activityTitle);
                    }
                    if(data.money){
                        $li.find('.price').text(data.money).show();
                        $li.find('.discount').hide();
                    }else {
                        if(data.rule && JSON.parse(data.rule).useTemplate){
                            var rule = JSON.parse(JSON.parse(JSON.parse(data.rule).content).rule);
                            if(rule && rule.extraRule && rule.extraRule.type==2){
                                $li.find('.discount').text(rule.extraRule.discount+'折').show();
                                $li.find('.price').hide();
                            }
                        }
                        
                    }
                    var startTime = 0 ,endTime = 0;
                    if(data.rule && JSON.parse(data.rule).useTemplate){
                        var rule = JSON.parse(JSON.parse(JSON.parse(data.rule).content).rule);
                        if(rule && rule.validitymode==0){
                            endTime = data.expiretime;
                            startTime = data.createtime*1 + rule.days*24*60*60*1000;
                        }else if(rule && rule.validitymode==1) {

                            endTime = new Date(rule.endTime+' 23:59:59').getTime();
                            startTime = new Date(rule.startTime).getTime();
                        }
                    }else {
                        endTime = data.expiretime;
                        startTime = data.createtime;
                    }

                    if(new Date().getTime()>endTime){
                        data.status = -1;
                    }else if(new Date().getTime()<startTime){
                        data._status = -2;
                    }

                    if(data.atemplateid==7 && data.shops && data.shops.indexOf(amGloble.metadata.userInfo.shopId)==-1){
                        data.status = -3;
                    }
                    var shopText = "";// 配置的使用门店规则
                    if (data.status == 1) {
                        if(data._status==-2){
                            $li.addClass('am-disabled').find('.status').text("未到使用时间");
                        }else {
                            $li.addClass('am-disabled').find('.status').text("无法使用");
                        }
                        $li.find('.price,.discount').addClass('unopen').text(data.shareRequire ? "分享后领取" : "未拆");
                    } else if (data.status == 2 && !data._status) {
                        var useable = [];
                        var allow = false;
                        if(data.rule && JSON.parse(data.rule).useTemplate){
                            var rule = JSON.parse(JSON.parse(JSON.parse(data.rule).content).rule);
                            if(rule.luckyMoneyRule.enableCashierPay){
                                allow = true;
                            }
                        }else {
                            if(data.allowcashierpay){
                                allow = true;
                            }
                        }
                        if (allow) {
                            $li.addClass('canUse').find(".status").text('可使用');
                            var currentShopId=amGloble.metadata.userInfo.shopId;
                            var appShopInfo=JSON.parse(data.appShopInfo);
                            if(amGloble.metadata.userInfo.shopType==1){
                                // 单店
                                shopText="";
                            }else if(currentShopId && appShopInfo){
                                if(appShopInfo.chosenShop==1 && appShopInfo.currentShop){
                                    // 仅发送门店可用
                                    shopText = "仅在发送门店可使用:"+appShopInfo.currentShop.osName;
                                    if(appShopInfo.currentShop.id==currentShopId){
                                        $li.addClass('canUse').find(".status").text('可使用');
                                    }else{
                                        $li.removeClass('canUse').addClass('am-disabled').find(".status").text('仅在发送门店可使用');
                                    }
                                }else if(appShopInfo.chosenShop==2){
                                    // 指定门店可用
                                    shopText="可用门店:";
                                    var avaliable=0;
                                    var shopMap=amGloble.metadata.shopMap,
                                        checkedDirectShops=appShopInfo.checkedDirectShops,
                                        checkedIndirectShops=appShopInfo.checkedIndirectShops;
                                        if(checkedDirectShops && shopMap ){
                                            for (var i = 0, dlen = checkedDirectShops.length; i < dlen; i++) {
                                                var ditem = checkedDirectShops[i]; // 直属门店id
                                                if(ditem && shopMap[ditem] && shopMap[ditem].osName){
                                                    shopText +=shopMap[ditem].osName + '、';
                                                }
                                                if (ditem== currentShopId) {
                                                    avaliable = 1;
                                                }
                                            }
                                        }
                                    if(checkedIndirectShops && shopMap){
                                        for (var j = 0, ilen = checkedIndirectShops.length; j < ilen; j++) {
                                            var iitem = checkedIndirectShops[j]; // 附属门店id
                                            if(iitem && shopMap[iitem] && shopMap[iitem].osName){
                                                shopText += shopMap[iitem].osName + '、';
                                            }
                                            if (iitem== currentShopId) {
                                                avaliable = 1;
                                            }
                                        }
                                    }
                                    shopText = shopText.substring(0, shopText.length - 1); // 去掉最后的、
                                    if (!avaliable) {
                                        appShopText = '该门店不可使用';
                                        $li.addClass('am-disabled').find(".status").text(appShopText);
                                    }
                                }else{
                                    // 全部门店可用
                                    shopText = "全部门店可用";
                                }
                            }
                        } else {
                            $li.addClass('am-disabled').find(".status").text('不可店内消费');
                        }
                    } else if (data.status == 3 && !data._status) {
                        $li.addClass('am-disabled').find(".status").text("已使用");
                    } else if (data.status == 4 && !data._status) {
                        $li.find(".status").text("已使用，待关联"); 
                    } else if (data.status == -1 && !data._status) {
                        $li.addClass('am-disabled').find(".status").text("已过期");
                    }else if (data._status == -2) {
                        $li.addClass('am-disabled').find(".status").text("未到使用时间");
                    }else if (data.status == -3 && !data._status) {
                        $li.addClass('am-disabled').find(".status").text("不可在本店使用");
                    }
                    if($li.hasClass('am-disabled')){
                        // 不可用
                        var currentShopId=amGloble.metadata.userInfo.shopId;
                            var appShopInfo=JSON.parse(data.appShopInfo);
                            if(amGloble.metadata.shopList && amGloble.metadata.shopList.length==1){
                                // 单店
                                shopText="";
                            }else if(currentShopId && appShopInfo){
                                if(appShopInfo.chosenShop==1 && appShopInfo.currentShop){
                                    // 仅发送门店可用
                                    shopText = "仅在发送门店可使用:"+appShopInfo.currentShop.osName;
                                    // $li.find(".status").text('仅在发送门店可使用');
                                }else if(appShopInfo.chosenShop==2){
                                    // 指定门店可用
                                    shopText="可用门店:";
                                    var avaliable=0;
                                    var shopMap=amGloble.metadata.shopMap,
                                        checkedDirectShops=appShopInfo.checkedDirectShops,
                                        checkedIndirectShops=appShopInfo.checkedIndirectShops;
                                        if (shopMap && checkedDirectShops) {
                                            for (var i = 0, dlen = checkedDirectShops.length; i < dlen; i++) {
                                                var ditem = checkedDirectShops[i];
                                                if (ditem && shopMap[ditem] && shopMap[ditem].osName) {
                                                    shopText += shopMap[ditem].osName + '、';
                                                }
                                                if (ditem == currentShopId) {
                                                    avaliable = 1;
                                                }
                                            }
                                        }
                                        if (shopMap && checkedIndirectShops) {
                                            for (var j = 0, ilen = checkedIndirectShops.length; j < ilen; j++) {
                                                var iitem = checkedIndirectShops[j];
                                                if (iitem && shopMap[iitem] && shopMap[iitem].osName) {
                                                    shopText += shopMap[iitem].osName + '、';
                                                }
                                                if (iitem == currentShopId) {
                                                    avaliable = 1;
                                                }
                                            }
                                        }
                                    shopText = shopText.substring(0, shopText.length - 1); // 去掉最后的、
                                    if (!avaliable) {
                                        appShopText = '该门店不可使用';
                                        // $li.find(".status").text(appShopText);
                                    }
                                }else{
                                    // 全部门店可用
                                    shopText = "全部门店可用";
                                }
                            }

                    }
                    //9.11红包判断
                    function serverList (list) {
                        var str = '';
                        $.each(list, function(i, item) {
                            // console.log(item.name);
                            return str += '<span class="" data-id="' + item.id +'">' + item.name + (i == (list.length-1) ? '' : '、' ) + '</span>'
                        })
                        return str;
                    };
                    
                    if(data.rule != undefined) {
                        var dataRule = JSON.parse(data.rule);
                        if(dataRule.useTemplate) {  //true 为新红包
                            var rule = JSON.parse(JSON.parse(dataRule.content).rule);
            
                            if(rule != undefined && rule.luckyMoneyRule) {
                                var allowCashierPay = rule.luckyMoneyRule.enableCashierPay == true ? rule.luckyMoneyRule.allowCashierPay : null,
                                allowMallPay = rule.luckyMoneyRule.enableMallPay == true? rule.luckyMoneyRule.allowMallPay : null;

                                if(rule.luckyMoneyRule.enableCashierPay) {
                                    //是否启用店内消费抵扣
                                    // $li.find('.explainDiv').append('<span class="tipsContent">店内抵扣 : 满' + allowCashierPay.consumptionAmount + '元可以抵扣现金，' + ( allowCashierPay.items && allowCashierPay.items.length > 0 ? ('指定可用项目' + serverList(allowCashierPay.items) ) : '') + '，' + rule.requiredShare + '人共享此红包</span>')
                                    // $li.find('.explainDiv').append(
                                    //     '<span class="tipsContent">店内抵扣' +
                                    //         (allowCashierPay.consumptionAmount ? ' : 满' + allowCashierPay.consumptionAmount + '元可以抵扣现金' : '' ) +
                                    //         (allowCashierPay.items && allowCashierPay.items.length > 0 ? (',指定可用项目' + serverList(allowCashierPay.items) ) : '') +
                                    //         (rule.requiredShare && rule.requiredShare > 0 ? rule.requiredShare + '人共享此红包' : '') +
                                    //     '</span>'
                                    // )

                                    var textObj={};
                                        textObj.subtract=allowCashierPay.consumptionAmountFlag&&allowCashierPay.consumptionAmount?'满'+allowCashierPay.consumptionAmount+'元可以抵扣现金，':'';
                                        textObj.memCard=allowCashierPay.memCard?'禁止同时使用会员卡(散客卡可以使用)，':'';
                                        textObj.otherRedPackage=allowCashierPay.otherRedPackage?'禁止同时使用其它红包，':'';
                                        //是否启用店内消费抵扣
                                        // $(domS).find('.tips').append('<span class="tipsContent">店内抵扣 : 满' + allowCashierPay.consumptionAmount + '元可以抵扣现金，' + (allowCashierPay.items && allowCashierPay.items.length > 0 ? ('指定可用项目' + serverList(allowCashierPay.items)) : '') + '，' + data.requiredShare + '人共享此红包</span>')
                                        if(textObj.subtract||textObj.memCard||textObj.otherRedPackage){
                                            $li.find('.explainDiv').append('<span class="tipsContent">店内抵扣 :' + (textObj.subtract||'')+(textObj.memCard||'')+(textObj.otherRedPackage||'')+ (allowCashierPay.items && allowCashierPay.items.length > 0 ? ('指定可用项目' + serverList(allowCashierPay.items)) : '') +'</span>');
                                        }else{
                                            $li.find('.explainDiv').append('<span class="tipsContent">店内消费可用</span>');
                                        }

                                }else {}
                                if(rule.luckyMoneyRule.enableMallPay) {
                                    //是否启用商城购物抵扣
                                    //$li.find('.explainDiv').append('<span class="tipsContent">商城抵扣 : 满' + allowMallPay.orderAmount + '元可以抵扣现金，' + ( allowMallPay.items && allowMallPay.items.length > 0 ? ('指定可用项目' +  serverList(allowMallPay.items) ) : '') + '，' + rule.requiredShare + '人共享此红包</span>')
                                    // $li.find('.explainDiv').append(
                                    //     '<span class="tipsContent">商城抵扣' +
                                    //         (allowMallPay.orderAmount ? ' : 满' + allowMallPay.orderAmount + '元可以抵扣现金' : '' ) +
                                    //         (allowMallPay.items && allowMallPay.items.length > 0 ? (',指定可用项目' + serverList(allowMallPay.items) ) : '') +
                                    //         (rule.requiredShare && rule.requiredShare > 0 ? rule.requiredShare + '人共享此红包' : '') +
                                    //     '</span>'
                                    // )

                                    var objText={};
                                        objText.orderAmount=allowMallPay.orderAmountFlag&&allowMallPay.orderAmount?'订单金额满'+allowMallPay.orderAmount+'元可以用，':'';
                                        objText.onlineScore=allowMallPay.onlineScore?'禁止与线上积分同时使用，':'';
                                        objText.offlineScore=allowMallPay.offlineScore?'禁止与线下积分同时使用，':'';
                                        objText.memCard=allowMallPay.memCard?'禁止同时使用会员卡(散客卡可以使用)，':'';
                                        if(objText.orderAmount||objText.onlineScore||objText.offlineScore||objText.memCard){
                                            $li.find('.explainDiv').append('<span class="tipsContent">商城抵扣 : ' + (objText.orderAmount||'')+(objText.onlineScore||'')+(objText.offlineScore||'') +(objText.memCard||'') + (allowMallPay.items && allowMallPay.items.length > 0 ? ('指定可用项目' + serverList(allowMallPay.items)) : '') +'</span>')
                                        }else{
                                            $li.find('.explainDiv').append('<span class="tipsContent">商城可用</span>');
                                        }

                                }else {}

                                $li.find(".status").addClass('am-clickable').append('<span class="explainBtn">,使用规则<i class="iconfont icon-icon-arrow-down"></i></span>');
                            }else {}

                            //清除红包规则描述最后一个逗号
                             $li.find('span.tipsContent').each(function(){
                                var textString=$(this).text().trim(),
                                $this=$(this),
                                len=$this.children('span').length;
                                
                                if(textString.lastIndexOf('，')!=-1&&len==0){
                                    $this.text(textString.substring(0,textString.length-1));
                                }
                            });
                            if(rule.luckyMoneyRule.enableMallPay && !rule.luckyMoneyRule.enableCashierPay){
                                // 仅商城可用
                                shopText="";
                            }
                        }else {}
                        $li.find('.explainDiv').append('<span class="tipsContent">'+shopText+'</span>');
                    }else {}


                    $li.find('.listLeft .line').show();
                    $li.find('.explainDiv').hide();
                    if(data._status==-2){
                        $li.find('.time').text('使用时间：' + new Date(startTime*1).format('yyyy.mm.dd')+'-'+new Date(endTime*1).format('yyyy.mm.dd'));
                    }else {
                        $li.find('.time').text('到期时间：' + new Date(data.expiretime*1).format('yyyy.mm.dd'));
                    }
                    
                    return $li;
                },
                complete: function(data) {
                    if(data){
                        // var html = '<span class="name">' + data[0].activityTitle + '</span><span class="price">￥' + data[0].money + '</span>';
                        // am.page.pay.$list.find('dd.luckymoney').data('data', data).find('.val').html(html).removeClass('add').addClass('edit');
                        am.page.pay.$list.find('dd.luckymoney').data('data', data);
                        am.page.pay.setNeedPay();
                    }
                },
                getSingleUse: function(){
                    var currentPage = $.am.getActivePage();
                    if(currentPage.id=='page_pay'){
                        am.page.pay.checkSingleUse();
                    }
                },
                changeRedPackageStatus: function(data,lis){
                    am.page.pay.changeRedPackageStatus(data,lis);
                },
            });

            this.mallOrder = new PayToolRedeem({
                $: $("#mallOrderDetail"),
                target: $('dd.mallOrder'),
                getData: function(opt, cb) {
                    opt.status="2,4";
                    am.api.getMallOrder.exec(opt, cb);
                },
                bindData: function($li, data) {
                    $li.data('data', data);
                    $li.find('.title').text(data.mallItemName);
                    $li.find('.price').text(data.realmoney*1 || 0);
                    // $li.find('.price').text(((data.cashPay*1||0)+ (data.luckyMoneyPay*1||0)));
					$li.find('.code').text(data.code);
					$li.find('.time').text(new Date(data.createTime*1).format('yyyy.mm.dd')+'购买');
					//美一刻购买的套餐订单不能在此处使用
					if(data.mallItem&&data.mallItem.packageInfo){
						$li.addClass('am-disabled').find('.status').text("商城购买的套餐订单需要顾客在美一客/小程序中进行核销");
						return $li;
					}
                    if (data.status == 1) {
                        //"未支付";
                    } else if (data.status == 2 || data.status == 4) {
                        var shops = data.mallItem.shopIds;
                        if (shops) {
                            shops = shops.split(",");
						}
						var useable = data.status == 2 ? "可使用":"待再次核销";
                        if (shops && shops.length) {
                            if ($.inArray(am.metadata.userInfo.shopId+"", shops) == -1) {
                                $li.addClass('am-disabled').find('.status').text("本门店不可使用");
                            } else {
	                            if(data.payType == 3){
		                            // $li.addClass("disabled").find('.status').text("会员卡支付订单请单独核销");
	                            }else{
		                            $li.find('.status').text(useable);
                                }
                            }
                        } else {
                            $li.find('.status').text(useable);
						}
						if(data.status == 2){
							$li.find('.status').html(this.renderValid(data));
							if(data.expireWriteoffTime && data.wiriteoff == 2){
								$li.addClass('am-disabled').find('.status').text("已过有效期");
							} else if(data.wiriteoff == 1 && (data.startWriteoffTime && data.endWriteoffTime)){
								$li.addClass('am-disabled');
							}
							return $li;
						}
                    } else if (data.status == 3) {
                        //"已兑换";
                    } else {
	                    //"订单异常";
                    }


                    //expenseCategory跟 category一一对应，不确认后面的，还是不写成 data.mallItem.category-1 == this.expenseCategory
                    /*if(
                        (this.expenseCategory == 0 && data.mallItem.category!=1) ||
                        (this.expenseCategory == 1 && data.mallItem.category!=2)
                    ){
						$li.addClass("am-disabled").find('.status').text("订单类别不符");
					}*/

                    return $li;
				},
                complete: function(data) {
                    if(data){
                        // var needPay = am.page.pay.$list.find('dt.needPay').find(".val").text().replace("￥","");
                        var needPay = am.page.pay.opt.option.billingInfo.total || 0;
                        if(data.realmoney > needPay){
                            // if(((data.cashPay*1||0) + (data.luckyMoneyPay*1||0)) > needPay){
                            data.price = needPay - 0;
                            am.msg("选择的金额大于消费金额");
                        }
                        else{
                            data.price = data.realmoney || 0;
                        }
                        var html = '<span class="name">' + data.mallItemName + '</span>';
                        html += '<span class="price">￥' + data.price + '</span>';
                        am.page.pay.$list.find('dd.mallOrder').data('data', data).find('.val').html(html).removeClass('add').addClass('edit');
                        am.page.pay.setNeedPay();
                    }
				},
				renderValid: function(paras){
					var txt = '';
					if (paras && (paras.expireWriteoffTime || (paras.startWriteoffTime && paras.endWriteoffTime && paras.startWriteoffTime != 'null:null' && paras.endWriteOffTime != 'null:null'))) {
						var obj = {
							'writeOffDays': paras.expireWriteoffTime ? am.converDays(paras.expireWriteoffTime) : null,
							'startWriteoffTime': paras.startWriteoffTime,
							'endWriteoffTime': paras.endWriteoffTime
						};
						if (obj.writeOffDays) {
							txt = '<span class="red">' + obj.writeOffDays + '过期</span>';
						}
						if (obj.startWriteoffTime && obj.endWriteoffTime) {
								txt = '<span>'
								+ '该商品仅能在每日'
								+ '<span class="red">'+ obj.startWriteoffTime + '-' + obj.endWriteoffTime + '</span>'
								+ ' 时段内进行到店核销</span>'
								+ '</span>';
						} 
						if (obj.writeOffDays && (obj.startWriteoffTime && obj.endWriteoffTime)) {
								txt = '<span>'
								+ '<span class="red">'+ obj.writeOffDays +'过期</span>'
								+ '，该商品仅能在每日'
								+ '<span class="red">'+ obj.startWriteoffTime + '-' + obj.endWriteoffTime + '</span>'
								+ ' 时段内进行到店核销</span>'
								+ '</span>';
						}
					}
					return txt;
				}
			});
			// this.mallOrder = new PayToolRedeem({
            //     $:$("#luckyMoneyDetail"),
            //     getData:function(opt, cb){
            //         am.api.getLuckyMoney.exec(opt, cb);
            //     },
            // });
            this.prePay = new PayToolRedeem({
                $: $("#prePayDetail"),
                target: $('dd.prePay'),
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
                    var sum = 0;
                    var payName = ["微信","支付宝","大众点评","银联支付","京东钱包"];//支付类型
                    var payType=["美管加代收","自收","收钱吧","京东聚合支付"];//收款类型
                    $li.data('data', data);
                    // console.log(data)
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
                    sum = sum.toFixed(2);
                    $li.find('.price').text((data.price-sum).toFixed(2));
                    if(sum == data.price){
                        $li.addClass("am-disabled").addClass('hide').find('.status').text("已关联");
                    }else{
                        $li.removeClass("am-disabled").removeClass('hide').find('.status').text("未关联");
                    }

                    $li.find('.time').text(data.createtime?(new Date(data.createtime*1).format('yyyy.mm.dd')+'-付款'):'');

                    var str = '';
                    var remarkBg = false;
                    if(data.billno){
                        str += '<span>'+data.billno+'</span>' + (data.billno.split('、').length>1?'合并收款；':'收款；');
                        remarkBg = true;
                    }
                    if(data.ordercomment){
                        str += data.ordercomment;
                    }
                    if(str){
                        $li.find('.remark').html(str);
                    }else {
                        $li.find('.remark').remove();
                    }
                    if(remarkBg){
                        var displayId = am.page.pay.opt.option.displayId;
                        var _bill = data.billno.split('、');
                        var billArr = [];
                        for(var i=0;i<_bill.length;i++){
                            billArr.push(_bill[i].split('-')[0]);
                        }
                        if(billArr.indexOf(displayId)!=-1){
                            $li.addClass('remark_bg');
                        }
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
                        var needPay = (am.page.pay.opt.option.billingInfo.total || 0) + (am.page.pay.opt.option.cost || 0);
                        if(data.price > needPay){
                            data.price = needPay-0;
                            am.msg("选择的金额大于消费金额");
                        }
                        var html = '<span class="name">' + payName[data.type*1-1] +' '+payType[data.payType*1]+ '</span>';
                        html+='<span class="price">￥' + (data.price).toFixed(2) + '</span>';
                        html+='<span class="iconfont icon-juxingkaobei am-clickable"></span>';
                        am.page.pay.$list.find('dd.prePay').data('data', data).find('.val').html(html).removeClass('add').addClass('edit');
                        am.page.pay.$list.find('dd.prePay .icon-juxingkaobei').data('data', data)
	                    am.page.pay.paytool.reset();
	                    am.page.pay.paytool.hide();
                        am.page.pay.setNeedPay();
                    }
                }
            });
            this.pos = new Paytool({
                $: $("#posPayDetail"),
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
                    _this.payComplete(opt);
                },
                beforeClose: function(data,callback){
                    var posThis = this;
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
            this.wechat = new Paytool({
                $: $("#wechatPayDetail"),
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
                    _this.payComplete(opt);
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
            this.alipay = new Paytool({
                $: $("#alipayPayDetail"),
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
                    _this.payComplete(opt);
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
            this.jd = new Paytool({
                $: $("#jdPayDetail"),
                pay: function(opt, cb) {
                    am.api.jdPay.exec(opt, cb);
                },
                query: function(opt, cb) {
                    am.api.jdQuery.exec(opt, cb);
                },
                cancel: function(opt, cb) {
                    am.api.jdCancel.exec(opt, cb);
                },
                refund: function(opt, cb) {
                    am.api.jdRefund.exec(opt, cb);
                },
                qrpay: function(opt, cb) {
                    am.api.jdQrpay.exec(opt, cb);
                },
                complete: function(opt) {
                    _this.payComplete(opt);
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
                }
            });
            this.dp = new Paytool({
                $: $("#dpPayDetail"),
                pay: function(opt, cb) {
                    am.api.dpPay.exec(opt, cb);
                },
                query: function(opt, cb) {
                    am.api.dpQuery.exec(opt, cb);
                },
                cancel: function(opt, cb) {
                    am.api.dpRefund.exec(opt, cb);
                },
                refund: function(opt, cb) {
                    am.api.dpRefund.exec(opt, cb);
                },
                qrpay: function(opt, cb) {
                    am.api.dpQrpay.exec(opt, cb);
                },
                complete: function(opt) {
                    if(opt){
                        this.$.find('input[name=coupon]').attr("disabled", true).next().addClass('am-disabled');
                    }
                    _this.payComplete(opt);
                }
            });
            this.dp.$.find("input[name=coupon]").keyup(function (evt) {
                if(evt.keyCode === 13){
                    $(this).next().trigger('vclick');
                }
            });
            this.dp.$.find('input[name=coupon]').next().vclick(function() {
                var $this = $(this);
                var code = $this.prev().val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g,'');
                $this.prev().val(code);
                if (!code) {
                    am.msg('请扫码或输入优惠券码！');
                    return;
                }
                $this.addClass('am-disabled').prev().attr("disabled", true);
                am.api.dpQueryCoupon.exec({
                    dynamic_id: code
                }, function(ret) {
                    // ret.code=0;
                    // ret.content = {
                    //     id:1,
                    //     marketprice:100,
                    //     price:20,
                    //     dealtitle:"大众点评优惠券",
                    //     status:2,
                    //     mobile:"15488742458"
                    // };
                    if (ret && ret.code == 0) {
                        am.api.dpConsumeCoupon.exec({
                            dynamic_id: code,
                        }, function(ret) {
                            // ret.code=0;
                            // ret.content = {
                            //     id:1,
                            //     price:20,
                            //     marketprice:100,
                            //     dealtitle:"大众点评优惠券",
                            //     status:2,
                            //     mobile:"15488742458"
                            // };
                            if (ret && ret.code == 0 && ret.content && ret.content.status == 2) {
                                // $this.parent().addClass('payed');
                                // $this.prev().attr("disabled", true).data('data', ret.content);
                                am.page.pay.addDpCoupon(ret.content);
                                am.page.pay.getTicketsList('getdianpingFlow',function (data) {
                                    console.log('渲染点评列表数据');
                                    am.page.pay.renderTicketsList(data);
                                });
                                am.msg('优惠券已关联！');
                                am.page.pay.paytool.hide();
                            } else {
                                $this.removeClass('am-disabled').prev().attr("disabled", false);
                                am.msg(ret.message || '优惠券有误，请检查！');
                            }
                        });
                    } else {
                        am.msg(ret.message || '优惠券有误，请检查！');
                        $this.removeClass('am-disabled').prev().attr("disabled", false);
                    }
                });
            });
            this.dp.resetBak = this.dp.reset;
            this.dp.reset = function(){
                this.$.find('input[name=coupon]').val("").attr("disabled", false).next().removeClass('am-disabled').parent().removeClass('payed');
                this.resetBak();
            };

            this.kb = new Paytool({
                $: $("#kbPayDetail"),
                pay: function(opt, cb) {
                    // am.api.dpPay.exec(opt, cb);
                },
                query: function(opt, cb) {
                    // am.api.dpQuery.exec(opt, cb);
                },
                cancel: function(opt, cb) {
                    // am.api.dpRefund.exec(opt, cb);
                },
                refund: function(opt, cb) {
                    // am.api.dpRefund.exec(opt, cb);
                },
                qrpay: function(opt, cb) {
                    // am.api.dpQrpay.exec(opt, cb);
                },
                complete: function(opt) {
                    // if(opt){
                    //     this.$.find('input[name=coupon]').attr("disabled", true).next().addClass('am-disabled');
                    // }
                    // _this.payComplete(opt);
                    _this.payComplete();
                }
            });

            this.kb.$.find("input[name=coupon]").keyup(function (evt) {
                if(evt.keyCode === 13){
                    $(this).next().trigger('vclick');
                }
            });
            this.kb.$.find('input[name=coupon]').next().vclick(function() {
                var $this = $(this);
                var code = $this.prev().val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g,'');
                $this.prev().val(code);
                if (!code) {
                    am.msg('请扫码或输入优惠券码！');
                    return;
                }
                $this.addClass('am-disabled').prev().attr("disabled", true);
                am.api.kbQueryCoupon.exec({
                    parentShopId: amGloble.metadata.userInfo.parentShopId,
                    shopId: amGloble.metadata.userInfo.shopId,
                    ticketCode: code
                }, function(ret) {
                    if (ret && ret.code == 0) {
                        am.api.kbConsumeCoupon.exec({
                            parentShopId: amGloble.metadata.userInfo.parentShopId,
                            shopId: amGloble.metadata.userInfo.shopId,
                            ticketCode: code,
                        }, function(ret) {
                            if (ret && ret.code == 0 && ret.content && ret.content.status == 3) {
                                // $this.parent().addClass('payed');
                                // $this.prev().attr("disabled", false).data('data', ret.content);
                                $this.removeClass('am-disabled').prev().attr("disabled", false).val('');
                                am.page.pay.addKbCoupon(ret.content);
                                am.page.pay.getTicketsList('getkoubeiFlow',function (data) {
                                    console.log('渲染口碑列表数据',data);
                                    am.page.pay.renderTicketsList(data,'kb');
                                });
                                am.msg('优惠券已关联！');
                                am.page.pay.paytool.hide();
                            } else {
                                $this.removeClass('am-disabled').prev().attr("disabled", false);
                                am.msg(ret.message || '优惠券有误，请检查！');
                            }
                        });
                    } else {
                        am.msg(ret.message || '优惠券有误，请检查！');
                        $this.removeClass('am-disabled').prev().attr("disabled", false);
                    }
                });
            });
            this.kb.resetBak = this.kb.reset;
            this.kb.reset = function(){
                this.$.find('input[name=coupon]').val("").attr("disabled", false).next().removeClass('am-disabled').parent().removeClass('payed');
                this.resetBak();
            };


            this.mix = {
                init: function() {
                    this.$ = $("#mixPayDetail").vclick(function() {
                        _this.hide();
                    });
                    this.$tipsBox=this.$.find('.tipsBox').on('vclick',function(e){
                        e.stopPropagation();
                        var $this=$(this);
                        if(device2.desktop()){
                            // web
                        }else{
                            // 移动端
                            $this.removeClass('am-clickable-active');
                            if($this.find('.checkedItemsBox').is(':visible')){
                                $this.find('.checkedItemsBox').hide();
                                $('.transparentMask').hide();
                            }else{
                                $('.transparentMask').show();
                                $this.find('.checkedItemsBox').show();
                            }
                        }
                    });
                    $('.transparentMask').on('vclick',function(e){
                        if(!device2.desktop()){
                            $("#mixPayDetail .checkedItemsBox").hide();
                            $('.transparentMask').hide();
                        }
                    });
                    this.$inner = this.$.children(".onlinePay").vclick(function() {
                        return false;
                    });
                    this.$.find(".mixPayButton").vclick(function() {
                        var $this = $(this),
                            $input = $this.prev();
                        var type = $input.attr("name"),
                            price = $input.val()*1;
                        if ($this.text() == "支付") {
                            if (!price) {
                                am.msg('请输入支付金额！');
                                return;
                            } else {
                                var tt = _this.mix.checkTotalPrice();
                                if (tt > 0) {
                                    return;
                                }
                            }
                            _this.mix.payType = type;
                            _this[type].show(price,type);
                        } else {
                            _this.mix.payType = type;
                            _this[type].show(price,type);
                        }
                    });
                    this.$input = this.$.find("input").addClass('am-clickable');

                    this.$inner.on("vclick",'input',function() {
                        var $this = $(this);
                        if ($this.is(":disabled")) {
                            return;
                        }
                        am.keyboard.show({
                            "title": $this.parent().prev().text().replace("：", "支付"),
                            "submit": function(value) {
                                if (value >= 0) {
                                    value = Math.round(value*100)/100;
                                    $this.val(value);
                                    var res = _this.mix.checkTotalPrice();
                                    if (typeof(res) != "undefined" && res > 0) {
                                        if($this.attr('name') == 'bonus' && am.page.pay.opt.member && !am.page.pay.opt.member.allowPresentfeeDiscount && am.page.pay.opt.member.discount && am.page.pay.opt.option.expenseCategory!=4){
                                            res = res/(am.page.pay.opt.member.discount/10);
                                        }
                                        var v = Math.round((value - res) * 100) / 100;
                                        var onlineCreditVal = Math.round(((value - res) * (am.metadata.configs.onlineCreditPay || 1)) * 100) / 100;
                                        var offlineCreditVal = Math.round(((value - res) * (am.metadata.configs.offlineCreditPay || 1)) * 100) / 100;
                                        setTimeout(function() {
                                            $this.val(v);
                                            am.msg('输入总金额超出 ￥' + v + ',已自动调整为 ￥' + v + '！');
                                            // if($this.attr("name") == "onlineCreditPay"){
                                                // $this.next(".redTip").find(".sum").text(onlineCreditVal).siblings(".red").text(v+"元");
                                            // }
                                            // else if($this.attr("name") == "offlineCreditPay"){
                                                // $this.next(".redTip").find(".sum").text(offlineCreditVal).siblings(".red").text(v+"元");
                                            // }
                                            if($this.attr('name') == 'bonus' && am.page.pay.opt.member && !am.page.pay.opt.member.allowPresentfeeDiscount && am.page.pay.opt.member.discount && am.page.pay.opt.option.expenseCategory!=4){
                                                $this.next('.redTip').html('<p class="sum">赠送金不打折</p><p class="red">实际抵扣￥' + Math.round((v*(am.page.pay.opt.member.discount/10)) * 100) / 100 + '</p>');
                                            }else {
                                                $this.next('.redTip').html('');
                                            }
                                        }, 800);
                                    }
                                } else {
                                    am.msg('价格输入有误');
                                }
                            }
                        });
                    });

                    this.$price = this.$.find('.mixTitle .price');

                    this.scrollview = new $.am.ScrollView({
                        $wrap: this.$.find('.mixPayScroll'),
                        $inner: this.$.find('.mixPayScrollInner'),
                        direction: [false, true],
                        hasInput: false,
                    });
                },
                checkTotalPrice: function() {
                    var self = this;
                    var price = 0;
                    var opt = am.page.pay.opt;
                    if(opt.member){
                        var cardfee = this.$inner.find('input[name="card"]').val()*1 || 0;
                        var bonus = this.$inner.find('input[name="bonus"]').val()*1 || 0;
                        if(Math.round(cardfee*100) + Math.round(bonus*100) < Math.round((this.price*(opt.member.cardfeePayLimit/100)) * 100)){
                            am.msg('卡金支付额不得低于账单金额的'+ opt.member.cardfeePayLimit+'%('+(Math.round((this.price*(opt.member.cardfeePayLimit/100))*100)/100)+')！');
                            this.$inner.find('input[name="card"]').addClass('error');
                            if(bonus && !opt.member.allowPresentfeeDiscount && opt.member.discount && opt.option.expenseCategory!=4){
                                this.$inner.find('input[name="bonus"]').next('.redTip').html('<p class="sum">赠送金不打折</p><p class="red">实际抵扣￥' + Math.round((bonus*(opt.member.discount/10)) * 100) / 100 + '</p>')
                            }else {
                                this.$inner.find('input[name="bonus"]').next('.redTip').html('');
                            }
                            this.$inner.find('input[name="bonus"]').parents('.mixPayItem').nextAll('.mixPayItem').find('input').val('');
                            return 0;
                        }
                    }
                    for (var i = 0; i < this.$input.length; i++) {
                        var $thisInp = this.$input.eq(i);
                        // if ($thisInp.is(":disabled")) {
                        // disabled也能可是支付完成，不能这样判断，需要保证show的时候清除所有input残余值
                        //     continue;
                        // }
                        var val = $thisInp.val() * 1 || 0;
                        if($thisInp.attr('name') == 'bonus' && opt.member && !opt.member.allowPresentfeeDiscount && opt.member.discount && opt.option.expenseCategory!=4){
                            price += val*(opt.member.discount/10);
                        }else {
                            price += val;
                        }
                        if (val && $thisInp.attr('name') == 'card') {
                            var balance = 0;
                            var balanceDiscount = 0;
                            var giftDiscount = 0;
                            if( opt.member.combinedUseFlag==1){
                                balance = opt.member.balance + opt.member.gift;
                                balanceDiscount = am.page.pay.getCardFeeAndPresentFee(val,opt.member).cardFee;
                                giftDiscount = am.page.pay.getCardFeeAndPresentFee(val,opt.member).presentFee;
                            }else {
                                balance = opt.member.balance;
                                balanceDiscount = val;
                            }
                            if (Math.round(val*100) > Math.round(balance*100)) {
                                am.msg('卡金余额￥' + balance +',不足支付金额！');
                                $thisInp.addClass('error');
                                return 0;
                            }

                            //卡扣后低于设置的最低金额
                            if(Math.round(opt.member.balance*100)-Math.round(balanceDiscount*100) <  (opt.member.minfee || 0) * 100){
                                am.msg('卡内最低卡金金额不能低于'+ (opt.member.minfee || 0));
                                $thisInp.addClass('error');
                                return 0;
                            }
                            if(opt.member.combinedUseFlag==1){
                                if(Math.round(giftDiscount * 100)>Math.round((this.price*(opt.member.presentfeepayLimit/100)) * 100)){
                                    am.msg('赠送金支付额不得超过总金额的'+ opt.member.presentfeepayLimit +'%('+(Math.round((this.price*(opt.member.presentfeepayLimit/100))*100)/100)+')！');
                                    $thisInp.addClass('error');
                                    return 0;
                                }
                            }

                            //开卡当日消费超过设置的总额百分比
                            if(opt.member.newcardPayLimit<100 && am.page.pay.currentDayCharge && (Math.round((balanceDiscount) * 100)+Math.round((am.page.pay.currentDayCharge.CONSUMEFEE) * 100))>Math.round((am.page.pay.currentDayCharge.CHARGEFEE) * 100)*(opt.member.newcardPayLimit/100)){
                                am.msg('开卡当日消费不得超过总额的'+ opt.member.newcardPayLimit+'%,当日已消费'+am.page.pay.currentDayCharge.CONSUMEFEE);
                                $thisInp.addClass('error');
                                return 0;
                            }
                        }
                        if (val && $thisInp.attr('name') == 'bonus') {
                            var bonus = am.page.pay.opt.member.gift;
                            if (Math.round(val*100) > Math.round(bonus*100)) {
                                am.msg('赠送金余额￥' + bonus +',不足支付金额！');
                                $thisInp.next('.redTip').html('');
                                $thisInp.addClass('error');
                                return 0;
                            }
                            //赠送金不打折
                            if(!opt.member.allowPresentfeeDiscount &&opt.member.discount && opt.option.expenseCategory!=4){
                                // am.msg('赠送金支付￥'+val+',赠送金不打折,实际抵扣￥'+val*(opt.member.discount/10));
                                $thisInp.next('.redTip').html('<p class="sum">赠送金不打折</p><p class="red">实际抵扣￥' + Math.round((val*(opt.member.discount/10)) * 100) / 100 + '</p>');
                            }else {
                                $thisInp.next('.redTip').html('');
                            }

                            //赠送金支付额不得超过设置的总金额的百分比
                            var discountVal = val;
                            if(!opt.member.allowPresentfeeDiscount && opt.member.discount && opt.option.expenseCategory!=4){
                                discountVal = val*(opt.member.discount/10);
                            }
                            if(Math.round(discountVal * 100)>Math.round((this.price*(opt.member.presentfeepayLimit/100)) * 100)){
                                am.msg('赠送金支付额不得超过总金额的'+ opt.member.presentfeepayLimit +'%('+(Math.round((this.price*(opt.member.presentfeepayLimit/100))*100)/100)+')！');
                                $thisInp.addClass('error');
                                return 0;
                            }
                        }
                        if (val && $thisInp.attr('name') == 'onlineCreditPay') {
                            var onlineCredit = am.page.pay.opt.member.onlineCredit;
                            var onlineCreditVal = Math.round(val * (am.metadata.configs.onlineCreditPay || 1)*100)/100;
                            // $thisInp.next(".redTip").find(".sum").text(onlineCreditVal).siblings(".red").text(val+"元");
                            if (Math.round(onlineCreditVal*100) > Math.round(onlineCredit*100)) {
                                am.msg('线上积分余额' + onlineCredit +',不足支付金额！');
                                $thisInp.addClass('error');
                                // $thisInp.next(".redTip").find(".sum").text(0);
                                return 0;
                            }else{
                                $thisInp.removeClass("error");
                            }
                        }
                        if (val && $thisInp.attr('name') == 'offlineCreditPay') {
                            var offlineCredit = am.page.pay.opt.member.points;
                            var offlineCreditVal = Math.round( val * am.metadata.configs.offlineCreditPay * 100 ) / 100;
                            // $thisInp.next(".redTip").find(".sum").text(offlineCreditVal).siblings(".red").text(val+"元");
                            if (Math.round(offlineCreditVal*100) > Math.round(offlineCredit*100)) {
                                am.msg('线下积分余额' + offlineCredit +',不足支付金额！');
                                $thisInp.addClass('error');
                                // $thisInp.next(".redTip").find(".sum").text(0);
                                return 0;
                            }else{
                                $thisInp.removeClass("error");
                            }
                        }
                    }
                    price = Math.round(price*100)/100;
                    if (price > this.price) {
                        am.msg('共需支付￥' + this.price + '，输入总金额超出 ￥' + (Math.round((price - this.price) * 100) / 100) + '！');
                        return price - this.price;
                    } else if (price < this.price) {
                        am.msg('共需支付￥' + this.price + '，仍需支付 ￥' + (Math.round((this.price - price) * 100) / 100) + '！');
                        return price - this.price;
                    }
                },
                show: function(price, member) {
                    Paytool.prototype.show.call(this,price);
                    this.price = price;
                    var member = am.page.pay.opt.member;
                    var expenseCategory = am.page.pay.opt.option.expenseCategory;

                    var $redTipHtm = '',
                    $onlineCreditPay = this.$input.filter('input[name=onlineCreditPay]'),
                    $offlineCreditPay = this.$input.filter('input[name=offlineCreditPay]');
                    //if (member && (this.opt.option.expenseCategory==0 || this.opt.option.expenseCategory==1) && member.cardtype==1 && member.timeflag!=1) {
                    if (member && (expenseCategory==0 || expenseCategory==1  || expenseCategory==4) && (member.cardtype==1 || member.cardtype ==2) && member.timeflag!=1) {
                        //是会员，而且是正常能用卡金消费的情况
                        var cash = 0;
                        if(member.combinedUseFlag==1){
                            cash = member.balance + member.gift;
                            this.$input.filter('input[name=bonus]').parents('.mixPayItem').hide();
                        }else {
                            cash = member.balance;
                            this.$input.filter('input[name=bonus]').parents('.mixPayItem').show();
                        }
                        if (cash>0) {
                            this.$input.filter('input[name=card]').attr("disabled", false);
                        } else {
                            this.$input.filter('input[name=card]').attr("disabled", true);
                        }
                        if(member.balance<(member.minfee || 0)){
                            this.$input.filter('input[name=card]').attr("disabled", true);
                        }
                        // 判断所要结算的项目是否可以用赠金支付 如果包含赠金不可支付项目 则不能，如果全部可赠金支付 则支付，否则弹框高级结算
                        var allowedPresent=1,payOpt=am.page.pay.opt;// 允许赠金支付
                        var cardInfo={},restricteditemsArr=[];
                        //选择了会员卡并且要购买服务项目
                        if (payOpt.member && payOpt.member.cardTypeId && payOpt.option && payOpt.option.serviceItems && payOpt.option.serviceItems.length) {
                            var checkedServiceItems = payOpt.option.serviceItems;
                            var cardInfo = am.metadata.cardTypeMap[payOpt.member.cardTypeId];
                            if (cardInfo && cardInfo.restricteditems) {
                                var restricteditemsArr = cardInfo.restricteditems.split(','); // 指定的项目itemid 字符串
                                var restrictedtype = cardInfo.restrictedtype; // 0 指定不可用  1指定可用 
                                // 指定了服务项目
                                if (restrictedtype === 1) {
                                    for (var ss = 0, sslen = checkedServiceItems.length; ss < sslen; ss++) {
                                        var checkedItemId = checkedServiceItems[ss].itemId;
                                        if (restricteditemsArr && restricteditemsArr.indexOf(checkedItemId) == -1 && checkedServiceItems[ss].salePrice > 0) {
                                            // 需要支付金额的服务项目
                                            allowedPresent = 0;
                                        }
                                    }
                                } else if (restrictedtype === 0) {
                                    for (var ss = 0, sslen = checkedServiceItems.length; ss < sslen; ss++) {
                                        var checkedItemId = checkedServiceItems[ss].itemId;
                                        if (restricteditemsArr && restricteditemsArr.indexOf(checkedItemId) != -1 && checkedServiceItems[ss].salePrice > 0) {
                                            // 需要支付金额的服务项目
                                            allowedPresent = 0;
                                        }
                                    }
                                }
                                var $checkedItemsBox = this.$input.parents('.mixval').find('.checkedItemsBox'); // 指定项目tip
                                // var restricteditems = am.metadata.cardTypeMap[member.cardTypeId].restricteditems;
                                var restrictedtype = cardInfo && cardInfo.restrictedtype;
                                var itemsNameStr = '',
                                    itemsNameTitle = (restrictedtype === 1 ? '赠送金指定项目可用:' : '赠送金指定项目不可用:');
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
                                $checkedItemsBox.find('.checkedItemsTitle').text(itemsNameTitle);
                                $checkedItemsBox.find('.checkedItemsNames').text(itemsNameStr);
                                if (!itemsNameTitle || !itemsNameStr) {
                                    $('.tipsBox').hide();
                                } else {
                                    $('.tipsBox').show();
                                }
                            }else{
                                $('.tipsBox').hide();
                            }
                        }
                        
                        if(allowedPresent){
                            if (member.gift>0) {
                                this.$input.filter('input[name=bonus]').attr("disabled", false);
                            } else {
                                this.$input.filter('input[name=bonus]').attr("disabled", true);
                            }
                        }else{
                            this.$input.filter('input[name=bonus]').attr("disabled", true);
                             // 卡增加合并使用 包含不可增加支付项目 灰掉卡金
                            if(member && member.combinedUseFlag == 1 && member.gift > 0){
                                this.$input.filter('input[name=card]').attr("disabled", true);
                            }else{
                                this.$input.filter('input[name=card]').attr("disabled", false);
                            }
                           
                        }
                        // if (member.gift>0) {
                        //     this.$input.filter('input[name=bonus]').attr("disabled", false);
                        // } else {
                        //     this.$input.filter('input[name=bonus]').attr("disabled", true);
                        // }
                        //欠款
                        this.$input.filter('input[name=debtFee]').attr("disabled", false);
                        //会员积分
                        this.$input.filter('input[name=onlineCreditPay],input[name=offlineCreditPay]').attr("disabled", true).next(".redTip").html('');
                        if (expenseCategory == 0 || expenseCategory == 1) {
                            if (member.onlineCredit > 0) { //积分大于0
                                $redTipHtm = '<p class="sum">积分：' + member.onlineCredit + '</p><p class="red">可抵现￥' + Math.round((member.onlineCredit / am.metadata.configs.onlineCreditPay) * 100) / 100 + '</p>';
                                $onlineCreditPay.attr("disabled", false).attr("placeholder", "输入抵扣金额").next(".redTip").html($redTipHtm); 
                            } else {
                                $onlineCreditPay.attr("disabled", true).next(".redTip").html('');
                            }
                            if (member.points > 0) {
                                $redTipHtm = '<p class="sum">积分：' + member.points + '</p><p class="red">可抵现￥' + Math.round((member.points / am.metadata.configs.offlineCreditPay || 0) * 100) / 100 + '</p>';
                                $offlineCreditPay.attr("disabled", false).attr("placeholder", "输入抵扣金额").next(".redTip").html($redTipHtm);
                            } else {
                                $offlineCreditPay.attr("disabled", true).next(".redTip").html('');
                            }
                        }
                    } else {
                        //其它，卡金都不能用
                        this.$input.filter('input[name=card],input[name=bonus],input[name=onlineCreditPay],input[name=offlineCreditPay]').attr("disabled", true).next(".redTip").html("");
                        var openCardType;
                        if(expenseCategory==2){
                            //开卡
                            var openCardTypeId = am.page.pay.opt.option.card.cardtypeid;
                            openCardType = am.metadata.cardTypeList.filter(function(obj){
                                return obj.cardtypeid == openCardTypeId;
                            })[0];
                        }
                        if(
                            (expenseCategory==2 && openCardType && openCardType.cardtype==1) ||
                            expenseCategory==3 ||
                            expenseCategory==4 ||
                            (member &&(expenseCategory==0 || expenseCategory==1))
                        ){
                            //开卡(开储值卡)，充值，买套餐，即使不能用卡金，仍可以欠款
                            //只要是会员，项目卖品均可以欠款
                            //欠款
                            this.$input.filter('input[name=debtFee]').attr("disabled", false);
                        }else{
                            this.$input.filter('input[name=debtFee]').attr("disabled", true);
                        }
                    }
                    var coupon = am.page.pay.$list.find('dd.dpCoupon').data('data');
                    // am.page.pay.opt.option.expenseCategory == 0 && !coupon && !am.page.pay.opt.prodOption
                    if (am.page.pay.opt.option.expenseCategory == 0 && !am.page.pay.opt.prodOption) {
                        this.$input.filter('input[name=dp]').attr("disabled", false).next().removeClass('am-disabled');
                    } else {
                        this.$input.filter('input[name=dp]').attr("disabled", true).next().addClass('am-disabled');
                    }

                    var kbCoupon = am.page.pay.$list.find('dd.kbCoupon').data('data');
                    // am.page.pay.opt.option.expenseCategory == 0 && !kbCoupon && !am.page.pay.opt.prodOption
                    if (am.page.pay.opt.option.expenseCategory == 0 && !am.page.pay.opt.prodOption) {
                        this.$input.filter('input[name=kb]').attr("disabled", false).next().removeClass('am-disabled');
                    } else {
                        this.$input.filter('input[name=kb]').attr("disabled", true).next().addClass('am-disabled');
                    }

	                var prePay = am.page.pay.$list.find('dd.prePay').data('data');
	                if(prePay){
		                if(prePay.type == 1){
			                this.$input.filter('input[name=wechat]').attr("disabled", true).next().addClass('am-disabled');
		                }else if(prePay.type == 2){
			                this.$input.filter('input[name=alipay]').attr("disabled", true).next().addClass('am-disabled');
		                }else if(prePay.type == 3){
			                this.$input.filter('input[name=dp]').attr("disabled", true).next().addClass('am-disabled');
						}else if(prePay.type == 4){
							//银联支付
			                this.$input.filter('input[name=pos]').attr("disabled", true).next().addClass('am-disabled');
		                }
	                }

                    if(!this.otherfeeRendered){
                        var pc = am.metadata.payConfigs;
                        for(var i=0;i<pc.length;i++){
                            if(pc[i].status=="1" && pc[i].field.indexOf('OTHERFEE')!=-1 && (!am.page.pay.kbSetting || pc[i].field!=am.page.pay.kbSetting.field) && (!am.page.pay.jdSetting || pc[i].field!=am.page.pay.jdSetting.field)){
                                var h = '<div class="mixPayItem" paytype="'+pc[i].field+'"><div class="mixlabel">';
                                    h+= pc[i].fieldname+':';
                                    h+= '</div>';
                                    h+= '<div class="mixval">';
                                    h+= '    <input type="text" name="'+pc[i].field.toLocaleLowerCase()+'" readonly="readonly" class="am-clickable" />';
                                    h+= '</div>';
                                    h+= '</div>';
                                this.scrollview.$inner.append(h);
                            }
                        }
                        this.otherfeeRendered=1;

                        this.$input = this.$inner.find("input").addClass('am-clickable');
                    }
                    
                    if(am.page.pay.opt.debt || am.page.pay.opt.renewal){
                        this.scrollview.$inner.find('div[paytype=DEBTFEE]').hide();
                    }

                    if (am.isNull(am.metadata.configs.onlineCreditPay)) {
                        $onlineCreditPay.attr("disabled", true).attr("placeholder", "请先在互联网运营进行设置").next(".redTip").html('');
                    }
                    if (am.isNull(am.metadata.configs.offlineCreditPay)) {
                        $offlineCreditPay.attr("disabled", true).attr("placeholder", "请先在互联网运营进行设置").next(".redTip").html('');
                    }

                    var configIndex = expenseCategory;
	                if(am.page.pay.opt.prodOption){
		                configIndex = 5;
	                }
                    this.scrollview.$inner.find('.mixPayItem').each(function() {
                        var $this = $(this);
                        var key = $this.attr('paytype');

                        if(key && !am.payConfigMap[configIndex][key]){
                            $this.hide();
                        }else{
                            $this.show();
                            if((key!='CARDFEE' && key!='PRESENTFEE') || member){
                                if(member && member.combinedUseFlag==1 && key=='PRESENTFEE'){
                                    $this.hide();
                                }else {
                                    $this.show();
                                }
                            }else {
                                $this.hide();
                            }
                        }
                    });

                    if(am.page.pay.kbSetting){
                        this.scrollview.$inner.find('.mixPayItem').filter('[paytype="KOUBEI"]').show();
                    }else {
                        this.scrollview.$inner.find('.mixPayItem').filter('[paytype="KOUBEI"]').hide();
                    }

                    if(am.page.pay.jdSetting){
                        this.scrollview.$inner.find('.mixPayItem').filter('[paytype="JINGDONG"]').show();
                    }else {
                        this.scrollview.$inner.find('.mixPayItem').filter('[paytype="JINGDONG"]').hide();
                    }

                    this.scrollview.refresh();
                    this.scrollview.scrollTo('top');
                },
                hide: function() {
                    try{
                        am.page.pay.paytool[this.payType].hide();
                    }catch(e){
                        console.log(e);
                    }
                    Paytool.prototype.hide.call(this);
                },
                reset: function() {
                    //reset 还原所有input的状态
                    this.$input.each(function() {
                        $(this).val("").removeData('data').attr('disabled', false).removeClass('error').next(".mixPayButton").removeClass('am-disabled').text("支付");
                        $(this).parent().removeClass('payed');
                        if($(this).attr('name')=='bonus'){
                            $(this).next().html('');
                        }
                    });
                },
                payComplete: function(data) {
                    console.log(data)
                    var $input = this.$.find('input[name=' + this.payType + ']');
                    if (data && data.status == 3) {
                        $input.attr('disabled', true).data('data', data).next(".mixPayButton").text('退款');
                        $input.parent().addClass('payed');
                    } else {
                        $input.attr('disabled', false).removeData('data').next(".mixPayButton").text('支付');
                        $input.parent().removeClass('payed');
                    }
                }
            };
            this.mix.init();
        },
        reset: function() {
            this.wechat.reset();
            this.alipay.reset();
            this.pos.reset();
            this.dp.reset();
            this.mix.reset();
            this.luckyMoney.reset();
            this.mallOrder.reset();
            this.kb.reset();
            this.jd.reset();
        },
        show: function(type) {
            this.type = type;
            this[type].show(am.page.pay.needPay,type);
        },
        hide: function() {
            if (this.type) {
                var error = this[this.type].hide();
                if (!error) {
                    //this.type = null;
                }
            }
        },
        payComplete: function(data) {
            if (this.type == "mix") {
                this.mix.payComplete(data);
            } else {
                var page = am.page.pay;
                if (data && data.status == 3) {
                    var $paytype = page.$payTypes.filter('.pay_' + this.type);
                    if ($paytype.hasClass("selected")) {
                        $paytype.addClass('payed').data('data', data);
                    } else {
                        atMobile.nativeUIWidget.confirm({
                            caption: "支付方式异常",
                            description: "你在用户付款后选择了其它支付方式，是否要改回？",
                            okCaption: "去退款",
                            cancelCaption: "改回"
                        }, function() {
                            $paytype.trigger('vclick');
                        }, function() {
                            $paytype.addClass('selected').siblings().removeClass('selected');
                        });
                        return;
                    }
                } else {
                    page.$payTypes.filter('.pay_' + this.type).removeClass('payed').removeData('data');
                }
                //this.type = null;
            }
            //this.type = null;
        },
        formatAppShops:function(){
            var data=JSON.parse(am.metadata.configs.privateSendRed);
            var res={};
            if(data && data.enableCashierAndAdmin && data.cashierAndAdmin){
                var appShops=data.cashierAndAdmin.appShops;
                if(appShops){
                    for(var i=0,len=appShops.length;i<len;i++){
                        var item=appShops[i];
                        res[item.id]=item;
                    }
                }
            }
            console.log('红包模板配置的使用门店',res);
            this.appShopObj=res;
        },
        Paytool:Paytool
    };

    am.page.itemPay.paytool = {
        init: function() {
            var _this = this;

            this.pos = new Paytool({
                $: $("#itemPosPayDetail"),
                target:$('#page_itemPay .payItem.UNIONPAY'),
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
                    if(opt){
                        opt.type = 4;
                        am.page.itemPay.onlinePay('UNIONPAY',opt);
                    }
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
                },
            });

            this.luckyMoney = new PayToolRedeem({
                $: $("#itemLuckyMoneyDetail"),
                target: $('#page_itemPay .payItem.REDPAPER'),
                getData: function(opt, cb) {
                    opt.status="1,2,4";
                    am.api.getLuckyMoney.exec(opt, cb);
                },
                bindData: function($li, data) {
                    // console.log(111111111111, data);

                    if(data.expiretime<new Date().getTime()){
                        return;
                    }

                    $li.data('data', data);
                    if(data.rule && JSON.parse(data.rule).content && JSON.parse(JSON.parse(data.rule).content).title){
                        $li.find('.title').text(JSON.parse(JSON.parse(data.rule).content).title);
                    }else{
                        $li.find('.title').text(data.activityTitle);
                    }
                    if(data.money){
                        $li.find('.price').text(data.money).show();
                        $li.find('.discount').hide();
                    }else {
                        if(data.rule && JSON.parse(data.rule).useTemplate){
                            var rule = JSON.parse(JSON.parse(JSON.parse(data.rule).content).rule);
                            if(rule && rule.extraRule && rule.extraRule.type==2){
                                $li.find('.discount').text(rule.extraRule.discount+'折').show();
                                $li.find('.price').hide();
                            }
                        }
                        
                    }
                    var startTime = 0 ,endTime = 0;
                    if(data.rule && JSON.parse(data.rule).useTemplate){
                        var rule = JSON.parse(JSON.parse(JSON.parse(data.rule).content).rule);
                        if(rule && rule.validitymode==0){
                            endTime = data.expiretime;
                            startTime = data.createtime*1 + rule.days*24*60*60*1000;
                        }else if(rule && rule.validitymode==1) {

                            endTime = new Date(rule.endTime+' 23:59:59').getTime();
                            startTime = new Date(rule.startTime).getTime();
                        }
                    }else {
                        endTime = data.expiretime;
                        startTime = data.createtime;
                    }

                    if(new Date().getTime()>endTime){
                        data.status = -1;
                    }else if(new Date().getTime()<startTime){
                        data._status = -2;
                    }

                    if(data.atemplateid==7 && data.shops && data.shops.indexOf(amGloble.metadata.userInfo.shopId)==-1){
                        data.status = -3;
                    }

                    if (data.status == 1) {
                        if(data._status==-2){
                            $li.addClass('am-disabled').find('.status').text("未到使用时间");
                        }else {
                            $li.addClass('am-disabled').find('.status').text("无法使用");
                        }
                        $li.find('.price,.discount').addClass('unopen').text(data.shareRequire ? "分享后领取" : "未拆");
                    } else if (data.status == 2 && !data._status) {
                        var useable = [];
                        var allow = false;
                        if(data.rule && JSON.parse(data.rule).useTemplate){
                            var rule = JSON.parse(JSON.parse(JSON.parse(data.rule).content).rule);
                            if(rule.luckyMoneyRule.enableCashierPay){
                                allow = true;
                            }
                        }else {
                            if(data.allowcashierpay){
                                allow = true;
                            }
                        }
                        if (allow) {
                            $li.addClass('canUse').find(".status").text('可使用');
                            console.log(data)


                        } else {
                            $li.addClass('am-disabled').find(".status").text('不可店内消费');


                        }
                    } else if (data.status == 3 && !data._status) {
                        $li.addClass('am-disabled').find(".status").text("已使用");
                    } else if (data.status == 4 && !data._status) {
                        $li.find(".status").text("已使用，待关联"); //.addClass('am-disabled')
                    } else if (data.status == -1 && !data._status) {
                        $li.addClass('am-disabled').find(".status").text("已过期");
                    }else if (data._status == -2) {
                        $li.addClass('am-disabled').find(".status").text("未到使用时间");
                    }else if (data.status == -3 && !data._status) {
                        $li.addClass('am-disabled').find(".status").text("不可在本店使用");
                    }


                    //9.11红包判断
                    function serverList (list) {
                        var str = '';
                        $.each(list, function(i, item) {
                            // console.log(item.name);
                            return str += '<span class="" data-id="' + item.id +'">' + item.name + (i == (list.length-1) ? '' : '、' ) + '</span>'
                        })
                        return str;
                    };
                    
                    if(data.rule != undefined) {
                        var dataRule = JSON.parse(data.rule);
                        if(dataRule.useTemplate) {  //true 为新红包
                            var rule = JSON.parse(JSON.parse(dataRule.content).rule);
            
                            if(rule != undefined && rule.luckyMoneyRule) {
                                var allowCashierPay = rule.luckyMoneyRule.enableCashierPay == true ? rule.luckyMoneyRule.allowCashierPay : null,
                                allowMallPay = rule.luckyMoneyRule.enableMallPay == true? rule.luckyMoneyRule.allowMallPay : null;

                                if(rule.luckyMoneyRule.enableCashierPay) {
                                    //是否启用店内消费抵扣
                                    // $li.find('.explainDiv').append('<span class="tipsContent">店内抵扣 : 满' + allowCashierPay.consumptionAmount + '元可以抵扣现金，' + ( allowCashierPay.items && allowCashierPay.items.length > 0 ? ('指定可用项目' + serverList(allowCashierPay.items) ) : '') + '，' + rule.requiredShare + '人共享此红包</span>')
                                    // $li.find('.explainDiv').append(
                                    //     '<span class="tipsContent">店内抵扣' +
                                    //         (allowCashierPay.consumptionAmount ? ' : 满' + allowCashierPay.consumptionAmount + '元可以抵扣现金' : '' ) +
                                    //         (allowCashierPay.items && allowCashierPay.items.length > 0 ? (',指定可用项目' + serverList(allowCashierPay.items) ) : '') +
                                    //         (rule.requiredShare && rule.requiredShare > 0 ? rule.requiredShare + '人共享此红包' : '') +
                                    //     '</span>'
                                    // )

                                    var textObj={};
                                        textObj.subtract=allowCashierPay.consumptionAmountFlag&&allowCashierPay.consumptionAmount?'满'+allowCashierPay.consumptionAmount+'元可以抵扣现金，':'';
                                        textObj.memCard=allowCashierPay.memCard?'禁止同时使用会员卡(散客卡可以使用)，':'';
                                        textObj.otherRedPackage=allowCashierPay.otherRedPackage?'禁止同时使用其它红包，':'';
                                        //是否启用店内消费抵扣
                                        // $(domS).find('.tips').append('<span class="tipsContent">店内抵扣 : 满' + allowCashierPay.consumptionAmount + '元可以抵扣现金，' + (allowCashierPay.items && allowCashierPay.items.length > 0 ? ('指定可用项目' + serverList(allowCashierPay.items)) : '') + '，' + data.requiredShare + '人共享此红包</span>')
                                        if(textObj.subtract||textObj.memCard||textObj.otherRedPackage){
                                            $li.find('.explainDiv').append('<span class="tipsContent">店内抵扣 :' + (textObj.subtract||'')+(textObj.memCard||'')+(textObj.otherRedPackage||'')+ (allowCashierPay.items && allowCashierPay.items.length > 0 ? ('指定可用项目' + serverList(allowCashierPay.items)) : '') +'</span>');
                                        }else{
                                            $li.find('.explainDiv').append('<span class="tipsContent">店内消费可用</span>');
                                        }

                                }else {}
                                if(rule.luckyMoneyRule.enableMallPay) {
                                    //是否启用商城购物抵扣
                                    //$li.find('.explainDiv').append('<span class="tipsContent">商城抵扣 : 满' + allowMallPay.orderAmount + '元可以抵扣现金，' + ( allowMallPay.items && allowMallPay.items.length > 0 ? ('指定可用项目' +  serverList(allowMallPay.items) ) : '') + '，' + rule.requiredShare + '人共享此红包</span>')
                                    // $li.find('.explainDiv').append(
                                    //     '<span class="tipsContent">商城抵扣' +
                                    //         (allowMallPay.orderAmount ? ' : 满' + allowMallPay.orderAmount + '元可以抵扣现金' : '' ) +
                                    //         (allowMallPay.items && allowMallPay.items.length > 0 ? (',指定可用项目' + serverList(allowMallPay.items) ) : '') +
                                    //         (rule.requiredShare && rule.requiredShare > 0 ? rule.requiredShare + '人共享此红包' : '') +
                                    //     '</span>'
                                    // )

                                    var objText={};
                                        objText.orderAmount=allowMallPay.orderAmountFlag&&allowMallPay.orderAmount?'订单金额满'+allowMallPay.orderAmount+'元可以用':'';
                                        objText.onlineScore=allowMallPay.onlineScore?'禁止与线上积分同时使用，':'';
                                        objText.offlineScore=allowMallPay.offlineScore?'禁止与线下积分同时使用，':'';
                                        objText.memCard=allowMallPay.memCard?'禁止同时使用会员卡(散客卡可以使用)，':'';
                                        if(objText.orderAmount||objText.onlineScore||objText.offlineScore||objText.memCard){
                                            $li.find('.explainDiv').append('<span class="tipsContent">商城抵扣 : ' + (objText.orderAmount||'')+(objText.onlineScore||'')+(objText.offlineScore||'') +(objText.memCard||'') + (allowMallPay.items && allowMallPay.items.length > 0 ? ('指定可用项目' + serverList(allowMallPay.items)) : '') +'</span>')
                                        }else{
                                            $li.find('.explainDiv').append('<span class="tipsContent">商城可用</span>');
                                        }

                                }else {}

                                $li.find(".status").addClass('am-clickable').append('<span class="explainBtn">,使用规则<i class="iconfont icon-icon-arrow-down"></i></span>');
                            }else {}

                            //清除红包规则描述最后一个逗号
                            $('#luckyMoneyDetail span.tipsContent').each(function(){
                                var textString=$(this).text().trim(),
                                $this=$(this),
                                len=$this.children('span').length;
                                
                                if(textString.lastIndexOf('，')!=-1&&len==0){
                                    $this.text(textString.substring(0,textString.length-1));
                                }
                            });

                        }else {}
                          
                    }else {}


                    $li.find('.listLeft .line').show();
                    $li.find('.explainDiv').hide();
                    if(data._status==-2){
                        $li.find('.time').text('使用时间：' + new Date(startTime*1).format('yyyy.mm.dd')+'-'+new Date(endTime*1).format('yyyy.mm.dd'));
                    }else {
                        $li.find('.time').text('到期时间：' + new Date(data.expiretime*1).format('yyyy.mm.dd'));
                    }
                    
                    return $li;
                },
                complete: function(data) {
                    if(data && data.length){
                        am.page.itemPay.checkRedPaper(data);
                    }
                },
                getSingleUse: function(){
                    var currentPage = $.am.getActivePage();
                    if(currentPage.id=='page_itemPay'){
                        am.page.itemPay.checkSingleUse();
                    }
                },
                changeRedPackageStatus: function(data,lis){
                    am.page.itemPay.changeRedPackageStatus(data,lis);
                },
            });

            this.mallOrder = new PayToolRedeem({
                $: $("#itemMallOrderDetail"),
                target: $('#page_itemPay .payItem.MALLORDER'),
                getData: function(opt, cb) {
                    opt.status="2,4";
                    am.api.getMallOrder.exec(opt, cb);
                },
                bindData: function($li, data) {
                    $li.data('data', data);
                    $li.find('.title').text(data.mallItemName);
                    $li.find('.price').text(data.realmoney*1 || 0);
                    // $li.find('.price').text(((data.cashPay*1||0)+ (data.luckyMoneyPay*1||0)));
                    $li.find('.code').text(data.code);
                    if (data.status == 1) {
                        //"未支付";
                    } else if (data.status == 2 || data.status == 4) {
                        var shops = data.mallItem.shopIds;
                        if (shops) {
                            shops = shops.split(",");
                        }
                        var useable = data.status == 2 ? "可使用":"待再次核销";
                        if (shops && shops.length) {
                            if ($.inArray(am.metadata.userInfo.shopId+"", shops) == -1) {
                                $li.addClass('am-disabled').find('.status').text("本门店不可使用");
                            } else {
	                            if(data.payType == 3){
		                            // $li.addClass("disabled").find('.status').text("会员卡支付订单请单独核销");
	                            }else{
		                            $li.find('.status').text(useable);
                                }
                            }
                        } else {
                            $li.find('.status').text(useable);
                        }
                    } else if (data.status == 3) {
                        //"已兑换";
                    } else {
	                    //"订单异常";
                    }

                    //美一刻购买的套餐订单不能在此处使用
                    if(data.mallItem&&data.mallItem.packageInfo){
                        $li.addClass('am-disabled').find('.status').text("商城购买的套餐订单需要顾客在美一客/小程序中进行核销");
                    }


                    //expenseCategory跟 category一一对应，不确认后面的，还是不写成 data.mallItem.category-1 == this.expenseCategory
                    /*if(
                        (this.expenseCategory == 0 && data.mallItem.category!=1) ||
                        (this.expenseCategory == 1 && data.mallItem.category!=2)
                    ){
						$li.addClass("am-disabled").find('.status').text("订单类别不符");
					}*/

                    $li.find('.time').text(new Date(data.createTime*1).format('yyyy.mm.dd')+'购买');
                    return $li;
                },
                complete: function(data) {
                    if(data){
                        console.log(data);
                        if(am.page.itemPay.mallorderData && am.page.itemPay.mallorderData.id!=data.id){
                            atMobile.nativeUIWidget.confirm({
                                caption: '只能关联一个商城订单',
                                description: '更换商城订单将清除之前商城订单的价格配置，是否继续？',
                                okCaption: '继续',
                                cancelCaption: '取消'
                            }, function(){
                                am.page.itemPay.setPayItem('MALLORDER',data);
                            }, function(){
    
                            });
                        }else {
                            am.page.itemPay.setPayItem('MALLORDER',data);
                        }
                    }
                }
            });

            this.prePay = new PayToolRedeem({
                $: $("#itemPrePayDetail"),
                target: $('#page_itemPay .prePayTarget'),
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
                    var currentType = am.page.itemPay.currentType;
                    if(currentType && !(currentType=='WEIXIN' && data.type==1) && !(currentType=='PAY' && data.type==2) && !(currentType=='UNIONPAY' && data.type==4) && !(currentType=='JINGDONG' && data.type==5)){
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
                    sum = sum.toFixed(2);
                    $li.find('.price').text((data.price-sum).toFixed(2));
                    if(sum == data.price){
                        $li.addClass("am-disabled").addClass('hide').find('.status').text("已关联");
                    }else{
                        $li.removeClass("am-disabled").removeClass('hide').find('.status').text("未关联");
                    }

                    $li.find('.time').text(data.createtime?(new Date(data.createtime*1).format('yyyy.mm.dd')+'-付款'):'');

                    var str = '';
                    var remarkBg = false;
                    if(data.billno){
                        str += '<span>'+data.billno+'</span>' + (data.billno.split('、').length>1?'合并收款；':'收款；');
                        remarkBg = true;
                    }
                    if(data.ordercomment){
                        str += data.ordercomment;
                    }
                    if(str){
                        $li.find('.remark').html(str);
                    }else {
                        $li.find('.remark').remove();
                    }
                    if(remarkBg){
                        var displayId = am.page.itemPay.opt.option.displayId;
                        var _bill = data.billno.split('、');
                        var billArr = [];
                        for(var i=0;i<_bill.length;i++){
                            billArr.push(_bill[i].split('-')[0]);
                        }
                        if(billArr.indexOf(displayId)!=-1){
                            $li.addClass('remark_bg');
                        }
                    }
                    return $li;
                },
                complete: function(data) {//回渲染的样式
                    // var payName = ["微信","支付宝","大众点评","银联支付"];//支付类型
                    // var payType=["美管加代收","自收","收钱吧","京东聚合支付"];//收款类型
                    // if(data){
                    //     var sum = 0;
                    //     if(!am.isNull(data.details)){
                    //         $.each(data.details,function(k,v){
                    //             sum += v.amount*1;
                    //         });
                    //     }
                    //     data.price = data.price - sum;
                    //     var needPay = (am.page.pay.opt.option.billingInfo.total || 0) + (am.page.pay.opt.option.cost || 0);
                    //     if(data.price > needPay){
                    //         data.price = needPay-0;
                    //         am.msg("选择的金额大于消费金额");
                    //     }
                    //     var html = '<span class="name">' + payName[data.type*1-1] +' '+payType[data.payType*1]+ '</span>';
                    //     html+='<span class="price">￥' + (data.price).toFixed(2) + '</span>';
                    //     html+='<span class="iconfont icon-juxingkaobei am-clickable"></span>';
                    //     am.page.pay.$list.find('dd.prePay').data('data', data).find('.val').html(html).removeClass('add').addClass('edit');
                    //     am.page.pay.$list.find('dd.prePay .icon-juxingkaobei').data('data', data)
	                //     am.page.pay.paytool.reset();
	                //     am.page.pay.paytool.hide();
                    //     am.page.pay.setNeedPay();
                    // }
                    if(data){
                        if(am.page.itemPay.prepayData && am.page.itemPay.prepayData.id!=data.id){
                            atMobile.nativeUIWidget.confirm({
                                caption: '只能关联一个收款',
                                description: '更换收款将清除之前收款的价格配置，是否继续？',
                                okCaption: '继续',
                                cancelCaption: '取消'
                            }, function(){
                                am.page.itemPay.setPayItem(am.page.itemPay.currentType,data);
                            }, function(){
    
                            });
                        }else {
                            var currentType = am.page.itemPay.currentType;
                            if((data.type==1 && currentType=='WEIXIN') || (data.type==2 && currentType=='PAY') || (data.type==4 && currentType=='UNIONPAY') || (data.type==5 && currentType=='JINGDONG')){
                                am.page.itemPay.setPayItem(currentType,data);
                            }else{
                                am.msg('请选择对应的收款流水');
                            } 
                        }
                    }
                }
            });

            this.wechat = new Paytool({
                $: $("#itemWechatPayDetail"),
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
                    if(opt){
                        opt.type = 1;
                        am.page.itemPay.onlinePay('WEIXIN',opt);
                    }
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
            this.alipay = new Paytool({
                $: $("#itemAlipayPayDetail"),
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
                    if(opt){
                        opt.type = 2;
                        am.page.itemPay.onlinePay('PAY',opt);
                    }
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
            this.jd = new Paytool({
                $: $("#itemJdPayDetail"),
                pay: function(opt, cb) {
                    am.api.jdPay.exec(opt, cb);
                },
                query: function(opt, cb) {
                    am.api.jdQuery.exec(opt, cb);
                },
                cancel: function(opt, cb) {
                    am.api.jdCancel.exec(opt, cb);
                },
                refund: function(opt, cb) {
                    am.api.jdRefund.exec(opt, cb);
                },
                qrpay: function(opt, cb) {
                    am.api.jdQrpay.exec(opt, cb);
                },
                complete: function(opt) {
                    if(opt){
                        opt.type = 5;
                        am.page.itemPay.onlinePay('JINGDONG',opt);
                    }
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
                }
            });
            this.dp = new Paytool({
                $: $("#itemDpPayDetail"),
                pay: function(opt, cb) {
                    am.api.dpPay.exec(opt, cb);
                },
                query: function(opt, cb) {
                    am.api.dpQuery.exec(opt, cb);
                },
                cancel: function(opt, cb) {
                    am.api.dpRefund.exec(opt, cb);
                },
                refund: function(opt, cb) {
                    am.api.dpRefund.exec(opt, cb);
                },
                qrpay: function(opt, cb) {
                    am.api.dpQrpay.exec(opt, cb);
                },
                complete: function(opt) {
                    if(opt){
                        console.log(opt);
                        if(am.page.itemPay.dianpinData && am.page.itemPay.dianpinData.id!=opt.id){
                            atMobile.nativeUIWidget.confirm({
                                caption: '只能使用一个点评券',
                                description: '更换点评券将清除之前点评券的价格配置，是否继续？',
                                okCaption: '继续',
                                cancelCaption: '取消'
                            }, function(){
                                am.page.itemPay.setPayItem('DIANPIN',opt);
                            }, function(){
    
                            });
                        }else {
                            am.page.itemPay.setPayItem('DIANPIN',opt);
                        }
                    }
                }
            });
            this.dp.$.find("input[name=coupon]").keyup(function (evt) {
                if(evt.keyCode === 13){
                    $(this).next().trigger('vclick');
                }
            });
            this.dp.$.find('input[name=coupon]').next().vclick(function() {
                var $this = $(this);
                var code = $this.prev().val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g,'');
                $this.prev().val(code);
                if (!code) {
                    am.msg('请扫码或输入优惠券码！');
                    return;
                }
                $this.addClass('am-disabled').prev().attr("disabled", true);
                am.api.dpQueryCoupon.exec({
                    dynamic_id: code
                }, function(ret) {
                    // ret.code=0;
                    // ret.content = {
                    //     id:1,
                    //     marketprice:100,
                    //     price:20,
                    //     dealtitle:"大众点评优惠券",
                    //     status:2,
                    //     mobile:"15488742458"
                    // };
                    if (ret && ret.code == 0) {
                        am.api.dpConsumeCoupon.exec({
                            dynamic_id: code,
                        }, function(ret) {
                            // ret.code=0;
                            // ret.content = {
                            //     id:1,
                            //     price:20,
                            //     marketprice:100,
                            //     dealtitle:"大众点评优惠券",
                            //     status:2,
                            //     mobile:"15488742458"
                            // };
                            if (ret && ret.code == 0 && ret.content && ret.content.status == 2) {
                                am.page.itemPay.setPayItem('DIANPIN',ret.content);
                                am.page.itemPay.getTicketsList('getkoubeiFlow',function (data) {
                                    console.log('渲染口碑列表数据',data);
                                    am.page.itemPay.renderTicketsList(data,'kb');
                                });
                                am.page.itemPay.paytool.hide();
                            } else {
                                am.msg(ret.message || '优惠券有误，请检查！');
                            }
                        });
                    } else {
                        am.msg(ret.message || '优惠券有误，请检查！');
                        $this.removeClass('am-disabled').prev().attr("disabled", false);
                    }
                });
            });
            this.dp.resetBak = this.dp.reset;
            this.dp.reset = function(){
                this.$.find('input[name=coupon]').val("").attr("disabled", false).next().removeClass('am-disabled').parent().removeClass('payed');
                this.resetBak();
            };

            this.kb = new Paytool({
                $: $("#itemKbPayDetail"),
                pay: function(opt, cb) {
                    // am.api.dpPay.exec(opt, cb);
                },
                query: function(opt, cb) {
                    // am.api.dpQuery.exec(opt, cb);
                },
                cancel: function(opt, cb) {
                    // am.api.dpRefund.exec(opt, cb);
                },
                refund: function(opt, cb) {
                    // am.api.dpRefund.exec(opt, cb);
                },
                qrpay: function(opt, cb) {
                    // am.api.dpQrpay.exec(opt, cb);
                },
                complete: function(opt) {
                    if(opt){
                        console.log(opt);
                        if(am.page.itemPay.koubeiData && am.page.itemPay.koubeiData.id!=opt.id){
                            atMobile.nativeUIWidget.confirm({
                                caption: '只能使用一个口碑券',
                                description: '更换口碑券将清除之前口碑券的价格配置，是否继续？',
                                okCaption: '继续',
                                cancelCaption: '取消'
                            }, function(){
                                am.page.itemPay.setPayItem('KOUBEI',opt);
                            }, function(){
    
                            });
                        }else {
                            am.page.itemPay.setPayItem('KOUBEI',opt);
                        }
                    }
                }
            });

            this.kb.$.find("input[name=coupon]").keyup(function (evt) {
                if(evt.keyCode === 13){
                    $(this).next().trigger('vclick');
                }
            });
            this.kb.$.find('input[name=coupon]').next().vclick(function() {
                var $this = $(this);
                var code = $this.prev().val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g,'');
                $this.prev().val(code);
                if (!code) {
                    am.msg('请扫码或输入优惠券码！');
                    return;
                }
                $this.addClass('am-disabled').prev().attr("disabled", true);
                am.api.kbQueryCoupon.exec({
                    parentShopId: amGloble.metadata.userInfo.parentShopId,
                    shopId: amGloble.metadata.userInfo.shopId,
                    ticketCode: code
                }, function(ret) {
                    if (ret && ret.code == 0) {
                        am.api.kbConsumeCoupon.exec({
                            parentShopId: amGloble.metadata.userInfo.parentShopId,
                            shopId: amGloble.metadata.userInfo.shopId,
                            ticketCode: code,
                        }, function(ret) {
                            if (ret && ret.code == 0 && ret.content && ret.content.status == 3) {
                                am.page.itemPay.setPayItem('KOUBEI',ret.content);
                                am.page.itemPay.getTicketsList('getdianpingFlow',function (data) {
                                    console.log('渲染点评列表数据');
                                    am.page.itemPay.renderTicketsList(data);
                                });
                                am.page.itemPay.paytool.hide();
                            } else {
                                am.msg(ret.message || '优惠券有误，请检查！');
                            }
                        });
                    } else {
                        am.msg(ret.message || '优惠券有误，请检查！');
                        $this.removeClass('am-disabled').prev().attr("disabled", false);
                    }
                });
            });
            this.kb.resetBak = this.kb.reset;
            this.kb.reset = function(){
                this.$.find('input[name=coupon]').val("").attr("disabled", false).next().removeClass('am-disabled').parent().removeClass('payed');
                this.resetBak();
            };
        },
        reset: function() {
            this.wechat.reset();
            this.alipay.reset();
            this.dp.reset();
            this.luckyMoney.reset();
            this.mallOrder.reset();
            this.kb.reset();
            this.jd.reset();
            this.pos.reset();
        },
        show: function(type) {
            this.type = type;
            this[type].show(am.page.itemPay.unPayedMondy || 0,type);
        },
        hide: function() {
            if (this.type) {
                var error = this[this.type].hide();
                if (!error) {
                    //this.type = null;
                }
            }
        },
        payComplete: function(data) {
        },
        Paytool:Paytool
    };
})();

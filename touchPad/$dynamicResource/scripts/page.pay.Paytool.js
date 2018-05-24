(function() {
    Paytool = function(opt) {

        var _this = this;
        this.onPay = opt.pay;
        this.onQuery = opt.query;
        this.onCancel = opt.cancel;
        this.onRefund = opt.refund;
        this.onQrpay = opt.qrpay;
        this.onComplete = opt.complete;
        this.$ = opt.$.vclick(function() {
            _this.hide();
        });
        this.$inner = this.$.children(".onlinePay").vclick(function() {
            return false;
        });

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
            _this.render(1);
            _this.onPay({
                "price": _this.price,
                "dynamic_id": dynamic,
                "subject": (am.metadata.userInfo.shopName || "") + " " + (am.metadata.userInfo.osName || ""),
            }, function(ret) {
                _this.payCallback(ret);
            });
        });
        this.$status = this.$inner.find(".statusBox");
        this.$loading = this.$status.find(".loading");
        this.$success = this.$status.find(".success");
        this.$complete = this.$status.find(".complete").vclick(function() {
            var $this = $(this).addClass('am-disabled');
            _this.onQuery({
                "out_trade_no": _this.tradeData.outtradeno
            }, function(ret) {
                $this.removeClass('am-disabled');
                _this.payCallback(ret);
            });
        });
        this.$cancel = this.$status.find(".cancel").vclick(function() {
            var $this = $(this).addClass('am-disabled');
            _this.onCancel({
                "out_trade_no": _this.tradeData.outtradeno
            }, function(ret) {
                $this.removeClass('am-disabled');
                _this.$input.val("");
                _this.payCallback(ret);
            });
        });
        this.$refund = this.$status.find(".refund").vclick(function() {
            var $this = $(this).addClass('am-disabled');
            _this.onRefund({
                "out_trade_no": _this.tradeData.outtradeno
            }, function(ret) {
                $this.removeClass('am-disabled');
                _this.$input.val("");
                _this.payCallback(ret);
            });
        });

        this.$qrcode = this.$inner.find(".qrcodeimg");
        this.$qrReload = this.$inner.find(".qrReload").vclick(function() {
            _this.getQrPay();
        });
        this.$qrLoading = this.$inner.find(".qrLoading");
        this.$qrSuccess = this.$inner.find('.qrSuccess');
        this.$qrSuccess.find('.refund').vclick(function() {
            var $this = $(this).addClass('am-disabled');
            _this.onRefund({
                "out_trade_no": _this.qrTradeData.outtradeno
            }, function(ret) {
                $this.removeClass('am-disabled');
                _this.qrRender(ret);
            });
        });

        this.$price = this.$.find('strong.price');

        this.$.find('.barcodeScan').vclick(function(){
            _this.scan($(this));
        });
    };
    Paytool.prototype = {
        scan:function($this){
            var _this=this;
            $this.addClass("am-disabled");
            cordova.plugins.barcodeScanner.scan(function(result) {
                $this.removeClass("am-disabled");
                $.am.debug.log("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
                if(result && result.text){
                    var $siblings = $this.siblings();
                    $siblings.filter('input').val(result.text).next().trigger('vclick');
                }
            }, function(error) {
                $this.removeClass("am-disabled");
                //alert("Scanning failed: " + error);
                amGloble.msg(error);
            });
        },
        show: function(price,type) {
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

            if (!this.qrTradeData || this.qrTradeData.status != 3) {
                this.getQrPay && this.getQrPay();
            }

        },
        payCallback: function(ret) {
            var _this = this;
            if (ret.code == 0) {
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
                    _this.render(0);
                    am.msg("已退款");
                    configs.text = "已退款！";
                }
            } else if (ret.code == -1) {
                am.msg("网络连接异常，请检查网络连接状态！！");
                _this.render(0);
            } else {
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
                            _this.qrLoopTimer = setTimeout(function() {
                                _this.startQrLoopQuery();
                            }, 4 * 1000);
                        },
                        "error": function() {
                            $(this).show();
                            _this.$qrcode.empty();
                            _this.$qrReload.show();
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
            _this.onQuery({
                "out_trade_no": _this.qrTradeData.outtradeno
            }, function(ret) {
                _this.qrRender(ret);
            }, 1);
        },
        qrRender: function(ret) {
            var _this = this;
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
                    this.$qrSuccess.show();
                    this.success(this.$qrSuccess.find('.text'));
                } else if (ret.content.status == 4) {
                    //已撤销
                    _this.getQrPay();
                    am.msg("支付已取消！");
                } else if (ret.content.status == 5) {
                    //已退款
                    _this.getQrPay();
                    am.msg("已退款！");
                }
            } else if (ret.code == -1) {
                am.msg("网络连接异常，请检查网络连接状态！");
                _this.qrLoopTimer = setTimeout(function() {
                    _this.startQrLoopQuery();
                }, 4 * 1000);
            } else {
                //am.msg(ret.message || "操作失败，请刷新条码后重试!");
                _this.qrLoopTimer = setTimeout(function() {
                    _this.startQrLoopQuery();
                }, 4 * 1000);
            }
        },
        success: function($text) {
            $text.text('支付成功,(3)秒后返回');
            var i = 3,
                _this = this;
            this.settingMediaScreenQr(this.type,this.price);    
            this.successTimer && clearInterval(this.successTimer);
            this.successTimer = setInterval(function() {
                i--;
                if (i == 0) {
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
        render: function(status) {
            if (status == 0) {
                //初始状态
                this.$input.attr('disabled', false).val("");
                this.$button.removeClass("am-disabled");
                this.$status.hide();
            } else {
                //状态窗口弹出
                this.$input.attr('disabled', true);
                this.$button.addClass("am-disabled");
                this.$status.show();
                if (status == 3) {
                    //支付完成
                    this.$loading.hide();
                    this.$complete.hide();
                    this.$cancel.hide();
                    this.$refund.show();
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
                        this.$complete.show();
                        this.$cancel.show();
                    }
                }
            }
        },
        reset: function() {
            this.render(0);
            this.tradeData = null;
            this.qrTradeData = null;
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

    var PayToolRedeem = function(opt) {
        this.getData = opt.getData;
        this.bindData = opt.bindData;
        this.onComplete = opt.complete;
        var _this = this;
        this.$ = opt.$.vclick(function() {
            _this.hide();
        });
        this.$inner = this.$.children(".onlinePay").vclick(function() {
            return false;
        });
        this.$list = this.$.find(".list ul").on('vclick', 'li', function() {
            if($(this).hasClass('disabled')){
                //目前只有会员卡结算的订单会加上disabled
                //其它不允许使用的情况都是am-disabled
                am.confirm('会员卡支付订单','顾客使用会员卡卡金支付此订单，无法在收银台核销，请在：其它>商城订单验券 中核销此订单','知道了','去核销',function () {
                    
                },function () {
	                $.am.changePage(am.page.about, "");
                });
            }else{
	            $(this).addClass('selected').siblings().removeClass('selected');
	            _this.hide($(this).data('data'));
            }
        });
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
        show: function(member,expenseCategory) {
            if(!this.member || (member.id != this.member.id)){
                if(typeof member!='undefined'){
                    this.member = member;
                }
                this.ajax();
            }else if(this.isEmpty){
                return;
            }
            Paytool.prototype.show.call(this);
            this.expenseCategory=expenseCategory;
        },
        ajax: function() {
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
                            if(!item.displayId){//过滤存在displayId
                                container.push(item);
                            }
                        }
                        ret.content=container;
                    }
                    if (ret.content && ret.content.length) {
                        _this.render(ret.content);
                    } else {
                        am.msg('没有记录！');
                        _this.hide();
                        _this.isEmpty=1;
                    }
                } else if (ret && ret.code == -1) {
                    _this.$error.show();
                } else {
                    _this.hide();
                    am.msg('数据读取异常');
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
            this.scrollview.$wrap.css({
                "height": (this.$.height() - this.$.find('.paytitle').outerHeight() - 1) + "px"
            });
            var _this=this;
            //setTimeout(function(){
                _this.scrollview.refresh();
            //},300);
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
                getData: function(opt, cb) {
                    opt.status="1,2,4";
                    am.api.getLuckyMoney.exec(opt, cb);
                },
                bindData: function($li, data) {
                    $li.data('data', data);
                    $li.find('.title').text(data.activityTitle);
                    $li.find('.price').text(data.money);
                    if(new Date().getTime()>data.expiretime){
                        data.status=-1;
                    }
                    if (data.status == 1) {
                        $li.addClass('am-disabled').find('.status').text("无法使用");
                        $li.find('.price').addClass('unopen').text(data.shareRequire ? "分享后领取" : "未拆");
                    } else if (data.status == 2) {
                        var useable = [];
                        if (data.allowcashierpay) {
                            $li.find(".status").text('可使用');
                        } else {
                            $li.addClass('am-disabled').find(".status").text('不可店内消费');
                        }
                    } else if (data.status == 3) {
                        $li.addClass('am-disabled').find(".status").text("已使用");
                    } else if (data.status == 4) {
                        $li.find(".status").text("已使用，待关联"); //.addClass('am-disabled')
                    } else if (data.status == -1) {
                        $li.addClass('am-disabled').find(".status").text("已过期");
                    }
                    $li.find('.time').text('到期时间：' + new Date(data.expiretime*1).format('yyyy.mm.dd'));
                    return $li;
                },
                complete: function(data) {
                    if(data){
                        var html = '<span class="name">' + data.activityTitle + '</span><span class="price">￥' + data.money + '</span>';
                        am.page.pay.$list.find('dd.luckymoney').data('data', data).find('.val').html(html).removeClass('add').addClass('edit');
                        am.page.pay.setNeedPay();
                    }
                }
            });

            this.mallOrder = new PayToolRedeem({
                $: $("#mallOrderDetail"),
                getData: function(opt, cb) {
                    opt.status="2,4";
                    am.api.getMallOrder.exec(opt, cb);
                },
                bindData: function($li, data) {
                    $li.data('data', data);
                    $li.find('.title').text(data.mallItemName);
                    $li.find('.price').text(((data.cashPay*1||0)+ (data.luckyMoneyPay*1||0)));
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

		                            $li.addClass("disabled").find('.status').text("会员卡支付订单请单独核销");
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
                        var html = '<span class="name">' + data.mallItemName + '</span>';
                        html+='<span class="price">￥' + ((data.cashPay*1||0)+ (data.luckyMoneyPay*1||0)) + '</span>';
                        am.page.pay.$list.find('dd.mallOrder').data('data', data).find('.val').html(html).removeClass('add').addClass('edit');
                        am.page.pay.setNeedPay();
                    }
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
                getData: function(opt, cb) {
                    opt.status=[3];//接口参数
                    delete opt.memId;
                    var start = new Date();
                    start.setDate(start.getDate()-2);
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
                    var payName = ["微信","支付宝","大众点评"];//支付类型
                    var payType=["美管加代收","自收","收钱吧"];//收款类型
                    $li.data('data', data);
                    console.log(data)
                    $li.find('.title').text(payName[data.type*1-1]);
                    $li.find('.price').text(data.price);
                    $li.find('.code').text(data.tradeno);
                    $li.find('.from').text(payType[data.payType*1]);
                    if(data.displayId){
                        $li.addClass("am-disabled")/*.addClass('hide')*/.find('.status').text("已关联");
                    }else{
                        $li.removeClass("am-disabled")/*.removeClass('hide')*/.find('.status').text("未关联");
                    }

                    $li.find('.time').text(data.createtime?(new Date(data.createtime*1).format('yyyy.mm.dd')+'-付款'):'');
                    return $li;
                },
                complete: function(data) {//回渲染的样式
                    var payName = ["微信","支付宝","大众点评"];//支付类型
                    var payType=["美管加代收","自收","收钱吧"];//收款类型
                    if(data){
                        var html = '<span class="name">' + payName[data.type*1-1] +' '+payType[data.payType*1]+ '</span>';
                        html+='<span class="price">￥' + (data.price) + '</span>';
                        am.page.pay.$list.find('dd.prePay').data('data', data).find('.val').html(html).removeClass('add').addClass('edit');
	                    am.page.pay.paytool.reset();
	                    am.page.pay.paytool.hide();
                        am.page.pay.setNeedPay();
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
                                $this.parent().addClass('payed');
                                $this.prev().attr("disabled", true).data('data', ret.content);
                                am.page.pay.addDpCoupon(ret.content);
                                am.msg('优惠券已使用！');
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


            this.mix = {
                init: function() {
                    this.$ = $("#mixPayDetail").vclick(function() {
                        _this.hide();
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
                                    $this.val(value);
                                    var res = _this.mix.checkTotalPrice();
                                    if (typeof(res) != "undefined" && res > 0) {
                                        var v = Math.round((value - res) * 100) / 100;
                                        setTimeout(function() {
                                            am.msg('输入总金额超出 ￥' + v + ',已自动调整为 ￥' + v + '！');
                                            $this.val(v);
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
                    var price = 0;
                    for (var i = 0; i < this.$input.length; i++) {
                        var $thisInp = this.$input.eq(i);
                        // if ($thisInp.is(":disabled")) {
                        // disabled也能可是支付完成，不能这样判断，需要保证show的时候清除所有input残余值
                        //     continue;
                        // }
                        var val = $thisInp.val() * 1 || 0;
                        price += val;
                        if (val && $thisInp.attr('name') == 'card') {
                            var balance = am.page.pay.opt.member.balance;
                            if (Math.round(val*100) > Math.round(balance*100)) {
                                am.msg('卡金余额￥' + balance +',不足支付金额！');
                                $thisInp.addClass('error');
                                return 0;
                            }
                        }
                        if (val && $thisInp.attr('name') == 'bonus') {
                            var bonus = am.page.pay.opt.member.gift;
                            if (Math.round(val*100) > Math.round(bonus*100)) {
                                am.msg('赠送金余额￥' + bonus +',不足支付金额！');
                                $thisInp.addClass('error');
                                return 0;
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
                    //if (member && (this.opt.option.expenseCategory==0 || this.opt.option.expenseCategory==1) && member.cardtype==1 && member.timeflag!=1) {
                    if (member && (expenseCategory==0 || expenseCategory==1  || expenseCategory==4) && member.cardtype==1 && member.timeflag!=1) {
                        //是会员，而且是正常能用卡金消费的情况
                        if (member.balance>0) {
                            this.$input.filter('input[name=card]').attr("disabled", false);
                        } else {
                            this.$input.filter('input[name=card]').attr("disabled", true);
                        }
                        if (member.gift>0) {
                            this.$input.filter('input[name=bonus]').attr("disabled", false);
                        } else {
                            this.$input.filter('input[name=bonus]').attr("disabled", true);
                        }

                        //欠款
                        this.$input.filter('input[name=debtFee]').attr("disabled", false);
                    } else {
                        //其它，卡金都不能用
                        this.$input.filter('input[name=card],input[name=bonus]').attr("disabled", true);
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
                    if (am.page.pay.opt.option.expenseCategory == 0 && !coupon && !am.page.pay.opt.prodOption) {
                        this.$input.filter('input[name=dp]').attr("disabled", false).next().removeClass('am-disabled');
                    } else {
                        this.$input.filter('input[name=dp]').attr("disabled", true).next().addClass('am-disabled');
                    }

	                var prePay = am.page.pay.$list.find('dd.prePay').data('data');
	                if(prePay){
		                if(prePay.type == 1){
			                this.$input.filter('input[name=wechat]').attr("disabled", true).next().addClass('am-disabled');
		                }else if(prePay.type == 2){
			                this.$input.filter('input[name=alipay]').attr("disabled", true).next().addClass('am-disabled');
		                }else if(prePay.type == 3){
			                this.$input.filter('input[name=dp]').attr("disabled", true).next().addClass('am-disabled');
		                }
	                }

                    if(!this.otherfeeRendered){
                        var pc = am.metadata.payConfigs;
                        for(var i=0;i<pc.length;i++){
                            if(pc[i].status=="1" && pc[i].field.indexOf('OTHERFEE')!=-1){
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
                        }
                    });
                    
                    if(am.page.pay.opt.debt || am.page.pay.opt.renewal){
                        this.scrollview.$inner.find('div[paytype=DEBTFEE]').hide();
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
                        $(this).val("").removeData('data').attr('disabled', false).next().removeClass('am-disabled').text("支付");
                        $(this).parent().removeClass('payed');
                    });
                },
                payComplete: function(data) {
                    var $input = this.$.find('input[name=' + this.payType + ']');
                    if (data && data.status == 3) {
                        $input.attr('disabled', true).data('data', data).next().text('退款');
                        $input.parent().addClass('payed');
                    } else {
                        $input.attr('disabled', false).removeData('data').next().text('支付');
                        $input.parent().removeClass('payed');
                    }
                }
            };
            this.mix.init();
        },
        reset: function() {
            this.wechat.reset();
            this.alipay.reset();
            this.dp.reset();
            this.mix.reset();
            this.luckyMoney.reset();
            this.mallOrder.reset();
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
                if (data) {
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
        Paytool:Paytool
    };
})();

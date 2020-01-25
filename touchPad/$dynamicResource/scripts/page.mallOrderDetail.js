(function ($) {
    var self = am.page.mallOrderDetail = new $.am.Page({
        id: "page_mallOrderDetail",
        backButtonOnclick: function () {
            var data = self.$userBox.data("orderdata");
            $.am.page.back("slidedown");
            if (data && data.hideflag != 1) {
                am.page.billRecord.$.find('.billRecordTab li:nth-of-type(4)').trigger('vclick')
            }
        },
        init: function () {
            this.$userBox = this.$.find('.detailMode');
            this.$leftBox = this.$.find('.container-wrap .detailLf');
            this.$rightBox = this.$.find('.container-wrap .detailRt');
            this.$downBox = this.$.find('.container-wrap .detailDown');
            this.$verifyTime = this.$.find('.container-wrap .detailDown .verifyTime')
            this.$verifyShop = this.$.find('.container-wrap .detailDown .verifyShop')
            this.$showOperator = this.$.find('.container-wrap .detailDown .showOperator')
            this.$itemStatus =this.$.find('.container-wrap .detailRt .itemStatus')
            this.$verifyBtn = this.$.find('.verifyBtn');
            this.$.on("vclick", ".verifyBtn.am-clickable", function () {//审核订单
                var data = self.$userBox.data("orderdata");
                var orderId = data.id;
                var shopId = am.metadata.userInfo.shopId;
                var opt = {
                    "orderId": orderId,
                    "shopId": shopId
                }
                var res = self.isBelongToMyShop(shopId);
                if (!res) {
                    am.msg('该券不能在此门店使用');
                    return;
                }
                if (am.checkDate(data)) return;
                //美一刻购买的套餐订单不能在此处使用
                if (data.mallItem && data.mallItem.packageInfo) {
                    return am.msg("商城购买的套餐订单需要顾客在美一客/小程序中进行核销");
                }
                am.loading.show("正在核销,请稍候...");
                am.api.verifyOrder.exec(opt, function (res) {
                    am.loading.hide();
                    console.log(res);
                    if (res.code == 0) {
                        am.msg('核销成功!');
                        var data = self.$userBox.data("orderdata");
                        data.status = 3;
                        data.consumeStoreName = am.metadata.userInfo.osName;
                        data.consumeTime = +new Date();
                        data.operatorName = am.metadata.userInfo.userName;
                        self.renderOrderInfo(data);
                    } else {
                        am.msg(res.message || "数据获取失败,请检查网络!");
                    }
                });
            })
        },
        beforeShow: function (parse) {
            this.renderOrderInfo(parse);
            this.$userBox.addClass('show').data('orderdata', parse);
        },
        renderFlagVerify:function(flag,color){
            if(flag){
                if(color == "red"){
                    this.$itemStatus.find('.item_value').css("color","#E82742")
                }else{
                    this.$itemStatus.find('.item_value').css("color","#309030")
                }
                this.$verifyBtn.show()
                this.$verifyTime.hide()
                this.$verifyShop.hide()
                this.$showOperator.hide()
            }else{
                this.$itemStatus.find('.item_value').css("color","#222")
                this.$verifyBtn.hide()
                this.$verifyTime.show()
                this.$verifyShop.show()
                this.$showOperator.show()
            }
        },
        renderOrderInfo: function (data) {
            if (data && data.mallItem && data.mallItem.shopIds) {
                self.$userBox.data('shopIds', data.mallItem.shopIds);
            }
            var status = '';
			if (data.status == "2" && data.isgroupbuying == 1) {
				if (data.refundTimes > 10 && data.groupbuyingstatus != 4) {
                    status = '退款失败,到期未成团';
                    this.renderFlagVerify(true,"red");
                    this.$verifyBtn.removeClass('am-clickable');
				}else if(data.groupbuyingstatus == 1) {
                    status = '团购中';
                    this.renderFlagVerify(true,"green");
                    this.$verifyBtn.removeClass('am-clickable');
				}else if(data.groupbuyingstatus == 2) {
                    status = '已成团,可使用';
                    this.renderFlagVerify(true,"green");
                    this.$verifyBtn.addClass('am-clickable');
				}else if(data.groupbuyingstatus == 3) {
                    status = '等待退款';
                    this.renderFlagVerify(true,"green");
                    this.$verifyBtn.removeClass('am-clickable');
                }else if(data.groupbuyingstatus == 4) {
                    status = '已退款';
                    this.renderFlagVerify(true,"red");
                    this.$verifyBtn.removeClass('am-clickable');
                };
			} else if (data.status == "2" && data.isgroupbuying != 1) {
                status = '未使用';
                this.renderFlagVerify(true,"green");
                this.$verifyBtn.addClass('am-clickable');
			} else if (data.status == "-2") {
                status = '已退款';
                this.renderFlagVerify(true,"red");
                this.$verifyBtn.removeClass('am-clickable');
			} else if (data.status == "-3") {
                status = '退款失败';
                this.renderFlagVerify(true,"red");
                this.$verifyBtn.removeClass('am-clickable');
			} else {
                status = '已使用';
                this.renderFlagVerify(false);
            };
            if(data&&data.hideflag==1){
                this.$verifyBtn.hide();
            }
            var images = data.mallItem.images;
            images = images ? images.split(",")[0] : '';
            var bugTime = (data.createTime ? (new Date(Number(data.createTime)).format("yyyy.mm.dd HH:MM")) : '');
            var consumeTime = (data.consumeTime ? (new Date(Number(data.consumeTime)).format("yyyy.mm.dd HH:MM")) : '');
            var remark = (data.mallItem.quickDescription ? data.mallItem.quickDescription : '');
            var attributeNickName=(data.attributeNickName?data.attributeNickName:'--');
            var payType = "未知";
            if (data.payType == 0) {
                payType = "微信支付";
                if (data.luckyMoneyPay) {
                    payType = "微信+红包";
                }
            } else if (data.payType == 1) {
                payType = "支付宝支付";
                if (data.luckyMoneyPay) {
                    payType = "支付宝+红包";
                }
            } else if (data.payType == 2) {
                payType = "免费领取";
                if (data.luckyMoneyPay) {
                    payType = "红包支付";
                }
            } else if (data.payType == 3) {
                payType = "会员卡支付";
                if (data.luckyMoneyPay) {
                    payType = "会员卡+红包";
                }
            }
            this.$leftBox.find(".conImg").html(am.photoManager.createImage("customer", {
                parentShopId: am.metadata.userInfo.parentShopId,
                updateTs: data.lastphotoupdatetime || new Date().getTime()
            }, data.memId + ".jpg", "s", data.photopath || '')).end().find(".conName").text(data.memName).end()
                .find(".conTel").text(data.memMobile);
            this.$rightBox.find(".imgCenter").html(am.photoManager.createImage("mall", {
                parentShopId: am.metadata.userInfo.parentShopId,
            }, images, "s")).end().find(".itemTit").text(data.mallItemName).end()
                .find(".attributeNickName .item_value").text(attributeNickName).end()
                .find(".itemRemark").text(remark).end()
                .find(".itemStatus .item_value").text(status).end()
                .find(".itemPrice .item_value").text((data.cashPay ? ('￥ ' + data.cashPay.toFixed(2)) : '')).end()
                .find(".itemBuyTime .item_value").text(bugTime).end()
                .find(".itemPayType .item_value").text(payType).end()
                .find(".distrType .item_value").text(data.distrType ? (data.distrType == 1 ? "到店取货" : "物流配送") : '').end()
                .find(".verifyShop .item_value").text(data.consumeStoreName).end()
                .find(".verifyTime .item_value").text(consumeTime).end()
                .find(".showOperator .item_value").text(data.operatorName||"").end()
        },
        isBelongToMyShop: function (shopId) {
            var shopIds = self.$userBox.data('shopIds');
            if (shopIds) {
                shopIds = shopIds.split(',');
            } else {
                shopIds = [];
            }
            if (shopIds.indexOf(shopId.toString()) > -1) {
                return true;
            } else {
                return false;
            }
        },
    })
})($)

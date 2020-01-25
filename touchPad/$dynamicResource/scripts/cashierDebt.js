var cashierDebt = {
    init:function(){
        var _this=this;
        this.$ = $('#debtBox');
        this.$tr = this.$.find('tbody>tr').remove();
        this.$repay = this.$.find('.repayDebt').vclick(function(){
            _this.repay();
            _this.$.hide();
        });

        this.$.find('.cancel').vclick(function(){
            _this.$.hide();
        });

        this.$.find('.close').vclick(function(){
            _this.$.hide();
        });

        this.$tbody = this.$.find('tbody').on('vclick','.btn',function(){
            _this.repay($(this).parents('tr'));
            _this.$.hide();
        });

        this.scrollview = new $.am.ScrollView({
            $wrap : _this.$.find('.scroll-wrap'),
            $inner : _this.$.find('.scroll-wrap .scroll-inner'),
            direction : [false, true],
            hasInput: false
        });
    },
    cache:{},
    check:function(member,nocache){
        var _this=this;
        if(member){
            this.member = member;
        }else{
            member = this.member;
        }

        var cb = function(ret){
            if(ret && ret.code==0){
                //成功之后做缓存， 避免正常操作时重复请求
                ret.cachedate = new Date().getTime();
                _this.cache[member.id] = ret;
                if(ret.content && ret.content.length){
                    _this.show(ret.content);
                }
            }
        };

        //if(member.shopId == am.metadata.userInfo.shopId){
        for (var i in this.cache) {
            //清除超时缓存
            if(new Date().getTime() - this.cache[i].cachedate > 5*60*1000){
                delete this.cache[i];
            }
        }

        var cacheRes = this.cache[member.id];
        if(cacheRes && !nocache){
            cb(cacheRes);
        }else{
            am.api.queryDebt.exec({
                memberid:member.id,
                shopId:am.metadata.userInfo.shopId
            },cb);
        }
        //}
    },
    clearCache:function(memid){
        delete this.cache[memid];
    },
    type:['项目消费','充值','卖品消费','套餐购买','购买年卡项目'],
    show:function(list){
        if(list){
            this.list = list;
        }else{
            list = this.list;
        }

        if(!this.admin){
            this.admin = {};
            for (var i = 0; i < am.metadata.adminList.length; i++) {
                var tmp = am.metadata.adminList[i];
                this.admin[tmp.id]=tmp;
            }
        }

        this.$.show();
        this.$tbody.empty();
        for (var i = 0; i < list.length; i++) {
            var $tr = this.$tr.clone();
            $tr.data('data',list[i]);
            var $td = $tr.find('td');
            $td.eq(0).text(list[i].billNO);
            $td.eq(1).text(this.type[list[i].type-1]);
            $td.eq(2).text('￥'+list[i].debtFee);
            $td.eq(3).text(new Date(list[i].debtTime).format('yyyy-mm-dd HH:MM'));
            $td.eq(4).text('￥'+list[i].remainFee);
            var adm= this.admin[list[i].operatorId];
            $td.eq(5).text(list[i].operatorname);
            //this.$tbody.append($tr.clone());
            this.$tbody.append($tr);
        }
        if(list.length>1){
            this.$repay.hide();
            this.$.find('.muti').show();
        }else{
            this.$repay.show();
            this.$.find('.muti').hide();
        }
        this.scrollview.refresh();
        this.scrollview.scrollTo('top');
    },
    getRepayOption:function(payVal,member,debtlog){
        // var msg = "会员"+member.name+"(手机号:"+member.mobile+",卡号:"+member.cardNo+",单号:"+(debtlog.billNO||"--")+",类别:"+this.type[debtlog.type-1]+")还款";
        var msg = this.type[debtlog.type-1]+"还款(单号:"+(debtlog.billNO||"--")+")";
        return {
            "shopId":am.metadata.userInfo.shopId,
            "parentShopId":am.metadata.userInfo.realParentShopId,
            "content":msg,
            "debtLogId":debtlog.id,
            "debtFee":debtlog.debtFee,
            "type":debtlog.type,
            "remainFee":debtlog.remainFee,
            "repayFee":payVal*1||0,
            "operatorId":am.metadata.userInfo.userId,
            "memberid": member.id,
            "membername": member.name,
            "debtFlag": debtlog.debtFlag,
            "bill": debtlog.bill,
            "billDetails": debtlog.billDetails,
            "cards": debtlog.cards,
            "cashs": debtlog.cashs
        };
    },
    repay:function($tr){
        if(!$tr){
            $tr = this.$tbody.find('tr').eq(0);
        }
        var data = $tr.data('data'),_this=this;

        if(data.type==5){
            atMobile.nativeUIWidget.showMessageBox({
                title: "计次卡/年卡",
                content: '小掌柜暂不支持【年卡】,请使美管加用收银系统还款!'
            });
            return;
        }

        if(data.shopId != amGloble.metadata.userInfo.shopId){
            amGloble.msg('不可跨店还款');
            return;
        }

        if(data.debtFlag==1){
            $.am.changePage(am.page.addIncome,'slideup',this.getRepayOption(0,this.member,data));
            this.clearCache(this.member.id);
        }else {
            if(data.type == 1 || data.type==3){
                $.am.changePage(am.page.addIncome,'slideup',this.getRepayOption(0,this.member,data));
                this.clearCache(this.member.id);
            }else{
                am.loading.show();
                am.api.queryMemberById.exec({
                    memberid:this.member.id
                },function(ret){
                    am.loading.hide();
                    if(ret && ret.code==0 && ret.content && ret.content.length){
                        var cards = [];
                        for(var i=0;i<ret.content.length;i++){
                            if(ret.content[i].cardtype==1){
                                cards.push(ret.content[i]);
                            }
                        }
                        if(cards.length==1){
                            _this.gotoRecharge(data,cards[0]);
                        }else{
                            var arr = [];
                            for(var i=0;i<cards.length;i++){
                                arr.push({
                                    name:cards[i].cardName + ' (余额:￥'+ (cards[i].balance )+')',
                                    data:cards[i]
                                });
                            }
                            _this.popupMenu(arr,data);
                        }
                    }else{
                        am.msg('客户资料读取失败！');
                    }
                });
            }
        }
	},
	popupMenu: function(arr,data){
		var self = this;
		am.popupMenu("请选择会员卡进行还款充值",arr, function (memberdata) {
            if(!memberdata) return;
			var member = memberdata.data || {};
			if (!(member.allowkd-0) && member.shopId != am.metadata.userInfo.shopId) {
				am.msg('此会员卡不允许跨店消费！');
				self.popupMenu(arr,data);
				return;
			}
			self.gotoRecharge(data,member);
		});
	},
    gotoRecharge:function(debt,member){
		if (!(member.allowkd-0) && member.shopId != am.metadata.userInfo.shopId) {
			am.msg('此会员卡不允许跨店消费！');
			return;
		}
        if(member.cardtype==1 && (member.timeflag==1 || member.timeflag==3)){
            //计次卡
            atMobile.nativeUIWidget.showMessageBox({
            	title : "计次卡/年卡",
            	content : '小掌柜暂不支持【计次卡】与【年卡】还款，请在收银台中操作！'
            });
        }else{
            //充值
            $.am.changePage(am.page.pay, "slideup",{
                action:"recharge",
                debt:debt,
                member:member
            });
            this.clearCache(member.id);
        }
    }
};

$(function(){
    cashierDebt.init();
});

$(function(){
    am.signname = {
        show:function(opt,billId){
            if(!this.size){//只执行一次
                var _this=this;
                this.$ = $("#signname").show();
                this.$canvas = this.$.find("canvas");
                this.$.find('div.ok').vclick(function(){
                    _this.upload();
                });
                this.$.find('div.clearCanvas').vclick(function(){
                    _this.signaturePad.clear();
                    _this.renderStaticEle();
                    _this.renderBill();
                });
                this.$.find('div.cancel').vclick(function(){
                    _this.finish();
                });
                this.size = [window.innerWidth,(this.$.height()-50)];
                this.$canvas.attr('width',this.size[0]);
                this.$canvas.attr('height',this.size[1]);
                this.ctx = this.$canvas[0].getContext('2d');
                this.signaturePad = new SignaturePad(this.$canvas[0]);
            }else{
                this.$.show();
                if(this.signaturePad){
                    this.signaturePad.clear();
                }
            }

            this.opt = opt;
            // if(this.opt.action !="bill"){
            //     this.$.appendTo("#page_pay");
            // }else{
            //     this.$.appendTo(".am-app");
            // }
            this.billId = billId;
            this.renderStaticEle();
            this.renderBill();
        },
        renderStaticEle:function(){
            var ctx = this.ctx;
            //ctx.clearRect(0,0,this.size[0],this.size[1]);
            ctx.fillStyle='#FFFFFF';
            ctx.fillRect(0,0,this.size[0],this.size[1]);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            //横线
            ctx.moveTo(0,100);
            ctx.lineTo(this.size[0],100);
            //竖线
            ctx.moveTo(this.size[0]/2,100);
            ctx.lineTo(this.size[0]/2,this.size[1]);
            //画线
            ctx.strokeStyle = "#AAA";
            ctx.stroke();

            //画勾
            ctx.beginPath();
            ctx.arc(50,50,30,0,2*Math.PI);
            ctx.fillStyle='#58d56d';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(28,43);
            ctx.lineTo(42,68);
            ctx.lineTo(93,30);
            ctx.lineTo(43,55);
            ctx.lineTo(28,43);
            ctx.fillStyle='#FFFFFF';
            ctx.fill();
            ctx.beginPath();
            //文字：结算成功
            ctx.font="30px Verdana";
            ctx.fillStyle='#333333';
            ctx.fillText('结算完成，请签名',90,50);


            ctx.font="12px Verdana";
            if(this.opt.action == "bill"){
                ctx.fillText(this.opt.name+(this.opt.sex=="F"?"女士":"先生") + "于"+new Date(this.opt.ts*1).format("yyyy年mm月dd日 HH:MM")+"使用"+this.opt.cardName+"消费",90,70);
            }else{
                ctx.fillText(this.opt.member.name+(this.opt.member.sex=="F"?"女士":"先生") + "于"+am.now().format("yyyy年mm月dd日 HH:MM")+"使用"+this.opt.member.cardName+"消费",90,70);
            }

            ctx.font="15px Verdana";
            ctx.fillStyle='#999999';
            ctx.fillText('顾客签名:',10,125);
            ctx.fillText('手艺人签名:',this.size[0]/2+10,125);
        },
        showCostContent:function(){
            var serviceobj = {};
            var productobj = {};
            var comboItemObj = {};
            if(this.opt.prodOption&&this.opt.servOption){
                var serviceItems = this.opt.servOption.serviceItems
                var productItems = this.opt.prodOption.products&&this.opt.prodOption.products.depots;
            }else{
                var serviceItems = this.opt.option.serviceItems
                var productItems = this.opt.option.products&&this.opt.option.products.depots;
            }
            if(serviceItems&&serviceItems.length){
                $.each(serviceItems, function (k, v) {
                    if (v.consumeType == 0) {
                        if (serviceobj[v.itemName]) {
                            serviceobj[v.itemName]++;
                        } else {
                            serviceobj[v.itemName] = 1;
                        }
                    } else {
                        if (comboItemObj[v.itemName]) {
                            comboItemObj[v.itemName]++;
                        } else {
                            comboItemObj[v.itemName] = 1;
                        }
                    }
                });
            }
            if(productItems&&productItems.length){
                $.each(productItems, function (k, v) {
                    if (productobj[v.productName]) {
                        productobj[v.productName]+= v.number;
                    } else {
                        productobj[v.productName] = v.number;
                    }
                });
            }
            var showStr = '消费内容：';
            if(JSON.stringify(comboItemObj) != "{}"){
                for(key in comboItemObj){
                    showStr += key + '×' + comboItemObj[key] + '次(套餐)  '
                }
            }
            if(JSON.stringify(serviceobj) != "{}"){
                for(key in serviceobj){
                    showStr += key + '×' + serviceobj[key] + '次  '
                }
            }
            if(JSON.stringify(productobj) != "{}"){
                for(key in productobj){
                    showStr += key + '×' + productobj[key] + '  '
                }
            }
            return showStr
            
        },
        renderBill:function(){
            var text=[];
            var mdConfigs = {//结算后副屏配置
                type : 1,
                title: "",
                text : ""
			}
			// 服务项目
            if(this.opt.action == "bill"){
                //流水单中补签
                //text[0] = "本次消费共支付:￥"+ this.opt.total;
                text[0] = "于"+new Date().format("yyyy年mm月dd日 HH:MM")+"补签";
            }else{
	            if(amGloble.metadata.configs && amGloble.metadata.configs.hidePriceOnSignature === "true") {
                   var showStr = this.showCostContent();
                   text[0] = '';
                   text.push(showStr);
	            }else {
		            //结算前签名
                    text[0] = "本次消费共支付:￥" + this.opt.option.billingInfo.total;
                    var showStr = this.showCostContent();
                    text.push(showStr);
		            if (this.opt.option.billingInfo.cardFee || this.opt.option.billingInfo.presentFee) {
                        var arrfee = [],balance=0,bonus=0;
			            if (this.opt.option.billingInfo.cardFee) {
                            if(this.opt.option.multiCardPay==1){
                                balance = this.opt.member.balance - this.opt.option.marjorCardFee;
                                arrfee.push("卡金￥" + this.opt.option.marjorCardFee);
                            }else{
                                balance = this.opt.member.balance - this.opt.option.billingInfo.cardFee;
                                arrfee.push("卡金￥" + this.opt.option.billingInfo.cardFee);
                            }
                        }
			            if (this.opt.option.billingInfo.presentFee) {
                            bonus = this.opt.member.gift - this.opt.option.billingInfo.presentFee;
                            arrfee.push("赠金￥" + this.opt.option.billingInfo.presentFee)
				            // arrfee.push("赠金￥" + this.opt.option.billingInfo.presentFee + "(扣减后余额:￥" + (Math.round(bonus * 100) / 100) + ")");
                        }
                        // 卡内余额
                        var remainFee ="卡内余额："+"卡金￥" + (Math.round((this.opt.option.billingInfo.cardFee?balance:this.opt.member.balance) * 100) / 100)+','+ "赠金￥" + (Math.round((this.opt.option.billingInfo.presentFee?bonus:this.opt.member.gift) * 100) / 100);
			            text.push('扣减' + arrfee.join(",") + '(' + remainFee + ')');
                    }
                    if (this.opt.comboitem && this.opt.comboitem.length) {
					
                        // 计算是否有重复的套餐次数统计
                        var obj = {};
                        $.each(this.opt.comboitem, function(k, v){
                            v.times = 1;
                            if (obj[v.itemid+v.consumeId]) {
                                v.times++;
                            } else{
                                obj[v.itemid+v.consumeId] = 1;
                            }
                        });
    
                        var combotxt = [],
                            comboitemMap = this.getComboitemMap();
                        for (var k in comboitemMap) {
                            var item = comboitemMap[k]
                            if (item.sumtimes != -99) {
                                combotxt.push(item.itemname + (item.times || 1) + '次(余:' + (item.leavetimes == -99 ? '不限' : item.leavetimes || 0) + '次)');
                            }
                        }
                        // var comboids = {}, combotxt = [];
                        // for (var i = 0; i < this.opt.comboitem.length; i++) {
                        // 	var item = this.opt.comboitem[i];
                        //     if (!comboids[item.itemid] && item.sumtimes != -99) {
                        // 		comboids[item.itemid] = 1;
                        //         combotxt.push(item.itemname + (item.times || 1) + '次(余:' + (item.leavetimes == -99 ? '不限' : item.leavetimes || 0) + '次)');
                        //     }
                        // }
                        if (combotxt.length) {
                            text.push('扣减套餐:' + combotxt.join(","));
                        }
                    }
                }
                //副屏用卡金 赠金
                if (this.opt.option.billingInfo.cardFee || this.opt.option.billingInfo.presentFee) {
                    var mdtext = [];
                    //if (this.opt.option.billingInfo.cardFee) {
                        var balance = this.opt.member.balance - this.opt.option.billingInfo.cardFee;
                        mdtext.push("卡金余额"+(Math.round(balance * 100) / 100)+"元");
                    //}
                    if (this.opt.member.gift) {
                        var bonus = this.opt.member.gift - this.opt.option.billingInfo.presentFee;
                        mdtext.push("\n赠送金余额"+(Math.round(bonus * 100) / 100)+"元");
                    }
                    mdConfigs.text = "本次消费共支付"+this.opt.option.billingInfo.total+"元";
                    mdConfigs.title = mdtext.join(",");
                }
            }
            console.log(text);
            console.log(mdConfigs)
            am.mediaShow(2,mdConfigs);
            var ctx = this.ctx;
            ctx.fillStyle='#555555';
            var top = (100 - text.length*24)/2;
            for(var i=0;i<text.length;i++){
                if(i==0){
                    ctx.font="bold 18px Verdana";
                }else{
                    ctx.font="14px Verdana";
                }
                var txtSize = ctx.measureText(text[i]);
                console.log(txtSize);
                ctx.fillText(text[i],this.size[0] - txtSize.width-30,top+i*24+15);
            }
        },
        getComboitemMap: function () {
            var comboitems = this.opt.comboitem,
                map = {};
            $.each(comboitems, function (i, v) {
                if (!map[v.itemid+v.consumeId]) {
                    map[v.itemid+v.consumeId] = {
                        itemname: v.itemname,
                        times: 1,
                        leavetimes: v.leavetimes,
                        sumtimes: v.sumtimes
                    }
                } else {
                    map[v.itemid+v.consumeId].times++;
                }
            });
            return map;
        },
        hide:function(){
            this.$.hide();
        },
        upload:function(){
            if(this.signaturePad.isEmpty()){
                am.msg("请签名，你没有签名！");
                return;
            }
            var opt = {
                dir:"signature/bill/"+am.metadata.userInfo.parentShopId+"/"+am.metadata.userInfo.shopId,
                imageBase64: this.signaturePad.toDataURL("image/jpeg").replace("data:image/jpeg;base64,",""),
                name:this.billId+".jpg",
                realName:"1.jpg",
                trim:false,
                // variations:[
                //     {suffix: "l", resolution: "1024x1024"},
                //     {suffix: "m", resolution: "512x512"},
                //     {suffix: "s", resolution: "256x256"}
                // ]
            };
            this.times=0;
            this.execUpload(opt);
        },
        execUpload:function(opt){
            var _this=this;
            amGloble.loading.show();
            amGloble.api.base64Upload.exec(opt, function(ret) {
                amGloble.loading.hide();
                _this.times++;
                if (ret.code == 0) {
                    am.msg("签名已保存");
                    _this.finish();
                } else {
                    //self.msg("照片上传失败!");
                    if (_this.times > 1) {
                        atMobile.nativeUIWidget.confirm({
                            caption: "签名保存失败",
                            description: "签名保存失败,是否重新上传?",
                            okCaption: "重试",
                            cancelCaption: "取消"
                        }, function() {
                            _this.execUpload(opt);
                        }, function() {
                            am.msg("签名保存失败！");
                            _this.finish();
                        });
                    } else {
                        _this.execUpload(opt);
                    }
                }
            }, true, 120000);
        },
        finish:function(){
            if(this.opt.action !="bill"){
                var _this=this;
                setTimeout(function(){
                    _this.hide();
                },600);
                if(am.metadata.configs && am.metadata.configs.serviceFeedbackInCashierSys==='true' && this.opt.option.expenseCategory==0){//运营系统配置了权限并且使用了项目
                    am.commentService.show(this.opt,this.billId);
                }else{
                    //$.am.changePage(am.page.service,'slidedown');
                    am.goBackToInitPage();
                }
            }else{//单据页面补签名过来的
                this.hide();
            }
        }
    };
    am.commentService = {//服务点评
        show:function(opt,billId,cb,flag){//有cb flag 是不走签名 直接走评价
            var _this=this;
            this.$ = $("#commentService").show();
            this.$commentVal=this.$.find('.comment_val');
            this.$commentVal.find('div.val').removeClass('selected');
            if(!this.oneTime){//不刷新的前提下 绑定事件 和 执行一次的变量的赋值 只执行一次
                this.$confirm = this.$.find('.commentConfirm').vclick(function(){
                    _this.commentSuccesss();
                });
                this.$.find('.cancel_comment').vclick(function(){
                    _this.finishPay(cb);
                });
                this.$commentVal.on('vclick','div.val',function(){
                    $(this).addClass("selected").siblings().removeClass("selected");
                    var ret =_this.getOpt();
                    console.log(ret)
                    if(ret>=0 && ret<=2){
                        _this._submit(ret,cb,flag);//提交点评的内容
                    }else if(ret==-1){
                        am.msg('请先选择评价后点评！');
                    }
                });
                this.oneTime=true;
            }
            this.opt=opt;
            console.log(111111111111111, this.opt);
            this.memid=-1;
            this.memname='';
            this.opt.member && (this.memid=this.opt.member.id);
            this.opt.member && (this.memname=this.opt.member.name);
            this.billId=billId;
        },
        hide:function(){
            this.$.hide();
        },
        _submit:function(ret,cb,flag){//评价完 之后 分两种情况 1、签完名之后的 2、未签名的
            var _this=this;
            am.loading.show("点评中,请稍候...");
            am.api.commentService.exec({
                "parentshopid":am.metadata.userInfo.parentShopId,
                "shopid":am.metadata.userInfo.shopId,
                "billid":this.billId,
                "commentlevel":ret,
                "channel":this.opt.feedbackComment && this.opt.feedbackComment.content ? 0 : 2,
                "content": this.opt.feedbackComment && this.opt.feedbackComment.content ? this.opt.feedbackComment.content : "店内点评",
                "label" : this.opt.feedbackComment && this.opt.feedbackComment.label ? this.opt.feedbackComment.label : null,
                "memid":this.memid || -1,
                "memname":this.memname || "散客",
            }, function (res) {
                am.loading.hide();
                console.log(res);
                if (res.code == 0) {
                    am.msg('感谢您的评价，期待下次光临');
                    if(cb&&flag){
                        _this.finishPay(cb);
                    }else{
                        _this.finishSignname();
                    }
                } else {
                    am.msg(res.message || "数据获取失败,请检查网络!");
                }
            });
        },
        finishSignname:function(){//签名之后走的
            setTimeout(function(){
                _this.hide();
            },3000);
            var _this=this;
            _this.$confirm.show();
            var i=3;
            _this.$confirm.find('strong').text(i);
            _this.commentTimer = setInterval(function(){
                i--;
                _this.$confirm.find('strong').text(i);
                if(i==0){
                    _this.commentSuccesss();
                }
            },1000);
        },
        finishPay:function(cb){//结算完评价后走的
            var _this=this;
            setTimeout(function(){
                _this.hide();
            },300);
            if(cb){
                cb();
            }else{
                //$.am.changePage(am.page.service,'slidedown');
                am.goBackToInitPage();
            }
        },
        commentSuccesss:function(){//评价成功最终走的
            var _this=this;
            setTimeout(function(){
                _this.hide();
            },300);
            if(this.commentTimer) {
                clearInterval(this.commentTimer);
                this.commentTimer=null;
            }
            //$.am.changePage(am.page.service,'slidedown');
            am.goBackToInitPage();
            setTimeout(function(){
                _this.$confirm.hide();
            },300);
        },
        getOpt:function(){//获取评价等级
            var index=this.$commentVal.find('div.val.selected').index();
            return index;
        },
    };
    am.signatureView  = {
        show:function(opt){
            var memberId = opt.memberId,billId=opt.billId,bill=opt.bill,unresign = opt.unresign,storeId=opt.storeId,failed = opt.failed;
            //记数
            var complete = 0,param = [],_this=this;

            this.loading = true;
            var check = function(){
                if($.am.getActivePage().id!='page_billDetail' && $.am.getActivePage().id!='page_billRecord' && $.am.getActivePage().id!='page_memberDetails'){
                    return;
				}
                if(complete == 2){
                    setTimeout(function(){
                        _this.loading = false;
                    },800);
                    if(param[0] && param[1]){
                        am.loading.show();
                        setTimeout(function(){
                            am.loading.hide();
                            am.pswp(param,0);
                        },800);
                    }else if(param[0] || param[1]){
                        if(unresign){
                            if(!param[0]){
                                am.msg('此流水单未签名！');
                                failed && failed();
                                return;
                            }else{
                                am.msg('顾客档案未保存签名！');
                            }
                            am.loading.show();
                            setTimeout(function(){
                                am.loading.hide();
                                am.pswp(param,0);
                            },800);
                            return;
                        }
                        if(param[0]){
                            //是否有权限改用户资料
                            if(am.operateArr.indexOf("R") !=-1){
                                //有流水单签名
                                am.confirm("顾客未签名","此顾客没有留下签名，是否立即补签？", "去签名", "继续查看", function() {
                                    _this.gotoAddMember(memberId);
                                }, function() {
                                    //param.pop();
                                    am.pswp(param,0);
                                });
            				}else{
                                am.loading.show();
                                setTimeout(function(){
                                    am.loading.hide();
            					    am.pswp(param,0);
                                },800);
            				}
                        }else{
                            //有顾客签名
                            am.confirm("流水单未签名","此单消费顾客未签名，是否立即补签？", "去签名", "继续查看", function() {
                                am.signname.show(bill,billId);
                            }, function() {
                                param.shift();
                                am.pswp(param,0);
                            });
                        }
                    }else{
                        if(unresign){
                            am.msg('顾客没有留下签名！');
                            failed && failed();
                            return;
                        }
                        if(am.operateArr.indexOf("R") !=-1){
                            am.confirm("补全签名","此顾客没有留下签名，是否立即补签？", "去签名", "返回", function() {
                                _this.gotoAddMember(memberId);
                            }, function() {

                            });
                        }else{
                            am.confirm("流水单未签名","此单消费顾客未签名，是否立即补签？", "去签名", "返回", function() {
                                am.signname.show(bill,billId);
                            }, function() {

                            });
                        }
                    }
                }
			};
			//用户签名
			var signatureCount = 0;
			var signatureFn = function(){
				//用户签名
				var $signature = am.photoManager.createImage("signature", {
					parentShopId: am.metadata.userInfo.parentShopId,
					updateTs: new Date().getTime()
				}, memberId + ".png", "");

				$signature.load(function(){
					var canvas = document.createElement("canvas");
					canvas.width = this.naturalWidth;
                    canvas.height = this.naturalHeight;
                    var _this = this;                    
                    var image = new Image();
                    image.src = $(this).attr('src');
                    image.onload = function(){
                        var ctx = canvas.getContext("2d");
                        ctx.fillStyle = 'White';
                        ctx.fillRect(0,0,_this.naturalWidth,_this.naturalHeight);
                        ctx.drawImage(image, 0, 0);
                        var src = canvas.toDataURL("image/png");
                        complete++;
                        param[1] = {
                            src: src,
                            w: _this.naturalWidth,
                            h: _this.naturalHeight,
                            title: '顾客签名'
                        };
                        check();
                    }
				}).error(function(){
					if(signatureCount){
						complete++;
						check();
					}else {
						signatureCount ++;
						signatureFn();
					}
				});
			}
            signatureFn();

			//流水单签名
			var billSignatureCount = 0;
			var billSignatureFn = function(){
				//流水单签名
				var $billSignature = am.photoManager.createImage("billSignature", {
					parentShopId: am.metadata.userInfo.parentShopId,
					shopId: storeId || am.metadata.userInfo.shopId,
					updateTs: new Date().getTime()
				}, billId + ".jpg", "");

				$billSignature.load(function(){
					complete++;
					param[0] = {
						src: $(this).attr('src'),
						w: this.naturalWidth,
						h: this.naturalHeight,
						title: '流水单签名\n'
					};
					check();
				}).error(function(){
					if(billSignatureCount){
						complete++;
						check();
					}else {
						billSignatureCount ++;
						billSignatureFn();
					}
				});
			}
			billSignatureFn();
        },
        gotoAddMember:function(memberId){
            am.loading.show();
            am.api.memberDetails.exec({
                "memberid":memberId,
                "parentShopId":am.metadata.userInfo.parentShopId
            }, function(res) {
                am.loading.hide();
                console.log(res);
                if (res.code == 0) {
                    $.am.changePage(am.page.addMember, "slideup",{userInfo:res.content.memberInfo});
                }else {
                    am.msg(res.message || "数据获取失败,请检查网络!");
                }
            });
        }
    };
});

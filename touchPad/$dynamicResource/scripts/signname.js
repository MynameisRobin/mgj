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
            }

            this.opt = opt;
            if(this.opt.action !="bill"){
                this.$.appendTo("#page_pay");
            }else{
                this.$.appendTo(".am-app");
            }
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
        renderBill:function(){
            var text=[];
            var mdConfigs = {//结算后副屏配置
                type : 1,
                title: "",
                text : ""
            }
            if(this.opt.action == "bill"){
                //流水单中补签
                //text[0] = "本次消费共支付:￥"+ this.opt.total;
                text[0] = "于"+new Date().format("yyyy年mm月dd日 HH:MM")+"补签";
            }else{
	            if(amGloble.metadata.configs && amGloble.metadata.configs.hidePriceOnSignature === "true") {
		            //
	            }else {
		            //结算前签名
		            text[0] = "本次消费共支付:￥" + this.opt.option.billingInfo.total;
		            if (this.opt.option.billingInfo.cardFee || this.opt.option.billingInfo.presentFee) {
			            var arrfee = [];
			            if (this.opt.option.billingInfo.cardFee) {
				            var balance = this.opt.member.balance - this.opt.option.billingInfo.cardFee;
				            arrfee.push("卡金￥" + this.opt.option.billingInfo.cardFee + "(扣减后余额:￥" + (Math.round(balance * 100) / 100) + ")");
			            }
			            if (this.opt.option.billingInfo.presentFee) {
				            var bonus = this.opt.member.gift - this.opt.option.billingInfo.presentFee;
				            arrfee.push("赠金￥" + this.opt.option.billingInfo.presentFee + "(扣减后余额:￥" + (Math.round(bonus * 100) / 100) + ")");
			            }
			            text.push('扣减' + arrfee.join(","));
		            }
		            if (this.opt.comboitem && this.opt.comboitem.length) {
			            var comboids = {}, combotxt = [];
			            for (var i = 0; i < this.opt.comboitem.length; i++) {
				            var item = this.opt.comboitem[i];
				            if (!comboids[item.itemid] && item.sumtimes != -99) {
					            comboids[item.itemid] = 1;
					            combotxt.push(item.itemname + (item.tleavetimes - item.leavetimes) + '次(余:' + item.leavetimes + '次)');
				            }
			            }
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
                "channel":2,
                "content":"店内点评",
                "memid":this.memid || -1,
                "memname":this.memname || "散客"
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
            //流水单签名
            var $billSignature = am.photoManager.createImage("billSignature", {
	            parentShopId: am.metadata.userInfo.parentShopId,
                shopId: storeId || am.metadata.userInfo.shopId,
	            updateTs: new Date().getTime()
	        }, billId + ".jpg", "");

            //用户签名
            var $signature = am.photoManager.createImage("signature", {
	            parentShopId: am.metadata.userInfo.parentShopId,
	            updateTs: new Date().getTime()
	        }, memberId + ".png", "");

            var check = function(){
                if(complete == 2){
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
            $signature.load(function(){
                complete++;
                param[1] = {
                    src: $(this).attr('src'),
                    w: this.naturalWidth,
                    h: this.naturalHeight,
                    title: '顾客签名'  // used by Default PhotoSwipe UI
                };
                check();
			}).error(function(){
                complete++;
                check();
			});

            //流水单签名
            $billSignature.load(function(){
                complete++;
                param[0] = {
                    src: $(this).attr('src'),
                    w: this.naturalWidth,
                    h: this.naturalHeight,
                    title: '流水单签名\n'  // used by Default PhotoSwipe UI
                };
                check();
			}).error(function(){
                complete++;
                check();
			});
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

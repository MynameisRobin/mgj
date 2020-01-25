(function(){
    var pw = {
        init:function(){
           /*  this.$ = $("#checkPassword");
            this.$input = this.$.find("input").keyup(function(evt){
                if(evt.keyCode == 13){
                    pw.$ok.trigger('vclick');
                }
            });
            this.$ok = this.$.find("div.ok").vclick(function(){
                var pass = pw.$input.val();
                if(pass){
                    if(pass == pw.member.passwd){
                        pw.cache[pw.member.id] = new Date().getTime();
                        pw.cb(1);
                        pw.$.hide();
                    }else{
                        pw.$input.val("").focus();
                        am.msg("密码输入有误！");
                    }
                }else{
                    am.msg("请输入密码！");
                }
            });
            this.$cancel = this.$.find("div.cancel").vclick(function(){
                pw.$.hide();
            }); */
        },
		cache:{},
		//判断是否有需要密码的支付方式在里面
		// "WHETHERENABLE" IS '是否开启验证 默认0：不开启  1：开启'
		// "VALIDATION" IS '0所有顾客短信验证  1仅会员密码顾客短信验证'
		// "SHOPPROPERTYFIELD"."PAYNAME" IS '付款方式  默认-1:全部验证'
        hasBillingInfo:function(option){
			var flag = false;
			var paynames = am.metadata.shopPropertyField && am.metadata.shopPropertyField.payname;
			var expenseCategory = option && option.expenseCategory;
			var type = 0;
			if(expenseCategory != 0 && expenseCategory === undefined){
				//不是结算页面没有这个参数所以走老的逻辑
				return true;
			}
			//没有勾选任何支付方式
			if(paynames === null){
				return false;
			}
			//全部验证，全选
			else if(paynames == -1){
				return true;
			}
			if(expenseCategory == 0){
				$.each(option.serviceItems,function(q,r){
					if(r.consumeId || r.isComboConsume){
						type = 1;
						return false;
					}
				});
			}
			$.each(option.billingInfo,function(i,item){
				//套餐单独判断
				if(type || expenseCategory == 4){
					if(paynames.indexOf('TREATFEE') > -1 || paynames.indexOf('TREATPRESENTFEE') > -1){
						flag = true;
						return false;
					}
				}
				//有任意一种需要密码的支付方式
				if (item != 0 && item != null && i != "luckyMoneyId" && i!= "kBOrderid" && i!= "luckMoneys" && i != "weixinId" && i != "payId" && i != "dpId" && i != "eaFee" && i != "total" && i != "mallId" && i != "mallNo" && i != "dpCouponId"  && i != "totalfeeanddebtfee" && i != "treatfee" && i != "treatpresentfee") {
					var key = i.toUpperCase();
					if(paynames.indexOf(key) > -1){
						flag = true;
						return false;
					}
				}
			})
			return flag;
		},
		/**
	 	* 验证规则
		//1.有O权限不用密码
		//2.whetherenable = 1 未开启,validation 0所有顾客短信验证 1仅会员密码顾客短信验证
		//3.billingInfo 支付方式未匹配
		* @return 0: 不启用只弹密码 
		* @return 1: 启用弹密码和短信
		* @return 2: 无密码弹短信
		* @return 3: 无密码什么也不弹,直接结算
		*/
		isValidation:function(){
			var whetherenable = am.metadata.shopPropertyField && am.metadata.shopPropertyField.whetherenable;
			var validation = am.metadata.shopPropertyField && am.metadata.shopPropertyField.validation;
			if(whetherenable == 1){
				if(validation == 0){
					return 1;
				}else if(validation == 1){
					return 2;
				}
			}
			return 0;
		},
        check:function(member,cb,option){
			this.member = member;
			this.cb = cb;
			var validation = this.isValidation();
			var togglePhoneCode = 1;
			if(validation === 0){
				togglePhoneCode = 0;
			}
			else if(validation === 1 || validation === 2){
				togglePhoneCode = 1;
			}

			var data = {
				phone: member.realMobile || member.mobile,//手机
				passwd: member.passwd,//密码
				title: "请输入密码",
				hidedot:true,
				ciphertext:true,
				forgetpwd:true,
				needPsw:am.operateArr.indexOf("O") == -1?true:false,
				togglePhoneCode:togglePhoneCode,
				cb:cb,
				option: option,
				member: member,
				submit: function (value) {
					console.log(value);
					if(value){
						if(value == member.passwd){
							pw.cache[member.id] = new Date().getTime();
							pw.cb(1);
							localStorage.setItem("memPwd_" + member.id,'true');
							localStorage.setItem("togglePhoneCode_"+am.metadata.userInfo.userId,'0');
							if (member.popupAgain) {
								return true;
							}
						}else{
							am.msg("密码输入有误！");
							return true;
						}
					}else{
						am.msg("请输入密码！");
						return true; 
					}
				},
				cancel:function(){
					pw.cache[member.id] = new Date().getTime();
					localStorage.setItem("memPwd_" + member.id,'true');
					localStorage.setItem("togglePhoneCode_"+am.metadata.userInfo.userId,'0');
					cb(1);
					if (member.popupAgain) {
						return true;
					}
				},
			};

            for(var i in this.cache){
                if(new Date().getTime() - this.cache[i] > 15*60*1000){
                    //超过15分钟, 清除缓存
                    delete this.cache[i];
                }
            }

            if(member.passwd && !this.cache[member.id]){
				if(am.isNull(option) || am.isNull(option.billingInfo)){
					data.togglePhoneCode = 0;
					return am.keyboard.show(data);
				}else{
					if(!this.hasBillingInfo(option)){
						return cb(1);
					}
				}
				//有密码才做事  且  没有缓存
				if(localStorage.getItem("togglePhoneCode_"+am.metadata.userInfo.userId) == "1"){
					am.phoneCodeModal.show(data);
				}else{
					am.keyboard.show(data);
				}
			}else{
				if(this.cache[member.id]){
					return cb(1);
				}
				if(!member.passwd && option && option.billingInfo && validation === 1){
					if(!this.hasBillingInfo(option)){
						return cb(1);
					}
					data.togglePhoneCode = 0;
					am.phoneCodeModal.show(data);
					return false;
				}
                cb(1);
            }
        }
    };

    am.pw = pw;

    //既然之前的密码输入弹层不用了，改造为别的插件
    //
    var inputSth = {
        init:function(){
            var _this=this;
            this.$ = $("#checkPassword");
            this.$input = this.$.find("input").keyup(function(evt){
                if(evt.keyCode == 13){
                    _this.$ok.trigger('vclick');
                }
            });
            this.$ok = this.$.find("div.ok").vclick(function(){
                if(!_this.cb(_this.$input.val())){
                    _this.$.hide();
                };
            });
            this.$cancel = this.$.find("div.cancel").vclick(function(){
                _this.$.hide();
            });
            this.$title = this.$.find('.title');
        },
        show:function(opt){
            if(!this.$){
                this.init();
            }
            this.$.show();
            this.$input.val(opt.value || '');
            this.$input.prop('maxlength',opt.maxLength || 10);
            this.$title.text(opt.title);
            this.cb = opt.callback;
        }
    };
    /* {
        title:'',
        value:'',
        maxLength:6,
        callback:function(){

        }
    } */
    am.inputSth = function(opt){
        inputSth.show(opt);
    }
})();

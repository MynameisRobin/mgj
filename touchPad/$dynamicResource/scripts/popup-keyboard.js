/*
//弹出式 需要传位置
 am.keyboard.show({
	onKeyup:function(value){
		self.$input.val(value);
	},
	position:"bottom",//键盘的箭头向上或向下出现 不传默认为向上
	pos:{
		x:position.left,
		y:position.top+height
	}
//行内 submit对应确认键callback
am.keyboard.show({
    onKeyup:function(value){
        self.$input.val(value);
    },
    $:$("#page_searchMember .searchnumber_box"),
    submit:function(value){
        self.changeresult(true);
        self.getData();
    }
});
//带遮罩的键盘
am.keyboard.show({
	title:"请输入数字",//可不传
	hidedot:true,//是否隐藏点
    submit:function(value){
        console.log(value);
    },
	cancel:function(){

	}
});
});
// ciphertext 带密文密码的键盘
//forgetpwd 是否显示忘记密码
*/
(function($){
	var $html=$('<div class="searchnumber">'+
	'<table class="board" border="0" cellpadding="0" cellspacing="0">'+
	    '<tbody>'+
	        '<tr>'+
	            '<td width="75"><div class="am-touchable am-clickable key" data-val="1">1</div></td>'+
	            '<td width="75"><div class="am-touchable am-clickable key" data-val="2">2</div></td>'+
	            '<td width="75"><div class="am-touchable am-clickable key" data-val="3">3</div></td>'+
	            '<td width="75"><div class="am-touchable am-clickable rect delete" data-val="backspace"></div></td>'+
	        '</tr>'+
	        '<tr>'+
	            '<td><div class="am-touchable am-clickable key" data-val="4">4</div></td>'+
	            '<td><div class="am-touchable am-clickable key" data-val="5">5</div></td>'+
	            '<td><div class="am-touchable am-clickable key" data-val="6">6</div></td>'+
	            '<td><div class="am-touchable am-clickable rect clean" data-val="clear"></div></td>'+
	        '</tr>'+
	        '<tr>'+
	            '<td><div class="am-touchable am-clickable key" data-val="7">7</div></td>'+
	            '<td><div class="am-touchable am-clickable key" data-val="8">8</div></td>'+
	            '<td><div class="am-touchable am-clickable key" data-val="9">9</div></td>'+
	            '<td><div class="am-touchable am-clickable rect confirm" data-val="confirm"></div></td>'+
	        '</tr>'+
	        '<tr>'+
	            '<td></td>'+
	            '<td><div class="am-touchable am-clickable key" data-val="0">0</div></td>'+
	            '<td><div class="am-touchable am-clickable key" data-val=".">.</div></td>'+ 
	            '<td></td>'+
	        '</tr>'+
	    '</tbody>'+
	'</table>'+
	'</div>');
	am.keyboard={
		init:function(){
			var self=this;
			//给键盘DOm绑定事件
			this.$dom=$("#open_keyboard_box").on("vtouchstart",".key,.rect",function(){
				var key=$(this).data("val");
				self.buttonpress(key);
			}).on("vclick",".mask",function(){
				self.hide();
				self.opt.cancel && self.opt.cancel();
			});
			$("#maskBoard").on("vclick",".input_forget",function(){
				if(self.opt.passwd){
					am.confirm("忘记密码?","密码将通过短信方式发送至顾客手机","发送","返回",function(){
						self.getCode(self.opt.phone,self.opt.passwd);
					});
				}else{
					am.msg("您还没有设置密码");
				}
			});
			$("#maskBoard .toggleBox").vclick(function(){
				$("#maskBoard").hide();
				am.phoneCodeModal.show(self.opt);
			});
			this.submitHide=false;//点击对勾按钮是否隐藏
		},
		buttonpress:function(val){
			var self = this;
			switch(val){
				case "backspace":
					if(self.value){
						self.value = self.value.substr(0, self.value.length - 1);
					}
					break;
				case "clear":
					self.value = "";
					break;
				case "confirm":
					if(self.type==1){
						self.hide();
					}
					if(self.isDiscount){
						self.value = self.discountPrice;
					}
					var notHide = false;
					if(self.opt.submit) notHide = self.opt.submit(self.value);
					if(self.submitHide){
						!notHide && self.hide();
                    }
                    self.opt.onConfirm && self.opt.onConfirm();
					return;
					break;
				case ".":
					if(self.value.indexOf(".") == -1){
						self.value = self.value + val;
					}
					break;
				default:
					// if (self.value == 0) {
					// 	//self.value = "";
					// }
					self.value = (self.value + val);//*1+"";
					break;
			}

			if (self.value.length > 30) {
				return;
			}
			var newValue = self.value * 1;

			if (isNaN(newValue)) {
				return;
            }
            if(self.opt.ciphertext){
                self.mockCiphertext();
            }else{
                this.setVal();
            }
			this.opt.onKeyup && this.opt.onKeyup(this.value);
        },
        mockCiphertext:function(){
            var self = this,
                showVal = self.value.replace(/\d/g,'*');
            if(this.$dom.find(".input_value>input").length){
				this.$dom.find(".input_value>input").val(this.value);
			}else{
                if(showVal){
                    self.$dom.find(".input_value").text(showVal);
                }else{
                    self.$dom.find(".input_value").text('');
                }
			}
        },
		setVal:function(){
			if(this.$dom.find(".input_value>input").length){
				this.$dom.find(".input_value>input").val(this.value);
			}else{
				this.$dom.find(".input_value").text(this.value);//存在就赋值
			}
			this.$dom.find('.prime_price .num').html('￥'+this.opt.price);
			if(this.isDiscount){
				// this.$dom.find('.input_value_help').removeClass('hide');
				if(this.value>=0&&this.value<=10){
					console.log(this.value);
					this.discountPrice = toFloat(this.opt.price*this.value/10);
					console.log(this.discountPrice);
					this.$dom.find('.input_value_help').html('折后价：<span class="num">&nbsp;￥'+this.discountPrice+'</span>');
				}else{
					console.log("折扣高于十折");
					this.$dom.find('.input_value_help').html('请输入正确折扣！');
					this.discountPrice = this.opt.price;
				}
			}else{
				// this.$dom.find('.input_value_help').addClass('hide');
			}
		},
		hide:function(flag){
			var _this = this;
			if(flag){
				this.$dom.show();
			}else{
				setTimeout(function(){
					_this.$dom.hide();
					setTimeout(function(){
						$.am.getActivePage().$.find("[isdisabled=1]").each(function(){
							$(this).blur();
						});
						$.am.getActivePage().$.find("[isdisabled=1]").attr("disabled",false).removeAttr("isdisabled");
						if(_this.opt&&_this.opt.hidecb){//0015757
							_this.opt.hidecb && _this.opt.hidecb();
						}
					},200);
				},300);
            }
            if(this.opt && this.opt.price){
                var $choose = this.$dom.find('.btngroupLeft span.selected'),
                    choose = '';
                choose = $choose.hasClass('btnDiscount')?'discount':'price';
                console.log(choose);
                this.setLocalChoose(choose);
            }
		},
		show:function(opt){
			var self=this;
			this.opt={};
			$.extend(self.opt,opt);
			this.value="";
			if(self.opt.forgetpwd){
				// 忘记密码 show
				$("#maskBoard").find(".input_forget").show();
			}else{
				$("#maskBoard").find(".input_forget").hide();
			}
			if(self.opt.togglePhoneCode){
				$("#maskBoard").find(".toggleBox").show();
			}else{
				$("#maskBoard").find(".toggleBox").hide();
			}
			if(opt.$){//行内键盘
				opt.$.append($html);
				$html.off("vtouchstart").on("vtouchstart",".key,.rect",function(){
					var key=$(this).data("val");
					self.buttonpress(key);
				});
				this.$dom=opt.$;
				this.submitHide=false;
			}else{
				$.am.getActivePage().$.find("input:not([readonly='readonly']),textarea:not([readonly='readonly'])").not("[disabled='true']").attr("disabled",true).attr("isdisabled",1);
				$.am.getActivePage().$.find("[isdisabled=1]").each(function(){
					$(this).blur();
				});
				if(opt.onKeyup){
					this.$dom=$("#open_keyboard_box");
					var $keyboard=this.$dom.find(".open_keyboard");
					$keyboard.css({
						"left":this.opt.pos.x+"px",
						"top":this.opt.pos.y+"px"
					});
					if(opt.position){
						if(opt.position=="bottom"){
							this.$dom.find(".open_keyboard").addClass('bottom');
						}else if(opt.position=="top"){
							this.$dom.find(".open_keyboard").removeClass('bottom');
						}else{
							this.$dom.find(".open_keyboard").removeClass('bottom');
						}

					}else{
						this.$dom.find(".open_keyboard").removeClass('bottom');
					}
					if(opt.hidedot){
						this.$dom.find(".dot").hide();
					}else{
						this.$dom.find(".dot").show();
					}
					this.$dom.show();
					this.submitHide=false;
				}else{
					console.log(this.value)
					//默认this.isDiscount的初始值为false，默认是没有折扣的
					this.isDiscount = false;
					this.discountPrice = 0;
					this.$dom=$("#maskBoard");
					
                    if(opt.price){//带折扣的键盘逻辑——当show的时候传了price值时
                        var keyboardChoose = this.getLocalChoose();
                        console.log(keyboardChoose);
                        keyboardChoose && (opt.changekbtab = keyboardChoose == 'discount'? 0 : 1);
						this.isDiscount = true;
						this.setVal();
						//this.$dom.find(".input_value").text("");
						this.$dom.find(".input_value_help .num").text("");
						this.$dom.find(".prime_price").addClass('show');
						$('.btngroupLeft').show();
						this.$dom.find(".key,.rect").off("vtouchstart").on("vtouchstart",function(){
							var key=$(this).data("val");
							console.log(key)
							self.buttonpress(key);
						});
						this.$dom.find('.btnDiscount').on('vclick',function(){
							$(this).addClass('selected').siblings().removeClass('selected');
							self.$dom.find('.input_value_help').removeClass('hide');
							//self.$dom.find(".input_value").text("");
							self.$dom.find(".input_value_help .num").text("");
							self.isDiscount = true;
							self.value="";
							self.setVal();
						});
						this.$dom.find('.btnPrice').on('vclick',function(){
							$(this).addClass('selected').siblings().removeClass('selected');
							self.$dom.find('.input_value_help').addClass('hide');
							
							//self.$dom.find(".input_value").text("");
							self.$dom.find(".input_value_help .num").text("");
							self.isDiscount = false;
							self.value="";
							self.setVal();
						});
						this.$dom.find(".btnOk").off("vclick").on("vclick",function(){
							var notHide = false;
							if(self.isDiscount){
								if(opt.submit) notHide = opt.submit(self.discountPrice);
							}else{
								if(opt.submit) notHide = opt.submit(self.value);
							}
							!notHide && self.hide();
						});
						if(opt.changekbtab){
							this.$dom.find('.btnPrice').trigger('vclick');
						}else{
							this.$dom.find('.btnDiscount').trigger('vclick');
						}
						this.$dom.find(".mask,.cancel").off("vclick").on("vclick",function(){
							self.hide();
						});
						this.$dom.show();
					}else{
						$('.input_value_help').addClass('hide');
						$('.btngroupLeft').hide();
						this.$dom.find(".prime_price").removeClass('show');
						this.setVal();
						//this.$dom.find(".input_value").text("");
						this.$dom.find(".key,.rect").off("vtouchstart").on("vtouchstart",function(){
							var key=$(this).data("val");
							self.buttonpress(key);
						});
						this.$dom.find(".btnOk").off("vclick").on("vclick",function(){
							var notHide = false;
							if(opt.submit) notHide = opt.submit(self.value);
							!notHide && self.hide();
						});
						this.$dom.find(".mask,.cancel").off("vclick").on("vclick",function(){
							self.hide();
							self.opt.cancel && self.opt.cancel();
						});
					}
					if(opt.title){
						this.$dom.find(".title").text(opt.title);
					}else{
						this.$dom.find(".title").text("请输入数字");
					}
					if(opt.hidedot){
						this.$dom.find(".dot").hide();
					}else{
						this.$dom.find(".dot").show();
					}
					if(opt.inputType){//密文显示密码
						this.$dom.find(".input_value").empty().append('<input type="password"/>');
					}else{
						this.$dom.find(".input_value").empty();
					}
					//添加关闭按钮
					if(opt.hasOwnProperty('needPsw')){
						this.$dom.find(".title").append("<span class='close am-clickable'></span>");
						this.$dom.find(".close").off("vclick").on("vclick",function(){
							if(opt.needPsw){
								am.msg("您目前没有权限关闭，如果想关闭请联系管理员！");
							}
							else{
								self.hide();
								self.opt.cancel && self.opt.cancel();
							}
						});
						this.$dom.find(".mask,.cancel").off("vclick").on("vclick",function(){
							self.hide();
							if($.am.getActivePage().id=='page_searchMember'){
								setTimeout(function(){
									am.page.searchMember.showkeyboard();
								},300)
							}
						});
					}else {
						this.$dom.find(".title .close").remove();
					}
					this.$dom.show();
					this.submitHide=true;
				}

			}
		},
		getCode:function(phone,passwd){//发送短信获取密码
			var self = this;
			am.loading.show("正在获取,请稍候...");
			var opt = { phone: phone, shopId:am.metadata.userInfo.shopId,content:"尊敬的顾客您的会员卡密码是："+passwd};
			am.api.sendMemPwd.exec(opt, function(res) {
				am.loading.hide();
				if (res.code == 0) {
					am.msg("短信发送成功");
				}else{
					am.msg(res.message || "哎呀出错啦");
				}
			});
		},
        getLocalChoose:function(){//获取用户选择的是价格还是折扣 存的字段：keyboardChoose
            var keyboardChoose = localStorage.getItem('keyboardChoose');
            keyboardChoose && (keyboardChoose = JSON.parse(keyboardChoose));
            return keyboardChoose;
        },
        setLocalChoose:function(choice){
            localStorage.setItem('keyboardChoose',choice);
        },
	}
	$(function(){
		am.keyboard.init();
	})

})(jQuery);
// onKeyup,complete,pos,$,
//

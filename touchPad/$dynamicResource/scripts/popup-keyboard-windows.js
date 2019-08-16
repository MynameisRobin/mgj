(function () {
	if (navigator.userAgent.indexOf("Windows") !== -1 || navigator.userAgent.indexOf('Macintosh') !==-1) {
		$("body").addClass("windows").on("mouseover", ".am-clickable", function () {
			$(this).addClass("am-clickable-active");
		}).on("mouseleave", ".am-clickable", function () {
			$(this).removeClass("am-clickable-active");
		});

		$(window).resize(function () {
			var currentPage = $.am.getActivePage();
			if(currentPage){// fix bug --0015772
				if(currentPage.id=='page_pay'){
					am.page.pay.paytool.mix.scrollview.refresh();
					am.page.pay.paytool.mix.scrollview.scrollTo('top');
					return;
				}
				if(currentPage.id=='page_billRecord'){
					am.page.billRecord.watercourseScroll.refresh();
					am.page.billRecord.watercourseScroll.scrollTo('top');
					am.page.billRecord.facepayScroll.refresh();
					am.page.billRecord.facepayScroll.scrollTo('top');
					return;
				}
				if(currentPage.id=='page_itemPay'){
					return;
				}
			}
			window.location.reload();
		});

		$(function(){
			var allowKeyCode = [48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105,110,13,8];
			am.keyboard._show = am.keyboard.show;
			am.keyboard.show = function(opt){
				this._show(opt);
				if(!am.keyboard.$dom.find("div.input_value>input").length){
					this.$input = $('<input type='+ (opt.ciphertext?"password":"text") +' placeholder="在此输入" style="width:150px;height:45px;border:none;position: absolute;top:0;left:10px;font-size: 16px;color: #222;" />');
					am.keyboard.$dom.find("div.input_value")
						.css({position:"relative"})
						.html(this.$input);

					this.$input.blur(function(){
						if($(this).is(":visible")){
							$(this).focus();
						}
					}).keydown(function(evt){
						console.log(evt.keyCode);
						if(allowKeyCode.indexOf(evt.keyCode) == -1){
							return false;
						}
					}).keyup(function(evt){
						am.keyboard.value = $(this).val();
						if(!isNaN(am.keyboard.value)){
							am.keyboard.setVal();
							if(evt.keyCode == 13){
								am.keyboard.buttonpress("confirm");
							}
						}else{
							am.msg('请输入正确的数值！');
						}
					});
				}
				setTimeout(function(){
					am.keyboard.$dom.find('input').focus();
				},1);
			};
		});


		/*atMobile.nativeUIWidget.confirm({
			caption: caption,
			description: description,
			okCaption: okCaption,
			cancelCaption: cancelCaption
		}, scb, fcb);*/

		var confirmCtrl={
			init:function(){
				var $dom = $('<div class="nativeUIWidget-confirm"><div class="nUI-inner"><h1></h1><div class="nUI-content"></div><div class="nUI-buttonGroup"><div class="nUI-button"></div><div class="nUI-button"></div></div></div></div>');
				$dom.css({
					"position":"absolute",
					"left":0,
					"top":0,
					"bottom":0,
					"right":0,
					"z-index":1000,
					"background":"rgba(0,0,0,0.3)",
					"display":"-webkit-box",
					"-webkit-box-pack":"center",
					"-webkit-box-align":"center"
				}).children().css({
					"width":"90%",
					"max-width":"400px",
					"background":"#FFF",
					"border-radius":"4px",
					"font-size":"1.1rem"
				}).find("h1").css({
					"font-size":"1rem",
					"line-height":"3rem",
					"padding":"0 1rem",
					"color":"#555"
				});
				$dom.find(".nUI-content").css({
					"border-top":"1px solid #EEE",
					"border-bottom":"1px solid #EEE",
					"padding":"1rem",
				});
				$dom.find(".nUI-buttonGroup").css({
					"line-height":"3rem",
					"text-align":"center",
					"display":"-webkit-box",
					"width":"100%"
				});
				$dom.find(".nUI-buttonGroup").find('.nUI-button').eq(0).css({
					"border-right":"1px solid #EEE",
					"border-radius":"0 0 0 4px"
				}).next().css({
					"border-radius":"0 0 4px 0"
				});
				$("body").append($dom);
				$("body").append("<style>.nativeUIWidget-confirm .nUI-button{-webkit-box-flex: 1}.nativeUIWidget-confirm .nUI-button.am-clickable-active{background:#EEE}</style>");
				this.$ = $dom;
				this.$h=this.$.find("h1");
				this.$content = this.$.find('.nUI-content');
				var _this=this;
				this.$buttons = this.$.find('.nUI-button').vclick(function(){
					var i=$(this).index();
					_this.hide(i);
				});
			},
			show:function(opt){
				this.$.show();
				this.$h.html(opt.caption);
				this.$content.html(opt.description);
				this.$buttons.eq(0).text(opt.okCaption);
				this.$buttons.eq(1).text(opt.cancelCaption);
			},
			hide:function(i){
				this.$.hide();
				if(i){
					this.fcb && this.fcb();
				}else{
					this.scb && this.scb();
				}
			}
		};

		atMobile.nativeUIWidget.confirm = function(opt,scb,fcb){
			confirmCtrl.scb = scb;
			confirmCtrl.fcb = fcb;
			if(!confirmCtrl.$){
				confirmCtrl.init();
			}
			confirmCtrl.show(opt);
		}
	}
})();
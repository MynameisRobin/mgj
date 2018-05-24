(function () {
	if(atMobile && atMobile.nativeUIWidget){
		var obj={
			init:function () {
				var $dom = $('<div class="nativeUIWidget-showPopupMenu"><div class="inner"><h1></h1><div class="list"><ul></ul></div><div class="ok">确定</div><div class="cancel">返 回</div></div></div>');
				$dom.css({
					"position":"absolute",
					"left":0,
					"top":0,
					"bottom":0,
					"right":0,
					"background":"rgba(0,0,0,0.3)",
					"display":"-webkit-box",
					"-webkit-box-pack":"center",
					"-webkit-box-align":"center"
				}).children().css({
					"width":"90%",
					"max-width":"400px",
					"background":"#FFF",
					"border-radius":"4px",
					"position":"relative"
				}).find("h1").css({
					"font-size":"1rem",
					"line-height":"3rem",
					"padding":"0 1rem",
					"color":"#555"
				});
				$dom.find(".list").css({
					"max-height":"500px",
					"overflow":"hidden",
					"border-top":"1px solid #EEE"
				});
				$dom.find(".cancel").css({
					"line-height":"3rem",
					"text-align":"center",
					"border-top":"1px solid #EEE",
					"margin-top":"-1px"
				});
				$dom.find(".ok").css({
					"line-height":"3rem",
					"text-align":"center",
					"position":"absolute",
					"left":0,
					"bottom":0,
					"border-top":"1px solid #EEE",
					"border-right":"1px solid #EEE",
					"width":"50%"
				});
				$("body").append($dom).append("<style>.nativeUIWidget-showPopupMenu li.am-clickable-active{background:#EEE}</style>");
				this.$ = $dom;
				this.$h=this.$.find("h1");
				this.$ul=$dom.find("ul").on("vclick","li",function(){
					if(obj.muti){
						$(this).toggleClass('selected');
					}else{
						obj.hide($(this).index());
					}
				});
				this.sv = new $.am.ScrollView({
					$wrap : this.$ul.parent(),
					$inner : this.$ul,
					direction : [false, true],
					hasInput: false
				});
				this.$ok = this.$.find('div.ok').hide().vclick(function(){
					var idx = [];
					obj.$ul.find('li').each(function (i) {
						if($(this).hasClass("selected")){
							idx.push(i);
						}
					});
					obj.hide(idx);
				});
				this.$cancel = this.$.find("div.cancel").vclick(function(){
					obj.onCancel && obj.onCancel();
					obj.$.hide();
				});
			},
			show:function (opt) {
				this.$h.text(opt.title);
				this.$ul.empty();
				for(var i=0;i<opt.items.length;i++){
					this.$ul.append($('<li class="am-clickable">'+opt.items[i]+'</li>').css({
						"line-height":"1.8rem",
						"padding":"0.6rem 1rem",
						"border-bottom":"1px solid #EEE",
						"font-size":"1.1rem"
					}));
				}
				this.muti = opt.muti;
				if(this.muti){
					this.$ok.show();
					this.$cancel.css({'width':'50%',position:"relative",left:'50%'});
				}else{
					this.$ok.hide();
					this.$cancel.css({'width':'auto',position:"relative",left:'0'});
                }
                if(opt.cancel===null){
                    this.$cancel.hide();
                }else{
                    this.$cancel.show();
                }
				this.onCancel = opt.cancel;
				this.$.show();
				this.sv.refresh();
				this.sv.scrollTo("top");
			},
			hide:function (idx) {
				this.$.hide();
				this.cb && this.cb(idx);
			}
		};
		atMobile.nativeUIWidget.showPopupMenu = function (opt,cb) {
			obj.cb = cb;
			if(!obj.$){
				obj.init();
			}
			obj.show(opt);
		};
	}else{
		throw "atMobile.nativeUIWidget.showPopupMenu not ready!";
	}
})();
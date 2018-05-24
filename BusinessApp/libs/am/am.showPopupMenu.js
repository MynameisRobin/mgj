(function () {
	if(atMobile && atMobile.nativeUIWidget){
		var obj={
			init:function () {
				var $dom = $('<div class="nativeUIWidget-showPopupMenu"><div class="inner"><h1></h1><div class="list"><ul></ul></div><div class="cancel">返 回</div></div></div>');
				$dom.css({
					"position":"absolute",
					"left":0,
					"top":0,
					"bottom":0,
					"right":0,
					"background":"rgba(0,0,0,0.3)",
					// "display":"-webkit-box",
					// "-webkit-box-pack":"center",
					// "-webkit-box-align":"center"
				}).children().css({
					"position":"absolute",
					"top":"50%",
					"transform": "translate(0,-50%)",
					"-webkit-transform":"translate(0,-50%)",
					"left":"5%",
					"right":"5%",
					"width":"90%",
					"max-width":"400px",
					"background":"#FFF",
					"border-radius":"4px",
				}).find("h1").css({
					"font-size":"16px",
					"line-height":"48px",
					"padding":"0 16px",
					"color":"#555"
				});
				$dom.find(".list").css({
					"max-height":window.innerHeight*0.5+"px",
					"overflow":"hidden",
					"border-top":"1px solid #EEE",
					// "position":"absolute",
					// "top":"48px",
					// "bottom":"48px",
					// "left":"0px",
					// "right":"0px",
				});
				$dom.find(".cancel").css({
					// "position":"absolute",
					// "bottom":"0px",
					// "left":"0px",
					// "right":"0px",
					"line-height":"47px",
					"text-align":"center",
					"border-top":"1px solid #EEE",
					"margin-top":"-1px"
				});
				$("body").append($dom);
				$("body").append("<style>.nativeUIWidget-showPopupMenu li.am-clickable-active{background:#EEE}</style>");
				this.$ = $dom;
				this.$h=this.$.find("h1");
				this.$ul=$dom.find("ul").on("vclick","li",function(){
					obj.hide($(this).index());
				});
				this.sv = new $.am.ScrollView({
					$wrap : this.$ul.parent(),
					$inner : this.$ul,
					direction : [false, true],
					hasInput: false
				});
				this.$.find("div.cancel").vclick(function(){
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
				this.$.show();
				this.sv.refresh();
				this.sv.scrollTo("top");
			},
			hide:function (idx) {
				if(this.$){
					this.$.hide();
					this.cb && this.cb(idx);
				}
				
			}
		};
		atMobile.nativeUIWidget.showPopupMenu = function (opt,cb) {
			obj.cb = cb;
			if(!obj.$){
				obj.init();
			}
			obj.show(opt);
		};
		atMobile.nativeUIWidget.hidePopupMenu = function(){
			obj.hide();
		}
	}else{
		throw "atMobile.nativeUIWidget.showPopupMenu not ready!";
	}
})();
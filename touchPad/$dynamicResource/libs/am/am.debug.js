$.am.debug = {
	enable : false,
	init : function() {
		this.enable = (window.localStorage.getItem("WEIKEAPP_debug") == "open");

	},
	show : function() {
		var self = this;
		if (this.div) {
			return;
		}
		this.div = $('<div id="am-consolediv" class="am-clickable" style="word-break: break-all; position: absolute; z-index: 1000; background: rgba(0,0,0,0.5); width: 80%; height: 400px; top: 45px; right:0px; color: white; font-size: 9px; overflow-y: scroll;"></div>');
		this.div.click(function() {
			self.hide();
		});
		this.div.bind({
			"touchstart" : function(e) {
				e.stopPropagation();
			},
			"touchmove" : function(e) {
				e.stopPropagation();
			},
			"touchend" : function(e) {
				e.stopPropagation();
			}
		});
		$("body").append(this.div);
	},
	hide : function() {
		if (this.div) {
			this.div.remove();
			delete this.div;
		}
	},
	log : function(msg) {
		console.info(msg);
		if (!this.enable) {
			return false;
		}
		if (!this.div) {
			this.show();
		}
		var date = new Date();
		this.div.prepend("<div style='display:block;width: 100%; background:none; color: #fff; border:none;border-bottom:1px #eee solid;margin:0;word-break:break-all;'>" + date.getMinutes() + ":" + date.getSeconds() + " " + msg + "</div>");
	}
};


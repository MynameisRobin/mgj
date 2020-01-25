//创建am命名空间
window.$ && (window.$.am = {});
$.am.supports = {
	CSS3DTransform : ( typeof WebKitCSSMatrix != 'undefined' && new WebKitCSSMatrix().hasOwnProperty('m41'))
};
$.am.components = [];
$.am.Component = function(e) {
	if ($.am.apiReady) {
		this.componentInit && this.componentInit();
	}
};
$.am.use2d = false;
$.am.getInnerHeight = function() {
	var h = window.innerHeight;
	return h < 400 ? 400 : h;
};
//fix JSON.parse bug
JSON.originalParse = JSON.parse;
JSON.parse = function(text) {
	try {
		return text ? JSON.originalParse(text) : text;
	} catch(e) {
		return text;
	}
};

function parseDate(input, format) {
	if ( typeof input == "string") {
		var time = new Date(input.replace(/-/g, "/"));
	} else {
		var time = new Date(input);
	}

	return time;
}


//$ready事件做的事
$(function() {
	$(".am-widthLimite").show();
	//解决atmobile的100%为0的bug
	var lasth = 0;
	var lastt = new Date().getTime();
	var timer = setInterval(function() {
		var thish = window.innerHeight;
		var thist = new Date().getTime();
		if (thish > lasth) {
			$.am.debug.log(thish);
			$("body").css({
				width:window.innerWidth+'px',
				height:window.innerHeight+'px',
			});
			$("div.widthLimite").css({
				width:window.innerWidth+'px',
				height:window.innerHeight+'px',
			});
			/*$("div.am-widthLimite").css({
				"height":window.innerHeight+"px",
				"position":"relative"
			});*/
			lasth = thish;
			lastt = thist;
		}
		if (thist - lastt > 200) {
			$.am.debug.log("get height end");
			clearInterval(timer);
		}
	}, 100);
	//报错时打印到log
	window.onerror = function(msg, url, l) {
		$.am.debug.log(msg + "\n" + url + "\n" + l);
		monitor.addErrorMsg({
			msg: msg,
			url: url,
			line: l
		})
	};
	//解决触摸非input键盘不消失的问题
	$("body").bind("touchstart", function(e) {
		// $.am.debug.log("touches");
		if (!$(e.target).is("input") && !$(e.target).is("textarea")) {
			setTimeout(function() {
				$("input:focus, textarea:focus").blur();
			}, 100);
		}
	});

	document.body.addEventListener('touchmove', function (e) {
        e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
    }, {passive: false}); //passive 参数不能省略，用来兼容ios和android

	$.am.page && $.am.page.init();
	$.am.events && $.am.events.init();
	$.am.debug && $.am.debug.init();



	var html = "";
	html += '<div class="am-modalLoading" id="am-modalLoading">';
	html += '<div class="page-modalLoading-wrap">';
	html += '<div class="page-modalLoading-inner">';
	html += '<span class="loading"></span>';
	html += '<span class="text">请稍候...</span>';
	html += '</div>';
	html += '</div>';
	html += '</div>';

	$.am.modalLoading = {
		$ : $(html).appendTo("body"),
		show : function(text,area) {
			if(area){
				this.$.addClass('part').css(area);
			}else{
				this.$.removeClass('part').css({
					left:0,
					right:0,
					top:0,
					bottom:0,
					background:'none'
				});
			}
			this.$.find(".text").html(text || "请稍候...");
			this.$.show();
		},
		hide : function() {
			this.$.hide();
		}
	};

	var html = "";
	html += '<div class="am-partLoading" id="am-partLoading">';
	html += '<div class="page-partLoading-inner">';
	html += '<span class="loading"></span>';
	html += '<span class="text">请稍候...</span>';
	html += '</div>';
	html += '</div>';

	$.am.partLoading = {
		$ : $(html).appendTo("body"),
		show : function(text,area) {
			if(area){
				this.$.addClass('part').css(area);
			}else{
				this.$.removeClass('part').css({
					top:'10%',
					background:'none'
				});
			}
			this.$.find(".text").html(text || "请稍候...");
			this.$.show();
		},
		hide : function() {
			this.$.hide();
		}
	};

	var html = "";
	html += '<div class="am-instanceMessage">';
	html += '<span class="am-instanceMessage-inner"></span>';
	html += '</div>';
	$.am.instanceMessage = {
		$ : $(html).appendTo("body"),
		show : function(text, duration) {
			var self = this;
			if (this.tipTimer) {
				clearTimeout(this.tipTimer);
				delete this.tipTimer;
			}

			duration = duration || 3000;
			this.$.find(".am-instanceMessage-inner").html(text);
			this.$.show();
			this.tipTimer = setTimeout(function() {
				self.hide();
			}, duration);
		},
		hide : function(noFade) {
			if (noFade) {
				this.$.hide();
			} else {
				this.$.fadeOut(200);
			}
		}
	};

});

//api.ready做的事
document.addEventListener("deviceready", function() {

	$.am.elements && $.am.elements.init();

	for (var i = 0; i < $.am.components.length; i++) {
		$.am.components[i].componentInit && $.am.components[i].componentInit();
	}
	$.am.apiReady = true;
	for (var i in $.am.pages) {
		$.am.pages[i].init && $.am.pages[i].init();
	}
	//console.log($.am.init);
	$.am.init && $.am.init();
	//android上的返回按钮

	document.addEventListener("backbutton", onBackKeyDown, false);

	// $.am.debug.log("backbutton binded");
	function onBackKeyDown() {
		// Handle the back button
		var cPage = $.am.getActivePage();
		cPage.backButtonOnclick ? cPage.backButtonOnclick() : $.am.page.back();

		// $.am.debug.log("backbutton down");
	}


}, false);

(function($){
	var eventStorage = {};
	$.am.on=function(eventName,callback){
		if(!eventStorage[eventName]) eventStorage[eventName] = [];
		eventStorage[eventName].push(callback);
	}
	$.am.trigger=function(eventName,arguments){
		var callbacks = eventStorage[eventName];
		if(callbacks && callbacks.length){
			for(var i=0;i<callbacks.length;i++){
				try{
					callbacks[i](arguments);
				}catch(e){
					console.error(e);
				}
			}
		}
	}
	$.am.clear=function(eventName){
		delete eventStorage[eventName];
	}
})(jQuery);

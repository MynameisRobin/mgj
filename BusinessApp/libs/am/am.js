 //创建am命名空间
window.$ && (window.$.am = {});
$.am.supports = {
    CSS3DTransform: (typeof WebKitCSSMatrix != 'undefined' && new WebKitCSSMatrix().hasOwnProperty('m41'))
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
    } catch (e) {
        return text;
    }
};

function parseDate(input, format) {
    if (typeof input == "string") {
        var time = new Date(input.replace(/-/g, "/"));
    } else {
        var time = new Date(input);
    }

    return time;
}

$.am.checkScroll = function(getdevice){
    return 0;
    var deviceVersions = 0;
    try{
        deviceVersions = navigator.userAgent.match(/os\s+(\d+)/i)[1] - 0;
    }catch(e){
        $.am.debug.log(e.message);
    }
    if(deviceVersions>=11 && !getdevice){//ios
        $("body").height(window.innerHeight + 20);//重设高度  避免其他地方修改了  导致黑条继续存在
        setTimeout(function(){
            $.am.debug.log("滚动距离：" + scrollTop);
            var scrollTop = document.body.scrollTop;
            if(scrollTop<20){
                document.body.scrollTop = 20;
            }
        },100);
        
    }
    return deviceVersions;
}

//$ready事件做的事
$(function() {
    $(".am-widthLimite").show();
    var deviceVersions = $.am.checkScroll(true);
    //解决ios11 顶部状态栏问题
    if(deviceVersions<11){
        $("body").height(window.innerHeight);
    }else{
        $("body").height(window.innerHeight + 20);
        setTimeout(function(){
            document.body.scrollTop = 20;
        },0);
        
    }
    if(deviceVersions>=11){
        var blurTimer = null;
        document.onscroll = function(){
            $.am.checkScroll();
        };
        $(window).resize(function() {
            $.am.checkScroll();
        });
        $('body').on("touchend",function(e){
            if (!$(e.target).is("input") && !$(e.target).is("textarea")) {
                if(blurTimer){
                    clearTimeout(blurTimer);
                    blurTimer = null;
                }
                blurTimer = setTimeout(function() {
                    $("input:focus, textarea:focus").blur();
                }, 100);
            }
        });
    
        $("input,textarea").on("blur",function(){
            $.am.checkScroll();
        });
    }
    
    //end
    
    //解决atmobile的100%为0的bug
    // var lasth = 0;
    // var lastt = new Date().getTime();
    // var timer = setInterval(function() {
    // 	var thish = window.innerHeight;
    // 	var thist = new Date().getTime();
    // 	if (thish != lasth) {
    // 		$.am.debug.log(thish);
    // 		$("body").height(window.innerHeight);
    // 		lasth = thish;
    // 		lastt = thist;
    // 	}
    // 	if (thist - lastt > 1000) {
    // 		$.am.debug.log("get height end");
    // 		clearInterval(timer);
    // 	}
    // }, 100);
    //报错时打印到log
    window.onerror = function(msg, url, l) {
        $.am.debug.log(msg + "\n" + url + "\n" + l);
    };

    var timeController = function(fn,times){
        var timer   = null,
            time    = times || 100;
            
        return function(){
            if(timer){
                clearTimeout(timer);
                timer = null;
            }
            var args = Array.prototype.slice.call(arguments);
            timer = setTimeout(function(){
                fn.apply(null,args);
            },time);
        }
    }
    var touchTimer = timeController(function($temp){
        var $temp2 = $("input:focus, textarea:focus");
        $.am.debug.log("触焦表单2长度：" + $temp2.length);
        $.am.debug.log("进入失焦方法！");
        //$temp.prop("disabled",true);
        $temp.blur();
        $temp2.blur();
        setTimeout(function(){
            $temp.prop("disabled",false);
            $temp2.prop("disabled",false);
        },3000);
    },2000);

    //解决触摸非input键盘不消失的问题
    $("body").bind("touchstart", function(e) {
        //$.am.debug.log(e.target.tagName);
        if (!$(e.target).is("input") && !$(e.target).is("textarea")) {
            $("input:focus, textarea:focus").blur();
            // var $temp = $("input:focus, textarea:focus");
            // $.am.debug.log("触焦表单长度：" + $temp.length);
            // $temp.blur().prop("disabled",true);
            // touchTimer($temp);
        }
    });
    
    //阻止浏览器默认行为
    document.body.addEventListener('touchmove', function (e) {
        e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
    }, {passive: false}); //passive 参数不能省略，用来兼容ios和android


    $.am.page && $.am.page.init();
    $.am.events && $.am.events.init();
    $.am.debug && $.am.debug.init();



    var html = "";
    html += '<div class="am-modalLoading">';
    html += '<div class="page-modalLoading-wrap">';
    html += '<div class="page-modalLoading-inner">';
    html += '<span class="loading1"></span>';
    html += '<span class="loading2"></span>';
    html += '<span class="logo v4_tenantLogo"></span>';
    html += '<span class="text">请稍候...</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    $.am.modalLoading = {
        $: $(html).appendTo("body"),
        show: function(text) {
            this.$.find(".text").html(text || "请稍候...");
            this.$.show();
        },
        hide: function() {
            this.$.hide();
        }
    };

    var html = "";
    html += '<div class="am-instanceMessage">';
    html += '<span class="am-instanceMessage-inner"></span>';
    html += '</div>';
    $.am.instanceMessage = {
        $: $(html).appendTo("body"),
        show: function(text, duration) {
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
        hide: function(noFade) {
            if (noFade) {
                this.$.hide();
            } else {
                this.$.fadeOut(200);
            }
        }
    };

    var html = "";
    html += '<div class="am-modalLoadingHidden">';
    html += '</div>';
    $.am.modalLoadingHidden = {
        $: $(html).appendTo("body"),
        show: function(text) {
            this.$.show();
        },
        hide: function() {
            this.$.hide();
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

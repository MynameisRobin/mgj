/**
 * $.am.Page.js
 * @description  1.定义一个page对象
 *---------------------------------------------------------------------------
 * @ 目录:
 * 1. sns
 *
 *---------------------------------------------------------------------------
 * @version		0.1
 * @author		shu.wu@hp.com
 * @lastEdit		2012-7-4
 *
 */
(function(window, $) {
	/*requestAnimationFrame 兼容*/
    var animationFramelastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
	//alert("requestAnimationFrame:" + typeof(window.requestAnimationFrame));
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - animationFramelastTime));
        var id = window.setTimeout(function() {
            callback(currTime + timeToCall);
        }, timeToCall);
        animationFramelastTime = currTime + timeToCall;
        return id;
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
	/*requestAnimationFrame 兼容*/

	$.fn.setTransformPos = function(pos, d, hasInput) {
		//$("input:focus").blur();

		var opt;

		if (hasInput && $.am.use2d) {

			switch(d) {
				case "x":
					opt = 'translate(' + pos + 'px, 0)';
					// this.parent().scrollLeft(-pos)
					//this[0].style.left = pos+"px";
					break;
				case "y":
					opt = 'translate(0,' + pos + 'px)';
					// this.parent().scrollTop(-pos)
					// this[0].style.top = pos + "px";
					break;
				case "xy":
					opt = 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
					break;
			}
			this[0].style.transform = opt;
			this[0].style.webkitTransform = opt;
		} else {

			switch(d) {
				case "x":
					opt = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + pos + ', 0, 0, 1)';
					break;
				case "y":
					opt = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, ' + pos + ', 0, 1)';
					break;
				case "z":
					opt = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, ' + pos + ')';
					break;
				case "xy":
					opt = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + pos[0] + "," + pos[1] + ', 0, 1)';
					break;
			}
			this[0].style.transform = opt;
			this[0].style.webkitTransform = opt;
		}

		return this;
	};

	$.fn.animateTranslate3d = function(cPos, tPos, d, t, cb) {
		var tempPos = cPos,_this=this,startTS=0,l=tPos-cPos;
		var num = 0;
		var render =function(ts){
			if(ts){
				if(startTS){
					var cts = new Date().getTime()-startTS;
					if(cts>=t){
						//动画时间已大于总时间，END
						_this.setTransformPos(tPos, d);
						// $.am.debug.log("animate "+t+"ms -->"+ num+" frame");
						return 1;
					}else{
						tempPos = cPos + cts/t*l;
						_this.setTransformPos(tempPos, d);
					}
				}else{
					startTS=new Date().getTime();
				}
				num++;
			}
		};
		var animloop = function(ts){
			if(render(ts)){
				//console.log("ENT POS:"+tempPos+" TS:"+ts);
				if(cb) cb();
			}else{
			  requestAnimationFrame(animloop);
			}
		};
		animloop();
	};
	// $.fn.animateTranslate3d = function(cPos, tPos, d, t, cb) {
	// 	console.log(cPos+" | "+tPos+" | "+d+" | "+t);
	// 	var ot = new Date().getTime();
	// 	var _this = this;
	// 	this.doAnimateTranslate3d = function() {
	// 		var nt = new Date().getTime();
	// 		var step = nt - ot;
	// 		var nPos = cPos + (tPos - cPos) * step / t;
	// 		_this.setTransformPos(nPos, d);
	// 		if (step >= t) {
	// 			_this.setTransformPos(tPos, d);
	// 			//setTimeout(function(){
	// 			cb && cb();
	// 			//},300);
	// 		} else {
	// 			setTimeout(function() {
	// 				_this.doAnimateTranslate3d();
	// 			}, 10);
	// 		}
	// 	};
	// 	this.doAnimateTranslate3d();
	// };
	$.am.pages = {};
	//当前活动的page
	var activePage = null;
	//存放显示的page历史记录的堆栈
	$.am.history = [];
	$.am.getActivePage = function() {
		return activePage;
	};
	/**
	 * 1. Page类,用于创建一个Page对象
	 * @class
	 * @param [string]    opt.id
	 * @return [object]	 产生的Page对象
	 * @description  1.
	 *
	 * @example
	 */
	var Page = function(e) {

		// this.id = e.id;
		$.extend(this, e);
		$.am.pages[e.id] = this;
		$.am.components.push(this);
		$.am.Component.call(this, e);
	};
	Page.prototype = {
		componentInit : function() {
			var self = this;
			this.$ = $("#" + this.id);
			var $wrap = this.$.children(".am-body-wrap");
			var $inner = $wrap.children(".am-body-inner");
			if ($wrap.length && $inner.length) {
				this.scrollview = new $.am.ScrollView({
					$wrap : $wrap,
					$inner : $inner,
					direction : [false, !this.disableScroll],
					hasInput: this.hasInput
				});

				if (self.touchTop) {
				    $inner.prepend('<div class="am-drag top down" style="display:none"><span class="icon">T</span><span class="am-drag-text">' + (self.amDragTopTips[0]) + '</span></div>');

				    this.scrollview.touchTop = function (e) {
				        if (this.pauseTouchTop) {
				            return;
				        }
				        $.am.debug.log("touchTop:" + e);
				        if (e == 3) {
				            $.am.debug.log("loading Show:" + e);
				            $inner.find(".am-drag.top").removeClass("up").addClass("down").find(".am-drag-text").text(self.amDragTopTips[2]);
				            $inner.find(".am-drag.top").show().addClass("loading");
				            self.touchTop();

				            if(!this._originalMax){
				                this._originalMax = [this._max[0], this._max[1]];
				            }

				            this._currentPos = [0,55];
				            this._onupdate([0, 55]);
				        } else if (e == 2) {

				        } else if (e == 1) {
				            $inner.find(".am-drag.top").removeClass("down").addClass("up").find(".am-drag-text").text(self.amDragTopTips[1]);
				        }else {
				            $inner.find(".am-drag.top").show().removeClass("loading").removeClass("up").addClass("down").find(".am-drag-text").text(self.amDragTopTips[0]);
				        }
				    }
				}

				if (self.touchBottom) {
				    $inner.append('<div class="am-drag bottom up" style="display:none"><span class="icon">B</span><span class="am-drag-text">' + (self.amDragBottomTips[0]) + '</span></div>');

				    this.scrollview.touchBottom = function (e) {
				        if (this.pauseTouchBottom) {
				            return;
				        }
				        if (e == 3) {
				            $inner.find(".am-drag.bottom").removeClass("up").addClass("down").find(".am-drag-text").text(self.amDragBottomTips[2]);
				            $inner.find(".am-drag.bottom").show().addClass("loading");
				            self.touchBottom();

				            //this._currentPos = [0, this._min[1]-55];
				            //this._onupdate([0, this._min[1] - 55]);
				        } else if (e == 2) {

				        } else if (e == 1) {
				            $inner.find(".am-drag.bottom").removeClass("up").addClass("down").find(".am-drag-text").text(self.amDragBottomTips[1]);
				        } else {
				            $inner.find(".am-drag.bottom").show().removeClass("loading").removeClass("down").addClass("up").find(".am-drag-text").text(self.amDragBottomTips[0]);
				        }
				    }
				}
			}
			this.$header = this.$.children(".am-header");
			this.$footer = this.$.children(".am-footer");
			this.$body = this.$.children(".am-body-wrap");

			this.$backButton = this.$header.find(".am-backbutton");
			if (this.$backButton.length > 0) {
				this.$backButton.addClass("am-clickable").vclick(function() {
					self.backButtonOnclick ? self.backButtonOnclick() : $.am.page.back();
                    //android back bug
                    $('#share_cover').hide();
				});
			}

            if(this.onSlideBack){
                if(typeof(this.onSlideBack) == "function"){
                     this.bindBackEvt();
                }else{
                    throw "onSlideBack suppose to be a function,and return a Page object";
                }
            }
		},
		closeTopLoading: function () {
		    //$.am.debug.log("closeTopLoading:" + typeof (this.scrollview._originalMax));
            try{
                if (typeof (this.scrollview._originalMax) == "object") {
                    $.am.debug.log("GO");
                    this.scrollview._endPos = [this.scrollview._currentPos[0], this.scrollview._currentPos[1]];
                    this._speed = 0;
		            this.scrollview._max = [this.scrollview._originalMax[0], this.scrollview._originalMax[1]];
		            this.scrollview._originalMax = 0;
                    this.scrollview._startAnimation();
		            this.scrollview.$inner.find(".am-drag.top").hide();

		            $.am.debug.log("closeTopLoading: DONE!");

		        }
            } catch (e) {
                $.am.debug.log("ERROR:" + e);
            }
		},
		closeBottomLoading: function () {
		    if (this.scrollview._originalMin) {
		        //this.scrollview._endPos = [this.scrollview._min[0]-55, this.scrollview._min[1]-55];
		        this._speed = 0;
		        this.scrollview._min = [this.scrollview._originalMin[0], this.scrollview._originalMin[1]];
		        this.scrollview._originalMin = 0;
		        //this.scrollview._startAnimation();
		        this.scrollview.$inner.find(".am-drag.bottom").hide();
		    }
		},
		setBodyHeight : function(wh) {

			var h1 = 0;
			var h2 = 0;
			this.$body.prevAll(":visible").each(function() {
				var $this = $(this);
			    if ($(this).css("position") == "absolute") {
					return;
				}
				h1 += $(this).outerHeight(true);
			});
			// console.log("setBodyHeight", h1);
			this.$body.nextAll(":visible").each(function() {
				if ($(this).css("position") == "absolute" && !$(this).hasClass("am-placeholder")) {
					return;
				}
				h2 += $(this).outerHeight(true);
			});
			var $tab = $("div.am-tab.show");
			if ($tab.length>0) {
				h2 += $tab.outerHeight();
			}
			// console.log("setBodyHeight", h2);
			this.$body.css({
				"top" : h1,
				"bottom" : h2
			});

			var _this = this;
			this.scrollview && this.scrollview.refresh(function () {
			    if (_this.scrollview._currentPos[1] < _this.scrollview._min[1]) {
			        //try{
			        //    _this.scrollview._startAnimation();
			        //} catch (e) {
			            _this.scrollview.scrollTo("bottom");
			        //}
			    }
			});
		},
		changeToMe : function(animation, para) {
			$.am.changePage(this, animation, para);
		},
		refresh: function () {
		    // console.log("refresh");
			this.setBodyHeight($.am.getInnerHeight());
		},
		setStatus : function(status, text) {
			var $page = this.$.removeClass("am-status-loading am-status-error am-status-empty am-status-version");
			switch(status) {
				case "loading":
					$page.addClass("am-status-loading");
					break;
				case "error":
					$page.addClass("am-status-error");
					break;
				case "empty":
					$page.addClass("am-status-empty");
					break;
                case "version":
					$page.addClass("am-status-version");
					break;
				case "normal":
				default:

			}

		},
        bindBackEvt:function(){
            var start,
            totalWidth = window.innerWidth>500?500:window.innerWidth,
            _this=this,
            ts=0;
            if(this.scrollview) this.scrollview.bubble=true;
            this.$.addClass("am-touchable").bind({
                vtouchstart:function(evt,cor){
                    start = cor;
                    backing = 0;
                },
                vtouchmove:function(evt,cor){
                    var _x = cor.x - start.x;
                    if(backing){
                        //_this.$.setTransformPos(_x-totalWidth/5, "x");
                        //backing.$.show().setTransformPos(_x-totalWidth/5 - totalWidth, "x");
                        var mt = _x-totalWidth/10;
                        $.am.page.$app.setTransformPos(mt>0?mt:0, "x");
                    }else if(_x > totalWidth/10 && Math.abs(cor.y - start.y)/_x < 1/3){
                        console.log("trigger! Start Back Move");
                        backing = _this.onSlideBack();
                        if(backing && backing.$){
                            backing.$.show().setTransformPos(- totalWidth, "x");
                            ts = new Date().getTime();
                        }
                    }
                },
                vtouchend:function(evt,cor){
                    var _x = cor.x - start.x;
                    if(backing && ((_x-totalWidth/10 > totalWidth/4) || (new Date().getTime()-ts<300 && _x > totalWidth/5)) && Math.abs(cor.y - start.y)/_x < 1/3){
                        //console.log(_x,totalWidth/2);
                        backing._apppos = _x-totalWidth/10;
                        $.am.changePage(backing, "slideback", "back");
                        backing = 0;
                    }else if(backing){
                        var mt = _x-totalWidth/10;
                        $.am.page.$app.animateTranslate3d(mt>0?mt:0, 0, "x", 100, function() {
                            $.am.page.$app.setTransformPos(0, "x");
                            backing.$.hide().setTransformPos(5000, "x");
                            backing = 0;
                        });
                    }
                }
            });
        }
	};
	$.am.Page = Page;

	var showClassName, hideClassName, width, height, hideObj, animating = false, param ,backing;
	var afterPageShowCall = function(a, b,c) {
		setTimeout(function() {
			a.setBodyHeight(height);
			animating = false;
			a.backButtonClick && ($.am.backButtonClick = a.backButtonClick);
			b.$.css({
				"display" : "none"
			});
			if (b && typeof (b.afterHide) == 'function') {
				b.afterHide && b.afterHide();
			}
			if (a && typeof (a.afterShow) == 'function') {
				a.afterShow && a.afterShow(param);
			}
		}, c||200);
	};
	/**
	 * 显示Page
	 * @function
	 * @private
	 * @param e {jQuery} 需要显示的jQuery对象
	 * @param c {jQuery} 需要隐藏的jQuery对象
	 * @param p {boolean} 隐藏的方向
	 */
	var _showPage = function(e, c, p, cb,_apppos) {
		if (p == "l") {
			c.setTransformPos(0, "x");
			e.setTransformPos(width, "x");
			$.am.page.$app.animateTranslate3d(0, -width, "x", 200, function() {
				$.am.page.$app.setTransformPos(0, "x");
				e.setTransformPos(0, "x");
				c.setTransformPos(5000, "x");
				if(cb) cb();
			});
		} else if(p =="r") {
			c.setTransformPos(width, "x");
			$.am.page.$app.setTransformPos(-width, "x");
			$.am.page.$app.animateTranslate3d(-width, 0, "x", 200, function() {
				$.am.page.$app.setTransformPos(0, "x");
				c.setTransformPos(5000, "x");
				if(cb) cb();
			});
			e.setTransformPos(0, "x");
		}else{ //"b"
            console.log(e,e._apppos);
            //c.setTransformPos(width, "x");
            //$.am.page.$app.setTransformPos(-width, "x");
            $.am.page.$app.animateTranslate3d(_apppos, width, "x", 100, function() {
                $.am.page.$app.setTransformPos(0, "x");
                e.setTransformPos(0, "x");
                c.setTransformPos(5000, "x");
                if(cb) cb();
            });
            //e.setTransformPos(0, "x");
        }
	};
	/**
	 * ChangePage
	 *@function
	 *@param [object] obj     必须  需要显示的page对象
	 *@param [string] animate 可选  动画执行方式 [slideup / slidedown / slideleft / slideright]
	 *@return
	 *@description 1.
	 */
	$.am.changePage = function(obj, animate, para) {
		if (!activePage) {
			activePage = obj;
			obj.$.show().setTransformPos(0, "x");
			if (obj.beforeShow && typeof (obj.beforeShow) == 'function') {
			    obj.beforeShow(para);
			}
			obj.setBodyHeight($.am.getInnerHeight());
			if (obj.afterShow && typeof (obj.afterShow) == 'function') {
			    obj.afterShow(para);
			}
			return;
		}
		if (animating)
			return;
		if (obj == activePage)
			return;
		param = para;

		obj.$.show();
	    //call befor
		if (activePage && typeof (activePage.beforeHide) == 'function') {
		    if (activePage.beforeHide(obj)) {
		        obj.$.hide();
		        return;
		    }
		}
		if (obj.beforeShow && typeof (obj.beforeShow) == 'function') {
		    obj.beforeShow(param);
		}
		animating = true;
		width = $.am.page.$app.width();
		height = $.am.getInnerHeight();
		this.animateType = animate;
		//get the jQuery obj
		var $showPage = obj.$;
		var $hidePage = activePage ? activePage.$ : null;
        if(para=="back"){
            this.history.pop();
        }else{
            this.history.push(activePage);
            if(this.history.length>30){
                this.history.shift();
            }
        }

		//var isInHistory = this.history.indexOf(obj);
		//if (isInHistory != -1) {
		//	this.history.splice(isInHistory);
		//}
		// show
		if (!$hidePage) {
			$showPage.show();
		} else {
			//excuse animate
			switch (animate) {
                case 'slideup':
                    setTimeout(function () {
                        $showPage.css({
                            'z-index': '1'
                        });
                        $showPage.setTransformPos(0, "x");
                        $showPage.setTransformPos(height, "y");
                        $showPage.animateTranslate3d(height, 0, "y", 200, function () {
                            $showPage.css({
                                'z-index': '0'
                            });
                            $hidePage.setTransformPos(5000, "x");
                            afterPageShowCall(obj, hideObj);
                        });
                    }, 200);
                    break;
                case 'slidedown':
                    setTimeout(function () {
                        $showPage.setTransformPos(0, "x");
                        $hidePage.css({
                            'z-index': '1'
                        }).setTransformPos(0, "y").animateTranslate3d(0, height, "y", 200, function () {
                            $hidePage.setTransformPos(0, "y").setTransformPos(5000, "x");
                            afterPageShowCall(obj, hideObj);
                        });
                    }, 200);
                    break;
				case 'popup':
					setTimeout(function() {
						$showPage.css({
							'z-index' : '1'
						}).setTransformPos(0, "x").setTransformPos(100, "z").animateTranslate3d(100, 1, "z", 300, function() {
							$showPage.css({
								'z-index' : '0'
							});
							$hidePage.setTransformPos(5000, "x");
							afterPageShowCall(obj, hideObj);
						});
					}, 200);
					break;
				case 'popdown':
					setTimeout(function() {
						$hidePage.css({
							'z-index' : '1'
						}).setTransformPos(1, "z").animateTranslate3d(1, 100, "z", 300, function() {
							$hidePage.setTransformPos(1, "z").setTransformPos(5000, "x");
							afterPageShowCall(obj, hideObj);
						});
						$showPage.setTransformPos(0, "x");
					}, 200);
					break;
				case 'slideleft':
					setTimeout(function() {
						_showPage($showPage, $hidePage, "l", function() {
							afterPageShowCall(obj, hideObj);
						});
					}, 200);
					break;
				case 'slideright':
					setTimeout(function() {
						_showPage($showPage, $hidePage, "r", function() {
							afterPageShowCall(obj, hideObj);
						});
					}, 200);
					break;
                case 'slideback':
    					setTimeout(function() {
    						_showPage($showPage, $hidePage, "b", function() {
    							afterPageShowCall(obj, hideObj);
    						},obj._apppos);
    					}, 0);
    					break;
				default:
					$hidePage.setTransformPos(5000, "x");
					$showPage.setTransformPos(0, "x");
					obj.backButtonClick && ($.am.backButtonClick = obj.backButtonClick);
					//hideObj = activePage;
					//activePage = obj;
					afterPageShowCall(obj, activePage,1);
					break;
			}
		}
		//change activePage
		hideObj = activePage;
		activePage = obj;

	};

	$.am.page = {
		init : function() {
			this.$app = $("div.am-app");
			height = $.am.getInnerHeight();
		},
		back : function(animation,param) {
			animation = animation || "slideright";
			if ($.am.history.length > 0) {
				$.am.changePage($.am.history[$.am.history.length - 1], animation, param||"back");
				return true;
			}
			return false;
            ////android back bug
            //$('#share_cover').hide();
		}
	};
})(window, jQuery);

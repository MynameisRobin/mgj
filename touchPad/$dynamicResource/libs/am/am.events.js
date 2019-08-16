(function(w, $) {
	var setTextareaPointerEvents = function(value) {
		// var nodes = document.getElementsByTagName('input');
		// for (var i = 0; i < nodes.length; i++) {
		// nodes[i].style.pointerEvents = value;
		// }
	};
	//寻找target父元素中含有am-event的第一个元素
	var findEventElement = function($target, eventName) {
		if ($target.hasClass(eventName)) {
			return $target;
		}
		var ret = $target.parents("." + eventName + ":first");
		if (ret.length) {
			return ret;
		} else {
			return null;
		}
	};
	/*
	 var hideInput = function() {
	 $.am.debug.log("auto hideInput");
	 var field = document.getElementById('hdieKeyboard');
	 field.removeAttribute("disabled")
	 setTimeout(function() {
	 $.am.debug.log("auto focus");
	 field.focus();
	 setTimeout(function() {
	 $.am.debug.log("auto none");
	 field.style.display = "none"
	 setTimeout(function() {
	 $.am.debug.log("auto disabled");
	 field.style.display = "block";
	 field.blur();
	 // field.setAttribute("disabled", "disabled");
	 }, 5000)
	 }, 50)
	 }, 50)
	 }
	 */
	var _$slideTarget = null;
	var _$touchableTarget = null;
	var _$clickableTarget = null;
	var _touch = null;
	var _startTouch = null;
	var _clickTimer = null;
	var _isHovering = false;
	var _isClick = true;

	var _holdTimer = null;
	var _enableVclick = 1;

	var events = $.am.events = {
		init : function() {
			// setTextareaPointerEvents('none');

			if ("ontouchend" in document && !device2.windows()) {
				$(document).bind({
					touchstart : this.touchstart,
					touchmove : this.touchmove,
					touchend : this.touchend
				});
			/* } else if (window.navigator.msPointerEnabled && false) {

				$(document).bind({
					"MSPointerDown" : this.touchstart,
					"MSPointerMove" : this.touchmove,
					"MSPointerUp" : this.touchend
				});
 			*/
			}else{
				$(document).bind({
					"mousedown" : this.touchstart,
					"mousemove" : this.touchmove,
					"mouseup" : this.touchend
				});
			}
		},
		touchstart : function(e) {
			//onsole.log("touchstart", e.originalEvent.clientX, e.originalEvent.target);
			//e.preventDefault();
			// setTextareaPointerEvents('auto');
			if (_$touchableTarget || _$clickableTarget) {
				return;
			}
			//处理touchable
			var touches = e.originalEvent.touches || e.originalEvent.targetTouches;
			if (!touches) {
				touches = [{
					identifier : 1,
					clientX : e.originalEvent.clientX,
					clientY : e.originalEvent.clientY,
					target : e.originalEvent.target
				}];
			}
			var touch = touches[0];

			// var touchableTarget = findEventElement($(touch.target), "touchable");
			// var clickableTarget = findEventElement($(touch.target), "clickable");

			//查找最近的元素
			var $target = $(touch.target);
			_$touchableTarget = findEventElement($target, "am-touchable");
			_$clickableTarget = findEventElement($target, "am-clickable");
			_$slideTarget = findEventElement($target, "am-slideable");
			//自动关键盘
			/*
			var focus = $("input:focus");
			if (focus.length && touch.target != focus[0]) {
			focus.blur();
			if (window.device && window.device.platform == "Android") {
			hideInput();
			} else {
			}
			}
			*/

			//console.log(e, _$touchableTarget, _$clickableTarget);
			//如果都不存在就退出
			if (!_$touchableTarget && !_$clickableTarget) {
				return;
			}

			_startTouch = _touch = $.extend({}, touch);

			if (_$touchableTarget) {
				_$touchableTarget.trigger("vtouchstart", {
					x : _touch.clientX,
					y : _touch.clientY
				});
			}
			if (_$clickableTarget) {
				// console.log("_clickTimer", _$clickableTarget);
				_clickTimer = setTimeout(function() {

					if (!_$clickableTarget.hasClass("am-disabled")) {
						_$clickableTarget.trigger("vhover").addClass("am-clickable-active");
						_holdTimer = setTimeout(function() {
							_$clickableTarget.trigger("vhold");
							_enableVclick = 0;
						}, 1000)
					}
					_isHovering = true;
					_clickTimer = null;
				}, 50);
			}
		},
		touchmove : function(e) {
			e.preventDefault();
			// setTextareaPointerEvents('none');

			if (!_$touchableTarget && !_$clickableTarget) {
				return;
			}
			var touches = e.originalEvent.touches;

			if (!touches) {
				touches = [{
					identifier : 1,
					clientX : e.originalEvent.clientX,
					clientY : e.originalEvent.clientY,
					target : e.originalEvent.target
				}];
			}

			var touch = null;
			for (var i = 0; i < touches.length; i++) {
				var touch = touches[i];
				// console.log((touch == _touch))
				if (touch.identifier == _touch.identifier && (touch.clientX != _touch.clientX || touch.clientY != _touch.clientY)) {
					_touch = $.extend({}, touch);

					if (_$touchableTarget) {
						_$touchableTarget.trigger("vtouchmove", {
							x : _touch.clientX,
							y : _touch.clientY
						});
					}
					//console.log("touchmove", touch, touch.clientY - _startTouch.clientY);
					//$.am.debug.log("touchmove" + (touch, touch.clientY +" "+ _startTouch.clientY));
					if (_$clickableTarget && (Math.abs(touch.clientX - _startTouch.clientX) >= 15 || Math.abs(touch.clientY - _startTouch.clientY) >= 15)) {
						if (_isHovering) {
							_isHovering = false;
							// console.log("vblur", touch.clientY)
							_$clickableTarget.trigger("vblur").removeClass("am-clickable-active");
							clearTimeout(_holdTimer);
							_holdTimer = null;
							_enableVclick = 1;
						}
						_isClick = false;
						clearTimeout(_clickTimer);
						_clickTimer = null;
					}

				}
			}
		},
		touchend : function(e) {
			//console.log("touchend", e.originalEvent.clientX, e.originalEvent.clientY);
			//$.am.debug.log("touchend");
			// e.preventDefault();
			// setTimeout(function() {
			// setTextareaPointerEvents('none');
			// }, 0);

		    if (!_$touchableTarget && !_$clickableTarget && !_$slideTarget) {
				return;
			}
			var touches = e.originalEvent.touches;
			if (!touches) {
				touches = [{
					clientX : e.originalEvent.clientX,
					clientY : e.originalEvent.clientY,
					target : e.originalEvent.target
				}];
			}

			for (var i = 0; i < touches.length; i++) {
				var touch = touches[i];
				if (touch.identifier == _touch.identifier) {
					return;
				}
			}

			if (_$touchableTarget) {
				_$touchableTarget.trigger("vtouchend", {
					x : _touch.clientX,
					y : _touch.clientY
				});
			}
			if (_$clickableTarget) {
				if (_isHovering) {
					_isHovering = false;
					_$clickableTarget.trigger("vblur").removeClass("am-clickable-active");
					if (_holdTimer != null) {
						clearTimeout(_holdTimer);
						_holdTimer = null;
					}
					if (_enableVclick && !_$clickableTarget.hasClass("am-disabled")) {
						_$clickableTarget.trigger("vclick");
						if(window.amClickAudio) {
							amClickAudio.currentTime = 0;
							window.amClickAudio.play();
						}
					}
					_enableVclick = 1;

				} else if (_isClick) {
					var $target = _$clickableTarget;
					// console.log("touchstart", _$clickableTarget);
					if (!$target.hasClass("am-disabled")) {
						$target.trigger("vhover").addClass("am-clickable-active");
					}
					setTimeout(function() {
						$target.trigger("vblur");
						if (!$target.hasClass("am-disabled")) {
							$target.trigger("vclick");
							if(window.amClickAudio) {
								amClickAudio.currentTime = 0;
								window.amClickAudio.play();
							}
						}
					}, 1);
					setTimeout(function(){
						$target.removeClass("am-clickable-active");
					},300);
				}
				clearTimeout(_clickTimer);
				_clickTimer = null;
			}

			if (_$slideTarget && Math.abs(_touch.clientY - _startTouch.clientY) < _$slideTarget.height()) {
			    var _move = _touch.clientX - _startTouch.clientX;
			    var _max = _$slideTarget.width() / 3;
			    if (_move > _max) {
			        _$slideTarget.trigger("slideright");
			    } else if (_move < -_max) {
			        _$slideTarget.trigger("slideleft");
			    }
			}

			_$touchableTarget = _$clickableTarget = _touch = _$slideTarget = null;
			_isClick = true;
		}
	};

	$.fn.vclick = function(cb) {
		this.addClass("am-clickable").bind("vclick", cb);
		return this;
	};
})(window, jQuery);

//绑定Document事件
//根据Target寻找

//vtouchstart
//vtouchmove
//vtouchend

//vhover
//vblur
//vclick

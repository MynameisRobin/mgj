(function(window, $) {
	/**
	 * 1. Carrousel类,用于创建一个Carrousel对象
	 * @class
	 * @param [string]    	opt.id			必需						Carrousel控件ID
	 * @param [int]			opt.height		必需						控件高度
	 * @param [int]			opt.width  		可选		默认100%			控件宽度
	 * @param [int]			opt.visible		可选  	默认1			显示区包含的item的个数
	 * @param [int]			opt.time		可选  	默认300ms		回弹时间
	 * @param [function]		opt.onchange	可选
	 * @param [function]		opt.autoSwitch	可选 	默认10s,0disable	自动切换

	 * @return [object]	 产生的Carrousel对象
	 * @description  1.
	 *
	 * @example
	 */
	var Carrousel = function(opt) {
		this.id = opt.id;
		this.width = opt.width;
		this.visible = opt.visible || 1;
		this.height = opt.height;
		this.time = opt.time || 200;
		this.onchange = opt.onchange;
		this.current = 0;
		this.autoSwitch = typeof (opt.autoSwitch) == "undefined" ? 5000 : opt.autoSwitch;
		$.am.components.push(this);
		$.am.Component.call(this, opt);
	};
	Carrousel.prototype = {
		componentInit : function() {
            if ( typeof this.id == "string") {
                this.$ = $("#" + this.id).addClass("am-touchable");
            } else {
                this.$ = this.id.addClass("am-touchable");
            }
			this.$inner = this.$.children(".am-carrousel-inner");
			var cssSet = {};
			if (this.width) {
				cssSet.width = this.width + "px";
			}
			cssSet.height = this.height + "px";
			this.$.css(cssSet);

			var _this = this,startPos;
			this.$.bind({
				"vtouchstart" : function(event, position) {
					if (_this.$items){
                        startPos= position;
						_this.start(position.x);
                    }
					//return false;
				},
				"vtouchmove" : function(event, position) {
					if (_this.$items && Math.abs(position.x - startPos.x) > Math.abs(position.y - startPos.y)){
                        _this.move(position.x);
                        return false;
                    }
					//return false;
				},
				"vtouchend" : function(event, position) {
					if (_this.$items && Math.abs(position.x - startPos.x) > Math.abs(position.y - startPos.y)){
						_this.end(position.x);
					    return false;
                    }
				}
			});
		},
		refresh : function() {
		    var w = this._itemw = (this.width || (window.innerWidth > 500 ? 500 : window.innerWidth)) / this.visible, h = this.height;
			this.$items = this.$inner.children();
			if (this.$items.length < 1) {
				return;
			}

			this.$inner.css({
				width : w * this.$items.length + "px"
			});
			this.$items.each(function() {
				$(this).css({
					'width' : w + "px",
					'height' : h + "px",
					'float' : "left"
				}).addClass("imgBg");
			});
			this.nPos = 0;
			this.current = 0;
			this.show(0);
		},
		start: function (e) {
		    $.am.debug.log("touch start");
			this.carrouselTimer && clearTimeout(this.carrouselTimer);
			this.startPos = e;
			this.startTime = new Date().getTime();
		},
		move : function(e) {
			if (e - this.startPos > this.current * this._itemw)
				return;
			if (e - this.startPos < -(this.$items.length - this.current - this.visible) * this._itemw)
				return;
			this.endPos = e;
			var m = this.endPos - this.startPos;
			this.nPos = -this._itemw * this.current + m;
			this.$inner.setTransformPos(this.nPos, "x");
		},
		end: function () {
		    $.am.debug.log("touch end");
			var m = this.endPos - this.startPos;
			var duration = new Date().getTime() - this.startTime;
			var speed = m / duration;
			// console.log(speed);
			if (m && ((m > this._itemw / 2) || speed > 0.6)) {
				var i = Math.ceil(m / this._itemw);
				this.show(this.current - i);
			} else if (m && (m < -this._itemw / 2 || speed < -0.6)) {
				var i = Math.ceil(Math.abs(m) / this._itemw);
				this.show(this.current + i);
			} else{
				this.show(this.current);
			}
			this.endPos = 'undefined';
		},
		show: function (i) {
		    //$.am.debug.log("carrousel show");
			if (this.$items.length < 1) {
				return;
			}
			this.current = i;
			if (i < 0) {
				this.current = 0;
			}
			if (i >= this.$items.length - this.visible) {
				this.current = this.$items.length - this.visible;
			}
			var _this = this;
			this.$inner.animateTranslate3d(this.nPos, -this._itemw * this.current, "x", this.time, function() {
				_this.nPos = -_this._itemw * _this.current;
				_this.onchange && _this.onchange(_this.current);
			});

			this.carrouselTimer && clearTimeout(this.carrouselTimer);
			if (this.autoSwitch != 0) {
				this.carrouselTimer = setTimeout(function() {
					// console.log("auto move:"+ (_this.current+1));
					_this.show(i >= _this.$items.length - _this.visible ? 0 : _this.current + 1);
				}, this.autoSwitch);
			}
		}
	};
	$.am.Carrousel = Carrousel;

})(window, jQuery);

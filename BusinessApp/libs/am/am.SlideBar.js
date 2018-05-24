(function(window, $) {
	/**
	 *
	 */

	var SlideBar = function(e) {

		// this.id = e.id;
		$.extend(this, e);
		$.am.components.push(this);
		$.am.Component.call(this, e);
	};
	SlideBar.prototype = {
		componentInit : function() {
			var self = this;
			this.$ = $("#" + this.id);
			this.$inner = this.$.children(".am-slideBar-inner");

			this.$.vclick(function() {
				if (self.disableQuickClose) {
					return false;
				}
				self.hide();
			});

			this.$inner.vclick(function() {
				return false;
			});

			this.init && this.init();
		},
		show : function(paras) {
			var self = this;
			this.beforeShow && this.beforeShow(paras);

			this.$inner.setTransformPos(-this.width, "x");
			this.$.show();

			var cPage = $.am.getActivePage();

			if (cPage) {
				this.lPage = cPage;
				this.backButtonOnclick = cPage.backButtonOnclick;
				cPage.backButtonOnclick = function() {
					if (self.disableQuickClose) {
						return false;
					}
					self.hide();
				};
			}

			var duration = this.duration || 100;
			var st = new Date().getTime();
			var timer = null;
			var step = function() {
				var d = new Date().getTime() - st;
				//console.log(d, self.width * (1 - d / duration));
				if (d >= duration) {
					self.$inner.setTransformPos(0, "x");
					self.afterShow && self.afterShow(paras);
				} else {
					self.$inner.setTransformPos(-self.width * (1 - d / duration), "x");
					timer = setTimeout(function() {
						step();
					}, 10);
				}
			};
			step();

			return this;
		},
		hide : function(noAnimation) {
			var self = this;
			this.beforeHide && this.beforeHide();

			if (noAnimation) {
				var duration = 0;
			} else {
				var duration = this.duration || 100;
			}
			var st = new Date().getTime();
			var timer = null;
			var step = function() {
				var d = new Date().getTime() - st;
				//console.log(d, self.width * (1 - d / duration));
				if (d >= duration) {
					self.$inner.setTransformPos(-self.width, "x");
					self.$.hide();

					var cPage = $.am.getActivePage();
					if (cPage && self.lPage == cPage) {
						cPage.backButtonOnclick = self.backButtonOnclick;
						self.backButtonOnclick = null;
					}
					self.afterHide && self.afterHide();

				} else {
					self.$inner.setTransformPos(-self.width * d / duration, "x");
					timer = setTimeout(function() {
						step();
					}, 10);
				}
			};
			step();

			return this;
		},
	};
	$.am.SlideBar = SlideBar;

})(window, jQuery);


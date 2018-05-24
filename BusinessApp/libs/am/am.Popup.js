(function(window, $) {
	/**
	 *
	 */
	$.am.tabs = {};

	var Popup = function(e) {

		// this.id = e.id;
		$.extend(this, e);
		$.am.components.push(this);
		$.am.Component.call(this, e);
	};
	Popup.prototype = {
		componentInit : function() {
			var self = this;
			this.$ = $("#" + this.id);

			this.$.vclick(function() {
				if (self.disableQuickClose) {
					return false;
				}
				self.hide();
			});

			this.$.children(".am-popup-inner").vclick(function() {
				if (self.enableInnerClose) {
					return;
				}
				return false;
			});

			this.init && this.init();
		},
		show : function(paras) {
			var self = this;
			this.beforeShow && this.beforeShow(paras);
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

			return this;
		},
		hide : function(paras) {
			this.beforeHide && this.beforeHide(paras);
			this.$.hide();

			var cPage = $.am.getActivePage();
			if (cPage && this.lPage == cPage) {
				cPage.backButtonOnclick = this.backButtonOnclick;
				this.backButtonOnclick = null;
			}
			return this;
		},
	};
	$.am.Popup = Popup;

})(window, jQuery);


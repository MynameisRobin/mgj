(function(window, $) {
	/**
	 *
	 */
	$.am.tabs = {};

	var Tab = function(e) {

		// this.id = e.id;
		$.extend(this, e);
		$.am.tabs[e.id] = this;
		$.am.components.push(this);
		$.am.Component.call(this, e);

		this.$app = $(".am-app");
		this._$   = $("#" + e.id);
		this.$scrollView = new $.am.ScrollView({
			$wrap: this._$.find('.tab_box'),
			$inner: this._$.find('.tab_box ul'),
			direction: [false, true],
			hasInput: false,
			bubble:true
		});
		
	};
	Tab.prototype = {
		componentInit : function() {
			var self = this;
			this.$ = $("#" + this.id);
			this._$items = this.$.find("li").vclick(function() {
				var idx = self._$items.index(this);
				if (self.items[idx].onclick.call(this)) {
					self.select(idx);
				}
			});
		},
		_show : function() {
			this.$.addClass("show");
			return this;
		},
		_hide : function() {
			//this.$.hide();
			this.$.removeClass("show");
			return this;
		},
		show : function() {
			$.am.tab.changeTab(this);
			this.$scrollView.refresh();
			return this;
		},
		hide : function() {
			this._hide();
		},
		select : function(idx) {
			this._$items.removeClass("selected");
			if (idx >= 0) {
				this._idx = idx;
				this._$items.eq(idx).addClass('selected');
			}
			return this;
		},
		disable : function(idx) {
			if (idx >= 0) {
				this._$items.eq(idx).addClass('am-disabled');
			}
			return this;
		},
		enable : function(idx) {
			if (idx >= 0) {
				this._$items.eq(idx).removeClass('am-disabled');
			} else {
				this._$items.removeClass('am-disabled');
			}
			return this;
		},
		setTitle : function(idx, title) {
			if (idx >= 0 && typeof title == "string") {
				this._$items.eq(idx).find("span").html(title);
			}
			return this;
		},
		setBadge : function(idx, n) {
			if (idx >= 0) {
				if (n == "dot") {
					this._$items.eq(idx).find(".num").html("").addClass("redDot").show();
				} else if (n != null) {
					this._$items.eq(idx).find(".num").html(n).removeClass("redDot").show();
				} else {
					this._$items.eq(idx).find(".num").html(n).removeClass("redDot").hide();
				}
			}
			return this;
		}
	};
	$.am.Tab = Tab;
	$.am.tab = {
		changeTab : function(id, showOther) {
			var tabs = $.am.tabs;
			if (!showOther) {
				for (i in tabs) {
					if (!tabs[i].alwaysShow) {
						tabs[i]._hide();
					}
				}
			}
			if (id) {
				id._show();
			}
		},
		hideAll : function() {
			this.changeTab();
		}
	};

})(window, jQuery);

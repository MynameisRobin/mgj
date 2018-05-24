(function(window, $) {

	var FootBar = function(e) {

		// this.id = e.id;
		$.extend(this, e);
		$.am.tabs[e.id] = this;
		$.am.components.push(this);
		$.am.Component.call(this, e);
	}
	FootBar.prototype = {
		componentInit : function() {
			var self = this;
			this.$ = $("#" + this.id);
			this._$items = this.$.find("ul").delegate("li", "vclick", function() {
				var idx = self._$items.find("li").index(this);
				self.items[idx].onclick();
			})
			this.$.find(".am-footBar-more").vclick(function() {
				self.toggle();
			})
		},
		_show : function() {
		    this.$.show();
		    this.$.removeClass('am-footBar-hide');
			return this;
		},
		_hide : function() {
			this.$.hide();
			return this;
		},
		show : function() {
			$.am.tab.changeTab(this);
			return this;
		},
		disable : function(idx) {
			if (idx >= 0) {
				this._$items.find("li").eq(idx).addClass('am-disabled');
			}
			return this;
		},
		enable : function(idx) {
			if (idx >= 0) {
				this._$items.find("li").eq(idx).removeClass('am-disabled');
			} else {
				this._$items.find("li").removeClass('am-disabled');
			}
			return this;
		},
		toggle : function() {
			this.$.toggleClass('am-footBar-hide');
			$.am.getActivePage().refresh();
		},
		showText : function() {
			this.$.removeClass('am-footBar-hide');
			$.am.getActivePage().refresh();
		},
		hideText : function() {
			this.$.addClass('am-footBar-hide');
			$.am.getActivePage().refresh();
		}
	}
	$.am.FootBar = FootBar;

})(window, jQuery)


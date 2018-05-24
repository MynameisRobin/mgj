(function() {
	var self = (amGloble.page.createMsgPlate = new $.am.Page({
		id: 'page-createMsgPlate',
		init: function() {
			this.$closeBtn = this.$.find('.shutdown').vclick(function() {
				$.am.changePage(amGloble.page.customerMessage, 'slidedown', 'back');
			});
		},
		beforeShow: function(para) {},
		afterShow: function(para) {},
		beforeHide: function() {},
		afterHide: function() {},
		render: function(data) {}
	}));
})();

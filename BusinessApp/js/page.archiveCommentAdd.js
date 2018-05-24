(function() {
	var self = amGloble.page.archiveCommentAdd = new $.am.Page({
		id : "page_archiveCommentAdd",
		disableScroll : true,
		backButtonOnclick : function() {
			$.am.page.back("slidedown");
		},
		init : function() {
			var self = this;

			this.$textarea = this.$.find("textarea");
			this.$submit = this.$.find(".page_button.submit").vclick(function() {
				self.submit();
			});
			this.$textarea.attr("disabled", true);
		},
		beforeShow : function(paras) {
			amGloble.tab.main.hide();
			this.data = paras.data;
			this.scb = paras.scb;
			this.$textarea.val("");
		},
		afterShow : function() {
			this.$textarea.removeAttr("disabled");
		},
		beforeHide : function() {
			this.$textarea.attr("disabled", true);
		},
		submit : function() {
			var self = this;
			var text = this.$textarea.val();
			if (!$.trim(text)) {
				amGloble.msg("请输入点评内容");
				return;
			}

			amGloble.loading.show();
			amGloble.api.invention_evaluate.exec({
				inventionId : this.data.id,
				token : amGloble.token,
				content : text
			}, function(ret) {
				amGloble.loading.hide();
				if (ret.code == 0) {
					console.log(ret);
					self.backButtonOnclick();
					self.scb && self.scb(ret.content);
					amGloble.msg("评论提交成功!");
				} else {
					amGloble.msg(ret.message || "数据提交失败,请检查网络!");
				}
			});
		}
	});
})();


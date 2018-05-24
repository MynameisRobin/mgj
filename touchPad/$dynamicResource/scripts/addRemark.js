am.addRemark = {
	init:function () {
		var _this=this;
		this.$ = $("#common_addremark");
		this.$.find('.addremark_model_mask').vclick(function () {
			_this.$.hide();
		});
		this.$textarea = this.$.find('textarea');
		this.$.find('.save_btn').vclick(function () {
			var val = _this.$textarea.val();
			if(!val){
				// am.msg('请输入备注内容！');
			}
			_this.cb(val);
			_this.$.hide();
		});
		this.$.find('.cancel_btn,.right_btn').vclick(function () {
			_this.$.hide();
		});
	},
	show:function (opt){
		if(!this.$){
			this.init();
		}
		this.maxlength = opt.maxlength || 20;
		this.$textarea.prop('maxlength',this.maxlength);
		this.$textarea.prop('placeholder','请输入1-'+this.maxlength+'个字符备注内容');
		this.$textarea.val(opt.value || "");
		this.$.show();
		this.cb = opt.cb;
		this.$textarea.focus();
	}
};
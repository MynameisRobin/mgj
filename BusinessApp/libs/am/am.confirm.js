(function () {
    var _html = ['<div class="am_comfirm">',
        '<div class="am_confirm_box">',
            '<div class="c_content">内容</div>',
            '<div class="c_btn_group">',
                '<span class="ok_btn am-clickable">确定</span>',
                '<span class="cancel_btn am-clickable">取消</span>',
            '</div>',
        '</div>',
    '</div>'];
	if(atMobile && atMobile.nativeUIWidget){
		var obj={
            init:function(){
                var _this = this;
                this.$    = $(_html.join(""));

                // this.$header   = this.$.find(".c_header");
                this.$okBtn    = this.$.find(".ok_btn");
                this.$cancelBtn= this.$.find(".cancel_btn");
                this.$content  = this.$.find(".c_content"); 

                this.$okBtn.vclick(function(){
                    _this.hide();
                    _this.cb && _this.cb();
                });
                this.$cancelBtn.vclick(function(){
                    _this.hide();
                    _this.scb && _this.scb();
                });

                $('body').append(this.$);
            },
            show:function(opt,cb,scb){
                // this.$header.html(opt.caption || "提示");
                this.$content.html(opt.description || opt.caption || "");
                this.$okBtn.html(opt.okCaption || "确定");
                this.$cancelBtn.html(opt.cancelCaption || "取消");
                this.cb  = cb;
                this.scb = scb; 
                this.$.show();
            },
            hide:function(){
                this.$.hide();
            }
		};
		atMobile.nativeUIWidget.confirm = function (opt,cb,scb) {
			if(!obj.$){
				obj.init();
			}
			obj.show(opt,cb,scb);
		};
	}else{
		throw "atMobile.nativeUIWidget.confirm not ready!";
	}
})();
am.comboItemSet = {
	init:function(){
		var _this=this;
		this.$ = $("#comboItemSet");
		this.$c = this.$.find(".scroller").on('vclick','li',function () {
			$(this).toggleClass("checked");
		}).on('vclick','.itemTypeName',function () {
			var $this = $(this);
			if($this.hasClass("checked")){
				$this.removeClass("checked");
				$this.next().find("li").removeClass("checked");
			}else{
				$this.addClass("checked");
				$this.next().find("li").addClass("checked");
			}
		});
		this.$.find(".ok").vclick(function(){
			_this.submit();
		});
		this.$.find(".cancel").vclick(function(){
			_this.hide();
		});

		var data = am.metadata.classes;
		for(var i=0;i<data.length;i++){
			var $type = $('<div class="itemType"><div class="itemTypeName checkbox am-clickable">'+data[i].name+'</div><ul></ul></div>');
			var $ul = $type.find("ul");
			for(var j=0;j<data[i].sub.length;j++){
				var $li = $('<li class="checkbox am-clickable" itemid="'+data[i].sub[j].itemid+'"></li>');
				$li.text(data[i].sub[j].itemid+' '+data[i].sub[j].name);
				$li.data('data',data[i].sub[j]);
				$ul.append($li);
			}
			this.$c.append($type);
		}

		this.scroller = new $.am.ScrollView({
			$wrap: this.$c.parent(),
			$inner: this.$c,
			direction: [false, true],
			hasInput: false,
			bubble:0
		});
	},
	show:function(opt,cb){
		if(!this.$){
			this.init();
		}
		this.$.find('li.checked').removeClass("checked");
		if(opt.ids){
			for(var i=0;i<opt.ids.length;i++){
				this.$.find('li[itemid='+opt.ids[i]+']').addClass("checked");
			}
		}
		this.$.show();
		this.cb = cb;
		this.scroller.refresh();
	},
	hide:function(){
		this.$.hide();
	},
	submit:function () {
		var data = [];
		this.$c.find("li.checked").each(function () {
			data.push($(this).data('data'));
		});
		if(data.length){
			this.cb(data);
			this.hide();
		}else{
			am.msg('你没有选择任何项目!');
		}
	}
};

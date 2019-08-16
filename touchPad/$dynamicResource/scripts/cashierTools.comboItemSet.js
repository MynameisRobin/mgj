am.comboItemSet = {
	init:function(){
		var _this=this;
		this.$ = $("#comboItemSet");
		this.$c = this.$.find(".scroller").on('vclick','li',function () {
			var data = $(this).data('data');
			if($(this).hasClass('checked')){
				_this.resultIds.splice(_this.resultIds.indexOf(data.itemid),1);
			}else {
				_this.resultIds.push(data.itemid);
			}
			$(this).toggleClass("checked");
		}).on('vclick','.itemTypeName',function () {
			var $this = $(this);
			var lis = $this.next().find("li");
			if($this.hasClass("checked")){
				$this.removeClass("checked");
				$this.next().find("li").removeClass("checked");
				for(var i=0;i<lis.length;i++){
					var data = $(lis[i]).data('data');
					_this.resultIds.splice(_this.resultIds.indexOf(data.itemid),1);
				}
			}else{
				$this.addClass("checked");
				$this.next().find("li").addClass("checked");
				for(var i=0;i<lis.length;i++){
					var data = $(lis[i]).data('data');
					if(_this.resultIds.indexOf(data.itemid)==-1){
						_this.resultIds.push(data.itemid);
					}
				}
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
		this.resultIds = [];
		if(opt.ids){
			for(var i=0;i<opt.ids.length;i++){
				this.$.find('li[itemid='+opt.ids[i]+']').addClass("checked");
				this.resultIds.push(opt.ids[i]);
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
		if(this.resultIds.length){
			var data = [];
			for(var i=0;i<this.resultIds.length;i++){
				data[i] = this.getItemByItemId(this.resultIds[i]);
			}
			this.cb(data);
			this.hide();
		}else{
			am.msg('你没有选择任何项目!');
		}
	},
	getItemByItemId:function(itemid){
		var data = am.metadata.classes;
		for(var i=0;i<data.length;i++){
			for(var j=0;j<data[i].sub.length;j++){
				if(data[i].sub[j].itemid==itemid){
					return data[i].sub[j];
				}
			}
		}
		return null;
	}
};

am.selectItem = {
	init:function(){
		var _this=this;
        this.$ = $("#itemSelect");
        this.$ul = this.$.find("ul").on('vclick',"li",function(){
            
        });
        this.$li = this.$ul.find("li:first").remove();

        this.$c = this.$.find(".scroller");

        this.$.on("vclick",".ok",function(){
        	var $data = _this.$ul.find("li.selected").data("item");
        	if($data.name=="默认"){
        		_this.cb && _this.cb(null);
        	}else{
        		_this.cb && _this.cb($data);
        	}
        	_this.hide();
        }).on("vclick","li",function(){
        	$(this).addClass("selected").siblings().removeClass("selected");
        }).on("vclick",".closees",function(){
        	_this.cb && _this.cb(null);
        	_this.hide();
        });
        this.scroller = new $.am.ScrollView({
        	$wrap: this.$c.parent(),
        	$inner: this.$c,
        	direction: [false, true],
        	hasInput: false,
        	bubble:0
        });
	},
	show:function(data,list,cb){
		if(!this.$){
		    this.init();
		}
		this.refresh(data,list);
		this.$.show();
		this.cb = cb;
		this.scroller.refresh();
	},
	refresh:function(data,list){
		this.$ul.empty();
		var isNeedAdd = true;
		
		if(list && list.length){
			for(var j=0;j<list.length;j++){
				if(list[j].name=="默认"){
					isNeedAdd = false;
				}
			}
			if(isNeedAdd && data.price!=null){
				list.unshift({
					name:"默认",
					price:data.price
				});
			}
			for(var i=0;i<list.length;i++){
				var item = list[i],
					$li  = this.$li.clone(true,true);

				$li.find(".c-left").html(item.name);
				$li.find(".c-right").html(item.price);
				$li.data("item",item);
				if(i==0){
					$li.addClass('selected');
				}
				this.$ul.append($li);
			}
		}
		
	},
	hide:function(){
		this.$.hide();
	}
}
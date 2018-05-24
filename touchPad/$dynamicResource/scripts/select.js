/**
 * var select=new $.am.Select({
		$:$("selectList"),
		data:[{"name":"原项目消费历史纪录","value":1},
		{"name":"原商品购买记录","value":1},
		{"name":"原套餐购买记录","value":1}]
	});
 */

(function($){
	function Select(opt){
		if(typeof opt != 'object'){throw new Error("arguments is not an object")};
		$.extend(this,opt);//继承传进来的参数
		this.$dom=$("#common_selectBox .common_selectBox");
		this.$li=this.$dom.find(".listbox ul li:first");
		this.create();
		opt.onSelect && (this.onSelect=opt.onSelect);
	}
	Select.prototype={
		constructor:Select,
		create:function(){
			var $dom=this.$dom.clone(true,true);
			this.$.append($dom);
			this.$value=this.$.find(".value");
			this.$listbox=this.$.find(".listbox");

			var $ul=this.$listbox.find("ul").empty();
			if(this.data && this.data.length){
				for(var i=0;i<this.data.length;i++){
					var $li=this.$li.clone(true,true);
					$li.text(this.data[i].name).data("value",this.data[i].value);
					$ul.append($li);
					$ul.data('key',this.key);
				}
			}
			if(this.startWidth>=0) this.setValue(this.startWidth);
			this.Scroll = new $.am.ScrollView({
			    $wrap : this.$.find(".inner"),
			    $inner : this.$.find(".inner ul"),
			    direction : [false, true],
			    hasInput: false
			});
			this.addEvent();
		},
		hide:function(flag){
			if(flag){
				this.$listbox.addClass("disabled");
			}else{
				this.$listbox.removeClass("disabled");
			}
			
		},
		refresh:function(data){
			var $ul=this.$listbox.find("ul").empty();
			this.data = data;
			if(data && data.length){
				for(var i=0;i<data.length;i++){
					var $li=this.$li.clone(true,true);
					$li.text(data[i].name).data("value",data[i].value);
					$ul.append($li);
				}
			}
			this.Scroll.refresh();
		},
		getDataIndexByKey:function(key,value){
			for(var i=0;i<this.data.length;i++){
				var item = this.data[i];
				if(item[key] == value){
					return i;
				}
			}
		},
		show:function(){
			var self=this;
			self.hide(false);
			self.Scroll.refresh();
			self.Scroll.scrollTo("top");
			self.vclickcb && self.vclickcb( this.$.find('.listbox ul').data('key') );
		},
		addEvent:function(){
			var self=this;
			this.$.on("vclick",".value,.icon",function(e){
				e.stopPropagation();
				self.show();
				
			}).on("vclick",".listbox li",function(e){
				self.$value.text($(this).text()).data("value",$(this).data("value"));
				self.$listbox.addClass("disabled");
				e.stopPropagation();
				self.onSelect && self.onSelect();
			});
		},
		getValue:function(){
			return this.$value.data("value");
		},
		setValue:function(idx){
			var $li=this.$listbox.find("ul li").eq(idx);
			var v=$li.data("value");
			var k=$li.text();
			this.$value.text(k).data("value",v);
		}
	}
	$.am.Select=Select;
})(jQuery);
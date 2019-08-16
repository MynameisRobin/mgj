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
				if($(this).parents('#page_billRecord')){
					// 仅在流水查询页面特殊处理
					var selectHeight=self.$listbox.height();
					// 窗口高度-点击框距上距离-点击框高度-查询按钮（60）
					// var marginBottom=$(window).height()-$(this).parents('.common_selectBox').offset().top-$(this).parents('.common_selectBox').height()-60;
					var marginBottom=$(window).height()-$(this).parents('.common_selectBox').offset().top-$(this).parents('.common_selectBox').height()-60;
					if(marginBottom<selectHeight){
						//下拉框在上显示
						// 32= 12（$('.cm_block')的marginTop） + 20(间隔);
						self.$listbox.css({"margin-top":-(self.$listbox.height()+$(this).parents('.cm_block').height()+12)+'px'}).addClass('atTop');
					}else{
						//默认在下显示
						self.$listbox.css({"margin-top":0}).removeClass('atTop');
					}
				}
				//点击下拉按钮控制下拉框的显示与隐藏
				if(self.$listbox.hasClass("disabled")){
					self.show();
				}else{
					self.hide(true);
				}
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
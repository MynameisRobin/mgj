(function($){
	function Paging(opt){
		this.default={
			$:$(".box"),
			showNum:20,//每页显示的条数
			total:100,//总数
			action:function(){}
		}
		if(typeof opt != 'object'){throw new Error("arguments is not an object")};
		$.extend(this,this.default,opt);//继承传进来的参数
		this.$pagerbox='<div class="pagerBox">'+
			'<div class="leftbox">共计12页/每页12条</div>'+
			'<div class="centerBox clearfix">'+
				'<div class="list">'+
					'<ul class="clearfix">'+
						'<li class="am-clickable">1</li>'+
					'</ul>'+
				'</div>'+
				// '<div class="inputBox">'+
				// 	'<input type="text" />'+
				// '</div>'+
			'</div>'+
		'</div>';
		this.record=3;//中间有多少个数标 奇数
		this.init();//初始化组件
	}
	Paging.prototype={
		constructor:Paging,
		init:function(){
			this.$box=$(this.$pagerbox);
			this.$ul=this.$box.find("ul");
			this.$li=this.$ul.find(":first").remove();
			this.$ul.empty();
			this.index=0;
			this.render();//初始化render
			this.addEvent();//添加事件
		},
		render:function(){
			var total=parseInt(this.total);
			if(total!=0){
				this.$.append(this.$box);
				this.refresh(this.index,total);
			}
			
		},
		refresh:function(index,total){//当前页码和总记录数
			this.index=index=total<this.showNum?0:index;
			var pagination=Math.ceil(total/this.showNum);
			if(index>=pagination-1){this.index=index=pagination-1};
			var record=this.record%2?this.record:3;
			var start=0,end=0,change=0;
			//第一种情况 不出现省略
			if(pagination<=2*record-1){
				start=0;
				end=pagination-1;
				change=0;
			}
			
			if(pagination>2*record-1){
				if(pagination==2*record){//第二种情况 尾部出现省略
					if(index<record){
						start=0;
						end=record;
						change=1;
					}else{//第三种情况 头部出现省略
						start=pagination-record-1;
						end=pagination-1;
						change=2;
					}
				}else{
					if(index<record){//第二种情况 尾部出现省略
						start=0;
						end=record;
						change=1;
					}else if(index>pagination-record){//第三种情况 头部出现省略
						start=pagination-record-1;
						end=pagination-1;
						change=2;
					}else{//第四种情况 头尾都出现省略
						start=index-((record-1)/2);
						end=index+((record-1)/2);
						change=3;
					}
				}
				
			}
			this.renderList(start,end,pagination,index,change);
			
		},
		renderList:function(start,end,pagination,index,flag){//
			//flag 1渲染一个尾数 2渲染一个头部 3渲染头尾
			var $ul=this.$ul;
			var $pointer=this.$li.clone(true,true).html('<span>···</span>').addClass("disabled");
			var $endli=this.$li.clone(true,true).text(pagination);
			var $startli=this.$li.clone(true,true).text(1);
			$ul.empty();
			for(var i=start;i<=end;i++){//先渲染数字
				var $li=this.$li.clone(true,true);
				$li.text(i+1);
				if(i==index){
					$li.addClass('active');
				}
				$ul.append($li);
			}
			if(flag==1){//渲染尾部
				$ul.append($pointer).append($endli);
			}
			if(flag==2){//渲染头部
				$ul.prepend($pointer).prepend($startli);
			}
			if(flag==3){//渲染头尾
				$ul.append($pointer).append($endli);
				$ul.prepend($pointer.clone(true,true)).prepend($startli);
			}
			//渲染条数
			this.$.find(".leftbox").text('共计'+pagination+'页 / 每页'+this.showNum+'条');
		},
		addEvent:function(){
			var self=this;
			this.$.on("vclick","li",function(){
				if($(this).hasClass('disabled')) return;
				var index=$(this).text()-1;
				self.action && self.action(self,index);
			})
		}
	}
	$.am.Paging=Paging;
})(jQuery);
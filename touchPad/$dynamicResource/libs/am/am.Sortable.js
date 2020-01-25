(function(){
	var Sortable = function(opt){
		this.$ = opt.$;
		this.onSortEnd = opt.onSortEnd;
		this.onNoSort = opt.onNoSort;
		this.cancleFlag = opt.cancleFlag;
		this.init();
	};

	Sortable.prototype = {
		init: function(){
			var self = this;
			this.col = Math.floor(this.$.outerWidth(true)/this.$.find('li').outerWidth(true));
			this.width = this.$.find('li').outerWidth(true);
			this.height = this.$.find('li').outerHeight(true);
			this.w = this.$.find('li').outerWidth();
			this.h = this.$.find('li').outerHeight();
			this.$.css('width',this.width*this.col+'px');
			this.$.find('li').unbind('vtouchstart').unbind('vtouchmove').unbind('vtouchend');
			this.$.find('li').addClass('am-touchable').bind({
				'vtouchstart': function(e,p){
					self.target = $(this);
					self.x = p.x;
					self.y = p.y;
					self.minLeft = -self.width*(self.target.index()%self.col)-10;
					self.maxLeft = self.$.outerWidth(true)-self.width*(self.target.index()%self.col+1)+10;
					self.minTop = -self.height*(Math.floor(self.target.index()/self.col));
					self.maxTop = self.$.outerHeight(true)-self.height*(Math.floor(self.target.index()/self.col)+1);
					self.touchstart();
				},
				'vtouchmove': function(e,p){
					if($(this).hasClass('shake')){
						var x = p.x - self.x,
							y = p.y - self.y;
						if(x<self.minLeft){
							x = self.minLeft;
						}
						if(x>self.maxLeft){
							x = self.maxLeft;
						}
						if(y<self.minTop){
							y = self.minTop;
						}
						if(y>self.maxTop){
							y = self.maxTop;
						}
						self.target.css({
							'left': x+'px',
							'top': y+'px',
							'z-index':1
						});
						var cx = self.target.offset().left+self.w/2,
							cy = self.target.offset().top+self.h/2;
						self.touchmove(cx,cy);
						return false;
					}
				},
				'vtouchend': function(e,p){
					self.target.css({
						'left': 'auto',
						'top': 'auto',
						'z-index':0
					});
					self.touchend();
				}
			});
			this.$.on('vhold','li:not(.add)',function(){
				if (!this.cancleFlag) {
					self.begin();
				}
			});
		},
		interval: 500,
		touchstart: function(){
			var lis = this.$.find('li:not(.add)');
			var posArr = [];
			for(var i=0;i<lis.length;i++){
				posArr[i] = {};
				posArr[i].x = $(lis[i]).offset().left+this.w/2;
				posArr[i].y = $(lis[i]).offset().top+this.h/2;
			}
			this.posArr = posArr;
			var _this = this;
			this.ts = 0;
			this.timer = setInterval(function(){
				_this.ts += _this.interval;
			},500);
		},
		touchmove: function(x,y){
			if(this.ts/this.interval==this.lastCal){
				return;
			}
			// console.log(1111)
			this.lastCal = this.ts/this.interval;
			var disArr = [];
			for(var i=0;i<this.posArr.length;i++){
				var px = this.posArr[i].x,
				    py = this.posArr[i].y
				var dis = (x-px)*(x-px) + (y-py)*(y-py);
            	disArr[i] = Math.sqrt(dis);
			}
			var index = this.getMinIndexInArray(disArr);
			if(Math.abs(y-this.posArr[index].y)<this.h && Math.abs(x-this.posArr[index].x)<this.w){
				if(index==this.target.index()){
					this.$.find('li').removeClass('mark');
				}else {
					this.$.find('li').eq(index).addClass('mark').siblings().removeClass('mark');
					this.insertIndex = index;
					if(x<=this.posArr[index].x){
						this.sortMode = 'insertBefore';
						this.$.find('li').eq(index-1).addClass('mark');
					}else {
						this.sortMode = 'insertAfter';
						this.$.find('li').eq(index+1).addClass('mark')
					}
					this.target.removeClass('mark');
				}
			}else {
				this.$.find('li').removeClass('mark');
			}
		},
		touchend: function(){
			var _this = this;
			clearInterval(_this.timer);
			var lis = this.$.find('.mark');
			if (!this.cancleFlag) {
				this.cancle();
			}
			if(lis.length){
				if(this.sortMode=='insertBefore'){
					this.target.insertBefore(this.$.find('li').eq(this.insertIndex));
				}else if(this.sortMode=='insertAfter'){
					this.target.insertAfter(this.$.find('li').eq(this.insertIndex));
				}
				var list = this.$.find('li:not(.add)');
				var ids = [];
				for(var i=0;i<list.length;i++){
					var data = $(list[i]).data('data');
					ids.push(data.id);
				}
				this.onSortEnd && this.onSortEnd(ids);
			}else {
				this.onNoSort && this.onNoSort();
			}
		},
		begin: function(){
			this.$.find('li').addClass('shake').addClass('am-touchable');
            this.$.find('li.add').css('visibility','hidden');
		},
		cancle: function(){
			this.$.find('li').removeClass('shake mark').removeClass('am-touchable');
            this.$.find('li.add').css('visibility','visible');
		},
		getMinIndexInArray:function(a){
			var lowest = 0;
			for (var i = 1; i < a.length; i++) {
				if (a[i] < a[lowest]) lowest = i;
			}
			return lowest;
	    },

	}

	$.am.Sortable = Sortable;
})();
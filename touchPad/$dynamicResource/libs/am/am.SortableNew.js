(function () {
	var Sortable = function (opt) {
		this.$ = opt.$;
		this.onSortEnd = opt.onSortEnd;
		this.onNoSort = opt.onNoSort;
		this.init();
	};

	Sortable.prototype = {
		init: function () {
			var self = this;
			this.$li = this.$.find('li');
			this.$sortBtn = this.$li.find(".sortBtn");
			this.col = Math.floor(this.$.outerWidth(true) / this.$li.outerWidth(true));
			this.width = this.$li.outerWidth(true);
			this.height = this.$li.outerHeight(true);
			this.w = this.$li.outerWidth();
			this.h = this.$li.outerHeight();
			this.$.css('width', this.width * this.col + 'px');
			this.$sortBtn.unbind('vtouchstart').unbind('vtouchmove').unbind('vtouchend');
			this.$sortBtn.addClass('am-touchable').bind({
				'vtouchstart': function (e, p) {
					self.target = $(this).parents("li");
					self.x = p.x;
					self.y = p.y;
					self.minLeft = -self.width * (self.target.index() % self.col);
					self.maxLeft = self.$.outerWidth(true) - self.width * (self.target.index() % self.col + 1);
					self.touchstart();
				},
				'vtouchmove': function (e, p) {
					if (self.target.hasClass('shake')) {
						var x = p.x - self.x,
							y = p.y - self.y;
						if (x < self.minLeft) {
							x = self.minLeft;
						}
						if (x > self.maxLeft) {
							x = self.maxLeft;
						}
						self.target.css({
							'left': x + 'px',
							'top': y + 'px',
							'z-index': 1
						});
						var cx = self.target.offset().left + self.w / 2,
							cy = self.target.offset().top + self.h;
						self.touchmove(cx, cy);
						return false;
					}
				},
				'vtouchend': function (e, p) {
					self.target.css({
						'left': 'auto',
						'top': 'auto',
						'z-index': 0
					});
					self.touchend();
				}
			});
		},
		touchstart: function () {
			var lis = this.$li;
			var posArr = [];
			for (var i = 0; i < lis.length; i++) {
				posArr[i] = {};
				posArr[i].x = $(lis[i]).offset().left + this.w / 2;
				posArr[i].y = $(lis[i]).offset().top + this.h;
			}
			this.posArr = posArr;
		},
		touchmove: function (x, y) {
			this.lastCal = this.ts / this.interval;
			var disArr = [];
			for (var i = 0; i < this.posArr.length; i++) {
				var px = this.posArr[i].x,
					py = this.posArr[i].y
				var dis = (x - px) * (x - px) + (y - py) * (y - py);
				disArr[i] = Math.sqrt(dis);
			}
			var index = this.getMinIndexInArray(disArr);
			this.$li.removeClass('mark');
			this.insertIndex = index;
			if (y <= this.posArr[index].y) {
				this.sortMode = 'insertBefore';
			} else if (y > this.posArr[index].y) {
				this.sortMode = 'insertAfter';
			}
			this.target.addClass('mark');
		},
		touchend: function () {
			var lis = this.$.find('.mark');
			if (lis.length) {
				if (this.sortMode == 'insertBefore') {
					this.target.insertBefore(this.$li.eq(this.insertIndex));
				} else if (this.sortMode == 'insertAfter') {
					this.target.insertAfter(this.$li.eq(this.insertIndex));
				}
				var list = this.$.find('li');
				var ids = [];
				for (var i = 0; i < list.length; i++) {
					var data = $(list[i]).data('data');
					ids.push(data.id);
				}
				this.onSortEnd && this.onSortEnd(ids);
			} else {
				this.onNoSort && this.onNoSort();
			}
		},
		begin: function () {
			this.$li.addClass('shake');
			this.$sortBtn.addClass('am-touchable');
		},
		cancle: function () {
			this.$li.removeClass('shake mark');
			this.$sortBtn.removeClass('am-touchable');
		},
		getMinIndexInArray: function (a) {
			var lowest = 0;
			for (var i = 1; i < a.length; i++) {
				if (a[i] < a[lowest]) lowest = i;
			}
			return lowest;
		}
	}

	$.am.SortableNew = Sortable;
})();
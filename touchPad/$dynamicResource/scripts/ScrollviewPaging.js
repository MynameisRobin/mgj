(function($){
	//为Scrollview添加属性 提供上拉下拉方法
	//$.extend(obj,$.am.scrollviewPaging); obj为new出来的实例对象
	$.am.scrollviewPaging=(function(){
		var touchTop=function(e){
			var self=this;
			if (this.pauseTouchTop) {
			    return;
			}
			if(!this.$inner.find(".am-drag.top").size()){
				this.$inner.prepend('<div class="am-drag top down" style="display:none"><span class="icon">T</span><span class="am-drag-text">' + (self.amDragTopTips[0]) + '</span></div>');
			}
			$.am.debug.log("touchTop:" + e);
			if (e == 3) {
			    $.am.debug.log("loading Show:" + e);
			    this.$inner.find(".am-drag.top").removeClass("up").addClass("down").find(".am-drag-text").text(self.amDragTopTips[2]);
			    this.$inner.find(".am-drag.top").show().addClass("loading");
			    self.touchTopcallback();

			    if(!this._originalMax){
			        this._originalMax = [this._max[0], this._max[1]];
			    }

			    this._currentPos = [0,55];
			    this._onupdate([0, 55]);
			} else if (e == 2) {

			} else if (e == 1) {
			    this.$inner.find(".am-drag.top").removeClass("down").addClass("up").find(".am-drag-text").text(self.amDragTopTips[1]);
			}else {
			    this.$inner.find(".am-drag.top").show().removeClass("loading").removeClass("up").addClass("down").find(".am-drag-text").text(self.amDragTopTips[0]);
			}
		}
		var touchBottom = function (e) {
			var self=this;
	        if (this.pauseTouchBottom) {
	            return;
	        }
	        if(!this.$inner.find(".am-drag.bottom").size()){
	        	self.$inner.append('<div class="am-drag bottom up" style="display:none"><span class="icon">B</span><span class="am-drag-text">' + (self.amDragBottomTips[0]) + '</span></div>');
	        }
	        $.am.debug.log("touchBottom:" + e);
	        if (e == 3) {
	            this.$inner.find(".am-drag.bottom").removeClass("up").addClass("down").find(".am-drag-text").text(self.amDragBottomTips[2]);
	            this.$inner.find(".am-drag.bottom").show().addClass("loading");
	            self.touchBottomcallback();

	            //this._currentPos = [0, this._min[1]-55];
	            //this._onupdate([0, this._min[1] - 55]);
	        } else if (e == 2) {
	        	console.log(e);
	        } else if (e == 1) {
	            this.$inner.find(".am-drag.bottom").removeClass("up").addClass("down").find(".am-drag-text").text(self.amDragBottomTips[1]);
	        } else {
	            this.$inner.find(".am-drag.bottom").show().removeClass("loading").removeClass("down").addClass("up").find(".am-drag-text").text(self.amDragBottomTips[0]);
	        }
	    }
		var closeTopLoading=function () {
		    //$.am.debug.log("closeTopLoading:" + typeof (this.scrollview._originalMax));
            try{
                if (typeof (this._originalMax) == "object") {
                    $.am.debug.log("GO");
                    this._endPos = [this._currentPos[0], this._currentPos[1]];
                    this._speed = 0;
		            this._max = [this._originalMax[0], this._originalMax[1]];
		            this._originalMax = 0;
                    this._startAnimation();
		            this.$inner.find(".am-drag.top").hide();

		            $.am.debug.log("closeTopLoading: DONE!");

		        }
            } catch (e) {
                $.am.debug.log("ERROR:" + e);
            }
		};
		var closeBottomLoading=function () {
		    if (this._originalMin) {
		        this._speed = 0;
		        this._min = [this._originalMin[0], this._originalMin[1]];
		        this._originalMin = 0;
		        this._startAnimation();
		        this.$inner.find(".am-drag.bottom").hide();
		        $.am.debug.log("closeBottomLoading: DONE!");
		    }
		};
		return {
			amDragTopTips: ["下拉刷新列表", "松开开始加载", "加载中..."],
			amDragBottomTips: ["上拉加载更多", "松开开始加载", "加载中..."],
			touchTop:touchTop,
			touchBottom:touchBottom,
			closeTopLoading:closeTopLoading,
			closeBottomLoading:closeBottomLoading
		}
	})();
})(jQuery);
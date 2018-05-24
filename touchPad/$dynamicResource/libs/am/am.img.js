(function() {

	var processType = function(filepath, type) {
		type = $.trim(type);
		if (filepath && type) {
			var tempArr = filepath.split(".");
			if (tempArr.length >= 2) {
				tempArr[tempArr.length - 2] += ("_" + type);
				return tempArr.join(".");
			} else {
				return filepath + "_" + type;
			}
		} else {
			return filepath;
		}
		return false;
	};
	/*
	$img.getPicture({
		file:item,
		type:"mykHome",
		size:"",
		options:{
			parentShopId: 30000,
		},
		success:function(){},
		error:function(){}
	});*/
	$.fn.getPicture = function(opt) {
		if(typeof(opt) != "object") return;
		var ret = imageConfig.getImageUrl(opt.type, opt.options, opt.file, opt.size);
		var self = this;
		if (ret) {
			var url = config.imageUrl+"/"+ret;

			self.unbind().bind({
				"load" : function() {
					// console.log("img loaded");
					if (device.platform == "iOS") {
						self.fadeIn(300);
					} else {
						self.show();
					}
					self.css("background-color", "#CCC");
					opt.success && opt.success.call(self);
				},
				"error":function(){
					opt.error && opt.error.call(self);
				}
			});

			if (url.toLowerCase().indexOf(".png") == -1 && url.toLowerCase().indexOf(".jpg") == -1 && url.toLowerCase().indexOf(".jpeg") == -1 && url.toLowerCase().indexOf(".gif") == -1) {
			    url += ".jpg";
			}
			self.attr("src", url);
		}else{
			opt.error && opt.error.call(self);
		}
		return this;
	};
})();

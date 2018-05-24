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

	$.fn.getPicture = function(path, scb, fcb, type) {
		// console.log("path",path);
		if (path) {
			var self = this;
			var url = config.imageUrl + "/" + processType(path, type);

			// console.log("bind");
			self.unbind().bind({
				"load" : function() {
					// console.log("img loaded");

					if (device.platform == "iOS") {
						self.fadeIn(300);
					} else {
						self.show();
					}
					self.css("background-color", "#CCC");
					scb && scb.call(self);
				}
			});

			if (url.toLowerCase().indexOf(".png") == -1 && url.toLowerCase().indexOf(".jpg") == -1 && url.toLowerCase().indexOf(".jpeg") == -1 && url.toLowerCase().indexOf(".gif") == -1) {
			    url += ".png";
			}
			self.attr("src", url);
		}

		return this;
	};

	$.fn.setCenter = function(size) {
		this.data("size", size);
		return this;
	};
})();

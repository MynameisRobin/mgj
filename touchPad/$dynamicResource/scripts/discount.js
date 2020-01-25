(function () {
	var self = am.discount = {
		init: function (metadata, member, timeDiscount) {
			this.timeDiscount = timeDiscount;
			this.metadata = metadata;
			this.member = member;
			// 获取项目对象
			this.getDiscountMap();
			// 获取卖品对象
			this.getCategoryItemMap();
		},
		// 代替$.each
		each: function (arr, callback) {
			for (var index = 0; index < arr.length; index++) {
				callback.call(arr[index], index, arr[index]);
			}
		},
		//判断值是否正常
		isNull: function (val) {
			if (val == null || val == undefined || val == "" || val == "NaN" || JSON.stringify(val) == "{}") {
				return true;
			}
			return false;
		},
		toFloat: function (price) {
			var metadata = this.metadata;
			if (metadata.userInfo) {
				var s = metadata.userInfo.fixedNum;
				if (s === 0) {
					return Math.round(price) || 0;
				} else if (s === 1) {
					return Math.round(price * 10) / 10 || 0;
				} else if (s === 2) {
					return Math.round(price * 100) / 100 || 0;
				} else if (s === 3) {
					return Math.ceil(Math.round(price * 100) / 100 || 0) || 0;
				}
			}
			return Math.round(price * 10) / 10 || 0;
		},
		/**
		 * 
		 * @param {*} price 原价
		 * @param {*} member 会员信息
		 * @param {*} data 选择的项目信息
		 */
		servicePrice: function (price, member, data) {
			if (member) {
				// 如果没有高级分时折扣就显示老折扣,高级折扣未配置也走之前的
				var timeDiscount = self.timeDiscount.discountPrice(price, member, data, 'service');
				if (timeDiscount && timeDiscount.discountFlag) {
					console.log('项目分时折扣')
					return self.toFloat(timeDiscount.price);
				}
				// 先看看有没有项目定价，没有就走会员价
				var discountMap = this.discountMap;
				var discount = discountMap[member.cardTypeId + "_" + (data.itemid || data.itemId)];
				if (discount) {
					// dicmode是定价还是折扣
					if (discount.dicmode == "1") {
						price = discount.discount;
					} else {
						price = price * (discount.discount == "0" ? 10 : discount.discount) * 0.1;
					}
					data.cardDiscount = 1;
				} else if (member.discount) {
					console.log('项目会员折扣')
					price = price * (member.discount == "0" ? 10 : member.discount) * 0.1;
				}
			}
			return self.toFloat(price);
		},
		// 卖品,同上
		productPrice: function (price, member, data) {
			if (member) {
				var timeDiscount = self.timeDiscount.discountPrice(price, member, data, 'depot');
				// 先判断分时折扣,再判断会员卖品折扣
				if (timeDiscount && timeDiscount.discountFlag) {
					console.log('卖品分时折扣')
					return self.toFloat(timeDiscount.price);
				}
				// 是否存在会员价
				var nprice = self.getProductPrice(data, price, member);
				var mprice = nprice.price;
				if (nprice.isMemberPrice) {
					price = mprice;
				} else if (member.buydiscount) {
					console.log('卖品会员折扣')
					price = price * (member.buydiscount == "0" ? 10 : member.buydiscount) * 0.1;
				}
			}
			return self.toFloat(price);
		},
		// 获取项目对象
		getDiscountMap: function () {
			var metadata = this.metadata;
			var discountMap = {};
			var scd = metadata.serviceitemcarddiscountList;
			if (scd && scd.length) {
				for (var i = 0; i < scd.length; i++) {
					discountMap[scd[i].cardtypeid + "_" + scd[i].itemId] = scd[i];
				}
			}
			this.discountMap = discountMap;
		},
		// 获取卖品对象
		getCategoryItemMap: function () {
			var metadata = this.metadata;
			var categoryItemMap = {};
			if (metadata.category && metadata.category.length) {
				for (var i = 0; i < metadata.category.length; i++) {
					var sub = metadata.category[i].depotList;
					if (sub && sub.length) {
						for (var j = 0; j < sub.length; j++) {
							sub[j].categoryName = metadata.category[i].type;
							categoryItemMap[sub[j].id] = sub[j];
						}
					}
				}
			}
			this.categoryItemMap = categoryItemMap;
		},
		//获取卖品会员价
		getProductPrice: function (data, price, member) {
			var categoryItemMap = this.categoryItemMap;
			var item = categoryItemMap[data.productid];
			var res = {
				price: price,
				isMemberPrice: false
			}
			if (item) {
				//存在卖品会员价
				if (item.mgj_memberpricecfg) {
					var mgj_memberpricecfg = JSON.parse(item.mgj_memberpricecfg);
					if (mgj_memberpricecfg && member) {
						// 是否可消费
						if (mgj_memberpricecfg.memberPrice) {
							res.price = mgj_memberpricecfg.memberPrice;
							res.isMemberPrice = true;
						}
						if (mgj_memberpricecfg.cardList && mgj_memberpricecfg.cardList.length) {
							for (var i = 0; i < mgj_memberpricecfg.cardList.length; i++) {
								var itemj = mgj_memberpricecfg.cardList[i];
								if (itemj.cardtypeid == member.cardTypeId) {
									res.price = itemj.price;
									res.isMemberPrice = true;
									break;
								}
							}
						}
					}
				}
			}
			return res;
		},
		// 计算折扣
		calc: function (billData, metadata, member, timeDiscount) {
			if (self.isNull(billData)) return false;
			self.init(metadata, member, timeDiscount);
			// 复制一个billData
			var billData = JSON.parse(JSON.stringify(billData));
			// 获取单据项目详情
			var item = JSON.parse(billData.data);
			// 项目
			var serviceItems = item.serviceItems;
			// 卖品
			var products = item.products;

			if (!self.isNull(serviceItems)) {
				self.each(serviceItems, function (i, v) {
					// 手动改价或者非普通项目不打折
					if (v.modifyed) {
						v.discountPrice = v.odiscountPrice = v.price;
					} else {
						v.discountPrice = v.odiscountPrice = self.servicePrice(v.oPrice, member, v);
					}
				});
			}
			if (!self.isNull(products)) {
				self.each(products.depots, function (i, v) {
					if (v.modifyed) {
						v.discountPrice = v.odiscountPrice = v.salePrice;
					} else {
						v.discountPrice = v.odiscountPrice = self.productPrice(v.price, member, v);
					}
				});
			}
			return billData;
		}
	};
})();
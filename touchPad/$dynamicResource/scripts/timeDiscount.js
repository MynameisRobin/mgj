(function () {
	var self = am.timeDiscount = {
		dateCheck: function (json) {
			if(!json || !json.length) return false;
			var discountRule = {};
			$.each(json, function(index, data) {
				var dateJson = JSON.parse(data.dateJson);
				var now = new Date();
				var week = now.getDay(); // 周几
				var day = now.getDate(); // 哪天
				var toDay = now.format('yyyy-mm-dd'); // 具体哪天
				var daysData = dateJson.daysData || []; // 每天几点
				var weeklyData = dateJson.weeklyData || []; // 每周周几
				var monthlyData = dateJson.monthlyData || []; // 每月几号
				var assignDaysData = dateJson.assignDaysData || []; // 指定具体哪几天
				var daysFlag =  !dateJson.everyday || !daysData.length || self.timeCheck(daysData[0], daysData[1], new Date().format("HH:MM"));
				var weeklyFlag = !dateJson.weekly || !weeklyData.length || weeklyData.indexOf(week) > -1;
				var monthlyFlag = !dateJson.monthly || !monthlyData.length || self.monthCheck(monthlyData, day);
				var assignFlag = !dateJson.assignDays || !assignDaysData.length || assignDaysData.indexOf(toDay) > -1;
				if (!dateJson.highChecked || daysFlag && weeklyFlag && monthlyFlag && assignFlag) {
					console.log("不限或者高级配置生效");
					discountRule = data;
					return false;
				}
			});
			console.log(discountRule,'------discountRule--------');
			return am.isNull(discountRule) ? false : discountRule;
		},
		// 判断当前的日期几号是否在范围内
		monthCheck: function (monthlyData, day) {
			var flag = false;
			$.each(monthlyData, function (i, v) {
				if (day - 0 === v - 0) {
					flag = true;
					return false;
				}
			});
			return flag;
		},
		timeCheck: function (startTime, endTime, nowTime) {
			var startArr = startTime.split(":");
			if (startArr.length !== 2) {
				return false;
			}

			var endArr = endTime.split(":");
			if (endArr.length !== 2) {
				return false;
			}

			var nowArr = nowTime.split(":");
			if (nowArr.length !== 2) {
				return false;
			}

			var start = new Date();
			var end = new Date();
			var now = new Date();

			start.setHours(startArr[0]);
			start.setMinutes(startArr[1]);
			end.setHours(endArr[0]);
			end.setMinutes(endArr[1]);
			now.setHours(nowArr[0]);
			now.setMinutes(nowArr[1]);

			var nowNum = now.getTime();
			var startNum = start.getTime();
			var endNum = end.getTime();
			if(startNum > endNum){
				// 12点为基准，当前时间小于12点就把开始时间-1天，当前时间大于12点就把结束时间+1天
				if (nowArr[0] < 12) {
					startNum = startNum - 86400000;
				} else {
					endNum = endNum + 86400000;
				}
			}
			if (nowNum - startNum >= 0 && nowNum - endNum <= 0) {
				return true;
			} else {
				console.log("当前时间是：" + now.getHours() + ":" + now.getMinutes() + "，不在该时间范围内！");
				return false;
			}
		},
		/**
		 * am.metadata.discountRules 	高级折扣配置参数
		 * @param {*} cardTypeId 		卡类型Id
		 * @param {*} id 				规则Id
		 * @param {*} name 				规则名称
		 * @param {*} parentShopId 		所属门店
		 * @param {*} priority 			优先级(数字越大越靠前)
		 * @param {*} remark 			备注
		 * @param {*} dateJson 			时间校验数据
		 * @param {*} depotJson 		卖品校验数据
		 * @param {*} serviceItemJson 	项目校验数据
		 */
		hasNewCardRule:function(cardTypeId){
			var arr = [];
			var metaCardRuleList = am.metadata.discountRules || [];
			for(var i=0,len=metaCardRuleList.length;i<len;i++){
				var ruleObj=metaCardRuleList[i];
				if(ruleObj.cardTypeId==cardTypeId){
					arr.push(ruleObj);
				}
			}
			if(arr.length > 1){
				arr = arr.sort(function(a,b){
					return b.priority - a.priority;
				});
			}
			return arr;
		},
		/**
		 * 
		 * @return {*} false 	//失败时返回false，说明没有匹配折扣
		 * @return {*} obj: {price, discountFlag} 	// 成功时返回obj,price为是否打折过的价格,discountFlag为折扣是否匹配上，若没有配置某个项目的折扣走之前的会员折扣
		 */
		discountPrice: function (price, member, data, type) {
			var discountFlag = false;
			var discountRules = self.hasNewCardRule(member.cardTypeId);
			var discountRule = self.dateCheck(discountRules);
			if (am.isNull(discountRule)) {
				return false;
            }
			// var dateJson = JSON.parse(discountRule.dateJson);
			var depotJson = JSON.parse(discountRule.depotJson);
			var serviceItemJson = JSON.parse(discountRule.serviceItemJson);
			if (type === "service") {
                var id = data.id;
                
                // 寻找一下大类的id
				var parentId = '';
				if(am.metadata.classes.length > 0){
					$.each(am.metadata.classes,function(i,v){
						if(v.sub.length > 0){
							$.each(v.sub,function(k,item){
								if(item.id == id){
									parentId = v.id;
									return false;
								}
							});
						}
					});
				}
				// 高级折扣
				var serviceFlag = true;
				if (serviceItemJson.highChecked) {
					// 小类优先
					var highData = serviceItemJson.highData;
					$.each(highData, function (i, v) {
						if (v.sub.length > 0) {
							$.each(v.sub, function (k, item) {
								if (item.rule > 0 && item.id == id) {
									//ruleType 0折1元
									if (item.ruleType) {
										price = item.rule;
										serviceFlag = false;
										return false;
									} else {
										price = price * item.rule * 0.1;
										serviceFlag = false;
										return false;
									}
								}
							});
						}
						if(serviceFlag){
							if (v.rule > 0 && v.id == parentId) {
								if (v.ruleType) {
									price = v.rule;
									serviceFlag = false;
									return false;
								} else {
									price = price * v.rule * 0.1;
									serviceFlag = false;
									return false;
								}
							}
						}
                    });
                    data.timeDiscount = 1;
				}
				//如果走了上面的高级折扣就不走通用,serviceFlag默认true
				discountFlag = !serviceFlag;
				// 项目通用折扣
				if (serviceFlag && serviceItemJson.discountChecked) {
					price = serviceItemJson.discount * price * 0.1;
					discountFlag = true;
				}
			}
			else if(type === "depot"){
                var id = data.id;
                // 寻找一下大类的id
                var pid = ''; // 总部下面的id
				var parentId = '';
				if(am.metadata.category.length > 0){
					$.each(am.metadata.category,function(i,v){
						if(v.depotList.length > 0){
							$.each(v.depotList,function(k,item){
								if(item.id == id){
                                    pid = item.id;
                                    // pid = item.pid;
									parentId = v.id;
									return false;
								}
							});
						}
					});
				}
				// 高级折扣
				var depotFlag = true;
				if (depotJson.highChecked) {
					// 小类优先
					var highData = depotJson.highData;
					$.each(highData, function (i, v) {
						if (v.sub.length > 0) {
							$.each(v.sub, function (k, item) {
								if (item.rule > 0 && item.id == pid) {
									//ruleType 0折1元
									if (item.ruleType) {
										price = item.rule;
										depotFlag = false;
										return false;
									} else {
										price = price * item.rule * 0.1;
										depotFlag = false;
										return false;
									}
								}
							});
						}
						if(depotFlag){
							if (v.rule > 0 && v.id == parentId) {
								if (v.ruleType) {
									price = v.rule;
									depotFlag = false;
									return false;
								} else {
									price = price * v.rule * 0.1;
									depotFlag = false;
									return false;
								}
							}
						}
					});
				}
				//如果走了上面的高级折扣就不走通用,depotFlag:true
				discountFlag = !depotFlag;
                // 卖品通用折扣
				if (depotFlag && depotJson.discountChecked) {
					price = depotJson.discount * price * 0.1;
					discountFlag = true;
				}
            }
            console.log("---高级折扣价格---",price);
			return {
				price: price,
				discountFlag: discountFlag
			};
		}
	}
})();
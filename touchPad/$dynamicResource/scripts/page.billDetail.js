(function () {
	var self = am.page.billDetail = new $.am.Page({
		id: "page_billDetail",
		commentlevel: ['好评', '中评', '差评', '未点评'],
		payTypeMap: {
			cardfee: "卡金",
			cash: "现金",
			cooperation: "合作券",
			coupon: "优惠券",
			debtfee: "欠款",
			dianpin: "点评支付",
			dividefee: "分期赠金",
			luckymoney: "红包支付",
			mall: "商场卡",
			mallorderfee: "商城订单",
			mdfee: "免单",
			onlineCreditPay: "线上积分",
			offlineCreditPay: "线下积分",
			presentfee: "赠送金",
			treatfee: "套餐卡金",
			treatpresentfee: "套餐赠金",
			unionpay: "银联",
			voucherfee: "代金券",
			weixin: "微信",
			pay: "支付宝"
		},
		payConfigs: {
			otherfee1: "自定义1",
			otherfee2: "自定义2",
			otherfee3: "自定义3",
			otherfee4: "自定义4",
			otherfee5: "自定义5",
			otherfee6: "自定义6",
			otherfee7: "自定义7",
			otherfee8: "自定义8",
			otherfee9: "自定义9",
			otherfee10: "自定义10"
		},
		backButtonOnclick: function () {
			$.am.page.back('slidedown');
		},
		init: function () {
			// 查看签名
			self.$.find(".softgenre").on("vclick", function () {
				var $this = $(this);
				am.signatureView.show({
					memberId: self.data.memberid,
					billId: self.billId,
					unresign: 1,
					storeId: self.data.shopid,
					failed: function () {
						$this.addClass("am-disabled");
					}
				});
			});

			this.scrollview = new $.am.ScrollView({
				$wrap: self.$.find('.tbody'),
				$inner: self.$.find('.tbody table'),
				direction: [false, true],
				hasInput: false,
				bubble: true
			});
		},
		beforeShow: function (params) {
			this.reset();
			if (params && params.id) {
				this.billId = params.id;
				this.getData();
			} else {
				am.msg("单号异常，请重新选择其他单号");
				setTimeout(function () {
					$.am.page.back('slidedown');
				}, 500);
			}
		},
		afterShow: function () {

		},
		afterHide: function () {
			this.reset();
		},
		reset: function () {
			this.billId = null;
			this.data = null;
			self.$.find(".billTbody").html('');
			self.$.find(".softgenre").removeClass("am-disabled");
		},
		getData: function () {
			am.loading.show();
			am.api.billDetail.exec({
				parentShopId: am.metadata.userInfo.parentShopId,
				id: self.billId
			},
			function (ret) {
				am.loading.hide();
				if (ret.code == 0) {
					self.render(ret.content);
					self.scrollview.refresh();
					self.scrollview.scrollTo('top');
				} else {
					am.confirm('查询失败', ret.message, '重试', '取消', function () {
						self.getData();
					});
				}
			});
		},
		getType: function (type, consumeType, debtBillId) {
			var type = type - 0,
				consumeType = consumeType - 0,
				str = '';
			switch (type) {
				case 0:
					str = '项目';
					break;
				case 1:
					str = '卖品';
					break;
				case 2:
					if (consumeType === 0) {
						str = '开卡充值';
					} else {
						str = '续卡充值';
					}
					break;
				case 3:
					str = '套餐购买';
					break;
				case 4:
					str = '套餐';
					break;
				case 5:
					str = '年卡充值';
					break;
				case 6:
					str = '年卡销售';
					break;
				case 7:
					str = '套餐赠送';
					break;
				default:
					break;
			}
			if (debtBillId > 0) {
				str += '(还款)';
			}
			return str;
		},
		getCheckCards: function(jsonstr) {
			if (jsonstr) {
				var jsonstr = JSON.parse(jsonstr);
				if (jsonstr.checkCards) {
					var $box = '<span class="multiSpan">多</span>';
					var checkCards = jsonstr.checkCards;
					$.each(checkCards, function(i, v) {
						$box += '<div class="checkCardList">' + v.cardName + '： ￥'+ (v.cardFee || 0) + '</div>';
					});
					return $box;
				}
			}
			return '';
		},
		getItemTh: function (type) { //项目
			var itemArr = [
				'<th class="depotNameTh">部门</th>',
				'<th class="mealcutname">项目名称</th>',
				'<th class="moneyTh">消费金额</th>',
				'<th>入账</th>',
				'<th>数量</th>',
				'<th>类型</th>',
				'<th class="serverNo">服务员工</th>',
				'<th class="pointflagTh">指定类型</th>',
				'<th class="feeTh">员工业绩</th>',
				'<th>提成</th>'
			].join("");
			if (type == "1") {
				itemArr = [
					'<th>部门</th>',
					'<th>卖品名称</th>',
					'<th>消费金额</th>',
					'<th>数量</th>',
					'<th>类型</th>',
					'<th>服务员工</th>',
					'<th>员工业绩</th>',
					'<th>提成</th>'
				].join("");
			}
			if (type == "2") { //充值开卡
				itemArr = [
					'<th>消费金额</th>',
					'<th>入账</th>',
					'<th>类型</th>',
					'<th>服务员工</th>',
					'<th>员工业绩</th>',
					'<th>提成</th>'
				].join("");
				var jsonstr = self.data.jsonstr;
				if (jsonstr) {
					jsonstr = JSON.parse(jsonstr);
					if (jsonstr.refundFlag) {
						itemArr = itemArr.replace("<th>消费金额</th>", "<th class='refundTh'>消费金额</th>");
					}
				}
			}
			if (type == "3") { //套餐
				itemArr = [
					'<th class="">套餐名称</th>',
					'<th>消费金额</th>',
					'<th>数量</th>',
					'<th>类型</th>',
					'<th>服务员工</th>',
					'<th>员工业绩</th>',
					'<th>提成</th>'
				].join("");
			}
			if (type == "4") { //套餐
				itemArr = itemArr.replace("<th>项目名称</th>", "<th class='mealname'>套餐名称</th>");
			}
			if (type == "6") {
				itemArr = itemArr.replace("<th>指定类型</th>", "");
			}
			if (type == "7") {
				itemArr = itemArr.replace("<th>部门</th>", "");
			}
			self.$.find(".titleTr").html(itemArr);
		},
		render: function (data) {
			this.data = data;
			this.refundFlag = false;
			if (this.data.jsonstr) {
				var jsonstr = JSON.parse(this.data.jsonstr);
				if (jsonstr.refundFlag) {
					this.refundFlag = true;
				}
			}
			self.$.find(".consumeshop").text(data.shopName || '');
			self.$.find(".cardshop").text(data.cardShopName || '');
			if (data.type == "1" || data.type == "2" || data.type == "3" || data.type == "6") { //除了项目有计客次点评等，其余不用显示
				self.$.find(".clientflagLi").hide();
				self.$.find(".dianpinBox").hide();
				if ((data.type == "2" || data.type == "3") && !this.refundFlag) {
					self.$.find(".costBox").show();
				} else {
					self.$.find(".costBox").hide();
				}
			} else {
				self.$.find(".costBox").hide();
				self.$.find(".clientflagLi").show();
				self.$.find(".dianpinBox").show();
			}
			$.each(data, function (i, v) {
				if (i == "eafee") {
					self.$.find(".eafee").html("￥" + v);
				} else if (i == "consumetime") {
					self.$.find(".consumetime").html(new Date(v).format("yyyy-mm-dd hh:mm"));
				} else if (i == "sex") {
					self.$.find(".sex").html((v == "F" ? "女客" : "男客"));
				} else if (i == "clientflag") {
					self.$.find(".clientflag").html((v == "1" ? "计客次" : "不计客次"));
				} else if (i == "paydetail") {
					self.renderPayDetail(data);
				} else if (i == "money") {
					self.$.find(".money").html("￥" + (v || 0));
					if (self.refundFlag) {
						self.$.find(".money").html(self.getMoney());
					}
				} else if (i == "cost") {
					self.$.find(".cost").html("￥" + (v || 0));
				} else if (i == "type") {
					self.getItemTh(v);
				} else if (i == "commentlevel") {
					self.$.find(".dianpin").html(self.commentlevel[v] || self.commentlevel[3]);
				} else if (i == "id") {
					self.$.find(".id").html(v)
				} else if (i == "shopid") {
					self.$.find(".shopid").html(v)
				} else {
					self.$.find("." + i).html(v);
				}
				//table render
				//type1 卖品 
				//type3/4 套餐
				//type2 consumetype 0开卡 1充值
				//否则都是项目 
				self.$.find(".moneyBox").html("消费总额：");
				self.$.find("table").removeClass("serviceTable");
				var arr = [];
				if (data.type == 2) {
					arr = self.filterRechargeArr(data);
					self.getRechargeTr(arr);
				} else if (data.type == 1 || data.type == 3) {
					//套餐包 or 卖品
					arr = self.diffArr(data);
					self.getProductAndPackageTr(arr);
				} else {
					//项目通用
					arr = self.diffArr(data);
					self.getTableData(arr);
					self.$.find("table").addClass("serviceTable");
				}
			});

			var maxHeight = self.$.find(".content").outerHeight() - self.$.find(".bottom-box").outerHeight();
			self.$.find(".tbody").css({
				'maxHeight': maxHeight - 80
			})
		},
		//通用 员工跟项目按照id来匹配
		diffArr: function (data) {
			var details = data.details;
			var empfees = data.empfees;
			var treatpackages = data.treatpackages;
			for (var i = 0; i < details.length; i++) {
				var item = details[i];
				item.empfees = [];
				item.fee = 0;
				if (treatpackages) {
					for (var n = 0; n < treatpackages.length; n++) {
						var package = treatpackages[n];
						if (package.id == item.treatmentItemId) {
							item.itemname = package.name;
						}
					}
				}
				for (var j = 0; j < empfees.length; j++) {
					// 年卡销售不用对应显示
					// if (item.id === empfees[j].detailId || data.type == "6") {
					if (item.id === empfees[j].detailId) {
						item.empfees.push(empfees[j]);
						item.fee = data.eafee || 0;
					}
				}
			}
			return details;
		},
		// 开充卡 一个项目对应多个员工
		filterRechargeArr: function (data) {
			var empfees = data.empfees || [];
			var jsonstr = data.jsonstr,
				obj = {};
			if (jsonstr) {
				obj = JSON.parse(jsonstr);
			}
			var paydetail = data.paydetail;
			data.details = [{
				refundFlag: obj.refundFlag,
				refundCard: {
					cash: paydetail.cash,
					cardfee: paydetail.cardfee,
					presentfee: paydetail.presentfee
				},
				money: data.money || 0,
				eafee: data.eafee || 0,
				type: data.type,
				consumetype: data.consumetype,
				empfees: empfees
			}];
			return data.details;
		},
		// 卖品和套餐包 type 1 or 3
		getProductAndPackageTr: function (arr) {
			if (am.isNull(arr)) return;
			var tr1 = "";
			$.each(arr, function (i, v) {
				var evenFlag = (i % 2 == 0);
				var len = v.empfees.length;
				var rowspan = 1;
				if (len > 1) {
					rowspan = len;
				}
				if (evenFlag) {
					tr1 += '<tr class="evenTr">';
				} else {
					tr1 += '<tr>';
				}
				if (v.type != "3") {
					tr1 += "<td rowspan='" + rowspan + "'>" + v.depcodename + "</td>";
				}
				tr1 += "<td rowspan='" + rowspan + "'>" + (v.itemname || "- -") + "</td>";
				tr1 += "<td rowspan='" + rowspan + "'>" + v.money + "</td>";
				tr1 += "<td rowspan='" + rowspan + "'>" + ((v.num == "-99") ? "不限次" : v.num) + "</td>";
				tr1 += "<td rowspan='" + rowspan + "'>" + self.getType(v.type, v.consumetype, v.debtBillId) + "</td>";
				if (len > 0) {
					tr1 += "<td class=''>" + (v.empfees[0].empno || '') + '号' + (v.empfees[0].empname || '') + "</td>";
					tr1 += "<td>" + v.empfees[0].fee + "</td>";
					tr1 += "<td>" + v.empfees[0].gain + "</td>";
				}
				if (len == 0) {
					tr1 += "<td></td>";
					tr1 += "<td></td>";
					tr1 += "<td></td>";
				}
				tr1 += '</tr>';
				if (len > 1) {
					for (var j = 1; j < len; j++) {
						var item = v.empfees[j];
						if (evenFlag) {
							tr1 += '<tr class="evenTr">';
						} else {
							tr1 += '<tr>';
						}
						tr1 += "<td class=''>" + item.empno + '号' + item.empname + "</td>";
						tr1 += "<td>" + item.fee + "</td>";
						tr1 += "<td>" + item.gain + "</td>";
						tr1 += '</tr>';
					}
				}
			});
			self.$.find(".billTbody").html(tr1);
		},
		// 其他通用类型
		getTableData: function (arr) {
			if (am.isNull(arr)) return;
			var tr1 = "";
			$.each(arr, function (i, v) {
				var evenFlag = (i % 2 == 0);
				var len = v.empfees.length;
				var rowspan = 1;
				if (len > 1) {
					rowspan = len;
				}
				if (evenFlag) {
					tr1 += '<tr class="evenTr">';
				} else {
					tr1 += '<tr>';
				}
				if (v.type == "2") {
					tr1 += "<td rowspan='" + rowspan + "'>" + v.sum + "</td>";
					tr1 += "<td rowspan='" + rowspan + "'>" + v.fee.toFixed(2) + "</td>";
					tr1 += "<td rowspan='" + rowspan + "'>" + self.getType(v.type, v.consumetype, v.debtBillId) + "</td>";
				} else {
					if (v.type != "3") {
						tr1 += "<td rowspan='" + rowspan + "' class='depotNameTd'>" + v.depcodename + "</td>";
					}
					tr1 += "<td class='mealcutname' rowspan='" + rowspan + "'>" + (v.itemname || "- -") + "</td>";
					//年卡用money作为价格
					if (v.type == "6") {
						tr1 += "<td rowspan='" + rowspan + "'>" + v.money + "</td>";
						tr1 += "<td rowspan='" + rowspan + "'>0</td>";
					} else {
						tr1 += "<td rowspan='" + rowspan + "' class='moneyTd'>" + v.price + "</td>";
						tr1 += "<td rowspan='" + rowspan + "'>" + v.money + "</td>";
					}
					tr1 += "<td rowspan='" + rowspan + "'>" + ((v.num == "-99") ? "不限次" : v.num) + "</td>";
					tr1 += "<td rowspan='" + rowspan + "'>" + self.getType(v.type, v.consumetype, v.debtBillId) + "</td>";
				}
				if (len > 0) {
					tr1 += "<td class='serverNo'>" + (v.empfees[0].empno || '') + '号' + (v.empfees[0].empname || '') + "</td>";
					if (v.type == "0" || v.type == "4") {
						tr1 += "<td class='pointflagTd'>" + (v.empfees[0].pointflag ? "指定" : "非指定") + "</td>";
					}
					tr1 += "<td class='feeTd'>" + v.empfees[0].fee + "</td>";
					tr1 += "<td>" + v.empfees[0].gain + "</td>";
				}
				if (len == 0 && v.type != "2") {
					tr1 += "<td class='serverNo'></td>";
					tr1 += "<td class='pointflagTh'></td>";
					tr1 += "<td class='feeTh'></td>";
					tr1 += "<td></td>";
				}
				tr1 += '</tr>';
				if (len > 1) {
					for (var j = 1; j < len; j++) {
						var item = v.empfees[j];
						if (evenFlag) {
							tr1 += '<tr class="evenTr">';
						} else {
							tr1 += '<tr>';
						}
						tr1 += "<td class='serverNo'>" + item.empno + '号' + item.empname + "</td>";
						if (v.type == "0" || v.type == "4") {
							tr1 += "<td class='pointflagTh'>" + (item.pointflag ? "指定" : "非指定") + "</td>";
						}
						tr1 += "<td class='feeTh'>" + item.fee + "</td>";
						tr1 += "<td>" + item.gain + "</td>";
						tr1 += '</tr>';
					}
				}
			});
			self.$.find(".billTbody").html($(tr1));
		},
		// 开卡充值 type 2
		getRechargeTr: function (arr) {
			if (am.isNull(arr)) return;
			var tr1 = "";
			$.each(arr, function (i, v) {
				var evenFlag = (i % 2 == 0);
				var len = v.empfees.length;
				var rowspan = 1;
				if (len > 1) {
					rowspan = len;
				}
				if (evenFlag) {
					tr1 += '<tr class="evenTr">';
				} else {
					tr1 += '<tr>';
				}
				if (v.refundFlag) {
					tr1 += "<td class='refundTd' rowspan='" + rowspan + "'>" + self.getRefundTd(v.refundCard) + "</td>";
				} else {
					tr1 += "<td rowspan='" + rowspan + "'>" + v.money + "</td>";
				}
				tr1 += "<td rowspan='" + rowspan + "'>" + v.eafee.toFixed(2) + "</td>";
				tr1 += "<td rowspan='" + rowspan + "'>" + self.getType(v.type, v.consumetype, v.debtBillId) + "</td>";
				if (len > 0) {
					tr1 += "<td class='serverNo'>" + (v.empfees[0].empno || '') + '号' + (v.empfees[0].empname || '') + "</td>";
					tr1 += "<td class='feeTd'>" + v.empfees[0].fee + "</td>";
					tr1 += "<td>" + v.empfees[0].gain + "</td>";
				} else {
					tr1 += "<td></td>";
					tr1 += "<td></td>";
					tr1 += "<td></td>";
				}
				tr1 += '</tr>';
				if (len > 1) {
					for (var j = 1; j < len; j++) {
						var item = v.empfees[j];
						if (evenFlag) {
							tr1 += '<tr class="evenTr">';
						} else {
							tr1 += '<tr>';
						}
						tr1 += "<td class='serverNo'>" + item.empno + '号' + item.empname + "</td>";
						tr1 += "<td>" + item.fee + "</td>";
						tr1 += "<td>" + item.gain + "</td>";
						tr1 += '</tr>';
					}
				}
			});
			self.$.find(".billTbody").html($(tr1));
		},
		getRefundTd: function(refundCard) {
			var str = '';
				str += '<div class="">' + refundCard.cardfee + '（退卡金）</div>';
				str += '<div class="">' + refundCard.presentfee + '（退赠送金）</div>';
				str += '<div class="red">' + refundCard.cash + '（退现金）</div>';
			return str;
		},
		getMoney: function() {
			var data = self.data;
			var paydetail = data.paydetail;
			var refundCard = {
				cash: paydetail.cash,
				cardfee: paydetail.cardfee,
				presentfee: paydetail.presentfee
			};
			return "￥" + (refundCard.cardfee*1);
			// return "￥" + (refundCard.cardfee*1 + refundCard.presentfee*1);
		},
		//支付方式
		renderPayDetail: function (data) {
			if (am.isNull(data)) return;
			var v = data.paydetail,
				type = data.type,
				jsonstr = data.jsonstr,
				html = '',
				self = this;
			//自定义支付方式的名称匹配
			if (!this.payDetailFlag){
				for (var i = 0; i < data.payConfigs.length; i++) {
					var field = data.payConfigs[i].field.toLowerCase();
					for (var k in self.payConfigs) {
						if (field == k) {
							self.payTypeMap[k] = data.payConfigs[i].fieldName;
							break;
						}
					}
				}
			}
			this.payDetailFlag = true;
			//非自定义的支付方式
			for (var k in v) {
				if (v[k]) {
					//充值开卡不显示卡金
					if ((k == "cardfee" || k == "presentfee") && type == "2") {} else {
						if (k == 'cardfee') {
							html += '<div class="form-group "><div class="label">' + self.payTypeMap[k] + '：</div><div class="field">￥' + v[k] + self.getCheckCards(jsonstr) +'</div></div>';
						} else {
							html += '<div class="form-group "><div class="label">' + self.payTypeMap[k] + '：</div><div class="field">￥' + v[k] + '</div></div>';
						}
					}
				}
			}
			self.$.find(".payDetail").html(html);
		}
	});
})();
(function() {
	//画圆的构造函数
	var Circle = function(option) {
		this.option = option;
		var canvas = document.getElementById('canvas'),
			ctx = option.canvas.getContext('2d');
		this.tw = option.canvas.width;
		this.th = option.canvas.height;
		this.ctx = ctx;
	};
	//原型
	Circle.prototype = {
		render: function(data) {
			var total = 0,
				start = 0;
			for (var i = 0; i < data.length; i++) {
				total += data[i].value;
			}
			var arcs = [];
			for (var i = 0; i < data.length; i++) {
				var end = start + data[i].value / total * Math.PI * 2;
				arcs.push({
					start: start,
					end: end,
					color: data[i].color,
					target: start
				});
				start = end;
			}
			this.arcs = arcs;
			this.times = 0;
			this.start();
		},
		start: function() {
			this.ctx.clearRect(0, 0, this.tw, this.th);
			var t = 0,
				_this = this;
			for (var i = 0; i < this.arcs.length; i++) {
				this.arcs[i].target += 0.1 + this.times / 10 / 2;
				if (this.arcs[i].target >= this.arcs[i].end) {
					this.arcs[i].target = this.arcs[i].end;
					t++;
				}
				this.draw(this.arcs[i].start, this.arcs[i].target, this.arcs[i].color);
			}
			this.timer && clearTimeout(this.timer);
			if (t < this.arcs.length) {
				this.timer = setTimeout(function() {
					_this.start();
				}, 50);
			}
			this.times++;
		},
		draw: function(start, end, color) {
			var option = this.option,
				ctx = this.ctx,
				tw = this.tw,
				th = this.th;
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.lineWidth = option.w;
			ctx.arc(Math.floor(tw / 2), Math.floor(th / 2), option.r, start, end, false);
			ctx.stroke();
		}
	};
	var self = (am.page.billStatistics = new $.am.Page({
		id: 'page_billStatistics',
		backButtonOnclick: function() {},
		init: function() {
			this.$billStatistics_networkerror = this.$.find('.billStatistics_networkerror');
			this.$billStatistics_networkerror.hide();
			this.$billStatisticsLoading = this.$.find('.billStatistics_content .loading');
			this.$billStatisticsLoading.hide();
			this.$billStatisticsInput = this.$.find('#billStatisticsInput');
			this.$today = this.$.find('.billStatistics_date .todaybtn');
			this.$twoBtn = this.$.find('.twobtn');
			this.$twoBtn.removeClass('selected');
			this.$.find('.billStatistics_date')
				.on('vclick', '.dateInput .pre', function() {
					//当输入框中的值是三个月前的今天，pre按钮失效
					var val = self.$billStatisticsInput.val();
					if (new Date(val).getTime() < new Date(new Date().setMonth(new Date().getMonth() - 3)).getTime()) return;
					self.$billStatisticsInput.val(self.changeTime(false));
					self.changeSelected();
					self.getData();
				})
				.on('vclick', '.next', function() {
					//当输入框中的值是今天，next按钮失效
					var val = self.$billStatisticsInput.val();
					if (new Date(val).getTime() > new Date().getTime() - 86400000) return;
					self.$billStatisticsInput.val(self.changeTime(true));
					self.changeSelected();
					self.getData();
				})
				.on('vclick', '.yesterdaybtn', function() {
					self.$billStatisticsInput.val(new Date(new Date().getTime() - 86400000).format('yyyy/mm/dd'));
					$(this)
						.addClass('selected')
						.siblings()
						.removeClass('selected');
					self.changeSelected();
					self.getData();
				})
				.on('vclick', '.todaybtn', function() {
					self.$billStatisticsInput.val(new Date().format('yyyy/mm/dd'));
					self.changeSelected();
					self.getData();
				});
			this.$.find('.billStatistics_content').on('vclick', '.billStatistics_networkerror .retry', function() {
				self.getData();
			});
			self.mobiscroll();
			self.categroyScroll = new $.am.ScrollView({
				$wrap: this.$.find('.categroywrapper'),
				$inner: this.$.find('.categroywrapper .inner'),
				direction: [false, true],
				hasInput: false
			});
			self.incomeScroll = new $.am.ScrollView({
				$wrap: this.$.find('.incomewrapper'),
				$inner: this.$.find('.incomewrapper .inner'),
				direction: [false, true],
				hasInput: false
			});
			self.categroyScroll.refresh();
			self.incomeScroll.refresh();

			this.$.find('.gotoManageSys').vclick(function() {
				var random = Math.ceil(Math.random()*7)+1;
				window.open(window.config.baseSys.replace('vip4','vip'+random) + am.metadata.userInfo.mgjtouchtoken, '_blank', 'location=yes');
			});

			//小计收入汇总点击
			this.$.find('.income .title').vclick(function(){
				var childUl = $(this).next(".childUl");
				if(childUl.hasClass("active")){
					$(this).removeClass("active");
					childUl.removeClass("active");
				}else{
					self.$.find(".income .title").removeClass("active");
					self.$.find(".income .childUl").removeClass("active");
					$(this).addClass("active");
					childUl.addClass("active");
				}
				self.incomeScroll.scrollTo('top');
				self.incomeScroll.refresh();
			});
		},
		changeSelected: function() {
			if (this.$billStatisticsInput.val() == new Date().format('yyyy/mm/dd')) {
				this.$twoBtn.removeClass('selected');
				$('.twobtn.todaybtn').addClass('selected');
			} else if (this.$billStatisticsInput.val() == new Date(new Date().getTime() - 86400000).format('yyyy/mm/dd')) {
				this.$twoBtn.removeClass('selected');
				$('.twobtn.yesterdaybtn').addClass('selected');
			} else {
				this.$twoBtn.removeClass('selected');
			}
		},
		beforeShow: function(paras) {
			am.tab.main.show();
			self.$billStatisticsInput.val(new Date().format('yyyy/mm/dd'));
			self.$today
				.addClass('selected')
				.siblings()
				.removeClass('selected');
			self.categroyScroll.refresh();
			self.incomeScroll.refresh();
		},
		afterShow: function(paras) {
			this.getData();
			self.categroyScroll.scrollTo('top');
			self.incomeScroll.scrollTo('top');
		},
		beforeHide: function(paras) {},
		drawCircle: function(circle, renderobj) {
			circle.render(renderobj);
		},
		render: function(res) {
			var data = res.content;
			if (res.code != 0) {
				//没有网络的时候，出现一个刷新界面，用户点击刷新，出现loading界面，成功之后就重新render
				this.$billStatistics_networkerror.show();
			} else {
				this.$billStatistics_networkerror.hide();
				//1、perfSummary
				//1.1渲染圆圈
				var circle1 = new Circle({
					//创建圆圈实例
					canvas: document.getElementById('canvas1'),
					/*r:52,
                    w:18 跟图片一样，画布设置2倍的尺寸，css样式中1倍的尺寸，这样显示清晰*/
					r: 104,
					w: 36
				});
				/* [
                    {
                        key:'servicePerf',
                        name:'项目劳动业绩',
                        val:
                        color:
                    }
                ]
                */
				var perfData = [],
					renderobj = [],
					total1 = 0,
					perfMap = {
						servicePerf: {
							name: '项目劳动业绩',
							color: '#eb6877'
						},
						productPerf: {
							name: '卖品业绩',
							color: '#c490bf'
						},
						newCardPerf: {
							name: '开卡业绩',
							color: '#80c269'
						},
						rechargePerf: {
							name: '充值业绩',
							color: '#13b5b1'
						},
						comboCardPerf: {
							name: '套餐销售业绩',
							color: '#facd89'
						},
						annualCardPerf: {
							name: '年卡销售业绩',
							color: '#62c2ed'
						}
					},
					perfSummary = data.perfSummary,
					$perf = $('div.billStatistics.perf').find('ul');
					$perfTotal = $('div.billStatistics.perf span.total');
				$.each(perfSummary, function(key, value) {
					perfData.push({
						key: key,
						val: value,
						name: perfMap[key].name,
						color: perfMap[key].color
					});
					total1 += perfSummary[key];
				});
				perfData.sort(function(a, b) {
					return -(a.val - b.val);
				});
				if (total1 == 0) {
					renderobjGray = [{value: 100, color: '#eee'}];
					self.drawCircle(circle1, renderobjGray);
				} else {
					for (var i = 0, len = perfData.length; i < len; i++) {
						renderobj[i] = {};
						renderobj[i].value = perfData[i].val;
						renderobj[i].color = perfData[i].color;
					}
					self.drawCircle(circle1, renderobj);
				}
				//1.2渲染文字
				$perf.empty();
				if (perfSummary == null) {
                    $perfTota.hide();
					$perf.replaceWith('<div class="textGray">暂无数据</div>');
				} else {
					$.each(perfData, function(i, item) {
						var $html = $(
							'<li class="' + item.key + '">' + '<i style="background-color:' + item.color + ';"></i>' + '<span>' + item.name + '</span>' + '<span>' + (item.val || '--') + '</span></li>'
						);
						$perf.append($html);
                    });
                    $perfTotal.show().text('总计：'+total1.toFixed(2));
				}
				//2、cateData
				//2.1渲染圆圈
				var circle2 = new Circle({
					canvas: document.getElementById('canvas2'),
					r: 104,
					w: 36
				});
				var cateData = [],
					total2 = 0,
					cateSummary = data.categorySummary,
					renderobj2 = [],
					colorArr = [
						'#eb6877',
						'#c490bf',
						'#80c269',
						'#13b5b1',
						'#facd89',
						'#62c2ed',
						'#acd598',
						'#f29b76',
						'#88abda',
						'#556fb5',
						'#601986',
						'#32b16c',
						'#ff9191',
						'#ed6c9c',
						'#ffbfa4',
						'#c17e7c',
						'#ffb13c',
						'#71b2b0',
						'#cfa796',
						'#9151b3'
					],
                    $cate = $('div.billStatistics.categroy').find('ul');
                    $cateTotal = $('div.billStatistics.categroy span.total');
				$.each(cateSummary, function(i, item) {
					total2 += item.serviceMajorCategoryPerf;
					if (item.serviceMajorCategoryPerf != 0) {
						cateData.push({
							name: item.serviceMajorCategoryName,
							val: item.serviceMajorCategoryPerf,
							color: colorArr.shift()
						});
					}
				});
				cateData.sort(function(a, b) {
					return -(a.val - b.val);
				});
				if (total2 == 0) {
					renderobjGray = [{value: 100, color: '#eee'}];
					self.drawCircle(circle2, renderobjGray);
				} else {
					for (var i = 0, len = cateData.length; i < len; i++) {
						renderobj2[i] = {};
						renderobj2[i].value = cateData[i].val;
						renderobj2[i].color = cateData[i].color;
					}
					self.drawCircle(circle2, renderobj2);
				}
				//2.2渲染文字  数值为零不显示
				$cate.empty();
				if (total2 == 0) {
                    $cate.addClass('textGray').html('暂无数据');
                    $cateTotal.hide();
				} else {
					$cate.removeClass('textGray');
					$.each(cateData, function(i, item) {
						var $html = $('<li class="am-clickable">' + '<i style="background-color:' + item.color + ';"></i>' + '<span>' + item.name + '</span>' + '<span>' + item.val + '</span></li>');
						$cate.append($html);
                    });
                    $cateTotal.show().text('总计：'+total2.toFixed(2));
				}
				self.categroyScroll.refresh();
				//3、incomeSummary
				//3.1渲染圆圈
				var circle3 = new Circle({
					canvas: document.getElementById('canvas3'),
					r: 104,
					w: 36
				});
				var incomeData = [],
					renderobj3 = [],
					total3 = 0,
					incomeSummary = data.incomeSummary,
					//type 0非现金类 1现金类 2卡扣类
					//现金类:现金,银联,微信,支付宝,点评,商场卡,合作券  
					//卡扣类:储值卡扣卡，储值卡扣赠，套餐卡扣卡，套餐卡扣赠,储值卡分期赠金
					//其他非现类:自定义非现1-10,商城订单,欠款、代金券、红包、积分、免单
					incomeMap = {
						cash: {color: '#eb6877', name: '现金', type:"1"},
						pos: {color: '#c490bf', name: '银联', type:"1"},
						weixinfee: {color: '#80c269', name: '微信', type:"1"},
						payfee: {color: '#13b5b1', name: '支付宝', type:"1"},
						dianpin: {color: '#88abda', name: '点评', type:"1"},
						mallfee: {color: '#556fb5', name: '商场卡', type:"1"},
						cooperationfee: {color: '#601986', name: '合作券', type:"1"},
						memCardPay: {color: '#facd89', name: '划卡', type:"2"},
						memCardPresentPay: {color: '#62c2ed', name: '划赠送金', type:"2"},
						comboCardPay: {color: '#acd598', name: '划套餐卡金', type:"2"},
						comboCardPresentPay: {color: '#f29b75', name: '划套餐赠送金', type:"2"},
						dividefee: {color: '#73CED9', name: '划分期赠送金', type:"2"},
						mallOrderFee: {color: '#42ADDC', name: '商城订单', type:"0"},
						debtfee: {color: '#8ECE6F', name: '欠款', type:"0"},
						voucherfee: {color: '#7B2BA6', name: '代金券', type:"0"},
						mdfee: {color: '#4EC6A0', name: '免单', type:"0"},
						luckymoney: {color: '#FFC62D', name: '红包', type:"0"},
						onlineCreditPay: {color: '#F74285', name: '线上积分', type:"0"},
						offlineCreditPay: {color: '#F72E5C', name: '线下积分', type:"0"},
					},
					//颜色不够这里来拿
					incomeColorArr = ['#32B16C','#FF9191','#ED6C9C','#FFBFA4','#C17E7C','#FFB13C','#71B2B0','#CFA796','#9151B3','#73CED9'],
					$incomeCashUl = $('div.billStatistics.income').find('.incomeCashUl'),
					$incomeCardUl = $('div.billStatistics.income').find('.incomeCardUl'),
					$incomeOtherNoCashUl = $('div.billStatistics.income').find('.incomeOtherNoCashUl'),
					$incomeTotal = $('div.billStatistics.income span.total');
					
				var payConfigs = am.metadata.payConfigs || [],
					otherFeeMap = {},
					num = 0;

				//全部支付方式
				$.each(payConfigs, function(i,v){
					var field = v.field.toLowerCase();
					if(field.indexOf("otherfee") > -1){
						otherFeeMap[field] = {name:v.fieldname,type:v.type};
					}
				});

				//匹配其他支付方式
				$.each(otherFeeMap, function(q,r){
					r.color = incomeColorArr[num++];
				});

				//合并支付方式
				$.extend(incomeMap,otherFeeMap)
				// console.log(incomeMap);

				$.each(incomeSummary, function(i, item) {
					if(incomeMap[i]){
						var temp = {
							val: item,
							name: incomeMap[i].name,
							color: incomeMap[i].color,
							type: incomeMap[i].type
						};
						incomeData.push(temp);
						renderobj3.push({
							value: item,
							color: incomeMap[i].color
						});
						total3 += item;
					}
				});
				incomeData.sort(function(a, b) {
					return b.val - a.val;
				});
				if (total3 == 0) {
					renderobjGray = [{value: 100, color: '#eee'}];
					self.drawCircle(circle3, renderobjGray);
				} else {
					self.drawCircle(circle3, renderobj3);
				}
				$incomeCashUl.empty();
				$incomeCardUl.empty();
				$incomeOtherNoCashUl.empty();
				if (incomeSummary == null) {
                    $('div.billStatistics.income .treeUl').replaceWith('<div class="textGray">暂无数据</div>');
                    $incomeTotal.hide();
				} else {
					var cashSum = 0,cardSum = 0,otherCashSum = 0;
					$.each(incomeData, function(i, item) {
						// console.log(item);
						if(item.type == "0"){// 其他非现类
							var $li0 = $(
								'<li class="am-clickable">' + '<i style="background-color:' + item.color + ';"></i>' + '<span>' + item.name + '</span>' + '<span>' + (item.val || '--') + '</span></li>'
							);
							$incomeOtherNoCashUl.append($li0);
							otherCashSum += item.val || 0;
						}else if(item.type == "1"){// 现金类
							var $li1 = $(
								'<li class="am-clickable">' + '<i style="background-color:' + item.color + ';"></i>' + '<span>' + item.name + '</span>' + '<span>' + (item.val || '--') + '</span></li>'
							);
							$incomeCashUl.append($li1);
							cashSum += item.val || 0;
						}else if(item.type == "2"){// 卡扣类
							var $li2 = $(
								'<li class="am-clickable">' + '<i style="background-color:' + item.color + ';"></i>' + '<span>' + item.name + '</span>' + '<span>' + (item.val || '--') + '</span></li>'
							);
							$incomeCardUl.append($li2);
							cardSum += item.val || 0;
						}
					});
					self.$.find(".cashSum").html(cashSum.toFixed(2));
					self.$.find(".cardSum").html(cardSum.toFixed(2));
					self.$.find(".otherCashSum").html(otherCashSum.toFixed(2));
                    $incomeTotal.show().text('总计：'+total3.toFixed(2));
				}
				self.incomeScroll.refresh();
				self.incomeScroll.scrollTo('top');
				//4、customerSummary
				//4.1渲染矩形
				var valueList4 = [],
					maxValue = 0,
					total4 = 0;
				var customerSummary = data.customerSummary;
				$.each(customerSummary, function(key, value) {
					valueList4.push(customerSummary[key]);
					total4 += customerSummary[key];
					maxValue < customerSummary[key] && (maxValue = customerSummary[key]);
				});
				//4.2渲染文字
				var customerSummaryName = {
					maleCount: '男客数',
					femaleCount: '女客数',
					specifiedCount: '指定客数',
					unspecifiedCount: '非指定客数',
					specifiedMaleCount: '指定男客数',
					unspecifiedMaleCount: '非指定男客数',
					specifiedFemaleCount: '指定女客数',
					unspecifiedFemaleCount: '非指定女客数'
				};
				var $customerSummaryList = $('div.billStatistics.customer').find('ol');
				$customerSummaryList.empty();
				//渲染DOM
				if (customerSummary == null) {
					for (var key in customerSummaryName) {
						$customerSummaryList.get(0).innerHTML += '<li><div class="rectgray"></div><div class="text">' + customerSummaryName[key] + '</div></li>';
					}
				} else {
					for (var key in customerSummary) {
						if (total4 == 0) {
							$customerSummaryList.get(0).innerHTML +=
								'<li><div class="num">' +
								(customerSummary[key] === null ? '——' : customerSummary[key]) +
								'</div><div class="rectgray"></div><div class="text">' +
								customerSummaryName[key] +
								'</div></li>';
						} else {
							$customerSummaryList.get(0).innerHTML +=
								'<li><div class="num">' +
								(customerSummary[key] === null ? '——' : customerSummary[key]) +
								'</div><div class="rect"></div><div class="text">' +
								customerSummaryName[key] +
								'</div></li>';
						}
					}
				}
				var $lis = $('div.billStatistics.customer ol>li');
				//渲染数据
				if (total4 == 0) {
					var height = 14;
					$lis.each(function(i) {
						var left = 0;
						left = 90 * i;
						$(this).css('left', left + 'px');
						$(this)
							.find('.rectgray')
							.css('height', height + 'px');
					});
				} else {
					var height = 70;
					$lis.each(function(i) {
						var left = 0;
						left = 90 * i;
						height = 70 * valueList4[i] / maxValue;
						$(this).css('left', left + 'px');
						$(this)
							.find('.rect')
							.css('height', height + 'px');
					});
				}
			}
		},
		getData: function() {
			var self = this;
			var today = new Date();
			var yesterday = new Date(new Date().getTime() - 86400000);
			var metadata = am.metadata;
			var period = $('#billStatisticsInput').val() == undefined ? today : $('#billStatisticsInput').val();
			am.api.billStatistics.exec(
				{
					parentShopId: /*13120*/ metadata.userInfo.parentShopId,
					shopId: /*13121*/ metadata.userInfo.shopId,
					period: /*"2018-05-20"*/ period
				},
				function(res) {
					am.loading.hide();
					if (res.code == 0) {
						self.render(res);
					} else {
						am.msg(res.message || '数据获取失败,请检查网络!');
						self.render(res);
					}
				}
			);
		},
		changeTime: function(flag) {
			var value = this.$billStatisticsInput.val();
			var d = new Date(value).getTime();
			if (flag) {
				var n = new Date(d + 86400000).format('yyyy/mm/dd');
			} else {
				var n = new Date(d - 86400000).format('yyyy/mm/dd');
			}
			return n;
		},
		mobiscroll: function() {
			var min = new Date(new Date().setMonth(new Date().getMonth() - 3));
			var max = new Date();
			$('#billStatisticsInput')
				.mobiscroll()
				.calendar({
					theme: 'mobiscroll',
					lang: 'zh',
					display: 'bottom',
					months: 'auto',
					setOnDayTap: true,
					max: max,
					min: min,
					buttons: [],
					endYear: amGloble.now().getFullYear()+50,
					onSet: function(valueText, inst) {
						self.valueText = valueText;
						self.getData();
						self.changeSelected();
					}
				});
		}
	}));
	//billStatistics mock
	/*am.api.billStatistics.exec = function(data,cb){
        setTimeout(function(){
            cb({
                "code": -1,
                    "message": "success",
                    "ts": 1473156708276,
                    "content": {
                        "customerSummary":{//客数汇总
                            "maleCount": 0,
                            "femaleCount": 0,
                            "specifiedCount": 0,
                            "unspecifiedCount": 0,
                            "specifiedMaleCount": 0,
                            "unspecifiedMaleCount": 0,
                            "specifiedFemaleCount": 0,
                            "unspecifiedFemaleCount": 0,
                        },
                        "perfSummary":{//业绩汇总
                            "servicePerf": 0.0,
                            "productPerf": 0.0,
                            "newCardPerf": 0.0,
                            "rechargePerf": 0.0,
                            "comboCardPerf": 0.0,
                            "annualCardPerf": 0.0
                        },
                        "categorySummary":[//分项业绩汇总
                            {
                            "serviceMajorCategoryName": "洗剪吹",
                            "serviceMajorCategoryPerf": 0.0
                            },
                            {
                            "serviceMajorCategoryName": "烫染焗",
                            "serviceMajorCategoryPerf": 0.0
                            }
                        ],
                        "incomeSummary":{//收入汇总
                            "cash": 0.0,//现金
                            "pos": 0.0,//银联
                            "memCardPay": 0.0,//储值卡——会员卡
                            "memCardPresentPay":0.0,//储值卡赠送金支付
                            "comboCardPay": 0.0,//套餐卡
                            "comboCardPresentPay":0.0,//套餐卡赠送支付
                            "otherBillingPay": 0.0//其他支付
                        }
                    }
            })
        })
    } */
})();

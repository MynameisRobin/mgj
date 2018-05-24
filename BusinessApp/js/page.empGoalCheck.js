amGloble.page.empGoalCheck = new $.am.Page({
	id: 'page-empGoalCheck',
	type: 0, //判断是什么身份登录 0 管理员 1 员工
	opt: {}, //接口需要的原数据
	extraData: null, //其他数据
	meta: {},
	backButtonOnclick: function() {
		if (this.type == 1) {
			$.am.changePage(amGloble.page.dashboard, 'slideright', 'back');
		} else {
			$.am.changePage(amGloble.page.empGoalsList, 'slideright', 'change');
		}
	},
	init: function() {
		var self = this;
		this.reportFilter = new amGloble.ReportFilter({
			$: this.$.find('.am-body-wrap'), //选择器的dom将插入到此节点后面
			onDatePickerClick: function() {},
			onchange: function() {
				//条件修改时触发
				var val = new Date(self.reportFilter.getDate());
				if (self.type == 0) {//管理员界面	员工界面没有切换员工
					var emp = self.reportFilter.getEmp();
					if (emp.empid) {
						self.opt.empId = emp.empid;
					}
					if (emp.empId) {
						self.opt.empId = emp.empId;
					}
					self.opt.dutyType = self.extraData.empTypeMap[self.extraData.empDutyMap[self.opt.empId]];
                }
				self.opt.targetYear = val.getFullYear();
				self.opt.targetMonth = val.getMonth() + 1;
				self.getData(self.opt, self.type);
				self.resetSwitch();
			}
		});
		this.$setBtn = this.$.find('.set_icon').vclick(function() {
			//员工设置
			$.am.changePage(amGloble.page.setEmpGoal, 'slideleft', self.meta);
		});
		this.$switch = this.$.find('.switch_btn').vclick(function() {
			var targets = self.$wrap.data('targets');
			if (self.$wrap.hasClass('spread')) {
				self.render(targets, self.type);
				self.$wrap.removeClass('spread');
				$(this).text('查看上月及去年本月对比图');
			} else {
				self.render(targets, self.type, 'spread');
				self.$wrap.addClass('spread');
				$(this).text('隐藏对比图');
			}
			self.scrollview.scrollTo('top');
			self.scrollview.refresh();
		});
		this.targetMap = {
			'1': {
				name: '现金业绩',
				icon: 'icon-zhanghuyue'
			},
			'2': {
				name: '劳动业绩',
				icon: 'icon-meihua'
			}
		};
		this.$title = this.$.find('.am-header .title');
		this.$wrap = this.$.find('.am-body-wrap'); //总载体 error spread 状态切换页面元素内容
		this.$charts = this.$wrap.find('.goal-chart-wrapper'); //用来清空
		this.$chart = this.$charts.find('.goal-chart-container').clone().remove(); //用来循环显示
		this.$circlesWrap = this.$wrap.find('.circle_wrapper');
		this.$circles = this.$wrap.find('.circle_charts'); //用来清空
		this.$circle = this.$wrap.find('.circle_chart').clone().remove();
	},
	beforeShow: function(para) {
        if( para == 'back' ){
            return;
        }
		var self = this,
			userType = amGloble.metadata.userInfo.userType,
			now = new Date(),
			filterOpt = {
				enableDept: false,
				enableLevel: false,
				disableFilter: false,
				enableCategory: false,
				selectTime: false,
				enableShop: false,
				enableEmp: false,
				datePickerType: 'ym',
				refresh: true
			},
			parentShopId = amGloble.metadata.userInfo.parentShopId;
		this.type = userType == 1 ? 1 : 0;
		if (this.type == 1) {//员工身份
			filterOpt.enableEmp = false;
			filterOpt.maxTime = new Date(now.getFullYear(), now.getMonth());
			this.reportFilter.setOpt(filterOpt);
			this.opt.shopId = amGloble.metadata.userInfo.shopId;
			this.opt.parentShopId = parentShopId;
			this.opt.empId = amGloble.metadata.userInfo.userId;
			// this.opt.dutyType = this.extraData.empTypeMap[this.extraData.empDutyMap[amGloble.metadata.userInfo.userId]];//员工登陆不用传dutyType
			this.opt.targetYear = now.getFullYear();
			this.opt.targetMonth = now.getMonth() + 1;
			this.getData(this.opt, this.type);
		} else {//管理员身份
			if (typeof para == 'object' && para.targetYear) {
				console.log(para);
				this.meta = para;
				this.transData(para);
				filterOpt.enableEmp = true;
				filterOpt.emps = this.extraData.empList;
				this.reportFilter.setOpt(filterOpt);
				this.opt.shopId = para.shop.shopId;
				this.opt.parentShopId = parentShopId;
                this.opt.empId = para.empTarget.empId;
                this.opt.dutyType = this.extraData.empTypeMap[this.extraData.empDutyMap[para.empTarget.empId]];
				this.opt.targetYear = para.targetYear;
				this.opt.targetMonth = para.targetMonth;
				this.getData(this.opt, this.type);
				var emp = this.extraData.empMap[para.empTarget.empId];
				this.reportFilter.setEmp(emp, true);
				this.reportFilter.setDate(para.targetYear + '/' + para.targetMonth, null, true);
			}
		}
		this.resetSwitch();
	},
	afterShow: function() {},
	beforeHide: function() {},
	afterHide: function() {},
	resetSwitch: function() {
		this.$wrap.removeClass('spread noSet').find('.switch_btn').text('查看上月及去年本月对比图');
	},
	checkRight: function(data, type) {
		//权限
		var flag = true,
			now = new Date(),
			queryTime = new Date( data.empTarget.targetYear + '/' + data.empTarget.targetMonth + '/01' ).getTime(),
			nowTime = new Date( now.getFullYear() + '/' + (now.getMonth() + 1) + '/01' ).getTime(),
			todayPercent = now.getDate() / this.getCountDays();
		if (queryTime < nowTime) {
			flag = false;
		}
		if (amGloble.metadata.userInfo.shopType == 0) {
			flag = false;
		}
		if (data.empTarget.id && todayPercent > 0.5 && data.empTarget.targetYear == now.getFullYear() && data.empTarget.targetMonth == now.getMonth() + 1) {//设置目标了 并且查看日期是当前日期 并且进度已经过半了 就不让设置
			flag = false;
		}
		return flag;
	},
	transData: function(para) {
		var res = {};
		res.shopId = para.shop.shopId;
		res.parentShopId = para.shop.parentShopId;
		res.empId = para.empTarget.empId;
		res.dutyId = para.empTarget.dutyId;
		res.empName = para.empTarget.empName;
		res.targetYear = para.targetYear;
		res.targetMonth = para.targetMonth;
		res.empList = [];
        res.empMap = {};
        res.empLevelMap = {};
        res.empDutyMap = {};
        res.empTypeMap = {};
        res.roleMap = {};
		if (para.empLevels) {
			$.each(para.empLevels, function(i, item) {
                res.empLevelMap[item.dutyId] = item.name;
                res.empTypeMap[item.dutyId] = item.dutyType;
			});
        }
        if (para.empRoles) {
			$.each(para.empRoles, function(i, item) {
				res.roleMap[item.id] = item.name;
			});
		}
		if (para.empTargets) {
			$.each(para.empTargets, function(i, item) {
				item.name = item.empName;
				res.empList.push({
					name: item.empName+'-'+res.empLevelMap[item.dutyId],
					innerName:item.empName,
					empId: item.empId,
                    dutyId: item.dutyId,
                    dutyType: res.empTypeMap[item.dutyId]
				});
				res.empMap[item.empId] = item;
                res.empDutyMap[item.empId] = item.dutyId;
			});
		}
		
		console.log(res);
		this.extraData = res;
	},
	getData: function(opt, type) {
		//获取员工目标数据
		var self = this;
		amGloble.loading.show();
		amGloble.api.queryEmpTarget.exec(opt, function(ret) {
			console.log(ret);
			amGloble.loading.hide();
			if (ret.code == 0 && ret.message == 'success') {
				var data = ret.content;
				$.extend(true, self.meta, data);
				console.log(self.meta);
				self.$wrap.data('targets', data);
				self.render(data, type);
			} else {
				amGloble.msg(ret.message || '数据获取失败,请重试!');
			}
		});
	},
	render: function(data, type, mode) {//data 目标数据 type 员工还是管理员 mode 是否是展开模式 default false
		var self = this,
			now = new Date(),
			days = this.getCountDays(),
			flag = this.checkRight(data, type),
			empTargetConfig = {},
			lander = this.type,//0  管理员 1 员工
			hasShopTarget = data.shopTarget? 1 : 0;
		if (this.type == 0) {//manager
			this.$title.text(this.extraData.empMap[data.empTarget.empId].empName + (data.empTarget.targetMonth == now.getMonth() + 1 ? '本月' : data.empTarget.targetMonth + '月') + '目标完成度');
			this.$setBtn.removeClass('hide');
			if (!flag || !hasShopTarget ) {//没有门店目标
				this.$setBtn.addClass('hide');
			}
		} else {
			this.$setBtn.addClass('hide');
			this.$title.text('我的本月目标完成度');
		}
		this.$charts.empty();
		this.$circles.empty();
		if(data.empTarget.targetTypes){//根据配置
			empTargetConfig = data.empTarget.targetTypes;
		}
		$.each(data.empTarget.targets, function(i, item) {
			if(empTargetConfig.indexOf(item.type)>-1){//配置了的数据就显示
				var opt = {},
					datasets = [],
					$chart = self.$chart.clone();
				$chart.find('.goal_tit>.icon').addClass(self.targetMap[item.type].icon);
				var queryTime = new Date( data.empTarget.targetYear + '/' + self.getStanderMonth(data.empTarget.targetMonth) + '/01' ).getTime();
				var nowTime = new Date(now.getFullYear() + '/' + self.getStanderMonth(now.getMonth() + 1) + '/01').getTime();
				var timeFlag = self.timeFlag(queryTime,nowTime);
				// item.target = 8000;//mock
				if(timeFlag==2){
					self.$wrap.find('.goal_tip').text('未开始');
					self.$wrap.addClass('noSet');
				}else{
                    self.$wrap.find('.goal_tip').text('');
                }
				if (!item.target) {//没有目标
					var noMainConfig = self.renderNoTargetTitle($chart,lander,item.achi,item.type,timeFlag);
					opt = {
						bigger: true,
						color0: '#133071',
						percent1: noMainConfig.percent1,
						percent2:noMainConfig.percent2,
						single: noMainConfig.single,
						text2: noMainConfig.text2,
						text1: noMainConfig.text1
					};
					self.$wrap.addClass('noSet');
					datasets.push(opt);
				} else {//有目标
					$chart.find('.goal_tit>.text').text('目标' + (item.target.toLocaleString()));
					if (timeFlag==2) {//未开始 不显示业绩预期
						opt = {
							bigger: true,
							color0: '#133071',
							percent1: 0,
							single: true
						};
						datasets.push(opt);
					} else {
						if (!item.achi) {
							item.achi = 0;
						}
						var mainConfig = self.calMainConfig(item.achi,item.target);
						opt = {
							bigger: true,
							percent1: (timeFlag==1? Math.round(now.getDate() / days * 100):0),//过去不显示预期
							percent2: mainConfig,
							text1: (timeFlag==1?'预期':''),//过去不显示预期
							text2: (item.type == 1 ? '现金业绩' : '劳动业绩') + '<br><span>' + Math.round(item.achi).toLocaleString() + '</span>'
						};
                        datasets.push(opt);
						if (mode) {
							//默认不显示 去年对比 切换的时候显示
							if (item.lastMonthAchi) {
								var configMonth = self.calConfig(item.lastMonthAchi, item.lastMonthTarget, 1);
								var optMonth = {
									bgcolor: '#395698',
									single: true,
									color0: 'rgba(255, 202, 68, 0.26)',
									percent1: configMonth.percent,
									text2: configMonth.text2
								};
								datasets.push(optMonth);
							}
							if (item.lastYearAchi) {
								var configYear = self.calConfig(item.lastYearAchi, item.lastYearTarget, 2);
								var optYear = {
									bgcolor: '#395698',
									single: true,
									color0: 'rgba(43, 206, 118, 0.26)',
									percent1: configYear.percent,
									text2: configYear.text2
								};
								datasets.push(optYear);
							}
						}
						self.$wrap.removeClass('noSet');
					} 
				}
				$.am.debug.log("queryTime:" + timeFlag);
				$.am.debug.log("opt:" + datasets);
				self.$charts.append($chart);
				var chart = new ChartBar({
					target: $chart.find('.goal-chart'),
					vertical: true,
					config: {
						color0: '#173576'
					},
					datasets: datasets
				});
				chart.animation();
				// if (mode) {
				// 	self.$circlesWrap.show();
				// 	var shopConfig = self.calShopConfig(item.target, data.shopTarget, item.type);
				// 	var $circle = self.$circle.clone();
				// 	self.$circles.append($circle);
				// 	var circle = new SectorBar({
				// 		title: shopConfig.title,
				// 		target: $circle.get(0),
				// 		percent: shopConfig.percent,
				// 		total: shopConfig.total,
				// 		width: 120,
				// 		height: 120
				// 	});
				// 	circle.do(true);
				// } else {
				// 	self.$circlesWrap.hide();
				// }
			}
		});
		self.scrollview.scrollTo('top');
		self.scrollview.refresh();
	},
	timeFlag:function(query,now){
		if(query>now){
			return 2;//将来
		}else if (query==now){
			return 1;//当月
		}else{
			return 3;//过去
		}
	},
	calMainConfig:function(achi,target){
		var res = Math.round(achi / target * 100);
		if(res>100){
			res = 100;
		}
		return res;
	},
	getStanderMonth:function(mon){
		if(mon>=10){
			return mon;
		}else{
			return '0'+mon;
		}
	},
	renderNoTargetTitle:function($dom,lander,achi,type,timeFlag){//未设定业绩
		var config = {},
			now = new Date(),
			days = this.getCountDays();
		$dom.find('.goal_tit>.text').text('目标未设定');
		if( timeFlag == 2 ){//将来-不显示业绩，不显示预期
			config.text2 = '';
			config.single = true;
		}else if( timeFlag == 3 ){//过去-只显示业绩，不显示预期
			config.percent2 =  0 ;
			config.text2 = ( this.targetMap[type].name) + '<br><span>' + ( achi?Math.round(achi) : 0 ).toLocaleString() + '</span>';
			config.single = true;
		}else if( timeFlag == 1 ){//当月-
			config.text2 = ( this.targetMap[type].name) + '<br><span>' + ( achi?Math.round(achi) : 0 ).toLocaleString() + '</span>';
			config.percent2 =  0 ;
			config.percent1 =  Math.round(now.getDate() / days * 100);
			config.text1 = '预期';
			config.single = false;
		}
		return config;
    },
    toMoneyStyle:function(money){
        return parseInt(new Number(money).toFixed(0)).toLocaleString();
    },
	calConfig: function(achi, target, type) {
		var config = {};
		var tit = {
			'1': '上月',
			'2': '去年本月'
		};
		if (achi) {
			if (!target) {
				config.percent = 100;
				config.text2 = tit[type] + '<br>' + (this.toMoneyStyle(achi) || 0);
			} else {
				config.percent = Math.round(achi / target * 100);
				if (config.percent >= 100) {
					config.percent = 100;
				}
				config.text2 = tit[type] + '<br>' + this.toMoneyStyle(achi) + '/' + this.toMoneyStyle(target) + '<br>完成度' + config.percent + '%';
			}
		}
		console.log(config);
		return config;
	},
	calShopConfig: function(target, shopTarget, type) {
		var config = {
			title: this.targetMap[type].name,
			percent: 100,
			total: 100
		};
		config.percent = Math.round(target);
		if (type == 1) {
			config.total = Math.round(shopTarget.cashAchiTarget);
		} else {
			config.total = Math.round(shopTarget.workAchiTarget);
		}
		console.log(config);
		return config;
	},
	getExpectationPercent: function(target, date, num) {
		return Math.round(date / num * 100);
	},
	getAchiPercent: function(achi, target) {
		return Math.round(achi / target * 100);
	},
	getCompletion: function(achi, target) {
		return Math.round(achi / target * 100);
	},
	getCountDays: function() {
		var curDate = new Date();
		var curMonth = curDate.getMonth();
		curDate.setMonth(curMonth + 1);
		curDate.setDate(0);
		return curDate.getDate();
	}
});

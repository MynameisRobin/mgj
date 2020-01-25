(function() {
	var createImage = function(cb,fcb){
		var img = new Image();
		img.onload = function(){
			cb && cb();
		}
		img.error = function(){
			fcb && fcb();
		}
		return {
			setHref:function(src,cb){
				img.src = src;
				cb && cb();
			}
		}
	}
	var attendance = {
		init:function(){
			this.$     = $("#about_content");
			this.timer = null;
			this.diff  = 8000; 
			this.$img  = this.$.find(".attendance_left_content .p3");
			this.$box  = this.$.find(".attendance_left_content");

			this.$time = this.$box.find(".p1");
			this.$week = this.$box.find(".p2");
			this.resetCss();
		},
		setTime:function(){
			var weekMap = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
			var d = am.now();
			var t = "",w="";
			var d1= d.format("mm-dd");
			var d2 = d1.split("-"); 
			t = Number(d2[0]) + "月" + Number(d2[1]) + "日";
			w = weekMap[d.getDay()];
			this.$time.html(d.format("HH:MM"));
			this.$week.html(t + " " + w);
		},
		resetCss:function(){
			var w = 0.3369*$('body').width();
			var h = 0.667*$('body').height();
			var iw = iw = 0.39*h;
			this.$img.css({
				"width": iw + "px",
				"height":iw + "px"
			});
			this.$box.css({
				"width": w + "px",
				"height":h + "px",
				"max-width": iw + iw*0.72 + "px"
			});
		},
		createCode:function(message){
			// if($.isPlainObject(message)){
			// 	message = JSON.stringify(message);
			// }
			var url = "http://common.meiguanjia.net/component/genqr?message="+ encodeURIComponent(JSON.stringify(message)) + '&width=300&height=300';
			var src = jrQrcode.getQrBase64(JSON.stringify(message), {
				padding: 0,
				width: 300,
				height: 300,
				correctLevel: QRErrorCorrectLevel.L
			});
			return {
				base:src,
				url:url
			}
		},
		createScreen:function(src){
			try{//设置图片
				navigator.appplugin.secondScreen({
					type: 3,
					title: "考勤",
					content: "请扫描二维码打卡",
					imgUrl:src
				}, function (msgCode) {
                    $.am.debug.log("进入第一个回调！");
                    $.am.debug.log(msgCode);
                }, function (msgCode) {
                    $.am.debug.log("进入第二个回调！");
                    $.am.debug.log(msgCode);
                });
			}catch(e){}
			
		},
		start:function(){
			var attendanceCodeSetting = localStorage.getItem(amGloble.metadata.userInfo.userId+'_attendanceCodeSetting');
			if(!attendanceCodeSetting){
				this.diff = 8*1000;
				this.refreshInterval = 4*1000;
			}else {
				attendanceCodeSetting = JSON.parse(attendanceCodeSetting);
				this.diff = attendanceCodeSetting.invailidInterval*1000;
				this.refreshInterval = attendanceCodeSetting.refreshInterval*1000;
			}

			var _this  = this;
			// var urls = _this.createCode({
			// 	createTime:new Date(am.now()).getTime(),
			// 	type:"attendance",
			// 	shopId:amGloble.metadata.userInfo.shopId,
			// 	timeDifference:_this.diff,
			// 	token:am.metadata.userInfo.mgjtouchtoken
			// });
			var urls = _this.createCode('*_'+new Date(am.now()).getTime()+'_'+amGloble.metadata.userInfo.shopId+'_'+_this.diff);
			var img = createImage();
			img.setHref(urls.base,function(){
				_this.$img.html('<img src="'+urls.base+'" />');
				_this.createScreen(urls.url);
			});
			this.timer && clearInterval(this.timer);
			this.timer = setInterval(function(){
				// var urls2 = _this.createCode({
				// 	createTime:new Date(am.now()).getTime(),
				// 	type:"attendance",
				// 	timeDifference:_this.diff,
				// 	shopId:amGloble.metadata.userInfo.shopId,
				// 	token:am.metadata.userInfo.mgjtouchtoken
				// });
				var urls2 = _this.createCode('*_'+new Date(am.now()).getTime()+'_'+amGloble.metadata.userInfo.shopId+'_'+_this.diff);
				img.setHref(urls2.base,function(){
					_this.$img.html('<img src="'+urls2.base+'" />');
					_this.createScreen(urls2.url);
				});
			},this.refreshInterval);

			//时间格式化
			_this.setTime();
			this.nowTime && clearInterval(this.nowTime);
			this.nowTime = setInterval(function(){
				_this.setTime();
			},5000);//5秒刷新一次
		},
		end:function(){
			this.timer   && clearInterval(this.timer);
			this.nowTime && clearInterval(this.nowTime);
			var params = JSON.parse(JSON.stringify(am.metadata.configs));
			am.mediaShow(0,params);
		}
	}
	var attendanceList = {
		init:function(){
			this.$box  = $("#page_about .attendance_right .list");
			this.$list = $("#page_about .attendance_right .list ul");
			this.$item = this.$list.find("li:first").remove();
			this.ScrollView = new $.am.ScrollView({
				$wrap: $("#page_about .attendance_right .list"),
				$inner: $("#page_about .attendance_right .list ul"),
				direction: [false, true],
				hasInput: false,
				bubble:true
			});
		},
		getSearchData:function(){
			var res = {};
			res.shopId = amGloble.metadata.userInfo.shopId;
			res.period = this.getPeriod();
			return res;
		},
		getPeriod:function(){
			var d  = new Date();
			s1 = d.format("yyyy/mm/dd") + " 00:00:00";
			s2 = d.format("yyyy/mm/dd") + " 23:59:59";
			return new Date(s1).getTime() + "_" + new Date(s2).getTime();
		},
		getData:function(cb){
			var _this=this;
			amGloble.loading.show();
			var data = this.getSearchData();
            amGloble.api['employeeRecord'].exec(data, function(ret) {
                amGloble.loading.hide();
                if (ret.code == 0) {
					cb && cb(ret.content);
                } else {
                    am.msg("打卡记录获取失败！");
                }
            });
		},
		getMoreList:function(list){
			var res = [];
			if(list && list.length){
				for(var i=0;i<list.length;i++){
					var item = list[i];
					var ret  = {
						roleType:item.roleType,
						employeeId:item.employeeId,
						name:item.name,
						msName:item.msName
					} 
					if(item.status!=3){
						if(item.employeeGoWorkTime){
							res.push($.extend({},ret,{
								status:1,//工作中
								time:item.employeeGoWorkTime,
							}));
						}
						if(item.employeeOutWorkTime){
							res.push($.extend({},ret,{
								status:0,//休息中
								time:item.employeeOutWorkTime,
							}));
						}
					}
				}
			}
			res.sort(function(a,b){
				return b.time - a.time;
			});
			return res;
		},
		render:function(list){
			this.$list.empty();
			this.$box.removeClass("empty");
			var renderList = this.getMoreList(list);
			for(var i=0;i<renderList.length;i++){
				var item = renderList[i],
					$item= this.$item.clone(true,true);
				// if(item.status==3){//未出勤加的备注
				// 	continue;
				// }
				if(item.status == 0){
					$item.find(".p2").html("休息中");
					$item.find(".c-time").html("下班" + new Date(item.time).format("HH:MM"));	
				}else{
					$item.find(".p2").html("工作中");
					$item.find(".c-time").html("上班" + new Date(item.time).format("HH:MM"));	
				}
							
				var userInfo = amGloble.metadata.userInfo;
				var type = item.roleType == 1 ? "artisan" : "manager";
				var emp = amGloble.metadata.empMap[item.employeeId];
				var updateTs = '';
				if(emp && emp.mgjUpdateTime){
					updateTs = new Date(emp.mgjUpdateTime).getTime();
				}
				$item.find(".logo").html(amGloble.photoManager.createImage(type, {
					parentShopId: userInfo.parentShopId,
					updateTs: updateTs
				}, item.employeeId + ".jpg", "s"));
				$item.find(".p1").html(item.name);
				$item.find(".c-right").find(".c-type").html(item.msName);
				$item.data("item",item);
				this.$list.append($item);
			}
			if(this.$list.find("li").size()==0){
				this.$box.addClass("empty");
			}
			this.ScrollView.refresh();
		}
	}
	var self = am.page.about = new $.am.Page({
		id : "page_about",
		backButtonOnclick : function() {

		},
		init : function() {
			attendance.init();
			attendanceList.init();
			//财务优化彩蛋
			var eggWhiteArr = [],
			compareTime = function(time1, time2) {
				return time2 / 1000 - time1 / 1000;
			};
			this.$remarksWrap = this.$.find('.remarksWrap').hide(); // 系统设置的备注wrap
			this.$empSortWrap = this.$.find('.empSortWrap').hide(); // 系统设置员工排序
			this.$remarksTitle = this.$remarksWrap.find('.remarksTitle');
			this.$remarksTip = this.$remarksWrap.find('.remarksTip');
			this.$remarkScrollInner = this.$remarksWrap.find('.scrollInner');
			this.$inputWrap = this.$remarksWrap.find('.inputWrap').remove();
			this.remarksScrollView = new $.am.ScrollView({
				$wrap: self.$remarksWrap.find(".scrollWrap"),
				$inner: self.$remarksWrap.find(".scrollInner"),
				direction: [false, true],
				hasInput: false,
			});
			$("#about_tab").on("vclick","li",function(){
				$(this).addClass('selected').siblings('li').removeClass("selected");
				var index=$(this).index();
				console.log(index,'index')
				$("#about_content > li").eq(index).show().siblings().hide();
				if(index==8){
					self.aboutScroll = new $.am.ScrollView({
						$wrap: self.$.find(".about"),
						$inner: self.$.find(".about>div"),
						direction: [false, true],
						hasInput: false,
						bubble:false
					});
					self.aboutScroll.refresh();
					self.aboutScroll.scrollTo("top");
				}
				if(index==0){
					self.resetPage();
					self.refreshData();
					attendance.start();
				}
				if(index==2){//
					$.am.changePage(am.page.prepay, "slideup");
				}
				if(index==9){
					//账户滑动
					self.ScrollView_zh = new $.am.ScrollView({
						$wrap: self.$.find(".account"),
						$inner: self.$.find(".account .tabdiv"),
						direction: [false, true],
						hasInput: false,
						bubble: true
					});
					self.ScrollView_zh.refresh();
					// 锁屏配置
					if(!self.lockConfig){
						self.lockConfig = new $.am.lockConfig({
							$: self.$.find(".account")
						});
					}
				}
				if(index==3){
					if(!self.payOutList){
						self.payOutList = new $.am.payoutAndIncome({
							$: $('#about_content li.payout'),
							type: 2,
							add: function(){
								$.am.changePage(am.page.addPayOut,'slideup');
							}
						})
					}
				}

				if(index==4){
					if(!self.inComeList){
						self.inComeList = new $.am.payoutAndIncome({
							$: $('#about_content li.income'),
							type: 1,
							add: function(){
								$.am.changePage(am.page.addIncome,'slideup');
							}
						})
					}
				}

				if(index==9){
					//财务优化彩蛋
					var nowTime = new Date().getTime();
						eggWhiteArr.push(nowTime);
					
					var num = compareTime(eggWhiteArr[0], nowTime);
						console.log(num, eggWhiteArr);
					if(num >= 0.5) {
						if(eggWhiteArr.length >= 3) {
							eggWhiteArr = [];
							$.am.changePage(am.page.financeOpt, "");
						}else {}
					}else {}
				}
				if(index == 11){
					// 系统设置
					console.log('系统设置');
					self.$secTabsWrap.find('span').removeClass('selected').eq(0).trigger('vclick');
				}
			});
			this.$tickeNum = $('#about_content').find('.condition');
			this.userInfo = {};
			this.verifyData = [];
			this.$userBox = $('#about_content .container-wrap').find('.detailMode');
			this.$leftBox = $('#about_content').find('.container-wrap .detailLf');
			this.$rightBox = $('#about_content').find('.container-wrap .detailRt');
			this.$verifyBtn = $('#about_content').find('.verifyBtn');
			$('.page_about .mallOrderHandel').on("vclick",".scan",function(){//点了之后调摄像头
			    cordova.plugins.barcodeScanner.scan(function(result) {
			        // $.am.debug.log("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
			        if(result && result.text){
			            self.$tickeNum.val(result.text);
			            if(self.checkCode(result.text)){
			            	self.getUserInfo(result.text);
			            }else{
			            	am.msg('请输入正确的券号!');
			            }
			        }
			    }, function(error) {
			        amGloble.msg(error);
			    });
			}).on("vclick",".search",function(e){//查询
				e.stopPropagation();
				var val=self.$tickeNum.val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g,'');
				self.$tickeNum.val(val)
				if(self.checkCode(val)){
					self.getUserInfo(val);
				}else{
					am.msg('请输入正确的券号!');
				}
				return false;
			}).on("vclick",".verifyBtn",function(){//审核订单
				var data=self.$userBox.data("orderdata");
				var orderId=data.id;
				var shopId=am.metadata.userInfo.shopId;
				var opt={
					"orderId":orderId,
					"shopId":shopId
				}
				var res=self.isBelongToMyShop(shopId);
				if(!res) {
					am.msg('该券不能在此门店使用');
					return;
				}
				if(am.checkDate(data)) return;
				//美一刻购买的套餐订单不能在此处使用
				if(data.mallItem && data.mallItem.packageInfo){
					return am.msg("商城购买的套餐订单需要顾客在美一客/小程序中进行核销");
				}
				am.loading.show("正在核销,请稍候...");
				am.api.verifyOrder.exec(opt, function (res) {
					am.loading.hide();
					console.log(res);
					if (res.code == 0) {
						am.msg('核销成功!');
						var data=self.$userBox.data("orderdata");
						data.status=3;
						self.renderOrderInfo(data);
					} else {
						am.msg(res.message || "数据获取失败,请检查网络!");
					}
				});
			}).on("vclick",".toggleBtn",function(){//查看验券记录
				$.am.changePage(am.page.verifyRecord, "slideup");
			});
	        // this.aboutScroll.refresh();
			
			this.$.find('div.autopay .am-radio').vclick(function () {
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
					localStorage.setItem('mgjAutoPayFirstDisabled',1);
				}else{
					$(this).addClass('checked');
					localStorage.removeItem('mgjAutoPayFirstDisabled');
				}
			});
			if(localStorage.getItem('mgjAutoPayFirstDisabled') !== "1"){
				this.$.find('div.autopay .am-radio').addClass("checked");
			}
			this.$.find('div.multiCardPayFlag .am-radio').vclick(function () {
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
					localStorage.removeItem('mgjMultiCardPayDisabled');
				}else{
					$(this).addClass('checked');
					localStorage.setItem('mgjMultiCardPayDisabled',1);
				}
			});
			if(localStorage.getItem('mgjMultiCardPayDisabled') == "1"){
				this.$.find('div.multiCardPayFlag .am-radio').addClass("checked");
			}

			this.$.find('div.clickSound .am-radio').vclick(function () {
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
					localStorage.setItem('mgjSoundDisabled',1);
				}else{
					$(this).addClass('checked');
					localStorage.removeItem('mgjSoundDisabled');
				}
				am.initSound();
			});
			if(localStorage.getItem('mgjSoundDisabled') !== "1"){
				this.$.find('div.clickSound .am-radio').addClass("checked");
			}

			this.$.find('div.btScanner .am-radio').vclick(function () {
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
					localStorage.removeItem('mgjBtScanner');
					am.stopBTScanner();
				}else{
					$(this).addClass('checked');
					localStorage.setItem('mgjBtScanner',1);
					am.startBTScanner();
				}
			});

			//收款提示音开光
			this.$.find('div.paySound .am-radio').vclick(function () {
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
					localStorage.setItem('mgjpaySoundDisabled',1);
				}else{
					$(this).addClass('checked');
					localStorage.removeItem('mgjpaySoundDisabled');
				}
				//am.initpaySound();
			});
			if(localStorage.getItem('mgjpaySoundDisabled') !== "1"){
				this.$.find('div.paySound .am-radio').addClass("checked");
			}
			//考勤推送提示音开关
			this.$.find('div.attendanceSound .am-radio').vclick(function () {
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
					localStorage.setItem('mgjattendanceSoundDisabled',1);
				}else{
					$(this).addClass('checked');
					localStorage.removeItem('mgjattendanceSoundDisabled');
				}
			});
			if(localStorage.getItem('mgjattendanceSoundDisabled') !== "1"){
				this.$.find('div.attendanceSound .am-radio').addClass("checked");
			}
			//短信充值
			this.$.find('span.prompt.dx').on('vclick',function(e){
                $('#page_about_SMSbox').css({
					 display:'block'
				 })
			});
			//短信退出(我知道了)
			$('#page_about_SMSbox .exit.box,.know').on('vclick',function(e){
                $('#page_about_SMSbox').css({
					display:'none'
				})
			});
			//修改密码
			this.$.find('span.prompt.mm').on('vclick',function(e){
				console.log('触发了吗')
				$('#page_aboutpasswordbox').css({
					 display:'block'
				 })
			});
			//密码退出
			$('#page_aboutpasswordbox .pasexit.box,.pasknow').on('vclick',function(e){
				$('#page_aboutpasswordbox').css({
					display:'none'
				})
			});
			//未开通小程序点击去开通小程序
			$("#about_content .minPro .minClose").on('vclick','.open',function(){
				window.open('http://cn.mikecrm.com/pKDAmFu');
			});
			this.$sysSet=this.$.find('.sysSet');// 系统设置
			this.$secTabsWrap=this.$sysSet.find('.secTabsWrap').on('vclick','span',function(){
				$(this).addClass('selected').siblings().removeClass('selected');
				var index=$(this).index();
				if (index === 0) {
					// 员工排序
					self.$remarksWrap.hide();
					self.$empSortWrap.show();
					self.renderEmps();
					var $empSort = self.$.find(".empSort");
					//员工列表滚动123工位
					if(!self.pos1ScrollView){
						self.pos1ScrollView = new $.am.ScrollView({
							$wrap: $empSort.find(".item1"),
							$inner: $empSort.find(".pos1"),
							direction: [false, true],
							hasInput: false,
						});
						self.pos2ScrollView = new $.am.ScrollView({
							$wrap: $empSort.find(".item2"),
							$inner: $empSort.find(".pos2"),
							direction: [false, true],
							hasInput: false,
						});
						self.pos3ScrollView = new $.am.ScrollView({
							$wrap: $empSort.find(".item3"),
							$inner: $empSort.find(".pos3"),
							direction: [false, true],
							hasInput: false,
						});
					}
					self.pos1ScrollView.refresh();
					self.pos1ScrollView.scrollTo("top");
					self.pos2ScrollView.refresh();
					self.pos2ScrollView.scrollTo("top");
					self.pos3ScrollView.refresh();
					self.pos3ScrollView.scrollTo("top");

				} else {
					self.$remarksWrap.show();
					self.$empSortWrap.hide();
					self.renderRemarks(index-1);
				}
			});
			this.$sysSet.find('.btnsWrap').on('vclick','.addBtn',function(){
				self.addRemarkInput();
				self.$remarksWrap.find('.noReamrks').remove();
			}).on('vclick','.saveBtn',function(){
				self.saveRemarks();
			}).end().on('vclick','.del-icon',function(){
				$(this).parent('.inputWrap').remove();
			});
			//员工排序点击
			self.$.find(".empSort").on("vclick",".up",function(){
				var $li = $(this).parents('li.list');
				var $pre = $li.prev();
				$pre.before($li);
			}).on("vclick",".down",function(){
				var $li = $(this).parents('li.list');
				var $next = $li.next();
				$next.after($li);
			}).on("vclick",".top",function(){
				var $li = $(this).parents('li.list');
				var $ul = $(this).parents('ul.pos');
				$ul.prepend($li);
			}).on("vclick",".submit",function(){
				self.saveConfigEmpSort();
			}).on("vclick",".cancel",function(){
				$("#about_tab li.selected").trigger("vclick");
			});

			// 判断是否有考勤权限
			if(am.operateArr.indexOf('a45') === -1){
				this.$.find(".attendanceAccess").hide().remove();
			}else{
				this.$.find('.attendanceAccess').show();
			}

			if(window.device && window.device.platform && window.device.platform.toUpperCase() === 'IOS'){
				this.$.find('div.btScanner').parent().show();
				if(localStorage.getItem('mgjBtScanner') == "1"){
					this.$.find('div.btScanner .am-radio').addClass("checked");
				}else{
					this.$.find('div.btScanner .am-radio').removeClass("checked");
				}
			}else{
				this.$.find('div.btScanner').parent().hide().remove();
			}

			this.$.on('vclick','.attendanceInterval .item',function(){
				var setting = {
					index: $(this).index(),
					refreshInterval: $(this).data('refresh'),
					invailidInterval: $(this).data('invailid')
				}
				localStorage.setItem(amGloble.metadata.userInfo.userId+'_attendanceCodeSetting',JSON.stringify(setting));
				$(this).addClass('selected').siblings().removeClass('selected');
			});

			//套餐消费打印项目原价
			this.$.find('div.treatPrintOriginalPrice .am-radio').vclick(function () {
				var key = 'TREAT_PRINT_ORIGINALPRICE';
				var $this = $(this);
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
					self.saveNormalConfig(key,0,function(){
						amGloble.msg('设置成功');
						amGloble.metadata.configs[key] = 0;
					},function(){
						amGloble.msg('设置失败');
						$this.addClass('checked');
					});
				}else{
					$(this).addClass('checked');
					self.saveNormalConfig(key,1,function(){
						amGloble.msg('设置成功');
						amGloble.metadata.configs[key] = 1;
					},function(){
						amGloble.msg('设置失败');
						$this.removeClass('checked');
					});
				}
			});
			//套餐消费打印单次金额
			this.$.find('div.treatPrintOnceMoney .am-radio').vclick(function () {
				var key = 'TREAT_PRINT_ONCEMONEY';
				var $this = $(this);
				if($(this).hasClass('checked')){
					$(this).removeClass('checked');
					self.saveNormalConfig(key,0,function(){
						amGloble.msg('设置成功');
						amGloble.metadata.configs[key] = 0;
					},function(){
						amGloble.msg('设置失败');
						$this.addClass('checked');
					});
				}else{
					$(this).addClass('checked');
					self.saveNormalConfig(key,1,function(){
						amGloble.msg('设置成功');
						amGloble.metadata.configs[key] = 1;
					},function(){
						amGloble.msg('设置失败');
						$this.removeClass('checked');
					});
				}
			});
		},
		beforeShow : function(paras) {
			attendance.start();
			/*if(paras == "back"){
                return;
            }*/
			am.tab.main.show().select(9);
			// $("#about_tab").find("li:first").trigger("vclick");
			if($("#about_tab .selected").index()==2){
				this.changeBack(0);
			}
			if($("#about_tab .selected").index()==0){
				this.refreshData();
			}
			if($("#about_tab .selected").index()==9){
				this.ScrollView_zh.refresh();
			}

			if($("#about_tab .selected").index()==11){
				this.$secTabsWrap.find('span:first-child').trigger('vclick');
			}

			var attendanceCodeSetting = localStorage.getItem(amGloble.metadata.userInfo.userId+'_attendanceCodeSetting');
			if(!attendanceCodeSetting){
				attendanceCodeSetting = {
					index: 0,
					refreshInterval: 4,
					invailidInterval: 8,
				}
			}else {
				attendanceCodeSetting = JSON.parse(attendanceCodeSetting);
			}
			this.$.find('.attendanceInterval .item').eq(attendanceCodeSetting.index).addClass('selected').siblings().removeClass('selected');

			if(paras == 'refreshPayOut' && $("#about_tab .selected").index()==3){
				self.payOutList.reset();
				self.payOutList.$search.trigger('vclick');
				return;
			}

			if(paras == 'refreshIncome' && $("#about_tab .selected").index()==4){
				self.inComeList.reset();
				self.inComeList.$search.trigger('vclick');
				return;
			}

			if(amGloble.metadata.configs.TREAT_PRINT_ORIGINALPRICE == 0){
				this.$.find('div.treatPrintOriginalPrice .am-radio').removeClass("checked");
			}else {
				this.$.find('div.treatPrintOriginalPrice .am-radio').addClass("checked");
			}
			if(amGloble.metadata.configs.TREAT_PRINT_ONCEMONEY == 1){
				this.$.find('div.treatPrintOnceMoney .am-radio').addClass("checked");
			}else {
				this.$.find('div.treatPrintOnceMoney .am-radio').removeClass("checked");
			}
		},
		renderRemarks:function(index){
			var titleData = [{
				title: '删单理由',
				tip: '(进行中的单据)'
			}, {
				title: '撤单理由',
				tip: '(已结算的单据)'
			}, {
				title: '收银备注',
				tip: ''
			}];
			var titleObj=titleData[index];
			this.$remarksTitle.text(titleObj.title);
			this.$remarksTip.text(titleObj.tip);
			var arr=[];
			if(index==0){
				arr=JSON.parse(am.metadata.configs.delBillRemarks || '[]');
			}else if(index==1){
				arr=JSON.parse(am.metadata.configs.revokeBillRemarks || '[]');
			}else if(index==2){
				arr=JSON.parse(am.metadata.configs.submitBillRemarks || '[]');
			}
			this.$remarksWrap.find('.noReamrks').remove();
			self.$remarkScrollInner.empty();
			if(arr && arr.length){
				for (var i = 0, len = arr.length; i < len; i++) {
					var $inputWrap=this.$inputWrap.clone(true,true);
					$inputWrap.find('input').val(arr[i]);
					this.$remarkScrollInner.append($inputWrap);
				}
			}else{
				this.$remarksWrap.append('<div class="noReamrks"></div>');
			}
			this.remarksScrollView.refresh();
			this.remarksScrollView.scrollTo("top");
		},
		addRemarkInput:function(){
			this.$remarkScrollInner.find('.noReamrks').remove();
			var $dom='<div class="inputWrap"><input type="text" class="remarkInput"> <span class="icon iconfont icon-shanchu del-icon am-clickable"></span></div>';
			this.$remarkScrollInner.append($dom);
			
			var parentHeight = this.$remarksWrap.outerHeight();
			var height = 40 * this.$remarkScrollInner.find('.inputWrap').length;
			if (height / parentHeight > 0.8) {
				this.remarksScrollView.refresh();
				this.remarksScrollView.scrollTo('bottom');
			} else {
				// 不足一屏，不需要refresh
			}
		},
		saveRemarks:function(){
			var reasons=[],$inputs=this.$remarkScrollInner.find('.remarkInput'),repeated=0,empty=0;
			$.each($inputs,function(i,v){
				var inputText=$(this).val().trim();
				if(inputText){
					if(reasons.indexOf(inputText)==-1){
						reasons.push(inputText);
					}else{
						$(this).focus();
						repeated=1;
						return false;
					}
				}else{
					$(this).focus();
					empty=1;
					return false;
				}
				
			});
			if(empty){
				am.msg('内容不能为空');
				return;
			}
			if(repeated){
				am.msg('备注已存在，请修改后再保存');
				return;
			}
			console.log('saveRemark',reasons);
			// 
			var keysArr=['delBillRemarks','revokeBillRemarks','submitBillRemarks'];
			var index=this.$secTabsWrap.find('.selected').index();
			am.api.saveNormalConfig.exec({
				parentshopid: am.metadata.userInfo.parentShopId+'', 
				configkey: keysArr[index-1],
				configvalue: JSON.stringify(reasons),
				shopid: am.metadata.userInfo.shopId+'',
				setModuleid: 15
			},function(ret){
				am.loading.hide();
				if(ret && ret.code==0){
				   am.metadata.configs[keysArr[index-1]]=JSON.stringify(reasons);
				   am.msg('保存成功');
				}else {
					am.msg('保存失败');
				}
			});
		},
		refreshData:function(){
			attendanceList.getData(function(list){
				attendanceList.render(list);
			});
		},
		afterShow : function(paras) {
			
			if(paras == "back"){
                return;
			}
			
			var mgjVersion=am.metadata.userInfo.mgjVersion;//版本信息
			if(mgjVersion==3){
				$("#about_content .account .version").html("尊享版");
			}else if(mgjVersion==4){
				$("#about_content .account .version").html("青春版");
			}else if(mgjVersion==2){
				$("#about_content .account .version").html("风尚版");
			}
			var invaliddate=am.metadata.userInfo.invaliddate;//到期时间
			if(invaliddate){
				$("#about_content .account .expire").html(new Date(invaliddate).format("yyyy/mm/dd"));
			}else{
				$("#about_content .account .expire").html("--");
			}
			var osName=$.trim(am.metadata.userInfo.osName)?am.metadata.userInfo.osName:am.metadata.userInfo.shopName;//门店名称 没有就显示商户名
			var shopId=am.metadata.userInfo.shopId;//门店编号
			var parentShopId=am.metadata.userInfo.parentShopId;//总部编号
			var user_account=am.metadata.userInfo.mobile;//登录账号
			var messageNum=am.metadata.userInfo.smsFee;//短信余量
			console.log(messageNum,'messageNummessageNummessageNummessageNum')
			$("#about_content .account .shop_name").html(osName);
			$("#about_content .account .shopid").html(shopId);
			$("#about_content .account .parent_shopid").html(parentShopId);
			$("#about_content .account .user_account").html(user_account);
            $("#about_content .account .due_time").html(new Date(invaliddate).format("yyyy/mm/dd"));
			$("#about_content .account .SMSnum").html(messageNum*10);
			var url = "http://app.meiguanjia.net/syb/";
			this.$.find("#about_content li.download div").addClass('haspic').html('<img src="' + am.getQRCode(url, 251, 251) + '" />');
			if(am.metadata.configs.promoteBarLink){
				this.$.find("#about_content li.concern div").addClass('haspic').html('<img src="' + am.getQRCode(am.metadata.configs.promoteBarLink, 251, 251) + '" />');
				this.$.find("#about_content li.concern .bottom_text").html("在微信中扫一扫");
			}else{
				this.$.find("#about_content li.concern div").removeClass('haspic').empty().addClass('ewm_undefined');
				this.$.find("#about_content li.concern .bottom_text").html("请先在互联网运营系统中配置！");
			}
			//判断商户有没有开通小程序
			if(am.metadata.shopPropertyField != undefined && am.metadata.shopPropertyField.openSmallProgram) {
				var userInfo = am.metadata.userInfo;
				this.$.find("#about_content li.minPro").removeClass('close').addClass('open');
				this.$.find("#about_content li.minPro .barCode").html('<img src="' + am.getMiniProCode(userInfo.parentShopId,'pages/mall/index','3',userInfo.userId,userInfo.userType) + '" />');
			}else {
				this.$.find("#about_content li.minPro").removeClass('open').addClass('close');


			}
			
		},
		beforeHide : function(paras) {
			attendance.end();
		},
		isBelongToMyShop : function(shopId){
			var shopIds=self.$userBox.data('shopIds');
			if(shopIds){
				shopIds=shopIds.split(',');
			}else{
				shopIds=[];
			}
			console.log(shopIds,shopId);
			if(shopIds.indexOf(shopId.toString())>-1){
				return true;
			}else{
				return false;
			}
		},
		checkCode : function(num){
			var reg = /^[0-9]*$/;//^\d{m,n}$
			if(reg.test(num.replace(/\s/g,''))&&num){
				return true;
			}else{
				return false;
			}
		},
		changeBack:function(){
			$("#about_tab li:first-child").addClass('selected').siblings().removeClass("selected");
			$("#about_content li").eq(0).show().siblings().hide();
		},
		getUserInfo : function(num){
			var opt={
				"code":num
			};
			am.loading.show("正在获取,请稍候...");
			am.api.queryOrder.exec(opt, function (res) {
				am.loading.hide();
				if (res.code == 0 && res.content) {
					if(res.content){
						self.renderOrderInfo(res.content);
						self.$userBox.addClass('show').data('orderdata',res.content);
					}
				} else if(res.code == 0 && !res.content){
					am.msg('请输入准确的券号!');
				}else{
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		renderOrderInfo : function(data){
			if(data&&data.mallItem&&data.mallItem.shopIds){
				self.$userBox.data('shopIds',data.mallItem.shopIds);
			}
			var status='';
			if(data.status==2){
				status='未使用';
				this.$verifyBtn.addClass('am-clickable');
			}else if(data.status==3){
				status='已使用';
				this.$verifyBtn.removeClass('am-clickable');
			}
			var images=data.mallItem.images;
			images=images?images.split(",")[0]:'';
			var bugTime=(data.createTime?(new Date(Number(data.createTime)).format("yyyy.mm.dd")):'');
			var remark=(data.mallItem.quickDescription?data.mallItem.quickDescription:'');
			var attributeNickName=(data.attributeNickName?data.attributeNickName:'--');
	        var payType = "未知";
	        if (data.payType == 0) {
	            payType = "微信支付";
                if(data.luckyMoneyPay){
                    payType = "微信+红包";
                }
	        } else if (data.payType == 1) {
	            payType = "支付宝支付";
                if(data.luckyMoneyPay){
                    payType = "支付宝+红包";
                }
	        } else if (data.payType == 2) {
	            payType = "免费领取";
                if(data.luckyMoneyPay){
                    payType = "红包支付";
                }
	        } else if (data.payType == 3) {
	            payType = "会员卡支付";
                if(data.luckyMoneyPay){
                    payType = "会员卡+红包";
                }
	        }
			this.$leftBox.find(".conImg").html(am.photoManager.createImage("customer", {
				parentShopId: am.metadata.userInfo.parentShopId,
				updateTs: data.lastphotoupdatetime || new Date().getTime()
			}, data.memId + ".jpg", "s",data.photopath||'')).end().find(".conName").text(data.memName).end()
				.find(".conTel").text(data.memMobile);
			this.$rightBox.find(".imgCenter").html(am.photoManager.createImage("mall", {
				parentShopId: am.metadata.userInfo.parentShopId,
			}, images, "s")).end().find(".itemTit").text(data.mallItemName).end()
				.find(".attributeNickName .item_value").text(attributeNickName).end()
				.find(".itemRemark").text(remark).end()
				.find(".itemStatus .item_value").text(status).end()
				.find(".itemPrice .item_value").text((data.price?('￥ '+data.price.toFixed(2)):'')).end()
				.find(".itemBuyTime .item_value").text(bugTime).end()
				.find(".itemBuyNum .item_value").text(data.itemNum?data.itemNum:'').end()
				.find(".itemPayType .item_value").text(payType).end()
				.find(".distrType .item_value").text(data.distrType?(data.distrType==1?"到店取货":"物流配送"):'').end()
		},
		resetPage : function(){

			$('.mallOrderHandel').find('.condition').val('');//清空输入框
			$('.mallOrderHandel').find('.detailMode').removeClass('show');
			if(this.$payInput){
				this.$payInput.val('');
			}
			this.$payoutIntro && this.$payoutIntro.val('');
			this.$incomeIntro && this.$incomeIntro.val('');
			this.$uploadVoucher && this.$uploadVoucher.prev().html('');
			this.$uploadVoucher && this.$uploadVoucher.data('img','');
		},
		//员工排序列表
		renderEmps: function(){
			var employeeList = am.metadata.employeeList || [];
			if(am.isNull(employeeList)) return console.log("员工列表异常!");
			var $empSort = this.$.find(".empSort");
			var $pos1 = $empSort.find(".pos1").empty();
			var $pos2 = $empSort.find(".pos2").empty();
			var $pos3 = $empSort.find(".pos3").empty();
			var num1 = 0;
			var num2 = 0;
			var num3 = 0;
			$.each(employeeList,function(i,v){
				var $li = $('<li class="list"><div class="left">'
							+'<span class="code"></span>'
							+'<span class="name"></span>'
							+'</div>'
							+'<div class="right">'
							+'<span class="up am-clickable"><i class="iconfont icon-shangyi"></i>上移</span>'
							+'<span class="down am-clickable"><i class="iconfont icon-xiayi"></i>下移</span>'
							+'<span class="top am-clickable"><i class="iconfont icon-zhiding"></i>置顶</span>'
							+'</div>'
							+'</li>');
				if(v.pos === 0){
					$li.find(".code").text(v.no).end().find(".name").text(v.name);
					$pos1.append($li.data("data",v));
					num1++;
				}
				else if(v.pos === 1){
					$li.find(".code").text(v.no).end().find(".name").text(v.name);
					$pos2.append($li.data("data",v));
					num2++;
				}
				else if(v.pos === 2){
					$li.find(".code").text(v.no).end().find(".name").text(v.name);
					$pos3.append($li.data("data",v));
					num3++;
				}
			});
			if(num1 === 0){
				$pos1.parents(".item").hide();
			}else{
				$pos1.parents(".item").show();
			}
			if(num2 === 0){
				$pos2.parents(".item").hide();
			}else{
				$pos2.parents(".item").show();
			}
			if(num3 === 0){
				$pos3.parents(".item").hide();
			}else{
				$pos3.parents(".item").show();
			}
		},
		saveConfigEmpSort:function(){
			var self = this,
				dataArr = [];
			var $empSort = self.$.find(".empSort");
			$empSort.find("ul li").each(function(i,v){
				dataArr.push($(v).data("data").id);
			});
			console.log(dataArr,"dataArr")
			dataArr = JSON.stringify(dataArr);
			am.loading.show();
			am.api.saveNormalConfig.exec({
				"parentshopid": am.metadata.userInfo.parentShopId + '',
				"configkey": 'EMP_SORT',
				"configvalue": dataArr,
				"shopid": am.metadata.userInfo.shopId + '',
				"setModuleid": "9"
			}, function (ret) {
				am.loading.hide();
				if (ret && ret.code === 0) {
					am.msg("保存成功");
					am.metadata.configs['EMP_SORT'] = dataArr;
					am.metadata.employeeList = am.getConfigEmpSort(JSON.parse(dataArr),am.metadata.employeeList);
					am.page.service && am.page.service.billServerSelector && delete am.page.service.billServerSelector.data;
					am.page.product && am.page.product.billServerSelector && delete am.page.product.billServerSelector.data;
					am.page.memberCard && am.page.memberCard.billServerSelector && delete am.page.memberCard.billServerSelector.data;
					am.page.comboCard && am.page.comboCard.billServerSelector && delete am.page.comboCard.billServerSelector.data;
				} else {
					am.msg(ret.message || '员工排序失败!');
				}
			});
		},
		saveNormalConfig: function(configkey,configvalue,scb,fcb){
			am.loading.show();
			am.api.saveNormalConfig.exec({
				"parentshopid": am.metadata.userInfo.parentShopId + '',
				"configkey": configkey,
				"configvalue": configvalue,
				"shopid": am.metadata.userInfo.shopId + '',
				"setModuleid": "9"
			}, function (ret) {
				am.loading.hide();
				if (ret && ret.code === 0) {
					scb && scb();
				} else {
					fcb && fcb();
				}
			});
		}
	});
})();

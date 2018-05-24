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
			var url = "http://common.reeli.cn/component/genqr?message="+ encodeURIComponent(JSON.stringify(message)) + '&width=300&height=300';
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
			var _this  = this;
			var urls = _this.createCode({
				createTime:new Date(am.now()).getTime(),
				type:"attendance",
				shopId:amGloble.metadata.userInfo.shopId,
				timeDifference:_this.diff,
				token:am.metadata.userInfo.mgjtouchtoken
			});
			var img = createImage();
			img.setHref(urls.base,function(){
				_this.$img.html('<img src="'+urls.base+'" />');
				_this.createScreen(urls.url);
			});
			
			this.timer = setInterval(function(){
				var urls2 = _this.createCode({
					createTime:new Date(am.now()).getTime(),
					type:"attendance",
					timeDifference:_this.diff,
					shopId:amGloble.metadata.userInfo.shopId,
					token:am.metadata.userInfo.mgjtouchtoken
				});
				img.setHref(urls2.base,function(){
					_this.$img.html('<img src="'+urls2.base+'" />');
					_this.createScreen(urls2.url);
				});
			},4000);

			//时间格式化
			_this.setTime();
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
				$item.find(".logo").html(amGloble.photoManager.createImage(type, {
					parentShopId: userInfo.parentShopId,
					updateTs: userInfo.lastphotoupdatetime
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
			$("#about_tab").on("vclick","li",function(){
				$(this).addClass('selected').siblings('li').removeClass("selected");
				var index=$(this).index();
				$("#about_content > li").eq(index).show().siblings().hide();
				if(index==5){
					self.aboutScroll.refresh();
					self.aboutScroll.scrollTo("top");
				}
				if(index==0){
					self.resetPage();
					self.refreshData();
				}
				if(index==2){//
					$.am.changePage(am.page.prepay, "slideup");
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
			this.aboutScroll = new $.am.ScrollView({
	            $wrap: this.$.find(".about"),
	            $inner: this.$.find(".about>div"),
	            direction: [false, true],
	            hasInput: false,
	            bubble:false
	        });
	        this.aboutScroll.refresh();

	        //收入与支出
	        this.$checkPayoutRecord = this.$.find('.payout .checkRecord').vclick(function(){
	        	$.am.changePage(am.page.payoutAndIncome, "slideup",'payout');
	        });

	        this.$checkIncomeRecord = this.$.find('.income .checkRecord').vclick(function(){
	        	$.am.changePage(am.page.payoutAndIncome, "slideup",'income');
	        });

	        this.$payLi = this.$.find('.payout ul,.income ul').on('vclick','li',function(){
	        	$(this).addClass('active').siblings().removeClass('active');
	        });

	        this.$payInput = this.$.find('.payout input,.income input').vclick(function(){
	        	var amount = $(this);
				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
				    	amount.val(value);
				    }
				});
	        });

	        //上传支出凭证
            this.$uploadVoucher = this.$.find('.payout .upload').vclick(function(){
                var _this = $(this);
                amGloble.photoManager.takePhoto("voucher", {
                    parentShopId: am.metadata.userInfo.parentShopId,
                }, function(res) {
                    _this.prev().html(am.photoManager.createImage("voucher", {
                        parentShopId: am.metadata.userInfo.parentShopId,
                    }, res, 's'));
                    _this.data('img',res);
                }, function() {
                    console.log("fail");
                });
            });

            this.$payoutSmt = this.$.find('.payout .smt').vclick(function(){
            	self.addPayout();
            });

            this.$incomeSmt = this.$.find('.income .smt').vclick(function(){
            	self.addIncome();
            });

	        this.$depUlOut = this.$.find('.payoutDep'),
			this.$depUlIn = this.$.find('.incomeDep'),
			this.$depLi = this.$depUlOut.find('li');
			this.$depUlOut.empty();
			this.$depUlIn.empty();

			this.$ExpendTypeUlOut = this.$.find('.payoutType'),
			this.$ExpendTypeUlIn = this.$.find('.incomeType'),
			this.$ExpendTypeLi = this.$ExpendTypeUlOut.find('li');
			this.$ExpendTypeUlOut.empty();
			this.$ExpendTypeUlIn.empty();

			this.$payoutMethod = this.$.find('.payoutMethod');

			this.$payoutIntro = this.$.find('.payoutIntro');
			this.$incomeIntro = this.$.find('.incomeIntro');

			this.$payoutPrice = this.$.find('.payoutPrice');
			this.$incomePrice = this.$.find('.incomePrice');
			
			
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

			

			if(window.device && window.device.platform && window.device.platform.toUpperCase() === 'IOS'){
				this.$.find('div.btScanner').show();
				if(localStorage.getItem('mgjBtScanner') == "1"){
					this.$.find('div.btScanner .am-radio').addClass("checked");
				}else{
					this.$.find('div.btScanner .am-radio').removeClass("checked");
				}
			}else{
				this.$.find('div.btScanner').hide();
			}
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
			this.aboutScroll.refresh();
			var mgjVersion=am.metadata.userInfo.mgjVersion;//版本信息
			if(mgjVersion==3){
				$("#about_content .account div").find("p:first span").html("尊享版");
			}else if(mgjVersion==4){
				$("#about_content .account div").find("p:first span").html("青春版");
			}else if(mgjVersion==2){
				$("#about_content .account div").find("p:first span").html("风尚版");
			}
			var invaliddate=am.metadata.userInfo.invaliddate;//到期时间
			if(invaliddate){
				$("#about_content .account div").find("p:last span").html(new Date(invaliddate).format("yyyy/mm/dd"));
			}else{
				$("#about_content .account div").find("p:last span").html("--");
			}
			var shopName=am.metadata.userInfo.shopName;
			$("#about_content .concern .top_text span").html(shopName);
			var url = "http://app.meiguanjia.net/syb/";
			this.$.find("#about_content li.download div").addClass('haspic').html('<img src="' + am.getQRCode(url, 251, 251) + '" />');
			if(am.metadata.configs.promoteBarLink){
				this.$.find("#about_content li.concern div").addClass('haspic').html('<img src="' + am.getQRCode(am.metadata.configs.promoteBarLink, 251, 251) + '" />');
				this.$.find("#about_content li.concern .bottom_text").html("在微信中扫一扫");
			}else{
				this.$.find("#about_content li.concern div").removeClass('haspic').empty().addClass('ewm_undefined');
				this.$.find("#about_content li.concern .bottom_text").html("请先在互联网运营系统中配置！");
			}

			//收入支出部门
			if(!this.$depUlOut.find('li').length){
				var dep = am.metadata.deparList;
				for(var i=0;i<dep.length;i++){
					var $li = this.$depLi.clone();
					$li.data('data',dep[i]).find('p').html(dep[i].name);
					this.$depUlOut.append($li);
				}
				for(var i=0;i<dep.length;i++){
					var $li = this.$depLi.clone();
					$li.data('data',dep[i]).find('p').html(dep[i].name);
					this.$depUlIn.append($li);
				}
			}
			this.$depUlOut.find('li').eq(0).addClass('active').siblings().removeClass('active');
			this.$depUlIn.find('li').eq(0).addClass('active').siblings().removeClass('active');

			// 收入支出类型
			if(!this.$ExpendTypeUlOut.find('li').length){
				var dayExpendTypeList = am.metadata.dayExpendTypeList;
					for(var i=0;i<dayExpendTypeList.length;i++){
						if(dayExpendTypeList[i].dayexpendtypeid!=5){
							var $li = this.$ExpendTypeLi.clone();
							$li.data('data',dayExpendTypeList[i]).find('p').html(dayExpendTypeList[i].name);
							this.$ExpendTypeUlOut.append($li);
						}
					}
				for(var i=0;i<dayExpendTypeList.length;i++){
					if(dayExpendTypeList[i].dayexpendtypeid==5){
						var $li = this.$ExpendTypeLi.clone();
						$li.data('data',dayExpendTypeList[i]).find('p').html(dayExpendTypeList[i].name);
						this.$ExpendTypeUlIn.append($li);
					}
				}
			}
			if(!this.$ExpendTypeUlOut.find('li').length){
				this.$ExpendTypeUlOut.html('未设置');
			}
			if(!this.$ExpendTypeUlIn.find('li').length){
				this.$ExpendTypeUlIn.html('未设置');
			}
			this.$ExpendTypeUlOut.find('li').eq(0).addClass('active').siblings().removeClass('active');
			this.$ExpendTypeUlIn.find('li').eq(0).addClass('active').siblings().removeClass('active');

			//支出方式
			this.$payoutMethod.find('li').eq(0).addClass('active').siblings().removeClass('active');
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
			}, data.memId + ".jpg", "s")).end().find(".conName").text(data.memName).end()
				.find(".conTel").text(data.memMobile);
			this.$rightBox.find(".imgCenter").html(am.photoManager.createImage("mall", {
				parentShopId: am.metadata.userInfo.parentShopId,
			}, images, "s")).end().find(".itemTit").text(data.mallItemName).end()
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
			this.$payInput.val('');
			this.$payoutIntro.val('');
			this.$incomeIntro.val('');
			this.$uploadVoucher.prev().html('');
			this.$uploadVoucher.data('img','');
		},
		addPayout: function(){
			var depcode = this.$.find('.payoutDep .active').data('data').code,
				dayExpendType = this.$.find('.payoutType .active').data('data') && this.$.find('.payoutType .active').data('data').id,
				seFlag = this.$.find('.payoutMethod .active').index()==0?1:0,
				price = this.$payoutPrice.val(),
				profile = this.$uploadVoucher.data('img'),
				intro = this.$payoutIntro.val();
			if(!this.$.find('.payoutType .active').data('data')){
				am.msg('未设置支出类型,请前往系统设置');
				return;
			}
			if(!price){
				am.msg('请输入支出金额');
				return;
			}
			var data = {
				depcode: depcode,
				dayExpendType: dayExpendType,
				seFlag: seFlag,
				price: price,
				profile: profile || '',
				intro: intro,
				type: 2
			}
			this.addExps(data);
			
		},
		addIncome: function(){
			var depcode = this.$.find('.incomeDep .active').data('data').code,
				dayExpendType = this.$.find('.incomeType .active').data('data') && this.$.find('.incomeType .active').data('data').id,
				price = this.$incomePrice.val(),
				intro = this.$incomeIntro.val();
			if(!this.$.find('.incomeType .active').data('data')){
				am.msg('未设置收入类型,请前往系统设置');
				return;
			}
			if(!price){
				am.msg('请输入收入金额');
				return;
			}
			var data = {
				depcode: depcode,
				dayExpendType: dayExpendType,
				seFlag: 0,
				price: price,
				profile: '',
				intro: intro,
				type: 1
			}
			this.addExps(data);
		},
		addExps: function(data){
			am.loading.show();
			am.api.addExps.exec({
				parentShopId:  am.metadata.userInfo.realParentShopId,
				shopId: am.metadata.userInfo.shopId,
				intro: data.intro,
				price: data.price,
				type: data.type,
				seFlag: data.seFlag,
				operateId: am.metadata.userInfo.userId,
				dayExpendType: data.dayExpendType,
				autoFlag: 0,
				depcode: data.depcode,
				profile: data.profile
			},function(ret){
				am.loading.hide();
				console.log(ret);
				if(ret && ret.code == 0){
					am.msg('保存成功');
					if(data.type==2){
						self.$payoutPrice.val('');
						self.$payoutIntro.val('');
						self.$uploadVoucher.prev().html('');
						self.$uploadVoucher.data('img','');
					}else if(data.type==1){
						self.$incomePrice.val('');
						self.$incomeIntro.val('');
					}
				}else if(ret && ret.code == -1){
					atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据保存失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.addExps(data);
                    }, function(){
                        
                    });
				}
			});		
		}
	});
})();

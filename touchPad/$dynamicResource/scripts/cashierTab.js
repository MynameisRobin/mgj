am.cashierTab = {
	init:function () {
		var self = this;
		this.isOpenBill = true;
		this.$ = $('#tab_cash');
		this.$t = $('#cashierTotalPanel');

		this.$hair = this.$.find(".operatehair").vclick(function(){
			if($(this).hasClass("disabled")) return;
			self.operatehairChange();
		});
			
		this.$memberli = this.$.find(".tab_memList ul li:first").remove();
		this.$memberUl = this.$.find(".tab_memList ul").vclick(function(){
			if(amGloble.metadata.userInfo.operatestr.indexOf('a31,') != -1  && amGloble.metadata.shopPropertyField.mgjBillingType==1){
			    am.msg("您没有权限改单据信息！");
			}else{
			   self.getOpt(function (opt) {
					self.getDisplayId(opt,function(items){
						$.am.changePage(am.page.openbill, "",{rowdata:items,source:"service"});//source:"service",
					});
				});
			}
			
		});
		this.$li = this.$.find('.tabUl li').vclick(function () {
			if(!$(this).hasClass('selected')){
				if($(this).data('pow') === 'a20'){
					$.am.changePage(am.page.service, "","freezing");
				}else if($(this).data('pow') === 'a21'){
					$.am.changePage(am.page.product, "","freezing");
				}else {
					$.am.changePage(am.page.queue, "",'small');
				}
			}
		});
		this.$.find('.searchBtn').vclick(function () {
			self.goToSearch();
		});

		this.$user = this.$.find('.user').vclick(function () {
			/*if(amGloble.metadata.shopPropertyField.mgjBillingType==1){
				return;
			}*/
			if(self.member){
				$.am.changePage(am.page.memberDetails, "slideup",{
					"customerId":self.member.id,
					"cardId":self.member.cid,
					"shopId":self.member.shopId,
					"tabId":1
				});
			}else{
				self.goToSearch();
			}
		});
		this.$card = this.$.find('.cardBtn').vclick(function () {
			self.showMemberInfo(self.member);
		});
		this.$.find('.settingBtn').vclick(function () {
			$.am.changePage(am.page.prepay, "slideup");
		});
		this.$hangupBtn = this.$.find('.hangupBtn').vclick(function () {

			$.am.changePage(am.page.hangup, "slideup", {setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
		});
		this.$t.find('.setting').vclick(function () {
			var page = $.am.getActivePage();
			page.billMain.$.find(".setting").trigger('vclick');
		});
		this.$t.find('.hangup').vclick(function () {
			/*var opt = am.page.service.submit(1);
			console.log(opt);
			var proOpt = am.page.product.submit(1);
			var hasServ = opt && opt.option.serviceItems.length;
			var hasProd = proOpt && proOpt.option.products.depots.length;
			if(opt && proOpt){
				opt.option.products = proOpt.option.products;
				self.getDisplayId(opt);
			}*/
			self.getOpt(function (opt) {
				console.log(opt)
				if(!opt){
					return am.msg("请设定项目价格");
				}
				if(opt.option && opt.option.expenseCategory===0 ){
                    if( opt.option.serviceItems.length >=1  || true){
                        self.getDisplayId(opt,function(items){
                            self.hangupSave(items);
                        });
					} 
					else{
						am.msg("没有任何项目，请添加项目！");
					}
				}
				else{
					if($("#page_service").find(".cashierBox tbody tr").length < 1){
						am.msg("没有任何项目，请添加项目！");
					}else{
						am.msg("请设定项目价格");
					}
				}
			});
		});
		this.$t.find('.submit').vclick(function () {
			//校验是否可以存在挂单备注
			var billData   = self.billData;
			if(billData){
				var billRemark = JSON.parse(billData.data).billRemark; 
				var remarkCallback = function(members){
					var _data = am.clone(billData);
					var sendData = am.clone(billData.data);
					if(members){
						sendData.cid = members.cid;
						sendData.memGender=members.sex;
						_data.memId  = members.id;
						_data.memName= members.name;
						_data.memPhone=members.mobile;
						_data.memcardid=members.cid;
					}
					sendData.billRemark.recharge.isbuy = true;
					_data.data = JSON.stringify(sendData);
					am.page.hangup.saveBill(_data);
				}
				var checkRemark = am.page.hangup.checkRemark(billData,function(res){
					if(res.code == 1){//开卡
						$.am.changePage(am.page.memberCard,"",{billRemark:billData});
					}
					if(res.code == 2){//充值
						am.searchMember.getMemberById(billData.memId,billRemark.recharge.id,function(content){
							// am.pw.check(content, function (verifyed) {
							// 	if (verifyed) {
							// 		$.am.changePage(am.page.pay, "slideup", {
							// 			action: "recharge",
							// 			member: content,
							// 			rechargeMoney:billRemark.recharge.money,
							// 			billRemark:billData,
							// 			remarkCallback:remarkCallback
							// 		});
							// 	}
                            // });
                            $.am.changePage(am.page.pay, "slideup", {
                                action: "recharge",
                                member: content,
                                rechargeMoney:billRemark.recharge.money,
                                billRemark:billData,
                                remarkCallback:remarkCallback
                            });
						});
						
					}
					if(res.code == 3){//购买套餐
						$.am.changePage(am.page.comboCard,"",{billRemark:billData});
					}
				},true);
				if(!checkRemark){
					self.submit();
				}
			}else{
				self.submit();
			}
		});

		this.$total = this.$t.find('.totalPrice');

		this.$memberInfo = this.$.find('.memberInfo');
		this.$close = this.$memberInfo.find(".infoclose").vclick(function(){
			self.$memberInfo.hide();
			self.$card.removeClass('selected');
		});
		this.$memberInfo.find(".recharge").vclick(function(){
			var cardtype = am.metadata.cardTypeList.filter(function(a){
				return a.cardtypeid == self.member.cardTypeId;
			});
			if(cardtype && cardtype[0] && cardtype[0].mgj_stopNoRecharge && cardtype[0].newflag=='0'){
				amGloble.msg('【'+cardtype[0].cardtypename+'】已停止办理，无法继续充值！');
				return false;
			}
			$.am.changePage(am.page.pay, "slideup",{
				action:"recharge",
				member:self.member
			});
			return false;
		});

		this.$memberInfo.find(".renewal").vclick(function(){
			$.am.changePage(am.page.pay, "slideup",{
				action:"recharge",
				member:self.member,
				card: self.cardInfo,
				renewal: 1
			});
			return false;
		});

		this.comboItemScroll = new $.am.ScrollView({
			$wrap: this.$memberInfo.find('.items'),
			$inner: this.$memberInfo.find('.items ul'),
			direction: [false, true],
			hasInput: false,
			bubble:true
		});
		this.$memberInfo.find('.items').on('vclick','li',function(){
			var data = $(this).data('data');
			var item,mitu = [];
			if(data.itemid == "-1" && data.timesItemNOs){
				var itemNos = data.timesItemNOs.split(",");
				for(var i=0;i<itemNos.length;i++){
					var matchItem = am.metadata.serviceCodeMap[itemNos[i]];
					if(matchItem){
						mitu.push(matchItem);
					}
				}
			}else{
				item = am.metadata.serviceCodeMap[data.itemid];
			}
			if($.am.getActivePage() !== am.page.service){
				$.am.changePage(am.page.service, "","freezing");
			}

			if(item){
				var $tr = am.page.service.billMain.addItem(item,0,data);
				$tr.trigger('vclick');
			}else if(mitu.length==1) {
				var $tr = am.page.service.billMain.addItem(mitu[0],0,data);
				$tr.trigger('vclick');
			}else if(mitu.length>1){
				am.popupMenu("请选择项目", mitu, function (ret) {
					var $tr = am.page.service.billMain.addItem(ret,0,data);
					$tr.trigger('vclick');
				});
			}else{
				am.msg('无法在本店使用此项目！');
			}
		});
		this.$billNo = this.$t.find("input[name=billNo]");

		/*this.$gender = this.$t.find(".genderRadio").vclick(function() {
			$(this).toggleClass("male");
		});
		this.$billNo = this.$t.find("input[name=billNo]").attr('readonly',true).vclick(function() {
			var $this=$(this).removeClass("error");
			am.keyboard.show({
				"title":"流水单号",
				"submit":function(value){
					$this.val(value);
				}
			});
        });*/
	},
	operatehairChange:function(){
		var _this   = this;
		var data    = this.billData;
		var $target = this.$hair;
		am.page.hangup.washOpt($target,data,function(res){
			var ret = {};
			if(res.shampooStartTime){
				data.shampooStartTime = res.shampooStartTime;
			}
			if(res.shampooFinishTime){
				data.shampooFinishTime = res.shampooFinishTime;
			}
			_this.operatehair(data);
		});
	},
	operatehair:function(data){
		//洗发时长显示隐藏
		var setting_washTime = am.page.service.billMain.getSetting().setting_washTime;
		var washTimeFlag = setting_washTime && setting_washTime == 1 && am.metadata.configs.rcordRinseTime && am.metadata.configs.rcordRinseTime == 'false';
		if(!data) data = this.billData || {};
		if(washTimeFlag){
			if(data.shampooStartTime){//存在开始洗发时间
				if(data.shampooFinishTime){//已结束
					this.$hair.removeClass("start finish").addClass('disabled');
				}else{
					this.$hair.removeClass("disabled start").addClass('finish');
				}
			}else{
				this.$hair.removeClass("disabled finish").addClass('start');
			}
			this.$hair.show();
		}else{
			this.$hair.hide();
		}
	},
	submit:function () {
		this.getOpt(function (opt) {
			if(opt){
				$.am.changePage(am.page.pay, "slideup", opt);
			}
		});
    },
    shutDownSubmit:false,
    hideSubmitBtn:function(){
        var config = am.metadata.userInfo.operatestr.indexOf('a39')>-1?1:0;
        console.log(config);
        if(config){
            this.$t.find('.submit').hide();
            this.$memberInfo.find('.recharge').hide();
            this.shutDownSubmit = true;
        }
	},
	getOpt:function (cb) {
		var $billNo = am.page.service.$billNo,self=this;
		var billNo;
		if ($billNo.is(":visible")) {
			billNo = $billNo.val();
			if (!billNo && ! am.page.service.billNoError) {
				atMobile.nativeUIWidget.confirm({
					caption: "流水单号未输入",
					description: "不输入流水单号，系统将自动生成流水单号！",
					okCaption: "自动生成",
					cancelCaption: "去输入"
				}, function() {
					am.page.service.billNoError=1;
					self.getOpt(cb);
				}, function() {
					$billNo.addClass("error");
				});
				billNo = null;
				return;
			}else{
				am.page.service.billNoError=0;
			}
			if(!billNo){
				billNo = null;
			}
		}
		if(this.billData && this.billData.serviceNO && !billNo){
			billNo = this.billData.serviceNO;
		}

		var opt = am.page.service.submit();
		if(opt && opt.option){
			opt.option.billNo = billNo;
		}
		var proOpt = am.page.product.submit();
		proOpt.option.billNo = billNo;
		if(!opt || !proOpt){
			cb(opt);
		}
		var hasServ = opt && opt.option.serviceItems.length;
		var hasProd = proOpt && proOpt.option.products.depots.length;
		if(hasServ && hasProd){
			if(amGloble.metadata.shopPropertyField.mgjBillingType==1){
				delete opt.option.instoreServiceId;
			}
			opt.servOption = JSON.parse(JSON.stringify(opt.option));
			opt.prodOption = proOpt.option;
			for(var i in opt.option.billingInfo){
				opt.option.billingInfo[i]+=proOpt.option.billingInfo[i];
			}
			cb(opt);
		}else if(hasServ){
			cb(opt);
		}else if(hasProd){
			cb(proOpt);
		}else{
			//am.msg("没有任何项目，请添加项目！");
			cb(opt);
		}
	},
	showMemberInfo:function(member){
		this.member = member;
		var $gender = this.$memberInfo.find('.gender').text('积分:'+ (member.points||0));
		if(member.sex=="M"){
			$gender.addClass('male');
		}else{
			$gender.removeClass('male');
		}
		this.$memberInfo.find('.membername').text(member.name);
		this.$memberInfo.find('.tel').text(member.mobile);
		this.$memberInfo.find('.comment').text(member.comment || "");
		this.$memberInfo.find('.name').text(member.cardName);
		this.$memberInfo.find('.cardNo').text(member.cardNo);
		if(member.cardtype==1){
			this.$memberInfo.find('.price').show().text(Math.round((member.balance )*100)/100);
			this.$memberInfo.find('.bonus').text("￥"+Math.round((member.gift )*100)/100);
		}else{
			this.$memberInfo.find('.price').hide();
			this.$memberInfo.find('.bonus').text('现金消费卡');
		}

		var discount = [];
		if(member.discount && member.discount<10){
			discount.push('项目'+ member.discount+'折');
		}
		if(member.buydiscount && member.buydiscount<10){
			discount.push('卖品'+ member.buydiscount+'折');
		}
		this.$memberInfo.find('.discount').text(discount.length?discount.join(","):"无折扣");
		if(member.cardtype==1 && (member.timeflag==0 || member.timeflag==2) && !this.shutDownSubmit ){
			this.$memberInfo.find('.recharge').show();
		}else{
			this.$memberInfo.find('.recharge').hide();
		}
		console.log(this.cardInfo)
		var ctype = {};
		for(var i=0;i<am.metadata.cardTypeList.length;i++){
			if(this.cardInfo && (am.metadata.cardTypeList[i].cardtypeid==this.cardInfo.cardTypeId || am.metadata.cardTypeList[i].cardtypeid==this.cardInfo.cardtypeid)){
				ctype = am.metadata.cardTypeList[i];
			}
		}
		if(this.cardInfo && this.cardInfo.cardtype==2 && this.cardInfo.invaliddate && ctype && ctype.mgjCardRenewal && JSON.parse(ctype.mgjCardRenewal).length && am.checkCrossConsum(member.shopId)){
			this.$memberInfo.find('.renewal').show();
		}else {
			this.$memberInfo.find('.renewal').hide();
		}
		if(member.comboitems && member.comboitems.length){
			var $ul = this.$memberInfo.find('.items').show().find('ul').empty();
			for (var i = 0; i < member.comboitems.length; i++) {
				var item = member.comboitems[i];
				var $li = $('<li class="am-clickable"></li>');
				var $times = $('<div class="times">不限次</div>');
				if(item.sumtimes != -99){
					$times.html('余'+item.leavetimes+'次<span>(总'+item.sumtimes+'次)</span>');
				}
				$li.append($times);
				if(item.isNewTreatment && item.timesItemNOs){
					item.itemname = am.page.comboCard.getItemNamesByNos(item.timesItemNOs).join(",");
				}
				$li.append('<div class="itemName">'+ (item.treattype==1?'<span class="highlight">[赠] </span>':'')+item.itemname+'</div>');
				var $date = $('<div class="invalidDate"></div>');
				if(item.validdate){
					var ts = am.now();
					ts.setHours(0);
					ts.setMinutes(0);
					ts.setSeconds(0);
					ts.setMilliseconds(0);
					var x = item.validdate-ts.getTime();
					if(x<0){
						$li.addClass('am-disabled');
						$date.text('已过期');
					}else if(x < 7*24*3600*1000){
						$date.addClass('highlight');
						$date.text(new Date(item.validdate).format('yyyy-mm-dd')+"到期 即将到期");
					}else{
						$date.text(new Date(item.validdate).format('yyyy-mm-dd')+"到期");
					}
				}else{
					$date.text('不限期');
				}
				$li.append($date);
				$ul.append($li.data('data',item));
			}
		}else{
			this.$memberInfo.find('.items').hide();
		}

		this.$card.addClass('selected');
		this.$memberInfo.show();
		this.comboItemScroll.refresh();
		this.comboItemScroll.scrollTo("top");
	},
	hangup: function(param,displayId,callback) {
		if (param) {
			var self =this;
			var firstServers = null;
			var serviceItems = [];
			var sumfee = 0;
			if (param.option.serviceItems && param.option.serviceItems.length > 0) {
				serviceItems = [];
				firstServers = param.option.serviceItems[0].servers;
				for (var i = 0; i < param.option.serviceItems.length; i++) {
					var si = param.option.serviceItems[i];
					var servers = null;
					if (si.servers && si.servers.length > 0) {
						servers = [];
						for (var j = 0; j < si.servers.length; j++) {
							var ss = si.servers[j];
							servers.push({
							//servers[ss.station] = {
								"id": ss.empId,
								"name": ss.empName,
								"specified": ss.pointFlag,
								"per":ss.per,
								"perf":ss.perf,
								"gain":ss.gain,
								"station":ss.station
							});
						}
					}
					var tempItem = {
						"id": si.id,
						"price": si.salePrice,
						"name": si.itemName,
						"noTreat":si.noTreat,
						"dept": si.depcode,
						"servers": servers
					};
					if(si.modifyed){
						tempItem.oPrice = si.price;
					}
					serviceItems.push(tempItem);
					sumfee += si.salePrice;
				}
			}
			var products,prodSumfee=0;
			/*if(param.option.products && param.option.products.depots && param.option.products.depots.length){
				products = param.option.products;
			}*/
			if(param.prodOption && param.prodOption.products && param.prodOption.products.depots && param.prodOption.products.depots.length){
				products = param.prodOption.products;
				prodSumfee = param.prodOption.billingInfo.total;
			}else if(param.option && param.option.products && param.option.products.depots && param.option.products.depots.length){
				products = param.option.products;
				prodSumfee = param.option.billingInfo.total;
			}
			var instorecomment = "";
			if(this.billData && this.billData.instorecomment){
				instorecomment = this.billData.instorecomment;
			}else if(param.member && param.member.comment){
				instorecomment = param.member.comment.substr(0,50);
			}
			if(this.billData && this.billData.data){
				this.billData.data = JSON.parse(this.billData.data);
			}
			var data = {
				"id":this.billData?this.billData.id:undefined,
				"parentShopId": param.option.parentShopId,
				"shopId": param.option.shopId,
				"displayId": displayId, //手牌号，如果手牌号存在，则修改，如果不存在，则新增
				"memId": param.member ? param.member.id : -1, //顾客id，散客-1
				"memName": param.member ? param.member.name : "", //顾客姓名，散客为空
				"memPhone": param.member ? param.member.mobile : "", //顾客手机号
				"data": JSON.stringify($.extend((this.billData && this.billData.data) || {},{//以前直接丢失了相关信息  现在修复
					"cid":param.member ? param.member.cid : "",
					"sumfee": sumfee,
					"prodSumfee":prodSumfee,
					"memGender": param.member && param.member.sex? param.member.sex:'F',
					"genderGuest":param.option.gender === 'M'?1:0,
					"serviceItems": serviceItems,
					"products":products
				})),
				"serviceNO":param.option.billNo,
				// "emp1": firstServers && firstServers.length > 0 ? firstServers[0].empId : -1, //工位1 id，空为-1
				// "emp2": firstServers && firstServers.length > 1 ? firstServers[1].empId : -1,
				// "emp3": firstServers && firstServers.length > 2 ? firstServers[2].empId : -1,
				// "emp1Name": firstServers && firstServers.length > 0 ? firstServers[0].empName : "", //工位1名字, 空为""
				// "emp2Name": firstServers && firstServers.length > 1 ? firstServers[1].empName : "",
				// "emp3Name": firstServers && firstServers.length > 2 ? firstServers[2].empName : "",
				// "isSpecified1": firstServers && firstServers.length > 0 ? firstServers[0].pointFlag : "0", //0非指定 1指定
				// "isSpecified2": firstServers && firstServers.length > 1 ? firstServers[1].pointFlag : "0",
				// "isSpecified3": firstServers && firstServers.length > 2 ? firstServers[2].pointFlag : "0",
				"emp1":-1,
				"emp2":-1,
				"emp3":-1,
				"channel": 2, //渠道 1从无纸化开单 2从收银开单
				"order": 0, //可选
				"shampooStartTime": this.billData?this.billData.shampooStartTime:null,//am.metadata.configs.rcordRinseTime && am.metadata.configs.rcordRinseTime == 'true' ? am.now().getTime() : null, //洗发开始时间
				"shampooFinishTime": this.billData?this.billData.shampooFinishTime:null, //洗发结束时间
				"shampooworkbay": this.billData?this.billData.shampooworkbay:null, //洗发工位
				"reservationId": -1,
				"instorecomment":instorecomment //备注
			};
			//重新修改 工位指定非指定
			var billData = am.page.service.billData;
			if(billData){
				$.extend(data,{
					"emp1": billData.emp1 || -1,
					"emp2": billData.emp2 || -1,
					"emp3": billData.emp3 || -1,
					"emp1Name": billData.emp1Name || "",
					"emp2Name": billData.emp2Name || "",
					"emp3Name": billData.emp3Name || "",
					"isSpecified1": billData.isSpecified1 || "0", //0非指定 1指定
					"isSpecified2": billData.isSpecified2 || "0",
					"isSpecified3": billData.isSpecified3 || "0",
					"emp1RotateId": billData.emp1RotateId || -1,
					"emp2RotateId": billData.emp2RotateId || -1,
					"emp3RotateId": billData.emp3RotateId || -1,
				});
			}
			
			if(this.billData && this.billData.serviceNO){
				data.serviceNO = this.billData.serviceNO;
				
			}
			if(this.billData){
				data.shampooStartTime = this.billData.shampooStartTime || null;
				data.shampooFinishTime= this.billData.shampooFinishTime || null;
			}
			callback && callback(data);
			
		}
	},
	hangupSave:function(data){
		am.loading.show();
		data.parentShopId = amGloble.metadata.userInfo.parentShopId;
		am.api.hangupSave.exec(data, function(ret){
			am.loading.hide();
			if(ret && ret.code==0){
				//am.msg("挂单成功");
				if(amGloble.metadata.shopPropertyField.mgjBillingType==1){
					$.am.changePage(am.page.hangup, "", {openbill:1,setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
				}else{
					$.am.changePage(am.page.hangup, "", {setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
				}
				//self.beforeShow();
				am.cashierTab.hide();
			} else if(ret.code === -1) {
				am.msg(ret.message || '网络异常，单据保存失败，请重试!');
			}else if(ret.code == 11008){
				var gotoHangup = function () {
					$.am.changePage(am.page.hangup,"",{openbill:1,setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
				};
				am.confirm('单据已变更','由于其它终端的操作，此单状态已改变！','知道了','返回',gotoHangup,gotoHangup);
			}else{
				am.confirm('保存失败','保存单据时异常！','重试','返回',function(){
					am.cashierTab.hangupSave(data);
				},gotoHangup);
			}
			console.log(ret);
		});
	},
	getDisplayId: function(opt,cb){
		var self =this;
		if(this.billData){
			self.hangup(opt,this.billData.displayId,cb);
		}else{
			am.loading.show();
			am.page.hangup.getData(function(ret){
				am.loading.hide();
				//createService
				if(ret && ret.code == 0){

				}else{
					am.msg("手牌号读取失败~");
				}
				am.createService.show(ret,function(data){
					self.hangup(opt,data.displayId,cb);
				});
			});
		}
	},
	show:function (idx) {
		if(!this.$){
			this.init();
		}
		this.$li.removeClass('selected').eq(idx).addClass('selected');
		this.visible(1);
		this.$.addClass('show');
		this.$t.addClass('show');
		if(idx==2){
			this.$t.removeClass('show');
		}
		if(am.metadata.userInfo.mgjVersion==3){
            this.$.find('.tabUl li:last-child').show();
        }else {
            this.$.find('.tabUl li:last-child').hide();
        }
        //this.setMember();
        this.hideSubmitBtn();
		if(amGloble.metadata.shopPropertyField.mgjBillingType==1){//开单模式
			this.$t.find('.hangup').html("保存并返回");
			this.$t.find('.hangup').addClass("bigBtn");
		}else{
			this.$t.find('.hangup').html("挂单");
			this.$t.find('.hangup').removeClass("bigBtn");
		}
	},
	setHangUpNum:function (i) {
		if(i){
			this.$hangupBtn.find('.num').show().text(i);
		}else{
			this.$hangupBtn.find('.num').hide().text("");
		}
	},
	reset:function (i) {
		if(!this.$){
			this.init();
        }
        this.hideSubmitBtn();
		this.$li.find('.num').hide().text("");
		if(i){
			am.page.service.needReset = 1;
		}else{
			am.page.product.reset();
			am.page.product.needReset = 1;
		}
		this.servicePrice = 0;
		this.productPrice = 0;
		this.$total.text('￥0');
		this.billData = null;
	},
	setPrice:function (opt) {
		if(opt.num){
			this.$li.eq(opt.type).find('.num').show().text('￥'+toFloat(opt.totalPrice));
			if(opt.type){
				this.productPrice = opt.totalPrice;
			}else{
				this.servicePrice = opt.totalPrice;
			}
		}else{
			this.$li.eq(opt.type).find('.num').hide();
			if(opt.type){
				this.productPrice = 0;
			}else{
				this.servicePrice = 0;
			}
		}

		this.$total.text('￥'+toFloat(this.productPrice+this.servicePrice));
	},
	setMember:function (member,pass,card) {
		if(card){
			this.cardInfo = card;
		}
		var _this = this;
		if(member && !pass){
			// am.pw.check(member,function(verifyed){
			// 	if(verifyed){
			// 		_this.setMember(member,1);
			// 	}
			// });
			// return;
		}
		this.member = member;
		if(member){
			this.$user.find('.name').text(member.name);
			this.$user.find('.img').html(am.photoManager.createImage("customer", {
				parentShopId: am.metadata.userInfo.parentShopId,
				updateTs: member.lastphotoupdatetime || ""
			}, member.id + ".jpg", "s"));

			this.$card.parent().show().find('.name').text(member.cardName);
			var balanceFee = member.balance;
			if(member.cardtype == 1 && member.timeflag==0 && balanceFee){
				this.$card.find('.balance').show().text('￥'+(balanceFee||0));
			}else{
				this.$card.find('.balance').hide();
			}
			am.page.service._setMember(member);
			am.page.product._setMember(member);

			//if(this.member.timeflag==2){ //不能===
				am.page.service.getComboItems(this.member.id,this.member.shopId);
			//}
			/*if(this.member.sex === "F"){
				this.$gender.removeClass("male");
			}else{
				this.$gender.addClass("male");
			}*/
			//查看是不是有欠款
			cashierDebt.check(member);

		}else{
			this.$user.find('img').remove();
			this.$user.find('.name').text('散客');
			//this.$gender.removeClass("male");
			this.$card.parent().hide();
			//this.$billNo.val('').removeClass('error');
		}
	},
	goToSearch:function () {
		var self = this;
		$.am.changePage(am.page.searchMember, "",{
			onSelect:function(item){
				self.cardInfo = item;
				var page;
				if(self.$li.filter('.selected').index()){
					page = am.page.product;
				}else{
					page = am.page.service;
				}
				$.am.changePage(page, "",{
					member:item
				});
			}
		});
	},
	visible:function (v) {
		if(v){
			this.$.show();
			this.$t.show();
		}else{
			this.$.hide();
			this.$t.hide();
		}
	},
	hide:function () {
		this.$.removeClass('show');
		this.$t.removeClass('show');

		this.$memberInfo.hide();
		this.$card.removeClass('selected');
	},
	feedBill:function (bill,openbill) {
		$.am.changePage(am.page.service,'',{
			bill:bill,
			openbill:openbill
		});
		am.page.product.reset({
			bill:bill
		});
		this.billData = bill;
		//渲染单号
		if(this.billData && this.billData.serviceNO){
			this.$billNo.val(this.billData.serviceNO);
		}
		
		var self = this;
		if(bill.memId && bill.memId!=-1){
			am.loading.show();
			am.api.queryMemberById.exec({
				memberid:bill.memId
			},function(ret){
				am.loading.hide();
				if(ret && ret.code==0 && ret.content && ret.content.length){
					//to do 选择会员卡
					if(ret.content.length==1){
						self.setMember(ret.content[0]);
					}else if(ret.content.length>1){
						var data;
						try{
							data = JSON.parse(bill.data);
						}catch(e){
							$.am.debug.log(data);
						}
						if(data && data.cid){
							for (var i = 0; i < ret.content.length; i++) {
								if(ret.content[i].cid == data.cid){
									self.setMember(ret.content[i]);
									break;
								}
							}
						}else{
							var arr = [];
							for(var i=0;i<ret.content.length;i++){
								var item = ret.content[i];
								var cardName = item.cardName;
								var balanceFee = item.balance;
								if(item.cardtype == 1 && item.timeflag==0 && balanceFee){
									cardName+='(余额:￥'+balanceFee.toFixed(0)+')';
								}
								arr.push({
									name:cardName,
									data:item
								});
							}
							am.popupMenu("请选择会员卡", arr, function (ret) {
								console.log(ret)
								self.setMember(ret.data);
								self.feedMain(bill);
							},null,null,function(){
								self.setMember(ret.content[0]);
							});
							return;
						}
					}
				}else{
					am.msg("用户信息读取失败~");
				}
				self.feedMain(bill);
			});
		}else{
			self.feedMain(bill);
		}
	},
	feedMain:function (bill) {
		/*am.page.product.reset({
			bill:bill
		});*/
	},
	renderTabMember:function(bill){
		this.$memberUl.empty();
		if(bill){
			this.$.find(".waiterNum").html(bill.displayId);
			for(var i=1;i<=3;i++){
				var item = bill['emp' + i],
					empName = bill['emp' + i + 'Name'],
					isSpecified = bill['isSpecified' + i];
					$li  =this.$memberli.clone(true,true);
				if(item!=-1){//
					$li.find(".user_name").html(empName);
					if(isSpecified==1){
						$li.find(".text").addClass("selected").html("指定");
					}else{
						$li.find(".text").html("非指定");
					}
					$li.data("item",{
						no:item,
						empName:empName,
						isSpecified:isSpecified
					});
				}else{
					$li.addClass('append');
				}
				this.$memberUl.append($li);
			}
		}
	},
	getFirstEmp:function(idx){
		if(idx){
			return this.$memberUl.find("li").eq(idx).data("item");	
		}else{
			return this.$memberUl.find("li:first").data("item");	
		}
		
	},
	fullTab:function(flag){
		if(flag){
			this.$.addClass("fullTab");
			this.$t.addClass("fullTab");
		}else{
			this.$.removeClass("fullTab");
			this.$t.removeClass("fullTab");
		}
	},
	changeOpenBill:function(flag,bill){//切换到开单模式
		if(flag){
			this.$.addClass('openBill');
			this.$t.addClass('openBill');
			am.tab.main.hide();
			//显示人员
			if(bill){
				this.renderTabMember(bill);
			}
			this.fullTab(1);
		}else{
			this.$.removeClass('openBill');
			this.$t.removeClass('openBill');
			this.fullTab(0);
		}
			
	}
};

$(function () {
	am.cashierTab.init();
});
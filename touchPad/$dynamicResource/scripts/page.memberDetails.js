(function ($) {
	var self = am.page.memberDetails = new $.am.Page({
		id: "page_memberDetails",
		backButtonOnclick: function () {
			var self = this;
			if ($("#pswp_dom").is(":visible")) {
				am.gallery.close();
			}else if(self.$data&&self.$data.openbill){
				$.am.changePage(am.page.hangup, "slidedown",{openbill:self.$data.openbill});
			}else {
				var arr = [];
				for(var i=0;i<$.am.history.length;i++){
					if($.am.history[i].id!='page_addMember' && $.am.history[i].id!='page_memberDetails' && $.am.history[i].id!='page_addIncome'){ // && $.am.history[i].id!='page_searchMember'
						arr.push($.am.history[i]);
						if(!self.$userInfo) return am.msg("数据异常，请联系客服");
						//返回同步会员锁定样式,会员详情返回的缓存头像锁定状态
						if($.am.history[i].id=='page_comboCard' || $.am.history[i].id=='page_memberCard'){
							if(am.isMemberLock(self.$userInfo.lastconsumetime, self.$userInfo.locking)){
								$("#page_comboCard").find(".member img").addClass("lock");
								$("#page_memberCard").find(".member img").addClass("lock");
							}else{
								$("#page_comboCard").find(".member img").removeClass("lock");
								$("#page_memberCard").find(".member img").removeClass("lock");
							}
						}
						if($.am.history[i].id=='page_service' || $.am.history[i].id=='page_product'){
							if(am.isMemberLock(self.$userInfo.lastconsumetime, self.$userInfo.locking)){
								$("#tab_cash").find(".tabItem.user").addClass("lock");
							}else{
								$("#tab_cash").find(".tabItem.user").removeClass("lock");
							}
						}
						if($.am.history[i].id=='page_searchMember' || $.am.history[i].id=='page_appointment'){
							if(self.$data && (self.$data.listWarpIndex || self.$data.listWarpIndex == "0") ){
								var $avatar = $("#page_searchMember").find(".list-left").eq(self.$data.listWarpIndex).find(".list-avatar");
								var $appointmentAvatar = $("#page_appointment").find(".list-left").eq(self.$data.listWarpIndex).find(".list-avatar");
								if(am.isMemberLock(self.$userInfo.lastconsumetime, self.$userInfo.locking)){
									$avatar.addClass("lock");
									$appointmentAvatar.addClass("lock");
								}else{
									$avatar.removeClass("lock");
									$appointmentAvatar.removeClass("lock");
								}
							}
						}
					}
				}
				$.am.history = arr;
				$.am.page.back("slidedown");
			}

		},
		init: function () {
			var self = this;
			this.$contentList = this.$.find(".rightBody .commonBox");//三个内容区域
			this.$leftBox = this.$.find(".memberdetailsbox .pageLeft");//左侧的盒子
			this.$twoStatus = this.$leftBox.find('.two_status');
			this.$tab = this.$.find(".memberDetailsTab");//tab

			this.$cardBox = this.$.find(".comboBox .leftCard");//卡列表的盒子
			this.$cardList = this.$cardBox.find('.list');
			this.$cardLi = this.$cardBox.find("li:first").remove();
			this.$cardul = this.$cardBox.find("ul").remove();
			this.$cardWrapper = this.$cardBox.find('.wrapper').remove();
			
			this.$comboBox = this.$.find(".comboBox .rightcombo");//套餐列表盒子
			this.$comboList = this.$comboBox.find('.list');
			this.$comboli = this.$comboBox.find(".list li:first").remove();
			// this.$comboul = this.$comboBox.find("ul").remove();
			this.$comboul = this.$comboBox.find(".wrapperUl").remove();
			this.$comboWrapper = this.$comboBox.find('.wrapper').remove();
			this.$comboPackageUl=this.$comboli.find('.comboPackageUl:first').remove();
			this.$comboItem=this.$comboPackageUl.find('.comboItem:first').remove();
			// this.$remarkText=this.$comboItem.find('.remarkText').css('width',(this.$comboItem.find('.comboContent').width()-this.$comboItem.find('.remarkLabel').outerWidth()+'px'));
			this.$comboItemGoods=this.$comboPackageUl.find('.comboItemGoods:first').remove();
			this.$comboTitTabWrap=this.$comboBox.find('.comboTit').on('vclick','span',function(){
				$(this).siblings('span').removeClass('selected').end().addClass('selected');
				var data=[],typeIndex=$(this).index();
				if(typeIndex==0){
					data=self.$userInfo.validtreatMentItems;
				}else if(typeIndex==1){
					data=self.$userInfo.usedtreatMentItems;
				}else if(typeIndex==2){
					data=self.$userInfo.overDuetreatMentItems;
				}
				self.renderCardCombo(data);
			});
			this.$comboList.on('vclick','.record',function(){
				var data=$(this).parents('.comboItem').data('comboItem');
				var that = $(this);
				self.getConsumptionData(data,function(res){
					if(res.content.length > 0) {
						self.$.find(".mask_box").addClass("show_mask");
						self.$.find(".record_content").addClass("show_detail");
						self.$.find(".record_detail").empty();
						self.$.find(".project_name").text(that.attr("data-name"));
						var $html;
						for(var i = 0; i < res.content.length; i++) {
							var $item = res.content[i],
								$jude = ($item.EXPENSECATEGORY == 0 || $item.EXPENSECATEGORY == 1 || ($item.EXPENSECATEGORY == 6 && $item.CONSUMETYPE == -1) || ($item.EXPENSECATEGORY == 4 && $item.CONSUMETYPE == -1));
							$html = $(
								'<tr>' +
									'<td class="first_table">' + $item.BILLNO + '</td>' +
									'<td>' + new Date($item.CONSUMETIME).format("yyyy.mm.dd") + '</td>' +
									'<td>' + $item.CONSUMETIMES + '</td>' +
									'<td>' + ($item.SUMTIMES=="-99"?"不限次":$item.LOSTCONSUMETIMES) + '</td>' +
									'<td>' + $item.OPERATORNAME + '</td>' +
									'<td class="check_name ' + ($jude ?"am-clickable":"") + '" data-billid="' + ($item.BILLID) + '">' + ($jude ? "查看" : "--") + '</td>' +
								'</tr>'
							);
							self.$.find(".record_detail").prepend($html);
							self.$.find(".total_num").html($item.SUMTIMES=="-99"?"不限":$item.SUMTIMES);
							self.$.find(".remain_num").html($item.SUMTIMES=="-99"?"不限":$item.LEAVETIMES);
						}
					}else {
						am.msg("无消耗记录");
					}
				})	

			})
			
			this.$adbox = this.$.find(".addphoto_model");//添加相册弹出层
			this.$azbox = this.$.find(".addqzone_model");//添加说说弹出层
			this.$cabox = this.$.find(".card_model");//修改会员卡弹出层
			this.$arbox = this.$.find(".addremark_model");//添加备注弹出层
			this.$exbox = this.$.find('.exchange_model');//门店消费积分兑换层
			this.$privilegeCardBox = this.$.find('.privilegeCard_model');//特权弹窗
			this.$startInput=this.$.find('.privilegeCard_model .input_start input');//特权起始日期
			this.$endInput=this.$.find('.privilegeCard_model .input_end input');//特权有效期日期
			this.$memberInfo = {}; //会员信息
			//chali
			this.$comboul.empty();//清空列表

			this.$fileBox = this.$.find(".fileBox");
			this.$fileul = this.$fileBox.find(".inner");
			this.$fileli = this.$fileul.find(".listbox:first");
			this.$imgBoxul = this.$fileli.find("ul");
			this.$imgBoxli = this.$fileli.find("li:first");
			this.$fileul.find(".listbox").remove();
			this.$imgBoxul.empty();
			this.fileBoxIndex = 0;
			this.fileBoxSize = 10;
			this.adboxSelectedCategory = '';
			this.adboxSelectedSubCategory = '';
			this.adboxSelectedProductId = '';
			this.adboxSelectedProductName = '';
			this.adboxSelectedProductTid = '';
			this.recordIndex = 1;
			this.pointIndex = 1;
			this.cardCashIndex = 1;
			this.arrearsIndex = 1;
			this.redPocketsIndex= 1;//红包记录页码

			this.$recordBox = this.$.find(".recordBox .body");
			this.$pointBox = this.$.find(".pointBox .body")
			this.remarkFlag='';
			this.$changeTarget=null;
			this.$popWrap=this.$.find('.card_popup');
			this.$cardfeePopup=this.$.find('.popup_right.cardfee');
			this.$comboPopup=this.$.find('.popup_right.combo');
			this.$targetCard=null;
			this.memberpw='';
			this.$selSTime = this.$.find('.cardCash_box .startT');
			this.$selETime = this.$.find('.cardCash_box .endT');
			this.$pointSelSTime = this.$.find('.point_box .startT');
			this.$notifySms = this.$.find('.notifySms').vclick(function(){
				if(!self.cardsInfo.smsflag){
					am.msg('无可发短信的会员卡');
					return;
				}
				var _this = $(this);
				var description = '';
				if(_this.hasClass('on')){
					description = '取消向顾客发送短信？';
				}else {
					description = '开通向顾客发送短信？';
				}
				atMobile.nativeUIWidget.confirm({
					caption: '发送短信',
					description: description,
					okCaption: '确定',
					cancelCaption: '返回'
				}, function(){
					self.updateMemberSms(_this,'notifySms');
				}, function(){
	
				});
			});
			 //初始化作品自定义名称
			 if(am.metadata.configs.category_1){//判断用户是否保存过相关配置,没报错则用默认
				var newworks=[];
				for(var worksname=1;worksname<7;worksname++){
					if(am.metadata.configs['category_'+worksname]=="true"){
						if(worksname==2){
							for(var iims=1;iims<4;iims++){
								if(am.metadata.configs['category_'+worksname+'_text'+iims]){
									newworks.push({
										category:worksname,
										subCategory:worksname+'0'+iims,
										subCategoryName:am.metadata.configs['category_'+worksname+'_text'+iims]
									})
								}
							}
						}else{
							for(var iims=1;iims<10;iims++){
								if(am.metadata.configs['category_'+worksname+'_text'+iims]){
									newworks.push({
										category:worksname,
										subCategory:worksname+'0'+iims,
										subCategoryName:am.metadata.configs['category_'+worksname+'_text'+iims]
									})
								}
							}
						}
	
					}
				}
				metaConfig.invention.subCategories=newworks;
			 }
			this.$deductSmsFeeFlag = this.$.find('.deductSmsFeeFlag').vclick(function(){
				if(!self.cardsInfo.deductSmsFlag){
					am.msg('无可扣信息费的会员卡');
					return;
				}
				var _this = $(this);
				var description = '';
				if(_this.hasClass('on')){
					description = '取消扣除该顾客的信息费？';
				}else {
					description = '开通扣除该顾客的信息费？';
				}
				atMobile.nativeUIWidget.confirm({
					caption: '扣除信息费',
					description: description,
					okCaption: '确定',
					cancelCaption: '返回'
				}, function(){
					self.updateMemberSms(_this,'deductSmsFeeFlag');
				}, function(){
	
				});
				
			});

			//会员锁定点击
			this.$memberLock = this.$.find('.memberLock').vclick(function(){
				var _this = $(this);
				var data = {};
				var caption = '',description = '',okCaption = '';
				if(_this.hasClass('on')){
					caption = '会员锁定';
					description = '确认锁定会员';
					okCaption = '确认锁定';
					data = {
						memberId: self.$userInfo.id,
						locking: 2,
						cb: function(){
							_this.removeClass('on');
							self.$leftBox.find('.header').addClass("lock");
							self.$userInfo.locking = 2;
							am.page.searchMember.saveLastSelectMember(self.$userInfo);
						}
					};
				}else{
					caption = '解除锁定';
					description = '确认解除会员锁定';
					okCaption = '解除锁定';
					data = {
						memberId: self.$userInfo.id,
						locking: 1,
						cb: function(){
							_this.addClass('on');
							self.$leftBox.find('.header').removeClass("lock");
							self.$userInfo.locking = 1;
							am.page.searchMember.updateLastSelectMember(self.$userInfo);
						}
					};
				}
				atMobile.nativeUIWidget.confirm({
					caption: caption,
					description: description,
					okCaption: okCaption,
					cancelCaption: '取消'
				}, function(){
					am.lockRule(data);
				});
			});

			this.$otherEmps = this.$.find('.otherEmps').vclick(function(){
        		$(this).hide();
            });
            this.$otherEmpsText = this.$otherEmps.find('.text');

			this.$table = this.$.find(".table-content-list tbody").on("vclick",".treatPackageName",function(){
				var data = $(this).parent('span').data('data');
				if (data) {
					var opt = {
						"shopId": am.metadata.userInfo.shopId,
						"billId": data.billId,
						"billDetailId": data.id
					}
					self.getTreatPackageDetail(opt, function (list) {
						am.treatPackageDetail.show(list)
					})
				}
			}).on("vclick", ".signature", function () {
				var $this = $(this);
				if(am.signatureView.loading){
					return;
				}
				am.signatureView.show({
					unresign: 1,
					memberId: $this.data("memberid"),
					billId: $this.data("billid"),
					storeId: $this.data("storeid"),
					failed: function () {
						$this.addClass("am-disabled");
					}
				});
			}).on("vclick", ".comment", function () {
				$(this).parents('tr').next().toggle();
				self.tableScroll.refresh();
			}).on('vclick','.more',function(){
				if(!$(this).find('.otherEmps').html()){
	        		return;
	        	}
	        	var w = $(this).width();
	        		t = $(this).offset().top,
	        		l = $(this).offset().left,
	        		text = $(this).find('.otherEmps').html();
	        	self.$otherEmps.show();
	        	self.$otherEmpsText.html(text).css({
	        		'min-width': w+'px',
	        		'max-width': 2*w+'px',
	        		'bottom': $('body').height()-t+'px',
	        	});
	        	self.$otherEmpsText.css({
	        		'left': l-(self.$otherEmpsText.outerWidth()-w)/2+'px'
	        	});
			});
			this.phtotypeScroll = new $.am.ScrollView({
				$wrap: self.$adbox.find(".mbody-left .photo_typebox"),
				$inner: self.$adbox.find(".mbody-left .photo_typebox>ul"),
				direction: [false, true],
				hasInput: false
			});
			this.listDialogScroll = new $.am.ScrollView({
				$wrap: self.$adbox.find(".pro_list_dialog .pro_list_scroll"),
				$inner: self.$adbox.find(".pro_list_dialog .pro_list_scroll>ul"),
				direction: [false, true],
				hasInput: false
			});
			this.redPocketsPager = new $.am.Paging({
				$: self.$.find(".redPocketsPage"),
				showNum: 15,//每页显示的条数
				total: 1,//总数
				action: function (_this, index) {
					self.redPocketsIndex = index + 1;
					self.renderRedPocketsTable();
				}
			});
			// this.cardCashPager = new $.am.Paging({
			// 	$: self.$.find(".cardCashPage"),
			// 	showNum: 15,//每页显示的条数
			// 	total: 1,//总数
			// 	action: function (_this, index) {
			// 		self.cardCashIndex = index + 1;
			// 		$(".check_btn.cardCash").trigger('vclick');
			// 	}
			// });
			self.$.on("vclick", ".check_btn.cardCash", function () { //查询卡金变动流水
				var $started_T = self.$selSTime.val(),
					$memberCard = self.getSelectValue().memberC;
				// 性能监控点
				monitor.startTimer('M12', {
					startDate: $started_T,
					card: $memberCard
				});
				self.getCardCashData($started_T,$memberCard,function(res){
					self.$.find(".card_cash .table_detail").show();
					self.$cardCashBoxScroll.refresh();
					self.$.find(".card_cash_detail").empty();
					self.$.find(".card_cash .empty_box").remove();
					self.$.find(".card_cash .tip_box").remove();
					if (res.records && res.records.length) {
						console.log("卡金变动流水",res.records)
						var initCardFee = res.currCardFee,
							initPresentFee = res.currPresentFee,
							$filter = [];
						for(var i = 0; i < res.records.length; i++) {
							var $items = res.records[i];
							if($items.cardFee != 0 || $items.presentFee != 0) {
								$filter.push($items);
							}
						}
						if($filter.length > 0) {
							for (var i = 0; i < $filter.length; i++) {
								self.$.find(".card_cash .empty_box").remove();
								var item = $filter[i];
								var positiveNum = item.type==0||item.type==1||item.type==3||item.type==5||item.type==7||item.type==9||item.type==12||item.type==14||item.type==15||item.type==16||item.type==19||item.type==20||item.type==32||item.type==34||item.type==88||item.type==99;
								var $html = $(
									'<tr>' +
										'<td>' + (item.billNo ? '<a href="javascript:;" class="billDetail am-clickable" data-billid="'+ item.billId +'">' + item.billNo + '</a>' : "--") + '</td>' +
										// '<td>' + (item.cancel==1?(self.changeMode(item.type) + "撤单"):self.changeMode(item.type)) + '</td>' +
										'<td>' + (item.type==99?(item.cardFee>0?"商城卡金支付":"商城卡金支付-商城退款"):(item.cancel==1?((item.type==2&&item.consumetype==1?"充值":self.changeMode(item.type)) + "撤单"):(item.type==2&&item.consumetype==1?"充值":self.changeMode(item.type)))) + '</td>' +
										'<td class="' + ((positiveNum?(0-item.cardFee):item.cardFee) > 0 ? "negative":"upright") + '">' + ((positiveNum?(0-item.cardFee):item.cardFee)>0?("+"+(positiveNum?(0-item.cardFee).toFixed(2):(item.cardFee).toFixed(2))):((positiveNum?(0-item.cardFee):item.cardFee)==0?"--":(positiveNum?(0-item.cardFee).toFixed(2):(item.cardFee).toFixed(2)))) + '</td>' +
										'<td>' + initCardFee.toFixed(2) + '</td>' +
										'<td class="' + ((positiveNum?(0-item.presentFee):item.presentFee) > 0 ? "negative": (0-item.presentFee) == 0 ? "":"upright") + '">' + ((positiveNum?(0-item.presentFee):item.presentFee) > 0? ("+" +(positiveNum?(0-item.presentFee).toFixed(2):(item.presentFee).toFixed(2))) : ((positiveNum?(0-item.presentFee):item.presentFee)==0?"--":(positiveNum?(0-item.presentFee).toFixed(2):(item.presentFee).toFixed(2)))) + '</td>' +
										'<td>' + initPresentFee.toFixed(2) + '</td>' +
										'<td>' + (new Date(item.consumeTime).format("yyyy-mm-dd HH:MM")) + '</td>' +
										'<td>' + item.shopName + '</td>' +
										'<td>' + (item.operator?item.operator:"--") + '</td>' +
										'<td>' + (item.remark ? '<span class="iconfont icon-comments am-clickable"></span>' : "-") + '</td>' +
									'</tr>'
								).data("item", item);
								self.$.find(".card_cash_detail").append($html);
								initCardFee = initCardFee - ((positiveNum?(0-item.cardFee):item.cardFee)>0?((positiveNum?(0-item.cardFee):item.cardFee)):((positiveNum?(0-item.cardFee):item.cardFee)==0?"0":(positiveNum?(0-item.cardFee):item.cardFee)));
								initPresentFee = initPresentFee - ((positiveNum?(0-item.presentFee):item.presentFee) > 0? ((positiveNum?(0-item.presentFee):item.presentFee)) : ((positiveNum?(0-item.presentFee):item.presentFee) == 0 ? "0" : ((positiveNum?(0-item.presentFee):item.presentFee))));
							}
							self.$cardCashBoxScroll.refresh();
							self.$cardCashBoxScroll.scrollTo("top");
						} else {
							self.$.find(".card_cash .table_detail").hide();
							self.$.find(".card_cash").append($('<div class="empty_box"><div class="empty_box_image"></div></div>'));
						}
						
					} else {
						self.$.find(".card_cash .table_detail").hide();
						self.$.find(".card_cash").append($('<div class="empty_box"><div class="empty_box_image"></div></div>'));
					}
					self.$.find(".cardCashPage").show();
					monitor.stopTimer('M12');
					// self.cardCashPager.refresh(self.cardCashIndex-1,res.count);
				})
			}).on("vclick", ".billDetail", function () {
				var billId = $(this).data('billid');
				if (billId) {
					$.am.changePage(am.page.billDetail, 'slideDown', {
						id: billId
					});
				}
			});

			this.$amComment = this.$.find(".am-comment");
			this.$redPocketBox=this.$.find('.redPocketBox');//红包记录盒子
			this.$redPocketBody=this.$redPocketBox.find('.body').css('height',$(window).height()*0.6);;
			this.$redPocketsTbody=this.$redPocketBox.find('tbody');//红包表格tbody
			this.$redPocketBoxScroll = new $.am.ScrollView({ // 红包表格滚动
				$wrap: self.$redPocketBox.find(".body"),
				$inner: self.$redPocketBox.find(".body table"),
				direction: [false, true],
				hasInput: false,
			});
			this.$redPocketBoxScroll.refresh();

			//修复红包表格滚动不隐藏comment的问题
			this.$redPocketBox.find(".body").on("vtouchmove",function(){
				self.$amComment.hide();
				self.$amComment.find(".title").show();
			});

			self.$.find(".card_cash_detail").on("vclick", ".icon-comments", function(e) {
				e.stopPropagation();
				var item = $(this).parents("tr").data("item");
				var left = $(this).offset().left, top = $(this).offset().top;
				if (self.$amComment.is(":visible")) {
					self.$amComment.hide();
					return false;
				}
				var bodyWidth = $("body").outerWidth();
				self.$amComment.find(".title").hide();
				self.$amComment.find(".info").html(item.remark || '');
				var amCommentH = self.$amComment.outerHeight();
				if(bodyWidth > 1024){
					top = top - amCommentH;
				}else{
					top = top - amCommentH - 20;
				}
				self.$amComment.css({
					display: 'block',
					width: '200px',
					top: top,
					left: 'auto',
					right: '10px'
				}).addClass("cardFeeComment").removeClass("luckMoneyComment");
			});

			this.$redPocketBox.on("vclick",'.btnBox',function(){
				var cardInfo=self.getCardTypeInfo(self.cardCash);
				if(cardInfo){
					self.$memberInfo.cardTypeId=cardInfo.cardTypeId,
					self.$memberInfo.cardNum=cardInfo.cardNum;
				}
				 am.sendRedPocketsDialog.show({
					member:self.$memberInfo,
					scb:function(){
						if(self.$redPocketBox.find(".radioBox .iconfont").hasClass("icon-checkbox")){
							var status = "1,2";
						}
						// self.getRedPocketsList(status)
						self.renderRedPocketsTable();
					}
				 });
			});
			this.$redPocketBox.on("vclick",'.videoHelpWrap',function(){
				console.log("私发红包视频帮助14");
				am.getVideoHelp(this,"14");
		   });

			this.$redPocketBox.on("vclick",'.radioBox',function(){
				var $radio = $(this).find(".iconfont");
				if($radio.hasClass("icon-checkbox")){
					$radio.addClass("icon-checkboxoutlineblank");
					$radio.removeClass("icon-checkbox");
					// self.getRedPocketsList();
					// self.renderRedPocketsTable();
				}else{
					$radio.addClass("icon-checkbox");
					$radio.removeClass("icon-checkboxoutlineblank");
					// // self.getRedPocketsList("1,2");
					// self.renderRedPocketsTable();
				}
				self.renderRedPocketsTable();
			});

			//点击其他地方隐藏
			this.$.vclick(function(){
				self.$amComment.hide();
			});

			var clickNum = '';
			//红包记录名称点击
			this.$redPocketsTbody.on("vclick",".activityTitleTd",function(e){
				self.$amComment.hide();
				e.stopPropagation();
				var index = $(this).parents("tr").index();
				if(index === clickNum){
					self.$amComment.hide();
					clickNum = '';
					return false;
				}else{
					clickNum = index;
				}
				var bodyWidth = $("body").outerWidth();
				var left = $(this).offset().left, top = $(this).offset().top;
				var height = $(this).outerHeight();
				var contentHeight = self.$.find(".content").outerHeight() + self.$.find(".content").offset().top;
				var item = $(this).parent('tr').data('item');
				var rule = item.rule;
				if(rule){
					rule = JSON.parse(rule);
					var $rule = self.getLuckyMoneyConfig(item,rule);
					if($rule){
						self.$amComment.find(".info").html($rule);
						var amCommentH = self.$amComment.outerHeight();
						if(bodyWidth > 1024){
							top = top - amCommentH;
						}else{
							top = top - amCommentH - 10;
						}
						self.$amComment.css({
							display: 'block',
							top: top,
							right: "auto",
							left: left
						}).addClass("luckMoneyComment").removeClass("cardFeeComment");
						return false;
					}
				}
				am.msg('该红包无规则');
				console.log('该红包无规则');
			}).on("vclick", ".verificationBtn", function () {
				// 核销红包
				// 校验红包是否可以在当前门店核销
				var $this = $(this);
				if ($this.hasClass('disable')) {
					return;
				} else {
					var data = $this.parents('tr').data('item');
					am.confirm("提示", "确认核销?", "确认", "取消", function () {
						self.verificationRedPocket($this, data);
					});
				}
			}).on("vclick", ".revokeBtn", function () {
				// 撤回红包
				var $this = $(this),
					$tr = $this.parents('tr'),
					data = $tr.data('item');
				var during=am.now().getTime()-data.createtime;
				if(during>86400000){
					return am.msg('超过24小时不能撤回');
				}
				am.confirm("提示", "确认撤回?", "确认", "取消", function () {
					self.revokeRedPocket($tr, data);
				});
			});
			// 卡金变动流水滚动
			this.$cardCashBoxScroll = new $.am.ScrollView({ 
				$wrap: self.$.find(".card_cash"),
				$inner: self.$.find(".card_cash .table_detail"),
				direction: [false, true],
				hasInput: false
			});
			this.$cardCashBoxScroll.refresh();

			// 积分记录滚动
			this.$pointBoxScroll = new $.am.ScrollView({ 
				$wrap: self.$.find(".pointBox .contentbox"),
				$inner: self.$.find(".pointBox .table_detail"),
				direction: [false, true],
				hasInput: false
			});
			this.$pointBoxScroll.refresh();

			//预约记录
			this.$reservationBox = this.$.find('.reservationBox').on('vclick','.openReservation',function(){
				self.offReservationReject();
			});
			this.$reservationList = this.$reservationBox.find('.list')
			this.$reservationInner = this.$reservationList.find('.list-inner');
			this.$reservationItem = this.$reservationInner.find('li').remove();
			this.$reservationEmpty = this.$.find('.reservationBox .empty');
			this.$reservationScroll = new $.am.ScrollView({ 
				$wrap: this.$reservationList,
				$inner: this.$reservationInner,
				direction: [false, true],
				hasInput: false
			});

			$.each(metaConfig.invention.subCategories, function (i, item) {
				var li = '<li class="am-clickable" pid="' + item.category + '" tid="' + item.subCategory + '">' + item.subCategoryName + '</li>';
				self.$adbox.find(".mbody-left .photo_typebox>ul").append(li);
			});
			this.$.find(".footbtn").vclick(function () {
				if (am.operateArr.indexOf("R") != -1) {
					$.am.changePage(am.page.addMember, "slideup", {userInfo: self.$userInfo,openbill:self.$data.openbill});
				} else {
					am.msg('你没有权限进行此操作');
				}
			});

			//更多(收起)
			this.$.find(".remarks").on('vclick', '.more', function () {
				var $more = $(this);
				var $remarks = $more.parent('.remarks');
				var nowT = $remarks.text().replace(/更多|收起|修改/g, '');
				var newT = $remarks.data('remarks');

				if ($more.hasClass('on')) {	//收起操作
					$remarks.html(newT + '<a href="javascript:;" class="more am-clickable">更多</a><a href="javascript:;" class="edit am-clickable">修改</a>');
					$remarks.data('remarks', nowT);
				} else {	//展开操作
					$remarks.html(newT + '<a href="javascript:;" class="more am-clickable on">收起</a><a href="javascript:;" class="edit am-clickable">修改</a>');
					$remarks.data('remarks', nowT);
				}
				self.leftBoxScroll.refresh();
			});
			//修改
			this.$.find(".remarks").on('vclick', '.edit', function () {
				if (!self.remarksPermissions()) return;

				var $edit = $(this);
				var $more = $edit.siblings('.more');
				var $remarks = $edit.parent('.remarks');

				if ($more.hasClass('on')) {	//收起操作
					var _textarea = $remarks.text().replace(/更多|收起|修改/g, '');
				} else {	//展开操作
					var _textarea = $remarks.data('remarks');
				}

				var $textarea = '<textarea maxlength="100">' + _textarea + '</textarea>';
				setTimeout(function () {
					$remarks.css({'min-height': '48px'});
					$remarks.parent('.remarkswrap').append($textarea);
					self.$.find(".remarkswrap textarea").focus();
				}, 250);
			});
			this.$.find(".remarkswrap").on('blur', 'textarea', function () {
				self.$.find(".remarks").css({'min-height': 'auto'});

				var $textarea = $(this);
				var _id = self.$leftBox.data('item').id;
				var _val = $(this).val();
				var _d = {
					'memId': _id,
					'page': _val
				};
				am.loading.show("修改中,请稍候...");
				am.api.memberUpdatepage.exec(_d, function (res) {
					am.loading.hide();
					console.log(res);
					if (res.code == 0) {
						$textarea.remove();

						self.$userInfo.page = _d.page;
						//默认显示为收起状态
						if (self.getLength(_d.page) > 88) {
							self.$.find(".remarks").data('remarks', _d.page).html(self.mySubStr(_d.page, 88) + '...' + '<a href="javascript:;" class="more am-clickable">更多</a><a href="javascript:;" class="edit am-clickable">修改</a>');
						} else if (_d.page == '') {
							self.$.find(".remarks").html('');
						} else {
							self.$.find(".remarks").data('remarks', _d.page).html(_d.page + '<a href="javascript:;" class="edit am-clickable">修改</a>');
						}
						self.leftBoxScroll.refresh();
					} else {
						am.msg(res.message || "数据获取失败,请检查网络!");
					}
				});
			});
			this.selectData={
				sel_member_card:[]
			};
			this.$fileBox.on("vclick", ".leftTit span.lookmsg,.leftTit span.lookphoto", function () {
				$(this).addClass("selected").siblings().removeClass("selected");
				self.renderOurselves(true);
			}).on("vclick", ".leftTit span.addphoto", function () {//添加说说按钮
				self.$adbox.addClass("hide");
				self.$azbox.addClass("hide");
				if (self.$fileBox.find(".leftTit span.addphoto").text() == '添加照片') {
					self.$adbox.removeClass("hide");
					self.phtotypeScroll.refresh();
				} else {
                    self.$azbox.removeClass("hide");
					setTimeout(function(){
						self.$azbox.find('textarea[name="addqzone_qzone_content"]').focus();
					},100);
				}

			}).on("vclick", ".imglist ul>li", function () {
				var items = [];
				var idx = $(this).index();
				$(this).parent().find("img").each(function () {
					items.push({
						src: $(this).attr("src").replace("_s", "_l"),
						w: $(this).attr("w")==256?1024:2048,
                        h: $(this).attr("w")==256?1024:2048,
					});
				});
				self.pswpTimer && clearTimeout(self.pswpTimer);
				am.loading.show();
				self.pswpTimer = setTimeout(function () {	
					am.loading.hide();
					am.pswp(items, idx);
				}, 800);
			});
			self.$arbox.on("vclick",".addremark_model_mask,.addremark_model-header .right_btn,.addremark_model-footer .cancel_btn",function(){//备注弹窗关闭行为
				self.$arbox.addClass("hide");
				self.$.find('[isdisabled=1]').addClass('am-clickable');
			}).on("vclick",".save_btn",function(){//备注保存
				var remark = self.$arbox.find("textarea[name='addremark_qzone_content']").val();
				var id = self.$arbox.data('id');
				console.log(id)
				if (remark.length < 0 || remark.length > 100) {// 20
						amGloble.msg("请输入0-100个字符备注内容！");
						return;
					}
					amGloble.loading.show();
				var opt={};
				if(self.remarkFlag=='card'){
					opt={
						cardRemark:remark,
						cardId:id,
						optName:amGloble.metadata.userInfo.userName
					}
				}else if(self.remarkFlag=='combo'){
					opt={
						id:id,
						itemRemark:remark
					}
				}
				self.submitRemark(opt,self.remarkFlag);
			})
			self.$azbox.on("vclick", ".addqzone_model_mask,.addqzone_model-header .right_btn,.addqzone_model-footer .cancel_btn", function () {
				self.$azbox.addClass("hide");
				self.$azbox.find("textarea[name='addqzone_qzone_content']").blur();
			})
				.on("vclick", ".save_btn", function () {
					var photos = [];
					self.$azbox.find(".photo_upload_boxs li").each(function () {
						var id = $(this).data("id");
						if (id) {
							photos.push(id);
						}
					});
					photos = am.isNull(photos) ? '' : photos.join(",");
					// if (photos.length < 1) {
						// amGloble.msg("请至少上传一张图片！");
						// return;
                    // }
					var comment = self.$azbox.find("textarea[name='addqzone_qzone_content']").val();
					if (comment.length < 1 || comment.length > 200) {
						amGloble.msg("请输入1-200个字符客户档案内容！");
						return;
					}
					amGloble.loading.show();
					var user = amGloble.metadata.userInfo;
					var opt = {
						"memId": self.$userInfo.id,
						"shopId": amGloble.metadata.userInfo.shopId,
						"userType": user.userType,
						"userId": user.userId,
						"userName": user.userName,
                        "archives": comment,
                        "imgs": photos
					};
					self.submitArchives(opt);
				}).on("vclick", ".photo_upload_boxs li", function () {
					var $this = $(this);
					var user = amGloble.metadata.userInfo;
					var opt = {
						parentShopId: user.parentShopId,
						authorId: user.userId
					};
					amGloble.photoManager.takePhoto("customerFile", opt, function (uuid) {
						$this.html(amGloble.photoManager.createImage("customerFile", opt, uuid, "s"));
						$this.data("id", uuid);
						if ($this.hasClass("empty_box")) {
							$this.removeClass("empty_box");
							if (self.$azbox.find(".photo_upload_boxs li").length < 9) {
								self.$azbox.find(".photo_upload_boxs ul").append('<li class="empty_box am-clickable"></li>');
							}
						} else {

						}
					}, function () {
						console.log("fail");
					});
				})


			self.$adbox.on("vclick", ".addphoto_model_mask,.addphoto_model-header .right_btn,.addphoto_model-footer .cancel_btn", function () {
				self.$adbox.addClass("hide");
				self.$adbox.find("textarea[name='talk_content']").blur();
			})
				.on("vclick", ".mbody-left .photo_typebox>ul>li", function () {
					var _this = this;
					var photos = [];
					self.$adbox.find(".photo_upload_boxs li").each(function () {
						var id = $(this).data("id");
						if (id) {
							photos.push(id);
						}
					});
					function action() {
						self.adboxSelectedCategory = $(_this).attr("pid");
						self.adboxSelectedSubCategory = $(_this).attr("tid");
						self.$adbox.find(".mbody-left .left-dot").addClass("selected");
						self.$adbox.find(".mbody-left .photo_typebox>ul>li").removeClass("selected");
						$(_this).addClass("selected");
					}

					if (photos.length) {
						amGloble.confirm("需要重新上传照片", "修改作品类别后需要重新上传照片，确定要这样做吗？", "确定", "返回", function () {
							self.$adbox.find(".photo_upload_boxs ul").html('<li class="empty_box am-clickable"></li>');
							action();
						}, function () {
						});
					} else {
						action();
					}
				})
				.on("change", ".mui-switch", function () {
					if ($(this).prop("checked")) {
						self.$adbox.find(".mbody-right .right_mid").addClass("selected");
					} else {
						self.$adbox.find(".mbody-right .right_mid").removeClass("selected");
					}
				})
				.on("keyup", ".text_content textarea", function () {
					if ($(this).val().length > 0) {
						self.$adbox.find(".mbody-right .right_bottom").addClass("selected");
					} else {
						self.$adbox.find(".mbody-right .right_bottom").removeClass("selected");
					}
				})
				.on("click", "*", function () {
					if ($) {
						if ($(this).hasClass("nothide")) {
							event.stopPropagation();
							return false;
						}
						self.$adbox.find(".pro_list_dialog").hide();
						self.$adbox.find(".pro_list_dialog").removeClass("right");
					}
				})
				.on("vclick", ".linked_btn", function () {
					if (!self.$adbox.find(".pro_list_dialog").is(":visible")) {
						self.$adbox.find(".pro_list_dialog").show();
						self.listDialogScroll.refresh();
					} else {
						self.$adbox.find(".pro_list_dialog").hide();
					}
				})
				.on("vclick", ".relink_btn", function () {//重新关联还是商品
					if (!self.$adbox.find(".pro_list_dialog").is(":visible")) {
						self.$adbox.find(".pro_list_dialog").show();
						self.$adbox.find(".pro_list_dialog").addClass("right");
						self.listDialogScroll.refresh();
					} else {
						self.$adbox.find(".pro_list_dialog").removeClass("right");
						self.$adbox.find(".pro_list_dialog").hide();
					}
					self.$adbox.find("input[name='workPrice']").val($(this).find("span").last().text().replace("￥", ""));
					self.$adbox.find("input[name='workPrice']").attr("readonly", "readonly");
				})
				.on("vclick", ".pro_list_dialog li", function () {//选中商品
					self.adboxSelectedProductId = $(this).attr("iid");
					self.adboxSelectedProductName = $(this).find("span").first().text();
					self.adboxSelectedProductTid = $(this).attr("tid");
					self.$adbox.find(".pro_list_dialog").hide();
					self.$adbox.find(".link_box").addClass("hide");
					self.$adbox.find(".linked_box").removeClass("hide");
					self.$adbox.find(".pro_list_dialog").removeClass("right");
					self.$adbox.find(".item_name").text($(this).find("span").first().text());
					self.$adbox.find(".item_price").text($(this).find("span").last().text());
					self.$adbox.find(".right_top").addClass("selected");
					self.$adbox.find("input[name='workPrice']").val($(this).find("span").last().text().replace("￥", ""));
					self.$adbox.find("input[name='workPrice']").attr("readonly", "readonly");
				})
				.on("vclick", ".cancel_link_btn", function () {//取消选中商品
					self.adboxSelectedProductId = '';
					self.adboxSelectedProductName = '';
					self.adboxSelectedProductTid = '';
					self.$adbox.find(".linked_box").addClass("hide");
					self.$adbox.find(".link_box").removeClass("hide");
					self.$adbox.find(".right_top").removeClass("selected");
					self.$adbox.find("input[name='workPrice']").val("");
					self.$adbox.find("input[name='workPrice']").removeAttr("readonly");
				})
				.on("vclick", ".save_btn", function () {
					var photos = [];
					self.$adbox.find(".photo_upload_boxs li").each(function () {
						var id = $(this).data("id");
						if (id) {
							photos.push(id);
						}
					});
					if (photos.length < 1) {
						amGloble.msg("请至少上传一张图片！");
						return;
					}
					//var title = _this.$title.val();
					var subTitle = self.$adbox.find("textarea[name='talk_content']").val();
					if (subTitle.length < 1 || subTitle.length > 200) {
						amGloble.msg("请输入1-200字符的描述内容！");
						return;
					}
					var hairstyle = self.adboxSelectedSubCategory;
					if (!hairstyle) {
						amGloble.msg("请选择作品类别！");
						return;
					}

					var price = self.$adbox.find("input[name='workPrice']").val();
					if (price && (price * 1 < 0 || price * 1 > 50000 || !price * 1)) {
						amGloble.msg("请输入门店原价,0-50000！");
						return;
					}
					var opt = {
						parentShopId: amGloble.metadata.userInfo.parentShopId,
						//shopId:
						title: subTitle,
						photo: photos.join(","),
						operatorId: amGloble.metadata.userInfo.userId,
						empId: amGloble.metadata.userInfo.userId,
						empName: amGloble.metadata.userInfo.userName,
						empLevelName: amGloble.metadata.userInfo.levelName || "",
						type: self.adboxSelectedCategory * 1,
						subType: hairstyle,
						price: price * 1,
						empType: amGloble.metadata.userInfo.userType
						//visible: _this.$isVisible.filter(".selected").index() == 0 ? 1 : 0
					};
					if (self.$adbox.find("input[name='showInMYKSwitch']").prop("checked")) {
						opt.visible = 1;
					} else {
						opt.visible = 0;
					}
					opt.shopId = amGloble.metadata.userInfo.shopId;
					opt.memId = self.$userInfo.id;
					opt.memName = self.$userInfo.name;
					if (self.adboxSelectedProductId != '') {
						opt.itemId = self.adboxSelectedProductId;
						opt.itemName = self.adboxSelectedProductName;
						opt.itemType = self.adboxSelectedProductTid;
					}

					self.submitCraft(opt);
				})
				.on("vclick", ".photo_upload_boxs li", function () {
					var $this = $(this);
					var user = amGloble.metadata.userInfo;
					if (self.adboxSelectedCategory == '') {
						amGloble.msg("请选定作品类别后上传照片！");
						return;
					}
					var opt = {
						parentShopId: user.parentShopId,
						catigoryId: self.adboxSelectedCategory * 1,
						authorId: user.userId
						//to do userType ??
					};
					amGloble.photoManager.takePhoto("show", opt, function (uuid) {
						$this.html(amGloble.photoManager.createImage("show", opt, uuid, "s"));
						$this.data("id", uuid);
						if ($this.hasClass("empty_box")) {
							$this.removeClass("empty_box");
							if (self.$adbox.find(".photo_upload_boxs li").length < 9) {
								self.$adbox.find(".photo_upload_boxs ul").append('<li class="empty_box am-clickable"></li>');
							}
						} else {

						}
					}, function () {
						console.log("fail");
					});
				});


			this.$.find(".memberDetailsTab").on("vclick", "li", function () {
				var _this = $(this);
				var idx = _this.index();
				self.changeTab(idx);

				self.cardScroll.scrollTo("top");
				self.cardScroll.refresh();
				self.comboScroll.scrollTo("top");
				self.comboScroll.refresh();
				self.select.hide(true);

			});
			this.$.on("vclick", ".recordBox .header .btn", function () {
				self.select.hide(true);
			}).on("vclick", ".comboBox .leftCard .cardBox li", function () {
				var data = $(this).data("item");
				if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
					am.msg("会员已锁定，解锁后可继续操作");
					return;
				}
				if ($(this).hasClass('addcard')) {//新增卡
					// $.am.changePage(am.page.memberCard, "slideup",{cardData:{
					// 	memberInfo:self.$userInfo,
					// 	card:self.cardCash[0]
					// }});
					var fn=function(){
						$.am.changePage(am.page.memberCard, "slideup", {
							reset: am.convertMemberDetailToSearch({
								memberInfo: self.$userInfo,
								card: self.cardCash[0]
							})
						});
					};
					if(amGloble.metadata.configs.typePasswordtToSelectMember == 'true' && self.$userInfo){
						am.pw.check(self.$userInfo, function (verifyed) {
							if (verifyed) {
								fn();
							}
						});
					}else{
						fn();
					}
					return;
				}
				if(data.invaliddate){
					var ts = new Date(data.invaliddate*1 || data.invaliddate);
					var n = new Date();
					ts.setDate(ts.getDate()+1);

					if(ts){
						if(n.getTime()<=ts.getTime()){
							//(caption, description, okCaption, cancelCaption, scb, fcb)
						}else{
							var cardData = data;
							// 本店
							if (data.shopid == am.metadata.userInfo.shopId) {
								cardData = am.metadata.cardTypeMap[data.cardtypeid];
							}
							if(cardData && cardData.expiredpayflag == "0" && am.operateArr.indexOf('U') == -1){
								//过期后不允许使用
								am.confirm('已过期','此会员卡已过期，无法继续使用','知道了','返回');
								return;
							}else{
								am.msg('此会员卡已过期！');
							} 
						}
					}
				}
				if (!(data.allowkd*1) && ((data.shopId || data.shopid) != am.metadata.userInfo.shopId)) {
					am.msg('此会员卡不允许跨店消费！');
					return;
				}
				if (self.selectCardId) {//存在传进来的cardId 就走选择逻辑
					$(this).addClass('selected').siblings().removeClass("selected");
					//是否要跳转
					console.log(data);
					data.cardNum = self.cardCash?self.cardCash.length:0;
					$.am.changePage($.am.history[$.am.history.length - 1], "slideup", {
						cardData: {
							memberInfo: self.$userInfo,
							card: data
						},
						shiftObj:self.shiftObj
					});
				} else {//选择卡去消费
					if(amGloble.metadata.shopPropertyField.mgjBillingType==1){//开单模式
						var member = {
							"cardtype": data.cardtype,
							"timeflag": data.timeflag,
							"sex": self.$userInfo.sex,
							"cardTypeId": data.cardtypeid,
							"cardNo": data.cardid,
							"id": self.$userInfo.id,
							"cardName": data.cardtypename,
							"cardtimes": data.cardtimes,
							"shopId": data.shopid,
							"name": self.$userInfo.name,
							"cid": data.id,
							"discount": data.discount,
							"invalidflag": data.invalidflag,
							"comment": self.$userInfo.page,
							"mobile": self.$userInfo.mobile,
							"locking": self.$userInfo.locking,
							"lastconsumetime": self.$userInfo.lastconsumetime,
						}
						amGloble.confirm("使用此会员卡", "去开单？", "去开单", "返回", function () {
							var opt = {
								member: member
							}
							if(self.$data && self.$data.displayId){
								opt.displayId = self.$data.displayId
							}
							if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
								am.msg("会员已锁定，解锁后可继续操作");
								return;
							}
							if(amGloble.metadata.configs.typePasswordtToSelectMember == 'true' && self.$userInfo){
								am.pw.check(self.$userInfo, function (verifyed) {
									if (verifyed) {
										$.am.changePage(am.page.openbill, "slideup",opt);
									}
								});
							}else{
								$.am.changePage(am.page.openbill, "slideup",opt);
							}
						})

					}else{
						amGloble.confirm("使用此会员卡", "去项目卖品收银？", "去收银", "返回", function () {
							var fn=function(){
								$.am.changePage(am.page.service, "slideup", {
									reset: am.convertMemberDetailToSearch({
										memberInfo: self.$userInfo,
										card: data
									})
								});
							};
							if(amGloble.metadata.configs.typePasswordtToSelectMember == 'true' && self.$userInfo){
								am.pw.check(self.$userInfo, function (verifyed) {
									if (verifyed) {
										fn();
									}
								});
							}else{
								fn();
							}
						}, function () {
						});
					}


					//self.selecteCombo(data.ttList);//不存在就走自有逻辑 点击右边也选中
					/*var msg = "选择" + data.cardtypename + "去消费";
					am.popupMenu(msg, [{name:"项目消费"}, {name:"卖品消费"}], function (ret) {
						var target;
						if(ret && ret.name == "项目消费"){
							target = am.page.service;
						}else{
							target = am.page.product;
						}
						$.am.changePage(target, "slideup", {
							reset: am.convertMemberDetailToSearch({
								memberInfo: self.$userInfo,
								card: data
							})
						});//如果要传顾客信息用 self.$userInfo
					});*/
				}
			}).on("vclick", ".cardBox .free .otherAction", function (e) {//其他按钮 集卡充值、密码设置、清除密码、修改卡余额，修改卡赠送金于一体
				e.stopPropagation();
				var msg="请选择相应的操作",
					allMenu=[{name:"充值"},{name:"修改卡余额"},{name:"修改卡赠送金"}],
					menuArr=[],
					_this=this;
				var data = $(this).parents("li").data("item");
				var $li = $(this).parents("li");
				var expired = 0;
				var banSubmitConfig = am.metadata.userInfo.operatestr.indexOf('a39')>-1?1:0;
				// if (am.operateArr.indexOf('R') > -1) {
				// 	menuArr.push({name:"修改卡号"});
				// }
				if (am.operateArr.indexOf('r') == -1) {//小掌柜修改卡号仅受权限r受控制
					menuArr.push({name:"修改备注"});
					menuArr.push({name:"修改卡号"});
				}
				//判断有没有权限修改到期日
				if (am.operateArr.indexOf('Z') > -1) {
				//散客卡、套餐消费卡应不能修改到期时间
					if (data.cardtypeid != "20151212" && data.cardtypeid != "20161012") {
						menuArr.push({name:"修改到期日"});
					}
				}
				if (!expired && data.cardtype == 1 && (data.timeflag == 0 || data.timeflag == 2)) {//显示充值,散客卡不能充值
					if(!banSubmitConfig){
		            	menuArr.push({name:"充值"});
		        	}
				}
				var ctype = {};
				for(var i=0;i<am.metadata.cardTypeList.length;i++){
					if(am.metadata.cardTypeList[i].cardtypeid==data.cardtypeid){
						ctype = am.metadata.cardTypeList[i];
					}
				}
				var memberShopId = am.convertMemberDetailToSearch({
					memberInfo: self.$userInfo,
					card: data
				}).shopId;
				if(data.cardtype == 2 && data.invaliddate && ctype && ctype.mgjCardRenewal && JSON.parse(ctype.mgjCardRenewal).length && am.checkCrossConsum(memberShopId)){
					menuArr.push({name:"续卡"});
				}

				if(!self.memberpw){//该会员没有密码 有设置功能
					menuArr.push({name:"设置密码"});
				}else{//该会员有密码 有设置权限 才有设置功能
					if(am.operateArr.indexOf('X1')>-1){
						menuArr.push({name:"修改密码"});
					}
				}

				if(am.operateArr.indexOf('X2')>-1 && self.memberpw ){//有清除密码权限 的人 并且存在密码 显示清除密码功能
					menuArr.push({name:"清除密码"});
				}

				if (((data.timeflag == "0" && data.cardtype!="2" ) || data.cardtype==1) && am.operateArr.indexOf('A')>-1) {//判断有权限修改余额和赠送金 并且是普通卡
					menuArr.push({name:"修改卡余额"},{name:"修改卡赠送金"});
				}

				//转账
				if(data.timeflag != "1" && data.cardtype!="2" && am.operateArr.indexOf('K')>-1){//资格卡和计次卡不能转卡金 并且有权限
					menuArr.push({name:"卡金转出"});
					// if(data.cardtypeid!='20151212'){
						menuArr.push({name:"卡金转入"});
					// }
				}
				//删除卡
				if(am.operateArr.indexOf('E')>-1){//判断是否有权限删除会员
					menuArr.push({name:"删除卡"});
				}
				// 转移会员卡
				if(am.metadata.userInfo.operatestr.indexOf('a42')>-1 && am.metadata.userInfo.shopType!=1){
					// 允许转移会员卡   //不是单店
					menuArr.push({name:"转移会员卡"});
				}else{
					// 不允许
				}

				// 允许操作会员卡退卡
				if(am.operateArr.indexOf('MGJOP')>-1 && data.cardtype == '1' && (data.timeflag == '0' || data.timeflag == '2')){
					//判断是否有权限删除会员
					if((data.shopId || data.shopid) != am.metadata.userInfo.shopId){
						// console.log("跨店卡不显示");
					} else {
						menuArr.push({name:"会员卡退卡"});
					}
				}

				am.popupMenu(msg, menuArr, function (ret) {
					if(ret && ret.name=="修改卡号"){
						self.cardmodal.show($li);
					}else if(ret && ret.name=="修改备注"){
						self.$.find('[isdisabled=1]').removeClass('am-clickable');
						self.$changeTarget = $li;
						self.$arbox.find('textarea').val(data.cardRemark)
							.end().removeClass('hide').data('id',data.id);
						self.remarkFlag='card';
						return false;
					}else if(ret && ret.name=="转移会员卡"){
						console.log('----data-----选中的会员卡信息',data);
						self.showNotMemeberShops({
							cardData:data,
							isCard:1
						});
					}else if(ret && ret.name=="修改到期日"){
						console.log($li.index())
						self.$cardBox.find(".duedatewrap .duedateedit").mobiscroll().calendar({
							theme: 'mobiscroll',
							lang: 'zh',
							display: 'bottom',
							months: "auto",
							setOnDayTap: true,
							buttons: [],
							endYear: amGloble.now().getFullYear()+50,
							onSet: function (valueText, inst) {
								var _valueText = valueText.valueText;
								var _li = $li;
								var _item = _li.data('item');
								console.log(_valueText);
								console.log(_item);
			
								var _d = {
									'memberCardId': _item.id,
									'validate': new Date(_valueText).getTime(),
									'oldDate': _item.invaliddate ? _item.invaliddate : '',
									'operator': amGloble.metadata.userInfo.userName,
									'shopId': amGloble.metadata.userInfo.shopId + '',
									'cardNo': _item.cardid
								};
								console.log(_d);
								am.loading.show("修改中,请稍候...");
								am.api.invalidateUpdate.exec(_d, function (res) {
									am.loading.hide();
									console.log(res);
									if (res.code == 0) {
										var _date = new Date(_d.validate).format("yyyy.mm.dd");
										_li.find('.duedate').text('到期日：' + _date);
										_item.invaliddate = _d.validate;
										_li.data('item', _item);
									} else {
										am.msg(res.message || "数据获取失败,请检查网络!");
									}
								});
							}
						});
						setTimeout(function(){
							$li.find(".duedatewrap .duedateedit").click();
						},200);
					}else if(ret && ret.name=="充值"){
						var cardtype = am.metadata.cardTypeList.filter(function (a) {
							return a.cardtypeid == data.cardtypeid;
						});
						if (cardtype && cardtype[0] && cardtype[0].mgj_stopNoRecharge && cardtype[0].newflag == '0') {
							amGloble.msg('【' + cardtype[0].cardtypename + '】已停止办理，无法继续充值！');
							return;
						}
						if (!(data.allowkd-0) && (data.shopId || data.shopid) != am.metadata.userInfo.shopId) {
							am.msg('此会员卡不允许跨店消费！');
							return;
						}
						if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
							am.msg("会员已锁定，解锁后可继续操作");
							return;
						}
						var member = am.convertMemberDetailToSearch({
							memberInfo: self.$userInfo,
							card: data
						});
						if(amGloble.metadata.configs.typePasswordtToSelectMember == 'true'){
							am.pw.check(member, function (verifyed) {
								if (verifyed) {
									console.log(data);
									$.am.changePage(am.page.pay, "slideup", {
										action: "recharge",
										member: member
									});
								}
							},function(){
								$.am.page.back()
							});
						}else{
							$.am.changePage(am.page.pay, "slideup", {
								action: "recharge",
								member: member
							});
						}
					}else if(ret && ret.name=="卡金转出"){
						if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
							am.msg("会员已锁定，解锁后可继续操作");
							return;
						}
						var _li = $(_this).parents('li');
						self.cardPopup.show(data,_li);
					}else if(ret && ret.name=="卡金转入"){
						if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
							am.msg("会员已锁定，解锁后可继续操作");
							return;
						}
						var _li = $(_this).parents('li',2);
						self.cardPopup.show(data,_li,1);
					}else if(ret && ret.name=="会员卡退卡"){
						var _li = $(_this).parents('li');
						var $dom = $('#page_memberDetails').find('.refundCard_popup');
						am.loading.show();
						// 查询会员卡是否正在挂单
						am.api.hangupList.exec({
							"shopId": am.metadata.userInfo.shopId,
							"parentShopId":am.metadata.userInfo.parentShopId,//for wyl增加该参数
							"pageSize": 99999, //可选，如果有则分页，否则不分页
							"channel":1
						}, function(ret) {
							am.loading.hide();
							if (ret.code == 0) {
								var flag = false;
								$.each(ret.content, function(i, v) {
									var json = JSON.parse(v.data);
									if (data.id == json.cid) {
										flag = true;
										return false;
									}
								});
								if (flag) {
									am.msg("该会员卡挂单中无法继续退卡");
									return false;
								}
								// 查询是否有欠款记录
								self.getQueryDebtData(data.memberid, function(res){
									if (res.content.length > 0) {
										am.msg("该会员卡有欠款记录无法继续退卡");
										return false;
									} else {
										am.refundCard.show($dom, data, function(res){
											am.msg("提交成功");
											_li.addClass('refundCardLock').addClass('am-disabled');
											self.beforeShow(self.beforeShowPara);
										});
									}
								});
							}
						});
						
					}else if(ret && ret.name=="设置密码"){
						var _li = $(_this).parents('li');
						var _item = _li.data('item');
						console.log(_item);
						//调取密码接口
						am.keyboard.show({
							phone: self.$userInfo.mobile,
							passwd: self.$userInfo.passwd,
							title: "设置密码",
                            hidedot:true,
                            ciphertext:true,
                            forgetpwd:true,
							submit: function (value) {
                                console.log(value)
								if (value.length>6) {
									am.msg("请输入6位以内数字密码!");
									return true;
								} else if (value == "") {
									am.msg("请输入密码!");
									return true;
								}
								console.log(data)
								var opt = {
									passwd:value,
									memId:data.memberid,
									mobile:data.mobile,
									name:data.name
								};
								am.loading.show("设置密码中,请稍候...");
								am.api.setCardpw.exec(opt, function (res) {
									am.loading.hide();
									console.log(res);
									if (res.code == 0) {
										_item.passwd=opt.passwd;
										_li.data('item',_item);
										console.log(self.$userInfo);
										self.$userInfo.passwd=opt.passwd;
										self.memberpw = opt.passwd;
										am.msg('密码设置成功')
									} else {
										am.msg(res.message || "数据获取失败,请检查网络!");
									}
								});
							}
						});
					}else if(ret && ret.name=="修改密码"){
						var _li = $(_this).parents('li');
						var _item = _li.data('item');
						console.log(_item);
						am.keyboard.show(
							{
							title: "输入旧密码",
							ciphertext:true,
							phone: self.$userInfo.mobile,
							passwd: self.$userInfo.passwd,
							forgetpwd:true,
							submit: function (value) {
								if (value == ""||value !=self.$userInfo.passwd) {
									am.msg("旧密码输入错误，请重新输入!");
									am.keyboard.value ='';
									am.keyboard.setVal();
									return true;
								}else if(value ==self.$userInfo.passwd)  {
									am.keyboard.show({
										// phone: self.$userInfo.mobile,
										// passwd: self.$userInfo.passwd,
										title: "设置新密码",
										hidedot:true,
										ciphertext:true,
										// forgetpwd:true,
										submit: function (value) {
											console.log(value)
											if (value.length>6) {
												am.msg("请输入6位以内数字密码!");
												return true;
											} else if (value == "") {
												am.msg("请输入新密码!");
												return true;
											}
											console.log(data)
											var opt = {
												passwd:value,
												memId:data.memberid,
												mobile:data.mobile,
												name:data.name
											};
											am.loading.show("修改密码中,请稍候...");
											am.api.setCardpw.exec(opt, function (res) {
												am.loading.hide();
												console.log(res);
												if (res.code == 0) {
													_item.passwd=opt.passwd;
													_li.data('item',_item);
													console.log(self.$userInfo);
													self.$userInfo.passwd=opt.passwd;
													self.memberpw = opt.passwd;
													am.msg('密码修改成功')
												} else {
													am.msg(res.message || "数据获取失败,请检查网络!");
												}
											});
										}
									});
									return true;
								}
							}
						}
					);


					}else if(ret && ret.name=="清除密码"){
						var _li = $(_this).parents('li');
						var _item = _li.data('item');
						console.log(_item);
						var opt = {
							passwd:null,
							memId:data.memberid,
							mobile:data.mobile,
							name:data.name
						};
						am.loading.show("清除密码中,请稍候...");
						am.api.setCardpw.exec(opt, function (res) {
							am.loading.hide();
							console.log(res);
							if (res.code == 0) {
								_item.passwd=opt.passwd;
								_li.data('item',_item);
								self.$userInfo.passwd=opt.passwd;
								self.memberpw = opt.passwd;
								am.msg('密码清除成功')
							} else {
								am.msg(res.message || "数据获取失败,请检查网络!");
							}
						});
						return false;
						// if(self.$userInfo.passwd){//验证密码
						// 	am.keyboard.show(
						// 		{
						// 			title: "请输入密码",
						// 			ciphertext:true,
						// 			phone: self.$userInfo.mobile,
						// 			passwd: self.$userInfo.passwd,
						// 			forgetpwd:true,
						// 			submit: function (value) {
						// 				if (value == ""||value !=self.$userInfo.passwd) {
						// 					am.msg("密码输入错误，请重新输入!");
						// 					am.keyboard.value ='';
						// 					am.keyboard.setVal();
						// 					return true;
						// 				}else if(value ==self.$userInfo.passwd)  {
						// 					var opt = {
						// 						passwd:null,
						// 						memId:data.memberid,
						// 						mobile:data.mobile,
						// 						name:data.name
						// 					};
						// 					am.loading.show("清除密码中,请稍候...");
						// 					am.api.setCardpw.exec(opt, function (res) {
						// 						am.loading.hide();
						// 						console.log(res);
						// 						if (res.code == 0) {
						// 							_item.passwd=opt.passwd;
						// 							_li.data('item',_item);
						// 							self.$userInfo.passwd=opt.passwd;
						// 							self.memberpw = opt.passwd;
						// 							am.msg('密码清除成功')
						// 						} else {
						// 							am.msg(res.message || "数据获取失败,请检查网络!");
						// 						}
						// 					});
						// 					return false;
						// 				}
						// 			}
						// 		}
						// 	)
						// }
						//调取密码接口
						// var opt = {
						// 	passwd:null,
						// 	memId:data.memberid,
						// 	mobile:data.mobile,
						// 	name:data.name
						// };
						// am.loading.show("清除密码中,请稍候...");
						// am.api.setCardpw.exec(opt, function (res) {
						// 	am.loading.hide();
						// 	console.log(res);
						// 	if (res.code == 0) {
						// 		_item.passwd=opt.passwd;
						// 		_li.data('item',_item);
						// 		self.$userInfo.passwd=opt.passwd;
						// 		am.msg('密码清除成功')
						// 	} else {
						// 		am.msg(res.message || "数据获取失败,请检查网络!");
						// 	}
						// });
					}else if(ret && ret.name=="修改卡余额"){
						if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
							am.msg("会员已锁定，解锁后可继续操作");
							return;
						}
						//if( !self.modifyBalancePermissions() ) return;
						var _li = $(_this).parents('li');
						var _item = _li.data('item');
						console.log(_item);
						var _id = _item.id;
						var _sumcardfee = _item.sumcardfee; //累积卡内金额 充值总额
						am.keyboard.show({
							title: "请输入金额",
							submit: function (value) {
								if (value - 99999999 > 0) {
									am.msg("您输入的金额不能大于99999999!");
									return true;
								} else if (value == "") {
									am.msg("请输入修改金额!");
									return true;
								}

								var _d = {
									id: _id,
									shopId: _item.shopid || amGloble.metadata.userInfo.shopId,  //
									cardfee: value,	//卡内金额
									sumcardfee: _sumcardfee,	//累积卡内金额 充值总额
									cardNo: _item.cardid,
									operator: amGloble.metadata.userInfo.userName,
									oldCardfee: _item.cardfee,
									oldPresentfee: _item.presentfee,
									oldSumcardfee: _item.sumcardfee,
									oldSumpresentfee: _item.sumpresentfee
								};
								if ((value - 0) > (_sumcardfee - 0)) {
									_d.sumcardfee = value;
								}
								am.loading.show("修改中,请稍候...");
								am.api.memberModiFee.exec(_d, function (res) {
									am.loading.hide();
									console.log(res);
									if (res.code == 0) {
										_li.find('.card_fee .fee_num').html("￥" + _d.cardfee );
										_item.cardfee = _d.cardfee;
										_item.sumcardfee = _d.sumcardfee;
										$.each(self.cardCash,function(i,card){
											if(_id==card.id){
												card.cardfee=_d.cardfee;
												card.sumcardfee=_d.sumcardfee;
											}
										})
										_li.data('item', _item);
									} else {
										am.msg(res.message || "数据获取失败,请检查网络!");
									}
								});
							}
						});
					}else if(ret && ret.name=="修改卡赠送金"){
						if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
							am.msg("会员已锁定，解锁后可继续操作");
							return;
						}
						//if( !self.modifyBalancePermissions() ) return;
						var _li = $(_this).parents('li');
						var _item = _li.data('item');
						console.log(_item);
						var _id = _item.id;
						var _sumpresentfee = _item.sumpresentfee;	//累积赠送金 赠送总额
						am.keyboard.show({
							title: "请输入金额",
							submit: function (value) {
								if (value - 99999999 > 0) {
									am.msg("您输入的金额不能大于99999999!");
									return true;
								} else if (value == "") {
									am.msg("请输入修改金额!");
									return true;
								}

								var _d = {
									id: _id,
									shopId: amGloble.metadata.userInfo.shopId + '',
									presentfee: value,	//赠送金额余额
									sumpresentfee: _sumpresentfee == null ? '0' : _sumpresentfee,	//累积赠送金 赠送总额
									cardNo: _item.cardid,
									operator: amGloble.metadata.userInfo.userName,
									oldCardfee: _item.cardfee,
									oldPresentfee: _item.presentfee,
									oldSumcardfee: _item.sumcardfee,
									oldSumpresentfee: _item.sumpresentfee == null ? '0' : _item.sumpresentfee
								};
								if ((value - 0) > (_sumpresentfee - 0)) {
									_d.sumpresentfee = value;
								}
								am.loading.show("修改中,请稍候...");
								am.api.memberModiFee.exec(_d, function (res) {
									am.loading.hide();
									console.log(res);
									if (res.code == 0) {
										_li.find('.card_present .fee_num').html("￥" + _d.presentfee);

										_item.presentfee = _d.presentfee;
										_item.sumpresentfee = _d.sumpresentfee;
										$.each(self.cardCash,function(i,card){
											if(_id==card.id){
												card.presentfee=_d.presentfee;
												card.sumpresentfee=_d.sumpresentfee;
											}
										})
										_li.data('item', _item);
									} else {
										am.msg(res.message || "数据获取失败,请检查网络!");
									}
								});
							}
						});
					}else if(ret && ret.name=="删除卡"){
						var cardid=data.id;
						console.log(cardid);
						self.cardDel(cardid);
					}else if(ret && ret.name=="续卡"){
						var member = am.convertMemberDetailToSearch({
							memberInfo: self.$userInfo,
							card: data
						});
						if(amGloble.metadata.configs.typePasswordtToSelectMember == 'true'){
							am.pw.check(member, function (verifyed) {
								if (verifyed) {
									console.log(data);
									$.am.changePage(am.page.pay, "slideup", {
										action: "recharge",
										member: member,
										card: data,
										renewal: 1
									});
								}
							},function(){
								$.am.page.back()
							});
						}else{
							$.am.changePage(am.page.pay, "slideup", {
								action: "recharge",
								member: member,
								card: data,
								renewal: 1
							});
						}
					}
				});
			}).on("vclick", ".cardBox .free .remarkIcon", function (e) {	//改卡备注
				e.stopPropagation();
				if (am.operateArr.indexOf('r') == -1) {
					self.$.find('[isdisabled=1]').removeClass('am-clickable');
					var _item = $(this).parents('li').data('item');
					self.$changeTarget = $(this).parents('li');
					self.$arbox.find('textarea').val(_item.cardRemark)
						.end().removeClass('hide').data('id',_item.id);
					self.remarkFlag='card';
				}else{
					am.msg("您没有权限修改卡备注!");
				}
				return false;
			}).on("vclick",'.discountRuleBtn',function(e){
				e.stopPropagation();
				var newCardRule = $(this).data('newCardRule');
				am.timeDiscountModal.show(newCardRule);
			}).on("vclick", ".comboBox .comboRemarkIcon", function (e) {	//改套餐备注
				self.$.find('[isdisabled=1]').removeClass('am-clickable');
				e.stopPropagation();
				var _item = $(this).parents('.comboItem').data('comboItem');
				self.$changeTarget = $(this).parents('.comboItem');
				self.$arbox.find('textarea').val(_item.itemRemark)
					.end().removeClass('hide').data('id',_item.id);
				self.remarkFlag='combo';
			}).on("vclick", ".pointBox .give_btn", function() {// 赠送积分
				if(am.metadata.userInfo.operatestr && am.metadata.userInfo.operatestr.indexOf("a38") != -1){
					am.keyboard.show({
						title: "请输入数字",
						hidedot: true,
						submit: function (value) {
							var $userInfo = am.metadata.userInfo;
							var $data = self.$data
							var opt = {
								"memberId": $data.customerId,
								"point": +value,
								"shopId": $userInfo.shopId,
								"operator": $userInfo.userName,
								"operatorId": $userInfo.userId,
								"shopName": $userInfo.shopName
							}
							am.api.sendPoint.exec(opt, function(res) {
								if(res.code == 0) {
									var prePoint = $('.exchange .num').text()
									var currentPoint = +prePoint + +value
									am.msg('积分赠送成功')
									$('.excbox.exchange .num').text(currentPoint).parent().data('point',currentPoint)
									self.$userInfo.currpoint = currentPoint;
									var $started_T = self.$pointSelSTime.val(),
										$point_cate = self.getSelectValue().pointC;
										// 积分赠送成功后刷新
									if($point_cate === 1) {
										self.pointIndex = 1;
										self.renderPointSearchRes($started_T,$point_cate)
									}
								} else {
									am.msg(res.message || "数据获取失败,请检查网络!");
								}
							})
						}
					})
				} else {
					am.msg('对不起，您没有赠送积分的权限！')
				}
				
			}).on("vclick", ".comboBox .buyBtn", function (e) {//购买套餐
				if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
					am.msg("会员已锁定，解锁后可继续操作");
					return;
				}
				if(self.cardCash.length == 1) {
					if (self.cardCash[0].status == 1) {
						am.msg('会员卡退卡中，无法进行此操作');
						return false;
					}
					$.am.changePage(am.page.comboCard, "slideup", {
						reset: am.convertMemberDetailToSearch({
							memberInfo: self.$userInfo,
							card: self.cardCash[0]
						})
					});
				}else {
					var data = self.cardCash,
						$html = "",
						$check_balance = [],
						$idx;
					if(data.length) {
						for (var i = 0; i < data.length; i++) {
							if (data[i].cardfee > 0) {
								$check_balance.push(data[i].cardfee);
								$idx = i;
							}
						}
						if($check_balance.length >= 2) {
							self.$.find(".mask_box_two").addClass("show_mask");
							self.$.find(".selected_membercard").addClass("show_active");
							self.$.find(".sel_membercard").empty();
							for(var i = 0;i< data.length;i++) {
								$html = $('<li class="am-clickable">' +
										'<div class="card_base_info">' +
											'<div class="info_left">' +
												'<div class="card_name">' + data[i].cardtypename + '</div>' +
												'<div class="card_no">' + data[i].cardid + '</div>' +
											'</div>' +
											'<div class="info_right">' +
												'<div class="card_fee">' +
													'<div class="fee_num">￥' + (data[i].cardfee?data[i].cardfee:0) + '</div>' +
													'<div class="fee_name">余额</div>' +
												'</div>' +
												'<div class="card_present">' +
													'<div class="fee_num">￥' + (data[i].presentfee?data[i].presentfee:0) + '</div>' +
													'<div class="fee_name">赠送金</div>' +
												'</div>' +
												'<div class="nofee">现金消费卡</div>' +
											'</div>' +
										'</div>' +
										// '<div class="duedatewrap">' +
										// 	'<span class="duedate">到期日：</span>' +
										// 	'<span class="duedateedit" isdisabled="1">' + (data[i].invaliddate?new Date(data[i].invaliddate - 0).format("yyyy.mm.dd"):"无") + '</span>' +
										// '</div>' +
									'</li>');
								if(data[i].cardtype == "1"){
									if (data[i].timeflag == "2") {
										$html.addClass('type_zero');
									} else {
										$html.addClass('type_one');
									}
								} else {
									$html.addClass('type_two');
								}
								self.$.find(".sel_membercard").append($html);
							}
						} else {
							$.am.changePage(am.page.comboCard, "slideup", {
								reset: am.convertMemberDetailToSearch({
									memberInfo: self.$userInfo,
									card: $idx?self.cardCash[$idx]:self.cardCash[0]
								})
							});
						}
					}
				}
				self.selectedM.refresh();
				self.selectedM.scrollTo("top");
			}).on("vclick", ".selected_membercard li", function (e) { //选择会员卡购买套餐
				var $index = $(this).index();
				if (self.cardCash[$index].status == 1) {
					am.msg('会员卡退卡中，无法进行此操作');
					return false;
				}
				var fn = function () {
					$.am.changePage(am.page.comboCard, "slideup", {
						reset: am.convertMemberDetailToSearch({
							memberInfo: self.$userInfo,
							card: self.cardCash[$index]
						})
					});
					self.$.find(".mask_box_two").removeClass("show_mask");
					self.$.find(".selected_membercard").removeClass("show_active");
				};
				if (amGloble.metadata.configs.typePasswordtToSelectMember == 'true' && self.$userInfo) {
					am.pw.check(self.$userInfo, function (verifyed) {
						if (verifyed) {
							fn();
						}
					});
				} else {
					fn();
				}
			}).on("vclick", ".rightcombo .list ul li .treatmentdateedit", function (e) {
				e.stopPropagation();
				var _item = $(this).parents('.comboItem').data('comboItem');
				console.log(_item);
			}).on("vclick", ".rightcombo .list ul li .operateBtn", function (e) {//退套餐
				e.stopPropagation();
				var _li = $(this).parents('.comboItem');
				var data = $(this).parents('.comboItem').data('comboItem');
				if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
					am.msg("会员已锁定，解锁后可继续操作");
					return;
				}
				// 菜单弹窗
				var menuItems=[];
				if (!(am.operateArr.indexOf('a7') > -1)) {//默认 显示 有这个权限 就隐藏退款按钮
					// $combolii.find(".left .key .back_combo").hide();
					menuItems.push({name:"套餐退款"});
				}
				if(am.metadata.userInfo.operatestr.indexOf('a43')>-1 && am.metadata.userInfo.shopType!=1){
					menuItems.push({name:"套餐转移"});
				}
				if(am.metadata.userInfo.operatestr.indexOf('a44')>-1 && am.metadata.userInfo.shopType!=1){
					menuItems.push({name:"修改使用门店"});
				}
				if (am.operateArr.indexOf('Z') != -1) {
					menuItems.push({name:"修改有效期"});
				}
				menuItems.push({name:"修改备注"});
				am.popupMenu('请选择相应的操作',menuItems,function(ret){
					if(ret && ret.name=='套餐退款'){
						self.comboPopup.show(data,_li);
					}else if(ret && ret.name=='套餐转移'){
						self.showNotMemeberShops({
							comboData:data
						});
					}else if(ret && ret.name=='修改使用门店'){
						self.shopsPopup.show(data,_li);
					}else if(ret && ret.name=='修改有效期'){
						setTimeout(function(){
							_li.find('.treatmentdateedit').trigger('click');
						},200);
						// $('.comboBox .rightcombo .treatmentdateedit').eq(operateBtnIndex).trigger('click');
					}else if(ret && ret.name=='修改备注'){
						_li.find('.comboRemarkIcon').trigger('vclick');
						// $('.comboBox .comboRemarkIcon').eq(0).trigger('vclick');
					}
				});
					return;
				self.comboPopup.show(data,_li);
			}).on("vclick", ".filebody .cm_cutting .btn", function () {//重试
				self.renderOurselves(true);
			}).on("vclick", ".recordBox .cm_cutting .btn", function () {//消费记录重试
				self.renderRecord(true);
			}).on("vclick",".consumption_record",function(){
				// var $idex_id = $(this).attr("data-index");
				// var that = $(this);
				// self.getConsumptionData($idex_id,function(res){
				// 	if(res.content.length > 0) {
				// 		self.$.find(".mask_box").addClass("show_mask");
				// 		self.$.find(".record_content").addClass("show_detail");
				// 		self.$.find(".record_detail").empty();
				// 		self.$.find(".project_name").text(that.attr("data-name"));
				// 		var $html;
				// 		for(var i = 0; i < res.content.length; i++) {
				// 			var $item = res.content[i],
				// 				$jude = ($item.EXPENSECATEGORY == 0 || $item.EXPENSECATEGORY == 1 || ($item.EXPENSECATEGORY == 6 && $item.CONSUMETYPE == -1) || ($item.EXPENSECATEGORY == 4 && $item.CONSUMETYPE == -1));
				// 			$html = $(
				// 				'<tr>' +
				// 					'<td class="first_table">' + $item.BILLNO + '</td>' +
				// 					'<td>' + new Date($item.CONSUMETIME).format("yyyy.mm.dd") + '</td>' +
				// 					'<td>' + $item.CONSUMETIMES + '</td>' +
				// 					'<td>' + ($item.SUMTIMES=="-99"?"不限次":$item.LOSTCONSUMETIMES) + '</td>' +
				// 					'<td>' + $item.OPERATORNAME + '</td>' +
				// 					'<td class="check_name ' + ($jude ?"am-clickable":"") + '" data-billid="' + ($item.BILLID) + '">' + ($jude ? "查看" : "--") + '</td>' +
				// 				'</tr>'
				// 			);
				// 			self.$.find(".record_detail").prepend($html);
				// 			self.$.find(".total_num").html($item.SUMTIMES=="-99"?"不限":$item.SUMTIMES);
				// 			self.$.find(".remain_num").html($item.SUMTIMES=="-99"?"不限":$item.LOSTCONSUMETIMES);
				// 		}
				// 	}else {
				// 		am.msg("无消耗记录");
				// 	}
				// })	
			}).on("vclick",".delete_sel_member",function(){
				self.$.find(".mask_box_two").removeClass("show_mask");
				self.$.find(".selected_membercard").removeClass("show_active");
			}).on("vclick",".mask_box",function(){
				self.$.find(".mask_box").removeClass("show_mask");
				self.$.find(".record_content").removeClass("show_detail");
			}).on("vclick",".check_name",function(){
				var $this = $(this);
				var comboInfo = self.$userInfo.treatMentItems;
				am.signatureView.show({
					memberId: comboInfo[0].memberid,
					billId: $this.data("billid"),
					unresign: 1,
					storeId: comboInfo[0].shopid,
					failed: function () {
						$this.removeClass("am-clickable");
						$this.removeClass("check_name");
						$this.addClass("check_name_color");
						$this.html("--");
					}
				});
			}).on("vclick", ".reimbursement_btn", function (e) {
				var that = $(this);
				e.stopPropagation();
				if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
					am.msg("会员已锁定，解锁后可继续操作");
					return;
				}
				self.repay(that.closest("tr"));
			}).on("vclick",function(){
				//关闭筛选条件
				for(var i in self.Select){
					if(!self.Select[i].$listbox.hasClass('disabled')){
						self.Select[i].hide(true);
					}
				}
			});
			this.fileScroll = new $.am.ScrollView({
				$wrap: this.$.find(".filebody"),
				$inner: this.$.find(".filebody .inner"),
				direction: [false, true],
				hasInput: false,
				touchTopcallback: function () {
					self.renderOurselves(true);
				},
				touchBottomcallback: function () {
					self.renderOurselves();
				},
				pauseTouchTop: false,
				pauseTouchBottom: false
			});
			am.extendScrollView(this.fileScroll);
			this.cardScroll = new $.am.ScrollView({
				$wrap: this.$.find(".comboBox .cardBox"),
				$inner: this.$.find(".comboBox .cardBox .inner"),
				direction: [false, true],
				hasInput: false
			});
			this.cardScroll.refresh();
			this.selectedM = new $.am.ScrollView({
				$wrap: this.$.find(".sel_membercards"),
				$inner: this.$.find(".sel_membercards .sel_membercard"),
				direction: [false, true],
				hasInput: false
			});
			this.selectedM.refresh();
			this.comboScroll = new $.am.ScrollView({
				$wrap: this.$.find(".comboBox .combobox"),
				$inner: this.$.find(".comboBox .combobox .inner"),
				direction: [false, true],
				hasInput: false
			});
			this.comboScroll.refresh();
			this.$list = this.$.find(".comboBox .list");
			this.select = new $.am.Select({
				$: self.$.find(".recordBox .selectList"),
				data: [{"name": "原项目消费历史纪录", "value": 1},
					{"name": "原商品购买记录", "value": 1},
					{"name": "原套餐购买记录", "value": 1}]
			});
			this.tableScroll = new $.am.ScrollView({
				$wrap: this.$.find(".table-content-list"),
				$inner: this.$.find(".table-content-list table"),
				direction: [false, true],
				hasInput: false
			});
			this.tableScroll.refresh();
			// 消费记录分页
			this.pager = new $.am.Paging({
				$: self.$.find(".footcontent"),
				showNum: 15,//每页显示的条数
				total: 1,//总数
				action: function (_this, index) {
					self.recordIndex = index + 1;
					self.renderRecord();
				}
			});

			// 积分记录分页
			this.pager_point = new $.am.Paging({
				$: self.$.find(".point_page_num"),
				showNum: 15,//每页显示的条数
				total: 1,//总数
				action: function (_this, index) {
					self.pointIndex = index + 1;
					var $started_T = self.$pointSelSTime.val(),
						$point_cate = self.getSelectValue().pointC;
					self.renderPointSearchRes($started_T,$point_cate)
				}
			})

			//TA的欠款分页
			this.pager1 = new $.am.Paging({
				$: self.$.find(".arrears_page_num"),
				showNum: 15,//每页显示的条数
				total: 1,//总数
				action: function (_this, index) {
					self.arrearsIndex = index + 1;
					self.renderarrears();
				}
			});
			this.renderList = ["renderOurselves", "renderCard", "renderRecord", "renderPointRecordDom", "renderCardCash","renderarrears","renderRedPocketsTable",'renderReservation'];
			//门店消费积分兑换
			this.$leftBox.on('vclick','.ex_icon',function(){
				if(!self.$.find(".memberLock").hasClass("on") && am.metadata.userInfo.operatestr.indexOf("U,") == -1){
					am.msg("会员已锁定，解锁后可继续操作");
					return;
				}
				if($(this).parent('.exchange').data('point') == 0){
					am.msg('您暂时没有可兑换的门店消费积分！')
					return;
				};
				self.$.find('.total strong').text($(this).parent('.exchange').data('point'))
				self.$exbox.removeClass('hide').end().find('.exinner').empty();
				self.renderCredit();
				self.exboxScroll.refresh();
			}).on('vclick','.modify',function(){
				// 修改会员门店积分
				var $this=$(this);
				var $parent=$this.parent('.exchange');
				am.keyboard.show({
					title: "请输入积分",
					hidedot:true,
					submit: function (value) {
						if(isNaN(value)){
                            am.msg('请输入正确的数值！');
                            return;
						}
						value=value*1;
						var userInfo =am.metadata.userInfo;
						var opt={
							shopid:userInfo.shopId,
							shopName:userInfo.shopName+userInfo.osName,
							optName:userInfo.userName, // 发送人名称
							memId:self.$data.customerId,// 会员id
							currpoint:value, // 当前值
						}
						self.updMemberPoint(opt,function(){
							$this.text(value);
							$parent.data('point',value);
						});
					}
				});
			});
			self.$exbox.on('vclick','.exchange_model_mask,.exheadright',function(){
				self.$exbox.addClass('hide')
			}).on('vclick','.changebox',function(){
				$(this).addClass('selected').siblings().removeClass('selected');

			}).on('vclick','.save_exchange',function(){
				self.exchangePoint();
			})
			//开通商城特权 chali
			this.$leftBox.on('vclick','.privilegeCardBtn',function(){
				if(self.$memberInfo.privilege !=null && self.$memberInfo.privilege.hasOwnProperty("ownerId") && self.$memberInfo.id == self.$memberInfo.privilege.ownerId){//判断是否已开通
					self.$privilegeCardBox.find('.headleft').text('为此顾客延期商城特权');
					self.$privilegeCardBox.find('.save_privilegeCard').text('延期特权');
				}
				self.$privilegeCardBox.removeClass('hide');
				self.privilegeCardSelect.setValue(0);
				self.setUnitPrice(self.privilegeCardSelect.getValue());
			})
			self.$privilegeCardBox.on('vclick','.privilegeCard_model_mask,.headright',function(){
				self.$privilegeCardBox.addClass('hide')
			}).on('vclick','.save_privilegeCard',function(){
				self.eidtPrivilegeTime();
			})
			this.shopsPopup = new PopupRt({
				$:$('.shops_popup'),
				type:3,
				ownCards:self.cardCash,
				onRender:function($dom,data){
					if(!this.shopsScroll){
						// 渲染dom
						this.shopsScroll = new $.am.ScrollView({
							$wrap:this.$parent.find('.shopsWrap'),
							$inner:this.$parent.find('.shopsWrap .shops_ul'),
							direction: [false, true],
							hasInput: false
						})
						this.shopsScroll.refresh();
						// 动态渲染门店选择弹框
						var $shopsUl=this.$parent.find('.shops_ul').empty();
						// var $liAll=$('<li class="shop_item all am-clickable">全部门店可用</li>');
						var $lis=[];
						// $lis.push();
						var shopMap=am.metadata.shopMap,shopList=am.metadata.shopList,len=shopList.length;
						if(shopList && len){
							for (var i = 0; i < len; i++) {
								var shopItem = shopList[i];
								if (shopItem && shopItem.softgenre != 0) {
									$lis.push($('<li class="shop_item am-clickable">' + (shopItem.osName || shopItem.shopName ||'') + '</li>').data('data', shopItem));
								}else{
									// 总部 不渲染
								}
							}
							$shopsUl.append($lis);
							this.shopsScroll.refresh();
						}else{
							console.log('不存在门店')
						}
					}
					var _this=this;
					var $parent=_this.$parent;
					function resetCb(){
						var $shopsItems=$parent.find('.shopsWrap .shops_ul').find('.shop_item');
						var height=($parent.find('.foot_btns').offset().top-_this.$parent.find('.shopsWrap').offset().top)-20+'px';
						$parent.find('.shopsWrap').css('height',height);
						var len=$shopsItems.length;
						for(var i=0;i<len;i++){
							$($shopsItems[i]).removeClass("selected");
						}
						$parent.find('.onlySaledShop').removeClass('selected');
						$parent.find('.enableWrap').addClass('checked');
						$parent.find('.disableWrap').removeClass('checked');
						$parent.find('.switchWrap').find('.tipText').text('“可用”表示勾选的门店可用');
						$parent.find('li.shopAll,li.onlySaledShop').removeClass('am-disabled').addClass('am-clickable');
					}
					resetCb();
					if(data){
						console.log($dom);
						var selectedShopsIds= data && data.cashshopids && data.cashshopids.split(',');	
						var realIds=[];
						if(selectedShopsIds && selectedShopsIds.length){
							// 非仅销售
							var len=selectedShopsIds.length,$shopsItems=this.$parent.find('.shopsWrap .shops_ul').find('.shop_item');
							if(len && $shopsItems && $shopsItems.length){
								var slen=$shopsItems.length;
								if(selectedShopsIds.indexOf('r')>-1){
									// 禁用
									$parent.find('.disableWrap').addClass('checked');
									$parent.find('.enableWrap').removeClass('checked');
									$parent.find('.switchWrap').find('.tipText').text('“禁用”表示勾选的门店不可用');
									$parent.find('li.shopAll,li.onlySaledShop').addClass('am-disabled').removeClass('am-clickable selected');
								}else{
									// 可用
									$parent.find('.enableWrap').addClass('checked');
									$parent.find('.disableWrap').removeClass('checked');
									$parent.find('.switchWrap').find('.tipText').text('“可用”表示勾选的门店可用');
									$parent.find('li.shopAll,li.onlySaledShop').removeClass('am-disabled').addClass('am-clickable');
								}
								for(var i=0;i<len;i++){
									var item=selectedShopsIds[i];
									if (item) {
											realIds.push(item);
											for (var j = 0; j < slen; j++) {
												var shopInfo = $($shopsItems[j]).data('data');
												if (shopInfo.shopId == item) {
													$($shopsItems[j]).addClass('selected');
													continue;
												}
												if (item == '-99') {
													// 仅在销售门店使用
													$parent.find('.onlySaledShop').addClass('selected');
													break;
												}
											}
									}
								}
							}
							console.log(realIds)
							if(realIds.length==$dom.find('.shop_item').length){
								// 渲染全选
								$dom.find('li.shopAll').addClass('selected');
							}else{
								$dom.find('li.shopAll').removeClass('selected');
							}
						}else if(data.shopid && am.metadata.shopMap && am.metadata.shopMap[data.shopid] && am.metadata.shopMap[data.shopid].softgenre===3){
							// 附属店项目全部勾选
							$dom.find('.shop_item').addClass("selected");
							$dom.find('li.shopAll').addClass('selected');
							$parent.find('.enableWrap').addClass('checked');
							$parent.find('.disableWrap').removeClass('checked');
							$parent.find('.switchWrap').find('.tipText').text('“可用”表示勾选的门店可用');
						}else if(data.shopid && am.metadata.shopMap && am.metadata.shopMap[data.shopid] && am.metadata.shopMap[data.shopid].softgenre!==3 && data.cashshopids===null){
							// 未设置使用门店 则全选
							$dom.find('.shop_item').addClass("selected");
							$dom.find('li.shopAll').addClass('selected').removeClass('am-disabled');
							$dom.find('li.onlySaledShop').removeClass('am-disabled');
							$parent.find('.enableWrap').addClass('checked');
							$parent.find('.disableWrap').removeClass('checked');
							$parent.find('.switchWrap').find('.tipText').text('“可用”表示勾选的门店可用');
						}
					}else{
					}
				},
				onSubmit:function(comboInfo,resObj,scb,fcb){
					console.log(comboInfo,resObj);
					// 调用修改 保存门店的接口
					am.loading.show("正在设置，请稍候...");
					var oldIsAll=0;
					if(comboInfo.cashshopids && comboInfo.cashshopids.length){
						var cashshopids = comboInfo.cashshopids;
						cashshopids = cashshopids.split(',');
						var realIds = [];
						for (var i = 0; i < cashshopids.length; i++) {
							var element = cashshopids[i];
							if (!element || element=='r') continue;
							realIds.push(element);
						}
						if(this.shopsScroll.$wrap.find('.shop_item').length==realIds.length){
							oldIsAll=1
						}else{}
					}else if(!comboInfo.cashshopids){
						oldIsAll=1;
					}
					var params={
						"shopid":am.metadata.userInfo.shopId,
						"oldcashshopids":comboInfo.cashshopids,
					    "id":comboInfo.id,
						"isAll":resObj.isAll,
						"oldIsAll":oldIsAll,
						"cashshopids":resObj.res,
						"itemname":comboInfo.itemname ||'', // 套餐名称
						"name":am.page.memberDetails.$userInfo.name||'' // 会员名称
					}
					am.api.updTreatShops.exec(params, function(ret) {
					    am.loading.hide();
					    if (ret.code == 0) {
					        am.msg('设置成功！');
					        scb && scb(comboInfo,resObj);
					    } else {
					        am.msg(ret.message || "设置失败！");
					        fcb && fcb();
					    }
					});
				},
				onCheck:function($dom,inCard){
					console.log($dom);
					if (inCard) {
						var $selectedLis = $dom.find('.shop_item.selected'),// 选中的门店列表
						len = $selectedLis.length, // 选中门店个数
						$lis=$dom.find('.shop_item'), // 门店列表
						selectedShopsIds = [];// 选中门店id
						var isAll=0;// 是否全选
						if($lis.length==$selectedLis.length){
							isAll=1;
						}
						selectedShopsIds.push("");
						if($dom.find('.radioWrap .checked').index()===1){
							selectedShopsIds.push('r');// 勾选禁用 ',r,123,454'
						}
						if ($selectedLis && len) {
							// 选中的不是仅在销售门店使用
							for (var i = 0; i < len; i++) {
								var shopInfo = $($selectedLis[i]).data('data');
								if (shopInfo) {
									selectedShopsIds.push(shopInfo.shopId);
								}
							}
							selectedShopsIds.push("");
							// return selectedShopsIds.join();
							if(isAll===1 && selectedShopsIds.indexOf('r')==-1){
								selectedShopsIds=null;// 门店正向全选存null
							}else{
								selectedShopsIds=selectedShopsIds.join();
							}
							return {
								"res": selectedShopsIds,
								"isAll": isAll
							}
						} else if ($dom.find('.onlySaledShop.selected').length>0) {
							// 仅在销售门店使用
							selectedShopsIds.push('-99');
							selectedShopsIds.push("");
							// return selectedShopsIds.join();
							return {
								"res": selectedShopsIds.join(),
								"isAll": isAll
							}
						} else {
							am.msg('请至少选择一个使用门店！')
							console.log('沒有选中任何li 门店');
							return;
						}
					} else {
						console.log('没有选中卡');
						return;
					}
				}
			})
			this.cardPopup = new PopupRt({
				$:$('.cardfee_popup'),
				type:1,
				onRender:function($dom,data){
					if(data){
						$dom.find('.card_no .line_val')
							.text(data.cardid+' ('+data.cardtypename+')')
						.end().find('.card_shop .line_val')
							.text((self.getshopName(data.shopid) && self.getshopName(data.shopid).replace(/\s/g,'') || '门店名称未设定'))
						.end().find('.card_fee .line_val')
							.text("￥" + am.cashierRound(data.cardfee ))
						.end().find('.card_pfee .line_val')
							.text("￥" +am.cashierRound(data.presentfee));
					}else{
						$dom.find('.card_no .line_val')
							.text('')
						.end().find('.card_shop .line_val')
							.text('')
						.end().find('.card_fee .line_val')
							.text('')
						.end().find('.card_pfee .line_val')
							.text('');
					}
				},
				onSubmit:function(res,scb,fcb){
					am.loading.show("正在转账，请稍候...");
					am.api.transferMemberCard.exec({
					    "parentShopId":am.metadata.userInfo.parentShopId,
					    "shopId":am.metadata.userInfo.shopId,
					    "outCardId":res.outCardId,
					    "inCardId":res.inCardId,
					    "cardFee":(res.cardFee || 0),
						"presentFee":(res.presentFee ||0),
						"remark":(res.remark || '')
					}, function(ret) {
					    am.loading.hide();
					    if (ret.code == 0) {
					        am.msg('卡金转出成功！');
					        scb && scb();
					    } else {
					        am.msg(ret.message || "转账失败，请重试！");
					        fcb && fcb();
					    }
					});
				},
				onCheck:function($dom,inCard,outCard){
					if(!inCard || !outCard){
						am.msg('请先选择好一张'+(this.isExchange?'转出':'转入')+'卡！');
						return false;
					}
					var outfee=am.cashierRound(outCard.cardfee);
					var outpfee=am.cashierRound(outCard.presentfee);
					var transfee=Number($dom.find('.trans_fee input').val());
					var transpfee=Number($dom.find('.trans_pfee input').val());
					var remark=$dom.parent().find(".card_trans_remark textarea").val();
					if(outCard.id==inCard.id){//转出卡和转入卡是同一张卡 卡id相同
						am.msg('转入卡和转出卡是同一张不能转账！');
						return false;
					}
					if(inCard.cardtype == 2||inCard.timeflag == 1){//资格卡、计次卡
						am.msg('资格卡和计次卡不能转卡金！');
						return false;
					}else {
						if( (!transfee) && (!transpfee) ){
							am.msg('请至少填写一个金额！');
							return false;
						}
						if(transfee && transfee>outfee){
							am.msg('转出卡卡金余额不够！');
							return false;
						}
						if(transpfee && transpfee>outpfee){
							am.msg('转出卡赠送金余额不够！');
							return false;
						}
						var opt={
							outCardId:outCard.id,
							inCardId:inCard.id,
						}
						transfee && (opt.cardFee=transfee);
						transpfee && (opt.presentFee=transpfee);
						remark && (opt.remark=remark);
						return opt;
					}
				},
				onChangeMemory:function($dom,inCard,outCard,res){//转出卡 不用管sum数据 转入卡加上sum数据
					if(outCard.id==inCard.id){//转出卡和转入卡是同一张卡 卡id相同
						return;
					}else{
						var cardfee=res.cardFee;
						var presentfee=res.presentFee;
						//转出卡
						var _outcardfee=outCard.cardfee*1-(cardfee||0);
						var _outpresentfee=outCard.presentfee*1-(presentfee||0);
						outCard.cardfee = _outcardfee;//2 改转出卡 临时数据
						outCard.presentfee=_outpresentfee;
						var outIndex=-1;
						$.each(self.cardCash,function(i,card){//3 改转出卡 内存数据
							if(outCard.id==card.id){//找到这张卡
								card.cardfee=_outcardfee;
								card.presentfee=_outpresentfee;
								outIndex=i;
							}
						});
						// if(outIndex>=0){//是当前页面中的卡 需要修改页面显示数据
						// 	self.$cardul.find('li').eq(outIndex).data('item',outCard).find('.card_fee .fee_num').html("￥" + _outcardfee)
						// 	.end().find('.card_present .fee_num').html("￥" + _outpresentfee );
						// }
						//转入卡 卡金增加 同步修改下sum统计数据
						var _incardfee=inCard.cardfee*1+(cardfee||0);
						var _inpresentfee=inCard.presentfee*1+(presentfee||0);
						inCard.cardfee = _incardfee;//2 改转出卡 临时数据
						inCard.presentfee=_inpresentfee;
						var index=-1;
						$.each(self.cardCash,function(i,card){//3改 转入卡 内存数据
							if(inCard.id==card.id){
								card.cardfee=_incardfee;
								card.presentfee=_inpresentfee;
								card.sumcardfee=card.sumcardfee+(cardfee||0);
								card.sumpresentfee=card.sumcardfee+(presentfee||0);
								index=i;
							}
						});
						// if(outCard.memberid==inCard.memberid){//转出卡和转入卡是同一个人就要处理转入卡数据的更新
						// if(index>=0){//是当前页面中的卡 需要修改页面显示数据
						// 	self.$cardul.find('li').eq(index).find('.card_fee .fee_num').html("￥" + _incardfee)
						// 		.end().find('.card_present .fee_num').html("￥" + _inpresentfee );
						// }
						// }
						var cards = self.$cardList.find('li');
						for(var i=0;i<cards.length;i++){
							var item = $(cards[i]).data('item');
							if(item && item.id==inCard.id){
								$(cards[i]).data('item',inCard).find('.card_fee .fee_num').html("￥" + _incardfee)
								.end().find('.card_present .fee_num').html("￥" + _inpresentfee );
							}
							if(item && item.id==outCard.id){
								$(cards[i]).data('item',outCard).find('.card_fee .fee_num').html("￥" + _outcardfee)
								.end().find('.card_present .fee_num').html("￥" + _outpresentfee );
							}
						}
					}
				},
			})
			this.comboPopup = new PopupRt({
				$:$('.combo_popup'),
				type:2,
				ownCards:self.cardCash,
				onRender:function($dom,data){
					if(data){
						var cardFee = data.cardFee;
						var cashFee = data.cashFee;
						var otherFee = data.otherFee;
						var total = cardFee+cashFee+otherFee;
						var leavemoney = data.leavemoney;
						if( !( !cardFee && !cashFee && !otherFee ) ){//计算套餐卡金余额
							leavemoney = am.cashierRound(leavemoney*((cardFee+cashFee)/total));
						}
						if(data.sumtimes == 0 ||data.sumtimes == -99){
							$dom.addClass('notLimited');
						}else{
							$dom.removeClass('notLimited');
						}
						console.log(leavemoney);
						$dom.find('.combo_name').text((data.itemname || ' '))
						.end().find('.combo_times .line_val')
							.text(((data.sumtimes == 0 || data.sumtimes == -99) ? "不限" : data.sumtimes)+'次')
						.end().find('.combo_remain .line_val')
							.text(((data.leavetimes == 0 || data.leavetimes == -99) ? "不限" : data.leavetimes)+'次')
						.end().find('.combo_total .line_val')
							.text('￥'+am.cashierRound(data.summoney))
						.end().find('.combo_once .line_val')
							.text('￥'+am.cashierRound(data.oncemoney))
							.end().find('.combo_money .line_val')
								.text('￥'+am.cashierRound(leavemoney))
						.end().find('.combo_btime .line_val')
							.text(data.buyDate?new Date(data.buyDate).format("yyyy.mm.dd"):'');
					}else{
						$dom.find('.combo_name').text(' ')
						.end().find('.combo_times .line_val')
							.text('')
						.end().find('.combo_remain .line_val')
							.text('')
						.end().find('.combo_total .line_val')
							.text('')
						.end().find('.combo_once .line_val')
							.text('')
							.end().find('.combo_money .line_val')
								.text('')
						.end().find('.combo_btime .line_val')
							.text('');
					}
				},
				onSubmit:function(res,scb,fcb){
					am.loading.show("正在退款，请稍候...");
					am.api.backCombo.exec({
					    "parentShopId":am.metadata.userInfo.parentShopId,
					    "shopId":am.metadata.userInfo.shopId,
					    "outCardId":res.outCardId,
					    "outMemberId":res.outMemberId,
					    "inCardId":res.inCardId,
					    "treatItemId":res.treatItemId,
					    "treatMoney":res.treatMoney || 0,
					    "treatNum":res.treatNum,
					}, function(ret) {
					    am.loading.hide();
					    if (ret.code == 0) {
					        am.msg('套餐退款成功！');
					        scb && scb();
					    } else {
					        am.msg(ret.message || "退款失败，请重试！");
					        fcb && fcb();
					    }
					});
				},
				onCheck:function($dom,inCard,outCard){
					var leavetimes=am.cashierRound(outCard.leavetimes);
					var sumtimes=am.cashierRound(outCard.sumtimes);
					var leavemoney=am.cashierRound(outCard.leavemoney);
					var oncemoney=am.cashierRound(outCard.oncemoney);

					var backtimes=Number($dom.find('.trans_fee input').val());
					var backfee=Number($dom.find('.trans_pfee input').val());
					var isLimitTime = true;
					if((sumtimes == 0 ||sumtimes == -99)||(leavetimes == 0 ||leavetimes == -99)){
						isLimitTime=false;//不限次
					}
					if(inCard){
						if(inCard.cardtype == 2|| inCard.timeflag=="1"){//资格卡计次卡不能退
							am.msg('资格卡计次卡不能用来退套餐！');
							return false;
						}else {
							if(!isLimitTime){//不限次 只需要输入退款金额 且退款金额不做限制
								am.msg('不限次的套餐，只需要输入退款金额！');
								backtimes=leavetimes;
							}else{//限次
								if(!backtimes){
									am.msg('请输入退套餐的次数！');
									return false;
								}
								if(backtimes && backtimes>leavetimes){
									am.msg('您输入退套餐的次数大于剩余次数！');
									return false;
								}else if(!/^\d+$/.test(backtimes)){
									am.msg('您输入退套餐的次数应该为正整数！');
									return false;
								}
								if(oncemoney){//单次金额不为零 限制退款金额
									var _oncemoney = backfee/backtimes;
									var inRange = Math.abs(Math.round(_oncemoney*10000)-Math.round(oncemoney*10000))<=100;
									if(backfee>(oncemoney*backtimes) && !inRange){
										am.msg('限次的套餐，退款金额不能大于次数乘以单价！');
										return false;
									}
								}
							}
							var opt={
								outCardId:outCard.memcardid,
								outMemberId:outCard.memberid,
								inCardId:inCard.id,
								treatItemId:outCard.id,
							}
							var treatNum=backtimes*1;
							var treatMoney=backfee*1;
							if(isNaN(treatNum)||isNaN(treatMoney)){
								am.msg('您的输入有误！');
								return false;
							}
							opt.treatNum=treatNum;
							opt.treatMoney=treatMoney;
							return opt;
						}
					}else{
						am.msg('请先选择好一张退入卡！');
						return false;
					}
				},
				onChangeMemory:function($dom,inCard,outCard,res){
					console.log($dom,outCard,res);
					// var combo = self.$userInfo.treatMentItems;
					var combo = [];
					// var list = self.$comboList.find('li');
					var list = self.$comboList.find('.comboItem');
					for(var i=0;i<list.length;i++){
						combo.push($(list[i]).data('comboItem'));
					}
					if((outCard.sumtimes == 0 ||outCard.sumtimes == -99)||(outCard.leavetimes == 0 ||outCard.leavetimes == -99)){//不限次退成功直接删除dom
						// 回写退套餐数据
						if(combo && combo.length && self.$userInfo.treatMentItems && self.$userInfo.treatMentItems.length){
							var treatMentItems=self.$userInfo.treatMentItems;
							for(var j=0,jlen=treatMentItems.length;j<jlen;j++){
								if(treatMentItems[j].id==res.treatItemId){
									treatMentItems.splice(j,1);
									break;
								}
							}
						}
						self.refreshComboData();
					}else{//改次数
						var index=-1;
						$.each(combo,function(j,combo){
							if(combo.memcardid==outCard.memcardid && outCard.id == combo.id){
								if(combo.leavetimes>=1){
									combo.leavetimes=am.cashierRound(combo.leavetimes-res.treatNum);
									combo.leavemoney=am.cashierRound(combo.leavemoney-res.treatMoney);
									/*if(combo.oncemoney){//不改变单价
										combo.oncemoney=am.cashierRound(combo.leavemoney/combo.leavetimes);
									}*/
									combo.leavemoney = combo.leavetimes*combo.oncemoney;
									if(combo.leavetimes<=0){
										index=j;
									}
								}
							}
						})
						index>=0 && combo.splice(index,1);
						index>=0 && $dom.remove();
						// 回写退套餐数据
						if(combo && combo.length && self.$userInfo.treatMentItems && self.$userInfo.treatMentItems.length){
							var treatMentItems=self.$userInfo.treatMentItems;
							for(var i=0,clen=combo.length;i<clen;i++){
								for(var j=0,jlen=treatMentItems.length;j<jlen;j++){
									if(treatMentItems[j].id==combo[i].id){
										treatMentItems[j]=combo[i];
									}
								}
							}
						}
						self.refreshComboData();
						self.$comboTitTabWrap.find('span:first').trigger('vclick');
						// self.renderCircle(combo,true);
					}
					self.comboScroll.refresh();
					var addfee = res.treatMoney||0;
					if(inCard.memberid==outCard.memberid && addfee){//如果是同一个人名下的卡 需要更新卡金
						var cardfee=0,sumcardfee=0;
						$.each(self.cardCash,function(i,card){//3改内存数据
							if(inCard.id==card.id){
								cardfee=Number(card.cardfee)+(addfee||0);
								sumcardfee=Number(card.sumcardfee)+(addfee||0);
								card.cardfee=cardfee;
								card.sumcardfee=sumcardfee;
								index=i;
							}
						});
						// self.$cardul.find('li').eq(index).find('.card_fee .fee_num').html("￥" + cardfee);
						var cards = self.$cardList.find('li');
						for(var i=0;i<cards.length;i++){
							var item = $(cards[i]).data('item');
							if(item && item.id==inCard.id){
								item.cardfee = cardfee;
								$(cards[i]).data('item',inCard).find('.card_fee .fee_num').html("￥" + Math.round(cardfee*100)/100);
							}
						}
					}
				},
			})

			this.exboxScroll = new $.am.ScrollView({
				$wrap:this.$.find('.goodlist'),
				$inner:this.$.find('.goodlist .exinner'),
				direction: [false, true],
				hasInput: false
			})
			this.exboxScroll.refresh();

			this.leftBoxScroll = new $.am.ScrollView({
				$wrap: this.$.find(".leftbox"),
				$inner: this.$.find(".leftbox > div"),
				direction: [false, true],
				hasInput: false
			});

			this.$leftBox.on('vclick','.header_box img',function(){
				var $url=$(this).attr('src'),
				$newUrl=$url.replace('_s','_m');
				amGloble.largeHeadImg.show($newUrl);
			});
			//点击头像锁
			this.$leftBox.on('vclick','.header.lock',function(){
				var $header = $(this);
				var caption = '',description = '',okCaption = '';
				if($header.hasClass("lock")){
					caption = '解除锁定';
					description = '确认解除会员锁定';
					okCaption = '解除锁定';
					data = {
						memberId: self.$userInfo.id,
						locking: 1,
						cb: function(){
							$header.removeClass("lock");
							self.$memberLock.addClass('on');
							self.$userInfo.locking = 1;
						}
					};
					atMobile.nativeUIWidget.confirm({
						caption: caption,
						description: description,
						okCaption: okCaption,
						cancelCaption: '取消'
					}, function(){
						am.lockRule(data);
					});
					return false;
				}
			});
		},
		updMemberPoint:function(opt,cb){
			am.loading.show("正在修改数据，请稍候...");
            am.api.updMemberPoint.exec(opt, function(ret) {
                am.loading.hide();
                if (ret.code == 0) {
					am.msg("修改成功！");
                    cb&&cb();
                } else {
                    am.msg(ret.message || "数据获取失败，请重试！");
                }
            });
		},
		remarksPermissions: function () {
			if (amGloble.metadata.userInfo.operatestr.indexOf('Y,') == -1) {
				am.msg("您没有权限修改会员备注!");
				return false;
			}
			return true;
		},
		modifyBalancePermissions: function () {
			if (amGloble.metadata.userInfo.operatestr.indexOf('A,') == -1) {
				am.msg("您没有权限修改会员充值卡充值总额及余额!");
				return false;
			}
			return true;
		},
		cardPermissions:function(){
			if (amGloble.metadata.userInfo.operatestr.indexOf('R,') == -1) {
				am.msg("您没有权限修改会员卡号!");
				return false;
			}
			return true;
		},
		cardmodal: {
			init: function () {
				var _this = this;
				this.$ = self.$cabox;
				this.$.find(".save_btn").vclick(function () {
					_this.edit(_this.data);
				});
				this.$.find(".cancel_btn,.right_btn").vclick(function () {
					_this.$.find(".new_card_no_txt").val("");
					_this.hide();
				});
			},
			edit: function (d) {
				var _this = this;
				var cardId = _this.$.find(".new_card_no_txt").val().trim().toUpperCase();
				var json = {
					id: d.id,
					oldCardId: d.cardid,
					cardId: cardId,
					cardTypeId: d.cardtypeid,
					shopId: d.shopid
				};
				if(!self.cardPermissions) return;
				if(am.isNull(cardId)){
					return am.msg("请输入新卡号!");
				}
				am.loading.show("修改中,请稍候...");
				am.api.editMemberCardId.exec(json, function (res) {
					am.loading.hide();
					if (res.code == 0) {
						am.msg("修改成功");
						self.clearModelBox();
						d.dom.find(".card_no").html(cardId); //卡号
						_this.$.find(".new_card_no_txt").val("");
						var data = d.dom.data("item");
						data.cardid = cardId;
					} else {
						am.msg(res.message || "数据获取失败,请检查网络!");
					}
				});
			},
			show: function (d) {
				var data = d.data('item');
				data.dom = d;
				this.data = data;
				self.$cabox.removeClass("hide");
				if(!this.flag){
					this.init();
					this.flag = true;
				}
				this.$.find(".card_no_txt").html("原卡号："+data.cardid);
			},
			hide: function () {
				self.$cabox.addClass("hide");
			}
		},
		beforeShow: function (paras) {
			this.beforeShowPara=paras;
			if (paras == "back") return;
			if(paras.shiftObj){
				self.shiftObj=paras.shiftObj;
			}
			if (paras == "refreshIncome") {
				this.$.find(".memberDetailsTab li:nth-of-type(6)").trigger('vclick');// bug-15597 for longshany:
				return;
			}
			//paras 必须携带customerId 可以携带 当前选中的卡Id cardId 当前进来的tab tabId
			console.log("am.metadata给大爷笑个,chali",am.metadata)
			if (!paras) return;
			this.comboScroll.refresh();
			this.$.find(".remarks").html('');
			this.$data = paras;
			if (paras.hasOwnProperty("cardId")) {
				this.selectCardId = paras.cardId;//判断是否有选中的卡
			} else {
				this.selectCardId = null;//不存在就清空
			}
			this.$twoStatus.children().removeClass('done');
			self.getData(function (res) {
				self.renderUserInfo(res);
				if (paras.hasOwnProperty("tabId")) {
					self.changeTab(paras.tabId);
				}

				//初始化开通特权日期 chali
				var timeStart = (self.$memberInfo.privilege !=null && self.$memberInfo.privilege.hasOwnProperty("createTime"))?new Date(self.$memberInfo.privilege.createTime):amGloble.now(); //当前时间
				var timeEnd = (self.$memberInfo.privilege != null && self.$memberInfo.privilege.hasOwnProperty("expireDate") && self.$memberInfo.privilege.expireDate != null)?new Date(self.$memberInfo.privilege.expireDate):amGloble.now();
				var max = new Date(timeStart.getFullYear() + 10, timeStart.getMonth(), timeStart.getDate());
				self.$startInput.val(timeStart.format("yyyy-mm-dd"));
				self.$endInput.val(timeEnd.format("yyyy-mm-dd"));
				console.log(res,"res是啥玩意")
				self.updateData(res.content.memberInfo); //渲染 更新详情页
				//调用mobiscroll()组件,点击日期时调用onSet()方法
				self.calendarInstanceEnd=self.$endInput.mobiscroll().calendar({
					theme: 'mobiscroll',
					lang: 'zh',
					display: 'bottom',
					months: "auto",
					min:timeStart,
					max:max,
					setOnDayTap: true,
					buttons: [],
					endYear:amGloble.now().getFullYear()+50,
					onSet: function(valueText, inst) {
						self.$endInput.val(new Date(valueText.valueText).format("yyyy-mm-dd"));
					}
                });
                
                // 性能监控点
                monitor.stopTimer('M07', 0)
			});

			this.getMallItemData(function (res) {
				self.$adbox.find(".pro_list_scroll ul").html('');
				$.each(res, function (i, item) {
					var li = '<li class="nothide am-clickable" tid="' + item.category + '" iid="' + item.id + '" ><span class="nothide">' + item.name + '</span><span class="nothide">￥' + item.price + '</span></li>';
					self.$adbox.find(".pro_list_scroll ul").append(li);
				});
			});

			this.initEditMemberShop();

			this.cardsInfo = null;
			this.mgjIsHighQualityCust = 0;

			if(!computingPerformance.empList){
				var itemList = [].concat(am.metadata.classes,(am.metadata.stopClasses || []));
				computingPerformance.updataConfig({
					empList: am.metadata.employeeList,
					itemList: itemList,
					payConfig: am.metadata.payConfigs
				});
			}
		},
		afterShow: function (paras) {
			this.tableScroll.refresh();
			this.comboScroll.refresh();
			//特权有效期选择器 chali
			if(!this.privilegeCardSelect){
				if(!amGloble.metadata.configs.mgjPrivilegeSettings || !JSON.parse(amGloble.metadata.configs.mgjPrivilegeSettings).length){
					this.privilegeSettings = [{"name": "一个月", "value": 1,"privilegeOpenPrice":0},
					{"name": "三个月", "value": 3,"privilegeOpenPrice":0},
					{"name": "半年", "value": 6,"privilegeOpenPrice":0},
					{"name": "一年", "value": 12,"privilegeOpenPrice":0},
					{"name": "不限期", "value": -1,"privilegeOpenPrice":0}];
				}else {
					this.privilegeSettings =JSON.parse(amGloble.metadata.configs.mgjPrivilegeSettings);
				}
				this.privilegeCardSelect = new $.am.Select({
					$: self.$.find(".privilegeCardSelect"),
					data: self.privilegeSettings,
					onSelect:function(){
						self.setUnitPrice(self.privilegeCardSelect.getValue());
					}
				});
			}
			this.privilegeCardSelect.setValue(0);
			this.setUnitPrice(self.privilegeCardSelect.getValue());
		},
		beforeHide: function (paras) {
			this.selectCardId = null;//清空
			$("#pswp_dom").removeClass("pswp--open");
		},
		/**
		 * chali 更新详情页 暂时不判断门店版本是否 能开通特权
		 * 判断门店是否开通特权模式, 会员是否开通商城特权
		 */
		setUnitPrice:function(value){
			for(var i=0;i<this.privilegeSettings.length;i++){
                if(value==this.privilegeSettings[i].value){
                    $('.unit_price').text(this.privilegeSettings[i].privilegeOpenPrice);
                }
            }
		},
		updateData:function(memberInfo){
			if((am.metadata.configs.hasOwnProperty("mgjMallPrivilege")?(am.metadata.configs.mgjMallPrivilege == "1"):false) && am.metadata.userInfo.mgjVersion && am.metadata.userInfo.mgjVersion == 3 && memberInfo.mgjversion && memberInfo.mgjversion ==3){//是否启用特权卡
				self.$.find(".privilegeCardButton").removeClass('hide');
				if(self.$memberInfo.privilege !=null && self.$memberInfo.privilege.hasOwnProperty("ownerId") && self.$memberInfo.id == self.$memberInfo.privilege.ownerId){// 会员已开通
					self.$.find(".privilegeCardBtn").removeClass('bgColor');
					self.$.find(".privilegeCardBtn .crown").removeClass('crown').addClass('ico');
					self.$.find(".privilegeCardBtn .value").text("已开通商城特权");
					self.$.find(".privilegeCardBtn .tips").removeClass('hide')
					var str = "有效期至:"+(self.$memberInfo.privilege.expireDate !=null ?new Date(self.$memberInfo.privilege.expireDate).format("yyyy-mm-dd"):"不限期");
					self.$.find(".privilegeCardBtn .tips").text(str);
				}else{
					if(!self.$.find(".privilegeCardBtn .tips").hasClass("hide")){
						self.$.find(".privilegeCardBtn .tips").addClass("hide");
						self.$.find(".privilegeCardBtn").addClass('bgColor');
						// self.$.find(".privilegeCardBtn .crown").addClass('crown');
						self.$.find(".privilegeCardBtn .ico").removeClass('ico').addClass('crown');
						self.$.find(".privilegeCardBtn .value").text("开通商城特权");
					}
				}
			}
		},
		cardDel:function(id){
			var lastCardNum=self.cardCash.length;
			if(lastCardNum==1){
				am.msg('请至少要保留一张卡！');
				return;
			}
			atMobile.nativeUIWidget.confirm({
               caption: '删除卡',
               description: '卡片删除后仅可在后台恢复，确认删除么？',
               okCaption: '删除',
               cancelCaption: '取消'
           }, function(){
               am.loading.show("正在删除，请稍候...");
               am.api.delCard.exec({
                   "parentShopId":am.metadata.userInfo.parentShopId,
                   "shopId":am.metadata.userInfo.shopId,
                   "id":id
               }, function(ret) {
                   am.loading.hide();
                   if (ret.code == 0) {
                       am.msg('成功删除！');
                       self.cardDelMemoryChange(id);
                   } else {
                       am.msg(ret.message || "删除失败，请重试！");
                   }
               });
           }, function(){

           });
		},
		cardDelMemoryChange:function(id){
			var index=-1;
			$.each(self.cardCash,function(i,card){
				if(id==card.id){
					index=i;
				}
			});
			self.cardCash.splice(index,1);
			// this.$cardul.find('li').eq(index).remove();
			var cards = this.$cardList.find('li');
			for(var i=0;i<cards.length;i++){
				var item = $(cards[i]).data('item');
				if(item && item.id==id){
					$(cards[i]).remove();
				}
			}
			var $comboBoxDom=this.$comboBox.find('.li');
			$comboBoxDom.each(function(i,item){
				var cid=$(item).data('cardid');
				if(cid==id){
					$(item).remove();
				}
			})
			this.cardScroll.refresh();
			this.comboScroll.refresh();
		},
		selecteCombo: function (data) {
			this.$comboul.find("li").removeClass('selected');
			if (!data || data.length == 0) return;
			var idList = [], resList = [];
			var $list = this.$comboul.data("item");
			for (var i = 0; i < data.length; i++) {
				idList.push(data[i].id);
			}
			if (!$list || $list.length == 0) return;
			for (var j = 0; j < $list.length; j++) {
				var res = $.inArray($list[j].id, idList);
				if (res >= 0) {
					resList.push(j);
				}
			}
			if (!resList || resList.length == 0) return;
			for (var l = 0; l < resList.length; l++) {
				this.$comboul.find("li").eq(resList[l]).addClass('selected')
			}
		},
		changeTab: function (idx,callback) {
			// 性能监控
			switch (idx) {
				// 消费记录
				case 2:
					monitor.startTimer('M11', {
						memberId: this.$memberInfo.id,
						shopId: this.$memberInfo.shopid
					});
					break;
				default:
					break;
			}
			self.cardCashIndex=1;
			self.redPocketsIndex=1;
			var $contentList = this.$contentList.hide();
			var $tab = this.$tab.find("li").removeClass("selected");
			$contentList.eq(idx).show();
			$tab.eq(idx).addClass('selected');
			this[this.renderList[idx]](true,callback);
		},
		renderCircle: function (data,flag) {
			return;
			var canvas = this.$comboList.find("canvas");
			var num = [];
			for (var j = 0; j < data.length; j++) {
				num.push(data[j].leavetimes / data[j].sumtimes);
			}

			for (var i = 0; i < canvas.length; i++) {
				var ctx = canvas[i].getContext("2d");
				!flag && ctx.scale(2,2);
				ctx.clearRect(0, 20, 112, 112);
				(function (ctx, idx, self, words) {
					var j = 0;
					var timer = setInterval(function () {
						ctx.clearRect(0, 20, 112, 112);
						self.drawCircel(ctx, 70, 38, 25, 0, 2 * Math.PI);
						j++;
						self.drawCircel(ctx, 70, 38, 25, -(30 * 2 / 360) * Math.PI, 2 * Math.PI * ((num[idx] / 10) * j), "#625593", words);
						if (j >= 10) {
							clearInterval(timer);
						}
					}, 50);
				})(ctx, i, this, data[i].leavetimes==-99?'不限':data[i].leavetimes);
			}
		},
		getTime: function (time) {
			try {
				var date = new Date(time);
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var day = date.getDate();
				return year + "." + month + "." + day;
			} catch (e) {

			}

		},
		getfileTime: function (publishTime) {
			var d_minutes,
				d_hours,
				d_days;
			var timeNow = parseInt(am.now().getTime() / 1000);
			var d;
			d = timeNow - publishTime;
			d_days = parseInt(d / 86400);
			d_hours = parseInt(d / 3600);
			d_minutes = parseInt(d / 60);
			d_s = parseInt(d);
			if (d_days > 0) {
				return d_days + "天";
			} else if (d_days <= 0 && d_hours > 0) {
				return d_hours + "小时";
			} else if (d_hours <= 0 && d_minutes > 0) {
				return d_minutes + "分钟";
			} else {
				return "刚刚"
			}
		},
		renderOurselves: function (clear) {
			if (clear) {
				self.fileBoxIndex = 0;
				self.$fileul.find(".listbox").remove();
				self.fileScroll.scrollTo("top");
			}
			var idx = this.$fileBox.find(".leftTit span.selected").index();
			if (idx == 0) {
				this.$fileBox.find(".leftTit span.addphoto").text("添加说说")
			} else {
				this.$fileBox.find(".leftTit span.addphoto").text("添加照片")
			}
			this.getarchivesData(function (res) {
				/*self.$fileul.empty();*/
				if (res.content && res.content.length) {
					self.fileBoxIndex++;
					var data = res.content;
					for (var i = 0; i < data.length; i++) {
						var item = data[i],
							$li = self.$fileli.clone(true, true);
						if (idx == 0) {
							$li.find(".right .words p").text(item.archives);
                            $li.find(".outher").text(item.userName);
                            $li.find(".imglist ul").empty();
                            if(item.imgs){
                                var imgs = item.imgs.split(',');
                                if(imgs && imgs.length){
									$.each(imgs, function(j, itemj) {
										var $imgli = self.$imgBoxli.clone(true, true);
                                        $imgli.html(am.photoManager.createImage("customerFile", {
                                            parentShopId: am.metadata.userInfo.parentShopId,
                                            // catigoryId: item.userType,
										    authorId: item.userId
                                        }, imgs[j], "s"));
                                        $li.find(".imglist ul").append($imgli);
										var img = new Image();
										img.src = $imgli.find('img').attr('src');
										img.onload = function(){
											$imgli.find('img').attr('w',this.width);
										}
									});
                                }
                            }
						} else {
							$li.find(".outher").text(item.empName);
							$li.find(".right .words p").text(item.title);

							$li.find(".imglist ul").empty();
							console.log(item,'照片数据');
							var photoList = item.photo.split(",");
							if (photoList && photoList.length) {
								$.each(photoList, function(j, itemj) {
									var $imgli = self.$imgBoxli.clone(true, true);
									$imgli.html(am.photoManager.createImage("show", {
										catigoryId: item.type,
										parentShopId: item.parentShopId,
										authorId: item.empId
									}, photoList[j], "s"));
									$li.find(".imglist ul").append($imgli);
									var img = new Image();
									img.src = $imgli.find('img').attr('src');
									img.onload = function(){
										$imgli.find('img').attr('w',this.width);
									}
								});
							}
						}
						if (self.getfileTime(item.createTime / 1000) == '刚刚') {
							$li.find(".left .key").text('上传');
						}
						$li.find(".left .value").text(self.getfileTime(item.createTime / 1000));
						// console.log()
						var noneArray=[];
						for(var none=1;none<7;none++){
							if(amGloble.metadata.configs['category_'+none]=="false"){
								   noneArray.push(none);
							}
						};
						console.log(noneArray,'被禁用的大类编号');
                        if(noneArray.indexOf(item.type)==-1){
							self.$fileul.append($li);
						}
						// 

					}
					// if (idx == 0) {
					// 	self.$fileBox.find(".imglist").hide();
					// } else {
					// 	self.$fileBox.find(".imglist").show();
					// }
					if (self.fileBoxSize > res.content.length) {
						self.fileScroll.pauseTouchBottom = true;
					} else {
						self.fileScroll.pauseTouchBottom = false;
					}
					self.$.find(".filebody").removeClass('empty cutting');
				} else {
					if (res.pageIndex == 0) {
						self.$.find(".filebody").removeClass('cutting').addClass("empty");
					} else {
						am.msg("没有更多啦！");
					}

					self.fileScroll.pauseTouchBottom = true;
				}

				self.fileScroll.pauseTouchTop = false;
				self.fileScroll.refresh();

				self.fileScroll.closeTopLoading();
				self.fileScroll.closeBottomLoading();
			});

		},
		getTreatPackageDetail: function (opt, cb) {
			am.loading.show("获取中,请稍候...");
			am.api.treatPackageDetail.exec(opt, function (ret) {
				am.loading.hide();
				if (ret && ret.code == 0) {
					console.log(ret);
					cb && cb(ret.content);
					// am.treatPackageDetail.show(ret.content)
				} else {
					am.msg(ret.message || '获取失败！')
				}
			});
		},
		renderCard: function () {
			var data = this.cardCash;
			var comboInfo = self.$userInfo.treatMentItems;
			var $cardList = this.$cardList;
			var cardList = ["type_zero", "type_one", "type_two"];
			$cardList.empty();
			this.$comboList.empty();
			this.cardsInfo = {
				cardsNum:data.length,
				smsflag: 0,
				deductSmsFlag: 0
			};
			if (data.length) {
				var dataObj = {};
				for(var i=0;i<data.length;i++){
					if(!dataObj[data[i].cardshopId]){
						dataObj[data[i].cardshopId] = [];
					}
					dataObj[data[i].cardshopId].push(data[i]);
				}
				for(var key in dataObj){
					var $cardWrapper = this.$cardWrapper.clone(true,true);
					$cardWrapper.find('.title .shopname').text(am.page.searchMember.getShopName(key)+(key==amGloble.metadata.userInfo.shopId?'(本店)':''));
					var $cardul = this.$cardul.clone(true,true);
					for(var i=0;i<dataObj[key].length;i++){
						var item = dataObj[key][i],
							$li = this.$cardLi.clone(true, true);
						item.mgjIsHighQualityCust = this.mgjIsHighQualityCust;
						var cardType = amGloble.metadata.cardTypeMap[item.cardtypeid] || amGloble.metadata.defaultCardTypeMap[item.cardtypeid];
						if(cardType){
							if(cardType.smsflag==1){
								this.cardsInfo.smsflag ++;
							}
							if(cardType.deductSmsFlag==1){
								this.cardsInfo.deductSmsFlag ++;
							}
						}
						$li.find(".info_left .card_name").text(item.cardtypename); //卡类型名
						if (item.cardtype != "2") {//非资格卡
							$li.find(".info_right").removeClass('hasnofee');
							/*$li.find(".name .value").html("￥" + am.cashierRound(item.cardfee - item.treatcardfee) ).addClass('show').removeClass('lshow');
							$li.find(".name .otherValue").html( am.cashierRound(item.presentfee - item.treatpresentfee)).addClass('show');
							$li.find(".num .value").text('余额').addClass('show');
							$li.find(".num .otherValue").text('赠送金').addClass('show');*/
							$li.find(".card_fee .fee_num").html("￥" + am.cashierRound(item.cardfee ));
							$li.find(".card_present .fee_num").html("￥" +am.cashierRound(item.presentfee));
						} else {//资格卡 值显示
							/*$li.find(".name .value").text('现金消费卡').removeClass('show').addClass('lshow');
							$li.find(".name .otherValue").text('').removeClass('show');
							$li.find(".num .value").text('').removeClass('show');
							$li.find(".num .otherValue").text('').removeClass('show');*/
							$li.find(".info_right").addClass('hasnofee');
						}

						$li.find(".card_no").text(item.cardid);

						// 退卡锁
						if (item.status == 1) {
							$li.addClass("refundCardLock").addClass("am-disabled");
						} else {
							$li.removeClass("refundCardLock").removeClass("am-disabled");
						}
						//到期日
						if (item.invaliddate) {
							var _str = '到期日：' + new Date(item.invaliddate - 0).format("yyyy.mm.dd");
						} else {
							var _str = '到期日：无';
						}
						$li.find(".duedatewrap .duedate").text(_str);
						var discountRules = am.timeDiscount.hasNewCardRule(item.cardtypeid);
						var newCardRule = am.timeDiscount.dateCheck(discountRules); // 是否有新规则
						// 没新规则不显示折扣规则按钮
						if (am.isNull(newCardRule)) {
							$li.find('.discountRuleBtn').hide();
						}else{
							$li.find('.discountRuleBtn').show().data('newCardRule', newCardRule);
						}
						// //散客卡、套餐消费卡应不能修改到期时间
						// if (item.cardtypeid == "20151212" || item.cardtypeid == "20161012") {
						// }
						// //判断有没有权限修改到期日
						// if (am.operateArr.indexOf('Z') == -1) {
						// 	$li.find(".duedatewrap .duedateedit").hide();
						// }

						$li.data("item", item);
						if (self.selectCardId && self.selectCardId == item.id) {
							$li.addClass('selected');
						}
						if (item.cardtype == 1 && (item.timeflag == 0 || item.timeflag == 2)) {
							$li.find(".free .value").addClass('pay');
						}
						if(item.cardRemark){
							$li.find(".remarkWrap .remarkCon .text").html(item.cardRemark)
						}
						// cardType 1 储值卡 cardType 2 资格卡  资格卡不显示余额和赠送金  timeflag 0 普通 1 计次 2 套餐 3 年卡
						// if((item.cardtype=="1" || item.cardtype=="2") && item.timeflag=="2"){
						// 	$li.addClass('type_zero');
						// }else if((item.cardtype=="1" || item.cardtype=="2") && item.timeflag=="0"){
						// 	$li.addClass('type_one');
						// }else{
						// 	$li.addClass(cardList[item.cardtype]);
						// }
						// $li.addClass();
						if ((item.cardtype == "1")) {
							if (item.timeflag == "2") {
								$li.addClass('type_zero');
							} else {
								$li.addClass('type_one');
							}
						} else {
							$li.addClass('type_two');
						}

						//此次迭代暂时只让修改纯储值卡 timeflag = 0
						if (item.timeflag != "0") {// && item.timeflag != "2"
							$li.find('.balanceedit').hide();
							$li.find('.giftmoneyedit').hide();
						}

						//判断有无权限修改余额和赠送金
						if (am.operateArr.indexOf('A') == -1) {
							$li.find('.balanceedit').hide();
							$li.find('.giftmoneyedit').hide();
						}

						//END 替代之前的逻辑
						$cardul.append($li);
					}
					$cardWrapper.append($cardul);
					$cardList.append($cardWrapper);
				}
				
				var $cardWrapper = this.$cardWrapper.clone(true,true);
				$cardWrapper.find('.title').remove();
				var $cardul = this.$cardul.clone(true,true);
				var emptyLi = this.$cardLi.clone(true, true);
				emptyLi.find(".card_base_info,.duedatewrap").css("opacity", 0).end().find(".free .key,.free").empty().end().addClass('addcard');
				$cardul.append(emptyLi);
				$cardWrapper.append($cardul);
				$cardList.append($cardWrapper);
			}else{
				var $cardWrapper = this.$cardWrapper.clone(true,true);
				$cardWrapper.find('.title').remove();
				var $cardul = this.$cardul.clone(true,true);
				var emptyLi = this.$cardLi.clone(true, true);
				emptyLi.find(".card_base_info,.duedatewrap").css("opacity", 0).end().find(".free .key,.free").empty().end().addClass('addcard');
				$cardul.append(emptyLi);
				$cardWrapper.append($cardul);
				$cardList.append($cardWrapper);
			}

			if(!this.cardsInfo.smsflag){
				this.$notifySms.removeClass('on');
			}
			if(!this.cardsInfo.deductSmsFlag){
				this.$deductSmsFeeFlag.removeClass('on');
			}
			if (comboInfo.length) {
				// var comboInfoObj = {};
				// for (var i = 0; i < comboInfo.length; i++){
				// 	if(!comboInfoObj[comboInfo[i].shopid]){
				// 		comboInfoObj[comboInfo[i].shopid] = [];
				// 	}
				// 	comboInfoObj[comboInfo[i].shopid].push(comboInfo[i]);
				// }
				// this.$comboBox.removeClass("empty");
				if (!self.$userInfo.usedtreatMentItems || !self.$userInfo.overDuetreatMentItems ||!self.$userInfo.validtreatMentItems) {
					// 判断渲染类别
					var usedtreatMentItems = [], // 已使用 即用完的 不管是否过期
						overDuetreatMentItems = [], // 已过期 即过期且次数未用完的
						validtreatMentItems =[];// 有效的余量

					for (var n = 0, nlen = comboInfo.length; n < nlen; n++) {
						var itemn = comboInfo[n];
						// && itemn.isNewTreatment != 1
						// 已用完
						if (itemn.leavetimes == 0) {
							usedtreatMentItems.push(itemn);
						}
						// 已过期 截至到23：59：59
						if (itemn.validdate && (am.now().getTime() > new Date((itemn.validdate + 86400000 - 1000 +'').replace(/-/g, '/')-0).getTime()) && (itemn.leavetimes > 0 || itemn.leavetimes ==-99)) {
							overDuetreatMentItems.push(itemn);
						}else if(itemn.leavetimes > 0 || itemn.leavetimes ==-99){
							// 未过期 并且未用完 或者不限次
							validtreatMentItems.push(itemn);
						}
					}
					self.$userInfo.usedtreatMentItems = usedtreatMentItems;
					self.$userInfo.overDuetreatMentItems = overDuetreatMentItems;
					self.$userInfo.validtreatMentItems = validtreatMentItems;
				}
			}
			this.$comboTitTabWrap.find('span:first').trigger('vclick');
			this.cardScroll.refresh();
			this.cardScroll.scrollTo("top");
			/*var combo=this.getCombo(data);
			 var $comboul=this.$comboul;
			 $comboul.empty();
			 if(combo.length){
			 for(var i=0;i<combo.length;i++){
			 var itemj=combo[i],
			 $comboli=this.$comboli.clone(true,true);
			 $comboli.find(".left .key").text(itemj.itemname+"("+(itemj.sumtimes==0?"不限":itemj.sumtimes)+"次)");
			 $comboli.find(".left .value").text((itemj.validdate?self.getTime(itemj.validdate):"不限期"));
			 $comboli.data("item",itemj);
			 $comboul.append($comboli);
			 }
			 $comboul.data("item",combo);
			 this.renderCircle(combo);
			 this.$comboBox.removeClass("empty");
			 }else{
			 this.$comboBox.addClass("empty");
			 }*/
		},
		renderCardCombo:function(data){
			var $rightcombo=this.$comboList.parents('.rightcombo');
			var renderType=this.$comboTitTabWrap.find('.selected').index();
			this.$comboList.empty();
			var comboInfo=data;
			if(comboInfo && comboInfo.length){
				$rightcombo.removeClass('empty');
				var comboInfoObj = {};
				for (var i = 0; i < comboInfo.length; i++){
					if(!comboInfoObj[comboInfo[i].shopid]){
						comboInfoObj[comboInfo[i].shopid] = [];
					}
					comboInfoObj[comboInfo[i].shopid].push(comboInfo[i]);
				}
				this.$comboBox.removeClass("empty");
				for (var ikey in comboInfoObj) {
					var arr=comboInfoObj[ikey];
					var map = {},
						res = [],
						uniqueFlags = [];
					for (var p = 0; p < arr.length; p++) {
						var ap = arr[p];
						if (!map[ap.treatPackageId]) {
							res.push({
								treatPackageId: ap.treatPackageId,
								treatPackageName: ap.treatPackageName,
								data: [ap],
								goods:(ap && ap.outdepot && ap.outdepot[0] && ap.outdepot[0].details)||[]
							});
							map[ap.treatPackageId] = ap;
							if(ap.outdepot && ap.outdepot[0] && ap.outdepot[0].id){
								uniqueFlags.push(ap.outdepot[0].id)
							}
						} else {
							for (var q = 0; q < res.length; q++) {
								var dq = res[q];
								if (dq.treatPackageId == ap.treatPackageId) {
									dq.data.push(ap);
									if(ap.outdepot && ap.outdepot[0] && ap.outdepot[0].id && uniqueFlags.indexOf(ap.outdepot[0].id)==-1 && ap.outdepot &&ap.outdepot[0] && ap.outdepot[0].details){
										dq.goods=dq.goods.concat(ap.outdepot[0].details);
										uniqueFlags.push(ap.outdepot[0].id);
										break;
									}
								}
							}
						}
					}
					comboInfoObj[ikey]=res;
				}
				for(var key in comboInfoObj){
					var $comboWrapper = this.$comboWrapper.clone(true,true);
					$comboWrapper.find('.title .shopname').text(am.page.searchMember.getShopName(key)+(key==amGloble.metadata.userInfo.shopId?'(本店)':''));
					var $comboul = this.$comboul.clone(true,true);
					for (var l = 0; l < comboInfoObj[key].length; l++) {
						var obj=comboInfoObj[key][l];
						var $combolii = this.$comboli.clone(true, true);
						// var $comboPackageUl=$combolii.find('.comboPackageUl:first').clone(true,true);
						var $comboPackageUl=this.$comboPackageUl.clone(true,true);
						var treatPackageName='';
						if(obj.treatPackageName){
							treatPackageName=obj.treatPackageName
						}else if(obj.treatPackageId===-1){
							treatPackageName='自由组合套餐';
						}
						$combolii.find('.comboName').html(treatPackageName);
						for(var c=0,leng=obj.data.length;c<leng;c++){
							// 渲染服务项目
							var itemtt = obj.data[c];
							// var $comboItemGoods=this.$comboItemGoods.clone(true,true);
							var $comboItem=this.$comboItem.clone(true,true);
							var totalTimes=(itemtt.sumtimes == -99) ? " 不限次" : ' x'+itemtt.sumtimes+'次';
							$comboItem.find('.left .name .nameText').html((itemtt.treattype == 1 || itemtt.treattype == 2 ? '<strong class="highlight">[赠] </strong>' : '') +(itemtt.itemname||' '));
							$comboItem.find('.left .name .totalTimes').html(totalTimes);
							// $comboItem.find('.left .date').html((itemtt.validdate ? ('<span class="duedate">有效期至' + self.getTime(itemtt.validdate) + '</span><span class="treatmentdateedit iconfont icon-juxingkaobei am-clickable"></span>') : ('<span class="duedate">不限期' + '</span><span class="treatmentdateedit iconfont icon-juxingkaobei am-clickable"></span>')));
							var dateStrPrefix='有效期至',
								dateStrSuffix='';
							if(am.now().getTime()>itemtt.validdate*1 + 86400000 - 1000){
								dateStrPrefix='已于';
								dateStrSuffix='过期';
							}
							$comboItem.find('.left .date').html((itemtt.validdate ? ('<span class="duedate">'+dateStrPrefix + self.getTime(itemtt.validdate)+dateStrSuffix + '</span>'+'<span style="visibility:hidden" class="am-clickable treatmentdateedit"></span>') : ('<span class="duedate">不限期' + '</span>'+'<span style="visibility:hidden" class="am-clickable treatmentdateedit"></span>')));
							var modifyRemark='<span class="comboRemarkIcon am-clickable"></span>';
							if(itemtt.itemRemark){
								$comboItem.find(".remark .remarkText").html(itemtt.itemRemark+modifyRemark);
							}else{
								$comboItem.find(".remark .remarkText").html('无'+modifyRemark);
							}
							if(renderType===1){
								$comboItem.find('.operateBtn').addClass('hide');
							}else{
								if(itemtt.sumtimes===-99){
									$comboItem.find('.operateBtn').removeClass('hide');
								}else if(itemtt.leavetimes===0){
									$comboItem.find('.operateBtn').addClass('hide');
								}else{
									$comboItem.find('.operateBtn').removeClass('hide');
								}
							}
							var leaveTimesStr='';
							if(itemtt.leavetimes===0){
								leaveTimesStr='已用完';
							}else if(itemtt.sumtimes===-99){
								leaveTimesStr='不限次';
							}else {
								leaveTimesStr='余'+itemtt.leavetimes+'次';
							}
							$comboItem.find('.right .times').html(leaveTimesStr);
							var $record=$comboItem.find('.right .record').attr('data-index',c).attr('data-name',itemtt.itemname);
							// if(itemtt.leavetimes < itemtt.sumtimes ){
							// 	// 还没用完
							// 	$record.addClass('enabled');
							// }else{
							// 	// 用完或者还没使用记录
							// 	$record.removeClass('enabled');
							// }
							$comboItem.data('comboItem',itemtt);
							$comboPackageUl.append($comboItem);
						}
						if(obj.goods && obj.goods.length){
							var goods=obj.goods;
							var $comboItemGoods=this.$comboItemGoods.clone(true,true);
							var $names=[];
							for(var g=0,glen=goods.length;g<glen;g++){
								var gitem=goods[g];
								var $name=$comboItemGoods.find('.left .name').clone(true,true).remove();
								$name.find('.nameText').text(gitem.depotName);
								$name.find('.totalTimes').text(' x'+gitem.num+(gitem.unit||''));
								// $name.text(gitem.depotName+' x'+gitem.num+(gitem.unit||''));
								$names.push($name)
							}
							$comboItemGoods.find('.radioBox ').remove();// 是否寄存先不做
							$comboItemGoods.find('.times').addClass('goodStock');
							$comboItemGoods.find('.left').html($names);
							$comboPackageUl.append($comboItemGoods);
						}
						$combolii.append($comboPackageUl);
						$comboul.append($combolii);
						$combolii.data("item", itemtt);
					}
					$comboWrapper.append($comboul);
					this.$comboList.append($comboWrapper);
				}
				this.comboScroll.refresh();
				this.comboScroll.scrollTo("top");
			}else{
				if(!$rightcombo.hasClass('empty')){
					$rightcombo.addClass('empty');
				}
			}
			//改日期(项目)
			this.$comboBox.find(".list .treatmentdateedit").mobiscroll().calendar({
				theme: 'mobiscroll',
				lang: 'zh',
				display: 'bottom',
				months: "auto",
				setOnDayTap: true,
				buttons: [],
				endYear: amGloble.now().getFullYear()+50,
				onSet: function (valueText, inst) {
					var _valueText = valueText.valueText;
					var _li = $(this).parents('.comboItem');
					var _item = _li.data('comboItem');
					var _d = {
						'itemId': _item.id,
						'validate': new Date(_valueText).getTime(),
						'oldDate': _item.validdate ? _item.validdate : '',
						'operator': amGloble.metadata.userInfo.userName,
						'shopId': amGloble.metadata.userInfo.shopId + '',
						'cardNo': _item.cardno
					};
					am.loading.show("修改中,请稍候...");
					am.api.invalidateUpdate.exec(_d, function (res) {
						am.loading.hide();
						console.log(res);
						if (res.code == 0) {
							var _date = new Date(_d.validate).format("yyyy.mm.dd");
							var dateStrPrefix='有效期至',
								dateStrSuffix='';
							if(am.now().getTime()>_d.validate*1 + 86400000 - 1000){
								dateStrPrefix='已于';
								dateStrSuffix='过期';
							}
							_li.find('.duedate').text(dateStrPrefix + _date+dateStrSuffix);

							_item.validdate = _d.validate;
							_li.data('item', _item);
							self.refreshComboData();
						} else {
							am.msg(res.message || "数据获取失败,请检查网络!");
						}
					});
				}
			});
		},
		refreshComboData: function () {
			var comboInfo = self.$userInfo.treatMentItems;
			var usedtreatMentItems = [], // 已使用 即用完
				validtreatMentItems = [],
				overDuetreatMentItems = []; // 已过期
			for (var n = 0, nlen = comboInfo.length; n < nlen; n++) {
				var itemn = comboInfo[n];
				// && itemn.isNewTreatment != 1
				// 已用完 存放已用完 不管是否过期
				if (itemn.leavetimes == 0) {
					usedtreatMentItems.push(itemn);
				}
				// 已过期 存放已过期 并且没用完的
				if (itemn.validdate && (am.now().getTime() > new Date((itemn.validdate*1 + 86400000 - 1000 + '').replace(/-/g, '/') - 0).getTime() && (itemn.leavetimes > 0 || itemn.leavetimes==-99))) {
					overDuetreatMentItems.push(itemn);
				}else if(itemn.leavetimes > 0 || itemn.leavetimes==-99){
					validtreatMentItems.push(itemn)
				}
			}
			self.$userInfo.usedtreatMentItems = usedtreatMentItems;
			self.$userInfo.overDuetreatMentItems = overDuetreatMentItems;
			self.$userInfo.validtreatMentItems = validtreatMentItems;
			// 重新渲染当前tab
			this.$comboTitTabWrap.find('.selected').trigger('vclick');
		},
		// 获取会员的cardTypeId,判断是否是散客
		getCardTypeInfo: function (cards) {
			var cardTypeId = "20151212",res={};
			for (var i = 0, len = cards.length; i < len; i++) {
				if (cards[i].cardtypeid != "20151212") {
					cardTypeId = cards[i].cardtypeid;
					break;
				}
			}
			res.cardTypeId=cardTypeId;
			res.cardNum=cards.length;
			return res;
		},
		renderRecord: function (clear) {
			if (clear) {
				this.recordIndex = 1;
			}
			self.getlistServiceData(function (res) {
				console.log(res);
				if (res.content && res.content.length) {
					self.$table.empty();
					for (var i = 0; i < res.content.length; i++) {
						var item = res.content[i];
						var allEmps = [];
						var server = {};
						var $html = $('<tr>' +
							'<td style="width:10%"><div class="tdwrap">' + (item.billno ? '<a href="javascript:;" class="billDetail am-clickable" data-billid="'+ item.id +'">' + item.billno + '</a>' : "--") + '</div></td>' +
							// '<td style="width:10%"><div class="tdwrap">' + (item.billno || "") + '</div></td>' +
							'<td style="width:9%"><div class="tdwrap price">￥' + (item.expense * 1 == 0 ? 0 : Math.round(item.expense*100)/100) + '</div></td>' +
							'<td style="width:33%"><div class="tdwrap addproject"></div></td>' +
							'<td style="width:14%"><div class="tdwrap">' + new Date(item.createDate).format((device2.ios() || device2.android())?"yyyy-mm-dd":"yyyy-mm-dd HH:MM") + '</div></td>' +
							// '<td style="width:9%"><div class="tdwrap consumptiontype"></div></td>' +
							// '<td style="width:11%"><div class="tdwrap">' + am.time2str(item.createDate / 1000) + '</div></td>' +
							'<td style="width:12%"><div class="tdwrap">' + self.getshopName(item.storeId) + '</div></td>' +
							'<td style="width:10%"><div class="tdwrap empName"></div><div class="otherEmps"></div></td>' +
							'<td style="width:6%"><div class="signature am-clickable" data-memberid="' + item.custId + '" data-storeid="' + item.storeId + '" data-billid="' + item.id + '">查看</div></td>' +
							'<td style="width:6%"><div class="comment am-clickable selected iconfont icon-comments"><span class="comment-content"></span></div></td>'+
							'</tr>').data("item", item);
						//消费类型
						// var $monetary = '';
						// var typeData = {0:"项目消费",1:"卖品消费",3:"套餐购买",4:"套餐消费",5:"年卡充值",7:"套餐赠送"};
						// if(typeData[item.expenseCategory]){
						// 	$monetary = typeData[item.expenseCategory];
						// }else{
						// 	if(item.expenseCategory==2){
						// 		if(item.consumeType==0){
						// 			//开卡充值
						// 			$monetary = '开卡充值';
						// 		}else{
						// 			//续卡充值
						// 			$monetary = '续卡充值';
						// 		}
						// 	}
						// 	if(item.expenseCategory==6){
						// 		if(item.consumeType==6){
						// 			//年卡销售
						// 			$monetary = '年卡销售';
						// 		}else{
						// 			//年卡消费
						// 			$monetary = '年卡消费';
						// 		}
						// 	}
						// }
						// if(item.debtBillId > 0){
						// 	$monetary += '(还款)';
						// }
						// $html.find(".consumptiontype").html($monetary);
						if (item.items && item.items.length) {
							var empAdd = false;
							for (var j = 0; j < item.items.length; j++) {
								var itemj = item.items[j];
								var $text = itemj.serviceItemName + (item.expenseCategory == 1 ? " x" + (itemj.num + " ") : "");
								if (
									(item.expenseCategory == 4 && itemj.consumeType == 1) || //套餐项目消费
									(item.expenseCategory == 6 && item.consumeType == -1 && itemj.consumeType == 4) //年卡项目消费
								) {
									$text = $text + (itemj.num + '次 ');
								} else {
									var p = am.cashierRound(itemj.price);
									var bonus = "";
									if (itemj.largess && itemj.largess > 0) {
										bonus = '(赠送金:' + itemj.largess + "元)";
									}
									$text = $text + " " + ((isNaN(p) ? itemsj.price : p) + '元' + bonus);
								}
								
								if (itemj && itemj.treatmentItemId  && itemj.treatmentItemId  > -1) {
									$text = "<span class='treatPackageName am-clickable'>" + $text + "</span>";
								}
								$html.find(".addproject").append($('<span>' + $text + '</span>').data('data',$.extend(itemj,{
									"billId":item.id,
								})));

								if(!empAdd && itemj.emps.length){
									$html.find('.empName').text(itemj.emps[0].empName);
									empAdd = true;
									server = itemj.emps[0];
								}
								allEmps = allEmps.concat(itemj.emps);
							}
						}
						if(empAdd){
							var otherEmps = self.getOtherEmpNames(allEmps,server);
							if(otherEmps.length){
								$html.find('.otherEmps').html(otherEmps.join(',')).parent().addClass('more am-clickable');
							}
						}
						if (item.expenseCategory == 0 || item.expenseCategory == 1 || (item.expenseCategory == 6 && item.consumeType == -1) || (item.expenseCategory == 4 && item.consumeType == -1)) {
							//expenseCategory=0 项目消费
							//expenseCategory=1 卖品消费
							//expenseCategory=6 && item.consumeType==-1 年卡项目消费
							//expenseCategory=4 && item.consumeType==-1 套餐项目消费
						} else {
							$html.find(".signature").addClass('am-disabled');
						}
						self.$table.append($html);
						self.$table.append('<tr class="comment-content"><td colspan="8"><div class="arrow"></div>'+(item.comment||'')+'</td></tr>');
						if(!item.comment){
							$html.find('.comment').addClass('am-disabled');
						}
						self.$recordBox.removeClass("cutting empty");
					}
				} else {
					self.$recordBox.removeClass("cutting").addClass("empty");
				}
				self.tableScroll.refresh();
				self.tableScroll.scrollTo("top");
				self.pager.refresh(self.recordIndex - 1, res.count);
				monitor.stopTimer('M11');
			});


		},
		renderPointRecordDom:function(clear) {
			// if (clear) {
			// 	this.pointIndex = 1;
			// }
			self.$pointBox.removeClass("default empty cutting").addClass("default");
			self.$pointBox.find('.table_head').hide()
			var	ms = new Date().format("yyyy-mm-dd");
			self.$pointSelSTime.mobiscroll().calendar({
				theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
				months: "auto",
				max:new Date(),
			    setOnDayTap: true,
				buttons: [],
				endYear: amGloble.now().getFullYear()+50,
			    onSet: function(valueText, inst) {
			        self.$pointSelSTime.val(new Date(valueText.valueText).format("yyyy-mm-dd"));
			    }
			});
			self.$pointSelSTime.val(ms);
			
			self.selectData.sel_point_cate = [
				{"name": '门店消费积分', "value": 1},
				{"name": '线上消费积分', "value": 2}
			];
			self.setSelect(self.selectData);
			self.$.on("vclick", ".check_btn.point", function () {
				var $started_T = self.$pointSelSTime.val(),
					$point_cate = self.getSelectValue().pointC;
				self.pointIndex = 1;
				self.renderPointSearchRes($started_T,$point_cate)
			})
		},
		renderCardCash:function(flag,callback){
			var T = new Date();
			var halfYear = 365 / 2 * 24 * 3600 * 1000;
			var pastResult = (T.getTime()) - halfYear;  
			var pastDate = new Date(pastResult);
			var	ms = pastDate.format("yyyy-mm-dd");
			self.$selSTime.mobiscroll().calendar({
				theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
				months: "auto",
				max:new Date(),
			    setOnDayTap: true,
				buttons: [],
				endYear: amGloble.now().getFullYear()+50,
			    onSet: function(valueText, inst) {
			        self.$selSTime.val(new Date(valueText.valueText).format("yyyy-mm-dd"));
			    }
			});
			self.$selSTime.val(ms);
			self.getMemberData(function(res){
				self.selectData.sel_member_card = [];
				var memberName = res.content.cards;
				for(var i = 0; i < memberName.length; i++) {
					self.selectData.sel_member_card.push({"name":memberName[i].cardtypename,"value": memberName[i].id });
				}
				self.setSelect(self.selectData);
				callback && callback();
			});
			self.$.find(".card_cash .table_detail").hide();
			var tip_html = $('<div class="tip_box"><div>');    
			self.$.find(".card_cash").append(tip_html);   
			self.$.find(".card_cash .empty_box").remove(); 
			self.$.find(".cardCashPage").hide();
		},
		renderarrears:function(clear){
			if (clear) {
				this.arrearsIndex = 1;
			}
			self.getArrearsData(function(res){
				self.$.find(".arrears_table_detail").empty();
				self.$.find(".arrears_table .empty_box").remove();
				if (res.content && res.content.length) {
					self.$.find(".arrears_table thead").show();
					for (var i = 0; i < res.content.length; i++) {
						var item = res.content[i];
						var $html = $(
							'<tr>' +
								'<td>' + item.billNO + '</td>' +
								'<td>' + (self.changeArrearMode(item.type)?self.changeArrearMode(item.type):"--") + '</td>' +
								'<td>¥' + (item.debtFee).toFixed(1) + '</td>' +
								'<td>' + new Date(item.debtTime).format("yyyy-mm-dd HH:MM") + '</td>' +
								'<td class="unpay">¥' + (item.remainFee).toFixed(2) + '</td>' +
								'<td>' + item.operatorname + '</td>' +
								'<td>' +
									'<span class="reimbursement_btn am-clickable">还款</span>' +
								'</td>' +
							'</tr>'
						)
						$html.data("data",item);
						self.$.find(".arrears_table .arrears_table_detail").append($html);
					}
				} else {
					self.$.find(".arrears_table thead").hide();
					self.$.find(".arrears_table").append($('<div class="empty_box"><div class="empty_box_image"></div></div>'));
				}
				self.pager1.refresh(self.arrearsIndex - 1, res.count);
			})
		},
		// 撤回红包
		revokeRedPocket: function ($dom, data) {
			var userInfo = am.metadata.userInfo;
			var opt = {
				parentShopId: userInfo.parentShopId,
				shopId: userInfo.shopId,
				luckyMoneyId: data.id,
				status: 5,
				memId: self.$memberInfo.id,
				memName: self.$memberInfo.name
			};
			am.loading.show("红包撤回中，请稍候...");
			am.api.revokeRedPocket.exec(opt, function (res) {
				am.loading.hide();
				console.log(res);
				if (res.code == 0) {
					// $dom.remove();
					// var $total = self.$redPocketBox.find('.note .total');
					// $total.text(parseInt($total.text().trim()) - 1 + '个');
					am.msg('红包撤回成功');
					self.renderRedPocketsTable();
				} else {
					// am.msg(res.message || "数据获取失败,请检查网络!");
					am.confirm('撤回失败', res.message, '重试', '取消', function () {
						self.revokeRedPocket($dom, data)
					});
				}
			});
		},
		// 核销红包
		verificationRedPocket: function ($dom, data) {
			console.log('data', data);
			var outRule = JSON.parse(data.rule || "{}");
			var rule = JSON.parse((outRule && outRule.content && outRule.content.rule) || "{}");
			if (rule.startTime && (rule.validitymode == 1)) {
				if (new Date().getTime() < new Date(rule.startTime).getTime()) {
					am.msg('未到可核销时间');
					return;
				};
			}
			if (data.opentime && (rule.validitymode == 0)) {
				if ((new Date().getTime() - data.opentime) < rule.days * 86400000) {
					am.msg('未到可核销时间');
					return;
				}
			}
			var opt = {
				parentShopId: am.metadata.userInfo.parentShopId,
				shopId: am.metadata.userInfo.shopId,
				luckyMoneyId: data.id,
				status: 3,
				memId: self.$memberInfo.id,
				memName: self.$memberInfo.name
			};
			am.loading.show("红包核销中，请稍候...");
			am.api.verificationRedPocket.exec(opt, function (res) {
				am.loading.hide();
				console.log(res);
				if (res.code == 0) {
					$dom.hide().prev().text('已使用').css('color', '#222');
					am.msg('红包核销成功');
				} else {
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		//获取红包规则
		getLuckyMoneyConfig: function(pocketInfo,rule){
			var mallTip = ''; // 商城抵扣
			var _rule = rule.content && rule.content.rule ? rule.content.rule : "";
			if(_rule){
				rule = JSON.parse(_rule);
			}else{
				//另一种content为string的情况(后台红包规则不统一)
				if(typeof rule.content === "string"){
					_rule = JSON.parse(rule.content);
					rule = _rule.rule;
				}else{
					return '';
				}
			}
			
			if (rule && rule.luckyMoneyRule && rule.luckyMoneyRule.enableMallPay ) { // 启用商城抵扣
				var allowMallPay=rule.luckyMoneyRule.allowMallPay;
				if(allowMallPay.orderAmountFlag){
					mallTip += '订单金额满'
						+ rule.luckyMoneyRule.allowMallPay.orderAmount
						+ '可用，';
				}
				if (allowMallPay.enableItems) {
					mallTip += "指定商品"
					var items = rule.luckyMoneyRule.allowMallPay.items;
					for (var index = 0; index < items.length; index++) {
						var item = items[index];
						if(index==items.length-1){
							mallTip += '<span class="red">'+item.name+"</span>";
						}else{
							mallTip += '<span class="red">'+item.name + "、</span>";
						}
					}
					mallTip += '可用，';
				}
				if(mallTip.length>0){
					mallTip= '商城抵扣：' + mallTip.substr(0,mallTip.length-1);	
				}else{
					mallTip = '商城可用';
				}
			} 
			var itemTip = ''; // 项目抵扣
			if (rule && rule.luckyMoneyRule && rule.luckyMoneyRule.enableCashierPay) { // 启用项目抵扣
				var allowCashierPay=rule.luckyMoneyRule.allowCashierPay;
				var itemsStr=am.sendRedPocketsDialog.getItemsStr(allowCashierPay);
				var treatsStr=am.sendRedPocketsDialog.getTreatsStr(allowCashierPay);
				var depotsStr=am.sendRedPocketsDialog.getDepotsStr(allowCashierPay);
				var itemsAndTreatsStr='';
				if(itemsStr.indexOf('全部项目可用')>-1 && treatsStr.indexOf('全部套餐包可用')>-1 && depotsStr.indexOf('全部卖品可用')>-1){
					itemsAndTreatsStr='店内消费可用，';
				}else{
					itemsAndTreatsStr=itemsStr+treatsStr+depotsStr;
				}
				var textObj = {};
                    textObj.subtract = allowCashierPay.consumptionAmountFlag && allowCashierPay.consumptionAmount ? '满' + allowCashierPay.consumptionAmount + '元可以抵扣现金，' : '';
                    textObj.memCard = allowCashierPay.memCard ? '仅允许散客使用（仅未在门店或线上办卡/充值/购买套餐的顾客使用），' : '';
					textObj.otherRedPackage = allowCashierPay.otherRedPackage ? '禁止同时使用其它红包，' : '';
				itemTip = '店内消费：' + textObj.subtract + textObj.memCard + textObj.otherRedPackage + itemsAndTreatsStr;
				if(itemTip.lastIndexOf('，')===itemTip.length-1){
					itemTip = itemTip.substring(0,itemTip.length-1);
				}
			}
			var text = '';
			if(itemTip && mallTip){
				if(mallTip.lastIndexOf('，')===itemTip.length-1){
					mallTip = mallTip.substring(0,mallTip.length-1);
				}
				text = mallTip + '</br>' + itemTip;
			}
			else if(itemTip){
				text = itemTip;
			}
			else if(mallTip){
				text = mallTip;
			}
			if(itemTip && itemTip.length>0){
				text+=self.getAppShops(pocketInfo);
			}
			return text;
		},
		getAppShops:function(item){
			var shopText="";
			if(amGloble.metadata.userInfo.shopType==1){
				// 单店
				return shopText;
			}else if(item && item.appShopInfo){
				var appShopInfo=JSON.parse(item.appShopInfo);
				if(appShopInfo){
					// if(appShopInfo.chosenShop==2){
					// 	// 指定门店可用
					// 	var shopMap = amGloble.metadata.shopMap,
					// 		checkedDirectShops = appShopInfo.checkedDirectShops,
					// 		checkedIndirectShops = appShopInfo.checkedIndirectShops;
					// 	if (shopMap && checkedDirectShops) {
					// 		// 直属
					// 		for (var i = 0,dlen = checkedDirectShops.length; i < dlen; i++) {
					// 			if(shopMap[checkedDirectShops[i]] && shopMap[checkedDirectShops[i]].osName){
					// 				shopText += shopMap[checkedDirectShops[i]].osName + ',';
					// 			}
					// 		}
					// 	}
					// 	if (shopMap && checkedIndirectShops) {
					// 		// 附属
					// 		for (var j = 0, ilen = checkedIndirectShops.length; j < ilen; j++) {
					// 			if(shopMap[checkedIndirectShops[j]] && shopMap[checkedIndirectShops[j]].osName){
					// 				shopText += shopMap[checkedIndirectShops[j]].osName + ',';
					// 			}
					// 		}
					// 	}
					// 	shopText = '指定门店可用：' + shopText.substring(0, shopText.length - 1); // 去掉最后的,
					// }else if(appShopInfo.chosenShop==1){
					// 	// 仅在发送门店可用
					// 	if(appShopInfo.currentShop){
					// 		shopText+=appShopInfo.currentShop.osName;
					// 	}else{
					// 		shopText;
					// 	}
					// }else{
					// 	// 全部门店可用
					// 	 shopText="全部门店可用";
					// }
					shopText=am.sendRedPocketsDialog.getShopsStr(appShopInfo);
					if(shopText.indexOf('仅在发送门店可使用')>-1 && appShopInfo.currentShop){
						shopText ='指定门店可使用：' + appShopInfo.currentShop.osName;
					}
					return '</br>'+'<span>'+shopText+'</span>';
				}
			}else{
				return shopText;
			}
		},
		//获取及渲染红包列表
		renderRedPocketsTable:function () {
			if (am.metadata.configs.privateSendRed && JSON.parse(am.metadata.configs.privateSendRed).enableCashierAndAdmin == true && am.metadata.userInfo.mgjVersion === 3) {
				self.$redPocketBox.find('.btnBox').show();
			} else {
				self.$redPocketBox.find('.btnBox').hide();
			}
			if(self.$redPocketBox.find(".radioBox .iconfont").hasClass("icon-checkbox")){
				var status = "1,2";
			}
			var $metadata = am.metadata;
			var $data = this.$data;
			am.loading.show("正在获取数据,请稍候...");
			am.api.getLuckyMoney.exec({
				"pageNumber":self.redPocketsIndex-1,
				"pageSize": 15,
				"status": status,
				// "shopId": $data.shopId,// || am.metadata.userInfo.shopId
				"memId": $data.customerId,
				"parentShopId": $metadata.userInfo.parentShopId
			}, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					var content=res.content;
					var $contentBox=self.$redPocketBox.find('.redPocketContent').children('.content'),
						$emptyBox=self.$redPocketBox.find('.redPocketContent').children('div.empty');
						console.log('红包',content)
						self.$redPocketsTbody.empty();
						// 渲染统计信息
						var count=res.count||0, 
						usedNo=res.usedNo||0,
						usedRate=0,tempInterval=res.interval;
						if(tempInterval){
							tempInterval=Math.floor((tempInterval)*100)/100;
						}
						var interval=tempInterval?tempInterval+'天':'--';
						if (usedNo > 0 && count > 0) {
							usedRate = Math.floor((usedNo / count) * 10000) / 100;
						}
						var $note=self.$redPocketBox.find('.note');
						$note.find('.total').text(count+'个');
						$note.find('.used').text(usedNo+'个');
						$note.find('.usedRate').text(usedRate+'%');
						$note.find('.interval').text(interval);
		
						if (content && content.length) {
							$contentBox.show();
							$emptyBox.hide();
							self.$redPocketsTbody.empty();
							var total=content.length;
							for (var i = 0; i < total; i++) {
								var item = content[i];
								var name='';
								if(item.templateId){
									name=item.templateName||"--";
								}else{
									name="--";
								}
								var source='';
								if(item.activityId){
									source=item.activityTitle||"--";
								}else{
									source=item.senderName?item.senderName:"--";
								}
								
								if(item.rule){
									var during="";
									var rule=JSON.parse(item.rule);
									if(rule && rule.content){
										var startTime=(rule.content.startTime && new Date(rule.content.startTime).format('yyyy-mm-dd'))||"";
										var endTime=(rule.content.endTime && new Date(rule.content.endTime).format('yyyy-mm-dd'))||"";
										if(startTime && endTime){
											during=startTime+' 至 '+endTime;
										}
										if(rule.content.rule){
											var innerRule=JSON.parse(rule.content.rule);
											if(innerRule && innerRule.validitymode && innerRule.validitymode==1){
												startTime=(innerRule.startTime && new Date(innerRule.startTime).format('yyyy-mm-dd'))||"";
												endTime=(innerRule.endTime && new Date(innerRule.endTime).format('yyyy-mm-dd'))||"";
												if(startTime && endTime){
													during=startTime+' 至 '+endTime;
												}
											}
										}
									}
								}
								var $html = $('<tr>' +
									'<td style="width:19%" class="activityTitleTd am-clickable"><div class="tdwrap">' + name + '</div></td>' +
									'<td style="width:10%;" class="moneyTd"><div class="tdwrap ">' + (item.money ? '￥' + item.money : (item.discount ? item.discount + '折' : "-")) + '</div></td>' +
									// '<td style="width:10%"><div class="tdwrap">' + (item.status==1?'未拆开':(item.money?'￥'+item.money:(item.discount?item.discount+'折红包':'无'))) + '</div></td>' +
									'<td style="width:10%"><div class="tdwrap">' + (item.billMoney?item.billMoney:'无') + '</div></td>' +
									'<td style="width:15%"><div class="tdwrap">' + self.getLuckyMoneyStatus(item) + '</div></td>' +
									'<td style="width:15%"><div class="tdwrap">' +(during?during:item.expiretime?new Date(item.expiretime-0).format("yyyy-mm-dd HH:MM"):'无') + '</div></td>' +
									'<td style="width:12%"><div class="tdwrap">' + (item.createtime?am.time2str(item.createtime/1000):'无') + '</div></td>' +
									'<td style="width:19%"><div class="tdwrap textBox">' + source + '</div></td>' +
									'</tr>').data("item", item);
									//无规则删除三角
									if(!item.rule){
										$html.find(".activityTitleTd").removeClass("activityTitleTd");
									}
									if(!item.money && !item.discount){
										$html.find(".moneyTd").css("color","#222");
									}
									// 是否可以核销
									var outRule={},innerRule={};
								if (item.rule) {
									outRule = JSON.parse(item.rule);
									innerRule = JSON.parse((outRule && outRule.content && outRule.content.rule) || "{}");
									if(innerRule){
										if (innerRule.startTime && (innerRule.validitymode == 1)) {
											if (new Date().getTime() < new Date(innerRule.startTime).getTime()) {
												$html.find('.verificationBtn').addClass('disable');
											};
										}
										if(innerRule.luckyMoneyRule){
											if(innerRule.luckyMoneyRule.enableMallPay && !innerRule.luckyMoneyRule.enableCashierPay){
												$html.find('.verificationBtn').addClass('disable');
											}
										}
									}
									if (item.opentime && (innerRule.validitymode == 0)) {
										if ((new Date().getTime() - item.opentime) < innerRule.days * 86400000) {
											$html.find('.verificationBtn').addClass('disable');
										}
									}
								}
								// 校验红包是否可以在当前门店核销
								var rule = JSON.parse(item.rule);
								var appShopInfo =JSON.parse(item.appShopInfo) || ((rule && rule.content && rule.content.appShopInfo) || '');
								var currentShopId = amGloble.metadata.userInfo.shopId;
								var disabled = 1; // 1 不可使用 0 可以使用
								console.log('appShopInfo', appShopInfo);
								if (currentShopId && appShopInfo) {
									if (appShopInfo.chosenShop == 1 && appShopInfo.currentShop) {
										// 仅发送门店可用
										if (appShopInfo.currentShop.id == currentShopId) {
											// 可用
											disabled = 0;
										} else { }
									} else if (appShopInfo.chosenShop == 2) {
										// 指定门店可用
										var avaliable = 0;
										var shopType = amGloble.metadata.userInfo.shopType;
										if(shopType==2){
											// 直属
											avaliable = am.checkShopAvailable({
												shopIdsStr: appShopInfo.checkedDirectShops.toString(),
												targetShopId: currentShopId
											});
										}else if(shopType==3){
											// 附属
											avaliable = am.checkShopAvailable({
												shopIdsStr: appShopInfo.checkedIndirectShops.toString(),
												targetShopId: currentShopId
											})
										}
										// for (var m = 0, dlen = appShopInfo.checkedDirectShops.length; m < dlen; m++) {
										// 	var ditem = appShopInfo.checkedDirectShops[m];
										// 	if (ditem == currentShopId) {
										// 		avaliable = 1;
										// 		break;
										// 	}
										// }
										// for (var n = 0, ilen = appShopInfo.checkedIndirectShops.length; n < ilen; n++) {
										// 	var iitem = appShopInfo.checkedIndirectShops[n];
										// 	if (iitem == currentShopId) {
										// 		avaliable = 1;
										// 		break;
										// 	}
										// }
										disabled = !avaliable;
									} else {
										// 全部门店可用
										disabled = 0;
									}
								} else {
									disabled = 0;
								}
								if (disabled) {
									$html.find('.verificationBtn').addClass('disable');
								}
								self.$redPocketsTbody.append($html);
							}
						} else{
							//没有红包
							$contentBox.hide();
							$emptyBox.show();
						}
						self.$redPocketBoxScroll.refresh();
						self.$redPocketBoxScroll.scrollTo("top");
						self.redPocketsPager.refresh(self.redPocketsIndex-1,res.count);
				} else {
                    am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		//获取红包状态
		getLuckyMoneyStatus: function(item){
			var status=item.status,      // 状态
				expiretime=item.expiretime, // 过期时间
				createtime=item.createtime;// 发送时间
			var str = "",color = "";
			//-1已过期,1未拆开,2已经拆开,3已使用,4 已支付，未绑定流水单,5 已撤回
			if(status == -1){
				str = "已过期";
				color = "#ccc";
			}else if(status == 1){
				str = "未拆开";
				color = "#E82742";
				if(expiretime-0 < new Date().getTime()){
					str = "已过期";
					color = "#ccc";
				}
			}else if(status == 2){
				str = "未使用";
				color = "#4DB27A";
				if(expiretime-0 < new Date().getTime()){
					str = "已过期";
					color = "#ccc";
				}
			}else if(status == 3){
				str = "已使用";
				color = "#222";
				if(expiretime-0 < new Date().getTime()){
					str = "已过期";
					color = "#ccc";
				}
			}else if(status == 4){
				str = "已支付";
				color = "#222";
				if(expiretime-0 < new Date().getTime()){
					str = "已过期";
					color = "#ccc";
				}
			}
			var $span = "<span style='color:" + color + "'>" + str + "</span>";
			if(str=='未使用'){
				$span+='<span class="verificationBtn am-clickable">核销</span>';
			}
			if(createtime && str == '未拆开' && !item.activityId){
				// 24小时内 未拆开 的私发红包可以撤回
				var during=am.now().getTime()-createtime;
				if(during<86400000){
					$span+='<span class="revokeBtn am-clickable">撤回</span>';
				}
			}
			return $span;
		},
		renderReservation: function(){
			this.$reservationInner.empty();
			this.$reservationEmpty.hide();
			am.loading.show("正在获取数据,请稍候...");
			am.api.queryMemberReservation.exec({
				custId: self.$memberInfo.id,
				shopId: self.$memberInfo.shopid,
			}, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					self.renderReservationData(res.content);
				} else {
                    am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		offReservationReject:function(){
			am.loading.show("正在请求数据,请稍候...");
			am.api.offReservationReject.exec({
				memId: self.$memberInfo.id,
				shopId: self.$memberInfo.shopid,
			}, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					am.msg('开启成功');
					self.$reservationBox.find('.openReservationTip').hide();
					self.$reservationList.addClass('rights');
					self.$redPocketBoxScroll.refresh();
					self.$memberInfo.reservationReject = 0;
				} else {
                    am.msg(res.message || "操作失败,请检查网络!");
				}
			});
		},	
		renderReservationData: function(data){
			if(data && data.length){
				data.sort(function(a,b){
					return b.reservationTime - a.reservationTime;
				});
				for(var i=0;i<data.length;i++){
					var $item = this.$reservationItem.clone(true,true);
					$item.find('.time').text(new Date(data[i].reservationTime).format('yyyy-mm-dd HH:MM'));
					$item.find('.baber').text(data[i].empName);
					$item.find('.service').text(this.getReservationServices(data[i]));
					var status = this.getReservationStatus(data[i]);
					$item.find('.status1').text(status.text).addClass(status.class);
					status.isNormal=='1'?$item.find('.status2').hide():$item.find('.status2').show();
					var emp = amGloble.metadata.empMap[data[i].empId];
                    var updateTs = '';
                    if(emp && emp.mgjUpdateTime){
                        updateTs = new Date(emp.mgjUpdateTime).getTime();
                    }
					$item.find('.header').html(amGloble.photoManager.createImage("artisan", {
						parentShopId: amGloble.metadata.userInfo.parentShopId,
						updateTs: updateTs
					}, data[i].empId + ".jpg", "s"));
					this.$reservationInner.append($item);
				}
				this.$reservationScroll.refresh();
				this.$reservationScroll.scrollTo('top');
			}else {
				this.$reservationEmpty.show();
			}
		},
		getReservationServices:function(item){
			if(!item.itemProp){
				return '--';
			}
			var html = '';
			var items = JSON.parse(item.itemProp).items;
			for (var key in items) {
				html += items[key].name+',';
			}
			var packages = JSON.parse(item.itemProp).packages;
			for (var key in packages) {
				html += packages[key].serviceItemName+',';
			}
			return html.substring(0,html.length-1);
		},
		getReservationStatus:function(item){
			if(item.status==1){
				return {
					text: '已到店',
					class: 'status_1',
					isNormal:'1'
				};
			}else if(item.status==2){
				return {
					text: '已取消',
					class: 'status_2',
					isNormal:'1'
				};
			}else if(item.status==3){
				return {
					text: '已结算',
					class: 'status_3',
					isNormal:'1'
				};
			}else if(item.status==4) {
				return {
					text: '已逾期',
					class: 'status_0_1',
					isNormal:'0'
				};
			}else {
				if (item.itemProp) {
                    var newD = new Date(item.reservationTime);
                    var strategy = am.metadata.configs.strategy;
                    var itemProp = JSON.parse(item.itemProp)
                    var time = parseInt(itemProp.times);
                    if (strategy == "0") { //半小时
                        newD.setTime(newD.setHours(newD.getHours() + 0.5 * (time - 1)));
                    } else { //1小时
                        newD.setTime(newD.setHours(newD.getHours() + 1 * (time - 1)));
                    }
                    if (am.now().getTime() > item.reservationTime && am.now().getTime() > newD.getTime()) {
                        //已逾期
						return {
							text: '已逾期',
							class: 'status_0_1',
							isNormal:'0'
						};
                    } else {
                        //预约中
						return {
							text: '已预约',
							class: 'status_0_2',
							isNormal:'1'
						};
                    }
                } else {
                    if (am.now().getTime() > item.reservationTime) {
                        //已逾期
                        return {
							text: '已逾期',
							class: 'status_0_1',
							isNormal:'0'
						};
                    } else {
                        //预约中
                        return {
							text: '已预约',
							class: 'status_0_2',
							isNormal:'1'
						};
                    }
                }
			}
		},
		//获取下拉菜单的值
		getSelectValue:function(){
			var Select=self.Select;
			var res={};
			var key={
				sel_point_cate:"pointC",
				sel_member_card:"memberC"
			};
			for(var i in Select){
				res[key[i]]=Select[i].getValue();
			}
			return res;
		},
		//转换TA的欠款type类型
		changeArrearMode:function(data){
			var type_m = "";
			switch (data) {
				case 1:
					type_m = "项目消费";
					break;
				case 2:
					type_m = "充值";
					break;
				case 3:
					type_m = "卖品";
					break;
				case 4:
					type_m = "购买套餐";
					break;
				case 5:
					type_m = "购买年卡项目";
					break;
			}
			return type_m;
		},
		//转换卡金变动流水type类型
		changeMode:function(data,data1){
			var type_num = "";
			switch (data) {
				case 0:
					type_num = "项目消费";
					break;
				case 1:
					type_num = "购买卖品";
					break;
				case 2:
					type_num = "开卡";
					break;
				case 3:
					type_num = "购买套餐";
					break;
				case 4:
					type_num = "套餐充值";
					break;
				case 5:
					type_num = "项目消费";
					break;
				case 6:
					type_num = "年卡充值";
					break;
				case 7:
					type_num = "年卡销售";
					break;
				case 8:
					type_num = "转账转入";
					break;
				case 9:
					type_num = "转账转出";
					break;
				case 10:
					type_num = "卡调账";
					break;
				case 11:
					type_num = "导入";
					break;
				case 12:
					type_num = "删除";
					break;
				case 13:
					type_num = "恢复";
					break;
				case 14:
					type_num = "扣除信息费";
					break;
				case 15:
					type_num = "失效套餐转利润";
					break;
				case 16:
					type_num = "购买套餐-成本";
					break;
				case 17:
					type_num = "卡转账转入年卡";
					break;
				case 18:
					type_num = "退套餐转入";
					break;
				case 19:
					type_num = "年卡卡金消费";
					break;
				case 20:
					type_num = "欠款买套餐";
					break;
				case 31:
					type_num = "卡调账";
					break;
				case 32:
					type_num = "调整会员所属门店";
					break;
				case 33:
					type_num = "自助充值";
					break;
				case 34:
					type_num = "保证金缴纳";
					break;
				case 35:
					type_num = "保证金退款";
					break;
				case 88:
					type_num = "特权卡开通续期";
					break;
				case 99:
					type_num = "商城卡金支付";
					break;
			}
			return type_num;
		},
		getRepayOption:function(payVal,debtlog){
			// var msg = "会员"+this.$memberInfo.name+"(手机号:"+debtlog.mobile+",卡号:"+debtlog.cardid+",单号:"+(debtlog.billNO||"--")+",类别:"+this.changeArrearMode(debtlog.type)+")还款";
			var msg = this.changeArrearMode(debtlog.type)+"还款(单号:"+(debtlog.billNO||"--")+")";
			return {
				"shopId":am.metadata.userInfo.shopId,
				"parentShopId":am.metadata.userInfo.realParentShopId,
				"content":msg,
				"debtLogId":debtlog.id,
				"debtFee":debtlog.debtFee,
				"type":debtlog.type,
				"remainFee":debtlog.remainFee,
				"repayFee":payVal*1||0,
				"operatorId":am.metadata.userInfo.userId,
				"memberid": this.$memberInfo.id,
				"membername": this.$memberInfo.name,
				"debtFlag": debtlog.debtFlag,
				"bill": debtlog.bill,
				"billDetails": debtlog.billDetails,
				"cards": debtlog.cards,
            	"cashs": debtlog.cashs
			};
		},
		repay:function($tr){
			var data = $tr.data('data'),_this=this;
			if(data.type==5){
				atMobile.nativeUIWidget.showMessageBox({
					title: "计次卡/年卡",
					content: '小掌柜暂不支持【年卡】,请使美管加用收银系统还款!'
				});
				return;
			}
			if((data.shopId || data.shopid) != amGloble.metadata.userInfo.shopId){
				amGloble.msg('不可跨店还款');
				return;
			}
			
			if(data.debtFlag==1){
				$.am.changePage(am.page.addIncome,'slideup',this.getRepayOption(0,data));
			}else {
				if(data.type == 1 || data.type==3){
					// am.keyboard.show({
					//     "title":"请确定还款金额，此操作将产生营业外收入",
					//     "submit":function(value){
					//         if(!value || value>data.remainFee){
					//             am.msg('请输入正确的还款金额！');
					//             am.keyboard.$dom.find(".input_value").text("");
					//             am.keyboard.value='';
					//             return 1;
					//         }
							
					//         am.loading.show();
					//         am.api.repayDebt.exec(_this.getRepayOption(value*1||0,data),function(ret){
					//             am.loading.hide();
					//             if(ret && ret.code==0){
					// 				self.renderarrears();
					//                 am.msg('还款完成，已产生营业外收入！');
					//             }else if(ret.code == -1){
					//                 am.msg('网络异常，请检查网络后重试');
					//             }else{
					//                 am.msg('还款失败！');
					//             }
					//         });
					//     }
					// });
					// am.keyboard.$dom.find(".input_value").text(data.remainFee);
					// am.keyboard.value=data.remainFee+'';
					$.am.changePage(am.page.addIncome,'slideup',this.getRepayOption(0,data));
				}else{
					am.loading.show();
					am.api.queryMemberById.exec({
						memberid:data.memberId
					},function(ret){
						console.log(ret);
						am.loading.hide();
						if(ret && ret.code==0 && ret.content && ret.content.length){
							var cards = [];
							for(var i=0;i<ret.content.length;i++){
								if(ret.content[i].cardtype==1){
									cards.push(ret.content[i]);
								}
							}
							if(cards.length==1){
								_this.gotoRecharge(data,cards[0]);
							}else{
								var arr = [];
								for(var i=0;i<cards.length;i++){
									arr.push({
										name:cards[i].cardName + ' (余额:￥'+ (cards[i].balance )+')',
										data:cards[i]
									});
								}
								_this.popupMenu(arr,data);
							}
						}else{
							am.msg('客户资料读取失败！');
						}
					});
				}
			}
		},
		popupMenu: function(arr,data){
			var self = this;
			am.popupMenu("请选择会员卡进行还款充值",arr, function (memberdata) {
				if(!memberdata) return;
				var member = memberdata.data || {};
				if (!(member.allowkd-0) && member.shopId != am.metadata.userInfo.shopId) {
					am.msg('此会员卡不允许跨店消费！');
					self.popupMenu(arr,data);
					return;
				}
				self.gotoRecharge(data,member);
			});
		},
		gotoRecharge:function(debt,member){
			if (!(member.allowkd-0) && member.shopId != am.metadata.userInfo.shopId) {
				am.msg('此会员卡不允许跨店消费！');
				return;
			}
			if(member.cardtype==1 && (member.timeflag==1 || member.timeflag==3)){
				//计次卡
				atMobile.nativeUIWidget.showMessageBox({
					title : "计次卡/年卡",
					content : '小掌柜暂不支持【计次卡】与【年卡】还款，请在收银台中操作！'
				});
			}else{
				//充值
				$.am.changePage(am.page.pay, "slideup",{
					action:"recharge",
					debt:debt,
					member:member
				});
			}
		},
		//初始化下拉菜单
		setSelect:function(selectData){
			var $dom_point=this.$.find(".pointBox .point_box")
			$dom_point.find('.sel_point_cate').empty()
			var $dom_card=this.$.find(".cardCashBox .cardCash_box")
			$dom_card.find('.sel_member_card').empty()
			var $domObj = {
				'sel_point_cate': $dom_point,
				'sel_member_card': $dom_card
			}
			this.Select={};
			for(var i in selectData){
				this.Select[i]=new $.am.Select({
					$: $domObj[i].find("."+i),
					startWidth:0,
					data:selectData[i],
					key:i,
					vclickcb:function(key){
						for(var j in self.selectData){
							if(key != j){
								self.Select[j].hide(true);
							}
						}
					}
				});
			}
		},
		getOtherEmpNames:function(allEmps,server){
			var empIds = [];
			var emps = [];
			for(var i=0;i<allEmps.length;i++){
				if(empIds.indexOf(allEmps[i].empid)==-1){
					empIds.push(allEmps[i].empid);
					emps.push(allEmps[i]);
				}
			}
			for(var i=0;i<emps.length;i++){
				if(emps[i].empid==server.empid){
					emps.splice(i,1);
				}
			}
			var empNames = [];
			for(var i=0;i<emps.length;i++){
				empNames.push(emps[i].empName);
			}
			return empNames;
		},
		getLength: function (str) {
			return String(str).replace(/[^\x00-\xff]/g, 'aa').length;
		},
		mySubStr: function (str, num) {
			var k = 0;
			var temp = '';
			for (var i = 0; i < str.length; i++) {
				var s = str.charAt(i);
				k += this.getLength(s);
				if (k > num) {
					break;
				}
				temp += str.charAt(i);
			}
			;
			return temp;
		},
		// 修改顾客门店积分权限
		getModifyPointAccess:function(){
			return am.operateArr.indexOf('I')>-1;
		},
		renderUserInfo: function (data) {
			var self = this;
			if (data.content) {
				if(am.operateArr.indexOf("MGJP") !=-1){
					// var mobile = self.$userInfo.mobile.replace(/\d{4}$/,"****");
					var mobile = self.$userInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');// 手机号改为隐藏中间四位
				}
				var memberInfo = data.content.memberInfo,
					mgjwebactivated = memberInfo.mgjwebactivated,//是否开通微信
					mgjappactivated = memberInfo.mgjappactivated;//是否下载app
				this.$leftBox.data('item', memberInfo);
				if(memberInfo.mgjIsHighQualityCust == 1){
					this.mgjIsHighQualityCust = 1;
					this.$leftBox.find('.header').addClass("good");
				}else{
					this.$leftBox.find('.header').removeClass("good");
					this.mgjIsHighQualityCust = 0;
				}
				
				var lastconsumetime = self.$userInfo.lastconsumetime || self.$userInfo.lastConsumeTime;
				if(am.isMemberLock(lastconsumetime, self.$userInfo.locking)){
					this.$.find(".memberLock").removeClass('on');
					this.$leftBox.find('.header').addClass("lock");
				}else{
					this.$.find(".memberLock").addClass('on');
					this.$leftBox.find('.header').removeClass("lock");
				}

				if(memberInfo.reservationReject*1){
					this.$reservationBox.find('.openReservationTip').show();
					this.$reservationList.removeClass('rights');
				}else {
					this.$reservationBox.find('.openReservationTip').hide();
					this.$reservationList.addClass('rights');
				}

				this.$leftBox.find(".header_box").html(am.photoManager.createImage("customer", {
					parentShopId: am.metadata.userInfo.parentShopId,
					// updateTs: new Date().getTime()
					updateTs: memberInfo.lastphotoupdatetime || new Date().getTime()
				}, memberInfo.id + ".jpg", "s",memberInfo.photopath||'')).end().find(".name .username").text(memberInfo.name).end()
					.find(".mobile").text(mobile).end()
					.find(".shops").text(self.getshopName(memberInfo.shopid) || "");
					this.$leftBox.find(".header_box img").addClass('am-clickable');

				if (memberInfo.page) {
					if (this.getLength(memberInfo.page) > 88) {
						this.$leftBox.find(".remarks").data('remarks', memberInfo.page).html(self.mySubStr(memberInfo.page, 88) + '...' + '<a href="javascript:;" class="more am-clickable">更多</a><a href="javascript:;" class="edit am-clickable">修改</a>');
					} else {
						this.$leftBox.find(".remarks").data('remarks', memberInfo.page).html(memberInfo.page + '<a href="javascript:;" class="edit am-clickable">修改</a>');
					}
				}
				this.toggleClass('wx',mgjwebactivated);
				this.toggleClass('myk',mgjappactivated);
				if(memberInfo.notifysms==1){
					this.$notifySms.addClass('on');
				}else {
					this.$notifySms.removeClass('on');
				}
				if(memberInfo.deductsmsfeeflag==1){
					this.$deductSmsFeeFlag.addClass('on');
				}else {
					this.$deductSmsFeeFlag.removeClass('on');
				}

				if (memberInfo.sex == "F") {
					this.$leftBox.find(".name .ico").addClass('womanico');
				} else {
					this.$leftBox.find(".name .ico").removeClass('womanico');
				}
				var $list = this.$leftBox.find(".listbox .list li");
				$list.eq(0).find(".value").text((memberInfo.avgfee * 1 == 0 ? 0 : memberInfo.avgfee.toFixed(2)) + "元");
				$list.eq(1).find(".value").text(memberInfo.mgjconsumeperiod + "天");
				$list.eq(2).find(".value").text((memberInfo.lastconsumetime || memberInfo.mgjlastcashiertime) ? am.time2str((memberInfo.lastconsumetime || memberInfo.mgjlastcashiertime) / 1000) : "--");
				$list.eq(3).find(".value").text(memberInfo.mgjlastserver ? memberInfo.mgjlastserver : "暂无");
				if (!memberInfo.classid) {
					this.$leftBox.find(".listbox .title_words").text("");
				} else {
					this.$leftBox.find(".listbox .title_words").text(self.getmemberLevel(memberInfo.classid));
				}
				//积分

				this.$memberInfo = memberInfo;
				console.log("this.$memberInfo",memberInfo)
				if(self.getModifyPointAccess()){
					this.$leftBox.find('.excbox .num').addClass('am-clickable modify');
				}else{
					this.$leftBox.find('.excbox .num').removeClass('am-clickable modify');
				}
				this.$leftBox.find('.excbox .num').text(memberInfo.currpoint ? memberInfo.currpoint : 0).parent().data('point',memberInfo.currpoint ? memberInfo.currpoint : 0);
				//线上消费积分onLineExchangeBox
				this.$leftBox.find('.onLineExchangeBox .onLineNum').text(memberInfo.onlineCredit ? memberInfo.onlineCredit : 0).parent().data('point',memberInfo.onlineCredit ? memberInfo.onlineCredit : 0);
				this.leftBoxScroll.refresh();
				this.leftBoxScroll.scrollTo('top');
			} else {
				throw new Error("userinfo is null");
			}
		},
		toggleClass:function(key,ret){
			if(ret){
				this.$twoStatus.find('.'+key).addClass('done');
			}else{
				this.$twoStatus.find('.'+key).removeClass('done');
			}
		},
		getmemberLevel: function (id) {
			var list = am.metadata.memberClass;
			if (list && list.length) {
				for (var i = 0; i < list.length; i++) {
					var item = list[i];
					if (item.classid == id) {
						return item.classname;
					}
				}
			}
		},
		getshopName: function (id) {
			var shopList = am.metadata.shopList;
			if(shopList && shopList.length){
				for (var i = 0; i < shopList.length; i++) {
					var item = shopList[i];
					if (item.shopId == id) {
						return item.osName;
					}
				}
			}
		},
		drawCircel: function (ctx, x, y, r, sAngle, eAngle, color, words, flag) {
			ctx.beginPath();
			ctx.lineWidth = 4;
			ctx.strokeStyle = color ? color : '#eeeeee';
			ctx.arc(x, y, r, sAngle, eAngle);
			ctx.stroke();

			ctx.beginPath();
			ctx.textAlign = "center";
			ctx.font = "10px 华文细黑";
			ctx.fillStyle = "#999";
			ctx.fillText("剩余", 70, 50);
			ctx.stroke();

			ctx.beginPath();
			ctx.textAlign = "center";
			ctx.font = "13px Helvetica";
			ctx.fillStyle = "#222222";
			ctx.fillText((words ? (words + "次") : ""), 70, 37);
			ctx.stroke();

		},
		clearModelBox: function () {
			this.adboxSelectedCategory = '';
			this.adboxSelectedSubCategory = '';
			this.adboxSelectedProductId = '';
			this.adboxSelectedProductName = '';
			this.adboxSelectedProductTid = '';
			this.$adbox.find(".link_box").removeClass("hide");
			this.$adbox.find(".linked_box").addClass("hide");
			this.$adbox.find("input[name='workPrice']").val("");
			this.$adbox.find("input[name='workPrice']").val("");
			this.$adbox.find("textarea[name='talk_content']").val("");
			this.$adbox.find(".mbody-left .photo_typebox>ul>li").removeClass("selected");
			this.$adbox.find(".photo_upload_boxs ul").html('<li class="empty_box am-clickable"></li>');
			this.$azbox.find(".photo_upload_boxs ul").html('<li class="empty_box am-clickable"></li>');
			this.$adbox.find(".left-dot").removeClass("selected");
			this.$adbox.addClass("hide");
			this.$azbox.addClass("hide");
			this.$arbox.addClass("hide");
			this.$cabox.addClass("hide");
			this.$azbox.find("textarea[name='addqzone_qzone_content']").val("");
			this.$arbox.find("textarea[name='addremark_qzone_content']").val("");
			this.$adbox.find("input[name='showInMYKSwitch']").prop("checked", false)
			this.renderOurselves(true);
		},
		getData: function (callback) {
			var $metadata = am.metadata;
			var $data = this.$data;
			am.loading.show("正在获取数据,请稍候...");
			am.api.memberDetails.exec({
				"shopId": $data.shopId,// || am.metadata.userInfo.shopId
				"memberid": $data.customerId,
				"parentShopId": $metadata.userInfo.parentShopId,
				'usedTreat':1// 查出已过期的
			}, function (res) {
				console.log("2743",res);
				am.loading.hide();
				console.log(res);
				if (res.code == 0) {
					self.cardCash = res.content.cards;
					self.$userInfo = res.content.memberInfo;
					self.memberpw = self.$userInfo.passwd;
					self.$userInfo.realMobile = self.$userInfo.mobile;
					callback && callback(res);
				} else {
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		getlistServiceData: function (callback) {
			var $metadata = am.metadata;
			var $data = this.$data;
			am.loading.show("正在获取数据,请稍候...");
			am.api.listService.exec({
				"shopId": $metadata.userInfo.shopId,//$data.shopid
				"memberid": $data.customerId,
				"parentShopId": $metadata.userInfo.parentShopId,
				"pageNumber": self.recordIndex,
				"pageSize": 15,
				"timeUnLimit":1
			}, function (res) {
				am.loading.hide();
				console.log(res);
				if (res.code == 0) {
					callback && callback(res);
				} else {
					self.$recordBox.removeClass("empty").addClass("cutting");
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		//获取消耗记录数据
		getConsumptionData:function(data,callback){
			var $metadata = am.metadata,
				$comboInfo = self.$userInfo.treatMentItems;
			am.loading.show("正在获取数据,请稍候...");
			am.api.consumption.exec({
				"shopId": $metadata.userInfo.shopId,//$data.shopid
				"treatmentid": data.id,//套餐项目ID
				"memberid":data.memberid //卡ID
			}, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					callback && callback(res);
				} else {
					self.$recordBox.removeClass("empty").addClass("cutting");
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},

		getPointRecoedData: function(started_time,point_cate,callback) {
			var $metadata = am.metadata;
			var $data = this.$data;
			am.loading.show("正在获取数据,请稍候...");
			am.api.pointRecord.exec({
				"type": point_cate,
				"memberId": $data.customerId,
				"startDate": started_time,
				"pageNum": self.pointIndex,
				"pageSize": 15,
				// "timeUnLimit":1
			}, function (res) {
				am.loading.hide();
				console.log(res);
				if (res.code == 0) {
					callback && callback(res);
				} else {
					self.$pointBox.removeClass("default empty cutting").addClass("cutting");
					self.$pointBox.find('.table_head').hide()
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		renderPointSearchRes: function($started_T,$point_cate) {
			self.getPointRecoedData($started_T,$point_cate,function(res){
				self.$pointBoxScroll.refresh();
				self.$pointBox.find('.table_head').hide()
				self.$pointBox.find('.point_record_detail').empty();
				if(res.content && res.content.length) {
					self.$pointBox.removeClass("default empty cutting")
					self.$pointBox.find('.table_head').show()
					if($point_cate === 1) {
						self.$pointBox.find('.th_shop').show()
						self.$pointBox.find('.th_online').hide()
						for(var i=0; i<res.content.length; i++) {
							var item = res.content[i]
							var $html_shop = $(
								'<tr>' +
								'<td>' + item.pointSource + '</td>' +
								'<td class="' + ((item.pd && item.changePoint > 0) ? "upright": "negative") + '">' + ((item.pd && item.changePoint > 0) ? '+' + item.changePoint : (item.changePoint > 0 ?'-':'') + item.changePoint) + '</td>' +	
								'<td>' + item.surPoint + '</td>' +
								'<td>' + (new Date(item.changeTime).format("yyyy-mm-dd HH:MM")) + '</td>' +
								'<td>' + item.shopName + '</td>' +
								'</tr>'
							)
							self.$pointBox.find('.point_record_detail').append($html_shop)
						}
					} else {
						self.$pointBox.find('.th_shop').hide()
						self.$pointBox.find('.th_online').show()
						for(var i=0; i<res.content.length; i++) {
							var item = res.content[i]
							var $html_online = $(
								'<tr>' +
								'<td>' + item.pointSource + '</td>' +
								'<td class="' + ((item.pd && item.changePoint > 0) ? "upright": "negative") + '">' + ((item.pd && item.changePoint > 0) ? '+' + item.changePoint : (item.changePoint > 0 ?'-':'') + item.changePoint) + '</td>' +	
								'<td>' + item.surPoint + '</td>' +
								'<td>' + (new Date(item.changeTime).format("yyyy-mm-dd HH:MM")) + '</td>' +
								'</tr>'
							)
							self.$pointBox.find('.point_record_detail').append($html_online)
						}
					}
					
				} else {
					self.$pointBox.removeClass("default empty cutting").addClass("empty");
				}
				self.$pointBoxScroll.refresh();
				self.$pointBoxScroll.scrollTo("top");
				self.pager_point.refresh(self.pointIndex - 1, res.count);
			})	
		},
		//获取卡金变动流水会员卡
		getMemberData: function(callback) {
			var $metadata = am.metadata;
			var $data = this.$data;
			am.loading.show("正在获取数据,请稍候...");
			am.api.memberDetails.exec({
				"memberid": $data.customerId,
				"parentShopId": $metadata.userInfo.parentShopId,
			}, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					callback && callback(res);
				} else {
					self.$recordBox.removeClass("empty").addClass("cutting");
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		//获取卡金变动流水数据
		getCardCashData: function(started_time,member_card,callback) {
			var $metadata = am.metadata;
			var $data = this.$data;
			am.loading.show("正在获取数据,请稍候...");
			am.api.goldCard.exec({
				"parentshopid":$metadata.userInfo.parentShopId,
				"shopid":$metadata.userInfo.shopId,
				"memberCardId":member_card,
				"startDate":started_time
				// "pageNumber":self.cardCashIndex-1,
				// "pageSize": 15
			}, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					callback && callback(res);
				} else {
					self.$recordBox.removeClass("empty").addClass("cutting");
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		// 获取欠款记录
		getQueryDebtData: function(memberid, callback) {
			am.api.queryDebt.exec({
				"shopId": am.metadata.userInfo.shopId,
				"memberid": memberid,
				"pageNumber": 0,
				"pageSize": 15
			}, function (res) {
				if (res.code == 0) {
					callback && callback(res);
				} else {
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		//获取TA的欠款数据
		getArrearsData: function (callback) {
			var $metadata = am.metadata;
			var $data = this.$data;
			am.loading.show("正在获取数据,请稍候...");
			am.api.queryDebt.exec({
				"shopId": $metadata.userInfo.shopId,//$data.shopid
				"memberid": $data.customerId,
				"pageNumber": self.arrearsIndex-1,
				"pageSize": 15
			}, function (res) {
				am.loading.hide();
				if (res.code == 0) {
					callback && callback(res);
				} else {
					self.$recordBox.removeClass("empty").addClass("cutting");
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		submitCraft: function (opt) {
			amGloble.loading.show();
			amGloble.api.addInvention.exec(opt, function (ret) {
				amGloble.loading.hide();
				if (ret && ret.code == 0) {
					amGloble.msg("添加成功");
					//$.am.Page.refresh();
					self.clearModelBox();
				} else {
					amGloble.msg(ret.message || "提交失败");
				}
			});
		},
		submitArchives: function (opt) {
			amGloble.loading.show();
			amGloble.api.customerAddArchives.exec(opt, function (ret) {
				amGloble.loading.hide();
				if (ret && ret.code == 0) {
					amGloble.msg("添加成功");
					//$.am.Page.refresh();
					self.clearModelBox();
				} else {
					amGloble.msg(ret.message || "提交失败");
				}
			});
		},
		submitRemark:function(opt,flag){//flag card combo
			amGloble.loading.show();
			if(flag=="card"){
				amGloble.api.saveCardRemark.exec(opt, function (ret) {
					amGloble.loading.hide();
					if (ret && ret.code == 0) {
						amGloble.msg("添加成功");
						self.clearModelBox();
						self.$changeTarget.find('.remarkWrap .remarkCon .text').html(opt.cardRemark);
						var data=self.$changeTarget.data('item');
						data.cardRemark=opt.cardRemark;
						self.$changeTarget.data("item",data);
						// self.$.find('[isdisabled=1]').addClass('am-clickable');
					} else {
						amGloble.msg(ret.message || "提交失败");
					}
				});
			}else if(flag=='combo'){
				amGloble.api.saveComboRemark.exec(opt, function (ret) {
					amGloble.loading.hide();
					if (ret && ret.code == 0) {
						amGloble.msg("添加成功");
						//$.am.Page.refresh();
						self.clearModelBox();
						self.$changeTarget.find('.remarkText').html(opt.itemRemark+'<span class="comboRemarkIcon am-clickable"></span>');
						var data=self.$changeTarget.data('comboItem');
						data.itemRemark=opt.itemRemark;
						self.$changeTarget.data("comboItem",data);
					} else {
						amGloble.msg(ret.message || "提交失败");
					}
				});
			}
			self.$.find('[isdisabled=1]').addClass('am-clickable');
		},
		getMallItemData: function (callback) {
			var self = this;

			if (this.queryMallItemCache) {
				//加缓存逻辑
				callback(this.queryMallItemCache);
				return;
			}
			amGloble.api.queryMallItem.exec({
				//category : self.category,
				category: 1,
				parentShopId: amGloble.metadata.userInfo.parentShopId
			}, function (ret) {
				if (ret.code == 0) {
					self.queryMallItemCache = ret.content;
					callback(ret.content);
				} else {
					amGloble.msg(ret.message || "数据获取失败,请重试!");
				}
			});
		},
		getarchivesData: function (callback) {
			var metadata = am.metadata;
			var $data = this.$data;
			var idx = this.$fileBox.find(".leftTit span.selected").index();
			var apiList = ["archivesList", "inventionList"];
			am.loading.show("正在获取数据,请稍候...");
			am.api[apiList[idx]].exec({
				"shopId": am.metadata.userInfo.shopId,//$data.shopid
				"memberid": $data.customerId,
				"parentShopId": am.metadata.userInfo.parentShopId,
				"pageNumber": self.fileBoxIndex,
				"pageSize": self.fileBoxSize
			}, function (res) {
				am.loading.hide();
				console.log(res);
				if (res.code == 0) {
					callback && callback(res);
				} else {
					self.$.find(".filebody").removeClass('empty').addClass("cutting");
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		renderCredit:function(){
			var goodCreditList = am.metadata.shopAwards;
			for(var i=0;i<goodCreditList.length;i++){
				var $html = $('<div class="changebox am-clickable">'+
						'<span class="change_icon"></span>'+
						'<span class="change_words">'+goodCreditList[i].name+'</span>'+
						'<span class="change_num">'+goodCreditList[i].point+'积分</span>'+
					'</div>').data('item',goodCreditList[i]);
				self.$exbox.find('.goodlist .exinner').append($html);
			}
		},
		exchangePoint:function(){
			if(self.$.find('.changebox.selected').length == 0){
				amGloble.msg('请选择要兑换的商品');
				return;
			}
			var excData = self.$.find('.changebox.selected').data('item');
			
			var total = self.$leftBox.find('.excbox.exchange').data('point') - excData.point;
			var memberData = this.$data;
			if(total<0){
				amGloble.msg('当前用户积分不足以兑换此商品！');
				return;
			}
			//console.log(self.$userInfo)
			amGloble.confirm("商品兑换",'确定兑换此商品么，一旦兑换不可更改',"确定","返回",function(){
				var detail = {
					"shopId":amGloble.metadata.userInfo.shopId,
					"member":{
						"id":memberData.customerId,
						"cardid":memberData.cardId || '',
						"mobile":self.$userInfo.mobile
					},
					"shopAward":{
						"name":excData.name,
						"point":excData.point
					}
				}
				amGloble.loading.show("正在兑换商品,请稍候...");
				amGloble.api.expendPoint.exec(detail,function(res){
					if(res.code == 0){
						am.loading.hide();
						amGloble.msg('积分兑换成功！')
						self.$exbox.addClass('hide');
						self.$leftBox.find('.excbox.exchange .num').text(total).parent().data('point',total)
						self.$userInfo.currpoint = total;
						var $started_T = self.$pointSelSTime.val(),
							$point_cate = self.getSelectValue().pointC;
							// 积分兑换成功后刷新
						if($point_cate === 1) {
							self.pointIndex = 1;
							self.renderPointSearchRes($started_T,$point_cate)
						}
						console.log(self,self.$userInfo)
					}else{
						am.msg(res.message || "数据获取失败,请检查网络!");
					}
				})
			},function(){

			})

		},
		//点击开通/延期特权按钮 chali
		eidtPrivilegeTime:function(){
			am.loading.show("正在获取数据，请稍候...");
			var validDate =amGloble.now();//会员特权结束时间
			if(self.$memberInfo.privilege != null && self.$memberInfo.privilege.hasOwnProperty("expireDate")
				&&self.$memberInfo.privilege.expireDate!=null && self.$memberInfo.privilege.privilegeId == null ){
					validDate =new Date(self.$memberInfo.privilege.expireDate);
			}
			var validDateVal = self.privilegeCardSelect.getValue();//选择的select按钮
			if(validDateVal == 1){
				validDate.setMonth(validDate.getMonth()+1);
			}else if(validDateVal == 3){
				validDate.setMonth(validDate.getMonth()+3);
			}else if(validDateVal == 6){
				validDate.setMonth(validDate.getMonth()+6);
			}else if(validDateVal == 12){
				validDate.setMonth(validDate.getMonth()+12);
			}else if(validDateVal == -1){
				validDate = null;
			}else if(validDateVal >=100){
				validDate = new Date($('#privilegeCard .value').text());
			}
			console.log(amGloble.metadata.userInfo,"到底是啥")
			var opt ={//默认开通特权
				parentShopId:amGloble.metadata.userInfo.parentShopId,
				shopId:self.$memberInfo.shopid,
				openShopId:amGloble.metadata.userInfo.shopId,
				optId:amGloble.metadata.userInfo.userId,
				optName:amGloble.metadata.userInfo.userName,
				privilegeId:(self.$memberInfo.privilege != null && self.$memberInfo.privilege.hasOwnProperty("privilegeId"))? self.$memberInfo.privilege.privilegeId:null,
				ownerId: self.$memberInfo.id,  // memberinfo.id
				ownerName: self.$memberInfo.name, // memberinfo.name
				mobile: self.$userInfo.realMobile,   // memberinfo.mobile ?
				createtime: new Date().getTime(),
				expireDate: validDate != null?validDate.getTime():null,
				privilegeOpenPrice: $('#privilegeCard .unit_price').text()*1,
				targetDate: validDate != null?validDate.getTime():null,
				id:(self.$memberInfo.privilege != null && self.$memberInfo.privilege.hasOwnProperty("id"))? self.$memberInfo.privilege.id:null,
			}
			//延期特权
			if(self.$memberInfo.privilege !=null && self.$memberInfo.privilege.hasOwnProperty("ownerId") && self.$memberInfo.id == self.$memberInfo.privilege.ownerId){// 会员已开通
				opt ={
					ownerId: self.$memberInfo.id,  // memberinfo.id
					ownerName: self.$memberInfo.name, // memberinfo.name
					mobile: self.$memberInfo.mobile,   // memberinfo.mobile ?
					parentShopId:amGloble.metadata.userInfo.parentShopId,
					shopId:self.$memberInfo.shopid,
					openShopId:amGloble.metadata.userInfo.shopId,
					optId:amGloble.metadata.userInfo.userId,
					optName:amGloble.metadata.userInfo.userName,
					privilegeId:(self.$memberInfo.privilege != null && self.$memberInfo.privilege.hasOwnProperty("privilegeId"))? self.$memberInfo.privilege.privilegeId:null,
					expireDate: self.$memberInfo.privilege.expireDate,
					privilegeOpenPrice: $('#privilegeCard .unit_price').text()*1,
					targetDate: validDate != null?validDate.getTime():null,
					id:(self.$memberInfo.privilege != null && self.$memberInfo.privilege.hasOwnProperty("id"))? self.$memberInfo.privilege.id:null,
				}
			}
			//提交接口
			// console.log(opt,"怎么回事",self.$memberInfo)
			am.api.editPrivilege.exec(opt, function(ret) {
                am.loading.hide();
                if (ret.code == 0) {
					am.msg("成功,顾客特权卡有效期至"+(validDate != null?validDate.format("yyyy-mm-dd"):"不限期"));
                } else {
                    am.msg(ret.message || "数据获取失败，请重试！");
				}
				self.$privilegeCardBox.addClass('hide');
				if(!self.$privilegeCardBox.find('.validDate .item_input').hasClass("hide")){
					self.$privilegeCardBox.find('.validDate .item_input').addClass('hide');
				}
				self.beforeShow({customerId: self.$memberInfo.id, tabId: 1});//刷新页面
            });
		},
		/*
		* 顾客 门店转移
		*/
		initEditMemberShop:function(){
			if(!this.$shopEdit && amGloble.metadata.shopList.length>2 && am.operateArr.indexOf('a8')===-1){
				this.$shopEdit = this.$.find(".shops").vclick(function () {
					var ret = self.getShopGroup();
					var shops = ret.shops;
					//第一组是直营店，第二组是附属店
	
					if(ret.memberSoftgenre===3){
						//如果此会员是附属店的
						self.showShopList(shops[0].concat(shops[1]),1);
					}else if(shops[0].length && shops[1].length){
						//直营附属都有
						shops[0].push({
							id:-1,
							name:"其它门店",
							children:shops[1]
						});
						self.showShopList(shops[0]);
					}else if(!shops[0].length && shops[1].length){
						//没有直营
						self.showShopList(shops[1]);
					}else if(shops[0].length && !shops[1].length){
						//没有附属
						self.showShopList(shops[0]);
					}
				});
			}
		},
		//将门店分为两组，直营附属，同时剔除顾客所在店
		getShopGroup:function(){
			var shopsA=[],shopsB=[],memberSoftgenre;
			for(var i=0;i<amGloble.metadata.shopList.length;i++){
				if(this.$userInfo.shopid.toString() === amGloble.metadata.shopList[i].shopId.toString()){
					memberSoftgenre = amGloble.metadata.shopList[i].softgenre;
					break;
				}
			}
			//找到顾客的门店类型
	
			for(var i=0;i<amGloble.metadata.shopList.length;i++){
				//平台类别 0-总部平台;1-单店平台;2-直属分店;3-附属分店
				if(amGloble.metadata.shopList[i].shopId.toString()!=this.$userInfo.shopid.toString()){
					if(amGloble.metadata.shopList[i].softgenre===2){
						shopsA.push({
							id:amGloble.metadata.shopList[i].shopId,
							name:amGloble.metadata.shopList[i].osName || amGloble.metadata.shopList[i].shopName,
							softgenre:amGloble.metadata.shopList[i].softgenre
						});
					}else if(amGloble.metadata.shopList[i].softgenre===3){
						shopsB.push({
							id:amGloble.metadata.shopList[i].shopId,
							name:amGloble.metadata.shopList[i].osName || amGloble.metadata.shopList[i].shopName,
							softgenre:amGloble.metadata.shopList[i].softgenre
						});
					}
				}
			}
			return {
				memberSoftgenre:memberSoftgenre,
				shops:[shopsA,shopsB]
			}
		},
		/* memberType
		* true表示此顾客是附属店的，无论目标店是什么类型，都要提示
		* false表未此顾客是直营店，转到附属店需要警告	
		*/
		showShopList:function(items,memberType,notMember,opt){
			// notMember 不是转移会员门店
			var hasCb=0,cbText="",title="将此顾客转移至";		
			if(!notMember){
				// 允许转移会员卡及套餐
				hasCb=1;
				cbText="同时转移此顾客本店会员卡及套餐";
			}else if(notMember && opt && opt.isCard){
				title="将此会员卡转移至";
			}else if(notMember){
				title="将此套餐转移至";
			}	
			// title, items, cb, keyName, muti, cancel,hasCb,cbText
			am.popupMenu(title, items, function (ret,isChecked) {
				if(notMember){
					var shopMap=am.metadata.shopMap;
					// 转移会员卡或套餐
					if(ret.children){
						self.showShopList(ret.children,0,1,opt);
					}else if(opt && opt.isCard){
						// self.changeMemberShop(ret,0,(opt && opt.cardData && opt.cardData.id),0);
						// 转移会员卡
						console.log("调用转移会员卡接口");
						var cardData=opt && opt.cardData;
						if(cardData && shopMap){
							var oldShopId=cardData.shopid;
							var oldShopSoftgenre=shopMap[oldShopId] && shopMap[oldShopId].softgenre;
							if(ret.softgenre===3){
								// 附属店
								am.confirm("警告!","附属门店的项目与会员卡等数据是独立配置，转移顾客资料可能造成数据不匹配，请谨慎！", "确认转移", "返回", function(){
									self.changeMemberShop(ret,0,(opt && opt.cardData && opt.cardData.id),0,oldShopId);
								});
							}else{
								if(oldShopSoftgenre===3){
									// 附属转出
									am.confirm("警告!","附属门店的项目与会员卡等数据是独立配置，转移顾客资料可能造成数据不匹配，请谨慎！", "确认转移", "返回", function(){
										am.confirm("提示","确认要将此会员卡转移至"+ret.name+"吗?", "确认", "返回", function(){
											self.changeMemberShop(ret,0,(opt && opt.cardData && opt.cardData.id),0,oldShopId);
										});
									});
								}else{
									// 直属转出
									am.confirm("提示","确认要将此会员卡转移至"+ret.name+"吗?", "确认", "返回", function(){
										self.changeMemberShop(ret,0,(opt && opt.cardData && opt.cardData.id),0,oldShopId);
									});
								}
							}
						}
					}else{
						// 转移套餐
						console.log('调用套餐卡转移接口')
						var comboData=opt && opt.comboData;
						if(comboData && shopMap){
							var oldShopId=comboData.shopid;
							var oldShopSoftgenre=shopMap[oldShopId].softgenre;
						
							// self.changeMemberShop(ret,0,0,(opt && opt.comboData && opt.comboData.id));
							if(ret.softgenre===3){
								am.confirm("警告!","附属门店的项目与会员卡等数据是独立配置，转移顾客资料可能造成数据不匹配，请谨慎！", "确认转移", "返回", function(){
									self.changeMemberShop(ret,0,0,(opt && opt.comboData && opt.comboData.id),oldShopId);
								});
							}else{
								if(oldShopSoftgenre===3){
									// 附属转出
									am.confirm("警告!","附属门店的项目与会员卡等数据是独立配置，转移顾客资料可能造成数据不匹配，请谨慎！", "确认转移", "返回", function(){
										am.confirm("提示","确认要将此会员套餐转移至"+ret.name+"吗?", "确认", "返回", function(){
											self.changeMemberShop(ret,0,0,(opt && opt.comboData && opt.comboData.id),oldShopId);
										});
									});
								}else{
									// 直属转出
									am.confirm("提示","确认要将此会员套餐转移至"+ret.name+"吗?", "确认", "返回", function(){
										self.changeMemberShop(ret,0,0,(opt && opt.comboData && opt.comboData.id),oldShopId);
									});
								}
							}
						}
					}
				}else{
					// 转移会员
					if(ret.children){
						self.showShopList(ret.children);
					}else{
						if(!memberType && ret.softgenre===2 ){
							//直营店
							am.confirm("提示","确认要将此顾客转移至"+ret.name+"吗?", "确认", "返回", function(){
								self.changeMemberShop(ret,isChecked);
							}, function(){
		
							});
						}else{
							am.confirm("警告!","附属门店的项目与会员卡等数据是独立配置，转移顾客资料可能造成数据不匹配，请谨慎！", "确认转移", "返回", function(){
								self.changeMemberShop(ret,isChecked);
							}, function(){
		
							});
						}
					}
				}
			},'','','',hasCb,cbText);
		},
		showNotMemeberShops: function (opt) {
			//第一组是直营店，第二组是附属店
			var getShops = function (data) {
				var shopMap = am.metadata.shopMap,
					shops = [],
					directShops = [],
					indirectShops = [];
				for (var key in shopMap) {
					if (key == data.shopid) {
						// 已经是本店 不显示
					} else {
						var shopItem = shopMap[key];
						if (shopItem.softgenre === 2) {
							// 直营
							directShops.push({
								id: shopItem.shopId,
								name: shopItem.osName || shopItem.shopName ||'',
								softgenre: shopItem.softgenre
							});
						} else if (shopItem.softgenre === 3) {
							// 附属
							indirectShops.push({
								id: shopItem.shopId,
								name: shopItem.osName || shopItem.shopName ||'',
								softgenre: shopItem.softgenre
							})
						}
					}
				}
				return shops = [directShops, indirectShops];
			};
			// 门店弹窗
			var ret = self.getShopGroup();
			var shops = [];
			if (opt.cardData) {
				shops = getShops(opt.cardData)
			} else if (opt.comboData) {
				shops = getShops(opt.comboData)
			}
			if (ret.memberSoftgenre === 3) {
				//如果此会员是附属店的
				self.showShopList(shops[0].concat(shops[1]), 1, 1, opt);
			} else if (shops[0].length && shops[1].length) {
				//直营附属都有
				shops[0].push({
					id: -1,
					name: "其它门店",
					children: shops[1]
				});
				self.showShopList(shops[0], 0, 1, opt);
			} else if (!shops[0].length && shops[1].length) {
				//没有直营
				self.showShopList(shops[1], 0, 1, opt);
			} else if (shops[0].length && !shops[1].length) {
				//没有附属
				self.showShopList(shops[0], 0, 1, opt);
			}
		},
		changeMemberShop:function(shop,moveCardAndCombo,moveCardId,moveComboId,oldShopId){
			am.api.transferShop.exec({
				"shopId":oldShopId||this.$userInfo.shopid.toString(),
				"memberId":this.$userInfo.id,
				"toShopId":shop.id,
				"operator":am.metadata.userInfo.userName,
				"moveCardAndCombo":moveCardAndCombo?1:0,// 转会员同时转会员卡及套餐
				"moveCard":moveCardId||0,// 转移卡 卡id
				"moveCombo":moveComboId||0// 转移套餐 套餐id
			},function(ret){
				if(ret && ret.code===0){
					// if(moveCardAndCombo){
					// 	self.$shopEdit.text(shop.name);
					// }
					self.$userInfo.shopid = shop.id;
					am.msg('转移成功!');
					self.beforeShow(self.beforeShowPara);
				}else{
					var str;
					if(ret && ret.code===-1){
						str = "网络异常，此次操作失败！";
					}else if(ret){
						str = ret.message || "服务器内部错误,此次操作失败！";
					}else{
						str = "此次操作失败！";
					}
					am.confirm("错误",str, "重试", "放弃", function(){
						self.changeMemberShop(shop,moveCardAndCombo,moveCardId,moveComboId);
					}, function(){

					});
				}
			});
		},
		updateMemberSms:function($dom,key){
			var opt = {
				memId: self.$userInfo.id,
				notifySms: self.$userInfo.notifysms || 0,
				voteSms: self.$userInfo.votesms || 0,
				cutSms: self.$userInfo.deductsmsfeeflag || 0,
				deductSmsFeeFlag: self.$userInfo.deductsmsfeeflag || 0
			}
			if(opt[key]==1){
				opt[key] = 0;
			}else {
				opt[key] = 1;
			}
			am.loading.show();
			am.api.updateMemberSms.exec(opt,function(ret){
				am.loading.hide();
				if(ret && ret.code===0){
					am.msg('修改成功');
					if($dom.hasClass('on')){
						$dom.removeClass('on');
					}else {
						$dom.addClass('on');
					}
					self.$userInfo[key.toLowerCase()] = opt[key];
				}else{
					atMobile.nativeUIWidget.confirm({
						caption: '修改失败',
						description: '是否重试',
						okCaption: '确定',
						cancelCaption: '取消'
					}, function(){
						self.updateMemberSms($dom,key);
					}, function(){
		
					});
				}
			});
		}			
	});
	var PopupRt=function(opt){
		this.$parent=opt.$;//dom
		this.$popupTit=this.$parent.find('.popup_tit');//标题
		this.$exchange=this.$parent.find('.toCard_tit');//用来隔离移动位置的标杆
		this.$inputWrap=this.$parent.find('.card_trans_total');//两个输入框
		this.outCard=null;//转出卡数据
		this.inCard=null;//搜索后转入卡数据
		this.onRender=opt.onRender;
		this.onCheck=opt.onCheck;
		this.onSubmit=opt.onSubmit;
		this.onChangeMemory=opt.onChangeMemory;
		this.disabled=false;
		this.type=opt.type;
		this._bindEvt();
		if(this.type==1){
			this._bindCardInput();
		}else if(this.type==2){
			this.cards = opt.ownCards;
			this._bindSelect();
			this._bindComboInput();
		}else if(this.type==3){
			this.cards = opt.ownCards;
			this._bindShopCb();
		}
	};
	PopupRt.prototype = {
		constructor:PopupRt,
		init:function(cardData){//初始化的时候 出入转出卡的数据并且绑定好
			this.render(cardData);
			this.outCard=cardData;
			if((cardData.sumtimes == 0 ||cardData.sumtimes == -99)||(cardData.leavetimes == 0 ||cardData.leavetimes == -99)){
				this.disabled=true;
				this.$inputWrap.addClass('disabled');
			}else{
				this.disabled=false;
				this.$inputWrap.removeClass('disabled');
			}
			if (this.type == '1') {
				this.$content = new $.am.ScrollView({
					$wrap: this.$parent.find('.popup_content'),
					$inner: this.$parent.find('.popup_content').children(),
					direction: [false, true],
					hasInput: false
				});
			}
		},
		render:function(data){
			if(this.type==3){
				this.onRender(this.$parent.find('.shops_content'),data);
			}else{
				this.onRender(this.$parent.find('.card_from'),data);
			}
			if (this.$content) {
				this.$content.refresh();
				this.$content.scrollTo("top");
			}
		},
		_bindEvt:function(){
			var _this=this;
			this.$parent.on('keyup','.win_input',function(e){
				if (e.keyCode == 13) {
          _this.search();
        }
			})/*.on('focus','.win_input',function(e){//聚焦隐藏
				_this.$parent.find('.foot_btns').hide();
			}).on('blur','.win_input',function(e){//失焦显示
				_this.$parent.find('.foot_btns').show();
			})*/.on('vclick','.search_icon',function(){
                _this.search();
			}).on('vclick','.trans_fee input,.trans_pfee input',function(){
				var me=this;
				if(_this.disabled && $(this).parent().hasClass('trans_fee')){
					am.msg('不限次的套餐，只需要输入退款金额！');
					return;
				}
				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
				    	$(me).val(value);
				    }
				});
			}).on('vclick','.sure_btn',function(){//确认 开始转账api、关闭窗口
				_this.submit();
			}).on('vclick','.btn_cancel',function(){//取消 关闭窗口
				_this.hide();
			}).on('vclick','.popup_right_mask',function(){//取消 关闭窗口
				_this.hide();
			})
		},
		_bindShopCb:function(){
			var $shopsUl = this.$parent.find('.shops_ul');
			var $shopLiAll = this.$parent.find('.shopAll'),
				$onlySaledShop = this.$parent.find('.onlySaledShop');
				var _this=this;
			this.$parent.on('vclick', '.shops_content li', function () {
				console.log(_this);
				var comboInfo=_this.outCard;
				var outShopId=comboInfo && comboInfo.shopid;// 套餐的所属门店
				var outShopInfo=am.metadata.shopMap && am.metadata.shopMap[outShopId];
				var $_this = $(this);
				var shopInfo = $_this.data('data');
				var fn = function () {
					$_this.toggleClass('selected');
					var $shopsLis = $shopsUl.find('.shop_item');
					if ($_this.hasClass('shopAll')) {
						// 点击的全选
						if ($_this.hasClass('selected')) {
							// 全选
							var indirectShops=[];
							for (var i = 0, len = $shopsLis.length; i < len; i++) {
								var shop = $($shopsLis[i]).data('data');
								if (shop && shop.softgenre === 3) {
									// 附属店
									indirectShops.push(i);
								} else {
									$($shopsLis[i]).addClass('selected');
								}
							}
							if(indirectShops && indirectShops.length){
								am.confirm("警告！", "附属门店的项目与会员卡等数据是独立配置，修改套餐等配置可能造成数据不匹配，请谨慎", "确认修改", "返回", function () {
									for(var m=0,len=indirectShops.length;m<len;m++){
										$($shopsLis[indirectShops[m]]).addClass('selected');
									}
								});
							}
						} else {
							// 取消全选
							var indirectShops=[];
							for (var i = 0, len = $shopsLis.length; i < len; i++) {
								var shop = $($shopsLis[i]).data('data');
								if(shop && shop.softgenre === 3){
									indirectShops.push(i);
								}else{
									$($shopsLis[i]).removeClass('selected');
								}
							}
							for(var m=0,len=indirectShops.length;m<len;m++){
								$($shopsLis[indirectShops[m]]).removeClass('selected');
							}
						}
					} else {
						// 点击的普通门店
						var isAll = 1;
						for (var i = 0, len = $shopsLis.length; i < len; i++) {
							if (!$($shopsLis[i]).hasClass('selected')) {
								isAll = 0;
								break;
							};
						}
						if (!isAll) {
							$shopLiAll.removeClass('selected');
						}
					}
					if ($_this.hasClass('onlySaledShop')) {
						// 仅在销售门店可用
						$shopLiAll.removeClass('selected');
						for (var i = 0, len = $shopsLis.length; i < len; i++) {
							$($shopsLis[i]).removeClass('selected');
						}
					} else {
						$onlySaledShop.removeClass('selected');
					}
				}
				if(!outShopId || am.isNull(outShopInfo) ||$_this.hasClass('selected')){
					return fn();
				}
				// 用向附属
				if (shopInfo && shopInfo.softgenre === 3) {
					// 归属店和用向店不同
					if(shopInfo.shopId!=outShopId){
						// 直属向附属
						am.confirm("警告！", "附属门店的项目与会员卡等数据是独立配置，修改套餐等配置可能造成数据不匹配，请谨慎", "确认修改", "返回", function () {
							fn();
						});
						return false;
					}
				}else if(outShopInfo && outShopInfo.softgenre === 3){
					am.confirm("警告！", "附属门店的项目与会员卡等数据是独立配置，修改套餐等配置可能造成数据不匹配，请谨慎", "确认修改", "返回", function () {
						fn();
					});
					return false;
				}
				fn();
			}).on('vclick','.radioWrap li',function(){
				var $this = $(this).addClass('checked');
				$this.siblings().removeClass('checked');
				if ($this.hasClass('enableWrap')) {
					$this.parents('.switchWrap').find('.tipText').text('“可用”表示勾选的门店可用');
					_this.$parent.find('li.shopAll,li.onlySaledShop').removeClass('am-disabled').addClass('am-clickable');
				} else {
					$this.parents('.switchWrap').find('.tipText').text('“禁用”表示勾选的门店不可用');
					// 禁用不能勾选全部门店和销售门店可用
					_this.$parent.find('li.shopAll,li.onlySaledShop').addClass('am-disabled').removeClass('am-clickable selected');
				}
			});
		},
		_bindCardInput:function(){
			this.$parent.on('vclick','.trans_fee input,.trans_pfee input',function(){
				var me=this;
				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
				    	$(me).val(value);
				    }
				});
			})
		},
		_bindComboInput:function(){
			var _this=this;
			this.$parent.on('vclick','.trans_fee input,.trans_pfee input',function(){
				var me=this;
				if($(this).parent().hasClass('trans_fee')){
					if(_this.disabled){
						am.msg('不限次的套餐，只需要输入退款金额！');
						return;
					}
					am.keyboard.show({
						title:"请输入数字",//可不传
						hidedot:true,
					    submit:function(value){
					    	$(me).val(value);
					    }
					});
				}else{
					am.keyboard.show({
						title:"请输入数字",//可不传
						hidedot:false,
					    submit:function(value){
					    	$(me).val(value);
					    }
					});
				}

			}).on('vclick','.toCard_card',function(){
				$(this).addClass('open');
			})
		},
		_bindSelect:function(){
			var _this=this;
			this.$parent.on('vclick','.toCard_card',function(){
				var res = _this.findRelatedCard(_this.cards);
				console.log(res);
				if(!res){
					_this.listFromOwn(_this.cards);
				}else{
					_this.renderFoundedData(res);
				}
			})
		},
		show:function(data,$li,isExchange){//isExchange转入
			self.$.find('[isdisabled=1]').removeClass('am-clickable');
			this.reset();
			this.$parent.addClass('show');
			this.init(data);
			this.$targetCard=$li;
			if(this.type==1){
				var $cardFee=this.$parent.find('.cardfee');
				if(isExchange){//转入
					var clientHeight = $('body').outerHeight();
				 	self.$cardfeePopup.css({
				 		"height":clientHeight + 'px',
				 		"position":'absolute',
				 		"top":0,
				 		"bottom":'auto'
				 	});
					this.$popupTit.text('卡金转入');
					if($cardFee){
						$cardFee.find('.card_from .card_no .line_tit').text('转入卡卡号：');
						$cardFee.find('.card_trans_total .trans_fee p').text('转入卡金：');
						$cardFee.find('.card_trans_total .trans_pfee p').text('转入赠送金：');
					}
					this.isExchange=true;
					this.exchangeDom();
				}else{
					var clientHeight = $('body').outerHeight();
				 	self.$cardfeePopup.css({
				 		"height":clientHeight + 'px',
				 		"position":'absolute',
				 		"top":'auto',
				 		"bottom":0
				 	});
					this.isExchange=false;
					this.$popupTit.text('卡金转出');
					if($cardFee){
						$cardFee.find('.card_from .card_no .line_tit').text('转出卡卡号：');
						$cardFee.find('.card_trans_total .trans_fee p').text('转出卡金：');
						$cardFee.find('.card_trans_total .trans_pfee p').text('转出赠送金：');
					}
				}
			}else{
				this.isExchange=false;
				this.cards=self.cardCash;
			}
		},
		exchangeDom:function(){
			var $prev = this.$exchange.prev().remove();
			var $next = this.$exchange.next().remove();
			this.$exchange.before($next.clone(true,true));
			this.$exchange.after($prev.clone(true,true));
		},
		hide:function(){
			this.isExchange && this.exchangeDom();
			this.$parent.removeClass('show');
			this.reset();
			setTimeout(function(){
				self.$.find('[isdisabled=1]').addClass('am-clickable');
			},500);
		},
		reset:function(){
			this.onRender(this.$parent.find('.card_from'),null);
			this.$parent.find('.card_to').addClass('init');
			this.$parent.find('.card_to').data('inCard',null);
			this.$parent.find('.win_input').val('');
			this.$parent.find(".card_trans_remark textarea").val('');
			this.$inputWrap.find('.trans_fee input,.trans_pfee input').val('');
			this.outCard=null;//转出卡数据
			this.inCard=null;//搜索后转入卡数据
		},
		search:function(){
			var shopIds=this.getshopIds(am.metadata.userInfo.shopId);//分店
		    var keywords=this.$parent.find('.win_input').val(),_this=this;
		    if(keywords==""){
		        am.msg("请输入搜索关键字！");
		        return;
		    }
			am.loading.show("正在获取数据，请稍候...");
            am.api.searchmember.exec({
                "parentShopId":am.metadata.userInfo.parentShopId,
                "shopId":am.metadata.userInfo.shopId,
                "shopIds":shopIds,
                "keyword":keywords,
                "pageSize":1500,
                "pageNumber":0
            }, function(ret) {
                am.loading.hide();
                if (ret.code == 0) {
                    _this.listFromSearch(ret.content);
                } else {
                	_this.listFromSearch();
                    am.msg(ret.message || "数据获取失败，请重试！");
                }
            });
		},
		findRelatedCard:function(data){
			var _this = this,matchedCard=null;
			console.log(data,this.outCard.memcardid);
			$.each(data,function(i,item){
				if(_this.outCard.memcardid==item.id){
					matchedCard = item;
				}
			})
			return matchedCard;
		},
		listFromOwn:function(data){//弹出该会员已有的所有卡
			var msg='请选择一张卡！',_this=this;
			var menuArr=[];
			if(data && data.length>0){
				if(data.length==1){
					_this.renderFoundedData(data[0]);
				}else{
					menuArr=this.transToMenu(data);
					am.popupMenu(msg, menuArr, function (ret) {
						console.log(ret);
						_this.renderFoundedData(ret.value);
					});
				}
			}else{
				am.msg('没找到卡！');
				_this.$parent.find('.card_to').addClass('init');
			}
		},
		listFromSearch:function(data,type){//弹出搜索出来的所有卡
			var msg='请选择一张卡！',_this=this;
			var menuArr=[];
			data = this.convertSearchCardToMemberDetailCards(data,this.outCard);
			if(data && data.length>0){
				if(data.length==1){
					this.renderFoundedData(data[0]);
				}else{
					menuArr=this.transToMenu(data);
					am.popupMenu(msg, menuArr, function (ret) {
						console.log(ret);
						_this.renderFoundedData(ret.value);
					});
				}
			}else{
				am.msg('没找到卡！');
				_this.$parent.find('.card_to').addClass('init');
			}
		},
		transToMenu:function(data){
			console.log(data)
			var res=[];
			for(var i=0;i<data.length;i++){
				var item=data[i];
				if(item.cardtype!="2" && item.timeflag!="1"){//非资格卡和非计次卡
					res.push({name:(item.name || '' )+(item.name?'-':'')+item.cardtypename+' ('+item.cardid+')',value:item});
				}
			}
			return res;
		},
		renderFoundedData:function(val){
			if (val.status == '1') {
				return am.msg("会员卡退卡中，无法进行此操作");
			}
			if(val.cardtype!="2" && val.timeflag!="1"){
				am.msg('找到卡了！');
				this.$parent.find('.card_to').removeClass('init').removeClass('open').data('inCard',val);
				this.inCard=val;
				this.$parent.find('.card_to').find('.card_name').html(val.cardtypename)
					.end().find('.card_no').html(' ('+val.cardid+') ')
					.end().find('.card_fee').html('卡金：'+am.cashierRound(val.cardfee))
					.end().find('.card_pfee').html('赠金：'+am.cashierRound(val.presentfee))
					.end().find('.card_osName').html('开卡门店：'+((self.getshopName(val.shopid) &&self.getshopName(val.shopid).replace(/\s/g,'')||'门店名称未设定')));
			}else{
				am.msg('资格卡和计次卡不能用来转账！');
			}
		},
		submit:function(){
			var _this=this,res=null;
			if(_this.type==3){
				// 套餐配置使用门店
				res=this.onCheck(this.$parent,this.outCard);
				if(res){
					this.onSubmit(this.outCard,res,function(comboInfo,resObj){
						// 成功回调
						// 成功后数据回写
						var arr=self.$userInfo.treatMentItems;
						for(var i=0,len=arr.length;i<len;i++){
							if(arr[i].id==comboInfo.id){
								arr[i].cashshopids=resObj.res;
								break;
							}
						}
						var servicePageCombos=am.page.service && am.page.service.member && am.page.service.member.comboitems,
						jlen=servicePageCombos && servicePageCombos.length;
						if(jlen){
							for(var j=0;j<jlen;j++){
								if(servicePageCombos[j].id==comboInfo.id){
									servicePageCombos[j].cashshopids=resObj.res;
									break;
								}
							}
						}
						var productPageCombos=am.page.product && am.page.product.member && am.page.product.member.comboitems,
						plen=productPageCombos && productPageCombos.length;
						if(plen){
							for(var p=0;p<plen;p++){
								if(productPageCombos[p].id==comboInfo.id){
									productPageCombos[p].cashshopids=resObj.res;
									break;
								}
							}
						}
						_this.hide();
					},function(){
						// 失败回调
						_this.hide();
					})
				}else{
					// 没有选中任何li
					return;
				}

			}else{
				if (this.outCard&&this.inCard&&this.outCard.shopid && this.inCard.shopid) {
					var outCardShopId = this.outCard.shopid,
						inCardShopId = this.inCard.shopid;
					if ((amGloble.metadata.userInfo.operatestr.indexOf('K1,') != -1) && outCardShopId != inCardShopId) {
						am.msg('没有跨店转账权限！');
						return;
					}
				}
				
				if(this.isExchange){//
					res = this.onCheck(this.$inputWrap,this.outCard,this.inCard);
				}else{
					res = this.onCheck(this.$inputWrap,this.inCard,this.outCard);
				}
				if(!res){
					return;
				}
				this.onSubmit(res,function(){//改内存信息
					if(_this.isExchange){
						_this.onChangeMemory(_this.$targetCard,_this.outCard,_this.inCard,res);
					}else{
						_this.onChangeMemory(_this.$targetCard,_this.inCard,_this.outCard,res);
					}
					_this.hide();
				},function(){
					_this.hide();
					//关闭
				});
			}
		},
		getshopIds:function(id){
            var res=[];
            var shopList=am.metadata.shopList;
            for(var i=0;i<shopList.length;i++){
                res.push(shopList[i].shopId);
            }
            return res.join(",");
    },
    convertSearchCardToMemberDetailCards:function(optCards,formCard){//转卡金用的数据 主要用于 校验、提交、还有改内存
		var res=[];
    	$.each(optCards,function(i,card){
			if(formCard.id==card.cid){
				return true;
			}
    		res.push({
    			cardid:card.cardNo,//卡号
    			cardtypename:card.cardName,//卡名称
    			name:card.name||'',//会员名称
    			id:card.cid,//卡id
    			memberid:card.id,//会员id
    			cardfee:card.balance,//卡金余额
    			presentfee:card.gift,//赠送金余额
    			cardtype:card.cardtype,//卡类型
    			timeflag:card.timeflag,//卡flag
				shopid:card.shopId,//开卡门店id
				cardtypeid:card.cardTypeId,
				status:card.status // 是否退卡
    		})
    	})
    	return res;
	}
	}
	
	var largeHeadImg = {
		init: function(){
			var _this = this;
			this.$dom = $('#largeHeadImg');
			this.$dom.vclick(function(){
				_this.hide();
			});
			this.$img = this.$dom.find('img');
			this.$headImg=this.$dom.find('.headImg');
		},
		show: function(url){
			this.$dom.show();
			var realHeight=this.$headImg.height();
			this.$headImg.css("width",realHeight);
			this.$img.attr('src',url);
		},
		hide: function(){
			this.$dom.hide();
		}
	}
	largeHeadImg.init();
	amGloble.largeHeadImg = largeHeadImg;
})(jQuery);

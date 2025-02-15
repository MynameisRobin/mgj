(function() {
	var self = am.page.member = new $.am.Page({
		id : "page_member",
		backButtonOnclick : function() {

		},
		init : function() {
			this.$stateBox=this.$.find(".searchresultBox").on("vclick",".checkCustomerBox",function(){
				// checkbox 点击事件
				var $this = $(this).toggleClass("checked"),
					$dom = self.$stateBox,
					$checkCustomerAll = $dom.find(".checkCustomerAll"), // 全选按钮
					$mergeCustomerBtn = self.$mergeCustomerBtn;
				if ($this.hasClass('checkCustomerAll')) {
					// 点击全选按钮
					if ($this.hasClass("checked")) {
						$dom.find('.checkCustomerBox:not(.checked)').addClass('checked');
					} else {
						$dom.find('.checkCustomerBox.checked').removeClass('checked');
					}
				} else {
					if ($customers && $checkedCustomers) {
						if ($customers.length == $checkedCustomers.length) {
							$checkCustomerAll.addClass('checked');
						} else {
							$checkCustomerAll.removeClass('checked');
						}
					}
				}
				// 是否激活合并按钮
				var $customers = $dom.find('.checkCustomerItem'), // 全部顾客
					$checkedCustomers = $dom.find('.checkCustomerItem.checked'); // 选中的顾客
				if ($checkedCustomers && $checkedCustomers.length > 1) {
					if ($mergeCustomerBtn.hasClass("am-disabled")) {
						$mergeCustomerBtn.removeClass("am-disabled");
					}
				} else {
					if (!$mergeCustomerBtn.hasClass("am-disabled")) {
						self.$mergeCustomerBtn.addClass("am-disabled");
					}
				}
			});
			this.$mergeBtnWrap = this.$.find('.mergeWrap'); // 合并按钮及tips
			this.$mergeCustomerBtn = this.$mergeBtnWrap.find('.mergeCustomerBtn').on("vclick", function () {
				var $checkedCustomers = self.$.find('.checkCustomerItem.checked'),
					isRepeated = 1,
					memberId = [];
				if ($checkedCustomers && $checkedCustomers.length) {
					var currentMobile = $($checkedCustomers[0]).parents('tr').data('item').mobile;
					$.each($checkedCustomers, function (i, v) {
						var customerInfo = $(v).parents('tr').data('item');
						if (currentMobile && customerInfo.mobile == currentMobile) {
							memberId.push(customerInfo.id);
						} else {
							isRepeated = 0;
							return true;
						}
					})
					if (!isRepeated) {
						am.msg('亲，您所选会员手机号不同，无法合并');
					} else {
						// 手机号都相同 调合并接口
						am.confirm("合并顾客资料", "顾客资料一旦合并，不可拆分，您确认要合并顾客资料吗？", "确定", "取消", function () {
							self.mergeCustomer(memberId, function (res) {
								//_this.find("b").text("已销单");
								self.$.find(".btnOk").trigger('vclick');
								self.$.find(".memberTab li.selected").trigger('vclick');
								// self.checkIsbilRemark(item);
							});
						}, function () {
							console.log('取消合并');
							// self.$.find('.checkCustomerItem.checked').removeClass('checked');
							// self.resetMergeModule();
						});
					}
				}
			});
			this.$remarkDetail = this.$.find(".remarkDetail").vclick(function(){
				$(this).hide();
			});
			this.pager=new $.am.Paging({
				$:self.$.find(".footcontent"),
				showNum:12,//每页显示的条数
				total:10,//总数
				action:function(_this,index){
					if(self.pageIndex==index) return;
					self.pageIndex=index;
					var typeIndex = self.$.find(".memberTab li.selected").index();
					if(typeIndex !== 1){
						self.getData(self.highSearchOpt);
					}else{
						self.getCardData(self.cardSearchPara);
					}
				}
			});
			this.mainScroll = new $.am.ScrollView({
			    $wrap : this.$.find(".table-content-list"),
			    $inner : this.$.find(".table-content-list table"),
			    direction : [false, true],
				hasInput: false,
				bubble: true
			});
			this.pageIndex=0;
			this.mainScroll.refresh();
			this.$input=$("#page_member .searchphone");
			this.$cardtotal = $('#page_member .cardtotal_box');
			this.$cardtotal.find('.checkSummary').vclick(function(){
				if($(this).text()=='查询中...'){
					return;
				}
				$(this).text('查询中...');
				self.getSummary(self.cardSearchPara);
			});
			//会员卡搜索类型
			this.cardSearchType = 0;
			/*this.$.find(".searchphone").on("vclick",function(){
				var position=self.$input.offset();
				var height=self.$input.height();
				am.keyboard.show({
					onKeyup:function(value){
						self.$input.val(value);
					},
					pos:{
						x:position.left,
						y:position.top+height
					}
				});
			});*/
			this.$.on('input', ".search_box .searchphone", function () {
				var typeIndex = self.$.find(".memberTab li.selected").index();
				var $this = $(this),
					val = $this.val();
				if (typeIndex !== 1) {
					// 顾客搜索
					if (val === "0" || val) {
						var timer = ''
						if (timer && timer.clearExecuted) {
							timer.clearExecuted();
							timer = am.listSelect.handleTimer(function () {
								self.optimizeSearchCustomer($this, val);
							}, 500);
						} else {
							timer = am.listSelect.handleTimer(function () {
								self.optimizeSearchCustomer($this, val);
							}, 500);
						}
					} else {
						am.listSelect.hide();
					}
				} else {
					//卡号搜索类型0
					val = $this.val();
					if (val === "0" || val) {
						var timer = ''
						if (timer && timer.clearExecuted) {
							timer.clearExecuted();
							timer = am.listSelect.handleTimer(function () {
								self.optimizeSearchCard($this, val);
							}, 500);
						} else {
							timer = am.listSelect.handleTimer(function () {
								self.optimizeSearchCard($this, val);
							}, 500);
						}
					} else {
						am.listSelect.hide();
					}
				}


				// var $this = $(this),
				// 	val = $this.val();
				// if (val === "0" || val) {
				// 	var timer = ''
				// 	if (timer && timer.clearExecuted) {
				// 		timer.clearExecuted();
				// 		timer =  am.listSelect.handleTimer(function () {
				// 			self.optimizeSearchCustomer($this,val);
				// 		}, 500);
				// 	} else {
				// 		timer = am.listSelect.handleTimer(function () {
				// 			self.optimizeSearchCustomer($this,val);
				// 		}, 500);
				// 	}
				// } else {
				// 	am.listSelect.hide();
				// }
			}).on("blur", function() {
				am.listSelect.hide();
			});
			this.$.on("vclick",".table-content-list .details",function(){
				var data=$(this).parents("tr").data("item");
				$.am.changePage(am.page.memberDetails, "slideup",{customerId:data.id,tabId:1});
			}).on("vclick",".search_popup_mask",function(){//点击右侧遮罩 关闭
				self.hideRight();
			}).on("vclick",".content_tab span",function(){//点击右侧弹窗 遮罩
				var index = $(this).index();
				self.changeMode(index);
			}).on("vclick",".search_box .ty_inputbox_icon",function(){
				self.highSearchOpt=null;
				self.pageIndex=0;
				var typeIndex = self.$.find(".memberTab li.selected").index();
				if(typeIndex !== 1){
					self.getData();
				}else{
					//卡号搜索类型0
					self.cardSearchType = 0;
					self.getCardData();
				}
				am.listSelect.hide();
			}).on("vclick",".search_box .highSearchBtn",function(){//高级搜索
				self.showRight();//弹出右侧弹窗
				//self.getData();
				//am.metadata.cardTypeList
				var typeIndex = self.$.find(".memberTab li.selected").index();
				if(typeIndex == 1){
					var cardTypeList = am.metadata.cardTypeList;
					var selectDatacard ={
						cardClassSelector:[{"name":"请选择","value":""},{"name":"散客卡","value":"20151212"}]
					}
					for(var i=0;i<cardTypeList.length;i++){
						var obj = {
							"name":cardTypeList[i].cardtypename,
							"value":cardTypeList[i].cardtypeid
						}
						selectDatacard.cardClassSelector.push(obj)
					}
					//console.log(self.selectData.memberClassSelector)
					self.setCardSelect(selectDatacard)
				}
			}).on("vclick",".search_popup_wrap .high_search_btn",function(){//查询按钮
				self.hideSelect();
				var index= $('.search_popup_wrap').find('.content_tab span.selected').index();
				var typeIndex = self.$.find(".memberTab li.selected").index();
				self.pageIndex = 0;
				self.$cardtotal.find('.checkSummary').show().end().find('.data').hide();
				if(typeIndex !== 1){
					self.getSearching(index);
				}else{
					self.getCardsearch();
				}
			}).on("keyup", ".search_box .searchphone", function(e) {//卡号搜索类型0
				var typeIndex = self.$.find(".memberTab li.selected").index();
				self.cardSearchType = 0;
				if (e.keyCode == 13) {
					self.pageIndex=0;
					if(typeIndex !== 1){
						self.getData();
					}else{
						self.getCardData();
					}
					am.keyboard.hide()
				}
				am.listSelect.hide();
			}).on("vclick",".memberTab li",function(){
				am.listSelect.hide();
				self.cardSearchPara = null;
				self.$cardtotal.find('.checkSummary').show().end().find('.data').hide();
				self.hideRight();
				self.highSearchOpt=null;
				self.$input.val("");
				$(this).addClass("selected").siblings().removeClass('selected');
				self.pageIndex=0;
				self.$listTbody.empty();
				var tabindex = $(this).index();
				if(tabindex !== 1){
					self.$stateBox.find('.contentbox').removeClass('card').end().find('.table-content-head thead').eq(1).addClass('hide').siblings('thead').removeClass('hide');
					self.$input.attr("placeholder","输入会员手机号或姓名搜索")
					self.getData();
					self.$cardtotal.addClass('hide');
					self.$.find('.addMemberBtn').show();
				}else{
					
					self.$listTbody.empty();
					self.$cardtotal.removeClass('hide')
					self.$stateBox.find('.contentbox').addClass('card').removeClass('del').end().find('.table-content-head thead').eq(1).removeClass('hide').siblings('thead').addClass('hide');
					self.getCardData();
					self.$input.attr("placeholder","输入卡号搜索")
					self.$.find('.addMemberBtn').hide();
					self.$.find('.highSearchBtn').removeClass('hide');
				}
				if(tabindex == 0){
					if(self.getMergeAccess()){
						self.showMergeModule();
					}else{
						self.hideMergeModule();
					}
				}else{
					self.hideMergeModule();
				}
				if(tabindex==2){
					self.$.find('.highSearchBtn').addClass('hide');
				}else{
					self.$.find('.highSearchBtn').removeClass('hide');
				}
			}).on("vclick",".table-content-list .operate .del",function(){
				var _this=this;
				if(am.operateArr.indexOf("E") !=-1){
					am.confirm("删除顾客", "确认删除此顾客？", "确定", "取消", function() {
						var $tr=$(_this).parents("tr");
						var data=$tr.data("item");
						self.getDelData(data.id,function(){
							/*$tr.remove();*/
							self.pageIndex=0;
							self.getData();
						});
					}, function() {});
				}else{
					am.msg('你没有权限进行此操作！');
				}
			}).on("vclick",".table-content-list .operate .del_restore",function(){
				var _this=this;
				if(am.metadata.userInfo.levelName=="操作员"){
					am.msg('操作员无权限恢复已删顾客');
				}else{
					am.confirm("恢复顾客", "确认恢复此顾客？", "确定", "取消", function() {
						var $tr=$(_this).parents("tr");
						var data=$tr.data("item");
						var opt={
							parentShopId:data.parentshopid,
							memberid:data.id,
							token:am.metadata.userInfo.mgjtouchtoken
						};
						self.restoreMember(opt,function(){
							self.getData();
						});
						// self.getDelData(data.id,function(){
						// 	/*$tr.remove();*/
						// 	self.pageIndex=0;
						// 	self.getData();
						// });
					}, function() {});
				}
			}).on("vclick",".table-content-list .userInfo",function(){
				var data=$(this).parents("tr").data("item");
				$.am.changePage(am.page.memberDetails, "slideup",{
					customerId:data.memberid,
					tabId:1,
					/*cardId:data.cardid,*/
					shopId:data.shopId});
			}).on("vclick", ".table-content-list .icon-good", function () {
				//优质客点击
				am.goodModal.show();
			}).on("vclick",".table-content-list .card_remark div.tdwrap:nth-child(2)",function(){
				if(!$(this).next()){
					return;
				}
				var w = $(this).width();
					t = $(this).offset().top,
					l = $(this).offset().left,
					text = $(this).html();
				self.$remarkDetail.show();
				self.$remarkDetail.find('.text').html(text)
					.end().find('.textwrap').css({
						'min-width': w+'px',
						'max-width': 2*w+'px',
						'bottom': $('body').height()-t+'px'
						// 'left': l-(self.$remarkDetail.find('.text').outerWidth())+'px'
					})
				var offsetLimit = self.$remarkDetail.find('.text').offset().top;
				var offsetIcon = $(this).parents('td').outerWidth()/2;
				if(offsetLimit<20){
					self.$remarkDetail.find('.textwrap').css({
						'max-width': self.$remarkDetail.find('.textwrap').outerWidth()*2 ,
					})
				}
				self.$remarkDetail.find('.icon').css({
					right:(offsetIcon)+'px'
				})
			});
			this.$listTbody=this.$.find(".table-content-list tbody");
			this.$stateBox.on("vclick",".cm_cutting .btn",function(){
				self.getData();
			});
			this.$.find('.addMemberBtn').vclick(function(){
				$.am.changePage(am.page.addMember, "slideup",{
                    onSelect:function(item){
						// $.am.changePage(self, "slidedown");
						//创建顾客后返回
						var opt = [
							{name:'去开卡',key:'openCard'},
							{name:'去买套餐',key:'buyComboCard'},
							{name:'去开单',key:'openBill'},
						]
						am.popupMenu("请选择操作", opt , function (ret) {
							if(ret.key=='openCard'){
								$.am.changePage(amGloble.page.memberCard, "slidedown",{
									reset: item
								});
							}else if(ret.key=='buyComboCard'){
								$.am.changePage(amGloble.page.comboCard, "slidedown",{
									reset: item
								});
							}else if(ret.key=='openBill'){
								$.am.changePage(amGloble.page.openbill, "slidedown",{
									member: item
								});
							}
						},'','',function(){
							$.am.changePage(self, "slidedown");
						});
                    }
                });
			});
			this.$popupWrap=this.$.find('.search_popup_wrap');
			this.$changeModeDom=this.$popupWrap.find('.content_tab');

			this.$memInfo=this.$popupWrap.find('.mem_info');
			this.$startInput=this.$popupWrap.find('.item.space.timer .input_start input,.openday .daybox input.startday');
			this.$endInput=this.$popupWrap.find('.item.space.timer .input_end input,.openday .daybox input.endday');
			this.$popupWrap.find('.mem_info .consumeTimes,.mem_info .consumeFee,.mem_info .point,.mem_info .lastConsumeDate,.mem_info .freebox').on('vclick','.input_start,.input_end,.intxt',function(){
				var _this=this;
				var dot = $(this).data('dot')
				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:(dot==undefined) ? true : dot ? true : false,
				    submit:function(value){
				    	$(_this).text(value);
				    }
				});
			});
			this.$consumeTimes=this.$popupWrap.find('.mem_info .consumeTimes');
			this.$consumeFee=this.$popupWrap.find('.mem_info .consumeFee');
			this.$point=this.$popupWrap.find('.mem_info .point');
			this.$lastConsumeDate=this.$popupWrap.find('.mem_info .lastConsumeDate');
			this.$cardfree = this.$popupWrap.find('.mem_info .cardfree');
			this.$presentfree = this.$popupWrap.find('.mem_info .presentfree')
			//选择框
			this.selectData={
				memberClassSelector:[{"name":"全部","value":""},{"name":"一级客户","value":1},{"name":"二级客户","value":2}],
				customerSourceClassSelector:[{"name":"全部","value":""}]
			};
			this.$comboItems=this.$popupWrap.find('.combo_item').on('vclick','.item_box',function(){
				var $this=$(this);
				if($this.hasClass('selected')){
					$this.removeClass('selected');
				}else{
					$this.addClass('selected');
				}
			});
			this.$itemCate=this.$popupWrap.find('.combo_item .item.checkbox').remove();
			this.$item=this.$itemCate.find('.item_box').remove();
			this.comboItemScroll = new $.am.ScrollView({
			    $wrap : this.$.find(".combo_item"),
			    $inner : this.$.find(".item_inner"),
			    direction : [false, true],
			    hasInput: false
			});
			this.memInfoScroll = new $.am.ScrollView({
			    $wrap : this.$.find(".mem_info"),
			    $inner : this.$.find(".mem_inner"),
			    direction : [false, true],
			    hasInput: false
			});
			this.comboItemScroll.refresh();
			this.memInfoScroll.refresh();
			this.setSelect(this.selectData);
			this.setRadio();
			this.highSearchOpt=null;
			this.cardSearchPara = null;
		},
		mergeCustomer:function(memberIds,callback){
			var userInfo = am.metadata.userInfo;
			am.loading.show("正在合并,请稍候...");
			am.api.mergeCustomer.exec({
				"shopid": userInfo.shopId,
				"memberIds": memberIds,
				"operator": userInfo.userName || '',
				"shopName": (userInfo.shopName || '') + (userInfo.osName || ''),
			}, function (res) {
				am.loading.hide();
				console.log(res);
				if (res.code == 0) {
					am.msg("会员合并成功");
					callback && callback(res);
				} else {
					am.msg(res.message || "数据获取失败,请检查网络!");
				}
			});
		},
		showMergeModule:function(){
			// 显示合并会员模块
			// 合并会员权限
			this.$mergeBtnWrap.show();
			this.$.find('.checkCustomerBox').show();
			this.resetMergeModule();
		},
		hideMergeModule:function(){
			// 隐藏会员合并模块
			this.$mergeBtnWrap.hide();
			this.$.find('.checkCustomerBox').hide();
		},
		getMergeAccess:function(){
			return am.operateArr.indexOf('MGJMM')>-1;
		},
		resetMergeModule:function(){
			// 重置会员合并模块
			if(!this.$mergeCustomerBtn.hasClass('am-disabled')){
				this.$mergeCustomerBtn.addClass('am-disabled')
			}
			this.$.find('.checkCustomerBox').removeClass('checked');
		},
		optimizeSearchCard: function ($dom, val) {
			// am.api.optimizeSearchCard.exec({
			// 	"shopId": am.metadata.userInfo.shopId,
			// 	"keyword": val
			// }, function (res) {
			// 	am.loading.hide();
			// 	console.log(res);
			// 	if (res.code == 0) {
			// 		console.log(res);
			// 		am.listSelect.show({
			// 			$: $dom.parents('.searchinput'),
			// 			data: res.content
			// 		});
			// 	} else {}
			// });
		},
		optimizeSearchCustomer: function ($dom, val) {
				// am.api.optimizeSearchCustomer.exec({
				// 	"shopId": am.metadata.userInfo.shopId,
				// 	"keyword": val
				// }, function (res) {
				// 	am.loading.hide();
				// 	console.log(res);
				// 	if (res.code == 0) {
				// 		console.log(res);
				// 		am.listSelect.show({
				// 			$: $dom.parents('.searchinput'),
				// 			data: res.content
				// 		});
				// 	} else {}
				// });
			},
		beforeShow : function(paras) {
			console.log(paras)
			am.tab.main.show();
			am.tab.main.select(5);
			self.$input.val("");
			if(paras=="back") return;
			self.$.find(".memberTab li").eq(0).trigger('vclick');
			var ts = amGloble.now();
			this.calendarInstanceStart=this.$startInput.mobiscroll().calendar({
			    theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
			    months: "auto",
			    max: ts,
			    setOnDayTap: true,
				buttons: [],
				endYear: amGloble.now().getFullYear()+50,
			    onSet: function(valueText, inst) {
			        console.log(valueText);
			        self.$startInput.val(new Date(valueText.valueText).format("yyyy.mm.dd"));
                }
			});
			this.calendarInstanceEnd=this.$endInput.mobiscroll().calendar({
			    theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
			    months: "auto",
			    max: ts,
			    setOnDayTap: true,
				buttons: [],
				endYear: amGloble.now().getFullYear()+50,
			    onSet: function(valueText, inst) {
			        console.log(valueText);
			        self.$endInput.val(new Date(valueText.valueText).format("yyyy.mm.dd"));
			    }
			});
		},
		afterShow : function(paras) {
			if(paras=="back") return;
			self.highSearchOpt=null;
			this.cardSearchPara = null;
			this.comboItemScroll.refresh();
			this.memInfoScroll.refresh();
			this.Select.memberClassSelector.refresh(self.getMemberCate());
			this.Select.customerSourceClassSelector.refresh(self.getCustomerSourceCate());
			this.getItems();
		},
		beforeHide : function(paras) {
			this.hideSelect();
		},
		hideTable:function(flag){
			if(flag){
				this.$.find(".contentbox,.footcontent").hide();
			}else{
				this.$.find(".contentbox,.footcontent").show();
			}
		},
		render:function(res){
			var sex={
				"F":"女",
				"M":"男"
			}
			var $tbody = this.$listTbody.empty();
			var deleted=this.$.find(".memberTab li.selected").index();
			
			var isLowVersion=false;//风尚版、青春版小掌柜顾客界面需要隐藏消费金额和次数和客单价
			var mgjVersion=am.metadata.userInfo.mgjVersion;//版本信息
			if(mgjVersion==4||mgjVersion==2){
				isLowVersion=true;
			}
			//缩帐等级
			var SHRINK_LEVEL = amGloble.metadata.configs.SHRINK_LEVEL ? amGloble.metadata.configs.SHRINK_LEVEL : '0';
			if(res.content && res.content.length){
				for(var i=0;i<res.content.length;i++){
					var item=res.content[i];
					if(am.operateArr.indexOf("MGJP") !=-1){
						item.realMobile = item.mobile;
						// item.mobile = item.mobile.replace(/\d{4}$/,"****");
						// s.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");
						item.mobile = item.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
					}

			        var $thtml=$('<tr>'+
			        '<td><div class="tdwrap">'+'<span class="checkCustomerItem checkCustomerBox am-clickable"></span>'+item.name+'</div></td>'+
			        '<td><div class="tdwrap">'+sex[item.sex]+'</div></td>'+
			        '<td><div class="tdwrap">'+am.processPhone(item.mobile)+'</div></td>'+
			        // (SHRINK_LEVEL == '0' ? '<td><div class="tdwrap">'+(item.avgfee*1==0?0:item.avgfee.toFixed(0))+'元</div></td>' : '') +
					// (SHRINK_LEVEL == '0' ? '<td><div class="tdwrap">'+item.mgjlast12mtotal.toFixed(1)+'元</div></td>' : '') +
					(SHRINK_LEVEL == '0' ? '<td class="lowVersion"><div class="tdwrap">'+(item.avgfee*1==0?0:item.avgfee.toFixed(0))+'元</div></td>' : '<td class="none"><div class="tdwrap"></div></td>') +
					(SHRINK_LEVEL == '0' ? '<td class="lowVersion"><div class="tdwrap">'+item.mgjlast12mtotal.toFixed(1)+'元</div></td>' : '<td class="none"><div class="tdwrap"></div></td>') +
			        '<td class="lowVersion"><div class="tdwrap">'+item.mgjlast12mfreq+'次</div></td>'+
			        '<td><div class="tdwrap">'+((item.lastconsumetime || item.mgjlastcashiertime)?am.time2str((item.lastconsumetime || item.mgjlastcashiertime)/1000):"--")+'</div></td>'+
			        '<td><div class="tdwrap">'+item.currpoint+'</div></td>'+
			        '<td><div class="tdwrap">'+am.time2str(item.registdate/1000)+'</div></td>'+
			        '<td>'+
				        '<div class="tdwrap operate">'+
	                    '</div>'+
	                '</td>'+
					'</tr>').data("item",item);
					var good = '<div class="tdwrap"><span class="name">'+'<span class="checkCustomerItem checkCustomerBox am-clickable"></span>'+ item.name +'</span><span class="icon-good am-clickable"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-youzhike"></use></svg></span></div>';
					if(deleted==2){
						//已删除
						var del = '<span class="del_restore am-clickable">恢复</span>';
						$thtml.find(".operate").html(del);
			        	this.$.find(".contentbox").addClass("del");
						self.$.find('.highSearchBtn').addClass('hide');
			        }else if(deleted == 0){
						var $del = '<span class="details am-clickable">详情</span><span class="del am-clickable">删除</span>';
						// if(am.metadata.userInfo.operatestr.indexOf("a40") > -1){//是否禁止删除顾客
						// 	$del = '<span class="details am-clickable nodel">详情</span>';
						// }
			        	$thtml.find(".operate").html($del);
			        	this.$.find(".contentbox").removeClass("del");
						self.$.find('.highSearchBtn').removeClass('hide');
						if(item.mgjIsHighQualityCust == 1){
							$thtml.find("td").eq(0).html(good);
						}
			        }else if(deleted == 1){
						this.$.find(".contentbox").removeClass("del");
						self.$.find('.highSearchBtn').removeClass('hide');
					}	
					$tbody.append($thtml);
				}
				if(isLowVersion){
					$('#page_member').find('.lowVersion').hide();//风尚版、青春版小掌柜顾客界面需要隐藏消费金额和次数和客单价
				}else{
					$('#page_member').find('.lowVersion').show();
				}

				//缩帐等级
				var SHRINK_LEVEL = amGloble.metadata.configs.SHRINK_LEVEL ? amGloble.metadata.configs.SHRINK_LEVEL : '0',
					tdDom = $('#page_member .table-content-head .cm_table td');
		
				if( SHRINK_LEVEL > '0' && tdDom.hasClass('lowVersion')) {
					tdDom.eq(3).hide();
					tdDom.eq(4).hide();
				}else {}

				this.pager.refresh(res.pageIndex,res.count);
				this.$stateBox.removeClass('cutting empty');
			}else{
				this.$stateBox.removeClass('cutting').addClass("empty");
			}
			this.mainScroll.refresh();
			this.mainScroll.scrollTo("top");

			if(this.$.find(".memberTab li.selected").index() == 0){
				if(this.getMergeAccess()){
					this.showMergeModule();
				}else{
					this.hideMergeModule();
				}
			}else{
				this.hideMergeModule();
			}
		},
		getDelData:function(memberid,callback){
			am.loading.show("正在删除,请稍候...");
			am.api.delMember.exec({
				"memberid":memberid,
				"parentShopId":am.metadata.userInfo.parentShopId
			}, function(res) {
			    am.loading.hide();
			    console.log(res);
			    if (res.code == 0) {
			    	callback && callback();
			    	am.msg("删除成功");

			    }else {
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});
		},
		restoreMember:function(opt,callback){
			am.loading.show("正在删除,请稍候...");
			am.api.resume.exec(opt, function(res) {
			    am.loading.hide();
			    console.log(res);
			    if (res.code == 0) {
			    	callback && callback();
			    	am.msg("恢复成功");

			    }else {
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});
		},
		getData:function(data){
			var metadata=am.metadata;
			var deleted=this.$.find(".memberTab li.selected").index();
			var value=this.$.find(".search_box .searchphone").val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g,'');
			this.$.find(".search_box .searchphone").val(value)
			am.loading.show("正在获取,请稍候...");
			var opt={
			    "shopId":metadata.userInfo.shopId,//metadata.userInfo.shopId
			    "pageNumber":self.pageIndex,
			    "pageSize":12,
			    "deleted":deleted==0 ? 0 : 1,//0为资料 1为已删
			    "keyword":value,
			    "searchType":"0"
			};
			if(data)
				$.extend(opt,data);
			console.log(opt)
			am.api.memberList.exec(opt, function(res) {
			    am.loading.hide();
			    console.log(res);
			    if (res.code == 0) {
			    	self.render(res);
			    }else {
			    	self.$stateBox.removeClass('empty').addClass("cutting");
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});
		},
		renderCard:function(res){
			var sex={
				"F":"女",
				"M":"男"
			}
			var $tbody = this.$listTbody.empty();
			if(res.content && res.content.length){
				var cardTypeList = am.metadata.cardTypeList.concat(am.metadata.defaultCardTypeList);
				for(var i=0;i<res.content.length;i++){
					var item=res.content[i];
					if(am.operateArr.indexOf("MGJP") !=-1){
						item.realMobile = item.mobile;
						// item.mobile = item.mobile.replace(/\d{4}$/,"****");
						// s.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");
						item.mobile = item.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');//隐藏会员手机号中间四位
					}
					var cardtypename = '';
					for(var j=0;j<cardTypeList.length;j++){
						if(item.cardtypeid == cardTypeList[j].cardtypeid){
							cardtypename = cardTypeList[j].cardtypename
						}
					}
					var invaliddate = '';
					if(item.invaliddate){
						var invaliddateArray = item.invaliddate.split('-')
						if(invaliddateArray[1].length == 1){
							invaliddateArray[1] = '0'+invaliddateArray[1];
						}
						if(invaliddateArray[2].length == 1){
							invaliddateArray[2] = '0'+invaliddateArray[2];
						}
						invaliddate = invaliddateArray.join('-');
					}
					//var invaliddate = (item.invaliddate ? (new Date(item.invaliddate)).format('yyyy-mm-dd') : ''); 
					// item.mobile
					var $html = $('<tr>'+
						'<td><div class="tdwrap">'+item.cardid+'</div></td>'+
						'<td><div class="tdwrap">'+(cardtypename ? cardtypename : '散客卡')+'</div></td>'+
						'<td><div class="tdwrap"><a href="javascript:" class="userInfo am-clickable">'+item.name+'</a></div></td>'+
						'<td><div class="tdwrap">'+sex[item.sex]+'</div></td>'+
						'<td><div class="tdwrap">'+am.processPhone(item.mobile)+'</div></td>'+
						'<td><div class="tdwrap">'+(item.cardfee ? item.cardfee : 0)+'</div></td>'+
						'<td><div class="tdwrap">'+(item.presentfee ? item.presentfee : 0)+'</div></td>'+
						'<td><div class="tdwrap">'+am.time2str(item.opendate/1000)+'</div></td>'+
						'<td><div class="tdwrap">'+invaliddate+'</div></td>'+
						'<td class="card_remark"><div class="tdwrap">'+(item.cardRemark || '')+'</div><div class="tdwrap am-clickable">'+(item.cardRemark || '')+'</div><div class="triangle"></div></td>'+
						'</tr>').data('item',item);
						var good = '<div class="tdwrap"><a class="name userInfo am-clickable">'+ item.name +'</a><span class="icon-good am-clickable"></span></div>';
						if(item.mgjIsHighQualityCust == 1){
							$html.find("td").eq(2).html(good);
						}
						$tbody.append($html)
				}
				var trs = this.$listTbody.find('tr');
				for(var i=0;i<trs.length;i++){
					var w1 = $(trs[i]).find('.card_remark div.tdwrap:nth-child(1)').width(),
						w2 = $(trs[i]).find('.card_remark div.tdwrap:nth-child(2)').width();
					if(w1<=w2){
						$(trs[i]).find('.triangle').remove().end().find('div.tdwrap').removeClass('am-clickable');
					}
				}
				this.$stateBox.removeClass('cutting empty');
			}else{
				this.$stateBox.removeClass('cutting').addClass("empty");
			}
			// this.$$cardtotal.find('.totalnum').text(res.count).end().find('.totalfee').text(res.totalFee).end().find('.totalPresentFee').text(res.totalPresentFee);
			this.mainScroll.refresh();
			this.mainScroll.scrollTo("top");
			this.pager.refresh(self.pageIndex,res.count);
		},
		getSummary:function(opt){
			var metadata = am.metadata;
			var cardNo=this.$input.val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g,'');
			this.$input.val(cardNo)
			// am.loading.show("正在获取，请稍候...");
			//console.log(opt)
			var detail = {
				"shopId":metadata.userInfo.shopId,
				"pageNumber":self.pageIndex,
				"pageSize":12,
				"searchType":this.cardSearchType,
				"cardNo":opt ? '' : cardNo,
				"cardType":opt ? (opt.cardtypeid ? opt.cardtypeid : null) : null,
				"cardFeeBegin": opt ? (opt.freeObj.cardfree.start ? opt.freeObj.cardfree.start : "") : "",
				"cardFeeEnd": opt ? (opt.freeObj.cardfree.end ? opt.freeObj.cardfree.end : "") : "",
				"presentfeeBegin": opt ? (opt.freeObj.presentfree.start ? opt.freeObj.presentfree.start : "") : "",
				"presentfeeEnd": opt ? (opt.freeObj.presentfree.end ? opt.freeObj.presentfree.end : "") : "",
				"invalidDays": this.$popupWrap.find('.dueday .intxt').text(),
				"openDateBegin":opt ? (opt.openDate.start ? opt.openDate.start : null) : null,
				"openDateEnd":opt ? (opt.openDate.end ? opt.openDate.end : null) : null
			}
			console.log(detail)
			am.api.cardListTemp.exec(detail,function(res){
				// am.loading.hide();
			    console.log(res);
				if(res.code == 0){
					self.$cardtotal.find('.checkSummary').text('查询汇总');
					self.$cardtotal.find('.checkSummary').hide().end().find('.data').show();
					self.$cardtotal.find('.totalnum').text(res.count).end().find('.totalfee').text(res.totalFee).end().find('.totalPresentFee').text(res.totalPresentFee);
				}else{
					self.$cardtotal.find('.checkSummary').text('查询失败,重新查询');
				}
			})
		},
		getCardData:function(opt){
			var metadata = am.metadata;
			var cardNo=this.$input.val().replace(/[\s\r\n\\\/\'\"\‘\’\“\”]/g,'');
			this.$input.val(cardNo)
			am.loading.show("正在获取，请稍候...");
			//console.log(opt)
			var detail = {
				"shopId":metadata.userInfo.shopId,
				"pageNumber":self.pageIndex,
				"pageSize":12,
				"searchType":this.cardSearchType,
				"cardNo":opt ? '' : cardNo,
				"cardType":opt ? (opt.cardtypeid ? opt.cardtypeid : null) : null,
				"cardFeeBegin": opt ? (opt.freeObj.cardfree.start ? opt.freeObj.cardfree.start : "") : "",
				"cardFeeEnd": opt ? (opt.freeObj.cardfree.end ? opt.freeObj.cardfree.end : "") : "",
				"presentfeeBegin": opt ? (opt.freeObj.presentfree.start ? opt.freeObj.presentfree.start : "") : "",
				"presentfeeEnd": opt ? (opt.freeObj.presentfree.end ? opt.freeObj.presentfree.end : "") : "",
				"invalidDays": this.$popupWrap.find('.dueday .intxt').text(),
				"openDateBegin":opt ? (opt.openDate.start ? opt.openDate.start : null) : null,
				"openDateEnd":opt ? (opt.openDate.end ? opt.openDate.end : null) : null
			}
			console.log(detail)
			am.api.cardList.exec(detail,function(res){
				am.loading.hide();
			    console.log(metadata);
				if(res.code == 0){
					//会员卡
					self.renderCard(res);
				}else{
					self.$stateBox.removeClass('empty').addClass("cutting");
			        am.msg(res.message || "数据获取失败,请检查网络!");
				}
				if(opt){
					self.hideRight();
				}
			})
		},
		showRight:function(){
			var typeIndex = self.$.find(".memberTab li.selected").index();
			this.$.addClass('popup');
			if(typeIndex !== 1){
				self.$.find('.search_popup_wrap').eq(0).removeClass('hide').end().eq(1).addClass('hide');
				this.changeMode(0);
			}else{
				self.$.find('.search_popup_wrap').eq(1).removeClass('hide').end().eq(0).addClass('hide');
			}
		},
		hideRight:function(){
			var typeIndex = self.$.find(".memberTab li.selected").index();
			this.$.removeClass('popup');
			this.$startInput.val('');
			this.$endInput.val('');
			if(typeIndex !== 1){
				this.changeMode(0);
				this.setRadio();
			}else{
				//this.$.find('.memberClassSelector .common_selectBox:gt(0)').remove();
				this.$.find('.cardClassSelector').empty();
				this.$startInput.val('');
				this.$endInput.val('');
				this.$popupWrap.find('.dueday .intxt').text('');
				this.$popupWrap.find('.freebox .intxt').each(function(){
					$(this).text('');
				})								
			}
		},
		setRadio:function(){
			this.$radio=this.$popupWrap.find('.item_wrap.radio').off().on("vclick",'.item_box',function(){
				$(this).addClass('selected').siblings().removeClass('selected');
			});
			this.$radio.find('.item_box.selected').removeClass('selected');
		},
		getRadioValue:function(){
			var $selected= this.$radio.find('.item_box.selected'),index=-1;
			if($selected.length>0){
				index=$selected.index();
				return index==0?'M':'F';
			}else{
				return null;
			}	
		},
		changeMode:function(index){
			if(index==0){
				this.$changeModeDom.find('span').eq(0).addClass('selected').siblings().removeClass('selected');
				this.$popupWrap.removeClass('combo');
			}else{
				this.$changeModeDom.find('span').eq(1).addClass('selected').siblings().removeClass('selected');
				this.$popupWrap.addClass('combo');
			}
			this.comboItemScroll.refresh();
			this.memInfoScroll.refresh();
			this.comboItemScroll.scrollTo("top");
			this.memInfoScroll.scrollTo("top");
			this.clearBox();
		},
		getMemberCate:function(){//获取会员分类
			var cate=am.metadata.memberClass;
			var res=[{"name":"请选择",value:""}];
			if(cate && cate.length){
				for(var i=0;i<cate.length;i++){
					var item=cate[i];
					res.push({
						name:item.classname,
						value:item.classid
					});
				}
			}
			return res;
		},
		// 获取顾客来源分类
		getCustomerSourceCate:function(){
			var memSourceList = am.metadata.memSourceList;
			var res=[{"name":"请选择",value:""}];
			if(memSourceList && memSourceList.length){
				for(var i=0;i<memSourceList.length;i++){
					var item=memSourceList[i];
					res.push({
						name:item.sourceName,
						value:item.sourceId
					});
				}
			}
			return res;
		},
		getItems:function(){//获取项目
			var items=am.metadata.classes;
			this.$popupWrap.find('.combo_item .item_inner').empty();
			$.each(items,function(i,item){
				var $itemCate = self.$itemCate.clone(true,true);
				$itemCate.find('.item_label').html(item.name);
				$.each(item.sub,function(j,jtem){
					var $item=self.$item.clone(true,true).data('itemid',jtem.itemid);
					$item.find('.text').html(jtem.name);
					$itemCate.find('.item_wrap').append($item);
				})
				if(item.sub.length>0)
					self.$comboItems.find('.item_inner').append($itemCate);
			})
			this.comboItemScroll.refresh();
			this.memInfoScroll.refresh();
			this.comboItemScroll.scrollTo("top");
			this.memInfoScroll.scrollTo("top");
		},
		setSelect:function(data){
			var $dom_memType=this.$.find(".search_popup_wrap .item.select.memType");
			var $dom_customerSourceType=this.$.find(".search_popup_wrap .item.select.customerSourceType");
			var $domObj = {
				'memberClassSelector': $dom_memType,
				'customerSourceClassSelector':  $dom_customerSourceType
			}
			this.Select={};
			for(var i in data){
				this.Select[i]=new $.am.Select({
					$:$domObj[i].find("."+i),
					startWidth:0,
					data:data[i],
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
		getSelectValue:function(){
			var Select=this.Select;
			var res={};
			var key={
				memberClassSelector:"memType",//会员分类
				customerSourceClassSelector: "customerSourceType"// 顾客来源分类
			};
			for(var i in Select){
				res[key[i]]=Select[i].getValue();
			}
			return res;
		},
		getRegisterDateValue:function(){
			var res={};
			var start=this.$startInput.val();
			var end=this.$endInput.val();
			start && (res.start=start);
			end && (res.end=end);
			if(start && end && (new Date(start).getTime()-new Date(end).getTime()>=86400000)){
				return null;
			}
			return res;
		},
		getSpaceValue:function(){
			var res = {};
			res.consumeTimes=this.checkValue(this.$consumeTimes);
			res.consumeFee=this.checkValue(this.$consumeFee);
			res.point=this.checkValue(this.$point);
			res.lastConsumeDate=this.checkValue(this.$lastConsumeDate);
			//余额和赠送金
			res.cardfree = this.checkValue(this.$cardfree);
			res.presentfree = this.checkValue(this.$presentfree);	
			return res;
		},
		checkValue:function($dom){
			var res={};
			var start=$dom.find('.input_start').text() || $dom.find('.intxt').eq(0).text();
			var end=$dom.find('.input_end').text() || $dom.find('.intxt').eq(1).text();
			start && (res.start=start);
			end && (res.end=end);
			if( start && end && start*1>end*1 ){
				return null;
			}
			return res;
		},
		getSearching:function(index){
			var opt={};
			if(index==0){
				var sex=this.getRadioValue();
				var memType=this.getSelectValue()['memType'];
				var customerSourceType=this.getSelectValue()['customerSourceType'];
				var registerDate=this.getRegisterDateValue();
				var spaceRes=this.getSpaceValue();
				console.log(spaceRes);
				if(sex){
					opt.sex=sex;
				}
				if(memType){
					opt.memType=memType;
				}
				if(customerSourceType){
					opt.memSourceId=customerSourceType;
				}
				if(!registerDate){
					am.msg('设置的注册开始时间大于结束时间！');
					return ;
				}
				
				registerDate.start && (opt.registerDateBegin=registerDate.start);
				registerDate.end && (opt.registerDateEnd=registerDate.end);
				if(!spaceRes.consumeTimes){
					am.msg('消费次数起始值大于结束值！');
					return;
				}
				if(!spaceRes.consumeFee){
					am.msg('消费金额起始值大于结束值！');
					return;
				}
				if(!spaceRes.point){
					am.msg('积分起始值大于结束值！');
					return;
				}
				if(!spaceRes.lastConsumeDate){
					am.msg('上次消费至今起始值大于结束值！');
					return;
				}
				spaceRes.consumeTimes.start && (opt.consumeTimesBegin=spaceRes.consumeTimes.start);
				spaceRes.consumeTimes.end && (opt.consumeTimesEnd=spaceRes.consumeTimes.end);
				spaceRes.consumeFee.start && (opt.consumeFeesBegin=spaceRes.consumeFee.start);
				spaceRes.consumeFee.end && (opt.consumeFeesEnd=spaceRes.consumeFee.end);
				spaceRes.point.start && (opt.pointBegin=spaceRes.point.start);
				spaceRes.point.end && (opt.pointEnd=spaceRes.point.end);
				spaceRes.lastConsumeDate.start && (opt.lastConsumeDateBegin=this.dataFormat('end',spaceRes.lastConsumeDate.end || spaceRes.lastConsumeDate.start));
				spaceRes.lastConsumeDate.end && (opt.lastConsumeDateEnd=this.dataFormat('start',spaceRes.lastConsumeDate.start || spaceRes.lastConsumeDate.end));
				console.log(opt);
				opt.searchType='1';
				this.highSearchOpt=opt;
			}else{
				var $items=self.$comboItems.find('.item_box.selected');
				var treatItemIds=[];
				if($items.length>0){
					$.each($items,function(i,item){
						if($(item).hasClass('selected')){
							var data = $(item).data('itemid');
							treatItemIds.push(data);
						}
					})
				}else{
					am.msg('请至少选择一个项目！');
					return;
				}
				console.log(treatItemIds);
				opt.treatItemIds=treatItemIds;
				opt.searchType='2';
				this.highSearchOpt=opt;
			}
			self.hideRight();
			this.getData(opt);
		},
		clearBox:function(){
			this.$memInfo.find('.item.radio .item_box').removeClass('selected')
			.end().find('.item.space.consumeTimes .input_start,.item.space.consumeTimes .input_end').empty()
			.end().find('.item.space.consumeFee .input_start,.item.space.consumeFee .input_end').empty()
			.end().find('.item.space.point .input_start,.item.space.point .input_end').empty()
			.end().find('.item.space.lastConsumeDate .input_start,.item.space.lastConsumeDate .input_end').empty()
			.end().find('.item.space.timer .input_start input,.item.space.timer .input_end input').val('');
			this.Select['memberClassSelector'].setValue(0);
			this.Select['customerSourceClassSelector'].setValue(0);
			this.$comboItems.find('.item.checkbox .item_box').removeClass('selected');
			this.hideSelect();
		},
		hideSelect:function(){
			var Select=this.Select;
			for(var i in Select){
				Select[i].hide(true);
			}
		},
		getCardsearch:function(){
			var opt = {};
			this.cardSearchType = 1;
			this.pageIndex = 0;
			this.$input.val('');
			opt.freeObj = this.getSpaceValue();
			opt.openDate = this.getRegisterDateValue();
			if(!opt.freeObj.cardfree){
				am.msg('余额起始值大于结束值！')
				return;
			}
			if(!opt.freeObj.presentfree){
				am.msg('赠送金起始值大于结束值！')
				return;
			}
			//console.log(opt.openDate.start.split('.').join('-')+ " 00:00:00",opt.openDate.end.split('.').join('-')+ " 23:59:59");
			if(!opt.openDate){
				am.msg('开卡日期开始时间大于结束时间！');
				return;
			}
			opt.openDate.start && (opt.openDate.start = opt.openDate.start.split('.').join('-')+ " 00:00:00");
			opt.openDate.end && (opt.openDate.end = opt.openDate.end.split('.').join('-')+ " 23:59:59");
			opt.cardtypeid = this.SelectCard['cardClassSelector'].getValue()
			console.log(opt)
			//console.log(this.getCardTypeId())
			this.getCardData(opt);

			this.cardSearchPara = opt;
		},
		setCardSelect:function(data){
			var $dom=this.$.find(".search_card_wrap .item.select");
			this.SelectCard={};
			for(var i in data){
				this.SelectCard[i]=new $.am.Select({
					$:$dom.find("."+i),
					startWidth:0,
					data:data[i],
					key:i,
					vclickcb:function(key){
						for(var j in self.data){
							if(key != j){
								self.Select[j].hide(true);
							}
						}
					}
				});
			}
		},
		dataFormat:function(key,num){
			var now = new Date();
			var date = now.getDate();
			now.setDate(date-num);
			var t = {
				'y': now.getFullYear(), //年份 
		        "m": ((now.getMonth() + 1)>=10?(now.getMonth() + 1):('0'+(now.getMonth() + 1))), //月份 
		        "d": now.getDate()>=10?now.getDate():('0'+now.getDate()), //日 
		    };
			if(key=='start'){
				return t.y+'-'+t.m+'-'+t.d+' '+'23:59:59';
			}else{
				return t.y+'-'+t.m+'-'+t.d+' '+'00:00:00';
			}
		},
	});
})();

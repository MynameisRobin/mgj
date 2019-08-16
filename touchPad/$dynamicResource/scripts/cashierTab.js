am.cashierTab = {
	init:function () {
		var self = this;
		this.isOpenBill = true;
		this.$ = $('#tab_cash');
		this.$t = $('#cashierTotalPanel');

		this.showWorkStation.init();

		// 修改底部备注
		this.$editRemark = this.$t.find(".editRemark").vclick(function(){
			var data = self.billData;
			var sendData = data.data?JSON.parse(data.data):{};
			var $this = $(this);
			var $info = $(this).find(".info");
			am.hangupRemark.show({
				value: data.instorecomment || "",
				billData:data,
				submit:function (res) {
					var remark = res.textarea;
					sendData.billRemark = res;
					delete sendData.billRemark.textarea;
					am.loading.show();
					am.api.hangupSave.exec({
						id:data.id,
						data:JSON.stringify(sendData),
						instorecomment:remark,
						parentShopId:am.metadata.userInfo.parentShopId,
						shopId:am.metadata.userInfo.shopId,
						serviceNO:data.serviceNOBak?data.serviceNOBak:(data.serviceNO?data.serviceNO:'')
					}, function(ret){
						am.loading.hide();
						if(ret && ret.code===0){
							am.msg("修改成功");
							data.instorecomment = remark;
							data.data = sendData;
							self.rendBillRemark(data,$this);
							if(remark){
								$info.html(remark);
							}else {
								$info.html('');
							}  
						} else {
							am.msg("保存失败！");
						}
					});
				}
			});
		});

		this.$t.find(".editRemark").on("vclick",".remarkCardBox span",function(e){
			e.stopPropagation();
			var data = $(this).data("item");
			var item = am.clone(self.billData);
			var sdata = am.clone(am.page.hangup.getBillData(item)); 
			var sname = $(this).data("sname");
			var $this = $(this);
			var tips = "确定要更改状态吗？";
			if(sname == 'opencard'){
				tips = "确定要更改开卡状态吗？";
			}
			if(sname == 'recharge'){
				tips = "确定要更改充值状态吗？";
			}
			if(sname == 'package'){
				tips = "确定要更改套餐状态吗？";
			}
			am.confirm("提示",tips,"确定","取消",function(){
				data.isbuy = !data.isbuy;
				if(data.isbuy){
					$this.addClass("selected");
				}else{
					$this.removeClass("selected");
				}
				if(sname == 'package'){
					sdata.billRemark.buypackage = data;
					if(data.isbuy){
						$this.addClass("selected").siblings(".package").addClass("selected");
					}else{
						$this.removeClass("selected").siblings(".package").removeClass("selected");
					}
				}else{
                    sdata.billRemark[sname] = data;
				}
				var temp = item;
				item.data = JSON.stringify(sdata);
				am.page.hangup.saveBill(item);
				temp.data = sdata;
				self.billData = temp; 
			});
		})

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
						am.billOriginData = items;
						$.am.changePage(am.page.openbill, "",{rowdata:items,source:"service"});//source:"service",
					});
				});
			}
			
		});
		this.$memberUl.on('vhold','li',function(){
			var index = $(this).index();
			if(am.metadata.shopPropertyField != undefined && am.metadata.shopPropertyField.openSmallProgram) {
				var items = self.billData ;
				var emp = items['emp'+(index+1)];
				if(emp==-1){
					return false;
				}else{
					am.editQueue.showMadal(am.metadata.userInfo.parentShopId,emp);
				}
			}else{
				$('.qrCodeInner').show();
				$('.beforeOpen').show();
			}
		})
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
		this.$openWorkStation = this.$.find('.workStation').vclick(function(){
			self.showWorkStation.show();
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
			self.getOpt(function (opt) {
				if(!opt){
					return am.msg("请设定项目价格");
				}
				self.getDisplayId(opt,function(items){
					self.hangupSave(items);
				});
			});
		});
		// this.$goItemPayConfirm=$('#goItemPayConfirm').on('vclick','.OK',function(){

		// }).on('vclick','.cancel',function(){

		// }).on('vclick','.close',function(){

		// });
		this.$t.find('.submit').vclick(function () {
			var $this=$(this);
			var isItemPay = $this.hasClass('itemPay');
			var submitFn = function (isPayItem) {
				// 校验购物车是否有库存为0的商品
				// var isItemPay = $this.hasClass('itemPay');
				if(isPayItem){
					isItemPay=isPayItem;
				}
				var prodsInfo = am.page.product.submit();
				var numObj = am.page.product.numObj; //商品库存数据
				if (numObj && prodsInfo && prodsInfo.option && prodsInfo.option.products && prodsInfo.option.products.depots.length) {
					var prods = prodsInfo.option.products.depots;
					var tips = "";
					var hasEmptyProd = false;
					for (var i = 0, len = prods.length; i < len; i++) {
						var item = prods[i];
						if (numObj[item.productid] == 0) {
							tips += item.productName + "、";
							hasEmptyProd = true;
						}
					}
					tips = tips.substring(0, tips.length - 1); // 去掉最后的、
					tips += '商品此时已无库存，仍要继续支付吗?';
					console.log(tips);
					if (hasEmptyProd) {
						// 购物车里有库存为0的商品
						var allowed = amGloble.metadata.shopPropertyField.depotNumGt0; //0 允许  1 不允许
						if (allowed) {
							// 没权限
							am.msg('有库存为0的商品，无法结算');
						} else {
							// 有权限
							self.submitEvent(isItemPay);
						}
					} else {
						// 购物车里没有库存为0的商品
						self.submitEvent(isItemPay);
					}
				} else {
					self.submitEvent(isItemPay);
				}
			}
			// 是否包含赠金不可用项目
			var disableUseItemsStr='';
			var itemsObj=am.page.service.submit();
			//选择了会员卡并且要购买服务项目
			if(itemsObj.member && itemsObj.member.cardTypeId && itemsObj.option && itemsObj.option.serviceItems && itemsObj.option.serviceItems.length){
				var checkedServiceItems=itemsObj.option.serviceItems;
				var cardInfo=am.metadata.cardTypeMap[itemsObj.member.cardTypeId];
				if(cardInfo && cardInfo.restrictedtype==1 && cardInfo.restricteditems){
					// 指定服务项目可用
					var restricteditemsStr=cardInfo.restricteditems.split(',');// 指定的项目itemid 字符串
					// 指定了服务项目
					for(var ss=0,sslen=checkedServiceItems.length;ss<sslen;ss++){
						var checkedItemId=checkedServiceItems[ss].itemId;
						if(restricteditemsStr && restricteditemsStr.indexOf(checkedItemId)==-1 && checkedServiceItems[ss].salePrice>0){
							// 需要支付金额的服务项目
							disableUseItemsStr+='、'+checkedServiceItems[ss].itemName;
						}
					}
				}else if(cardInfo && cardInfo.restrictedtype==0 && cardInfo.restricteditems){
					// 指定服务项目可用
					var restricteditemsStr=cardInfo.restricteditems.split(',');// 指定的项目itemid 字符串
					// 指定了服务项目
					for(var ss=0,sslen=checkedServiceItems.length;ss<sslen;ss++){
						var checkedItemId=checkedServiceItems[ss].itemId;
						if(restricteditemsStr && restricteditemsStr.indexOf(checkedItemId)!=-1 && checkedServiceItems[ss].salePrice>0){
							// 需要支付金额的服务项目
							disableUseItemsStr+='、'+checkedServiceItems[ss].itemName;
						}
					}
				}
			}
			if(disableUseItemsStr){
				disableUseItemsStr=disableUseItemsStr.substring(1);
			}
			if(isItemPay){
				submitFn(1);
			}else{
				// 普通结算 有赠金不可用项目
				if(disableUseItemsStr && disableUseItemsStr.length){
					// 名字去重
					var orignalArr=disableUseItemsStr.split('、');
					if (orignalArr.length === checkedServiceItems.length) {
						// 选中的全是增加不可用项目 不要弹窗
						submitFn();
					} else {
						var res = [];
						for (var o = 0, olen = orignalArr.length; o < olen; o++) {
							if (res.indexOf(orignalArr[o]) == -1) {
								res.push(orignalArr[o])
							}
						}
						disableUseItemsStr = res.join('、');
						// 增加进入高级结算弹窗
						am.goItemPay.show({
							'itemNames': disableUseItemsStr,
							'okFn': function () {
								// 继续结算
								submitFn();
							},
							'cancelFn': function () {
								// 使用高级结算模式
								submitFn(1);
							},
							'closelFn': function () {
								// 关闭 留在当前页面
								return;
							}
						})

					}
				}else{
					// 没有赠金不可用项目
					submitFn();
				}
			}
		});


		//开通小程序
		var _afterOpenCodeWrap = $('.afterOpenCodeWrap'),
			_qrCodeInner = $('.qrCodeInner'),
			_beforeOpen = $('.beforeOpen'),
			_afterOpen = $('.afterOpen'),
			_bottomDiv = $('.bottomDiv');
		_afterOpen.find('.qrCodeWarp').hide();
		_afterOpen.find('.accountWarp').show();
		this.$t.find(_afterOpenCodeWrap).vclick(function(e) {
			if( $(e.target).hasClass('afterOpenCodeWrap') ) {
				_qrCodeInner.hide();
				_afterOpenCodeWrap.hide();
			}else {

			}
		});
		var qrCodeWarp = $('.qrCodeInner .afterOpen .qrCodeWarp');
		var accountWarp = $('.qrCodeInner .afterOpen .accountWarp');
		//切换modelContent 的tab切换
		this.$t.find('.qrCodeInner .afterOpen .tab').on('vclick','li',function(){
			var $this = $(this);
			var index = $this.index();
			if(!$this.hasClass('active')){
				$this.addClass('active').siblings().removeClass('active');
			}
			if(index==0){
				var userInfo = am.metadata.userInfo;
				qrCodeWarp.find('.minCode img').attr('src', am.getMiniProCode(userInfo.parentShopId,'pages/mall/index','3',userInfo.userId,userInfo.userType))
				qrCodeWarp.show();
				accountWarp.hide();
			}else if(index==1){
				qrCodeWarp.hide();
				accountWarp.show();
			}
		})

		this.$t.find('.qrCodeClick').vclick(function () {
			// window.open(location.origin + "/young/$dynamicResource/pages/page.qrcode.html");

			$('.qrCodeBtnDiv .settle').hide();
			_qrCodeInner.show();

			//生成小程序码
			if(am.metadata.shopPropertyField != undefined && am.metadata.shopPropertyField.openSmallProgram) {
				_afterOpen.find()
				$('.qrCodeInner .afterOpen .code').attr('src', self.getQrCode()), _afterOpen.show()
				// am.metadata.shopPropertyField.openSmallProgram ? ( $('.qrCodeInner .afterOpen .code').attr('src', self.getQrCode()), _afterOpen.show() ) : _beforeOpen.show();
			}else {
				_beforeOpen.show();
			}
			
		});

		this.carrousel = new $.am.Carrousel({
			id: "after_carrousel",
			autoSwitch : 0,
			onchange: function (i) {
				self.carrousel.$inner.find('li').eq(i).addClass('selected').siblings().removeClass('selected');
				_bottomDiv.find('ul li').eq(i).addClass('selected').siblings().removeClass('selected');
			}
		});

		this.$t.find('.qrCodeInner .close').vclick(function () {
			$('.qrCodeInner').hide();
		});

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

		this.$t.find('.qrCodeInner .open').vclick(function () {
			if(_beforeOpen.is(':visible') ) {
				window.open('http://cn.mikecrm.com/pKDAmFu');
				$('.qrCodeInner').hide();
			}else {
				_afterOpen.hide();
				var liLen = $('#after_carrousel .am-carrousel-inner li').length;

				if( !liLen ) {
					var ret = {
						content : [
							'a', 'b', 'c'
						]
					}
					for(var i=0;i<ret.content.length;i++){
						var	$li = $('<li class="' + ret.content[i] + ' am-clickable"></li>'),
							$imgDiv = '',
							userInfo = am.metadata.userInfo,
							shopName = (userInfo.shopName==' ' || userInfo.shopName=='' || userInfo.shopName==null)?((userInfo.osName==' ' || userInfo.osName=='' || userInfo.osName==null)?'':userInfo.osName):userInfo.shopName,
							hash = 'v=' + i + '&shopName=' + shopName +'&parentShopId=' + userInfo.parentShopId + '&token=' + userInfo.mgjtouchtoken + '&tenantId=' + userInfo.parentShopId + '&page=pages/mine/index' + '&scene=settlement',
							urls = self.createCode(hash),
							img = createImage(),
							$btn = $('<li></li>');
						img.setHref(urls.base,function(){
							$imgDiv = '<div class="codeDiv">'
									+'<img class="code" src="'+urls.base+'" />' 
									+'<img class="logo" src="$dynamicResource/images/good.png" /></div>';
						});
						// if(i == 0) {
						// 	$li.append('<img class="bg" src="$dynamicResource/images/server/' + ret.content[i] + '.jpg"/>');
						// }
					
						$li.append($imgDiv);
						var	$shopname = $('<p class="shopname"></p>');
						if(shopName){
							$li.append($shopname.text(shopName+'小程序'));
						}
						self.carrousel.$inner.append($li);
	
						//底部圆点
						_bottomDiv.find('ul').append($btn);
					}
					self.carrousel.refresh();
				}else {}
				_afterOpenCodeWrap.show(500);
				
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
				from:"recharge",
				member:self.member,
			});
			return false;
		});

		this.$memberInfo.find(".renewal").vclick(function(){
			$.am.changePage(am.page.pay, "slideup",{
				action:"recharge",
				member:self.member,
				card: self.cardInfo,
				renewal: 1,
			});
			return false;
		});
		this.$memberInfo.on('vclick','.base .more',function(){
			if($(this).hasClass('on')){
				self.$memberInfo.find('.comment').removeClass('lineText');
				$(this).text('收起').removeClass('on');
			}else{
				self.$memberInfo.find('.comment').addClass('lineText');
				$(this).text('更多').addClass('on');
			}
		});
		this.$memberInfo.on('vclick','.card .cardRemark .more',function(){
			if($(this).hasClass('on')){
				self.$memberInfo.find('.cardRemark').html(self.cardComment).removeClass('lineText');
				$(this).removeClass('on');
			}else{
				self.$memberInfo.find('.cardRemark').html(self.subCardComment).addClass('lineText');
				$(this).addClass('on');
			}
			self.upperScroll.refresh();
			self.upperScroll.scrollTo("bottom");
		});
		this.$memberInfo.on('vclick','.card .namesBox .more',function(){
			var $this=$(this),
			$namesBox=$this.parent('.namesBox'),
			itemsText=$namesBox.data('itemsText')||'',
			subItemsText=$namesBox.data('subItemsText')||'';
			var moreSpan='<span class="more am-clickable">更多</span>';
			var moreOnSpan='<span class="more on am-clickable">收起</span>'
			if($this.hasClass('on')){
				$namesBox.html(subItemsText+moreSpan);
			}else{
				$namesBox.html(itemsText+moreOnSpan);
			}
			self.upperScroll.refresh();
			self.upperScroll.scrollTo("bottom");
		});
		this.$memberInfo.find('.items').on('vclick','.more',function(){
			// event.stopPropagation();
			var $card_detail_remark=$(this).prev('.card_detail_remark');
			if($(this).hasClass('on')){
				$card_detail_remark.removeClass('lineText');
				$(this).text('收起').removeClass('on');
			}else{
				$card_detail_remark.addClass('lineText');
				$(this).text('更多').addClass('on');
			}
			return false;
		});

		this.comboItemScroll = new $.am.ScrollView({
			$wrap: this.$memberInfo.find('.items'),
			$inner: this.$memberInfo.find('.items .inner'),
			direction: [false, true],
			hasInput: false,
			bubble:true
		});
		this.upperScroll = new $.am.ScrollView({
			$wrap: this.$memberInfo.find('.upperWrap'),
			$inner: this.$memberInfo.find('.upperWrap .upperwrapper'),
			direction: [false, true],
			hasInput: false,
			bubble:true
		});
		this.$memberInfo.find('.items').on('vclick','li',function(){
			var data = $(this).data('data');
			var item,mitu = [];
			if(data.itemid == "-1"){
				if(data.timesItemNOs){
					var itemNos = data.timesItemNOs.split(",");
					for(var i=0;i<itemNos.length;i++){
						var matchItem = am.metadata.serviceCodeMap[itemNos[i]];
						if(!matchItem){
							// 停用的项目
							matchItem= am.metadata.stopServiceCodeMap[itemNos[i]];
							if(matchItem && data.leavetimes===0){
								am.msg('项目'+(matchItem.name||'')+'次数已用完！');
								matchItem=null;
							}
						}
						if(matchItem){
							mitu.push(matchItem);
						}
					}
				}else {
					for(var key in am.metadata.serviceCodeMap){
						mitu.push(am.metadata.serviceCodeMap[key]);
					}
				}
			}else{
				item = am.metadata.serviceCodeMap[data.itemid];
				if(!item){
					// 该项目被停用 但是已经购买 依然可用
					item=am.metadata.stopServiceCodeMap[data.itemid];
					if(item && data.leavetimes===0){
						am.msg('该项目次数已用完！');
						return;
					}
				}
			}
			if($.am.getActivePage() !== am.page.service){
				$.am.changePage(am.page.service, "","freezing");
			}
			var shopFlag = true;
			if(data.cashshopids){
				var cashshopids = data.cashshopids;
				cashshopids = cashshopids.split(',');
				var targetCashshopids = [];
				for (var i = 0; i < cashshopids.length; i++) {
					var element = cashshopids[i];
					if(!element) continue;
					targetCashshopids.push(element);
				}
				var currentShop = amGloble.metadata.userInfo.shopId;
				if(targetCashshopids[0]==-99&&data.shopid!=currentShop){
					shopFlag = false;
				}
				if(targetCashshopids.length&&targetCashshopids.indexOf(currentShop+'')==-1&&targetCashshopids[0]!=-99){
					shopFlag = false;
				}
			}
			if(!item && !mitu.length){
				am.msg('当前门店不存在该项目！');
				return;
			}
			if(item&&shopFlag){
				var $tr = am.page.service.billMain.addItem(item,0,data);
				$tr.trigger('vclick');
			}else if(mitu.length==1&&shopFlag) {
				var $tr = am.page.service.billMain.addItem(mitu[0],0,data);
				$tr.trigger('vclick');
			}else if(mitu.length>1&&shopFlag){
				am.popupMenu("请选择项目", mitu, function (ret) {
					var $tr = am.page.service.billMain.addItem(ret,0,data);
					$tr.trigger('vclick');
				});
			}else{
				am.msg('无法在本店使用此项目！');
			}
		});
		this.$billNo = this.$t.find("input[name=billNo]");

		this.$scanToSale = this.$t.find('.scanToSale').vclick(function(){
			if($(this).hasClass('on')){
				$(this).removeClass('on');
				localStorage.removeItem('scanToSale');
			}else {
				$(this).addClass('on');
				localStorage.setItem('scanToSale',1);
			}
		});

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
	submitEvent: function (isItemPay) {
		// 原提交按钮的事件 因为校验结算时是否购物车存在库存 所以单独提出来
		// 校验是否可以存在挂单备注
		var self=this;
		var billData = self.billData;
		if (billData) {
			var billRemark = JSON.parse(billData.data).billRemark;
			var remarkCallback = function (members) {
				var _data = am.clone(billData);
				var sendData = am.clone(billData.data);
				if (members) {
					sendData.cid = members.cid;
					sendData.memGender = members.sex;
					_data.memId = members.id;
					_data.memName = members.name;
					_data.memPhone = members.mobile;
					_data.memcardid = members.cid;
				}
				sendData.billRemark.recharge.isbuy = true;
				_data.data = JSON.stringify(sendData);
				am.page.hangup.saveBill(_data);
			}
			var checkRemark = am.page.hangup.checkRemark(billData, function (res) {
				if (res.code == 1) { //开卡
					$.am.changePage(am.page.memberCard, "", {
						billRemark: billData
					});
				}
				var fn=function(content){
					if(content){
						$.am.changePage(am.page.pay, "slideup", {
							action: "recharge",
							member: content,
							rechargeMoney:billRemark.recharge.money,
							billRemark:billData,
							remarkCallback:remarkCallback
						});
					}else{
						am.msg('该顾客没找到可充值的卡！')
					}
				};
				if (res.code == 2) { //充值
					am.searchMember.getMemberById(billData.memId, billRemark.recharge.id, function (content) {
						if(amGloble.metadata.configs.typePasswordtToSelectMember == 'true'){
							am.pw.check(content, function (verifyed) {
								if (verifyed) {
									fn(content);
								}
							});
						}else{
							fn(content);
						}						
					});

				}
				if (res.code == 3) { //购买套餐
					$.am.changePage(am.page.comboCard, "", {
						billRemark: billData
					});
				}
			}, true);
			if (!checkRemark) {
				self.submit(isItemPay);
			}
		} else {
			self.submit(isItemPay);
		}
	},
	rendBillRemark: function(item,$this) {
		var billData = am.page.hangup.getBillData(item);
		var billRemark = billData.billRemark;
		var flag = false;
		$this.find(".remarkCardBox").empty();
		if(billRemark){
			if(billRemark.opencard){
				var $span1 = $('<span class="am-clickable">开卡￥' + billRemark.opencard.money + '</span>');
				$span1.data("item",billRemark.opencard);
				$span1.data("sname","opencard");
				if(billRemark.opencard.isbuy){
					$span1.addClass("selected");
				}
				$this.find(".remarkCardBox").append($span1);
				flag = true;
			}
			if(billRemark.recharge){
				var $span2 = $('<span class="am-clickable">充值￥' + billRemark.recharge.money + '</span>');
				$span2.data("item",billRemark.recharge);
				$span2.data("sname","recharge");
				if(billRemark.recharge.isbuy){
					$span2.addClass("selected");
				}
				$this.find(".remarkCardBox").append($span2);
				flag = true;
			}
			if(billRemark.buypackage){//存在购买套餐
				if(billRemark.buypackage.data && billRemark.buypackage.data.length){
					for(var i=0;i<billRemark.buypackage.data.length;i++){
						var itemj = billRemark.buypackage.data[i];
						if(itemj.number){
							var $span0 = $('<span class="am-clickable package">'+itemj.name+"*"+itemj.number+'</span>');
						}else{
							var $span0 = $('<span class="am-clickable package">'+itemj.name + '</span>');
						}
						$span0.data("sname","package");
						$span0.data("item",billRemark.buypackage);
						$this.find(".remarkCardBox").append($span0);
					}
				}
				
				if(billRemark.buypackage.isbuy){
					$this.find(".remarkCardBox .package").addClass("selected");
				}
				flag = true;
			}
			if(!flag){
				$this.find(".label").hide();
				//垂直居中
				$this.find(".info").css({
					lineHeight:"35px"
				})
			}else{
				$this.find(".label").show();
				$this.find(".info").css({
					lineHeight:"16px"
				})
			}
		}

	},
	createCode:function(message){
		// if($.isPlainObject(message)){
		// 	message = JSON.stringify(message);
		// }
		console.log('message', message);

		var url = location.origin + "/young/$dynamicResource/pages/page.qrcode.html?"+ encodeURIComponent(message);
		var src = jrQrcode.getQrBase64(url, {
			render : "canvas",
			width: 150,
			height: 150,
			correctLevel: QRErrorCorrectLevel.L
		});
		return {
			base:src,
			url:url
		}
	},
	operatehairChange:function(){
		var _this   = this;
		var data    = this.billData;
		var $target = this.$hair;
		am.page.hangup.washOpt($target,data,1,function(res){
			_this.billData.jsonstr = res.jsonstr;
			// _this.billData.shampooworkbay = data.shampooworkbay;
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
			if(data.shampooStartTime){ //存在开始洗发时间
				if(data.shampooFinishTime){ //已结束
					var washPassTime = am.metadata.configs.washPassTime ? (am.metadata.configs.washPassTime - 0) * 60 * 1000 : 30 * 60 * 1000;
					var timer = data.shampooFinishTime - data.shampooStartTime;
					if (!am.isNull(timer)) { //洗发时长
						var timeStr = new Date(timer).format("MM:ss").replace(":", "分") + '秒';
						if ((timer / 60000) > 60) { //如果超过1个小时
							timeStr = Math.floor(timer / 60000 / 60) + "小时" + timeStr;
						}
						this.$hair.removeClass("start finish").addClass('disabled');
						if (timer > washPassTime) { //合格
							this.$hair.html('<p style="color:#222;">洗发结束</p><p>' + timeStr + '</p>');
						} else {
							this.$hair.html('<p style="color:#222;">洗发结束</p><p style="color:red;">' + timeStr + '</p>');
						}
					}
				}else{
					this.$hair.removeClass("disabled start").addClass('finish').html("结束洗发");
				}
			}else{
				this.$hair.removeClass("disabled finish").addClass('start').html("开始洗发");
			}
			this.$hair.show();
		}else{
			this.$hair.hide();
		}
	},
	operateSeat:function(data){
		if(amGloble.metadata.shopPropertyField && amGloble.metadata.shopPropertyField.mgjBillingType==1 && amGloble.metadata.areaList && amGloble.metadata.areaList.length){
			this.$openWorkStation.show();
		}else {
			this.$openWorkStation.hide();
			return;
		}
		if(data.tableId){
			var info = this.getSeatInfo(data.tableId);
			if(info.id){
				this.$openWorkStation.find('.spaceName').text(info.name);
				this.$openWorkStation.find('.seatName').text(info.tableName).removeClass('noSeat');
			}else {
				this.$openWorkStation.find('.spaceName').text('区域座位');
				this.$openWorkStation.find('.seatName').text('--').addClass('noSeat');
			}
		}else {
			this.$openWorkStation.find('.spaceName').text('区域座位');
			this.$openWorkStation.find('.seatName').text('未选择').addClass('noSeat');
		}
	},
	rechangeFn: function () {
		if ($("#tab_cash").find(".recharge").css("display") == "block") {
			$("#tab_cash").find(".recharge").trigger("vclick");
		} else {
			console.error("充值按钮隐藏");
		}
	},
	jumpAccount: function (isItemPay) {
		am.cashierTab.getOpt(function (opt) {
			if (opt) {
				if(isItemPay){
					$.am.changePage(am.page.itemPay, "slideup", opt);
				}else {
					$.am.changePage(am.page.pay, "slideup", opt);
				}
			}
		}, true);
	},
	//是否纯套餐
	getPackageFlag: function(){
		var self = this;
		var submit = am.page.service.submit();
		var serviceItems = submit.option && submit.option.serviceItems;
		self.packageFlag = false;
		$.each(serviceItems,function(i,v){
			if(am.isNull(v.consumeId)){
				self.packageFlag = true;
				return false;
			}
		});
	},
	packageFlag:false,
	submit: function (isItemPay) {
		var member = this.member;
		var _this = this;
		if (member) {
			this.getPackageFlag();
			if (member.cardtype == 1 && member.cardTypeId != "20151212" && member.cardTypeId != "20161012" && (member.timeflag == 0 || member.timeflag == 2) && !this.shutDownSubmit && this.packageFlag) {
				if (member.balance && member.balance < member.alarmfee) {
					am.confirm("余额不足", "卡内余额为" + member.balance + "元；已经低于最低值" + member.alarmfee + "元", "去充值", "结算", this.rechangeFn, function(){
						_this.jumpAccount(isItemPay);
					});
				} else if (member.balance && member.balance < (this.productPrice + this.servicePrice)) {
					am.confirm("余额不足", "卡内余额为" + member.balance + "元；已不足以支付当前订单，是否现在去充值？", "去充值", "结算", this.rechangeFn, function(){
						_this.jumpAccount(isItemPay);
					});
				} else{
					this.jumpAccount(isItemPay);
				}
			}else{
				this.jumpAccount(isItemPay);
			}
		}else{
			this.jumpAccount(isItemPay);
		}
	},
    shutDownSubmit:false,
    hideSubmitBtn:function(){
		if(device2.windows() || navigator.platform.indexOf("Mac") == 0) {
			this.$t.find('.submit').not('keypadPC').hide();
			this.$t.find('.submit.keypadPC').show();
		}else {
			this.$t.find('.submit.keypadPC').hide();
		}
		this.$t.find('.submit.itemPay').show();
		var config = am.metadata.userInfo.operatestr.indexOf('a39')>-1?1:0;
        console.log(config);
        if(config){
            this.$t.find('.submit').hide();
            this.$memberInfo.find('.recharge').hide();
            this.shutDownSubmit = true;
		}
	},
	getOpt:function (cb,isSubmit) {
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
		if(this.billData && this.billData.data && this.billData.data.lastKbTicketCode && opt.option){
			// 取出传到结算页面
			opt.option.lastKbTicketCode=this.billData.data.lastKbTicketCode;
		}
		if(this.billData && this.billData.data && this.billData.data.lastDpTicketCode && opt.option){
			// 取出传到结算页面
			opt.option.lastDpTicketCode=this.billData.data.lastDpTicketCode;
		}
		//自动结算数据
		if(amGloble.metadata.shopPropertyField && amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
			//开单模式
			var settlementPayDetail =self.billData&&self.billData.data&&self.billData.data.settlementPayDetail;
			if(settlementPayDetail != undefined) {
				opt.settlementPayDetail = settlementPayDetail;
			}else{}
		}else {}
		
		if(opt && opt.option){
			opt.option.billNo = billNo;
		}
		var proOpt = am.page.product.submit();
		proOpt.option.billNo = billNo;
		//项目和卖品只要有未定价就不能跳转，不选项目也不能跳转
		if(!opt || !proOpt){
			return;
			// cb(opt);
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
			//卖品可以单独挂单？
			// if(!isSubmit){
			// 	return am.msg("没有任何项目，请添加项目！")
			// }

			//自动结算数据
			if(amGloble.metadata.shopPropertyField && amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
				//开单模式
				var settlementPayDetail = self.billData.data.settlementPayDetail;
				if(settlementPayDetail != undefined) {
					proOpt.settlementPayDetail = settlementPayDetail;
				}else{}
			}else {}

			cb(proOpt);
		}else{
			if(isSubmit){
				return am.msg("没有任何项目，请添加项目！")
			}
			cb(opt);
		}
	},
	showMemberInfo:function(member){
		console.log("散客卡",member);
		this.member = member;
		var $gender = this.$memberInfo.find('.gender').text('积分:'+ (member.points||0));
		if(member.sex=="M"){
			$gender.addClass('male');
		}else{
			$gender.removeClass('male');
		}
		this.$memberInfo.find('.membername').text(member.name);
		if(am.operateArr.indexOf("MGJP") !=-1){// 敏感权限 //手机号隐藏中间四位
			this.$memberInfo.find('.tel').text(am.processPhone(member.mobile));
		}else{
			this.$memberInfo.find('.tel').text(member.mobile);
		}
		// this.$memberInfo.find('.tel').text(member.mobile);
		// this.$memberInfo.find('.comment').text(member.comment || "");
		// this.$memberInfo.find('.base').children('.more').remove();
		this.$memberInfo.find('.more').remove();
		if(member.comment){
			var $comment=this.$memberInfo.find('.comment').addClass('lineText');
			if(member.comment.length>21){
				// var subComment=member.comment.substr(0,18)+'<a href="javascript:;" class="more am-clickable">更多</a>'
				if($comment.hasClass('lineText')){
					$comment.html(member.comment).after('<span class="more on am-clickable">更多</span>');
				}else{
					$comment.html(member.comment).after('<span class="more am-clickable">收起</span>');
				}
			}else{
				$comment.html(member.comment);
			}
		}else{
			this.$memberInfo.find('.comment').html('');
		}

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
		var setting_total = am.page.service.billMain.getSetting().setting_total;
		if(setting_total){
			var total = Math.round((member.balance + member.gift)*100)/100;
			this.$memberInfo.find('.recharge').html('(总余额:￥'+ total +') 充 值')
		}else {
			this.$memberInfo.find('.recharge').html('充 值');
		}
		this.$memberInfo.find('.checkedItemsBox').remove();
		// 显示卡赠金可使用项目
		var checkedCardInfo=am.metadata.cardTypeMap[member.cardTypeId];
		if (checkedCardInfo) {
			var restricteditems = checkedCardInfo.restricteditems;
			var restrictedtype = checkedCardInfo.restrictedtype;
			var itemsNameStr = '',
				itemsNameTitle = (restrictedtype == 1 ? '赠送金可用项目：' : '赠送金不可用项目：');
			if (restricteditems) {
				var restricteditemsArr = restricteditems.split(',');
				if (restricteditemsArr && restricteditemsArr.length) {
					for (var i = 0, len = restricteditemsArr.length; i < len; i++) {
						var serviceItemCode = restricteditemsArr[i];
						var serviceItem = am.metadata.serviceCodeMap[serviceItemCode];
						if (serviceItem) {
							itemsNameStr += '、' + serviceItem.name;
						}
					}
				}
				if (itemsNameStr.length) {
					itemsNameStr = itemsNameStr.substring(1);
				}
				var itemsText = itemsNameTitle + itemsNameStr;
				if (itemsText && itemsText.length && this.$memberInfo.find('.checkedItemsBox').length == 0) {
					var subItemsText='';
					if(itemsText.length>65){
						subItemsText=itemsText.substring(0,61)+'...';
					}
					var $moreSpan=$('<span class="more am-clickable">更多</span>');
					var $itemsDom = $('<div class="checkedItemsBox"><div class="namesBox">' + (subItemsText||itemsText) + '</div><div class="tip"><span class="icon iconfont icon-yduigantanhaokongxin"></span><span class="tipsText">标记 * 号的项目为赠金不可用项目</span></div><div>');
					if(subItemsText && subItemsText.length){
						$itemsDom.find('.namesBox').data('itemsText',itemsText).data('subItemsText',subItemsText).append($moreSpan);
					}
					this.$memberInfo.find('.cardRemark').before($itemsDom);
				}
			}
		}

		if(this.cardInfo) {
			this.$memberInfo.find('.cardRemark').addClass('card_remark');
			this.$memberInfo.find('.cardRemark').html(this.cardInfo.cardRemark);
		}
		this.$memberInfo.find('.cardRemark').html("");
		// this.$memberInfo.find('.card').children('.more').remove();
		if(member.cardComment) {
			var $cardRemark=this.$memberInfo.find('.cardRemark').addClass('card_remark lineText');
			if(member.cardComment.length>21){
				this.cardComment=member.cardComment+'<span class="more am-clickable">收起</span>';
				this.subCardComment=member.cardComment.substr(0,21)+'<span class="more on am-clickable">更多</span>';
				if($cardRemark.hasClass('lineText')){
					$cardRemark.html(this.subCardComment);
				}else{
					$cardRemark.html(this.cardComment);
				}
			}else{
				$cardRemark.html(member.cardComment);
			}
		}else{
			this.$memberInfo.find('.cardRemark').html('');
		}
		if(!this.$memberInfo.find('.cardRemark').text()) {
			this.$memberInfo.find('.cardRemark').removeClass('card_remark');
		}
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
			var comboitemsObj = {};
			for(var i=0;i<member.comboitems.length;i++){
				if(!comboitemsObj[member.comboitems[i].shopid]){
					comboitemsObj[member.comboitems[i].shopid] = [];
				}
				comboitemsObj[member.comboitems[i].shopid].push(member.comboitems[i]);
			}
			this.$memberInfo.find('.items').show().find('.inner').empty();
			for(var key in comboitemsObj){
				var $wrapper = $('<div class="wrapper"><div class="title"><p class="shopname"></p></div></div>');
				$wrapper.find('.shopname').text(am.page.searchMember.getShopName(key)+(key==amGloble.metadata.userInfo.shopId?'(本店)':''));
				var $ul = $('<ul></ul>');
				for(var i=0;i<comboitemsObj[key].length;i++){
					var item = comboitemsObj[key][i];
					var $li = $('<li class="am-clickable"></li>');
					var $times = $('<div class="times">不限次</div>');
					if(item.sumtimes != -99){
						$times.html('余'+item.leavetimes+'次<span>(总'+item.sumtimes+'次)</span>');
					}
					$li.append($times);
					if(item.isNewTreatment && item.timesItemNOs){
						var paramObj={
							showStopedItem:1,
							showFixedStopName:0,
							onlyShowValidName:0
						}
						// item.itemname = am.page.comboCard.getItemNamesByNos(item.timesItemNOs,'',1).join(",");
						item.itemname = am.page.comboCard.getItemNamesByNos(item.timesItemNOs,'',paramObj).join(",");
					}
					if(item.itemid==-1 && !item.timesItemNOs){
						item.itemname = '不限项目';
					}
					// 此处项目来自后端接口 不是从metadata取的
					// var metadata=am.metadata;
					// var stopServiceCodeMap=metadata.stopServiceCodeMap;
					// var serviceCodeMap=metadata.serviceCodeMap;
					// var itemName='';
					// if(item.itemid && item.itemid!=-1 && !item.itemname && !serviceCodeMap[item.itemid] && !stopServiceCodeMap[item.itemid]){
					// 	itemName = '项目已删除';
					// }
					$li.append('<div class="itemName">'+ (item.treattype==1?'<span class="highlight">[赠] </span>':'')+(item.itemname||'项目已删除')+'</div>');
					// if($li.find('.itemName').text() && $li.find('.itemName').text().trim().indexOf('项目已删除')>-1){
					// 	$li.addClass('am-disabled');
					// }
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
					var $remark_txt = $('<div class="' + (item.itemRemark?"card_detail_remark lineText":"") + '">' + (item.itemRemark?item.itemRemark:"") + '</div>');
					$li.append($remark_txt);
					$li.children('.more').remove();
					var $remark=$li.find('.card_detail_remark')
					if(item.itemRemark){
						if(item.itemRemark.length>21){
							if($remark.hasClass('lineText')){
								$remark.html(item.itemRemark).after('<span class="more on am-clickable">更多</span>');
							}else{
								$remark.html(item.itemRemark).after('<span class="more am-clickable">收起</span>');
							}
						}else{
							$remark.html(item.itemRemark);
						}
					}else{
						$remark.html('');
					}
					$ul.append($li.data('data',item));
				}
				$wrapper.append($ul);
				this.$memberInfo.find('.items').show().find('.inner').append($wrapper);
			}
		}else{
			this.$memberInfo.find('.items').hide();
		}

		this.$card.addClass('selected');
		this.$memberInfo.show();
		this.comboItemScroll.refresh();
		this.comboItemScroll.scrollTo("top");
		this.upperScroll.refresh();
		this.upperScroll.scrollTo("top");
	},
	changeSeat:function(id){
		var _this = this;
		var data = this.billData;
		var originSeat = this.getSeatInfo(data.tableId);
		var seat = this.getSeatInfo(id);
		if(data.tableId && originSeat.id){
			var description = '要将 '+originSeat.name+'-'+originSeat.tableName+' '+(data.memId==-1?'散客':data.memName)+' 换到 '+seat.name+'-'+seat.tableName+' 吗？'; 
		}else {
			var description = '要将 此单'+' '+(data.memId==-1?'散客':data.memName)+' 换到 '+seat.name+'-'+seat.tableName+' 吗？'; 
		}
		atMobile.nativeUIWidget.confirm({
			caption: '换座位',
			description: description,
			okCaption: '确定',
			cancelCaption: '取消'
		}, function(){
			am.loading.show();
			am.api.hangupSave.exec({
				id: data.id,
				tableId: id,
				parentShopId:am.metadata.userInfo.parentShopId,
				shopId:am.metadata.userInfo.shopId,
			}, function(ret){
				am.loading.hide();
				if(ret && ret.code===0){
					am.msg("座位设置成功");
					data.tableId = id;
					var info = _this.getSeatInfo(id);
					_this.$openWorkStation.find('.spaceName').text(info.name);
					_this.$openWorkStation.find('.seatName').text(info.tableName).removeClass('noSeat');
					_this.showWorkStation.hide();
				} else {
					am.msg("座位设置成功失败！");
				}
			});
		}, function(){
			
		});
	},
	showWorkStation: {
		init: function(){
			var _this = this;
			this.$ = am.cashierTab.$.find('.selectWorkStation');
			this.$seatItem = this.$.find('li').remove();
			this.$space = this.$.find('.space').remove();
			this.$wrapper = this.$.find('.wrapper');
			this.$.on('vclick','.close',function(){
				_this.hide();
			}).on('vclick','li',function(){
				var used = $(this).hasClass('used');
				var data = $(this).data('data');
				if(data.id==am.cashierTab.billData.tableId){
					_this.hide();
					return;
				}
				if(used){
					atMobile.nativeUIWidget.confirm({
						caption: '此座位已占用',
						description: '是否仍要将此单调整到此座位？',
						okCaption: '确定',
						cancelCaption: '取消'
					}, function(){
						am.cashierTab.changeSeat(data.id);
					}, function(){
						
					});
				}else {
					am.cashierTab.changeSeat(data.id);
				}
			});

			this.$empty = this.$.find('.empty');

			this.scroll = new $.am.ScrollView({
				$wrap : this.$,
                $inner : this.$wrapper,
                direction : [false, true],
                hasInput: false
			});
		},
		show: function(){
			this.render();
		},
		render: function(){
			var _this= this;
			this.renderSeat(function(){
				_this.renderSeatStatus();
			});
			this.$.show();
			this.scroll.refresh();
			this.scroll.scrollTo('top');
		},
		renderSeat:function(callback){
			var _this = this;
			this.$wrapper.empty();
			var setting = amGloble.metadata.areaList;
			if(!setting || !setting.length){
				return;
			}
			for(var i=0;i<setting.length;i++){
				var $space = _this.$space.clone(true,true);
				$space.find('.intro .spaceName').text(setting[i].name);
				var seats = setting[i].seats.sort(function(a,b){
					return a.sort - b.sort;
				});
				for(var j=0;j<seats.length;j++){
					if(seats[j].status){
						var $item = _this.$seatItem.clone(true,true);
						$item.find('.name').text(seats[j].tablename);
						$space.find('.list').append($item.data('data',seats[j]));
					}
				}
				if($space.find('.seat').length){
					_this.$wrapper.append($space);
				}
			}
			callback && callback();
		},
		renderSeatStatus:function(){
			var _this = this;
			var data = am.page.hangup.tempData;
			if(!data){
				return;
			}
			var renderData = {};
			for(var i=0;i<data.length;i++){
				if(data[i].tableId){
					if(!renderData[data[i].tableId]){
						renderData[data[i].tableId] = [];
					}
					renderData[data[i].tableId].push(data[i]);
				}
			}
			if(JSON.stringify(renderData)=='{}'){
				return;
			}
			var seats = _this.$.find('.seat');
			for(var i=0;i<seats.length;i++){
				var seat = $(seats[i]);
				var seatData = seat.data('data');
				if(renderData[seatData.id]){
					seat.addClass('used');
					var bill = renderData[seatData.id][0];
					seat.find('.customer').text(bill.memId==-1?'散客':bill.memName)
				}
			}
		},
		hide: function(){
			this.$.hide();
		}
	},
	getSeatInfo: function(id){
		var info = {};
		var setting = amGloble.metadata.areaList;
		if(setting && setting.length){
			for(var i=0;i<setting.length;i++){
				for(var j=0;j<setting[i].seats.length;j++){
					if(setting[i].seats[j].id==id){
						info.tableName = setting[i].seats[j].tablename;
						info.name = setting[i].name;
						info.id = setting[i].id;
						info.status = setting[i].seats[j].status;
						return info;
					}
				}
			}
		}
		return info;
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
						"servers": servers,
						"oPrice": si.oPrice,
						"manual": si.manual,
						"itemId" : si.itemId, //项目的id
						"modifyed": si.modifyed,
						"consumeType": si.consumeType,
						"cardDiscount": si.cardDiscount
					};
					if(!tempItem.noTreat){
						if(param.comboitem && param.comboitem.length){
							for(var j=0;j<param.comboitem.length;j++){
								if(param.comboitem[j].itemid==si.itemId && param.comboitem[j].consumeId==si.consumeId){
									tempItem.sumtimes = param.comboitem[j].sumtimes;
									tempItem.leavetimes = param.comboitem[j].leavetimes;
									tempItem.consumeId = param.comboitem[j].consumeId;
								}
							}
						}
					}
					// if(si.modifyed){
					// 	tempItem.oPrice = si.price;
					// }
					serviceItems.push(tempItem);
					sumfee += si.salePrice;
				}
			}
			var products=null,prodSumfee=0;
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
			}
			//新增单子自己备注，不以会员备注提交
			// else if(param.member && param.member.comment){
			// 	instorecomment = param.member.comment.substr(0,50);
			// }
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
					"mgjIsHighQualityCust":(param.member && param.member.mgjIsHighQualityCust)?1:0,
					"cid":param.member ? param.member.cid : "",
					"cardTypeId":param.member ? param.member.cardTypeId : "",
					"sumfee": sumfee,
					"prodSumfee":prodSumfee,
					"memGender": param.member && param.member.sex? param.member.sex:'F',
					"genderGuest":param.option.gender === 'M'?1:0,
					"serviceItems": serviceItems,
					"products":products,
					"lastKbTicketCode":this.billData && this.billData.lastKbTicketCode, // 上次关联口碑券
					"lastDpTicketCode":this.billData && this.billData.lastDpTicketCode// 上次关联点评券
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
				"instorecomment":instorecomment, //备注
				"tableId": this.billData?this.billData.tableId:null
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
					"isSpecified1": billData.isSpecified1 || 0, //0非指定 1指定
					"isSpecified2": billData.isSpecified2 || 0,
					"isSpecified3": billData.isSpecified3 || 0,
					"emp1RotateId": billData.emp1RotateId || -1,
					"emp2RotateId": billData.emp2RotateId || -1,
					"emp3RotateId": billData.emp3RotateId || -1,
					"serviceNO": billData.serviceNOBak || billData.serviceNO
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
	stringCompare: function(str1,str2,key){
		if(str1=='""'){
			str1 = 'null';
		}
		if(str2=='""'){
			str2 = 'null';
		}
		if(key.indexOf('RotateId')){
			if(str1==-1){
				str1 = 'null';
			}
			if(str2==-1){
				str2 = 'null';
			}
		}
		return str1 == str2;
	},
	hangupSave:function(data,notBack,callback,backSave){
		var hasChanged = 0;
		if(am.billOriginData){
			for(var key in data){
				if(key=='data'){
					if(data[key]!=am.billOriginData[key]){
						hasChanged ++;
						break;
					}
				}else {
					if(!this.stringCompare(JSON.stringify(data[key]),JSON.stringify(am.billOriginData[key]),key) && key !='channel' && key !='order'){
						hasChanged ++;
						break;
					}
				}
			}
		}

		var saveSuccess = function(){
			if(am.cashierTab.needDeletedWaitedBillId){
				am.page.hangup.deleteWaitedBills([am.cashierTab.needDeletedWaitedBillId],'已开单单据选取待开单顾客作为会员后删除',function(){
					delete am.cashierTab.needDeletedWaitedBillId;
				});
			}
			if(notBack){
				callback && callback();
				return;
			}
			if(amGloble.metadata.shopPropertyField.mgjBillingType==1){
				$.am.changePage(am.page.hangup, "", {openbill:1,setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
			}else{
				$.am.changePage(am.page.hangup, "", {setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
			}
			//self.beforeShow();
			am.cashierTab.hide();
			callback && callback();
		}

		if(!backSave){
			this.$user.removeClass("good");
			this.$card.parent().removeClass("good");
		}
		
		if(!hasChanged && am.billOriginData){
			saveSuccess();
			return;
		}
		console.log('------------单据发生改变----------------');
		// 性能监控点
		monitor.startTimer('M03')
		if(!backSave){
			am.loading.show();
		}
		data.parentShopId = amGloble.metadata.userInfo.parentShopId;

		// 性能监控点
		monitor.startTimer('M03', data)

		am.api.hangupSave.exec(data, function(ret){
			am.loading.hide();
			if(backSave){
				return;
			}
			if(ret && ret.code==0){
                // 性能监控点
                monitor.stopTimer('M03', 0)

				//am.msg("挂单成功");
				saveSuccess();
			} else if(ret.code === -1) {
                // 性能监控点
                monitor.stopTimer('M03', 1)

				am.msg(ret.message || '网络异常，单据保存失败，请重试!');
			}else if(ret.code == 11008){
                // 性能监控点
                monitor.stopTimer('M03', 0)
                
				var gotoHangup = function () {
					$.am.changePage(am.page.hangup,"",{openbill:1,setting_washTime:am.page.service.billMain.getSetting().setting_washTime});
				};
				am.confirm('单据已变更','由于其它终端的操作，此单状态已改变！','知道了','返回',gotoHangup,gotoHangup);
			}else{
                // 性能监控点
                monitor.stopTimer('M03', 1)

				am.confirm('保存失败','保存单据时异常！','重试','返回',function(){
					am.cashierTab.hangupSave(data,notBack,callback);
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
        this.hideSubmitBtn();
		if(amGloble.metadata.shopPropertyField.mgjBillingType==1){//开单模式
			this.$t.find('.hangup').html("保存并返回");
			this.$t.find('.hangup').addClass("bigBtn");
			this.$editRemark.show();
		}else{
			//录单模式不显示备注
			this.$editRemark.hide();
			this.$t.find('.hangup').html("挂单");
			this.$t.find('.hangup').removeClass("bigBtn");
		}
		if(localStorage.getItem('scanToSale')){
			this.$scanToSale.addClass('on');
		}else {
			this.$scanToSale.removeClass('on');
		}
		if($.am.getActivePage().id=='page_product'){
			this.$scanToSale.show();
		}else {
			this.$scanToSale.hide();
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
	setMember:function (member,pass,card,notOpenBill) {
		if(member){
			if(card){
				member.allowkd = card.allowkd;
			}
			if (!(member.allowkd*1) && (member.cardshopId || member.shopId) != am.metadata.userInfo.shopId) {
				am.msg('此会员卡不允许跨店消费！');
				this.setMember(null,pass,card,notOpenBill);
				return;
			}
			this.needDeletedWaitedBillId = member.needDeletedWaitedBillId;
		}
		if(card){
			this.cardInfo = card;
			if(member){
				member.mgjIsHighQualityCust = card.mgjIsHighQualityCust;
			}
		}
		var _this = this;
		// if(member && !pass){
			// am.pw.check(member,function(verifyed){
			// 	if(verifyed){
			// 		_this.setMember(member,1);
			// 	}
			// });
			// return;
		// }



		this.member = member;
		console.log(member)
		if(member){
			if(member.mgjIsHighQualityCust == 1){
				this.$user.addClass("good");
				this.$card.parent().addClass("good");
				this.$user.before('<svg class="icon" aria-hidden="true"><use xlink:href="#icon-tuoyuan"></use></svg>');
			}else{
				this.$user.removeClass("good");
				this.$card.parent().removeClass("good");
				this.$user.prev('svg').remove();
			}
			if(am.isMemberLock(member.lastconsumetime || member.lastConsumeTime, member.locking)){
				this.$user.addClass("lock");
			}else{
				this.$user.removeClass("lock");
			}
			this.$user.find('.name').text(member.name);
			this.$user.find('.img').html(am.photoManager.createImage("customer", {
				parentShopId: am.metadata.userInfo.parentShopId,
				updateTs: member.lastphotoupdatetime || ""
			}, member.id + ".jpg", "s",member.photopath||''));

			this.$card.parent().show().find('.name').text(member.cardName);
			var balanceFee = member.balance;
			if(member.cardtype == 1 && member.timeflag==0 && balanceFee){
				this.$card.find('.balance').show().text('￥'+(balanceFee||0));
			}else{
				this.$card.find('.balance').hide();
			}
			am.page.service._setMember(member,pass,card,notOpenBill);
			am.page.product._setMember(member,pass,card,notOpenBill);

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
			//没选会员
			this.$user.find('img').remove();
			this.$user.find('.name').text('散客');
			this.$user.removeClass("lock");
			//this.$gender.removeClass("male");
			this.$card.parent().hide();
			//优质客
			this.$user.removeClass("good");
			this.$card.parent().removeClass("good");
			this.$user.prev('svg').remove();
			am.page.service.member = null;
			am.page.product.member = null;
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
					member:item,
					notOpenBill:1,
				});
			},
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

		this.showWorkStation.hide();
	},
	feedBill:function (bill,openbill,getBill) {
		$.am.changePage(am.page.service,'',{
			bill:bill,
			openbill:openbill,
			getBill:getBill
		});
		am.page.product.reset({
			bill:bill
		});
		this.billData = bill;
		//渲染单号
		if(this.billData && this.billData.serviceNO){
			this.$billNo.val(this.billData.serviceNO);
		}
		//渲染备注
		if(this.billData){
			this.$editRemark.find(".info").html(this.billData.instorecomment || "");
			this.rendBillRemark(this.billData,this.$editRemark);
		}
		
		var self = this;
		if(bill.memId && bill.memId!=-1){
			am.loading.show();
			am.api.queryMemberById.exec({
				memberid:bill.memId
			},function(ret){
				am.loading.hide();
				if(ret && ret.code==0 && ret.content && ret.content.length){
					var length = ret.content.length;
					//to do 选择会员卡
					if(ret.content.length==1){
						ret.content[0].cardNum = length;
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
									ret.content[i].cardNum = length;
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
							self.popupMenu(arr,bill);
							return;
						}
					}
				}else{
                    // 性能监控点
                    monitor.stopTimer('M04', 1
                )
					am.msg("用户信息读取失败~");
				}
				self.feedMain(bill);
			});
		}else{
			self.feedMain(bill);
		}
	},
	popupMenu: function(arr,bill){
		var self = this;
		am.popupMenu("请选择会员卡", arr, function (ret) {
			ret.data.cardNum = length;
			if (!(ret.data.allowkd*1) && ret.data.shopId != am.metadata.userInfo.shopId) {
				am.msg('此会员卡不允许跨店消费！');
				self.popupMenu(arr,bill);
				return;
			}
			self.setMember(ret.data);
			self.feedMain(bill);
		},null,null,function(){
			self.setMember(ret.content[0]);
		});
	},
	feedMain:function (bill) {
		/*am.page.product.reset({
			bill:bill
        });*/
        
        // 性能监控点
        monitor.stopTimer('M04', 0)
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
			
	},
	//获取小程序二维码
	getQrCode: function () {
        var self = this,
        scene = "settlement",
        url = config.gateway + "/mgj-cashier/comment/qrCode?" + $.param({
            parentShopId: am.metadata.userInfo.parentShopId,
            token:am.metadata.userInfo.mgjtouchtoken,
            tenantId: am.metadata.userInfo.parentShopId,
            page: "pages/mine/index",
            scene: scene
        });
		return url;
	},
};

$(function () {
	am.cashierTab.init();
	am.goItemPay.init();
});

am.goItemPay={
	init:function(){
		var _this=this;
		this.$=$('#goItemPayConfirm').on('vclick','.OK',function(){
			_this.opt.okFn();
			am.goItemPay.hide();
		}).on('vclick','.cancel',function(){
			_this.opt.cancelFn();
			am.goItemPay.hide();
		}).on('vclick','.close',function(){
			_this.opt.closelFn();
			am.goItemPay.hide();
		});
		this.$itemNames=this.$.find('.itemNames');
	},
	render:function(){
		this.$itemNames.html(this.opt.itemNames+'<br/>')
	},
	show:function(opt){
		this.$.show();
		this.opt=opt;
		this.render();
	},
	hide:function(){
		this.$.hide();
		this.$itemNames.text('');
	}
}
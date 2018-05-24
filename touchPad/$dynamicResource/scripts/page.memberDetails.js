(function ($) {
	var self = am.page.memberDetails = new $.am.Page({
		id: "page_memberDetails",
		backButtonOnclick: function () {
			if ($("#pswp_dom").is(":visible")) {
				am.gallery.close();
			}else if(self.$data.openbill){
				$.am.changePage(am.page.hangup, "slidedown",{openbill:self.$data.openbill});
			}else {
				var arr = [];
				for(var i=0;i<$.am.history.length;i++){
					if($.am.history[i].id!='page_addMember' && $.am.history[i].id!='page_memberDetails'){ // && $.am.history[i].id!='page_searchMember'
						arr.push($.am.history[i]);
					}
				}
				$.am.history = arr;
				$.am.page.back("slidedown");
			}

		},
		init: function () {
			this.$contentList = this.$.find(".rightBody .commonBox");//三个内容区域
			this.$leftBox = this.$.find(".memberdetailsbox .pageLeft");//左侧的盒子
			this.$twoStatus = this.$leftBox.find('.two_status');
			this.$tab = this.$.find(".memberDetailsTab");//tab
			this.$cardBox = this.$.find(".comboBox .leftCard");//卡列表的盒子
			this.$cardul = this.$cardBox.find("ul");
			this.$cardLi = this.$cardul.find("li:first");
			this.$cardul.empty();//清空列表
			this.$comboBox = this.$.find(".comboBox .rightcombo");//套餐列表盒子
			this.$comboul = this.$comboBox.find(".inner");
			this.$comboli = this.$comboul.find(".list");
			this.$combolii = this.$comboul.find(".list li:first");
			this.$adbox = this.$.find(".addphoto_model");//添加相册弹出层
			this.$azbox = this.$.find(".addqzone_model");//添加说说弹出层
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
			this.$recordBox = this.$.find(".recordBox .body");
			this.remarkFlag='';
			this.$changeTarget=null;
			this.$popWrap=this.$.find('.card_popup');
			this.$cardfeePopup=this.$.find('.popup_right.cardfee');
			this.$comboPopup=this.$.find('.popup_right.combo');
			this.$targetCard=null;
			this.memberpw='';

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

			this.$otherEmps = this.$.find('.otherEmps').vclick(function(){
        		$(this).hide();
            });
            this.$otherEmpsText = this.$otherEmps.find('.text');

			this.$table = this.$.find(".table-content-list tbody").on("vclick", ".signature", function () {
				var $this = $(this);
				am.signatureView.show({
					memberId: $this.data("memberid"),
					billId: $this.data("billid"),
					unresign: 1,
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
			$.each(metaConfig.invention.subCategories, function (i, item) {
				var li = '<li class="am-clickable" pid="' + item.category + '" tid="' + item.subCategory + '">' + item.subCategoryName + '</li>';
				self.$adbox.find(".mbody-left .photo_typebox>ul").append(li);
			});
			this.$.find(".footbtn").vclick(function () {
				if (am.operateArr.indexOf("R") != -1) {
					$.am.changePage(am.page.addMember, "slideup", {userInfo: self.$userInfo});
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
						w: 1024,
						h: 1024
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
				if (remark.length < 0 || remark.length > 20) {
						amGloble.msg("请输入0-20个字符备注内容！");
						return;
					}
					amGloble.loading.show();
				var opt={};
				if(self.remarkFlag=='card'){
					opt={
						cardRemark:remark,
						cardId:id
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
						//alert(uuid);
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
						//alert(uuid);
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
				if ($(this).hasClass('addcard')) {//新增卡
					// $.am.changePage(am.page.memberCard, "slideup",{cardData:{
					// 	memberInfo:self.$userInfo,
					// 	card:self.cardCash[0]
					// }});
					$.am.changePage(am.page.memberCard, "slideup", {
						reset: am.convertMemberDetailToSearch({
							memberInfo: self.$userInfo,
							card: self.cardCash[0]
						})
					});
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
							var cardType = am.metadata.cardTypeMap[data.cardtypeid];
							if(cardType && cardType.expiredpayflag && cardType.expiredpayflag == "0" && am.operateArr.indexOf('U') == -1){
								//过期后不允许使用
								am.confirm('已过期','此会员卡已过期，无法继续使用','知道了','返回');
								return;
							}else{
								am.msg('此会员卡已过期！');
							}
						}
					}
				}
				if (!data.allowkd && data.shopId != am.metadata.userInfo.shopId) {
					am.msg('此会员卡不允许跨店消费！');
					return;
				}
				if (self.selectCardId) {//存在传进来的cardId 就走选择逻辑
					$(this).addClass('selected').siblings().removeClass("selected");
					//是否要跳转
					console.log(data);
					$.am.changePage($.am.history[$.am.history.length - 1], "slideup", {
						cardData: {
							memberInfo: self.$userInfo,
							card: data
						}
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
							"mobile": self.$userInfo.mobile
						}
						amGloble.confirm("使用此会员卡", "去开单？", "去开单", "返回", function () {
							$.am.changePage(am.page.openbill, "slideup",{member:member});
						})

					}else{
						amGloble.confirm("使用此会员卡", "去项目卖品收银？", "去收银", "返回", function () {
							$.am.changePage(am.page.service, "slideup", {
								reset: am.convertMemberDetailToSearch({
									memberInfo: self.$userInfo,
									card: data
								})
							});
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
					allMenu=[{name:"充值"}, {name:"设置密码"}, {name:"清除密码"},{name:"修改卡余额"},{name:"修改卡赠送金"}],
					menuArr=[],
					_this=this;
				var data = $(this).parents("li").data("item");
				var expired = 0;
				// if(data.invaliddate){
				// 	var ts = new Date(data.invaliddate*1 || data.invaliddate);
				// 	var n = new Date();
				// 	if(ts){
				// 		if(n.getTime()>ts.getTime()){//两个日期比较时间戳大小
				// 			expired = 1;
				// 		}
				// 	}
				// }
				var banSubmitConfig = am.metadata.userInfo.operatestr.indexOf('a39')>-1?1:0;
				if (!expired && data.cardtype == 1 && (data.timeflag == 0 || data.timeflag == 2)) {//显示充值
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
						menuArr.push({name:"设置密码"});
					}
				}

				if(am.operateArr.indexOf('X2')>-1 && self.memberpw ){//有清除密码权限 的人 并且存在密码 显示清除密码功能
					menuArr.push({name:"清除密码"});
				}

				if ((data.timeflag == "0" && data.cardtype!="2" ) && am.operateArr.indexOf('A')>-1) {//判断有权限修改余额和赠送金 并且是普通卡
					menuArr.push({name:"修改卡余额"},{name:"修改卡赠送金"});
				}

				//转账
				if(data.timeflag != "1" && data.cardtype!="2" && am.operateArr.indexOf('K')>-1){//资格卡和计次卡不能转卡金 并且有权限
					menuArr.push({name:"卡金转出"});
					menuArr.push({name:"卡金转入"});
				}
				//删除卡
				if(am.operateArr.indexOf('E')>-1){//判断是否有权限删除会员
					menuArr.push({name:"删除卡"});
				}

				am.popupMenu(msg, menuArr, function (ret) {
					console.log(ret);
					if(ret && ret.name=="充值"){
						var cardtype = am.metadata.cardTypeList.filter(function (a) {
							return a.cardtypeid == data.cardtypeid;
						});
						if (cardtype && cardtype[0] && cardtype[0].mgj_stopNoRecharge && cardtype[0].newflag == '0') {
							amGloble.msg('【' + cardtype[0].cardtypename + '】已停止办理，无法继续充值！');
							return;
						}
						var member = am.convertMemberDetailToSearch({
							memberInfo: self.$userInfo,
							card: data
						});
						// am.pw.check(member, function (verifyed) {
						// 	if (verifyed) {
						// 		console.log(data);
						// 		$.am.changePage(am.page.pay, "slideup", {
						// 			action: "recharge",
						// 			member: member
						// 		});
						// 	}
                        // });
                        $.am.changePage(am.page.pay, "slideup", {
                            action: "recharge",
                            member: member
                        });
					}else if(ret && ret.name=="卡金转出"){
						var _li = $(_this).parents('li');
						self.cardPopup.show(data,_li);
					}else if(ret && ret.name=="卡金转入"){
						var _li = $(_this).parents('li',2);
						self.cardPopup.show(data,_li,1);
					}else if(ret && ret.name=="设置密码"){
						var _li = $(_this).parents('li');
						var _item = _li.data('item');
						console.log(_item);
						//调取密码接口
						am.keyboard.show({
							phone: self.$userInfo.mobile,
							passwd: self.$userInfo.passwd,
							title: "请输入密码",
                            hidedot:true,
                            ciphertext:true,
                            forgetpwd:true,
							submit: function (value) {
                                console.log(value)
								if (value.length>6) {
									am.msg("您输入的6位以内数字密码!");
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
										am.msg('密码设置成功')
									} else {
										am.msg(res.message || "数据获取失败,请检查网络!");
									}
								});
							}
						});
					}else if(ret && ret.name=="清除密码"){
						var _li = $(_this).parents('li');
						var _item = _li.data('item');
						console.log(_item);
						//调取密码接口
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
								am.msg('密码清除成功')
							} else {
								am.msg(res.message || "数据获取失败,请检查网络!");
							}
						});
					}else if(ret && ret.name=="修改卡余额"){
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
						// am.pw.check(member, function (verifyed) {
						// 	if (verifyed) {
						// 		console.log(data);
						// 		$.am.changePage(am.page.pay, "slideup", {
						// 			action: "recharge",
						// 			member: member,
						// 			card: data,
						// 			renewal: 1
						// 		});
						// 	}
						// });
						$.am.changePage(am.page.pay, "slideup", {
							action: "recharge",
							member: member,
							card: data,
							renewal: 1
						});
					}
				});
			}).on("vclick", ".cardBox .duedatewrap .duedateedit", function (e) {
				e.stopPropagation();
				var _item = $(this).parents('li').data('item');
				console.log(_item);
			}).on("vclick", ".cardBox .free .remarkIcon", function (e) {	//改卡备注
				self.$.find('[isdisabled=1]').removeClass('am-clickable');
				e.stopPropagation();
				var _item = $(this).parents('li').data('item');
				self.$changeTarget = $(this).parents('li');
				console.log(_item);
				self.$arbox.find('textarea').val(_item.cardRemark)
					.end().removeClass('hide').data('id',_item.id);
				self.remarkFlag='card';
				return false;
			}).on("vclick", ".comboBox .comboRemarkIcon", function (e) {	//改套餐备注
				self.$.find('[isdisabled=1]').removeClass('am-clickable');
				e.stopPropagation();
				var _item = $(this).parents('li').data('item');
				self.$changeTarget = $(this).parents('li');
				console.log(_item);
				self.$arbox.find('textarea').val(_item.itemRemark)
					.end().removeClass('hide').data('id',_item.id);
				self.remarkFlag='combo';
			}).on("vclick", ".rightcombo .list ul li .treatmentdateedit", function (e) {
				e.stopPropagation();
				var _item = $(this).parents('li').data('item');
				console.log(_item);
			}).on("vclick", ".rightcombo .list ul li .back_combo", function (e) {//退套餐
				e.stopPropagation();
				var _li = $(this).parents('li');
				var data = $(this).parents('li').data('item');
				self.comboPopup.show(data,_li);
			}).on("vclick", ".filebody .cm_cutting .btn", function () {//重试
				self.renderOurselves(true);
			}).on("vclick", ".recordBox .cm_cutting .btn", function () {//消费记录重试
				self.renderRecord(true);
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
			//特权有效期选择器 chali
			this.privilegeCardSelect = new $.am.Select({
				$: self.$.find(".privilegeCardSelect"),
				data: [{"name": "一个月", "value": 1},
					{"name": "三个月", "value": 3},
					{"name": "半年", "value": 6},
					{"name": "一年", "value": 12},
					{"name": "不限期", "value": -1},
					{"name": "自定义有效期", "value": 0},],
				onSelect:function(){
					if(!self.privilegeCardSelect.getValue()){
						self.$privilegeCardBox.find('.validDate .item_input').removeClass('hide');
					}else if(!self.$privilegeCardBox.find('.validDate .item_input').hasClass('hide')){
						self.$privilegeCardBox.find('.validDate .item_input').addClass('hide');
					}
				}
			});
			this.tableScroll = new $.am.ScrollView({
				$wrap: this.$.find(".table-content-list"),
				$inner: this.$.find(".table-content-list table"),
				direction: [false, true],
				hasInput: false
			});
			this.tableScroll.refresh();
			this.pager = new $.am.Paging({
				$: self.$.find(".footcontent"),
				showNum: 15,//每页显示的条数
				total: 1,//总数
				action: function (_this, index) {
					self.recordIndex = index + 1;
					self.renderRecord();
				}
			});

			this.renderList = ["renderOurselves", "renderCard", "renderRecord"];
			//门店消费积分兑换
			this.$leftBox.on('vclick','.exchange',function(){
				if($(this).data('point') == 0){
					am.msg('您暂时没有可兑换的门店消费积分！')
					return;
				};
				self.$.find('.total strong').text($(this).data('point'))
				self.$exbox.removeClass('hide').end().find('.exinner').empty();
				self.renderCredit();
				self.exboxScroll.refresh();
			})
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
			})
			self.$privilegeCardBox.on('vclick','.privilegeCard_model_mask,.headright',function(){
				self.$privilegeCardBox.addClass('hide')
			}).on('vclick','.save_privilegeCard',function(){
				self.eidtPrivilegeTime();
			})

			this.cardPopup = new PopupRt({
				$:$('.cardfee_popup'),
				type:1,
				onRender:function($dom,data){
					if(data){
						$dom.find('.card_no .line_val')
							.text(data.cardid+' ('+data.cardtypename+')')
						.end().find('.card_shop .line_val')
							.text((self.getshopName(data.shopid).replace(/\s/g,'') || '门店名称未设定'))
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
						console.log(opt);
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
						if(outIndex>=0){//是当前页面中的卡 需要修改页面显示数据
							self.$cardul.find('li').eq(outIndex).data('item',outCard).find('.card_fee .fee_num').html("￥" + _outcardfee)
							.end().find('.card_present .fee_num').html("￥" + _outpresentfee );
						}
						//转入卡 卡金增加 同步修改下sum统计数据
						var _incardfee=inCard.cardfee*1+(cardfee||0);
						var _inpresentfee=inCard.presentfee*1+(presentfee||0);
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
						if(index>=0){//是当前页面中的卡 需要修改页面显示数据
							self.$cardul.find('li').eq(index).find('.card_fee .fee_num').html("￥" + _incardfee)
								.end().find('.card_present .fee_num').html("￥" + _inpresentfee );
						}
						// }
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
						if( !( !cardFee && !cashFee && !otherFee ) ){//计算疗程卡金余额
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
									if(backfee>(oncemoney*backtimes)){
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
							console.log(opt);
							return opt;
						}
					}else{
						am.msg('请先选择好一张退入卡！');
						return false;
					}
				},
				onChangeMemory:function($dom,inCard,outCard,res){
					console.log($dom,outCard,res);
					var combo = self.$userInfo.treatMentItems;
					if((outCard.sumtimes == 0 ||outCard.sumtimes == -99)||(outCard.leavetimes == 0 ||outCard.leavetimes == -99)){//不限次退成功直接删除dom
						$dom.remove();
						var index=-1;
						$.each(combo,function(i,combo){
							if(combo.memcardid==outCard.memcardid){
								index=i;
							}
						})
						index>=0 && combo.splice(index,1);
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
						console.log(combo);
						self.renderCircle(combo,true);
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
						self.$cardul.find('li').eq(index).find('.card_fee .fee_num').html("￥" + cardfee);
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
		beforeShow: function (paras) {
			if (paras == "back") return;
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
					onSet: function(valueText, inst) {
						self.$endInput.val(new Date(valueText.valueText).format("yyyy-mm-dd"));
					}
				});
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
		},
		afterShow: function (paras) {
			this.tableScroll.refresh();
			this.comboScroll.refresh();
		},
		beforeHide: function (paras) {
			this.selectCardId = null;//清空
			$("#pswp_dom").removeClass("pswp--open");
		},

		/**
		 * chali 更新详情页 暂时不判断门店版本是否 能开通特权
		 * 判断门店是否开通特权模式, 会员是否开通商城特权
		 */
		updateData:function(memberInfo){
			console.log(self.$memberInfo,"什么情况啊这个会员")
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
				this.privilegeCardSelect.setValue(0);
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
			this.$cardul.find('li').eq(index).remove();
			var $comboBoxDom=this.$comboBox.find('.list');
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
		changeTab: function (idx) {
			var $contentList = this.$contentList.hide();
			var $tab = this.$tab.find("li").removeClass("selected");
			$contentList.eq(idx).show();
			$tab.eq(idx).addClass('selected');
			// if(idx==1){
			// 	self.renderCard();
			// }
			this[this.renderList[idx]](true);

		},
		renderCircle: function (data,flag) {
			var canvas = this.$comboul.find("canvas");
			var num = [];
			for (var j = 0; j < data.length; j++) {
				num.push(data[j].leavetimes / data[j].sumtimes);
			}

			for (var i = 0; i < canvas.length; i++) {
				var ctx = canvas[i].getContext("2d");
				!flag && ctx.scale(2,2);
				ctx.clearRect(0, 0, 112, 112);
				(function (ctx, idx, self, words) {
					var j = 0;
					var timer = setInterval(function () {
						ctx.clearRect(0, 0, 112, 112);
						self.drawCircel(ctx, 70, 56, 25, 0, 2 * Math.PI);
						j++;
						self.drawCircel(ctx, 70, 56, 25, -(30 * 2 / 360) * Math.PI, 2 * Math.PI * ((num[idx] / 10) * j), "#625593", words);
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
                                    for (var j = 0; j < imgs.length; j++) {
                                        var $imgli = self.$imgBoxli.clone(true, true);
                                        $imgli.html(am.photoManager.createImage("customerFile", {
                                            parentShopId: am.metadata.userInfo.parentShopId,
                                            // catigoryId: item.userType,
										    authorId: item.userId
                                        }, imgs[j], "s"));
                                        $li.find(".imglist ul").append($imgli);
                                    }
                                }
                            }
						} else {
							$li.find(".outher").text(item.empName);
							$li.find(".right .words p").text(item.title);

							$li.find(".imglist ul").empty();
							console.log(item)
							var photoList = item.photo.split(",");
							if (photoList && photoList.length) {
								for (var j = 0; j < photoList.length; j++) {
									var $imgli = self.$imgBoxli.clone(true, true);
									$imgli.html(am.photoManager.createImage("show", {
										catigoryId: item.type,
										parentShopId: item.parentShopId,
										authorId: item.empId
									}, photoList[j], "s"));
									$li.find(".imglist ul").append($imgli);
								}
							}
						}
						if (self.getfileTime(item.createTime / 1000) == '刚刚') {
							$li.find(".left .key").text('上传');
						}
						$li.find(".left .value").text(self.getfileTime(item.createTime / 1000));

						self.$fileul.append($li);
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
		renderCard: function () {
			var data = this.cardCash;
			var comboInfo = self.$userInfo.treatMentItems;
			var $ul = this.$cardul;
			var cardList = ["type_zero", "type_one", "type_two"];
			$ul.empty();
			this.$comboul.empty();
			this.cardsInfo = {
				cardsNum:data.length,
				smsflag: 0,
				deductSmsFlag: 0
			};
			if (data.length) {
				for (var i = 0; i < data.length; i++) {
					var item = data[i],
						$li = this.$cardLi.clone(true, true);
					var cardType = amGloble.metadata.cardTypeMap[item.cardtypeid];
					if(cardType){
						if(cardType.smsflag==1){
							this.cardsInfo.smsflag ++;
						}
						if(cardType.deductSmsFlag==1){
							this.cardsInfo.deductSmsFlag ++;
						}
					}
					$li.find(".info_left .card_name").text(item.cardtypename);//卡类型名
					$li.find(".info_left .card_no").text(item.cardid);//卡号
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

					// $li.find(".num .key").text(item.cardid);

					//到期日
					if (item.invaliddate) {
						var _str = '到期日：' + new Date(item.invaliddate - 0).format("yyyy.mm.dd");
					} else {
						var _str = '到期日：无';
					}
					$li.find(".duedatewrap .duedate").text(_str);

					//散客卡、套餐消费卡应不能修改到期时间
					if (item.cardtypeid == "20151212" || item.cardtypeid == "20161012") {
						$li.find(".duedatewrap .duedateedit").hide();
					}
					//判断有没有权限修改到期日
					if (am.operateArr.indexOf('Z') == -1) {
						$li.find(".duedatewrap .duedateedit").hide();
					}

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
					$ul.append($li);
				}
				var emptyLi = this.$cardLi.clone(true, true);
				emptyLi.find(".card_base_info,.duedatewrap").css("opacity", 0).end().find(".free .key,.free").empty().end().addClass('addcard');

				$ul.append(emptyLi);
			}else{
				var emptyLi = this.$cardLi.clone(true, true);
				emptyLi.find(".card_base_info,.duedatewrap").css("opacity", 0).end().find(".free .key,.free").empty().end().addClass('addcard');
				$ul.append(emptyLi);
			}

			if(!this.cardsInfo.smsflag){
				this.$notifySms.removeClass('on');
			}
			if(!this.cardsInfo.deductSmsFlag){
				this.$deductSmsFeeFlag.removeClass('on');
			}

			if(comboInfo.length){
				this.$comboBox.removeClass("empty");
				var $comboli = this.$comboli.clone(true, true);
				$comboli.data('memberid',comboInfo.id);
				var $ulList = $comboli.find("ul");
				$ulList.empty();
				for (var l = 0; l < comboInfo.length; l++) {
					var itemtt = comboInfo[l];
					var $combolii = this.$combolii.clone(true, true);
					if(itemtt.isNewTreatment && itemtt.timesItemNOs){
						itemtt.itemname = am.page.comboCard.getItemNamesByNos(itemtt.timesItemNOs).join(",");
					}
					if(itemtt.itemRemark){
						$combolii.find(".comboRemark .remarkCon .text").html(itemtt.itemRemark);
					}
					$combolii.find(".left .key").html((itemtt.treattype == 1 ? '<strong class="highlight">[赠] </strong>' : '') + "<span class='combo_tit'><span class='combo_text'>" +(itemtt.itemname||' ') + "</span>(<b class='combo_times'>" + ((itemtt.sumtimes == 0 ||itemtt.sumtimes == -99) ? "不限" : itemtt.sumtimes) + "</b>次)"+"</span><span class='back_combo am-clickable'>退</span>");
					$combolii.find(".left .value").html((itemtt.validdate ? ('<span class="duedate">到期日：' + self.getTime(itemtt.validdate) + '</span><span class="treatmentdateedit am-clickable"></span>') : ('<span class="duedate">不限期' + '</span><span class="treatmentdateedit am-clickable"></span>')));
					$ulList.append($combolii);
					$combolii.data("item", itemtt);

					//判断有没有权限修改到期日
					if (am.operateArr.indexOf('Z') == -1) {
						$combolii.find(".left .value .treatmentdateedit").hide();
					}
					if (am.operateArr.indexOf('a7') > -1) {//默认 显示 有这个权限 就隐藏退款按钮
						$combolii.find(".left .key .back_combo").hide();
					}
				}
				this.$comboul.append($comboli);
			}
			if (!this.$comboul.find(".list") || !this.$comboul.find(".list").length) {
				this.$comboBox.addClass("empty");
			} else {
				//画圆
				var combo = comboInfo;
				this.renderCircle(combo);
			}

			this.cardScroll.refresh();
			this.cardScroll.scrollTo("top");

			this.comboScroll.refresh();
			this.comboScroll.scrollTo("top");

			//改日期(卡)
			this.$cardBox.find(".duedatewrap .duedateedit").mobiscroll().calendar({
				theme: 'mobiscroll',
				lang: 'zh',
				display: 'bottom',
				months: "auto",
				setOnDayTap: true,
				buttons: [],
				onSet: function (valueText, inst) {
					var _valueText = valueText.valueText;
					var _li = $(this).parents('li');
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

			//改日期(项目)
			this.$comboBox.find(".list .treatmentdateedit").mobiscroll().calendar({
				theme: 'mobiscroll',
				lang: 'zh',
				display: 'bottom',
				months: "auto",
				setOnDayTap: true,
				buttons: [],
				onSet: function (valueText, inst) {
					var _valueText = valueText.valueText;
					var _li = $(this).parents('li');
					var _item = _li.data('item');
					console.log(_valueText);
					console.log(_item);

					var _d = {
						'itemId': _item.id,
						'validate': new Date(_valueText).getTime(),
						'oldDate': _item.validdate ? _item.validdate : '',
						'operator': amGloble.metadata.userInfo.userName,
						'shopId': amGloble.metadata.userInfo.shopId + '',
						'cardNo': _item.cardno
					};
					console.log(_d);
					am.loading.show("修改中,请稍候...");
					am.api.invalidateUpdate.exec(_d, function (res) {
						am.loading.hide();
						console.log(res);
						if (res.code == 0) {
							var _date = new Date(_d.validate).format("yyyy.mm.dd");
							_li.find('.value .duedate').text('到期日：' + _date );

							_item.validdate = _d.validate;
							_li.data('item', _item);
						} else {
							am.msg(res.message || "数据获取失败,请检查网络!");
						}
					});
				}
			});

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
							'<td style="width:10%"><div class="tdwrap">' + (item.billno || "") + '</div></td>' +
							'<td style="width:9%"><div class="tdwrap price">￥' + (item.expense * 1 == 0 ? 0 : item.expense) + '</div></td>' +
							'<td style="width:33%"><div class="tdwrap addproject"></div></td>' +
							'<td style="width:11%"><div class="tdwrap">' + am.time2str(item.createDate / 1000) + '</div></td>' +
							'<td style="width:12%"><div class="tdwrap">' + self.getshopName(item.storeId) + '</div></td>' +
							'<td style="width:13%"><div class="tdwrap empName"></div><div class="otherEmps"></div></td>' +
							'<td style="width:6%"><div class="signature am-clickable" data-memberid="' + item.custId + '" data-storeid="' + item.storeId + '" data-billid="' + item.id + '">查看</div></td>' +
							'<td style="width:6%"><div class="comment am-clickable selected iconfont icon-comments"><span class="comment-content"></span></div></td>'+
							'</tr>').data("item", item);
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
								$html.find(".addproject").append('<span>' + $text + '</span>');

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
			});


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
		renderUserInfo: function (data) {
			var self = this;
			if (data.content) {
				if(am.operateArr.indexOf("MGJP") !=-1){
					var mobile = self.$userInfo.mobile.replace(/\d{4}$/,"****");
				}
				var memberInfo = data.content.memberInfo,
					mgjwebactivated = memberInfo.mgjwebactivated,//是否开通微信
					mgjappactivated = memberInfo.mgjappactivated;//是否下载app
				this.$leftBox.data('item', memberInfo);
				this.$leftBox.find(".header_box").html(am.photoManager.createImage("customer", {
					parentShopId: am.metadata.userInfo.parentShopId,
					updateTs: memberInfo.lastphotoupdatetime || new Date().getTime()
				}, memberInfo.id + ".jpg", "s")).end().find(".name .username").text(memberInfo.name).end()
					.find(".mobile").text(mobile).end()
					.find(".shops").text(self.getshopName(memberInfo.shopid) || "");

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
				this.$leftBox.find('.excbox .num').text(memberInfo.currpoint ? memberInfo.currpoint : 0).parent().data('point',memberInfo.currpoint ? memberInfo.currpoint : 0);
				//线上消费积分onLineExchangeBox
				this.$leftBox.find('.onLineExchangeBox .onLineNum').text(memberInfo.totalOnlineCredit ? memberInfo.totalOnlineCredit : 0).parent().data('point',memberInfo.totalOnlineCredit ? memberInfo.totalOnlineCredit : 0);
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
			ctx.fillText("剩余", 70, 68);
			ctx.stroke();

			ctx.beginPath();
			ctx.textAlign = "center";
			ctx.font = "13px Helvetica";
			ctx.fillStyle = "#222222";
			ctx.fillText((words ? (words + "次") : ""), 70, 55);
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
			this.$azbox.find("textarea[name='addqzone_qzone_content']").val("");
			this.$arbox.find("textarea[name='addremark_qzone_content']").val("");
			this.$adbox.find("input[name='showInMYKSwitch']").prop("checked", false)
			this.renderOurselves(true);
		},
		getData: function (callback) {
			var metadata = am.metadata;
			var $data = this.$data;
			am.loading.show("正在获取数据,请稍候...");
			am.api.memberDetails.exec({
				"shopId": $data.shopId,// || am.metadata.userInfo.shopId
				"memberid": $data.customerId,
				"parentShopId": am.metadata.userInfo.parentShopId
			}, function (res) {
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
			var metadata = am.metadata;
			var $data = this.$data;
			am.loading.show("正在获取数据,请稍候...");
			am.api.listService.exec({
				"shopId": am.metadata.userInfo.shopId,//$data.shopid
				"memberid": $data.customerId,
				"parentShopId": am.metadata.userInfo.parentShopId,
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
						self.$changeTarget.find('.comboRemark .remarkCon .text').html(opt.itemRemark);
						var data=self.$changeTarget.data('item');
						data.itemRemark=opt.itemRemark;
						self.$changeTarget.data("item",data);
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
			}else if(validDateVal == 0){
				validDate = new Date(self.$endInput.val());
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
				createtime: new Date(self.$startInput.val()).getTime(),
				expireDate: validDate != null?validDate.getTime():null,
				targetDate: validDate != null?validDate.getTime():null,
				id:(self.$memberInfo.privilege != null && self.$memberInfo.privilege.hasOwnProperty("id"))? self.$memberInfo.privilege.id:null,
			}
			//延期特权
			if(self.$memberInfo.privilege !=null && self.$memberInfo.privilege.hasOwnProperty("ownerId") && self.$memberInfo.id == self.$memberInfo.privilege.ownerId){// 会员已开通
				opt ={
					// ownerId: self.$memberInfo.id,  // memberinfo.id
					// ownerName: self.$memberInfo.name, // memberinfo.name
					// mobile: self.$memberInfo.mobile,   // memberinfo.mobile ?
					parentShopId:amGloble.metadata.userInfo.parentShopId,
					shopId:self.$memberInfo.shopid,
					openShopId:amGloble.metadata.userInfo.shopId,
					optId:amGloble.metadata.userInfo.userId,
					optName:amGloble.metadata.userInfo.userName,
					privilegeId:(self.$memberInfo.privilege != null && self.$memberInfo.privilege.hasOwnProperty("privilegeId"))? self.$memberInfo.privilege.privilegeId:null,
					expireDate: self.$memberInfo.privilege.expireDate,
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
		showShopList:function(items,memberType){
			am.popupMenu("将此顾客转移至", items, function (ret) {
				if(ret.children){
					self.showShopList(ret.children);
				}else{
					if(!memberType && ret.softgenre===2 ){
						//直营店
						am.confirm("提示","确认要将此顾客转移至"+ret.name+"吗?", "确认", "返回", function(){
							self.changeMemberShop(ret);
						}, function(){
	
						});
					}else{
						am.confirm("警告!","附属门店的项目与会员卡等数据是独立配置，转移顾客资料可能造成数据不匹配，请谨慎！", "确认转移", "返回", function(){
							self.changeMemberShop(ret);
						}, function(){
	
						});
					}
				}
			});
		},
		changeMemberShop:function(shop){
			am.api.transferShop.exec({
				"shopId":this.$userInfo.shopid.toString(),
				"memberId":this.$userInfo.id,
				"toShopId":shop.id,
				"operator":am.metadata.userInfo.userName
			},function(ret){
				if(ret && ret.code===0){
					self.$shopEdit.text(shop.name);
					self.$userInfo.shopid = shop.id;
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
						self.changeMemberShop(shop);
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
		}else{
			this.cards = opt.ownCards;
			this._bindSelect();
			this._bindComboInput();
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
		},
		render:function(data){
			this.onRender(this.$parent.find('.card_from'),data);
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
				if(isExchange){//转入
					var clientHeight = $('body').outerHeight();
				 	self.$cardfeePopup.css({
				 		"height":clientHeight + 'px',
				 		"position":'absolute',
				 		"top":0,
				 		"bottom":'auto'
				 	});
					this.$popupTit.text('卡金转入');
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
			data = this.convertSearchCardToMemberDetailCards(data);
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
			if(val.cardtype!="2" && val.timeflag!="1"){
				am.msg('找到卡了！');
				this.$parent.find('.card_to').removeClass('init').removeClass('open').data('inCard',val);
				this.inCard=val;
				this.$parent.find('.card_to').find('.card_name').html(val.cardtypename)
					.end().find('.card_no').html(' ('+val.cardid+') ')
					.end().find('.card_fee').html('卡金：'+am.cashierRound(val.cardfee))
					.end().find('.card_pfee').html('赠金：'+am.cashierRound(val.presentfee))
					.end().find('.card_osName').html('开卡门店：'+(self.getshopName(val.shopid).replace(/\s/g,'')||'门店名称未设定'));
			}else{
				am.msg('资格卡和计次卡不能用来转账！');
			}
		},
		submit:function(){
			var _this=this,res=null;
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
		},
		getshopIds:function(id){
            var res=[];
            var shopList=am.metadata.shopList;
            for(var i=0;i<shopList.length;i++){
                res.push(shopList[i].shopId);
            }
            return res.join(",");
    },
    convertSearchCardToMemberDetailCards:function(optCards){//转卡金用的数据 主要用于 校验、提交、还有改内存
    	var res=[];
    	$.each(optCards,function(i,card){
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
    			shopid:card.shopId//开卡门店id
    		})
    	})
    	return res;
	}
	}
})(jQuery);

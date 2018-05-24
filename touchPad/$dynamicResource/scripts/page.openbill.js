(function () {
	var statusName = [null, "待客", "轮牌", "点客", "临休"];
	var posName = ['第一工位', '第二工位', '第三工位'];
	var self = am.page.openbill = new $.am.Page({
		id: "page_openbill",
		backButtonOnclick: function () {
			if(this.paras.source == "service"){
				$.am.page.back();
			}else{
				if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
					$.am.changePage(am.page.hangup, "", {
						openbill: 1
					});
				} else {
					$.am.page.back("slidedown");
				}
			}
			

		},
		init: function () {
			var _this = this;
			this.$list = this.$.find('.list');
			this.$li = this.$list.find('li').eq(0).remove();
			this.$wrapper = this.$list.find('.wrapper').eq(0).remove();
			this.$list.empty();

			this.$billno_box = this.$.find(".billno_box");
			this.$remark_box = this.$.find(".remark_box");
			this.$member = this.$.find(".member");

			this.$list.on('vclick', '.outside', function () {
				if($(this).parent().hasClass('disabled')){
					return;
				}
				var parentData = $(this).parents('.wrapper').data('data');
				if (parentData && parentData.status == 0) {
					// am.msg('无法选择非状态牌');
					// return;
				}
				var data = $(this).parents('li').data('data');
				// if(parentData && data.status==4){
				// 	am.msg('无法选择临休员工');
				// 	return;
				// }
				var pos = data.empId ? am.metadata.empMap[data.empId].pos : data.pos;
				if (self.server[pos]) {
					var lis = self.$list.find('.active');
					for (var i = 0; i < lis.length; i++) {
						var item = $(lis[i]).data('data');
						var pos2 = item.empId ? am.metadata.empMap[item.empId].pos : item.pos;
						if (pos2 == pos) {
							$(lis[i]).removeClass('active');

						}
					}
				}
				$(this).parents('li').addClass('active');
				$(this).parents('li').find('.appoint').removeClass('yes').find('p').html('非指定');
				$(this).parents('li').find('.wash').removeClass('washing');
				// var _lis = _this.$list.find('li'); 
				// for(var i=0;i<_lis.length;i++){
				// 	if($(_lis[i]).data('data').empId==data.empId){
				// 		$(_lis[i]).addClass('active').find('.appoint').removeClass('yes').find('p').html('非指定');
				// 		$(_lis[i]).find('.wash').removeClass('washing');
				// 	}
				// }
				// var $prevs = $(this).parents('li').prevAll();
				// if(amGloble.operateArr.indexOf('a1')==-1){
				// 	var isSpecified = 0;
				// 	/* if($prevs.length){
				// 		for(var i=0;i<$prevs.length;i++){
				// 			if($($prevs[i]).data('data').status==1){
				// 				isSpecified ++;
				// 			}
				// 		}
				// 	} */
				// 	if(isSpecified){
				// 		$(this).parents('li').find('.appoint').addClass('yes').find('p').html('指定');
				// 	}else {
				// 		$(this).parents('li').find('.appoint').removeClass('yes').find('p').html('非指定');
				// 	}
				// }else {
				// 	$(this).parents('li').find('.appoint').removeClass('yes').find('p').html('非指定');
				// }
				self.server[pos] = {
					$: $(this).parents('li'),
					data: data
				};
			}).on('vclick', '.inside', function (e) {
				var data = $(this).parents('li').data('data');
				var pos = data.empId ? am.metadata.empMap[data.empId].pos : data.pos;
				if(_this.selectArr.length && _this.selectArr.indexOf(pos)>-1){
					am.msg('无法修改已经选择保存的手艺人');
					return;
				}
				$(this).parents('li').removeClass('active');
				self.server[pos] = null;
			}).on('vclick', '.appoint', function (e) {
				e.stopPropagation();
				var data = $(this).parents('li').data('data');
				var pos = data.empId ? am.metadata.empMap[data.empId].pos : data.pos;
				if(_this.selectArr.length && _this.selectArr.indexOf(pos)>-1){
					am.msg('无法修改已经选择保存的手艺人');
					return;
				}
				if(amGloble.operateArr.indexOf('a1')==-1){
					if ($(this).hasClass('yes')) {
						$(this).removeClass('yes').find('p').html('非指定');
					} else {
						$(this).addClass('yes').find('p').html('指定');
					}
				}else {
					if(amGloble.metadata.userInfo.mgjVersion==1){
						return;
					}
					if(!amGloble.metadata.shopPropertyField.authorizationCard){
						am.msg('没有权限操作或没有设置授权卡');
						return;
					}
					var _appoint = $(this);
					am.auth.show({
						anthSuccess:function(){
							if (_appoint.hasClass('yes')) {
								_appoint.removeClass('yes').find('p').html('非指定');
							} else {
								_appoint.addClass('yes').find('p').html('指定');
							}
						}
					});
				}
			}).on('vclick', '.overcard', function (e) {
				e.stopPropagation();
				// if ($(this).hasClass('yes')) {
				// 	$(this).removeClass('yes').find('p').html('不过牌');
				// } else {
				// 	$(this).addClass('yes').find('p').html('过牌');
				// }
			}).on('vclick','.wash',function(e){
				e.stopPropagation();
				if($(this).hasClass('washing')){
					$(this).removeClass('washing');
				}else {
					_this.$list.find('.wash').removeClass('washing');
					$(this).addClass('washing');
				}
			});
			this.$.on('vclick', '.back', function () {
				_this.backButtonOnclick();
			}).on("vclick", ".sex li", function () {
				$(this).addClass("active").siblings().removeClass("active");
			}).on("vclick", ".submit", function () {
				var item = _this.getSaveData();
				/*if(!$.isPlainObject(item.data)){
					item.data = JSON.parse(item.data);
				}else{

				}*/
				if (item.displayId == "") {
					//am.msg("请先选择服务号！");
					self.getData(function (ret) {
						am.createService.show(ret, function (data) {
							item.displayId = data.displayId;
							self.$.find(".displayId").html(data.displayId);
							self.save(item, function (ret) {
								am.cashierTab.feedBill(ret.content, 1);
							});
						});
					})
				} else {
					self.save(item, function (ret) {
						console.log("item=====", item);
						console.log("ret.content=====", ret.content);
						am.cashierTab.feedBill(ret.content, 1);
					});
				}

				//am.cashierTab.feedBill(item,1);
				//console.log(item);
			}).on("vclick", ".member", function () {
				if (_this.paras.rowdata && _this.paras.rowdata.id) {
					am.msg("不能修改会员！");
				} else {
					if (_this.paras) {
						if(!_this.paras.member){
							var data = _this.getSaveData();
							am.pageStatus.setStatus("openbill_billInfo", data);
							$.am.changePage(am.page.searchMember, "slideup", {
								onSelect: function (item) {
									$.am.changePage(am.page.openbill, "slidedown", $.extend(_this.paras, {
										member: item
									}));
								}
							});
						}else {
							var data = $(this).parents('.memberInfo').data('item');
							console.log(data);
							$.am.changePage(am.page.memberDetails, "slideup",{
								customerId:data.memId,
								tabId:1
							});
						}
					}
				}


			}).on("vclick", ".memberOpen", function () {
				var data = _this.getSaveData();
				am.pageStatus.setStatus("openbill_billInfo", data);
				$.am.changePage(am.page.searchMember, "slideup", {
					onSelect: function (item) {
						$.am.changePage(am.page.openbill, "slidedown", $.extend(_this.paras, {
							member: item
						}));
					}
				});

			}).on("vclick", ".num", function () {
				self.getData(function (ret) {
					am.createService.show(ret, function (data) {
						self.$.find(".displayId").html(data.displayId);
					});
				})
			}).on("vclick", ".orderOpen", function () {
				var data = _this.getSaveData();
				am.pageStatus.setStatus("openbill_billInfo", data);
				$.am.changePage(am.page.reservation, "slideup", {
					openbill: 1
				});
			});

			this.$closeTip = this.$.find('.closeTip').vclick(function () {
				$(this).parent().hide();
			});

			this.listScroll = new $.am.ScrollView({
				$wrap: this.$list.parent(),
				$inner: this.$list,
				direction: [false, true],
				hasInput: false
			});

			this.$remark = this.$.find('.remarkboxwrap').vclick(function(){
				var $input = $(this).find('.remark_box');
				var remark = $input.html().substring(3,$input.html().length);
				var data   = _this.getSaveData();
				am.hangupRemark.show({
					value:remark || "",
					billData:data,
					submit:function (res) {
						var remark = res.textarea;
						var temp = res;
						delete temp.textarea;
						$input.data("item",temp);
						$input.html('备注：'+remark);
					}
				});
				// am.addRemark.show({
                //     value:remark,
                //     cb:function (val) {
	            //         $input.html('备注：'+val);
                //     },
                //     maxlength:30,
                // });
			});

		},
		setHangUpNum: function (i) {
			if (i) {
				this.$.find('.orderOpen .num').show().text(i);
			} else {
				this.$.find('.orderOpen .num').hide().text("");
			}
		},
		getData: function (cb) {
			var self = this;
			var user = am.metadata.userInfo;
			//self.$container.empty();
			//self.hangupScroll.refresh();
			am.loading.show("正在获取数据，请稍候...");
			am.api.hangupList.exec({
				"shopId": user.shopId,
				"pageSize": 99999, //可选，如果有则分页，否则不分页
				"channel": 1
			}, function (ret) {
				am.loading.hide();
				cb(ret);
			});
		},
		setdisplayId:function(id){
			if (id) {
				this.$.find(".displayId").html(id);
			} else {
				this.$.find(".displayId").html("--");
			}
		},
		renderopenbill: function (paras) {
			console.log("paras=====", paras)
			var rowdata = paras.rowdata;
			var editInfo = null;
			var _this=this;
			if (rowdata) {
				try {
					editInfo = JSON.parse(rowdata.data);
				} catch (e) {
					console.log(e);
				}
			}
			if (paras && paras.member) {
				//渲染会员

				var member = paras.member;
				this.$member.find(".name").html(member.name);
				this.$member.find('.header').html(am.photoManager.createImage('customer', {
					parentShopId: am.metadata.userInfo.parentShopId,
					updateTs: member.lastphotoupdatetime || ""
				}, member.id + ".jpg", "s"));
				this.$.find(".memberInfo").data("item", {
					memId: member.id,
					memName: member.name,
					memPhone: member.mobile,
					cid: member.cid,
					sex: member.sex
				});
				if (member.comment) {
					member.comment = member.comment.substring(0, 50);
					this.$.find(".remark_box").html('备注：'+member.comment);
				}else {
					this.$.find(".remark_box").html('备注：');
				}
				var temp = am.pageStatus.getStatus("openbill_billInfo");
				if (temp) {
					rowdata = temp;

				} else {
					rowdata = {};
				}
				rowdata.memId = member.id;
				rowdata.memName = member.name;
				rowdata.memPhone = member.mobile;
				rowdata.instorecomment = member.comment;
				if(!editInfo){
					editInfo = {};
				}
				editInfo.genderGuest = member.sex=="M"?1:0;
				this.paras.rowdata = rowdata; //赋给paras

			} else {
				this.$.find(".memberInfo").data("item", null);
			}
			if (paras.reservation) { //从预约开单
				rowdata = am.pageStatus.getStatus("openbill_billInfo");
				if (!rowdata) {
					rowdata = {};
				}
				rowdata.reservation = paras.reservation;
				this.$.find(".orderOpen").data("item", paras.reservation);
				this.$.find(".memberInfo").data("item", {
					memId: paras.reservation.custId,
					memName: paras.reservation.custName,
					memPhone: paras.reservation.memmobile
				});
				rowdata.memId = paras.reservation.custId;
				rowdata.memName = paras.reservation.custName;
				rowdata.memPhone = paras.reservation.memmobile;
				//检查发型师
				if (paras.reservation.barberId) {
					var emp = am.metadata.empMap[paras.reservation.barberId];
					rowdata['emp' + (Number(emp.pos)+1)] = paras.reservation.barberId;
					rowdata['emp' + (Number(emp.pos)+1) + 'Name'] = emp.name;
					rowdata['isSpecified' + (Number(emp.pos)+1)]    = 1;
				}
				if(!editInfo){
					editInfo = {};
				}
				editInfo.genderGuest = paras.reservation.sex=="M"?1:0;

				am.api.queryMemberById.exec({
                    memberid:paras.reservation.custId
                },function(ret){
                	if(ret && ret.code==0 && ret.content && ret.content.length){
                		var mem = ret.content[0];
                		editInfo.genderGuest = mem.sex =="M"?1:0;
                		_this.$.find(".sex li").removeClass("active").eq(editInfo.genderGuest).addClass('active');
                	}
                });
				this.paras.rowdata = rowdata; //赋给paras
			} else {
				this.$.find(".orderOpen").data("item", null);
			}

			if (rowdata && rowdata.displayId) {
				this.$.find(".displayId").html(rowdata.displayId);
			} else {
				this.$.find(".displayId").html("--");
			}
			console.log(paras.reservation);

			if (rowdata) { //
				this.$.find(".remark_box").html('备注：'+(rowdata.instorecomment || ''));
				if (rowdata.memId != -1) {
					if(!paras.member){
						this.$member.find(".name").html(rowdata.memName);
						this.$member.find('.header').html(am.photoManager.createImage('customer', {
							parentShopId: am.metadata.userInfo.parentShopId,
							updateTs: ""
						}, rowdata.memId + ".jpg", "s"));
						this.$.find(".memberInfo").data("item", {
							memId: rowdata.memId,
							memName: rowdata.memName,
							memPhone: rowdata.memPhone,
							memGender: editInfo && editInfo.memGender,
							cid: editInfo && editInfo.cid
						});
					}
					
				} else {
					this.$member.find(".name").html("散客");
					this.$member.find('.header').html("");
				}
				this.$.find(".sex li").removeClass("active").eq(0).addClass('active');
				if (editInfo) {
					this.$.find(".sex li").removeClass("active").eq(editInfo.genderGuest || 0).addClass('active');
				}
				if (rowdata.id) {
					this.$.find(".submit").text("确认修改");
					this.$.find(".head .right").hide();
					this.$.find('.head .mid').addClass('edit');
				} else {
					this.$.find(".submit").text("确认开单");
					this.$.find(".head .right").show();
					this.$.find('.head .mid').removeClass('edit');
				}
				if (rowdata.serviceNO) {
					this.$billno_box.show().find(".billno").html(rowdata.serviceNO);
				}
				this.$remark.addClass('edit');
			} else { //
				this.$.find(".head .right").show();
				this.$.find('.head .mid').removeClass('edit');
				this.reset();
			}

			var billRemark = null;
			if(editInfo){
				billRemark = this.getBillRemark(editInfo);
				this.$.find('.remark_box').data("item",billRemark);
			}
		},
		getBillRemark:function(editInfo){
			var data = null;
			try{
				data = JSon.parse(editInfo);
			}catch(e){}
			if(data){
				return data.billRemark;
			}else{
				return null;
			}
			
		},
		reset: function () {
			this.$remark.removeClass('edit');
			this.$.find('.remark_box').html("备注："); //备注
			this.$.find('.remark_box').data("item",null);
			this.$member.find(".name").html("散客");
			this.$member.find('.header').html("");
			this.$.find(".sex li").removeClass("active").eq(0).addClass('active');
			this.$.find(".submit").text("确认开单");
			this.$billno_box.hide();
		},
		beforeShow: function (paras) {
			this.selectArr = [];
			this.server = [null, null, null];
			this.paras = paras;
			if (paras == 'back') {
				return;
			}
			this.$list.empty();
			this.renderopenbill(paras);

		},
		afterShow: function (paras) {
			if (paras == 'back') {
				return;
			}
			if (am.metadata.userInfo.mgjVersion == 3 && am.metadata.configs.orderConnectWithRotate == 'true') {
				this.getQueueList(true);
			} else {
				this.renderPos();
			}
		},
		beforeHide: function () {
			for (var i = 0; i < this.$list.find('.wrapper').length; i++) {
				this.stopInterval(i);
			}
			if (this.timerRetry) {
                clearTimeout(this.timerRetry);
                delete this.timerRetry;
            }
		},
		afterHide: function () {

		},
		getEmpdata: function () {
			// var json = {
			//     "emp1": emps[0].id, //工位1 id，空为-1
			//     "emp2": emps[1].id,
			//     "emp3": emps[2].id,
			//     "emp1Name": emps[0].name, //工位1名字, 空为""
			//     "emp2Name": emps[1].name,
			//     "emp3Name": emps[2].name,
			//     "isSpecified1": emps[0].specified, //0非指定 1指定
			//     "isSpecified2": emps[1].specified,
			//     "isSpecified3": emps[2].specified
			// };
			var json = {};
			console.group("工位数据");
			console.log(this.server);
			console.groupEnd();
			for (var i = 0; i < this.server.length; i++) {
				var itemArr = this.server[i],
					item = null;
				if (itemArr && itemArr.data) {
					item = itemArr.data;
				}
				json['emp' + (i + 1)] = item ? item.empId : -1;
				var empobj = item ? amGloble.metadata.empMap[item.empId] : {};
				json['emp' + (i + 1) + 'Name'] = item ? (empobj.name || "") : "";
				json['emp' + (i + 1) + 'RotateId'] = item ? item.rotateId : -1;
				json['isSpecified' + (i + 1)] = 0; //0非指定 1指定
				//json['unTail'+(i+1)]=0;//1盖牌不过牌
				if (itemArr && itemArr.$ && 　itemArr.$.find(".appoint").hasClass('yes')) {
					json['isSpecified' + (i + 1)] = 1;
				}
				// if (itemArr && itemArr.$ && 　itemArr.$.find(".overcard").hasClass('yes')) {
				// 	json['unTail' + (i + 1)] = 1;
				// }
				//json.shampooworkbay = i + 1;//洗发字段  可不传

			}
			return json;
		},
		getSaveData: function () { //获取要保存的数据
			var opt = {};
			var rowdata = this.paras.rowdata;
			var now = new Date().getTime();
			// var cust = this.paras?this.paras.member:null;//会员
			opt.instorecomment = this.$.find('.remark_box').html().substring(3,this.$.find('.remark_box').html().length); //备注
			var json = this.getEmpdata();
			var opt = $.extend(opt, json);
			var genderGuest = this.$.find(".memberInfo .sex li.active").data("savevalue");

			var displayId = this.$.find(".displayId").html();
			var reservation = this.$.find(".orderOpen").data("item");
			var member = this.$.find(".memberInfo").data("item");
			var editInfo = null;
			if (rowdata && 　rowdata.data) {
				editInfo = JSON.parse(rowdata.data);
			}
			if (rowdata && rowdata.id) {
				opt.id = rowdata.id;
			}
			if (rowdata && rowdata.serviceNO) {
				opt.serviceNO = rowdata.serviceNO;
			}

			
			if (member) {
				opt.memId = member.memId;
				opt.memName = member.memName;
				opt.memPhone = member.memPhone;
				if (editInfo) {
					opt.data = editInfo;
					opt.data.memGender = member.sex;
					opt.data.cid = member.cid;
				} else {
					opt.data = {
						"memGender": member.sex,
						"cid": member.cid
					};
				}

			} else {
				opt.memId = -1;
				opt.memName = "";
				opt.memPhone = "";
				if (editInfo) {
					opt.data = editInfo;
				} else {
					opt.data = {"memGender":"F"};
				}

			}
			if (reservation) {
				console.log("reservation==========", reservation)
				var serviceItems = [];
				var sumfee = 0.0;

				var items = {};packages = {};
				if(reservation.itemProp){
					items = JSON.parse(reservation.itemProp).items;
					packages = JSON.parse(reservation.itemProp).packages;
				}
				var itemData = null;
				if (!$.isEmptyObject(items)) {
					itemData = items;
				} else {
					if (!$.isEmptyObject(packages)) {
						itemData = packages;
					}
				}
				for (var key in itemData) {
					var item = am.metadata.serviceItemMap[key];
					if (item) {
						var service = {};
						service.id = item.id
						service.price = item.price;
						service.name = item.name;
						service.dept = "";
						service.servers = null;
						serviceItems.push(service);
						sumfee += parseFloat(item.price);
					}
				}
				opt.data.serviceItems=serviceItems;
				opt.data.sumfee=sumfee;
				opt.reservationId = reservation.id;
			} else {
				opt.reservationId = -1;
			}
			if (displayId != "--") {
				opt.displayId = displayId; //手牌号
			} else {
				opt.displayId = ""; //手牌号
			}
			opt.channel = 1; //渠道 1从无纸化开单 2从收银开单
			opt.createDateTime = now;
			if(!rowdata || (rowdata && !rowdata.id)){
				opt.shampooStartTime = null; //洗发开始时间
				opt.shampooFinishTime = null; //洗发结束时间,
				if (amGloble.metadata.configs.notAutoStartShampooTime != "true") {
                    opt.shampooStartTime = new Date().getTime();
                }
				opt.openBillType = 1;
			}else {
				opt.shampooStartTime = rowdata.shampooStartTime; //洗发开始时间
				opt.shampooFinishTime = rowdata.shampooFinishTime; //洗发结束时间,
			}
			
			opt.data.genderGuest = genderGuest; //性别 0:女  1:男

			var billRemark = this.$.find(".remark_box").data("item");
			opt.data.billRemark  = billRemark;

			if ($.isPlainObject(opt.data)) {
				opt.data = JSON.stringify(opt.data);
			}
			opt.shampooworkbay = null;
			for (var i = 0; i < this.server.length; i++){
				var itemArr = this.server[i],
					item = null;
				if (itemArr && itemArr.data) {
					if(itemArr.$.find('.washing').length){
						opt.shampooworkbay = i+1;
					}
				}
			}
			return opt;
		},
		save: function (opt, callback) {
			am.loading.show();
			$.extend(opt, {
				parentShopId: am.metadata.userInfo.parentShopId,
				shopId: am.metadata.userInfo.shopId,
			});
			am.api.hangupSave.exec(opt, function (ret) {
				am.loading.hide();
				if (ret && ret.code == 0) {
					callback && callback(ret);
				} else {
					am.msg(ret.message || "操作失败，请重试~");
				}
			});
		},
		server: [null, null, null],
		getQueueList: function (needLoading) {
			if(needLoading){
				am.loading.show();
			}
			am.api.queueList.exec({
				parentShopId: am.metadata.userInfo.parentShopId,
				shopId: am.metadata.userInfo.shopId,
			}, function (ret) {
				am.loading.hide();
				console.log(ret);
				if (ret && ret.code == 0) {
					self.renderQueue(ret.content);
					if (self.timerRetry) {
		                clearTimeout(self.timerRetry);
		                delete self.timerRetry;
		            }
					self.timerRetry = setTimeout(function() {
	                    self.getQueueList();
	                }, 60000);
				}else if (ret && ret.code == -1) {
					atMobile.nativeUIWidget.confirm({
		                caption: '数据获取失败',
		                description: '是否重试',
		                okCaption: '确定',
		                cancelCaption: '取消'
		            }, function(){
		                self.getQueueList(needLoading);
		            }, function(){

		            });
				}
			});
		},
		renderQueue: function (data) {
			this.$list.empty();
			if(am.auth.$){
				am.auth.hide();
			}
			for (var i = 0; i < data.length; i++) {
				var $wrapper = this.$wrapper.clone();
				$wrapper.find('.type').html(data[i].name);
				$wrapper.data('data', data[i]);
				var _status = data[i].status;
				var setting_washTime = am.page.service.billMain.getSetting().setting_washTime;
				var washTimeFlag = setting_washTime && setting_washTime == 1 && am.metadata.configs.rcordRinseTime && am.metadata.configs.rcordRinseTime == 'false';
				if (data[i].users.length) {
					for (var j = 0; j < data[i].users.length; j++) {
						var $li = this.$li.clone();
						if(washTimeFlag){
							$li.removeClass('notWash');
						}else {
							$li.addClass('notWash');
						}
						var item = data[i].users[j];
						$li.find('.no').html(item.empId);
						var emp = am.metadata.empMap[item.empId];
						if (emp) {
							$li.find('.no').html(emp.no);
							$li.find('.name').html(emp.name);
							$li.find('.role').html('已选择第'+(Number(emp.pos)+1)+'工位');
							$li.find('.header').html(am.photoManager.createImage('artisan', {
								parentShopId: am.metadata.userInfo.parentShopId,
							}, emp.id + '.jpg', 's'));

							var now = new Date().getTime();
							var _diff = now - item.statusTime < 0 ? Math.abs(now - item.statusTime) : 0;
							item.diff = _diff;

							if (this.paras && this.paras.rowdata) {
								var rowdata = this.paras.rowdata;
								console.log(rowdata)
								var pos = item.empId ? emp.pos : item.pos;
								// if (_status) {
									var dutyType = Number(pos) + 1;
									if (rowdata["emp" + dutyType] == emp.id && rowdata["emp" + dutyType + "RotateId"] == item.rotateId) {
										$li.addClass('active');
										if (rowdata["isSpecified" + dutyType] == 1) {
											$li.find(".appoint").addClass('yes').find('p').html('指定');
										}else {
											$li.find(".appoint").removeClass('yes').find('p').html('非指定');
										}
										if(dutyType==this.paras.rowdata.shampooworkbay){
											$li.find(".wash").addClass('washing');
										}
										// if (rowdata["unTail" + dutyType] == 1) {
										// 	$li.find(".overcard").addClass('yes');
										// }
										self.server[pos] = {
											$: $li,
											data: item
										};
									}
								// }

							}


							if (_status) {
								$li.addClass('status' + item.status)
								$li.find('.status').html(statusName[item.status]);
								$li.find('.time').html(item.statusTime);
							} else {
								$li.find('.time').hide();
							}

							$li.data('data', item);
							$wrapper.find('ul').append($li)
						}
					}
					this.$list.append($wrapper);
					this.startInterval($wrapper, i)
				}
			}
			this.listScroll.refresh();
			this.listScroll.scrollTo('top');

			// this.disabledCard();

			if (!this.$list.find('li').length) {
				am.msg('轮牌未设置');
			}
		},
		startInterval: function (obj, index) {
			var self = this;
			var $pageMainList = obj.find('ul');
			//定时倒计时
			var once = function () {
				$pageMainList.children(":not(.add)").each(function (i, item) {
					var $this = $(item);
					var data = $this.data("data");
					var now = new Date().getTime();
					if (data.status == 4) {
						var dt = Math.floor((data.restTime - now - data.diff) / 1000);
						if (dt < 0) {
							$this.remove();
							self.listScroll.refresh();
						} else {
							$this.find(".time").html(self.formatTime(dt));
						}
					} else {
						var statusTime = data.statusTime || 1440522000000;
						var dt = Math.floor((now - statusTime + data.diff) / 1000);
						$this.find(".time").html(self.formatTime(dt));
					}
				});
			};

			this.stopInterval(index);

			this['timer' + index] = setInterval(once, 1000);
			
			once();
		},
		stopInterval: function (index) {
			if (this['timer' + index]) {
				clearInterval(this['timer' + index]);
				delete this['timer' + index];
			}
		},
		formatTime: function (second) {
			// 计算
			var h = 0,
				i = 0,
				s = parseInt(second);
			if (isNaN(s)) {
				return second;
			}
			if (s >= 60) {
				i = parseInt(s / 60);
				s = parseInt(s % 60);
				if (i >= 60) {
					h = parseInt(i / 60);
					i = parseInt(i % 60);
				}
			}
			// 补零
			var zero = function (v) {
				return (v >> 0) < 10 ? "0" + v : v;
			};
			return [zero(h), zero(i), zero(s)].join(":");
		},
		renderPos: function () {
			this.$list.empty();
			if(am.auth.$){
				am.auth.hide();
			}
			var emp = am.metadata.employeeList;
			for (var i = 0; i < posName.length; i++) {
				var $wrapper = this.$wrapper.clone();
				$wrapper.find('.type').html(posName[i]);
				if (emp.length) {
					//todo 工号排序
					emp.sort(function(a,b){
						return a.no -b.no;
					});
					var setting_washTime = am.page.service.billMain.getSetting().setting_washTime;
					var washTimeFlag = setting_washTime && setting_washTime == 1 && am.metadata.configs.rcordRinseTime && am.metadata.configs.rcordRinseTime == 'false';
					for (var j = 0; j < emp.length; j++) {
						if (emp[j].pos == i) {
							emp[j].empId = emp[j].id;
							var $li = this.$li.clone();
							if(washTimeFlag){
								$li.removeClass('notWash');
							}else {
								$li.addClass('notWash');
							}
							$li.find('.no').html(emp[j].no);
							$li.find('.name').html(emp[j].name);
							$li.find('.role').html('已选择第'+(i+1)+'工位');
							$li.find('.header').html(am.photoManager.createImage('artisan', {
								parentShopId: am.metadata.userInfo.parentShopId,
							}, emp[j].id + '.jpg', 's'));
							$li.find('.time,.overcard').remove();
							$li.find('.status').html(statusName[1]);

							var emps = am.metadata.empMap[emp[j].id];

							if (this.paras.rowdata) {
								var rowdata = this.paras.rowdata;
								var pos = emp[j].empId ? emps.pos : emp[j].pos;
								var dutyType = Number(pos) + 1;
								if (rowdata["emp" + dutyType] == emps.id) {
									$li.addClass('active');
									if (rowdata["isSpecified" + dutyType] == 1) {
										$li.find(".appoint").addClass('yes').find('p').html('指定');
									}else {
										$li.find(".appoint").removeClass('yes').find('p').html('非指定');
									}
									if(dutyType==this.paras.rowdata.shampooworkbay){
										$li.find(".wash").addClass('washing');
									}
									self.server[pos] = {
										$: $li,
										data: emp[j]
									};
								}
							}
							$li.data('data', emp[j]);
							$wrapper.find('ul').append($li);
						}
					}
				}
				this.$list.append($wrapper);
				this.getInstoreBill();
			}
			this.listScroll.refresh();
			this.listScroll.scrollTo('top');

			// this.disabledCard();
		},
		getInstoreBill:function(){
			var user = am.metadata.userInfo;
			am.api.hangupList.exec({
				"shopId": user.shopId,
				"pageSize": 99999, //可选，如果有则分页，否则不分页
				"channel": 1
			}, function (ret) {
				if(ret && ret.code==0){
					self.changePosStatus(ret.content);
				}
			});
		},
		changePosStatus:function(data){
			data.sort(function(a,b){
				return a.createDateTime - b.createDateTime;
			});

			if(data.length){
				var obj = {};
				for(var i = 0; i < data.length; i++) {
					for(var j=1;j<=3;j++){
						if(data[i]['emp'+j] != -1){
							if(!obj[data[i]['emp'+j]]){
								obj[data[i]['emp'+j]] = {
									id: data[i]['emp'+j], 
									isSpecified: data[i]['isSpecified'+j]
								}
							}else {
								obj[data[i]['emp'+j]].isSpecified = data[i]['isSpecified'+j];
								// obj[data[i]['emp'+j]].isSpecified += data[i]['isSpecified'+j];
							}
						}
					}
				}
				console.log(obj,"看看数据结构");
				var renderedEmps = this.$list.find("li");
				for(var key in obj) {
					for(var j = 0; j < renderedEmps.length; j++) {
						var empData = $(renderedEmps[j]).data('data');
						if(empData.id == obj[key].id){
							$(renderedEmps[j]).addClass(obj[key].isSpecified?'status3':'status2').find('.status').html(obj[key].isSpecified?statusName[3]:statusName[2]);
						}
					}
				}
			}
		},
		disabledCard:function(){
			var lis = this.$list.find('li');
			if(this.paras && this.paras.rowdata && this.paras.rowdata.id){
				var selectArr = [];
				for(var i=0;i<lis.length;i++){
					var data = $(lis[i]).data('data'),
						pos = data.empId ? am.metadata.empMap[data.empId].pos : data.pos;
					if($(lis[i]).hasClass('active')){
						selectArr.push(pos);
					}
				}
				if(selectArr.length){
					this.selectArr = selectArr;
					for(var i=0;i<selectArr.length;i++){
						for(var j=0;j<lis.length;j++){
							var data = $(lis[j]).data('data'),
								pos = data.empId ? am.metadata.empMap[data.empId].pos : data.pos;
							if(!$(lis[j]).hasClass('active') && pos==selectArr[i]){
								$(lis[j]).addClass('disabled');
							}
						}
					}
				}
			}
		},
		onsocket:function(){
			if(am.metadata.userInfo.mgjVersion != 3 || am.metadata.configs.orderConnectWithRotate == 'false'){
				return;
			}
			atMobile.nativeUIWidget.confirm({
                caption: '轮牌已更新',
                description: '是否更新轮牌',
                okCaption: '确定',
                cancelCaption: '取消'
            }, function(){
                self.getQueueList(true);
            }, function(){

            });
		},
		onPosStatusChange:function(){
			if (am.metadata.userInfo.mgjVersion == 3 && am.metadata.configs.orderConnectWithRotate == 'true'){
				return;
			}
			atMobile.nativeUIWidget.confirm({
                caption: '员工状态已更新',
                description: '是否更新员工状态',
                okCaption: '确定',
                cancelCaption: '取消'
            }, function(){
                self.renderPos();
            }, function(){

            });
		}
	});
})();
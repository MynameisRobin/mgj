(function () {
	var self = (am.page.service = new $.am.Page({
		id: "page_service",
		backButtonOnclick: function () {
			if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
				$.am.changePage(am.page.hangup, "", {
					openbill: 1
				});
			} else {
				$.am.page.back();
			}
		},
		init: function () {
			this.billItemSelector = new cashierTools.BillItemSelector({
				$: this.$,
				tab: true,
				filter: true,
				timer: null,
				page: "service",
				clicked: 1,
				itemWidth: 132,
				groupKey: 'SERVICE_ITEM_GROUP',
				onSelect: function (data, cb) {
					var add = function () {
						data = am.clone(data);
						if (cb) {
							self.changeProjectPrice(data, function (ret) {
								data = ret.data;
								if (ret.code == 1) {
									var p = data.mgjAdjustPrice;
									am.selectItem.show(ret.data, p.itemList, function (items) {
										if (items) {
											data.mgjAdjust = items;
										} else {
											data.mgjAdjust = null;
										}
										cb(self.billMain.addItem(data));
									});
								} else {
									cb(self.billMain.addItem(data));
								}
							});
						} else {
							return self.billMain.addItem(data);
						}
					}
					// 判断当前是体验项目，则进行校验
					if (data.experienceService == 1) {
						// 如果不是会员则弹出msg，并终止操作
						if (!self.member) {
							am.msg('体验项目散客不能消费!');
							return;
						};
						self.getExperienceItemUserConsumeCount({
							itemData: data,
							memId: self.member.id
						}, function (consumeCount) {
							var currentItemSelectNumber = 0;
							var selectItemList = self.billMain.$list.children();
							$.each(selectItemList, (function (index, item) {
								var itemData = $(item).data('data');
								if (itemData.itemid == data.itemid) {
									currentItemSelectNumber++;
								}
							}))
							var total = data.experienceNumber,
								surplusTotal = total - consumeCount;
							// 判断项目体验次数是否已用完
							if (consumeCount <= total && surplusTotal > currentItemSelectNumber) {
								add();
							} else {
								am.msg('体验次数已用完!');
							}
						});
					} else {
						add();
					}

				},
				/*checkPromise:function(){
				    if(amGloble.metadata.userInfo.operatestr.indexOf('a32,') != -1  && amGloble.metadata.shopPropertyField.mgjBillingType==1){
				        am.msg("您没有权限修改单据！");
				        return true;
				    }
				    return false;
				},*/
				onTouch: function (isVclick, dom) {
					self.billMain.hideMemberInfo(1);
					//如果底下两个模块升起来了，要降下来~~
					if (isVclick) {
						self.billMain.rise(1);
						self.billServerSelector.rise(1);
					}
				},
				onTouchHold: function (data, $this) {
					var operatestr = am.metadata.userInfo.operatestr;
					var setItemImgFn = function () {
						am.setItemImg.show(data, function (filename) {
								var $img = am.photoManager.createImage(
									"serviceUcloud", {
									},
									filename
								);
								$this.find(".img").html($img);
							});
							// am.setItemImg.show(data, function (url) {
							// 	var $img = am.photoManager.createImage(
							// 		"service", {
							// 			parentShopId: am.metadata.userInfo.parentShopId
							// 		},
							// 		url + ".jpg",
							// 		"s"
							// 	);
							// 	$this.find(".img").html($img);
							// });

						},
						itemsGroupingFn = function () {
							self.billItemSelector.startGrouping();
						};

					//项目分组的权限
					var itemsGroupingAuthority = true,
						setItemImgAuthority = operatestr.indexOf("a36") != -1;
					if ($this.hasClass('group')) {
						setItemImgAuthority = false;
					}
					if (setItemImgAuthority && itemsGroupingAuthority) {
						am.popupMenu('请选择你要进行的操作', [{
							name: '设置图片'
						}, {
							name: '设置分组'
						}], function (ret) {
							if (ret && ret.name == '设置分组') {
								itemsGroupingFn();
							} else if (ret && ret.name == '设置图片') {
								setItemImgFn();
							}
						});
					} else if (setItemImgAuthority) {
						setItemImgFn();
					} else if (itemsGroupingAuthority) {
						itemsGroupingFn();
					} else {
						am.msg("您没有权限进行此操作");
					}
				},
				onSize: function () {
					self.billMain.dispatchSettingSelf();
				}
			});

			this.billMain = new cashierTools.BillMain({
				$: this.$,
				th: [{
						name: "项目"
					},
					{
						name: "价格",
						width: "80px",
						className: "center"
					},
					{
						name: "第一工位",
						width: "100px",
						className: "pos0"
					},
					{
						name: "第二工位",
						width: "100px",
						className: "pos1"
					},
					{
						name: "第三工位",
						width: "100px",
						className: "pos2"
					}
				],
				checkSpecified: 1,
				outerHeight: 43,
				onSelect: function ($item, t, keepList) {
					self.billServerSelector.reset($item, t, keepList);
				},
				checkPromise: function (tags) {
					if (amGloble.metadata.userInfo.operatestr.indexOf(tags) != -1 && amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
						if (tags == "a34,") {
							am.msg("您没有权限修改价格！");
							return true;
						}
						if (tags == "a33,") {
							am.msg("您没有权限删除！");
							return true;
						}
					}
					return false;
				},
				onAddItem: function (data, $container, isAutoFill, comboItem) {
					var $tr = self.getNewItemTr();
					self.renderItemTr($tr, data, 0, comboItem);
					$container.append($tr);
					var $prev = $tr.prev();
					if (!isAutoFill && $prev.length && this.setting && this.setting.setting_1stServer_autoChecked) {
						var $pos0 = $prev.find(".pos0");
						if ($pos0.length) {
							var server = $pos0.find(".server").data("data");
							console.log(server);
							if (server) {
								self.billMain.addServer(server, $tr, $pos0.find(".server").hasClass("checked"));
							}
						}
					}

					var _server = [];

					if (data.autoStation) {
						//先看有没有自动工位的
						var autoStation = data.autoStation.split(",");
						for (var n = 1; n < 4; n++) {
							var bill = am.cashierTab.getFirstEmp(n - 1);
							if (bill) {
								if (autoStation.indexOf(n.toString()) != -1 && bill.no != -1) {
									_server.push({
										id: bill.no,
										name: bill.empName,
										per: 100,
										perf: 0,
										gain: 0,
										specified: bill.isSpecified
									});
								}
							}
						}
					}
					if (_server && _server.length) {
						var servers = [];
						for (var j = 0; j < _server.length; j++) {
							if (!_server[j]) {
								continue;
							}
							var server = am.metadata.empMap[_server[j].id];
							if (server) {
								//this.billMain.addServer(server,$tr,items[i].servers[j].specified==1);
								servers.push({
									dutyid: server.dutyid,
									dutytypecode: server.dutyType,
									empId: server.id,
									empName: server.name,
									empNo: server.no,
									per: _server[j].per,
									perf: _server[j].perf,
									gain: _server[j].gain,
									pointFlag: _server[j].specified,
									station: server.pos
								});
							}
						}
						self.billMain.setEmps(servers, $tr);
					}

					return $tr;
				},
				onPriceChange: function ($tr, action) {
					var totalPrice = 0;
					var $trs = this.$list.find("tr");

					$trs.each(function () {
						totalPrice +=
							$(this)
							.find(".price")
							.text()
							.replace("￥", "") * 1 || 0;
					});
					this.$totalPrice.text("￥" + toFloat(Math.round(totalPrice*100)/100));

					if ($tr && action == "delete") {
						var comboitem = $tr.data("comboitem");
						if (comboitem) {
							comboitem.leavetimes != -99 && comboitem.leavetimes++;
						}
					}

					am.cashierTab.setPrice({
						totalPrice: totalPrice,
						num: $trs.length,
						type: 0
					});
				},
				onServerClick: function (data) {
					console.log("onServerClick", data);
					if (data[0]) {
						self.billServerSelector.$body.find("li[serverid=" + data[0].empId + "]").trigger("vclick");
					}
				},
				settingKey: "setting_cashierService",
				defaultSetting: [{
						name: "显示男女客",
						key: "setting_genderSelector",
						flag: 1
					},
					// {
					//     name: "显示单号输入框",
					//     key: "setting_billNoInput",
					//     flag: 0
					// },
					{
						name: "显示第一工位",
						key: "setting_server1",
						flag: 1
					},
					{
						name: "显示第二工位",
						key: "setting_server2",
						flag: 1
					},
					{
						name: "显示第三工位",
						key: "setting_server3",
						flag: 1
					},
					{
						"name": "显示洗发操作",
						"key": "setting_washTime",
						"flag": 1
					},
					{
						"name": "显示卡金赠送金总额",
						"key": "setting_total",
						"flag": 0
					},
					/*{
                    "name": "自动选择第一工位",
                    "key": "setting_1stServer_autoChecked",
                    "flag": 1
                },*/
					// {
					//     "name": "显示洗发时间",
					//     "key": "setting_washTime",
					//     "flag": 0
					// }
				],
				dispatchSetting: function (settings) {
					if (!settings.setting_genderSelector) {
						self.$gender.hide();
					} else {
						self.$gender.show();
					}
					if (!settings.setting_billNoInput) {
						self.$billNo.parent().hide();
					} else {
						self.$billNo.parent().show();
					}

					self.billServerSelector.dispatchSetting(settings, 1);
					am.cashierTab.operatehair();
				},
				onSubmit: function () {
					self.submit();
				}
			});
			localStorage.removeItem("setting_1stServer_autoChecked");
			localStorage.removeItem("setting_washTime");

			this.$gender = am.cashierTab.$t.find(".genderRadio").vclick(function () {
				$(this).toggleClass("male");
			});
			/*this.$gender = this.billMain.$.find(".genderRadio").vclick(function() {
			    $(this).toggleClass("male");
			});*/
			this.billMain.$.find(".memberInfoBtn").vclick(function () {
				$.am.changePage(am.page.memberDetails, "slideup", {
					customerId: self.member.id,
					cardId: self.member.cid,
					shopId: self.member.shopId,
					tabId: 1
				});
			});
			this.$member = this.billMain.$.find(".member").vclick(function () {
				if (self.member) {
					self.billMain.showMemberInfo(self.member);
				} else {
					$.am.changePage(am.page.searchMember, "slideup", {
						onSelect: function (item) {
							$.am.changePage(self, "slidedown", {
								member: item
							});
						}
					});
				}
			});

			this.billMain.$.find(".selectMember").vclick(function () {
				$.am.changePage(am.page.searchMember, "slideup", {
					onSelect: function (item) {
						$.am.changePage(self, "slidedown", {
							member: item
						});
					}
				});
			});
			this.billMain.$list.on("vclick", ".serviceItemName", function () {
				/*                if(amGloble.metadata.userInfo.operatestr.indexOf('a32,') != -1  && amGloble.metadata.shopPropertyField.mgjBillingType==1){
				    am.msg("您没有权限修改！");
				    return false;
				}*/
				var $tr = $(this).parents("tr");
				var item = $tr.data("data");
				var comboitem = $tr.data("comboitem");
				if (comboitem) {
					var cItems = self.getComboItemById(item);
					self.selectComboItem(cItems, comboitem, function (reSelect) {
						if (reSelect == comboitem) {} else {
							if (reSelect) {
								// reSelect.leavetimes != -99 && reSelect.leavetimes--;
								comboitem.leavetimes != -99 && comboitem.leavetimes++;
								$tr
									.data("comboitem", reSelect)
									.find(".price")
									.text(reSelect.oncemoney);
								self.renderItemTr($tr, item, 0, reSelect);
							} else {
								comboitem.leavetimes != -99 && comboitem.leavetimes++;
								item = am.clone(item);
								item.noTreat = 1;
								self.changeProjectPrice(item, function (ret) {
									var data = ret.data;
									if (ret.code == 1) {
										var p = JSON.parse(data.mgjAdjustPrice);
										am.selectItem.show(data, p.itemList, function (items) {
											if (items) {
												data.mgjAdjust = items;
											}
											self.renderItemTr($tr, data, 1);
											self.billMain.onPriceChange();
										});
									} else {
										self.renderItemTr($tr, data, 1);
									}
								});
								//self.renderItemTr($tr,item,1);
							}
							self.billMain.onPriceChange();
						}
					},item);
				}
			});

			this.$billNo = am.cashierTab.$t
				.find("input[name=billNo]")
				.attr("readonly", true)
				.vclick(function () {
					//this.$billNo = this.$.find("input[name=billNo]").attr('readonly',true).vclick(function() {
					if (amGloble.metadata.shopPropertyField.mgjBillingType != 1) {
						var $this = $(this).removeClass("error");
						am.keyboard.show({
							title: "流水单号",
							submit: function (value) {
								$this.val(value);
							}
						});
					} else {
						am.msg("开单模式下单号自动生成！");
					}
				});

			this.billServerSelector = new cashierTools.BillServerSelector({
				$: this.$,
				checkSpecified: 1,
				muti: true,
				checkManual: true,
				getTotalPerf: function () {
					return -1;
				},
				/*checkPromise:function(){
				    if(amGloble.metadata.userInfo.operatestr.indexOf('a32,') != -1  && amGloble.metadata.shopPropertyField.mgjBillingType==1){
				        am.msg("您没有权限修改！");
				        return true;
				    }
				    return false;
				},*/
				/*onSelect: function(data,specified) {
				    var res = self.billMain.addServer(data,null,specified);
				    am.tips.specified(self.billServerSelector.$.find('li[serverid='+data.id+']'),data.pos);
				    return res;
				},
				onRemove: function(data,specified){
				    var res = self.billMain.removeServer(data,null,specified);
				    return res;
				}*/
				onSetEmpPer: function (emp, per, perf, gain) {
					var $server = self.billMain.$list.find("tr.selected .server").eq(emp.pos);
					var $service = self.billMain.$list.find("tr.selected");
					var data = $server.data("data");
					var serviceData = $service.data('data');
					if (serviceData) {
						serviceData.manual = 1;
					}
					if (data) {
						setTimeout(function () {
							for (var i = 0; i < data.length; i++) {
								if (data[i] && data[i].empId === emp.id) {
									data[i].per = per;
									data[i].perf = perf;
									data[i].gain = gain;
									break;
								}
							}
						}, 51);
					}
				},
				onSelect: function (data, specified) {
					var _this = this;
					setTimeout(function () {
						var emps = _this.getEmps();
						self.billMain.setEmps(emps);
					}, 50);
					return false;
				},
				onRemove: function (data, specified) {
					var _this = this;
					setTimeout(function () {
						var emps = _this.getEmps();
						self.billMain.setEmps(emps);
					}, 50);
					return false;
				}
			});
			this.$comboItemSelect = $("#cashierComboItemSelect");
			this.$comboItemSelect.find(".close").vclick(function () {
				self.$comboItemSelect.hide();
			});
			this.$comboItemSelect.find(".button").vclick(function () {
				var data = self.$comboItemSelect.find(".settings li.selected").data("data");
				self.selectComboItemCallback(data);
				self.$comboItemSelect.hide();
			});
			this.$comboItemSelect.find(".settings").on("vclick", "li", function () {
				$(this)
					.addClass("selected")
					.siblings()
					.removeClass("selected");
			});

			this.$displayId = this.$.find(".displayId");


			//回车键1秒内连敲3次结算
			this.submitArr = [];
			this.compareTime = function (time1, time2) {
				return time2 / 1000 - time1 / 1000;
			};

			$('#keypadInputDiv').on('vclick', function (event) {
				var obj = {
					type: '2'
				};
				$('#page_service .cashierItemScroll').removeClass('searching');
				$('#page_service .cashierItems ul li.searchingId').removeClass('searchingId');
				$('#page_service .cashierItems ul li.searchingPrice').removeClass('searchingPrice');
				self.keypadInputDivClickFun(obj);
			})
			$('#keypadInputDiv .inputDiv').on('vclick', function (event) {
				event.stopPropagation();
			})
			$('#keypadInputDiv .inputDiv input').on('keyup', function (event) {
				$('#page_service .cashierItemScroll').removeClass('searching');
				$('#page_service .cashierItems ul li.searchingId').removeClass('searchingId');
				$('#page_service .cashierItems ul li.searchingPrice').removeClass('searchingPrice');
				var keyCode = event.keyCode,
					val = $('#keypadInputDiv .inputDiv input').val(),
					keypadLi = $('.keypadLi');

				var c = $(this);
				if (/[^\d]/.test(c.val())) { //替换非数字字符  
					var temp_amount = c.val().replace(/[^\d]/g, '');
					$(this).val(temp_amount);
				} else {}

				if (keyCode >= 37 && keyCode <= 40 || keyCode === 13 || $('#setMutiPerf').is(':visible')) {
					return;
				}

				//新分类的span 展示与隐藏
				if (typeof parseInt(event.key) === 'number') {
					keypadLi.find('span').text(val);
					if (val == '') {
						keypadLi.hide().next('li').trigger('vclick');
					} else {
						// keypadLi.addClass('selected').show().siblings().removeClass('selected'); 
						if (!keypadLi.hasClass('selected')) {
							keypadLi.show().trigger('vclick');
						} else {}
					}

					//输入延时500ms
					clearTimeout(self.searchTimer);
					self.searchTimer = null;
					if (!self.searchTimer) {
						self.searchTimer = setTimeout(function () {
							self.keypadSearch(event.target.value);
						}, 500);
					}
				}
			})
			$.am.on('instoreServiceHasBeenChanged',function(data){
				if($.am.getActivePage() == self){
					self.onBillStatusChange(data);
				}
			});
		},
		changeProjectPrice: function (data, callback) {
			if (data.mgjAdjustPrice) {
				//项目变价存在
				var p = data.mgjAdjustPrice;
				var firstemp = am.cashierTab.getFirstEmp();
				if (p.isEnable == 1 && p.itemList && p.itemList.length) {
					callback({
						code: 1,
						data: data
					});
				} else if (p.isEnable == 1 && p.dutyList && p.dutyList.length) {
					if (firstemp && firstemp.no != -1) {
						for (var j = 0; j < p.dutyList.length; j++) {
							var itemj = p.dutyList[j],
								empdata = amGloble.metadata.empMap[firstemp.no];
							if (empdata && empdata.dutyid == itemj.dutyid) {
								data.mgjAdjust = {
									name: data.name,
									price: itemj.price
								};
							}
						}
					}
					callback({
						code: 2,
						data: data
					});
				} else {
					callback({
						code: 3,
						data: data
					});
				}
			} else {
				callback({
					code: 4,
					data: data
				});
			}
		},
		beforeShow: function (paras) {
			var _this = this;
			console.log('beforeShow', paras)
			am.tab.main.show().select(1);
			this.$.removeClass("openBill");
			this.checkIsOpen(paras);
			if(paras && paras.afterRecharge && this.member){
				//充值完成后回来，升级了卡
				var afterRecharge = paras.afterRecharge;
				if(afterRecharge.memId){
					//自动升级
					am.searchMember.getMemberById(afterRecharge.memId,afterRecharge.cid,function(card){
						if(card){
							_this.setMember(card);
						}
					});
				}
				return;
			}
			if (paras == "back" || (paras && paras.opt == "back")) {

			} else if (paras && paras.hasOwnProperty('member')) {
				//搜索客户
                if(paras.member != this.member){
                    var trs = this.billMain.$list.find('tr');
                    if(trs.length){
                        for(var i=0;i<trs.length;i++){
                            if($(trs[i]).data('data') && !$(trs[i]).data('data').modifyed){
                                this.billMain.$list.find('tr').eq(i).find('.price').removeClass('modifyed');
                            }
                        }
                    }
                }
				this.setMember(paras.member, null, paras.notOpenBill);
				this.checkComboMatch(); //切散客刷新
				am.page.product.checkComboMatch();
			} else if (paras && paras.cardData) {
				//客户详情，重新选卡回来，修改顾客
				this.setMember(am.convertMemberDetailToSearch(paras.cardData), paras.cardData.card);
			} else if (paras == "freezing") {
				//项目卖品直接切换，冻住，什么都不做；
			} else if (am.metadata) {
				//由于项目卖品合并买单，卖品/cashierTab重置需要同步；
				$.am.trigger('page.serivce.reseted');
				//初次进入，正常初始化
				this.reset(paras);
				var domLiAll = $('#page_service .cashierTab ul li'),
					domLi = domLiAll.eq(0);
				if (!domLi.hasClass('keypadLi')) {
					domLi.before('<li class="keypadLi"><span></span></li>');
				}
				this.getAutointoorder(paras);
			} else {

			}
		},
		getAutointoorder: function (paras) { //获取自动入单
			if (paras && paras.getBill) {//挂单或者取单
				return;
			}
			if (paras && paras.bill && paras.bill.reservationId > "-1") {
				//预约进来不影响自动入单
			}else{
				if (this.billMain.$list.find('tr').length) {
					return;
				}
			}
			var classes = am.metadata.classes;
			if (am.isNull(classes)) return;
			var $tr = null;
			for (var i = 0; i < classes.length; i++) {
				var sub = classes[i].sub;
				if (!am.isNull(sub)) {
					for (var j = 0; j < sub.length; j++) {
						if (sub[j].autointoorder == "1") {
							var _tr = self.billMain.addItem(sub[j], 1);
							if (!$tr) {
								$tr = _tr;
							}
						}
					}
				}
			}
			if ($tr) {
				$tr.trigger('vclick');
			}
		},
		checkIsOpen: function (paras) {
			if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
				this.$.addClass("openBill");
				if (paras && paras.bill) {
					am.cashierTab.changeOpenBill(1, paras.bill);
				} else {
					am.cashierTab.changeOpenBill(1);
				}
			} else {
				am.cashierTab.changeOpenBill(0);
			}
		},
		getGroupData: function () {
			var data;
			if (am.metadata.configs[this.billItemSelector.groupKey]) {
				try {
					data = this.billItemSelector.unZipGroupData(am.metadata.configs[this.billItemSelector.groupKey]);
				} catch (e) {

				}
			}
			return data;
		},
		reset: function (paras) {
			var employeeList = am.metadata.employeeList || [];
			am.cashierTab.operatehair(null); //重置洗发
			//重置
            if(!this.billItemSelector.data){
			this.billItemSelector.dataBind(am.metadata.classes);
            }
            if(!this.billItemSelector.groupData){
			this.billItemSelector.setGroup(this.getGroupData());
            }
            if(!this.billServerSelector.data){
			this.billServerSelector.dataBind(employeeList, ["第一工位", "第二工位", "第三工位"]); //多个工位;
            }
            if(!computingPerformance.empList){
			var itemList = [].concat(am.metadata.classes,(am.metadata.stopClasses || []));
			computingPerformance.updataConfig({
				empList: am.metadata.employeeList,
				itemList: itemList,
				payConfig: am.metadata.payConfigs
			});
            }
			this.billItemSelector.reset();
			this.billServerSelector.reset();
			this.billMain.reset();
			this.billNoError = 0;
			this.$billNo.val("").removeClass("error");
			if (paras && paras.reset) {
				//带用户信息的重置
				self.setMember(paras.reset);
			} else {
				am.cashierTab.setMember();
				this.member = null;
				this.$member
					.html('<span class="tag">顾客:</span>散客')
					.prev()
					.hide();
				this.$gender.removeClass("male");
			}
			if (paras && paras.reservation) {
				//从预约进入收银
				am.loading.show();
				am.api.queryMemberById.exec({
						memberid: paras.reservation.custId
					},
					function (ret) {
						am.loading.hide();
						if (ret && ret.code == 0 && ret.content && ret.content.length) {
							if (ret.content.length == 1) {
								self.setMember(ret.content[0]);
							} else if (ret.content.length > 1) {
								var pop = [];
								for (var i = 0; i < ret.content.length; i++) {
									var item = ret.content[i];
									pop.push({
										name: item.cardName + " (" + (item.cardtype == 1 ? "余额:￥" + toFloat(item.balance) : "现金消费卡") + ")",
										data: item
									});
								}
								am.popupMenu("请选择卡进行消费", pop, function (sel) {
									self.setMember(sel.data);
								});
							}
							self.feeReservation(paras.reservation);
						} else {
							am.msg("用户信息读取失败！");
						}
					}
				);
			}
			if (paras && paras.bill) {
				//携带单据
				this.billData = paras.bill;
				//this.feedBillData(paras.bill);
				this.feedMain(paras.bill);
				this.$displayId.text(paras.bill.displayId).show();
			} else {
				this.billData = null;
				this.$displayId.hide();
			}
			this.getHangupCount();
		},
		setMember: function (member, card, notOpenBill) {
			// 存在会员时去校验购物车的体验项目
			if (member && member.id) {
				this.refreshBillMainExperienceItem(member.id);
			} else {
				this.removeBillMainExperienceItem();
			}
			am.cashierTab.setMember(member, 0, card, notOpenBill);
		},
		_setMember: function (member, pass, card, notOpenBill) {
			var _this = this;
			// if (!pass && amGloble.metadata.configs.typePasswordtToSelectMember == 'true') {
			// 	am.pw.check(member, function (verifyed) {
			// 		if (verifyed) {
			// 			_this.setMember(member, 1);
			// 		}
			// 	},function(){
			// 		$.am.page.back()
			// 	});
			// 	return;
			// }
			if (!notOpenBill) {
				if (this.billData && this.billData.data) {
					var data = JSON.parse(this.billData.data)
					if (data.memGender) {
						member.sex = data.memGender;
					}
				}
			}
			this.member = member;
			this.checkComboMatch();
			/*if(this.member.timeflag==2){
			    this.getComboItems(this.member.cid,this.member.shopId);
			}*/
			/*var cardName = this.member.cardName;
			var balanceFee = this.member.balance-this.member.treatcardfee;
			if(this.member.cardtype == 1 && this.member.timeflag==0 && balanceFee){
			    cardName+='(￥'+balanceFee.toFixed(0)+')';
			}

			this.$member.html('<div class="img"></div><div class="name">'+this.member.name+'</div><div class="cardname">'+cardName+'</div>').prev().show();
			this.$member.find('.img').html(am.photoManager.createImage("customer", {
			        parentShopId: am.metadata.userInfo.parentShopId,
			        updateTs: member.lastphotoupdatetime || ""
			    }, member.id + ".jpg", "s"));
			 */
			if (
				this.member.sex == "F"
			) {
				this.$gender.removeClass("male");
			} else {
				this.$gender.addClass("male");
			}

			var tip = localStorage.getItem("TP_timeflag_Tip");
			if (tip && new Date().getTime() - tip < 1 * 24 * 3600 * 1000) {
				//如果1天内不再提醒
				tip = false;
			} else {
				tip = true;
			}
			if (this.member.cardtype == 1 && (this.member.timeflag == 1 || this.member.timeflag == 3) && tip) {
				//计次卡
				// atMobile.nativeUIWidget.showMessageBox({
				// 	title : "计次卡/年卡",
				// 	content : '青春版暂不支持【计次卡】与【年卡】消费,你可以选择现金结算'
				// });
				atMobile.nativeUIWidget.confirm({
						caption: "计次卡/年卡",
						description: "小掌柜暂不支持【计次卡】与【年卡】消费,你可以选择现金结算!",
						okCaption: "知道了",
						cancelCaption: "不再提醒"
					},
					function () {},
					function () {
						localStorage.setItem("TP_timeflag_Tip", new Date().getTime());
					}
				);
			}
		},
		afterShow: function (paras) {
			am.cashierTab.show(0); //左二级菜单

			if(paras && paras.afterRecharge && paras.afterRecharge.upgradeCard && amGloble.metadata.shopPropertyField.mgjBillingType == 1){
				am.cashierTab.getOpt(function (opt) {
					if(!opt){
						return am.msg("请设定项目价格");
					}
					am.cashierTab.getDisplayId(opt,function(items){
						am.cashierTab.hangupSave(items,0,0,1);
					});
				});
			}

			var activePage = $.am.getActivePage().id;
			if (activePage === 'page_service') {
				$('#keypadInputDiv').find('.label').text('输入项目编号/价格')
			} else if (activePage === 'page_openbill') {
				$('#keypadInputDiv').find('.label').text('输入员工编号')
			}

			//自动点击结算
			if (amGloble.metadata.shopPropertyField.mgjBillingType == 1 && paras.bill && paras.bill.data) {
				var settlementPayDetail = paras.bill.data.settlementPayDetail;
				if (settlementPayDetail != undefined) {
					
					sessionStorage._autoPay1214 = 'autoPay'; 

					setTimeout(function () {

						if ($('#debtBox').is(':visible')) {
							//关不欠款弹窗
							$('#debtBox .cancel').trigger('vclick')
						} else {}

						//年卡提示
						if ($('.nativeUIWidget-confirm').is(':visible')) {
							$('.nativeUIWidget-confirm').hide();
						} else {}

						am.autoPayCheck.setStep('trigger vclick to page.pay');
						$("#cashierTotalPanel .submit").trigger('vclick');
					}, 3000)
				} else {}
			} else {
				if (amGloble.metadata.shopPropertyField.mgjBillingType == 0) {
					//录单模式
					$('.qrCodeWrap').hide();
				} else {}
			}
			// 调取卖品库存接口 
			// 避免购物车已经存在库存为0的商品直接点击结算 没有获取到库存数据 无法进行结算校验库存不足问题
			am.page.product.getGoodsNum(am.page.product.fillNum());
		},
		beforeHide: function (paras) {
			this.billMain.hideMemberInfo();
			am.cashierTab.hide();
			//am.cashierTab.changeOpenBill(0);
			am.cashierTab.fullTab(0);

			$('#keypadInputDiv').hide();
		},
		getNewItemTr: function () {
			var trLen = $('.cashierMain tbody tr').removeClass('keypad_select');
			var keypad_select = '';
			if (device2.windows() || navigator.platform.indexOf("Mac") == 0) {
				keypad_select = 'keypad_select'
			} else {};

			var $tr = $('<tr class="am-clickable show ' + keypad_select + '"></tr>');
			$tr.append('<td><div class="am-clickable delete"></div></td>');
			$tr.append('<td><span class="serviceItemName"></span><span class="serviceItemChangeName"></span></td>'); // am-disabled
			$tr.append('<td class="center"><span class="price servicePrice am-clickable"></span></td>');
			for (var i = 0; i < 3; i++) {
				var $td = $('<td class="pos' + i + '"><div class="server am-clickable"></div></td>');
				if (this.billMain.setting["setting_server" + (i + 1)]) {} else {
					$td.hide();
				}
				$tr.append($td);
			}
			return $tr;
		},
		renderItemTr: function ($tr, data, passCombo, selectComboItem) {
			//data = am.clone(data);
			if (data.mgjAdjustPrice) {
				//项目变价存在
				var p = data.mgjAdjustPrice;
				if (p.isEnable == 1 && p.itemList && p.itemList.length) {
					//手动选的  不做任何修改
				} else if (p.isEnable == 1 && p.dutyList && p.dutyList.length) {
					data.mgjAdjust = null;
					var firstemp = am.cashierTab.getFirstEmp();
					if (firstemp && firstemp.no != -1) {
						for (var j = 0; j < p.dutyList.length; j++) {
							var itemj = p.dutyList[j],
								empdata = amGloble.metadata.empMap[firstemp.no];
							if (empdata && empdata.dutyid == itemj.dutyid) {
								data.mgjAdjust = {
									name: data.name,
									dutyName: itemj.dutyName,
									price: itemj.price,
									minPrice: itemj.minPrice
								};
							}
						}
					}
				}
			} else {
				data.mgjAdjust = null;
			}

			var $price = $tr.find(".price");
			if (am.metadata.userInfo.operatestr && am.metadata.userInfo.operatestr.indexOf("a49") == -1) {
				if((am.metadata.userInfo.operatestr.indexOf("Z3") != -1||am.metadata.userInfo.operatestr.indexOf("a34") != -1)){
					$price.addClass("am-disabled");
				}else{
					$price.removeClass("am-disabled");
				}
			} else {
				$price.removeClass("am-disabled");
			}
			// 判断所要结算的项目是否可以用赠金支付 如果不可用则显示红点
			if(this.member && this.member.cardTypeId && data){
				var checkedItemId=data.itemid;
				var cardInfo=am.metadata.cardTypeMap[this.member.cardTypeId];
				if(cardInfo && cardInfo.restricteditems){
					var restricteditemsStr=cardInfo.restricteditems.split(',');// 指定的项目itemid 字符串
					var restrictedtype=cardInfo.restrictedtype;  // 0 指定不可用  1指定可用 
					// 指定了服务项目
					if((restrictedtype===0 && restricteditemsStr.indexOf(checkedItemId)!==-1)||(restrictedtype===1 && restricteditemsStr.indexOf(checkedItemId)===-1)){
						// 该项目指定不可用
						var redStar='<span class="redStar"> * </span>';
					}
				}
			}
            var price = data.hasOwnProperty('oPrice')?data.oPrice:data.price;
			if (data.mgjAdjust) {
				//存在项目变价
                data.oName = data.name;
				// data.name = data.mgjAdjust.name;
				$tr.find(".serviceItemName").html((redStar||'')+data.oName);
				$tr.find(".serviceItemChangeName").text((data.mgjAdjust.dutyName || data.mgjAdjust.name) + ":" + data.mgjAdjust.price);
				price = data.mgjAdjust.price;
			} else {
				// $tr.find(".serviceItemName").text(data.name); //.addClass("am-disabled");
				$tr.find(".serviceItemName").html((redStar||'')+data.name);
			}

			if ($price.hasClass("modifyed")) {
				//如果手改过价格，不算折扣
			} else {
				//如果没有手改过价格，算折扣
				if (price === null) {
					$price.text("未定价").removeClass("am-disabled");
				} else {
					price = self.timeDiscount(price, self.member, data);
					//自动计算的价格
					$price.text(price).data("autoPrice", price);
				}
			}

			$tr
				.removeData("comboitem")
				.find("td:eq(1)")
				.removeClass("comboitem");
			if (self.member && !data.noTreat && (data.consumeId || !(this.billData && this.billData.data && this.billData.data.settlementPayDetail) || data.newPackage)) {
				//self.member.timeflag==2 && && !passCombo
				var comboitem = self.getComboItemById(data, selectComboItem);
				if (comboitem.length) {
					var relatedComboitem = null;
					for(var i=0;i<comboitem.length;i++){
						if(comboitem[i].id==data.consumeId){
							relatedComboitem = comboitem[i];
							break;
						}
					}
					if(relatedComboitem){
						comboitem = relatedComboitem;
					}else {
						comboitem = comboitem[0];
					}
					if (comboitem.leavetimes === -99) {
						price = 0;
					} else {
						comboitem.leavetimes--;
						price = Math.round(comboitem.oncemoney*100)/100 || 0;
					}
					//自动计算的价格
					$price
						.text(price)
						.addClass("am-disabled")
						.data("autoPrice", price);
					$tr.find("td:eq(1)").addClass("comboitem");
					$tr.data("comboitem", comboitem);
					$tr.find(".serviceItemName").removeClass("am-disabled").addClass("am-clickable");
				}else{
					$tr.find(".serviceItemName").removeClass("am-clickable");
				}
			}
			
			return $tr.data("data", data);
		},
		/**
		 * 
		 * @param {*} price 原价
		 * @param {*} member 会员信息
		 * @param {*} data 选择的项目信息
		 */
		timeDiscount: function(price, member, data){
			if (member) {
				// 如果没有高级折扣就显示老折扣,高级折扣未配置也走之前的
				var timeDiscount = am.timeDiscount.discountPrice(price, member, data, 'service');
				if(timeDiscount && timeDiscount.discountFlag){
					return toFloat(timeDiscount.price);
				}
				var discount = am.discountMap[member.cardTypeId + "_" + data.itemid];
				if (discount) {
					if (discount.dicmode == "1") {
						price = discount.discount;
					} else {
						price = price * (discount.discount == "0" ? 10 : discount.discount) * 0.1;
					}
					data.cardDiscount = 1;
				} else if (member.discount) {
					price = price * (member.discount == "0" ? 10 : member.discount) * 0.1;
				}
			}
			return toFloat(price);
		},
		getComboItems: function (id, shopId) {
			var user = am.metadata.userInfo;
			am.api.itemOfCard.exec({
					//"cardId":id,
					memberid: id,
					shopId: shopId,
					parentShopId: user.parentShopId
				},
				function (ret) {
					if (ret && ret.code == 0) {
						if (ret.content && ret.content.length) {
							for (var i = 0; i < ret.content.length; i++) {
								ret.content[i].tleavetimes = ret.content[i].leavetimes;
							}
							self.member.comboitems = ret.content;
							self.checkComboMatch();
							am.cashierTab.$card.trigger("vclick");
						}
					} else if (ret.code == -1) {
						atMobile.nativeUIWidget.confirm({
								caption: "网络错误",
								description: "由于发生网络错误 ，用户套餐项目数据读取失败，无法使用套餐项目，是否重试？",
								okCaption: "重试",
								cancelCaption: "返回"
							},
							function () {
								self.getComboItems(id, shopId);
							},
							function () {
								//amGloble.msg("初始化错误,请退出检查网络环境后重试!");
							}
						);
					}
				}
			);
		},
		checkComboMatch: function () {
			this.billMain.$list.find("tr").each(function () {
				self.renderItemTr($(this), $(this).data("data"));
			});
			this.billMain.onPriceChange();
		},
		getComboItemById: function (originItem, selectComboItem) {
			// 修改第一个参数类型 做兼容判断
			var id;
			if(typeof(originItem)==='string'){
				// 原参数数据
				id = originItem;
			}else{
				// 新参数数据 原项目data
				id = originItem.itemid;
			}
			var items = this.member.comboitems;
			var ret = [];
			if (items) {
				for (var i = 0; i < items.length; i++) {
					var nos = items[i].timesItemNOs ? items[i].timesItemNOs.split(",") : [];
					var cashierExchange = (items[i].itemid==-1 && !items[i].timesItemNOs);
					if (
						(!selectComboItem && (items[i].itemid == id || nos.indexOf(id) != -1 || cashierExchange) && items[i].leavetimes) ||
						(selectComboItem && selectComboItem.id === items[i].id && items[i].leavetimes)
					) {
						var ts = am.now();
						ts.setHours(0);
						ts.setMinutes(0);
						ts.setSeconds(0);
						ts.setMilliseconds(0);
						// 不限期 或者过期时间大于当前时间 或者am.operateArr.indexOf("a47") > -1; //允许消耗过期套餐项目 或者挂单的过期套餐项目
						if (!items[i].validdate || 
							items[i].validdate >= ts.getTime() || 
							(am.operateArr.indexOf("a47") > -1) || 
							(typeof(originItem)==="object" && originItem.consumeId>0 && originItem.consumeType != 0 && ret.length==0)) {
								// 避免渲染过期套餐项目
							//items[i].leavetimes--;
							//return items[i];
							// if (items[i].cashshopids && items[i].cashshopids.indexOf(am.metadata.userInfo.shopId) == -1) {
							//     am.msg("套餐项目：" + items[i].itemname + " 不允许在本店使用！");
							// } else {
							//     ret.push(items[i]);
							// }
							var ids = items[i].cashshopids;
							if (ids && ids.indexOf('-99') != -1) {
								ids = ',-99,';
							}
							if(!ids){
								// 全部门店可用
								ret.push(items[i]);
							}else{
								var obj={
									shopIdsStr:ids,// ',r,234,43,'
									itemShopId:items[i].shopid,
									targetShopId:am.metadata.userInfo.shopId
								}
								if(am.checkShopAvailable(obj)===0){
									am.msg("套餐项目：" + items[i].itemname + " 不允许在本店使用！");
								}else{
									ret.push(items[i]);
								}
							}
							// if (!ids || ids.indexOf(am.metadata.userInfo.shopId) != -1 || (items[i].shopid == am.metadata.userInfo.shopId &&ids===',-99,' )) {
							// 	// 如果只是shopId匹配 而当前门店不可用 则也不能做为套餐项目
							// 	// if(!ids || ids.indexOf(am.metadata.userInfo.shopId) != -1 ){
							// 	// 	// 当前门店可用 fix bug 0020820
							// 	// 	ret.push(items[i]);
							// 	// }
							// 	ret.push(items[i]);
							// } else {
							// 	am.msg("套餐项目：" + items[i].itemname + " 不允许在本店使用！");
							// }
						} else {
							am.msg("套餐项目：" + items[i].itemname + " 已于" + new Date(items[i].validdate).format("yyyy-mm-dd") + "日过期！");
						}
					}
				}
			}
			return ret;
		},
		selectComboItem: function (items, using, cb,checkedItem) {
			var $titleLi='<li class="am-clickable">不使用套餐项目</li>';
			if(items && items.length && items[0].itemid && ((items[0].itemid!=-1 && am.metadata.stopServiceCodeMap[items[0].itemid])||(items[0].itemid==-1 && checkedItem && am.metadata.stopServiceCodeMap[checkedItem.itemid]))){
				// 停用的项目不能切换为不使用套餐项目
				$titleLi='';
			}
			var $setting = this.$comboItemSelect.find(".settings").html($titleLi);
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var $li = $("<li></li>").addClass("am-clickable");
				if (using == item) {
					$li.addClass("selected");
				}
				if (item.sumtimes == -99) {
					$li.append('<div class="times">不限次</div>');
				} else {
					$li.append('<div class="times">余' + item.leavetimes + "次<span>(总" + item.sumtimes + "次)</span></div>");
				}

				$li.append('<div class="itemName">' + item.itemname + "</div>");
				var $date = $('<div class="invalidDate"></div>');
				if (item.validdate) {
					var ts = am.now();
					ts.setHours(0);
					ts.setMinutes(0);
					ts.setSeconds(0);
					ts.setMilliseconds(0);
					var x = item.validdate - ts.getTime();
					if (x < 0) {
						 //允许消耗过期套餐项目
						if (am.operateArr.indexOf("a47") == -1) {
							$li.addClass('am-disabled');
						}
						// $li.addClass("am-disabled");
						$date.text("已过期");
					} else if (x < 7 * 24 * 3600 * 1000) {
						$date.addClass("highlight");
						$date.text(new Date(item.validdate).format("yyyy-mm-dd") + "到期 即将到期");
					} else {
						$date.text(new Date(item.validdate).format("yyyy-mm-dd") + "到期");
					}
				} else {
					$date.text("不限期");
				}
				$li.append($date);
				$setting.append($li.data("data", item));
			}
			this.$comboItemSelect.css("display", "-webkit-box");
			this.selectComboItemCallback = cb;
		},
		submit: function (dataOnly) {
			var user = am.metadata.userInfo,
				_this = this;
			var opt = {
				parentShopId: user.realParentShopId,
				shopId: user.shopId,
				//"memId": -1,
				//"cardId": -1,
				//"billNo": "",
				expenseCategory: 0,
				discount: 10,
				gender: "F",
				custSource: 0,
				comment: "",
				clientflag: 1,
				otherFlag: 0,
				jsonstr: "",
				token: user.mgjtouchtoken,
				serviceItems: [],
				billingInfo: {
					total: 0,
					eaFee: 0, //入账金额
					treatfee: 0,
					treatpresentfee: 0,
					//"pointFee":0,
					//"coupon":0,

					cardFee: 0, //卡金
					presentFee: 0, //赠送金
					cashFee: 0, //现金
					unionPay: 0, //银联
					cooperation: 0, //合作券
					mall: 0, //商场卡
					weixin: 0, //微信
					pay: 0, //支付宝
					voucherFee: 0, //代金券
					mdFee: 0, //免单金额
					divideFee: 0, //分期赠送进
					pointFee: 0, //积分
					debtFee: 0, //欠款
					dpFee: 0, //点评
					dpId: null, //点评id
					payId: null, //支付宝id
					weixinId: null, //微信 id
					dpCouponId: null, //微信 id

					luckymoney: 0,
					coupon: 0,
					//"dianpin": 0,
					otherfee1: 0,
					otherfee2: 0,
					otherfee3: 0,
					otherfee4: 0,
					otherfee5: 0,
					otherfee6: 0,
					otherfee7: 0,
					otherfee8: 0,
					otherfee9: 0,
					otherfee10: 0
				}
			};
			if (this.billData) {
				opt.instoreServiceId = this.billData.id;
				if (this.billData.instorecomment) {
					opt.comment = this.billData.instorecomment;
				}
				//洗发时长
				if (this.billData.jsonstr) {
					var jsonstr = JSON.parse(this.billData.jsonstr);
					if(this.billData.shampooworkbay){
						jsonstr.empName = this.billData['emp'+this.billData.shampooworkbay+'Name'];
						jsonstr.empId = this.billData['emp'+this.billData.shampooworkbay];
						var empNo=amGloble.metadata.empMap[this.billData['emp'+this.billData.shampooworkbay]] && amGloble.metadata.empMap[this.billData['emp'+this.billData.shampooworkbay]].no;
						if(empNo){
							jsonstr.empNo =empNo;
						}
					}
					opt.jsonstr = JSON.stringify(jsonstr);
				}

				if(this.billData.displayId){
					opt.displayId = this.billData.displayId;
				}
			}
			/*if (this.$billNo.is(":visible")) {
                opt.billNo = this.$billNo.val();
                if (!opt.billNo && !this.billNoError  && !dataOnly) {
                    atMobile.nativeUIWidget.confirm({
                        caption: "流水单号未输入",
                        description: "不输入流水单号，系统将自动生成流水单号！",
                        okCaption: "自动生成",
                        cancelCaption: "去输入"
                    }, function() {
                        _this.billNoError=1;
                        //_this.submit();
	                    am.cashierTab.submit();
                    }, function() {
                        _this.$billNo.addClass("error");
                    });
                    opt.billNo = null;
                    return;
                }else{
                    this.billNoError=0;
                }
                if(!opt.billNo){
                    opt.billNo = null;
                }
            }*/
			if (this.member) {
				opt.memId = this.member.id;
				opt.cardId = this.member.cid;
				opt.discount = this.member.discount || 10;
			} else {
				opt.memId = 0;
			}
			if (this.$gender.hasClass("male")) {
				opt.gender = "M";
				if (this.member) {
					this.member.sex = 'M';
				}
			} else {
				if (this.member) {
					this.member.sex = 'F';
				}
			}
			var arrComboitems = [];
			var $trs = this.billMain.$list.find("tr");
			for (var i = 0; i < $trs.length; i++) {
				var $tr = $trs.eq(i);
				var data = $tr.data("data");
				var $price = $tr.find(".price");
				var price = $price.text().replace("￥", "") * 1;
				if (!price && price != 0) {
					am.msg("请设定项目价格！");
					$price.addClass("error");
					return;
				}
				var item = {
					id: data.id,
					itemId: data.itemid,
					itemName: data.mgjAdjust ? data.mgjAdjust.name : data.name,
					noTreat: data.noTreat,
					price: data.mgjAdjust?data.mgjAdjust.price:(data.hasOwnProperty('oPrice')?data.oPrice:(data.price || 0)),
                    oPrice: data.mgjAdjust?data.mgjAdjust.price:(data.hasOwnProperty('oPrice')?data.oPrice:(data.price || 0)),
					salePrice: price,
					consumeType: 0, //0普通  1 套餐 2 计次 3 年卡
					//"consumeId":12,//根据consumeType决定ID类型
					depcode: this.getDepCode(data.id),
					servers: [],
					manual: data.manual,
					cardDiscount: data.cardDiscount,
					timeDiscount: data.timeDiscount
				};
				if ($price.hasClass("modifyed")) {
					item.modifyed = 1;
				}
				// if(item.depcode==-1 && am.metadata.deparList.length==1){
				//     //如果只有一个部门
				//     item.depcode = am.metadata.deparList[0].code;
				// }else if(item.depcode==-1 && am.metadata.deparList.length>1) {
				//     //有多个部门
				//     //TODO
				//     //目前先这样写
				//     item.depcode = am.metadata.deparList[0].code;
				// }
				var comboitem = $tr.data("comboitem");
				if (comboitem) {
					item.consumeType = 1;
					item.consumeId = comboitem.id;
					item.totalTimes = comboitem.tleavetimes;

					item.cashFee = comboitem.cashFee;
					item.cardFee = comboitem.cardFee;
					item.otherFee = comboitem.otherFee;

					if (comboitem.sumtimes == -99) {
						//不限次套餐   任务006  业绩修改 item.consumeType = 4（不限次套餐相当于年卡）
						item.perfPrice = comboitem.oncemoney;
						//006
						//item.consumeType = 4;
					}
					
					arrComboitems.push({
						itemname: data.name,
						itemid: data.itemid,
						consumeId: comboitem.id,
						price: price,
						leavetimes: comboitem.leavetimes,
						tleavetimes: comboitem.tleavetimes,
						oncemoney: comboitem.oncemoney,
						sumtimes: comboitem.sumtimes,

						cashFee: comboitem.cashFee,
						cardFee: comboitem.cardFee,
						otherFee: comboitem.otherFee,

						shopid: comboitem.shopid
					});

					if (comboitem.treattype == 1 || comboitem.treattype == 2) {
						item.consumeType = 3;
					}
				}
				opt.billingInfo.total += price;
				var $servers = $tr.find(".server");
				for (var j = 0; j < $servers.length; j++) {
					var server = $servers.eq(j).data("data");
					if (server) {
						item.servers = item.servers.concat(server);
						/*item.servers.push({
						    "empId": server.id,
						    "empNo": server.no,
						    "empName": server.name,
						    "station":server.pos,
						    "pointFlag":$servers.eq(j).hasClass("checked")?1:0,// 是否指定 0非指定 1指定
						    "dutyid": server.dutyid,
						    "dutytypecode":server.dutyType
						});*/
					}
				}
				opt.serviceItems.push(item);
			}
			opt.billingInfo.eaFee = opt.billingInfo.total;
			if (this.billData && this.billData.data && JSON.parse(this.billData.data).sourcedata){
				opt.mgjsourceid = JSON.parse(this.billData.data).sourcedata.mgjsourceid;
				opt.mgjsourcename = JSON.parse(this.billData.data).sourcedata.mgjsourcename;
			}

			var param = {
				comboitem: arrComboitems,
				option: opt,
				member: this.member
			};

			return param;
			/*if(dataOnly){
			    return param;
			}else{
			    $.am.changePage(am.page.pay, "slideup", param);
			}*/
		},
		getDepCode: function (id) {
			var classes = am.metadata.classes;
			for (var i = 0; i < classes.length; i++) {
				for (var j = 0; j < classes[i].sub.length; j++) {
					if (classes[i].sub[j].id == id) {
						return classes[i].depcode || "";
					}
				}
			}
			// 停用项目在停用里面匹配
			var stopclasses = am.metadata.stopClasses;
			for (var i = 0; i < stopclasses.length; i++) {
				for (var j = 0; j < stopclasses[i].sub.length; j++) {
					if (stopclasses[i].sub[j].id == id) {
						return stopclasses[i].depcode || "";
					}
				}
			}
			return "";
		},
		getHangupCount: function () {
			if(amGloble.metadata.shopPropertyField && amGloble.metadata.shopPropertyField.mgjBillingType==1){
				return;
			}
			var self = this;
			var user = am.metadata.userInfo;
			am.api.hangupList.exec({
					shopId: user.shopId,
					pageSize: 99999,
					//"employeeId": 1234, //可选，如果有则按员工查询
					//"key": "", //可选，如果有则按关键字搜索，包括服务号、客户姓名、服务者姓名、备注
					//"displayId": "1234", //可选，如果有则按手牌号查询
					//"period": "2016-01-05_2016-05-05", //可选，如果有则按时间区间查询，否则查询全部
					//"fromHistory": 1, //可选，如果为1，则查询删除表，否则查询进行中的服务的表
					//"status": 2, //可选，如果有，则按status查询，0普通单 1已结算 2已删除
					//"pageSize": 99999 //可选，如果有则分页，否则不分页
					//"pageNumber": 0, //可选，如果有pageSize，此参数才有意义
					//"simpleData":1  //如果为1 则只返回  displayId
					channel: 1
				},
				function (ret) {
					//self.$.find('.cashierHangupBtn > .badge').text(ret.count);
					am.cashierTab.setHangUpNum(ret.count);
				}
			);
		},
		feedBillData: function (bill) {
			if (bill.memId && bill.memId != -1) {
				am.loading.show();
				am.api.queryMemberById.exec({
						memberid: bill.memId
					},
					function (ret) {
						am.loading.hide();
						if (ret && ret.code == 0 && ret.content && ret.content.length) {
							//to do 选择会员卡
							if (ret.content.length == 1) {
								self.setMember(ret.content[0]);
							} else if (ret.content.length > 1) {
								var data;
								try {
									data = JSON.parse(bill.data);
								} catch (e) {
									$.am.debug.log(data);
								}
								if (data && data.cid) {
									for (var i = 0; i < ret.content.length; i++) {
										if (ret.content[i].cid == data.cid) {
											self.setMember(ret.content[i]);
											break;
										}
									}
								} else {
									var arr = [];
									for (var i = 0; i < ret.content.length; i++) {
										var item = ret.content[i];
										var cardName = item.cardName;
										var balanceFee = item.balance;
										if (item.cardtype == 1 && item.timeflag == 0 && balanceFee) {
											cardName += "(余额:￥" + balanceFee.toFixed(0) + ")";
										}
										arr.push({
											name: cardName,
											data: item
										});
									}
									am.popupMenu("请选择会员卡", arr, function (ret) {
										if (ret.data && ret.data.status) {
											am.msg('会员卡退卡中，无法进行此操作');
											return false;
										}
										self.setMember(ret.data);
										self.feedMain(bill);
									});
									return;
								}
							}
						} else {
							am.msg("用户信息读取失败~");
						}
						self.feedMain(bill);
					}
				);
			} else {
				self.feedMain(bill);
			}
		},
		selectChangePrice: function (data, item) {
			var p = data.mgjAdjustPrice,
				res = null;
			if (p) {
				if (p.itemList && p.itemList.length) {
					$.each(p.itemList, function (i, itemj) {
						if (itemj.name == item.name) {
							res = itemj;
						}
					});
				}
			}
			return res;
		},
		feeReservation: function (reservation) {
			var data = reservation;
			try {
				data = JSON.parse(reservation);
			} catch (e) {
				$.am.debug.log(data);
			}
			if (data && data.itemProp && JSON.parse(data.itemProp).items) { //fix bug 0015741
				var items = JSON.parse(data.itemProp).items;
				var packages = JSON.parse(data.itemProp).packages;
				var itemData = null;
				if (!$.isEmptyObject(items)) {
					itemData = items;
				} else {
					if (!$.isEmptyObject(packages)) {
						itemData = packages;
					}
				}
				var $tr;
				if (itemData) {
					for (var key in itemData) {
						var data = am.metadata.serviceItemMap[key];
						if (data) {
							if (am.metadata.configs.mgjReservationItem == "true" && am.metadata.configs.mgjReservationItemAuto == "true") {
								$tr = this.billMain.addItem(data, 1);
							}
							if (data.autoStation) {
								//先看有没有自动工位的
								var autoStation = data.autoStation.split(","),
									autoArr = [];
								for (var n = 1; n < 4; n++) {
									if (autoStation.indexOf(n.toString()) != -1) {
										autoArr.push({
											id: reservation.barberId,
											name: reservation.barberName,
											per: 100,
											specified: 1
										});
									}
								}
								if (autoArr.length) {
									itemData[key].servers = autoArr;
								}
							}
							if (itemData[key].servers) {
								var servers = [];
								for (var j = 0; j < itemData[key].servers.length; j++) {
									if (!itemData[key].servers[j]) {
										continue;
									}
									var server = am.metadata.empMap[itemData[key].servers[j].id];
									if (server) {
										//this.billMain.addServer(server,$tr,items[i].servers[j].specified==1);
										servers.push({
											dutyid: server.dutyid,
											dutytypecode: server.dutyType,
											empId: server.id,
											empName: server.name,
											empNo: server.no,
											per: itemData[key].servers[j].per || 100,
											perf: 0,
											pointFlag: itemData[key].servers[j].specified,
											station: server.pos
										});
									}
								}
								this.billMain.setEmps(servers, $tr);
							}
						}
					}
				}
				if ($tr) {
					$tr.trigger("vclick");
					this.billMain.onPriceChange();
				}
			} else {
				console.info("data:" + data);
			}
		},
		concatEmployee: function (auto, list) {
			var res = [],
				ret = [],
				ren = [],
				rek = [];
			repeat = {}; //重复的map
			obj = {};
			if (list && list.length) {
				for (var j = 0; j < list.length; j++) {
					var itemj = list[j];
					ret.push(itemj);
					if (itemj.id != null) {
						obj[itemj.id] = itemj;
					}
				}
			}
			for (var i = 0; i < auto.length; i++) {
				var item = auto[i];
				item.isAuto = 1;
				res.push(item);
				obj[item.id] = item;
			}
			// ren = [].concat(res,ret);
			for (var key in obj) {
				ren.push(obj[key]);
			}

			for (var l = 0; l < ren.length; l++) {
				var iteml = ren[l];
				if (!repeat[iteml.station]) {
					repeat[iteml.station] = [];
				}
				repeat[iteml.station].push(iteml);
			}
			for (var key in repeat) {
				var itema = repeat[key];
				var ts = [],
					tn = [];
				for (var h = 0; h < itema.length; h++) {
					var itemh = itema[h];
					if (itemh.isAuto == 1) {
						ts.push(itemh);
					} else {
						tn.push(itemh);
					}
				}
				if (ts.length && tn.length) {
					rek = [].concat(rek, tn);
				} else if (ts.length) {
					rek = [].concat(rek, ts);
				} else {
					rek = [].concat(rek, tn);
				}
			}
			return rek;
		},
		feedMain: function (bill) {
			console.log("bill======", bill);
			var data;
			try {
				data = JSON.parse(bill.data);
			} catch (e) {
				$.am.debug.log(data);
			}
			am.cashierTab.operateSeat(bill);
			if (data) {
				//洗发操作
				am.cashierTab.operatehair(bill);
				var items = data.serviceItems;
				if (data.genderGuest) {
					this.$gender.addClass("male");
				} else {
					if (data.memGender == "F") {
						this.$gender.removeClass("male");
					} else {
						this.$gender.addClass("male");
					}
				}
				this.$billNo.val(bill.serviceNO || "");
				var $tr;
				if (items && items.length) {
					for (var i = 0; i < items.length; i++) {
						var data = am.metadata.serviceItemMap[items[i].id];
						if(!data){
							// 停用项目取单
							data = am.metadata.stopServiceItemMap[items[i].id];
							// 去掉普通项目消费
							if(data && items[i].consumeType==0){
								continue;
							}
						}
						if (data) {
							data = am.clone(data);
							data.price = items[i].price;
							data.manual = items[i].manual;
							data.noTreat = items[i].noTreat;
                            data.oPrice = items[i].hasOwnProperty('oPrice')?items[i].oPrice:data.price;
                            data.modifyed = items[i].modifyed;
                            data.cardDiscount = items[i].cardDiscount;
                            data.timeDiscount = items[i].timeDiscount;
                            data.consumeId = items[i].consumeId;
                            data.newPackage = items[i].newPackage;
							data.consumeType = items[i].consumeType;
                            if (items[i].name != data.name) {
								//存在项目变价
								data.mgjAdjust = this.selectChangePrice(data, items[i]);
							}
							if(bill.src == "reservation"){
								if (am.metadata.configs.mgjReservationItem == "true" && am.metadata.configs.mgjReservationItemAuto == "true") {
									//有tr说明是高级预约模式下
									$tr = this.billMain.addItem(data, 1);
								}else{
									//没有tr 就没有自动工位等功能
									return console.log("高级预约模式下预约项目禁止自动入单");
								}
							}else{
								$tr = this.billMain.addItem(data, 1);
							}
                             // if (typeof items[i].oPrice != "undefined" && items[i].price != items[i].oPrice) {
                            if (items[i].modifyed) {
								$tr
									.find(".price")
									.text(items[i].price)
									.addClass("modifyed");
							}
							if (data.autoStation && !data.manual) {
								//先看有没有自动工位的
								var autoStation = data.autoStation.split(","),
									autoArr = [];
								for (var n = 1; n < 4; n++) {
									if (autoStation.indexOf(n.toString()) != -1 && bill["emp" + n] != -1) {
										var s1 = am.metadata.empMap[bill["emp" + n]];
										if (s1) { //fix bug 0015763
											var serverData = {
												id: bill["emp" + n],
												name: bill["emp" + n + "Name"],
												per: 100,
												perf: 0,
												gain: 0,
												specified: bill["isSpecified" + n],
												station: s1.pos || 0
											}
											if (items[i].servers && items[i].servers.length) {
												for (var j = 0; j < items[i].servers.length; j++) {
													if (items[i].servers[j].id == serverData.id) {
														serverData.per = items[i].servers[j].per;
														serverData.perf = items[i].servers[j].perf;
														serverData.gain = items[i].servers[j].gain;
													}
												}
											}
											autoArr.push(serverData);
										}
									}
								}
								if (autoArr.length) {
									if (items[i].notAuto != 0) {
										items[i].servers = this.concatEmployee(autoArr, items[i].servers);
									}
								}
							}
							if (items[i].servers) {
								var servers = [];
								for (var j = 0; j < items[i].servers.length; j++) {
									if (!items[i].servers[j]) {
										continue;
									}
									var server = am.metadata.empMap[items[i].servers[j].id || items[i].servers[j].empId];
									if (server) {
										//this.billMain.addServer(server,$tr,items[i].servers[j].specified==1);
										servers.push({
											dutyid: server.dutyid,
											dutytypecode: server.dutyType,
											empId: server.id,
											empName: server.name,
											empNo: server.no,
											per: !!items[i].servers[j].perf ? 0 : (items[i].servers[j].hasOwnProperty('per') ? items[i].servers[j].per : 100),
											perf: items[i].servers[j].perf || 0,
											gain: items[i].servers[j].gain || 0,
											pointFlag: items[i].servers[j].specified,
											station: server.pos
										});
									}
								}
								this.billMain.setEmps(servers, $tr);
							}
						}
					}
				}else {
					this.billMain.rise(1);
				}

				if ($tr) {
					$tr.trigger("vclick");
					this.billMain.onPriceChange();
				}
			} else {
				am.cashierTab.operatehair(null);
			}
		},
		onBillStatusChange: function (data) {
			if (this.billData && data.instoreServiceId && data.instoreServiceId === this.billData.id) {
				am.billChangeToHangup();
			}
		},
		keypadInputDivClickFun: function (obj) {

			if ($.am.getActivePage().id !== 'page_service') {
				return;
			}

			// type 1.表示是敲击回车键 2.手动清除(鼠标点击蒙层)
			var type = obj.type;

			if (type == '1') {
				if (self.availableTrueDom) {
					self.availableTrueDom.trigger('vclick');
					if (self.availableTrueDom.hasClass('group')) {
						$('.nativeUIWidget-showPopupMenu .inner .list li').eq(0).addClass('keypad_select')
							.siblings().removeClass('keypad_select');
					}
				}
			} else if (type == '2') {

			}

			//没有匹配的项目时 按回车显示全部
			$('#page_service .cashierItems ul li').removeClass('availableTrue').show();
			$('#keypadInputDiv').hide();
			$('.keypadLi').hide().siblings().eq(0).trigger('vclick');
		},
		keypadSearch: function (val) {
			var self = this,
				inputVal = $('#keypadInputDiv input').val();

			self.availableLi = [];
			self.availableTrueDom = null;

			var dom = $('#page_service .cashierItems ul li');

			// $('#page_service .cashierTab ul li').eq(0).text(inputVal).addClass('selected').siblings().removeClass('selected');

			// self.directionKeyObj = {
			// 	maxNum : this.maxNum,
			// 	availableArr : [],
			// };

			// $('ul.wrap').each(function(i, item) {
			// 	var data = [i];
			// 	self.availableLi.push(data);
			// })
			dom.removeClass('availableTrue show');

			if (val === '' || typeof parseInt(val) != 'number' || val == null) {
				if (inputVal == '') {
					dom.show();
				}
				return;
			}
			$('#page_service .cashierItemScroll').addClass('searching');
			dom.each(function (i, item) {
				var thisItem = $(item),
					idSpan = thisItem.find('.idSpan').text(),
					price = thisItem.find('.price').text();

				if (price.indexOf(inputVal) == 0 || idSpan.indexOf(inputVal) == 0) {
					thisItem.addClass('show').show();
					if(idSpan.indexOf(inputVal) == 0){
						thisItem.addClass('searchingId');
					}else{
						thisItem.addClass('searchingPrice');
					}
					// dom.find(':visible').eq(0).addClass('availableTrue');
					// self.availableTrueDom = dom.find(':visible').eq(0);

					//thisItem.addClass('availableTrue').children('.outside').removeClass('am-disabled')

					// var availableALL = $('ul.wrap .available');
					// 	if(!availableALL.eq(0).hasClass('active')) {
					// 		availableALL.eq(0).addClass('availableTrue').children('.outside').trigger('vclick');
					// 	}

					// var arrIndex_X = thisItem.attr('arrIndex_X'),
					// 	arrIndex_Y = thisItem.attr('arrIndex_Y'),
					// 	arrIndexArr = [arrIndex_Y, arrIndex_X];

					// self.directionKeyObj.availableArr.push(arrIndexArr);
					// self.directionKeyObj.activeIndex = self.directionKeyObj.availableArr[0];

				} else {
					thisItem.hide();
					// if(thisItem.hasClass('active')) {
					// 	console.log('outside1')
					// 	thisItem.removeClass('am-disabled').children('.outside').removeClass('am-disabled').trigger('vclick');
					// }
					// thisItem.removeClass('available availableTrue active').addClass('am-disabled').children('.outside').addClass('am-disabled');	
				}

				var showDom = $('#page_service .cashierItems ul li.show');
				if (showDom.length > 0) {
					showDom.eq(0).addClass('availableTrue');
					self.availableTrueDom = showDom.eq(0);
				}
			})


			//项目容器 ul 一行可以放多少的 li
			var domUlWidth = $('#page_service .cashierItems ul'),
				domLiWidth = $('#page_service .cashierItems ul').find('li');
			self.ulContainLiNum = parseInt(domUlWidth.outerWidth(true) / domLiWidth.outerWidth(true));

			//条目过多时断行 目前设置为150
			if (self.ulContainLiNum >= 150) {
				domUlWidth.width(parseInt(domUlWidth.width() / 2));
				self.ulContainLiNum = parseInt(domUlWidth.outerWidth(true) / domLiWidth.outerWidth(true));
			} else {}

			self.ulContainLiLen = $('#page_service .cashierItems ul li').length;

			console.log('项目容器 ul 一行可以放多少的 li', self.ulContainLiNum);
		},


		//选项目聚焦方向选择
		directionKey: function (obj) {
			var self = this,
				keyCode = obj.keyCode,
				availableArr = obj.availableArr,
				maxNum = obj.maxNum,
				activeIndex = obj.activeIndex,
				givenClass = 'availableTrue',
				dom = $('#page_service .cashierItems ul li.show');

			switch (keyCode) {
				case 37:
					dom.each(function (i, item) {
						var thisDom = $(this);
						if (thisDom.hasClass(givenClass) && i != 0) {
							dom.removeClass(givenClass)
							dom.eq(i - 1).addClass(givenClass);
							self.availableTrueDom = dom.eq(i - 1);
							// thisDom.parent('ul').css({
							//     'webkitTransform' : "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)"
							// })
							return false;
						}
					})
					break;
				case 38:
					dom.each(function (i, item) {
						var thisDom = $(this);
						if (thisDom.hasClass(givenClass) && i > (self.ulContainLiNum - 1)) {
							dom.removeClass(givenClass)
							dom.eq(i - self.ulContainLiNum).addClass(givenClass);
							self.availableTrueDom = dom.eq(i - self.ulContainLiNum);
							return false;
						}
					});
					break;

				case 39:
					dom.each(function (i, item) {
						var thisDom = $(this);
						if (thisDom.hasClass(givenClass) && i != dom.length - 1) {
							dom.removeClass(givenClass)
							dom.eq(i + 1).addClass(givenClass);
							self.availableTrueDom = dom.eq(i + 1);
							// thisDom.parent('ul').css({
							//     'webkitTransform' : "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -132, 0, 0, 1)"
							// })
							return false;
						}
					});
					break;
				case 40:
					dom.each(function (i, item) {
						var thisDom = $(this);
						if (thisDom.hasClass(givenClass) && i < (self.ulContainLiNum - 1)) {
							console.log(i);
							dom.removeClass(givenClass)
							if ((self.ulContainLiLen - 1) - (i + self.ulContainLiNum) >= 0) {
								dom.eq(self.ulContainLiNum + i).addClass(givenClass);
								self.availableTrueDom = dom.eq(self.ulContainLiNum + i);
							} else {
								//最后一个li 获得样式
								dom.eq(self.ulContainLiLen - 1).addClass(givenClass);
								self.availableTrueDom = dom.eq(self.ulContainLiLen - 1);
							}

							return false;
						}
					})
					break;
				default:
					break;
			}



		},
		setActiveIndex: function (thisArr) {
			console.log('outside2')
			var self = this;
			var wrapLi = $('ul.wrap li');
			// wrapLi.removeClass('active availableTrue');
			wrapLi.removeClass('availableTrue');

			// $('#page_openbill ul.wrap').eq(thisArr[0]-1).find('li').eq(thisArr[1]-1).addClass('availableTrue').children('.outside').trigger('vclick');
			$('#page_openbill ul.wrap').eq(thisArr[0] - 1).find('li').eq(thisArr[1] - 1).addClass('availableTrue');

			self.directionKeyObj.activeIndex = thisArr;
			console.log('setActiveIndex', self.directionKeyObj.activeIndex);
		},

		directionKeyGroup: function (type, obj) {
			//type 1.待选择的项目 2.已选择的项目 3.组合项目弹窗里面项目 4.变价弹窗里面项目
			var self = this,
				dom = null,
				givenClass = null;

			if (type == '2') {
				dom = $('.cashierMain .body tbody tr.am-clickable');
				//此 keypad_select 处为PC样式
				givenClass = 'keypad_select selected';
			} else if (type == '3') {
				dom = $('.nativeUIWidget-showPopupMenu .inner li');
				givenClass = 'keypad_select';
			} else if (type == '4') {
				dom = $('#itemSelect .inner .content ul li');
				givenClass = 'selected';
			}

			switch (obj.keyCode) {
				case 38: //向上键
					dom.each(function (i, item) {
						var thisDom = $(this);
						console.log(thisDom.attr('class'));
						if (thisDom.attr('class').indexOf(givenClass) > -1 && i != 0) {
							dom.removeClass(givenClass + ' keypad_select')
							dom.eq(i - 1).addClass(givenClass + ' keypad_select');

							if (type == '4') {
								dom.eq(i - 1).trigger('vclick');
							}

							return false;
						}
					})
					break;
				case 40: //向下键
					dom.each(function (i, item) {
						var thisDom = $(this);
						if (thisDom.attr('class').indexOf(givenClass) > -1 && i != dom.length - 1) {
							dom.removeClass(givenClass)
							dom.eq(i + 1).addClass(givenClass);

							if (type == '4') {
								dom.eq(i + 1).trigger('vclick');
							}
							return false;
						}
					})
					break;
				case 13: //回车键
					console.log("回车");
				default:
					break;
			}

		},
		keyboardCtrl: function (keyCode) {
			var ctrl = window.keyboardCtrl,
				keypadInputDiv = $('#keypadInputDiv');
			if ($('#maskBoard').is(':visible') || $('#setMutiPerf').is(':visible') || $('#createService').is(':visible') || $('#addMoreRemark').is(':visible')) {
				return;
			}

			if (keyCode === 192) {
				$('#tab_cash li[data-pow=a21]').trigger('vclick');
			} else if (keyCode === 106 && !keypadInputDiv.is(':visible')) {
				$('.genderRadio').trigger('vclick');
			} else if (keyCode == 13) {

				if ($('#keypadInputDiv').is(':visible') || $('#maskBoard').is(':visible')) {
					var obj = {
						type: '1'
					};
					self.keypadInputDivClickFun(obj);
					return;
				} else if ($('.nativeUIWidget-showPopupMenu').is(':visible')) {
					$('.nativeUIWidget-showPopupMenu .inner li.keypad_select').trigger('vclick');
					return;
				} else if ($('#itemSelect').is(':visible')) {
					$('#itemSelect .footer .ok').trigger('vclick');
					return;
				}

				//结算
				var nowTime = new Date().getTime();
				this.submitArr.push(nowTime);

				var num = this.compareTime(this.submitArr[0], nowTime);
				console.log(num, this.submitArr);
				if (num >= 0.3) {
					if (this.submitArr.length >= 2) {
						this.submitArr = [];
						var config = am.metadata.userInfo.operatestr.indexOf('a39') > -1 ? 1 : 0;
						if (!config) {
							// 0 允许结算  1允许结算
							$("#cashierTotalPanel .submit").not(".itemPay") .trigger('vclick');
						}
						// $("#cashierTotalPanel .submit").trigger('vclick');
					} else {}
				} else {}
			} else if (keyCode === 109 && $.am.getActivePage().id === 'page_service') {
				if ($('#keypadInputDiv').is(':visible')) {
					return;
				}
				$('#page_service .cashierMain .am-clickable.selected .center .price').not('.am-disabled').trigger('vclick');
			} else if (keyCode === 107) {
				if ($('#keypadInputDiv').is(':visible')) {
					return;
				}
				$('#tab_cash .searchBtn').trigger('vclick');
			} else if (typeof (ctrl.getNum(keyCode)) === 'number' &&
				!$('.nativeUIWidget-showPopupMenu').is(':visible') && !$('.nativeUIWidget-confirm').is(':visible')) {
				var val = ctrl.getNum(keyCode);
				if (!keypadInputDiv.is(':visible')) {
					keypadInputDiv.show();
					$('#keypadInputDiv input').val(val).focus();
					// $('.keypadLi').addClass('selected').show().siblings().removeClass('selected');

					//获取所有可用的项目
					var arrObj = {
						id: 1,
						name: "单个项目",
						sub: []
					};
					$.each(amGloble.metadata.classes, function (i, item) {
						arrObj.sub = arrObj.sub.concat(item.sub)
					})
					$('.keypadLi').data("data", arrObj).show().trigger('vclick');
					$('.keypadLi span').text($('#keypadInputDiv .inputDiv input').val());			
					self.keypadSearch(val);

				} else {}
			} else if (keyCode >= 37 && keyCode <= 40) {
				var obj = {
					keyCode: keyCode
				};
				if (!keypadInputDiv.is(':visible') && !$('#maskBoard').is(':visible') &&
					!$('.nativeUIWidget-showPopupMenu').is(':visible') && !$('#itemSelect').is(':visible')) {
					//切换已选择项目
					self.directionKeyGroup('2', obj);
				} else if ($('.nativeUIWidget-showPopupMenu').is(':visible')) {
					//选择组合项目中的项目
					self.directionKeyGroup('3', obj);
				} else if ($('#itemSelect').is(':visible')) {
					//选择变价项目
					self.directionKeyGroup('4', obj);
				} else if (keypadInputDiv.is(':visible')) {
					//移动待选择项目的聚焦框;
					self.directionKey(obj);
				}

			}
			if (keyCode === 27 || keyCode === 111) {
				if ($('#keypadInputDiv').is(':visible')) {
					return;
				}
				this.backButtonOnclick();
			}

		},
		processData: function (types) {
			var categorys = [];
			for (var i = 0; i < types.length; i++) {
				if (types[i].applyShopIds && types[i].applyShopIds.indexOf(am.metadata.userInfo.shopId) == -1) {
					continue;
				}
				var type = {
					name: types[i].packName,
					id: types[i].id,
					price: types[i].price,
					pinyin: types[i].pinyin,
					tpd: types[i].tpd,
					costMoney: types[i].costMoney,
					img: "$dynamicResource/images/card3.jpg",
					isNewTreatment: types[i].isNewTreatment,
					validDay: types[i].validDay,
					validity: types[i].validity,
					validitycheck: types[i].validitycheck,
					cashshopids: types[i].cashshopids
				};
				categorys.push(type);
			}

			var serviceItem = [];
			for (var i = 0; i < am.metadata.classes.length; i++) {
				var sub = am.metadata.classes[i].sub;
				for (var j = 0; j < sub.length; j++) {
					if (sub[j].treatFlag == "1") continue;
					serviceItem.push(sub[j]);
				}
			}

			return [{
					id: 0,
					name: "套餐",
					sub: categorys
				},
				{
					id: 1,
					name: "单个项目",
					sub: serviceItem
				}
			];
		},

		removeBillMainExperienceItem: function () {
			$.each(self.billMain.$list.children(), function (index, item) {
				var itemData = $(item).data('data');
				if (itemData.experienceService) {
					item.remove();
				}
			})
		},
		refreshBillMainExperienceItem: function (memberid) {
			var self = this;
			var billMainListEl = self.billMain.$list;
			var selectItemList = billMainListEl.children();
			var experienceItemObj = {};
			var isRemoveExperience = false;
			$.each(selectItemList, (function (index, item) {
				var itemData = $(item).data('data');
				if (!itemData.experienceService) return;
				var currentItemConfig = experienceItemObj[itemData.itemid];
				if (currentItemConfig) {
					currentItemConfig.selectCount++;
					currentItemConfig.elList.push(item);
				} else {
					experienceItemObj[itemData.itemid] = {
						selectCount: 1,
						elList: [item],
						itemData: itemData
					}
				}
			}))
			for (var itemid in experienceItemObj) {
				if (!itemid) return;
				isRemoveExperience = true;
				var currentExperience = experienceItemObj[itemid]
				this.getExperienceItemUserConsumeCount({
					itemData: currentExperience.itemData,
					memId: memberid
				}, function (consumeCount) {
					var surplusTotal = currentExperience.itemData.experienceNumber - consumeCount;
					if (surplusTotal < currentExperience.selectCount) {
						$.each(currentExperience.elList, function (index, item) {
							if (index > (surplusTotal - 1)) {
								item.remove();
							}
						})
					}
				})
			}
			if (isRemoveExperience) {
				am.msg('已删除不可用的体验项目');
			}
		},
		// 获取用户体验项目的已消费次数
		getExperienceItemUserConsumeCount: function (params, callback) {
			var itemData = params.itemData,
				memId = params.memId;
			var postData = {
				memId: memId,
				itemId: itemData.itemid, // 项目id
				shopId: amGloble.metadata.userInfo.shopId // 门店id
			}
			am.api.getConsumeCount.exec(postData, function (res) {
				if (res.code == 0) {
					callback(res.content);
				} else {
					am.msg('暂时无法使用体验项目，请稍后再试');
				}
			});
		},
		showSearch: {

		}

	}));
})();
(function() {
	var self = am.page.product = new $.am.Page({
		id : "page_product",
		backButtonOnclick : function() {
			if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
			    $.am.changePage(am.page.hangup, "", {
			        openbill: 1
			    });
			} else {
			    $.am.page.back();
			}
		},
		init : function() {
            this.billItemSelector = new cashierTools.BillItemSelector({
                $: this.$,
                tab: true,
				filter: true,
				// flag: true,
				page:"product",
				priceFilter: true,
				groupKey: 'PRODUCT_ITEM_GROUP',
                onSelect: function(data) {
					return self.billMain.addItem(data);
                },
                onTouch: function(isVclick) {
					self.billMain.hideMemberInfo(1);
					//如果底下两个模块升起来了，要降下来~~
                    if(isVclick){
                        self.billMain.rise(1);
                        self.billServerSelector.rise(1);
                    }
				},
				onTouchHold: function(data, $this){
					self.billItemSelector.startGrouping();
				},
				onSize:function(){
                    self.billMain.dispatchSettingSelf();
                }
            });

            this.billMain = new cashierTools.BillMain({
                $: this.$,
                th: [{
                    name: "项目"
                }, {
                    name: "单价",
                    width: "100px",
					className:"center"
                }, {
                    name: "数量",
                    width: "150px",
					className:"center"
                }, {
                    name: "价格",
                    width: "100px",
					className:"center"
                }],
	            outerHeight:43,
                onSelect: function($item,t) {
					//选销售跟卖品条目没有关系，整单都是一样的
					//self.billServerSelector.reset($item);
					self.billServerSelector.rise(0,t);
                },
                onAddItem: function(data, $container) {
					var $children = $container.find("tr");
					for (var i = 0; i < $children.length; i++) {
						var $etr = $children.eq(i);
						if($etr.data("data").id == data.id){
							$etr.trigger("vclick").find(".plus").trigger("vclick");
							return $etr.addClass("show1");
						}
					}
                    var price = data.price;

                    //001 卖品会员价 
	                price = toFloat(price);
	                var tprice  = price;
					var nprice  = self.getProductPrice(data,price);
					var mprice  = nprice.price;
	                var showDel = 0; 
	                if(nprice.isMemberPrice){
	                	showDel = 1;
	                	price   = mprice;
						data.memberprice = mprice;
						data.cardDiscount = 1;
	                }else if(self.member && self.member.buydiscount){
                        price = price*self.member.buydiscount*0.1;
                    }
                    price = Number(price).toFloat();


                    var $tr = $('<tr class="am-clickable show" data-showdel="'+showDel+'"></tr>');
					$tr.append('<td><div class="am-clickable delete"></div><span class="server" style="display:none"></span></td>');
					$tr.append('<td>'+data.name+'</td>');
					var spanClass='';
					if(am.operateArr.indexOf("J2")!=-1){
						spanClass = 'am-disabled';
					}
					$tr.append('<td class="center"><span class="price am-clickable '+spanClass+'">'+price+'</span></td>');
					// floatNum
					$tr.append('<td class="center"><div class="number"><span class="reduce am-clickable am-disabled"></span><span class="value am-clickable floatNum">1</span><span class="plus am-clickable"></span></div></td>');
					$tr.append('<td class="center"><span class="sum">'+price+'</span></td>');
					$tr.append('<td class="empty-td"><div class="empty-div"><svg class="icon svg-icon" aria-hidden="true"><use xlink:href="#icon-yduigantanhaokongxin"></use></svg><span class="empty-text">库存 '+'<span class="num">'+(self.numObj && self.numObj[data.id])+'</span>'+'</span></div></td>');
					$container.append($tr.data("data",data));
					//校验是否库存为0 
					if(self.numObj && (self.numObj[data.id]<=0)){
						$tr.addClass('empty');
					}
					return $tr;
                },
				onPriceChange:function($tr){
                    var totalPrice = 0;
                    var $trs = this.$list.find("tr");
					$trs.each(function(){
						var $tr = $(this);
						var $price = $tr.find(".price");
						var $number = $tr.find(".number .value");
						var sum = ($price.text().replace("￥","")*$number.text() || 0);
						$tr.find(".sum").text(toFloat(sum));
                        totalPrice+= sum;
                    });
                    this.totalPrice = totalPrice;
                    this.$totalPrice.text("￥"+toFloat(totalPrice));
					//am.cashierTab.setPrice(totalPrice,1);
					am.cashierTab.setPrice({
						totalPrice:totalPrice,
						num:$trs.length,
						type:1
					});
                },
                settingKey: "setting_seller",
                defaultSetting: null,
                dispatchSetting: function(settings) {
					self.billServerSelector.dispatchSetting(settings);
                },
                onSubmit:function(){
                    self.submit();
                }
			});
			this.$goodsUl=this.$.find('.cashierItemScroll > ul');
			this.$tbodyBill=this.$.find('.cashierMain tbody')

			this.billMain.$.find('.memberInfoBtn').vclick(function() {
                $.am.changePage(am.page.memberDetails, "slideup",{
                    "customerId":self.member.id,
                    "cardId":self.member.cid,
                    "shopId":self.member.shopId,
                    "tabId":1
                });
            });
            this.$member = this.billMain.$.find(".member").vclick(function() {
                if(self.member){
                    self.billMain.showMemberInfo(self.member);
                }else{
                    $.am.changePage(am.page.searchMember, "slideup",{
                        onSelect:function(item){
                            $.am.changePage(self, "slidedown",{
                               member:item
                           });
                        }
                    });
                }
            });

			this.billMain.$.find(".selectMember").vclick(function() {
				$.am.changePage(am.page.searchMember, "slideup",{
					onSelect:function(item){
						$.am.changePage(self, "slidedown",{
						   member:item
					   });
					}
				});
			});

            this.billServerSelector = new cashierTools.BillServerSelector({
                $: this.$,
                onSelect: function(data) {
					self.selectedServer = data;
					//不往项目里面加了，自己记住
                    //self.billMain.addServer(data);
	                if(this.$body.find('li.selected').length>0){
		                am.tips.perfSetting(self.billServerSelector.$.find('li[serverid='+data.id+']'));
	                }
                },
                onRemove: function(){
                	self.selectedServer = null;
                },
	            muti:true,
	            getTotalPerf:function () {
		            return self.billMain.totalPrice;
				},
				onSetEmpPer: function(emp, per,perf,gain) {
                    var $server = self.billMain.$list.find("tr.selected .server").eq(emp.pos);
                    var data = $server.data("data");
                    if (data) {
                        setTimeout(function() {
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
            });

			/* document.addEventListener('scanningGunResult',function(result){
				$.am.debug.log(JSON.stringify(result));
				if(result && result.result){
					self.scanningResultSearch(result.result);
				}else{
					am.msg('扫描枪连接异常！');
				}
			}, false);
			document.addEventListener('scanningGunCancelled',function(result){
				//$.am.debug.log(JSON.stringify(result));
				if(self.scanningGunCancelledTimer){
					clearTimeout(self.scanningGunCancelledTimer);
				}
				if(self.autoStartScanTimer){
					clearTimeout(self.autoStartScanTimer);
				}
				self.scanningGunCancelledTimer = setTimeout(function(){
					if(self.scanner && self == $.am.getActivePage()){
						var ts = new Date().getTime();
						if(self.autoStartScanTS && ts-self.autoStartScanTS<100){
							//如果两次自动开始之间小于100ms,等一秒再重新开始
							self.autoStartScanTimer = setTimeout(function(){
								self.startScanningGun();
								self.autoStartScanTS = new Date().getTime();
							},1000);
						}else{
							self.startScanningGun();
							self.autoStartScanTS = ts;
						}
					}
				},10);
			}, false); */

			this.$scanner = this.$.find('.scanCheckbox').vclick(function(){
				var $this = $(this);
				if($this.hasClass('checked')){
					$this.removeClass('checked');
					localStorage.removeItem('TP_scanner');
					self.scanner = false;
					self.stopScanningGun();
				}else{
					$this.addClass('checked');
					localStorage.setItem('TP_scanner',1);
					self.scanner = true;
					self.startScanningGun();
				}
			});

			this.$.find('.priceFilterWrap input').focus(function(){
				$(this).parent().addClass('focus');
			}).blur(function(){
				$(this).parent().removeClass('focus');
			});

			this.member = null;
            this.$member.html('<span class="tag">顾客:</span>散客').prev().hide();
            this.$scanner.hide().next().css({'margin-right':0})//隐藏蓝牙扫码枪
		},
		getProductPrice:function(data,price){//获取卖品会员价
				var item = amGloble.metadata.categoryItemMap[data.id];
				var res = {
					price:price,
					isMemberPrice:false
				}
				if(item){
					if(item.mgj_memberpricecfg){//存在卖品会员价
						
						var mgj_memberpricecfg = JSON.parse(item.mgj_memberpricecfg); 
						if(mgj_memberpricecfg && self.member){
							if(am.checkCrossConsum(self.member.shopId)){
								if(mgj_memberpricecfg.memberPrice){
									res.price = mgj_memberpricecfg.memberPrice;
									res.isMemberPrice = true;
								}
								if(mgj_memberpricecfg.cardList && mgj_memberpricecfg.cardList.length){
									for(var i = 0;i<mgj_memberpricecfg.cardList.length;i++){
										var itemj = mgj_memberpricecfg.cardList[i];
										if(itemj.cardtypeid == self.member.cardTypeId){
											res.price = itemj.price;
											res.isMemberPrice = true;
										}
									}
								}
							}else{
								if(mgj_memberpricecfg.memberPrice){
									res.price = mgj_memberpricecfg.memberPrice;
									res.isMemberPrice = true;
								}
							}
							
						}
					}
				}
				return res;
		},
		checkIsOpen:function(paras){
		    if(amGloble.metadata.shopPropertyField.mgjBillingType==1){
		        this.$.addClass('openBill');
		        if(paras && paras.bill){
		            am.cashierTab.changeOpenBill(1,paras.bill);
		        }else{
		            am.cashierTab.changeOpenBill(1);
		        }
		        
		    }else{
		        am.cashierTab.changeOpenBill(0);
		    }
		},
		beforeShow : function(paras) {
			var _this = this;
			this.$.removeClass('openBill');
			this.scanner = (localStorage.getItem('TP_scanner') == 1);
			if(this.scanner){
				this.$scanner.addClass('checked');
			}else{
				this.$scanner.removeClass('checked');
			}
            am.tab.main.show().select(1);
			this.checkIsOpen(paras);
			if(paras && paras.afterRecharge && this.member){
				var afterRecharge = paras.afterRecharge;
				if(afterRecharge.memId){
					//自动升级
					am.searchMember.getMemberById(afterRecharge.memId,afterRecharge.cid,function(card){
						if(card){
							_this.setMember(card);
						}
					});
				}
				// else {
				// 	//手动升级
				// 	this.member.balance += paras.afterRecharge.cardFee;
				// 	this.member.gift += paras.afterRecharge.presentFee;
				// 	if(afterRecharge.upgradeCard){
				// 		this.member.cardName = afterRecharge.upgradeCard.cardName;
				// 		this.member.discount = afterRecharge.upgradeCard.discount;
				// 		this.member.buydiscount = afterRecharge.upgradeCard.buydiscount;
				// 	}
				// 	this.setMember(this.member,null);
				// }
				return;
			}
            if(paras=="back"){
            	//this.checkIsOpen(paras);
                return;
            }else if(paras && paras.hasOwnProperty("member")){
				this.setMember(paras.member);
				this.checkComboMatch();
				am.page.service.checkComboMatch();
				// this.billMain.onPriceChange();
                // setTimeout(function(){
                //     am.tips.details( am.page.product.billMain.$.find(".member"), am.page.product.billMain.$.find('.memberInfoBtn') );
                // }, 500);
            } else if(paras && paras.cardData){
                //客户详情，重新选卡
                this.setMember(am.convertMemberDetailToSearch(paras.cardData),paras.cardData.card);
                this.billMain.reset(1);
            } else if(paras == 'freezing' && !this.needReset){
            	//this.checkIsOpen(paras);
	            this.billMain.reset(1);
	            this.billServerSelector.reset(false,false,1);
	            this.billItemSelector.reset();
            }else if (am.metadata) {
            	//this.checkIsOpen(paras);
	            if(!this.needReset){
		            am.cashierTab.reset(0);
	            }
	            this.needReset = 0;
				this.reset(paras);
            } else {
                //throw "metadata should be ready";
            }
		},
		reset:function (paras) {
			var employeeList = am.metadata.employeeList || [];
			if(am.metadata.configs && am.metadata.configs['EMP_SORT']){
				employeeList = JSON.parse(am.metadata.configs['EMP_SORT']);
				employeeList = am.getConfigEmpSort(employeeList);
			}
			this.billItemSelector.dataBind(this.processData(am.metadata.category));
			this.billItemSelector.setGroup(am.page.service.getGroupData.call(this));
			this.billServerSelector.dataBind(employeeList,["销售"]);//多个工位传true, 不分工位传false;

			this.billItemSelector.reset();
			this.billServerSelector.reset();
			this.billMain.defaultSetting = this.getServerDefultSetting(employeeList);
			this.billMain.reset();

			if(paras != 'freezing'){
				if(paras && paras.reset){
					this.setMember(paras.reset);
				}else if(paras && paras.cardData){
					this.setMember(am.convertMemberDetailToSearch(paras.cardData));
				}else{
					this.member = null;
					this.$member.html('<span class="tag">顾客:</span>散客').prev().hide();
				}
				if(paras && paras.bill){
					this.billData = paras.bill;
					this.feedMain(paras.bill);
				}else{
					this.billData = null;
				}
			}
			this.selectedServer = null;
		},
		fillNum: function () {
			console.log(this.numObj);
			var numObj = this.numObj;
			if (numObj) {
				var $lis = this.$goodsUl.find('li');
				$lis.each(function (i, v) {
					var goodId = $(v).data('data').id;
					if($(v).hasClass('group')){
						// 组合卖品
						var group=$(v).data('group'),
							isEmpty=1,
							items=group.items;
						for(var j=0,len=items.length;j<len;j++){
							var productItem = am.metadata.categoryCodeMap[items[j]];
							if(productItem && numObj[productItem.id]>0){
								isEmpty=0;
								break;
							}
						}
						if(isEmpty){
							$(v).addClass('empty');
						}
					}else{
						// 非组合卖品
						if(numObj[goodId] <= 0){
							// 库存为0 商品变为半透明 不可加入购物车
							$(v).addClass('empty').find('.num').text('库存 ' + numObj[goodId]);
						}else if(numObj[goodId]){
							// 库存不为0
							$(v).find('.num').text('库存 ' + numObj[goodId]);
						}else{
							// 库存数据不存在
						}
					}
				});
			}
			this.fillBillNum();
		},
		fillBillNum: function () {
			var numObj = this.numObj;
			if (numObj) {
				var $trs = this.$tbodyBill.find('tr.am-clickable');
				$trs.each(function (i, v) {
					var goodId = $(v).data('data').id;
					if (numObj[goodId] <= 0) {
						if (!$(v).hasClass('empty')) {
							$(v).addClass('empty').find('.num').text(numObj[goodId]);
						}
					}
				});
			}
		},
		arr2obj: function (arr) {
			var obj = {};
			if (arr && arr.length) {
				for (var i = 0, len = arr.length; i < len; i++) {
					obj[arr[i].ID] = arr[i].NUM;
				}
				this.numObj = obj;
			} else {

			}
		},
		getGoodsNum: function (cb) {
			var opt = {
				parentShopId: am.metadata.userInfo.parentShopId,
				shopId: am.metadata.userInfo.shopId,
			};
			am.api.getGoodsNum.exec(opt, function (res) {
				if (res.code == 0) {
					var data = self.arr2obj(res.content)
					cb && cb(data);
				} else {
				}
			});
		},
		afterShow : function(paras) {
			am.cashierTab.show(1);
			$.am.debug.log("ss");

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
			this.getGoodsNum(function(){
				self.fillNum();
			});
			/* if(this.scanner || 1){
				if(this.scannerTimer) clearTimeout(this.scannerTimer);
				this.scannerTimer = setTimeout(function(){
					self.startScanningGun();
				},300);
			} */
		},
		setMember:function(member,card){
			am.cashierTab.setMember(member,1,card);
			//重载
            console.log("项目重载！！");
            console.log(this);
		},
		_setMember:function(member,pass){
			var _this=this;
			this.member = member;
			if(this.member){
				this.checkComboMatch();
			}

			/*var cardName = this.member.cardName;
            var balanceFee = this.member.balance-this.member.treatcardfee;
            if(this.member.cardtype == 1 && this.member.timeflag==0 && balanceFee){
                cardName+='(￥'+balanceFee.toFixed(0)+')';
            }
            this.$member.html('<div class="img"></div><div class="name">'+this.member.name+'</div><div class="cardname">'+cardName+'</div>').prev().show();

			//this.$member.html('<div class="img"></div><div class="name">'+this.member.name+'</div>').prev().show();
            this.$member.find('.img').html(am.photoManager.createImage("customer", {
                parentShopId: am.metadata.userInfo.parentShopId,
                updateTs: member.lastphotoupdatetime || ""
            }, member.id + ".jpg", "s"));*/

		},
		checkComboMatch : function(){
			this.billMain.$list.find("tr").each(function () {
				var data = $(this).data("data");
				var $price = $(this).find(".price");
				var price = data.price;
				var nprice = self.getProductPrice(data, price);
				var mprice = nprice.price;
				var showDel = 0;
				if (!$price.hasClass("modifyed")) {
					if (nprice.isMemberPrice) {
						showDel = 1;
						price = mprice;
						data.cardDiscount = 1;
					} else if (data) {
						if (self.member) {
							var discount = self.member.buydiscount * 1 || 10;
							$(this).attr("data-showdel", showDel);
							price = price * discount * 0.1
						}
					}
					$price.text(toFloat(price));
				}
			});
			this.billMain.onPriceChange();
		},
		beforeHide : function(paras) {
			/* if(this.scanner || 1){
				this.stopScanningGun();
			} */
			this.billMain.hideMemberInfo();
			am.cashierTab.hide();
			am.cashierTab.fullTab(0);
		},
		startScanningGun:function(){
			try{
				// if(cordova && cordova.plugins && cordova.plugins.Keyboard && cordova.plugins.Keyboard.hideKeyboardAccessoryBar){
				// 	cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				// 	$.am.debug.log("succ: hideKeyboardAccessoryBar");
				// }else{
				// 	$.am.debug.log("error: cordova.plugins.Keyboard.hideKeyboardAccessoryBar");
				// }
				/* navigator.appplugin.startScanningGun(function(msgCode) {
					$.am.debug.log('startScanningGun:'+msgCode);
				}, function(msg) {
					$.am.debug.log('startScanningGun:error'+msgCode);
				}); */
			}catch(e){
				$.am.debug.log("startScanningGun js error:"+e);
			}
		},
		stopScanningGun:function(){
			try{
				/* navigator.appplugin.stopScanningGun(function(msgCode) {
					$.am.debug.log(msgCode);
				}, function(msg) {
					$.am.debug.log(msgCode);
				}); */
			}catch(e){
				$.am.debug.log("error:"+e);
			}
		},
		getServerDefultSetting:function(emps){
			var setting = [];
			for (var i = 0; i < emps.length; i++) {
				setting.push({
					"name": "("+emps[i].no+")"+emps[i].name,
					"key": "emps_"+emps[i].id,
					"flag": 1
				});
			}
			return setting;
		},
		processData:function(types){
			var categorys = [];
			this.scanMap = {};
			if(types){
				for(var i=0;i<types.length;i++){
					var type = {
						name:types[i].type,
						id:types[i].id,
						marqueid:types[i].marqueid,
						sub:[]
					};
					var list = types[i].depotList;
					for(var j=0;j<list.length;j++){
						var subitem = {
							id:list[j].id,
							name:list[j].name,
							price:list[j].saleprice*1,
							pinyin:list[j].pinyin,
							mgjdepotlogo:list[j].mgjdepotlogo,
							itemid:list[j].no
						};
						type.sub.push(subitem);
						if(list[j].mgj_barcode){
							if(!this.scanMap[list[j].mgj_barcode]){
								this.scanMap[list[j].mgj_barcode] = [];
							}
							this.scanMap[list[j].mgj_barcode].push(subitem);
						}
					}
					categorys.push(type);
				}
			}
			return categorys;
		},
		submit:function(dataOnly){
			var user = am.metadata.userInfo;
            var opt = {
                "parentShopId": user.realParentShopId,
                "shopId": user.shopId,
                //"memId": -1,
                //"cardId": -1,
                //"billNo": "",
                "expenseCategory": 1,
                "gender": "F",
                "custSource": 0,
                "comment": "",
                "clientflag":1,
                "otherFlag":1,
                "token":user.mgjtouchtoken,
                "serviceItems": [],
				"products":{
					"depots":[],
					"servers":[],
				},
                "billingInfo": {
                    "total": 0,
                    "eaFee": 0, //入账金额
					"treatfee": 0,
					"treatpresentfee": 0,
	                //"pointFee":0,
	                //"coupon":0,

	                "cardFee": 0, //卡金
	                "presentFee": 0, //赠送金
	                "cashFee": 0, //现金
	                "unionPay": 0, //银联
	                "cooperation": 0, //合作券
	                "mall": 0, //商场卡
	                "weixin": 0, //微信
	                "pay": 0, //支付宝
	                "voucherFee": 0, //代金券
	                "mdFee": 0, //免单金额
	                "divideFee": 0, //分期赠送进
	                "pointFee": 0, //积分
	                "debtFee": 0, //欠款
	                "dpFee": 0, //点评
	                "dpId": null, //点评id
	                "payId": null, //支付宝id
	                "weixinId": null, //微信 id
	                "dpCouponId": null, //微信 id

	                "luckymoney":0,
	                "coupon": 0,
	                //"dianpin": 0,
	                "otherfee1": 0,
	                "otherfee2": 0,
	                "otherfee3": 0,
	                "otherfee4": 0,
	                "otherfee5": 0,
	                "otherfee6": 0,
	                "otherfee7": 0,
	                "otherfee8": 0,
	                "otherfee9": 0,
	                "otherfee10": 0
                }
            };

			// if(this.billData && amGloble.metadata.shopPropertyField.mgjBillingType==1){
            if(this.billData){
                opt.instoreServiceId = this.billData.id;
            }

            if(this.member){
                opt.memId = this.member.id;
                opt.cardId = this.member.cid;
				opt.gender = this.member.sex;
            }
			var $trs = this.billMain.$list.find("tr");
            for (var i = 0; i < $trs.length; i++) {
                var $tr = $trs.eq(i);
                var data = $tr.data("data");
                var $price = $tr.find(".price");
                var price = $price.text() * 1;
				var num = $tr.find('.number .value').text()*1;
                if (!price && price != 0) {
                    am.msg("请设定卖品价格！");
                    $price.addClass("error");
                    return;
                }
                var item = {
                    "productid": data.id*1,
					"productName":data.name,
                    "price": data.price || 0,
                    "salePrice": price,
                    "depcode": this.getDepCode(data.id),
					"number":num,
					"cardDiscount": data.cardDiscount
				};
	            if($price.hasClass("modifyed")){
		            item.modifyed=1;
	            }
				// if(item.depcode==-1 && am.metadata.deparList.length==1){
    //                 //如果只有一个部门
    //                 item.depcode = am.metadata.deparList[0].code;
    //             }else if(item.depcode==-1 && am.metadata.deparList.length>1) {
    //                 //有多个部门
    //                 //TODO
    //                 //目前先这样写
    //                 item.depcode = am.metadata.deparList[0].code;
    //             }
                opt.billingInfo.total += price*num;
                opt.products.depots.push(item);
            }

			/*if(this.selectedServer){
				opt.products.servers.push({
					"empId": this.selectedServer.id,
					"empName": this.selectedServer.name,
					"empNo": this.selectedServer.no,
					"station":this.selectedServer.pos,
					"pointFlag": 1, // 是否指定 0指定 1非指定
					"dutyid": this.selectedServer.dutyType
				});
			}*/
			opt.products.servers = this.billServerSelector.getEmps();

            opt.billingInfo.eaFee = opt.billingInfo.total;
            /*$.am.changePage(am.page.pay, "slideup", {
                comboitem: [],
                option: opt,
                member: this.member
            });*/
            return {
	            comboitem: [],
	            option: opt,
	            member: this.member
            };
		},
		getDepCode:function(id){
			var category = am.metadata.category;
			for(var i=0;i<category.length;i++){
				for(var j=0;j<category[i].depotList.length;j++){
					if(category[i].depotList[j].id==id){
						return category[i].depCode || '';
					}
				}
			}
			return '';
		},
		scanningResultSearch:function(key){
			var item = this.scanMap[key];
			if(item && item.length){
				if(item.length==1){
					self.billMain.addItem(item[0]);
				}else {
					am.popupMenu("请选择商品", item , function (ret) {
						self.billMain.addItem(ret);
					});
				}
			}else{
				am.msg('没有找到对应商品，请检查商品条码是否正确录入');
			}
		},
		trigger:function(t){
			var event = document.createEvent('HTMLEvents');
			// initEvent接受3个参数：
			// 事件类型，是否冒泡，是否阻止浏览器的默认行为
			event.initEvent("scanningGunResult", true, true);
			event.result =t;
			//触发document上绑定的自定义事件ondataavailable
			document.dispatchEvent(event);
		},
		feedMain:function(bill){
			var data;
			try{
				data = JSON.parse(bill.data);
			}catch(e){
				$.am.debug.log(data);
			}
			if(data && data.products && data.products.depots){
				var items = data.products.depots;
				var $tr;
				if(items && items.length){
					for (var i = 0; i < items.length; i++) {
						var metaItem = am.metadata.categoryItemMap[items[i].productid];
						if(metaItem){
							$tr = this.billMain.addItem({
								id:metaItem.id,
								name:metaItem.name,
								price:metaItem.saleprice*1,
								pinyin:metaItem.pinyin,
								mgjdepotlogo:metaItem.mgjdepotlogo
							});
							$tr.find('.number .value').text(items[i].number);
							if(items[i].modifyed && items[i].salePrice !== items[i].price){
								$tr.find('.price').text(items[i].salePrice).addClass("modifyed");
							}
						}
					}
				}
				var servers = data.products.servers;
				if(servers && servers.length){
					for(var i=0;i<servers.length;i++){
						this.billServerSelector.$body.find('li[serverid='+servers[i].empId+']').addClass('selected').find('.perfVal').css({
							width:(servers[i].per>100?100:servers[i].per)+'%'
						}).find('.perfNum').text(servers[i].per);
						this.billServerSelector.$body.find('li[serverid='+servers[i].empId+']').data('gain',servers[i].gain);
					}
				}

				if($tr){
					$tr.trigger('vclick');
					this.billMain.onPriceChange();
					this.needReset = 0;
				}
			}
		},
		onBillStatusChange:function(data){
            if(data.id && data.id === this.billData.id){
                atMobile.nativeUIWidget.showMessageBox({
                    title: "单据已修改",
                    content: '由于其它终端的操作，此单状态已改变！'
                });
                $.am.changePage(am.page.hangup);
            }
        },
		keyboardCtrl:function(keyCode){
            var ctrl = window.keyboardCtrl;
            if(keyCode === 192){
                $('#tab_cash li[data-pow=a20]').trigger('vclick');
            }
        }
	});
})();

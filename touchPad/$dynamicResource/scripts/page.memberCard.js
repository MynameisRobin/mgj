(function() {
	var self = am.page.memberCard = new $.am.Page({
		id : "page_memberCard",
		backButtonOnclick : function() {

		},
		init : function() {
			var _this = this;
            this.billItemSelector = new cashierTools.BillItemSelector({
                $: this.$,
                tab: false,
                filter: false,
				itemWidth:238,
                onSelect: function(data) {
                    return _this.billMain.addItem(data);
                },
				onTouch: function(isVclick) {
					self.billMain.hideMemberInfo(1);
					//如果底下两个模块升起来了，要降下来~~
                    if(isVclick){
                        self.billMain.rise(1);
                        self.billServerSelector.rise(1);
                    }
                }
            });

            this.billMain = new cashierTools.BillMain({
                $: this.$,
                th: [{
                    name: "会员卡"
                }, {
	                name: "价格",
	                width: "130px",
	                className:"center"
                }, {
                    name: "开卡成本",
                    width: "130px",
					className:"center cost"
                }, {
                    name: "赠送金",
                    width: "130px",
					className:"center"
                }, {
	                name: "有效期",
	                width: "130px",
	                className:"center"
                }],
                onSelect: function($item,t) {
                    self.billServerSelector.rise(0,t);
                },
                onAddItem: function(data, $container) {
					$container.empty();
                    var $tr = $('<tr class="am-clickable show"></tr>');
					$tr.append('<td><div class="am-clickable delete"></div><span class="server" style="display:none"></span></td>');
					$tr.append('<td>'+data.name+'</td>');

					var p='';
                    if(am.metadata.userInfo.operatestr && am.metadata.userInfo.operatestr.indexOf("A0") == -1){
                        p = 'am-disabled';
                    }
					var _price = data.price;
					if(data.feedmoney){
						_price = data.feedmoney;
					}
					$tr.append('<td class="center"><span class="price am-clickable">'+_price+'</span></td>'); // '+(data.price?p:'')+'
                    if(data.cardtype==1 && data.costs){
	                    $tr.append('<td class="center"><span class="cost">'+(data.costs||0)+'</span></td>');
	                    $container.prev().find(".cost").show();
                    }else{
	                    $container.prev().find(".cost").hide();
                    }

					if(data.cardtype==1){
						$tr.append('<td class="center"><span class="price bonus am-clickable '+p+'">'+_this.getBonusRule(data,_price,1)+'</span></td>');
					}else{
						$tr.append('<td class="center">--</td>');
					}

					var expiryDateTxt = '不限期';
					if(data.expirydate){
						var ts = am.now();
						ts.setMonth(ts.getMonth()+data.expirydate);
						expiryDateTxt=ts.format('yyyy/mm/dd');
					}else{
						//ts.setFullYear(ts.getFullYear()+1);
					}
	                $tr.append('<td class="center"><div class="number date am-clickable">'+expiryDateTxt+'</div></td>');
                    $container.append($tr.data("data",data));
					self.selectCard = data;
					self.checkCardIdExists();
					return $tr;
                },
				onPriceChange:function($tr,$target){
                    var $tr = this.$list.find("tr");
					var $price = $tr.find(".price");
					var $cost = $tr.find("span.cost");
					var data = $tr.data('data');
					var totalPrice = $price.eq(0).text()*1 || 0;
					var cost = $cost.text()*1||0;
					if($target && $target.hasClass){
						if($target.hasClass('bonus')){
							//改赠送金，可以随便改
							// if(bonus){
							// 	am.msg('此卡已设定赠送金规则');
							// 	$tr.find(".bonus").text(bonus);
							// }
						}else{
							if(data.mgj_minMoney && totalPrice<data.price){
								//如果限制最低开卡金额，且金额低于开卡金额
								am.msg(data.name+'限制最低开卡金额为￥'+data.price+"！");
								totalPrice = data.price;
								$price.eq(0).text(toFloat(data.price));
							}
							var bonus = _this.getBonusRule(data,totalPrice,1);
							//改价格
							$tr.find(".bonus").text(toFloat(bonus));
						}
					}
					this.totalPrice = toFloat(totalPrice);
                    this.$totalPrice.text("￥"+toFloat(this.totalPrice+cost));
                },
                settingKey: "setting_seller",
                defaultSetting: null,
                dispatchSetting: function(settings) {
					_this.billServerSelector.dispatchSetting(settings);
                },
                onSubmit:function(){
                    _this.submit();
                },
                changekbtab:true,
            });
			this.billMain.$list.on("vclick",".date",function(){
				am.page.comboCard.showCalendar($(this));
				return false;
			});
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
					},
					notNeedWaiting: 1
				});
			});

            this.billServerSelector = new cashierTools.BillServerSelector({
                $: this.$,
                onSelect: function(data) {
                    self.selectedServer = data;
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
	            }
            });

			this.$billNo = this.$.find("input[name=billNo]")/*.attr('readonly',true)*/.keyup(function(e) {//干掉弹出式数字键盘 改用默认系统键盘
                var $this=$(this).removeClass("error");
                /*am.keyboard.show({
                    "title":"卡号",
                	"submit":function(value){
                        $this.val(value);
						self.checkCardIdExists();
                	}
                });*/
                if(e.keyCode=='13'){
                	self.checkCardIdExists();
                }/*else{
                	clearTimeout(self.checkTimer);
                	self.checkTimer=null;
                	if(!self.checkTimer){
                		self.frequentlyDo();
                	}
                }*/
            });
		},
		beforeShow : function(paras) {
			var _this=this;
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
			this.isCheck=false;
			am.tab.main.show().select(3);
			if(!paras) this.billRemark = null;
            if(paras=="back"){
                return;
            }else if(paras && paras.hasOwnProperty("member")){
				if(am.isNull(paras.member)){
					this.member = null;
					this.$member.html('<span class="tag">顾客:</span>散客').prev().hide();	
					return false;
				}
                this.setMember(paras.member);
                setTimeout(function(){
                    am.tips.details( am.page.memberCard.billMain.$.find(".member"), am.page.memberCard.billMain.$.find('.memberInfoBtn') );
                }, 500);
            } else if(paras && paras.cardData){
                //客户详情，重新选卡
                this.setMember(am.convertMemberDetailToSearch(paras.cardData));
            }else if (am.metadata) {
				var employeeList = am.metadata.employeeList || [];
				if(am.metadata.configs && am.metadata.configs['EMP_SORT']){
					employeeList = JSON.parse(am.metadata.configs['EMP_SORT']);
					employeeList = am.getConfigEmpSort(employeeList);
				}
                this.billItemSelector.dataBind(this.processData(am.metadata.cardTypeList));
                this.billServerSelector.dataBind(employeeList,["销售"]);

                this.billItemSelector.reset();
                this.billServerSelector.reset();
				this.billMain.defaultSetting = am.page.product.getServerDefultSetting(employeeList);
                this.billMain.reset();
				this.selectedServer = null;
				this.selectCard = null;
				this.$billNo.val("").removeClass("error");

				if(paras && paras.reset){
                    this.setMember(paras.reset);
                } else if(paras && paras.cardData){
					this.setMember(am.convertMemberDetailToSearch(paras.cardData));
	            }else{
                    this.member = null;
                    this.$member.html('<span class="tag">顾客:</span>散客').prev().hide();
                }
            } else {
                //throw "metadata should be ready";
			}
			if(paras && paras.billRemark){
                this.billRemark = paras.billRemark;
                var sdata = paras.billRemark.data;
                var _data = {};
                try{
                    _data = JSON.parse(sdata);
                }catch(e){}
                am.searchMember.getMemberById(paras.billRemark.memId,_data.cid,function(card){
                    if(card){
                        _this.setMember(card);
                    }
                });
                //渲染套餐
                this.renderFeedRemark(_data);
            }else{
				if(paras && !paras.member){
					this.billRemark = null;
				}
			}
		},
		renderFeedRemark:function(sdata){
            var remark = sdata.billRemark.opencard;
            var list   = this.processData(am.metadata.cardTypeList);
            var res = [];
            for(var i=0;i<list.length;i++){
                var item = list[i];
                if(item.cardtypeid == remark.id){
					var itemj   = am.clone(item);
					itemj.feedmoney = remark.money;
					this.billMain.addItem(itemj);
				}
            }
            

        },
		afterShow : function(paras) {

		},
		beforeHide : function(paras) {
			this.billMain.hideMemberInfo();
		},
		checkCardIdExists:function(cb){
			var cardId = this.$billNo.val();//读取input中的值
			var reg = /^[0-9a-zA-Z]+$/;
			if(!reg.test(cardId)&&cardId){
				am.msg('卡号只能是数字和字母');
				self.$billNo.val("").addClass("error");
				return ;
			}
			console.log(self.selectCard);
			if(self.selectCard && cardId){
				am.api.checkCardIdExists.exec({
					parentShopId:am.metadata.userInfo.parentShopId,
					shopId:am.metadata.userInfo.shopId,
					cardId:cardId,
					cardTypeId:self.selectCard.cardtypeid
				},function(ret){
					if(ret && ret.code==1002012){
						am.msg('此卡号已存在，请重新输入');
						self.$billNo.val("").addClass("error");
					}else{
						cb && cb();
					}
				});
			}
		},
		/*frequentlyDo:function(){//输入停止后0.5s之后检查卡号 当重新输入后 停止定时器
			this.checkTimer = setTimeout(function(){
				self.checkCardIdExists();
			},300);
		},*/
		setMember:function(member,pass){
			var _this=this;
			// if(!pass && amGloble.metadata.configs.typePasswordtToSelectMember == 'true'){
			// 	am.pw.check(member,function(verifyed){
			// 		if(verifyed){
			// 			_this.setMember(member,1);
			// 		}
			// 	});
			// 	return;
			// }
			this.member = member;

			var cardName = this.member.cardName;
            var balanceFee = this.member.balance;
            if(this.member.cardtype == 1 && this.member.timeflag==0 && balanceFee){
                cardName+='(￥'+balanceFee.toFixed(0)+')';
            }
            this.$member.html('<div class="img"></div><div class="name">'+this.member.name+'</div><div class="cardname">'+cardName+'</div>').prev().show();

			//this.$member.html('<div class="img"></div><div class="name">'+this.member.name+'</div>').prev().show();
			this.$member.find('.img').html(am.photoManager.createImage("customer", {
				parentShopId: am.metadata.userInfo.parentShopId,
				updateTs: member.lastphotoupdatetime || ""
			}, member.id + ".jpg", "s",member.photopath||''));
            if(member.mgjIsHighQualityCust == 1){
                this.$member.find('.img').addClass("good");
            }else{
                this.$member.find('.img').removeClass("good");
			}
			if(am.isMemberLock(member.lastconsumetime || member.lastConsumeTime, member.locking)){
                this.$member.find('.img').addClass("lock");
			}else{
                this.$member.find('.img').removeClass("lock");
			}
			cashierDebt.check(member);
		},
		processData:function(types){
			var categorys = [];
			for(var i=0;i<types.length;i++){
				if((types[i].cardtype==1 && !(types[i].timeflag==0 || (types[i].timeflag==2 && types[i].cardtypeid!='20161012'))) || types[i].newflag!='1'){
					//过滤除资格卡和普通储值卡之外的卡
					continue;
				}
				var type = {
					name:types[i].cardtypename,
					id:types[i].cardtypeid,
					cardtype:types[i].cardtype,
                    timeflag:types[i].timeflag,
                    pinyin:types[i].pinyin,
					price:types[i].openmoney,
					bonusRule:types[i].bonusRule,
					cardtypeid:types[i].cardtypeid,
					img:"$dynamicResource/images/card"+(types[i].cardtype==1?(types[i].timeflag==2?3:1):2)+".jpg",
					mgj_minMoney:types[i].mgj_minMoney,
					mgj_minRecharge:types[i].mgj_minRecharge,
					mgj_mustPassword:types[i].mgj_mustPassword,
					khflag:types[i].khflag,
					costs:types[i].costs,
					expirydate:types[i].expirydate,
					allowkd:types[i].allowkd,
					combinedUseFlag:types[i].combineduseflag
				};
				if(types[i].img){
					type.img=config.filesMgr+'card/'+am.metadata.userInfo.parentShopId+'/'+types[i].img;
				}
				categorys.push(type);
			}
			return categorys;
		},
		getBonusRule: function (data, price, feeType) {
			//开卡 feeType==1，  充值 feeType  == 2
			var bonus = 0;
			if (data.bonusRule && data.bonusRule.length) {
				var rules = data.bonusRule;
				for (var i = 0; i < rules.length; i++) {
					if (rules[i].feetype && feeType) {
						// 开卡或充值
						if (price * 1 >= rules[i].chargefee * 1 && feeType == rules[i].feetype) {
							if (rules[i].pmodel == 0) {
								bonus = rules[i].pnumber;
							} else if (rules[i].pmodel == 1) {
								bonus = Math.round(price * rules[i].pnumber) / 100;
							}
							break;
						}
					} else {
						// 老数据
						if (price * 1 >= rules[i].chargefee * 1) {
							if (rules[i].pmodel == 0) {
								bonus = rules[i].pnumber;
							} else if (rules[i].pmodel == 1) {
								bonus = Math.round(price * rules[i].pnumber) / 100;
							}
							break;
						}
					}
				}
			}
			return bonus;
		},
		submit:function(pass,setPassword){
			var $tr = this.billMain.$list.find("tr");
			var data = $tr.data("data");
			var cardNo = this.$billNo.val();
			if(!cardNo && !pass && data&&data.khflag=="0"){//1、确认 后 提交
				atMobile.nativeUIWidget.confirm({
					caption: "卡号未输入",
					description: "不输入系统将自动生成会员卡号，确定吗？",
					okCaption: "自动生成",
					cancelCaption: "去输入"
				}, function() {
					self.submit(1);
				}, function() {
					self.$billNo.addClass("error");
				});
				return;
			}else{//自动生成单号之后走的逻辑
				if(!pass && cardNo){//2、验证之后 提交
					this.checkCardIdExists(function(){
						self.submitStaff();
					});
				}else if(pass || data.khflag=="1"){//直接提交
					this.submitStaff();
				}
			}
		},
		saveBill:function(item){
            am.api.hangupSave.exec({
                id:item.id,
                data:item.data,
                memId:item.memId,
                memName:item.memName,
                memPhone:item.memPhone,
                memcardid:item.memcardid,
                parentShopId:am.metadata.userInfo.parentShopId,
				shopId:am.metadata.userInfo.shopId,
				serviceNO:item.serviceNOBak?item.serviceNOBak:(item.serviceNO?item.serviceNO:'')
            }, function(ret){
                am.loading.hide();
                if(ret && ret.code===0){
                    
                } else {
                    am.msg("原单据信息更新失败！");
                }
            });
        },
		submitStaff:function(){
			var cardNo = this.$billNo.val();
			var $tr = this.billMain.$list.find("tr");
			var data = $tr.data("data");
			var user = am.metadata.userInfo;
            var opt = {
                "parentShopId": user.realParentShopId,
                "shopId": user.shopId,
                //"memId": -1,
                //"cardId": -1,
                //"billNo": "",
                "expenseCategory": 2,
                "gender": "F",
                "custSource": 0,
                "comment": "",
                "clientflag":1,
                "otherFlag":0,
                "token":user.mgjtouchtoken,
                "serviceItems": [],
                "cardType": data.cardtype,
                "billingInfo": {
                    "total": 0,
                    "eaFee": 0, //入账金额
					"treatfee": 0,
					"treatpresentfee": 0,
                }
			};
			if(this.billRemark){
                opt.billNo = this.billRemark.serviceNO;
            }
			var $price = $tr.find(".price");
			var price = $price.eq(0).text() * 1;
			var bonus = $price.eq(1).text() * 1;
			var invaliddate= $tr.find(".date").text();

			var cost = $tr.find(".cost").text()*1 || 0;
			opt.billingInfo.total = price;
			opt.billingInfo.presentFee = bonus || 0;
			opt.cost = cost;

			opt.card = {
				"opentype":1, //现金开卡
				"costFee": 0,
				"cardid":cardNo,
				"cardName":data.name,
				"invaliddate":invaliddate==="不限期" ? null:invaliddate.replace(/\//g,"-"),
				"cardtypeid":data.cardtypeid,
				"servers": [],
				"combinedUseFlag": data.combinedUseFlag
			};
			/*if(this.selectedServer){
				opt.card.servers.push({
					"empId": this.selectedServer.id,
					"empName": this.selectedServer.name,
					"empNo": this.selectedServer.no,
					"station":this.selectedServer.pos,
					"pointFlag": 1, // 是否指定 0指定 1非指定
					"dutyid": this.selectedServer.dutyType
				});
			}*/
			opt.card.servers = this.billServerSelector.getEmps();

            opt.billingInfo.eaFee = opt.billingInfo.total;

			var remarkCallback = function(members,response){//备注买单完成回调
                var _data = this.billRemark;
                var sdata = _data.data;
                var sendData = {};
                try{
                    sendData = JSON.parse(sdata);
                }catch(e){}
                if(members){
                    sendData.cid = response.memCardId;
                    sendData.memGender=members.sex;
                    _data.memId  = members.id;
                    _data.memName= members.name;
                    _data.memPhone=members.mobile;
                    _data.memcardid=response.memCardId;
                }
                sendData.billRemark.opencard.isbuy = true;
                _data.data = JSON.stringify(sendData);
                self.saveBill(_data);
            }

			if(this.member){
				// if(this.member.shopId == am.metadata.userInfo.shopId){
					am.crossOpenCardNote.show({
						member: this.member,
						callback: function(){
							opt.memId = self.member.id;
							opt.cardId = self.member.cid;
							opt.gender = self.member.sex;
							/*$.am.changePage(am.page.pay, "slideup", {
								comboitem: [],
								option: opt,
								member: self.member
							});*/
							self.goto(opt,this.member,data.mgj_mustPassword,remarkCallback);
						}
					})
				// }
				// else{
				// 	atMobile.nativeUIWidget.showMessageBox({
                //         title: "非本店会员",
                //         content: '此会员为其它门店会员，将自动为会员创建本店会员档案后继续开卡'
                //     });
				// 	am.page.addMember.submit="createMember";
				// 	am.page.addMember.setData({
				// 		name:this.member.name,
				// 		mobile:this.member.mobile,
				// 		sex:this.member.sex,
				// 		sourceId:3,
				// 		page:this.member.comment
				// 	},function(ret){
				// 		opt.memId = ret.id;
                //         opt.cardId = ret.cid;
                //         opt.gender = ret.sex;
				// 		/*$.am.changePage(am.page.pay, "slideup", {
			    //             comboitem: [],
			    //             option: opt,
			    //             member: ret
			    //         });*/
				// 		self.goto(opt,ret,data.mgj_mustPassword,remarkCallback);
				// 	});
				// }
			}else{
				$.am.changePage(am.page.addMember, "slideup", {
					onSelect:function(member){
						opt.memId = member.id;
		                opt.cardId = member.cid;
						opt.gender = member.sex;
						/*$.am.changePage(am.page.pay, "slideup", {
			                comboitem: [],
			                option: opt,
			                member: member
			            });*/
						self.goto(opt,member,data.mgj_mustPassword,remarkCallback);
					}
	            });
			}
		},
		goto:function (opt,member,mustPassword,remarkCallback) {
			this.ifNeedSetPwd(mustPassword,member,function () {
				$.am.changePage(am.page.pay, "slideup", {
					comboitem: [],
					option: opt,
					member: member,
					billRemark:self.billRemark,
					remarkCallback:remarkCallback,
					from:"memberCard"
				});
			});
		},
		ifNeedSetPwd:function (mustPassword,member,cb) {
			if(mustPassword && !member.passwd){
				am.keyboard.show({
                    title: "必须为此会员设置密码",
                    ciphertext:true,
					submit: function (value) {
						if (value.length>6) {
							am.msg("您输入的6位以内数字密码!");
							return true;
						} else if (value == "") {
							am.msg("请输入密码!");
							return true;
						}
						var opt = {
							passwd:value,
							memId:member.id,
							mobile:member.mobile,
							name:member.name
						};
						am.loading.show("设置密码中,请稍候...");
						am.api.setCardpw.exec(opt, function (res) {
							am.loading.hide();
							console.log(res);
							if (res.code == 0) {
								member.passwd = opt.passwd;
								member.passwdNewSet = 1;
								cb();
							} else {
								am.msg(res.message || "密码设置失败!");
							}
						});
					}
				});
			}else{
				cb();
			}
		}
	});
})();

(function(){
	var crossOpenCardNote = {
		init: function(){
			var _this = this;

			this.$ = $('#crossOpenCardNote');

			this.$.find('.close,.know').vclick(function(){
				_this.hide();
				_this.callback && _this.callback();
			});

			this.$.find('.nomore').vclick(function(){
				localStorage.setItem('crossOpenCardNoteKnown'+amGloble.metadata.userInfo.userId,'true');
				_this.hide();
				_this.callback && _this.callback();
			});

			this.scrollview = new $.am.ScrollView({
				$wrap : _this.$.find('.content'),
				$inner : _this.$.find('.scroller'),
				direction : [false, true],
				hasInput: false
			});

			this.$.find('.tab .item').vclick(function(){
				var index = $(this).index();
				_this.changeTab(index);
			});
		},
		show: function(opt){
			this.member = opt.member;
			this.callback = opt.callback;

			var crossOpenCardNoteKnown = localStorage.getItem('crossOpenCardNoteKnown'+amGloble.metadata.userInfo.userId);
			var crossOpenCardNoteTime = localStorage.getItem('crossOpenCardNoteTime'+amGloble.metadata.userInfo.userId);
			if(this.member.shopId == am.metadata.userInfo.shopId || crossOpenCardNoteTime==new Date().format('yyyy-mm-dd') || crossOpenCardNoteKnown=='true' || new Date().getTime()>new Date('2018-12-25').getTime()){
				this.callback && this.callback();
			}else {
				if(!this.$){
					this.init();
				}
				this.$.show();
				this.changeTab(0);
				localStorage.setItem('crossOpenCardNoteTime'+amGloble.metadata.userInfo.userId,new Date().format('yyyy-mm-dd'));
			}
		},
		hide: function(){
			this.$.hide();
		},
		changeTab: function(index){
			this.$.find('.tab .item').eq(index).addClass('selected').siblings().removeClass('selected');
			this.$.find('.scroller .wrapper').eq(index).show().siblings().hide();
			this.scrollview.refresh();
			this.scrollview.scrollTo('top');
		}
	}
	am.crossOpenCardNote = crossOpenCardNote;
})();

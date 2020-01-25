/*
 * opt.$         page.$
 * opt.th        [{name: "项目"}, {name: "价格",width: "80px",}, {name: "第一工位",width: "120px"}...]
 * opt.onSelect  function(selectedItemData){ }
 * opt.onAddItem function(data,$container){}

 */
window.cashierTools.BillMain = function(opt) {
	this.$parent = opt.$;
	this.$ = opt.$.find(".cashierMain");
	this.settingKey = opt.settingKey;
	this.defaultSetting = opt.defaultSetting;
	this.dispatchSetting = opt.dispatchSetting;
	this.onAddItem = opt.onAddItem;
	this.onSelect = opt.onSelect;
	this.onSubmit = opt.onSubmit;
	this.checkPromise = opt.checkPromise;
	this.onPriceChange = opt.onPriceChange;
	this.checkSpecified = opt.checkSpecified;
	this.outerHeight = opt.outerHeight;
	this.onServerClick = opt.onServerClick;

	this.mainScroll = new $.am.ScrollView({
		$wrap: this.$.find(".body"),
		$inner: this.$.find(".body").children(),
		direction: [true, true],
		hasInput: false,
		bubble: true
	});
	this.changekbtab=opt.changekbtab;
	var th = opt.th;
	var $th = this.mainScroll.$inner.find("thead:first tr").html($('<th></th>').css({"width":"30px"}));
	for(var i = 0;i< th.length;i++){
		$th.append($('<th></th>').css({"width":(th[i].width||"auto")}).text(th[i].name).addClass(th[i].className));
	}

	this.bindEvt();
};
window.cashierTools.BillMain.prototype = {
	bindEvt: function() {
		var _this = this;
		this.$.find(".setting").vclick(function() {
			window.am.cashierSetting.show(_this.getSetting(), function(res) {
				if (res) {
					_this.saveSetting(res);
				}
			});
		});
		this.$.find(".scanToCost .toggle").vclick(function() {
			if($(this).parent().hasClass('on')){
				$(this).parent().removeClass('on');
				localStorage.setItem('scanToCostFlag',0);
				_this.$.find(".comboitem .costFlagOpen").hide();
				_this.$.find(".comboitem .costFlagClose").show();
				_this.$.find(".productCostTd,.oncePerformanceTd").each(function(){
					$(this).hide();
				});
			}else {
				$(this).parent().addClass('on');
				localStorage.setItem('scanToCostFlag',1);
				_this.$.find(".comboitem .costFlagOpen").show();
				_this.$.find(".comboitem .costFlagClose").hide();
				_this.$.find(".productCostTd,.oncePerformanceTd").each(function(){
					$(this).show();
				});
			}
		});
		this.$.find(".submit").vclick(function() {
			var $tr = _this.$list.find("tr");
			// if($tr.length){
				_this.onSubmit && _this.onSubmit();
			// }else{
				// am.msg("没有任何项目，请添加项目！");
			// }
		});

		this.$list = this.$.find("tbody").on("vclick","tr",function(evt,wait){
			if($(this).hasClass("selected")){
				_this.onSelect($(this),wait||0,1);
			}else{
				// $(this).addClass("selected").siblings().removeClass("selected");
				if($(this).parents('.bodyinner').length>0){
					$(this).addClass("selected").parents('.bodyinner').find('tr').not(this).removeClass("selected");
				}else{
					$(this).addClass("selected").siblings().removeClass("selected");
				}
				_this.onSelect($(this),wait||0,0);
			}
		}).on("vclick","div.delete",function(){
			if((!_this.checkPromise ||  (_this.checkPromise && !_this.checkPromise("a33,"))) || amGloble.metadata.shopPropertyField.mgjBillingType==0){
				var $tr = $(this).parents("tr");
				var comboitem = $tr.data('comboitem');
				if(comboitem){
					//comboitem.leavetimes++;
					comboitem.leavetimes != -99 && comboitem.leavetimes++;
				}
				if($tr.hasClass("selected")){
					var $prev = $tr.prev();
					var $next = $tr.next();
					if($prev.length){
						$prev.trigger("vclick");
					}else if($next.length){
						$next.trigger("vclick");
					}else{
						//应该清除员工选择器，暂时不管
					}
				}
				$tr.remove();
				_this.onPriceChange && _this.onPriceChange($tr,"delete");

			}
			return false;
			
		}).on("vclick",".reduce",function(){
			var $val = $(this).next();
			var num = $val.text()*1-1;
			$val.text(Math.round(num*10)/10);
			if(num<=1){
				$(this).addClass("am-disabled");
			}
			_this.onPriceChange && _this.onPriceChange($(this).parents("tr"));
			return false;
		}).on("vclick",".plus",function(){
			var $val = $(this).prev();
			var num = $val.text()*1+1;
			$(this).prev().prev().removeClass("am-disabled");
			$val.text(Math.round(num*10)/10);
			_this.onPriceChange && _this.onPriceChange($(this).parents("tr"));
			return false;
		}).on("vclick",".numberSelect",function(){
			var $this = $(this);
			var timesList = []
			var data = $this.parents('tr').data('data');
			if(data.costConfig){
				var costConfig = JSON.parse(data.costConfig);
			}
			$.each(costConfig,function(i,item){
				if(item.times==0){
					return true;
				}else if (item.times==-99){
					timesList.push({
						name:'不限次',
						data:item.times
					})
				}else{
					timesList.push({
						name:item.times,
						data:item.times
					})
				}
			})
			am.popupMenu("请选择项目次数",timesList, function (times) {
				if(times.data==-99){
					$this.text('不限次');
					$this.parent().parent().addClass('unlimit');
				}else{
					$this.text(times.data);
					$this.parent().parent().removeClass('unlimit');
				}
				_this.onPriceChange && _this.onPriceChange($this.parents("tr"));
			});
		}).on("vclick",".value",function(){
			var $this=$(this);
			console.log($this);
			am.keyboard.show({
				"title":"修改数量",
				"submit":function(value){
					if($this.hasClass("floatNum")){
						if(value>0){
							$this.prev().removeClass("am-disabled");
							$this.text(Math.round(value*10)/10);
							_this.onPriceChange && _this.onPriceChange($this.parents("tr"),$this);
						}else if(value<=1){
							$this.prev().addClass("am-disabled");
							$this.text(Math.round(value*10)/10);
							_this.onPriceChange && _this.onPriceChange($this.parents("tr"),$this);
						}else{
							am.msg('数量必须大于0');
						}
					}else{
						if(value>1){
							$this.prev().removeClass("am-disabled");
							$this.text(Math.round(value));
							_this.onPriceChange && _this.onPriceChange($this.parents("tr"),$this);
						}else if(value==1){
							$this.prev().addClass("am-disabled");
							$this.text(Math.round(value));
							_this.onPriceChange && _this.onPriceChange($this.parents("tr"),$this);
						}else{
							am.msg('数量必须是大于1的整数');
						}
					}
				}
			});
			return false;
		}).on("vclick", ".price", function () {
			var $this = $(this).removeClass("error");
			var data = $this.parents("tr").data('data')
			var opt;
			/*console.log($this.html());
			 console.log(typeof(parseInt($this.html())));*/
			var offset = $this.offset();
			var price = parseFloat($this.html());
			if ($this.hasClass("noDiscount")) {
				price = 0;
			}
			opt = {
				"title": "修改价格",
				"submit": function (value) {
					value = toFloat(value);
					if (value >= 0) {
						if ($this.hasClass("cost")) {
							if (am.metadata.userInfo.operatestr.indexOf("a49") == -1) {
								if (data.costFlag) {
									if (data.groupModifyEnable == 1) {
										var costConfig = JSON.parse(data.costConfig);
										if (costConfig && data.groupSaleFlag == 1) {
											var $times = $this.parent().parent().find(".numberSelect");
										} else {
											var $times = $this.parent().parent().find("div.number .value");
										}
										if (!$times.parent().parent().hasClass("unlimit")) {
											if (costConfig) {
												$.each(costConfig, function (i, item) {
													if (item.times == ($times.text())) {
														if (value < Math.round(item.minPrice / item.times*100)/100) {
															am.msg('亲，已经是最低总价了');
															value = Math.round(item.minPrice / item.times*100)/100
															return false;
														}
													}
												})
											}
										}
									} else {
										am.msg('不允许修改价格');
										return false;
									}
								}
							}
						}
						if ($this.hasClass("totalPrice") && !$this.hasClass("oncePerformance")) {
							var productCost = $this.parents("tr").find(".productCost").text();
							if (am.metadata.userInfo.operatestr.indexOf("a49") == -1) {
								if (data.costFlag) {
									if (data.groupModifyEnable == 1) {
										var costConfig = JSON.parse(data.costConfig);
										if (costConfig && data.groupSaleFlag == 1) {
											var $times = $this.parent().parent().find(".numberSelect");
										} else {
											var $times = $this.parent().parent().find("div.number .value");
										}
										if (!$times.parent().parent().hasClass("unlimit")) {
											if (costConfig) {
												$.each(costConfig, function (i, item) {
													if (item.times == ($times.text())) {
														if (value < item.minPrice) {
															am.msg('亲，已经是最低总价了');
															value = item.minPrice
															return false;
														}
													}
												})
											}
										} else {
											if (costConfig) {
												var lastConfig = costConfig[costConfig.length - 1]
												if (lastConfig.times == -99) {
													if (value < lastConfig.minPrice) {
														am.msg('亲，已经是最低总价了');
														value = lastConfig.minPrice
													}
												} else {
													if (value < productCost) {
														am.msg('总价不能低于产品成本');
														return false;
													}
												}
											}
										}
									}else{
										am.msg('不允许修改价格');
										return false;
									}
									
								}
							}
						}
						if ($this.hasClass("productCost")) {
							var totalPrice = $this.parents("tr").find(".totalPrice").text();
							if (value > totalPrice) {
								am.msg('产品成本不能高于总价');
								return false;
							}
						}
						if ($this.hasClass("oncePerformance") && !$this.hasClass("totalPrice")) {
							var $numberScroller = $this.parents("tr").find(".numberScroller")
							var oncemoney = $this.parents("tr").find(".cost").text();
							if (!$numberScroller.hasClass("unlimit")) {
								if (value > oncemoney) {
									am.msg('单次业绩不能高于单价');
									return false;
								}
							}
						}
						if ($this.hasClass("oncePerformance totalPrice")) {
							var member = am.page.comboCard.member;
							var nowData = am.clone(data);
							if(am.operateArr.indexOf("H2") ==-1 && am.metadata.userInfo.operatestr.indexOf("a49") == -1){
								if (data.modifyEnable==1){
									if(member){
										nowData = am.page.comboCard.changePrice(nowData,member);
										var autoShowPrice = nowData.nowPrice;
										if(autoShowPrice==undefined){
											if(value<data.minPrice){
												am.msg('亲，价格已经不能再低了' );
												value = data.minPrice;
											}
										}else{
											if(autoShowPrice<=data.minPrice){
												var minPrice = autoShowPrice;
											}else{
												var minPrice = data.minPrice;
											}
											if(value<minPrice){
												am.msg('亲，价格已经不能再低了' );
												value = minPrice;
											}
										}
									}else{
										if(value<data.minPrice){
											am.msg('亲，价格已经不能再低了' );
											value = data.minPrice;
										}
									}
								}else{
									am.msg('不允许修改价格');
									return false;
								}
							}
						 }
						if ($this.hasClass("productPrice")) {
							var member = am.page.product.member;
							var productObj = am.page.product.getProductPrice(data,data.price);
							if(productObj.isMemberPrice){
								var autoShowPrice = productObj.price;
							}else if(member && member.buydiscount){
								var autoShowPrice = data.price*member.buydiscount*0.1;
							}else{
								var autoShowPrice = data.price;
							}
							autoShowPrice = Number(autoShowPrice).toFloat();
							if(autoShowPrice<=data.minPrice){
								minPrice = autoShowPrice;
							}else{
								minPrice = data.minPrice;
							}
							if(am.metadata.userInfo.operatestr.indexOf("a49") == -1){
								// 修改区间
								if (data.modifyEnable==1){
									if(value<minPrice){
										am.msg('亲，价格已经不能再低了' );
										value = minPrice;
									}
								}else{
									am.msg('不允许修改价格');
									return false;
								}
							}
						}
						if ($this.hasClass("servicePrice")) {
							var member = am.page.service.member;
							if(data.hasOwnProperty('oPrice')){
								if(data.oPrice == null){
									var autoShowPrice = null;
								}else{
									var autoShowPrice = am.page.service.timeDiscount(data.oPrice,member,data);
								}
							}else{
								if(data.price == null){
									var autoShowPrice = null;
								}else{
									var autoShowPrice = am.page.service.timeDiscount(data.price,member,data);
								}
							}
							
							if(am.metadata.userInfo.operatestr.indexOf("a49") == -1){
								// 修改区间
								if(data.mgjAdjust){
									if(data.modifyEnable==1){
										autoShowPrice = am.page.service.timeDiscount(data.mgjAdjust.price,member,data);
										if(autoShowPrice<=data.mgjAdjust.minPrice){
											var minPrice = autoShowPrice;
										}else{
											var minPrice = data.mgjAdjust.minPrice
										}
										if(value<minPrice){
											am.msg('亲，价格已经不能再低了' );
											value = minPrice;
										}
									}else{
										am.msg('不允许修改价格');
										return false;
									}
								}else{
									if (data.modifyEnable==1){
										if(autoShowPrice!=null && autoShowPrice<=data.minPrice){
											var minPrice = autoShowPrice
										}else{
											var minPrice = data.minPrice
										}
										if(value<minPrice){
											am.msg('亲，价格已经不能再低了' );
											value = minPrice;
										}
									}else{
										am.msg('不允许修改价格');
										return false;
									}
								}
							}
						}
						var autoPrice = $this.data("autoPrice");
						if (autoPrice != value) {
							$this.addClass("modifyed");
							$this.parents("tr").data('data').modifyed = 1;
						} else {
							$this.removeClass("modifyed");
							$this.parents("tr").data('data').modifyed = 0;
						}
						value = toFloat(value);
						$this.text(value);
						if (_this.onPriceChange) _this.onPriceChange($this.parents("tr"), $this);
					} else {
						am.msg('价格输入有误');
					}
				},
				"price": price
			};
			_this.changekbtab && (opt.changekbtab = true);//defaultTab:'price'//会员卡和套餐 有价格的时候 默认显示价格tab

			am.keyboard.show(opt);

			return false;
		}).on("webkitAnimationEnd","tr",function(evt){
			console.log(evt);
			if(evt && evt.originalEvent && (evt.originalEvent.animationName === 'animation_addItem' || evt.originalEvent.animationName === 'animation_addItem1')){
				$(this).removeClass('show').removeClass('show1');
			}
		}).on("vclick","div.server",function(){
			if($(this).parents("tr").hasClass("selected")){//只有点击选中的才响应此事件
				var data = $(this).data('data');
				if(data){
					//$(this).toggleClass("checked");
					_this.onServerClick && _this.onServerClick(data);// 修复js报错
				}
			}
			
			//return false;
		});

		this.$slideArrow = this.$.find(".slideArrow").vclick(function(){
			_this.rise(_this.riseStatus,$(this));
		});

		this.$totalPrice = this.$.find(".totalPrice");

		var start;
		this.$memberInfo = this.$.find('.memberInfo');
		// .bind({
		//     "vtouchstart":function(evt,pos) {
		//         start = pos;
		//         _this.autoCloseMemberInfo();
		//     },
		//     "vtouchmove":function(evt,pos) {
		//         _this.autoCloseMemberInfo();
		//     },
		//     "vtouchend":function(evt,pos) {
		//         _this.autoCloseMemberInfo();
		//     }
		// });
		this.$content=this.$memberInfo.find(".content").bind("webkitAnimationEnd",function(evt){
			//console.log(evt);
			if(evt.originalEvent && evt.originalEvent.animationName == "animation_memberInfoHide"){
				_this.hideMemberInfo();
			}else if(evt.originalEvent && evt.originalEvent.animationName == "animation_memberInfoFadeout"){
				_this.hideMemberInfo();
			}else{
				_this.$close.show();
			}
		});
		this.$close = this.$memberInfo.find(".infoclose").vclick(function(){
			_this.hideMemberInfo(1);
		});
		this.$memberInfo.find(".recharge").vclick(function(){
			var cardtype = am.metadata.cardTypeList.filter(function(a){
				return a.cardtypeid == _this.member.cardTypeId;
			});
			if(cardtype && cardtype[0] && cardtype[0].mgj_stopNoRecharge && cardtype[0].newflag=='0'){
				amGloble.msg('【'+cardtype[0].cardtypename+'】已停止办理，无法继续充值！');
				return false;
			}
			$.am.changePage(am.page.pay, "slideup",{
				action:"recharge",
				from:"recharge",
				member:_this.member
			});
			return false;
		});
		
			
		this.$memberInfo.on('vclick','.base .more',function(){
			// event.stopPropagation();
			var $memberComment=$(this).prev('.comment'),
				originalContentHeight=_this.$content.outerHeight(),
				originalCommentHeight=$memberComment.outerHeight(),$this=$(this);
			if($this.hasClass('on')){
				$memberComment.removeClass('lineText');
				$this.text('收起').removeClass('on');
				var difference=$memberComment.outerHeight()-originalCommentHeight;
				_this.$memberInfo.css({
					'top':-(difference+originalContentHeight+12)+'px',
					'height':difference+originalContentHeight+'px'
				});
			}else{
				$memberComment.addClass('lineText');
				$this.text('更多').addClass('on');
				var difference=$memberComment.outerHeight()-originalCommentHeight;
				_this.$memberInfo.css({
					'top':-(difference+originalContentHeight+12)+'px',
					'height':difference+originalContentHeight+'px'
				});
			}
			return false;
		}).on('vclick','.card .more',function(){
			var $remark_member_box=_this.$memberInfo.find('.remark_member_box'),
				originalContentHeight=_this.$content.outerHeight(),
				originalRemarkHeight=$remark_member_box.outerHeight(),$this=$(this);
			if($this.hasClass('on')){
				$remark_member_box.html(_this.cardComment).removeClass('lineText');
				$this.removeClass('on');
				var difference=$remark_member_box.outerHeight()-originalRemarkHeight;
				_this.$memberInfo.css({
					'top':-(difference+originalContentHeight+12)+'px',
					'height':difference+originalContentHeight+'px'
				});
			}else{
				$remark_member_box.html(_this.subCardComment).addClass('lineText');
				$this.addClass('on');
				var difference=$remark_member_box.outerHeight()-originalRemarkHeight;
				_this.$memberInfo.css({
					'top':-(difference+originalContentHeight+12)+'px',
					'height':difference+originalContentHeight+'px'
				});
			}
			return false;
		});
		this.comboItemScroll = new $.am.ScrollView({
			$wrap: this.$memberInfo.find('.items'),
			$inner: this.$memberInfo.find('.items ul'),
			direction: [false, true],
			hasInput: false,
			bubble:true
        });
    },
    shutDownSubmit:false,
    hideSubmitBtn:function(){
        var config = am.metadata.userInfo.operatestr.indexOf('a39')>-1?1:0;
        console.log(config);
        if(config){
            this.$.find(".submit").hide();
            this.$memberInfo.find('.recharge').hide();
            this.shutDownSubmit = true;
        }
	},
	dispatchSettingSelf:function(){
		if(this.setting){
			for(var i=1;i<=3;i++){
				if(this.setting["setting_server"+i]){
					this.$.find(".pos"+(i-1)).show();
				}else{
					this.$.find(".pos"+(i-1)).hide();
				}
			}
		}
		var h = window.innerHeight- this.$parent.find(".cashierItems").outerHeight() - 23 - (this.outerHeight||0);
		if(this.$parent.find(".cashierTab").length){
			h-= 45;
		}
		if(this.$parent.find(".cashierFilter").length){
			h-= 40;
		}
		if(device.platform == "iOS"){
			h-=20;
		}
		var nw = this.$.next().is(":visible")? this.$.next().width() : -10;
		var w = this.$.parent().css("height",h+"px").width() - nw - 10;
		console.log(w);
		this.$.css("width",w+"px");
	},
	setEmpsByFirst:function($tr){
		var $firstTr = this.$list.children('tr').eq(0);
		if($firstTr){
			var emps = $firstTr.find('.server').data('data');
			if(emps && emps.length){
				var empsNext = am.clone(emps);
				$.each(empsNext,function(index,emp){
					if(emp.perf>0){
						// 只复制比例 不复制值
						emp.perf=0;
					}
				});
				if(empsNext && empsNext.length){
					this.setEmps(empsNext,$tr,"isSeller");
				}
			}
		}
	},
	addItem: function(data,isAutoFill,comboItem,isNewAdded) {
		var $tr = this.onAddItem(data,this.$list,isAutoFill,comboItem,isNewAdded);
		this.onPriceChange && this.onPriceChange($tr);
		this.rise();
		if(isNewAdded){
			this.setEmpsByFirst($tr)
		}
		return $tr;
	},
	rise:function(down){
		if(down){
			this.$.css({"height":"100%"});
			this.riseStatus = 0;
			this.$slideArrow.removeClass("down");
		}else{
			var h = this.mainScroll.$inner.height()-this.mainScroll.$wrap.height();
			if(h > 0){
				var th=this.$.height()+h;
				if(th > window.innerHeight - 100){
					th = window.innerHeight - 100;
				}
				this.$.css({"height":th+"px"});
				this.riseStatus = 1;
				this.$slideArrow.addClass("down");
			}else{
				this.$.css({"height":"100%"});
				this.riseStatus = 0;
				this.$slideArrow.removeClass("down");
			}
		}
		var _this=this;
		this.riseTimer && clearTimeout(this.riseTimer);
		this.riseTimer = setTimeout(function(){
			_this.mainScroll.scrollTo("top");
			_this.mainScroll.refresh();
		},320);
	},
	setEmps:function(emps,$tr,showSeller){
		if(!$tr) $tr = this.$list.find("tr.selected");
		var $server = $tr.find(".server");
		if(showSeller){
			console.log('emps------',emps);
			if(emps && emps.length){
				$server.text(emps[0].empName).data("data",emps);
				if (emps.length > 1) {
					$server.append('<span class="after">'+emps.length+'</span>').addClass('muti');
				}else{
					$server.removeClass('muti');
				}
			}else{
				$server.text('').removeData("data").removeClass('muti');
			}
			console.log($server.data("data"));
		}else{
			var pos = [];
			for(var i=0;i<emps.length;i++){
				var idx = emps[i].station;
				if(!pos[idx]){
					pos[idx] = [];
				}
				pos[idx].push(emps[i]);
			}
			for(var i=0;i<$server.length;i++){
				if(pos[i] && pos[i].length){
					/*emps.push({
					 "empId": emp.id,
					 "empName": emp.name,
					 "empNo": emp.no,
					 "station":emp.pos,
					 "pointFlag": 1,
					 "dutyid": emp.dutyType,
					 "perf":toFloat(totalPerf*$this.find('.perfNum').text()/100 || 0),
					 "per":$this.find('.perfNum').text()
					 });*/
					$server.eq(i).text(pos[i][0].empName).data("data",pos[i]).addClass("show");
					if(pos[i].length>1){
						$server.eq(i).append('<span class="after">'+pos[i].length+'</span>').addClass('muti');
					}else{
						$server.eq(i).removeClass('muti');
					}
					if(pos[i][0].pointFlag){
						$server.eq(i).addClass('checked');
					}else{
						$server.eq(i).removeClass('checked');
					}
				}else{
					$server.eq(i).text('').removeData("data").removeClass('checked').removeClass('muti');
				}
			}
		}
	},
	addServer: function(data,$newtr,specified) {
		var $tr = $newtr || this.$list.find("tr.selected");
		// if($tr.length){
			var $server = $tr.find(".server").eq(data.pos);
			$server.text(data.name).data("data",data).addClass("show");
			if(typeof(specified) == 'boolean'){
				if(specified){
					$server.addClass('checked');
				}else{
					$server.removeClass('checked');
				}
			}else{
				var setting = this.getSetting();
				if(setting && setting.setting_server_checked==1){
					$server.addClass('checked');
				}
			}

			this.showServerAniTimer && clearTimeout(this.showServerAniTimer);
			this.showServerAniTimer = setTimeout(function(){
				$server.removeClass("show");
			},250);
		// }else{
			// am.msg("没有任何项目，请添加项目！");
			// return 1;
		// }
	},
	removeServer: function(data,$newtr,specified){
		var $tr = $newtr || this.$list.find("tr.selected");
		// if($tr.length){
			var $server = $tr.find(".server").eq(data.pos);
			$server.text('').removeData("data").addClass("show");
			$server.removeClass('checked');

			this.showServerAniTimer && clearTimeout(this.showServerAniTimer);
			this.showServerAniTimer = setTimeout(function(){
				$server.removeClass("show");
			},250);
		// }else{
			am.msg("没有任何项目，请添加项目！");
			return 1;
		// }
	},
	clear: function(){
		this.$list.empty();
	},
	reset: function(keepList) {
		if(!keepList){
			this.clear();
			this.dispatchSetting && this.dispatchSetting(this.getSetting());
		}
		this.dispatchSettingSelf();
		console.log("BillMain reset");
        this.hideSubmitBtn();
		this.$totalPrice.text("￥"+0);
		this.mainScroll.refresh();
	},
	getSetting: function() {
		if (this.setting) {
			return this.setting;
		} else {
			var localSetting = localStorage.getItem(this.settingKey);
			if (localSetting) {
				try {
					localSetting = JSON.parse(localSetting);
				} catch (e) {
					localSetting = null;
				}
			}
			if (localSetting) {
				for(var j=0;j< this.defaultSetting.length;j++){
					var add = true;
					for(var i = 0;i< localSetting.length;i++){
						if(this.defaultSetting[j].key === localSetting[i].key){
							add = false;
							break;
						}
					}
					if(add){
						localSetting.push(this.defaultSetting[j]);
					}
				}

				this.setting = localSetting;
				this.processSetting();
				return localSetting;
			} else {
				this.setting = this.defaultSetting;
				this.processSetting();
				return this.defaultSetting;
			}
		}
	},
	saveSetting: function(res) {
		this.setting = res;
		if (res && typeof(res) == "object") {
			localStorage.setItem(this.settingKey, JSON.stringify(res));
		}
		this.processSetting();

		this.dispatchSetting && this.dispatchSetting(this.setting);
		this.dispatchSettingSelf();
	},
	processSetting: function() {
		var s = this.setting;
		if(s){
			for (var i = 0; i < s.length; i++) {
				s[s[i].key] = s[i].flag;
			}
		}else{
			this.setting = {};
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
		// this.$memberInfo.find('.tel').text(member.mobile);
		if(am.operateArr.indexOf("MGJP") !=-1){// 敏感权限 //手机号隐藏中间四位
			this.$memberInfo.find('.tel').text(am.processPhone(member.mobile));
		}else{
			this.$memberInfo.find('.tel').text(member.mobile);
		}
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
			this.$memberInfo.find('.comment').text('');
		}
		// this.$memberInfo.find('.comment').text(member.comment || "");
		this.$memberInfo.find('.name').text(member.cardName);
		this.$memberInfo.find('.cardNo').text(member.cardNo);
		this.$memberInfo.find('.card_R').html("");
		this.$memberInfo.find('.package_R').html("");
		// 卡类购买
		if(member.cardComment) {
			var $cardRemark=this.$memberInfo.find('.card_R').addClass('remark_member_box lineText ');
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
			this.$memberInfo.find('.card_R').removeClass("remark_member_box").html('');
		}
		// 套餐购买
		if(member.cardComment) {
			var $packageRemark=this.$memberInfo.find('.package_R').addClass('remark_member_box lineText ');
			if(member.cardComment.length>21){
				this.packageComment=member.cardComment+'<span class="more am-clickable">收起</span>';
				this.subPackageComment=member.cardComment.substr(0,21)+'<span class="more on am-clickable">更多</span>';
				if($packageRemark.hasClass('lineText')){
					$packageRemark.html(this.subPackageComment);
				}else{
					$packageRemark.html(this.packageComment);
				}
			}else{
				$packageRemark.html(member.cardComment);
			}
		}else{
			this.$memberInfo.find('.package_R').removeClass("remark_member_box").html('');
		}
		
		/* if(member.cardComment) {
			// this.$memberInfo.find('.card_R').html(member.cardComment);
			// this.$memberInfo.find('.card_R').addClass("remark_member_box");
			this.$memberInfo.find('.package_R').html(member.cardComment);
			this.$memberInfo.find('.package_R').addClass("remark_member_box");
		}else if(!member.cardComment){
			// this.$memberInfo.find('.card_R').removeClass("remark_member_box");
			this.$memberInfo.find('.package_R').removeClass("remark_member_box");
		} */
		
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
		// 退卡中不显示充值
		if (member.status == 1) {
			this.$memberInfo.find('.recharge').hide();
		} else {
			this.$memberInfo.find('.recharge').show();
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
				$li.append('<div class="itemName">'+ (item.treattype==1 || item.treattype == 2?'<span class="highlight">[赠] </span>':'')+item.itemname+'</div>');
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


		this.$memberInfo.show().removeClass('hide');
		var th = this.$memberInfo.find('.content').outerHeight();
		this.$memberInfo.css({
			top:(-th-12)+"px",
			height:th+"px"
		}).addClass("show");

		this.comboItemScroll.refresh();
		this.comboItemScroll.scrollTo("top");
		//this.autoCloseMemberInfo();
	},
	// autoCloseMemberInfo:function(){
	//     this.$memberInfo.removeClass('fadeout');
	//     this.memberInfoTimer && clearTimeout(this.memberInfoTimer);
	//     var _this = this;
	//     this.memberInfoTimer = setTimeout(function(){
	//         _this.$memberInfo.removeClass("show").addClass('fadeout');
	//     },5000);
	// },
	hideMemberInfo:function(ani){
		this.$close.hide();
		if(ani){
			this.$memberInfo.removeClass("show").removeClass('fadeout').addClass("hide");
		}else{
			this.memberInfoTimer && clearTimeout(this.memberInfoTimer);
			this.$memberInfo.hide().css({
				height:0
			}).removeClass('fadeout').removeClass('show').removeClass('hide');
		}
	}
};
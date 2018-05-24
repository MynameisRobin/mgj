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
		direction: [false, true],
		hasInput: false
	});
	this.changekbtab=opt.changekbtab;
	var th = opt.th;
	var $th = this.mainScroll.$inner.find("thead:first tr").html($('<th></th>').css({"width":"40px"}));
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

		this.$.find(".submit").vclick(function() {
			var $tr = _this.$list.find("tr");
			if($tr.length){
				_this.onSubmit && _this.onSubmit();
			}else{
				am.msg("没有任何项目，请添加项目！");
			}
		});

		this.$list = this.$.find("tbody").on("vclick","tr",function(evt,wait){
			if($(this).hasClass("selected")){
				_this.onSelect($(this),wait||0,1);
			}else{
				$(this).addClass("selected").siblings().removeClass("selected");
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
						$prev.trigger("vclick");
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
		}).on("vclick",".price",function(){
			if((!_this.checkPromise ||  (_this.checkPromise && !_this.checkPromise("a34,"))) || amGloble.metadata.shopPropertyField.mgjBillingType==0){
				var $this=$(this).removeClass("error");
				/*console.log($this.html());
				 console.log(typeof(parseInt($this.html())));*/
				var offset = $this.offset();
				var price = parseInt($this.html());
				if($this.hasClass("noDiscount")){
					price = 0;
				}
				var opt={
					"title":"修改价格",
					"submit":function(value){
						value = toFloat(value);
						if(value>=0){
							var autoPrice = $this.data("autoPrice");
							if(autoPrice!=value){
								$this.addClass("modifyed");
							}else{
								$this.removeClass("modifyed");
							}
							$this.text(value);
							if(_this.onPriceChange) _this.onPriceChange($this.parents("tr"),$this);
						}else{
							am.msg('价格输入有误');
						}
					},
					"price":price
				};
				_this.changekbtab && (opt.changekbtab=true);//defaultTab:'price'//会员卡和套餐 有价格的时候 默认显示价格tab

				am.keyboard.show(opt);
			}
			
			return false;
		}).on("webkitAnimationEnd","tr",function(){
			$(this).removeClass('show').removeClass('show1');
		}).on("vclick","div.server",function(){
			if($(this).parents("tr").hasClass("selected")){//只有点击选中的才响应此事件
				var data = $(this).data('data');
				if(data){
					//$(this).toggleClass("checked");
					_this.onServerClick(data);
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
		this.$memberInfo.find(".content").bind("webkitAnimationEnd",function(evt){
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
				member:_this.member
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
	addItem: function(data,isAutoFill,comboItem) {
		var $tr = this.onAddItem(data,this.$list,isAutoFill,comboItem);
		this.onPriceChange && this.onPriceChange($tr);
		this.rise();
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
	setEmps:function(emps,$tr){
		if(!$tr) $tr = this.$list.find("tr.selected");
		var $server = $tr.find(".server");
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
	},
	addServer: function(data,$newtr,specified) {
		var $tr = $newtr || this.$list.find("tr.selected");
		if($tr.length){
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
		}else{
			am.msg("没有任何项目，请添加项目！");
			return 1;
		}
	},
	removeServer: function(data,$newtr,specified){
		var $tr = $newtr || this.$list.find("tr.selected");
		if($tr.length){
			var $server = $tr.find(".server").eq(data.pos);
			$server.text('').removeData("data").addClass("show");
			$server.removeClass('checked');

			this.showServerAniTimer && clearTimeout(this.showServerAniTimer);
			this.showServerAniTimer = setTimeout(function(){
				$server.removeClass("show");
			},250);
		}else{
			am.msg("没有任何项目，请添加项目！");
			return 1;
		}
	},
	reset: function(keepList) {
		if(!keepList){
			this.$list.empty();
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
		if(member.cardtype==1 && (member.timeflag==0 || member.timeflag==2) && !this.shutDownSubmit){
			this.$memberInfo.find('.recharge').show();
		}else{
			this.$memberInfo.find('.recharge').hide();
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
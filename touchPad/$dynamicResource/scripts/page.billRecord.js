// userType 平台类别 0-总部平台;1-单店平台;2-直属分店;3-附属分店
(function() {
	$.am.selectEmployee={
		init:function(){
			var self=this;
			this.$=$("#selectEmployee");
			this.$level=this.$.find(".openList .level");
			this.$li=this.$level.children("li:first");
			this.$openList=this.$.find(".openList");
			this.$employeeValue=this.$.find(".employeeValue");
			this.$typeValue=this.$.find(".typeValue");
			this.$performanceValue=this.$.find(".performanceValue");
			this.$commonselectBox=this.$.find(".commonselectBox");
			this.$title=this.$.find(".header .words");
			this.$selecteBox=this.$.find(".selecteBox");

			//业绩相关box
			this.$achievementbox = this.$.find(".achievementbox");
			//提成相关box
			this.$commissionbox = this.$.find(".commissionbox");
			//总业绩
			this.$totalperformance = this.$.find(".totalperformance");
			//卡扣业绩
			this.$cardbuckleperformance = this.$.find(".cardbuckleperformance");
			//现金业绩
			this.$cashearnings = this.$.find(".cashearnings");
			//其他业绩
			this.$otherresults = this.$.find(".otherresults");
			//提成
			this.$commission = this.$.find(".commission");
			//指定非指定
			this.$source = this.$.find(".source");
			this.$changebox = this.$.find(".changebox");

			this.ScrollView= new $.am.ScrollView({
			    $wrap : this.$.find(".openList>.body"),
			    $inner : this.$.find(".openList .body ul"),
			    direction : [false, true],
			    hasInput: false
			});
			this.ScrollView.refresh();
			this.$.find(".selecte").on("vclick",function(e){
				e.stopPropagation();
				self.$openList.removeClass('hide');
				self.ScrollView.refresh();
				self.ScrollView.scrollTo("top");
			});
			this.$.on("vclick",function(){
				self.$openList.addClass('hide');
			});

  			this.$openList.on("vclick",".levelList li",function(e){
				e.stopPropagation();
				var item=$(this).data("item");
				console.log(item);
				var sendMessage=self.sendMessage || {};
				sendMessage.itemid=(self.showtype==1?item.itemid:item.id);
				sendMessage.newName=item.name;
				if(self.showtype=="2"){
					sendMessage.newEmployeeNo=item.no;
					sendMessage.newEmployeeDutyName=item.dutyName;
					sendMessage.newEmployeeName=item.name;
				}
				if(self.showtype==3){
					// var itemId = self.currentBillItem.id;
					// var itemEmpList = [];
					// for(var i=0;i<self.currentBill.empList.length;i++){
					// 	if(self.currentBill.empList[i].detailId==itemId){
					// 		itemEmpList.push(self.currentBill.empList[i]);
					// 	}
					// }
					// if(itemEmpList.length){
					// 	for(var i=0;i<itemEmpList.length;i++){
					// 		if(item.no==itemEmpList[i].empNo){
					// 			self.$openList.addClass('hide');
					// 			am.msg("该员工已分配业绩，请添加其他员工");
					// 			return;
					// 		}
					// 	}
					// }
					if(self.currentBill.type == 0){						
						self.addAchievementVal(item);
					}
				}
				if(self.showtype==4){
					sendMessage.newVal = item.code;
				}
				console.log(sendMessage)
				self.$employeeValue.val(item.textName).data("value",sendMessage);
				self.$openList.addClass('hide');
				
  			});
  			this.$.find(".close,.mask").on("vclick",function(){
  				self.hide();
  				self.empFeeLi = null;
  				self.empFeeSel = null;
  			});

  			this.$.find(".btngroup").on("vclick",".btnOk",function(){
  				var value=self.getValue();
  				//if(!value) return;
  				// self.check(value)
  				if( !self.check(value) ) return;
  				self.hide();
  				self.callback && self.callback(value);
  				self.empFeeLi = null;
  				self.empFeeSel = null;
  			}).on("vclick",".cancel",function(){
  				self.cancel && self.cancel();
  				self.hide();
  				self.empFeeLi = null;
  				self.empFeeSel = null;
  			});

  			//修改 卡扣业绩，现金业绩，其他业绩 时，联动总业绩
  			$('#selectEmployee').on('vclick','.cardbuckleperformance,.cashearnings,.otherresults',function(){
  				var _this = $(this);
  				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
				    	_this.val(value);

				    	if(self.$cardbuckleperformance.val() == ''){
				    		self.$cardbuckleperformance.val(0);
				    	}
				    	if(self.$cashearnings.val() == ''){
				    		self.$cashearnings.val(0);
				    	}
				    	if(self.$otherresults.val() == ''){
				    		self.$otherresults.val(0);
				    	}

				    	var _totalperformance = (self.$cardbuckleperformance.val()-0) + (self.$cashearnings.val()-0) + (self.$otherresults.val()-0);
				    	self.$totalperformance.val(_totalperformance.toFixed(2));
				    }
				});
  			});
  			//修改 总业绩 时，联动 卡扣业绩，现金业绩，其他业绩
  			this.$totalperformance.vclick(function(){
  				var _this = $(this);
  				if(_this.val() == '0' || _this.val() == ''){
  					var oldval = 0;
  				}else{
  					var oldval = _this.val();
  				}
  				console.log('之前的值:' + oldval);
  				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
				    	var newval = value;
				    	_this.val(newval);
				    	console.log('之后的值:' + newval);

			    		if(oldval == 0){	//分母为零时
			    			if(self.currentBill.type==1){
			    				self.$cardbuckleperformance.val( '' );
			  					self.$cashearnings.val( '' );
			  					self.$otherresults.val( '' );
			    			}else {
			    				self.$cardbuckleperformance.val(0);
			  					self.$cashearnings.val(0);
			  					self.$otherresults.val(newval);
			    			}
		  				}else{
		  					self.$cardbuckleperformance.val( (self.$cardbuckleperformance.val()/oldval*newval).toFixed(2) );
			  				self.$cashearnings.val( (self.$cashearnings.val()/oldval*newval).toFixed(2) );
			  				self.$otherresults.val( (self.$otherresults.val()/oldval*newval).toFixed(2) );
		  				}
				    }
				});
  			});

  			//提成
  			this.$commission.vclick(function(){
  				var _this = $(this);
  				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
				    	_this.val(value);
				    }
				});
  			});

  			//指定非指定
  			this.$changebox.vclick(function(){
				if(amGloble.operateArr.indexOf('a1')==-1){
					$(this).addClass('selected').siblings('.changebox').removeClass('selected');
				}else {
					if(amGloble.metadata.userInfo.mgjVersion==1){
						return;
					}
					if(!amGloble.metadata.shopPropertyField.authorizationCard){
						am.msg('没有权限操作或没有设置授权卡');
						return;
					}
					var _box = $(this);
					am.auth.show({
						anthSuccess:function(){
							_box.addClass('selected').siblings('.changebox').removeClass('selected');
						}
					});
				}
  			});
		},
		setValue:function(type,id){

		},
		check:function(value){
			var self = this;
			var _btn = this.btn;
			var _commissionType = this.commissionType;

			if(_btn){//需要验证业绩和提成相关
				if(self.$employeeValue.val() == '请选择'){
					am.msg("请选择员工！");
					return false;
				}
				
				if(am.operateArr.indexOf('MGJZ8')<0){
					if(self.currentBill.type == 0 || self.currentBill.type == 4 || (self.currentBill.type == 6 && self.currentBill.consumeType != 6)){
						var maxFee = this.currentBillItem.itemPrice>=this.currentBillItem.price?this.currentBillItem.itemPrice:this.currentBillItem.price;
						console.log(this.empFeeSel);
						if((this.empFeeLi && !this.empFeeSel && this.empFeeLi.fee!=value.fee && value.fee>maxFee) || 
							(!this.empFeeLi && this.empFeeSel && this.empFeeSel.fee!=value.fee && value.fee>maxFee) ||
							(!this.empFeeLi && !this.empFeeSel && value.fee>maxFee)){
							am.msg('员工业绩不可超过项目总业绩：'+maxFee.toFixed(2)+'，当前业绩总和为：'+Number(value.fee).toFixed(2)+'，请调整后保存。');
							return false;
						}
					}else {
						var currentFee = 0;
						for(var i=0;i<self.currentBill.empList.length;i++){
							console.log(self.currentBill.empList[i].fee*1)
							currentFee += self.currentBill.empList[i].fee*1;
						}
						if(self.empFeeLi){
							currentFee -= self.empFeeLi.fee;
						}
						currentFee += value.fee*1;
						var result;
						if(self.currentBill.type==2 && !self.currentBill.detailList.length && self.currentBill.cardList.length && self.currentBill.cardList[0].cardType==2){
							result = self.billFee;
						}else {
							result = self.billFee - self.getCost(self.currentBill);
						}
						if(currentFee>result){
							if(!self.empFeeLi || self.empFeeLi.fee!=value.fee){
								am.msg('员工业绩之和不可超过总业绩：'+Number(result).toFixed(2)+'，当前业绩总和为：'+currentFee.toFixed(2)+'，请调整后保存。');
								return false;
							}
						}
					}
				}
				if(self.currentBill.type==1){
					if(self.$totalperformance.val()!=0 && !self.$cardbuckleperformance.val() && !self.$cashearnings.val() && !self.$otherresults.val()){
						am.msg("请输入业绩详情！");
						return false;
					}
				}
				
				if(_commissionType == 0 || _commissionType == 4){	//验证指定非指定
					if( self.$source.find('.changesource > .selected').length == 0 ){
						am.msg("请指定非指定！");
						return false;
					}
				}
			}

			return true;
		},
		show:function(tit,type,item,callback,btn,cancel){// type 1 render项目  2 render员工
			this.$title.text(tit || "修改");
			if(type==1){//项目
				this.fillProject(item);
			}else if(type==2){//员工
				this.fillEmployee(item);
			}else if(type==3){	//添加员工
				this.fillEmployee2(item);
			}else if(type==4){
				this.fillDepartment(item);
			}

			this.btn = btn;
			this.commissionType = item.commissionType;
			if(btn){//需要显示业绩和提成相关DOM
				if(type == 2){	//btn:true,type:2时为编辑业绩提成,需隐藏员工select
					this.$selecteBox.hide();
				}else{
					this.$selecteBox.show();
				}

				this.$achievementbox.show();
				this.setAchievementVal(item);	//给业绩赋值

				//var bills = am.page.billRecord.$listData;
				// this.currentBill = {}; //获取当前编辑单据
				// for(var i=0;i<bills.length;i++){
				// 	if(item.billId == bills[i].id){
				// 		this.currentBill = bills[i];
				// 	}
				// }
				this.currentBill = am.page.billRecord.$tablebody.find('tr[billid='+item.billId+']').data('item') || {};

				this.currentBillItem = {}; //获取当前编辑单据中的编辑项目
				for(var i=0;i<this.currentBill.detailList.length;i++){
					if(item.itemNo == this.currentBill.detailList[i].itemNo){
						this.currentBillItem = this.currentBill.detailList[i];
					}
				}
				console.log(this.currentBill)
				console.log(this.currentBillItem)
				if(item.commissionType == 0 || item.commissionType == 4  || item.commissionType == 6){	//隐藏提成输入框
					if(amGloble.metadata.shopPropertyField.handinto==1){
						this.$commissionbox.show();
						this.setCommissionVal(item);
					}else {
						this.$commissionbox.hide();
					}
					this.$source.show();	//显示指定非指定(和提成互斥)
					this.setSourceVal(item);	//给指定非指定赋值
				}else{	//显示提成输入框
					this.$commissionbox.show();
					this.setCommissionVal(item);	//给提成赋值
					this.$source.hide();	//隐藏指定非指定(和提成互斥)
				}
			}else{	//以前的逻辑
				this.$achievementbox.hide();
				this.$commissionbox.hide();
				this.$source.hide();
				this.$selecteBox.show();
			}

			this.showtype=type;
			this.$.show();
			this.callback=callback || function(){};
			this.cancel=cancel || function(){};

			if(am.operateArr.indexOf("a1") != -1){
				// this.$source.hide();
			}
		},
		setAchievementVal:function(item){
			this.$totalperformance.val(item.fee);
			this.$cardbuckleperformance.val(item.cardfee);
			this.$cashearnings.val(item.cashfee);
			this.$otherresults.val(item.otherfee);
		},
		addAchievementVal:function(selectEmp){
			console.log(selectEmp);
			console.log(this.currentBill);

			var paid = {};
			paid.debtfee = this.currentBill.debtFee;
			if(this.currentBill.cashList && this.currentBill.cashList.length){
				var _cashList = this.currentBill.cashList[0];
				paid.cooperation = _cashList.cooperation;
				paid.coupon = _cashList.coupon;
				paid.dianpin = _cashList.dianpin;
				paid.luckymoney = _cashList.luckymoney;
				paid.mall = _cashList.mall;
				paid.otherfee1 = _cashList.otherfee1;
				paid.otherfee2 = _cashList.otherfee2;
				paid.otherfee3 = _cashList.otherfee3;
				paid.otherfee4 = _cashList.otherfee4;
				paid.otherfee5 = _cashList.otherfee5;
				paid.otherfee6 = _cashList.otherfee6;
				paid.otherfee7 = _cashList.otherfee7;
				paid.otherfee8 = _cashList.otherfee8;
				paid.otherfee9 = _cashList.otherfee9;
				paid.otherfee10 = _cashList.otherfee10;
				paid.pay = _cashList.pay;
				paid.deductpoint = _cashList.pointfee;
				paid.unionpay = _cashList.unionPay;
				paid.voucherfee = _cashList.voucherFee;
				paid.weixin = _cashList.weixin;
				paid.cash = _cashList.cash;
				paid.mdfee = _cashList.mdFee;
			}
			if(this.currentBill.cardList && this.currentBill.cardList.length){
				var _cardList = this.currentBill.cardList[0];
				paid.cardfee = _cardList.cardFee + _cardList.treatFee;
				paid.dividefee = _cardList.divideFee;
				paid.presentfee = _cardList.presentFee +  _cardList.treatPresentFee;
			}

			
			var card = null;
			if(this.currentBill.cardList && this.currentBill.cardList.length){
				card = {
                    cardtypeid:this.currentBill.cardList[0].cardTypeId,
    			    discount:this.currentBill.discount || 10,//折扣
                    treatcardfee:this.currentBill.cardList[0].treatFee ||0,
                    treatpresentfee:this.currentBill.cardList[0].treatPresentFee||0
                };
			}

			var itemList = [];

			for(var i=0;i<this.currentBill.detailList.length;i++){
				var data = this.currentBill.detailList[i];
				var item = {
					itemid: data.itemNo,
				 	consumetype: (this.currentBill.cardList.length && this.currentBill.cardList[0].cardType==1) ? 1:2,
                    consumemode:this.getConsumType(data.consumeType),
					price: data.price,
					cost: data.itemPrice,
					empList: []
				}
				if(data.consumeType==4){
					item.price = data.itemPrice;
				}
				for(var j=0;j<this.currentBill.empList.length;j++){
					var emp = this.currentBill.empList[j];
					if(data.id == emp.detailId){
						var empItem = {
							no: emp.empNo,
							dutytype: this.getDutyIdByNo(emp.empNo).dutyType,
							dutyid: this.getDutyIdByNo(emp.empNo).dutyid
						}
						item.empList.push(empItem);
					}
				}
				itemList.push(item);
			}

			var index = 0;

			for(var i=0;i<itemList.length;i++){
				if(this.currentBillItem.itemNo==itemList[i].itemid){
					index = i;
					var empItem = {
						no: selectEmp.no,
						dutytype: selectEmp.dutyType,
						dutyid: selectEmp.dutyid
					}
					itemList[i].empList.push(empItem);
				}
			}

			var opt = {
				paid:paid,
				card:card,
				itemList:itemList
			}

			console.log(opt)
			var data = computingPerformance.computing(opt);
			console.log(data);
			if(!data.length){
				return;
			}
			var result = data[index].empper;
			var total = result[result.length-1].total;
			this.$totalperformance.val(result[result.length-1].pre);
			this.$cardbuckleperformance.val(total.cardfee);
			this.$cashearnings.val(total.cashfee);
			this.$otherresults.val(total.otherfee);

			this.empFeeSel = {
				fee: result[result.length-1].pre,
				card: total.cardfee,
				cashfee: total.cashfee,
				otherfee: total.otherfee
			}
		},
		getDutyIdByNo:function(no){
			for(var i=0;i<am.metadata.employeeList.length;i++){
				if(no==am.metadata.employeeList[i].no){
					return am.metadata.employeeList[i];
				}
			}
		},
		getConsumType:function(no){
			if(no==2){
				no = 3;
			}else if(no==3){
				no = 2;
			}
			return no;
		},
		setCommissionVal:function(item){
			this.$commission.val(item.gain);
		},
		setSourceVal:function(item){
			var _pointFlag = item.pointFlag;
			if(_pointFlag == 0){
				var _index = 1;
			}else if(_pointFlag == 1){
				var _index = 0;
			}
			this.$changebox.eq(_index).addClass('selected').siblings('.changebox').removeClass('selected');
		},
		hide:function(){
			this.$.hide();
		},
		getValue:function(){
			var self=this;
			var value=self.$employeeValue.data("value");

			if(this.btn){	//需要业绩
				value.fee = this.$totalperformance.val();	//总业绩
				value.cardfee = this.$cardbuckleperformance.val();	//卡扣业绩
				value.cashfee = this.$cashearnings.val();	//现金业绩
				value.otherfee = this.$otherresults.val();	//其他业绩

				if(this.commissionType == 0 || this.commissionType == 4){	//需要指定非指定值
					value.pointFlag = this.$source.find('.changebox.selected .change_words').data('val');
					if(amGloble.metadata.shopPropertyField.handinto==1){
						value.gain = this.$commission.val();
					}
				}else{	//需要提成
					value.gain = this.$commission.val();	//提成
				}
			}

			return value;
		},
		changeTips:function(index,tips){
			this.$commonselectBox.eq(index).find(".tips").text(tips);
		},
		setStartData:function(){
			this.$commonselectBox.eq(0).find(".tips");
		},
		getEmployeeById:function(id){
			var employeeList=am.metadata.employeeList;
			var res=$.grep(employeeList,function(item) {
				return item.dutyid==id;
			});
			return res;
		},
		fillEmployee:function(data){
			var self=this;
			var employeeLevels=am.metadata.employeeLevels;
			if(employeeLevels && employeeLevels.length){
				this.$level.empty();
				for(var i=0;i<employeeLevels.length;i++){
					var item=employeeLevels[i];
					var $li=this.$li.clone(true,true);
					var $levelLi=$li.find("ul li:first");
					var employee=self.getEmployeeById(item.dutyId);
					$li.find("span").text(item.name);
					$li.find("ul").empty();
					if(employee && employee.length){
						for(var j=0;j<employee.length;j++){
							var levelLi=$levelLi.clone(true,true);
							employee[j].textName=employee[j].no+"号 "+employee[j].name;
							levelLi.text(employee[j].textName);
							levelLi.data("item",employee[j]);
							$li.find("ul").append(levelLi);
						}
					}else{
						continue;
					}

					this.$level.append($li);
				}
				this.ScrollView.refresh();
				self.ScrollView.scrollTo("top");

			}
			console.log(data);
			this.sendMessage={
				name:data.empName,
				itemid:data.empId,
				billId:data.billId,
				billType:data.billtype,
				subId:data.id,
				billNo:data.billNo,
				oldVal:data.empId,
				operator:data.operatorId,
				itemNo:data.itemNo,
				itemName:data.itemName,
				oldEmployeeNo:data.empNo,
				oldEmployeeDutyName:data.dutyTypeName,
				oldEmployeeName:data.empName,
				newEmployeeNo:data.empNo,
				newEmployeeDutyName:data.dutyTypeName,
				newEmployeeName:data.empName
			};
			var textName=data.empNo+"号 "+data.empName;
			self.$employeeValue.val(textName).data("value",this.sendMessage);

		},
		fillEmployee2:function(data){
			var self=this;
			self.$changebox.removeClass('selected');
			var employeeLevels=am.metadata.employeeLevels;
			if(employeeLevels && employeeLevels.length){
				this.$level.empty();
				for(var i=0;i<employeeLevels.length;i++){
					var item=employeeLevels[i];
					var $li=this.$li.clone(true,true);
					var $levelLi=$li.find("ul li:first");
					var employee=self.getEmployeeById(item.dutyId);
					$li.find("span").text(item.name);
					$li.find("ul").empty();
					if(employee && employee.length){
						for(var j=0;j<employee.length;j++){
							var levelLi=$levelLi.clone(true,true);
							employee[j].textName=employee[j].no+"号 "+employee[j].name;
							levelLi.text(employee[j].textName);
							levelLi.data("item",employee[j]);
							$li.find("ul").append(levelLi);
						}
					}else{
						continue;
					}
					this.$level.append($li);
				}
				this.ScrollView.refresh();
				self.ScrollView.scrollTo("top");
			}
			// console.log(data);
			this.sendMessage={
				name:data.empName,
				itemid:data.empId,
				billId:data.billId,
				billType:data.billtype,
				subId:data.id,
				billNo:data.billNo,
				itemNo:data.itemNo,
				oldVal:data.empId,
				operator:data.operatorId,
				//itemNo:data.itemNo,
				itemName:data.itemName,
				oldEmployeeNo:data.empNo,
				oldEmployeeDutyName:data.dutyTypeName,
				oldEmployeeName:data.empName,
				newEmployeeNo:data.empNo,
				newEmployeeDutyName:data.dutyTypeName,
				newEmployeeName:data.empName
			};
			self.$employeeValue.val('请选择').data("value",this.sendMessage);
		},
		fillProject:function(data){
			var self=this;
			var classes=am.metadata.classes;
			if(classes && classes.length){
				this.$level.empty();
				for(var i=0;i<classes.length;i++){
					var item=classes[i];
					var $li=this.$li.clone(true,true);
					var $levelLi=$li.find("ul li:first");
					if(item.sub && item.sub.length){
						$li.find("span").text(item.name);
						$li.find("ul").empty();
						for(var j=0;j<item.sub.length;j++){
							var itemj=item.sub[j];
							var levelLi=$levelLi.clone(true,true);
							itemj.textName=itemj.name;
							levelLi.text(itemj.textName);

							levelLi.data("item",itemj);
							$li.find("ul").append(levelLi);
						}
					}else{
						continue;
					}
					this.$level.append($li);


				}
				this.ScrollView.refresh();
				self.ScrollView.scrollTo("top");

			}
			this.sendMessage={
				name:data.itemName,
				itemid:data.itemNo,
				billId:data.billId,
				billType:data.billtype,
				subId:data.id,
				billNo:data.billNo,
				oldVal:data.itemNo,
		        oldName:data.itemName,
				newName:data.itemName,
				operator:data.operatorId
			};
			self.$employeeValue.val(data.itemName).data("value",this.sendMessage);
		},
		fillDepartment:function(data){
			var self=this;
			var classes=am.metadata.deparList;
			var $li=this.$li.clone(true,true);
			var $levelLi=$li.find("ul li:first");
			this.$level.empty();
			this.$level.append($li);
			this.$level.find('li:first span').remove();
			this.$level.find('li li').remove();
			for(var j=0;j<classes.length;j++){
				var itemj=classes[j];
				var levelLi=$levelLi.clone(true,true);
				itemj.textName=itemj.name;
				levelLi.text(itemj.textName);
				levelLi.data("item",itemj);
				$li.find("ul").append(levelLi);
			}
			this.$level.append($li);
			this.ScrollView.refresh();
			self.ScrollView.scrollTo("top");
			this.sendMessage={
				id:data.billId,
				operator:data.operatorId,
				billNo:data.billNo,
				type:data.type,
				oldVal:data.depcode,
				subId:data.id				
			};
			if(!data.depName){
				self.$employeeValue.val('请选择');
			}else {
				self.$employeeValue.val(data.depName).data("value",this.sendMessage);
			}
		},
		getCost:function(item){
			var num = 0;
			if(item.cardList && item.cardList.length){
				for(var cardCostIdx=0;cardCostIdx<item.cardList.length;cardCostIdx++){
					var cardCost=item.cardList[cardCostIdx];
					if(cardCost.depcode == -1 && cardCost.consumeType == 16){
						if(cardCost.cardFee > 0 || cardCost.presentFee > 0){
							if(cardCost.cardFee > 0){
								num += cardCost.cardFee;
							}
							if(cardCost.presentFee > 0){
								num += cardCost.presentFee
							}
						}
					}
				}
			}
			if(item.cashList && item.cashList.length){
				for(var cashCostIdx=0;cashCostIdx<item.cashList.length;cashCostIdx++){
					var cashCost=item.cashList[cashCostIdx];
					if(cashCost.depcode == -1 && cashCost.consumeType == 3){
						if(cashCost.cash > 0){
							num += cashCost.cash
						}
						if(cashCost.unionPay > 0){
							num += cashCost.unionPay;
						}
						if(cashCost.cooperation > 0){
							num += cashCost.cooperation;
						}
						if(cashCost.mall > 0){
							num += cashCost.mall;
						}
						if(cashCost.weixin > 0){
							num += cashCost.weixin;
						}
						if(cashCost.pay > 0){
							num += cashCost.pay;
						}
						if(cashCost.luckymoney>0){
							num += cashCost.luckymoney;
						}
						if(cashCost.coupon>0){
							num += cashCost.coupon;
						}
						if(cashCost.dianpin>0){
							num += cashCost.dianpin;
						}
						var otherpaytypes=am.page.billRecord.getotherPaytypes(cashCost);
						for(var kk in otherpaytypes){
							num += otherpaytypes[kk].value;
						}
					}
				}
			}
			if(item.cashList && item.cashList.length){
				for(var basis=0;basis<item.cashList.length;basis++){
					var basisItem=item.cashList[basis];
					if(basisItem.depcode == -1 && basisItem.consumeType == 2){
						num += basisItem.cash;
						num += basisItem.unionPay;
						if(basisItem.cooperation > 0){
							num += basisItem.cooperation;
						}
						if(basisItem.mall > 0){
							num += basisItem.mall;
						}
						if(basisItem.weixin > 0){
							num += basisItem.weixin;
						}
						if(basisItem.pay > 0){
							num += basisItem.pay;
						}
						if(basisItem.luckymoney>0){
							num += basisItem.luckymoney;
						}
						if(basisItem.coupon>0){
							num += basisItem.coupon;
						}
						if(basisItem.dianpin>0){
							num += basisItem.dianpin;
						}
						var otherpaytypes=am.page.billRecord.getotherPaytypes(basisItem);

						for(var kk in otherpaytypes){
							num += otherpaytypes[kk].value;
						}
					}
				}
			}
			if(item.debtFee && item.type!=0) {
				num += item.debtFee;
			}
			return num;
		}
	};
	$(function(){
		$.am.selectEmployee.init();
	});
	var self = am.page.billRecord = new $.am.Page({
		id : "page_billRecord",
		backButtonOnclick : function() {
			if ($("#pswp_dom").is(":visible")) {
				am.gallery.close();
			}
			if (am.signname.$ && am.signname.$.is(":visible")) {
				am.signname.hide();
			}
		},
		init : function() {
			this.$billRecordContent=this.$.find(".billRecordContent");
			this.$contentBox=this.$.find(".billRecordContent .common_tabBox");
			this.$watercourse=this.$.find(".billRecordContent .watercourse");
			this.$waterResult=this.$watercourse.find(".result");
			this.$tablebody=this.$watercourse.find(".tablebody");
			this.$waterInput=this.$.find("#waterInput");
			this.$table=this.$.find(".watercourse .table-content-list tbody").empty();
			this.$faceTable=this.$.find(".facepay .table-content-list tbody").empty();

			this.$faceThead=this.$.find(".facepay .table-content-head tbody").empty();
			this.$facecontentbox=this.$.find(".facepay .contentbox");
			this.$faceTableBox=this.$.find(".facepay .faceTableBox");

			this.$billRecordMask = $('#billrecordmask');
			this.$searchMask = this.$.find('.searchmask');
			this.$searchopen = this.$.find('.searchopen');
			this.$header = this.$.find('.header');

			//搜索区域展开和隐藏
			this.$searchopen.vclick(function(){
				if(self.$header.hasClass('on')){	//隐藏操作
					self.searchHide();
				}else{	//展开操作
					self.searchOpen();
				}
			});
			this.$searchMask.vclick(function(){
				self.searchHide();
			});
			this.$billRecordMask.vclick(function(){
				self.searchHide();
			});

			this.$.on("vclick",".billRecordTab li",function(){
				var idx=$(this).index();
				$(this).addClass("selected").siblings().removeClass('selected');
				if(idx<1){
					self.$contentBox.eq(idx).addClass('selected').siblings().removeClass('selected');
					setTimeout(function(){
						self.$searchopen.trigger('vclick');
					}, 10);
				}else{
					self.$contentBox.eq(1).addClass('selected').siblings().removeClass('selected');
					var $common_tableBox=self.$billRecordContent.find(".facepay .common_tableBox");
					$common_tableBox.removeClass("selected").eq(0).addClass('selected');
					if(idx==1){
						self.$contentBox.find(".search_box .tips").show();
					}else{
						self.$contentBox.find(".search_box .tips").hide();
					}
				}
				self.facePageIndex=0;
				self.$billRecordContent.addClass("normal");
				self.setStartDate();
			}).on("vclick",function(){
				//关闭筛选条件
				for(var i in self.Select){
					if(!self.Select[i].$listbox.hasClass('disabled')){
						self.Select[i].hide(true);
					}
				}
				//关闭修改删除弹层
				self.$.find('.tdedit ul').hide();
			});
			this.$.find(".billRecordContent .header").on("vclick",".dateInput .pre",function(){
				var ts = self.addTime(false);
				var min = new Date();
				min.setHours(0);
				min.setMinutes(0);
				min.setSeconds(0);
				min.setMilliseconds(0);
				if(min.setDate(min.getDate()-self.limitDays) > ts.getTime()){
					return;
				}
				self.$waterInput.val(ts.format('yyyy/mm/dd'));
			}).on("vclick",".next",function(){
				var val=self.$waterInput.val();
				if(new Date(val).getTime()>=new Date().getTime()-86400000) return;
				self.$waterInput.val(self.addTime(true).format('yyyy/mm/dd'));
			}).on("vclick",".btnOk",function(){
				self.searchHide();
				self.hideSelect();
				self.$watercourse.removeClass("showmoreresult");
				//self.$watercourse.find(".tablebody").css("top","145px");
				self.render(true);

				console.log(self.getSelectValue());
			}).on("vclick",".yesterdaybtn",function(){
				var ts =new Date().getTime()-86400000;
				self.$waterInput.val(new Date(ts).format("yyyy/mm/dd"));
			}).on("vclick",".todaybtn",function(){
				self.$waterInput.val(new Date().format("yyyy/mm/dd"));
			}).on("vclick",".phoneNum",function(){
				var _phoneNum = $(this);
				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
				    	_phoneNum.val(value);
				    }
				});
			});
			this.$.find(".facepay").on("vclick",".search_box .btnOk",function(){
				self.rendercommonReports();
			}).on("vclick",".refund",function(){
				if($(this).hasClass("disabled")) return;
				var item=$(this).parents("tr").data("item");
				var _this=$(this);
				var nowDay=self.getoneday(new Date());
				var outTime=self.getoneday(item.createtime);
				if(item.payType==0 && !(nowDay.year==outTime.year && nowDay.month==outTime.month && nowDay.day==outTime.day)){
					am.msg("本单为代收代付，收款已超过一天，已计入提现金额，无法退款！");
					return false;
				}
				if(am.metadata.userInfo && am.metadata.userInfo.operatestr && am.metadata.userInfo.operatestr.indexOf("MGJZ7")!=-1){
					am.msg("对不起，您没有退款权限!");
					return false;
				}
				var msg=item.billid?"建议您去水单记录中撤销水单后退款，如果仍选择退款，水单会成为异常流水单，是否仍选择退款？":"是否确认退款";
				am.confirm("退款", msg, "确定", "取消", function() {
					self.withdrawData(item,function(ret){
						if (ret.content.status == 4 || ret.content.status == 5) {
						    am.msg("退款成功！");
						    _this.text("已退款").addClass("disabled");
						}
					})
				}, function() {});

			});
			this.$watercourse.on("vclick",".result .detail",function(){
				// if(self.$watercourse.hasClass('showmoreresult')){
				// 	self.$watercourse.removeClass("showmoreresult");
				// 	self.$watercourse.find(".tablebody").css("top","145px");
				// }else{
				// 	self.$watercourse.addClass("showmoreresult");
				// 	self.$watercourse.find(".tablebody").css("top",(155+self.$watercourse.find(".moreresult").height())+"px");
				// }
				// self.watercourseScroll.refresh();
				// self.watercourseScroll.scrollTo("top");
				$('#tab_main ul p.h').parent('li').trigger('vclick');
			}).on("vclick",".table-content-list .projectName a.editItem",function(){
				if( !self.modifyPermissions() ) return;

				var item=$(this).parent(".projectName").data("item");
				console.log(item);
				var _this=$(this);
				$.am.selectEmployee.show("修改项目",1,item,function(data){
					console.log(data);
					var depDate = {
						newVal: self.getDepCode(data.itemid),
						oldVal: item.depcode,
						subId: data.subId,
						type: item.type,
						billNo: item.billNo,
						id: item.billId
					};
					self.updateId = _this.parents('.childtr').data('item').id;//记录当前修改的id
					self.updateWater("1",data,function(res){
						_this.text(data.newName);
						var newVal=$.extend({},item,{
							itemName:data.newName,
							itemNo:data.newVal,
						});
						_this.parent(".projectName").data("item",newVal);
						if(depDate.newVal==depDate.oldVal){
							self.$.find(".btnOk").trigger('vclick');
						}else {
							//修改项目更新部门
							self.upd(5,depDate,function(){
								self.$.find(".btnOk").trigger('vclick');
							});
						}
						
					});
				});
			}).on("vclick",".table-content-list .projectName a.editDep",function(){
				if( !self.modifyPermissions() ) return;

				var item=$(this).parent(".projectName").data("item");
				console.log(item);
				var _this=$(this);
				$.am.selectEmployee.show("修改部门",4,item,function(data){
					console.log(data)
					if(!data){
						return;
					}
					self.upd(5,data,function(){
						self.$.find(".btnOk").trigger('vclick');
					});
				});
			}).on("vclick",".table-content-list .changeEmployee a",function(){
				if( !self.modifyPermissions() ) return;

				var idx=$(this).parents("tr").index();
				var item=$(this).parents("tbody").data("item");
				var sendData=$.extend(item["empList"]?item["empList"][idx]:{},item["other"]);
				var _this=$(this);
				console.log(sendData);
				$.am.selectEmployee.show("修改员工",2,sendData,function(data){
					self.updateId = _this.parents('.childtr').data('item').id;//记录当前修改的id
					self.updateWater("2",data,function(res){

						// console.log(data);
						// _this.text(data.newEmployeeNo+"号"+data.newEmployeeDutyName+"("+data.newEmployeeName+")");
						// item["other"]=$.extend({},item["empList"][idx],{
						// 	dutyTypeName:data.newEmployeeDutyName,
						// 	empNo:data.newEmployeeNo,
						// 	empName:data.newEmployeeName
						// });
						// _this.parents("tbody").data("item",item);

						self.$.find(".btnOk").trigger('vclick');
					});
				});
			}).on("vclick",".consumetime",function(ev){
				ev.stopPropagation();
				if( !self.modifyDatePermissions() ) return;
			}).on("vclick",".addcustomer",function(ev){
				ev.stopPropagation();
				var _item = $(this).parents('tr').data('item');
				console.log(_item);

				if(_item.memberId == 0){
					//am.msg("!!!");
					return;
				}

				$.am.changePage(am.page.memberDetails, "slideup",{customerId:_item.memberId,tabId:1});
			}).on("vclick",".table-content-list .revoke",function(ev){
				ev.stopPropagation();
				if($(this).hasClass("disabled")) return;

				//if( !self.modifyPermissions() ) return;

				var p = $(this).data("revoke");
				if(p && am.operateArr.indexOf(p) ==-1){
					am.msg('你没有权限进行此操作！');
					return;
				}

				var _this=$(this);
				var item=$(this).parents("tr").data("item");
				var reason = JSON.parse(am.metadata.configs.cancleBilled);
				am.selectCancleReason.show({
					title: '请选择撤单理由',
					warn: '警告:请选择或输入明确的撤单理由，以便财务和管理层审核',
					reason: reason,
					callback: function(str){
						self.cancelProject(item,str,function(res){
							//_this.find("b").text("已销单");
							self.$.find(".btnOk").trigger('vclick');
							self.checkIsbilRemark(item);
						});
					}
				});
				// am.confirm("销单","确定要撤销此单?", "确定", "取消", function() {
				// 	_this.addClass("disabled");
				// 	self.cancelProject(item,function(res){
				// 		//_this.find("b").text("已销单");
				// 		self.$.find(".btnOk").trigger('vclick');
				// 	});
				// }, function() {});
			}).on("vclick",".table-content-list .print",function(ev){
				ev.stopPropagation();
				var that = $(this);

				var $basictr = $(this).parents('.basictr');
				var _item = $basictr.data('item');
				console.log(_item);

				var d = self.getDetailData(_item,$basictr);
				console.log(d);

				that.addClass('am-disabled').text('正在打印');
				am.print.print(
	                d,
	                function(){
	                    that.removeClass("am-disabled").text("打印小票");
	                },
	                function(msg){
	                    am.msg(msg || "打印失败");
	                    that.removeClass("am-disabled").text("打印小票");
	                }
	            );
			}).on('vclick','tr.basictr',function(){	//展开隐藏
				var btn = $(this).find('td').eq(0).hasClass('on');
				var $nexttr = $(this).next();
				if(btn){	//隐藏操作
					$(this).find('td').eq(0).removeClass('on');
					$(this).siblings('.childtr').find('.tdchildren').slideUp(300);
				}else{	//展开操作
					self.$watercourse.find('.basictr').each(function(k,v){
						$(v).find('td').eq(0).removeClass('on');
					});
					$(this).find('td').eq(0).addClass('on');
					$nexttr.find('.tdchildren').slideDown(300);
					$nexttr.siblings('.childtr').find('.tdchildren').slideUp(300);
				}
				self.updateId = $(this).data('item').id;
				setTimeout(function(){
					self.watercourseScroll.refresh();
				},300);
			}).on('vclick','.table-content-list .tdedit',function(ev){
				ev.stopPropagation();
				self.$.find('.tdedit ul').hide();

				if( !self.modifyPermissions() ) return;
				//编辑
				$(this).find('ul').show();
			}).on('vclick','.table-content-list .tdedit ul li',function(ev){
				ev.stopPropagation();
				var _index = $(this).index();
				var _this = $(this);
				var billFeeStr = _this.parents('.col3').prev().find('dt p').html();
				$.am.selectEmployee.billFee = billFeeStr.substring(1,billFeeStr.length);
				console.log($.am.selectEmployee.billFee)
				if(_index == 0){
					//修改
					$(this).parent().hide();
					var idx=$(this).parents("tr").index();
					var item=$(this).parents("tbody").data("item");
					var sendData=$.extend(item["empList"]?item["empList"][idx]:{},item["other"]);
					sendData.commissionType = $(this).parents('.childtr').data('item').type;
					var _this=$(this);
					console.log(sendData);
					$.am.selectEmployee.empFeeLi = {
						fee: sendData.fee,
						cardfee: sendData.cardfee,
						cashfee: sendData.cashfee,
						otherfee: sendData.otherfee
					}
					$.am.selectEmployee.show("修改",2,sendData,function(data){
						console.log(data);
						self.updateId = _this.parents('.childtr').data('item').id;//记录当前修改的id
						self.updateWater("3",data,function(res){
							self.$.find(".btnOk").trigger('vclick');
						});
					},true);
				}else if(_index == 1){
					//删除
					$(this).parent().hide();
					var idx=$(this).parents("tr").index();
					var item=$(this).parents("tbody").data("item");
					var sendData=$.extend(item["empList"]?item["empList"][idx]:{},item["other"]);
					sendData.commissionType = $(this).parents('.childtr').data('item').type;
					var _this=$(this);
					console.log(sendData);
					self.updateId = $(this).parents('.childtr').data('item').id;//记录当前修改的id
					sendData.subId = sendData.id;
					self.updateWater("5",sendData,function(res){
						self.$.find(".btnOk").trigger('vclick');
					});
				}
			}).on('vclick','.table-content-list .addcust div',function(){
				if( !self.modifyPermissions() ) return;
				var _this = $(this);
				var billFeeStr = _this.parents('.col3').prev().find('dt p').html();
				$.am.selectEmployee.billFee = billFeeStr.substring(1,billFeeStr.length);
				$.am.selectEmployee.empFeeLi = null;
				console.log($.am.selectEmployee.billFee)
				//添加员工
				var _this = $(this);
				var item=$(this).parents("tbody").data("item");
				var childtritem = $(this).parents('.childtr').data('item');
				var detailtritem = $(this).parents('.detailtr').data('item');
				item.commissionType = $(this).parents('.childtr').data('item').type;
				item.billId = childtritem.id;
				item.billNo = childtritem.billNo;
				if(childtritem.type == 2){//开卡充值,续卡充值
					//当为开卡和充值时detailList为[]
					item.id = 0;
					item.billtype = childtritem.type;
					item.itemNo = "-1";
				}else{
					item.id = detailtritem.id;
					item.billtype = detailtritem.type;
					item.itemNo = detailtritem.itemNo;
				}
				$.am.selectEmployee.show("添加员工",3,item,function(data){
					console.log(data);
					self.updateId = _this.parents('.childtr').data('item').id;//记录当前修改的id
					self.updateWater("4",data,function(res){
						self.$.find(".btnOk").trigger('vclick');
					});
				},true);
			}).on("vclick",".signature",function(){
				var $childtr = $(this).parents(".childtr");
				var item=$childtr.data("item");
				console.log(item);
				am.signatureView.show({
					memberId:item.memberId,
					billId:item.id,
					bill:{
						action:"bill",
						name:item.name,
						sex:item.sex,
						cardName:self.getCardTypeById(item.cardTypeId) || "",
						ts:item.consumeTime
					}
				});
			}).on('vclick','.billnoBox a',function(e){
				e.stopPropagation();
				if( !self.modifyPermissions() ) return;
				var item = $(this).parents('tr').data('item');
				var oldVal = $(this).html();
				item.oldVal = oldVal;
				am.keyboard.show({
                    title: "请输入数字", //可不传
                    hidedot: true,
                    submit: function(value) {
						value = value.replace(/\D/g,"").trim();
						if(!value) return;
						item.newVal = value;
						self.upd(0,item,function(){
							self.$.find(".btnOk").trigger('vclick');
						});
                    },
                    hidecb: function() {}
                });
			}).on('vclick','.client a',function(e){
				e.stopPropagation();
				if( !self.modifyPermissions() ) return;
				var item = $(this).parents('tr').data('item');
				var _this = $(this);
				var oldClient = _this.html(),
					newClient = oldClient=='计客'?'不计客':'计客';
				self.upd(11,item,function(){
					self.$.find(".btnOk").trigger('vclick');
				});
			}).on('vclick','.sextd a',function(e){
				e.stopPropagation();
				if( !self.modifyPermissions() ) return;
				var item = $(this).parents('tr').data('item');
				var _this = $(this);
				var oldSex = _this.html(),
					newSex = oldSex=='男'?'女':'男';
				self.upd(3,item,function(){
					self.$.find(".btnOk").trigger('vclick');
				});
			}).on('vclick','.comment',function(e){
				$(this).toggleClass('checked');
			}).on('vclick','dt.deptPerfEdit',function () {
				self.setDeptPerf($(this).parents('tr.childtr'));
			});

			//重试
			this.$.find(".result_bg").on("vclick",".error .btn",function(){
				var idx=self.$.find(".billRecordTab li.selected").index();
				if(idx==0){
					self.render(true);
				}else{
					self.rendercommonReports();
				}

			});
			this.facePageIndex=0;
			this.facePageSize=1000;
			// this.pager=new $.am.Paging({
			// 	$:self.$.find(".footcontent"),
			// 	showNum:self.facePageSize,//每页显示的条数
			// 	total:1,//总数
			// 	action:function(_this,index){
			// 		if(self.facePageIndex==index) return;
			// 		self.facePageIndex=index;
			// 		self.rendercommonReports();
			// 	}
			// });
			this.facepayScroll = new $.am.ScrollView({
			    $wrap : this.$.find(".facepay .table-content-list"),
			    $inner : this.$.find(".facepay .table-content-list table"),
			    direction : [false, true],
			    hasInput: false

			});
			this.watercourseScroll = new $.am.ScrollView({
			    $wrap : this.$.find(".watercourse .table-content-list"),
			    $inner : this.$.find(".watercourse .table-content-list table"),
			    direction : [false, true],
			    hasInput: false,
			    touchTopcallback:function(){
			    	self.render(true);
			    },
			    touchBottomcallback:function(){
			    	self.pageIndex++;
			    	self.render();
			    },
			    pauseTouchTop:true,
			    pauseTouchBottom:false
			});
			am.extendScrollView(this.watercourseScroll);

			/*this.$waterInput.val(new Date().format("yyyy/mm/dd")).mobiscroll().calendar({
			    theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
			    months: "auto",
			    max: amGloble.now(),
			    setOnDayTap: true,
			    buttons: [],
			    onSet: function(valueText, inst) {
			        console.log(valueText)
			    }
			}).mobiscroll('getInst');
			*/

			this.selectData={
				depcodeselect_form:[{"name":"全部","value":""},{"name":"美发部1","value":1},{"name":"美容部2","value":2}],
				billselect_form:[
				{"name":"全部","value":-1},
				{"name":"项目消费","value":0},
				{"name":"卖品消费","value":1},
				{"name":"开卡充值","value":2},
				{"name":"套餐购买","value":3},
				{"name":"套餐消费","value":4},
				{"name":"年卡充值","value":5},
				{"name":"年卡消费","value":6},
				{"name":"套餐赠送","value":7}],
				payselect_form:[
				{"name":"全部","value":0},
				{"name":"卡金","value":1},
				{"name":"赠送金","value":2},
				{"name":"分期赠送金","value":3},
				{"name":"现金","value":4},
				{"name":"银联","value":5},
				{"name":"合作券","value":6},
				{"name":"商场卡","value":7},
				{"name":"微信支付","value":8},
				{"name":"支付宝","value":9},
				{"name":"代金券","value":10},
				{"name":"积分","value":11},

				{"name":"大众点评","value":12},
				{"name":"欠款","value":13},
				{"name":"免单","value":14},
				{"name":"红包","value":15},
				{"name":"优惠券","value":16},
				{"name":"自定义","value":17}],
				acrossselect_form:[{"name":"全部","value":0},{"name":"跨店","value":1}],
				operatorselect_form:[{"name":"全部","value":0},{"name":"一店","value":1}]
			}
			this.setSelect(this.selectData);

			this.pageIndex=0;
			self.$listData=[];
			this.createPicker();
		},
		getBillByNo:function(no,cb){
			var cachedata = am.page.hangup.cachedata;
			var list = cachedata.content;
			if(list && list.length){
				for(var i=0;i<list.length;i++){
					if(list[i].serviceNO == no){
						cb && cb(list[i],i);
					}
				}
			}
		},
		checkIsbilRemark:function(item){
			if(item.type==2 || item.type==3){
				this.getBillByNo(item.billNo,function(items,idx){
					var _item    = am.clone(items);
					var sendData = am.page.hangup.getBillData(_item);
					if(item.type==2 && item.consumeType==0){//开卡
						if(sendData.billRemark && sendData.billRemark.opencard){
							sendData.billRemark.opencard.isbuy = false;
						}
					}else if(item.type==2){//充值
						if(sendData.billRemark && sendData.billRemark.recharge){
							sendData.billRemark.recharge.isbuy = false;
						}
					}else{//套餐
						sendData.billRemark.buypackage.isbuy = false;
					}
					_item.data = JSON.stringify(sendData);
					am.page.hangup.cachedata.content[idx] = _item;
					am.page.hangup.saveBill(_item);
				});
			}
		},
		getDepCode:function(id){
			var classes = am.metadata.classes;
			for(var i=0;i<classes.length;i++){
				for(var j=0;j<classes[i].sub.length;j++){
					if(classes[i].sub[j].itemid==id){
						return classes[i].depcode || '';
					}
				}
			}
			return '';
		},
		getDepName:function(code){
			var deparList = am.metadata.deparList;
			var name = '';
			if(deparList.length){
				for(var i=0;i<deparList.length;i++){
					if(deparList[i].code==code){
						name = deparList[i].name;
					}
				}
			}
			return name || '部门：无';
		},
		modifyPermissions : function(){
			if( am.operateArr.indexOf('B') == -1 ){
				am.msg("您没有权限修改此单!");
				return false;
			}
			return true;
		},
		modifyDatePermissions : function(){
			if( am.operateArr.indexOf('N') == -1 ){
				am.msg("您没有权限修改水单日期!");
				return false;
			}
			return true;
		},
		searchOpen:function(){	//展开
			this.$header.addClass('on');
			this.$billRecordMask.show();
			this.$searchMask.show();
			this.updateId = -1; //清空记录修改的状态
			if(am.operateArr.indexOf('a3')!=-1){
				this.Select.operatorselect_form.$.parent().hide();
				//this.Select.operatorselect_form.$value.data("value",am.metadata.userInfo.userId);
			}
		},
		searchHide:function(){	//隐藏
			this.$header.removeClass('on');
			this.$billRecordMask.hide();
			this.$searchMask.hide();
		},
		initHeader:function(){	//清空查询列表
			var self = this;
			this.$.find('.todaybtn').trigger('vclick');
			this.$.find(".phoneNum").val('');
			var Select=this.Select;
			for(var i in Select){
				//Select[i].$value.text('全部').data("value",self.selectData[Select[i].key][0].value);
				Select[i].setValue(0);
			}
		},
		rendercommonReports:function(){
			var idx=this.$.find(".billRecordTab li.selected").index();
			if(idx==1){
				this.renderFace();
			}
			if(idx>1){
				this.renderReports(idx-2,true);
			}
		},
		renderReports:function(idx,flag){
			var apiList=["getLuckyMoney","getMallOrder","getdianpingFlow","getexceptionFlow"];
			var renderList=["renderRedpackReport","renderMallReport","renderViewReport","renderExceptionalReport"];
			this.getreports(apiList[idx],function(res){
				console.log(res);
				self.$faceTable.empty();
				var data=res.content;
				if(data && data.length){
					self.renderTableHeader(idx+1);
					self[renderList[idx]](res.content);
					// self.pager.refresh(res.pageIndex,res.totalCount);
					self.$billRecordContent.removeClass('empty error normal');
				}else{
					self.$billRecordContent.removeClass('normal error').addClass("empty");
				}

			});

		},
		renderRedpackReport:function(data){

			for(var i=0;i<data.length;i++){
				var item=data[i];
				var classStyle=(item.status==4?"MGJ_highlight":"");
				var $html=$('<tr class='+classStyle+'>'+
				'<td style="width:19%"><div class="tdwrap">'+(item.activityTitle || '红包')+'</div></td>'+
				'<td style="width:20%"><div class="tdwrap">'+(item.money+'元 ')+'</div></td>'+
				'<td style="width:17%"><div class="tdwrap">'+item.memName+'</div></td>'+
				'<td style="width:10%"><div class="tdwrap">'+(item.status==3?"已使用":"待再次核销")+'</div></td>'+
				'<td style="width:14%"><div class="tdwrap">'+(item.displayId || "")+'</div></td>'+
				'<td style="width:20%"><div class="tdwrap">'+((new Date(item.redeemtime*1)).format("yyyy/mm/dd HH:MM:ss"))+'</div></td>'+
				'</tr>').data("item",item);
				self.$faceTable.append($html);
			}
			self.facepayScroll.refresh();
			self.facepayScroll.scrollTo("top");
		},
		renderMallReport:function(data){
			for(var i=0;i<data.length;i++){
				var item=data[i];
				var classStyle=(item.status==4?"MGJ_highlight":"");
				var payName = ["微信","支付宝","免费领取","会员卡支付"];

				var luckyMoneyPay = "";
				if(item.luckyMoneyPay){
					luckyMoneyPay = ' 红包:<span class="MGJ_highlight">'+item.luckyMoneyPay+'</span>';
				}
				var payText = '';
				if(!item.cashPay && !luckyMoneyPay){
					payText = "免费领取";
				}else if(item.cashPay){
					payText = payName[item.payType]+':<span class="MGJ_highlight">'+item.cashPay+'</span>';
				}
				var $html=$('<tr class='+classStyle+'>'+
				'<td style="width:12%"><div class="tdwrap">'+item.code+'</div></td>'+
				'<td style="width:15%"><div class="tdwrap">'+item.mallItemName+'</div></td>'+
				'<td style="width:8%"><div class="tdwrap">'+item.price+'</div></td>'+
				'<td style="width:10%"><div class="tdwrap">'+(payText+luckyMoneyPay)+'</div></td>'+
				'<td style="width:10%"><div class="tdwrap">'+item.memName+'</div></td>'+
				'<td style="width:10%"><div class="tdwrap">'+(item.status==3?"已使用":"待再次核销")+'</div></td>'+
				'<td style="width:10%"><div class="tdwrap">'+(item.displayId || "")+'</div></td>'+
				'<td style="width:15%"><div class="tdwrap">'+(new Date(item.consumeTime*1).format("yyyy/mm/dd HH:MM"))+'</div></td>'+
				'<td style="width:10%"><div class="tdwrap">'+item.operatorName+'</div></td>'+
				'</tr>').data("item",item);
				self.$faceTable.append($html);
			}
			self.facepayScroll.refresh();
			self.facepayScroll.scrollTo("top");
		},
		renderViewReport:function(data){
			/*serialnumber 券号  dealtitle  名称 mobile 顾客手机号  price 价格  consumedate 消费日期  displayid  流水单号*/

			for(var i=0;i<data.length;i++){
				var item=data[i];
				var classStyle=(item.status==4?"MGJ_highlight":"");
				var $html=$('<tr class='+classStyle+'>'+
				'<td style="width:20%"><div class="tdwrap">'+item.serialnumber+'</div></td>'+
				'<td style="width:15%"><div class="tdwrap">'+item.dealtitle+'</div></td>'+
				'<td style="width:15%"><div class="tdwrap">'+am.processPhone(item.mobile)+'</div></td>'+
				'<td style="width:20%"><div class="tdwrap">'+("价格:￥"+item.marketprice+"(实收:￥"+item.price)+')</div></td>'+
				'<td style="width:10%"><div class="tdwrap">'+(item.displayid || "")+'</div></td>'+
				'<td style="width:20%"><div class="tdwrap">'+(new Date(item.consumedate*1).format("yyyy/mm/dd HH:MM"))+'</div></td>'+
				'</tr>').data("item",item);
				self.$faceTable.append($html);
			}
			self.facepayScroll.refresh();
			self.facepayScroll.scrollTo("top");
		},
		renderExceptionalReport:function(data){
			var payName = ["微信","支付宝","免费领取","会员卡支付"];
			for(var i=0;i<data.length;i++){
				var item=data[i];
				var payName = ["微信","支付宝","免费领取","会员卡支付"];
				var mobile=item.mobile?("["+am.processPhone(item.mobile)+"]"):"";
				var $html=$('<tr>'+
				'<td style="width:10%"><div class="tdwrap">'+(item.displayId || "")+'</div></td>'+
				'<td style="width:18%"><div class="tdwrap">'+(item.name || "散客")+mobile+'</div></td>'+
				'<td style="width:40%"><div class="tdwrap">'+('支付宝:'+item.pay+' 微信:'+item.weixin + '点评：' + item.mall +' 消费金额:'+item.eafee)+'</div></td>'+
				'<td style="width:20%"><div class="tdwrap">'+item.consumetime+'</div></td>'+
				'<td style="width:13%"><div class="tdwrap">'+item.operatiorid+'</div></td>'+
				'</tr>').data("item",item);
				self.$faceTable.append($html);
			}
			self.facepayScroll.refresh();
			self.facepayScroll.scrollTo("top");
		},
		getoneday:function(time){
			var nowTime=new Date(time*1);
			return {
				year:nowTime.getFullYear(),
				month:nowTime.getMonth()+1,
				day:nowTime.getDate()
			}
		},
		createPicker:function(){
			/*var now = am.now();
			var max = now;
			this.$datePicker =this.$.find(".search_box .date").vclick(function(){

				setTimeout(function() {
				    am.loading.show("");
				    datePicker.show();
				}, 50);

				setTimeout(function() {
				    am.loading.hide();
				}, 350);
			}).mobiscroll().range({
                theme: 'mobiscroll',
                lang: 'zh',
                display: 'bottom',
                defaultValue: [now, now],
                // minDate: min,
                showOnTap: false,
                max: max,
                //maxRange: 2678400000,
                onSet: function(valueText, inst) {
                    self.renderDate();
                }
            });
            var datePicker = this.$datePicker.mobiscroll('getInst');*/
           	this.$.find(".search_box .date").mobiscroll().calendar({
			    theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
			    months: "auto",
			    setOnDayTap: true,
			    buttons: [],
			    onSet: function(valueText, inst) {
			        self.$.find(".start_Date").val(new Date(valueText.valueText).format("yyyy/mm/dd"));
			    }
			});
		},
		setStartDate:function(){
			this.$.find(".start_Date").val(new Date().format("yyyy/mm/dd"));
		},
		getfaceTime:function(){
			/*var $datePicker = this.$datePicker;*/
			var s1=new Date(self.$.find("#startDate").val());
			// var s2=new Date($datePicker.find("#endDate").val());

			var s=new Date(s1.format("yyyy/mm/dd")+" 00:00:00").getTime();
			var e=new Date(s1.format("yyyy/mm/dd")+" 23:59:59").getTime();
			return s+"_"+e;
		},
		renderDate:function(){
			var range = this.$datePicker.mobiscroll('getVal');
			var $datePicker = this.$datePicker;
			$datePicker.find(".start_Date").each(function(i,item){
				$(item).val(range[0].format("yyyy/mm/dd"));
			});
			$datePicker.find(".end_Date").each(function(i,item){
				$(item).val(range[1].format("yyyy/mm/dd"));
			});
		},
		addTime:function(flag){
			var value=this.$waterInput.val();
			var d=new Date(value).getTime();
			if(flag){
				var n=new Date(d+86400000);
			}else{
				var n=new Date(d-86400000);
			}
			return n;
		},
		renderTableHeader:function(idx){
			var headlist=[[{key:"类型",value:"10%"},{key:"交易号",value:"25%"},{key:"金额",value:"20%"},{key:"时间",value:"15%"},{key:"流水单号",value:"10%"},{key:"收款类型",value:"10%"},{key:"操作",value:"10%"}],
			[{key:"活动",value:"19%"},{key:"金额",value:"20%"},{key:"客户",value:"17%"},{key:"状态",value:"10%"},{key:"流水单号",value:"14%"},{key:"使用时间",value:"20%"}],
			[{key:"单号",value:"12%"},{key:"名称",value:"15%"},{key:"购买价",value:"8%"},{key:"支付方式",value:"10%"},{key:"客户",value:"10%"},{key:"状态",value:"10%"},{key:"流水单号",value:"10%"},{key:"兑换时间",value:"15%"},{key:"操作人",value:"10%"}],
			[{key:"券号",value:"20%"},{key:"名称",value:"15%"},{key:"顾客手机号",value:"15%"},{key:"价格",value:"20%"},{key:"流水单号",value:"10%"},{key:"消费日期",value:"20%"}],
			[{key:"单号",value:"10%"},{key:"客户",value:"18%"},{key:"消费金额",value:"40%"},{key:"消费时间",value:"20%"},{key:"操作人",value:"13%"}]
			];
			var $faceThead=this.$faceThead.empty();
			var html="<tr>";
			var item=headlist[idx];
			for(var j=0;j<item.length;j++){
				var itemj=item[j];
				html+=('<td style="width:'+itemj.value+'" ><div class="tdwrap">'+itemj.key+'</div></td>');
			}
			html+='</tr>';
			$faceThead.append(html);
		},
		renderFace:function(){
			this.getfaceData(function(res){
				var data=res.content;
				self.$faceTable.empty();
				self.renderTableHeader(0);
				var payName = ["微信","支付宝","大众点评"];
				var payType=["美管加代收","自收","收钱吧"];
				if(data && data.length){
					for(var i=0;i<data.length;i++){
						var item=data[i];
						var paytime=new Date(item.createtime*1).format("yyyy/mm/dd HH:MM");
						var receipts=(item.type==3?("(实收:￥"+((item.dpactivityamount*1||0)+(item.userpayamount*1||0))+")"):"");
						var classStyle=((item.billid!=null && item.billid>=0)?"":"MGJ_highlight");
						var $html=$('<tr class='+classStyle+'>'+
						'<td style="width:10%"><div class="tdwrap">'+payName[item.type*1-1]+'</div></td>'+
						'<td style="width:25%"><div class="tdwrap addcustomer">'+(item.tradeno || "")+'</div></td>'+
						'<td style="width:20%"><div class="tdwrap">￥'+(item.price || "0")+receipts+'</div></td>'+
						'<td style="width:15%"><div class="tdwrap">'+(paytime || "")+'</div></td>'+
						'<td style="width:10%"><div class="tdwrap">'+(item.billid?(item.displayId || ""):"未关联")+'</div></td>'+
						'<td style="width:10%"><div class="tdwrap">'+(payType[item.payType*1])+'</div></td>'+
						'<td style="width:10%"><div class="tdwrap operate">'+
							'<span class="am-clickable refund">退款</span>'+
	                    '</div></td>'+
						'</tr>').data("item",item);

						self.$faceTable.append($html);
					}
					/*self.pager.refresh(res.pageIndex,res.totalCount);*/
					self.$billRecordContent.removeClass('empty error normal');
				}else{
					self.$billRecordContent.removeClass('normal error').addClass("empty");
				}
				/*if(res.totalCount>0){
					self.pager.$.show();
				}else{
					self.pager.$.hide();
				}*/
				self.facepayScroll.refresh();
				self.facepayScroll.scrollTo("top");
			});

		},
		beforeShow : function(paras) {
			if(paras == "back" || (paras && paras.customerId)){
				//back，或者改签名回来
				return;
			}
			if(!this.limitDays){
				var ts = amGloble.now();
				var user = amGloble.metadata.userInfo;
				this.limitDays=1;
				if(user.userType==0 && user.role==3){
					//老板看一年
					this.limitDays=365;
				}else if(user.userType==0 && user.role==2){
					//管理员看6个月
					this.limitDays=150;
				}
				ts.setDate(ts.getDate()-this.limitDays);
				this.calendarInstance = this.$waterInput.val(new Date().format("yyyy/mm/dd")).mobiscroll().calendar({
				    theme: 'mobiscroll',
				    lang: 'zh',
				    display: 'bottom',
				    months: "auto",
					min:ts,
				    max: amGloble.now(),
				    setOnDayTap: true,
				    buttons: [],
				    onSet: function(valueText, inst) {
				        console.log(valueText);
				    }
				});
			}

	        am.page.billRecord.initHeader();
			self.$billRecordContent.removeClass('empty error').addClass("normal");
			if(!(typeof paras == 'object' && paras.form && paras.form=='prepay')){//从收款页面跳转过来
				this.$.find(".billRecordTab li:first").trigger('vclick');
			}
			//判断店类型
			if(am.metadata.userInfo.shopType==3){
				this.$.find(".acrossSelect").hide();
			}else{
				this.$.find(".acrossSelect").show();
			}

		},
		afterShow : function(paras) {
			am.tab.main.show();
			am.tab.main.select(6);
			if(paras == "back" || (paras && paras.customerId)){
				//back，或者改签名回来
				return;
			}
			this.facepayScroll.refresh();
			this.watercourseScroll.refresh();
			/*刷新部门列表*/
			this.Select.depcodeselect_form.refresh(self.getdep());
			this.Select.operatorselect_form.refresh(self.getoperate());
			this.setSelectStart();
			if(typeof paras == 'object' && paras.form && paras.form=='prepay'){//从收款页面跳转过来
				this.$.find(".billRecordTab ul li:nth-child(2)").trigger('vclick');
				this.$.find(".facepay .search_box .btnOk").trigger('vclick');
			}
		},
		setSelectStart:function(){
			var select=this.Select;
			for(var i in select){
				select[i].setValue(0);
			}
			this.$billRecordContent.removeClass('normal error').addClass("empty");
			this.$waterInput.val(new Date().format("yyyy/mm/dd"));
		},
		beforeHide : function(paras) {
			this.hideSelect();
		},
		hideSelect:function(){
			var Select=this.Select;
			for(var i in Select){
				Select[i].hide(true);
			}
		},
		getoperate:function(){
			var metaData=am.metadata;
			var res=[{"name":"全部",value:0}];
			if(metaData.adminList && metaData.adminList.length){
				for(var i=0;i<metaData.adminList.length;i++){
					var item=metaData.adminList[i];
					res.push({
						name:item.name,
						value:item.id
					});
				}
			}
			return res;
		},
		getdep:function(){
			var metaData=am.metadata;
			var res=[{"name":"全部",value:""}];
			if(metaData.deparList && metaData.deparList.length){
				for(var i=0;i<metaData.deparList.length;i++){
					var item=metaData.deparList[i];
					res.push({
						name:item.name,
						value:item.code
					});
				}
			}
			return res;
		},
		setSelect:function(selectData){
			var $dom=this.$.find(".billRecordContent .header");
			this.Select={};
			for(var i in selectData){
				this.Select[i]=new $.am.Select({
					$:$dom.find("."+i),
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
		getSelectValue:function(){
			var Select=this.Select;
			var res={};
			var key={
				depcodeselect_form:"depcode",
				billselect_form:"type",
				payselect_form:"payFlag",
				acrossselect_form:"otherFlag",
				operatorselect_form:"operatorId"
			};
			for(var i in Select){
				res[key[i]]=Select[i].getValue();
			}

			if(am.operateArr.indexOf('a3')!=-1){
				res.operatorId = am.metadata.userInfo.userId;
			}
			res.billNo=this.$.find(".phoneNum").val();
			return res;
		},
		getCardTypeById:function(cardTypeId){
			var list=am.metadata.cardTypeList;
			if(cardTypeId=="20151212"){//美一客会员
				return "散客卡";
			}
			for(var i=0;i<list.length;i++){
				if(list[i].cardtypeid==cardTypeId){
					return list[i].cardtypename;
				}
			}

		},
		updateIdVclick: function(){
			var _updateId = self.updateId;
			var _basictr = this.$.find(".watercourse .table-content-list tbody tr.basictr");
			for(var i=0; i<_basictr.length; i++){
				var _id = $(_basictr[i]).data('item').id;
				if(_id == _updateId){
					$(_basictr[i]).trigger('vclick');
					break;
				}
			}
		},
		getDetailData: function(item,$tr){
			var _this = this;

			//user
			if(item.memberId == 0){
				//散客
				var user = null;
			}else{
				var user = {
					name : item.name,
					mobile : am.processPhone(item.mobile),
					cardName : _this.getCardTypeById(item.cardTypeId) ? _this.getCardTypeById(item.cardTypeId) : '',
					discount : item.discount
				};
			}

			//opt
			var opt = {
				billNo : item.billNo,
				consumeTime : item.consumeTime,
				cardType : item.cardType,
				billingInfo : {},
				gender:item.sex
			};
			if(item.cashList && item.cashList.length){
				var _cashList = item.cashList[0];
				$.each(item.cashList,function(i,cash){
					if(cash.depcode=='-1'){
						_cashList=cash;
					}
				})
				opt.billingInfo.cooperation = _cashList.cooperation;
				opt.billingInfo.coupon = _cashList.coupon;
				opt.billingInfo.dpFee = _cashList.dianpin;
				opt.billingInfo.luckymoney = _cashList.luckymoney;
				opt.billingInfo.mall = _cashList.mall;
				opt.billingInfo.otherfee1 = _cashList.otherfee1;
				opt.billingInfo.otherfee2 = _cashList.otherfee2;
				opt.billingInfo.otherfee3 = _cashList.otherfee3;
				opt.billingInfo.otherfee4 = _cashList.otherfee4;
				opt.billingInfo.otherfee5 = _cashList.otherfee5;
				opt.billingInfo.otherfee6 = _cashList.otherfee6;
				opt.billingInfo.otherfee7 = _cashList.otherfee7;
				opt.billingInfo.otherfee8 = _cashList.otherfee8;
				opt.billingInfo.otherfee9 = _cashList.otherfee9;
				opt.billingInfo.otherfee10 = _cashList.otherfee10;
				opt.billingInfo.pay = _cashList.pay;
				opt.billingInfo.pointFee = _cashList.pointFee;
				opt.billingInfo.unionPay = _cashList.unionPay;
				opt.billingInfo.voucherFee = _cashList.voucherFee;
				opt.billingInfo.weixin = _cashList.weixin;
				opt.billingInfo.cashFee = _cashList.cash;
				opt.billingInfo.mdFee = _cashList.mdFee;
				opt.billingInfo.debtFee = item.debtFee;
				opt.billingInfo.total = $tr.find('.jetd').data('total');
			}
			if(item.cardList && item.cardList.length){
				var _cardList = item.cardList[0];
				$.each(item.cardList,function(i,card){
					if(card.depcode=='-1'){
						_cardList=card;
					}
				})
				opt.billingInfo.cardFee = _cardList.cardFee;
				opt.billingInfo.divideFee = _cardList.divideFee;
				opt.billingInfo.treatfee = _cardList.treatFee;
				opt.billingInfo.treatpresentfee = _cardList.treatPresentFee;
				opt.billingInfo.presentFee = _cardList.presentFee;
			}

			//expenseCategory
			if(item.type == 0 || item.type == 4 || (item.type == 6 && item.consumeType != 6)){	//项目
				opt.expenseCategory = 0;

				var serviceItems = [];
				if(item.detailList && item.detailList.length>0){
					for(var detailIdx=0;detailIdx<item.detailList.length;detailIdx++){
						var detail=item.detailList[detailIdx];
						console.log(detail)
						var obj = {
							itemName:detail.itemName,
							salePrice:detail.price,
							servers:[]
						};
						detail.consumeType==1 && (obj.isComboConsume = 1);
						var employeeList=self.getEmployeeById(item.empList,detail.id);
						console.log(employeeList)
						/*for(var i=0; i<employeeList.length; i++){
							var _empId = employeeList[i].empId;
							for(var j=0; j<am.metadata.employeeList.length; j++){
								if(am.metadata.employeeList[j].id == _empId){
									employeeList[i].pos = am.metadata.employeeList[j].pos;	//添加工位pos属性
								}
							}
						}
						var posEmp = [null,null,null];	//三个工位
						for(var i=0; i<employeeList.length; i++){
							if(!posEmp[employeeList[i].pos]) posEmp[employeeList[i].pos]=[];
							posEmp[employeeList[i].pos].push(employeeList[i]); //按工位顺序入座
						}
						for(var i=0; i<posEmp.length; i++){
							console.log(posEmp[i])
							if(posEmp[i]){
								obj.servers.push({
									empNo:posEmp[i].empNo,
									empName:posEmp[i].empName
								});
							}
						}*/
						obj.servers=employeeList;
						serviceItems.push(obj);
					}
				}
				opt.serviceItems = serviceItems;
			}else if(item.type == 1){	//卖品消费
				opt.expenseCategory = 1;

				opt.products = {
					depots : [],
					servers : []
				};

				if(item.detailList && item.detailList.length>0){
					for(var detailIdx=0;detailIdx<item.detailList.length;detailIdx++){
						var detail=item.detailList[detailIdx];

						var _money = detail.money/detail.num;
						if(_money.toString().indexOf('.') != -1){	//如果是小数
							if(_money.toString().split('.')[1].length == 1){
								//一位小数
								_money = _money.toFixed(1);
							}else{
								_money = _money.toFixed(2);
							}
						}

						opt.products.depots.push({
							productName:detail.itemName,
							number:detail.num,
							salePrice: _money
						});
					}
				}
				if(item.empList && item.empList.length){
					for(var employeeId=0;employeeId<item.empList.length;employeeId++){
						var emp=item.empList[employeeId];
						if(emp.empNo != null){
							opt.products.servers.push({
								empNo:emp.empNo,
								empName:emp.empName
							});
						}
					}
				}
			}else if(item.type == 2 || item.type == 5){	//2:开卡充值,续卡充值, 5:年卡充值
				opt.billingInfo.cardFee = 0;	//卡充值:统一处理为0

				if(item.type == 2){
					if(item.consumeType==0){
						//开卡充值
						opt.expenseCategory = 2;

						if(item.cashList && item.cashList.length){
							for(var i=0; i<item.cashList.length; i++){
								if(item.cashList[i].depcode == -1 && item.cashList[i].consumeType == 2){	//工本费
									opt.billingInfo.fee_cashFee = item.cashList[i].cash;
									opt.billingInfo.fee_unionPay = item.cashList[i].unionPay;
									opt.billingInfo.fee_cooperation = item.cashList[i].cooperation;
									opt.billingInfo.fee_mall = item.cashList[i].mall;
									opt.billingInfo.fee_weixin = item.cashList[i].weixin;
									opt.billingInfo.fee_pay = item.cashList[i].pay;

									opt.billingInfo.fee_otherfee1 = item.cashList[i].otherfee1;
									opt.billingInfo.fee_otherfee2 = item.cashList[i].otherfee2;
									opt.billingInfo.fee_otherfee3 = item.cashList[i].otherfee3;
									opt.billingInfo.fee_otherfee4 = item.cashList[i].otherfee4;
									opt.billingInfo.fee_otherfee5 = item.cashList[i].otherfee5;
									opt.billingInfo.fee_otherfee6 = item.cashList[i].otherfee6;
									opt.billingInfo.fee_otherfee7 = item.cashList[i].otherfee7;
									opt.billingInfo.fee_otherfee8 = item.cashList[i].otherfee8;
									opt.billingInfo.fee_otherfee9 = item.cashList[i].otherfee9;
									opt.billingInfo.fee_otherfee10 = item.cashList[i].otherfee10;

									//开卡处理工本费加入到项目中
									opt.billingInfo.totalfeeanddebtfee = item.cashList[i].cash + item.cashList[i].unionPay + item.cashList[i].cooperation + item.cashList[i].mall + item.cashList[i].weixin + item.cashList[i].pay + item.cashList[i].otherfee1 + item.cashList[i].otherfee2 +item.cashList[i].otherfee3 + item.cashList[i].otherfee4 + item.cashList[i].otherfee5 + item.cashList[i].otherfee6 + item.cashList[i].otherfee7 + item.cashList[i].otherfee8 + item.cashList[i].otherfee9 + item.cashList[i].otherfee10;
								}else if(item.cashList[i].depcode == -1 && item.cashList[i].consumeType == 0){
									opt.billingInfo.cooperation = item.cashList[i].cooperation;
									opt.billingInfo.coupon = item.cashList[i].coupon;
									opt.billingInfo.dpFee = item.cashList[i].dianpin;
									opt.billingInfo.luckymoney = item.cashList[i].luckymoney;
									opt.billingInfo.mall = item.cashList[i].mall;
									opt.billingInfo.otherfee1 = item.cashList[i].otherfee1;
									opt.billingInfo.otherfee2 = item.cashList[i].otherfee2;
									opt.billingInfo.otherfee3 = item.cashList[i].otherfee3;
									opt.billingInfo.otherfee4 = item.cashList[i].otherfee4;
									opt.billingInfo.otherfee5 = item.cashList[i].otherfee5;
									opt.billingInfo.otherfee6 = item.cashList[i].otherfee6;
									opt.billingInfo.otherfee7 = item.cashList[i].otherfee7;
									opt.billingInfo.otherfee8 = item.cashList[i].otherfee8;
									opt.billingInfo.otherfee9 = item.cashList[i].otherfee9;
									opt.billingInfo.otherfee10 = item.cashList[i].otherfee10;
									opt.billingInfo.pay = item.cashList[i].pay;
									opt.billingInfo.pointFee = item.cashList[i].pointFee;
									opt.billingInfo.unionPay = item.cashList[i].unionPay;
									opt.billingInfo.voucherFee = item.cashList[i].voucherFee;
									opt.billingInfo.weixin = item.cashList[i].weixin;
									opt.billingInfo.cashFee = item.cashList[i].cash;
									opt.billingInfo.mdFee = item.cashList[i].mdFee;
									//工本费(total中减去工本费)
									//opt.billingInfo.total = opt.billingInfo.total - item.cashList[i].cash - item.cashList[i].unionPay;
									opt.billingInfo.total = opt.billingInfo.total;
								}
							}
							//开卡处理欠款加入到项目中
							opt.billingInfo.totalfeeanddebtfee = ( opt.billingInfo.totalfeeanddebtfee ? opt.billingInfo.totalfeeanddebtfee : 0 ) + opt.billingInfo.debtFee;
						}
					}else{
						//续卡充值
						opt.expenseCategory = 3;

						if(item.cashList && item.cashList.length){
							for(var i=0; i<item.cashList.length; i++){
								if(item.cashList[i].depcode == -1 && item.cashList[i].consumeType == 2){	//工本费
									opt.billingInfo.fee_cashFee = item.cashList[i].cash;
									opt.billingInfo.fee_unionPay = item.cashList[i].unionPay;

									//续卡处理工本费加入到项目中
									opt.billingInfo.totalfeeanddebtfee = item.cashList[i].cash + item.cashList[i].unionPay;
								}else if(item.cashList[i].depcode == -1 && item.cashList[i].consumeType == 1){
									opt.billingInfo.cooperation = item.cashList[i].cooperation;
									opt.billingInfo.coupon = item.cashList[i].coupon;
									opt.billingInfo.dpFee = item.cashList[i].dianpin;
									opt.billingInfo.luckymoney = item.cashList[i].luckymoney;
									opt.billingInfo.mall = item.cashList[i].mall;
									opt.billingInfo.otherfee1 = item.cashList[i].otherfee1;
									opt.billingInfo.otherfee2 = item.cashList[i].otherfee2;
									opt.billingInfo.otherfee3 = item.cashList[i].otherfee3;
									opt.billingInfo.otherfee4 = item.cashList[i].otherfee4;
									opt.billingInfo.otherfee5 = item.cashList[i].otherfee5;
									opt.billingInfo.otherfee6 = item.cashList[i].otherfee6;
									opt.billingInfo.otherfee7 = item.cashList[i].otherfee7;
									opt.billingInfo.otherfee8 = item.cashList[i].otherfee8;
									opt.billingInfo.otherfee9 = item.cashList[i].otherfee9;
									opt.billingInfo.otherfee10 = item.cashList[i].otherfee10;
									opt.billingInfo.pay = item.cashList[i].pay;
									opt.billingInfo.pointFee = item.cashList[i].pointFee;
									opt.billingInfo.unionPay = item.cashList[i].unionPay;
									opt.billingInfo.voucherFee = item.cashList[i].voucherFee;
									opt.billingInfo.weixin = item.cashList[i].weixin;
									opt.billingInfo.cashFee = item.cashList[i].cash;
									opt.billingInfo.mdFee = item.cashList[i].mdFee;
									//工本费(total中减去工本费)
									//opt.billingInfo.total = opt.billingInfo.total - item.cashList[i].cash - item.cashList[i].unionPay;
									opt.billingInfo.total = opt.billingInfo.total;
								}
							}
							//续卡处理欠款加入到项目中
							opt.billingInfo.totalfeeanddebtfee = ( opt.billingInfo.totalfeeanddebtfee ? opt.billingInfo.totalfeeanddebtfee : 0 ) + opt.billingInfo.debtFee;
						}
					}
				}else if(item.type == 5){	//年卡充值
					opt.expenseCategory = 3;
				}

				opt.card = {
					cardName: _this.getCardTypeById(item.cardTypeId),
					servers: []
				};
				if(item.empList && item.empList.length){
					for(var employeeId=0;employeeId<item.empList.length;employeeId++){
						var emp=item.empList[employeeId];
						if(emp.empNo != null){
							opt.card.servers.push({
								empNo:emp.empNo,
								empName:emp.empName
							});
						}
					}
				}
			}else if(item.type == 3 || item.type == 7 || (item.type == 6 && item.consumeType == 6)){	//3:套餐购买, 7:套餐赠送, 6:年卡销售
				opt.expenseCategory = 4;

				//套餐购买cardFee默认设为 0
				opt.billingInfo.cardFee = 0;
				if(item.cardList && item.cardList.length){
					for(var i=0; i<item.cardList.length; i++){
						if(item.cardList[i].depcode == -1 && item.cardList[i].consumeType == 3){
							opt.billingInfo.cardFee = item.cardList[i].cardFee;
							opt.billingInfo.presentFee = item.cardList[i].presentFee;
						}else if(item.cardList[i].depcode == -1 && item.cardList[i].consumeType == 16){	//开卡成本
							opt.billingInfo.cost_cardFee = item.cardList[i].cardFee;
							opt.billingInfo.cost_presentFee = item.cardList[i].presentFee;
						}
					}
				}
				if(item.cashList && item.cashList.length){
					for(var i=0; i<item.cashList.length; i++){
						if(item.cashList[i].depcode == -1 && item.cashList[i].consumeType == 3){	//开卡成本
							opt.billingInfo.cost_cashFee = item.cashList[i].cash;
							opt.billingInfo.cost_unionPay = item.cashList[i].unionPay;
							opt.billingInfo.cost_cooperation = item.cashList[i].cooperation;
							opt.billingInfo.cost_mall = item.cashList[i].mall;
							opt.billingInfo.cost_weixin = item.cashList[i].weixin;
							opt.billingInfo.cost_pay = item.cashList[i].pay;

							opt.billingInfo.cost_otherfee1 = item.cashList[i].otherfee1;
							opt.billingInfo.cost_otherfee2 = item.cashList[i].otherfee2;
							opt.billingInfo.cost_otherfee3 = item.cashList[i].otherfee3;
							opt.billingInfo.cost_otherfee4 = item.cashList[i].otherfee4;
							opt.billingInfo.cost_otherfee5 = item.cashList[i].otherfee5;
							opt.billingInfo.cost_otherfee6 = item.cashList[i].otherfee6;
							opt.billingInfo.cost_otherfee7 = item.cashList[i].otherfee7;
							opt.billingInfo.cost_otherfee8 = item.cashList[i].otherfee8;
							opt.billingInfo.cost_otherfee9 = item.cashList[i].otherfee9;
							opt.billingInfo.cost_otherfee10 = item.cashList[i].otherfee10;
						}else if(item.cashList[i].depcode == -1 && item.cashList[i].consumeType == 4){
							opt.billingInfo.cooperation = item.cashList[i].cooperation;
							opt.billingInfo.coupon = item.cashList[i].coupon;
							opt.billingInfo.dpFee = item.cashList[i].dianpin;
							opt.billingInfo.luckymoney = item.cashList[i].luckymoney;
							opt.billingInfo.mall = item.cashList[i].mall;
							opt.billingInfo.otherfee1 = item.cashList[i].otherfee1;
							opt.billingInfo.otherfee2 = item.cashList[i].otherfee2;
							opt.billingInfo.otherfee3 = item.cashList[i].otherfee3;
							opt.billingInfo.otherfee4 = item.cashList[i].otherfee4;
							opt.billingInfo.otherfee5 = item.cashList[i].otherfee5;
							opt.billingInfo.otherfee6 = item.cashList[i].otherfee6;
							opt.billingInfo.otherfee7 = item.cashList[i].otherfee7;
							opt.billingInfo.otherfee8 = item.cashList[i].otherfee8;
							opt.billingInfo.otherfee9 = item.cashList[i].otherfee9;
							opt.billingInfo.otherfee10 = item.cashList[i].otherfee10;
							opt.billingInfo.pay = item.cashList[i].pay;
							opt.billingInfo.pointFee = item.cashList[i].pointFee;
							opt.billingInfo.unionPay = item.cashList[i].unionPay;
							opt.billingInfo.voucherFee = item.cashList[i].voucherFee;
							opt.billingInfo.weixin = item.cashList[i].weixin;
							opt.billingInfo.cashFee = item.cashList[i].cash;
							opt.billingInfo.mdFee = item.cashList[i].mdFee;
							//工本费(total中减去工本费)
							//opt.billingInfo.total = opt.billingInfo.total - item.cashList[i].cash - item.cashList[i].unionPay;
							opt.billingInfo.total = opt.billingInfo.total;
						}
					}
				}

				opt.comboCard = {
					servers:[],
					treatments:[]
				};
				if(item.detailList && item.detailList.length>0){
					var treatment = {
						serviceItems:[]
					};
					for(var detailIdx=0;detailIdx<item.detailList.length;detailIdx++){
						var detail=item.detailList[detailIdx];
						treatment.serviceItems.push({
							name:detail.itemName,
							times:detail.num,
							money:detail.money
						});
						// opt.comboCard.treatments.push({
						// 	packageName:detail.itemName,
						// 	price:detail.money
						// });
					}
					opt.comboCard.treatments[0] = treatment;
				}
				if(item.empList && item.empList.length){
					for(var employeeId=0;employeeId<item.empList.length;employeeId++){
						var emp=item.empList[employeeId];
						if(emp.empNo != null){
							opt.comboCard.servers.push({
								empNo:emp.empNo,
								empName:emp.empName
							});
						}
					}
				}
			}

			return [user,opt];
		},
		myAdd:function(arr){	//加法解决浮点小数bug的方法
			  var self = this;
			  var m;
			  var r = [];

			  if(arr.length == 0){
			    arr = [0];
			  }

			  for (var i = 0; i < arr.length; i++) {
			    try {
			      r[i] = arr[i].toString().split('.') [1].length;
			    } catch (e) {
			      r[i] = 0;
			    }
			    r.push(r[i]);
			  }
			  m = Math.pow(10, Math.max.apply(null, r));
			  var sum = 0;
			  for (var j = 0; j < arr.length; j++) {
			    sum += self.accMul(arr[j],m);
			  }
			  return sum / m;
		},
		accMul:function(arg1, arg2){	//乘法
			  var m = 0,
			  s1 = arg1.toString(),
			  s2 = arg2.toString();
			  try {
			    m += s1.split('.') [1].length
			  } catch (e) {
			  }
			  try {
			    m += s2.split('.') [1].length
			  } catch (e) {
			  }
			  return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
		},
		getDataListByIndex:function(list,idx){
			var l=20,
				size=l*idx;
			if(size>=list.length){
				return null;
			}
			return list.slice(size,size+l);
		},
		renderDetailsData:function(data){
			for(var i=0;i<data.length;i++){
				var _class = i%2 == 0 ? 'odd' : '';
				var item = data[i];
				var $html = $('<tr class="basictr '+ _class +' am-clickable" billid="'+item.id+'">' +
                                '<td style="width:10%" class="billno">' +
                                    '<div class="tdwrap billnoBox am-clickable"></div>' +
                                '</td>' +
                                '<td style="width:10%">' +
                                    '<div class="tdwrap">' +
                                        '<span class="am-clickable consumetime">'+ (item.consumeTime ? (new Date(item.consumeTime-0).format("mm/dd HH:MM")) : "") +'</span>' +
                                    '</div>' +
                                '</td>' +
                                '<td style="width:9%">' +
                                    '<div class="tdwrap addcustomer am-clickable"></div>' +
                                '</td>' +
                                '<td style="width:6%">' +
                                    '<div class="tdwrap client am-clickable"></div>' +
                                '</td>' +
                                '<td style="width:4%">' +
                                    '<div class="tdwrap sextd"></div>' +
                                '</td>' +
                                '<td style="width:8%">' +
                                    '<div class="tdwrap consumptiontype"></div>' +
                                '</td>' +
                                '<td style="width:29%">' +
                                    '<div class="tdwrap consumptionamount">' +
                                        '<dl><dt></dt><dd></dd></dl>' +
                                    '</div>' +
                                '</td>' +
                                '<td style="width:6%">' +
                                    '<div class="tdwrap jetd">' +
                                       '<span></span>' +
                                    '</div>' +
                                '</td>' +
                                '<td style="width:6%">' +
                                    '<div class="tdwrap accountedfor">' +
                                       '<span></span>' +
                                    '</div>' +
                                '</td>' +
                                '<td style="width:12%" class="brnone">' +
                                    '<div class="am-clickable print">打印小票</div>' +
                                    '<div class="am-clickable revoke">撤单</div>' +
                                '</td>' +
                            '</tr>').data("item",item);

				//客户
				var _addcustomer = item.memberId == 0 ? "散客" : item.name;
				var _sex = item.sex == "M" ? "man" : "women";
				var _sexval = item.sex == "M" ? "男" : "女";
				// 服务卖品能否修改
				var $billNo = (item.billNo || "");
				if(am.metadata.shopPropertyField.mgjBillingType == "0" && am.metadata.userInfo.operatestr.indexOf("B") > -1){//录单模式
					$billNo = '<a href="javascript:void(0)" class="am-clickable">'+ (item.billNo || "") +'</a>';
				}
				else if(am.metadata.shopPropertyField.mgjBillingType == "1"){//开单模式
					if(am.metadata.userInfo.operatestr.indexOf("B") > -1 && am.metadata.userInfo.operatestr.indexOf("a37") > -1){//有全部权限
						$billNo = '<a href="javascript:void(0)" class="am-clickable">'+ (item.billNo || "") +'</a>';
					}else if(item.type == "0" || item.type == "1" || item.type == "4"){//服务和卖品和套餐消费
						$billNo = (item.billNo || "");
					}else{
						$billNo = '<a href="javascript:void(0)" class="am-clickable">'+ (item.billNo || "") +'</a>';
					}
				}else{
					$billNo = (item.billNo || "");
				}
				// var $billNo = '';
				// if(am.metadata.shopPropertyField.mgjBillingType == "1" && (item.type == "0" || item.type == "1")){
				// 	$billNo = item.billNo || "";
				// }else{
				// 	$billNo = '<a href="javascript:void(0)" class="am-clickable">'+ (item.billNo || "") +'</a>';
				// }
				$html.find(".billnoBox").html($billNo);
				$html.find(".addcustomer").html('<p class="'+ _sex +'">'+ _addcustomer +'</p>');
				if(item.memberId==0){
					$html.find(".addcustomer").removeClass('am-clickable');
				}
				$html.find(".sextd").html('<a href="javascript:void(0)" class="am-clickable">'+_sexval+'</a>');
				if(item.customer && item.customer.clientflag){
					var client = item.customer.clientflag==1?'计客':'不计客';
					$html.find(".client").html('<a href="javascript:void(0)" class="am-clickable">'+client+'</a>');
				}
				
				//消费类型
				var $monetary = '';
				var typeData = {0:"项目消费",1:"卖品消费",3:"套餐购买",4:"套餐消费",5:"年卡充值",7:"套餐赠送"};
				if(typeData[item.type]){
					$monetary = typeData[item.type];
				}else{
					if(item.type==2){
						if(item.consumeType==0){
							//开卡充值
							$monetary = '开卡充值';
						}else{
							//续卡充值
							$monetary = '续卡充值';
						}
					}
					if(item.type==6){
						if(item.consumeType==6){
							//年卡销售
							$monetary = '年卡销售';
						}else{
							//年卡消费
							$monetary = '年卡消费';
						}
					}
				}
				$html.find(".consumptiontype").html($monetary);

				var $revoke = $html.find(".revoke");
				if(item.type==0 || item.type==4 || (item.type==6 && item.consumeType!=6)){
					//项目
					$revoke.data("revoke","M0");
				}else if(item.type==1){
					//卖品
					$revoke.data("revoke","M2");
				}else if(item.type==2){
					//开卡充值
					$revoke.data("revoke","M1");
				}else if(item.type==3){
					//套餐购买
					$revoke.data("revoke","M3");
				}else if(item.type==5 || (item.type==6 && item.consumeType==6)){
					//年卡销售
					$revoke.data("revoke","M4");
				}

				//详情tr
				var $childTr = $('<tr class="childtr">' +
									'<td colspan="10" class="bbnone">' +
										'<div class="tdchildren">' +
											'<table width="100%" cellpadding="0" cellspacing="0" class="cm_table childtable">' +
												'<tbody>' +
													'<tr>' +
														'<td class="col1" style="width:13%"></td>' +
														'<td class="col2" style="width:18%"></td>' +
													'</tr>' +
												'</tbody>' +
											'</table>' +
										'</div>' +
									'</td>' +
								'</tr>').data("item",item);

				//col1
				if(item.memberId == 0){	//散客
					$childTr.find('.col1').append('<dl><dt>散客</dt><dd></dd></dl><dl><dt>操作人</dt><dd>'+ item.operatorName +'</dd></dl>');
				}else{
					var $phonecard = $('<dl><dt>会员手机</dt><dd>'+ (item.mobile ? am.processPhone(item.mobile) : '无') +'</dd></dl><dl><dt>'+ (self.getCardTypeById(item.cardTypeId)!=undefined?'('+self.getCardTypeById(item.cardTypeId)+')':'') +'</dt><dd>'+ (item.cardId == "null" ? '' : item.cardId) +'</dd></dl><dl><dt class="dt_red">'+ (item.memberShopName ? item.memberShopName : '') +'</dt></dl><dl><dt>操作人</dt><dd>'+ item.operatorName +'</dd></dl>');
					$childTr.find('.col1').append( $phonecard );
				}

				var comentDOM;
				if(item.detail){
					comentDOM = '<br/><div class="comment iconfont icon-comments am-clickable"><div class="comment-content">'+item.detail+'</div></div>';
				}else{
					comentDOM = '<br/><div class="comment iconfont icon-comments am-clickable am-disabled"></div>';
				}
				//col2
				var $dl = $('<dl><dt><p></p><span>消费总额</span>'+comentDOM+'</dt><dd></dd></dl>');


				var _totleFee = [];
				//<!-- 消费扣卡 -->
				var $monetary2 = '';
				var paymentmethodArr = [];
				if(item.cardList && item.cardList.length){
					for(var cardId=0;cardId<item.cardList.length;cardId++){
						var card=item.cardList[cardId];
						if(card.depcode == -1 && card.consumeType != 4 && card.consumeType != 16){
							if(card.cardFee > 0 && item.type != 2 && item.type != 5){
								$monetary2+=('<span>'+card.cardFee+'<b class="c_red">(卡金)</b></span>');
								paymentmethodArr.push('卡金');
								_totleFee.push(card.cardFee);
							}
							if(card.presentFee > 0){
								$monetary2+=('<span>'+card.presentFee+'<b class="c_red">(赠金)</b></span>');
								paymentmethodArr.push('赠金');
								if(item.type != 2){	//不为"开卡充值","续卡充值"时,进行累加
									_totleFee.push(card.presentFee);
								}
							}
							if(card.divideFee>0){
								$monetary2+=('<span>'+card.divideFee+'<b class="c_red">(分期赠金)</b></span>');
								paymentmethodArr.push('分期赠金');
								_totleFee.push(card.divideFee);
							}
							if(card.treatFee>0){
								$monetary2+=('<span>'+card.treatFee+'<b class="c_red">(套餐卡金)</b></span>');
								paymentmethodArr.push('套餐卡金');
								_totleFee.push(card.treatFee);
							}
							if(card.treatPresentFee>0){
								$monetary2+=('<span>'+card.treatPresentFee+'<b class="c_red">(套餐赠金)</b></span>');
								paymentmethodArr.push('套餐赠金');
								_totleFee.push(card.treatPresentFee);
							}
							if(card.yearFee>0){
								$monetary2+=('<span>'+card.yearFee+'<b class="c_red">(年卡卡金)</b></span>');
								paymentmethodArr.push('年卡卡金');
								_totleFee.push(card.yearFee);
							}
						}
					}
				}

				if(
					$monetary == '套餐消费' ||
					($monetary.indexOf("消费") != -1 && (paymentmethodArr.indexOf("卡金")!=-1 || paymentmethodArr.indexOf("赠金")!=-1 || paymentmethodArr.indexOf("套餐卡金")!=-1 || paymentmethodArr.indexOf("套餐赠金")!=-1))
				){
					//作弊，判断到含消费字眼的，就显示这个
					$childTr.find('.col1').append('<div class="signature am-clickable">查看签名</div>');
				}
				//<!-- 消费付现 -->
				if(item.cashList && item.cashList.length){
					for(var cashId=0;cashId<item.cashList.length;cashId++){
						var cash=item.cashList[cashId];
						if(cash.depcode == -1 && cash.consumeType != 2 && cash.consumeType != 3){
							if(item.cardType == 2 || cash.cash > 0){
								$monetary2+=('<span>'+cash.cash+'<b class="c_red">(现金)</b></span>');
								paymentmethodArr.push('现金');
								_totleFee.push(cash.cash);
							}
							if(item.cardType == 2 || cash.unionPay > 0){
								$monetary2+=('<span>'+cash.unionPay+'<b class="c_red">(银联)</b></span>');
								paymentmethodArr.push('银联');
								_totleFee.push(cash.unionPay);
							}
							if(cash.cooperation > 0){
								$monetary2+=('<span>'+cash.cooperation+'<b class="c_red">(合作券)</b></span>');
								paymentmethodArr.push('合作券');
								_totleFee.push(cash.cooperation);
							}
							if(cash.mall > 0){
								$monetary2+=('<span>'+cash.mall+'<b class="c_red">(商场卡)</b></span>');
								paymentmethodArr.push('商场卡');
								_totleFee.push(cash.mall);
							}
							if(cash.voucherFee > 0){
								$monetary2+=('<span>'+cash.voucherFee+'<b class="c_red">(代金券)</b></span>');
								paymentmethodArr.push('代金券');
								_totleFee.push(cash.voucherFee);
							}
							if(cash.weixin > 0){
								$monetary2+=('<span>'+cash.weixin+'<b class="c_red">(微信支付)</b></span>');
								paymentmethodArr.push('微信支付');
								_totleFee.push(cash.weixin);
							}
							if(cash.pay > 0){
								$monetary2+=('<span>'+cash.pay+'<b class="c_red">(支付宝)</b></span>');
								paymentmethodArr.push('支付宝');
								_totleFee.push(cash.pay);
							}
							if(cash.pointfee > 0){
								$monetary2+=('<span>'+cash.pointfee+'<b class="c_red">(积分)</b></span>');
								paymentmethodArr.push('积分');
							}
							if(cash.mdFee > 0){
								$monetary2+=('<span>'+cash.mdFee+'<b class="c_red">(免单)</b></span>');
								paymentmethodArr.push('免单');
								_totleFee.push(cash.mdFee);
							}
							if(cash.luckymoney>0){
								$monetary2+=('<span>'+cash.luckymoney+'<b class="c_red">(红包)</b></span>');
								paymentmethodArr.push('红包');
								_totleFee.push(cash.luckymoney);
							}
							if(cash.coupon>0){
								$monetary2+=('<span>'+cash.coupon+'<b class="c_red">(优惠券)</b></span>');
								paymentmethodArr.push('优惠券');
								_totleFee.push(cash.coupon);
							}
							if(cash.dianpin>0){
								$monetary2+=('<span>'+cash.dianpin+'<b class="c_red">(大众点评)</b></span>');
								paymentmethodArr.push('大众点评');
								_totleFee.push(cash.dianpin);
							}
							var otherpaytypes=self.getotherPaytypes(cash);
							for(var kk in otherpaytypes){
								$monetary2+=('<span>'+otherpaytypes[kk].value+'<b class="c_red">('+otherpaytypes[kk].name+')</b></span>');
								paymentmethodArr.push(otherpaytypes[kk].name);
								_totleFee.push(otherpaytypes[kk].value);
							}
						}
					}
				}

				//欠款
				if(item.debtFee>0){
					$monetary2+=('<span>'+item.debtFee+'<b class="c_red">(欠款)</b></span>');
					paymentmethodArr.push('欠款');
					_totleFee.push(item.debtFee);
					if(item.remainFee==0){
						$monetary2+=('<span class="c_red">(已还清)</span>');
					}else{
						$monetary2+=('<span class="c_red">(已还)'+(item.debtFee - item.remainFee)+'</span>');
					}
				}

				//开卡成本
				if(item.cardList && item.cardList.length){
					for(var cardCostIdx=0;cardCostIdx<item.cardList.length;cardCostIdx++){
						var cardCost=item.cardList[cardCostIdx];
						if(cardCost.depcode == -1 && cardCost.consumeType == 16){
							if(cardCost.cardFee > 0 || cardCost.presentFee > 0){
								$monetary2+=('<span style="margin-top:5px;">开卡成本</span>');
								if(cardCost.cardFee > 0){
									$monetary2+=('<span>'+cardCost.cardFee+'<b class="c_red">(卡金)</b></span>');
									paymentmethodArr.push('卡金');
									_totleFee.push(cardCost.cardFee);
								}
								if(cardCost.presentFee > 0){
									$monetary2+=('<span>'+cardCost.presentFee+'<b class="c_red">(赠金)</b></span>');
									paymentmethodArr.push('赠金');
									_totleFee.push(cardCost.presentFee);
								}
							}
						}
					}
				}
				if(item.cashList && item.cashList.length){
					for(var cashCostIdx=0;cashCostIdx<item.cashList.length;cashCostIdx++){
						var cashCost=item.cashList[cashCostIdx];
						if(cashCost.depcode == -1 && cashCost.consumeType == 3){
							// if(cashCost.cash > 0 || cashCost.unionPay > 0 || cashCost.cooperation > 0 || cashCost.mall > 0 || cashCost.weixin > 0 || cashCost.pay > 0){

								var $monetary2_temp = '';
								if(cashCost.cash > 0){
									$monetary2_temp+=('<span>'+cashCost.cash+'<b class="c_red">(现金)</b></span>');
									paymentmethodArr.push('现金');
									_totleFee.push(cashCost.cash);
								}
								if(cashCost.unionPay > 0){
									$monetary2_temp+=('<span>'+cashCost.unionPay+'<b class="c_red">(银联)</b></span>');
									paymentmethodArr.push('银联');
									_totleFee.push(cashCost.unionPay);
								}
								if(cashCost.cooperation > 0){
									$monetary2_temp+=('<span>'+cashCost.cooperation+'<b class="c_red">(合作券)</b></span>');
									paymentmethodArr.push('合作券');
									_totleFee.push(cashCost.cooperation);
								}
								if(cashCost.mall > 0){
									$monetary2_temp+=('<span>'+cashCost.mall+'<b class="c_red">(商场卡)</b></span>');
									paymentmethodArr.push('商场卡');
									_totleFee.push(cashCost.mall);
								}
								if(cashCost.weixin > 0){
									$monetary2_temp+=('<span>'+cashCost.weixin+'<b class="c_red">(微信支付)</b></span>');
									paymentmethodArr.push('微信支付');
									_totleFee.push(cashCost.weixin);
								}
								if(cashCost.pay > 0){
									$monetary2_temp+=('<span>'+cashCost.pay+'<b class="c_red">(支付宝)</b></span>');
									paymentmethodArr.push('支付宝');
									_totleFee.push(cashCost.pay);
								}
								if(cashCost.luckymoney>0){
									$monetary2_temp+=('<span>'+cashCost.luckymoney+'<b class="c_red">(红包)</b></span>');
									paymentmethodArr.push('红包');
									_totleFee.push(cashCost.luckymoney);
								}
								if(cashCost.coupon>0){
									$monetary2_temp+=('<span>'+cashCost.coupon+'<b class="c_red">(优惠券)</b></span>');
									paymentmethodArr.push('优惠券');
									_totleFee.push(cashCost.coupon);
								}
								if(cashCost.dianpin>0){
									$monetary2_temp+=('<span>'+cashCost.dianpin+'<b class="c_red">(大众点评)</b></span>');
									paymentmethodArr.push('大众点评');
									_totleFee.push(cashCost.dianpin);
								}
								var otherpaytypes=self.getotherPaytypes(cashCost);
								for(var kk in otherpaytypes){
									$monetary2_temp+=('<span>'+otherpaytypes[kk].value+'<b class="c_red">('+otherpaytypes[kk].name+')</b></span>');
									paymentmethodArr.push(otherpaytypes[kk].name);
									_totleFee.push(otherpaytypes[kk].value);
								}
								if($monetary2_temp){
									if($monetary2.indexOf('开卡成本') == -1){
										$monetary2+='<span style="margin-top:5px;">开卡成本</span>';
									}
									$monetary2+=$monetary2_temp;
								}
							//}
						}
					}
				}
				//工本费
				var cashSumMoney=0;
				var cashSumMoneyothers=0;
				if(item.cashList && item.cashList.length){
					for(var basis=0;basis<item.cashList.length;basis++){
						var basisItem=item.cashList[basis];
						if(basisItem.depcode == -1 && basisItem.consumeType == 2){
							$monetary2+=('<span>工本费</span>');
							$monetary2+=('<span>'+basisItem.cash+'<b class="c_red">(现金)</b></span>');paymentmethodArr.push('现金');_totleFee.push(basisItem.cash);
							$monetary2+=('<span>'+basisItem.unionPay+'<b class="c_red">(银联)</b></span>');paymentmethodArr.push('银联');_totleFee.push(basisItem.unionPay);
							if(basisItem.cooperation > 0){
								$monetary2+=('<span>'+basisItem.cooperation+'<b class="c_red">(合作券)</b></span>');
								paymentmethodArr.push('合作券');
								_totleFee.push(basisItem.cooperation);
							}
							if(basisItem.mall > 0){
								$monetary2+=('<span>'+basisItem.mall+'<b class="c_red">(商场卡)</b></span>');
								paymentmethodArr.push('商场卡');
								_totleFee.push(basisItem.mall);
							}
							if(basisItem.weixin > 0){
								$monetary2+=('<span>'+basisItem.weixin+'<b class="c_red">(微信支付)</b></span>');
								paymentmethodArr.push('微信支付');
								_totleFee.push(basisItem.weixin);
							}
							if(basisItem.pay > 0){
								$monetary2+=('<span>'+basisItem.pay+'<b class="c_red">(支付宝)</b></span>');
								paymentmethodArr.push('支付宝');
								_totleFee.push(basisItem.pay);
							}
							if(basisItem.luckymoney>0){
								$monetary2+=('<span>'+basisItem.luckymoney+'<b class="c_red">(红包)</b></span>');
								paymentmethodArr.push('红包');
								_totleFee.push(basisItem.luckymoney);
							}
							if(basisItem.coupon>0){
								$monetary2+=('<span>'+basisItem.coupon+'<b class="c_red">(优惠券)</b></span>');
								paymentmethodArr.push('优惠券');
								_totleFee.push(basisItem.coupon);
							}
							if(basisItem.dianpin>0){
								$monetary2+=('<span>'+basisItem.dianpin+'<b class="c_red">(大众点评)</b></span>');
								paymentmethodArr.push('大众点评');
								_totleFee.push(basisItem.dianpin);
							}
							var otherpaytypes=self.getotherPaytypes(basisItem);

							for(var kk in otherpaytypes){
								$monetary2+=('<span>'+otherpaytypes[kk].value+'<b class="c_red">('+otherpaytypes[kk].name+')</b></span>');
								paymentmethodArr.push(otherpaytypes[kk].name);
								_totleFee.push(otherpaytypes[kk].value);
							}
						}
						//算实际入账
						var others=self.getotherPaytypes(basisItem);
						var othersArr = [];
						for(var cc in others){
							othersArr.push(others[cc].value);
							//cashSumMoneyothers+=others[cc].value;
						}
						cashSumMoneyothers = self.myAdd(othersArr);
						if(basisItem.consumeType != 2 && basisItem.consumeType != 3 && basisItem.depcode == -1){
							//cashSumMoney+=(basisItem.cash + basisItem.unionPay + basisItem.cooperation + basisItem.mall + basisItem.weixin + basisItem.pay+ cashSumMoneyothers);
							cashSumMoney = self.myAdd([basisItem.cash,basisItem.unionPay,basisItem.cooperation,basisItem.mall,basisItem.weixin,basisItem.pay,cashSumMoneyothers]);
						}
					}
				}

				$dl.find('dt p').html('¥'+self.myAdd(_totleFee));
				$dl.find('dd').append($monetary2);
				$childTr.find('.col2').append( $dl );

				//显示部门业绩
				this.renderDeptPerf($childTr.find('.col2'),item);


				//项目,售价,店内业绩,工位/业绩
				var projectArr = [];

				if(item.type == 0 || item.type == 4 || (item.type == 6 && item.consumeType != 6)){	//0:项目消费, 4:套餐消费, 6:年卡消费
					var $col3 = $('<td class="col3">' +
								'<table width="100%" cellpadding="0" cellspacing="0" class="cm_table col3table">' +
                                    '<thead>' +
                                        '<tr>' +
                                            '<td style="width:40%"><div class="tdwrap">项目</div></td>' +
                                            '<td style="width:8%"><div class="tdwrap">价格</div></td>' +
                                            '<td style="width:52%"><div class="tdwrap">工位/业绩</div></td>' +
                                        '</tr>' +
                                    '</thead>' +
                                    '<tbody></tbody>' +
                                '</table>' +
							'</td>');
					$childTr.find('.childtable > tbody > tr').append($col3);
					if(item.detailList && item.detailList.length>0){
						for(var detailIdx=0;detailIdx<item.detailList.length;detailIdx++){
							var detail=item.detailList[detailIdx];
							var $detailMore=$('<tr class="detailtr"></tr>').data("item",detail);

							$detailMore.append('<td><div class="tdwrap sale"></div></td>');
							$detailMore.append('<td><div class="tdwrap price">¥'+detail.price+'</div></td>');

							var $sale=$detailMore.find(".sale");
							if((item.type == 0 || item.type == 4 || (item.type == 6 && item.consumeType != 6)) && detail.consumeType != 1 && detail.consumeType != 4){//只有项目能修改
								$sale.append($('<span class="projectName"><a href="javascript:void(0)" class="am-clickable editDep">'+this.getDepName(detail.depcode)+'</a><a href="javascript:void(0)" class="am-clickable editItem">'+detail.itemName+'</a></span>').data("item",$.extend(detail,{billNo:item.billNo,operatorId:item.operatorId,billtype:item.type})));
							}else{
								$sale.append($('<span class="projectName"><a href="javascript:void(0)" class="am-clickable editDep">'+this.getDepName(detail.depcode)+'</a><a href="javascript:void(0)" class="noclick">'+detail.itemName+'</a></span>').data("item",$.extend(detail,{billNo:item.billNo,operatorId:item.operatorId,billtype:item.type})));
							}
							if((item.type == 0 || item.type == 4 || (item.type == 6 && item.consumeType != 6)) || item.type == 1){
							}else {
								$sale.find('.editDep').hide();
							}
							$sale.append($('<span class="num">x '+ detail.num +'</span>'));
							projectArr.push(detail.itemName);

							//工位/业绩
							if(item.type == 1 || item.type == 3 || item.consumeType == 6){//不显示指定非指定
								if(item.empList && item.empList.length){
									$detailMore.append($('<td class="employeeTable"><table class="table"><tbody></tbody></table></td>'));
									var $employeeTable=$detailMore.find(".employeeTable tbody");

									for(var employeeId=0;employeeId<item.empList.length;employeeId++){
										var emp=item.empList[employeeId];
										if(emp.empNo != null){
											var $employee="";
											//添加员工
											$employee = ('<tr>'+
												'<td class="changeEmployee" data-id='+emp.empId+'><div class="tdwrap"><a class="am-clickable" href="javascript:void(0)">'+(emp.empNo+'号'+emp.dutyTypeName+'('+emp.empName+')')+'</a></div></td>'+
												'<td><div class="am-clickable tdedit">业绩:¥'+ emp.fee +'<ul><li class="am-clickable updateli">修改</li><li class="am-clickable delli">删除</li></ul></div></td>' +
											'</tr>');
		                                    $employeeTable.append($employee);
		                                    var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
		                                    $employeeTable.data("item",{empList:item.empList,other:otherSendMessage});
		                                    //添加员工DOM
		                                    if(employeeId == item.empList.length - 1){
		                                    	$employeeTable.append($('<tr><td class="am-clickable addcust" colspan="2"><div class="am-clickable"></div></td></tr>'));
		                                    }
										}
									}
								}else{
									$detailMore.append($('<td class="employeeTable"><table class="table"><tbody></tbody></table></td>'));
								}
							}else{//显示指定非指定
								//添加员工
								$detailMore.append($('<td class="employeeTable"><table class="table"><tbody></tbody></table></td>'));
								var $employeeTable=$detailMore.find(".employeeTable tbody");
								var employeeList=self.getEmployeeById(item.empList,detail.id);

								var $employee=self.renderEmployee(employeeList);
								var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
								$employeeTable.data("item",{empList:employeeList,other:otherSendMessage});
								$employeeTable.append($employee);
								//添加员工DOM
								$employeeTable.append($('<tr><td class="am-clickable addcust" colspan="3"><div class="am-clickable"></div></td></tr>'));
							}

							$childTr.find('.col3 .col3table > tbody').append( $detailMore );
						}
					}
				}else if(item.type == 1){	//1:卖品消费
					var $col3 = $('<td class="col3">' +
								'<table width="100%" cellpadding="0" cellspacing="0" class="cm_table col3table">' +
                                    '<thead>' +
                                        '<tr>' +
                                            '<td style="width:30%"><div class="tdwrap">卖品</div></td>' +
                                            '<td style="width:10%"><div class="tdwrap">数量</div></td>' +
                                            '<td style="width:10%"><div class="tdwrap">价格</div></td>' +
                                            '<td style="width:50%"><div class="tdwrap">工位/提成</div></td>' +
                                        '</tr>' +
                                    '</thead>' +
                                    '<tbody></tbody>' +
                                '</table>' +
							'</td>');
					$childTr.find('.childtable > tbody > tr').append($col3);
					if(item.detailList && item.detailList.length>0){
						for(var detailIdx=0;detailIdx<item.detailList.length;detailIdx++){
							var detail=item.detailList[detailIdx];
							var $detailMore=$('<tr class="detailtr"></tr>').data("item",detail);

							$detailMore.append('<td><div class="tdwrap sale"></div></td>');
							$detailMore.append('<td><div class="tdwrap salenum">'+ (detail.num== -99?"不限":detail.num) +'</div></td>');

							var _money = detail.money/detail.num;
							if(_money.toString().indexOf('.') != -1){	//如果是小数
								if(_money.toString().split('.')[1].length == 1){
									//一位小数
									_money = _money.toFixed(1);
								}else{
									_money = _money.toFixed(2);
								}
							}
							$detailMore.append('<td><div class="tdwrap money">¥'+_money+'</div></td>');

							var $sale=$detailMore.find(".sale");
							if((item.type == 0 || item.type == 4 || (item.type == 6 && item.consumeType != 6)) && detail.consumeType != 1 && detail.consumeType != 4){//只有项目能修改
								$sale.append($('<span class="projectName"><a href="javascript:void(0)" class="am-clickable editDep">'+this.getDepName(detail.depcode)+'</a><a href="javascript:void(0)" class="am-clickable editItem">'+detail.itemName+'</a></span>').data("item",$.extend(detail,{billNo:item.billNo,operatorId:item.operatorId,billtype:item.type})));
							}else{
								$sale.append($('<span class="projectName"><a href="javascript:void(0)" class="am-clickable editDep">'+this.getDepName(detail.depcode)+'</a><a href="javascript:void(0)" class="noclick">'+detail.itemName+'</a></span>').data("item",$.extend(detail,{billNo:item.billNo,operatorId:item.operatorId,billtype:item.type})));
							}
							if((item.type == 0 || item.type == 4 || (item.type == 6 && item.consumeType != 6)) || item.type == 1){
							}else {
								$sale.find('.editDep').hide();
							}
							projectArr.push(detail.itemName);

							//工位/提成
							if(detailIdx == 0){
								if(item.empList && item.empList.length){
									$detailMore.append($('<td class="employeeTable" rowspan="'+ item.detailList.length +'"><table class="table"><tbody></tbody></table></td>'));
									var $employeeTable=$detailMore.find(".employeeTable tbody");

									for(var employeeId=0;employeeId<item.empList.length;employeeId++){
										var emp=item.empList[employeeId];
										if(emp.empNo != null){
											var $employee="";
											//添加员工
											$employee = ('<tr>'+
												'<td class="changeEmployee" data-id='+emp.empId+'><div class="tdwrap"><a class="am-clickable" href="javascript:void(0)">'+(emp.empNo+'号'+emp.dutyTypeName+'('+emp.empName+')')+'</a></div></td>'+
												'<td><div class="am-clickable tdedit">业绩:¥'+ emp.fee +',提成:¥'+ emp.gain +'<ul><li class="am-clickable updateli">修改</li><li class="am-clickable delli">删除</li></ul></div></td>' +
											'</tr>');
		                                    $employeeTable.append($employee);
		                                    var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
		                                    $employeeTable.data("item",{empList:item.empList,other:otherSendMessage});
										}
										//添加员工DOM
	                                    if(employeeId == item.empList.length - 1){
	                                    	$employeeTable.append($('<tr><td class="am-clickable addcust" colspan="2"><div class="am-clickable"></div></td></tr>'));
	                                    }
									}
								}else{
									$detailMore.append($('<td class="employeeTable" rowspan="'+ item.detailList.length +'"><table class="table"><tbody><tr><td class="am-clickable addcust" colspan="2"><div class="am-clickable"></div></td></tr></tbody></table></td>'));
									var $employeeTable=$detailMore.find(".employeeTable tbody");
									var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
		                            $employeeTable.data("item",{empList:item.empList,other:otherSendMessage});
								}
							}

							$childTr.find('.col3 .col3table > tbody').append( $detailMore );
						}
					}
				}else if(item.type == 2 || item.type == 5){	//2:开卡充值,续卡充值, 5:年卡充值
					var detail = null;
					if(item.type == 2){
						if(item.consumeType==0){
							//开卡充值
							projectArr.push("开卡充值");
						}else{
							//续卡充值
							projectArr.push("续卡充值");
						}
					}else if(item.type == 5){	//年卡充值
						projectArr.push("年卡充值");
					}

					var $col3 = $('<td class="col3">' +
								'<table width="100%" cellpadding="0" cellspacing="0" class="cm_table col3table">' +
                                    '<thead>' +
                                        '<tr>' +
                                            '<td><div class="tdwrap">工位/提成</div></td>' +
                                        '</tr>' +
                                    '</thead>' +
                                    '<tbody></tbody>' +
                                '</table>' +
							'</td>');
					$childTr.find('.childtable > tbody > tr').append($col3);
					var $employeeTable=$('<tr><td class="employeeTable"><table class="table"><tbody></tbody></table></td></tr>');
					var $employee = '';
					if(item.empList && item.empList.length){
						for(var employeeId=0;employeeId<item.empList.length;employeeId++){
							var emp=item.empList[employeeId];
							if(emp.empNo != null){
								$employee += ('<tr>'+
									'<td class="changeEmployee" data-id='+emp.empId+'><div class="tdwrap"><a class="am-clickable" href="javascript:void(0)">'+(emp.empNo+'号'+emp.dutyTypeName+'('+emp.empName+')')+'</a></div></td>'+
									'<td><div class="am-clickable tdedit">业绩:¥'+ emp.fee +',提成:¥'+ emp.gain +'<ul><li class="am-clickable updateli">修改</li><li class="am-clickable delli">删除</li></ul></div></td>' +
								'</tr>');
							}
							//添加员工DOM
                            if(employeeId == item.empList.length - 1){
                            	$employee += '<tr><td class="am-clickable addcust" colspan="2"><div class="am-clickable"></div></td></tr>';
                            }
						}
					}else{
						$employee = '<tr><td class="am-clickable addcust" colspan="2"><div class="am-clickable"></div></td></tr>';
					}
					var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
					$employeeTable.find("tbody").append($employee).data("item",{empList:item.empList,other:otherSendMessage});
					$childTr.find('.col3 .col3table > tbody').append($employeeTable);
				}else if(item.type == 3 || item.type == 7 || (item.type == 6 && item.consumeType == 6)){	//3:套餐购买, 7:套餐赠送, 6:年卡销售
					var $col3 = $('<td class="col3">' +
								'<table width="100%" cellpadding="0" cellspacing="0" class="cm_table col3table">' +
                                    '<thead>' +
                                        '<tr>' +
                                            '<td style="width:30%"><div class="tdwrap">项目</div></td>' +
                                            '<td style="width:10%"><div class="tdwrap">数量</div></td>' +
                                            '<td style="width:10%"><div class="tdwrap">总价</div></td>' +
                                            '<td style="width:50%"><div class="tdwrap">工位/提成</div></td>' +
                                        '</tr>' +
                                    '</thead>' +
                                    '<tbody></tbody>' +
                                '</table>' +
							'</td>');
					$childTr.find('.childtable > tbody > tr').append($col3);
					if(item.detailList && item.detailList.length>0){
						for(var detailIdx=0;detailIdx<item.detailList.length;detailIdx++){
							var detail=item.detailList[detailIdx];
							var $detailMore=$('<tr class="detailtr"></tr>').data("item",detail);

							$detailMore.append('<td><div class="tdwrap sale"></div></td>');
							$detailMore.append('<td><div class="tdwrap salenum">'+ (detail.num== -99?"不限":detail.num) +'</div></td>');

							var _money = detail.money;
							if(_money.toString().indexOf('.') != -1){	//如果是小数
								if(_money.toString().split('.')[1].length == 1){
									//一位小数
									_money = _money.toFixed(1);
								}else{
									_money = _money.toFixed(2);
								}
							}

							$detailMore.append('<td><div class="tdwrap money">¥'+_money+'</div></td>');

							var $sale=$detailMore.find(".sale");
							if((item.type == 0 || item.type == 4 || (item.type == 6 && item.consumeType != 6)) && detail.consumeType != 1 && detail.consumeType != 4){//只有项目能修改
								$sale.append($('<span class="projectName"><a href="javascript:void(0)" class="am-clickable editDep">'+this.getDepName(detail.depcode)+'</a><a href="javascript:void(0)" class="am-clickable editItem">'+detail.itemName+'</a></span>').data("item",$.extend(detail,{billNo:item.billNo,operatorId:item.operatorId,billtype:item.type})));
							}else{
								$sale.append($('<span class="projectName"><a href="javascript:void(0)" class="am-clickable editDep">'+this.getDepName(detail.depcode)+'</a><a href="javascript:void(0)" class="noclick">'+detail.itemName+'</a></span>').data("item",$.extend(detail,{billNo:item.billNo,operatorId:item.operatorId,billtype:item.type})));
							}
							if((item.type == 0 || item.type == 4 || (item.type == 6 && item.consumeType != 6)) || item.type == 1){
							}else {
								$sale.find('.editDep').hide();
							}
							projectArr.push(detail.itemName);

							//工位/提成
							if(detailIdx == 0){
								if(item.empList && item.empList.length){
									$detailMore.append($('<td class="employeeTable" rowspan="'+ item.detailList.length +'"><table class="table"><tbody></tbody></table></td>'));
									var $employeeTable=$detailMore.find(".employeeTable tbody");

									for(var employeeId=0;employeeId<item.empList.length;employeeId++){
										var emp=item.empList[employeeId];
										if(emp.empNo != null){
											var $employee="";
											//添加员工
											$employee = ('<tr>'+
												'<td class="changeEmployee" data-id='+emp.empId+'><div class="tdwrap"><a class="am-clickable" href="javascript:void(0)">'+(emp.empNo+'号'+emp.dutyTypeName+'('+emp.empName+')')+'</a></div></td>'+
												'<td><div class="am-clickable tdedit">业绩:¥'+ emp.fee +',提成:¥'+ emp.gain +'<ul><li class="am-clickable updateli">修改</li><li class="am-clickable delli">删除</li></ul></div></td>' +
											'</tr>');
		                                    $employeeTable.append($employee);
		                                    var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
		                                    $employeeTable.data("item",{empList:item.empList,other:otherSendMessage});
										}
										//添加员工DOM
	                                    if(employeeId == item.empList.length - 1){
	                                    	$employeeTable.append($('<tr><td class="am-clickable addcust" colspan="2"><div class="am-clickable"></div></td></tr>'));
	                                    }
									}
								}else{
									$detailMore.append($('<td class="employeeTable" rowspan="'+ item.detailList.length +'"><table class="table"><tbody><tr><td class="am-clickable addcust" colspan="2"><div class="am-clickable"></div></td></tr></tbody></table></td>'));
									var $employeeTable=$detailMore.find(".employeeTable tbody");
									var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
		                            $employeeTable.data("item",{empList:item.empList,other:otherSendMessage});
								}
							}

							$childTr.find('.col3 .col3table > tbody').append( $detailMore );
						}
					}
				}

				$html.find('.consumptionamount dt').html( '<span class="xfnr">' + projectArr.join('</span><span class="xfnr">') + '</span>' );
				//$html.find('.consumptionamount dd').html( '¥'+_totleFee );
				$html.find('.jetd span').html( '¥'+self.myAdd(_totleFee) );
				$html.find('.jetd').data('total',self.myAdd(_totleFee));
				//入账
				if(item.type == 0 || item.type == 1 || item.type == 4 || item.type == 6){
					$html.find('.accountedfor span').html('¥' + item.eafee);
					//$html.find('.accountedfor').data('total',item.eafee);
				}else{
					$html.find('.accountedfor span').html('¥' + cashSumMoney);
					//$html.find('.accountedfor').data('total',cashSumMoney);
				}
				//支付方式
				// var _paymentmethod = paymentmethodArr.length == 1 ? paymentmethodArr[0] : '混合支付';
				// $html.find('.paymentmethod').html(_paymentmethod);

				self.$table.append($html).append($childTr);

				//改日期
				if( am.operateArr.indexOf('N') != -1 ){
					var ts = amGloble.now();
					var user = amGloble.metadata.userInfo;
					var limitDays=1;
					if(user.userType==0 && user.role==3){
						//老板看一年
						limitDays=180;
					}else if(user.userType==0 && user.role==2){
						//管理员看6个月
						limitDays=4;
					}
					ts.setDate(ts.getDate()-limitDays);

					self.$table.find(".basictr .consumetime").mobiscroll().calendar({
					    theme: 'mobiscroll',
					    lang: 'zh',
					    display: 'bottom',
					    months: "auto",
						min:ts,
					    max: amGloble.now(),
					    //controls: ['calendar', 'time'],
					    setOnDayTap: true,
					    buttons: [],
					    onSet: function(valueText, inst) {
					        var _valueText = valueText.valueText;
					        var _tr = $(this).parents('tr');
					        var _childtr = _tr.next('.childtr');
					        var _item = _tr.data('item');
					        console.log(_valueText);
					        console.log(_item);

					        var _d = {
					        	"parentShopId" : am.metadata.userInfo.parentShopId,
								"shopId" : am.metadata.userInfo.shopId,
					        	'updType' : 1,
					        	'id' : _item.id,
					        	'newVal' : new Date(_valueText).getTime() + '',
					        	'oldVal' : _item.consumeTime,
					        	'operator' : amGloble.metadata.userInfo.userName,
					        	'billNo' : _item.billNo
					        };
					        console.log(_d);
					        am.loading.show("修改中,请稍候...");
							am.api.billUpd.exec(_d, function(res) {
							    am.loading.hide();
							    console.log(res);
							    if (res.code == 0) {
							    	/*  暂时不支持修改具体时间  所以更新方法暂时屏蔽  */
							    	//var _date = new Date(_d.newVal - 0).format("mm/dd HH:MM");
							    	//_tr.find('.consumetime').text(_date);

							    	//_item.consumeTime = _d.newVal;

							    	//_tr.data('item',_item);

							    	var _n=new Date(_d.newVal*1),
							    		_o=new Date(_d.oldVal*1);
							    	if(_n.getFullYear()!=_o.getFullYear() || _n.getMonth()!=_o.getMonth() || _n.getDate()!=_o.getDate()){
							    		_tr.remove();
							    		_childtr.remove();
							    	}
							    }else {
							        am.msg(res.message || "数据获取失败,请检查网络!");
							    }
							});
					    }
					});
				}
			}

			if(self.updateId != -1){
				self.updateIdVclick();
			}
			self.watercourseScroll.refresh();
			self.$billRecordContent.removeClass('empty error normal');
			self.watercourseScroll.closeBottomLoading();

		},
		render: function(clear){
			if(clear) {
				this.pageIndex = 0;
				self.watercourseScroll.pauseTouchBottom=false;
				self.watercourseScroll.scrollTo("top");
				self.$table.empty();
			}
			this.getData(function(res){
				self.watercourseScroll.closeTopLoading();
				self.watercourseScroll.closeBottomLoading();
				if(res.content){
					if((!res.content.billList || !res.content.billList.length) && self.pageIndex === 0){
						self.$billRecordContent.removeClass('normal error').addClass("empty");
						//self.$listData=[];
						return;
					};
					if(res.content.billList.length) {
						self.renderDetailsData(res.content.billList);
						//self.pageIndex++;
					}else{
						am.msg('没有更多的记录了!');
						self.watercourseScroll.pauseTouchBottom = true;
					}
					//self.$listData=res.content.billList;
					//self.renderTotal(res.content);
					//var data=self.getDataListByIndex(self.$listData,self.pageIndex);
				}else if(self.pageIndex === 0){
					self.$billRecordContent.removeClass('normal error').addClass("empty");
				}else{
					am.msg(res.message || '数据读取失败');
				}
			});
			/*}
			 else{
			 var data=self.getDataListByIndex(self.$listData,self.pageIndex);
			 if(data){
			 setTimeout(function(){//不延迟loading出不来
			 self.renderDetailsData(data);
			 },100);

			 }else{
			 self.watercourseScroll.pauseTouchBottom=true;
			 self.watercourseScroll.closeBottomLoading();
			 }


			 }*/



		},
		// render:function(clear){
		// 	if(clear){
		// 		this.pageIndex=0;
		// 		self.watercourseScroll.scrollTo("top");
		// 		self.$table.empty();

		// 	}

		// 	this.getData(function(res){

		// 		if(res.content){
		// 			if(!res.content.billList || !res.content.billList.length){
		// 				self.$billRecordContent.removeClass('normal error').addClass("empty");
		// 				return;
		// 			};
		// 			var data=res.content.billList;
		// 			// self.$tablebody.show();
		// 			// self.$waterResult.show();
		// 			self.pageIndex++;
		// 			self.renderTotal(res.content);
		// 			for(var i=0;i<data.length;i++){
		// 				var item=data[i];
		// 				var $html=$('<tr>'+
		// 				'<td style="width:6%"><div class="tdwrap">'+(item.billNo || "")+'</div></td>'+
		// 				'<td style="width:11%"><div class="tdwrap addcustomer"></div></td>'+
		// 				'<td style="width:7%"><div class="tdwrap">'+(item.sex=="M"?"男客":"女客")+'</div></td>'+
		// 				'<td style="width:10%"><div class="tdwrap monetary"></div></td>'+
		// 				'<td style="width:6%"><div class="tdwrap eafee"></div></td>'+
		// 				// '<td style="width:13%" class="join sale am-clickable"><div class="tdwrap"></div></td>'+
		// 				// '<td style="width:6%" class="join money"><div class="tdwrap"></div></td>'+
		// 				'<td colspan="5" style="width:49%" class="addTable"></td>'+
		// 				'<td style="width:11%"><div class="tdwrap operate">'+
	 //                        '<span class="am-clickable bossname">'+item.operatorName+'</span>'+
	 //                        // '<span class="am-clickable receipt"><b>小票</b></span>'+
	 //                        '<span class="am-clickable revoke"><b>销单</b></span>'+
	 //                    '</div></td>'+
		// 				'</tr>').data("item",item);
		// 				//客户
		// 				if(item.mobile && item.name){
		// 					var $memberHtml='<span>'+item.name+'</span>'+
	 //                        '<span>'+item.cardId+'</span>'+
	 //                        '<span>'+item.mobile+'</span>'+
	 //                        '<span>'+(self.getCardTypeById(item.cardTypeId)!=undefined?'('+self.getCardTypeById(item.cardTypeId)+')':'')+'</span>';
	 //                        if(item.otherFlag==1){//显示商户名
	 //                        	$memberHtml=$memberHtml+("<span class='c_red'>"+item.memberShopName+"</span>");
	 //                        }
		// 					$html.find(".addcustomer").append($memberHtml);
		// 				}else{
		// 					$html.find(".addcustomer").html("散客");
		// 				}
		// 				//消费金额
		// 				var $monetary="";
		// 				var typeData={0:"项目消费",1:"卖品消费",3:"套餐购买",4:"套餐消费",5:"年卡充值"};
		// 				if(typeData[item.type]){
		// 					$monetary+=('<span>'+typeData[item.type]+'</span>');
		// 				}else{
		// 					if(item.type==2){
		// 						if(item.consumeType==0){
		// 							//开卡充值
		// 							$monetary+=('<span>开卡充值</span>');
		// 						}else{
		// 							//续卡充值
		// 							$monetary+=('<span>续卡充值</span>');
		// 						}
		// 					}
		// 					if(item.type==6){
		// 						if(item.consumeType==6){
		// 							//年卡销售
		// 							$monetary+=('<span>年卡销售</span>');
		// 						}else{
		// 							//年卡消费
		// 							$monetary+=('<span>年卡消费</span>');
		// 						}
		// 					}
		// 				}

		// 				//欠款
		// 				if(item.debtFee>0){
		// 					$monetary+=('<span class="c_red">(欠款)'+item.debtFee+'</span>');
		// 					if(item.remainFee==0){
		// 						$monetary+=('<span class="c_red">(已还清)</span>');
		// 					}else{
		// 						$monetary+=('<span class="c_red">(已还)'+(item.debtFee - item.remainFee)+'</span>');
		// 					}
		// 				}
		// 				//<!-- 消费扣卡 -->
		// 				if(item.cardList && item.cardList.length){
		// 					for(var cardId=0;cardId<item.cardList.length;cardId++){
		// 						var card=item.cardList[cardId];
		// 						if(card.depcode == -1 && card.consumeType != 4 && card.consumeType != 16){
		// 							if(card.cardFee > 0 && item.type != 2 && item.type != 5){
		// 								$monetary+=('<span>'+card.cardFee+'<b class="c_red">(卡金)</b></span>');
		// 							}
		// 							if(card.presentFee > 0){
		// 								$monetary+=('<span>'+card.presentFee+'<b class="c_red">(赠金)</b></span>');
		// 							}
		// 							if(card.divideFee>0){
		// 								$monetary+=('<span>'+card.divideFee+'<b class="c_red">(分期赠金)</b></span>');
		// 							}
		// 							if(card.treatFee>0){
		// 								$monetary+=('<span>'+card.treatFee+'<b class="c_red">(套餐卡金)</b></span>');
		// 							}
		// 							if(card.treatPresentFee>0){
		// 								$monetary+=('<span>'+card.treatPresentFee+'<b class="c_red">(套餐赠金)</b></span>');
		// 							}
		// 							if(card.yearFee>0){
		// 								$monetary+=('<span>'+card.yearFee+'<b class="c_red">(年卡卡金)</b></span>');
		// 							}

		// 						}
		// 					}

		// 				}
		// 				//<!-- 消费付现 -->
		// 				if(item.cashList && item.cashList.length){
		// 					for(var cashId=0;cashId<item.cashList.length;cashId++){
		// 						var cash=item.cashList[cashId];
		// 						if(cash.depcode == -1 && cash.consumeType != 2 && cash.consumeType != 3){
		// 							if(item.cardType == 2 || cash.cash > 0){
		// 								$monetary+=('<span>'+cash.cash+'<b class="c_red">(现金)</b></span>');
		// 							}
		// 							if(item.cardType == 2 || cash.unionPay > 0){
		// 								$monetary+=('<span>'+cash.unionPay+'<b class="c_red">(银联)</b></span>');
		// 							}
		// 							if(cash.cooperation > 0){
		// 								$monetary+=('<span>'+cash.cooperation+'<b class="c_red">(合作券)</b></span>');
		// 							}
		// 							if(cash.mall > 0){
		// 								$monetary+=('<span>'+cash.mall+'<b class="c_red">(商场卡)</b></span>');
		// 							}
		// 							if(cash.voucherFee > 0){
		// 								$monetary+=('<span>'+cash.voucherFee+'<b class="c_red">(代金券)</b></span>');
		// 							}
		// 							if(cash.weixin > 0){
		// 								$monetary+=('<span>'+cash.weixin+'<b class="c_red">(微信支付)</b></span>');
		// 							}
		// 							if(cash.pay > 0){
		// 								$monetary+=('<span>'+cash.pay+'<b class="c_red">(支付宝)</b></span>');
		// 							}
		// 							if(cash.pointfee > 0){
		// 								$monetary+=('<span>'+cash.pointfee+'<b class="c_red">(积分)</b></span>');
		// 							}
		// 							if(cash.mdFee > 0){
		// 								$monetary+=('<span>'+cash.mdFee+'<b class="c_red">(免单)</b></span>');
		// 							}
		// 							if(cash.luckymoney>0){
		// 								$monetary+=('<span>'+cash.luckymoney+'<b class="c_red">(红包)</b></span>');
		// 							}
		// 							if(cash.coupon>0){
		// 								$monetary+=('<span>'+cash.coupon+'<b class="c_red">(优惠券)</b></span>');
		// 							}
		// 							if(cash.dianpin>0){
		// 								$monetary+=('<span>'+cash.dianpin+'<b class="c_red">(大众点评)</b></span>');
		// 							}
		// 							var otherpaytypes=self.getotherPaytypes(cash);
		// 							for(var kk in otherpaytypes){
		// 								$monetary+=('<span>'+otherpaytypes[kk].value+'<b class="c_red">('+otherpaytypes[kk].name+')</b></span>');
		// 							}
		// 						}
		// 					}
		// 				}
		// 				//开卡成本
		// 				if(item.cardList && item.cardList.length){
		// 					for(var cardCostIdx=0;cardCostIdx<item.cardList.length;cardCostIdx++){
		// 						var cardCost=item.cardList[cardCostIdx];
		// 						if(cardCost.depcode == -1 && cardCost.consumeType == 16){
		// 							if(cardCost.cardFee > 0 || cardCost.presentFee > 0){
		// 								$monetary+=('<span>开卡成本</span>');
		// 								if(cardCost.cardFee > 0){
		// 									$monetary+=('<span>'+cardCost.cardFee+'<b class="c_red">(卡金)</b></span>');
		// 								}
		// 								if(cardCost.presentFee > 0){
		// 									$monetary+=('<span>'+cardCost.presentFee+'<b class="c_red">(赠金)</b></span>');
		// 								}
		// 							}
		// 						}
		// 					}

		// 				}
		// 				if(item.cashList && item.cashList.length){
		// 					for(var cashCostIdx=0;cashCostIdx<item.cashList.length;cashCostIdx++){
		// 						var cashCost=item.cashList[cashCostIdx];
		// 						if(cashCost.depcode == -1 && cashCost.consumeType == 3){
		// 							if(cashCost.cash > 0 || cashCost.unionPay > 0 || cashCost.cooperation > 0 || cashCost.mall > 0 || cashCost.weixin > 0 || cashCost.pay > 0){
		// 								$monetary+=('<span>开卡成本</span>');
		// 								if(cashCost.cash > 0){
		// 									$monetary+=('<span>'+cashCost.cash+'<b class="c_red">(现金)</b></span>');
		// 								}
		// 								if(cashCost.unionPay > 0){
		// 									$monetary+=('<span>'+cashCost.unionPay+'<b class="c_red">(银联)</b></span>');
		// 								}
		// 								if(cashCost.cooperation > 0){
		// 									$monetary+=('<span>'+cashCost.cooperation+'<b class="c_red">(合作券)</b></span>');
		// 								}
		// 								if(cashCost.mall > 0){
		// 									$monetary+=('<span>'+cashCost.mall+'<b class="c_red">(商场卡)</b></span>');
		// 								}
		// 								if(cashCost.weixin > 0){
		// 									$monetary+=('<span>'+cashCost.weixin+'<b class="c_red">(微信支付)</b></span>');
		// 								}
		// 								if(cashCost.pay > 0){
		// 									$monetary+=('<span>'+cashCost.pay+'<b class="c_red">(支付宝)</b></span>');
		// 								}
		// 								if(cashCost.luckymoney>0){
		// 									$monetary+=('<span>'+cashCost.luckymoney+'<b class="c_red">(红包)</b></span>');
		// 								}
		// 								if(cashCost.coupon>0){
		// 									$monetary+=('<span>'+cashCost.coupon+'<b class="c_red">(优惠券)</b></span>');
		// 								}
		// 								if(cashCost.dianpin>0){
		// 									$monetary+=('<span>'+cashCost.dianpin+'<b class="c_red">(大众点评)</b></span>');
		// 								}
		// 								var otherpaytypes=self.getotherPaytypes(cashCost);
		// 								for(var kk in otherpaytypes){
		// 									$monetary+=('<span>'+otherpaytypes[kk].value+'<b class="c_red">('+otherpaytypes[kk].name+')</b></span>');
		// 								}
		// 							}
		// 						}


		// 					}

		// 				}
		// 				//工本费
		// 				var cashSumMoney=0;
		// 				var cashSumMoneyothers=0;

		// 				if(item.cashList && item.cashList.length){
		// 					for(var basis=0;basis<item.cashList.length;basis++){
		// 						var basisItem=item.cashList[basis];
		// 						if(basisItem.depcode == -1 && basisItem.consumeType == 2){
		// 							$monetary+=('<span>工本费</span>');
		// 							$monetary+=('<span>'+basisItem.cash+'<b class="c_red">(现金)</b></span>');
		// 							$monetary+=('<span>'+basisItem.unionPay+'<b class="c_red">(银联)</b></span>');
		// 							if(basisItem.cooperation > 0){
		// 								$monetary+=('<span>'+basisItem.cooperation+'<b class="c_red">(合作券)</b></span>');
		// 							}
		// 							if(basisItem.mall > 0){
		// 								$monetary+=('<span>'+basisItem.mall+'<b class="c_red">(商场卡)</b></span>');
		// 							}
		// 							if(basisItem.weixin > 0){
		// 								$monetary+=('<span>'+basisItem.weixin+'<b class="c_red">(微信支付)</b></span>');
		// 							}
		// 							if(basisItem.pay > 0){
		// 								$monetary+=('<span>'+basisItem.pay+'<b class="c_red">(支付宝)</b></span>');
		// 							}
		// 							if(basisItem.luckymoney>0){
		// 								$monetary+=('<span>'+basisItem.luckymoney+'<b class="c_red">(红包)</b></span>');
		// 							}
		// 							if(basisItem.coupon>0){
		// 								$monetary+=('<span>'+basisItem.coupon+'<b class="c_red">(优惠券)</b></span>');
		// 							}
		// 							if(basisItem.dianpin>0){
		// 								$monetary+=('<span>'+basisItem.dianpin+'<b class="c_red">(大众点评)</b></span>');
		// 							}
		// 							var otherpaytypes=self.getotherPaytypes(basisItem);

		// 							for(var kk in otherpaytypes){
		// 								$monetary+=('<span>'+otherpaytypes[kk].value+'<b class="c_red">('+otherpaytypes[kk].name+')</b></span>');


		// 							}
		// 						}
		// 						//算实际入账
		// 						var others=self.getotherPaytypes(basisItem);
		// 						for(var cc in others){
		// 							cashSumMoneyothers+=others[cc].value;
		// 						}
		// 						if(basisItem.consumeType != 2 && basisItem.consumeType != 3){
		// 							cashSumMoney+=(basisItem.cash + basisItem.unionPay + basisItem.cooperation + basisItem.mall + basisItem.weixin + basisItem.pay+ cashSumMoneyothers);
		// 						}
		// 					}

		// 				}
		// 				//实际入账


		// 				if(item.type == 0 || item.type == 1 || item.type == 4 || item.type == 6){
		// 					$html.find(".eafee").text(item.eafee);
		// 				}else{
		// 					$html.find(".eafee").text(cashSumMoney);
		// 				}



		// 				var $addHtml=$('<table class="table"><tbody></tbody></table>');
		// 				var $addTable=$html.find(".addTable");


		// 				var $employeeEmpty1='<tr class="addmember am-clickable"><td colspan="3"><div class="tdwrap"><span>+<b>添加员工</b></span></div></td></tr>';
		// 				var $employeeEmpty2='<tr class="addmember am-clickable"><td colspan="5"><div class="tdwrap"><span>+<b>添加员工</b></span></div></td></tr>';
		// 				if(item.detailList && item.detailList.length>0){
		// 					for(var detailIdx=0;detailIdx<item.detailList.length;detailIdx++){
		// 						var detail=item.detailList[detailIdx];
		// 						var $detailMore=$('<tr></tr>').data("item",detail);

		// 						$detailMore.append('<td width="22.7%"><div class="tdwrap sale"></div></td>');
		// 						$detailMore.append('<td width="12.2%"><div class="tdwrap money">'+detail.money+'</div></td>');

		// 						var $sale=$detailMore.find(".sale");
		// 						if((item.type == 0 || item.type == 4 || (item.type == 6 && item.consumeType != 6)) && detail.consumeType != 1 && detail.consumeType != 4){//只有项目能修改
		// 							$sale.append($('<span class="projectName"><a href="javascript:void(0)" class="am-clickable">'+detail.itemName+'</a></span>').data("item",$.extend(detail,{billNo:item.billNo,operatorId:item.operatorId,billtype:item.type})));
		// 						}else{
		// 							$sale.append($('<span class="projectName"><a href="javascript:void(0)" class="noclick">'+detail.itemName+'</a></span>').data("item",$.extend(detail,{billNo:item.billNo,operatorId:item.operatorId,billtype:item.type})));
		// 						}


		// 						var consumeType=["(单次)","(套餐)","(赠送)","(计次)","(年卡)"];
		// 						if(item.type!= 1){
		// 							if(consumeType[detail.consumeType]){
		// 								$sale.append('<span>'+consumeType[detail.consumeType]+'</span>');
		// 							}
		// 						}else{
		// 							$sale.append('<span>('+(detail.num+(detail.itemUnit!=""?detail.itemUnit:""))+')</span>');
		// 						}
		// 						if(detail.singleFlag==1){
		// 							$sale.append('<span>'+(detail.num?detail.num:"不限次")+'</span>');
		// 						}
		// 						if(item.type == 3){
		// 							$sale.append('<span>'+detail.num+'次</span>');
		// 						}
		// 						if(detail.depName != null && detail.depName != ''){
		// 							$sale.append('<span>'+detail.depName+'</span>');
		// 						}






		// 						if(item.type == 1 || item.type == 3 || item.consumeType == 6){//不显示指定非指定
		// 							if(item.empList && item.empList.length){
		// 								if(detailIdx == 0){
		// 									$detailMore.append($('<td class="employeeTable"><table class="table"><tbody></tbody></table></td>'));
		// 									var $employeeTable=$detailMore.find(".employeeTable tbody");
		// 									$detailMore.find(".employeeTable").attr("rowspan",item.detailList.length);
		// 									for(var employeeId=0;employeeId<item.empList.length;employeeId++){
		// 										var emp=item.empList[employeeId];
		// 										var employeeName="";
		// 										if(emp.empNo != null){
		// 											employeeName=(emp.empNo+'号'+emp.dutyTypeName);
		// 											var $employee="";
		// 											//添加员工
		// 											$employee+=('<tr>'+
		// 												'<td class="changeEmployee" data-id='+emp.empId+'><div class="tdwrap"><a class="am-clickable" href="javascript:void(0)">'+(employeeName+'('+emp.empName+')')+'</a></div></td>'+
		// 		                                        '<td style="width:19%"><div class="tdwrap">'+emp.gain+'</div></td>'+
		// 		                                        '<td style="width:19%"><div class="tdwrap">'+emp.fee+'</div></td>'+
		// 		                                    '</tr>');
		// 		                                    $employeeTable.append($employee);
		// 		                                    var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
		// 		                                    $employeeTable.data("item",{empList:item.empList,other:otherSendMessage});
		// 										}

		// 									}
		// 								}
		// 							}else{
		// 								$detailMore.append($('<td class="employeeTable"><table class="table"><tbody></tbody></table></td>'));
		// 							}



		// 						}else{//显示指定非指定
		// 							//添加员工
		// 							$detailMore.append($('<td class="employeeTable"><table class="table"><tbody></tbody></table></td>'));
		// 							var $employeeTable=$detailMore.find(".employeeTable tbody");
		// 							var employeeList=self.getEmployeeById(item.empList,detail.id);

		// 							var $employee=self.renderEmployee(employeeList);
		// 							var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
		// 							$employeeTable.data("item",{empList:employeeList,other:otherSendMessage});
		// 							$employeeTable.append($employee);

		// 						}



		// 						$addHtml.append($detailMore);
		// 					}

		// 					//为空就加个添加员工
		// 					//$employee+=$employeeEmpty1;

		// 				}else{
		// 					var $employeeTable=$('<tr><td class="employeeTable"><table class="table"><tbody></tbody></table></td></tr>');
		// 					var $employee=self.renderEmployee(item.empList,3);
		// 					var otherSendMessage={billNo:item.billNo,operatorId:item.operatorId,billtype:item.type,itemNo:(detail?detail.itemNo:""),itemName:(detail?detail.itemName:"")};
		// 					$employeeTable.find("tbody").append($employee).data("item",{empList:item.empList,other:otherSendMessage});
		// 					$addHtml.append($employeeTable);


		// 				}

		// 				$addHtml.data("item",{empList:item.empList,other:otherSendMessage});
		// 				$addTable.html($addHtml);
		// 				$html.find(".monetary").append($monetary);
		// 				self.$table.append($html);

		// 			}
		// 			self.watercourseScroll.refresh();
		// 			self.$billRecordContent.removeClass('empty error normal');
		// 		}else{
		// 			self.$billRecordContent.removeClass('normal error').addClass("empty");
		// 			// self.$tablebody.hide();
		// 			// self.$waterResult.hide();
		// 		}
		// 	});

		// },
		getotherPaytypes:function(paymap){
			var res={};
			var paytypes=am.metadata.payConfigs;
			var list=this.getMapBypayconfig(paymap);
			for(var i=0;i<paytypes.length;i++){
				for(var j in list){
					if(j==paytypes[i].field.toLowerCase()){
						res[j]={name:paytypes[i].fieldname,value:list[j]};
					}
				}
			}
			return res;
		},
		getMapBypayconfig:function(paymap){
			var res={};
			for(var i in paymap){
				if(i.indexOf("otherfee")!=-1){
					if(paymap[i]>0){
						res[i]=paymap[i];
					}
				}
			}
			return res;
		},
		getEmployeeById:function(empList,detailId){
			var res=[];
			for(var i=0;i<empList.length;i++){
				var item=empList[i];
				if(item.detailId==detailId){
					res.push(empList[i]);
				}
			}
			return res;
		},
		renderEmployee:function(item,num){
			var $employee="";
			for(var employeeId=0;employeeId<item.length;employeeId++){
				var emp=item[employeeId];
				var employeeName="";
				if(emp.empNo != null){
					employeeName=(emp.empNo+'号'+emp.dutyTypeName);
				}
				var $text="";
				if(emp.pointFlag == 1){
					$text+=('<span>指定</span>');
				}else{
					$text+=('<span>非指定</span>');
				}
				// if(emp.gain > 0){
				// 	$text+=('<span>'+emp.gain+'</span>');
				// }else{
				// 	$text+=('<span>自动算</span>');
				// }
				var $gain = '';
				if(amGloble.metadata.shopPropertyField.handinto==1){
					if(emp.gain>0){
					$gain = ',提成:¥'+ emp.gain;
					}else {
						$gain = ',提成自动算'
					}
				}
				$employee+=('<tr>'+
					'<td class="changeEmployee" width="35%" colspan='+(num?num:"1")+'><div class="tdwrap"><a class="am-clickable" href="javascript:void(0)">'+(employeeName+'('+emp.empName+')')+'</a></div></td>'+
                    '<td style="width:'+(num==3?"12%":"20%")+'"><div class="tdwrap">'+$text+'</div></td>'+
                    '<td><div class="am-clickable tdedit">业绩:¥'+ emp.fee + $gain +'<ul><li class="am-clickable updateli">修改</li><li class="am-clickable delli">删除</li></ul></div></td>'+
                    // '<td style="width:'+(num==3?"12%":"19%")+'"><div class="tdwrap">业绩:¥'+emp.fee+'</div></td>'+
                '</tr>');
			}
			return $employee;
		},
		getothersKeys:function(){
			var payConfigs=am.metadata.payConfigs;
			var res=[];
			for(var i=0;i<payConfigs.length;i++){
				if(payConfigs[i].field){
					if(payConfigs[i].field.indexOf("OTHERFEE")!=-1){
						res.push(payConfigs[i]);
					}
				}

			}
			return res;
		},
		setworks:function(){
			var res={labour:"work",sale:"sale",pay:"rec",course:"treat",yearCard:"year",total:"sum"};
			var ret={};
			var keys=this.getothersKeys();

			for(var i in res){
				ret[i]={};
				if($.isArray(keys)){
					for(var j=0;j<keys.length;j++){
						var item=keys[j];
						if(i=="total"){
							ret[i][res[i]+item.field.toLowerCase()]="总"+item.fieldname;
						}else{
							ret[i][res[i]+item.field.toLowerCase()]=item.fieldname;
						}

					}
				}

			}
			return ret;

		},
		renderTotal:function(data){
			/*var $result=this.$waterResult,self=this;
			var $moreresult=this.$watercourse.find(".moreresult");
			var item=data.feeMap;
			$result.find(".total b").text(data.billList.length);
			$result.find(".labour").html('<div><b class="c_red">'+item.workFee+'</b><p>劳动业绩</p></div><div><b class="c_red">'+item.saleFee+'</b><p>卖品业绩</p></div><div><b class="c_red">'+item.recFee+'</b><p>开、充卡</p></div><div><b class="c_red">'+item.treatFee+'</b><p>套餐销售</p></div><div><b class="c_red">'+item.yearFee+'</b><p>年卡销售</p></div>');
			var keys=this.setworks();
			var labour={workluckymoney:"红包",workcoupon:"优惠券",workdianpin:"大众点评",workCardFee:"划卡",workPresentFee:"划赠金",workDivideFee:"分期赠金",workCashFee:"现金",workUnionFee:"银联",workCoopFee:"合作券",workMallFee:"商场卡",workWxFee:"微信支付",workPayFee:"支付宝",workVoucherFee:"代金券",workMdFee:"免单",workPointFee:"扣积分"}
			var sale={saleluckymoney:"红包",salecoupon:"优惠券",saleCardFee:"划卡",salePresentFee:"划赠金",saleCashFee:"现金",saleUnionFee:"银联",saleCoopFee:"合作券",saleMallFee:"商场卡",saleWxFee:"微信支付",salePayFee:"支付宝",saleVoucherFee:"代金券",salePointFee:"扣积分"}
			var pay={recPresentFee:"赠金",recCashFee:"现金",recUnionFee:"银联",recCoopFee:"合作券",recMallFee:"商场卡",recWxFee:"微信支付",recPayFee:"支付宝"};
			var course={treatCardFee:"划卡",treatPresentFee:"划赠金",treatCashFee:"现金",treatUnionFee:"银联",treatCoopFee:"合作券",treatMallFee:"商场卡",treatWxFee:"微信支付",treatPayFee:"支付宝"};
			var yearCard={yearCardFee:"划卡",yearPresentFee:"划赠金",yearCashFee:"现金",yearUnionFee:"银联",yearCoopFee:"合作券",yearMallFee:"商场卡",yearWxFee:"微信支付",yearPayFee:"支付宝"};
			var total={sumcoupon:"总优惠券",sumluckymoney:"总红包",sumdianpin:"总大众点评",sumCardFee:"总划卡",sumPresentFee:"总划赠金",sumCashFee:"总现金",sumUnionFee:"总银联",sumCoopFee:"总合作券",sumMallFee:"总商场卡",sumWxFee:"总微信支付",sumPayFee:"总支付宝"};

			var res={
				labour:{value:labour,tit:"劳动业绩"},
				sale:{value:sale,tit:"卖品业绩"},
				pay:{value:pay,tit:"开、充卡"},
				course:{value:course,tit:"套餐销售"},
				yearCard:{value:yearCard,tit:"年卡销售"},
				total:{value:total,tit:"汇总"},
			}
			for(var j in res){
				$.extend(res[j].value,keys[j]);
			}
			this.renderTxt(res,item);*/
		},

		renderTxt:function(res,map){
			var $moreresult=this.$watercourse.find(".moreresult").empty();
			if(!map) return;
			var result={};
			for(var i in res){
				result[i]={};
				result[i].tit=res[i].tit;//存放标题
				result[i].val=[];//存放数据的数组
				for(var j in res[i].value){
					var item=res[i].value[j];
					if(map.hasOwnProperty(j)){
						if(map[j]>0){
							result[i].val.push({
								name:item,
								value:map[j]
							});
						}
					}
				}
			}
			console.log(result);
			for(var k in result){
				if(result[k].val.length){//长度大于0的取出来显示
					var $html='<span class="morelabour"><b class="morelabour_tit">'+result[k].tit+'：</b>';
					for(var l=0;l<result[k].val.length;l++){
						var iteml=result[k].val[l];
						$html+=(iteml.name+'：<b class="c_morered">'+iteml.value+'</b>元&nbsp;&nbsp;&nbsp;&nbsp;');
					}
					$moreresult.append($html);

				}
			}
		},

		withdrawData:function(item,callback){
			var metadata=am.metadata;
			var apiArr=["wechatRefund","alipayRefund","dpRefund"];
			am.loading.show("正在获取数据,请稍候...");
			am.api[apiArr[item.type-1]].exec({
			    "out_trade_no":item.outtradeno,
			    "parentShopId":metadata.userInfo.parentShopId
			}, function(res) {
			    am.loading.hide();
			    if (res.code == 0) {
			    	callback && callback(res);
			    }else {
			        am.msg(res.message || "退款失败,请重试!");
			    }
			});
		},
		getreports:function(apiName,callback){
			var period=self.getfaceTime();
			var metadata=am.metadata;
			var sendMessage={
				"parentShopId":metadata.userInfo.parentShopId,
				"shopId":metadata.userInfo.shopId,
				"pageNumber":self.facePageIndex,
				"pageSize":self.facePageSize,
				"period":period
			}
			if(apiName=="getMallOrder" || apiName=="getLuckyMoney"){
				sendMessage.status="3,4";
			}
			if(apiName=="getdianpingFlow") sendMessage.status="2";
			am.loading.show("正在获取数据,请稍候...");
			am.api[apiName].exec(sendMessage, function(res) {
			    am.loading.hide();
			    if (res.code == 0) {
			    	callback && callback(res);
			    }else {
			    	self.$billRecordContent.removeClass('normal empty').addClass("error");
			    	// self.pager.refresh(0,0);
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});

		},
		getfaceData:function(callback){
			var metadata=am.metadata;
			var period=self.getfaceTime();
			var shopId=[];
			shopId.push(metadata.userInfo.shopId);
			am.loading.show("正在获取数据,请稍候...");
			am.api.facePay.exec({
			    "shopIds":shopId,
			    "status":[3],
			    "parentShopId":metadata.userInfo.parentShopId,
			    "pageNumber":self.facePageIndex,
			    "pageSize":self.facePageSize,
			    "period":period
			}, function(res) {
			    am.loading.hide();
			    console.log(res);
			    if (res.code == 0) {
			    	callback && callback(res);
			    }else {
			    	self.$billRecordContent.removeClass('normal empty').addClass("error");
			    	// self.pager.refresh(0,0);
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});
		},
		getData:function(callback){
			var metadata=am.metadata;
			var resValue=self.getSelectValue();
			var period=new Date(this.$waterInput.val()+" 00:00:00").getTime()+"_"+new Date(this.$waterInput.val()+" 23:59:59").getTime();
			this.pageIndex === 0 && am.loading.show("正在获取数据,请稍候...");
			am.api.billRecord.exec($.extend({
			    "shopId":metadata.userInfo.shopId,//metadata.userInfo.shopId,
			    "parentShopId":metadata.userInfo.parentShopId,//metadata.userInfo.parentShopId,
			    "period":period,
				"pageNumber":this.pageIndex,
				"pageSize":20
			},resValue), function(res) {
			    am.loading.hide();
			    console.log(res);
			    if (res.code == 0) {
			    	callback && callback(res);
			    }else {
			    	self.$billRecordContent.removeClass('normal empty').addClass("error");
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});
		},
		//操作水单
		updateWater:function(type,data,callback){
			var metadata=am.metadata;
			am.loading.show("正在获取数据,请稍候...");
			var pushData={};
			// 修改类型(0 单号，1 日期，2 入账金额，3 客户性别，4 服务项目，5 部门，6 项目业绩 7 员工，8 员工业绩 9 提成，10 指定类型，11 是否计客次，12 是否计入日常开支，13 新增单据服务/提成员工，14 工本费，15 外创员工业绩，16 现金消费金额，17 划卡业绩，18 现金业绩，19 卡金消费金额，注：com.sentree.hairv3.manage.bill.web.BillAction.upd())
			if(type=="1"){//项目
				pushData.oldName=data.oldName;
				pushData.newName=data.newName;
				pushData.updType=4;
			}else if(type=="2"){//修改员工
				pushData.updType=7;
				pushData.employeeId=data.oldVal;
				pushData.itemNo=data.itemNo;
				pushData.itemName=data.itemName;
				pushData.oldEmployeeNo=data.oldEmployeeNo;
				pushData.oldEmployeeDutyName=data.oldEmployeeDutyName;
				pushData.oldEmployeeName=data.oldEmployeeName;
				pushData.newEmployeeNo=data.newEmployeeNo;
				pushData.newEmployeeDutyName=data.newEmployeeDutyName;
				pushData.newEmployeeName=data.newEmployeeName;
			}else if(type=="3"){//修改业绩/提成
				pushData.updType=8;
				pushData.newVal = data.fee;
				pushData.cashFee = data.cashfee;
				pushData.cardFee = data.cardfee;
				pushData.otherFee = data.otherfee;
				pushData.gain = data.gain;
				pushData.pointFlag = data.pointFlag;
				pushData.employeeId=data.oldVal;
				pushData.newEmployeeNo=data.newEmployeeNo;
				pushData.newEmployeeName=data.newEmployeeName;
			}else if(type=="4"){//添加员工
				pushData.updType=13;
				pushData.newVal = data.fee;
				pushData.cashFee = data.cashfee;
				pushData.cardFee = data.cardfee;
				pushData.otherFee = data.otherfee;
				pushData.gain = data.gain;
				pushData.employeeId=data.itemid;
				pushData.pointFlag = data.pointFlag;
				pushData.itemNo = data.itemNo;
			}else if(type=="5"){//删除员工
				pushData.updType=20;
				pushData.subId = data.subId;
			}
			am.api.updataproject.exec($.extend({
			    shopId:metadata.userInfo.shopId, //门店id
			    parentShopId:metadata.userInfo.parentShopId,
		        id:data.billId,//水单id
		        newVal:data.itemid,//新值
		        oldVal:data.oldVal,//老值
		        billType:data.billType,//水单类型
		        subId:data.subId,// detailId(改项目为detailid,改人相关则为feeid)
		        billNo:data.billNo,// 流水单号
				itemNo:data.itemNo,
				operator: amGloble.metadata.userInfo.userId, //data.operator
				operatorName: amGloble.metadata.userInfo.userName //data.operator
			},pushData), function(res) {
			    am.loading.hide();
			    console.log(res);
			    if (res.code == 0) {
			    	callback && callback(res);
			    }else {
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});
		},
		upd:function(type,data,callback){
			am.loading.show("正在提交数据,请稍候...");
			var pushData = {};
			if(type==3){ //修改性别
				pushData.newVal = data.sex=='M'?'F':'M';
				pushData.oldVal = data.sex;
			}else if(type==11){ //修改计客次
				pushData.newVal = data.customer.clientflag==1?0:1;
				pushData.oldVal = data.customer.clientflag;
			}else if(type==5){ //修改部门
				pushData.newVal = data.newVal;
				pushData.oldVal = data.oldVal;
				pushData.subId =  data.subId;
			}else if(type==0){ //修改单号
				pushData.newVal = data.newVal;
				pushData.oldVal = data.oldVal;
			}
			am.api.upd.exec($.extend({
				parentShopId: am.metadata.userInfo.parentShopId,
				shopId: am.metadata.userInfo.shopId,
				operator: am.metadata.userInfo.userId,
				updType: type,
				type: data.type,
				billNo: data.billNo,
				id: data.id
			},pushData),function(res) {
			    am.loading.hide();
			    console.log(res);
			    if (res.code == 0) {
			    	callback && callback()
			    }else {
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});
		},
		//销单
		cancelProject:function(data,reason,callback){
			var metadata=am.metadata;
			am.loading.show("正在获取数据,请稍候...");
			am.api.cancelproject.exec({
				"parentShopId":metadata.userInfo.parentShopId,
				"shopId":metadata.userInfo.shopId,
				"bill":{
					"id":data.id,
					"detail":reason
				}
			}, function(res) {
			    am.loading.hide();
			    console.log(res);
			    if (res.code == 0) {
			    	callback && callback(res);
			    }else {
			        am.msg(res.message || "数据获取失败,请检查网络!");
			    }
			});
		},
		payKey:{
			cash:"cashFee",
			cooperation:"cooperation",
			coupon:"coupon",
			dianpin:"dpFee",
			luckymoney:"luckymoney",
			mall:"mall",
			mdFee:"mdFee",
			otherfee1:"otherfee1",
			otherfee2:"otherfee2",
			otherfee3:"otherfee3",
			otherfee4:"otherfee4",
			otherfee5:"otherfee5",
			otherfee6:"otherfee6",
			otherfee7:"otherfee7",
			otherfee8:"otherfee8",
			otherfee9:"otherfee9",
			otherfee10:"otherfee10",
			pay:"pay",
			unionPay:"unionPay",
			voucherFee:"voucherFee",
			weixin:"weixin",

			cardFee:"cardFee",
			divideFee:"divideFee",
			presentFee:"presentFee",
			treatFee:"treatfee",
			treatPresentFee:"treatpresentfee",
			yearFee:"yearFee"
		},
		renderDeptPerf:function ($parent,item) {
			var expenseCategory = this.getExpenseCategory(item);
			if(!expenseCategory || !am.metadata.deparList || am.metadata.deparList.length<=1 || (item.cardType==="2" && item.type===2)){
				return;
			}
			var $dl = $('<dl class="deptPerf"><dt class="edit deptPerfEdit am-clickable">部门业绩<span class="iconfont icon-qianming1"></span></dt><dd></dd></dl>');
			var dept = am.metadata.deparList;
			var cashList = item.cashList,cardList = item.cardList;
			var $dd = $dl.children('dd');
			for(var i=0;i<dept.length;i++){
				var obj = {};
				for(var j=0;j<cashList.length;j++){
					if(cashList[j].depcode === dept[i].code && cashList[j].consumeType !==2 && cashList[j].consumeType !==3){
						obj.cash = cashList[j];
						break;
					}
				}
				for(var k=0;k<cardList.length;k++){
					if(cardList[k].depcode === dept[i].code && cardList[k].type===3 && cardList[k].consumeType !==4  && cardList[k].consumeType !==16){
						obj.card = cardList[k];
						break;
					}
				}

				if(obj.card || obj.cash){
					obj.name=dept[i].name;
					var total = 0;
					for(var l in this.payKey){
						if((l === 'cardFee' || l === 'presentFee') && expenseCategory !==4){
							continue;
						}
						if(obj.card && obj.card[l]){
							total+=obj.card[l];
						}else if(obj.card && obj.card[l.toLowerCase()]){
							total+=obj.card[l.toLowerCase()];
						}else if(obj.cash && obj.cash[l]){
							total+=obj.cash[l];
						}else if(obj.cash && obj.cash[l.toLowerCase()]){
							total+=obj.cash[l.toLowerCase()];
						}
						//total+= (obj.card[l] || obj.cash[l] || 0);
					}
					var $span = $('<span>'+toFloat(total)+'('+dept[i].name+')</span>');
					$dd.append($span);
				}
			}
			$parent.append($dl);
		},
		setDeptPerf:function($tr){
			var data = $tr.data('item');
			am.popupMenu("请选择部门",am.metadata.deparList, function (ret) {
				if(ret && ret.length){
					var emps = [];
					var p=Math.round(10000/ret.length)/100;
					for(var i=0;i<ret.length;i++) {
						emps.push({
							empNo: ret[i].code,
							empName: ret[i].name,
							per:p
						});
					}
					var expenseCategory=self.getExpenseCategory(data);
					var total = 0;//expenseCategory === 2 ? data.cardFee : data.eafee;
					var tCard=data.cardList.filter(function(item){
						return item.depcode ==='-1' && (item.type===3 || item.type===2) && item.consumeType !==4 && item.consumeType !==16;
					})[0];
					var tCash=data.cashList.filter(function(item){
						return item.depcode ==='-1' && item.consumeType !==2 && item.consumeType !==3;
					})[0];

					for(var k in self.payKey){
						if((k === 'cardFee' || k === 'presentFee') && expenseCategory !==4){
							continue;
						}
						if(tCard && tCard[k]){
							total += tCard[k];
						}else if(tCash && tCash[k]){
							total += tCash[k];
						}
					}
					am.setPerf.show({
						total:toFloat(total),
						emps:emps,
						submit:function (pers) {
							console.log(pers);
							var opt = {
								"billId": data.id,
								"shopId": data.shopId,
								//"consumetime": data.consumeTime*1,
								//"consumeTime": data.consumeTime*1,
								"time": data.consumeTime*1,

								"expenseCategory": expenseCategory,

								"memberId": data.memberId,
								"memCardId": data.memCardId,
								"cardTypeId":data.cardTypeId,
								"cardType": data.cardType,
								"otherFlag": data.otherFlag,
								"bliiNo": data.billNo,
								"perf": [
									/*{
										"cash": 100,
										"deptCode": 1
									}*/
								]
							};

							for(var i=0;i<emps.length;i++){
								var perfObj = {
									deptCode:emps[i].empNo,
									per:pers[i]
								};
								for(var key in self.payKey){
									if(tCard && tCard[key]){
										perfObj[key.toLowerCase()] = pers[i]*tCard[key]/100;
									}else if(tCash && tCash[key]){
										perfObj[key.toLowerCase()] = pers[i]*tCash[key]/100;
									}
								}
								opt.perf.push(perfObj);
							}
							console.log('billUpdDeptPerf:',opt);
							//return;
							am.api.billUpdDeptPerf.exec(opt,function (ret) {
								if(ret && ret.code===0){
									am.msg(ret.message || '修改成功！');

									var tCardList=data.cardList.filter(function(item){
										return item.depcode ==='-1';
									});
									var tCashList=data.cashList.filter(function(item){
										return item.depcode ==='-1';
									});

									for(var i=0;i<opt.perf.length;i++){
										if(tCash){
											var obj = $.extend({},tCash,opt.perf[i]);
											obj.depcode=obj.deptCode;
											for(var key in obj){
												var lowerI = key.toLowerCase();
												if(key !== lowerI && obj[lowerI]){
													delete obj[key];
												}
											}
											tCashList.push(obj);
										}else{
											var obj = $.extend({},tCard,opt.perf[i]);
											obj.depcode=obj.deptCode;
											for(var key in obj){
												var lowerI = key.toLowerCase();
												if(key !== lowerI && obj[lowerI]){
													delete obj[key];
												}
											}
											tCardList.push(obj);
										}
									}
									data.cashList = tCashList;
									data.cardList = tCardList;

									var $DOM = $tr.find('td.col2');
									$DOM.find('dl.deptPerf').remove();
									self.renderDeptPerf($DOM,data);
								}else if(ret.code === -1){
									am.msg('网络异常，请检查网络后重试！');
								}else{
									am.msg(ret.message || '修改失败');
								}
							});
						}
					});
				}else{

				}
			},false,1);
		},
		getExpenseCategory:function(item){
			//开充卡
			if(item.type == 2){
				if(item.consumeType=== 0){
					return 2;
				}else{
					return 3;
				}
			}else if(item.type === 5){
				return 3;
			}else if(item.type === 3 || item.type === 7 || (item.type === 6 && item.consumeType === 6)){
				return 4;
			}
		}
	});
})();


(function(){
	var selectCancleReason = {
		init: function(){
			var self = this;
			var $dom = $('<div id="selectCancleReason">'+
				'<div class="mask"></div>'+
				'<div class="content">'+
					'<div class="close"></div>'+
					'<p class="title"></p>'+
					'<div class="wrapper">'+
						'<div class="wrap">'+
							'<ul>'+
								'<li class="am-clickable"><span></span><p>撤单理由</p></li>'+
							'</ul>'+
							'<div class="selfInput"><span></span><p>手动输入</p></div>'+
							'<div class="textareaWrap"><textarea maxlength="50" placeholder="请输入理由..."></textarea></div>'+
						'</div>'+
					'</div>'+
					'<p class="warn">警告:请选择或输入明确的撤单理由，以便财务和管理层审核</p>'+
					'<div class="sure disabled">确定</div>'+
				'</div>'+
			'</div>');
			$('body').append($dom)
            this.$ = $dom;

            this.$textareaWrap = this.$.find('.textareaWrap');
            this.$textarea = this.$textareaWrap.find('textarea').blur(function(){
            	var val = $(this).val();
            	if(val){
            		self.$sure.removeClass('disabled');
            	}else {
        			self.$sure.addClass('disabled');
        		}
            });
            this.$textarea = this.$.find('textarea');
            this.$showSelfInput = this.$.find('.selfInput').vclick(function(){
            	if(!self.hasSetDate){
            		return;
            	}
            	if($(this).hasClass('show')){
            		$(this).removeClass('show');
            		self.$textareaWrap.hide();
            		self.$sure.addClass('disabled');
            	}else {
            		$(this).addClass('show');
            		self.$textareaWrap.show();
            		self.$ul.find('li').removeClass('active');
            		var val = self.$textarea.val();
	        		if(val){
	        			self.$sure.removeClass('disabled');
	        		}else {
	        			self.$sure.addClass('disabled');
	        		}
            	}
            	self.sv.refresh();
            });

            this.$title = this.$.find('.title');
            this.$warn = this.$.find('.warn');
            this.$ul = $dom.find('ul').on('vclick','li',function(){
            	$(this).addClass('active').siblings().removeClass('active');
            	self.$textareaWrap.hide();
            	self.$showSelfInput.removeClass('show');
            	self.$sure.removeClass('disabled');
            	self.sv.refresh();
            });
            this.$li = this.$ul.find('li').eq(0).remove();

            this.$mask = this.$.find(".mask").vclick(function(){
                self.hide();
            });
            this.$close = this.$.find('.close').vclick(function(){
            	self.hide();
            });
            this.$sure = this.$.find('.sure').vclick(function(){
            	var index = self.$ul.find('.active').index();
            	var val = self.$textarea.val();
            	if(index<0 && !(val && self.$showSelfInput.hasClass('show'))){
            		// if(self.hasSetDate){
            		// 	am.msg('请选择或输入理由');
            		// }else {
            		// 	am.msg('请输入理由');
            		// }
            		return;
            	}
            	if(index>=0){
            		self.callback(self.$ul.find('.active p').html());
            	}else {
            		self.callback(val);
            	}
            	self.hide();

            });

            this.sv = new $.am.ScrollView({
                $wrap : this.$.find('.wrapper'),
                $inner : this.$.find('.wrap'),
                direction : [false, true],
                hasInput: false
            });
		},
		show:function(opt){
            if(!this.$){
                this.init();
            }
            this.callback = opt.callback;
            this.$ul.empty();
            this.$textarea.val('');
            this.$sure.addClass('disabled');
            this.$title.html(opt.title);
            this.$warn.html(opt.warn);
            if(opt.reason && opt.reason.length){
            	for(var i=0;i<opt.reason.length;i++){
            		var $item = this.$li.clone();
	                $item.find('p').html(opt.reason[i]);
	                this.$ul.append($item);
	            	}
            	this.$textareaWrap.hide();
            	this.$showSelfInput.removeClass('show');
            	this.hasSetDate = true;
            }else {
            	this.hasSetDate = false;
        		this.$textareaWrap.show();
        		this.$showSelfInput.addClass('show');
            }
            this.$.show();
            this.sv.refresh();
            this.sv.scrollTo("top");
        },
        hide:function () {
            this.$.hide();
        }
	}
	am.selectCancleReason = selectCancleReason;
})();
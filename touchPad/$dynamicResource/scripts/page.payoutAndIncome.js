(function(){
	var payoutAndIncome = function(opt){
		this.$ = opt.$;
		this.type = opt.type;
		this.add = opt.add;
		this.init();
		this.reset();
		this.getDeparList();
		this.getDayExpendTypeList();
	};

	payoutAndIncome.prototype = {
		init: function(){
			var self = this;

			this.$start = this.$.find('.start').mobiscroll().calendar({
			    theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
			    months: "auto",
				// min: self.getStartMin(),
			    max: amGloble.now(),
			    setOnDayTap: true,
				buttons: [],
				endYear: amGloble.now().getFullYear()+50,
			    onSet: function(valueText, inst) {
			        console.log(valueText.valueText);
			        self.$start.html(new Date(valueText.valueText).format('yyyy.mm.dd'));
			        var time = new Date(valueText.valueText);
			        self.startTs = time.getTime();
			        var start = self.$start.html().split('/').join(''),
	            		end = self.$end.html().split('/').join('');
	            	if(start>end){
	            		am.msg('开始时间大于结束时间');
	            	}
	            	if(self.endTs-self.startTs>31*24*60*60*1000){
	            		am.msg('时间跨度超过一个月');
	            	}
			    }
			});

			this.$end = this.$.find('.end').mobiscroll().calendar({
			    theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
			    months: "auto",
				// min: self.getStartMin(),
			    max: amGloble.now(),
			    setOnDayTap: true,
				buttons: [],
				endYear: amGloble.now().getFullYear()+50,
			    onSet: function(valueText, inst) {
			        console.log(valueText.valueText);
			        self.$end.html(new Date(valueText.valueText).format('yyyy.mm.dd'));
			        var time = new Date(valueText.valueText);
			        time.setHours(23);
					time.setMinutes(59);
					time.setSeconds(59);
					self.endTs = time.getTime();
			        var start = self.$start.html().split('/').join(''),
	            		end = self.$end.html().split('/').join('');
	            	if(start>end){
	            		am.msg('结束时间小于开始时间');
	            	}
	            	if(self.endTs-self.startTs>31*24*60*60*1000){
	            		am.msg('时间跨度超过一个月');
	            	}
			    }
			});

			this.$dep = this.$.find('.dep').vclick(function(){
				var _this = $(this);
				am.popupMenu("请选择部门", self.deparList , function (ret) {
                   _this.find('.select').html(ret.name);
                   self.depcode = ret.code;
                });
            });

            this.$type = this.$.find('.type').vclick(function(){
				var _this = $(this);
				am.popupMenu("请选择类型", self.dayExpendTypeList , function (ret) {
                    _this.find('.select').html(ret.name);
                    self.dayExpendType = ret.id;
                });
            });

            this.$search = this.$.find('.search-btn').vclick(function(){
            	var start = self.$start.html().split('/').join(''),
            		end = self.$end.html().split('/').join('');
            	if(start>end){
            		am.msg('查询开始时间不能大于结束时间');
            		return;
            	}
            	if(self.endTs-self.startTs>31*24*60*60*1000){
            		am.msg('只能查询时间跨度一个月内的记录');
            		return;
            	}
            	self.getList();
			});
			
			this.$title = this.$.find('.am-header p');
            this.$summary = this.$.find('.summary').vclick(function(){
				if($(this).hasClass('toggle')){
					if($(this).hasClass('open')){
						$(this).removeClass('open');
						self.$summaryMask.hide();
					}else {
						$(this).addClass('open');
						self.$summaryMask.show();
					}
				}
			});
			this.$summaryMask = this.$.find('.summaryMask').vclick(function(){
				self.$summary.removeClass('open');
				$(this).hide();
			});
            this.$form = this.$.find('.form');
            this.$formHeader = this.$form.find('.header');
            this.$formList = this.$form.find('.list');
            this.$li = this.$formList.find('li');
            this.$formList.empty();

            this.$suggest = this.$.find('.suggest');
            this.$empty = this.$.find('.empty');
			this.$result = this.$.find('.result');
			
			this.$introDetail = am.page.about.$.find('.introDetail').vclick(function(){
        		$(this).hide();
            });
            this.$introDetailText = this.$introDetail.find('.text');

            this.$proofDetail = am.page.about.$.find('.proofDetail');
            this.$proofMask = am.page.about.$.find('.mask').vclick(function(){
            	self.closeProof();
            	self.closeEdit();
			});
			
			this.$editContainer = am.page.about.$.find('.editContainer').on('vclick','.sure',function(){
				var data = $(this).parents('.editContainer').data('data');
				var editDate = {};
				var operateDate = self.$editTime.html();
				var money = self.$editMoney.val();
				var depcode = self.$editDepart.data('depcode');	
				var des = self.$editDes.val();
				if(data.type==1){
					var income = self.$editIncome.data('dayexpendtypeid');
					editDate = {
						id: data.id,
						depcode: depcode,
						dayExpendType: income,
						seFlag: 0,
						price: money,
						profile: '',
						intro: des,
						type: 1,
						operateDate: operateDate
					}
				}else if(data.type==2){
					var method = self.$editMethod.data('dayexpendtypeid');
					var out = self.$editOut.data('seFlag');
					var profile = self.$editProof.data('profile');
					editDate = {
						id: data.id,
						depcode: depcode,
						dayExpendType: method,
						seFlag: out,
						price: money,
						profile: profile || '',
						intro: des,
						type: 2,
						operateDate: operateDate
					}
				}
				self.addExps(editDate);
			
			}).on('vclick','.cancle',function(){
				self.closeEdit();
			});
			this.$editTitle = this.$editContainer.find('.title');
			this.$editTime = this.$editContainer.find('.time').mobiscroll().calendar({
			    theme: 'mobiscroll',
			    lang: 'zh',
			    display: 'bottom',
			    months: "auto",
				// min: self.getStartMin(),
			    max: amGloble.now(),
			    setOnDayTap: true,
				buttons: [],
				endYear: amGloble.now().getFullYear()+50,
			    onSet: function(valueText, inst) {
			        console.log(valueText.valueText);
			        self.$editTime.html(valueText.valueText);
			    }
			});
			this.$editDepart = this.$editContainer.find('.depart').vclick(function(){
				var arr = self.deparList.slice(1);
				am.popupMenu("请选择部门", arr , function (ret) {
					self.$editDepart.html(ret.name).data('depcode',ret.code);
                });
            });
			this.$editMethod = this.$editContainer.find('.method').vclick(function(){
				var arr = self.dayExpendTypeList.slice(1);
				am.popupMenu("请选择类型", arr , function (ret) {
                	self.$editMethod.html(ret.name).data('dayexpendtypeid',ret.id);
                });
            });
			this.$editIncome = this.$editContainer.find('.income').vclick(function(){
				var arr = self.dayExpendTypeList.slice(1);
				am.popupMenu("请选择类型", arr , function (ret) {
                	self.$editIncome.html(ret.name).data('dayexpendtypeid',ret.id);
                });
            });
			this.$editOut = this.$editContainer.find('.out').vclick(function(){
				var arr = [
					{name:'从备用金',seFlag:0},
					{name:'从营收',seFlag:1},
				]
				am.popupMenu("请选择类型", arr , function (ret) {
                	self.$editOut.html(ret.name).data('seFlag',ret.seFlag);
                });
            });
			this.$editMoney = this.$editContainer.find('.money').vclick(function(){
	        	var amount = $(this);
				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
				    	amount.val(value);
				    }
				});
	        });
			this.$editProof = this.$editContainer.find('.proof .select').vclick(function(){
                amGloble.photoManager.takePhoto("voucher", {
                    parentShopId: am.metadata.userInfo.parentShopId,
                }, function(res) {
                    self.$editProof.html(am.photoManager.createImage("voucher", {
                        parentShopId: am.metadata.userInfo.parentShopId,
					}, res, 's')).data('profile',res).addClass('hasprofile');
					self.$editDelProof.show();
                }, function() {
                    console.log("fail");
                });
			});
			this.$editDelProof = this.$editContainer.find('.proof .delProof').vclick(function(){
				self.$editProof.html('').data('data','').removeClass('hasprofile');
				$(this).hide();
			});
			this.$editDes = this.$editContainer.find('.des textarea');

            this.scroll = new $.am.ScrollView({
	            $wrap: this.$.find(".form-list"),
	            $inner: this.$.find(".form-list>ul"),
	            direction: [false, true],
	            hasInput: false,
	            bubble:false
	        });
	        this.scroll.refresh();

	        this.$formList.on('vclick','.delete',function(){
	        	var _this = $(this);
	        	var data = _this.parents('.item').data('data');
				if(data.auditingFlag == 1) return am.msg("已对单状态不能删除单据");
	        	if(am.operateArr.indexOf('H')==-1 && am.operateArr.indexOf('H1')==-1){
	        		am.msg('您没有权限删除单据');
	        		return;
	        	}
	        	if(am.operateArr.indexOf('H1')>-1){
	        		var billTs = self.getZeroTs(new Date(data.operateDate*1)),
	        			todayTs = self.getZeroTs(new Date());
	        		if(todayTs-billTs>3*24*60*60*1000){
	        			am.msg('您只能删除3天内的单据');
	        			return;
	        		}
				}
				var des = '确定删除该条记录？';
				if(data.payWay==2 || data.payWay==3){
					des += '(该记录对应了收款)';
				}
	        	atMobile.nativeUIWidget.confirm({
                    caption: '删除记录',
                    description: des,
                    okCaption: '确定',
                    cancelCaption: '取消'
                }, function(){
                    self.deleteRecord(data);
                }, function(){
                    
                });
	        }).on('vclick','.proof',function(){
				if($(this).hasClass('noProof')){
					return;
				}
	        	var data = $(this).parents('.item').data('data');
	        	console.log(data);
	        	self.openProof(data);
			}).on('vclick','.edit',function(){
				var data = $(this).parents('.item').data('data');
				if(data.auditingFlag == 1) return am.msg("已对单状态不能修改单据");
	        	if(am.operateArr.indexOf('H')==-1 && am.operateArr.indexOf('H1')==-1){
	        		am.msg('您没有权限修改单据');
	        		return;
	        	}
	        	if(am.operateArr.indexOf('H1')>-1){
	        		var billTs = self.getZeroTs(new Date(data.operateDate*1)),
	        			todayTs = self.getZeroTs(new Date());
	        		if(todayTs-billTs>3*24*60*60*1000){
	        			am.msg('您只能修改3天内的单据');
	        			return;
	        		}
	        	}
	        	self.openEdit(data);
			}).on('vclick','.intro p:nth-child(3)',function(){
	        	if(!$(this).next()){
	        		return;
	        	}
	        	var w = $(this).width(),
	        		t = $(this).offset().top,
	        		l = $(this).offset().left-75,
	        		text = $(this).html();
	        	self.$introDetail.show();
	        	self.$introDetailText.html(text).css({
	        		'min-width': w+'px',
	        		'max-width': 2*w+'px',
	        		'bottom': $('body').height()-t+'px',
	        	});
	        	self.$introDetailText.css({
	        		'left': l-(self.$introDetailText.outerWidth()-w)/2+'px'
	        	});
			}).on('vclick','.intro p:nth-child(1)',function(){
				var id = $(this).data('id');
	        	$.am.changePage(am.page.memberDetails, "slideup",{
                    customerId:id,
                    tabId:1
                });
			});

			this.$.find('.add').vclick(function(){
				self.add && self.add();
			});
			
			if(this.type == 2){
				this.$form.removeClass('income');
				this.$formHeader.find('div:nth-child(2)').html('支出类型');
			}else if(this.type == 1){
				this.$form.addClass('income');
				this.$formHeader.find('div:nth-child(2)').html('收入类型');
			}
		},
		reset:function(){
			var today = new Date();
			this.$start.html(today.format('yyyy.mm.dd'));
			this.$end.html(today.format('yyyy.mm.dd'));
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			this.startTs = today.getTime();
			today.setHours(23);
			today.setMinutes(59);
			today.setSeconds(59);
			this.endTs = today.getTime();

			this.$suggest.show();
			this.$empty.hide();
			this.$result.hide();

			this.depcode =  null;
			this.dayExpendType = null;

			this.$dep.find('.select').html('全部');
			this.$type.find('.select').html('全部');
		},
		getDeparList:function(){
			this.deparList = JSON.parse(JSON.stringify(am.metadata.deparList));
			this.deparList.unshift({
				name:'全部',
				code: null
			});
		},
		getDayExpendTypeList:function(){
			this.dayExpendTypeList = [];
			for(var i=0;i<am.metadata.dayExpendTypeList.length;i++){
				if(this.type==2){
					if(am.metadata.dayExpendTypeList[i].dayexpendtypeid!=5){
						this.dayExpendTypeList.push(am.metadata.dayExpendTypeList[i]);
					}
				}else if(this.type==1){
					if(am.metadata.dayExpendTypeList[i].dayexpendtypeid==5){
						this.dayExpendTypeList.push(am.metadata.dayExpendTypeList[i]);
					}
				}
			}
			if(this.type==1){
				this.dayExpendTypeList.unshift({
					name:'特权卡开通',
					id: -10086
				});
				this.dayExpendTypeList.unshift({
					name:'特权卡续费',
					id: -10087
				})
			}
			this.dayExpendTypeList.unshift({
				name:'全部',
				id: null
			})
		},
		getList:function(){
			var self = this;
			am.loading.show();
			this.scroll.scrollTo('top');
			am.api.queryData.exec({
				shopId:  am.metadata.userInfo.shopId,
				type: self.type,
				period: self.startTs+'_'+self.endTs,
				depcode: self.depcode,
  				dayExpendType: self.dayExpendType
			},function(ret){
				am.loading.hide();
				if(ret && ret.code == 0){
					self.render(ret.content);
				}else if(ret && ret.code == -1){
					atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据读取失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.getList();
                    }, function(){
                        
                    });
				}
			});
		},
		payTypes: ['现金','银联','微信','支付宝','大众点评'],
		render:function(data){
			this.$suggest.hide();
			this.$summaryMask.hide();
			this.$summary.removeClass('toggle open');
			if(data.list.length){
				//统计
				var firstLine = '<div class="wrap"><p>总金额：<span>'+Number(data.totalMoney).toFixed(2)+'元</span></p><p>总笔数：<span>'+data.totalCount+'笔</span></p></div>';
				var secondLine = '';
				for(var i=0;i<data.typeList.length;i++){
					secondLine += '<p>'+this.getDayExpendNameByType(data.typeList[i].dayExpendType)+'：<span>'+Number(data.typeList[i].price).toFixed(2)+'元</span></p>'
				}
				secondLine = '<div class="wrap"><div class="clearfix inner">'+secondLine+'</div></div>';
				this.$summary.html(firstLine+secondLine);
				
				//列表
				this.$formList.empty();
				for(var i=0;i<data.list.length;i++){
					var $li = this.$li.clone();
					var auditStr = "";
					if(data.list[i].auditingFlag == 1){
						auditStr = "<span class='freezeSpan iconfont icon-gou'></span>";
					}
					if(data.list[i].payWay == "5"){
						data.list[i].payWay = "1";
					}
					$li.find('.operateDate').html(auditStr + new Date(data.list[i].operateDate*1).format('yyyy.mm.dd'));
					$li.find('.dayExpendType').html(this.getDayExpendNameByType(data.list[i].dayExpendType));
					$li.find('.payType').html(this.payTypes[data.list[i].payWay] || '--');
					$li.find('.price').html(Number(data.list[i].price).toFixed(2));
					$li.find('.depcode').html(this.getDepNameByCode(data.list[i].depcode));
					$li.find('.seFlag').html(data.list[i].seFlag==0?'从备用金':'从营收');
					$li.find('.intro p:nth-child(2),.intro p:nth-child(3)').html(data.list[i].intro || '--');
					$li.find('.operateName').html(data.list[i].operateName);
					if(!data.list[i].profile){
						$li.find('.proof').text('--').addClass('noProof');
					}
					$li.data('data',data.list[i]);

					if(data.list[i].memberid){
						$li.find('.intro').addClass('rebate');
						$li.find('.intro p:nth-child(1)').data('id',data.list[i].memberid)
						$li.find('.intro p:nth-child(1)').text(data.list[i].membername);
					}else {
						$li.find('.intro').removeClass('rebate');
					}

					this.$formList.append($li);
				}
				this.scroll.refresh();

				this.$result.show();
				this.$empty.hide();

				var lis = this.$formList.find('li');
				for(var i=0;i<lis.length;i++){
					var w1 =$(lis[i]).find('.intro p:nth-child(2)').width(),
						w2 = $(lis[i]).find('.intro p:nth-child(3)').width();
					if(w1<=w2){
						$(lis[i]).find('.triangle').remove().end().find('p:nth-child(3)').removeClass('am-clickable');
					}
				}

				var _h = this.$summary.find('.wrap:last-child p').height(),
					_th = this.$summary.find('.wrap:last-child .inner').height();
				if(_th>2*_h){
					this.$summary.addClass('toggle');
				}
			}else {
				this.$result.hide();
				this.$empty.show();
			}
		},
		deleteRecord:function(data){
			var self = this;
			am.loading.show();
			am.api.delExps.exec({
				id: data.id
			},function(ret){
				am.loading.hide();
				if(ret && ret.code == 0){
					am.msg('删除成功');
					self.getList();
				}else if(ret && ret.code == -1){
					atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '删除失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.deleteRecord(data);
                    }, function(){
                        
                    });
				}
			});
		},
		openProof:function(data){
			// this.$proofMask.show();
			// this.$proofDetail.addClass('active');
			this.$proofDetail.html(am.photoManager.createImage("voucher", {
                parentShopId: am.metadata.userInfo.parentShopId,
			}, data.profile, 'l'));
			var src = this.$proofDetail.find('img').attr('src');
			var items = [];
			var idx = 0;
			items.push({
				src: src,
				w: 1024,
				h: 1024
			});
			self.pswpTimer && clearTimeout(self.pswpTimer);
			am.loading.show();
			self.pswpTimer = setTimeout(function () {	
				am.loading.hide();
				am.pswp(items, idx);
			}, 800);
		},
		closeProof:function(){
			this.$proofMask.hide();
			this.$proofDetail.removeClass('active');
			this.$proofDetail.html('');
		},
		openEdit:function(data){
			this.$proofMask.show();
			this.$editContainer.addClass('active').data('data',data);
			this.$editDes.val('');
			this.$editProof.html('').data('profile','');
			if(data.type==1){//收入
				this.$editTitle.html('编辑收入');
				this.$editMethod.parent().hide();
				this.$editIncome.parent().show().end().html(this.getDayExpendNameByType(data.dayExpendType)).data('dayexpendtypeid',data.dayExpendType);
				this.$editOut.parent().hide();
				this.$editProof.parent().hide();
			}else if(data.type==2){//支出
				this.$editTitle.html('编辑支出');
				this.$editMethod.parent().show().end().html(this.getDayExpendNameByType(data.dayExpendType)).data('dayexpendtypeid',data.dayExpendType);
				this.$editIncome.parent().hide();
				this.$editOut.parent().show().end().html(data.seFlag==0?'从备用金':'从营收').data('seFlag',data.seFlag);
				this.$editProof.parent().show();
				if(data.profile){
					this.$editProof.html(am.photoManager.createImage("voucher", {
						parentShopId: am.metadata.userInfo.parentShopId,
					}, data.profile, 'm')).addClass('hasprofile').data('profile',data.profile);
					this.$editDelProof.show();
				}else {
					this.$editProof.removeClass('hasprofile');
					this.$editDelProof.hide();
				}
			}
			this.$editTime.html(new Date(data.operateDate*1).format('yyyy.mm.dd'));
			this.$editMoney.val(data.price);
			this.$editDepart.html(this.getDepNameByCode(data.depcode)).data('depcode',data.depcode);
			this.$editDes.val(data.intro);
		},
		closeEdit:function(){
			this.$proofMask.hide();
			this.$editContainer.removeClass('active');
		},
		getDayExpendNameByType:function(type){
			var types = am.metadata.dayExpendTypeList;
			types = types.concat([
				{
					name:'特权卡开通',
					id: -10086
				},
				{
					name:'特权卡续费',
					id: -10087
				}
			]);
			var name = '';
			for(var i=0;i<types.length;i++){
				if(types[i].id==type){
					name = types[i].name;
				}
			}
			return name || '--';
		},
		getDepNameByCode:function(code){
			var name = '';
			for(var i=0;i<am.metadata.deparList.length;i++){
				if(am.metadata.deparList[i].code==code && code){
					name = am.metadata.deparList[i].name;
				}
			}
			return name || '--';
		},
		getZeroTs:function(dateObj){
			dateObj.setHours(0);
			dateObj.setMinutes(0);
			dateObj.setSeconds(0);
			return dateObj.getTime();
		},
		addExps: function(data){
			var self = this;
			am.loading.show();
			am.api.editExps.exec({
				parentShopId:  am.metadata.userInfo.parentShopId,
				shopId: am.metadata.userInfo.shopId,
				intro: data.intro,
				price: data.price,
				type: data.type,
				seFlag: data.seFlag,
				operateId: am.metadata.userInfo.userId,
				dayExpendType: data.dayExpendType,
				autoFlag: 0,
				depcode: data.depcode,
				profile: data.profile,
				operateDate: data.operateDate,
				id: data.id,
				operateName: amGloble.metadata.userInfo.userName,
				dayExpendTypeName:self.getDayExpendNameByType(data.dayExpendType)
			},function(ret){
				am.loading.hide();
				console.log(ret);
				if(ret && ret.code == 0){
					am.msg('保存成功');
					self.closeEdit();
					self.$search.trigger('vclick');
				}else if(ret && ret.code == -1){
					atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据保存失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.addExps(data);
                    }, function(){
                        
                    });
				}
			});		
		}
	}

	$.am.payoutAndIncome = payoutAndIncome;
})();
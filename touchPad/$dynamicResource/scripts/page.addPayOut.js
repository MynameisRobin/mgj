(function(){
    var self = am.page.addPayOut = new $.am.Page({
        id: 'page_addPayOut',
        backButtonOnclick: function() {
            $.am.page.back("slidedown");
        },
        init: function(){
			var self=this;
            this.$depUlOut = this.$.find('.payoutDep'),
			this.$depLi = this.$depUlOut.find('li');
			this.$depUlOut.empty();

			this.$ExpendTypeUlOut = this.$.find('.payoutType'),
			this.$ExpendTypeLi = this.$ExpendTypeUlOut.find('li');
			this.$ExpendTypeUlOut.empty();

			this.$payoutMethod = this.$.find('.payoutMethod');

			this.$payoutIntro = this.$.find('.payoutIntro');

			this.$payoutPrice = this.$.find('.payoutPrice');

            this.$payLi = this.$.find('ul').on('vclick','li',function(){
	        	$(this).addClass('active').siblings().removeClass('active');
            });
            
            this.$payInput = this.$.find('.payoutPrice').vclick(function(){
	        	var amount = $(this);
				am.keyboard.show({
					title:"请输入数字",//可不传
					hidedot:false,
				    submit:function(value){
				    	amount.val(value);
				    }
				});
            });
            this.$imgWrap = this.$.find('.img-wrap').on('vclick', '.delImg', function (e) {
            	$(this).parents('.imgWrapper').remove();
            	var $wrappers = $(this).parents('.img-wrap').find('.imgWrapper');
            	if ($wrappers && $wrappers.length < 9) {
            		self.$uploadVoucher.show();
            	} else {
            		self.$uploadVoucher.hide();
            	}
            });
            this.$uploadVoucher = this.$.find('.upload').vclick(function(){
                var _this = $(this);
                amGloble.photoManager.takePhoto("voucher", {
                    parentShopId: am.metadata.userInfo.parentShopId,
                }, function(res) {
					var img = am.photoManager.createImage("voucher", {
						parentShopId: am.metadata.userInfo.parentShopId,
					}, res, 's');
					var imgItem = '<div class="imgWrapper"><span class="delImg am-clickable"></span></div>';
					_this.before(imgItem);
					_this.parents('.img-wrap').find('.imgWrapper:last').append(img);
					_this.parents('.img-wrap').find('.imgWrapper:last .delImg').data('img',res);
					var $wrappers=_this.parents('.img-wrap').find('.imgWrapper');
					if($wrappers && $wrappers.length>=9){
						_this.hide();
					}else{
						_this.show();
					}
                }, function() {
                    console.log("fail");
                });
            });

            this.$payoutSmt = this.$.find('.smt').vclick(function(){
            	self.addPayout();
            });
        },
        beforeShow: function(){
			this.$payoutSmt.removeClass('am-disabled');
			this.$uploadVoucher.removeData().show();
			this.$uploadVoucher.parent('.img-wrap').find('img').remove();
			this.$imgWrap.find('.imgWrapper').remove();
            //收入支出部门
			if(!this.$depUlOut.find('li').length){
				var dep = am.metadata.deparList;
				for(var i=0;i<dep.length;i++){
					var $li = this.$depLi.clone();
					$li.data('data',dep[i]).find('p').html(dep[i].name);
					this.$depUlOut.append($li);
				}
			}
			this.$depUlOut.find('li').removeClass('active');

			// 收入支出类型
			if (!this.$ExpendTypeUlOut.find('li').length) {
				var dayExpendTypeList = am.metadata.dayExpendTypeList.filter(function (value) {
					return value.visible == 1;
				});
				for (var i = 0; i < dayExpendTypeList.length; i++) {
					if (dayExpendTypeList[i].dayexpendtypeid != 5) {
						var $li = this.$ExpendTypeLi.clone();
						$li.data('data', dayExpendTypeList[i]).find('p').html(dayExpendTypeList[i].name);
						this.$ExpendTypeUlOut.append($li);
					}
				}
			}
			if(!this.$ExpendTypeUlOut.find('li').length){
				this.$ExpendTypeUlOut.html('未设置');
			}
			this.$ExpendTypeUlOut.find('li').eq(0).addClass('active').siblings().removeClass('active');

			//支出方式
			this.$payoutMethod.find('li').eq(0).addClass('active').siblings().removeClass('active');
        },
        afterShow: function(){
            
        },
        beforeHide: function(){

        },
        afterHide:function(){
            this.$payoutPrice.val('');
            this.$payoutIntro.val('');
            this.$uploadVoucher.prev().html('');
            this.$uploadVoucher.data('img','');
        },
        addPayout: function(){
			var depcode = this.$.find('.payoutDep .active').length ? this.$.find('.payoutDep .active').data('data').code : '',
				dayExpendType = this.$.find('.payoutType .active').data('data') && this.$.find('.payoutType .active').data('data').id,
				seFlag = this.$.find('.payoutMethod .active').index()==0?1:0,
				price = this.$payoutPrice.val(),
				intro = this.$payoutIntro.val();
				var imgNamesArr=[];
				var $imgs=this.$.find('.delImg');
				$.each($imgs,function(i,v){
					imgNamesArr.push($(this).data('img'));
				})
				profile=imgNamesArr.join(',');
			if(!this.$.find('.payoutType .active').data('data')){
				am.msg('未设置支出类型,请前往系统设置');
				return;
			}
			if(!(price*1)){
				am.msg('请输入支出金额');
				return;
			}
			var data = {
				depcode: depcode,
				dayExpendType: dayExpendType,
				seFlag: seFlag,
				price: price,
				profile: profile || '',
				intro: intro,
				type: 2
			}
			this.addExps(data);
			
        },
        addExps: function(data){
			if(this.$payoutSmt.hasClass('am-disabled')){
				return;
			}
			this.$payoutSmt.addClass('am-disabled');
			am.loading.show();
			am.api.addExps.exec({
				parentShopId:  am.metadata.userInfo.realParentShopId,
				shopId: am.metadata.userInfo.shopId,
				intro: data.intro,
				price: data.price,
				type: data.type,
				seFlag: data.seFlag,
				operateId: am.metadata.userInfo.userId,
				dayExpendType: data.dayExpendType,
				autoFlag: 0,
				depcode: data.depcode,
				profile: data.profile
			},function(ret){
				am.loading.hide();
				console.log(ret);
				if(ret && ret.code == 0){
					am.msg('保存成功');
					$.am.changePage(am.page.about,'slidedown','refreshPayOut');
				}else if(ret && ret.code == -1){
					self.$payoutSmt.removeClass('am-disabled');
					atMobile.nativeUIWidget.confirm({
                        caption: '网络异常',
                        description: '数据保存失败，是否立即重试？',
                        okCaption: '重试',
                        cancelCaption: '取消'
                    }, function(){
                        self.addExps(data);
                    }, function(){
                        
                    });
				}else {
					self.$payoutSmt.removeClass('am-disabled');
					am.msg(ret.mesage || '保存失败');
				}
			});		
		}
    })
})();
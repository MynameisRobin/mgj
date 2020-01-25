(function ($) {
    // opt.member 会员信息
    // opt.scb 点击确定的回调函数
    var self = am.sendRedPocketsDialog = {
        init: function () {
            var self = this;
            this.$ = $('#redPocketsDialogWrap');
            this.$dom = $('#redPocketsDialogWrap').on('vclick', '.icon-guanbi2', function () {
                self.hide();
            }).on('vclick', '.cancelBox', function () {
                self.hide();
            }).on('vclick', '.confirmBox', function () {
				self.sendRedPockets();
            }).on('vclick', '.pocketItem', function (e) {
				e.stopPropagation();
                if ( $(this).hasClass("active") ){
                    return false;
				}
                var $iconDanxuan = $(this).find('.pocketCheckBox .radio.icon-danxuan');
                var $iconQueren = $(this).find('.pocketCheckBox .radio.icon-queren');
                if ($iconDanxuan.is(":visible")){
                    $iconDanxuan.hide().siblings(".icon-queren").show();
                } else {
					$iconQueren.hide().siblings(".icon-danxuan").show();
                }
            }).on('vclick', '.radio', function (e) {
				e.stopPropagation();
                if ($(this).hasClass('icon-danxuan')){
                    $(this).hide().siblings(".icon-queren").show();
                } else {
                    $(this).hide().siblings(".icon-danxuan").show();
				}
            }).on('vclick','.headerWrapper span',function(){
                var $this = $(this);
                var callBack = function() {
                    $this.addClass('selected').siblings().removeClass('selected');
                    if ($this.data("type") == '1') {
                        // 普通红包模板
                        self.renderRedPocketsDialog();
                    }
                    else if ($this.data("type") == '2') {
                        // 红包组合模板
                        self.renderRedPocketsUnion();
                    }
                    self.sendPocketItemBox.refresh();
                    self.sendPocketItemBox.scrollTo("top");
                }
                if (self.sortFlag) {
                    am.confirm("提示", "切换页面会放弃排序，确定要继续吗？", "确定", "取消", function(){
                        self.cancelSortable();
                        callBack();
                    });
                } else {
                    callBack();
                }

            }).on('vclick','.sortableBtn',function(){
                self.sortableFn();
                self.sendPocketItemBox.refresh();
                self.sendPocketItemBox.scrollTo("top");
            }).on('vclick','.mask',function(){
                self.hide();
            }).on('vclick','.sortCancel',function(){
                self.cancelSortable();
            }).on('vclick','.sortSubmit',function(){
                self.submitSortable();
            }).on('vclick','.list-head',function(e){
                e.stopPropagation();
                if (self.sortFlag) {
                    return false;
				}
				$(this).parents(".pocketItem").toggleClass('active').siblings().addClass('active');
                self.changeRedUnion();
            });
            this.$sendPocketdialog = this.$dom.find('.sendPocketdialog');
            this.$redPocketItemBox = this.$dom.find('.scrollY'); // 红包弹窗Itembox
            this.sendPocketItemBox = new $.am.ScrollView({ // 红包弹窗滚动
                $wrap: this.$sendPocketdialog.find(".sendPocketItemBox"),
                $inner: this.$redPocketItemBox,
                direction: [false, true],
                hasInput: false
            });
            this.sendPocketItemBox.refresh();
        },
        // 折叠红包
        changeRedUnion: function () {
            this.sendPocketItemBox.refresh();
        },
        // 排序
        sortableFn: function() {
			var type = this.$dom.find(".headerWrapper .selected").data("type");
			// if (type == '1') {
			// 	this.$sendPocketdialog.find(".sortTip").text('拖拽对红包模板进行排序');
			// }
			// else if (type == '2') {
			// 	this.$sendPocketdialog.find(".sortTip").text('拖拽对红包组合进行排序');
			// }
			this.$sendPocketdialog.find(".sortTip").text('上下拖拽左侧图标进行排序');


            self.sortFlag = 1;
            // 隐藏
			this.$sendPocketdialog.find(".btnBox").hide();
			this.$sendPocketdialog.find(".sortableBtn").hide();
            // 显示
			this.$sendPocketdialog.find(".sortBtnBox").show();
            // 全部折叠
			this.$sendPocketdialog.find(".pocketItem").addClass("active");
			this.$sendPocketdialog.find(".icon-seq_icon").show();
			this.$sendPocketdialog.find(".icon-queren").hide();
			this.$sendPocketdialog.find(".icon-danxuan").hide();
            // 拖拽排序
            self.sortable = new $.am.SortableNew({
                $: self.$sendPocketdialog.find(".scrollY"),
                onSortEnd: function(ids){
                    console.log(ids);
                    self.ids = ids;
                },
                onNoSort:function(){
                    
                }
            });
            self.sortable.begin();
        },
        cancelSortable: function() {
			this.$sendPocketdialog.find(".btnBox").show();
			this.$sendPocketdialog.find(".sortableBtn").show();
			this.$sendPocketdialog.find(".sortBtnBox").hide();
			this.$sendPocketdialog.find(".icon-seq_icon").hide();
			this.$sendPocketdialog.find(".icon-queren").hide();
			this.$sendPocketdialog.find(".icon-danxuan").show();
            self.sortable.cancle();
            self.sortFlag = 0;
            var type = this.$dom.find(".headerWrapper .selected").data("type");
            if (type == '1') {
                self.renderRedPocketsDialog();
            } 
            else if (type == '2') {
                self.renderRedPocketsUnion();
            }
            self.sendPocketItemBox.refresh();
        },
        // 保存排序
        submitSortable: function(){
            var type = this.$dom.find(".headerWrapper .selected").data("type");
            var luckyMoneySeq = am.metadata.configs && JSON.parse(am.metadata.configs.luckyMoneySeq) || {};
            if (type == '1') {
                luckyMoneySeq.templateIdsSeq = self.ids;
            } 
            else if (type == '2') {
                luckyMoneySeq.templateIdsUnionSeq = self.ids;
            }

            var params = {
                id: "1",
                key: "luckyMoneySeq",
                value: luckyMoneySeq
            };

            am.addNormalConfig(params, function() {
                am.metadata.configs.luckyMoneySeq = JSON.stringify(luckyMoneySeq);
                self.cancelSortable();
            });
        },
        sendRedPockets: function () {
            var member = this.member;
            var params = {
                "memId": member.id, //会员id
                "memName": member.name, //会员名称
                "shopId": am.metadata.userInfo.shopId, //门店id
                "parentShopId": am.metadata.userInfo.parentShopId, //总部id
                "senderId": am.metadata.userInfo.userId, //发送人id
                "senderName": am.metadata.userInfo.userName, //发送人名称
                luckyMoneys: [],
                luckyMoneyUnionName: '', // 红包组合名称
                luckyMoneyUnionCount: 0 // 红包组合数量
            };
            // params = this.getNumber(params);
            function randomNum(minNum, maxNum) {
                switch (arguments.length) {
                    case 1:
                        return parseInt(Math.random() * minNum + 1, 10);
                    case 2:
                        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
                    default:
                        return 0;
                }
            }
            function _getLuckyMoneys(data, shopIds, count, id) {
                var rule = JSON.parse(data.rule),
                    tempContent = {
                        content: data,
                        useTemplate: true
                    },
                    startTime = 0;
                if (rule.validitymode == '0') {
                    startTime = new Date(new Date().getTime() + (parseInt(rule.days) * 24 * 60 * 60 * 1000)).format('yyyy/mm/dd') + ' 00:00:00';
                } else if (rule.validitymode == '1') {
                    startTime = rule.startTime + ' 00:00:00';
                }
                var obj = {
                    allowmallpay: rule.luckyMoneyRule.enableMallPay == true ? '1' : '0',
                    allowcashierpay: rule.luckyMoneyRule.enableCashierPay == true ? '1' : '0',
                    money: (rule.extraRule.type == '1' ? randomNum(parseInt(rule.extraRule.minMoney), parseInt(rule.extraRule.maxMoney)) : (rule.extraRule.money ? rule.extraRule.money : '')), //0:固定1：随机 2.折扣
                    discount: (rule.extraRule.type == '2' && rule.extraRule.discount ? rule.extraRule.discount : ''), //折扣红包
                    type: rule.extraRule.type ? rule.extraRule.type : '', //红包类型
                    templateId: data.id,
                    activityTitle: data.title,
                    shareRequire: rule.requiredShare,
					startTime: startTime,
					luckyMoneyUnionId: id,
                    // startTime: new Date().format('yyyy/mm/dd HH:MM:ss'),
                    /**
                     * 天数红包默认到当天结束的23:59:59
                     * 如果是到 当前日期10 号 10天有效那么到 20 号 23:59:59
                     **/
                    expiretime: rule.endTime ? rule.endTime + ' 23:59:59' : new Date(new Date().getTime() + ((parseInt(rule.days) + parseInt((rule.afterDays && rule.afterDays > 1) ? rule.afterDays - 1 : 0)) * 24 * 60 * 60 * 1000)).format('yyyy/mm/dd 23:59:59'),// 时间从发送当天算起
                    rule: JSON.stringify(tempContent)
                };
                
                if (shopIds) {
                    var appShopInfo = {
                        "checkedDirectShops": [],
                        "checkedIndirectShops": [],
                        "chosenShop": "2",
                        "id": data.id
                    },
					shopMap = am.metadata.shopMap;
					if (am.metadata.userInfo.shopType == '1') {
						appShopInfo.chosenShop = '0';
					}
                    $.each(shopIds.split(','), function(i, v) {
                        // 直属店
                        if (shopMap[v].softgenre == 2) {
                            appShopInfo.checkedDirectShops.push(v*1);
                        }
                        // 附属店
                        else if (shopMap[v].softgenre == 3) {
                            appShopInfo.checkedIndirectShops.push(v*1);
                        }
                    });
                } else {
                    var appShopInfo = data.appShopInfo;
                    if (appShopInfo) {
                        if (appShopInfo.chosenShop == '1') {
                            appShopInfo.currentShop = {
                                id: amGloble.metadata.userInfo.shopId,
                                osName: amGloble.metadata.userInfo.osName,
                            }
                        }
                    }
                }
				obj.appShopInfo = JSON.stringify(appShopInfo) // 门店配置信息
				if (count && count > 1) {
					for (var index = 0; index < count; index++) {
						params.luckyMoneys.push(obj);
					}
				}else{
					params.luckyMoneys.push(obj);
				}
			}
			var num = 0;
            this.$dom.find('.icon-queren').each(function (index, item) {
				if (!$(item).is(":visible")) return true;
                var data = $(this).parents('.pocketItem').data('data');
                if (data.redTemplates && data.redTemplates.length > 0) {
					num++;
					params.luckyMoneyUnionName += data.title + ',';
                    $.each(data.redTemplates, function(i, v) {
						if (am.isNull(v.redObj)) return true; 
						if (!v.isSendFlag) {
							_getLuckyMoneys(v.redObj, data.shopIds, v.count, data.id);
						}
                    });
                } else {
					_getLuckyMoneys(data);
                }
			});
			// 红包组合数量
			if (num > 0) {
				params.luckyMoneyUnionName = params.luckyMoneyUnionName.substr(0, params.luckyMoneyUnionName.length - 1);
				params.luckyMoneyUnionCount = num;
			}
            if (params.luckyMoneys.length == 0) {
                am.msg("请选择一种红包");
                return;
            } else {
                am.loading.show("正在发送，请稍候...");
                am.api.sendRedPacket.exec(params, function (ret) {
                    am.loading.hide();
                    if (ret && ret.code === 0) {
                        am.msg("发送成功");
                        // $("#luckyMoneyDetail .luckyMoneyRefresh").trigger("vclick");
                        // $("#itemLuckyMoneyDetail .luckyMoneyRefresh").trigger("vclick");
                        self.scb && self.scb();
                        self.hide();
                    } else {
                        am.msg(ret.message);
                    }
                });
            }
        },
        // 使用次数
        getNumber: function(params) {
            var permission = JSON.parse(am.metadata.configs.privateSendRed ? am.metadata.configs.privateSendRed : '');
            // 单个红包
            if (permission && permission.cashierAndAdmin && permission.cashierAndAdmin.number && permission.cashierAndAdmin.templateIds.length > 0) {
                params.numLimit = permission.cashierAndAdmin.number;
                var currentTime = new Date(),
                    currentDate = currentTime.format('yyyy/mm/dd'),
                    startDayTime = new Date(currentDate + ' 00:00:00').format('yyyy/mm/dd HH:MM:ss'),
                    endDayTime = new Date(currentDate + ' 23:59:59').format('yyyy/mm/dd HH:MM:ss');
                switch (parseInt(permission.cashierAndAdmin.timeType)) {
                    case 0: //每天
                        params.startTime = startDayTime;
                        params.endTime = endDayTime;
                        break;
                    case 1: //每月
                        var tempTS = new Date(currentTime.getTime() - 86400000 * 30).format('yyyy/mm/dd');
                        params.startTime = new Date(tempTS + ' 00:00:00').format('yyyy/mm/dd HH:MM:ss');
                        params.endTime = endDayTime;
                        break;
                    case 2: //每年
                        var tempTS = new Date(currentTime.getTime() - 86400000 * 30 * 365).format('yy/mm/dd');
                        params.startTime = new Date(tempTS + ' 00:00:00').format('yyyy/mm/dd HH:MM:ss');
                        params.endTime = endDayTime;
                        break;
                }
            }
            // 红包组合
            else if (permission && permission.cashierAndAdmin && permission.cashierAndAdmin.numberUnion && permission.cashierAndAdmin.templateIds.length > 0) {
                params.numLimit = permission.cashierAndAdmin.numberUnion;
                var currentTime = new Date(),
                    currentDate = currentTime.format('yyyy/mm/dd'),
                    startDayTime = new Date(currentDate + ' 00:00:00').format('yyyy/mm/dd HH:MM:ss'),
                    endDayTime = new Date(currentDate + ' 23:59:59').format('yyyy/mm/dd HH:MM:ss');
                switch (parseInt(permission.cashierAndAdmin.timeTypeUnion)) {
                    case 0: //每天
                        params.startTime = startDayTime;
                        params.endTime = endDayTime;
                        break;
                    case 1: //每月
                        var tempTS = new Date(currentTime.getTime() - 86400000 * 30).format('yyyy/mm/dd');
                        params.startTime = new Date(tempTS + ' 00:00:00').format('yyyy/mm/dd HH:MM:ss');
                        params.endTime = endDayTime;
                        break;
                    case 2: //每年
                        var tempTS = new Date(currentTime.getTime() - 86400000 * 30 * 365).format('yy/mm/dd');
                        params.startTime = new Date(tempTS + ' 00:00:00').format('yyyy/mm/dd HH:MM:ss');
                        params.endTime = endDayTime;
                        break;
                }
            }
            return params;
        },
        formatAppShops: function () {
            var data = JSON.parse(am.metadata.configs.privateSendRed);
            var res = {};
            if (data && data.enableCashierAndAdmin && data.cashierAndAdmin) {
                var appShops = data.cashierAndAdmin.appShops;
                if (appShops) {
                    for (var i = 0, len = appShops.length; i < len; i++) {
                        var item = appShops[i];
                        res[item.id] = item;
                    }
                }
            }
            this.appShopObj = res;
        },
        getShopsStr:function(appShopInfo){
            // 显示红包规则中的门店配置
            var shopTextInfo='';
            if (appShopInfo.chosenShop == '0') {
                shopTextInfo = "全部门店可使用";
            } else if (appShopInfo.chosenShop == '1') {
                shopTextInfo = "仅在发送门店可使用";
            } else {
                var shopMap = amGloble.metadata.shopMap,
                    checkedDirectShops = appShopInfo.checkedDirectShops,
                    checkedIndirectShops = appShopInfo.checkedIndirectShops;
                if(checkedDirectShops[0]=='r'){
                    shopTextInfo = "指定门店不可使用：";
                    for (var i = 0, dlen = checkedDirectShops.length; i < dlen; i++) {
                        if(shopMap[checkedDirectShops[i]]){
                            shopTextInfo += shopMap[checkedDirectShops[i]].osName + '、';
                        }
                    }
                    for (var j = 0, ilen = checkedIndirectShops.length; j < ilen; j++) {
                        if(shopMap[checkedIndirectShops[j]]){
                            shopTextInfo += shopMap[checkedIndirectShops[j]].osName + '、';
                        }
                    }
                }else{
                    shopTextInfo = "指定门店可使用：";
                    for (var i = 0, dlen = checkedDirectShops.length; i < dlen; i++) {
                        if(shopMap[checkedDirectShops[i]]){
                            shopTextInfo += shopMap[checkedDirectShops[i]].osName + '、';
                        }
                    }
                    for (var j = 0, ilen = checkedIndirectShops.length; j < ilen; j++) {
                        if(shopMap[checkedIndirectShops[j]]){
                            shopTextInfo += shopMap[checkedIndirectShops[j]].osName + '、';
                        }
                    }
                }
                shopTextInfo = shopTextInfo.substring(0, shopTextInfo.length - 1); // 去掉最后的，
            }
            return shopTextInfo;
        },
        // 获取配置的卖品信息
        getDepotsStr: function (allowCashierPayObj) {
            // enabled 是否开启套餐包抵扣 allowCashierPayObj.enableDepots
            // depots 指定的卖品编号Str  allowCashierPayObj.depots
            var enabled = allowCashierPayObj.enableDepots,
                depots = allowCashierPayObj.depots,
                resStr = '';
            if (enabled) {
                // 开启套餐包抵扣
                if (depots && depots.length) {
                    var depotsCodeMap = am.metadata.categoryCodeMap;
                    var depotsArr = depots.split(','); // 卖品编号数组
                    if (depotsArr[0] === 'r') {
                        // 反向指定
                        resStr += '指定卖品不可用（';
                        for (var i = 0, len = depotsArr.length; i < len; i++) {
                            var depot = depotsCodeMap[depotsArr[i]];
                            if (depot) {
                                resStr += depot.name + '、'
                            }
                        }
                    } else if (depotsArr[0] === 'a') {
                        resStr += '全部卖品可用，';
                    } else {
                        // 正向指定
                        resStr += '指定卖品可用（';
                        for (var i = 0, len = depotsArr.length; i < len; i++) {
                            var depot = depotsCodeMap[depotsArr[i]];
                            if (depot) {
                                resStr += depot.name + '、'
                            }
                        }
                    }
                }
                var lastIndex=resStr.length - 1;
                if(resStr.lastIndexOf('、')==lastIndex){
                    resStr = resStr.substring(0, lastIndex) + '），';
                }
                
                // if(am.metadata.userInfo.shopType===3){
                //     resStr = '附属店全部套餐包可用，'
                // }
                return resStr;
            } else {
                // 未开启卖品
                return resStr;
            }
        },
        // 获取配置的套餐包信息
        getTreatsStr:function(allowCashierPayObj){
            // enabled 是否开启套餐包抵扣 allowCashierPay.enableTreats
            // treats 指定的套餐包idStr  allowCashierPay.treats
            var enabled=allowCashierPayObj.enableTreats,
                treats= allowCashierPayObj.treats,
                resStr='';
            if(enabled){
                // 开启套餐包抵扣
                if(treats && treats.length){
                    var treatsArr=treats.split(',');
                    var metaTreats=am.metadata.tpList;
                    if(treatsArr[0]==='r'){
                        // 反向指定
                        resStr += '指定套餐包不可用（';
                        for(var i=0,len=treatsArr.length;i<len;i++){
                            for(var j=0,jlen=metaTreats.length;j<jlen;j++){
                                var item=metaTreats[j];
                                if(item.id==treatsArr[i]){
                                    resStr += '<span class="" data-id="' + item.id + '">' + item.packName + (i == (len - 1) ? '）' : '、') + '</span>';
                                }
                            }
                        }
                    }else if(treatsArr[0]==='a'){
                        resStr += '全部套餐包可用，';
                    }else{
                        // 正向指定
                        resStr += '指定套餐包可用（';
                        for(var i=0,len=treatsArr.length;i<len;i++){
                            for(var j=0,jlen=metaTreats.length;j<jlen;j++){
                                var item=metaTreats[j];
                                if(item.id==treatsArr[i]){
                                    resStr += '<span class="" data-id="' + item.id + '">' + item.packName + (i == (len - 1) ? '）' : '、') + '</span>';
                                }
                            }
                        }
                    }
                }
                if(am.metadata.userInfo.shopType===3){
                    resStr = '附属店全部套餐包可用，'
                }
                return resStr;
            }else{
                // 未开启套餐包抵扣
                return resStr;
            }
        },
        getItemsStr:function(allowCashierPayObj){
            var itemsStr='';
            var checkedItems = allowCashierPayObj.items; // 指定的项目
            if (allowCashierPayObj.enableItems && checkedItems && checkedItems.length) {
                // 指定部分项目可用
                var serviceCodeMap = am.metadata.serviceCodeMap;
                for (var i = 0, len = checkedItems.length; i < len; i++) {
                    var checkedItem = checkedItems[i];
                    itemsStr += checkedItem.name + '、';
                }
                itemsStr = '指定项目可用（' + itemsStr.substring(0, itemsStr.length - 1) + '），';
            } else if (allowCashierPayObj.enableItems && checkedItems && checkedItems.length === 0 || allowCashierPayObj.enableTreats === undefined) {
                // 指定全部项目可用 或者 只勾选店内消费的老红包默认全部项目可用
                itemsStr = '全部项目可用，';
            }
            
            return itemsStr;
        },
        serverList:function (list) {
            var str = '';
                $.each(list, function (i, item) {
                    return str += '<span class="" data-id="' + item.id + '">' + item.name + (i == (list.length - 1) ? '' : '、') + '</span>'
                })
            return str;
        },
        // 获取红包模板
        getRedPockets: function() {
            var redPackageTemplates = JSON.parse(am.metadata.redPackageTemplates);
            var privateSendRedObj = am.metadata.configs && JSON.parse(am.metadata.configs.privateSendRed);
            var luckyMoneySeq = am.metadata.configs && JSON.parse(am.metadata.configs.luckyMoneySeq);
            if (am.isNull(redPackageTemplates)) return [];
            if (am.isNull(privateSendRedObj)) return [];
            // 无序当前门店可用模板
            var templateIds = privateSendRedObj.cashierAndAdmin.templateIds; 
            // 排序
			var templateIdsSeq = luckyMoneySeq && luckyMoneySeq.templateIdsSeq; 
            var data = [];
            if (am.isNull(templateIdsSeq)){
                data = templateIds;
            } else {
                self.ids = templateIdsSeq;
                // 在比较排序
                var obj = {};
                $.each(templateIdsSeq, function(i, v) {
                    $.each(templateIds, function(a, b) {
                        if (v == b) {
                            data.push(v);
                            obj[v] = 1;
                        }
                    });
                });
                $.each(templateIds, function(i, v) {
                    if (!obj[v]) {
                        data.push(v);
                    }
                });
                obj = {};
            }
            return data;
        },
        // 获取红包组合
        getRedPocketsUnion: function() {
            var redPackageTemplates = am.metadata.redPackageTemplates;
            if (am.isNull(redPackageTemplates)) return false;
            var redObj = {};
            $.each(redPackageTemplates, function(i, v) {
                if (!redObj[v]) {
                    redObj[v.id] = v;
                }
            });

            var redTemplateUnion = am.metadata.configs && JSON.parse(am.metadata.luckyMoneyUnionConfig);
            // var redTemplateUnion = am.metadata.configs && JSON.parse(am.metadata.configs.redTemplateUnion);
            var privateSendRedObj = am.metadata.configs && JSON.parse(am.metadata.configs.privateSendRed);
            var luckyMoneySeq = am.metadata.configs && JSON.parse(am.metadata.configs.luckyMoneySeq);
            if (am.isNull(redTemplateUnion)) return false;
            // 可用
			var templateIdsUnion = privateSendRedObj.cashierAndAdmin.templateIdsUnion;
            if (am.isNull(templateIdsUnion)) return false;
            // 排序
            var templateIdsUnionSeq = luckyMoneySeq && luckyMoneySeq.templateIdsUnionSeq;
            var data = [];
            if (am.isNull(templateIdsUnionSeq)){
                var arr = [];
                $.each(templateIdsUnion, function(a, b) {
                    $.each(redTemplateUnion, function(i, v) {
                        if (v.id == b) {
                            arr.push(v);
                        }
                    });
				});

                // 没有排序的时候
                $.each(arr, function(a, b) {
                    if (b.redTemplates.length > 0) {
                        $.each(b.redTemplates, function(i, v) {
                            if (redObj[v.redTemplateId]) {
                                v['redObj'] = redObj[v.redTemplateId];
                            }
                        });
                    }
                });
                data = arr;
            } else {
                self.ids = templateIdsUnionSeq;
                var arr = [];
                $.each(templateIdsUnion, function(a, b) {
                    $.each(redTemplateUnion, function(i, v) {
                        if (v.id == b) {
                            arr.push(v);
                        }
                    });
				});
				
				// 如果排序id异常
				if (am.isNull(arr)) {
					data = redTemplateUnion;
				} else {
					var obj = {};
					$.each(templateIdsUnionSeq, function(a, b) {
						$.each(arr, function(i, v) {
							if (v.id == b) {
								obj[v.id] = 1;
								data.push(v);
							}
						});
					});
					$.each(arr, function(i, v) {
						if (!obj[v.id]) {
							data.push(v);
						}
					});
				}
                
                $.each(data, function(a, b) {
                    if (b.redTemplates.length > 0) {
                        $.each(b.redTemplates, function(i, v) {
                            if (redObj[v.redTemplateId]) {
                                v['redObj'] = redObj[v.redTemplateId];
                            }
                        });
                    }
                });
            }
            return data;
        },
        getRedUnionLi: function() {
            var li = ['<li class="pocketItem active am-clickable">',
            '	<div class="pocketCheckBox">',
			'<i class="icon icon-danxuan radio am-clickable"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-danxuan"></use></svg></i>',
			'<i class="icon icon-queren radio am-clickable"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-queren"></use></svg></i>',
			'<i class="icon icon-seq_icon sortBtn am-clickable"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-seq_icon"></use></svg></i>',
			// '		<i class="icon iconfont icon-danxuan radio am-clickable"></i>',
			// '		<i class="icon iconfont icon-seq_icon sortBtn"></i>',
            '	</div>',
            '	<div class="pocketContent">',
            '		<div class="list-head am-clickable">',
            '			<div class="list-title"></div>',
            '			<div class="list-count">共<span class="sumSpan">1</span>个红包<span class="list-arrow"></span></div>',
            '		</div>',
            '		<div class="list-box">',
            '		</div>',
            '		<div class="tips">',
            '			<span class="shopContent"></span>',
            '		</div>  ',
            '	</div>',
            '</li>'].join("");
            return li;
        },
        getRedUnionListItem: function() {
            var li = [
            '<div class="list-item">',
                '<div class="baseInfo">',
                    '<span class="name"></span>',
                    '<div class="rightDesc">',
                    '	<span class="category"></span>',
                    '	<span class="cuttingLine">/</span>',
                    '	<span class="availablePeriod"></span>',
                    '</div>',
                '</div>',
            '</div>'].join("");
            return li;
        },
        renderRedPocketsUnion:function(){
            var $wrap = $('.sendPocketItemBox .scrollY');
            var $emptyBox = $('.sendPocketItemBox .emptyBox');
            $wrap.empty();
			var data = self.getRedPocketsUnion();
            if (am.isNull(data)){
				$wrap.hide();
				self.$sendPocketdialog.find(".sortableBtn").hide();
				$emptyBox.show();
				return false;
			}
			self.$sendPocketdialog.find(".sortableBtn").show();
			$emptyBox.hide();
			$wrap.show();
            $.each(data, function(i, v){
				var totalCount = 0; // 红包组合内的红包模板个数
                var li = self.getRedUnionLi(),
                $li = $(li);
                $li.find(".list-title").text(v.title);
                $li.find(".list-box").empty();
                if (v.redTemplates.length > 0) {
                    $.each(v.redTemplates, function(a, b) {
						var item = b['redObj'];
						if (am.isNull(item)) {
							b.isSendFlag = true;
							return true;
						}
                        var rule = JSON.parse(item.rule);
                        if (rule.validitymode == 1 && new Date(rule.endTime).getTime() < new Date().getTime()) {
							b.isSendFlag = true;
                            return true;
                        }
                        var listItem = self.getRedUnionListItem();
                            $listItem = $(listItem);
                        if (JSON.stringify(rule) != '{}') {
                            var mountText = '';
                            switch (parseInt(rule.extraRule.type)) {
                                case 0:
                                    mountText = rule.extraRule.money + '元';
                                    break;
                                case 1:
                                    mountText = rule.extraRule.minMoney + '-' + rule.extraRule.maxMoney + '元随机';
                                    break;
                                case 2:
                                    mountText = rule.extraRule.discount + '折';
                                    break;
                                default:
                                    mountText = 0 + '元';
                            }

                            var allowCashierPay = rule.luckyMoneyRule.allowCashierPay,
                                allowMallPay = rule.luckyMoneyRule.allowMallPay;
                            $listItem.find(".name").text(item.title);
                            $listItem.find(".category").text(mountText);
                            var validitymodeStr = (rule.validitymode == 0 ? '领取' + rule.days + '天后' + rule.afterDays + '天有效' : rule.startTime + '-' + rule.endTime);
                            $listItem.find(".availablePeriod").text(validitymodeStr);

                            var appShopInfo = self.appShopObj[rule.id];
                            $.extend(rule, {
                                appShopInfo: appShopInfo
                            });
                            var shopTextInfo = '';
                            if (appShopInfo) {
                                shopTextInfo= self.getShopsStr(appShopInfo)
							}
							
							var $leftInfo = $('<div class="leftContent"></div>');
							var $rightInfo = $('<div class="rightContent"></div>');
							var $autoopen = '';
							if (rule.autoopen == '0') {
								$autoopen = $('<span class="autoopenSpan"><i class="iconfont icon-mt_giftbag_icon"></i><span>手动拆开</span></span>');
							}
							else if (rule.autoopen == '1') {
								$autoopen = $('<span class="autoopenSpan"><i class="iconfont icon-at_giftbag_icon"></i><span>自动拆开</span></span>');
							}
							$rightInfo.html($autoopen);


                            if (rule.luckyMoneyRule.enableCashierPay) {
                                var textObj = {};
                                textObj.subtract = allowCashierPay.consumptionAmountFlag && allowCashierPay.consumptionAmount ? '满' + allowCashierPay.consumptionAmount + '元可以抵扣现金，' : '';
                                textObj.memCard = allowCashierPay.memCard ? '仅允许散客使用（仅未在门店或线上办卡/充值/购买套餐的顾客使用），' : '';
                                textObj.otherRedPackage = allowCashierPay.otherRedPackage ? '禁止同时使用其它红包，' : '';
                                var treatsStr = self.getTreatsStr(allowCashierPay);
                                var itemsStr = self.getItemsStr(allowCashierPay);
                                var depotsStr =  self.getDepotsStr(allowCashierPay);
                                var itemsAndTreats = treatsStr + itemsStr + depotsStr;
                                if (itemsAndTreats.indexOf('全部项目可用') > -1 && itemsAndTreats.indexOf('全部套餐包可用') > -1 && itemsAndTreats.indexOf('全部卖品可用') > -1) {
                                    itemsAndTreats = "店内消费可用";
                                }
                                var cashierStr = textObj.subtract + textObj.memCard + textObj.otherRedPackage + itemsAndTreats;
                                if (cashierStr.lastIndexOf('，') === cashierStr.length - 1) {
                                    cashierStr = cashierStr.substring(0, cashierStr.length - 1);
                                }
                                $leftInfo.append('<span class="tipsContent">店内消费 :' + cashierStr + '</span>');
                                if (textObj.memCard && !self.isTempMember) {
									b.isSendFlag = true;
									return true;
                                }
							}

							var $span = $("<span class='countSpan'></span>");
							if (b.count*1 > 1) {
								$span.text("×" + b.count);
								$listItem.find(".name").append($span);
								totalCount = totalCount + b.count*1;
							} else {
								totalCount++;
							}

                            if (rule.luckyMoneyRule.enableMallPay) {
                                //是否启用商城购物抵扣    订单金额满   禁止与线上积分同时使用
                                var objText = {};
                                objText.orderAmount = allowMallPay.orderAmountFlag && allowMallPay.orderAmount ? '订单金额满' + allowMallPay.orderAmount + '元可以用，' : '';
                                objText.onlineScore = allowMallPay.onlineScore ? '禁止与线上积分同时使用，' : '';
                                objText.offlineScore = allowMallPay.offlineScore ? '禁止与线下积分同时使用，' : '';
                                objText.memCard = allowMallPay.memCard ? '禁止同时使用会员卡支付，' : '';
                                if (objText.orderAmount || objText.onlineScore || objText.offlineScore || objText.memCard) {
                                    $leftInfo.append('<span class="tipsContent">商城抵扣 : ' + (objText.orderAmount || '') + (objText.onlineScore || '') + (objText.offlineScore || '') + (objText.memCard || '') + (allowMallPay.items && allowMallPay.items.length > 0 ? ('指定可用项目' + self.serverList(allowMallPay.items)) : '') + '</span>');
                                } else {
                                    $leftInfo.append('<span class="tipsContent">商城可用</span>');
                                }
							}
							$listItem.append($leftInfo).append($rightInfo);
                            $li.find(".list-box").append($listItem);
                        }
					});
                }
                if (!am.isNull(v.shopIds)) {
                    var shopStr = '';
                    $.each(v.shopIds.split(","), function(q, r){
                        shopStr += am.metadata.shopMap[r].osName + '，';
                    })
                    var $span = $('<span class="shopContent"></span>').text("可用门店：" + shopStr.substr(0, shopStr.length - 1));
                    $li.find(".tips").html($span);
				}
				var isEmpty = $li.find(".list-box").html();
				if (am.isNull(isEmpty)) {
					return true;
				}
				
				$li.find(".sumSpan").text(totalCount || 0);
				$wrap.append($li.data("data", v));
			});
        },
        renderRedPocketsDialog: function () {
            if (!this.appShopObj) {
                this.formatAppShops();
            }
            var metadata = am.metadata;
			var $wrap = $('.sendPocketItemBox .scrollY');
			var $emptyBox = $('.sendPocketItemBox .emptyBox');
			$wrap.empty();
			var arr = self.getRedPockets();
			if (am.isNull(arr)) {
				$wrap.hide();
				$emptyBox.show();
				self.$sendPocketdialog.find(".sortableBtn").hide();
				return false;
			} 
			self.$sendPocketdialog.find(".sortableBtn").show();
			$emptyBox.hide();
			$wrap.show();
			self.ids = arr;
			//循环数据
			if (arr && arr.length) {
				var redNum = 0;
				$.each(arr, function (index, value) {
					$.each(metadata.redPackageTemplates, function (i, item) {
						if (value == item.id) {
							var data = JSON.parse(item.rule);
							if (data.validitymode == 1 && new Date(data.endTime).getTime() < new Date().getTime()) {
								return true;
							}
							if (JSON.stringify(data) != '{}') {
								var mountText = '';
								switch (parseInt(data.extraRule.type)) {
									case 0:
										mountText = data.extraRule.money + '元';
										break;
									case 1:
										mountText = data.extraRule.minMoney + '-' + data.extraRule.maxMoney + '元随机';
										break;
									case 2:
										mountText = data.extraRule.discount + '折';
										break;
									default:
										mountText = 0 + '元';
								}
								var allowCashierPay = data.luckyMoneyRule.allowCashierPay,
									allowMallPay = data.luckyMoneyRule.allowMallPay,
									domS = $('<li class="pocketItem am-clickable">' +
										'<div class="pocketCheckBox">' +
										'<i class="icon icon-danxuan radio am-clickable"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-danxuan"></use></svg></i>' +
										'<i class="icon icon-queren radio am-clickable"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-queren"></use></svg></i>' +
										'<i class="icon icon-seq_icon sortBtn am-clickable"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-seq_icon"></use></svg></i>' +
										// '<i class="icon iconfont icon-danxuan radio am-clickable"></i>' +
										// '<i class="icon iconfont icon-seq_icon sortBtn"></i>' +
										'</div>' +
										'<div class="pocketContent">' +
										'<div class="baseInfo">' +
										'<span class="name">' +
										item.title +
										'</span>' +
										'<div class="rightDesc">' +
										'<span class="category">' +
										mountText + '</span>' +
										'<span class="cuttingLine">/</span>' +
										'<span class="availablePeriod">' +
										(data.validitymode == 0 ? '领取' + data.days + '天后' + data.afterDays + '天有效' : data.startTime + '-' + data.endTime) +
										'</span>' +
										'</div>' +
										'</div>' +
										'<div class="tips"></div>' +
										'</div>' +
										'</li>');
								var appShopInfo = self.appShopObj[item.id];
								$.extend(item, {
									appShopInfo: appShopInfo
								}); // 将门店配置存在红包上
								var shopTextInfo = '';
								if (appShopInfo) {
									shopTextInfo= self.getShopsStr(appShopInfo)
								}

								var $leftInfo = $('<div class="leftContent"></div>');
								var $rightInfo = $('<div class="rightContent"></div>');
								var $autoopen = '';
								if (data.autoopen == '0') {
									$autoopen = $('<span class="autoopenSpan"><i class="iconfont icon-mt_giftbag_icon"></i><span>手动拆开</span></span>');
								}
								else if (data.autoopen == '1') {
									$autoopen = $('<span class="autoopenSpan"><i class="iconfont icon-at_giftbag_icon"></i><span>自动拆开</span></span>');
								}
								$rightInfo.html($autoopen);

								if (data.luckyMoneyRule.enableCashierPay) {
									var textObj = {};
									textObj.subtract = allowCashierPay.consumptionAmountFlag && allowCashierPay.consumptionAmount ? '满' + allowCashierPay.consumptionAmount + '元可以抵扣现金，' : '';
									textObj.memCard = allowCashierPay.memCard ? '仅允许散客使用（仅未在门店或线上办卡/充值/购买套餐的顾客使用），' : '';
									textObj.otherRedPackage = allowCashierPay.otherRedPackage ? '禁止同时使用其它红包，' : '';
									var treatsStr = self.getTreatsStr(allowCashierPay);
                                    var itemsStr = self.getItemsStr(allowCashierPay);
                                    var depotsStr =  self.getDepotsStr(allowCashierPay);
									var itemsAndTreats = treatsStr + itemsStr + depotsStr;
									if (itemsAndTreats.indexOf('全部项目可用') > -1 && itemsAndTreats.indexOf('全部套餐包可用') > -1 && itemsAndTreats.indexOf('全部卖品可用') > -1) {
										itemsAndTreats = "店内消费可用";
									}
									var cashierStr = textObj.subtract + textObj.memCard + textObj.otherRedPackage + itemsAndTreats;
									if (cashierStr.lastIndexOf('，') === cashierStr.length - 1) {
										cashierStr = cashierStr.substring(0, cashierStr.length - 1);
									}
									$leftInfo.append('<span class="tipsContent">店内消费 :' + cashierStr + '</span>');
									if (textObj.memCard && !self.isTempMember) {
										return true;
									}
								} else {
								}
								if (data.luckyMoneyRule.enableMallPay) {
									//是否启用商城购物抵扣    订单金额满   禁止与线上积分同时使用
									var objText = {};
									objText.orderAmount = allowMallPay.orderAmountFlag && allowMallPay.orderAmount ? '订单金额满' + allowMallPay.orderAmount + '元可以用，' : '';
									objText.onlineScore = allowMallPay.onlineScore ? '禁止与线上积分同时使用，' : '';
									objText.offlineScore = allowMallPay.offlineScore ? '禁止与线下积分同时使用，' : '';
									objText.memCard = allowMallPay.memCard ? '禁止同时使用会员卡支付，' : '';
									if (objText.orderAmount || objText.onlineScore || objText.offlineScore || objText.memCard) {
										$leftInfo.append('<span class="tipsContent">商城抵扣 : ' + (objText.orderAmount || '') + (objText.onlineScore || '') + (objText.offlineScore || '') + (objText.memCard || '') + (allowMallPay.items && allowMallPay.items.length > 0 ? ('指定可用项目' + self.serverList(allowMallPay.items)) : '') + '</span>');
									} else {
										$leftInfo.append('<span class="tipsContent">商城可用</span>');
									}
								} else {}
								if (data.luckyMoneyRule.enableMallPay && !data.luckyMoneyRule.enableCashierPay) {
									// 仅商城购物 则不显示门店
									shopTextInfo = "";
								}
								if (amGloble.metadata.userInfo.shopType == 1) {
									// 单店
									shopTextInfo = "";
								}
								var appShopText = '<span class="tipsContent">' + shopTextInfo + '</span>';
								$leftInfo.append(appShopText);
								$(domS).find('.tips').append($leftInfo).append($rightInfo);
								//数据
								domS.data('data', item);
								$wrap.append(domS);
							} else {}
							redNum++;
						}
					})
				});
				// 一条都没有
				if (redNum === 0) {
					$wrap.hide();
					$emptyBox.show();
					self.$sendPocketdialog.find(".sortableBtn").hide();
					return false;
				}
            }
        },
        show: function (opt) {
            if (!this.$dom){
                this.init();
			}
			this.member = opt.member;
			this.scb = opt.scb;
			var isTempMember = 1; // 1 散客,0 会员
			var memberStage = opt.member && (opt.member.memberstage || opt.member.memberStage);
			if (memberStage > 2) {
				// memberstage :   1-新客 2-潜在会员 3-会员 4临界会员,默认1, 1 2都是散客
				isTempMember = 0;
			}
			self.isTempMember = isTempMember;
			// 默认加载红包模板
			this.renderRedPocketsDialog();
			this.$dom.show();
			this.sendPocketItemBox.refresh();
			this.sendPocketItemBox.scrollTo("top");
        },
        hide: function () {
			this.$dom.hide();
			this.$dom.find(".headerWrapper span").eq(0).addClass('selected').siblings().removeClass('selected');
			this.$sendPocketdialog.find(".btnBox").show();
			this.$sendPocketdialog.find(".sortableBtn").show();
			this.$sendPocketdialog.find(".sortBtnBox").hide();
			this.$sendPocketdialog.find(".emptyBox").hide();
			this.sortFlag = 0;
			this.isTempMember = 0;
        }
    };
})(jQuery);
var popup = {
    $:$("#pop_selecteCombo"),
    init:function(){
        var _this = this;
        this.$list = this.$.find(".combo_result ul");
        this.$li   = this.$list.find("li:first").remove();
        this.$.on("vclick",".cancel,.c-mask",function(){
            _this.hide();
        }).on("vclick",".ok",function(){
            var data = _this.getValue();
            if(!data.length){
                am.msg("请先选择套餐！");
                return;
            }
            _this.submit && _this.submit(data);
            _this.hide();
        }).on("vclick",".del-icon",function(){
            $(this).parents("li").remove();
        });

        this.ScrollView = new $.am.ScrollView({
            $wrap: this.$.find('.overbox'),
			$inner: this.$.find('.overbox-child'),
			direction: [false, true],
			hasInput: false,
			bubble:true
        });

        this.billItemSelector = new cashierTools.BillItemSelector({
            $: this.$,
            tab: 1,
            filter: 1,
            itemWidth:238,
            typeFilter: 1,
            groupKey: 'COMBOCARD_ITEM_GROUP',
            onSelect: function(data,callback) {
                //return _this.billMain.addItem(data);
                var $tr = _this.addItem(data);
                if(!data.tpd){
                    am.keyboard.show({
                        "title":"请选择单个项目次数",
                        "hidedot":true,//是否隐藏点
                        "submit":function(value){
                            if(!value) value=1;
                            $tr.find("span").html(data.name + "*" + value + "次");
                            $tr.data("number",value);
                            _this.$list.append($tr);
                            callback && callback($tr);
                        }
                    })
                }else{
                    _this.$list.append($tr);
                    callback && callback($tr);
                }
                _this.ScrollView.refresh();
                
            },
            onTouch: function(isVclick) {
                if(isVclick){
                    console.log(isVclick);
                }
                //self.billMain.hideMemberInfo(1);
                //如果底下两个模块升起来了，要降下来~~
                // if(isVclick){
                //     self.billMain.rise(1);
                //     self.billServerSelector.rise(1);
                // }
            },
            onTouchHold: function(data, $this){
                _this.billItemSelector.startGrouping();
            },
            beforeTabChange:function(data){
                if(data.id){
                    this.itemWidth = 162;
                    this.itemScroll.$wrap.parent().removeClass("wider");
                }else{
                    this.itemScroll.$wrap.parent().addClass("wider");
                    this.itemWidth = 238;
                }
            },
            onSize:function(){
                //self.billMain.dispatchSettingSelf();
            }
        });
    },
    getValue:function(){
        var res = [];
        this.$list.find("li").each(function(){
            var ret    = {};
            var data   = $(this).data("item");
            var number = $(this).data("number");
            ret.name   = data.name; 
            ret.id     = data.id;
            ret.tpd    = data.tpd;
            ret.number = number;
            res.push(ret);
        });
        return res;
    },
    addItem:function(data){
        var $li = this.$li.clone(true,true);
        $li.find("span").html(data.name);
        $li.data("item",data);
        return $li;
    },
    show:function(opt){
        this.billItemSelector.itemScroll.refresh();
        this.submit = opt.submit;
        this.cancel = opt.cancel;
        this.render(opt.data);
        this.$.show();
    },
    render:function(list){
        //数据回显
        this.$list.empty();
        if(list && list.length){
            for(var i=0;i<list.length;i++){
                var item = list[i],
                    $li  = this.$li.clone(true,true);
                if(item.number){
                    $li.data("number",item.number);
                    $li.find("span").html(item.name + "*" + item.number + "次");
                }else{
                    $li.find("span").html(item.name);
                }
                $li.data("item",item);
                this.$list.append($li);
            }
        }
    },
    hide:function(){
        this.$.hide();
        this.cancel && this.cancel();
        this.billItemSelector.typeFilterSelect && this.billItemSelector.typeFilterSelect.hide();
    },
    refresh:function(){
        this.billItemSelector.dataBind(this.processData(am.metadata.tpList));
        this.billItemSelector.setGroup(am.page.service.getGroupData.call(this));
        this.billItemSelector.reset();
    },
    processData: function(types) {
        var categorys = [];
        for (var i = 0; i < types.length; i++) {
            if(types[i].applyShopIds && types[i].applyShopIds.indexOf(am.metadata.userInfo.shopId) == -1){
                continue;
            }
            var type = {
                name: types[i].packName,
                id: types[i].id,
                price: types[i].price,
                pinyin: types[i].pinyin,
                tpd: types[i].tpd,
                costMoney: types[i].costMoney,
                img:"$dynamicResource/images/card3.jpg",
                isNewTreatment:types[i].isNewTreatment,
                validDay:types[i].validDay,
                validity:types[i].validity,
                validitycheck:types[i].validitycheck,
                cashshopids:types[i].cashshopids,
                itemid: types[i].id.toString()
            };
            categorys.push(type);
        }

        var serviceItem = [];
        for (var i = 0; i < am.metadata.classes.length; i++) {
            var sub = am.metadata.classes[i].sub;
            if(sub){
                for (var j = 0; j < sub.length; j++) {
                    if(sub[j].treatFlag== "1") continue;
                    serviceItem.push(sub[j]);
                }
            }
        }

        return [
            {
                id:0,
                name:"套餐",
                sub:categorys
            },
            {
                id:1,
                name:"单个项目",
                sub:serviceItem
            }
        ];
    },
}
var remark = {
    $:$("#addMoreRemark"),
    init:function(){
        var _this = this;
        this.openData  = [];//开卡数据
        this.chargeData= [];//充值数据

        this.$card       = this.$.find(".c-openCard");
        this.$recharge   = this.$.find(".c-recharge");
        this.$buypackage = this.$.find(".c-buypackage");
        this.$textarea   = this.$.find("textarea");

        this.$ul = this.$buypackage.find(".c-packagebox ul");
        this.$li = this.$ul.find("li:first").remove();
        popup.init();

        this.ScrollView= new $.am.ScrollView({
            $wrap : this.$.find(".c-content-box"),
            $inner : this.$.find(".c-content-box .c-scroll"),
            direction : [false, true],
            hasInput: false
        });

        this.$.on("vclick",".c-close,.cancel",function(){
            _this.hide();
        }).on("vclick",".ok",function(){
            var data = _this.getVal();
            if(data.checkData){
                am.msg(data.checkData.msg);
                return;
            }
            console.log(data);   
            _this.hide();
            _this.opt.submit && _this.opt.submit(data);
        }).on("vclick",".commonRemark .c-left",function(){
            var isSelected = $(this).hasClass("selected");
            var index = $(this).parents(".commonRemark").index();
            if($(this).parents(".commonRemark").hasClass("empty")){
                am.msg("暂无可充值的储值卡！");
                return;
            }
            if(isSelected){
                $(this).removeClass("selected");
                $(this).parents(".commonRemark").removeClass("selected");
            }else{
                _this.disableTextarea();

                $(this).addClass("selected");
                $(this).parents(".commonRemark").addClass("selected");
                // if(index==0 && _this.$openCardSelect.getValue()==-1){
                //     _this.$openCardSelect.show();
                // }
                if(index==0){
                    _this.showOpenCard();
                }
                if(index==1){
                    //根据cid选卡  不然就选弹出框来选
                    _this.checkOwnerCard(function(res){
                        if(res.code == 0){//找到卡了
                            var _data = res.data;
                            _this.$recharge.find(".value").text(_data.cardName).data("item",{
                                id:_data.cid,//卡id
                                name:_data.cardName,
                                cardTypeId:_data.cardTypeId
                            });
                            var mgj_minRecharge;
                            var cardData = amGloble.metadata.cardTypeMap[_data.cardTypeId];
                            if(cardData){
                                mgj_minRecharge    = cardData.mgj_minRecharge;
                            }
                            if(mgj_minRecharge && mgj_minRecharge!="0"){
                                _this.$recharge.find("input[type=text]").val(mgj_minRecharge);
                                return;
                            }
                            _this.showOpenRechageKeyBoard();
                        }
                        if(res.code == 1){//需要选择
                            _this.showOpenRechage();
                        }
                    });
                    
                }
                if(index == 2){
                    popup.show({
                        data:_this.$ul.data("item"),
                        submit:function(data){
                            //回写data
                            _this.openTextarea();
                            _this.renderCombo(data);
                        },
                        cancel:function(){
                            _this.openTextarea();
                        }
                    });
                }
            }
        }).on("vclick",".c-openCard .c-input",function(){
            _this.showOpenCardKeyBoard();
        }).on("vclick",".c-recharge .c-input",function(){
            // am.keyboard.show({
            //     "title":"请输入充值金额",
            //     "hidedot":true,//是否隐藏点
            //     "submit":function(value){
            //         _this.$recharge.find("input[type=text]").val(value);
            //     }
            // })
            _this.showOpenRechageKeyBoard();
        }).on("vclick",".add-icon",function(){
            _this.disableTextarea();
            popup.show({
                data:_this.$ul.data("item"),
                submit:function(data){
                    //回写data
                    _this.openTextarea();
                    _this.renderCombo(data);
                },
                cancel:function(){
                    _this.openTextarea();
                }
            });
        }).on("vclick",".del-icon",function(){
            var data  = _this.$ul.data("item");
            var index = $(this).parents("li").index();
            $(this).parents("li").remove();
            data.splice(index,1);
            if(!data.length){
                _this.$.find('.c-buypackage .c-left').trigger('vclick');
            }else {
                _this.$ul.data("item",data); 
            }
        }).on("vclick",".c-openCard .value",function(){
            _this.showOpenCard();
        }).on("vclick",".c-recharge .value",function(){
            _this.showOpenRechage();
        });
    },
    getCardData:function(){
        //获取开卡信息
        if(!this.cardCacheData){
            var types = am.metadata.cardTypeList;
            var categorys = [];
            for(var i=0;i<types.length;i++){
                if((types[i].cardtype==1 && !(types[i].timeflag==0 || (types[i].timeflag==2 && types[i].cardtypeid!='20161012'))) || types[i].newflag!='1'){
                    //过滤除资格卡和普通储值卡之外的卡
                    continue;
                }
                var type = {
                    name:types[i].cardtypename,
                    id:types[i].cardtypeid
                };
                categorys.push(type);
            }
            this.cardCacheData = categorys;
            return categorys;
        }else{
            return this.cardCacheData;
        }
        
    },
    checkOwnerCard:function(cb){
        var cid = this.getCid();
        if(this.rechargeCacheData && this.rechargeCacheData.length){
            for(var i=0;i<this.rechargeCacheData.length;i++){
                var item = this.rechargeCacheData[i];
                if(item.cid == cid){
                    cb({
                        code:0,
                        data:item
                    })
                    return;
                }
            }
        }
        cb({
            code:1
        })
    },
    showOpenCard:function(callback){
        var _this=this;
        var list = this.getCardData();

        am.popupMenu("请选择要开的卡",list,function(res){
            _this.$card.find(".value").text(res.name).data("item",res);
            var cardData = amGloble.metadata.cardTypeMap[res.id];
            var openmoney;
            if(cardData){
                openmoney    = cardData.openmoney;
                if(openmoney){
                    _this.$card.find("input[type=text]").val(openmoney);
                    return;
                }
                _this.showOpenCardKeyBoard();
            }
            
        });
    },
    showOpenCardKeyBoard:function(){
        var _this=this;
        var card =  this.$card.find(".value").data("item");
        var openmoney,mgj_minMoney;
        if(card){
            var cardData     = amGloble.metadata.cardTypeMap[card.id];
            if(cardData){
                openmoney    = cardData.openmoney;
                mgj_minMoney = cardData.mgj_minMoney;
            }
        }
        this.disableTextarea();
        am.keyboard.show({
            "title":"请输入开卡金额",
            "hidedot":true,//是否隐藏点
            "submit":function(value){
                _this.openTextarea();
                if(mgj_minMoney==1 && value<openmoney){
                    amGloble.msg("开卡金额不得小于最小开卡金额！");
                    _this.$card.find("input[type=text]").val(openmoney);
                }else{
                    _this.$card.find("input[type=text]").val(value);
                }
            },
            "cancel":function(){
                _this.openTextarea();
            }
        })
    },
    disableTextarea:function(){
        var $textarea = this.$.find("textarea");
        $textarea.blur();
        $textarea.prop("readonly","readonly");
    },
    openTextarea:function(){
        var _this = this;
        setTimeout(function(){
            _this.$.find("textarea").removeAttr("readonly");
        },500);
        
    },
    showOpenRechageKeyBoard:function(){
        var _this = this;
        var mgj_minRecharge;
        var card =  this.$recharge.find(".value").data("item");
        var cardData = amGloble.metadata.cardTypeMap[card.cardTypeId];
        if(cardData){
            mgj_minRecharge    = cardData.mgj_minRecharge;
        }
        this.disableTextarea();
        am.keyboard.show({
            "title":"请输入充值金额",
            "hidedot":true,//是否隐藏点
            "submit":function(value){
                _this.openTextarea();
                if(mgj_minRecharge && mgj_minRecharge!="0" && value<mgj_minRecharge){
                    amGloble.msg("充值金额不得小于最低充值金额！");
                    _this.$recharge.find("input[type=text]").val(mgj_minRecharge);
                }else{
                    _this.$recharge.find("input[type=text]").val(value);
                }
            },
            "cancel":function(){
                _this.openTextarea();
            }
        })
    },
    showOpenRechage:function(){
        var _this = this;
        var list = this.getRechargeData();
        am.popupMenu("请选择要充值的卡",list,function(res){
            _this.$recharge.find(".value").text(res.name).data("item",res);
            var mgj_minRecharge;
            var cardData = amGloble.metadata.cardTypeMap[res.cardTypeId];
            if(cardData){
                mgj_minRecharge    = cardData.mgj_minRecharge;
            }
            if(mgj_minRecharge && mgj_minRecharge!="0"){
                _this.$recharge.find("input[type=text]").val(mgj_minRecharge);
                return;
            }
            _this.showOpenRechageKeyBoard();
        });
    },
    getRechargeData:function(){
        var list = this.rechargeCacheData;
        var res = [];
        for(var i=0;i<list.length;i++){
            res.push({
                id:list[i].cid,
                name:list[i].cardName,
                cardTypeId:list[i].cardTypeId
            });
        }
        return res;
    },
    getCid:function(){
        var data = this.opt.billData.data;
        var _data=null;
        try{
            _data = JSON.parse(data);
        }catch(e){}
        if(_data){
            return _data.cid;
        }else{
            return null;
        }
    },
    refresh:function(){
        popup.refresh();
    },
    getVal:function(){
        var res = {checkData:{
            msg:"",
            ispass:true
        }};
        if(this.$card.hasClass("selected")){
            //开卡
            var $cardData = this.$card.find(".value").data("item");
            res.opencard = {
                isbuy:false,
                id:$cardData.id,
                name:$cardData.name,
                money:this.$card.find("input[type=text]").val()
            }
            if($cardData && $cardData.isbuy){
                res.opencard.isbuy = true;
            }
            if(!res.opencard.id){
                // this.$openCardSelect.show();
                this.showOpenCard();
                res.checkData.msg = "请先选择要开的卡！";
                res.checkData.ispass=false;
            }
            if(!res.opencard.money){
                res.checkData.msg = "请先填写开卡金额！";
                res.checkData.ispass=false;
            }
        }
        if(this.$recharge.hasClass("selected")){
            //充值
            var $rechargeData = this.$recharge.find(".value").data("item");
            res.recharge = {
                isbuy:false,
                id:$rechargeData.id,
                name:$rechargeData.name,
                cardTypeId:$rechargeData.cardTypeId,
                money:this.$recharge.find("input[type=text]").val()
            }
            if($rechargeData && $rechargeData.isbuy){
                res.recharge.isbuy = true;
            }
            if(!res.recharge.id){
                //this.$chargeSelect.show();
                this.showOpenRechage();
                res.checkData.msg = "请先选择要充值的卡！";
                res.checkData.ispass=false;
            }
            if(!res.recharge.money){
                res.checkData.msg = "请先填写充值金额！";
                res.checkData.ispass=false;
            }
        }
        if(this.$buypackage.hasClass("selected")){
            var $buypackage = this.$buypackage.data("item");
            //购买套餐
            res.buypackage = {
                isbuy:false,
                data:this.$ul.data("item")
            }
            if($buypackage && $buypackage.isbuy){
                res.buypackage.isbuy = true;
            }
            if(!res.buypackage.data){
                res.checkData.msg = "请先选择套餐！";
                res.checkData.ispass=false;
            }
        }
        if(res.checkData.ispass){
            delete res.checkData;
        }
        res.textarea = this.$textarea.val();
        return res;
    },
    reset:function(){
        this.$.find(".commonRemark").removeClass("selected");
        this.$.find(".commonRemark").find(".c-left").removeClass("selected");
        this.chargeData = null; 
        this.$recharge.find(".value").text('').data("item",null);
        this.$card.find(".value").text('').data("item",null);
        this.$buypackage.data("item",null);
        this.$recharge.find("input").val('');
        this.$card.find("input").val('');
        this.$ul.data("item",null);
        this.$ul.empty();

        this.$card.show();
        this.$recharge.show();
        this.$buypackage.show();
    },
    show:function(opt){
        var _this=this;
        this.opt = opt;
        this.reset();
        this.openTextarea();
        this.$textarea.val(this.opt.value);
        //数据回写
        
        if(opt.billData.memId && opt.billData.memId!=-1){
            this.$recharge.show();
            am.searchMember.getPaidCard(opt.billData.memId,function(content){
                if(content && content.length){
                    //_this.dataBind("chargeCard",content);
                    _this.rechargeCacheData = _this.checkRechargeCard(content);
                    if(!_this.rechargeCacheData.length){
                        _this.$recharge.hide();
                    }
                    _this.$recharge.removeClass("empty");
                }else{
                    //_this.$recharge.addClass("empty");
                    _this.$recharge.hide();
                }
                _this.renderRemark(opt.billData);
            });
            
            
        }else{
            this.$recharge.hide();
            this.renderRemark(opt.billData);
        }      
        this.$.show();
    },
    checkRechargeCard:function(content){
        //检验这些卡是否能充值
        var res = [];
        for(var i=0;i<content.length;i++){
            var data = content[i];
            var expired = 0;
            if(data.invaliddate){
                var ts = new Date(data.invaliddate*1 || data.invaliddate);
                var n = new Date();
                if(ts){
                    if(n.getTime()>ts.getTime()){//两个日期比较时间戳大小
                        expired = 1;
                    }
                }
            }
            if (data.cardtype == 1 && (data.timeflag == 0 || data.timeflag == 2)) {//显示充值 !expired && 
                res.push(data);
            }
        }
        return res;
    },
    renderRemark:function(bill){
        var data = {};
        try{
            data = JSON.parse(bill.data);
        }catch(e){}
        var billRemark = data.billRemark || {};

        if(billRemark.opencard){//存在开卡备注
            this.$card.addClass("selected");
            this.$card.find(".c-left").addClass("selected");
            this.$card.find(".value").text(billRemark.opencard.name);
            this.$card.find(".value").data("item",billRemark.opencard);
            this.$card.find("input[type=text]").val(billRemark.opencard.money);
            if(billRemark.opencard.isbuy==true){
                this.$card.hide();
            }
        }
        if(billRemark.recharge){//存在充值备注
            this.$recharge.addClass("selected");
            this.$recharge.find(".c-left").addClass("selected");
            this.$recharge.find(".value").text(billRemark.recharge.name);
            this.$recharge.find(".value").data("item",billRemark.recharge);
            this.$recharge.find("input[type=text]").val(billRemark.recharge.money);
            if(billRemark.recharge.isbuy==true){
                this.$recharge.hide();
            }
        }
        if(billRemark.buypackage){//存在买套餐备注
            this.$buypackage.addClass("selected");
            this.$buypackage.find(".c-left").addClass("selected");
            this.$buypackage.data("item",billRemark.buypackage);
            this.renderCombo(billRemark.buypackage.data);
            if(billRemark.buypackage.isbuy==true){
                this.$buypackage.hide();
            }
        }
    },
    hide:function(){
        this.$.hide();
    },
    renderCombo:function(list){
        this.$ul.empty();
        this.$ul.data("item",list);
        for(var i=0;i<list.length;i++){
            var item = list[i],
                $li  = this.$li.clone(true,true);
            if(item.number){
                $li.find("span").html(item.name + "*" + item.number +"次");
            }else{
                $li.find("span").html(item.name);
            }
            this.$ul.append($li);

        }
        this.ScrollView.refresh();
    }
}

am.hangupRemark = remark;
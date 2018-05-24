(function() {
    var that = am.page.storage = new $.am.Page({
        id: "page_storage",
        init: function() {

            this.showPrice = false;

            this.addTabEvent();
            this.stock.addEvent();
            this.out.addEvent();
            this.into.addEvent();
            this.inventory.addEvent();

            this.$.find('.deepfresh').vclick(function(){
                that.deepfresh();
            });

            this.inbill = new this.List({
                api:"storageIntoBill",
                $pager:$("#intogf"),
                $:this.$.find('.content .item').eq(4),
                renderItem:function($li,data,inventory){
                    var $children = $li.children();
                    $children.filter(".billNo").text(data.billno);
                    $children.filter(".date").text(new Date(data.intodate).format("yyyy-mm-dd"));
                    $children.filter(".type").text(this.getIntoType(data.inwaretype));
                    $children.filter(".oprator").text(this.getAdminNameById(data.operatid));
                    $children.filter(".status").text(data.status==0?'未审核':'已审核');
                    if(data.status==0){
                        $children.filter(".status").css('color','#e82b45');
                    }else {
                        $children.filter(".status").css('color','#3bb372');
                    }
                    if(data.inwaretype==2){
                        $children.filter(".type").addClass('red');
                    }else if(data.inwaretype==1){
                        $children.filter(".type").addClass('green');
                    }

                    var item = data.details[0];
                    if(item){
                        var depot = this.getDepotById(inventory,item.depotid);
                        var $serviceType = $children.filter(".items").find('.serviceType').html('<p class="backStyle">'+ (depot?depot.name:"--") + ' x'+item.num+ (data.details.length>1?" 等":"") +'</p>');
                        if(data.details.length>1){
                            $serviceType.next().show();
                        }else{
                            $serviceType.next().hide();
                        }
                    }
                    $children.filter(".remark").html('<span>'+(data.remark || "" )+'</span>'); // + '<p class="sj"></p>'
                }
            });
            this.outbill = new this.List({
                api:"storageOutBill",
                $pager:$("#outgf"),
                $:this.$.find('.content .item').eq(2),
                renderItem:function($li,data,inventory){
                    var $children = $li.children();
                    $children.filter(".billNo").text(data.billno);
                    $children.filter(".date").text(new Date(data.outdate).format("yyyy-mm-dd"));
                    $children.filter(".type").text(this.getOutType(data.outwaretype));
                    $children.filter(".oprator").text(this.getAdminNameById(data.operatid));
                    $children.filter(".status").text(data.status==0?'未审核':'已审核');
                    if(data.status==0){
                        $children.filter(".status").css('color','#e82b45');
                    }else {
                        $children.filter(".status").css('color','#3bb372');
                    }

                    if(data.outwaretype==2 || data.outwaretype==4 || data.outwaretype==1){
                        $children.filter(".type").addClass('red');
                    }else if(data.outwaretype==5 || data.outwaretype==6 || data.outwaretype==7){
                        $children.filter(".type").addClass('blue');
                    }

                    var item = data.details[0];
                    if(item){
                        var depot = this.getDepotById(inventory,item.depotid);
                        var $serviceType = $children.filter(".items").find('.serviceType').html('<p class="backStyle">'+ (depot?depot.name:"--") + ' x'+item.num + (data.details.length>1?" 等":"") +'</p>');
                        if(data.details.length>1){
                            $serviceType.next().show();
                        }else{
                            $serviceType.next().hide();
                        }
                    }
                    $children.filter(".remark").html('<span>'+(data.remark || "" )+'</span>'); // + '<p class="sj"></p>'
                }
            });
        },
        beforeShow: function(param) {
            if(param == "back"){
                return;
            }
            if(!this.member.length){
                for(var i=0;i<am.metadata.employeeList.length;i++){
                    this.member[i] = {};
                    this.member[i].no = am.metadata.employeeList[i].no;
                    this.member[i].name = am.metadata.employeeList[i].no+'&nbsp;&nbsp;'+am.metadata.employeeList[i].name;
                    this.member[i].id = am.metadata.employeeList[i].id;
                }
            }
            
            this.suppliers = am.metadata.suppliers;

            if(!this.shopList.length){
                var shopList = [];
                for(var i=0;i<am.metadata.shopList.length;i++){
                    if(am.metadata.shopList[i].shopId!=am.metadata.userInfo.shopId){
                        var name = '';
                        if(am.metadata.shopList[i].osName && am.metadata.shopList[i].osName.replace(/(^\s*)|(\s*$)/g,'')){
                            name = am.metadata.shopList[i].osName;
                        }else {
                            if(am.metadata.shopList[i].softgenre==0){
                                name = am.metadata.shopList[i].shopName;
                            }else {
                                name = '门店名称未设定';
                            }
                        }
                        am.metadata.shopList[i].name = name;
                        shopList.push(am.metadata.shopList[i])
                    }
                }
                this.shopList = shopList;
            }

            if(am.metadata.category){
                if(!this.categoryType.length){
                    for(var i=0;i<am.metadata.category.length;i++){
                        this.categoryType.push({
                            type:am.metadata.category[i].type,
                            marqueid:am.metadata.category[i].marqueid
                        });
                    }
                }
            }else {
                am.msg('暂时没有数据...');
            }
            if(!this.checkRights){
                for(var i=0;i<am.operateArr.length;i++){
                    if(am.operateArr[i]=='J4'){
                        this.canAudit = true;
                    }
                    if(am.operateArr[i]=='a5'){
                        this.showPrice = true;
                    }
                    if(am.operateArr[i]=='J5'){
                        this.canUpdateTime = true;
                    }
                }
                this.checkRights = true;
                if(!this.showPrice){
                    $('.page_storage .out .slip').addClass('hidePrice');
                    $('.page_storage .into .slip').addClass('hidePrice');
                }
            }
            if(!this.checkSingle){
                if(am.metadata.shopList.length==1){ //am.metadata.userInfo.parentShopId!=am.metadata.userInfo.realParentShopId ||
                    this.singleDepart = true;
                }
                this.checkSingle = true;
            }
        },
        member: [],
        shopList: [],
        categoryType: [],
        afterShow: function(param) {
            if(param == "back"){
                return;
            }
            var self = this;
            if(am.metadata.category){
                if(!this.firstRender){
                    this.getData(function(data){
                        if(data.code == 0 && data.content.length){
                            self.$.find('.content .item').eq(0).show();
                            self.stock.filter(data,'',0);
                            self.stock.tabScroll.scrollTo('top');
                        }else if(data.code == 0 && data.content.length==0){
                            am.msg('暂时没有数据...')
                        }else {
                            am.msg('数据异常！');
                        }
                    });
                    this.firstRender = true;
                }else {
                    this.deepfresh();
                }
            }
            if(!this.canAudit){
                this.$.find('.Audit').remove();
            }

            this.inoutDepotType = JSON.parse(am.metadata.inoutDepotType) || [];
            console.log(this.inoutDepotType)
            var outMethods = [];
            var intoMethods = [];
            if(this.inoutDepotType.length){
                for(var i=0;i<this.inoutDepotType.length;i++){
                    if(this.inoutDepotType[i].type==0 && this.inoutDepotType[i].status==1 && this.inoutDepotType[i].typeName){
                        outMethods.push(this.inoutDepotType[i]);
                    }
                    if(that.inoutDepotType[i].type==1 && this.inoutDepotType[i].status==1 && this.inoutDepotType[i].typeName && this.inoutDepotType[i].code!=4){
                        intoMethods.push(this.inoutDepotType[i]);
                    }
                }
            }

            if(outMethods.length){
                for(var i=0;i<outMethods.length;i++){
                    outMethods[i].name = outMethods[i].typeName;
                }
            }

            if(intoMethods.length){
                for(var i=0;i<intoMethods.length;i++){
                    intoMethods[i].name = intoMethods[i].typeName;
                }
            }

            if(am.metadata.shopList.length==1){
                for(var i=0;i<outMethods.length;i++){
                    if(outMethods[i].code==3){
                        outMethods.splice(i,1);
                    }
                }
                for(var i=0;i<intoMethods.length;i++){
                    if(intoMethods[i].code==3){
                        intoMethods.splice(i,1);
                    }
                }
            }

            this.out.methods = outMethods;
            this.into.methods = intoMethods;
        },
        beforeHide: function() {
        },
        afterHide: function() {
            this.$.find('.mask').hide();
            this.$.find('.photo-and-barcode').removeClass('active');
        },
        addTabEvent:function(){
            var self = this;
            this.$.find('.nav .item').vclick(function() {
                var index = $(this).index();
                $(this).addClass('active').siblings().removeClass('active');
                $(this).parent().parent().find('.content .item').hide();
                $(this).parent().parent().find('.content .item .left,.content .item .right').hide();

                if(index==0){
                    that.getData(function(data){
                        if(data.code == 0 && data.content.length){
                            self.$.find('.content .item').eq(index).show();
                            self.stock.filter(data,'',0);
                            self.stock.tabScroll.scrollTo('top');
                        }else if(data.code == 0 && data.content.length==0){
                            am.msg('暂时没有数据...')
                        }else {
                            am.msg('数据异常！');
                        }
                    });
                }

                if(index==1){
                    that.getData(function(data){
                        if(data.code == 0 && data.content.length){
                            self.out.data = self.dataToAction(data);
                            self.$.find('.content .item').eq(index).show().find('.left,.right').show();
                            self.out.renderTab();
                            self.out.renderList(0);
                            self.out.tabScroll.scrollTo('top');
                        }else if(data.code == 0 && data.content.length==0){
                            am.msg('暂时没有数据...')
                        }else {
                            am.msg('数据异常！');
                        }
                    });
                    // self.out.getMaxOutStoBillno();
                }

                if(index==2){
                    /*
                    self.$.find('.content .item').eq(index).show();
                    that.outbillData.getOutData(0);
                    that.outbillData.show();
                    */
                    self.outbill.show();
                }
                if(index==4){
                    // self.$.find('.content .item').eq(index).show();
                    //   that.intobillData.getIntoData(0);
                    //   that.intobillData.show();
                    self.inbill.show();
                }
                if(index==3){
                    that.getData(function(data){
                        if(data.code == 0 && data.content.length){
                            self.$.find('.content .item').eq(index).show().find('.left,.right').show();
                            self.into.data = self.dataToAction(data);
                            self.into.renderTab();
                            self.into.renderList(0);
                            self.into.tabScroll.scrollTo('top');
                        }else if(data.code == 0 && data.content.length==0){
                            am.msg('暂时没有数据...')
                        }else {
                            am.msg('数据异常！');
                        }
                    });
                    // self.into.getMaxInStoBillno();
                }
                if(index==5){
                    that.getData(function(data){
                        if(data.code == 0 && data.content.length){
                            self.$.find('.content .item').eq(index).show().find('.left,.right').show();
                            self.inventory.data = self.dataToAction(data);
                            self.inventory.renderTab();
                            self.inventory.renderList(0);
                            self.inventory.tabScroll.scrollTo('top');
                        }else if(data.code == 0 && data.content.length==0){
                            am.msg('暂时没有数据...')
                        }else {
                            am.msg('数据异常！');
                        }
                    });
                }

            });

            this.$.find('.right .container').on('vclick','.actNumber',function(){
                var _this = $(this);
                var oldValue = $(this).html();
                am.keyboard.show({
                    title:"请输入数字",//可不传
                    hidedot:false,//是否隐藏点
                    submit:function(value){
                        if(value*1){
                            value = Math.round(value*10)/10;
                        }
                        _this.html(value==''? oldValue:value);
                        if(self.$.find('.nav .item.active').index()==1){
                            self.out.calTotalPrice();
                        }
                        if(self.$.find('.nav .item.active').index()==3){
                            self.into.calTotalPrice();
                        }
                        if(self.$.find('.nav .item.active').index()==5){
                            var inventoryVal = _this.html()*1 || 0,
                                stockVal = _this.parent().prev().html()*1 || 0;
                                diff = Math.round((inventoryVal-stockVal)*10)/10;
                            if(diff>0){
                                _this.parent().next().html('+'+diff).removeClass('less').addClass('more');
                            }else if(diff<0){
                                _this.parent().next().html(diff).removeClass('more').addClass('less');
                            }else if(diff==0){
                                _this.parent().next().html(diff).removeClass('more').removeClass('less');
                            }
                        }
                    },
                    cancel:function(){

                    }
                });
            });

            this.$.find('.right .container').on('vclick','.actPrice',function(){
                var _this = $(this);
                var oldValue = $(this).html();
                am.keyboard.show({
                    title:"请输入数字",//可不传
                    hidedot:false,//是否隐藏点
                    submit:function(value){
                        if(value*1){
                            value = Math.round(value*10)/10;
                        }
                        _this.html(value==''? oldValue:value);
                        if(self.$.find('.nav .item.active').index()==1){
                            self.out.calTotalPrice();
                        }
                        if(self.$.find('.nav .item.active').index()==3){
                            self.into.calTotalPrice();
                        }
                    },
                    cancel:function(){

                    }
                });
            });
        },
        getCategoryTypeByMarqueid: function(id){
            for(var i=0;i<this.categoryType.length;i++){
                if(this.categoryType[i].marqueid == id){
                    return this.categoryType[i].type;
                }
            }
            return '#';
        },
        stock: {
            template:'<li class="slip am-clickable" data-barcode="{{mgj_barcode}}" data-mgjdepotlogo="{{mgjdepotlogo}}" data-id="{{id}}">'+'\n'+
                '<div>{{no}}</div>'+'\n'+
                '<div>{{name}}</div>'+'\n'+
                '<div>{{specifacation}}</div>'+'\n'+
                '<div>{{unit}}</div>'+'\n'+
                '<div>{{marqueid}}</div>'+'\n'+
                '<div>￥{{inprice}}</div>'+'\n'+
                '<div>￥{{price}}</div>'+'\n'+
                '<div>￥{{saleprice}}</div>'+'\n'+
                '<div>{{safenumber}}</div>'+'\n'+
                '<div>{{num}}</div>'+'\n'+
                '<div>{{remark}}</div>'+'\n'+
                '<div>'+'\n'+
                    '<p class="record am-clickable" data-id="{{id}}"><span>出入库记录</span></p>'+'\n'+
                    '<p class="other am-clickable" data-id="{{id}}"><span>分店库存</span></p>'+'\n'+
                '</div>'+'\n'+
            '</li>',
            data: [],
            renderDate:[],
            renderIndex: 0,
            renderTab:function(data){
                var html = '';
                for(var i=0;i<that.dataToAction(data).length;i++){
                    html += '<li class="am-clickable">' + that.getCategoryTypeByMarqueid(that.dataToAction(data)[i].marqueid) + '</li>';
                }
                that.$.find('.stock .tab ul').html(html);
                this.initTabScroll();
            },
            initTabScroll:function(){
                if(this.tabScroll){
                    this.tabScroll.refresh();
                }else {
                    this.tabScroll = new $.am.ScrollView({
                        $wrap : that.$.find('.tab'),
                        $inner : that.$.find('.tab ul'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.tabScroll.refresh();
                }
            },
            initListScroll:function(){
                if(this.listScroll){
                    this.listScroll.refresh();
                }else {
                    this.listScroll = new $.am.ScrollView({
                        $wrap : that.$.find('.listScroll'),
                        $inner : that.$.find('.listScroll ul'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.listScroll.refresh();
                }
            },
            render:function(index){
                var pageDate = this.renderDate.slice(index*15,(index+1)*15);
                this.$list.empty();
                for(var i=0;i<pageDate.length;i++){
                    var html = '';
                    html += this.template
                    .replace('{{mgj_barcode}}',pageDate[i].mgj_barcode)
                    .replace('{{mgjdepotlogo}}',pageDate[i].mgjdepotlogo)
                    .replace('{{id}}',pageDate[i].id)
                    .replace('{{no}}',pageDate[i].no)
                    .replace('{{name}}',pageDate[i].name)
                    .replace('{{specifacation}}',pageDate[i].specifacation || '--')
                    .replace('{{unit}}',pageDate[i].unit || '--')
                    .replace('{{marqueid}}',that.getCategoryTypeByMarqueid(pageDate[i].marqueid))
                    .replace('{{inprice}}',this.checkNull(pageDate[i].inprice))
                    .replace('{{price}}',this.checkNull(pageDate[i].price))
                    .replace('{{saleprice}}',this.checkNull(pageDate[i].saleprice))
                    .replace('{{safenumber}}',this.checkNull(pageDate[i].safenumber))
                    .replace('{{num}}',this.checkNull(pageDate[i].num))
                    .replace('{{remark}}',pageDate[i].remark?pageDate[i].remark:'')
                    .replace('{{id}}',pageDate[i].id)
                    .replace('{{id}}',pageDate[i].id);
                    var $li1 = $(html);
                    this.$list.append($li1.data('data',pageDate[i]));
                }
                if(!that.showPrice){
                    $('.page_storage .stock .slip').addClass('hidePrice');
                }
                if(that.singleDepart){
                    this.$list.find('li>div:last-child').addClass('single');
                }
                this.initListScroll();
                this.listScroll.refresh();
                this.listScroll.scrollTo('top');
            },
			checkNull: function(n){
				if(n == null || n == "null"){
					return "--";
				}
				return n;
			},
            addEvent:function(){
                var self = this;
                this.$list = $('.page_storage .stock .container .list');
                this.$li = this.$list.find("li").remove();

                $('.page_storage .stock .search').on('vclick',function(){
                    self.renderIndex = 0;
                    var serchStr = $('.page_storage .stock .condition').val();
                    that.getData(function(data){
                        self.filter(data,serchStr,0);
                    });
                });

                $('.page_storage .stock .condition').on('keyup',function(e){
                    if(e.keyCode==13){
                        self.renderIndex = 0;
                        var serchStr = $('.page_storage .stock .condition').val();
                        that.getData(function(data){
                            self.filter(data,serchStr,0);
                        });
                    }
                });

                $('.page_storage .stock .tab').on('vclick','li',function(){
                    self.renderIndex = 0;
                    var index = $(this).index();
                    that.getData(function(data){
                        self.filter(data,'',index);
                    });
                });

                $('.page_storage .stock .scan').vclick(function(){
                    cordova.plugins.barcodeScanner.scan(function(result) {
                        // $.am.debug.log("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
                        if(result && result.text){
                            that.getData(function(data){
                                self.filter(data,result.text,0);
                            });
                        }
                    }, function(error) {
                        amGloble.msg(error);
                    });
                });

                $('.page_storage .stock .container .list').on('vclick','li',function(){
                    var data  = $(this).data("data");
                    var parent = that.$.find('.photo-and-barcode');
                    parent.find('.name').html(data.name);
                    parent.find('.order').html(data.no);
                    if(data.mgjdepotlogo){
                        $('.page_storage .photo-and-barcode .photo').html(am.photoManager.createImage("goods", {
                            parentShopId: am.metadata.userInfo.parentShopId,
                        }, data.mgjdepotlogo, 's'));
                        parent.find('.edit-photo').show();
                    }else {
                        $('.page_storage .photo-and-barcode .photo').html('');
                        parent.find('.edit-photo').hide();
                    }
                    if(data.mgj_barcode){
                        parent.find('.has-barcode').show().find('.barcode').html(data.mgj_barcode);
                        parent.find('.no-barcode').hide();
                    }else{
                        parent.find('.has-barcode').hide();
                        parent.find('.no-barcode').show().find('.scan-result').val('');
                    }
                    that.$.find('.mask').show();
                    that.$.find('.photo-and-barcode').addClass('active').attr({
                        'data-id':data.id,
                        'data-barcode':data.mgj_barcode,
                        'data-image':data.mgjdepotlogo,
                    });
                });

                $('.page_storage .mask').vclick(function(){
                    that.$.find('.mask').hide();
                    that.$.find('.photo-and-barcode').removeClass('active');
                });

                //上传编辑图片
                $('.page_storage .photo-and-barcode .take-photo').vclick(function(){
                    var _this = $(this);
                    var id = $(this).parents('.photo-and-barcode').attr('data-id'),
                        barcode = $(this).parents('.photo-and-barcode').attr('data-barcode');
                    amGloble.photoManager.takePhoto("goods", {
                        parentShopId: am.metadata.userInfo.parentShopId,
                    }, function(res) {
                        _this.prev().html(am.photoManager.createImage("goods", {
                            parentShopId: am.metadata.userInfo.parentShopId,
                        }, res, 's'));
                        am.loading.show();
                        am.api.storageUpLoad.exec({
                            parentShopId:am.metadata.userInfo.parentShopId,
                            shopId:am.metadata.userInfo.shopId,
                            id:id,
                            image:res,
                            barcode:barcode
                        },function(ret){
                            am.loading.hide();
                            _this.parents('.photo-and-barcode').attr('data-image',res);
                            for(var i=0;i<that.data.content.length;i++){
                                if(that.data.content[i].id==id){
                                    that.data.content[i].mgjdepotlogo = res;
                                }
                            }
                        });
                    }, function() {
                        console.log("fail");
                    });
                });

                //修改条码
                $('.page_storage .photo-and-barcode .edit-bar').vclick(function(){
                    var barcode = $(this).prev().find('.barcode').html();
                    $(this).parent().hide().prev().show().find('.scan-result').val(barcode);
                });

                //扫描获取条码
                $('.page_storage .photo-and-barcode .scan-barcode').vclick(function(){
                    cordova.plugins.barcodeScanner.scan(function(result) {
                        $.am.debug.log("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
                        if(result && result.text){
                            $('.page_storage .photo-and-barcode .scan-result').val(result.text);
                        }
                    }, function(error) {
                        amGloble.msg(error);
                    });
                });

                //上传条码
                $('.page_storage .smt-barcode').vclick(function(){
                    var _this = $(this);
                    var barcode = $(this).prev().find('.scan-result').val();
                    if(barcode==''){
                        am.msg('请扫描条形码');
                        return false;
                    }
                    var id = $(this).parents('.photo-and-barcode').attr('data-id'),
                        image = $(this).parents('.photo-and-barcode').attr('data-image');
                    am.loading.show();
                    am.api.storageUpLoad.exec({
                        parentShopId:am.metadata.userInfo.parentShopId,
                        shopId:am.metadata.userInfo.shopId,
                        id:id,
                        barcode:barcode,
                        image:image
                    },function(ret){
                        am.loading.hide();
                        _this.parent().parent().hide().next().show().find('.barcode').html(barcode);
                        for(var i=0;i<that.data.content.length;i++){
                            if(that.data.content[i].id==id){
                                that.data.content[i].mgj_barcode = barcode;
                            }
                        }
                    });
                });

                $('.page_storage .stock .container .list').on('vclick','.record,.other',function(e){
                    e.stopPropagation();
                    var data  = $(this).parents("li").data("data");
                    console.log(data)
                    if($(this).hasClass("record")){
                        $.am.changePage(am.page.outinRecord, "slideup",data);
                    }else{
                        $.am.changePage(am.page.subbranch, "slideup", data);
                    }
                });
            },
            pager:function(){
                $('.page_storage .page-wrap').empty();
                var self = this;
                new $.am.Paging({
                    $:$('.page_storage .page-wrap'),
                    showNum:15,//每页显示的条数
                    total:self.renderDate.length,//总数
                    action:function(_this,index){
                        self.renderIndex = index;
                        this.refresh(index,self.renderDate.length);
                        self.render(self.renderIndex);
                    }
                });
            },
            filter:function(data,str,page){
                if(data.code == 0 && data.content.length){
                    this.renderTab(data);
                    if(str==''){
                        this.renderDate = that.dataToAction(data)[page].list;
                        that.$.find('.tab li').eq(page).addClass('active').siblings().removeClass('active');
                    }else{
                        var arr = [];
                        for(var i=0;i<that.data.content.length;i++){
                            if(that.data.content[i].no.indexOf(str)>-1 || that.data.content[i].pycode.indexOf(str)>-1 || that.data.content[i].name.indexOf(str)>-1 || that.getCategoryTypeByMarqueid(that.data.content[i].marqueid).indexOf(str)>-1 || str==that.data.content[i].mgj_barcode){
                                arr.push(that.data.content[i]);
                            }
                        }
                        this.renderDate = arr;
                        that.$.find('.tab li').removeClass('active');
                    }
                    if(this.renderDate && this.renderDate.length){
                        $('.page_storage .stock .container-wrap').show();
                        $('.page_storage .stock .page-wrap').show();
                        this.render(this.renderIndex);
                        this.pager();
                    }else {
                        $('.page_storage .stock .container-wrap').hide();
                        $('.page_storage .stock .page-wrap').hide();
                        am.msg('未查询到数据');
                        $('.page_storage .stock .condition').val('');
                        this.renderIndex = 0;
                        this.filter(data,'',0);
                    }
                }else if(data.code == 0 && data.content.length == 0){
                    am.msg('暂时没有数据...');
                }else{
                    am.msg('数据异常！');
                }
            }
        },
        out:{
            template: '<li class="slip am-clickable" data-id="{{id}}">'+'\n'+
                '<div>{{no}}</div>'+'\n'+
                '<div>{{name}}</div>'+'\n'+
                '<div>{{specifacation}}</div>'+'\n'+
                '<div>{{unit}}</div>'+'\n'+
                '<div>{{num}}</div>'+'\n'+
                '</li>',
            orderTemplate: '<li class="slip" data-id="{{id}}" data-inprice="{{inprice}}">'+'\n'+
                '<div>'+'\n'+
                    '<p class="del am-clickable"></p>'+'\n'+
                    '<p class="name">{{name}}</p>'+'\n'+
                '</div>'+'\n'+
                '<div>{{marqueid}}</div>'+'\n'+
                '<div>{{num}}</div>'+'\n'+
                '<div>'+'\n'+
                    '<div class="actNumber am-clickable">1</div>'+'\n'+
                '</div>'+'\n'+
                '<div>'+'\n'+
                    '<div class="actPrice am-clickable">{{price}}</div>'+'\n'+
                '</div>'+'\n'+
                '</li>',
            data:[],
            parent:$('.page_storage .out'),
            renderTab:function(){
                var html = '';
                for(var i=0;i<this.data.length;i++){
                    html += '<li class="am-clickable">' + that.getCategoryTypeByMarqueid(this.data[i].marqueid) + '</li>';
                }
                this.parent.find('.left .tab ul').html(html);
                this.parent.find('.left .tab ul li').eq(0).addClass('active');
                this.initTabScroll();
            },
            renderList:function(index){
                var html = '';
                for(var i=0;i<this.data[index].list.length;i++){
                    html += this.template
                    .replace('{{id}}',this.data[index].list[i].id)
                    .replace('{{no}}',this.data[index].list[i].no)
                    .replace('{{name}}',this.data[index].list[i].name)
                    .replace('{{specifacation}}',this.data[index].list[i].specifacation || '--')
                    .replace('{{unit}}',this.data[index].list[i].unit || '--')
                    .replace('{{num}}',this.checkNull(this.data[index].list[i].num));
                }
                this.parent.find('.left .container .list').html(html);
                this.initListScroll();
            },
			checkNull: function(n){
				if(n == null || n == "null"){
					return "--";
				}
				return n;
			},
            addedList:[],
            addEvent:function(){
                this.operate();
                this.submit();
            },
            operate:function(){
                var self = this;
                this.parent.find('.left .tab ul').on('vclick','li',function(){
                    $(this).addClass('active').siblings().removeClass('active');
                    self.renderList($(this).index());
                    self.initListScroll();
                    self.listScroll.scrollTo('top');
                });

                this.parent.find('.left .container .list').off().on('vclick','li',function(){
                    var id = $(this).attr('data-id');
                    if($(this).find('div:last-child').html()<=0){
	                    atMobile.nativeUIWidget.confirm({
		                    caption: '库存不足',
		                    description: '此商品库存不足，继续出库库存将降为负数，是否继续？',
		                    okCaption: '继续出库',
		                    cancelCaption: '取消'
	                    }, function(){
		                    self.filter(id);
	                    }, function(){

	                    });
                        //am.msg('此商品库存不足，无法出库');
                        return;
                    }
                    self.filter(id);
                });

                this.parent.find('.scan').vclick(function(){
                    cordova.plugins.barcodeScanner.scan(function(result) {
                        // $.am.debug.log("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
                        if(result && result.text){
                            self.filter(result.text);
                        }
                    }, function(error) {
                        amGloble.msg(error);
                    });
                });

                this.parent.find('.right .container .list').off().on('vclick','.del',function(){
                    var id = $(this).parent().parent().attr('data-id');
                    for(var i=0;i<self.addedList.length;i++){
                        if(self.addedList[i].id == id){
                            self.addedList.splice(i,1);
                        }
                    }
                    $(this).parent().parent().remove();
                    self.calTotalPrice();
                    self.initOrderScroll();
                });

                that.$.find('.out .method').vclick(function(){
                    var _this = $(this);
                    am.popupMenu("请选择出库方式", self.methods , function (ret) {
                        _this.html(ret.name).attr('data-type',ret.type).attr('data-waretype',ret.code);
                        if(ret.name=='员工领用' || ret.name=='员工自购' || ret.name=='损坏' || ret.name=='产品开用'){
                            _this.parent().parent().find('.s-member').show().siblings('.second').hide();
                        }else if(ret.name=='采购退货' && that.suppliers.length){
                            _this.parent().parent().find('.s-supplier').show().siblings('.second').hide();
                        }else if(ret.code==3 && that.shopList.length) {
                            _this.parent().parent().find('.s-toshop').show().siblings('.second').hide();
                        }else {
                            _this.parent().nextAll().hide();
                        }
                    });
                });

                that.$.find('.out .member').vclick(function(){
                    var _this = $(this);
                    am.popupMenu("请选择员工", that.member , function (ret) {
                        _this.html(ret.name).attr('data-id',ret.id);
                    });
                });

                that.$.find('.out .supplier').vclick(function(){
                    var _this = $(this);
                    am.popupMenu("请选择供应商", that.suppliers , function (ret) {
                        _this.html(ret.name).attr('data-id',ret.id);
                    });
                });

                that.$.find('.out .toshop').vclick(function(){
                    var _this = $(this);
                    am.popupMenu("请选择调出门店", that.shopList , function (ret) {
                        _this.html(ret.name).attr('data-id',ret.shopId);
                    });
                });
            },
            calTotalPrice:function(){
                var list = this.parent.find('.right .list li');
                var total = 0;
                if(list.length){
                    for(var i=0;i<list.length;i++){
                        total += ($(list[i]).find('.actNumber').html()*1) * ($(list[i]).find('.actPrice').html()*1);
                    }
                }
                this.parent.find('.right .order').html(Number(total).toFixed(2));
                return Number(total).toFixed(2);
            },
            submit:function(){
                var self = this;
                this.parent.find('.smt').vclick(function(evt,passStorageCheck){
                    var inputBox = self.parent.find('.right .container .list .actNumber');
                    if(inputBox.length==0){
                        am.msg('请录入商品');
                        return;
                    }
                    var warningList = [];
                    for(var i=0;i<inputBox.length;i++){
                        if($(inputBox[i]).html()*1>$(inputBox[i]).parent().prev().html()*1){
                            //am.msg('出库数量不能大于库存数量');
	                        //return;
	                        warningList.push(inputBox.eq(i).parent().parent().find(".name").text());
                        }

                        if(!$(inputBox[i]).html()*1){
                            am.msg('出库数量不能为零');
                            return;
                        }
                    }
                    if(warningList && warningList.length && !passStorageCheck){
	                    atMobile.nativeUIWidget.confirm({
		                    caption: '库存不足',
		                    description: warningList.join(",")+'库存不足，继续出库库存将降为负数，是否继续？',
		                    okCaption: '继续出库',
		                    cancelCaption: '取消'
	                    }, function(){
		                    self.parent.find('.smt').trigger("vclick",1);
	                    }, function(){

	                    });
	                    return;
                    }

                    var orderMethod = self.parent.find('.info .method').html(),

                        orderMember = self.parent.find('.info .member').attr('data-id'),
                        orderMemberName = self.parent.find('.info .member').html(),

                        orderSupplier = self.parent.find('.info .supplier').attr('data-id'),
                        orderSupplierName = self.parent.find('.info .supplier').html(),

                        orderShop = self.parent.find('.info .toshop').attr('data-id'),
                        orderShopName = self.parent.find('.info .toshop').html(),

                        orderNote = self.parent.find('.info .note').val();
                    if(orderMethod==''){
                        am.msg('请选择出库方式');
                        return;
                    }
                    if((orderMethod=='员工领用' || orderMethod=='员工自购' || orderMethod=='损坏' || orderMethod=='产品开用') && orderMemberName==''){
                        am.msg('请选择员工');
                        return;
                    }
                    // if(orderMethod=='采购退货' && orderSupplierName=='' && that.suppliers.length){
                    //     am.msg('请选择供应商');
                    //     return;
                    // }
                    if(orderMethod=='内部调出' && orderShopName=='' && that.shopList.length){
                         am.msg('请选择调出门店');
                        return;
                    }
                    var type = self.parent.find('.info .method').attr('data-type'),
                        waretype = self.parent.find('.info .method').attr('data-waretype');
                    var list = [];
                    for(var i=0;i<inputBox.length;i++){
                        list[i] = {};
                        list[i].id = '';
                        list[i].depotid = $(inputBox[i]).parent().parent().attr('data-id');
                        list[i].num = $(inputBox[i]).html();
                        list[i].price = parseFloat($(inputBox[i]).parent().parent().find('.actPrice').text());
                        list[i].remark = '';
                    }
                    var price = self.calTotalPrice();
                    
                    // console.log(type+'-'+waretype);
                    // console.log(list);
                    // console.log(price);
                    // 提交
                    var sendDate = {
                        "id": '',
                        "employeeid": orderMember || '',
                        "operatid": am.metadata.userInfo.userId,
                        "outwaretype": waretype,
                        "price": price,
                        "remark": orderNote,
                        "shopid": am.metadata.userInfo.shopId,
                        "status": "0",
                        "toshopid": orderShop || '',
                        "type": type,
                        "supplierId": orderSupplier || '',
                        "details": list
                    }
                    if(waretype==3){
                        sendDate.type = 3;
                    }
                    self.addOutStoRecord(sendDate);
                });
            },
            filter:function(str){
                var self = this;
                var hasItem = 0;
                var item = [];
                for(var i=0;i<this.data.length;i++){
                    for(var j=0;j<this.data[i].list.length;j++){
                        if(str==this.data[i].list[j].id || str==this.data[i].list[j].mgj_barcode){
                            hasItem ++;
                            item.push(this.data[i].list[j]);
                        }
                    }
                }
                if(!hasItem){
                    am.msg('未查询到数据');
                }else {
                    if(item.length==1){
                        for(var i=0;i<this.addedList.length;i++){
                            if(str==this.addedList[i].id || this.addedList[i].no.indexOf(str)>-1 || this.addedList[i].pycode.indexOf(str)>-1 || this.addedList[i].name.indexOf(str)>-1 || that.getCategoryTypeByMarqueid(this.addedList[i].marqueid).indexOf(str)>-1 || str==this.addedList[i].mgj_barcode){
                                var id = this.addedList[i].id;
                                var item = this.parent.find('.right .list li[data-id='+id+'] .actNumber');
                                var html = Math.round(item.html()*10)/10 || 0;
                                item.html(html+1);
                                this.calTotalPrice();
                                return;
                            }
                        }
                        var html = this.orderTemplate
                            .replace('{{id}}',item[0].id)
                            .replace('{{inprice}}',item[0].inprice || 0)
                            .replace('{{name}}',item[0].name)
                            .replace('{{marqueid}}',that.getCategoryTypeByMarqueid(item[0].marqueid))
                            .replace('{{num}}',self.checkNull(item[0].num))
                            .replace('{{price}}',item[0].price || 0);
                        this.parent.find('.right .container .list').prepend(html);
                        this.calTotalPrice();
                        if(!that.showPrice){
                            $('.page_storage .out .slip').addClass('hidePrice');
                        }
                        this.initOrderScroll();
                        this.addedList.push(item[0]);
                    }else if(item.length>1){
                        setTimeout(function(){
                            am.popupMenu("请选择商品", item , function (ret) {
                                for(var i=0;i<self.addedList.length;i++){
                                    if(self.addedList[i]==ret){
                                        var id = self.addedList[i].id;
                                        var item = self.parent.find('.right .list li[data-id='+id+'] .actNumber');
                                        var html = Math.round(item.html()*10)/10 || 0;
                                        item.html(html+1);
                                        this.calTotalPrice();
                                        return;
                                    }
                                }
                                var html = self.orderTemplate
                                    .replace('{{id}}',ret.id)
                                    .replace('{{inprice}}',ret.inprice || 0)
                                    .replace('{{name}}',ret.name)
                                    .replace('{{marqueid}}',that.getCategoryTypeByMarqueid(ret.marqueid))
                                    .replace('{{num}}',self.checkNull(ret.num))
                                    .replace('{{price}}',ret.price || 0);
                                self.parent.find('.right .container .list').prepend(html);
                                this.calTotalPrice();
                                if(!that.showPrice){
                                    $('.page_storage .out .slip').addClass('hidePrice');
                                }
                                self.initOrderScroll();
                                self.addedList.push(ret);
                            });
                        },100);
                    }
                }
            },
            initTabScroll:function(){
                var self = this;
                if(this.tabScroll){
                    this.tabScroll.refresh();
                }else {
                    this.tabScroll = new $.am.ScrollView({
                        $wrap : self.parent.find('.left .tab'),
                        $inner : self.parent.find('.left .tab ul'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.tabScroll.refresh();
                }
            },
            initListScroll:function(){
                var self = this;
                if(this.listScroll){
                    this.listScroll.refresh();
                }else {
                    this.listScroll = new $.am.ScrollView({
                        $wrap : self.parent.find('.left .container .wrapper'),
                        $inner : self.parent.find('.left .container .list'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.listScroll.refresh();
                }
            },
            initOrderScroll:function(){
                var self = this;
                if(this.orderScroll){
                    this.orderScroll.refresh();
                }else {
                    this.orderScroll = new $.am.ScrollView({
                        $wrap : self.parent.find('.right .container .wrapper'),
                        $inner : self.parent.find('.right .container .list'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.orderScroll.refresh();
                }
            },
            getMaxOutStoBillno: function(callback,isInventory){
                var self = this;
                am.api.getMaxOutStoBillno.exec({
                    parentShopId:am.metadata.userInfo.parentShopId,
                    shopId:am.metadata.userInfo.shopId
                },function(ret){
                    if(ret && ret.code==0){
                        that.maxOutStoBillno = ret.content;
                        self.parent.find('.order').val(ret.content);
                        if(typeof callback == 'function'){
                            callback();
                        }
                    }else{
                        if(isInventory){
                            atMobile.nativeUIWidget.confirm({
                                caption: '网络异常',
                                description: '数据读取失败，是否立即重试？',
                                okCaption: '重试',
                                cancelCaption: '取消'
                            }, function(){
                                self.getMaxOutStoBillno(callback,isInventory);
                            }, function(){

                            });
                        }
                    }
                });
            },
            addOutStoRecord: function(data,isInventory){
                var self = this;
                am.loading.show();
                am.api.storageAddOutStoRecord.exec({
                    outdepot: data
                },function(ret){
                    console.log(ret)
                    am.loading.hide();
                    if(ret && ret.code==0){
                        if(!isInventory){
                            am.msg('出库成功');
                            that.clearContent();
                            // self.getMaxOutStoBillno();
                        }else if(isInventory){
                            that.inventory.outSubmit = true;
                            if(that.inventory.intoSubmit){
                                am.loading.hide();
                                am.msg('盘点完成');
                                that.clearContent();
                            }
                        }
                    }else if(ret && ret.code==-1){
                        atMobile.nativeUIWidget.confirm({
                            caption: '网络异常',
                            description: '数据读取失败，是否立即重试？',
                            okCaption: '重试',
                            cancelCaption: '取消'
                        }, function(){
                            if(!isInventory){
                                self.addOutStoRecord(data);
                            }else if(isInventory){
                                self.addOutStoRecord(data,isInventory);
                            }
                        }, function(){

                        });
                    }
                });
            }
        },
        into:{
            template: '<li class="slip am-clickable" data-id="{{id}}">'+'\n'+
                '<div>{{no}}</div>'+'\n'+
                '<div>{{name}}</div>'+'\n'+
                '<div>{{specifacation}}</div>'+'\n'+
                '<div>{{unit}}</div>'+'\n'+
                '<div>{{num}}</div>'+'\n'+
                '</li>',
            orderTemplate: '<li class="slip" data-id="{{id}}" data-inprice="{{inprice}}">'+'\n'+
                '<div>'+'\n'+
                    '<p class="del am-clickable"></p>'+'\n'+
                    '<p class="name">{{name}}</p>'+'\n'+
                '</div>'+'\n'+
                '<div>{{marqueid}}</div>'+'\n'+
                '<div>{{num}}</div>'+'\n'+
                '<div>'+'\n'+
                    '<div class="actNumber am-clickable"">1</div>'+'\n'+
                '</div>'+'\n'+
                '<div>'+'\n'+
                    '<div class="actPrice am-clickable">{{price}}</div>'+'\n'+
                '</div>'+'\n'+
                '</li>',
            data:[],
            parent:$('.page_storage .into'),
            renderTab:function(){
                var html = '';
                for(var i=0;i<this.data.length;i++){
                    html += '<li class="am-clickable">' + that.getCategoryTypeByMarqueid(this.data[i].marqueid) + '</li>';
                }
                this.parent.find('.left .tab ul').html(html);
                this.parent.find('.left .tab ul li').eq(0).addClass('active');
                this.initTabScroll();
            },
            renderList:function(index){
                var html = '';
                for(var i=0;i<this.data[index].list.length;i++){
                    html += this.template
                    .replace('{{id}}',this.data[index].list[i].id)
                    .replace('{{no}}',this.data[index].list[i].no)
                    .replace('{{name}}',this.data[index].list[i].name)
                    .replace('{{specifacation}}',this.data[index].list[i].specifacation || '--')
                    .replace('{{unit}}',this.data[index].list[i].unit || '--')
                    .replace('{{num}}',this.checkNull(this.data[index].list[i].num));
                }
                this.parent.find('.left .container .list').html(html);
                this.initListScroll();
            },
			checkNull: function(n){
				if(n == null || n == "null"){
					return "--";
				}
				return n;
			},
            addedList:[],
            addEvent:function(){
                this.operate();
                this.submit();
            },
            operate:function(){
                var self = this;
                this.parent.find('.left .tab ul').on('vclick','li',function(){
                    $(this).addClass('active').siblings().removeClass('active');
                    self.renderList($(this).index());
                    self.initListScroll();
                    self.listScroll.scrollTo('top');
                });

                this.parent.find('.left .container .list').off().on('vclick','li',function(){
                    var id = $(this).attr('data-id');
                    self.filter(id);
                });

                this.parent.find('.scan').vclick(function(){
                    cordova.plugins.barcodeScanner.scan(function(result) {
                        // $.am.debug.log("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
                        if(result && result.text){
                            self.filter(result.text);
                        }
                    }, function(error) {
                        amGloble.msg(error);
                    });
                });

                this.parent.find('.right .container .list').off().on('vclick','.del',function(){
                    var id = $(this).parent().parent().attr('data-id');
                    for(var i=0;i<self.addedList.length;i++){
                        if(self.addedList[i].id == id){
                            self.addedList.splice(i,1);
                        }
                    }
                    $(this).parent().parent().remove();
                    self.calTotalPrice();
                    self.initOrderScroll();
                });

                that.$.find('.into .method').vclick(function(){
                    var _this = $(this);
                    am.popupMenu("请选择入库方式", self.methods , function (ret) {
                        _this.html(ret.name).attr('data-type',ret.type).attr('data-waretype',ret.code);
                        if(ret.name=='采购入库' && that.suppliers.length){
                            _this.parent().parent().find('.s-supplier').show().siblings('.second').hide();
                        }else if(ret.code==3 &&  that.shopList.length) {
                            _this.parent().parent().find('.s-toshop').show().siblings('.second').hide();
                        }else {
                            _this.parent().nextAll().hide();
                        }
                    });
                });

                that.$.find('.into .supplier').vclick(function(){
                    var _this = $(this);
                    am.popupMenu("请选择供应商", that.suppliers , function (ret) {
                        _this.html(ret.name).attr('data-id',ret.id);
                    });
                });

                that.$.find('.into .toshop').vclick(function(){
                    var _this = $(this);
                    am.popupMenu("请选择调入门店", that.shopList , function (ret) {
                        _this.html(ret.name).attr('data-id',ret.shopId);
                    });
                });
            },
            calTotalPrice:function(){
                var list = this.parent.find('.right .list li');
                var total = 0;
                if(list.length){
                    for(var i=0;i<list.length;i++){
                        total += ($(list[i]).find('.actNumber').html()*1) * ($(list[i]).find('.actPrice').html()*1);
                    }
                }
                this.parent.find('.right .order').html(Number(total).toFixed(2));
                return Number(total).toFixed(2)
            },
            submit:function(){
                var self = this;
                this.parent.find('.smt').vclick(function(){
                    var inputBox = self.parent.find('.right .container .list .actNumber');
                    if(inputBox.length==0){
                        am.msg('请录入商品');
                        return
                    }
                    for(var i=0;i<inputBox.length;i++){
                        if(!$(inputBox[i]).html()*1){
                            am.msg('入库数量不能为零');
                            return;
                        }
                    }
                    var orderMethod = self.parent.find('.info .method').html(),
                        
                        orderSupplier = self.parent.find('.info .supplier').attr('data-id'),
                        orderSupplierName = self.parent.find('.info .supplier').html(),

                        orderShop = self.parent.find('.info .toshop').attr('data-id'),
                        orderShopName = self.parent.find('.info .toshop').html(),

                        orderNote = self.parent.find('.info .note').val();

                    if(orderMethod==''){
                        am.msg('请选择入库方式');
                        return
                    }
                    // if(orderMethod=='采购入库' && orderSupplierName=='' && that.suppliers.length){
                    //     am.msg('请选择供应商');
                    //     return;
                    // }
                    if(orderMethod=='内部调入' && orderShopName=='' && that.shopList.length){
                         am.msg('请选择调出门店');
                        return;
                    }
                    var type = self.parent.find('.info .method').attr('data-type'),
                        waretype = self.parent.find('.info .method').attr('data-waretype');
                    var list = [];
                    for(var i=0;i<inputBox.length;i++){
                        list[i] = {};
                        list[i].id = '';
                        list[i].depotid = $(inputBox[i]).parent().parent().attr('data-id');
                        list[i].num = $(inputBox[i]).html();
                        list[i].price = parseFloat($(inputBox[i]).parent().parent().find('.actPrice').text());
                        list[i].remark = '';
                    }
                    var price = self.calTotalPrice();
                    
                    // console.log(type+'-'+waretype);
                    // console.log(list);
                    // console.log(price);
                    // 提交
                    var sendDate = {
                        "id": '',
                        "operatid": am.metadata.userInfo.userId,
                        "inwaretype": waretype,
                        "price": price,
                        "remark": orderNote,
                        "shopid": am.metadata.userInfo.shopId,
                        "status": "0",
                        "fromshopid": orderShop || '',
                        "type": type,
                        "supplierid": orderSupplier || '',
                        "details": list
                    }
                    self.addInStoRecord(sendDate);
                });
            },
            filter:function(str){
                var self = this;
                var hasItem = 0;
                var item = [];
                for(var i=0;i<this.data.length;i++){
                    for(var j=0;j<this.data[i].list.length;j++){
                        if(str==this.data[i].list[j].id || str==this.data[i].list[j].mgj_barcode){
                            hasItem ++;
                            item.push(this.data[i].list[j]);
                        }
                    }
                }
                if(!hasItem){
                    am.msg('未查询到数据');
                }else {
                    if(item.length==1){
                        for(var i=0;i<this.addedList.length;i++){
                            if(str==this.addedList[i].id || this.addedList[i].no.indexOf(str)>-1 || this.addedList[i].pycode.indexOf(str)>-1 || this.addedList[i].name.indexOf(str)>-1 || that.getCategoryTypeByMarqueid(this.addedList[i].marqueid).indexOf(str)>-1 || str==this.addedList[i].mgj_barcode){
                                var id = this.addedList[i].id;
                                var item = this.parent.find('.right .list li[data-id='+id+'] .actNumber');
	                            var html = Math.round(item.html()*10)/10 || 0;
                                item.html(html+1);
                                this.calTotalPrice();
                                return;
                            }
                        }
                        var html = this.orderTemplate
                            .replace('{{id}}',item[0].id)
                            .replace('{{inprice}}',item[0].inprice || 0)
                            .replace('{{name}}',item[0].name)
                            .replace('{{marqueid}}',that.getCategoryTypeByMarqueid(item[0].marqueid))
                            .replace('{{num}}',self.checkNull(item[0].num))
                            .replace('{{price}}',item[0].inprice || 0);
                        this.parent.find('.right .container .list').prepend(html);
                        this.calTotalPrice();
                        if(!that.showPrice){
                            $('.page_storage .into .slip').addClass('hidePrice');
                        }
                        this.initOrderScroll();
                        this.addedList.push(item[0]);
                    }else if(item.length>1){
                        setTimeout(function(){
                            am.popupMenu("请选择商品", item , function (ret) {
                                for(var i=0;i<self.addedList.length;i++){
                                    if(self.addedList[i]==ret){
                                        var id = self.addedList[i].id;
                                        var item = self.parent.find('.right .list li[data-id='+id+'] .actNumber');
                                        var html = Math.round(item.html()*10)/10 || 0;
                                        item.html(html+1);
                                        this.calTotalPrice();
                                        return;
                                    }
                                }
                                var html = self.orderTemplate
                                    .replace('{{id}}',ret.id)
                                    .replace('{{inprice}}',ret.inprice || 0)
                                    .replace('{{name}}',ret.name)
                                    .replace('{{marqueid}}',that.getCategoryTypeByMarqueid(ret.marqueid))
                                    .replace('{{num}}',self.checkNull(ret.num))
                                    .replace('{{price}}',item[0].inprice || 0);
                                self.parent.find('.right .container .list').prepend(html);
                                this.calTotalPrice();
                                if(!that.showPrice){
                                    $('.page_storage .into .slip').addClass('hidePrice');
                                }
                                self.initOrderScroll();
                                self.addedList.push(ret);
                            });
                        },100);
                    }
                }
            },
            initTabScroll:function(){
                var self = this;
                if(this.tabScroll){
                    this.tabScroll.refresh();
                }else {
                    this.tabScroll = new $.am.ScrollView({
                        $wrap : self.parent.find('.left .tab'),
                        $inner : self.parent.find('.left .tab ul'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.tabScroll.refresh();
                }
            },
            initListScroll:function(){
                var self = this;
                if(this.listScroll){
                    this.listScroll.refresh();
                }else {
                    this.listScroll = new $.am.ScrollView({
                        $wrap : self.parent.find('.left .container .wrapper'),
                        $inner : self.parent.find('.left .container .list'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.listScroll.refresh();
                }
            },
            initOrderScroll:function(){
                var self = this;
                if(this.orderScroll){
                    this.orderScroll.refresh();
                }else {
                    this.orderScroll = new $.am.ScrollView({
                        $wrap : self.parent.find('.right .container .wrapper'),
                        $inner : self.parent.find('.right .container .list'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.orderScroll.refresh();
                }
            },
            getMaxInStoBillno: function(callback,isInventory){
                var self = this;
                am.api.getMaxInStoBillno.exec({
                    parentShopId:am.metadata.userInfo.parentShopId,
                    shopId:am.metadata.userInfo.shopId
                },function(ret){
                    if(ret && ret.code==0){
                        that.maxInStoBillno = ret.content;
                        self.parent.find('.order').val(ret.content);
                        if(typeof callback == 'function'){
                            callback();
                        }
                    }else{
                        if(isInventory){
                            atMobile.nativeUIWidget.confirm({
                                caption: '网络异常',
                                description: '数据读取失败，是否立即重试？',
                                okCaption: '重试',
                                cancelCaption: '取消'
                            }, function(){
                                self.getMaxInStoBillno(callback,isInventory);
                            }, function(){

                            });
                        }
                    }
                });
            },
            addInStoRecord: function(data,isInventory){
                var self = this;
                am.loading.show();
                am.api.storageAddInStoRecord.exec({
                    intodepot:data
                },function(ret){
                    console.log(ret)
                    am.loading.hide();
                    if(ret && ret.code==0){
                        if(!isInventory){
                            am.msg('入库成功');
                            that.clearContent();
                            // self.getMaxInStoBillno();
                        }else if(isInventory){
                            that.inventory.intoSubmit = true;
                            if(that.inventory.outSubmit){
                                am.loading.hide();
                                am.msg('盘点完成');
                                that.clearContent();
                            }
                        }
                    }else if(ret && ret.code==-1){
                        atMobile.nativeUIWidget.confirm({
                            caption: '网络异常',
                            description: '数据读取失败，是否立即重试？',
                            okCaption: '重试',
                            cancelCaption: '取消'
                        }, function(){
                            if(!isInventory){
                                self.addInStoRecord(data);
                            }else if(isInventory){
                                self.addInStoRecord(data,isInventory);
                            }
                        }, function(){

                        });
                    }
                });
            }
        },
        inventory:{
            template: '<li class="slip am-clickable" data-id="{{id}}">'+'\n'+
                '<div>{{no}}</div>'+'\n'+
                '<div>{{name}}</div>'+'\n'+
                '<div>{{specifacation}}</div>'+'\n'+
                '<div>{{unit}}</div>'+'\n'+
                '<div>{{num}}</div>'+'\n'+
                '</li>',
            orderTemplate: '<li class="slip am-clickable" data-id="{{id}}" data-price="{{price}}">'+'\n'+
                '<div>'+'\n'+
                    '<p class="del am-clickable"></p>'+'\n'+
                    '<p class="order">{{no}}</p>'+'\n'+
                '</div>'+'\n'+
                '<div>{{name}}</div>'+'\n'+
                '<div>{{marqueid}}</div>'+'\n'+
                '<div>{{num}}</div>'+'\n'+
                '<div>'+'\n'+
                    '<div class="actNumber am-clickable"></div>'+'\n'+
                '</div>'+'\n'+
                '<div></div>'+'\n'+
                '</li>',
            data:[],
            parent:$('.page_storage .inventory'),
            renderTab:function(){
                var html = '';
                for(var i=0;i<this.data.length;i++){
                    html += '<li class="am-clickable">' + that.getCategoryTypeByMarqueid(this.data[i].marqueid) + '</li>';
                }
                this.parent.find('.left .tab ul').html(html);
                this.parent.find('.left .tab ul li').eq(0).addClass('active');
                this.initTabScroll();
            },
            renderList:function(index){
                var html = '';
                for(var i=0;i<this.data[index].list.length;i++){
                    html += this.template
                    .replace('{{id}}',this.data[index].list[i].id)
                    .replace('{{no}}',this.data[index].list[i].no)
                    .replace('{{name}}',this.data[index].list[i].name)
                    .replace('{{specifacation}}',this.data[index].list[i].specifacation || '--')
                    .replace('{{unit}}',this.data[index].list[i].unit || '--')
                    .replace('{{num}}',this.checkNull(this.data[index].list[i].num))
                }
                this.parent.find('.left .container .list').html(html);
                this.initListScroll();
            },
			checkNull: function(n){
				if(n == null || n == "null"){
					return "--";
				}
				return n;
			},
            addedList:[],
            addEvent:function(){
                this.operate();
                this.submit();
            },
            operate:function(){
                var self = this;
                this.parent.find('.left .tab ul').on('vclick','li',function(){
                    $(this).addClass('active').siblings().removeClass('active');
                    self.renderList($(this).index());
                    self.initListScroll();
                    self.listScroll.scrollTo('top');
                });

                this.parent.find('.left .container .list').off().on('vclick','li',function(){
                    var id = $(this).attr('data-id');
                    self.filter(id);
                });

                this.parent.find('.scan').vclick(function(){
                    cordova.plugins.barcodeScanner.scan(function(result) {
                        // $.am.debug.log("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
                        if(result && result.text){
                            self.filter(result.text);
                        }
                    }, function(error) {
                        amGloble.msg(error);
                    });
                });

                this.parent.find('.search').vclick(function(){
                    var serchStr = $('.page_storage .inventory .condition').val();
                    self.filter(serchStr,true);
                });

                $('.page_storage .inventory .condition').on('keyup',function(e){
                    if(e.keyCode==13){
                        var serchStr = $('.page_storage .inventory .condition').val();
                        self.filter(serchStr,true);
                    }
                });

                this.parent.find('.right .container .list').off().on('vclick','.del',function(){
                    var id = $(this).parent().parent().attr('data-id');
                    for(var i=0;i<self.addedList.length;i++){
                        if(self.addedList[i].id == id){
                            self.addedList.splice(i,1);
                        }
                    }
                    $(this).parent().parent().remove();
                    self.initOrderScroll();
                });
            },
            submit:function(){
                var self = this;
                this.parent.find('.smt').vclick(function(){
                    var inputBox = self.parent.find('.right .container .list .actNumber');
                    if(inputBox.length==0){
                        am.msg('请录入商品');
                        return
                    }
                    for(var i=0;i<inputBox.length;i++){
                        if($(inputBox[i]).html()==''){
                            am.msg('请填写盘点数量');
                            return;
                        }
                    }
                    var intoArr = [],
                        outArr = [];
                    for(var i=0;i<inputBox.length;i++){
                        if($(inputBox[i]).parent().next().html()*1<0){
                            outArr.push(i);
                        }
                        if($(inputBox[i]).parent().next().html()*1>0){
                            intoArr.push(i);
                        }
                    }

                    if(!intoArr.length && !outArr.length){
                        am.msg('盘点完成');
                        that.deepfresh();
                        return;
                    }

                    var intoList = [],
                        outList = [];
                    for(var i=0;i<intoArr.length;i++){
                        intoList[i] = {};
                        intoList[i].id = '';
                        intoList[i].depotid = $(inputBox[intoArr[i]]).parent().parent().attr('data-id');
                        intoList[i].num = Math.abs(Math.round($(inputBox[intoArr[i]]).parent().next().html()*10)/10);
                        intoList[i].price = parseFloat($(inputBox[intoArr[i]]).parent().parent().attr('data-price'));
                        intoList[i].remark = '';
                    }
                    var intoprice = 0;
                    for(var i=0;i<intoList.length;i++){
                        intoprice += intoList[i].num * intoList[i].price;
                    }
                    for(var i=0;i<outArr.length;i++){
                        outList[i] = {};
                        outList[i].id = '';
                        outList[i].depotid = $(inputBox[outArr[i]]).parent().parent().attr('data-id');
                        outList[i].num = Math.abs(Math.round($(inputBox[outArr[i]]).parent().next().html()*10)/10);
                        outList[i].price = parseFloat($(inputBox[outArr[i]]).parent().parent().attr('data-price'));
                        outList[i].remark = '';
                    }
                    var outprice = 0;
                    for(var i=0;i<outList.length;i++){
                        outprice += outList[i].num * outList[i].price;
                    }
                    // console.log(intoList)
                    // console.log(intoprice)
                    // console.log(outList)
                    // console.log(outprice)
                    //提交盘点盈亏
                    self.outDate = null;
                    self.outDate = {
                        "id": '',
                        "employeeid": '',
                        "operatid": am.metadata.userInfo.userId,
                        "outwaretype": 1,
                        "price": Number(outprice).toFixed(2),
                        "remark": new Date().format('yyyymmdd')+'盘点盘亏',
                        "shopid": am.metadata.userInfo.shopId,
                        "status": "0",
                        "toshopid": '',
                        "type": 0,
                        "supplierId": '',
                        "details": outList
                    }
                    
                    self.intoDate = null;
                    self.intoDate = {
                        "id": '',
                        "operatid": am.metadata.userInfo.userId,
                        "inwaretype": 1,
                        "price": Number(intoprice).toFixed(2),
                        "remark": new Date().format('yyyymmdd')+'盘点盘盈',
                        "shopid": am.metadata.userInfo.shopId,
                        "status": "0",
                        "fromshopid": '',
                        "type": 1,
                        "supplierId": '',
                        "details": intoList
                    }

                    if(self.outDate.details.length){
                        self.outSubmit = false;
                        that.out.addOutStoRecord(self.outDate,true)
                    }else {
                        self.outSubmit = true;
                    }

                    if(self.intoDate.details.length){
                        self.intoSubmit = false;
                        that.into.addInStoRecord(self.intoDate,true);
                    }else {
                        self.intoSubmit = true;
                    }
                });
            },
            filter:function(str){
                var self = this;
                if(str==''){
                    am.msg('请输入搜索条件');
                    return
                }
                var hasItem = 0;
                var item = [];
                for(var i=0;i<this.data.length;i++){
                    for(var j=0;j<this.data[i].list.length;j++){
                        if(str==this.data[i].list[j].id || this.data[i].list[j].no.indexOf(str)>-1 || this.data[i].list[j].pycode.indexOf(str)>-1 || this.data[i].list[j].name.indexOf(str)>-1 || that.getCategoryTypeByMarqueid(this.data[i].list[j].marqueid).indexOf(str)>-1 || str==this.data[i].list[j].mgj_barcode){
                            hasItem ++;
                            item.push(this.data[i].list[j]);
                        }
                    }
                }
                if(!hasItem){
                    am.msg('未查询到数据');
                }else {
                    if(item.length==1){
                        for(var i=0;i<this.addedList.length;i++){
                            if(str==this.addedList[i].id || this.addedList[i].no.indexOf(str)>-1 || this.addedList[i].pycode.indexOf(str)>-1 || this.addedList[i].name.indexOf(str)>-1 || that.getCategoryTypeByMarqueid(this.addedList[i].marqueid).indexOf(str)>-1 || str==this.addedList[i].mgj_barcode){
                                var id = this.addedList[i].id;
                                var item = this.parent.find('.right .list li[data-id='+id+'] .actNumber');
                                var html = item.html()*1 || 0;
                                item.html(html+1);

                                var inventoryVal = item.html()*1 || 0,
                                    stockVal = item.parent().prev().html()*1 || 0;
                                    diff = Math.round((inventoryVal-stockVal)*10)/10;
                                if(diff>0){
                                    item.parent().next().html('+'+diff).removeClass('less').addClass('more');
                                }else if(diff<0){
                                    item.parent().next().html(diff).removeClass('more').addClass('less');
                                }else if(diff==0){
                                    item.parent().next().html(diff).removeClass('more').removeClass('less');
                                }
                                return;
                            }
                        }
                        var html = self.orderTemplate
                            .replace('{{id}}',item[0].id)
                            .replace('{{price}}',item[0].price || 0)
                            .replace('{{no}}',item[0].no)
                            .replace('{{name}}',item[0].name)
                            .replace('{{marqueid}}',that.getCategoryTypeByMarqueid(item[0].marqueid))
                            .replace('{{num}}',self.checkNull(item[0].num));
                        self.parent.find('.right .container .list').prepend(html);
                        self.initOrderScroll();
                        self.addedList.push(item[0]);
                        self.parent.find('.right .container .list li').eq(0).find('.actNumber').trigger('vclick');
                    }else if(item.length>1){
                        setTimeout(function(){
                            am.popupMenu("请选择商品", item , function (ret) {
                                for(var i=0;i<self.addedList.length;i++){
                                    if(self.addedList[i]==ret){
                                        var id = self.addedList[i].id;
                                        var item = self.parent.find('.right .list li[data-id='+id+'] .actNumber');
                                        var html = item.html()*1 || 0;
                                        item.html(html+1);

                                        var inventoryVal = item.html()*1 || 0,
                                            stockVal = item.parent().prev().html()*1 || 0;
                                            diff = Math.round((inventoryVal-stockVal)*10)/10;
                                        if(diff>0){
                                            item.parent().next().html('+'+diff).removeClass('less').addClass('more');
                                        }else if(diff<0){
                                            item.parent().next().html(diff).removeClass('more').addClass('less');
                                        }else if(diff==0){
                                            item.parent().next().html(diff).removeClass('more').removeClass('less');
                                        }

                                        return;
                                    }
                                }
                                var html = self.orderTemplate
                                    .replace('{{id}}',ret.id)
                                    .replace('{{price}}',ret.price || 0)
                                    .replace('{{no}}',ret.no)
                                    .replace('{{name}}',ret.name)
                                    .replace('{{marqueid}}',that.getCategoryTypeByMarqueid(ret.marqueid))
                                    .replace('{{num}}',self.checkNull(ret.num));
                                self.parent.find('.right .container .list').prepend(html);
                                self.initOrderScroll();
                                self.addedList.push(ret);
                                self.parent.find('.right .container .list li').eq(0).find('.actNumber').trigger('vclick');
                            });
                        },100);
                    }
                }
            },
            initTabScroll:function(){
                var self = this;
                if(this.tabScroll){
                    this.tabScroll.refresh();
                }else {
                    this.tabScroll = new $.am.ScrollView({
                        $wrap : self.parent.find('.left .tab'),
                        $inner : self.parent.find('.left .tab ul'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.tabScroll.refresh();
                }
            },
            initListScroll:function(){
                var self = this;
                if(this.listScroll){
                    this.listScroll.refresh();
                }else {
                    this.listScroll = new $.am.ScrollView({
                        $wrap : self.parent.find('.left .container .wrapper'),
                        $inner : self.parent.find('.left .container .list'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.listScroll.refresh();
                }
            },
            initOrderScroll:function(){
                var self = this;
                if(this.orderScroll){
                    this.orderScroll.refresh();
                }else {
                    this.orderScroll = new $.am.ScrollView({
                        $wrap : self.parent.find('.right .container .wrapper'),
                        $inner : self.parent.find('.right .container .list'),
                        direction : [false, true],
                        hasInput: false
                    });
                    this.orderScroll.refresh();
                }
            }
        },
        getData:function(cb,clearCache){
            var self = this;
            var lastDate = self.data? self.ts:0,
                newDate = new Date().getTime(),
                d = (newDate - lastDate)/(1000 * 60);
            if(!this.data || ((lastDate && d>15) || !lastDate || clearCache)){
                am.loading.show('正在读取数据，请稍候');
                am.api.storageList.exec({
                    parentShopId:am.metadata.userInfo.parentShopId,
                    shopId:am.metadata.userInfo.shopId,
                    pageSize:9999,
                    pageNum:1,
                },function(ret){
                    am.loading.hide();
                    console.log(ret);
                    if(ret && ret.code == 0){
                        if(ret.content && ret.content.length){
                            self.data = ret;
                            self.ts = new Date().getTime();
                            for(var i=0;i<self.data.content.length;i++){
                                if(!self.data.content[i].pycode){
                                    self.data.content[i].pycode = codefans_net_CC2PY(self.data.content[i].name).substr(0, 1).toLowerCase();
                                }
                            }
                        }
                    }else if(ret && ret.code == -1){
                        atMobile.nativeUIWidget.confirm({
                            caption: '网络异常',
                            description: '数据读取失败，是否立即重试？',
                            okCaption: '重试',
                            cancelCaption: '取消'
                        }, function(){
                            self.getData(cb,clearCache);
                        }, function(){
                            cb(ret);
                        });
                        return;
                    }
                    cb(ret);
                });
            }else {
                cb(this.data);
            }
        },
        deepfresh:function(){
            this.getData(function(data){
                if(data.code == 0 && data.content.length){
                    var index = that.$.find('.nav .active').index();
                    that.$.find('.content .item').eq(index).show().find('.left,.right').show();

                    that.$.find('.condition').val('');
                    that.$.find('.method').html('');
                    that.$.find('.form-wrapper.second .form-select').html('').attr('data-id','').parent().hide();
                    that.$.find('.note').val('');
                    that.$.find('.order').html('');
                    that.$.find('.content .item .right .wrapper .list').empty();

                    that.stock.renderIndex = 0;
                    that.stock.filter(data,'',0);

                    that.out.data = that.dataToAction(data);
                    that.out.renderTab();
                    that.out.renderList(0);
                    that.out.addedList = [];

                    that.into.data = that.dataToAction(data);
                    that.into.renderTab();
                    that.into.renderList(0);
                    that.into.addedList = [];

                    that.inventory.data = that.dataToAction(data);
                    that.inventory.renderTab();
                    that.inventory.renderList(0);
                    that.inventory.addedList = [];
                }else if(data.code == 0 && data.content.length==0){
                    am.msg('暂时没有数据...')
                }else {
                    am.msg('数据异常！');
                }
            },true);

            if(this.$.find('.nav .item.active').index()==4){
                this.inbill.getData();
            }

            if(this.$.find('.nav .item.active').index()==2){
                this.outbill.getData();
            }
        },
        clearContent:function(){
            this.$.find('.condition').val('');
            this.$.find('.method').html('');
            this.$.find('.form-wrapper.second .form-select').html('').attr('data-id','').parent().hide();
            this.$.find('.note').val('');
            this.$.find('.order').html('');
            this.$.find('.content .item .right .wrapper .list').empty();

            this.out.addedList = [];
            this.into.addedList = [];
            this.inventory.addedList = [];
        },
        dataToAction:function(originalData){
            var data = [];
            var typeNumber = [];
            var originalType = [];
            for(var i=0;i<am.metadata.category.length;i++){
                originalType.push(am.metadata.category[i].marqueid);
            }
            for(var i=0;i<originalData.content.length;i++){
                if(typeNumber.indexOf(originalData.content[i].marqueid)==-1){
                    if(originalType.indexOf(originalData.content[i].marqueid)>=0){
                        typeNumber.push(originalData.content[i].marqueid);
                    }else {
                        if(typeNumber.indexOf('NO_ID')==-1){
                            typeNumber.push('NO_ID');
                        }
                    }
                }
            }
            
            data.length = typeNumber.length;
            for(var i=0;i<data.length;i++){
                data[i] = {},
                data[i].marqueid = typeNumber[i];
                data[i].list = [];
            }
            for(var i=0;i<originalData.content.length;i++){
                for(var j=0;j<data.length;j++){
                    if(originalData.content[i].marqueid==data[j].marqueid){
                        data[j].list.push(originalData.content[i]);
                    }else if(typeNumber.indexOf(originalData.content[i].marqueid)==-1){
                        if(data[j].marqueid=='NO_ID'){
                            data[j].list.push(originalData.content[i]);
                        }
                    }
                }
            }
            return data;
        }
    });
})();

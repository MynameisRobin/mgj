(function(){
    var shopSelect = {
        init: function(){
            var _this = this;

            this.$ = $('#shopSelect');

            this.$wrapper = this.$.find('.wrapper');
            this.$title = this.$.find('.title');

            this.$districtContainer = this.$.find('.districtBar');
            this.$districtInner = this.$districtContainer.find('.district').on('vclick','.item',function(){
                _this.$keywords.val('');
                _this.filter();
                _this.$search.show();
                _this.$clear.hide();
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                    _this.shopScroll.scrollTo('top');
                    return;
                }
                $(this).addClass('active').siblings().removeClass('active');
                var districtName = $(this).text();
                var district = _this.$shopContainer.find('.district');
                var $target;
                for(var i=0;i<district.length;i++){
                    if($(district[i]).text()==districtName){
                        $target = $(district[i]);
                        break;
                    }
                }
                if($target){
                    var top = $target.data('top');
                    _this.shopScroll.scrollTo([0,-top]);
                }
            });
            this.$district = this.$districtInner.find('.item').remove();

            this.$shopContainer = this.$.find('.shops');
            this.$shopInner = this.$shopContainer.find('.shops-inner').on('vclick','.item',function(){
                if(!_this.muti){
                    $(this).addClass('selected').siblings().removeClass('selected');
                    var value = _this.getValue();
                    if(!value){
                        return;
                    }
                    _this.callback && _this.callback(value);
                    _this.hide();
                }else {
                    if($(this).hasClass('selected')){
                        $(this).removeClass('selected');
                    }else {
                        $(this).addClass('selected');
                    }
                    _this.setSelectedStatus();
                }
            });
            this.$shop = this.$shopInner.find('.item').remove();
            this.$shopWrap = this.$shopInner.find('.wrap').remove()

            this.$mask = this.$.find('.mask').vclick(function(){
                _this.hide();
            });

            this.$btns = this.$.find('.btns');
            this.$selectAllShops = this.$btns.find('.selectAllShops').vclick(function(){
                if($(this).hasClass('check')){
                    $(this).removeClass('check');
                    _this.$shopInner.find('.item').removeClass('selected');
                }else {
                    $(this).addClass('check');
                    _this.$shopInner.find('.item').addClass('selected');
                }
                _this.setSelectedStatus();
            });
            this.$selectAllDirectShops = this.$btns.find('.selectAllDirectShops').vclick(function(){
                if($(this).hasClass('check')){
                    $(this).removeClass('check');
                    _this.$shopInner.find('.item.type2').removeClass('selected');
                }else {
                    $(this).addClass('check');
                    _this.$shopInner.find('.item').removeClass('selected');
                    _this.$shopInner.find('.item.type2').addClass('selected');
                }
                _this.setSelectedStatus();
            });
            this.$submit = this.$btns.find('.submit').vclick(function(){
                var value = _this.getValue();
                if(!value){
                    return;
                }
                console.log(value);
                _this.callback && _this.callback(value);
                _this.hide();
            });
            this.$selectedShops = this.$btns.find('.selectedShops');

            this.$keywords = this.$.find('.keywords').keyup(function(e){
                if(e.keyCode==13){
                    var val = _this.$keywords.val();
                    _this.filter(val);
                    if(val){
                        _this.$search.hide();
                        _this.$clear.show();
                    }else {
                        _this.$search.show();
                        _this.$clear.hide();
                    }
                }
            });
            this.$search = this.$.find('.search').vclick(function(){
                var val = _this.$keywords.val();
                _this.filter(val);
                if(val){
                    _this.$search.hide();
                    _this.$clear.show();
                }
            });
            this.$clear = this.$.find('.clear').vclick(function(){
                _this.$keywords.val('');
                _this.filter();
                _this.$search.show();
                _this.$clear.hide();
            });

            this.districtScroll = new $.am.ScrollView({
                $wrap : this.$districtContainer,
                $inner : this.$districtInner,
                direction : [false, true],
                hasInput: false
            });

            this.shopScroll = new $.am.ScrollView({
                $wrap : this.$shopContainer,
                $inner : this.$shopInner,
                direction : [false, true],
                hasInput: false
            });

            this.$empty = this.$shopContainer.find('.empty');
        },
        setSelectedStatus: function(){
            var l = this.$shopInner.find('.item').length; //所有门店
            var l_d = this.$shopInner.find('.item.type2').length; //所有直属店
            var l_s = this.$shopInner.find('.item.selected').length; //勾选的门店
            var l_d_s = this.$shopInner.find('.item.type2.selected').length; //勾选的直属店

            if(l_d==l_d_s && l_s==l_d_s){
                this.$selectAllDirectShops.addClass('check');
            }else {
                this.$selectAllDirectShops.removeClass('check');
            }

            if(l==l_s){
                this.$selectAllShops.addClass('check');
            }else {
                this.$selectAllShops.removeClass('check');
            }

            if(l_s){
                this.$selectedShops.addClass('show').find('.selectedShopNum').text(l_s);
            }else {
                this.$selectedShops.removeClass('show');
            }

        },
        show: function(opt){
            this.title = opt.title;
            this.muti = opt.muti;
            this.callback = opt.callback;
            if(opt.shops){
                this.shops = this.processData(opt.shops);
            }else {
                this.shops = this.processData({
                    shopList: am.metadata.controlShops,
                    shopAreas: am.metadata.shopAreas
                });
            }
            this.render();
            this.open();
        },
        open: function(){
            this.$.show(0);
            this.$wrapper.addClass('show');
        },
        hide: function(){
            this.$wrapper.removeClass('show');
            this.$.hide();
            this.reset();
        },
        reset: function(){
            this.$keywords.val('');
            this.$search.show();
            this.$clear.hide();
            this.$selectedShops.removeClass('show');
        },
        render: function(){
            if(this.title){
                this.$title.text(this.title);
            }else {
                this.$title.text('门店选择');
            }
            this.$districtInner.empty();
            this.$shopInner.empty();
            for(var i=0;i<this.shops.length;i++){
                var shop = this.shops[i];
                if(this.muti && shop.area.areaName=='总部'){
                    continue;
                }
                if(shop.area.areaName!='总部'){
                    var $district = this.$district.clone(true,true);
                    this.$districtInner.append($district.text(shop.area.areaName));
                }  
                var shops = shop.list;
                var $shopWrap = this.$shopWrap.clone(true,true);
                $shopWrap.find('.district').text(shop.area.areaName);
                for(var j=0;j<shops.length;j++){
                    if(shops[j].mgjversion!=1 || this.muti){
                        var $shop = this.$shop.clone(true,true);
                        $shop.addClass('type'+shops[j].softgenre)
                        $shop.find('.shopName').text(shops[j].shopFullName);
                        $shopWrap.find('.list').append($shop.data('data',shops[j]));
                    }
                }
                this.$shopInner.append($shopWrap);
            }
            if(this.muti){
                this.$btns.show();
                this.$shopContainer.removeClass('bottom');
            }else {
                this.$btns.hide();
                this.$shopContainer.addClass('bottom');
            }
            var _this = this;
            setTimeout(function(){
                _this.districtScroll.refresh();
                _this.shopScroll.refresh();
                _this.districtScroll.scrollTo('top');
                _this.shopScroll.scrollTo('top');

                var district = _this.$shopContainer.find('.district');
                for(var i=0;i<district.length;i++){
                    var $shop = $(district[i]);
                    $shop.data('top',$shop.position().top);
                }
            },0);
            
        },
        filter: function(keywords){
            console.log(this.shops)
            var shops = this.$shopInner.find('.item');
            if(!keywords){
                shops.show();
            }else {
                for(var i=0;i<shops.length;i++){
                    var $shop = $(shops[i]);
                    var data = $shop.data('data');
                    if(data.shopFullName.indexOf(keywords)!=-1 || data.pycode.indexOf(keywords.toLowerCase())==0){
                        $shop.show();
                    }else {
                        $shop.hide();
                    }
                }
            }
            this.$shopInner.find('.wrap').show();
            var lists = this.$shopInner.find('.list');
            for(var i=0;i<lists.length;i++){
                var $list = $(lists[i]);
                var $lis = $list.find('li:visible');
                if(!$lis.length){
                    $list.parent('.wrap').hide();
                }else {
                    $list.parent('.wrap').show();
                }
            }
            var visibleShops = this.$shopInner.find('.item:visible');
            if(visibleShops.length){
                this.$empty.hide();
            }else {
                this.$empty.show();
            }
            this.$districtContainer.find('.item').removeClass('active');
        },
        processData: function(shops){
            shops = JSON.parse(JSON.stringify(shops));
            var obj = {};
            for(var i=0;i<shops.shopList.length;i++){
                var shop = shops.shopList[i];
                shop.shopFullName = (shop.osName==' ' || shop.osName=='' || shop.osName==null)?((shop.shopName==' ' || shop.shopName=='' || shop.shopName==null)?'门店名称未设定':shop.shopName):shop.osName;
                var pycode = '';
                var arr = shop.shopFullName.split('');
                for(var j=0;j<arr.length;j++){
                    pycode += codefans_net_CC2PY(arr[j]).substr(0, 1).toLowerCase();
                }
                shop.pycode =pycode;
                if(shop.softgenre==0){
                    obj['总部'] = {
                        area: {
                            id: 0,
                            areaName: '总部'
                        },
                        list: [shop]
                    };
                }else {
                    var area = this.getArea(shops.shopAreas,shop.shopId);
                    if(area){
                        if(!obj[area.areaName]){
                            obj[area.areaName] = {
                                area: area,
                                list: []
                            };
                        }
                        obj[area.areaName].list.push(shop);
                    }else {
                        if(!obj['区域未设定']){
                            obj['区域未设定'] = {
                                area: {
                                    id: 999999,
                                    areaName: '区域未设定'
                                },
                                list: []
                            };
                        }
                        obj['区域未设定'].list.push(shop);
                    }
                }
            }
            for(var key in obj){
                if(obj[key].list && obj[key].list.length){
                    obj[key].list = obj[key].list.sort(function(a,b){
                        return a.softgenre - b.softgenre
                    })
                }
            }
            var arr = [];
            for(var key in obj){
                arr.push(obj[key]);
            }
            arr = arr.sort(function(a,b){
                return a.area.id - b.area.id
            })
            console.log(arr);
            return arr;
        },
        getArea: function(shopAreas,shopId){
            if(shopAreas && shopAreas.length){
                for(var i=0;i<shopAreas.length;i++){
                    if(shopAreas[i].shopIds && shopAreas[i].shopIds.indexOf(shopId)!=-1){
                        return shopAreas[i];
                    }
                }
            }
            return null;
        },
        getValue: function(){
            var shops = this.$shopInner.find('.item.selected');
            if(!shops.length){
                am.msg('请选择门店');
                return false;
            }
            var arr = [];
            for(var i=0;i<shops.length;i++){
                var data = $(shops[i]).data('data');
                arr.push(data);
            }
            arr = this.getUnique(arr);
            return arr;
        },
        getUnique: function(shops){
            if(shops.length==1){
                return shops;
            }
            var arr = [];
            var map = {};
            for(var i=0;i<shops.length;i++){
                if(!map[shops[i].shopId]){
                    map[shops[i].shopId] = 1;
                    arr.push(shops[i]);
                }
            }
            return arr;
        }, 
    }
    shopSelect.init();
    am.shopSelect = shopSelect;
})();
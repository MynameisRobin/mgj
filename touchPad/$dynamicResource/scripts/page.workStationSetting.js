(function(){
    var self = am.page.workStationSetting = new $.am.Page({
        id: 'page_workStationSetting',
        backButtonOnclick: function(){
            var hasChanged = this.checkChanged();
            if(hasChanged){
                atMobile.nativeUIWidget.confirm({
                    caption: "配置已更改但未保存",
                    description: "配置已更改但未保存，返回后此次编辑将视为无效，确认返回吗？",
                    okCaption: "去保存",
                    cancelCaption: "仍返回"
                }, function () {
                    self.saveSpace();
                }, function () {
                    $.am.page.back("slidedown");
                });
            }else {
                $.am.page.back('slidedown');
            }
        },
        init: function(){
            this.$setting = this.$.find('.setting');
            this.$spaceWrapper = this.$setting.find('.setting-inner');
            this.$item = this.$spaceWrapper.find('.seat').remove();
            this.$space = this.$spaceWrapper.find('.space').remove();

            this.$item.on('vclick','.empty',function(){
                var $parent = $(this).parent();
                var seats = $parent.siblings();
                am.addRemark.show({
                    title: '添加座位名称',
                    subtitle: '座位名称,如大厅一号座',
                    maxlength: 7,
					cb: function(val){
                        if(!val){
                            return am.msg('请输入座位名称');
                        }
                        if(!self.checkSameSpaceSeatName(seats,val)){
                            return am.msg('同一区域座位名称不能相同');
                        }
                        $parent.addClass('used');
                        var data = $parent.data('data');
                        data.status = 1;
                        data.tablename = val;
                        $parent.find('.text').text(val);
					}
				});
            }).on('vclick','.del',function(){
                var $parent = $(this).parent();
                $(this).parent().removeClass('used');
                var data = $parent.data('data');
                data.status = 0;
                data.tablename = $parent.index().toString();
            }).on('vhold','.used',function(){
                var hasChanged = self.checkChanged();
                if(hasChanged){
                    return am.msg('配置已更改，请保存后再下载');
                }
                var data = $(this).parent().data('data');
                var spaceName = $(this).parents('.space').find('.spaceName').text();
                am.seatDownload.show({
                    areaid: data.areaid,
                    spaceName: spaceName,
                    id: data.id,
                    seatName: data.tablename
                });
            }).on('vclick','.used',function(){
                var value = $(this).find('.text').text();
                var seats = $(this).parent().siblings();
                var $this = $(this);
                am.addRemark.show({
                    title: '修改座位名称',
                    subtitle: '座位名称,如大厅一号座',
                    maxlength: 7,
                    value: value,
					cb: function(val){
                        if(!val){
                            return am.msg('请输入座位名称');
                        }
                        if(!self.checkSameSpaceSeatName(seats,val)){
                            return am.msg('同一区域座位名称不能相同');
                        }
                        $this.find('.text').text(val);
                        var data = $this.parent().data('data');
                        data.tablename = val;
					}
				});
            });

            this.$space.on('vclick','.changeRow',function(){
                var $this = $(this);
                am.popupMenu('请选择排数',self.row,function(ret){
                    var row = $this.find('.row-num').text();
                    if(row==ret.name){
                        return;
                    }
                    self.changeRow($this,ret.name);
                });
            }).on('vclick','.spaceNameWrap',function(){
                var value = $(this).find('.spaceName').text();
                var $this = $(this);
                am.addRemark.show({
                    title: '修改区域名称',
                    subtitle: '区域名称',
                    maxlength: 7,
                    value: value,
					cb: function(val){
                        if(!val){
                            return am.msg('请输入区域名称');
                        }
						$this.find('.spaceName').text(val);
					}
				});
            }).on('vclick','.deleteSpace',function(){
                var $this = $(this);
                atMobile.nativeUIWidget.confirm({
                    caption: "确认删除此区域吗",
                    description: "删除区域保存设置后将无法撤回，确认删除吗？",
                    okCaption: "确认",
                    cancelCaption: "取消"
                }, function () {
                    $this.parents('.space').remove();
                }, function () {
                    
                });
            });

            this.$changeColumn = this.$.find('.changeColumn').vclick(function(){
                am.popupMenu('请选择列数',self.column,function(ret){
                    var column = self.$column.text();
                    if(column==ret.name){
                        return;
                    }
                    self.changeColumn(ret.name);
                });
            });
            this.$column = this.$changeColumn.find('.column-num');
            this.$typeSpace = this.$.find('.footer .spaceName').keyup(function(){
                var name = $(this).val().replace(/[\s\r\n\\\/]/g, '');
                $(this).val(name);
                if(name){
                    self.$addSpace.addClass('enable');
                }else {
                    self.$addSpace.removeClass('enable');
                }
            });
            this.$addSpace = this.$.find('.addSpace').vclick(function(){
                if(!$(this).hasClass('enable')){
                    return;
                }
                var name = $(this).prev().val().replace(/[\s\r\n\\\/]/g, '');
                if(!name){
                    return am.msg('请输入分区名称');
                }
                self.addSpace(name);
                $(this).prev().val('');
            });

            this.$save = this.$.find('.save').vclick(function(){
                self.saveSpace();
            });

            this.spaceScroll = new $.am.ScrollView({
                $wrap : this.$setting,
                $inner : this.$spaceWrapper,
                direction : [false, true],
                hasInput: false
            });
        },
        beforeShow: function(){
            if(!this.column){
                this.column = [];
                for(var i=5;i<=8;i++){
                    this.column.push({
                        name: i
                    });
                }
            }
            if(!this.row){
                this.row = [];
                for(var i=1;i<=10;i++){
                    this.row.push({
                        name: i
                    });
                }
            }
            this.renderSpace();
        },
        afterShow: function(){

        },
        beforeHide: function(){

        },
        afterHide: function(){

        },
        checkSameSpaceSeatName:function(seats,name){
            for(var i=0;i<seats.length;i++){
                var data = $(seats[i]).data('data');
                if(data.tablename==name && data.status){
                    return false;
                }
            }
            return true;
        },
        changeColumn: function(column){
            this.$column.text(column);
            var spaces = this.$setting.find('.space');
            if(!spaces.length){
                return;
            }
            for(var i=0;i<spaces.length;i++){
                var space = $(spaces[i]);
                space.find('.column-num').text(column);
                var _setting = space.data('setting');
                var row = Math.ceil(_setting.rownumber*_setting.colnumber/column);
                this.changeRow(space.find('.changeRow'),row,1);
            }
            this.calSize(column);
            this.spaceScroll.refresh();
        },
        changeRow:function($dom,row,isChangeRow){
            var $parent = $dom.parents('.space');
            var setting = $parent.data('setting');
            var seats = setting.seats;
            var $list = $parent.find('.list');
            var length = $list.find('.seat').length;
            var column = $dom.parent().find('.column-num').text()*1;
            if(column*row>length){
                var start = length;
                var end = column*row-1;
                for(var i=start;i<=end;i++){
                    var $item = this.$item.clone(true,true);
                    $item.find('.used .text').text(i+1+'号座');
                    var seat = {
                        status: 0,
                        tablename: i+1+'号座'
                    }
                    $list.append($item.data('data',seat));
                    for(var j=0;j<seats.length;j++){
                        if(i==j && seats[j].status==1){
                            $item.find('.empty').trigger('vclick');
                            seat.id = seats[j].id;
                            break; 
                        }
                    }
                }
            }else {
                var start = column*row-1;
                $list.find('.seat:gt('+start+')').remove();
            }
            $dom.find('.row-num').text(row);
            if(!isChangeRow){
                setting.row = row;
            }
            this.calSize(column);
            this.spaceScroll.refresh();
        },
        addSpace: function(name){
            var spaces = this.$setting.find('.space');
            var repeatName = false;
            for(var i=0;i<spaces.length;i++){
                var space = $(spaces[i]);
                var _name = space.find('.spaceName').text();
                if(_name==name){
                    return am.msg('此分区已添加');
                }
            }
            var column = this.$column.text()*1;
            var $space = this.$space.clone(true,true);
            $space.find('.intro .spaceName').text(name);
            $space.find('.intro .column-num').text(column);
            $space.find('.intro .row-num').text(1);
            var setting = {
                name: name,
                colnumber: column,
                rownumber: 1,
                seats: []
            }
            for(var i=0;i<column;i++){
                var $item = this.$item.clone(true,true);
                $item.find('.used .text').text(i+1+'号座');
                var seat = {
                    status: 0,
                    tablename: i+1+'号座'
                }
                $space.find('.list').append($item.data('data',seat));
                setting.seats.push(seat);
            }
            this.$spaceWrapper.append($space.data('setting',setting));
            this.calSize(column);
            this.spaceScroll.refresh();
            setTimeout(function(){
                self.spaceScroll.scrollTo('bottom');
            },300);
            this.$addSpace.removeClass('show').prev().val('');
            am.msg('新分区已添加');
        },
        renderSpace: function(){
            this.$spaceWrapper.empty();
            var setting = amGloble.metadata.areaList;
            if(!setting || !setting.length){
                this.$column.text(6);
                return;
            }
            var setting = JSON.parse(JSON.stringify(setting));
            var column = 0;
            for(var i=0;i<setting.length;i++){
                var $space = this.$space.clone(true,true);
                $space.find('.intro .spaceName').text(setting[i].name);
                $space.find('.intro .column-num').text(setting[i].colnumber);
                $space.find('.intro .row-num').text(setting[i].rownumber);
                $space.data('id',setting[i].id);
                if(!column){
                    column = setting[i].colnumber;
                }
                var seats = setting[i].seats.sort(function(a,b){
                    return a.sort - b.sort;
                });
                for(var j=0;j<seats.length;j++){
                    var $item = this.$item.clone(true,true);
                    $item.find('.used .text').text(seats[j].tablename);
                    if(seats[j].status){
                        $item.addClass('used');
                    }
                    $space.find('.list').append($item.data('data',seats[j]));
                }
                this.$spaceWrapper.append($space.data('setting',setting[i]));
            }
            this.$column.text(column);
            this.calSize(column);
            this.spaceScroll.refresh();
            this.spaceScroll.scrollTo('top');
        },
        getSpace: function(){
            var setting = [];
            var spaces = this.$setting.find('.space');
            if(!spaces.length){
                return setting;
            }
            for(var i=0;i<spaces.length;i++){
                var space = $(spaces[i]);
                var _setting = {
                    id: space.data('id') || null,
                    name: space.find('.spaceName').text(),
                    colnumber: space.find('.column-num').text()*1,
                    rownumber: space.find('.row-num').text()*1,
                    shopId: amGloble.metadata.userInfo.shopId,
                    seats: []
                }
                var seats = space.find('.seat');
                for(var j=0;j<seats.length;j++){
                    var seat = $(seats[j]).data('data');
                    _setting.seats.push({
                        id: seat.id || null,
                        areaid: _setting.id,
                        tablename: seat.tablename,
                        sort: seat.sort,
                        status: seat.status
                    });
                }
                setting.push(_setting)
            }
            return setting;
        }, 
        saveSpace: function(){
            var setting = this.getSpace();
            console.log(setting);
            am.loading.show();
            am.api.addTables.exec({
                parentShopId: am.metadata.userInfo.parentShopId,
                shopId: am.metadata.userInfo.shopId,
                area: setting
            },function(ret){
                am.loading.hide();
                if(ret && ret.code==0){
                    am.msg('保存成功');
                    amGloble.metadata.areaList = ret.content;
                    self.renderSpace(ret.content);
                }else {
                    am.msg('保存失败');
                }
            });
        },
        calSize: function(column){
            this.$spaceWrapper.find('.seat').removeClass('small');
            var itemWidth = this.$spaceWrapper.find('.seat').outerWidth();
            if(!this.containerWidth){
                this.containerWidth = this.$spaceWrapper.find('.list').width();
            }
            var margin = 10;
            if(this.containerWidth>itemWidth*column){
                margin = (this.containerWidth -  itemWidth*column)/(column-1);
            }else {
                this.$spaceWrapper.find('.seat').addClass('small');
                itemWidth = this.$spaceWrapper.find('.seat').outerWidth();
            }
            this.$spaceWrapper.find('.seat').css('margin-right',margin+'px');
            this.$spaceWrapper.find('.seat:nth-child('+column+'n)').css('margin-right',0);
            this.$spaceWrapper.find('.list').css('width',itemWidth*column+margin*(column-1)+'px');
        },
        checkChanged: function(){
            var setting = amGloble.metadata.areaList || [];
            var currentSetting = this.getSpace();
            if(JSON.stringify(setting)!=JSON.stringify(currentSetting)){
                return true;
            }
            return false;
        }
    });
})();
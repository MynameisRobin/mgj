(function() {
  window.cashierTools = {};
  /*
     * opt.$         page.$
     * opt.data      items
     * opt.tab       true|false
     * opt.filter    true|false
     * opt.onSelect  function(selectedItemData){ }
     */
  window.cashierTools.BillItemSelector = function(opt) {
    var _this = this;
    this.$ = opt.$;
    this.page = opt.page;
    this.onSelect = opt.onSelect;
    this.checkPromise = opt.checkPromise;
    this.onTouch = opt.onTouch;
    this.onTouchHold = opt.onTouchHold;
    this.itemWidth = opt.itemWidth;
    this.onSize = opt.onSize;
    this.beforeTabChange = opt.beforeTabChange;
    this.clicked = opt.clicked;

    if (opt.tab) {
      this.$tab = this.$.find(".cashierTab").on("vclick", "li", function() {
        var data = $(this).data("data");
        if (_this.beforeTabChange && _this.beforeTabChange(data)) return false;

        $(this)
          .addClass("selected")
          .siblings()
          .removeClass("selected");
        _this.render(data,false,opt.flag);
        _this.onTouch && _this.onTouch(1,$(this));
      });
      this.tabScroll = new $.am.ScrollView({
        $wrap: this.$tab,
        $inner: this.$tab.find("ul"),
        direction: [true, false],
        hasInput: false,
        bubble: 1
      });
    }
    if (opt.filter) {
      this.$filter = this.$.find(".cashierFilter").on(
        "vclick",
        "li",
        function() {
          var t = $(this)
            .find("span")
            .text();
          if (t == "全部") {
            t = null;
          }
          _this.render(_this.$tab.find(".selected").data("data"), t, opt.flag);
          $(this)
            .addClass("selected")
            .siblings()
            .removeClass("selected");
          // _this.$.find(".cashierBox tbody").html("");
          // _this.$.find("li[autointoorder='1']").trigger("vclick");
          _this.onTouch && _this.onTouch(1);
        }
      );
      this.$filter.find(".modelType").vclick(function() {
        var $this = $(this);
        if ($this.hasClass("onlyText")) {
          _this.viewModel(1);
        } else {
          _this.viewModel(0);
        }
      });
    }
    this.itemScroll = new $.am.ScrollView({
      $wrap: this.$.find(".cashierItemScroll"),
      $inner: this.$.find(".cashierItemScroll ul"),
      direction: [true, false],
      hasInput: false,
      bubble: 1
    });
    this.itemScroll.$wrap.bind({
      vtouchstart: function() {
        _this.onTouch && _this.onTouch();
      }
      // vhold: function() {
      //   _this.onTouchHold && _this.onTouchHold();
      // }
    });

    if (opt.data) {
      this.dataBind(data);
    }

    this.itemScroll.$inner.on("vclick", "li", function() {
      var that = this;
      if (
        !_this.checkPromise ||
        (_this.checkPromise && !_this.checkPromise())
      ) {
        var data,$this=$(this);
        var addToBillMain = function(data){
          var $billMainTr1 = _this.onSelect(data, function(
            $billMainTr
          ) {
            var offset = $billMainTr.offset();
            var selfOffset = $(that).offset();
            _this.animate(
              [selfOffset.left + 30, selfOffset.top + 50],
              [offset.left + 100, offset.top],
              function() {
                $billMainTr.trigger("vclick");
              }
            );
          });
          if ($billMainTr1) {
            var offset = $billMainTr1.offset();
            var selfOffset = $(that).offset();
            _this.animate(
              [selfOffset.left + 30, selfOffset.top + 50],
              [offset.left + 100, offset.top],
              function() {
                $billMainTr1.trigger("vclick");
              }
            );
          }
          _this.endGrouping();
        }

        if($this.hasClass('group')){
          var items = [],group = $this.data('group');
          for(var i in group.items){
            var serviceItem = am.metadata.serviceCodeMap[group.items[i]];
            serviceItem && items.push({
              name:'<span style="display:inline-block;width:18rem;">'+serviceItem.name+'</span><span style="display:inline-block;">'+(serviceItem.price?' ￥'+serviceItem.price:'未定价')+'</span>',
              data:serviceItem
            });
          }
          am.popupMenu("请选择项目", items, function (ret) {
            addToBillMain(ret.data);
          });
        }else{
          addToBillMain($this.data("data"));
        }
      }
    });

    this.itemScroll.$inner.on("vhold", "li", function() {
      var data = $(this).data("data");
      if(!opt.flag && !$(this).hasClass('shake')){
        _this.onTouchHold(data, $(this));
      }
    });
    this.$dot = $("#animateDot");
  };
  window.cashierTools.BillItemSelector.prototype = {
    dataBind: function(data) {
      this.data = data;
      console.log(data);
      this.initRender();
    },
    render: function(data, filter, flag) {
      if (!data) {
        return;
      }
      var items = this.processGroupData(data.sub);
      this.itemScroll.$inner.empty();

      // if(this.$filter){
      //     items.sort(function(a,b){
      //         return a.pinyin.localeCompare(b.pinyin);
      //     });
      // }
      var arrPinyin = [];
      for (var i = 0; i < items.length; i++) {
        if (filter && items[i].pinyin != filter) continue;
        var autointoorder = items[i].autointoorder == 1 ? 1 : 0;
        // if(items[i].autointoorder == 1){
        //   console.log(items[i])
        // }
        var $p = '<p class="tip">长按替换图片</p>';
        if(flag){
          $p = '';
        }
        var $li = $(
          '<li class="am-clickable" autointoorder="'+autointoorder+'" data-itemid='+items[i].itemid+'><div class="img">'+ $p +'</div><div class="name"></div><div class="price"></div></li>'
        );
        $li.find(".name").text(items[i].name);
        var price = "未定价";
        if (typeof items[i].price == "number") {
          if (items[i].costMoney) {
            price = toFloat(items[i].price * 1 + items[i].costMoney * 1);
          } else if (items[i].priceRange) {
            price = items[i].priceRange;
          } else {
            price = items[i].price;
          }
        }
        $li.find(".price").text(price);
        $li.data("data", items[i]);
        
        if (items[i].allowkd * 1 === 0) {
          $li.addClass("notAllowkd");
        }
        this.itemScroll.$inner.append($li);
        if (!filter && arrPinyin.indexOf(items[i].pinyin) == -1) {
          arrPinyin.push(items[i].pinyin);
        }

        //组渲染
        if(items[i].items){
          //以是否有items判断是否组数据
          $li.addClass('group');
          $li.data('group',items[i]);
          if(this.onlyText){
            $li.find(".img").html("<span>组</span>");
          }else{
            var c = 0;
            for(var j in items[i].items){
              var itemData = am.metadata.serviceCodeMap[items[i].items[j]];
              if(itemData && itemData.mgjservicesetlogo){
                $li.find('.img').append($('<div class="imgItem"></div>').html(this.getItemImg(itemData)));
                c++;
              }
            }
            var l = 4-c;
            for(var k=0;k<l;k++){
              $li.find('.img').append($('<div class="imgItem"></div>'));
            }
          }
        }else{
          //普通项目
          if (this.onlyText) {
            $li.find(".img").html("<span>" + items[i].name.charAt(0) + "</span>");
          } else {
            $li.find(".img").html(this.getItemImg(items[i]));
          }
        }
      }

      arrPinyin.sort(function(a, b) {
        return a.localeCompare(b);
      });

      var itemLen = this.itemScroll.$inner.find("li").length;
      
      if (this.onlyText) {
        this.itemScroll.$inner.css(
          "width",
          Math.ceil(itemLen / 3) * 230 + "px"
        );
      } else {
        this.itemScroll.$inner.css(
          "width",
          Math.ceil(itemLen / 2) * (this.itemWidth || 152) + "px"
        );
      }

      if (this.$filter && !filter) {
        var $filterUl = this.$filter
          .find("ul")
          .html('<li class="am-clickable"><span>全部</span></li>');
        for (var i = 0; i < arrPinyin.length; i++) {
          $filterUl.append(
            '<li class="am-clickable"><span>' + arrPinyin[i] + "</span></li>"
          );
        }
        $filterUl.find("li:first").addClass("selected all");
      }

      this.itemScroll.refresh();
      this.itemScroll.scrollTo("top");

      console.log(arrPinyin);
      if (this.itemScroll.$inner.width() > this.itemScroll.$wrap.width()) {
        this.itemScroll.$wrap
          .parent()
          .children(".arrowLeft,.arrowRight")
          .show();
      } else {
        this.itemScroll.$wrap
          .parent()
          .children(".arrowLeft,.arrowRight")
          .hide();
      }
    },
    getItemImg:function(item){
      if (item.mgjdepotlogo) {
        var $img = am.photoManager.createImage(
          "goods",
          {
            parentShopId: am.metadata.userInfo.parentShopId
          },
          item.mgjdepotlogo,
          "s"
        );
        return $img;
      } else if (item.mgjservicesetlogo) {
        var $img = am.photoManager.createImage(
          "service",
          {
            parentShopId: am.metadata.userInfo.parentShopId
          },
          item.mgjservicesetlogo,
          "s"
        );
        return $img;
      } else if (item.img) {
        return $('<img src="' + item.img + '" />');
      }
    },
    reset: function() {
      this.viewModel(localStorage.getItem("onlyText_" + this.page), 1);
      if (this.$tab) {
        this.$tab.find("li:first").trigger("vclick");
      }
      this.tabScroll && this.tabScroll.refresh();

      if (this.$tab) {
        var $ul = this.$tab.find("ul");
        var $li = $ul.find("li"),
          w = 0;
        for (var i = 0; i < $li.length; i++) {
          w += $li.eq(i).width() + 20;
        }
        if (w > this.$tab.width()) {
          $ul.css({ width: w + "px", margin: "0" });
          this.tabScroll && this.tabScroll.refresh();
        } else {
          $ul.css({ width: "auto", margin: "auto" });
        }
      }
    },
    initRender: function() {
      this.itemScroll.$inner.empty();
      if (this.$tab) {
        var $ul = this.$tab.find("ul").empty(),
          w = 0;
        for (var i = 0; i < this.data.length; i++) {
          if (!this.data[i].sub || !this.data[i].sub.length) {
            continue;
          }
          var $li = $("<li><span>" + this.data[i].name + "</span></li>")
            .addClass("am-clickable")
            .data("data", this.data[i]);
          $ul.append($li);
          w += $li.width() + 20;
        }
        if (w > this.$tab.width()) {
          $ul.css({ width: w + "px", margin: "0" });
          this.tabScroll && this.tabScroll.refresh();
        }
      } else {
        this.render({ sub: this.data });
      }
    },
    animate: function(start, target, callback) {
      //console.log(start,target);
      var _this = this,
        speed = [];
      //x,y轴移动的距离
      var s = [target[0] - start[0], target[1] - start[1]];
      //x轴，y轴加速度
      var gravity = [s[0] > 0 ? -0.5 : 0.5, 5];
      //y轴的初速度-30(初速度是向上的)是最初设定
      speed[1] = -40 * s[1] / window.innerHeight;
      //y轴移动到目的地所消耗的时间
      var t =
        (Math.sqrt(2 * gravity[1] * s[1] + speed[1] * speed[1]) - speed[1]) /
        gravity[1];
      //同一时间内x轴也应该到目的的，所以可以算出x轴的初速度
      speed[0] = (s[0] - gravity[0] * t * t * 0.5) / t;

      _this.$dot.show();
      //把时间分为30帧, 移用的步数，圆点的透明度
      var t1 = t / 30,
        step = 0,
        r = 0.4;
      var animloop = function() {
        step++;
        var tpass = step * t1;
        var s0 = start[0] + speed[0] * tpass + gravity[0] * tpass * tpass * 0.5;
        var s1 = start[1] + speed[1] * tpass + gravity[1] * tpass * tpass * 0.5;

        if (step <= 6) {
          r += 0.1;
          _this.$dot.css({
            opacity: r
          });
        }

        if (s1 < target[1]) {
          _this.$dot.setTransformPos([s0, s1], "xy");
          requestAnimationFrame(animloop);
        } else {
          _this.$dot.hide();
          callback && callback();
        }
      };
      animloop();
    },
    viewModel: function(type, init) {
      if (!this.$filter) return;
      this.onlyText = type;
      if (type) {
        //纯文字模式
        this.$filter.find(".modelType").removeClass("onlyText");
        this.itemScroll.$wrap.addClass("onlyText");
      } else {
        //图文模式
        this.$filter.find(".modelType").addClass("onlyText");
        this.itemScroll.$wrap.removeClass("onlyText");
      }
      if (!init) {
        //触发渲染
        this.$filter.find("li.selected").trigger("vclick");
        //对外宣布尺寸变化
        this.onSize && this.onSize();
        if (type) {
          localStorage.setItem("onlyText_" + this.page, type);
        } else {
          localStorage.removeItem("onlyText_" + this.page);
        }
      }
    },

    startGrouping:function(){
      var start,_this=this;//起始位置
      this.itemScroll.$inner.find('li').addClass('am-touchable').unbind().bind({
        vtouchstart:function(evt,pos){
          console.log(evt,pos);
          start = pos;
          return false;
        },
        vtouchmove:function(evt,pos){
          var $this=$(this);
          if(!$this.hasClass('shake') || $this.hasClass('group') || !start){
            return false;
          }
          var move = [pos.x-start.x,pos.y-start.y];
          $this.css({
            'z-index':'2',
            'left':(($this.data('scrollleft')||0)+(pos.x-start.x))+'px',
            'top':(pos.y-start.y)+'px',
          }).addClass('groupingBorder target');
          _this.checkGroupingPos($this);
          return false;
        },
        vtouchend:function(evt,pos){
          console.log(evt,pos);
          _this.checkGroupingMatch();
          return false;
        }
      });
      this.itemScroll.$inner.find('li').addClass('shake').find('.tip').text('拖动项目合并');

      var $group = this.itemScroll.$inner.find('li.group');
      $group.append('<div class="groupActionWrap"><div class="groupAction rename iconfont icon-rename am-clickable"></div><div class="groupAction remove iconfont icon-tablecolumnremove am-clickable"></div><div class="groupAction dismiss iconfont icon-close am-clickable"></div></div>');
      $group.find('.groupAction').vclick(function(){
        var $this = $(this);
        if($this.hasClass('rename')){
          _this.renameGroup($this.parents('li'));
        }else if($this.hasClass('remove')){
          _this.removeGroupItem($this.parents('li'));
        }else if($this.hasClass('dismiss')){
          _this.dismissGroup($this.parents('li'));
        }
        return false;
      });
    },
    endGrouping:function(){
      this.itemScroll.$inner.find('li').removeClass('shake').find('.tip').text('长按替换图片');
      this.itemScroll.$inner.find('.groupActionWrap').remove();
    },
    checkGroupingPos:function($tar){
      var _this=this;
      var offset = $tar.offset();
      var rightSpace = window.innerWidth - offset.left - $tar.width()-25;
      var leftSpace = offset.left - this.itemScroll.$wrap.offset().left;
      var pos = this.itemScroll._currentPos;
      var left = $tar.css('left').replace('px','')*1;
      var x,step = 20;
      //向左还是向右
      var leftScroll = leftSpace<10 && pos[0]<0,rightScroll = rightSpace < 0 && pos[0]>this.itemScroll._min[0];
      //$tar被被动操控滚动了多少
      var scrollleft = $tar.data('scrollleft') || 0;

      if(leftScroll || rightScroll){
        if(leftScroll){
          //左边触发滚动
          //容器位置向右位移
          x = pos[0]+step;
          if(x>0){
            //超出的话设置为0;
            step = x;
            x=0;
          }
          //因为容器向右移,为保持平衡,$tar向左移
          $tar.css({
            left:(left-step)+'px'
          }).data('scrollleft',scrollleft-step);
        }else{
          //右边触发滚动
          //容器位置向左位移
          x = pos[0]-step;
          if(x<this.itemScroll._min[0]){
            step = pos[0]-this.itemScroll._min[0];
            x = this.itemScroll._min[0];
          }
          //因为容器向左移,为保持平衡,$tar向右移
          $tar.css({
            left:(left+step)+'px'
          }).data('scrollleft',scrollleft+step);
        }
        //触发容器滚动
        this.itemScroll.scrollTo([x,pos[1]]);

        if(this.checkGroupingPosTimer) clearTimeout(this.checkGroupingPosTimer);
        this.checkGroupingPosTimer = setTimeout(function(){
          _this.checkGroupingPos($tar);
        },50);
      }else{
        this.itemScroll.$inner.find('li').each(function(){
          if(this!=$tar[0]){
            var $this = $(this),liOffset = $this.offset();
            if(Math.abs(offset.left - liOffset.left)<40 && Math.abs(offset.top - liOffset.top)<30){
              $this.addClass('groupingBorder');
            }else{
              $this.removeClass('groupingBorder');
            }
          }
        });
      }
      
    },
    checkGroupingMatch:function(){
      var _this=this,$targets = this.itemScroll.$inner.find('li.groupingBorder');
      if($targets.length>1){
        //两个亮灯的，执行合并
        if($targets.filter(':not(.target)').hasClass('group')){
          //合并的目标是一个组
          this.addItemToGroup($targets,function(data){
            _this.setGroup(data);
            _this.startGrouping();
          });
        }else{
          //合并的目标是一个项目
          this.createGroup($targets,function(data){
            _this.setGroup(data);
            _this.startGrouping();
          });
        }
      }else if($targets.length===1){
        //只有一个，不满足
        $targets.css({
          'z-index':0,
          'left':'0px',
          'top':'0px'
        });
      }

      $targets.removeClass('groupingBorder');
    },
    saveGroupData:function(group,cb){
      am.loading.show();
      am.api.saveNormalConfig.exec({
        "parentshopid": am.metadata.userInfo.parentShopId+'', 
        "configkey": "SERVICE_ITEM_GROUP",
        "configvalue": JSON.stringify(group),
        "shopid": am.metadata.userInfo.shopId+'',
        "setModuleid": "9"
      },function(ret){
        am.loading.hide();
        if(ret && ret.code===0){
          am.metadata.configs.SERVICE_ITEM_GROUP = JSON.stringify(group);
          cb(group);
        }else{
          am.msg(ret.message || '分组设置保存失败!');
          var localData = localStorage.getItem('SERVICE_ITEM_GROUP'+am.metadata.userInfo.shopId);
          var groupData;
          try{
            groupData = JSON.parse(localData);
          }catch(e){
            console.error(e);
          }
          cb(groupData);
        }
      });
    },
    createGroup:function($lis,cb){
      var group = {
        name:'',
        priceRange:'',
        items:[],
      };
      $lis.each(function(){
        var data = $(this).data('data');
        if(!group.name){
          group.name = data.name + '等';
          group.itemid=data.itemid;
          group.price = data.price || 0;
        }
        group.items.push(data.itemid);
      });
      group.pinyin = codefans_net_CC2PY(group.name).substr(0, 1).toUpperCase();

      var groupData;
      if(!this.groupData){
        groupData = [];
      }else{
        groupData = JSON.parse(JSON.stringify(this.groupData));
      }
      groupData.push(group);
      this.saveGroupData(groupData,cb);
    },
    addItemToGroup:function($lis,cb){
      var group = $lis.filter('.group').data('group');
      var item = $lis.filter(':not(.group)').data('data');
      group.items.push(item.itemid+'');
      this.saveGroupData(this.groupData,cb);
    },
    renameGroup:function($li){
      var group = $li.data('group'),_this=this;
      if(group){
        am.inputSth({
          title:'修改分组名称',
          value:group.name,
          maxLength:6,
          callback:function(name){
            if(name){
              group.name = name;
              group.pinyin = codefans_net_CC2PY(group.name).substr(0, 1).toUpperCase();
              _this.saveGroupData(_this.groupData,function(data){
                _this.setGroup(data);
                _this.startGrouping();
              });
            }else{
              return true;
            }
          }
        });
      }
    },
    removeGroupItem:function($li){
      var _this=this;
      var items = [],group = $li.data('group');
      if(group && group.items){
        for(var i in group.items){
          var serviceItem = am.metadata.serviceCodeMap[group.items[i]];
          if(serviceItem){
            items.push(serviceItem);
          }
        }
      }
      am.popupMenu("移出分组", items, function (ret) {
        var group = $li.data('group');
        if(ret && ret.length >= items.length-1){
          //删完了
          _this.dismissGroup($li);
        }else if(ret && ret.length){
          //没删完
          for(var i = 0;i< ret.length;i++){
            if(group && group.items && group.items.length){
              var idx = group.items.indexOf(ret[i].itemid);
              group.items.splice(idx,1);
            }
          }
          /* 先干掉此逻辑，看上去主ID不在组里面也没什么关系
            if(group.items.indexOf(group.itemid) === -1){
            //如果主项目被删了,换一个ID
            group.itemid = group.items[0];
          } */
          _this.saveGroupData(_this.groupData,function(data){
            _this.setGroup(data);
            _this.startGrouping();
          });
        }
      },undefined,true);
    },
    dismissGroup:function($li){
      var _this=this;
      am.confirm(
        "解散分组",
        "确认要解散此分组？",
        "确定",
        "取消",
        function() {
          var data = [],group = $li.data('group'),groupData = _this.groupData;
          if(groupData){
            for(var i = 0;i<groupData.length;i++){
              if(groupData[i] != group){
                data.push(groupData[i]);
              }
            }
          }
          _this.saveGroupData(data,function(data){
            _this.setGroup(data);
            _this.startGrouping();
          });
        },
        function() {

        }
      );
    },
    setGroup:function(data){
      this.groupData = data;
      console.log('setGroup:',data);
      localStorage.setItem('SERVICE_ITEM_GROUP'+am.metadata.userInfo.shopId,JSON.stringify(data));
      this.$tab.find('li.selected').trigger('vclick');
    },
    processGroupData:function(items){
      if(this.groupData && this.groupData.length){
        var itemsNotInGroup = [];
        var itemIdInGroup = [];
        var groups = [];
        for(var i in items){
          //正常的项目数据
          //不在分组中的正常显示，在分组中的要移除
          var inGroup = false;
          for(var j in this.groupData){
            //遍历分组数据
            if(this.groupData[j].items.indexOf(items[i].itemid) !== -1){
              //如果分组里面存在此项目，加入到分组项目的缓存中
              if(itemIdInGroup.indexOf(items[i].itemid) === -1){
                //加入到缓存对象groups，如果itemIdInGroup中有数据，说明已经加过了，跳过此步骤
                //把此分组的ID连起来
                itemIdInGroup = itemIdInGroup.concat(this.groupData[j].items);
                groups.push(this.groupData[j]);
              }
              inGroup = true;
              break;
            };
          }
          if(!inGroup){
            itemsNotInGroup.push(items[i]);
          }
        }
        
        for(var i in groups){
          //重算价格范围
          groups[i].priceRange = this.getGroupPrice(groups[i].items);
        }
        return groups.concat(itemsNotInGroup);
      }else{
        return items;
      }
    },
    //计算价格范围
    getGroupPrice:function(itemIds){
      var prices = [];
      for(var i in itemIds){
        var serviceItem = am.metadata.serviceCodeMap[itemIds[i]];
        if(typeof(serviceItem.price)==='number' && prices.indexOf(serviceItem.price) === -1){
          //价格有配置，而且不重复
          prices.push(serviceItem.price);
        }
      }
      prices.sort(function(a,b){
        return a-b;
      });
      if(prices.length>1){
        return prices[0]+'~'+prices[prices.length-1];
      }else if(prices.length===1){
        return prices[0];
      }else{
        return '未定价';
      }
    }
  };
})();

window.am.convertMemberDetailToSearch = function(optMember) {
  return {
    balance: optMember.card.cardfee * 1 || 0,
    buydiscount: optMember.card.buydiscount * 1 || 10,
    cardName: optMember.card.cardtypename,
    cardNo: optMember.card.cardid,
    cardtimes: optMember.card.cardtimes,
    cardtype: optMember.card.cardtype,
    cardTypeId: optMember.card.cardtypeid,
    cid: optMember.card.id,
    comment: optMember.memberInfo.page,
    createDateTime: optMember.card.opendate,
    discount: optMember.card.discount * 1 || 10,
    gift: optMember.card.presentfee * 1 || 0,
    id: optMember.memberInfo.id,
    lastphotoupdatetime: optMember.memberInfo.lastphotoupdatetime,
    mobile: optMember.memberInfo.mobile,
    name: optMember.memberInfo.name,
    //points:optMember.memberInfo.sumpoint,
    points: optMember.memberInfo.currpoint,
    sex: optMember.memberInfo.sex,
    timefee: optMember.card.timefee,
    timeflag: optMember.card.timeflag,
    treatcardfee: optMember.card.treatcardfee * 1 || 0,
    treatpresentfee: optMember.card.treatpresentfee * 1 || 0,
    shopId: optMember.memberInfo.shopid,
    passwd: optMember.memberInfo.passwd
  };
};

window.am.goBackToInitPage = function() {
  if (amGloble.metadata.shopPropertyField.mgjBillingType == 1) {
    $.am.changePage(am.page.hangup, "slidedown", { openbill: 1 });
  } else {
    $.am.changePage(am.page.service, "slidedown");
  }
};

window.am.pageStatus = {
  //全局临时缓存信息
  status: {},
  setStatus: function(key, data) {
    //创建一个缓存数据
    this.status[key] = data;
  },
  delStatus: function(key) {
    delete this.status[key];
  },
  getStatus: function(key) {
    return this.status[key];
  }
};

$(function() {
  window.am.cashierSetting = {
    init: function() {
      var _this = this;
      this.$ = $("#cashierSetting");
      this.$close = this.$.find(".close").vclick(function() {
        _this.$.hide();
        _this.cb && _this.cb();
      });
      this.$settings = this.$.find("ul.settings").on(
        "vclick",
        "li",
        function() {
          if($(this).hasClass('disabled')){
            return;
          }
          $(this).toggleClass("selected");
          _this.updateAllSel();
        }
      );

      this.scrollview = new $.am.ScrollView({
        $wrap: this.$.find(".settingsWrap"),
        $inner: this.$.find(".settingsWrapper"),
        direction: [false, true],
        hasInput: false
      });
      this.$allSel = this.$.find(".checkBox").vclick(function() {
        var $this = $(this);
        if ($this.hasClass("checked")) {
          $this.removeClass("checked");
          _this.$settings.find("li:not('.disabled')").removeClass("selected");
        } else {
          $this.addClass("checked").removeClass("halfchecked");
          _this.$settings.find("li:not(.disabled)").addClass("selected");
        }
      });

      this.$.find(".button").vclick(function() {
        var sets = [];
        _this.$settings.find("li").each(function() {
          var $this = $(this);
          sets.push({
            name: $this.text(),
            key: $this.attr("key"),
            flag: $this.hasClass("selected") ? 1 : 0
          });
        });

        _this.cb && _this.cb(sets);
        _this.$.hide();
      });
    },
    //[{"name":"显示男女客","key":"genderSelector","flag":1}]
    show: function(items, cb) {
      this.$settings.empty();
      for (var i = 0; i < items.length; i++) {
        var $li = $("<li></li>").addClass("am-clickable");
        $li.text(items[i].name).attr("key", items[i].key);
        if (items[i].flag) {
          $li.addClass("selected");
        }
        if(items[i].key=='setting_washTime' && amGloble.metadata.configs.rcordRinseTime && amGloble.metadata.configs.rcordRinseTime=='true'){
          $li.addClass("selected").addClass('disabled').removeClass('selected');
        }
        this.$settings.append($li);
      }
      this.$.css("display", "-webkit-box");
      this.cb = cb;

      this.scrollview.refresh();
      this.scrollview.scrollTo("top");
      this.updateAllSel();
    },
    updateAllSel: function() {
      var $lis = this.$settings.find("li:not('.disabled')");
      var $sel = $lis.filter(".selected");
      if ($sel.length == $lis.length) {
        this.$allSel.addClass("checked").removeClass("halfchecked");
      } else if ($sel.length) {
        this.$allSel.removeClass("checked").addClass("halfchecked");
      } else {
        this.$allSel.removeClass("checked").removeClass("halfchecked");
      }
    }
  };

  window.am.cashierSetting.init();
});

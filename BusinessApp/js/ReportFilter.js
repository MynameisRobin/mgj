
$(function () {
  var reportFilterSample = ['<div class="c-reportFilter am-placeholder">',
    '    <div class="am-clickable button left"></div>',
    '    <div class="am-clickable datePicker">',
    '        <div class="date startDate">',
    '            <div class="year"></div>',
    '            <div class="day"></div>',
    '        </div>',
    '        <div class="to">~</div>',
    '        <div class="date endDate">',
    '            <div class="year"></div>',
    '            <div class="day"></div>',
    '        </div>',
    '        <div class="date singleDate">',
    '            <div class="year"></div>',
    '            <div class="day"></div>',
    '        </div>',
    '        <input type="text" class="dataContainer">',
    '    </div>',
    '    <div class="am-clickable button right dept"></div>',
    '    <div class="am-clickable button right shop"></div>',
    '    <div class="am-clickable button right emps"></div>',
    '    <div class="am-clickable button right level"></div>',
    '    <div class="am-clickable button right category"></div>',
    '    <div class="am-clickable button right selectTime"></div>',
    '    <div class="shortcut">',
    '        <div class="line">',
    '            <ul></ul>',
    '        </div>',
    '        <div class="line">',
    '            <ul></ul>',
    '        </div>',
    '    </div>',
    '</div>'
  ].join('');
  var allDept = {
    id: -1,
    code: '-1',
    name: '全部部门'
  };
  var shops = [];
  var emps = [];
  var ReportFilter = function (opt) {
    this.opt = opt;
    this.init(opt);
  };

  ReportFilter.prototype = {
    init: function (opt) {
      var self = this;
      this.$ = $(reportFilterSample);
      opt.$.after(this.$);
      var now = amGloble.now();
      //
      this.$dataContainer = this.$.find('.dataContainer').change(function () {
        var date = self.getDate();
      });


      // 快捷选择
      this.$shortcut = this.$.children('.shortcut');
      this.$shortcutMonth = this.$shortcut.children('.line:eq(0)');
      this.$shortcutDay = this.$shortcut.children('.line:eq(1)');
      this.shortcutMonth = new $.am.ScrollView({
        $wrap: this.$shortcutMonth,
        $inner: this.$shortcutMonth.children(),
        direction: [1, 0]
      });
      this.shortcutDay = new $.am.ScrollView({
        $wrap: this.$shortcutDay,
        $inner: this.$shortcutDay.children(),
        direction: [1, 0]
      });

      this.$shortcut.on('vclick', 'li', function () {
        var date = $(this).data('date');
        self.hideShortcut();
        self.setDate(date);
      });

      // 下方按钮
      this.$leftBtn = this.$.find('.button.left').vclick(function () {
        if ($(this).hasClass('selected')) {
          self.hideShortcut();
        } else {
          self.showShortcut();
        }
      });

      this.$deptBtn = this.$.find('.button.dept').vclick(function () {
        if (opt.hideAllDept) {
          var depts = amGloble.metadata.currentDepts || [];
        } else {
          var depts = [allDept].concat(amGloble.metadata.currentDepts);
        }
        amGloble.popupMenu('请选择部门', depts, function (ret) {
          self.setDept(ret);
        });
      });

      this.$empBtn = this.$.find('.button.emps').vclick(function () {
        var vname = "name";
        if(opt.showEmployeeLevel){
          vname = "vname";
        }
        amGloble.popupMenu('请选择员工', emps, function (ret) {
          self.setEmp(ret);
        },vname);
      });

      this.$shopBtn = this.$.find('.button.shop').vclick(function () {
        amGloble.popupMenu('请选择门店', shops, function (ret) {
          self.setShop(ret);
        },'shopFullName');
      });
      this.$levelBtn = this.$.find('.button.level').vclick(function () {
        var levels = [].concat(amGloble.metadata.currentRoles);
        amGloble.popupMenu('请选择员工级别', levels, function (ret) {
          self.setLevel(ret);
        });
      });
      this.$categoryBtn = this.$.find('.button.category').vclick(function () {
        var category = [].concat(amGloble.metadata.category);
        amGloble.popupMenu('请选择类别', category, function (ret) {
          self.setCategory(ret);
        });
      });


      this.$timeBtn = this.$.find('.button.selectTime').vclick(function () {
        var time = [{ id: 15, name: '15分钟' }, { id: 20, name: '20分钟' }, { id: 25, name: '25分钟' },
          { id: 30, name: '30分钟' }, { id: 35, name: '35分钟' }, { id: 40, name: '40分钟' }, { id: 45, name: '45分钟' },
          { id: 50, name: '50分钟' }, { id: 55, name: '55分钟' }, { id: 60, name: '60分钟' }];
        amGloble.popupMenu('请选择类别', time, function (ret) {
          self.setTimeArr(ret);
        });
      });
    },
    setOpt: function (opt) {
      if (!opt) {
        opt = {};
      }
      if (!opt.datePickerType) {
        opt.datePickerType = 'ymd'
      }
      $.extend(this.opt, opt);
      var maxRange = amGloble.metadata.userInfo.newRole == 1 ? 172800000 : 2678400000;
      var now = amGloble.now();
      // var min = new Date(now.getTime() - maxRange - 86400000);
      var max = now;
      var self = this;
      if (amGloble.metadata && amGloble.metadata.shops) {
        var tshops = amGloble.metadata.shops;
        shops = [];
        var shop = amGloble.storeSelect.getCurrentShops();
        var flag=false;//包含
        $.each(tshops, function (i, item) {
          if(opt && opt.hideSCshop && item.mgjversion==1){//是否隐藏盛传门店
            return true;
          }
         
          if (opt && opt.shopRole && opt.shopRole.indexOf(item.mgjversion + ',') != -1) {
            item.name = item.osName;
            shops.push(item)
            if (shop && shop.shopId != item.shopId) {
              self.setShop(shop, true);
            }
          } else if (!opt || !opt.shopRole) {
            item.name = item.osName;
            shops.push(item)
            if (shop && shop.shopId != item.shopId) {
              self.setShop(shops[0], true);
            }
          }
        })
        $.each(shops, function (i, item) {
          if(shop&&shop.shopId==item.shopId)flag=true;
        });
        if(shop&&this.getShop()!=shop){
          self.setShop(shop, true);
        }
        if (shop&&flag){amGloble.storeSelect.setCurrentShops(shop);}
        if (shop&&!flag){
          self.setShop(shops[0], true);
        }
      } else {
        var shop = this.getShop();
        if (shop){amGloble.storeSelect.setCurrentShops(shop);}
      }
      if (opt && opt.enableEmp) {
        if(this.opt.refreshEmp){
          this.opt.refreshEmp();
        }else{
          if(opt.emps){
            emps = opt.emps;
          }else{
            this.getEmps();
          }
        }
        
      }

      // 时间选择器
      if (this.$datePicker && !opt.refresh) {
        this.renderShop();
        this.renderEmp();
        //return;//去掉return
      } else if (opt.datePickerType == 'ymd') {
        if (opt.maxTime) {
          max = opt.maxTime;
        }
        this.$datePicker = this.$.find('.datePicker').off('vclick').vclick(function () {
          self.opt.onDatePickerClick && self.opt.onDatePickerClick();
          setTimeout(function () {
            amGloble.loading.show('', 1);
            datePicker.show();
          }, 50);

          setTimeout(function () {
            amGloble.loading.hide(1);
          }, 350);
          // console.log("show");
          // return false;
        }).mobiscroll().range({
          theme: 'mobiscroll',
          lang: 'zh',
          display: 'bottom',
          defaultValue: [now, now],
          // minDate: min,
          showOnTap: false,
          max: max,
          maxRange: maxRange,
          onSet: function (valueText, inst) {
            self.renderDate();
          }
        });
      } else if (opt.datePickerType == 'ym') {
        if (!opt.maxTime) {
          max = new Date(now.getFullYear() + 10, now.getMonth());
        } else {
          max = opt.maxTime;
        }

        this.$datePicker = this.$.find('.datePicker').off('vclick').vclick(function () {
          self.opt.onDatePickerClick && self.opt.onDatePickerClick();
          setTimeout(function () {
            amGloble.loading.show('', 1);
            datePicker.show();
          }, 50);

          setTimeout(function () {
            amGloble.loading.hide(1);
          }, 350);
        }).mobiscroll().date({
          theme: 'mobiscroll',
          lang: 'zh',
          display: 'bottom',
          // minDate: min,
          showOnTap: false,
          dateWheels: 'yy MM',
          dateFormat: 'mm/yy',
          max: max,
          minWidth: 100,
          onSet: function (valueText, inst) {
            self.renderDate();
          }
        })
      } else if (opt.datePickerType == 'single') {
        this.$datePicker = this.$.find('.datePicker').off('vclick').vclick(function () {
          self.opt.onDatePickerClick && self.opt.onDatePickerClick();
          setTimeout(function () {
            amGloble.loading.show('', 1);
            datePicker.show();
          }, 50);

          setTimeout(function () {
            amGloble.loading.hide(1);
          }, 350);
        }).mobiscroll().date({
          theme: 'mobiscroll',
          lang: 'zh',
          display: 'bottom',
          // minDate: min,
          showOnTap: false,
          dateWheels: 'yy MM dd',
          dateFormat: 'yyyy/mm/dd',
          max: max,
          minWidth: 100,
          onSet: function (valueText, inst) {
            self.renderDate();
          }
        })
      }

      var datePicker = this.$datePicker.mobiscroll('getInst');


      this.renderShop();
      this.renderEmp();
      this.renderFilter();
      this.renderShortcut();
      this.renderDept();
      this.renderLevel();
      this.renderCategory();
      this.renderSelectTime();

      if (opt.hideAllDept) {
        var d = amGloble.metadata.currentDepts || [allDept];
        this.setDept(d[0], true);
      } else {
        this.setDept(allDept, true);
      }
      if(amGloble.metadata.currentRoles){
        this.setLevel(amGloble.metadata.currentRoles[0], true);
      }
      this.setCategory({ name: '服务类', 'id': 1 }, true);

      this.setTimeArr({ name: '15分钟', 'id': 15 }, true);
      if(opt.start && opt.end){
        this.setDate(opt.start, opt.end, true);
      }else {
        this.setDate(now, max, true);
      }
    },
    refreshEmps:function(emp){//更新员工选择
      emps = emp;
    },
    getEmps :function() {
      var shop = amGloble.storeSelect.getCurrentShops();
      var self = this;
      if (!shop) {
        // 多门店
        shop = amGloble.metadata.shops;
        amGloble.storeSelect.setCurrentShops(shop[0]);
      } else {
        shop = [shop];
      }
      if (shop.length > 0 && this.sure_shopid != shop[0].shopId) {
        this.sure_shopid = shop[0].shopId;
        amGloble.api.employeeGetEmpByShopid.exec({
          'shopid': shop[0].shopId
        }, function (ret) {
          if (ret.code == 0) {
            emps = $.each(ret.content, function (i, item) {
              if(self.opt.showEmployeeLevel){
                var dutyName = self.getDutyName(item.dutyid);
                if(dutyName){
                  item.vname = dutyName + " - " + item.empname;
                }else{
                  item.vname = item.empname;
                }
              }
              item.name = item.empname;
              
            });
            if (!self.getEmp()) {
              // 因为是网络请求，所以调用onchange
              self.setEmp(emps[0], true)
            }
          } else {
            amGloble.msg('数据加载失败,点击重试!');
          }
        });
      }
    },
    getDutyName:function(dutyId){
      var employeeLevels = amGloble.metadata.employeeLevels;
      for(var i=0;i<employeeLevels.length;i++){
        var item = employeeLevels[i];
        if(item.dutyId==dutyId){
          return item.name;
        }
      }
      return "";
    },
    setDate: function (start, end, dontTriggerChange) {
      var s = start,
        e = end;
      if (!end) {
        if (start.length == 7 && this.opt.datePickerType == 'ym') {
          startArr = start.split('/')
          start = new Date(startArr[0], startArr[1] - 1);
        }else if (start.length == 7) {
          // 月
          s = new Date(start + '/01');
          e = new Date(start + '/01');
          e.setMonth(s.getMonth() + 1);
          e.setDate(e.getDate() - 1);
        } else {
          // 日
          s = new Date(start);
          e = new Date(start);
        }
      }

      if (this.opt.datePickerType == 'ymd') {
        this.$datePicker.mobiscroll('setVal', [s, e]);
      } else if (this.opt.datePickerType == 'ym' ) {
        var ntime = new Date(start.getFullYear() + '/' + (start.getMonth() + 1) + '/01');
        this.$datePicker.mobiscroll('setVal', ntime);
      }else if(this.opt.datePickerType == 'single'){
        this.$datePicker.mobiscroll('setVal', new Date(start));
      }
      this.renderDate(dontTriggerChange);
    },
    renderDate: function (dontTriggerChange) {
      var $datePicker = this.$datePicker;
      var range = this.getDate();
      if (this.opt.datePickerType == 'ymd') {
        $datePicker.find('.startDate > .year').text(range[0].format('yyyy'));
        $datePicker.find('.startDate > .day').text(range[0].format('mm/dd'));
        $datePicker.find('.endDate > .year').text(range[1].format('yyyy'));
        $datePicker.find('.endDate > .day').text(range[1].format('mm/dd'));
        $datePicker.find('.startDate').show();
        $datePicker.find('.endDate').show();
        $datePicker.find('.to').show();
        $datePicker.find('.singleDate ').hide();
      } else if (this.opt.datePickerType == 'ym') {
        $datePicker.find('.startDate').hide();
        $datePicker.find('.endDate ').hide();
        $datePicker.find('.to').hide();
        $datePicker.find('.singleDate > .year').text(range.format('yyyy'));
        $datePicker.find('.singleDate > .day').text(range.format('mm'));
      } else if (this.opt.datePickerType == 'single') {
        $datePicker.find('.startDate').hide();
        $datePicker.find('.endDate ').hide();
        $datePicker.find('.to').hide();
        $datePicker.find('.singleDate > .year').text(range.format('yyyy'));
        $datePicker.find('.singleDate > .day').text(range.format('mm/dd'));
        $datePicker.find('.singleDate ').show();
      }
      if (!dontTriggerChange) {
        this.opt.onchange && this.opt.onchange();
      }
    },
    getDate: function () {
      return this.$datePicker.mobiscroll('getVal');
    },
    renderShortcut: function () {
      var htmlSample = '<li class="am-clickable"><div class="line1"></div><div class="line2"></div></li>';
      var now = amGloble.now();
      // 本月第一天
      var now1 = amGloble.now().setDate(1);
      var count = 12,
        year = now.getFullYear(),
        month = now.getMonth(),
        day = now.getDate();

      if (amGloble.metadata.userInfo.newRole == 1 || this.opt.datePickerType == 'single') {
        // 操作员则不显示月
        this.$shortcutMonth.hide();
      } else if (this.opt.datePickerType == 'ym') {
        // this.$shortcutMonth.hide();
        // render月
        this.$shortcutMonth.show();
        var $m = this.$shortcutMonth.children('ul').empty();
        for (var i = 0; i < count; i++) {
          var newDate = new Date(now1);
          newDate.setMonth(month - i);
          // console.log(newDate, month - i);
          var $li = $(htmlSample);
          $li.attr('data-date', newDate.format('yyyy/mm'));

          switch (i) {
            case 0:
              $li.find('.line1').text(newDate.format('yyyy.m'));
              $li.find('.line2').text(newDate.format('本月'));
              break;
            case 1:
              $li.find('.line1').text(newDate.format('yyyy.m'));
              $li.find('.line2').text(newDate.format('上月'));
              break;
            default:
              $li.find('.line1').text(newDate.format('yyyy'));
              $li.find('.line2').text(newDate.format('m月'));
          }
          $m.append($li);
        }
        return;
      } else {
        // render月
        this.$shortcutMonth.show();
        var $m = this.$shortcutMonth.children('ul').empty();
        for (var i = 0; i < count; i++) {
          var newDate = new Date(now1);
          newDate.setMonth(month - i);
          // console.log(newDate, month - i);
          var $li = $(htmlSample);
          $li.attr('data-date', newDate.format('yyyy/mm'));

          switch (i) {
            case 0:
              $li.find('.line1').text(newDate.format('yyyy.m'));
              $li.find('.line2').text(newDate.format('本月'));
              break;
            case 1:
              $li.find('.line1').text(newDate.format('yyyy.m'));
              $li.find('.line2').text(newDate.format('上月'));
              break;
            default:
              $li.find('.line1').text(newDate.format('yyyy'));
              $li.find('.line2').text(newDate.format('m月'));
          }
          $m.append($li);
        }
      }

      // render日
      var number = amGloble.metadata.userInfo.newRole == 1 ? 2 : count;
      var $d = this.$shortcutDay.children('ul').empty();
      for (var i = 0; i < number; i++) {
        var newDate = new Date(amGloble.now().setDate(day - i));
        var $li = $(htmlSample);
        $li.attr('data-date', newDate.format('yyyy/mm/dd'));
        switch (i) {
          case 0:
            $li.find('.line1').text(newDate.format('m月dd'));
            $li.find('.line2').text(newDate.format('今天'));
            break;
          case 1:
            $li.find('.line1').text(newDate.format('m月dd'));
            $li.find('.line2').text(newDate.format('昨天'));
            break;
          case 2:
            $li.find('.line1').text(newDate.format('m月dd'));
            $li.find('.line2').text(newDate.format('前天'));
            break;
          default:
            $li.find('.line1').text(newDate.format('m月'));
            $li.find('.line2').text(newDate.format('dd日'));
        }
        $d.append($li);
      }
    },
    renderFilter: function () {
      if (this.opt.disableFilter) {
        this.$.hide();
      } else {
        this.$.show();
      }
    },
    renderDept: function () {
      if (this.opt.enableDept) {
        this.$deptBtn.show();
      } else {
        this.$deptBtn.hide();
      }
    },
    renderShop: function () {
      if (this.opt.enableShop) {
        if (shops.length > 0 && !this.getShop()) {
          this.setShop(shops[0], true);
        }
        this.$shopBtn.show();
      } else {
        this.$shopBtn.hide();
      }
    },
    renderEmp: function () {
      if (this.opt.enableEmp) {
        this.$empBtn.show();
      } else {
        this.$empBtn.hide();
      }
    },
    renderLevel: function () {
      if (this.opt.enableLevel) {
        this.$levelBtn.show();
      } else {
        this.$levelBtn.hide();
      }
    },
    renderCategory: function () {
      if (this.opt.enableCategory) {
        this.$categoryBtn.show();
      } else {
        this.$categoryBtn.hide();
      }
    },
    renderSelectTime: function () {
      if (this.opt.selectTime) {
        this.$timeBtn.show();
      } else {
        this.$timeBtn.hide();
      }
    },
    renderCategory: function () {
      if (this.opt.enableCategory) {
        this.$categoryBtn.show();
      } else {
        this.$categoryBtn.hide();
      }
    },
    setDept: function (dept, dontTriggerChange) {
      this.$deptBtn.html(dept.name).data('data', dept);
      if (!dontTriggerChange) {
        this.opt.onchange && this.opt.onchange();
      }
    },
    getDept: function () {
      return this.$deptBtn.data('data');
    },
    setEmp: function (emp, dontTriggerChange) {
      this.$empBtn.html(emp.name).data('data', emp);
      if (!dontTriggerChange) {
        this.opt.onchange && this.opt.onchange();
      }
    },
    getEmp: function () {
      return this.$empBtn.data('data');
    },
    setShop: function (shop, dontTriggerChange) {
      this.$shopBtn.html(shop.name).data('data', shop);
      amGloble.storeSelect.setCurrentShops(shop);
      if (!dontTriggerChange) {
        if (this.opt && this.opt.enableEmp) {
          this.$empBtn.html('').data('data', null);
          this.getEmps();
        }
        this.opt.onchange && this.opt.onchange();
      }
    },
    getShop: function () {
      if (!this.$shopBtn.data('data')) {
        return amGloble.storeSelect.getCurrentShops();
      }
      return this.$shopBtn.data('data');
    },
    setLevel: function (level, dontTriggerChange) {
      this.$levelBtn.html(level.name).data('data', level);
      if (!dontTriggerChange) {
        this.opt.onchange && this.opt.onchange();
      }
    },
    getLevel: function () {
      return this.$levelBtn.data('data');
    },
    setCategory: function (category, categorychange) {
      this.$categoryBtn.html(category.name).data('data', category);
      if (!categorychange) {
        this.opt.onchange && this.opt.onchange();
      }
    },
    getCategory: function () {
      return this.$categoryBtn.data('data');
    },
    setTimeArr: function (time, timechange) {
      this.$timeBtn.html(time.name).data('data', time);
      if (!timechange) {
        this.opt.onchange && this.opt.onchange();
      }
    },
    getTimeArr: function () {
      return this.$timeBtn.data('data');
    },
    getValue: function () {
      return {
        range: this.getDate(),
        dept: this.getDept(),
        level: this.getLevel(),
        category: this.getCategory(),
        time: this.getTimeArr()
      };
    },
    showShortcut: function () {
      this.$leftBtn.addClass('selected');
      this.$shortcut.slideDown(100);
      this.shortcutMonth.refresh();
      this.shortcutDay.refresh();
    },
    hideShortcut: function () {
      this.$leftBtn.removeClass('selected');
      this.$shortcut.slideUp(100);
    }
  };

  amGloble.ReportFilter = ReportFilter;
});

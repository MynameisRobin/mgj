"use strict";

amGloble.page.setShopGoal = new $.am.Page({
  id: "page-setShopGoal",
  backButtonOnclick: function backButtonOnclick() {
    // $.am.changePage(amGloble.page.shopGoal, "slidedown", 'back');
    $.am.page.back("slidedown");
  },
  init: function init() {
    var self = this;
    this.$wrap = this.$.find('.am-body-wrap').on('vclick', '.emps_switch', function () {
      //员工切换
      amGloble.popupMenu("请选择员工", shops, function (ret) {
        //重新渲染
      });
    }).on("vclick", ".save_btn", function () {
      if (!$(this).hasClass("disabled")) {
        self.submitData();
      }
    });
    this.itemListScroll = new $.am.ScrollView({
      $wrap: this.$.find(".goal_list"),
      $inner: this.$.find(".goal_list ul"),
      direction: [0, 1]
    });
    this.$menu = this.$.find(".goal_appraise ul").on("vclick", "li", function () {
      var box = self.findIBox($(this).data("data"));
      if ($(this).hasClass("selected")&&$(this).siblings().hasClass("selected")) {
        $(this).removeClass("selected");
        if (box) {
          box.hide();
        }
      } else {
        if (box) {
          box.show();
        }
        $(this).addClass("selected");
      }
      self.itemListScroll.refresh();
      self.checkBtn();
    });
    this.$mli = this.$menu.find("li").clone();
    this.$menu.find("li").remove();
    this.$glist = this.$.find(".goal_list ul");
    this.$gli = this.$glist.find("li").clone();
    this.$glist.find("li").remove();
  },
  beforeShow: function beforeShow(para) {
    if (para && para.time) {
      this.$year = para.time.split("/")[0];
      this.$month = para.time.split("/")[1];
      this.$header.find(".title").text(this.$year + "年" + this.$month + "月门店目标设定");
      this.targets = para.targets;
      this.targetTypes = para.targetTypes;
      this.id = para.id;
      this.shopId = para.shop.shopId;
      this.defaultArr = [{
        name: '现金业绩',
        type: 1,
        icon: 'icon-zhanghuyue'
      }, {
        name: '劳动业绩',
        type: 2,
        icon: 'icon-meihua'
      }];
      this.renderInputBox(this.defaultArr);
      this.renderMenu(this.defaultArr);
      this.setDefaultVal();
      this.checkBtn();
    }
  },
  afterShow: function afterShow() {
    this.itemListScroll.refresh();
  },
  beforeHide: function beforeHide() { },
  afterHide: function afterHide() { },
  submitData: function submitData() {
    var self = this;
    var params = {
      id: this.id,
      shopId: this.shopId,
      targetYear: this.$year,
      targetMonth: this.$month
    };
    var inputBoxs = this.$glist.find("li:not(:hidden)");
    var targetTypes = "";
    for (var index = 0; index < inputBoxs.length; index++) {
      var ele = inputBoxs[index];
      var inputs = $(ele).find("input");
      var type = $(ele).data("type");
      if (type == 1) {
        params.cashAchiTarget = inputs.val();
      } else if (type == 2) {
        params.workAchiTarget = inputs.val();
      }
      targetTypes += "," + type;
    }
    if (targetTypes != '') {
      targetTypes += ",";
    }
    params.targetTypes = targetTypes;
    params.operatorId = amGloble.metadata.userInfo.userId;
    self.setStatus("loading");
    amGloble.api.saveShopTarget.exec(params, function (ret) {
      if (ret.code == 0) {
        amGloble.msg("目标设置成功！");
        // $.am.changePage(amGloble.page.shopGoal, "slidedown", 'change');
        $.am.page.back("slidedown", 'change');
      } else {
        amGloble.msg("数据加载失败,点击重试!");
      }
      self.setStatus("normal");
    });
  },
  setDefaultVal: function setDefaultVal() {
    var self = this;
    if (this.id) {
      var inputBoxs = this.$glist.find("li");
      for (var index = 0; index < inputBoxs.length; index++) {
        var ele = inputBoxs[index];
        var inputs = $(ele).find("input");
        var target = this.findTarget($(ele).data("type"));
        inputs.val(target.target);
        if(self.targetTypes.indexOf(","+$(ele).data("type")) == -1){   
          var lis = self.$menu.find("li");
          for (var i = 0; i < lis.length; i++) {
            var item = lis[i];
            if ($(ele).data("type") == $(item).data("data")) {
              $(item).removeClass("selected");
            }
          }
          $(ele).hide();
        }
      }
    }
  },
  checkBtn: function checkBtn() {
    var inputBoxs = this.$glist.find("li:not(:hidden)");
    var flag = inputBoxs.length > 0 && true;
    for (var index = 0; index < inputBoxs.length; index++) {
      var ele = inputBoxs[index];
      var inputs = $(ele).find("input");
      if (!inputs.val() || parseFloat(inputs.val()) == 0) {
        flag = false;
      }
    }
    if (!flag) {
      this.$.find(".save_btn").addClass("disabled");
    } else {
      this.$.find(".save_btn").removeClass("disabled");
    }
  },
  findIBox: function findIBox(type) {
    var inputBoxs = this.$glist.find("li");
    for (var index = 0; index < inputBoxs.length; index++) {
      var ele = inputBoxs[index];
      if ($(ele).data('type') == type) {
        return $(ele);
      }
    }
    return null;
  },
  renderMenu: function renderMenu(arr) {
    this.$menu.html('');
    for (var index = 0; index < arr.length; index++) {
      var item = arr[index];
      var li = this.$mli.clone();
      li.find(".text").text(item.name);
      li.data("data", item.type);
      this.$menu.append(li);
    }
  },
  findTarget: function findTarget(type) {
    for (var index = 0; index < this.targets.length; index++) {
      var element = this.targets[index];
      if (element.type == type) {
        return element;
      }
    }
    return {};
  },
  /**
   * p1 实际业绩
   * p2 目标
   */
  calPercentArr: function calPercentArr(p1, p2) {
    var resultArr = [];
    if (p1 > p2) {
      resultArr.push((p2 / p1 * 100).toFixed(0));
      resultArr.push(100);
    } else {
      resultArr.push(100);
      resultArr.push((p1 / p2 * 100).toFixed(0));
    }
    return resultArr;
  },

  renderInputBox: function renderInputBox(arr) {
    var _this = this;

    var self = this;
    this.$glist.html('');

    var _loop = function _loop() {
      item = arr[index];
      li = _this.$gli.clone();
      li.find(".tit_text").text(item.name).end().find(".tit_icon.icon").addClass(item.icon).end();
      var renderChart = function renderChart(charBox,Target){
        for (i = 0; i < charBox.length; i++) {
          percent = 0;
          lastTarget = 0;
          target = Target.target;
          if (i != 0) {
            percent = Target.lastYearAchi;
            lastTarget = Target.lastYearTarget;
          } else {
            percent = Target.lastMonthAchi;
            lastTarget = Target.lastMonthTarget;
          }
          if (!percent) {
            percent = 0;
          }
          if (!lastTarget) {
            lastTarget = 0;
          }
          if (i == 0) {
            li.find(".preMonth .target_num").text(percent + "/" + lastTarget);
            if (lastTarget != 0) {
              li.find(".preMonth .completion_num").text((percent / lastTarget * 100).toFixed(0) + "%");
            } else {
              li.find(".preMonth .tip_rt").hide();
            }
          } else {
            li.find(".preYear .target_num").text(percent + "/" + lastTarget);
            if (lastTarget != 0) {
              li.find(".preYear .completion_num").text((percent / lastTarget * 100).toFixed(0) + "%");
            } else {
              li.find(".preYear .tip_rt").hide();
            }
          }
          if (lastTarget == 0 && percent == 0) {
            if (i == 0) {
              li.find(".preMonth").hide();
            } else {
              li.find(".preYear").hide();
            }
          }
          if (lastTarget != null) {
            rarr = _this.calPercentArr(percent, lastTarget);
            element = charBox[i];
            chart = new ChartBar({
              target: $(element).find("div"),
              datasets: [{
                percent1: rarr[0],
                percent2: rarr[1],
                thin: true,
                bgcolor: "#EEEEEE",
                color0: "#EEEEEE",
                color1: "#F2A957",
                color2: "#F2A957",
                color3: "#34D57E",
                color4: "#23C16C"
              }]
            });
            chart.animation();
            $(element).chart = chart;
          }
          li.find(".cur_comparison label").hide();
          li.find(".compare_mon").hide();
          li.find(".compare_year").hide();
        }
      }
      Target = _this.findTarget(item.type);
      renderChart(li.find(".line_status"),Target);
      li.data("target", Target);
      li.data("type", item.type);
      li.find("input").data("type", item.type);
      if(item.type==1){
        li.addClass("labourPerf")
      }else{
        li.addClass("cashPerf")
      }
      function calVariety(pli, ival) {
        var target = pli.data("target");
        // renderChart(pli.find(".line_status"),_this.findTarget(pli.data("type")));
        var flag = false;
        if (target && target.lastMonthTarget) {
          if (ival) {
            var dif = ival - target.lastMonthTarget;
            var pv = Math.abs((dif / target.lastMonthTarget * 100).toFixed(1));
            pli.find(".compare_mon .verbal").removeClass("green");
            pli.find(".compare_mon .verbal").removeClass("red");
            pli.find(".compare_mon .verbal").addClass(dif >= 0 ? "green" : "red");
            pli.find(".compare_mon .verbal").text((dif >= 0 ? "增长" : "下降") + pv + "%");
            flag = true;
            pli.find(".compare_mon").show();
          } else {
            pli.find(".compare_mon").hide();
          }
        }
        if (target && target.lastYearTarget) {
          pli.find(".compare_year").show();
          if (ival) {
            var dif = ival - target.lastYearTarget;
            var pv = Math.abs((dif / target.lastYearTarget * 100).toFixed(1));
            pli.find(".compare_year .verbal").removeClass("green");
            pli.find(".compare_year .verbal").removeClass("red");
            pli.find(".compare_year .verbal").addClass(dif >= 0 ? "green" : "red");
            pli.find(".compare_year .verbal").text((dif >= 0 ? "增长" : "下降") + pv + "%");
            flag = true;
          } else {
            pli.find(".compare_year").hide();
          }
        }
        if (flag) {
          pli.find(".cur_comparison label").show();
        } else {
          pli.find(".cur_comparison label").hide();
        }
      }
      li.find("input").change(function () {
        calVariety($(this).closest("li"), $(this).val());
        self.checkBtn();
      });
      calVariety(li, Target.target);
      _this.$glist.append(li);
    };

    for (var index = 0; index < arr.length; index++) {
      var item;
      var li;
      var charBox;
      var Target;
      var i;
      var percent;
      var lastTarget;
      var target;
      var rarr;
      var element;
      var chart;

      _loop();
    }
  },
  render: function render(data) { }
});
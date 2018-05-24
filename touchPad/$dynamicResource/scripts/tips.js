(function() {
    var Tip = function(opt) {
        var $cvs = $('<canvas width="' + window.innerWidth + '" height="' + window.innerHeight + '"></canvas>'),
            self = this;
        $cvs.css({
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        });

        var canvas = $cvs[0];
        this.ctx = canvas.getContext("2d");

        this.render(opt.rects.shift());

        $cvs.vclick(function() {
            if (opt.rects.length) {
                self.render(opt.rects.shift());
            } else {
                $(this).remove();
            }
        });
        $("body").append($cvs);
    };
    Tip.prototype = {
        render: function(pos) {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.clearRect(pos.left, pos.top, pos.width, pos.height);
            ctx.font = pos.font || "20px Verdana";
            ctx.fillStyle = "#FFFFFF";
            var txtSize = ctx.measureText(pos.text);
            ctx.fillText(pos.text, pos.left + pos.offset.left, pos.top + pos.offset.top);

            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pos.left + pos.width / 2, pos.top - 2);
            ctx.quadraticCurveTo(
                pos.left + pos.width / 2 - 5,
                pos.top + pos.offset.top / 2,
                pos.left + pos.width / 2 - 30,
                pos.top + pos.offset.top / 2
            );
            ctx.quadraticCurveTo(
                pos.left + pos.offset.left - 20,
                pos.top + pos.offset.top / 2 + 5,
                pos.left + pos.offset.left - 20,
                pos.top + pos.offset.top - 10
            );
            ctx.quadraticCurveTo(
                pos.left + pos.offset.left - 20,
                pos.top + pos.offset.top - 45,
                pos.left + pos.width / 2,
                pos.top + pos.offset.top - 40
            );

            ctx.quadraticCurveTo(
                pos.left + pos.offset.left + txtSize.width + 20,
                pos.top + pos.offset.top - 40,
                pos.left + pos.offset.left + txtSize.width + 20,
                pos.top + pos.offset.top - 10
            );
            ctx.quadraticCurveTo(
                pos.left + pos.offset.left + txtSize.width + 20,
                pos.top + pos.offset.top / 2,
                pos.left + pos.width / 2 + 10,
                pos.top + pos.offset.top / 2
            );
            ctx.quadraticCurveTo(pos.left + pos.width / 2 - 5, pos.top + pos.offset.top / 2, pos.left + pos.width / 2, pos.top - 2);
            ctx.strokeStyle = "#FFFFFF";
            ctx.stroke();
        }
    };

    var workOrderTip = function(opt) {
        var $cvs = $('<canvas width="' + window.innerWidth + '" height="' + window.innerHeight + '"></canvas>'),
            self = this;
        $cvs.css({
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        });

        var canvas = $cvs[0];
        this.ctx = canvas.getContext("2d");

        this.render(opt.rects.shift());

        $cvs.vclick(function() {
            if (opt.rects.length) {
                self.render(opt.rects.shift());
            } else {
                $(this).remove();
            }
        });
        $("body").append($cvs);
    };
    workOrderTip.prototype = {
        render: function(pos) {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.clearRect(pos.left, pos.top, pos.width, pos.height);
            ctx.font = pos.font || "20px Verdana";
            ctx.fillStyle = "#FFFFFF";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pos.left + pos.width / 2, pos.top - 2);
            //画一个空心圆
            var imgObj = new Image();
            imgObj.src = "$dynamicResource/images/workTip.png";
            //待图片加载完后，将其显示在canvas上
            imgObj.onload = function(){ //onload必须使用
                ctx.drawImage(this, pos.left + pos.offset.left - 40, pos.top + pos.offset.top - 40, 200, 145);
            }
            ctx.stroke();
        }
    };

    am.tips = {
        workOrder: function($target) {
            if (localStorage.getItem("am.tips.workOrder")) {
                return;
            }
            localStorage.setItem("am.tips.workOrder", 1);
            var offset = $target.offset();
            new workOrderTip({
                rects: [
                    {
                        left: offset.left,
                        top: offset.top,
                        width: $target.outerWidth(),
                        height: $target.outerHeight(),
                        text: "新增工单入口遇到问题，可找在线客服咨询",
                        font: "18px Verdana",
                        offset: {
                            top: 60,
                            left: 80
                        }
                    }
                ]
            });
        },
        specified: function($target, i) {
            if (localStorage.getItem("am.tips.specified")) {
                return;
            }
            localStorage.setItem("am.tips.specified", 1);

            var $pos = am.page.service.billMain.$list.find("tr.selected td.pos" + i);
            var offset = $target.offset();
            var poffset = $pos.offset();

            if (!offset || !poffset) {
                return;
            }
            var tip = new Tip({
                rects: [
                    {
                        left: offset.left,
                        top: offset.top,
                        width: $target.outerWidth(),
                        height: $target.outerHeight(),
                        text: "再次点击设置员工状态为:指定",
                        font: "24px Verdana",
                        offset: {
                            top: -50,
                            left: -200
                        }
                    },
                    {
                        left: poffset.left,
                        top: poffset.top,
                        width: $pos.outerWidth(),
                        height: $pos.outerHeight(),
                        text: "点击这里也可以改变员工的指定状态",
                        font: "24px Verdana",
                        offset: {
                            top: -50,
                            left: -100
                        }
                    }
                ]
            });
        },
        perfSetting: function($target) {
            if (localStorage.getItem("am.tips.perfSetting")) {
                return;
            }
            localStorage.setItem("am.tips.perfSetting", 1);
            var offset = $target.offset();
            new Tip({
                rects: [
                    {
                        left: offset.left,
                        top: offset.top,
                        width: $target.outerWidth(),
                        height: $target.outerHeight(),
                        text: "左右滑动可调整业绩分配比例",
                        font: "24px Verdana",
                        offset: {
                            top: -50,
                            left: -100
                        }
                    }
                ]
            });
        },
        details: function($target1, $target2) {
            if (localStorage.getItem("am.tips.details")) {
                return;
            }
            localStorage.setItem("am.tips.details", 1);

            var offset1 = $target1.offset();
            var offset2 = $target2.offset();

            if (!offset1 || !offset2) {
                return;
            }

            var tip2 = new Tip({
                rects: [
                    {
                        left: offset1.left,
                        top: offset1.top,
                        width: $target1.outerWidth(),
                        height: $target1.outerHeight(),
                        text: "点击这里可以查看会员卡资料",
                        font: "24px Verdana",
                        offset: {
                            top: -50,
                            left: -50
                        }
                    },
                    {
                        left: offset2.left,
                        top: offset2.top,
                        width: $target2.outerWidth(),
                        height: $target2.outerHeight(),
                        text: "点击这里可以查看顾客资料",
                        font: "24px Verdana",
                        offset: {
                            top: -50,
                            left: -50
                        }
                    }
                ]
            });
        },
        unlimitComboItem: function($target) {
            if (localStorage.getItem("am.tips.unlimitComboItem")) {
                return;
            }
            localStorage.setItem("am.tips.unlimitComboItem", 1);
            var offset = $target.offset();
            new Tip({
                rects: [
                    {
                        left: offset.left,
                        top: offset.top,
                        width: $target.outerWidth(),
                        height: $target.outerHeight(),
                        text: "在此向上滑动将套餐次数切换为不限次",
                        font: "24px Verdana",
                        offset: {
                            top: -50,
                            left: -100
                        }
                    }
                ]
            });
        }
    };
    am.Tip = Tip;
})();

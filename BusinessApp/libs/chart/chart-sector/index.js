/**
 * SectorChart.js
 * @description  扇形图形组件
 * @version	0.1
 * @author	zhangzhi@reeli.cn
 *
 */
(function (global) {
    var _isObject = function (o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    }

    var _extend = function self(destination, source) {
        var property;
        for (property in destination) {
            if (destination.hasOwnProperty(property)) {

                // 若destination[property]和sourc[property]都是对象，则递归
                if (_isObject(destination[property]) && _isObject(source[property])) {
                    self(destination[property], source[property])
                }

                // 若sourc[property]已存在，则跳过
                if (source.hasOwnProperty(property)) {
                    continue
                } else {
                    source[property] = destination[property]
                }
            }
        }
    }

    var extend = function () {
        var arr = arguments,
            result = {},
            i

        if (!arr.length) return {}

        for (i = arr.length - 1; i >= 0; i--) {
            if (_isObject(arr[i])) {
                _extend(arr[i], result)
            };
        }

        arr[0] = result
        return result
    }

    global.extend = extend
})(window);
(function (global) {
    function formatMoney(number, places, symbol, thousand, decimal) {
        number = number || 0;
        places = !isNaN(places = Math.abs(places)) ? places : 2;
        symbol = symbol !== undefined ? symbol : "$";
        thousand = thousand || ",";
        decimal = decimal || ".";
        var negative = number < 0 ? "-" : "",
            i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
        return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
    }

    //扇形
    CanvasRenderingContext2D.prototype.sector = function (x, y, radius, sDeg, eDeg) {
        // 初始保存
        this.save();
        // 位移到目标点
        this.translate(x, y);
        this.beginPath();
        // 画出圆弧
        this.arc(0, 0, radius, sDeg, eDeg);
        // 再次保存以备旋转
        this.save();
        // 旋转至起始角度
        this.rotate(eDeg);
        // 移动到终点，准备连接终点与圆心
        this.moveTo(radius, 0);
        // 连接到圆心
        this.lineTo(0, 0);
        // 还原
        this.restore();
        // 旋转至起点角度
        this.rotate(sDeg);
        // 从圆心连接到起点
        this.lineTo(radius, 0);
        this.closePath();
        // 还原到最初保存的状态
        this.restore();
        return this;
    }
    var SectorBar = function (opt) {
        this.init(opt);
        return this;
    };
    var propertype = SectorBar.prototype;
    //默认配置
    propertype._opt = {
        target: null,
        autoAnimate: true,
        config: {
            exbgColor: "#395698", // 外部
            interbgColor: "#213F83", //内部颜色
            coverColor: "#869CCD",
        },
        total: 100, //总共
        percent: 0, // 当前已暂用,
        title: '扇形图示例',
        titleColor: '#8CA4DB',
        valueColor: '#8CA4DB',
        width: 200,
        height: 200,
    }


    //初始化方法
    propertype.init = function (opt) {
        this._opt = extend(this._opt, opt);
        if (this._opt.target) {
            this.render();
        }
    }
    //设置opt
    propertype.setOpt = function (opt) {
        this._opt = extend(this._opt, opt);
    }
    propertype.render = function () {
        var container,
            width = this._opt.width,
            height = this._opt.height,
            w = this._opt.width * 0.7;
        if (typeof this._opt.target == 'string') {
            this._opt.target = this._opt.target.replace("#", "");
            container = document.getElementById(this._opt.target);
        } else if (typeof this._opt.target == 'object') {
            container = this._opt.target;
        } else {
            console.error("target error!")
        }

        container.style.width = this._opt.width + "px";
        container.style.height = this._opt.height + "px";
        container.style.textAlign = "center";
        container.style.fontSize = "10px";
        container.style.position = "relative";
        var innerDiv = document.createElement('div'),
            canvas = document.createElement('canvas'),
            ptitle = document.createElement('p'),
            pvalue = document.createElement('p'),
            zbtxt = document.createElement('span');
        this.ctx = ctx = canvas.getContext('2d');
        innerDiv.style.width = w + "px";
        innerDiv.style.height = w + "px";
        innerDiv.style.margin = "0 auto";
        innerDiv.appendChild(canvas);
        container.innerHTML = "";
        container.appendChild(innerDiv);
        //提示文字
        ptitle.style.marginTop = 2 + "px";
        pvalue.style.marginTop = 10 + "px";
        ptitle.style.textAlign = "center";
        pvalue.style.textAlign = "center";
        ptitle.style.color = this._opt.titleColor;
        pvalue.style.color = this._opt.valueColor;
        ptitle.innerText = this._opt.title;
        pvalue.innerText = formatMoney(this._opt.total, 0, "");
        zbtxt.style.color = this._opt.valueColor;
        container.appendChild(pvalue);
        container.appendChild(ptitle);
        //占比文字
        zbtxt.innerText = "占比" + (this._opt.percent / this._opt.total * 100).toFixed(0) + "%";
        zbtxt.style.position = "absolute";
        if (this._opt.percent / this._opt.total < 0.25) {
            zbtxt.style.top = -20 + 'px';
            zbtxt.style.left = width / 2 + w / 2 - 10 + "px";
        } else if (this._opt.percent / this._opt.total < 0.5 && this._opt.percent / this._opt.total > 0.25) {
            zbtxt.style.top = w-10  + "px";
            zbtxt.style.left = width / 2 + w / 2 - 15 + "px";
        } else if (this._opt.percent / this._opt.total < 0.75 && this._opt.percent / this._opt.total > 0.5) {
            zbtxt.style.top = w - 5 + "px";
            zbtxt.style.left = -15 + "px";
        } else {
            zbtxt.style.top = -15 + "px";
            zbtxt.style.left = -10+ "px";
        }
        container.appendChild(zbtxt);
        this.drawBg(ctx, w);
    }
    propertype.do = function (flag) {
        var w = this._opt.width * 0.7;
        function ease(x) {
            return Math.sqrt(1 - Math.pow(x - 1, 2));
        }
        if (flag) {
            var self = this;
            var beginTime = new Date();
            var pv=this._opt.percent / this._opt.total;
            pv=pv>1?1:pv
            var dv = pv * 360;
            var time = 1200;
            var current = 0;
            var tickID;
            var toTick = function () {
                var dt = new Date() - beginTime;
                if (dt >= time) {
                    return;
                }
                self.ctx.clearRect(0, 0, w, w);
                self.drawBg(self.ctx, w);
                current = dv * ease(dt / time);
                self.drawCover(self.ctx, w, -90, current - 90);
                requestAnimationFrame(toTick);
                //cancelAnimationFrame必须在 tickID = requestAnimationFrame(toTick);的后面
            };
            toTick();
        } else {
            var pv=this._opt.percent / this._opt.total;
            pv=pv>1?1:pv
            this.drawCover(this.ctx, w, -90, pv * 360 - 90);
        }
    }
    //画扇形图 背景
    propertype.drawBg = function (ctx, w) {
        ctx.clearRect(0, 0, w, w);
        ctx.beginPath();
        ctx.arc(w / 2, w / 2, w / 2, 0, Math.PI * 1 * 2, true);
        ctx.fillStyle = this._opt.config.exbgColor;
        ctx.fill();
        //画内圆
        ctx.beginPath();
        ctx.arc(w / 2, w / 2, w / 2 * 0.75, 0, Math.PI * 1 * 2, true);
        ctx.fillStyle = this._opt.config.interbgColor;
        ctx.fill();
    }

    //画覆盖区
    propertype.drawCover = function (ctx, w, sdeg, edeg) {
        //画百分比
        var deg = Math.PI / 180;
        ctx.sector(w / 2, w / 2, w / 2, sdeg * deg, edeg * deg, false);
        ctx.fillStyle = this._opt.config.coverColor;
        ctx.fill();
    }

    global.SectorBar = SectorBar;
})(window)








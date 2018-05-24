"use strict";

var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"? function(obj) {return typeof obj;}:function(obj) {return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype? "symbol":typeof obj;};

(function() {
	/**
  * ChartBar.js
  * @description  条状图形组件
  * @version		0.1
  * @author		zhaowen@reeli.cn
  *
  */
	var ChartBar=function ChartBar(opt) {
		this.init(opt);
		return this;
	};
	ChartBar.prototype={
		_opt: {
			target: "", // 渲染目标，jquery选择器
			autoAnimate: false, // 自动播放动画
			vertical: false, // 垂直图形
			config: {
				bgcolor: "", // 条状图背景色
				color0: "#e4e4e4", // 一级颜色 目标底色
				color1: "#f6673f", // 二级颜色 目标未达标
				color2: "#ffca44", // 三级颜色 目标未达标且超过阈值
				color3: "#2bce76", // 四级颜色 目标已达标 
				color4: "#34d57e", // 五级颜色 超出目标
				threshold: 25 // 二三级颜色阈值
			},
			datasets: [{
				tiptext: "",
				text1: "", // 左侧label
				text2: "", // 右侧label
				bgcolor: "",
				color0: "", // 一级颜色 
				color1: "", // 二级颜色
				color2: "", // 三级颜色
				color3: "", // 四级颜色
				color4: "", // 五级颜色
				single: false, // 单条
				bigger: false, // 更宽的bar，仅在vertical=true时生效
				threshold: 25, // 二三级颜色阈值
				// percent1: null, // 一级百分比，纯数字 目标值
				// percent2: null, // 二级百分比，纯数字 当前值
				thin: false
			}]
		},
		_template: {
			container: '<div class="chart-container"></div>',
			bar: '<div class="chart-wrapper"><div class="text hide tiptext"></div><div class="text left"></div><div class="text right"></div><div class="internal_box"><div class="percent-bar"></div><div class="percent-bar"></div></div></div>'
		},
		_chart: null,
		animationState: 0,
		/**
   * 初始化
   */
		init: function init(opt) {
			this._opt=$.extend(true,{},this._opt,opt);
			if(this._opt.target) {
				this.animationState=0;
				this.render();
			}
		},
		setOpt: function setOpt(opt) {
			this._opt=$.extend(true,{},this._opt,opt);
		},
		/**
   * 渲染
   */
		render: function render() {
			if(this._opt.datasets&&this._opt.datasets.length) {
				this._chart=$(this._template.container);
				if(this._opt.vertical) {
					this._chart.addClass("vertical");
				}
				for(var i=0;i<this._opt.datasets.length;i++) {
					var dataset=this._opt.datasets[i];
					var $wrapper=$(this._template.bar);

					$wrapper.css({
						background: dataset.bgcolor||this._opt.config.bgcolor
					}).data('dataset',dataset);

					if(dataset.bigger) {
						$wrapper.addClass("bigger");
					} else if(dataset.thin) {
						$wrapper.addClass("thin");
					}

					if(this._opt.vertical&&i==2) {
						$wrapper.height("80%");
					}

					var pb1=$wrapper.find(".percent-bar:eq(0)");
					var pb2=$wrapper.find(".percent-bar:eq(1)");
					var text1=dataset.text1;
					var text2=dataset.text2;
					var tiptext=dataset.tiptext;
					var percent1=dataset.percent1>100?100:dataset.percent1;
					var percent2=dataset.percent2>100?100:dataset.percent2;

					if(text1) {
						$wrapper.find(".text.left").text(text1);
					}
					if(text2) {
						$wrapper.find(".text.right").html(text2);
					}

					if(tiptext) {
						$wrapper.find(".text.tiptext").html(tiptext).css({
							left: percent1+(percent2-percent1)/2-8+'%'
						});
					} else {
						$wrapper.find(".text.tiptext").hide();
					}
					if(typeof percent1!='undefined'&&typeof percent2!='undefined') {
						pb1.data("percent",percent1).css({
							"z-index": 0
						});

						pb2.data("percent",percent2).css({
							"z-index": 0,
							background: dataset.color0||this._opt.config.color0
						});

						if(percent2>=percent1) {
							pb1.css({
								background: dataset.color3||this._opt.config.color3,
								"z-index": 1
							});
							pb2.data("background",dataset.color4||this._opt.config.color4);
						} else {
							pb1.css({
								background: dataset.color0||this._opt.config.color0
							});
							if(percent2<(dataset.threshold||this._opt.config.threshold)) {
								pb2.data("background",dataset.color1||this._opt.config.color1);
							} else {
								pb2.data("background",dataset.color2||this._opt.config.color2);
							}
						}
						this._chart.append($wrapper);
					} else if(dataset.single) {
						pb1.data("percent",percent1).css({
							"z-index": 0
						});

						pb2.data("percent",percent1).data("background",dataset.color0||this._opt.config.color0).css({
							"z-index": 0
						});

						this._chart.append($wrapper);
					} else {
						console.error("invalid param: Please check config!");
					}
				}
				if(typeof this._opt.target=='string') $(this._opt.target).html(this._chart); else if(_typeof(this._opt.target)=='object') {
					this._opt.target.html(this._chart);
				} else {
					console.error("invalid param: target error!");
				}
				if(this._opt.autoAnimate) {
					this.animation();
				}
			}
		},
		/**
   * 执行动画
   */
		animation: function animation() {
			if(this.animationState==0&&this._chart) {
				var _this=this;
				setTimeout(function() {
					_this._chart.find(".chart-wrapper").each(function(i,wrapper) {
                        var $wrapper=$(wrapper);
                        var dataset = $wrapper.data('dataset');
                        var size = (dataset.bigger?3:(dataset.thin?1:2));
                        var range = (size==1?1:(size==2?8:15));
						var pb1=$wrapper.find(".percent-bar:eq(0)");
						var pb2=$wrapper.find(".percent-bar:eq(1)");
						var percent1=pb1.data("percent")+"%";
						var percent2=pb2.data("percent")+"%";
						var background2=pb2.data("background");
						if(_this._opt.vertical) {
							pb1.css({
								height: percent1,
								opacity: 1
							});
							pb2.css({
								height: percent2,
								background: background2,
								opacity: 1
                            });
						} else {
							pb1.width(percent1);
							pb2.css({
								width: percent2,
								background: background2
							});
                        }
                        if(percent2=='100%'){
                            pb2.css({
                                'border-radius': range
                            });
                        }
                        if(percent1=='100%'){
                            pb1.css({
                                'border-radius': range
                            });
                        }
						if($wrapper.find(".text:not(:empty)").length) {
							if($wrapper.find(".text.right").text()!='') {
								$wrapper.find(".text.right").css("opacity",1);
							}
							if($wrapper.find(".text.left").text()!='') {
								$wrapper.find(".text.left").css("opacity",1);
							}
							if(_this._opt.vertical) {
								setTimeout(function() {
									$wrapper.find(".text.left").css("bottom",pb1.height()+"px");
									if(pb2.parent().parent().hasClass('bigger')&&percent2) {
											var textRtFixed=(pb2.height()-$wrapper.find(".text.right").height()<0? 0:pb2.height()-$wrapper.find(".text.right").height());
											var maxHeight=pb2.parent().height()-130;
											textRtFixed=textRtFixed>=maxHeight?maxHeight:textRtFixed;
											$wrapper.find(".text.right").css({
												color: pb2.css("background-color"),
												bottom: textRtFixed+"px"
											});
									} else {
										$wrapper.find(".text.right").css({
											top: 0,
											bottom: 'auto'
										}).addClass("slash");
									}
								},350);
							}
						}
						if($wrapper.find(".text.tiptext:not(:empty)").length) {
							setTimeout(function() {
								$wrapper.find(".text.tiptext:not(:empty)").fadeIn();
							},100);
						}
					});
					this.animationState=1;
				},100);
			}
		}
	};

	window.ChartBar=ChartBar;
})();
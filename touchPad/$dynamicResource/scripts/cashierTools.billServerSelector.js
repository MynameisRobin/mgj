
/*
 * opt.$         page.$
 * opt.data      items
 * opt.onSelect  function(selectedItemData){ }
 */
window.cashierTools.BillServerSelector = function(opt) {
	var _this=this;
	this.checkManual = opt.checkManual;
	this.onSelect = opt.onSelect;
	this.onRemove = opt.onRemove;
	this.$page = opt.$;
	this.checkSpecified = opt.checkSpecified;
	this.onSetEmpPer = opt.onSetEmpPer;
	this.checkPromise = opt.checkPromise;
	this.$ = opt.$.find(".cashierServers");
	this.muti = opt.muti;
	this.getTotalPerf = opt.getTotalPerf;
	this.$head = this.$.find(".head");
	this.$body = this.$.find(".body").on("vclick","li",function(){
		if(!_this.checkPromise ||  (_this.checkPromise && !_this.checkPromise())){
			var specified = false;
			var _li = $(this);
			var _fn1 = function(){
				if(_li.hasClass('checked')){
					specified = false;
					_li.removeClass('checked');
				}else{
					specified = true;
					_li.addClass('checked');
				}
			}
			var _fn2 = function(){
				var data = _li.data("data");
				if (_this.onSelect && !_this.onSelect(data, specified)) {
					if (_this.muti) {
						_li.addClass("selected");
						_this.refreshPerf(_li);
					} else {
						_li.addClass("selected").siblings().removeClass("selected").removeClass("checked");
					}
					if (!_this.muti && _this.$body.find('li.selected').length == _this.$body.find('ul').length) {
						_this.riseTimer && clearTimeout(this.riseTimer);
						_this.riseTimer = setTimeout(function () {
							_this.rise(1);
						}, 200);
					}
				} else {
					_li.removeClass('checked').removeClass("selected");
				}
			}
			if($(this).hasClass('selected')){
				if(_this.checkSpecified==1){
					_fn1();
				}else if(_this.checkSpecified==0) {
					if(amGloble.metadata.userInfo.mgjVersion!=1){
						if(!amGloble.metadata.shopPropertyField.authorizationCard){
							am.msg('没有权限操作或没有设置授权卡');
						}else {
							am.auth.show({
								anthSuccess:function(){
									_fn1();
									_fn2();
								}
							});
							return;
						}
					}
				}
				
			}
			_fn2();
			//if(!_this.muti || !$(this).hasClass('selected')) {
			
		}
		
		//}
	}).on("vclick",".delserver",function(){

		if(!_this.checkPromise ||  (_this.checkPromise && !_this.checkPromise())){
			var $li = $(this).parent();
			var specified = false;
			$li.removeClass('selected checked');

			var data = $li.data("data");
			if(!_this.muti && _this.onRemove && !_this.onRemove(data,specified)){
				if(_this.$body.find('li.selected').length == _this.$body.find('ul').length){
					_this.riseTimer && clearTimeout(this.riseTimer);
					_this.riseTimer = setTimeout(function(){
						_this.rise(1);
					},200);
				}
			}
			if(_this.muti){
				_this.onRemove && _this.onRemove(data,specified);
				_this.refreshPerf($li);
			}
			return false;
		}

		
	});
	this.$slideArrow = this.$.find(".slideArrow").vclick(function(){
		_this.rise(_this.riseStatus);
	});
};
window.cashierTools.BillServerSelector.prototype = {
	initRender:function(){
		var em = this.emps;
		var emArr = [];
		if(this.roleName.length>1){
			for(var i=0;i<em.length;i++){
				if(!emArr[em[i].pos]){
					emArr[em[i].pos]=[];
				}
				emArr[em[i].pos].push(em[i]);
			}
		}else{
			emArr[0] = em;
		}


		this.emArr = emArr;

		this.$head.empty();
		this.$body.empty();
		this.scrollviews = [];
		for(var i=0;i<emArr.length;i++){
			if(emArr[i] && emArr[i].length){
				this.$head.append('<div class="headLi">'+this.roleName[i]+'</div>');
				var $wrap = $('<div class="serverList"><ul></ul></div>');
				var $inner = $wrap.find("ul");
				this.$body.append($wrap);
				for(var j=0;j<emArr[i].length;j++){
					var em = emArr[i][j];
					var $li = $('<li class="am-clickable" serverid="'+em.id+'"><span class="code"></span><span class="am-clickable delserver"></span><span class="name"></span></li>');
					if(this.muti){
						$li.append('<div class="perfVal"><div class="perfNum"></div></div>');
					}
					$li.find(".code").text(em.no);
					$li.find(".name").text(em.name);
					$inner.append($li.data("data",em));
				}
				var sv = new $.am.ScrollView({
					$wrap: $wrap,
					$inner: $inner,
					direction: [false, true],
					hasInput: false
				});
				sv.pos = i;
				sv.refresh();
				this.scrollviews.push(sv);
			}
		}

		if(this.muti){
			var _this=this;
			this.$head.find('div.headLi').each(function () {
				var $setPerf = $('<div class="perfSetBtn iconfont icon-yuangong-fu am-clickable"></div>').vclick(function () {
					var idx = _this.$head.find('.perfSetBtn').index($(this));
					var $lis = _this.$body.find('ul').eq(idx).find('li.selected');
					am.setPerf.show({
						checkManual:_this.checkManual,
						total:_this.getTotalPerf(),
						$emps:$lis,
						submit:function (pers,perfs,gains) {
							for(var i=0;i<pers.length;i++){
								_this.setEmpPer($lis.eq(i),pers[i],perfs[i],gains[i]);
							}
						}
					});
				});
				$(this).prepend($setPerf);
			});

			var start = false,totalPerf;
			this.$perfSet = $("#perfSetWindow");
			this.$perfSetList = this.$perfSet.find('tbody');
			this.$perfSetTitle = this.$perfSet.find('.title');

			/**/
			var arr = [];
			for(var i=0;i<100;i++){
				var t = arr[arr.length-1] || 0;
				if(i%5==0){
					t+=4;
				}else{
					t+=1;
				}
				arr.push(t);
			}

			this.$body.find("li").addClass('am-touchable').bind({
				'vtouchstart':function (evt,pos) {
					if(!_this.checkPromise ||  (_this.checkPromise && !_this.checkPromise())){
						if($(this).hasClass('selected')){
							start = pos;
							start.perf = $(this).find('.perfNum').text()*1;

							var $wrap = $(this).parent().parent();
							var offset = $wrap.offset();
							_this.$perfSet.css({
								right:(window.innerWidth-offset.left+415)+'px'
							});
						}else{
							start = false;
							$lis = null;
						}
						totalPerf=0;
					}
					
				},
				'vtouchmove':function (evt,pos) {
					if(!_this.checkPromise ||  (_this.checkPromise && !_this.checkPromise())){
						if($(this).hasClass('selected') && start){
							var $perf = $(this).find('.perfVal');
							var tWidth = $(this).width();
							var moved = pos.x - start.x;

							if(!start.active && Math.abs(moved)>10){
								start.active =true;
								if(_this.getTotalPerf){
									totalPerf = _this.getTotalPerf();
									if(totalPerf){
										_this.$perfSet.show().removeClass("hide").addClass('show');
										if(totalPerf === -1){
											_this.$perfSetTitle.text('请设置业绩占比');
											_this.$perfSet.addClass('noPerfValue');
										}else{
											_this.$perfSetTitle.text('总业绩:￥'+totalPerf);
											_this.$perfSet.removeClass('noPerfValue');
										}
									}
								}
							}
							if(start.active){
								/*
								 //拖动前面的，后面的跟着动，拖动后面的，前面的不动
								 var $prev = $(this).prevAll('.selected');
								 var total = 0;
								 $prev.each(function () {
								 total+=$(this).find('.perfNum').text()*1;
								 });
								 var max = 100 - total;

								 var w = Math.round(start.perf+moved/tWidth*100);
								 if(w<0){
								 w=0;
								 }else if(w>max){
								 w=max;
								 }
								 $perf.css({
								 width: w+'%'
								 }).find('.perfNum').text(w);

								 var $next = $(this).nextAll('.selected');
								 if($next.length >= 1){
								 total+=w;
								 var r = Math.round((100-total)/$next.length);
								 if(r<0){
								 r=0;
								 }
								 $next.find('.perfVal').css({
								 width: r+'%'
								 }).find('.perfNum').text(r);
								 }*/

								var total = 0;
								var $modified = $(this).siblings('.modified');
								var $selected = $(this).siblings('.selected');
								if($modified.length === $selected.length && $(this).hasClass("modified")) {
									$modified.removeClass("modified");
								}else{
									$modified.each(function () {
										total+=$(this).find('.perfNum').text()*1;
									});
								}
								var max = 100 - total;
								var w = start.perf+moved/tWidth*100;

								/* 步长计算 */
								w*=1.6;
								for(var i=0;i<arr.length;i++){
									if(w<arr[i]){
										//console.log(i,arr[i],w);
										w = i;
										break;
									}
								}
								/*****/

								if(w<0){
									w=0;
								}else if(w>max){
									w=max;
								}
								w = Math.round(w);

								_this.setEmpPer($(this),w);
								/*$perf.css({
									width: w+'%'
								}).find('.perfNum').text(w);*/
								if(am.operateArr.indexOf('MGJZ8')==-1){
									var $sibings = $(this).siblings('.selected:not(.modified)');
									console.log($sibings.length);
									if($sibings.length >= 1){
										total+=w;
										var r = Math.round((100-total)/$sibings.length*100)/100;
										if(r<0){
											r=0;
										}
										/*$sibings.find('.perfVal').css({
											width: r+'%'
										}).find('.perfNum').text(r);*/
										$sibings.each(function () {
											_this.setEmpPer($(this),r);
										});
									}
								}

								if(totalPerf){
									_this.$perfSetList.empty();
									var _thisDOM = this;
									var $allSel = $(this).parent().find('li.selected');
									$allSel.each(function () {
										var $tr = $('<tr></tr>');
										var $this=$(this);
										if(this == _thisDOM){
											$tr.addClass('selected');
										}
										if($this.hasClass('modified')){
											$tr.addClass('modified');
										}
										$tr.append('<td>'+$this.find('.code').text()+'</td>');
										$tr.append('<td>'+$this.find('.name').text()+'</td>');
										var p = $this.find('.perfNum').text();
										$tr.append('<td>'+p+'%</td>');
										$tr.append('<td>'+toFloat(totalPerf*p/100)+'</td>');
										_this.$perfSetList.append($tr);
									});

									var offset = $(this).offset();
									var bottom =window.innerHeight-offset.top-14;
									var height = ($allSel.length*41+65)/2;
									if(bottom-height<5){
										bottom = 5+height;
									}
									_this.$perfSet.css({
										bottom:bottom+'px'
									});
								}
								return false;
							}
						}
					}
					
				},
				'vtouchend':function (evt,pos) {
					if(!_this.checkPromise ||  (_this.checkPromise && !_this.checkPromise())){
						if($(this).hasClass('selected')){
							if(start && start.active){
								$(this).addClass('modified');
							}
							if(_this.$perfSet.hasClass('show')){
								_this.$perfSet.removeClass('show').addClass("hide").hide();
							}
							start = false;
							$lis = null;
						}
					}
					
				}
			});
		}
	},
	reset: function($item,t,keepList) {
		if(!keepList){
			var $server = this.$body.find("li").removeClass("selected").removeClass("checked"),_this=this;
			if($item){
				$item.find(".server").each(function(){
					var data = $(this).data("data");
					/*if(data){
						var $s = $server.filter("[serverid="+data.id+"]").addClass("selected");
						if($(this).hasClass('checked')){
							$s.addClass('checked');
						}else{
							$s.removeClass('checked');
						}
					}*/
					if(data){
						var per = false;
						for(var i=0;i<data.length;i++){
							var $s = $server.filter("[serverid="+data[i].empId+"]").addClass("selected");
							if(data[i].pointFlag){
								$s.addClass('checked');
							}else{
								$s.removeClass('checked');
							}

							if(typeof(data[i].per)!== 'undefined'){
								//任何一个不是空就认为有设置
								per = true;
							}
							var p = data[i].per || 0;
							$s.find('.perfVal').css({
								width:(p>100?100:p)+'%'
							}).find('.perfNum').text(p);
							$s.data('perf',data[i].perf);
							$s.data('gain',data[i].gain);
						}

						if(!per){
							var s = Math.round(1000/data.length)/10;
							for(var i=0;i<data.length;i++){
								var $s = $server.filter("[serverid="+data[i].empId+"]").addClass("selected");
								$s.find('.perfVal').css({
									width:(s>100?100:s)+'%'
								}).find('.perfNum').text(s);
							}
						}
					}
				});
			}
		}

		//if(!this.maxHeight){
		this.getMaxHeight();
		//}
		if($item){
			this.rise(0,t);
		}
	},
	getMaxHeight:function(){
		var sv = this.scrollviews;
		var maxh = 0;
		for (var i = 0; i < sv.length; i++) {
			if(sv[i].$wrap.is(":visible") && maxh < sv[i].$inner.height()){
				maxh = sv[i].$inner.height();
			}
		}
		if(sv[0]){
			this.maxHeight= (maxh - sv[0].$wrap.height() + this.$.height());
			if(this.maxHeight > window.innerHeight - 100){
				this.maxHeight = window.innerHeight - 100;
			}
		}
	},
	rise:function(down,wait){
		var _this=this;
		this.riseTimer && clearTimeout(this.riseTimer);
		this.riseTimer = setTimeout(function(){
			_this.riseStatus = 0;
			if(!down){
				if(_this.maxHeight>_this.$.parent().height()){
					_this.$.css({"height":_this.maxHeight+"px"});
					_this.riseStatus=1;
					_this.$slideArrow.addClass("down");
				}else{
					_this.$.css({"height":"100%"});
					_this.$slideArrow.removeClass("down");
				}
			}else{
				_this.$.css({"height":"100%"});
				_this.$slideArrow.removeClass("down");
			}
			var sv = _this.scrollviews;
			_this.riseTimer && clearTimeout(_this.riseTimer);
			_this.riseTimer = setTimeout(function(){
				for (var i = 0; i < sv.length; i++) {
					sv[i].scrollTo("top");
					sv[i].refresh();
				}
			},320);
		},wait||0);
	},
	dataBind: function(data,roleName) {
		this.data = data;
		this.emps = data;
		this.roleName = roleName;
		this.initRender();
	},
	dispatchSetting:function(setting,posSet){
		var visible = 0;
		for(var i=1;i<=3;i++){
			if(this.scrollviews[i-1]){
				var $d = this.$head.find("div.headLi:eq("+(i-1)+")");
				if(!setting || setting["setting_server"+i]!=0){
					this.scrollviews[i-1].$wrap.show();
					$d.show();
					visible++;
				}else{
					this.scrollviews[i-1].$wrap.hide();
					$d.hide();
				}
			}
		}

		if(!posSet && setting){
			var sEmp = [];
			for (var i = 0; i < this.data.length; i++) {
				var key = 'emps_'+this.data[i].id;
				if(setting[key]==1){
					sEmp.push(this.data[i]);
				}
			}
			this.emps = sEmp;
			this.initRender();
			if(!sEmp.length){
				visible=0;
			}else{
				visible=1;
			}
		}

		if(visible){
			this.$.show();
			if(visible == 1){
				this.$.css({"width":"240px"});
			}else{
				this.$.css({"width":"360px"});
			}
		}else{
			this.$.hide();
		}
		if(this.hideServer==1){//没有改项目的权限就隐藏
			this.$.hide();
		}
		//this.setting = setting;

		this.getMaxHeight();
		this.rise(1);
	},
	refreshPerf:function ($li) {
		var $ul = $li.parent();
		var $selected = $ul.find('li.selected');
		$ul.find('li.modified').removeClass('modified');
		var per = Math.round(1000/$selected.length)/10;
		/*$selected.find('.perfVal').css({
			width:per+'%'
		}).find('.perfNum').text(per);*/
		if($selected && $selected.length){
			this.setEmpPer($selected,per,0,0);
		}else{
			this.setEmpPer($li,per,0,0);
		}
		
	},
	setEmpPer:function ($dom,per,perf,gain) {
		$dom.find('.perfVal').css({
			width:(per>100?100:per)+'%'
		}).find('.perfNum').text(per);
		$dom.data('perf',perf);
		$dom.data('gain',gain);
		this.onSetEmpPer && this.onSetEmpPer($dom.data('data'),per*1,perf*1,gain*1);
	},
	getEmps:function () {
		var emps =[];
		var totalPerf = this.getTotalPerf();
		this.$body.find('li.selected').each(function () {
			var $this=$(this);
			var emp = $this.data('data');
			emps.push({
				"empId": emp.id,
				"empName": emp.name,
				"empNo": emp.no,
				"station":emp.pos,
				"pointFlag": $this.hasClass('checked') ? 1 : 0,
				"dutyid": emp.dutyid,
				"perf":$this.data('perf') || 0,
				"per":$this.find('.perfNum').text()*1,
				"gain":$this.data('gain') || 0,
				"dutytypecode":emp.dutyType
			});
		});

		return emps;
	}
};
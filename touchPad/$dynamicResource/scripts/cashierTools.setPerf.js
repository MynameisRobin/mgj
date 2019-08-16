am.setPerf = {
	init:function () {
		var _this=this;
		this.$ = $('#setMutiPerf');
		this.$list = this.$.find('tbody');
		this.$tr = this.$list.find('tr').remove();


		var _this=this;
		this.$.find('button.ok').vclick(function () {
			_this.hide(1);
		});
		this.$.find('button.cancel').vclick(function () {
			_this.hide();
		});
		this.$title = this.$.find('.title');
		this.$error = this.$.find('.error');

		if (navigator.userAgent.indexOf("Windows") === -1) {
			this.$tr.find('input').prop('readonly',true).addClass('am-clickable');
			this.$list.on('vclick','input',function () {
				var $this = $(this);
				_this.seletedIndex = $(this).parents('tr').index();
				if(_this.$list.find('tr').length==_this.$list.find('.modified').length && _this.seletedIndex!=_this.modifingIndex){
					_this.$list.find('tr').removeClass('modified');
				}
				var title = '';
				var name = $this.prop('name') ;
				if(name=='per'){
					title = '修改业绩占比';
				}else if(name=='perf'){
					title = '修改业绩';
				}else if(name=='salary'){
					title = '修改提成';
				}
				am.keyboard.show({
					"title":title,
					"submit":function(value){
						$this.val(value);
						_this.onValChange($this);
					}
				});
			});
		}else{
			this.$list.on('keyup','input',function (evt) {
				if(evt.keyCode === 9){
					return;
				}
				_this.seletedIndex = $(this).parents('tr').index();
				if(_this.$list.find('tr').length==_this.$list.find('.modified').length && _this.seletedIndex!=_this.modifingIndex){
					_this.$list.find('tr').removeClass('modified');
				}
				_this.onValChange($(this));
			}).on('focus','input',function () {
				$(this).select();
			});
		}
	},
	onValChange:function ($this) {

		var value = $this.val();
		$this.val(this.fixNum(value));

		var _this=this;
		_this.$error.hide();
		var name = $this.prop('name');
		_this.modifingIndex = $this.parents('tr').index();

		if(name === 'per'){
			//改的是比例
			if(am.operateArr.indexOf('MGJZ8')==-1){
				$this.parents('tr').removeClass('modified');

				var otherModified = this.$list.find('.modified');
				var otherPer = 0;
				for(var i=0;i<otherModified.length;i++){
					otherPer += $(otherModified[i]).find('input[name=per]').val()*1 || 0;
				}
				var per = $this.val()*1;
				if(isNaN(per) || per<0){
					$this.val(0);
					per = 0;
				}else if(per>100 - otherPer){
					$this.val(100 - otherPer);
					per = 100 - otherPer;
				}

				$this.parents('tr').addClass('modified');

				var hasModified = this.$list.find('.modified');
				var hasPer = 0;
				for(var i=0;i<hasModified.length;i++){
					hasPer += $(hasModified[i]).find('input[name=per]').val()*1 || 0;
				}

				var notModified = [];
				for(var i=0;i<this.$list.find('tr').length;i++){
					if(!$(this.$list.find('tr')[i]).hasClass('modified')){
						notModified.push(this.$list.find('tr')[i]);
					}
				}

				var lastPer = 100 - hasPer;
				for(var i=0;i<notModified.length;i++){
					$(notModified[i]).find('input[name=per]').val(Math.round(lastPer/notModified.length*100)/100);
				}
				// if(!_this.checkPerSum()){
				// 	_this.$error.text('业绩比例之和不能大于100%').show();
				// }
				
				for(var i=0;i<this.$list.find('tr').length;i++){
					var percent = $(this.$list.find('tr')[i]).find('input[name=per]').val()*1 || 0;
					$(this.$list.find('tr')[i]).find('input[name=perf]').val(this.total*percent/100);
				}

				if(this.total<0){
					var all = this.$list.find('tr');
					for(var i=0;i<all.length;i++){
						$(all[i]).find('input[name=perf]').val('');
					}
				}
			}else {
				if(this.total<0){
					var all = this.$list.find('tr');
					for(var i=0;i<all.length;i++){
						$(all[i]).find('input[name=perf]').val('');
					}
				}else {
					var per = $this.val()*1;
					var result = this.total*per/100;
					$this.parents('tr').find('input[name=perf]').val(Math.round(result*100)/100);
				}
			}
		}else if(name=='perf'){

			if(am.operateArr.indexOf('MGJZ8')==-1){
				if(this.total<0){
					var all = this.$list.find('tr');
					for(var i=0;i<all.length;i++){
						$(all[i]).find('input[name=per]').val('');
					}
					var $tr = $('#page_service .cashierBox .body .selected'),
						price = $tr.data('data').price,
						soldPrice = $tr.find('.price').text()*1 || 0;
					var perf = $this.val()*1,
						basePrice = price>soldPrice?price:soldPrice;
					if(perf>basePrice){
						$this.val(basePrice);
					}
					return;
				}
	
				$this.parents('tr').removeClass('modified');
	
				var otherModified = this.$list.find('.modified');
				var otherPer = 0;
				for(var i=0;i<otherModified.length;i++){
					otherPer += $(otherModified[i]).find('input[name=perf]').val()*1 || 0;
				}
				var per = $this.val()*1;
				if(isNaN(per) || per<0){
					$this.val(0);
					per = 0;
				}else if(per>_this.total - otherPer){
					$this.val(_this.total - otherPer);
					per = _this.total - otherPer;
				}
	
				$this.parents('tr').addClass('modified');
	
				var hasModified = this.$list.find('.modified');
				var hasPer = 0;
				for(var i=0;i<hasModified.length;i++){
					hasPer += $(hasModified[i]).find('input[name=perf]').val()*1 || 0;
				}
	
				var notModified = [];
				for(var i=0;i<this.$list.find('tr').length;i++){
					if(!$(this.$list.find('tr')[i]).hasClass('modified')){
						notModified.push(this.$list.find('tr')[i]);
					}
				}
	
				var lastPer = _this.total - hasPer;
				for(var i=0;i<notModified.length;i++){
					$(notModified[i]).find('input[name=perf]').val(Math.round(lastPer/notModified.length*100)/100);
				}
				// if(!_this.checkPerSum()){
				// 	_this.$error.text('业绩比例之和不能大于100%').show();
				// }
				for(var i=0;i<this.$list.find('tr').length;i++){
					var money = $(this.$list.find('tr')[i]).find('input[name=perf]').val()*1 || 0;
					if(_this.total==0){
						
					}else {
						$(this.$list.find('tr')[i]).find('input[name=per]').val(Math.round(money/_this.total*10000)/100);
					}
				}
			}else {
				if(this.total<0){
					var all = this.$list.find('tr');
					for(var i=0;i<all.length;i++){
						$(all[i]).find('input[name=per]').val('');
					}
				}else {
					var perf = $this.val()*1;
					var percent = perf/this.total;
					if(this.total==0 || !isFinite(percent)){
						$this.parents('tr').find('input[name=per]').val('');
					}else {
						$this.parents('tr').find('input[name=per]').val(Math.round(percent*10000)/100);
					}
				}
			}
		}
	},
	fixNum:function(value){
		value = value.replace(/[^\d.]/g,"");
		value = value.replace(/^\./g,"");
		value = value.replace(/\.{2,}/g,".");
		value = value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
		value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
		return value;
	},
	checkPerSum:function () {
		var sum = 0;
		this.$list.find('tr').each(function () {
			sum+= $(this).find('input[name=per]').val()*1 || 0;
		});
		return sum<=100;
	},
	checkPerfSum:function () {
		var sum = 0;
		this.$list.find('tr').each(function () {
			sum+= $(this).find('input[name=perf]').val()*1 || 0;
		});
		return this.total===-1 ? true: sum<=this.total;
	},
	show:function (opt) {
		if(!this.$){
			this.init();
		}
		this.total = opt.total || 0;

		this.$list.empty();
		this.submit = opt.submit;
		this.$error.hide();
		var _this=this;
		this.$emps = opt.$emps;
		this.emps = opt.emps;
		var $arr = opt.$emps;
		if($arr){
			if(!$arr.length){
				am.msg('没有选择任何员工！');
				return;
			}
			var hasPercent = false;
			$arr.each(function (i,item) {
				var $tr = _this.$tr.clone().removeClass('modified');
				var $this=$(this);
				var $td = $tr.find('td');
				var emp = $this.data('data');
				$td.eq(0).text(emp.no);
				$td.eq(1).text(emp.name);
				var per = $this.find('.perfNum').text()*1 || '';
				if(per){
					hasPercent = true;
				}
				$td.eq(2).find('input').val(per);
				if(_this.total<=0){
					$td.eq(3).find('input').val($this.data('perf') || 0);
				}else {
					$td.eq(3).find('input').val(toFloat(opt.total*per/100));
				}
				// if($this.data('perf')>0 && this.total<0){
				// 	$td.eq(2).find('input').val('');
				// }
				$td.eq(4).find('input').val($this.data('gain'));
				_this.$list.append($tr);
			});
			if(hasPercent && this.total<0){
				var $trs = _this.$list.find('tr');
				for(var i=0;i<$trs.length;i++){
					$($trs[i]).find('input[name=perf]').val('');
				}
			}
			if(!hasPercent && this.total<0){
				var $trs = _this.$list.find('tr');
				for(var i=0;i<$trs.length;i++){
					$($trs[i]).find('input[name=per]').val('');
				}
			}
		}else{
			var per = Math.round(10000/opt.emps.length)/100;
			for(var i=0;i<opt.emps.length;i++){
				var $tr = _this.$tr.clone().removeClass('modified');
				var $td = $tr.find('td');
				var emp = opt.emps[i];
				$td.eq(0).text(emp.empNo);
				$td.eq(1).text(emp.empName);
				$td.eq(2).find('input').val(emp.per || per);
				if(_this.total<0){
					$td.eq(3).find('input').val('');
				}else {
					$td.eq(3).find('input').val(toFloat(opt.total*(emp.per || per)/100));
				}
				_this.$list.append($tr);
			}
		}
		// if(this.total===-1){
		// 	this.$title.text('请设置业绩');
		// 	this.$.addClass('noPerf');
		// }else{
		// 	this.$title.text('总业绩￥'+this.total);
		// 	this.$.removeClass('noPerf');
		// }
		if(am.operateArr.indexOf('a9')==-1 || opt.isDepart){
			this.$.addClass('noSalary');
			if(this.total===-1){
				this.$title.text('请设置业绩');
			}else{
				this.$title.text('总业绩￥'+this.total);
			}
		}else {
			this.$.removeClass('noSalary');
			if(this.total===-1){
				this.$title.text('请设置业绩和提成');
			}else{
				this.$title.text('请设置业绩(总业绩￥'+this.total+')和提成');
			}
		}
		if(opt.checkManual && am.operateArr.indexOf('MGJZ4')!=-1){
			this.$.addClass('noPerf');
		}else {
			this.$.removeClass('noPerf');
		}
		this.$.show();
	},
	hide:function (submit) {
		if(submit){
			if(this.$error.is(":visible")){
				am.msg('请调整业绩分配!');
				return;
			}
			var _this = this;
			var pers = [];
			var perfs = [];
			var gains = [];
			this.$list.find('tr').each(function (i) {
				var per = $(this).find('input[name=per]').val() || 0;
				var perf = $(this).find('input[name=perf]').val() || 0;
				var gain = $(this).find('input[name=salary]').val()*1 || 0;
				pers.push(per);
				perfs.push(perf);
				gains.push(gain);
				if(_this.$emps){
					/*$lis.eq(i).find('.perfVal').css({
						width: per+'%'
					}).find('.perfNum').text(per);*/
				}else{
					_this.emps[i].per = per;
					_this.emps[i].perf = Math.round(_this.total*per)/100;
				}
			});
			if(this.submit){
				this.submit(pers,perfs,gains);
			}
		}
		this.$.hide();
	}
};
/**
 * computingPerformance.computing({
 * 		paid:{//传进来的钱 不需要每个字段都传  有哪个传哪个
 * 			cardfee:1,//卡金
 * 			presentfee:2,//赠送金
 * 			cash:3,//现金
 * 			unionpay:1,//银联
 * 			cooperation:1,//合作券
 * 			mall:1,//商场卡
 * 			weixin:1,//微信
 * 			pay:1,//支付宝
 * 			voucherfee:1,//代金券
 * 			dividefee:1,//分期赠金
 * 			deductpoint:1,//积分
 * 			debtfee:10,//欠款
 * 			mdfee:2,//免单
 * 			luckymoney:1,//红包支付
 * 			coupon:1,//优惠券
 * 			dianpin:1,//点评支付
 *          "jdFee": 0,//京东
 *          "onlineCreditPay":0,//线上积分抵扣金额
 *          "offlineCreditPay":0,//线下积分抵扣金额
 *          "mallOrderFee":0,//商城订单
 * 			otherfee1:222,//自定义支付1
 * 			...
 * 			otherfee10:222//自定义支付10
 * 		},
 * 		card:{//散客不传
 * 			cardtypeid:1,
 * 			treatcardfee:0,//套餐卡金
 * 			treatpresentfee:0,//套餐赠金
 * 			discount:9,//折扣
 * 		},
 *    	itemList:[{
 * 		  	itemid:1, //项目id
 * 		  	consumemode:1,//消费方式 （单次 0 套餐 1 计次2 赠送3 年卡4）
 * 		  	consumetype:1,//消费类型 用卡消费为1 现金消费为2
 * 		  	unlimited:1,//不限次套餐
 * 		   	price:10, //售价
 * 		   	cost:20,//原价
 * 			empList:[{no:1001,dutytype:1,dutyid:101},{no:1003,dutytype:2,dutyid:102},{no:1006,dutytype:3,dutyid:103}]
 * 	 	}]
 * 	 })
 *
 *	return [{shopper:10,total:{cardfee:1},empper:[{dutytype:111,pre:100,total:},{dutytype:112,pre:100,total:}]}]
 *
 */
var computingPerformance=(function(win,cashierTab){
	var isEmptyObject=function(e) {
	    var t;
	    for (t in e){
	    	return !1;
	    }
	    return !0
	}
	var convertPrice = function (val) {
		if(am && toFloat){
			//判断是否小掌柜环境
			return toFloat(val);
		}

		var fixedNum;
  		if(!isEmptyObject(cashierTab)){
  			if(cashierTab.parentshopid == '21590'){
  				return Math.ceil(val);
  			}
			fixedNum = parseInt(cashierTab.fixedNum);
		}else{
			fixedNum = 1;
		}


		if(fixedNum == 3)	//进位取整
		{
			return Math.ceil(Math.round(val*100)/100);
		}
		if($.trim(val+"")=="" || val+"" == "NaN")
		{
			return 0;
		}
		var v = parseFloat(val);
		if(fixedNum == 0)
		{
			if(v < 1 && v >= 0.5)
			{
				return 1;
			}
			else
			{
				return v.toFixed(0);
			}
		}
		else
		{
		    var t=1;
		    for(;fixedNum>0;t*=10,fixedNum--);
		    for(;fixedNum<0;t/=10,fixedNum++);
		    return Math.round(v*t)/t;
		}
    }
    var isArray=function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    }
    var isemptyArray=function(arr){
    	if(!isArray(arr)) return false;
    	return arr.length>0?false:true;
    }
    var cloneObj = function(obj){
    	if(obj==null  || obj=="" || obj==undefined) return obj;
		var newobj = obj.constructor === Object ? {} : [];
		if(typeof JSON === 'object'){
			var s = JSON.stringify(obj), //系列化对象
			newobj = JSON.parse(s); //反系列化（还原）
		}else{
			if(newobj.constructor === Array){
				newobj.concat(obj);
			}else{
				for(var i in obj){
					newobj[i] = obj[i];
				}
			}
		}
		return newobj;
	}

	var returnObj={
		init:function(opt){
			this.empList=null;//员工列表
			this.itemList=null;//项目列表
			this.payConfig=null;//支付方式
			this.updataConfig(opt);
		},
		updataConfig:function(data){
			// var temp=cloneObj(data);
			this.translateArgs(data);
		},
		translateArgs:function(data){
			var Args=["empList","itemList","payConfig","cashierTab"],
				objname="translate",temp;
			if(typeof data =="object"){
				for(var i in data){
					if(Args.join("").indexOf(i)>-1){
						if(i!="cashierTab"){
							temp=cloneObj(data[i]);
						}else{
							temp=data[i];
						}
						this[objname+i](temp);
					}
				}
			}else{
				//throw new Error("Params must be an object");
				return;
			}

		},
		translatecashierTab:function(){
			cashierTab=cashierTab;
		},
		translatepayConfig:function(list){
			this.payConfig=list;
		},
		translateempList:function(list){//转化员工列表参数
			var res=[];
			if(isArray(list)){
				var data=[].concat(list);
				if(data.length>0){
					for(var i=0;i<data.length;i++){
						if(data[i].hasOwnProperty("data")){//原盛传数据结构
							res.push(data[i].data);
						}else{//青春版结构
							data[i].dutytype=data[i].dutyType;//dutytype不一致 需转化
							res.push(data[i]);
						}
					}
				}else{
					res=data;
				}
			}else{
				res=list;
			}
			this.empList=res;
		},
		translateitemList:function(list){//转化项目列表参数
			var res=[];
			if(isArray(list)){
				var data=[].concat(list);
				if(data.length>0){
					for(var i=0;i<data.length;i++){
						if(data[i].hasOwnProperty("data")){//原盛传数据结构
							var sidList=cloneObj(data[i].data.sidList);
							var spfList=cloneObj(data[i].data.spfList);
							delete data[i].data.sidList;
							delete data[i].data.spfList;
							var a=[],b=[];
							for(var j=0;j<sidList.length;j++){//业绩规则
								a.push(sidList[j].data);
							}
							for(var l=0;l<spfList.length;l++){//业绩规则
								b.push(spfList[l].data);
							}
							data[i].data.sidList=a;
							data[i].data.spfList=b;
							res.push(data[i].data);
						}else if(data[i].hasOwnProperty("sub")){//青春版的结构
							if(data[i].sub && data[i].sub.length){
								res=[].concat(res,data[i].sub);
							}
							this.pushitemRule(res);
						}
					}
				}else{
					res=data;
				}
			}else{
				res=list;
			}
			this.itemList=res;
		},
		pushitemRule:function(arr){//青春版逻辑合并规则进项目
			var sidProList=cloneObj(am.metadata.serviceitemperfs);
			var spfProList=cloneObj(am.metadata.serviceitemPerfAdvs);
			if(isArray(arr) && isArray(sidProList)){
				if(arr.length>0 || sidProList.length>0){
					for(var i=0;i<arr.length;i++){
						arr[i].sidList=[],arr[i].spfList=[];
						var item=arr[i];
						for(var j=0;j<sidProList.length;j++){
							if(item.itemid==sidProList[j].itemid){
								arr[i].sidList.push(sidProList[j]);
							}
						}
						for(var l=0;l<spfProList.length;l++){
							if(item.itemid==spfProList[l].itemid){
								arr[i].spfList.push(spfProList[l]);
							}
						}
					}
				}else{
					return;
				}
			}else{
				return;
			}
		},
		//获得员工业绩汇总
		getEmployeetotal:function(itemindex,base,emppernum){
			var paycent=base.paycent;//各支付方式分给员工的基础业绩
			var paycentTotal=base.paycentTotal;//各项目员工的总基础业绩
			var res={},ret={};
			for(var i in paycent){
				res[i]=paycent[i].empper[itemindex];
			}
			for(var j in res){
				ret[j]=emppernum.pre*res[j]/paycentTotal[itemindex].empper || 0;
			}
			//return ret;
			return this.paytypeClass(ret,emppernum);
		},
		//为支付方式分类
		paytypeClass:function(ret,emppernum){
			var res={cardfee:0,cashfee:0,otherfee:0};
			var payclass={
				cardfee:["cardfee","presentfee","dividefee","treatcardfee","treatpresentfee"],
				cashfee:["cash","cashfee","unionpay","pay","weixin","dianpin","cooperation","mall"],
				otherfee:["luckymoney","coupon","debtfee","voucherfee","mdfee","onlineCredit","onlineCreditPay","offlineCredit","offlineCreditPay","mallOrderFee"]
			}
			for(var i in ret){
				if(i.indexOf("otherfee")!=-1){
					if(isArray(this.payConfig)){
						for(var j=0;j<this.payConfig.length;j++){
							var item=this.payConfig[j];
							if(item.field.toLowerCase()==i){
								if(item.type==0){//非现
									payclass.otherfee.push(i);
								}else{//现金
									payclass.cashfee.push(i);
								}
							}
						}
					}

				}
				for(var k in payclass){
					if(payclass[k].join(",").indexOf(i.toLowerCase())!=-1){
						res[k]+=ret[i];
					}
				}
			}
			for(var n in res){
				res[n]=convertPrice(res[n]);
			}
			res["otherfee"]=convertPrice(emppernum["pre"]-res["cardfee"]-res["cashfee"]);//重新赋值  保证相等
			return res;

		},
		getitemtotal:function(itemindex,itemtotal){
			var res={};
			for(var i in itemtotal){
				res[i]=convertPrice(itemtotal[i][itemindex]);
			}
			return res;
		},
		getcourseList:function(config){
			var itemlist=config.itemList,res={};
			if(isArray(itemlist)){
				for(var i=0;i<itemlist.length;i++){
					if(itemlist[i].consumemode==1 || itemlist[i].consumemode==4){
						res[i]=itemlist[i];
					}
				}
			}

			return res;
		},
		getcoursetotal:function(courseList){
			var res={};total=0,ret={};
			for(var i in courseList){
				total+=parseInt(courseList[i].price);
				ret[i]=courseList[i];
			}
			res.total=total;
			res.list=ret;
			return res;
		},
		computing:function(config){
			console.log(JSON.stringify(config));
			var res=[],itemList=config.itemList;
			var base=this.computingBase(config);//基准业绩数组 [{"shopper":49.5,"empper":47.7},{"shopper":59.5,"empper":57.3}]
			var basePerformance=base.paycentTotal;
			if(isArray(itemList)){
				for(var i=0;i<itemList.length;i++){
					var item=itemList[i];
					res[i]={};
					res[i].shopper= convertPrice(basePerformance[i].shopper);
					res[i].unshopper= convertPrice(basePerformance[i].unshopper);
					var s = am.metadata.userInfo&&am.metadata.userInfo.fixedNum;
					if(s==3){res[i].unshopper -= 1};
					if(item.payDetail){
						res[i].total = item.payDetail;
					}else {
						res[i].total=this.getitemtotal(i,base.itemtotal);
					}
					if(item.hasOwnProperty("empList")){
						if(isArray(item.empList)){
							res[i].empper=[];
							for(var j=0;j<item.empList.length;j++){
								var emppernum=this.computingEmployee(item,item.empList[j],config.card || null,basePerformance[i].empper,config.rate);//{dutytype:111,pre:100};
								if(item.empList[j].hasOwnProperty('per') && item.empList[j].hasOwnProperty('perf') && !item.empList[j].per && item.empList[j].perf>0){
									emppernum.pre = item.empList[j].perf;
								}
								emppernum.total=this.getEmployeetotal(i,base,emppernum);
								res[i].empper.push(emppernum);
							}
						}
					}
				}
			}else{
				throw new Error("config.itemList must be an array");
			}
			return res;

		},
		getshopPerfPct: function (itemId) {
			// 获取项目所配的店内业绩
			if (itemId) {
				var serviceCodeMap = am.metadata.serviceCodeMap,
					stopServiceCodeMap = am.metadata.stopServiceCodeMap,
					serviceItemInfo = serviceCodeMap[itemId] || stopServiceCodeMap[itemId],
					thirdCommissionPct = (serviceItemInfo && typeof (serviceItemInfo.thirdCommissionPct) === 'number') ? serviceItemInfo.thirdCommissionPct : 0;
				return 1-thirdCommissionPct;
			}else{
				return 0;
			}
		},
		computingBase:function(config){//计算基准业绩
			var debtFlag = amGloble.metadata.configs.debtFlag*1;
			var perRule=this.getpreruleBykey(config);
			var courseList=this.getcourseList(config);//获得套餐项目list
			var coursetotal=this.getcoursetotal(courseList);
			var  c={};
			var treatcardfee=config["card"]?Number(config["card"]["treatcardfee"] || 0):0,
				treatpresentfee=config["card"]?Number(config["card"]["treatpresentfee"] || 0):0;
			var serviceCodeMap = am.metadata.serviceCodeMap;
			var stopServiceCodeMap = am.metadata.stopServiceCodeMap;
			for(var m=0;m<config.itemList.length;m++){//先分套餐项目
				if(config.itemList[m].consumemode==1 || config.itemList[m].consumemode==4){//套餐和年卡项目消费
					c[m]={};
					var itemj = coursetotal.list[m];
					//计算比例
					var _treatcardfee = (Number(itemj.cashFee)||0) + (Number(itemj.cardFee)||0);
					var _treatpresentfee = (Number(itemj.otherFee)||0);
					var _total = _treatcardfee + _treatpresentfee;
					var factor = 1;
					if((itemj.consumemode==4 && !itemj.unlimited) || (itemj.consumemode==1 && _total==0)){
						// //不限次还是分开，年卡项目全部算卡金
						c[m].treatcardfee = itemj.price;
						c[m].treatpresentfee = 0;
					}else{
						c[m].treatcardfee = itemj.price*_treatcardfee/_total;
						c[m].treatpresentfee=itemj.price*_treatpresentfee/_total;
					}
					c[m].shopper = Number(c[m].treatcardfee*(perRule["treatcardfee"].shopper/100)) + Number(c[m].treatpresentfee*(perRule["treatpresentfee"].shopper/100));
					c[m].empper  = Number(c[m].treatcardfee*(perRule["treatcardfee"].empper/100)) + Number(c[m].treatpresentfee*(perRule["treatpresentfee"].empper/100));
					var shopPerfPct = this.getshopPerfPct(config.itemList[m].itemid);
					c[m].shopper = c[m].shopper*shopPerfPct // 店内业绩折扣比例
				}
			}

			var res={},finalres=[],output={},rek={};//存放结果的json
			for(var i in config.paid){
				if(i=='debtfee' && debtFlag){
					continue;
				}
				var result=0,outresult=[],outempres=[],outtotal=[],outunresult=[]
					num=parseFloat(config.paid[i]);
				for(var j=0;j<config.itemList.length;j++){//计算总售价
					var item=config.itemList[j];
					if(c.hasOwnProperty(j)) continue;
					result+=parseFloat(item.price);
				}
				for(var l=0;l<config.itemList.length;l++){//遍历项目列表 单项目计算业绩
					var iteml=config.itemList[l];
					var shopPerfPct = this.getshopPerfPct(iteml.itemid);
					if(iteml.payDetail){
						outresult.push((iteml.payDetail[i]/num || 0)*num*(perRule[i].shopper/100)*shopPerfPct);
						outunresult.push((iteml.payDetail[i]/num || 0)*num*(perRule[i].shopper/100)*(1-shopPerfPct));
						outempres.push((iteml.payDetail[i]/num || 0)*num*(perRule[i].empper/100));
						outtotal.push((iteml.payDetail[i]/num || 0)*num);
					}else {
						if(c.hasOwnProperty(l)){
							if(i=="treatcardfee" || i=="treatpresentfee"){
								outtotal.push(c[l][i] || 0);
								outresult.push(((c[l][i]|| 0)*(perRule[i].shopper/100))*shopPerfPct);
								outunresult.push(((c[l][i]|| 0)*(perRule[i].shopper/100))*(1-shopPerfPct));
								outempres.push(((c[l][i]|| 0)*(perRule[i].empper/100)));
							}else{
								outresult.push(0);
								outempres.push(0);
								outtotal.push(0);
								outunresult.push(0);
							}
						}else{
							//Math.floor(/100)*100
							if(i=="treatcardfee" || i=="treatpresentfee"){
								outresult.push(0);
								outempres.push(0);
								outtotal.push(0);
								outunresult.push(0);
							}else {
								outresult.push((parseFloat(iteml.price)/result || 0)*num*(perRule[i].shopper/100)*shopPerfPct);
								outunresult.push((parseFloat(iteml.price)/result || 0)*num*(perRule[i].shopper/100)*(1-shopPerfPct));
								outempres.push((parseFloat(iteml.price)/result || 0)*num*(perRule[i].empper/100));
								outtotal.push((parseFloat(iteml.price)/result || 0)*num);
							}
						}
					}
					// total[i]=(parseFloat(iteml.price)/result)*num;
				}
				res[i]={shopper:outresult || 100,empper:outempres || 100,unshopper:outunresult || 0};
				rek[i]=outtotal;
			}
			console.log(res);
			for(var k=0;k<config.itemList.length;k++){//把每种支付方式的业绩加起来  输出数组
				var a=0,b=0;c=0
				for(var n in res){
					var shopper = res[n]["shopper"][k];
					var unshopper = res[n]["unshopper"][k];
					var empper = res[n]["empper"][k];
					a += shopper;
					b += empper;
					c += unshopper;
				}
				var iteml = config.itemList[k];
				if(iteml.payDetail){// 高级结算
					var _shopper = 0;
					var _empper = 0;
					var _unshopper = 0;
					var shopPerfPct = this.getshopPerfPct(iteml.itemid);
					for(var pkey in iteml.payDetail){
						_shopper += (iteml.payDetail[pkey] || 0)*(perRule[pkey].shopper/100)*shopPerfPct;
						_unshopper += (iteml.payDetail[pkey] || 0)*(perRule[pkey].shopper/100)*(1-shopPerfPct);
						_empper += (iteml.payDetail[pkey] || 0)*(perRule[pkey].empper/100);
					}
					a = _shopper;
					b = _empper;
					c = _unshopper;
				}
				finalres.push({shopper:a,empper:b,unshopper:c});
			}
			console.log(rek);
			output.paycent=res;
			output.paycentTotal=finalres;
			output.itemtotal=rek;

			for(var h in c){//替换套餐项目的基准业绩
				//output.paycentTotal[h]=c[h];
			}
			return output;
		},
		computingEmployee:function(item,emp,card,basepre,rate){//计算员工的业绩
			var spf,res;
			var itemRule=this.getdataByValue(this.itemList,"itemid",item.itemid);
			var sidList=this.getdataByValue(itemRule.sidList,"dutytypecode",emp.dutytype);//基础配置
			var spfList=this.getdataByValue(itemRule.spfList,"dutytypecode",emp.dutytype);//高级配置 有重复的
			var defres={dutytype:emp.dutytype,pre:convertPrice(basepre)};
			if(isEmptyObject(sidList) && isEmptyObject(spfList)){//两个都为空  默认100
				return defres;
			}else if(isEmptyObject(sidList) && (!isEmptyObject(spfList) || !isemptyArray(spfList))){//取高级配置
				spf=this.selectConfiguration(spfList,item,emp,card,basepre,sidList);
			}else if(!isEmptyObject(sidList) && (isEmptyObject(spfList) || isemptyArray(spfList))){//取基础配置
				res=this.computingbaseRule(sidList,item,emp,card,basepre,rate);
			}else{//两个都不为空 取高级配置 若高级配置不匹配 取基础配置
				spf=this.selectConfiguration(spfList,item,emp,card,basepre,sidList);
			}
			if(spf==-1){//没任何配置 100
				return defres;
			}else if(spf==1){
				res=this.computingbaseRule(sidList,item,emp,card,basepre,rate);
			}else if(!spf){
				if(isEmptyObject(sidList)){
					return defres;
				}else{
					res=this.computingbaseRule(sidList,item,emp,card,basepre,rate);
				}
			}else if(spf.hasOwnProperty("dmode")){//走高级配置
				res=this.computingfirstRule(spf,item,emp,card,basepre,rate);
			}

			return res;
		},
		computingbaseRule:function(sidList,item,emp,card,basepre,rate){//默认配置计算方式
			var res={pre:convertPrice(basepre)},right=basepre;

			sidList.dnumber=sidList.dnumber==0?sidList.dnumber.toString():sidList.dnumber;//解决 0!="" 走false 的bug
			sidList.dagionumber=sidList.dagionumber==0?sidList.dagionumber.toString():sidList.dagionumber;

			res.dutytype=emp.dutytype;
			res.no=emp.no;
			var debtFlag = amGloble.metadata.configs.debtFlag*1;
			if(sidList.dmode==0 && sidList.dnumber!="" && sidList.dnumber!=null){//0:固定业绩 1:水单业绩比例
				right=parseFloat(sidList.dnumber);
				if(debtFlag && item.consumemode!=1 && item.consumemode!=4 && item.price!=0){
					right *=  (rate || 0);
				}
			}else if(sidList.dmode==1 && sidList.dnumber!="" && sidList.dnumber!=null){
				right=(parseFloat(sidList.dnumber)/100)*basepre;
			}
			res.pre=convertPrice(right);
			if(sidList.dagiomode==0 && sidList.dagionumber!="" && sidList.dagionumber!=null){//判断定扣方式 0:固定业绩 1:项目原价比例 2:项目业绩比例
				if(debtFlag && item.consumemode!=1 && item.consumemode!=4 && item.price!=0){
					res.pre=convertPrice(right-parseFloat(sidList.dagionumber)*(rate || 0));
				}else {
					res.pre=convertPrice(right-parseFloat(sidList.dagionumber));
				}
			}else if(sidList.dagiomode==1 && sidList.dagionumber!="" && sidList.dagionumber!=null){
				if(debtFlag && item.consumemode!=1 && item.consumemode!=4 && item.price!=0){
					res.pre=convertPrice(right-(parseFloat(sidList.dagionumber)/100)*item.cost*(rate || 0));
				}else {
					res.pre=convertPrice(right-(parseFloat(sidList.dagionumber)/100)*item.cost);
				}
			}else if(sidList.dagiomode==2 && sidList.dagionumber!="" && sidList.dagionumber!=null){
				res.pre=convertPrice(right-(parseFloat(sidList.dagionumber)/100)*right);
			}
			return res;
		},
		selectConfiguration:function(spfList,item,emp,card,basepre,sidList){
			var res=[],idx=[],ret=[];
			if(isArray(spfList)){
				for(var i=0;i<spfList.length;i++){//条件优先级问题。。
					idx[i]=[];
					if(emp.dutyid==spfList[i].dutyid || spfList[i].dutyid=="" || !spfList[i].dutyid){
						if(emp.dutyid==spfList[i].dutyid){
							idx[i].push(1);
						}else{
							idx[i].push(0);
						}
						if(item.consumetype==spfList[i].consumetype || spfList[i].consumetype=="" || !spfList[i].consumetype){
							if(item.consumetype==spfList[i].consumetype){
								idx[i].push(1);
							}else{
								idx[i].push(0);
							}
							if(spfList[i].consumemode==9 || item.consumemode==spfList[i].consumemode || !spfList[i].consumemode){
								if(item.consumemode==spfList[i].consumemode){
									idx[i].push(3);
								}else{
									idx[i].push(2);
								}
								res.push(spfList[i]);
							}
						}
					}
					if(idx[i].length!=3){
						idx[i]=[0,0,1];
					}
				}
				if(res.length==0){
					if(!isEmptyObject(sidList)){//基础配置不为空  取基础配置
						return 1;
					}else{
						return -1;//匹配不到配置
					}
				}else if(res.length==1){
					return res[0];
				}else{//多个就进一步判断
					for(var j=0;j<idx.length;j++){//取出二维数组的数字组成新数组
						ret.push(parseInt(idx[j].join("")));
					}
					var max=Math.max.apply(null,ret);//取数组最大值
					var index=ret.indexOf(max);//获取最大值的索引
					return spfList[index];//输出最终结果

				}
			}
			if(!isEmptyObject(spfList)){
				if(emp.dutyid==spfList.dutyid || spfList.dutyid=="" || !spfList.dutyid){
					if(item.consumetype==spfList.consumetype || spfList.consumetype=="" || !spfList.consumetype){
						if(spfList.consumemode==9 || item.consumemode==spfList.consumemode || !spfList.consumemode){
							return spfList;
						}

					}
				}
				if(!isEmptyObject(sidList)){//基础配置不为空  取基础配置
					return 1;
				}
			}
		},
		computingfirstRule:function(spf,item,emp,card,basepre,rate){//高级配置计算方式
			var res={pre:convertPrice(basepre)},right=basepre,discount;
			discount=(card && card.discount && card.discount!="0")?card.discount:10;

			spf.dnumber=spf.dnumber==0?spf.dnumber.toString():spf.dnumber;//解决 0!="" 走false 的bug
			spf.dagionumber=spf.dagionumber==0?spf.dagionumber.toString():spf.dagionumber;

			res.dutytype=emp.dutytype;
			res.no=emp.no;
			var debtFlag = amGloble.metadata.configs.debtFlag*1;
			if(spf.dmode==0 && spf.dnumber!="" && spf.dnumber!=null){//0:固定业绩 1:水单业绩比例
				right=parseFloat(spf.dnumber);
				if(debtFlag && item.consumemode!=1 && item.consumemode!=4 && item.price!=0){
					right *=  (rate || 0);
				}
			}else if(spf.dmode==1 && spf.dnumber!="" && spf.dnumber!=null){
				right=(parseFloat(spf.dnumber)/100)*basepre;
			}
			if(spf.discount==1){//打折
				right=right*parseFloat(discount/10);
			}
			res.pre=convertPrice(right);
			if(spf.dagiomode==0 && spf.dagionumber!="" && spf.dagionumber!=null){//判断定扣方式 0:固定业绩 1:项目原价比例 2:项目业绩比例
				if(debtFlag && item.consumemode!=1 && item.consumemode!=4 && item.price!=0){
					res.pre=convertPrice(right-parseFloat(spf.dagionumber)*(rate || 0));
				}else {
					res.pre=convertPrice(right-parseFloat(spf.dagionumber));
				}
			}else if(spf.dagiomode==1 && spf.dagionumber!="" && spf.dagionumber!=null){
				if(debtFlag && item.consumemode!=1 && item.consumemode!=4 && item.price!=0){
					res.pre=convertPrice(right-(parseFloat(spf.dagionumber)/100)*item.cost*(rate || 0));
				}else {
					res.pre=convertPrice(right-(parseFloat(spf.dagionumber)/100)*item.cost);
				}
			}else if(spf.dagiomode==2 && spf.dagionumber!="" && spf.dagionumber!=null){
				res.pre=convertPrice(right-(parseFloat(spf.dagionumber)/100)*right);
			}
			return res;
		},
		getdataByValue:function(list,key,value){
			var res=[];
			if(isArray(list)){
				for(var i=0;i<list.length;i++){
					if(list[i].hasOwnProperty(key)){
						if(list[i][key]==value){
							res.push(list[i]);
						}
					}
				}
			}

			if(res.length==1){
				return res[0];
			}
			return res;
		},
		getpreruleBykey:function(config){//根据支付的key 获取相应的规则
			var payConfig=this.payConfig;
			var defreturn={shopper:100,empper:100},res={},key=config.paid,cardflag=0;
			var cardRule={cardfee:1,presentfee:2,dividefee:3,treatcardfee:4,treatpresentfee:5};//1 划卡 2 划赠送金 3划分期赠金 4划套餐卡金 5划套餐赠金
			config.paid.presentfee = config.paid.presentfee || 0;
			config.paid.cardfee = config.paid.cardfee || 0;
			config.paid.treatcardfee = config.card && config.card.treatcardfee || 0;
			config.paid.treatpresentfee = config.card && config.card.treatpresentfee || 0;
			for(var i in key){
				if(i=="deductpoint"){
					res[i]={shopper:0,empper:0};
					continue;
				}
				res[i]=defreturn;
				if(isArray(payConfig)){
					var ishigh=false;
					for(var j=0;j<payConfig.length;j++){
						if(i.toLowerCase()==payConfig[j].field.toLowerCase() && payConfig[j].status==1){
							if(!ishigh){
								res[i]=payConfig[j];
							}
						}else{
							if(cardRule[i]){
								for(var n=0;n<payConfig.length;n++){
									if(config.card && config.card.cardtypeid==payConfig[n].cardtypecode && cardRule[i] == payConfig[n].cardflag && payConfig[n].status==1){
										res[i]=payConfig[n];
										ishigh=true;
									}
								}
							}
						}
					}
				}
			}
			return res;

		}
	}
	return returnObj;
})(window,window.cashierTab || {});

//computingPerformance.init({empList:am.metadata.employeeList,itemList:am.metadata.classes})
//computingPerformance.init({empList:empList,itemList:itemList})
//
//computingPerformance.computing({paid:{cash:10,cooperation:9.8},card:{cardtypeid:4,discount:9},itemList:[{itemid:1,consumetype:1,consumemode:1,price:22,cost:19.8,empList:[{no:1001,dutytype:1,dutyid:101}]}]})
//

(function() {
    am.print = {
        init: function() {
            var self = this;
            this.$errorBox = $("#print_error_box");

            this.$errorBox.find("div.close").vclick(function() {
                self.$errorBox.hide();
            });
            this.$errorBox.find("div.printAgain").vclick(function() {
                self.$errorBox.hide();
                self.printDataStorage = null;
                self.print(self.serviceData);
            });

            this.$ = $('#printContent');
            this.$head = this.$.find('.head').remove();
            this.$li = this.$.find('li').remove();
            this.$ul = this.$.find('ul').remove();
            this.$list = this.$.find('.list').remove();
            this.$container = this.$.find('.container');
        },
        showErrorBox:function () {
	        this.$errorBox.show();
	        if(this.getPrintType() === 'usb'){
                this.$errorBox.addClass('usb');
            }else{
		        this.$errorBox.removeClass('usb');
            }
        },
        //text 文本，align 对齐方式，length 期望长度,按英文字符算
        formatString: function(text, align, length) {
            function strlen(str) {
                var len = 0;
                for (var i = 0; i < str.length; i++) {
                    var c = str.charCodeAt(i);
                    //单字节加1
                    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                        len++;
                    } else {
                        len += 2;
                    }
                }
                return len;
            };

            function cutstr(str, length) {
                var len = strlen(str);
                if (len > length) {
                    return str.substring(0, length);
                };
                return str;
            };
            var textlen = strlen(text);
            var result = "";
            if (align == "center") {
                var i = 0;
                for (; i < (length - textlen) / 2; i++) {
                    result += " ";
                };
                result += text;
                i += textlen;
                for (; i < length; i++) {
                    result += " ";
                };
                return result;
            } else if (align == "right") {
                var i = 0;
                for (; i < (length - textlen); i++) {
                    result += " ";
                };
                result += text;
                i += textlen;
                return result;
            } else {
                var i = 0;
                result += text;
                i += textlen;
                for (; i < length; i++) {
                    result += " ";
                };
                return result;
            }
        },
        //将输入的string切分成最长不超过length的几段
        splitString: function(str, length) {
            var splitArray = [];
            var len = 0;
            var lineStart = 0;
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                //单字节加1
                if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                    len++;
                } else {
                    len += 2;
                }
                if (len > length) {
                    splitArray.push(str.substring(lineStart, i - 1));
                    lineStart = i - 1;
                    len = len - length;
                }
            }
            splitArray.push(str.substring(lineStart, str.length));
            return splitArray;
        },
        splitLineString: function(text, linelength, line) {
            var textlen = strlen(text);
            if (textlen <= linelength * line) {
                return null;
            } else {
                var lastLength = (linelength * (line + 1)) > textlen ? textlen : (linelength * (line + 1));
                return text.substring(linelength * line, lastLength);
            }
        },
        spellServers: function(servers) {
            var self = this,info=[],str='';
            if (servers.length) {
                str="服 务 者 : ";
                for (var i = 0; i < servers.length; i++) {
                    var server = servers[i];
                    if (servers[i].empName) {
                        var serverNo = server.empNo;
                        var serverName = server.empName;
                        str += (serverNo + "-" + (serverName.substr(0,4) || "") +(server.pointFlag==1?'-指定':'')+' ');
                    }
                }
                info.push(str);
                info.push("--------------------------------");
            }
            return info;
        },
        print: function(serviceData, scb, fcb) {
            this.$prodItem = [];
            this.$serverItem = [];
            this.$cardItem = [];
            this.$chargeItem = [];
            this.$treatItem = [];
            //服务者
            var servantNameArray = [];
            if (!this.otherfeeNames) { //只会进来一次
                this.otherfeeNames = {}; //初始化一次
                var pc = am.metadata.payConfigs;
                for (var i = 0; i < pc.length; i++) {
                    if (pc[i].field.indexOf('OTHERFEE') != -1) { //过滤数据:只要包含带"OTHERFEE"
                        var field = pc[i].field;
                        this.otherfeeNames[field /*.replace('OTHERFEE',"")*/ ] = pc[i].fieldname;
                        this.otherfeeNames['COST_'+field /*.replace('OTHERFEE',"")*/ ] = pc[i].fieldname;   //开卡成本
                        this.otherfeeNames['FEE_'+field /*.replace('OTHERFEE',"")*/ ] = pc[i].fieldname;   //工本费
                    }
                }
            }
            /*console.log(this.payTypeName);
            console.log(Object.prototype.toString.call(this.payTypeName));*/
            this.serviceData = serviceData;
            var self = this;
            //服务数据
            var data = serviceData;
            console.log(data)
            var expenseCategory = data[1].expenseCategory;
            //租户名
            var tenantName = am.metadata.userInfo.shopName || "";
            console.log(tenantName);
            //操作者-用户名
            var operateName = am.metadata.userInfo.userName || "";
            console.log(operateName);
                //[单号]，有就显示，没有就不显示这一行
            var printDataBillNo = [];
            (data[1].billNo) && printDataBillNo.push(["流 水 号 : " + data[1].billNo, "normal"]);
            //顾客 [卡 ]
            var printDataCard = [],customerGender='';
            if (data[0]) { //会员
                //顾客+手机号
                var customerName = data[0].name;
                var customerTel = data[0].mobile;
                customerGender = data[1].gender=='F'?' (女客)':' (男客)';
                //会员卡+折扣
                var cardInfo = data[0].cardName;
                var cardDiscount = data[0].discount;
                console.log(cardDiscount);
                console.log((cardDiscount == 0 || cardDiscount == 10) ? "" : cardDiscount + "折")
                if (expenseCategory != 2) {
                    printDataCard.push("会员卡   : " + cardInfo + "  " + ((cardDiscount == 0 || cardDiscount == 10) ? "" : cardDiscount + "折"));
                }
            } else { //是散客的话 不显示会员卡这一条
                var customerName = "散客";
                var customerTel = "";
                customerGender = data[1].gender=='F'?' (女客)':' (男客)';
                var cardInfo = "";
                var cardDiscount = "";
            }
            console.log(printDataCard);
            //消费时间
            var consumeTime = data[1].consumeTime ? new Date(data[1].consumeTime - 0).format("yyyy-mm-dd HH:MM") : new Date().format("yyyy-mm-dd HH:MM");
            //初始化值
            //服务项目
            var serviceItem = data[1].serviceItems || [];
            //卖品
            var products = data[1].products;
            //卡类
            var card = data[1].card || null;
            //套餐
            var comboCard = data[1].comboCard || null;
            console.log(Boolean(comboCard));
            console.log(expenseCategory);
            var total = 0, //消费总额
                printItems = []; //打印项目
            var printDataTitle = [],prodPrintDataTitle = [],prodPrintItems = [],prodSales = [];
            var costNum = 0;//初始化工本费为零

	        if (expenseCategory == 1 || (expenseCategory==0 && products) ) { //卖品
                var productServersTotal = [];
		        prodPrintDataTitle = [
			        this.formatString("卖品", "left", 18) + this.formatString("数量", "left", 5) + "价格",
			        "--------------------------------"
		        ];
                this.$prodTitle = ['卖品','数量','价格'];
                this.$prodItem = [];
		        var productServers = products.servers;
                productServersTotal = productServersTotal.concat(productServers);
		        //卖品数据
		        for (var j = 0; j < products.depots.length; j++) {
			        var item = products.depots[j];
			        //项目名称，打印小票用
			        var itemName = item.productName;
			        var itemNum = item.number;
			        var itemPrice = item.salePrice;
			        var lineString = this.splitString(itemName, 16);
                    this.$prodItem.push([itemName,itemNum,'￥'+itemPrice]);
			        console.log(lineString);
			        prodPrintItems.push(this.formatString(lineString[0], "left", 16) + this.formatString(itemNum, "left", 5) + "￥" + itemPrice);
			        if (lineString[1] && lineString[1].length > 0) {
				        prodPrintItems.push(lineString[1]);
			        }
			        total = data[1].billingInfo.total-(data[1].billingInfo.treatfee || 0)-(data[1].billingInfo.treatpresentfee||0);
		        }
                if(!serviceItem.length){
                    servantNameArray=this.spellServers( productServersTotal || [] );
                }
	        }
            if (expenseCategory == 0) { //项目
                printDataTitle = [
                    this.formatString("项目", "left", 13) + this.formatString("数量/次数", "left", 10) + "价格/次数",
                    "--------------------------------"
                ];
                this.$serverTitle = ['项目','数量/次数','价格/次数'];
                this.$serverItem = [];
                //项目数据
                var comboItemMap={},itemServersTotal=[];
                if(serviceItem.length){
                    for(var j=0;j<serviceItem.length;j++){
                        var item=serviceItem[j];
                        if(item.consumeId){
                            if(comboItemMap[item.consumeId]){
                                comboItemMap[item.consumeId].use++;
                            }else{
                                comboItemMap[item.consumeId]={};
                                comboItemMap[item.consumeId].use = 1;
                                comboItemMap[item.consumeId].total = item.totalTimes;
                            }
                        }
                    }
                }
                console.log(comboItemMap);
                for (var i = 0; i < serviceItem.length; i++) {
                    var item = serviceItem[i];//分两种消费 普通项目消费和套餐消费
                    var itemServers = item.servers;
                    itemServersTotal = itemServersTotal.concat(itemServers);
                    servantNameArray=this.spellServers(itemServersTotal.concat( productServersTotal || [] ));
                    var itemName = item.itemName;//项目名称，打印小票用
                    var lineString = this.splitString(itemName, 16);
                    if(item.consumeId || item.isComboConsume){//套餐消费 显示剩余次数
                        var itemTimes = '';
                        if(item.totalTimes && comboItemMap[item.consumeId]){
                            if(item.totalTimes!=-99){
                                comboItemMap[item.consumeId].total = comboItemMap[item.consumeId].total -1;//项目剩余次数 套餐消费 显示 次数
                                itemTimes = comboItemMap[item.consumeId].total;
                            }else{
                                itemTimes=item.totalTimes;
                            }   
                        }
                        printItems.push(this.formatString(lineString[0], "left", 16) + this.formatString('1', "left", 9) + (itemTimes?(itemTimes==-99?'不限次':("余" +itemTimes+"次")):''));
                        this.$serverItem.push([itemName,1,(itemTimes?(itemTimes==-99?'不限次':("余" +itemTimes+"次")):'')]);
                        if (lineString[1] && lineString[1].length > 0) {
                            printItems.push(lineString[1]);
                        }
                    }else {//普通项目消费 显示价格
                        var itemPrice = item.salePrice;//项目价格 普通项目消费 显示 价格
                        printItems.push(this.formatString(lineString[0], "left", 16) + this.formatString("1", "left", 9) + "￥" + itemPrice);
                        this.$serverItem.push([itemName,1,'￥'+itemPrice]);
                        if (lineString[1] && lineString[1].length > 0) {
                            printItems.push(lineString[1]);
                        }
                    }
                    /*total += itemPrice;*/
                    
                }
                total = data[1].billingInfo.total-(data[1].billingInfo.treatfee || 0)-(data[1].billingInfo.treatpresentfee||0);
            } else if (expenseCategory == 2) { //开卡
                var present = data[1].billingInfo.presentFee;

                var btn = true;
                if(data[1].cardType && data[1].cardType == '2'){
                    //如果是资格卡，不显示"开卡","充值(赠送金)"
                    btn = false;
                }

                printDataTitle = [
                    this.formatString("开卡", "left", 18) + this.formatString("金额", "left", 7),
                    "--------------------------------"
                ];
                this.$cardTitle = ['开卡','金额',''];
                this.$cardItem = [];
                var item = card;
                var cardServers = item.servers;
                servantNameArray=this.spellServers(cardServers);
                var itemName = item.cardName;
                cardInfo = itemName;
                console.log(cardInfo)
                printDataCard.push("会员卡   : " + cardInfo + "  " + ((cardDiscount == 0 || cardDiscount == 10) ? "" : cardDiscount + "折"));
                total = data[1].billingInfo.total-(data[1].billingInfo.treatfee || 0)-(data[1].billingInfo.treatpresentfee||0);
                var money = total;

                //处理开卡"充值(赠送金)"不加工本费和欠款
                if(data[1].billingInfo.totalfeeanddebtfee){
                    money = money - data[1].billingInfo.totalfeeanddebtfee;
                }

                if(btn){
                    printItems.push(this.formatString("充值(赠送金" + present + ")", "left", 18) + this.formatString(money, "left", 7));
                    this.$cardItem.push(["充值(赠送金" + present+')','￥'+money,'']);
                }else{
                    //资格卡显示方式
                    money = '--';   //显示为'--'
                    printItems.push(this.formatString("资格卡", "left", 18) + this.formatString(money, "left", 7));
                    this.$cardItem.push(["资格卡",'￥'+money,'']);
                }
                if(data[1].cost){
	                costNum =data[1].cost;
                }
            } else if (expenseCategory == 3) { //充值
                var changeServers = data[1].card.servers;
                servantNameArray=this.spellServers(changeServers);
                var present = data[1].billingInfo.presentFee;
                var isRenewalCard = data[0].cardtype==2 || data[1].cardType==2;
                printDataTitle = [
                    this.formatString("充值", "left", 18) + this.formatString("金额", "left", 7),
                    "--------------------------------"
                ];
                this.$chargeTitle = ['充值','金额',''];
                this.$chargeItem = [];
                total = data[1].billingInfo.total-(data[1].billingInfo.treatfee || 0)-(data[1].billingInfo.treatpresentfee||0);
                var money = total;

                //处理充值"充值(赠送金)"不加工本费和欠款
                if(data[1].billingInfo.totalfeeanddebtfee && !isRenewalCard){
                    money = money - data[1].billingInfo.totalfeeanddebtfee;
                }
                if(isRenewalCard){
                    printItems.push(this.formatString("续卡", "left", 18) + this.formatString(money, "left", 7));
                    this.$chargeItem.push(['续卡','￥'+money,'']);
                }else {
                    printItems.push(this.formatString("充值(赠送金" + present + ")", "left", 18) + this.formatString(money, "left", 7));
                    this.$chargeItem.push(['充值(赠送金'+present+')','￥'+money,'']);
                }
            } else if (expenseCategory == 4) { //套餐
                printDataTitle = [
                    this.formatString("套餐", "left", 18) + this.formatString("次数", "left", 7),
                    "--------------------------------"
                ];
                this.$treatTitle = ['套餐','次数',''];
                this.$treatItem = [];
                var comboServers = comboCard.servers;
                servantNameArray=this.spellServers(comboServers);
                for (var k = 0; k < comboCard.treatments.length; k++) {
                    var comboTreatments = comboCard.treatments[k];
                    for(var l=0;l<comboTreatments.serviceItems.length;l++){
                        var comboCardItem = comboTreatments.serviceItems[l];
                        console.log(comboCardItem);
                        var comboCardItemName = comboCardItem.name;
                        // var comboCardItemPrice = Math.round(comboCardItem.money*100)/100;
                        var comboTimes = Math.round(comboCardItem.times*100)/100;
                        var lineString = this.splitString(comboCardItemName, 16);
                        printItems.push(this.formatString(lineString[0], "left", 18) + (comboTimes==-99?'不限次':comboTimes));
                        this.$treatItem.push([comboCardItemName,(comboTimes==-99?'不限次':comboTimes),'']);
                        if (lineString[1] && lineString[1].length > 0) {
                            printItems.push(lineString[1]);
                        }
                        //total += comboCardItemPrice;
                    }
                }
                total = data[1].billingInfo.total-(data[1].billingInfo.treatfee || 0)-(data[1].billingInfo.treatpresentfee||0);
                costNum = data[1].cost;
                if(costNum){//处理工本费要加 总计
                    total += costNum;
                }
            }
            //支付方式打印——循环所有支付方式，有值的push进去，没有就不push
            var payType = data[1].billingInfo;
            console.log(payType);
            var payTypeNameMap = {
                "cashFee": "现金",
                "unionPay": "银联",
                "pay": "支付宝",
                "weixin": "微信",
                "dpFee": "大众点评",
                "mall": "商场卡",
                "cooperation": "合作券",
                "cardFee": "划卡",
                "presentFee": "划赠送金",
                "divideFee": "分期赠送金",
                "voucherFee": "代金券",
                "debtFee": "欠款",
                "mdFee": "免单",
                "luckymoney": "红包",
                "coupon": "优惠券",
                "pointFee": "扣积分",
                // "treatfee": "套餐卡金",
                // "treatpresentfee": "套餐赠金",

                "cost_cashFee": "现金",
                "cost_unionPay": "银联",
                "cost_cooperation": "合作券",
                "cost_mall": "商场卡",
                "cost_weixin": "微信",
                "cost_pay": "支付宝",
                "cost_cardFee":  "卡金",
                "cost_presentFee":  "赠金",

                "fee_cashFee" : "现金",
                "fee_unionPay" : "银联",
                "fee_cooperation": "合作券",
                "fee_mall": "商场卡",
                "fee_weixin": "微信",
                "fee_pay": "支付宝",
                "fee_cardFee":  "卡金",
                "fee_presentFee":  "赠金"
            };
            var printDataPayType = [],printDataCostPayType=[];
            var printFeeType = ['工本费'];
            var printCostType = ['开卡成本'];
            $.each(payType, function(i, item) {
                if (item != 0 && item != null && i != "luckyMoneyId" && i != "weixinId" && i != "payId" && i != "dpId" && i != "eaFee" && i != "total" && i != "mallId" && i != "mallNo" && i != "dpCouponId"  && i != "totalfeeanddebtfee" && i != "treatfee" && i != "treatpresentfee") {
                    if (expenseCategory == 2 || expenseCategory == 3) {
                        if (i != "presentFee") {
                            if (i.indexOf('otherfee') != -1) {
                                var key = i.toUpperCase();
                                console.log(key);
                                if(i.indexOf('fee_otherfee') != -1){
                                    //printDataPayType.push(self.otherfeeNames[key] + "(工本费): ￥" + item);
                                    printFeeType.push(self.otherfeeNames[key] + ": ￥" + item);
                                }else{
                                    printDataPayType.push(self.otherfeeNames[key] + ": ￥" + item);
                                }
                            } else {
                                if(i.indexOf('fee_') != -1){
                                    printFeeType.push(payTypeNameMap[i] + ": ￥" + item);
                                }else{
                                    printDataPayType.push(payTypeNameMap[i] + ": ￥" + item);
                                }
                            }
                        }
                    } else {
                        if (i.indexOf('otherfee') != -1) {
                            var key = i.toUpperCase();
                            console.log(key);
                            console.log(self.otherfeeNames);
                            if(i.indexOf('cost_otherfee') != -1){   //处理新添加的开卡成本
                                //printDataPayType.push(self.otherfeeNames[key] + "(开卡成本): ￥" + item);
                                printCostType.push(self.otherfeeNames[key] + ": ￥" + item);
                            }else{
                                printDataPayType.push(self.otherfeeNames[key] + ": ￥" + item);
                            }
                        } else {
                            if(i.indexOf('cost_') != -1){
                                printCostType.push(payTypeNameMap[i] + ": ￥" + item);
                            }else{
                                printDataPayType.push(payTypeNameMap[i] + ": ￥" + item);
                            }
                        }
                    }
                }
            })
            console.log(printDataPayType);
            if(expenseCategory==3 && data[1].cardType==2){
                printDataPayType = [];
            }
            printDataPayType.length && (printDataPayType = ["--------------------------------"].concat(printDataPayType));

            if(printFeeType.length > 1){
                printDataPayType = printDataPayType.concat(printFeeType);
            }
            if(printCostType.length > 1){
                printDataPayType = printDataPayType.concat(printCostType);
            }

            console.log(printDataPayType);
            //二维码

            //获取本地暂存的短网址
            var savedCode = localStorage.getItem("TP_savedCode");
            if (savedCode) {
                savedCode = JSON.parse(savedCode);
            }

            //获取正确的长网址
            var qrcode = config.mykDownloadPage + am.metadata.userInfo.parentShopId;
            if (am.metadata.configs.showPromoteBarCode == "true" && am.metadata.configs.promoteBarLink) {
                qrcode = am.metadata.configs.promoteBarLink;
            }

            //如果长网址和暂存的短网址相同，则不请求新浪服务，直接使用
            if (savedCode && savedCode.long == qrcode) {
                qrcode = savedCode.short;
            } else if (qrcode.length > 50) {
                amGloble.getShortUrl(qrcode, function(ret) {
                    localStorage.setItem("TP_savedCode", JSON.stringify({
                        long: qrcode,
                        short: ret,
                    }));
                    qrcode = ret;
                }, function(ret) {})
            }
            //套餐卡 结算前 添加 工本费明细
            if(expenseCategory == 4 || expenseCategory == 2){//套餐
                if(costNum){
                    var costFeeObj = expenseCategory == 4 ? data[1].comboCard.costDetail : data[1].card.cost;
                    printDataCostPayType = [this.formatString("开卡成本 : ","left",15)].concat(printDataCostPayType);
                    $.each(costFeeObj,function(i,item){
                        if(item!=0&&i.indexOf('Id') == -1&&i!="total"){
                            if (i.indexOf('otherfee') != -1) {//是自定义支付方式
                                var key = i.toUpperCase();
                                printDataCostPayType.push(self.otherfeeNames[key] + ": ￥" + item);
                            }else{//不是自定义支付方式
                                printDataCostPayType.push(payTypeNameMap[i] + ": ￥" + item);
                            }
                        }
                    })
                }
            }
            var printData = [
                    [this.formatString(tenantName, "center", 16), "big", "bold"],
                    this.formatString("消费清单", "center", 32)
                ],
                printDataMore = [
                    ["消费时间 : " + consumeTime],
                ],
                /*printBillNo = [
                    ["消费时间 : " + consumeTime],
                ],*/
                printFooter = [
                    "--------------------------------",
                    this.formatString("总计: ", "right", 25) + "￥" + Math.round(total*100)/100,
                    // "--------------------------------",
                    // " ", this.formatString("客户签名: ", "right", 25) + "_______",
                    //[qrcode, "qrcode"],
                    //this.formatString(am.metadata.configs.promoteLiterature || "扫码查卡金,享优惠", "center", 32)
                ];
                if(data[1].hasOwnProperty('cardBalance')){
                    var balance = [
                        "--------------------------------",
                        this.formatString("卡金余额: ￥"+data[1].cardBalance),
                        this.formatString("赠金余额: ￥"+data[1].presentBalance),
                    ];
                    printFooter = printFooter.concat(balance);
                }
                printFooter.push("--------------------------------");
                printFooter.push(" ");
                printFooter.push(this.formatString("客户签名: ", "right", 25) + "_______");
                if(am.metadata.configs.isPrintQRcode != "true"){
                    //关闭了显示二维码
                    printFooter.push(" ");
                    printFooter.push([qrcode, "qrcode"]);
                    printFooter.push(this.formatString(am.metadata.configs.promoteLiterature || "扫码查卡金,享优惠", "center", 32));
                }
            //租户
            this.$.find('.tenantName').html(tenantName);
            //拼流水号//拼printDataBillNo
            printData = printData.concat(printDataBillNo);
            if(data[1].billNo){
                this.$.find('.billno').html(data[1].billNo).parent().show()
            }else {
                this.$.find('.billno').parent().hide()
            }
            
            //顾客
            printData = printData.concat("顾    客 : " + customerName + " " + customerTel + customerGender);
            this.$.find('.customer').html(customerName + " " + customerTel + customerGender);
            console.log(printData);
            //拼会员卡
            printData = printData.concat(printDataCard);
            if(data[0]){
                this.$.find('.card').html(cardInfo + "  " + ((cardDiscount == 0 || cardDiscount == 10) ? "" : cardDiscount + "折")).parent().show();
            }else {
                this.$.find('.card').parent().hide();
            }
            //拼printDataMore 消费时间
            printData = printData.concat(printDataMore);
            this.$.find('.time').html(consumeTime);
            //操作者
            printData = printData.concat("操 作 者 : " + operateName );//拼操作者
            this.$.find('.operator').html(operateName);
            //拼服务者
            // printData = printData.concat(servantNameArray);
            if(servantNameArray.length){
                var sArr0 = servantNameArray[0].split(' : ')[0];
                var sArr1 = servantNameArray[0].split(' : ')[1].split(' ');
                serverline1 = [sArr0+' : '+sArr1[0]];
                printData = printData.concat(serverline1);
                for(var i=1;i<sArr1.length;i++){
                    printData = printData.concat(['          '+sArr1[i]]);
                }
                printData = printData.concat(servantNameArray[1]);
            }
            if(servantNameArray.length){
                this.$.find('.server').html(servantNameArray[0].split(' : ')[1]).parent().show();
            }else {
                this.$.find('.server').parent().hide();
            }
            //拼printDataTitle
            printData = printData.concat(printDataTitle);
            //加入项目数据
            printData = printData.concat(printItems);

            if(prodPrintItems.length && printItems.length){
	            printData.push("--------------------------------");
            }
	        printData = printData.concat(prodPrintDataTitle);
	        printData = printData.concat(prodPrintItems);

            this.webPrintItemHtml();

            //拼支付方式
            printData = printData.concat(printDataPayType);
            this.$.find('.paytype').empty();
            var _printDataPayType = [];
            if(printDataPayType.length){
                if(printDataPayType[0][0]=='-'){
                    _printDataPayType = printDataPayType.slice(1);
                }else {
                    _printDataPayType = printDataPayType;
                }
            }
            if(_printDataPayType.length){
                for(var i=0;i<_printDataPayType.length;i++){
                    this.$.find('.paytype').append('<p>'+_printDataPayType[i]+'</p>');
                }
            }
            //拼开卡成本 支付方式
            printData = printData.concat(printDataCostPayType);
            if(printDataCostPayType.length){
                for(var i=0;i<printDataCostPayType.length;i++){
                    this.$.find('.paytype').append('<p>'+printDataCostPayType[i]+'</p>')
                }
            }
            
            //加入打印脚
            printData = printData.concat(printFooter);
            this.$.find('.total').html('总计: ￥'+Math.round(total*100)/100);

            if(data[1].hasOwnProperty('cardBalance')){
                this.$.find('.cardBalance').show().html('￥'+data[1].cardBalance);
                this.$.find('.presentBalance').show().html('￥'+data[1].presentBalance);
            }else {
                this.$.find('.cardBalance').parent().hide();
                this.$.find('.presentBalance').parent().hide();
            }
            

            console.log(printData);

            if(window.location.protocol.indexOf('http')!=-1){
                if(am.metadata.configs.isPrintQRcode != "true"){
                    this.$.find('.qrcode').show().find('img').attr('src',am.getQRCode(qrcode,200,200));
                    var img = new Image();
                    img.src = this.$.find('.qrcode').show().find('img').attr('src');
                    img.onload = function(){
                        window.print();
                    }
                }else {
                    this.$.find('.qrcode').hide();
                    window.print();
                }
                scb && scb();
                return;
            }

            //to do 调用打印接口
            if (this.printDataStorage == JSON.stringify(printData)) {
                this.showErrorBox();
                scb && scb();
                return;
            } else {
                this.printDataStorage = JSON.stringify(printData);
            }
            var printType = this.getPrintType();
            if(printType=='usb'){
                if(navigator.userAgent.indexOf("Windows")!==-1 && window.wPlugin) {
                    //wPlugin.print(content, {type: 2,printerSize:80,ip:"192.168.3.157",port:9100},function(ret){console.log('alert error:'+JSON.stringify(ret))})
                    wPlugin.print(printData, {type: 0,printerSize:58},function(ret){
                        console.info('wPlugin.print: callback:'+JSON.stringify(ret));
                        $.am.debug.log("成功：");
                        setTimeout(function() {
                            scb && scb();
                        }, 3000);
                    });
                }else if(navigator && navigator.appplugin && navigator.appplugin.usbPrint){

                    navigator.appplugin.usbPrint(printData,function(msgCode){
                        $.am.debug.log("成功：" + msgCode);
                        setTimeout(function() {
                            scb && scb(msgCode);
                        }, 3000);
                    },function(msg){
                        $.am.debug.log("失败：" + msg);
                        fcb && fcb(msg);
                    });

                }else{
                    fcb && fcb('没有可用的打印机');
                }
            }else{
                if(navigator.userAgent.indexOf("Windows")!==-1 && window.wPlugin) {
                    //wPlugin.print(content, {type: 2,printerSize:80,ip:"192.168.3.157",port:9100},function(ret){console.log('alert error:'+JSON.stringify(ret))})
                    wPlugin.print(printData, {type: 0,printerSize:58},function(ret){
                        console.info('wPlugin.print: callback:'+JSON.stringify(ret));
                        $.am.debug.log("成功：");
                        setTimeout(function() {
                            scb && scb();
                        }, 3000);
                    });
                }else if(navigator && navigator.appplugin && navigator.appplugin.btPrint){
                    navigator.appplugin.btPrint(printData, false, function(msgCode) {
                        $.am.debug.log("成功：" + msgCode);
                        setTimeout(function() {
                            scb && scb(msgCode);
                        }, 3000);
                    }, function(msg) {
                        $.am.debug.log("失败：" + msg);
                        fcb && fcb(msg);
                    });
                }else{
                    fcb && fcb('没有可用的打印机');
                }
            }
	        
            console.log(printData);
        },
        getPrintType:function(){
            var type = "bt",
                key  = "USERPRINT_" + amGloble.metadata.userInfo.userName;
                local = localStorage.getItem(key);
            var data = null;
            try{
                if(local){
                    data = JSON.parse(local);
                }
            }catch(e){
                data = null;  
            }
            if(data){
                type = data.type;
            }
            return type;
        },
        webPrintItemHtml:function(){
            this.$container.empty();
            if(this.$prodItem && this.$prodItem.length){
                this.renderItem(this.$prodTitle,this.$prodItem);
            }
            if(this.$serverItem && this.$serverItem.length){
                this.renderItem(this.$serverTitle,this.$serverItem);
            }
            if(this.$cardItem && this.$cardItem.length){
                this.renderItem(this.$cardTitle,this.$cardItem);
            }
            if(this.$chargeItem && this.$chargeItem.length){
                this.renderItem(this.$chargeTitle,this.$chargeItem);
            }
            if(this.$treatItem && this.$treatItem.length){
                this.renderItem(this.$treatTitle,this.$treatItem);
            }
        },
        renderItem:function(title,item){
            var $head = this.$head.clone(),                
                $ul = this.$ul.clone(),
                $list = this.$list.clone();
            $head.find('.name').html(title[0]);
            $head.find('.num').html(title[1]);
            $head.find('.price').html(title[2]);
            $list.append($head);
            var col3empty = 0;
            var openOrCharge = false;
            for(var i=0;i<item.length;i++){
                var $li = this.$li.clone();
                $li.find('.name').html(item[i][0]);
                $li.find('.num').html(item[i][1]);
                $li.find('.price').html(item[i][2]);  
                if(item[i][2]=='') {
                    col3empty ++;
                }
                $ul.append($li);
            }
            $list.append($ul);
            if(col3empty==item.length){
                var _li = $list.find('li');
                for(var i=0;i<item.length;i++){
                    _li.find('.price').remove();
                    $head.find('.price').remove();
                    if(title[0]=='充值' || title[0]=='开卡'){
                        _li.find('.name').css('width','60%');
                        _li.find('.num').css('width','40%');
                        $head.find('.name').css('width','60%');
                        $head.find('.num').css('width','40%');
                    }else {
                        _li.find('.name,.num').css('width','50%');
                        $head.find('.name,.num').css('width','50%');
                    } 
                }
            }
            this.$container.append($list);
        }
    };
    am.print.init();
})();

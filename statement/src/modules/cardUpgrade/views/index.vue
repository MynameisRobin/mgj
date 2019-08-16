<template>
	<div class="cardUpgrade" v-loading="initLoading">
		<div class="header" v-show="softgenre === '0'">
			<div class="rv-tab">
				<ul class="tabUl">
					<li>
						<div :class="['itemBtn',{'act': isShow}]" @click="clickTab(true)">方案配置</div>
					</li>
					<li v-if="!planShow">
						<div :class="['itemBtn',{'act': !isShow}]" @click="clickTab(false)">分配方案到门店</div>
					</li>
				</ul>
			</div>
			<div class="rv-tip" v-show="isShow">
				<div v-if="planShow">
					<span class="tipSpan">!</span>
					<p>暂无配置任何卡自动升级方案，请先到方案管理新增方案进行配置</p>
					<el-button class="ml20" type="primary" @click="openDialog">卡升级方案管理</el-button>
				</div>
				<div v-else>
					<span style="margin-right:10px;color:#333;">卡升级方案</span>
					<el-select v-model="schemeId" placeholder="请选择方案" @change="handleSelectionChange">
						<el-option v-for="(item, index) in planTableData" :key="index" :label="item.name" :value="item.id"></el-option>
					</el-select>
					<el-button class="ml20" type="primary" @click="openDialog">卡升级方案管理</el-button>
				</div>
			</div>
			<div class="rv-tip" v-show="!isShow">
				<span class="tipSpan">!</span>
				<p>多选门店可批量为门店分配方案</p>
				<el-button class="createBtn" type="primary" @click="openOperation">批量为门店分配方案</el-button>
			</div>
		</div>

		<!-- 方案配置 -->
		<div v-show="planTableData != '' && isShow || softgenre === '2' || softgenre === '3' || softgenre === '1'" class="cardUpgradeTable">
			<div class="scroll-table">
				<el-table border :data="ruleTableData" tooltip-effect="dark" style="width: 96%" :empty-text="softgenre === '2'? '直属店卡自动升级方案为总部统一配置，请联系总部配置': '还未添加任何升级规则'">
					<el-table-column label="要升级的卡类型" width="260" prop="cardTypeName">
						<template slot-scope="scope">
							<span>{{ scope.row['cardTypeName'] || "" }}</span>
						</template>
					</el-table-column>
					<el-table-column label="升级规则" prop="ruleModelList">
						<template slot-scope="scope">
							<div v-html="getRuleStr(scope.row['ruleModelList'])"></div>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="120" prop="operation" v-if='softgenre !== "2"'>
						<template slot-scope="scope">
							<am-icon class="icon" v-for="(v, i) in editTextList" @click.native="v.function(scope.row)" :key="i" :name="v.name"
							 :title="v.title"></am-icon>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="form-table" v-show='softgenre !== "2"'>
				<h3>{{ editFlag ? "为方案编辑规则" : "为方案增加规则" }}</h3>
				<el-form ref="form" :model="form" label-width="80px" label-position="left">
					<el-form-item label="会员卡">
						<el-select v-model="form.cardTypeId" placeholder="选择要升级的会员卡" @change="changeDisabled">
							<el-option v-for="(v, i) in cardList" :key="i" :label="v.cardTypeName" :value="v.cardTypeId+''"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="升级规则">
						<el-radio-group v-model="form.ruleType">
							<el-radio :label="1">单次充值</el-radio>
							<el-radio :label="2">累计充值</el-radio>
							<el-radio :label="3">剩余卡金</el-radio>
							<!-- <el-radio label="总卡扣金额"></el-radio> -->
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<div class="bg-gray">
							<ul>
								<li v-for="(item, index) in rechargeArr" :key="index" class="font12">
									<span class="mr">{{ form.ruleType == "3" ? "剩余卡金" : "充值满" }}</span>
									<el-input class="mr" style="width:75px;" v-model="item.money"></el-input>
									<span class="mr">升级为</span>
									<el-select class="mr" style="width:165px;" placeholder="选择要升级的会员卡" v-model="item.newCardTypeId" @change="filterSelectedCard">
										<el-option v-for="(v, i) in newCardList" :key="i" :disabled="v.selected" v-show="!v.disabled" :label="v.cardTypeName" :value="v.cardTypeId+''"></el-option>
									</el-select>

									<am-icon class="icon" name="fanganshanchu" title="删除" @click.native="delRuleList(index)" v-show="rechargeArr.length>1"></am-icon>
								</li>
							</ul>
							<div class="blue" @click="addRuleList" v-show="showAddBtn()">
								<am-icon :isElement="true" name="circle-plus-outline"></am-icon>
								<span>新增</span>
							</div>
						</div>
						<el-button class="mt20" type="primary" @click="confirmAddRule">确定</el-button>
						<el-button class="mt10" @click="resetRule">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>

		<!-- 分配方案到门店 -->
		<div class="planShopTable" v-show="!isShow" v-loading="planShopLoading">
			<el-table border :data="shopTableData" tooltip-effect="dark" style="width: 100%" empty-text="还未添加任何升级规则"
			 @selection-change="getShopNames">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column v-for="(item, index) in shopColumnData" :key="index" :width="item.width" :label="item.label" :prop="item.index">
					<template slot-scope="scope">
						<div v-if="item.label == '门店名称'">
							{{ scope.row.shopName || '' }}
						</div>
						<div v-if="item.label == '卡升级方案'" v-show="!scope.row['flag']" v-html="getPlanNameStr(scope.row['cardTypeResp'])">
						</div>
						<div v-if="item.label == '卡升级方案'" v-show="scope.row['flag']">
							<el-select
								v-model="scope.row.schemeId"
								clearable
								placeholder="请选择">
								<el-option
									v-for="item in planList"
									:key="item.id"
									:label="item.name"
									:value="item.id">
								</el-option>
							</el-select>
						</div>
						<div v-if="item.label == '操作'">
							<el-button v-show="!scope.row['flag']" class="purple" type="primary" @click="changeShopPlan(scope.row)">{{ scope.row.schemeId > 0 ? "替换方案" : "分配方案" }}</el-button>
							<el-button v-show="scope.row['flag']" class="mt10" @click="cancelShopEdit(scope.row)">取消</el-button>
							<el-button v-show="scope.row['flag']" class="mt10" type="primary" @click="saveShop(scope.row)">保存</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>

		<amDialog v-model="showDialog" width="758" ref="amDialog" title="卡升级方案管理" @input="closeDialog">
			<div class="planBox">
				<div class="planTitleList">
					<div class="title-item" v-for="(item, index) in planColumnData" :style="styleW(item.width)" :key="index">{{
						item.label }}</div>
				</div>
				<div class="columnBox" ref="popModelDD" v-loading="planLoading">
					<ul class="columnUl" v-if="planList.length>0">
						<columnLi v-for="(v, k) in planList" :index="k" :key="v.key || v.id" :planList="planList" :planData="v" :pid="parentShopId" @update="handleItemUpdate"
						 @copy="handleItemCopy" @delete="handleItemDelete" @cancle="handelItemCancel" @onSetting="handelItemSetting"></columnLi>
					</ul>
					<div class="emptyBox" v-if="planList == ''">暂无任何方案</div>
				</div>
			</div>
			<el-button class="mt20" type="primary" @click="addPlan">新增方案</el-button>
		</amDialog>
		<!-- 批量操作 -->
		<amDialog v-model="shopPlanFlag" width="500px" title="批量为门店分配置方案" ref="amDialog" @input="closeShopPlanDialog" v-loading="batchShopLoading">
			<el-form :inline="false" :model="form" size="small" :label-position="'right'" v-loading="boxLoading">
				<el-form-item label="门店">
					<el-popover
						placement="top-start"
						width="300"
						trigger="hover"
						:content="shopNameStr || ''">
						<span class="shopSpan" slot="reference">{{ shopNameStr || "" }}</span>
					</el-popover>
				</el-form-item>
				<el-form-item label="方案">
					<el-select v-model="schemeId" placeholder="请选择方案">
						<el-option v-for="(item, index) in planTableData" :key="index" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item style="text-align:left;margin-left:60px;">
					<el-button type="primary" @click="onBatchShopSubmit">确定</el-button>
				</el-form-item>
			</el-form>
		</amDialog>
	</div>
</template>

<script>
	/* eslint-disable */
	import Api from "@/api";
	import amDialog from "../components/dialog/index";
	import columnLi from "../components/column/index";
	import FindIndex from "lodash.findindex";

	export default {
		name: "Index",
		components: {
			amDialog,
			columnLi
		},
		data() {
			return {
				title: "卡自动升级",
				initLoading: false,
				boxLoading: false,
				//卡升级方案管理
				planLoading: false,
				showDialog: false,
				isShow: true,
				editFlag: false,
				editShopFlag: false,//编辑门店
				shopPlanFlag: false,//批量分配弹窗
				planShow:false,
				planShopLoading:false,
				batchShopLoading:false,
				cardList: [],
				newCardList: [],
				planList: [],
				shops: [],
				cardType: "",
				schemeId: undefined,
				editTextList: [{
						name: "fanganbianji",
						title: "编辑",
						function: this.onEdit
					},
					{
						name: "fanganshanchu",
						title: "删除",
						function: this.onDelete
					},
					{
						name: "fanganfuzhi",
						title: "复制",
						function: this.onCopy
					}
				],
				rechargeArr: [{
					rid: undefined,
					money: "", //充值金额阈值
					newCardTypeId: "", //新卡类型id
					newCardTypeName: "", //新卡名称
					function: this.delRuleList
				}],
				apiUrl: {
					//方案列表查询
					upgradeSchemeList: "/cardType!upgradeSchemeList.action",
					upgradeList: "/cardType!upgradeList.action",
					//卡规则查询
					schemeAndRuleList: "/cardType!schemeAndRuleList.action",
					//可用卡类型查询
					backCardTypeAva: "/cardType!backCardTypeAva.action",
					//新增卡升级类型规则
					cudRules: "/cardType!cudRules.action",
					//删除规则
					delRuleByCardTypeId: "/cardType!delRuleByCardTypeId.action",
					//查询分配方案到门店列表
					getSchemeToShop: "/cardType!getSchemeToShop.action",
					//批量门店分配
					toShop: "/cardType!toShop.action",
					//替换方案
					replaceSchemeToShop: "/cardType!replaceSchemeToShop.action",
					//删除单条规则
					delRuleByRid: "/cardType!delRuleByRid.action"
				},
				shopId: "",
				baseId: "",
				parentShopId: "",
				shopNameStr: "",
				softgenre: 0,
				form: {
					schemeId: "", //升级方案id
					ruleType: 1, //升级规则类型：1单笔充值;2累计充值;3剩余卡金;4总卡扣金额"cardTypeId": "5",
					cardTypeId: "", //旧卡类型id
					cardTypeName: ""
				},
				//方案标题
				planColumnData: [{
						label: "方案名称",
						width: "30%",
						index: "name"
					},
					{
						label: "适用门店",
						width: "50%",
						index: "shop"
					},
					{
						label: "操作",
						width: "20%",
						index: "operation"
					}
				],
				//规则标题
				ruleColumnData: [{
						label: "要升级的卡名称",
						width: "260",
						index: "cardTypeName"
					},
					{
						label: "升级规则",
						width: "",
						index: "ruleModelList"
					},
					{
						label: "操作",
						width: "120",
						index: "operation"
					}
				],
				//门店标题
				shopColumnData: [{
						label: "门店名称",
						width: "260",
						index: "shopName"
					},
					{
						label: "卡升级方案",
						width: "",
						index: "role"
					},
					{
						label: "操作",
						width: "260",
						index: "operation"
					}
				],
				planTableData: [],
				ruleTableData: [],
				shopTableData: []
			};
		},
		async mounted() {
			let res = await Api.getMetaData();
			let resData = res.data;
			const {
				code,
				content
			} = resData;
			if (code === 0) {
				const {
					shopId,
					softgenre,
					parentShopId
				} = content.userInfo;
				this.softgenre = softgenre;
				if (softgenre === "3") {
					this.parentShopId = shopId;
					this.baseId = parentShopId;
				} else {
					this.parentShopId = parentShopId;
				}
				this.shopId = shopId;
			}
			if(this.softgenre === "2" || this.softgenre === "3" || this.softgenre === "1"){
				await this.getRuleListData();
				if(this.softgenre === "3" || this.softgenre === "1"){
					await this.getBackCardTypeAva();
				}
			}else{
				await this.getPlanListData(true);
				await this.getBackCardTypeAva();
			}
		},
		methods: {
			selectedPlanList(){
				console.log(this.planTableData.length);
				if(this.planTableData.length > 0){
					this.schemeId = this.planTableData[0].id;
					this.getRuleListData();
				}
			},
			styleW(val) {
				return `width: ${val}`;
			},
			delRuleList(index) {
				if(this.editFlag){
					this.$confirm("此操作将删除该条规则, 是否继续?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning"
					}).then(() => {
						let params = {
							rid: this.rechargeArr[index].rid
						};
						this.initLoading = true;
						this.$http.post(this.apiUrl.delRuleByRid, params).then(res => {
							this.initLoading = false;
							const {
								content,
								code
							} = res.data;
							if (code === 0) {
								this.$message({
									message: "操作成功",
									type: "success"
								});
								this.recoverySelected(index);
								this.rechargeArr.splice(index, 1);
								this.getRuleListData();
							}
						});
					});
				}else{
					this.recoverySelected(index);
					this.rechargeArr.splice(index, 1);
					
				}
			},
			aviableCardLength(){
				let num = 0;
				this.newCardList.forEach((v) => {
					if(!v.disabled && !v.selected){
						num ++;
					}
				})
				return num;
			},
			showAddBtn(){
				return !this.form.cardTypeId || this.aviableCardLength() != 0 || (this.aviableCardLength() > 1 && this.rechargeArr.length < this.aviableCardLength());
			},
			openDialog() {
				this.showDialog = this.isShow;
			},
			closeDialog() {
				this.showDialog = false;
				this.getPlanListData();
			},
			clickTab(flag) {
				this.isShow = flag;
				this.schemeId = '';
				this.ruleTableData = [];
				if (!flag) {
					this.getSchemeToShopList();
				} else {
					this.getPlanListData(true);
				}
			},
			//检查input输入
			checkMoneyInput(val){
				this.rechargeArr.forEach(v =>{
					if(v.money == val){
						this.$message({
							type: "error",
							message: "填写金额不能重复"
						});
						return false;
					}
				});
			},
			resetRule() {
				//解除编辑(改为添加)
				this.editFlag = false;
				this.form.cardTypeId = "";
				this.form.ruleType = 1;
				this.rechargeArr = [{
					rid: undefined,
					money: "", //充值金额阈值
					newCardTypeId: "", //新卡类型id
					newCardTypeName: "" //新卡名称
				}];
			},
			//已选卡不能被自己升级
			changeDisabled(val) {
				let cardIndex = FindIndex(this.newCardList,v => val == v.cardTypeId);
				let timeflag = this.newCardList[cardIndex]['timeflag'];
				this.newCardList.forEach((v,i) => {
					v.selected = false;
					if (timeflag != v.timeflag || val == v.cardTypeId) {
						v.disabled = true;
					} else {
						v.disabled = false;
					}
				})
				//选择会员卡清空下面已选的会员卡
				this.rechargeArr.forEach((v)=>{
					v.newCardTypeId = '';
				});
				this.filterSelectedCard();
			},
			filterSelectedCard(val) {
				// console.log(JSON.parse(JSON.stringify(this.rechargeArr)))
				// console.log(JSON.parse(JSON.stringify(this.newCardList)))
				this.newCardList.forEach((value) => {
					value.selected = false;
					if(value.cardTypeId===val){
						value.selected = true;
					}
					let cardTypeId = value.cardTypeId;
					let index = FindIndex(this.rechargeArr,item => cardTypeId === item.newCardTypeId);
					if(index > -1){
						value.selected = true;
					}
				})
			},
			recoverySelected(index){
				let cardTypeId = this.rechargeArr[index].newCardTypeId;
				this.newCardList.forEach((v,i) => {
					if(v.cardTypeId==cardTypeId){
						v.selected = false;
					}
				})
			},
			getRuleStr(data) {
				let str = "",
					ruleTypeStr = "";
				if (data.length === 0) return str;
				data.forEach(v => {
					if (v.ruleType == 1) {
						ruleTypeStr = "单笔充值满";
					} else if (v.ruleType == 2) {
						ruleTypeStr = "累计充值满";
					} else if (v.ruleType == 3) {
						ruleTypeStr = "剩余卡金";
					}
					str +=
						"<span style='width:150px;display: inline-block;'>" +
						ruleTypeStr +
						(v.money || 0) +
						"元</span>" +
						v.newCardTypeName +
						"</br>";
				});

				return str;
			},
			//新增规则列表
			addRuleList() {
				this.rechargeArr.push({
					money: "", //充值金额阈值
					newCardTypeId: "", //新卡类型id
					newCardTypeName: "" //新卡名称
				});
			},
			//规则表单验证
			validateRuleList() {
				if (!this.schemeId && this.softgenre !== "3" && this.softgenre !== "1") {
					this.$message({
						type: "error",
						message: "请选择方案"
					});
					return false;
				}
				if (!this.form.ruleType) {
					this.$message({
						type: "error",
						message: "请选择升级规则"
					});
					return false;
				}
				if (!this.form.cardTypeId) {
					this.$message({
						type: "error",
						message: "请选择会员卡"
					});
					return false;
				}
				//如果是新增
				if(!this.editFlag){
					let cardIndex = FindIndex(
						this.ruleTableData,
						item => item.cardTypeId === this.form.cardTypeId
					);
					if(cardIndex > -1){
						this.$message({
							type: "error",
							message: "此会员卡已存在"
						});
						return false;
					}
				}
				return true;
			},
			getRuleList() {
				if (!this.validateRuleList()) return false;
				let ruleList = [];
				this.form.schemeId = this.schemeId;
				let cardIndex = FindIndex(
					this.cardList,
					item => item.cardTypeId === this.form.cardTypeId
				);
				if (cardIndex == -1) {
					this.$message({
						type: "error",
						message: "找不到指定的会员卡"
					});
					return false;
				}
				this.form.cardTypeName = this.cardList[cardIndex].cardTypeName;
				this.rechargeArr.forEach(v => {
					let newCardIndex = FindIndex(
						this.newCardList,
						item => item.cardTypeId === v.newCardTypeId
					);
					if(!(/(^[1-9]\d*$)/.test(v.money))){
						this.$message({
							type: "error",
							message: "金额必须输入正整数"
						});
						ruleList = false;
						return false;
					}
					if (newCardIndex == -1 || v.money <= 0) {
						this.$message({
							type: "error",
							message: "请将规则填写完整"
						});
						ruleList = false;
						return false;
					}
					let obj = {
						...this.form,
						rid: v.rid || undefined,
						money: v.money, //充值金额阈值
						newCardTypeId: v.newCardTypeId, //新卡类型id
						newCardTypeName: this.newCardList[newCardIndex].cardTypeName //新卡名称
					};
					ruleList.push(obj);
				});
				//是否重复金额
				if(this.isRepeat(this.rechargeArr)){
					this.$message({
						type: "error",
						message: "请不要填写重复金额"
					})
					return false;
				}
				return ruleList;
			},
			isRepeat(arr){
				let hash = {};
				for(var i in arr) {
					if(arr[i]['money'] == ""){
						return false;
					}
					if(hash[arr[i]['money']]){
						return true;
					} 
					hash[arr[i]['money']] = true;
				}
				return false;
			},
			async confirmAddRule() {
				let ruleList = [];
				ruleList = await this.getRuleList();
				if (!ruleList) return false;
				let params = {
					parentShopId: this.parentShopId,
					shopId: this.shopId,
					ruleList: ruleList
				};
				this.initLoading = true;
				this.$http.post(this.apiUrl.cudRules, params).then(res => {
					this.initLoading = false;
					const {
						content,
						code
					} = res.data;
					if (code === 0) {
						this.$message({
							message: "操作成功",
							type: "success"
						});
						this.resetRule();
						this.getRuleListData();
					}
				});
			},
			//改为编辑带入到右边
			onEdit(data) {
				if (!data) return;
				this.editFlag = true;
				let dataP = JSON.parse(JSON.stringify(data));
				if (dataP.ruleModelList.length > 0) {
					this.form.ruleType = dataP.ruleModelList[0].ruleType;
				}
				this.form.cardTypeName = dataP.cardTypeName || "";
				this.form.cardTypeId = dataP.cardTypeId || "";
				dataP.ruleModelList.forEach(v => {
					v.newCardTypeId = v.newCardTypeId + "";
				});
				this.rechargeArr = dataP.ruleModelList;

				let val = dataP.cardTypeId;
				let cardIndex = FindIndex(this.newCardList,v => val == v.cardTypeId);
				let timeflag = this.newCardList[cardIndex]['timeflag'];
				this.newCardList.forEach((v,i) => {
					v.selected = false;
					if (timeflag != v.timeflag || val == v.cardTypeId) {
						v.disabled = true;
					} else {
						v.disabled = false;
					}
				})
				this.filterSelectedCard();
			},
			onDelete(data) {
				this.$confirm("此操作将删除该方案, 是否继续?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}).then(() => {
					this.delProposal(data);
				});
			},
			onCopy(data){
				this.onEdit(data);
				this.editFlag = false;
				let dataP = JSON.parse(JSON.stringify(data));
				dataP.ruleModelList.forEach(v => {
					v.rid = '';
				});
				this.rechargeArr = dataP.ruleModelList;
			},
			delProposal(data) {
				let params = {
					cardTypeId: data.cardTypeId,
					parentShopId: this.parentShopId,
					id: this.schemeId
				};
				this.initLoading = true;
				this.$http.post(this.apiUrl.delRuleByCardTypeId, params).then(res => {
					this.initLoading = false;
					const {
						content,
						code
					} = res.data;
					if (code === 0) {
						this.$message({
							message: "操作成功",
							type: "success"
						});
						this.getRuleListData();
					}
				});
			},
			addPlan(index) {
				let obj = {
					key: this.rndNum(4),
					createTime: "",
					id: "",
					name: "",
					shops: null
				};
				this.planList.push(obj);
				this.$nextTick(() => {
					this.$refs.popModelDD.scrollTop = this.$refs.popModelDD.scrollHeight;
				});
			},
			//替换方案编辑状态
			changeShopPlan(data) {
				data.flag = true;
			},
			//取消编辑
			cancelShopEdit(data) {
				data.flag = false;
			},
			//保存方案到门店
			saveShop(data) {
				let params = {
					shopId: data.shopId,
					schemeIds: !data.schemeId ? [] : [data.schemeId]
					// parentShopId: this.parentShopId,
				}
				this.$http.post(this.apiUrl.replaceSchemeToShop, params).then(res => {
					this.initLoading = false;
					const {
						content,
						code
					} = res.data;
					if (code === 0) {
						data.flag = false;
						this.$message({
							message: "操作成功",
							type: "success"
						});
						this.getSchemeToShopList();
					}
				});
			},
			//批量操作open
			openOperation() {
				if (this.shops == "") {
					this.$message({
						message: "请勾选门店",
						type: "error"
					});
					return false;
				}
				this.shopPlanFlag = true;
			},
			handleSelectionChange(val) {
				this.schemeId = val;
				this.getRuleListData();
				this.resetRule();
			},
			getPlanNameStr(data) {
				if (!data) return;
				let str = '';
				data.forEach(v => {
					str += v.name + "</br>";
				});
				return str;
			},
			getShopNames(val) {
				let shopNameStr = "",
					shopIds = [];
				val.forEach(v => {
					shopIds.push(v.shopId);
					shopNameStr += v.shopName + "、";
				});
				this.shopNameStr = shopNameStr.substr(0,shopNameStr.length-1);
				this.shops = shopIds;
			},
			handleItemUpdate(data) {
				if (!data.item.id) {
					//新增
					// this.$nextTick(() => {
					// this.$refs.popModelDD.scrollTop = 0;
					// });
				} else {
					this.planList.splice(data.index, 1, data.item);
				}
			},
			handleItemCopy(data) {
				this.getPlanListData();
			},
			handleItemDelete(data) {
				this.planList.splice(data.index, 1);
			},
			handelItemCancel(data) {
				if (!data.item.id) {
					this.planList.splice(data.index, 1);
				}
			},
			handelItemSetting(data) {
				this.showDialog = false;
				this.schemeId = data.item.id;
				this.getPlanListData();
				this.getRuleListData();
			},
			closeShopPlanDialog() {},
			//方案管理查询
			getPlanListData(init) {
				this.planLoading = true;
				this.$http
					.post(this.apiUrl.upgradeSchemeList, {
						parentShopId: this.parentShopId
					})
					.then(res => {
						this.planLoading = false;
						const {
							content,
							code
						} = res.data;
						if (code === 0) {
							// this.addKey(content);
							this.planTableData = content;
							this.planList = content;
							if(content == ""){
								this.planShow = true;
							}else{
								this.planShow = false;
							}
							this.resetRule();
							if(init){
								this.selectedPlanList();
							}
						}
					});
			},
			//查询门店分配方案列表
			getSchemeToShopList() {
				this.planShopLoading = true;
				this.$http
					.post(this.apiUrl.getSchemeToShop, {
						parentShopId: this.parentShopId
					})
					.then(res => {
						this.planShopLoading = false;
						const {
							content,
							code
						} = res.data;
						if (code === 0) {
							let arr = [];
							if (!content.cardTypeResp) return false;
							content.shopDto.forEach(v => {
								let json = {
									cardTypeResp: [],
									schemeId: '',
									shopName: v.osName,
									shopId: v.shopId,
									flag: false
								};
								arr.push(json);
								content.cardTypeResp.forEach(r => {
									if (v.shopId == r.shopId) {
										json['cardTypeResp'].push(r);
										json['schemeId'] = r.schemeId;
									}
								});
							});
							this.shopTableData = arr;
						}
					});
			},
			//批量分配提交
			onBatchShopSubmit() {
				this.batchShopLoading = true;
				if (!this.schemeId) {
					this.$message({
						message: "请选择方案",
						type: "success"
					});
					return false;
				}
				this.$http
					.post(this.apiUrl.toShop, {
						parentShopId: this.parentShopId,
						schemeId: this.schemeId,
						shopIds: this.shops
					})
					.then(res => {
						this.batchShopLoading = false;
						const {
							content,
							code
						} = res.data;
						if (code === 0) {
							this.shopPlanFlag = false;
							this.$message({
								message: "操作成功",
								type: "success"
							});
							this.getSchemeToShopList();
						}
					});
			},
			//卡规则查询
			getRuleListData() {
				this.initLoading = true;
				let shopId = undefined;
				if(this.softgenre === "2" || this.softgenre === "3" || this.softgenre === "1"){
					shopId = this.shopId;
				}
				this.$http
					.post(this.apiUrl.schemeAndRuleList, {
						shopId: shopId,
						parentShopId: this.parentShopId,
						id: this.schemeId
					})
					.then(res => {
						this.initLoading = false;
						if (!res) {
							return console.log("res:", res);
						}
						const {
							content,
							code
						} = res.data;
						if (code === 0) {
							let cardUpgRuleDtoList = [];
							if(!content){
								this.ruleTableData = cardUpgRuleDtoList;
								return;
							}
							if(this.softgenre === "2" || this.softgenre === "3" || this.softgenre === "1"){
								content.forEach(v =>{
									v.cardUpgRuleDtoList.forEach(r=>{
										cardUpgRuleDtoList.push(r);
									})
								});
							}else{
								cardUpgRuleDtoList = content.cardUpgRuleDtoList;
							}
							this.ruleTableData = cardUpgRuleDtoList;
						}
					});
			},
			//可用卡类型
			getBackCardTypeAva() {
				this.initLoading = true;
				this.$http
					.post(this.apiUrl.backCardTypeAva, {
						parentShopId: this.parentShopId
					})
					.then(res => {
						this.initLoading = false;
						if (!res) {
							return console.log("res:", res);
						}
						const {
							content,
							code
						} = res.data;
						if (code === 0) {
							let arr = [];
							content.forEach((v,i)=>{
								if(v.cardTypeId != "20151212" && v.cardTypeId != "20161012" && v.cardTypeName != "资格卡"){
									arr.push(v);
								}
							})
							this.cardList = arr;
							this.newCardList = arr;
						}
					});
			},
			//四位随机KEY
			rndNum(n) {
				let rnd = "";
				for (var i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10);
				return rnd + "";
			}
		}
	};
</script>

<style lang="less">
	.cardUpgrade {
		overflow: hidden;
		padding: 15px;
		.purple {
			background: #9C30A0;
			border:1px solid #9C30A0;
			&.el-button--primary:hover{
				background: #9C30A0;
				border:1px solid #9C30A0;
			}
		}

		.icon{
			cursor: pointer;
		}

		.mt10 {
			margin-top: 10px;
		}

		.ml20{
			margin-left:20px;
		}

		.mt20 {
			margin-top: 20px;
		}

		.el-form-item__label,
		.el-checkbox__label,
		.el-radio__label,
		.shopSpan {
			font-size: 12px;
		}

		.header {
			.rv-tab {
				width: 100%;
				height: 32px;
				border-bottom: 1px solid #fc9252;

				.tabUl {
					li {
						float: left;
						margin-right: 5px;
					}

					.itemBtn {
						font-size: 12px;
						height: 31px;
						line-height: 31px;
						padding: 0 14px;
						color: #222;
						background: #eee;
						cursor: pointer;

						&.act {
							color: #fff;
							background: #fc9252;
						}
					}
				}
			}

			.rv-tip {
				margin-top: 15px;

				.tipSpan {
					display: inline-block;
					vertical-align: top;
					width: 15px;
					height: 15px;
					border: 1px solid #999;
					border-radius: 50%;
					font-size: 12px;
					color: #999;
					text-align: center;
					line-height: 12px;
					margin: 8px 5px;
				}

				p {
					display: inline-block;
					vertical-align: top;
					font-size: 12px;
					color: #999;
					line-height: 32px;
					height: 32px;
					margin-bottom: 0;
				}
			}

			.createBtn {
				float: right;
			}
		}

		.planShopTable {
			margin-top: 10px;
		}

		.cardUpgradeTable {
			margin-top: 10px;

			.scroll-table {
				width: calc(~"100%" - 526px);
				float: left;

				.iconfont {
					margin-right: 5px;
					cursor: pointer;
				}
			}

			.form-table {
				width: 525px;
				border-left: 1px solid #ebeef5;
				float: left;
				padding-left: 35px;

				.el-form {
					margin-top: 20px;
				}
			}

			.bg-gray {
				padding: 20px 10px 20px 20px;
				background: #fafafa;

				.font12{
					font-size: 12px;
				}

				.mr {
					margin-right: 5px;
				}

				ul {
					li {
						margin-bottom: 10px;
					}
				}

				.blue {
					cursor: pointer;
					color: #00aaee;
				}
			}
		}

		.am-dialog {
			font-size: 12px;

			.shopSpan {
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				display: inline-block;
				height: 32px;
				line-height: 32px;
				width: calc(~'100%' - 80px);
			}

			.font12 {
				font-size: 12px;
			}

			.el-form-item__label {
				width: 60px;
				text-align: center;
			}
		}

		.planBox {
			.planTitleList {
				height: 35px;

				.title-item {
					float: left;
				}
			}

			.columnBox {
				overflow: auto;
				height: 300px;
				border: 1px solid #ededed;
			}

			.emptyBox {
				padding-top: 20px;
				text-align: center;
				height: 200px;
				border: 1px solid #ededed;
			}

			.columnUl {
				font-size: 12px;

				.btn {
					display: inline-block;
					margin-right: 10px;
					cursor: pointer;

					&.primary {
						color: #00aaee;
					}
				}

				.itemLi {
					width: 100%;
					height: 45px;
					display: inline-block;
					background: #fff;

					&:nth-of-type(odd) {
						background: #fafafa;
					}

					.item {
						float: left;
						padding: 0 1em;
						height: 45px;
						line-height: 45px;
					}

					.name {
						width: 30%;
						text-overflow: ellipsis;
						overflow: hidden;
						white-space: nowrap;
					}

					.shop {
						width: 50%;
						text-overflow: ellipsis;
						overflow: hidden;
						white-space: nowrap;
					}

					.opeartion {
						width: 20%;

						.icon {
							margin-right: 5px;
							cursor: pointer;
						}
					}
				}
			}
		}
	}
</style>
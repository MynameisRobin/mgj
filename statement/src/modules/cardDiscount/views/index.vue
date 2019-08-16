<template>
	<div class="cardUpgrade" v-loading="initLoading">
		<div class="header" v-show="softgenre === '0'">
			<div class="rv-tab">
				<ul class="tabUl">
					<li>
						<div :class="['itemBtn',{'act': tabToggle}]" @click="clickTab(true)">方案配置</div>
					</li>
					<li v-if="!planShow">
						<div :class="['itemBtn',{'act': !tabToggle}]" @click="clickTab(false)">分配方案到门店</div>
					</li>
				</ul>
			</div>
			<div class="rv-tip" v-show="tabToggle">
				<div v-if="planShow">
					<span class="tipSpan">!</span>
					<p>暂无配置任何套餐包折扣方案，请先到方案管理新增方案进行配置</p>
					<el-button class="ml20" type="primary" @click="openDialog">方案管理</el-button>
				</div>
				<div v-else>
					<span style="margin-right:10px;color:#333;">套餐打折方案</span>
					<el-select v-model="schemeId" placeholder="请选择方案" @change="handleSelectionChange">
						<el-option v-for="(item, index) in planTableData" :key="index" :label="item.name" :value="item.id"></el-option>
					</el-select>
					<el-button class="ml20" type="primary" @click="openDialog">方案管理</el-button>
				</div>
			</div>
			<div class="rv-tip" v-show="!tabToggle">
				<span class="tipSpan">!</span>
				<p>多选门店可批量为门店分配方案</p>
				<el-button class="createBtn" type="primary" @click="openOperation">批量为门店分配方案</el-button>
			</div>
		</div>

		<!-- 方案配置 -->
		<div v-show="planTableData != '' && tabToggle || softgenre === '2' || softgenre === '3' || softgenre === '1'" class="cardUpgradeTable">
			<div class="scroll-table">
				<el-table border :data="ruleTableData" tooltip-effect="dark" style="width: 96%" :empty-text="softgenre === '2'? '直属店卡套餐包打折方案为总部统一配置，请联系总部配置': '还未添加任何折扣规则'">
					<el-table-column label="套餐" width="260" prop="cardTypeName">
						<template slot-scope="scope">
							<span class="treatTitle">{{ scope.row['treatPackageName'] || "" }}</span>
							<span style="tagRight">{{ scope.row['treatPackageMoney'] || 0 }}元</span>
						</template>
					</el-table-column>
					<el-table-column label="会员卡折扣" prop="ruleModelList">
						<template slot-scope="scope">
							<div v-for="(item,index) in scope.row['ruleModelList']" :key="index">
								<span class="treatTitle">{{ item.newCardTypeName || '' }}</span>
								<span class="tagRight">{{ (item.rate || '') + ruleTypeStr[item.ruleType] }}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="120" prop="operation" v-if='softgenre !== "2"'>
						<template slot-scope="scope">
							<div v-for="(q, r) in scope.row['ruleModelList']" :key="r">
								<am-icon class="icon" v-for="(v, i) in editTextList" @click.native="v.function(scope.row,r)" :key="i" :name="v.name"
							 	:title="v.title"></am-icon>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="form-table" v-show='softgenre !== "2"'>
				<h3>{{ editFlag ? "为方案编辑规则" : "为方案增加规则" }}</h3>
				<el-form ref="form" :model="form" label-width="80px" label-position="left">
					<el-form-item label="套餐包">
						<el-select v-model="form.treatPackageId" placeholder="选择套餐包" @change="selectChange" style="width:270px;">
							<el-option v-for="(v, i) in treatList" :key="i" :label="v.cardTypeName" :value="v.cardTypeId+''"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="会员卡">
						<el-select 
							style="width:270px;"
							multiple
							collapse-tags
							v-model="form.cardTypeIds"
							placeholder="选择会员卡">
							<el-option v-for="(v, i) in cardList" :disabled="v.disabled" :key="i" :label="v.cardTypeName" :value="v.cardTypeId+''"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="优惠模式">
						<el-radio-group v-model="form.ruleType" @change="resetRate">
							<div class='inputBox'>
								<el-radio :label="1" class="radio">折扣</el-radio>
								<el-input class="rateInput" size="mini" v-model="form.rate" v-if="form.ruleType === 1"></el-input>
								<div class="font" v-show="form.ruleType === 1">折</div>
							</div>
							<div class='inputBox'>
								<el-radio :label="2" class="radio">会员价</el-radio>
								<el-input class="rateInput" size="mini" v-model="form.rate" v-if="form.ruleType === 2"></el-input>
								<div class="font" v-show="form.ruleType === 2">元</div>
							</div>
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<el-button class="mt20" type="primary" @click="confirmAddRule">确定</el-button>
						<el-button class="mt10" @click="resetRule">取消</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>

		<!-- 分配方案到门店 -->
		<div class="planShopTable" v-show="!tabToggle" v-loading="planShopLoading">
			<el-table border :data="shopTableData" tooltip-effect="dark" style="width: 100%" empty-text="还未添加任何升级规则"
			 @selection-change="getShopNames">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column v-for="(item, index) in shopColumnData" :key="index" :width="item.width" :label="item.label" :prop="item.index">
					<template slot-scope="scope">
						<div v-if="item.label == '门店名称'">
							{{ scope.row.shopName || '' }}
						</div>
						<div v-if="item.label == '套餐打折方案'" v-show="!scope.row['flag']" v-html="getPlanNameStr(scope.row['cardTypeResp'])"></div>
						<div v-if="item.label == '套餐打折方案'" v-show="scope.row['flag']">
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
							<el-button v-show="!scope.row['flag']" class="purple" type="primary" @click="changeShopPlan(scope.row)">{{ scope.row.schemeId ? "替换方案" : "分配方案" }}</el-button>
							<el-button v-show="scope.row['flag']" class="mt10" @click="cancelShopEdit(scope.row)">取消</el-button>
							<el-button v-show="scope.row['flag']" class="mt10" type="primary" @click="saveShop(scope.row)">保存</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>

		<amDialog v-model="showDialog" width="758" ref="amDialog" title="方案管理" @input="closeDialog">
			<div class="planBox">
				<div class="planTitleList">
					<div class="title-item" v-for="(item, index) in planColumnData" :style="styleW(item.width)" :key="index">{{ item.label }}</div>
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
		<amDialog v-model="shopPlanFlag" width="500px" title="批量为门店分配置方案" ref="amDialog" v-loading="batchShopLoading">
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
				initLoading: false,
				boxLoading: false,
				planLoading: false,
				showDialog: false,
				tabToggle: true,//tab切换
				editFlag: false,
				editShopFlag: false,//编辑门店
				shopPlanFlag: false,//批量分配弹窗
				planShow:false,
				planShopLoading:false,
				batchShopLoading:false,
				treatList:[],//套餐
				cardList:[],//会员卡
				planList: [],
				shops: [],
				cardType: "",
				schemeId: undefined,
				shopId: "",
				baseId: "",
				parentShopId: "",
				shopNameStr: "",
				softgenre: 0,
				ruleTypeStr:{1:"折",2:"元"},
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
				apiUrl: {
					//方案列表查询
					treatSchemeList: "/cardType!treatSchemeList.action",
					//规则查询
					backTreatPackageAva: "/cardType!backTreatPackageAva.action",
					//会员卡列表查询
					backCardTypeAva: "/cardType!backCardTypeAvaByTreat.action",
					//规则查询
					treatRuleList: "/cardType!treatRuleList.action",
					//新增修改套餐规则
					cudTreatRules: "/cardType!cudTreatRules.action",
					//删除规则
					delRuleByTreatId: "/cardType!delRuleByTreatId.action",
					//查询分配方案到门店列表
					getSchemeToShop: "/cardType!getSchemeToShopByTreat.action",
					//批量门店分配
					toShop: "/cardType!toShop.action",
					//替换方案
					replaceSchemeToShop: "/cardType!replaceSchemeToShop.action"
				},
				form: {
					rids: [],
					schemeId: "", //套餐方案id(总部传值) ; 附属店:不传值
					ruleType: 1, //1折扣;2会员价
					cardTypeIds: [], //会员卡id
					rate:'',//折扣或会员价
					treatPackageId:""//套餐包id
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
				//门店标题
				shopColumnData: [{
						label: "门店名称",
						width: "260",
						index: "shopName"
					},
					{
						label: "套餐打折方案",
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
					await this.getBackTreatPackageAva();
				}
			}else{
				await this.getPlanListData(true);
				await this.getBackCardTypeAva();
				await this.getBackTreatPackageAva();
			}
		},
		methods: {
			resetRate(){
				this.form.rate = '';
			},
			selectChange(val){
				this.form.cardTypeIds = [];
				let arr = [];
				let index = FindIndex(this.ruleTableData,item=>item.treatPackageId == val);
				if(index > -1 && !this.editFlag){
					this.ruleTableData[index]['ruleModelList'].forEach(v=>{
						this.cardList.forEach(r=>{
							r.disabled = false;
							if((v.cardTypeId+",").indexOf(",") > -1){
								v.cardTypeId.split(",").forEach(a=>{
									if(a == r.cardTypeId){
										arr.push(r.cardTypeId);
									}
								});
							}
						});
					})
				}else{
					this.cardList.forEach(r=>{
						r.disabled = false;
					});
				}
				arr.forEach(v=>{
					this.cardList.forEach(r=>{
						if(v == r.cardTypeId){
							r.disabled = true;
						}
					})
				})
			},
			selectedPlanList(){
				if(this.planTableData.length > 0){
					this.schemeId = this.planTableData[0].id;
					this.getRuleListData();
				}
			},
			styleW(val) {
				return `width: ${val}`;
			},
			openDialog() {
				this.showDialog = this.tabToggle;
			},
			closeDialog() {
				this.showDialog = false;
				this.getPlanListData();
			},
			clickTab(flag) {
				this.tabToggle = flag;
				this.schemeId = '';
				this.ruleTableData = [];
				if (!flag) {
					this.getSchemeToShopList();
				} else {
					this.getPlanListData(true);
				}
			},
			resetRule() {
				//解除编辑(改为添加)
				this.editFlag = false;
				this.form = {
					rids: [],
					schemeId: "", //套餐方案id(总部传值) ; 附属店:不传值
					ruleType: 1, //1折扣;2会员价
					cardTypeIds: [], //会员卡id
					rate:'',//折扣或会员价
					treatPackageId:""//套餐包id
				}
				this.cardList.forEach(r=>{
					r.disabled = false;
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
				if (!this.form.treatPackageId) {
					this.$message({
						type: "error",
						message: "请选择套餐包"
					});
					return false;
				}
				if (this.form.cardTypeIds == "") {
					this.$message({
						type: "error",
						message: "请选择会员卡"
					});
					return false;
				}
				if (!this.form.ruleType) {
					this.$message({
						type: "error",
						message: "请选择优惠模式"
					});
					return false;
				}else{
					if(!this.form.rate){
						this.$message({
							type: "error",
							message: "请填写折扣或会员价"
						});
						return false;
					}
					if(this.form.ruleType === 1){
						let val = this.form.rate;
						if(!(/^(\d+\.\d{1,1}|\d+)$/.test(val) && (val > 0 && val <= 10))){
							this.$message({
								type: "error",
								message: "请输入合法折扣"
							});
							return false;
						}
					}else if(this.form.ruleType === 2){
						if(!/^[0-9]+([0-9]{1,10})?$/.test(this.form.rate)){
							this.$message({
								type: "error",
								message: "请输入合法正整数"
							});
							return false;
						}
					}
				}
				//如果是新增
				if(!this.editFlag){
					let cardIndex = FindIndex(
						this.ruleTableData,
						item => item.treatPackageId === this.form.treatPackageId
					);
					if(cardIndex > -1){
						for (var index = 0; index < this.form.cardTypeIds.length; index++) {
							let v = this.form.cardTypeIds[index];
							if(this.ruleTableData[cardIndex]){
								for(var i = 0;i<this.ruleTableData[cardIndex].ruleModelList.length;i++){
									let item = this.ruleTableData[cardIndex].ruleModelList[i];
									if(item.cardTypeId == v){
										this.$message({
											type: "error",
											message: "此套餐包会员卡配置已存在"
										});
										return false;
									}
								}
								
							}
						}
					}
				}
				return true;
			},
			getRuleList() {
				if (!this.validateRuleList()) return false;
				this.form.schemeId = this.schemeId;
				return [this.form];
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
				this.$http.post(this.apiUrl.cudTreatRules, params).then(res => {
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
			changeDisabled(cards){
				this.cardList.forEach(v =>{
					v.disabled = false;
					cards.forEach(r =>{
						if((r + '').indexOf(',') > -1){
							r.split(',').forEach(a =>{
								if(a == v.cardTypeId){
									v.disabled = true;
								}
							});
						}
						if(v.cardTypeId == r){
							v.disabled = true;
						}
					})
				});
			},
			//改为编辑带入到右边
			onEdit(data,index) {
				if (!data) return;
				this.editFlag = true;
				let dataP = JSON.parse(JSON.stringify(data));
				this.form.treatPackageId = dataP.treatPackageId || "";
				if (dataP.ruleModelList.length > 0) {
					let ruleIndex = dataP.ruleModelList[index];
					this.form.ruleType = ruleIndex.ruleType;
					this.form.rate = ruleIndex.rate;
					if((ruleIndex.cardTypeId-0) == ruleIndex.cardTypeId){
						this.form.cardTypeIds = ruleIndex.cardTypeId;
						if(typeof(ruleIndex.cardTypeId-0) == "number"){
							this.form.cardTypeIds = [ruleIndex.cardTypeId]
						}
					}else if(ruleIndex.cardTypeId.indexOf(",") > -1){
						this.form.cardTypeIds = ruleIndex.cardTypeId.split(",");
					}
					if((ruleIndex.rid-0) == ruleIndex.rid){
						this.form.rids = ruleIndex.rid;
						if(typeof(ruleIndex.rid-0) == "number"){
							this.form.rids = [ruleIndex.rid]
						}
					}else if(ruleIndex.rid.indexOf(",") > -1){
						this.form.rids = ruleIndex.rid.split(",");
					}

					let cards = [];
					dataP.ruleModelList.forEach((v,i)=>{
						if(i != index){
							cards.push(v.cardTypeId);
						}
					});
					this.changeDisabled(cards);
				}
			},
			onDelete(data,index) {
				let dataP = JSON.parse(JSON.stringify(data));
				let ruleIndex = dataP.ruleModelList[index];
				if (dataP.ruleModelList.length > 0) {
					if((ruleIndex.rid-0) == ruleIndex.rid){
						this.form.rids = ruleIndex.rid;
						if(typeof(ruleIndex.rid-0) == "number"){
							this.form.rids = [ruleIndex.rid]
						}
					}else if(ruleIndex.rid.indexOf(",") > -1){
						this.form.rids = ruleIndex.rid.split(",");
					}
				}
				this.$confirm("此操作将删除该方案, 是否继续?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning"
				}).then(() => {
					let params = {
						schemeIds:this.form.rids,
						parentShopId: this.parentShopId
					};
					this.delProposal(params);
				});
			},
			onCopy(data,index){
				this.onEdit(data,index);
				this.editFlag = false;
				this.form.rids = [];
				this.form.cardTypeIds = [];
				let dataP = JSON.parse(JSON.stringify(data));
				let ruleIndex = dataP.ruleModelList[index];
				this.cardList.forEach(v=>{
					if((ruleIndex.cardTypeId + '').indexOf(",") > -1){
						ruleIndex.cardTypeId.split(",").forEach(r=>{
							if(r == v.cardTypeId){
								v.disabled = true;
							}
						})
					}
					else if(v.cardTypeId == ruleIndex.cardTypeId){
						v.disabled = true;
					}
				})
			},
			delProposal(data) {
				this.initLoading = true;
				this.$http.post(this.apiUrl.delRuleByTreatId, data).then(res => {
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
			//方案管理查询
			getPlanListData(init) {
				this.planLoading = true;
				this.$http
					.post(this.apiUrl.treatSchemeList, {
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
			// 合并去重处理
			mergeTreat(data){
				let arr = [],
					json = {};
				data.forEach(v=>{
					let arr1 = [],
						json1 = {};
					if(v.ruleModelList.length > 0){
						//二级规则分类
						v.ruleModelList.forEach(r=>{ 
							if(json1[r.rate+"_"+r.ruleType]){
								let ridIndex = FindIndex(arr1,item => item.rate === r.rate && item.ruleType === r.ruleType);
								if(ridIndex > -1){
									arr1[ridIndex]['rid'] += ","+ r.rid;
									arr1[ridIndex]['cardTypeId'] += ","+ r.cardTypeId;
									arr1[ridIndex]['newCardTypeName'] += "、"+ r.newCardTypeName;
								}
							}else{
								arr1.push(r);
								json1[r.rate+"_"+r.ruleType] = true;
							}
						});
						v.ruleModelList = arr1;
					}
				});
				return data;
			},
			//规则查询
			getRuleListData() {
				this.initLoading = true;
				let shopId = undefined;
				if(this.softgenre === "2" || this.softgenre === "3" || this.softgenre === "1"){
					shopId = this.shopId;
				}
				this.$http
					.post(this.apiUrl.treatRuleList, {
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
							this.resetRule();
							let cardUpgRuleDtoList = [];
							if(!content){
								this.ruleTableData = cardUpgRuleDtoList;
								return;
							}
							// if(this.softgenre === "2" || this.softgenre === "3" || this.softgenre === "1"){
							// 	content.forEach(v =>{
							// 		v.cardUpgRuleDtoList.forEach(r=>{
							// 			cardUpgRuleDtoList.push(r);
							// 		})
							// 	});
							// }else{
								cardUpgRuleDtoList = content.cardUpgRuleDtoList;
							// }
							this.ruleTableData = this.mergeTreat(cardUpgRuleDtoList);
						}
					});
			},
			//套餐包列表
			getBackTreatPackageAva() {
				this.initLoading = true;
				this.$http.post(this.apiUrl.backTreatPackageAva, {
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
						this.treatList = content;
					}
				});
			},
			//会员卡列表 
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
								if(v.cardTypeId != "20151212" && v.cardTypeId != "20161012"){
									arr.push(v);
								}
							})
							this.cardList = arr;
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

		.el-select__tags-text{
			max-width: 160px;
			display: inline-block;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}
		.el-select .el-tag__close.el-icon-close{
			right: -5px;
    		top: -4px;
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

			.treatTitle{
				width: 72%;
				float: left;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				margin-right: 5px;
			}
			
			.tagRight{
				float: right;
			}

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

				.inputBox{
					height: 35px;
    				line-height: 35px;
					.radio{
						width:65px;
						height:35px;
						line-height:35px;
					}
					.rateInput{
						width:70px;
						margin-left:10px;
					}
					.font{
						color:#909090;
						font-size:12px;
						margin-left:10px;
						display: inline-block;
					}
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
				height: 300px;
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
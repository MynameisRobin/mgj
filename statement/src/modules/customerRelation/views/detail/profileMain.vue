<template>
	<div class="customer_detail_profile">
		<!-- 基础资料相关 -->
		<div class="customer_profile_content">
			<router-view ref="mychild" @openlocking="openlocking" :sourceName="sourceName"></router-view>
		</div>
		<!-- 固定显示信息 -->
		<div class="customer_profile_fixed">
			<div class="customer_list">
				<el-tooltip class="item" effect="dark" content="绑定微信公众号" placement="top">
					<span>
						<am-icon size="20px" name="weixin" :class="memberData.mgjwebactivated == 1 ? 'weixin nopointer' : 'gary nopointer'"></am-icon>
					</span>
				</el-tooltip>
				<el-tooltip class="item" effect="dark" content="星标客" placement="top">
					<span @click="showFavor"><am-icon size="20px" name="CombinedShape" :class="memberData.isFavor == 1 ? 'yellow' : 'gary'"></am-icon></span>
				</el-tooltip>
				<el-tooltip class="item" effect="dark" content="消费后向顾客发送金额提醒短信" placement="top">
					<span @click="showMemberSms"><am-icon size="20px" name="xinxi" :class="memberData.notifysms == 1 && smsflag == 1 ? 'blue' : 'gary'"></am-icon></span>
				</el-tooltip>
				<el-tooltip class="item" effect="dark" content="顾客签名" placement="top">
					<span @click="autograph"><am-icon size="20px" name="qianming" :class="isSignature == 1 ? 'blueqian' : 'gary'"></am-icon></span>
				</el-tooltip>
				<el-tooltip class="item" effect="dark" content="扣除向顾客发送短信的信息费用" placement="top">
					<span @click="deductsmsfeeflag"><am-icon size="20px" name="kou" :class="memberData.deductsmsfeeflag == 1 && kedeductsmsfeeflag ? 'orange' : 'gary'"></am-icon></span>
				</el-tooltip>
				<el-tooltip class="item" effect="dark" content="锁定会员" placement="top">
					<span @click="lockvisble"><am-icon size="20px" name="suo" class="gary" :class="memberData.locking == 2 ? 'green' : 'gary'" ></am-icon></span>
				</el-tooltip>
			</div>
			<el-form label-width="100px" class="demo-ruleForm">
				<el-form-item label="管理员工：" prop="username" class="user_form">
					<userpop-select 
						size="mini"
						:popover-width="240"
						v-model="filterData.empIds"
						:options="viewEmps"
						:props="{label: 'name', id: 'id'}"
						collapse-tags
						@delEmp="delEmp"
						@updEmpCusts="updEmpCusts"
						placeholder="请选择">
						<template slot="label" slot-scope="{option}">
							<span style="color: #b6b6b6; display: inline-block;" :title="option.empno">{{ option.empno | cutString(5) }}</span>
							<span :title="option.name">{{ option.name | cutString(8) }}</span>
						</template>
					</userpop-select>
				</el-form-item>
				<el-form-item label="所属门店：" prop="username" class="user_form zhuan">
					<el-select v-model="shopname" placeholder="请选择" @change="getSelect" :disabled="singleStore ? true : false">
						<el-option
							v-for="item in shopsDirectly"
							:key="item.id"
							:label="item.osName"
							:value="item.value">
						</el-option>
						<el-option
							v-if="subordinate"
							key="999999"
							label="其他门店"
							value="其他门店">
						</el-option>
					</el-select>
					<span class="shift" @click="transferShop" v-if="!singleStore">转移</span>
				</el-form-item>
				
				<el-form-item label="标签：" prop="tag" class=" user_form">
					<pop-select 
						size="mini"
						:popover-width="240"
						v-model="filterData.tagIds"
						:options="tagsList"
						@addTags="addTags"
						:props="{label: 'tagName', id: 'tagId'}"
						collapse-tags
						placeholder="请选择">
						<template slot="label" slot-scope="{option}">
							<span :title="option.tagName">{{ option.tagName  | cutString(8)}}</span>
						</template>
					</pop-select>
				</el-form-item>
				<el-form-item label="会员分类：">
                    <span>{{memberData && memberData.classname ? memberData.classname : '--'}}</span>
				</el-form-item>
				<el-form-item label="顾客状态：">
                    <span>{{memberData && memberData.memberstatus}}</span>
				</el-form-item>
				<el-form-item label="消费周期：">
					<el-input v-model="memberData && memberData.mgjconsumeperiod" placeholder="请输入内容" class="zhouqi" @change="consumeRound(memberData.mgjconsumeperiod)"></el-input> 天
				</el-form-item>
			</el-form>
			<div class="consumedata">
				<div class="xiaof">
					消费数据
				</div>
				<el-form label-width="100px" class="demo-ruleForm">
					<el-form-item label="上次消费：" prop="beforecon">
						<span>{{lastconsumetime}}</span>
					</el-form-item>
					<el-form-item label="注册时间：" prop="zhu">
						<span>{{registdate}}</span>
					</el-form-item>
					<el-form-item label="消费金额：" prop="conmoney">
                        <span>￥{{mgjlast12mtotal}}</span>
					</el-form-item>
					<el-form-item label="客单价：" prop="dan">
						<span>￥{{avgfee}}</span>
					</el-form-item>
					<el-form-item label="消费次数：" prop="count">
						<span>{{memberData && memberData.mgjlast12mfreq}}</span>
					</el-form-item>
					<el-form-item label="消费间隔：" prop="distance">
						<span v-if="lastconsumetime && lastconsumetime != '--'">{{totalOnlineCredit}}天</span>
						<span v-else>--</span>
					</el-form-item>
					<el-form-item label="项目覆盖：" prop="fudate" class="fuCover">
						<span class="fugai" v-for="(sub, index) in itemcover" :key="index">{{sub}} <b>、</b></span>
						<span v-if="itemcover && itemcover.length == 0">--</span>
					</el-form-item>
				</el-form>
			</div>
		</div>
		<el-dialog
			title="星标客"
			:visible.sync="favorVisiable"
			width="30%"
			>
			<span>{{memberData && memberData.isFavor == 1 ? '取消星标客' : '点亮星标客？'}}</span>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="favorSumbit">确 定</el-button>
				<el-button @click="favorVisiable = false">返回</el-button>
			</span>
		</el-dialog>
		<el-dialog
			title="发送短信"
			:visible.sync="dialogVisible"
			width="30%"
			>
			<span>{{memberData && memberData.notifysms == 1 && smsflag == 1 ? '取消向顾客发送短信？' : '开通向顾客发送短信？'}}</span>
			<span slot="footer" class="dialog-footer">
				
				<el-button type="primary" @click="updateMemberSms">确 定</el-button>
				<el-button @click="dialogVisible = false">返回</el-button>
			</span>
		</el-dialog>
	    <el-dialog
			title="会员锁定"
			:visible.sync="lockingVisible"
			width="30%"
			>
			<span>{{memberData && memberData.locking == 2 ? '确认解除会员锁定' : '确认锁定会员'}}</span>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="locking">确 定</el-button>
				<el-button @click="lockingVisible = false">返回</el-button>
			</span>
		</el-dialog>
	    <el-dialog
			title="扣除信息费"
			:visible.sync="kouVisible"
			width="30%"
			>
			<span>{{memberData && memberData.deductsmsfeeflag == 1 ? '取消扣除该顾客信息费' : '开通扣除该顾客信息费'}}</span>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="kou">确 定</el-button>
				<el-button @click="kouVisible = false">返回</el-button>
			</span>
		</el-dialog>
		<el-dialog
			title="查看签名"
			:visible.sync="qVisible"
			width="30%">
			<span class="qianname"><img :src="qianname" alt=""></span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="qVisible = false">取 消</el-button>
				<el-button type="primary" @click="qVisible = false">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog
			title="门店转移"
			:visible.sync="mendialogVisible"
			width="30%"
			class="menRate"
		>
			<el-select v-model="shopname" placeholder="请选择" @change="getSelect" width="318px">
				<el-option
					v-for="item in shopsAttache"
					:key="item.id"
					:label="item.osName"
					:value="item.value">
				</el-option>
			</el-select>
			<span slot="footer" class="dialog-footer">
				<el-button @click="mendialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="mendialogVisible = false">确 定</el-button>
			</span>
		</el-dialog>
		<verifiy-modal v-if="verVisible" @transferShopmate="transferShopmate"></verifiy-modal>
	</div>
</template>
<script>
import Api from '@/api'
import Dayjs from 'dayjs'
const DateFormatType = 'YYYY-MM-DD'
import MetaDataMixin from '#/mixins/meta-data'
import PopSelect from "#/components/pop-select";
import UserpopSelect from "#/components/userpop-select";
import VerifiyModal from "#/components/verifiy-modal";
import {getPicture, imgClass} from '@/utils/imgConfig';
export default {
	name: 'customerProfile',
	components: {
		PopSelect,
		UserpopSelect,
		VerifiyModal
	},
	mixins: [
		MetaDataMixin,
	],
	data() {
		return {
			favorVisiable: false,
			mendialogVisible: false,
			verVisible: false,
			memberData: {},
			root: null,
			qVisible: false,
			qianname: '',
			shopname: '',
			dialogVisible: false,
			lockingVisible: false,
			kouVisible: false,
			queryData: {
				memberid: this.$route.params.id,
			},
			filterData: {
				empIds: undefined,
				tagIds: undefined
			},
			viewEmps: [],
			tagsList: [],
			toShopId: null,
			lastconsumetime: null,
			registdate: '',
			smsflag: 0, // 是否可以发短信的卡
			kedeductsmsfeeflag: 0, // 是否有可扣费的短信
			totalOnlineCredit: 0,
			mgjlast12mtotal: 0, // 消费金额
			avgfee: 0, // 客单价
			shopsList: [],
			shopsTitle: '',
			isParentId: null,
			isSignature: 0,
			subordinate: false, // 判断是否是直属店
			sourceName: [],
			itemcover: [],
			singleStore: false,
			cardTypes: []
		}
	},
	created() {
		this.root = this.$parent;
	},
	async mounted() {
		// 判断是否有签名
		const res = await Api.getMetaData();
		this.initLoading = false;
		const resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
		}
		const updateTs = new Date().getTime();
		const avatar = getPicture("signature", {
			itemData: {
				parentShopId: this.$eventBus.env.userInfo.baseId || this.parentShopId,
			},
			filename: `${this.$route.params.id}.png`,
		})
			
		this.qianname = avatar;
		let oImg = new Image();
		oImg.src = avatar;
		let that = this
		oImg.onload = function () {
			that.isSignature = 1
		}
		
		oImg.onerror = function () {
			that.isSignature = 0
		};
		this.$parent.root.getMemberDetail().then(content => {
			this.getbaseInfo(content)
			this.getData(content.memberInfo.shopid, this.parentShopId)
			// this.getByShopid(content.memberInfo.shopid)
			let shopid = this.memberData.shopid
			this.shopname = this.shopMaps[shopid].osName
			let CurrentShop = this.getCurrentShopsType(shopid)
			this.updateShops(CurrentShop)
		})
		this.$eventBus.$on('delete_member_card', this.judgeNotifysms);
	},
	destroyed() {
		this.$eventBus.$off('delete_member_card', this.judgeNotifysms);
	},
	computed: {
		// 判断直属门店还是附属店
		shopsDirectly() {
			// 获取所有的门店
			let shopsArr = this.$eventBus.env.shops
			let toShopId = this.toShopId && Number(this.toShopId)
			let shopid = toShopId || this.memberData.shopid && Number(this.memberData.shopid)
			let shopsDirectlyArr = shopsArr && shopsArr.filter(subItem => subItem.id !== shopid).map(shopsDir => {
				const {
					value
				} = shopsDir
				shopsDir.value = `${shopsDir.osName}|${shopsDir.id}|${shopsDir.parentId}`
				return shopsDir
			})
			if (shopid) {
				if (this.getCurrentShopsType(shopid) === "2") {
					this.subordinate = true
					return shopsDirectlyArr && shopsDirectlyArr.filter(item => item.softgenre === "2")
				} else {
					this.subordinate = false
					return shopsDirectlyArr
				}
			}

		},

		// 获取附属以及其他门店
		shopsAttache() {
			let shopsArr = this.$eventBus.env.shops
			let shopsList = shopsArr && shopsArr.filter(subItem => subItem.softgenre !== "2").map(sub => {
				const {
					value
				} = sub
				sub.value = `${sub.osName}|${sub.id}|${sub.parentId}`
				return sub
			})
			return shopsList
		}
	},
	methods: {
		// 更新会员门店
		updateShops(softgenre) {
			if (softgenre === "3") {
				this.subordinate = false
			} else if (softgenre === "1") {
				this.singleStore = true
			} else {
				this.singleStore = false
				this.subordinate = true
			}
		},
		
		// 格式化数据
		getbaseInfo(content) {
			this.memberData = content.memberInfo;
			const { shopid, itemCover } = this.memberData;
			this.itemcover = itemCover ? this.convertItemClasses(itemCover, shopid) : [];
			this.avgfee = this.memberData && this.memberData.avgfee.toFixed('2')
			this.filterData.empIds = this.memberData.custEmpInfos && this.memberData.custEmpInfos.map(item => item.empId) ? this.memberData.custEmpInfos.map(item => item.empId) : undefined
			this.filterData.tagIds = this.memberData.customerTags && this.memberData.customerTags.map(item => item.tagId) ? this.memberData.customerTags.map(item => item.tagId) : undefined
			this.mgjlast12mtotal = this.memberData && this.memberData.mgjlast12mtotal ? this.memberData.mgjlast12mtotal.toFixed('2') : 0;
			this.lastconsumetime = this.memberData && this.lastconsumetimeDecorator(this.memberData.lastconsumetime, 'YYYY-MM-DD');
			this.registdate = this.memberData && this.memberData.registdate ? Dayjs(this.memberData.registdate).format(DateFormatType) : ''
			let totalOnlineCredit = Number(this.memberData.mgjlast12mfreq) > 0 ? parseInt((Number(this.memberData.lastconsumetime) - Number(this.memberData.registdate)) / (Number(this.memberData.mgjlast12mfreq))) : (Number(this.memberData.lastconsumetime) - Number(this.memberData.registdate))
			this.totalOnlineCredit  = Math.round(totalOnlineCredit && (totalOnlineCredit / (3600 * 24 * 1e3)));
			this.judgeNotifysms(content.cards);
			// this.getNewData(content.memberInfo.shopid, content.memberInfo.parentshopid, this.parentShopId, content.cards)
		},

		async judgeNotifysms(cards) {
			const { shopid } = this.memberData;
			const shopData = this.findShopById(shopid);
			let cardTypes = this.$eventBus.env.cardTypes;
			if (shopData.softgenre === '3') {
				const {
					shopid: shopId,
					parentshopid: parentId,
				} = this.memberData;
				const res = await Api.searchCondition({
					shops: [{
						shopId,
						parentId,
						parentshopId: this.parentShopId,
					}]	
				});
				const resData = res.data;
				if (resData.code === 0) {
					cardTypes = resData.content.cardTypes;
				}
			}
			this.showNotifysms(cardTypes, cards)
		},

		// 显示短信问题
		showNotifysms(cardTypesList, cardsdata) {
			let cards = cardsdata.length > 1 ? cardsdata.filter(item => {
				const {
					cardfee,
					presentfee,
					discount,
					cardtypeid
				} = item;
				return cardtypeid !== '20151212' || (cardtypeid === '20151212' && (cardfee > 0 || presentfee > 0 || (discount && discount !== '0' && discount !== '10')))
			}) : cardsdata;
			let smsflag = 0;
			let deductsmsfeeflagli = 0;
			let cardTypesMap = {};
			let cardTypes = cardTypesList
			// 获取卡类型
			for (let i = 0; i < cardTypes.length; i++) {
				cardTypesMap[cardTypes[i].cardtypeid] = cardTypes[i]
			}
			for (let item = 0; item < cards.length; item++) {
				let cardType = cardTypesMap[cards[item].cardtypeid]
				if (cardType) {
					if (cardType.smsflag === "1") {
						smsflag = 1
					}
					if (cardType.deductsmsflag === "1" ) {
						deductsmsfeeflagli = 1
					}
				}
			}
			this.smsflag = smsflag
			this.kedeductsmsfeeflag = deductsmsfeeflagli
		},

		// 获取最新的searchCondition数据
		// getNewData(id, parentId, parentshopId, cards) {
		// 	this.tableLoading = true;
		// 	const shops = [{
		// 		shopId: id,
		// 		parentId,
		// 		parentshopId,
		// 	}]
		// 	this.$http.post('/member!searchCondition.action', {shops}).then(res => {
		// 		this.tableLoading = false;
		// 		const resData = res.data;
		// 		if (resData.code === 0) {
		// 			this.cardTypes = resData.content && resData.content.cardTypes
		// 			this.showNotifysms(this.cardTypes, cards)
		// 		}
		// 	}).catch(() => {
		// 		this.tableLoading = false;
		// 	})
		// },

		// 获取当前所属门店类型
		getCurrentShopsType(id) {
			const shopData = this.findShopById(id);
			return shopData.softgenre;
		},

		// 修改刷新会员列表
		getcustomerData() {
			const data = {
				memberid: this.queryData.memberid,
				empId: this.$eventBus.env.userInfo.userId,
				shopId: this.$eventBus.env.userInfo.shopId,
				parentShopId: this.parentShopId
			}
			this.$http.post('/memberDetail!detail.action', data).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					this.memberData.isFavor = resData.content.memberInfo.isFavor
					this.memberData.mgjconsumeperiod = resData.content.memberInfo.mgjconsumeperiod
					this.filterData.empIds = resData.content.memberInfo.custEmpInfos && resData.content.memberInfo.custEmpInfos.map(item => item.empId) ? resData.content.memberInfo.custEmpInfos.map(item => item.empId) : undefined
					this.filterData.tagIds = resData.content.memberInfo.customerTags && resData.content.memberInfo.customerTags.map(item => item.tagId) ? resData.content.memberInfo.customerTags.map(item => item.tagId) : undefined
					this.$parent.root.updateMemberDetail(resData.content)
				}	
			}).catch(() => {
				this.tableLoading = false;
			})
		},
		
		// 显示星标客弹框
		showFavor() {
			this.favorVisiable = true
		},
		// 更新星标客
		favorSumbit() {
			const uri = this.memberData.isFavor === 1 ? `/memberDetail!delMemFavor.action` : `/memberDetail!addMemFavor.action`;
			let that = this
			const data = {
				memid: that.queryData.memberid,
				parentShopId: that.$eventBus.env.userInfo.parentShopId,
				shopId: that.memberData.shopid,
				empid: that.$eventBus.env.userInfo.userId,
				userType: 0
			}
			this.$http.post(uri, data).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					that.favorVisiable = false
					that.$message.success("修改成功")
					that.getcustomerData()
				} else {
					that.favorVisiable = false
				}
			})
		},
		// 显示发送短信弹框
		showMemberSms() {
			if (!this.smsflag) {
				this.$message.info("无可发短信的会员卡")
				return
			} else {
				this.dialogVisible = true
			}
		},
		// 扣除短信费发送短信
		updateMemberSms() {
			const uri = `/memberDetail!updateMemberSms.action`;
			let that = this
			let notifySms = Number(that.memberData.notifysms) === 1 ? 0 : 1;
			const data = {
				memId: that.queryData.memberid,
				notifySms: notifySms,
				voteSms: 0,
				cutSms: this.memberData.deductsmsfeeflag,
				deductSmsFeeFlag: this.memberData.deductsmsfeeflag,
			}
			this.$http.post(uri, data).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					that.dialogVisible = false
					that.memberData.notifysms = Number(that.memberData.notifysms) === 1 ? 0 : 1
					that.$message.success("修改成功")
					that.getcustomerData()
				} else {
					that.dialogVisible = false
				}
			})
		},
		// 解锁和锁定权限
		lockvisble() {
			if (this.$eventBus.env.userInfo.operateStr.indexOf('U1') !== -1) {
				this.lockingVisible = true
			} else {
				if (this.memberData.locking === 2) {
					this.$message.info("无权限解锁会员")
				} else {
					this.$message.info("无权限锁定会员")
				}
			}
		},
		// 会员锁定
		locking() {
			const uri = `/memberDetail!locking.action`;
			let that = this
			let locking = Number(that.memberData.locking) === 2 ? 1 : 2;
			const data = {
				memberid: that.queryData.memberid,
				locking: locking,
			}
			this.$http.post(uri, data).then(res => {
				const resData = res.data;
				if (resData.code === 0) {
					that.lockingVisible = false
					that.memberData.notifySms = Number(that.memberData.notifySms) === 1 ? 0 : 1
					that.memberData.locking = that.memberData.locking === 2 ? 1 : 2
					if (that.memberData.locking === 2) {
						that.$message.success("锁定成功")
					} else {
						that.$message.success("解锁成功")
					}
					this.getcustomerData()
				} else {
					that.lockingVisible = false
				}
			})
		},

		// 打开锁定弹框
		openlocking() {
			this.lockingVisible = true
		},
		
		// 获取标签
		getData(id, parentShopId) {
			this.tableLoading = true;
			const shopData = this.findShopById(id) || {};
			const shops = [{
				shopId: id,
				parentId: shopData.parentId,
				parentShopId,
			}]
			Api.searchCondition({shops}).then(res => {
			// this.$http.post('/member!searchCondition.action', {shops}).then(res => {
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					const {
						tagsByShop,
						empsByShop,
						customerSource
					} = resData.content;
					this.tagsList = tagsByShop && tagsByShop.map(item => {
						const {
							tagId,
							tagName,
						} = item
						item.tagId = item.TAGID
						item.tagName = item.TAGNAME
						return item
					})
					this.viewEmps = empsByShop && empsByShop.map(item => {
						const {
							empname,
							empid
						} = item;
						item.name = empname;
						item.id = empid;
						return item;
					})

					this.sourceName = customerSource;
				}
			}).catch(() => {
				this.tableLoading = false;
			})
		},

		// 获取手艺人
		// getByShopid(id) {
		// 	this.tableLoading = true;
		// 	const shops = {
		// 		shopid: id,
		// 		parentShopId: this.parentShopId
		// 	}
		// 	this.$http.post('/memberDetail!getByShopid.action', shops).then(res => {
		// 		this.tableLoading = false;
		// 		const resData = res.data;
		// 		if (resData.code === 0) {
		// 			this.viewEmps = resData.content && resData.content && resData.content.map(item => {
		// 				const {
		// 					name,
		// 					id,
		// 				} = item
		// 				item.name = item.empname
		// 				item.id = item.empid
		// 				return item
		// 			})
		// 		}
		// 	}).catch(() => {
		// 		this.tableLoading = false;
		// 	})
		// },

        // 获取门店
		getSelect(event) {
			this.toShopId = event.split("|")[1]
			this.shopsTitle = event.split("|")[0]
			this.isParentId = event.split("|")[2]
			this.shopname = this.shopsTitle
			if (event === "其他门店") {
				this.mendialogVisible = true
			}
		},

		// 会员门店转移
		transferShop() {
			this.shopsList = this.$eventBus.env
			let shopid = this.memberData.shopid
			if (this.$eventBus.env.userInfo.operateStr.indexOf('a8') === -1) {

				if (this.toShopId !== this.isParentId && this.getCurrentShopsType(shopid) === "2") {
					this.$confirm(`确认要将此顾客转移至${this.shopsTitle}吗?`, '提示!', {
						confirmButtonText: '确定',
						cancelButtonText: '返回',
						type: 'warning'
					}).then(() => {
						this.verVisible = true
					}).catch(() => {
						this.$message({
							type: 'info',
							message: '已取消门店转移'
						});
						this.shopname = this.shopMaps[shopid].osName
						this.verVisible = false
					});	
				} else {
					this.$confirm('门店的项目与会员卡等数据是独立配置，转移顾客资料可能造成数据不匹配，请谨慎！', '警告!', {
						confirmButtonText: '确定',
						cancelButtonText: '返回',
						type: 'warning'
					}).then(() => {
						this.verVisible = true
					}).catch(() => {
						this.$message({
							type: 'info',
							message: '已取消门店转移'
						});
						this.shopname = this.shopMaps[shopid].osName
						this.verVisible = false
					});
				}
			} else {
				this.$message.info("无权操作顾客门店转移")
			}
		},

		// 门店转移权限问题
		transferShopmate(code) {
			this.tableLoading = true;
			if (this.toShopId === null) {
				this.$message.info("请选择需要转移的门店")
			} else {
				const data = {
					shopId: this.shopId,
					memberId: this.queryData.memberid,
					toShopId: this.toShopId,
					operator: this.$eventBus.env.userInfo.userName,
					code
				}
				this.$http.post('/memberDetail!transferShop.action', data).then(res => {
					this.tableLoading = false;
					const resData = res.data;
					if (resData.code === 0) {
						this.getcustomerData()
						this.shopsList = this.$eventBus.env
						this.$message.success("门店转移成功");
						// this.getByShopid(this.toShopId)
						this.getData(this.toShopId, this.parentShopId)
						this.verVisible = false
					} else {
						let shopid = this.memberData.shopid
						this.shopname = this.shopMaps[shopid].osName
					}
				}).catch(() => {
					this.tableLoading = false;
					this.$message.success("门店转移失败");
				})
			}
		},

		// 分配管理员
		updEmpCusts(key, item, id) {
			this.tableLoading = true;
			if (id.length === 0) {
				this.$message.info("请选择管理员工")
			} else {
				const data = {
					shopId: this.memberData.shopid,
					type: 3,
					customerids: this.memberData.id,
					parentShopId: this.parentShopId,
					parentId: this.parentId,
					employeeIds: id.join(','),
					currentEmployeeId: 0
				}
				this.$http.post('/member!updEmpCusts.action', data).then(res => {
					this.tableLoading = false;
					const resData = res.data;
					if (resData.code === 0) {
						this.$message.success("管理员工添加成功")
						this.getcustomerData()
					} else if (resData.code === 20190402) {
						this.filterData.empIds = this.memberData.custEmpInfos && this.memberData.custEmpInfos.map(item => item.empId) ? this.memberData.custEmpInfos.map(item => item.empId) : undefined
					}
				}).catch(() => {
					this.tableLoading = false;
				})
			}
		},

		// 删除管理员工
		delEmp(key, item, id) {
			const data = {
				shopId: this.memberData.shopid,
				memberid: this.queryData.memberid,
				empId: id
			}
			this.$http.post('/memberDetail!delCustEmpAndFavor.action', data).then(res => {
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					this.getcustomerData()
					this.$message.success("管理员工删除成功")
				}
			}).catch(() => {
				this.tableLoading = false;
			})
			
		},

		// 添加标签
		addTags(key, item, id) {
			this.tableLoading = true;
			let tags = item && item.map(sub => {
				const {
					type,
					parentShopId,
					memShopId,
					memId,
				} = sub;
				sub.type = 1,
				sub.parentShopId = this.parentShopId,
				sub.memId = this.$route.params.id
				sub.memShopId = this.memberData.shopid
				delete sub.SHOPID;
				return sub
			})
			const data = {
				memberId: this.$route.params.id,
				shopId: this.memberData.shopid,
				tags
			}
			
			this.$http.post('/memberDetail!addTags.action', data).then(res => {
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					this.getcustomerData()
					this.$message.success("标签编辑成功")
				}
			}).catch(() => {
				this.tableLoading = false;
			})
		},

		// 确认扣短信
		kou() {
			let deductsmsfeeflag = Number(this.memberData.deductsmsfeeflag) === 1 ? 0 : 1;
			const data = {
				memId: this.queryData.memberid,
				notifySms: this.memberData.notifySms,
				voteSms: this.memberData.votesms,
				cutSms: deductsmsfeeflag === 1 ? 0 : 1,
				deductSmsFeeFlag: deductsmsfeeflag,
			}
			this.$http.post('/memberDetail!updateMemberSms.action', data).then(res => {
				this.tableLoading = false;
				const resData = res.data;
				if (resData.code === 0) {
					let that = this
					that.memberData.deductsmsfeeflag = deductsmsfeeflag
					this.getcustomerData()
					this.$message.success("修改成功")
				}
			}).catch(() => {
				this.tableLoading = false;
			})
			this.kouVisible = false;
		},

		// 扣短信费
		deductsmsfeeflag() {
			if (!this.kedeductsmsfeeflag) {
				this.$message.info("无可扣信息费的会员卡");
				return
			} else {
				this.kouVisible = true;
			}	
		},
		autograph() {
			const updateTs = new Date().getTime();
			const avatar = getPicture("signature", {
				itemData: {
					parentShopId: this.$eventBus.env.userInfo.baseId || this.parentShopId,
				},
				filename: `${this.$route.params.id}.png`,
			})
			
			this.qianname = avatar;
			let oImg = new Image();
			oImg.src = avatar;
			let that = this
			oImg.onload = function () {
				that.qVisible = true
			}
			
			oImg.onerror = function () {
				that.$message.info("该顾客没有留下签名")
			};
			
		},

		// 消费周期
		consumeRound(value) {
			if (parseInt(value) > 4 && parseInt(value) < 61) {
				let data = {
					parentShopId: this.parentShopId,
					id: this.$route.params.id,
					mgjconsumeperiod: value ? value : 0
				}
				this.$http.post('/memberDetail!updateMemPeriod.action', data).then(res => {
					this.tableLoading = false;
					const resData = res.data;
					if (resData.code === 0) {
						this.getcustomerData()
						this.$message.success("修改成功")
					}
				}).catch(() => {
					this.tableLoading = false;
				})
			} else {
				this.$message.info("请输入5-60天消费周期")
				this.getcustomerData()
				return
			}
		}
	},
}
</script>


<style lang="less">
.customer_profile_content {
	float: left;
	width: calc(100% - 325px);
	height: 100vh;
}
.customer_profile_fixed {
	width: 325px;
	height: 100vh;
	float: right;
	background:rgba(252,251,251,1);
	overflow-y: auto;
	&::-webkit-scrollbar {
		width: 1px; /*对垂直流动条有效*/
		height: 1px; /*对水平流动条有效*/
	}
	&::-webkit-scrollbar-track{
		-webkit-box-shadow: inset 0 0 6px #fcfbfb;
		background-color: #fcfbfb;
		border-radius: 1px;
	}
	.customer_list {
		padding: 16px 0px 25px 24px;
		color: #ccc;
		span {
			text-align: center;
			display: inline-block;
			width: 38px;
		}
		.icon {
			width: 20px;
			height: 20px;
			border-radius: 50%;
			display: inline-block;
			cursor: pointer;
		}
		.nopointer {
			cursor: default !important;
		}
		.blue {
			color: #2978E3;
		}
		.blueqian {
			color: #439FFF;
		}
		.green {
			color: #B1D74A;
		}
		.weixin {
			color: #13BF25;
		}
		.yellow {
			color: #FFB900
		}
		.orange {
			color: #FF8754;
		}
	}
	.demo-ruleForm {
		span {
			text-overflow: ellipsis;
			overflow: hidden;
		}
		.el-form-item__label {
			font-size:12px;
			color:rgba(102,102,102,1);
		}
		.user_form {
			.popover_select_container {
				width: 180px;
				display: inline-block;
			}
		}
		.zhuan {
			.el-select {
				width: 142px;
				input {
					background-color: #fcfbfb;
					text-overflow: ellipsis;
					border: none;
					padding: 0;
				}
				.el-input__suffix {
					display: none;
				}
			}
		}
		span {
			color: #222222;
			font-size:12px;
		}
		.shift {
			padding: 0px 0px 0px 10px;
			color: #2978E3;
			cursor: pointer;
		}
		.el-dropdown {
			cursor: pointer;
			.el-form-item {
				margin: 0px;
			}
		}
		.el-form-item {
			margin: 5px 0px;
		}

	}
	.consumedata {
		.xiaof {
			padding: 16px 0px 13px 30px;
			font-size:13px;
			font-weight:bold;
			color:rgba(34,34,34,1);
			margin-top: 15px;
		}
		span {
			font-size:12px;
			color:rgba(34,34,34,1);
		}
		.el-form-item {
			margin-bottom: 0px;
			line-height:15px;
		}
		.el-form-item__content {
			margin-left: 100px;
			width: 170px;
			b {
				font-weight: normal
			}
		}
		span:last-child {
			b {
				display: none;
			}
		}
	}
}
.el-dropdown-menu {
	padding: 18px 59px 18px 18px;
}
.zhouqi {
	width: 100px !important;
}
.qianname {
	img {
		width: 100%;
	}
}
.fuCover {
	.el-form-item__content {
		line-height: 20px !important;
		padding-top: 6px;
	}
}
// 门店转移
.menRate input {
	width: 316px !important;
}
</style>

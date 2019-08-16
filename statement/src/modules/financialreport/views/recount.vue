<template>
	<div id="recount">
		<amDialog v-model="showDialog" width="600px" title="重算业绩/提成" ref="amDialog" @input="closeDialog">
			<el-form :inline="false" :model="form" :label-position="'right'" v-loading="boxLoading">
				<el-form-item label="重算模块：">
					<el-select v-model="actionName" @change="handleChangeModule">
						<el-option value="baseEmpGain" label="提成"></el-option>
						<el-option value="baseEmpFee" label="业绩"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="消费类型：" v-if="actionName === 'baseEmpGain'">
					<el-select v-model="form.consumeType" @change="handleChangeConsumeType">
						<el-option label="项目" :value="0"></el-option>
						<el-option label="卖品" :value="1"></el-option>
						<el-option label="开卡" :value="2"></el-option>
						<el-option label="充值" :value="3"></el-option>
						<el-option label="套餐" :value="4"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="重算类型：">
					<el-radio-group v-model="form.label" @change="radioChange">
						<el-radio-button 
							v-for="item in radios"
							:key="item.type"
							:label="item.label"
							:disabled="item.type === 3 && form.consumeType !== 0">
						</el-radio-button>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="门　　店：" v-if="shopFlag">
					<el-select v-model="form.shopId" filterable placeholder="请选择门店" @change="changeShop">
						<el-option
						v-for="(item) in shops"
						:key="item.id"
						:softgenre="item.softgenre"
						:label="item.shopName"
						:value="item.id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="员工级别：" v-if="dutyFlag">
					<el-select v-model="form.dutyId" filterable placeholder="请选择员工级别">
						<el-option
						v-for="(item,index) in employeeLevels"
						:key="index"
						:label="item.name"
						:value="item.dutyId">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="员　　工：" v-if="empFlag">
					<el-select v-model="form.empId" filterable placeholder="请选择员工">
						<el-option
						v-for="(item,index) in emps"
						:key="index"
						:label="item.no + '  ' + item.name"
						:value="item.userid">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="项　　目：" v-if="itemFlag">
					<el-select v-model="form.itemid" filterable placeholder="请选择项目">
						<el-option-group
						v-for="(item,index) in items"
						:key="index"
						:label="item.name">
						<el-option
							v-for="(v,k) in item.serviceItems"
							:key="k"
							:label="v.name"
							:value="v.itemid">
						</el-option>
						</el-option-group>
					</el-select>
				</el-form-item>
				<el-form-item label="重算区间：">
					<el-date-picker
						@change="changeMonth"
						style="width:250px;"
						v-model="form.month"
						type="daterange"
						placeholder="选择月">
					</el-date-picker>
					<!-- <el-select v-model="form.timeType" style="width: 100px">
						<el-option value="day" label="按日"></el-option>
						<el-option value="month" label="按月"></el-option>
					</el-select>
					<el-date-picker
						v-if="form.timeType === 'day'"
						@change="changeDate"
						style="width:150px;"
						v-model="form.date"
						type="date"
						placeholder="选择日期">
					</el-date-picker>
					<el-date-picker
						v-if="form.timeType === 'month'"
						@change="changeMonth"
						style="width:150px;"
						v-model="form.month"
						type="month"
						placeholder="选择月">
					</el-date-picker> -->
				</el-form-item>
				<el-form-item style="text-align:center;">
					<el-button type="success" @click="onSubmit" v-show="recountBtn">确定重算</el-button>
				</el-form-item>
			</el-form>
		</amDialog>
	</div>
</template>

<script>
/* eslint-disable */
import Dayjs from "dayjs";
import amDialog from "../components/dialog/index";
import FindIndex from "lodash.findindex";
import Config from "@/config/domainEnv";
const titleMaps = {
	'baseEmpGain': '重算提成',
	'baseEmpFee': '重算业绩'
}
export default {
    name: "recount",
    components: {
        amDialog
    },
    data() {
        return {
            width: "500px",
            tableTitle: "重算提成",
            showDialog: false,
            boxLoading: false,
            empFlag: true,
            shopFlag: true,
            itemFlag: false,
            dutyFlag: false,
            isParent: false,
            recountBtn: true,
            shops: [],
            emps: [],
            items: [],
            employeeLevels: [],
            parentShopId: "",
            reliParentShopId: "",
            radios: [
                {
                    label: "门店",
                    type: 0
                },
                {
                    label: "员工级别",
                    type: 1
                },
                {
                    label: "员工",
                    type: 2
                },
                {
                    label: "项目",
                    type: 3
                }
            ],
            form: {
				timeType: 'day',
				consumeType: 0,
                type: 1,
                shopId: "",
                empId: "",
                label: "员工",
                itemid: "",
                dutyId: "",
                date: "",
				month: "",
				timeType: 'day'
			},
			actionName: 'baseEmpGain'
        };
	},
	computed: {
		validConfigKey() {
			const maps = {
				'baseEmpGain': 'enabledNewBonusModel',
				'baseEmpFee': 'enabledNewPerfModel'
			}
			return maps[this.actionName];
		}
	},
	mounted() {
        let self = this;
        document.querySelector("#recount .el-dialog__title").addEventListener("click", self.changeShow);
    },
    destroyed() {
        let self = this;
        document.querySelector("#recount .el-dialog__title").removeEventListener("click", self.changeShow);
    },
    methods: {
		hide(){
            this.showDialog = false;
		},
		changeShow() {
            this.hide();
            // this.$emit("back");
        },
		handleChangeTimeType() {
			this.form.date = '';
			this.form.month = '';
		},
		handleChangeConsumeType(value) {
			if (value !== 4 && this.form.label === '项目') {
				this.form.label = '门店';
				this.radioChange(this.form.label);
			}
		},
        closeDialog() {
            this.form.empId = "";
            this.form.shopId = "";
            this.form.itemid = "";
            this.form.dutyId = "";
		},
		handleChangeModule() {
			this.isOpenRecount(this.form.shopId);
		},
        changeShop(val) {
            this.form.empId = "";
            this.form.itemid = "";
            this.form.dutyId = "";
            let shopIndex = FindIndex(this.shops, shop => shop.id == val);
            let id = val;
            if (this.shops[shopIndex].softgenre != "3") {
                id = this.shops[shopIndex].parentId;
            }
            this.parentShopId = id;
            this.getEmpsData(val);//shopid
            this.isOpenRecount(val);
            this.getEmployeeLevels(id);//parentShopId
            this.getItemData(id);
        },
        changeDate() {
            if (this.form.date) {
                this.form.month = "";
            }
        },
        changeMonth(values) {
			const [startTime, endTime] = values;
			if (Dayjs(startTime).month() !== Dayjs(endTime).month()) {
				this.$message.error('时间区间不能跨月');
				this.form.month = [startTime, Dayjs(startTime).add(1, 'day')];
			}
        },
        async open(data) {
            this.showDialog = true;
			this.shops = data.shops;
            this.reliParentShopId = data.parentShopId;
            this.parentShopId = data.parentShopId;
            this.shopFlag = data.softgenre == "0";
            this.isParent = data.softgenre == "0";
            this.shopId = data.shopId;
            if (data.softgenre == "3") {
                this.parentShopId = data.shopId;
            }
            let id = data.shopId;
            if (data.softgenre == "0") {
                //如果是总部则默认不查询
                this.emps = [];
                this.items = [];
                this.employeeLevels = [];
                return false;
            }
            await this.isOpenRecount(data.shopId);
            await this.getEmpsData(id);
            await this.getEmployeeLevels();
            await this.getItemData();
        },
        // 调取接口查询选中的门店是否开启新提成,未开启则关闭重算提成
        isOpenRecount(shopId) {
            let params = {
                shopId: shopId,
                configKeys: [this.validConfigKey]
			};
			this.boxLoading = true;
            this.$http.post("/meiyike/config!queryNormalConfig.action", params).then(res => {
				this.boxLoading = false;
                if (!res) {
                    return console.log("res:", res);
                }
                const { content, code } = res.data;
                if (code === 0) {
                    if (content && content[0] && content[0].configValue == "1") {
                        this.recountBtn = true;
                    } else {
                        this.recountBtn = false;
                    }
                }
            });
        },
        radioChange(val) {
            this.empFlag = false;
            this.itemFlag = false;
            this.dutyFlag = false;
            if (this.isParent) {
                this.shopFlag = true;
            } else {
                this.shopFlag = false;
            }
            if (val == "门店") {
            } else if (val == "员工") {
                this.empFlag = true;
            } else if (val == "项目") {
                this.itemFlag = true;
            } else if (val == "员工级别") {
                this.dutyFlag = true;
            }
        },
        getEmpsData(shopid) {
            this.$http
                .post("/shop/employee!list.action", {
                    parentshopid: this.parentShopId,
                    shopid: shopid
                })
                .then(res => {
                    if (!res) {
                        return console.log("res:", res);
                    }
                    const { content, code } = res.data;
                    if (code === 0) {
                        this.emps = content;
                    }
                });
        },
        async getEmployeeLevels() {
            let params = {
                parentShopId: this.parentShopId
            };
            let res = await this.$http.get(`/shop/proposal!employeeLevels.action`, { params: params });
            if (!res) {
                return console.log("res:", res);
            }
            const { content, code } = res.data;
            if (code === 0) {
                this.employeeLevels = content;
            }
        },
        //获取项目
        async getItemData() {
            let params = {
                parentShopId: this.parentShopId
            };
            let res = await this.$http.get(`/shop/proposal!serviceClassWithItems.action`, { params: params });
            if (!res) {
                return console.log("res:", res);
            }
            const { content, code } = res.data;
            if (code === 0) {
                this.items = content;
            }
        },
        getCookie(c_name) {
            if (document.cookie.length > 0) {
                let c_start = document.cookie.indexOf(c_name + "=");
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1;
                    let c_end = document.cookie.indexOf(";", c_start);
                    if (c_end == -1) c_end = document.cookie.length;
                    return unescape(document.cookie.substring(c_start, c_end));
                }
            }
            return "";
        },
        onSubmit() {
            let radioIndex = FindIndex(this.radios, radio => radio.label === this.form.label);
            this.form.type = this.radios[radioIndex].type;
            let startTime = "",
                endTime = "";
            if (this.form.month) {
				const [sTime, eTime] = this.form.month;
                startTime = Dayjs(sTime)
                    .startOf("day")
                    .valueOf();
                endTime = Dayjs(eTime)
                    .endOf("day")
                    .valueOf();
            }
            let params = {
                type: this.form.type,
                shopId: this.form.shopId,
                parentShopId: this.reliParentShopId,
                startTime: startTime,
				endTime: endTime,
				consumeType: this.form.consumeType
            };
            if (this.form.type == "1") {
                params.dutyId = this.form.dutyId;
            } else if (this.form.type == "2") {
                params.empId = this.form.empId;
            } else if (this.form.type == "3") {
                params.itemId = this.form.itemid;
            }
            if (this.empFlag) {
                if (params.empId == "") {
                    return this.$message.error("请选择员工");
                }
            }
            if (this.dutyFlag) {
                if (params.dutyId == "") {
                    return this.$message.error("请选择员工级别");
                }
            }
            if (this.itemFlag) {
                if (params.itemId == "") {
                    return this.$message.error("请选择项目");
                }
            }
            if (this.form.shopId == "") {
                if (this.shopFlag) {
                    return this.$message.error("请选择门店");
                } else {
                    params.shopId = this.shopId;
                }
            }
            if (params.startTime == "" || params.endTime == "") {
                return this.$message.error("请选择时间");
            }
			this.boxLoading = true;
			const token = this.getCookie("token")
            this.$http({
                method: "POST",
                headers: { "content-type": "application/json" },
                data: params,
				url:  `${Config.CALC_SERVER_URI}/${this.actionName}/batchCalc?token=${token}`,
				timeout: 60 * 10 * 1000,
            }).then(res => {
                this.boxLoading = false;
                if (!res) {
                    return console.log("res:", res);
                }
                const { content, code } = res.data;
                if (code === 0) {
                    this.$message({
                        message: `${this.tableTitle}提交成功，我们稍后为您计算！`,
                        type: "success"
                    });
                }
            });
        }
    }
};
</script>

<style lang="less">
#recount {
    .am-dialog {
        .el-dialog__header {
            .el-dialog__title {
                padding-left: 25px;
                &::before {
                    width: 17px;
                    height: 17px;
                    background: url(../assets/basismd_return.png) no-repeat;
                    background-size: cover;
                    left: 5px;
                    cursor: pointer;
                }
            }
        }
        .demonstration {
            color: #909090;
        }
    }
}
</style>


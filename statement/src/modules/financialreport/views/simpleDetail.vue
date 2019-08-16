<template>
	<div id="simpleDetail">
		<amDialog v-model="showDialog" :width="width" :title="tableTitle" ref="amDialog">
			<div class="searchBox">
				<el-form :inline="true" :model="form" class="demo-form-inline">
					<el-form-item>
						<el-select style="width:150px;" @change="handSelectType" v-model="form.type" filterable placeholder="请选择单据类型">
							<el-option
							v-for="(item,index) in typeList"
							:key="item.type"
							:label="item.label"
							:value="item.type">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-select style="width:150px;" v-model="form.empId" filterable placeholder="请选择员工">
							<el-option
							v-for="(item,index) in emps"
							:key="index"
							:label="item.no + '  ' + item.name"
							:value="item.userid">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item v-show="packageFlag">
						<el-select style="width:150px;" v-model="form.treatType" clearable filterable placeholder="选择套餐类型">
							<el-option
							v-for="(item,index) in packages"
							:key="index"
							:label="item.name"
							:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item v-show="cradTypeFlag">
						<el-select style="width:150px;" v-model="form.cardTypeId" clearable filterable placeholder="卡类型">
							<el-option
							v-for="(item,index) in cardTypes"
							:key="index"
							:label="item.cardtypename"
							:value="item.cardtypeid+''">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item v-show="itemFlag">
						<el-select style="width:150px;" v-model="form.itemid" filterable placeholder="全部项目">
							<el-option-group
							v-for="(item,index) in items"
							:key="index"
							:label="item.name">
							<el-option
								v-for="(v,k) in item.serviceItems"
								:key="k"
								:label="v.itemid + ' ' + v.name"
								:value="v.itemid">
							</el-option>
							</el-option-group>
						</el-select>
					</el-form-item>
					<el-form-item v-show="categoryFlag">
						<el-select style="width:150px;" v-model="form.itemid" clearable filterable placeholder="全部卖品">
							<el-option
							v-for="(item,index) in categorys"
							:key="index"
							:label="item.name"
							:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="日期：">
						<el-date-picker
							v-model="form.date"
							:clearable="false"
							type="daterange"
							:default-time="['00:00:00', '23:59:59']"
							value-format="timestamp"
							range-separator="至"
							start-placeholder="开始日期"
							end-placeholder="结束日期">
						</el-date-picker>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onSubmit">查询</el-button>
						<!-- <el-button type="success" @click="onRecount" v-show="recountBtn">重算提成</el-button> -->
					</el-form-item>
				</el-form>
			</div>
			<div class="table-head">
				<a href="javascript:;" class="exportBox" @click="onPrintOrExcel">
					<am-icon name="export_icon"></am-icon>导出
				</a>
				<a href="javascript:;" class="printBox" @click="onPrintOrExcel">
					<am-icon name="print_icon"></am-icon>打印
				</a>
			</div>
			<el-table
				v-loading="tableLoding"
				v-show="!packageFlag"
				border
				size="mini"
				:highlight-current-row="true"
				:data="gridData">
				<el-table-column
					v-for="(item, index) in columnData"
					:key="index"
					:label="item.label"
					:width="item.width"
					v-if="!item.disabled"
					:prop="item.index">
					<template slot-scope="props">
						<div v-if="item.index == 'billNo'">
							<a href="javascript:;" @click="viewBillDetail(props.row)">{{ props.row[item.index] }}</a>
						</div>
						<div v-else-if="item.index == 'type'">
							{{ getConsumeTypeStr(props.row[item.index]) }}
						</div>
						<div v-else-if="item.index == 'consumeTime'">
							{{ props.row[item.index] | date('YYYY-MM-DD HH:mm') }}
						</div>
						<div v-else-if="item.index == 'commentLevel'">
							{{ getComment(props.row[item.index]) }}
						</div>
						<div v-else-if="item.index == '单据类型'">
							{{ typeList[form.type].label }}
						</div>
						<div v-else-if="item.index == 'pointFlag'">
							{{ props.row[item.index] == false ? "非指定" : "指定" }}
						</div>
						<div v-else-if="item.index == 'gain'">
							{{ (props.row[item.index] || 0).toFixed(2) }}
						</div>
						<span v-else>{{ props.row[item.index] }}</span>
					</template>
				</el-table-column>
			</el-table>
			<el-table
				v-loading="tableLoding"
				border
				v-show="packageFlag"
				:highlight-current-row="true"
				:data="packageGridData">
				<el-table-column
					v-for="(item, index) in packageColumnData"
					:key="index"
					:label="item.label"
					:width="item.width"
					:prop="item.index">
					<template slot-scope="props">
						<div v-if="item.index == 'billNo'">
							<a href="javascript:;" @click="viewBillDetail(props.row)">{{ props.row[item.index] }}</a>
						</div>
						<div v-else-if="item.index == 'itemName'">
							{{ props.row[item.index] || "- -"}}
						</div>
						<div v-else-if="item.index == 'consumeTime'">
							{{ props.row[item.index] | date('YYYY-MM-DD HH:mm') }}
						</div>
						<div v-else-if="item.index == 'commentLevel'">
							{{ getComment(props.row[item.index]) }}
						</div>
						<div v-else-if="item.index == '单据类型'">
							{{ typeList[form.type].label }}
						</div>
						<div v-else-if="item.index == 'pointFlag'">
							{{ props.row[item.index] == false ? "非指定" : "指定" }}
						</div>
						<span v-else>{{ props.row[item.index] }}</span>
					</template>
				</el-table-column>
			</el-table>
		</amDialog>
	</div>
</template>

<style lang="less">
#simpleDetail {
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
    }
}
.searchBox {
    overflow: hidden;
    .search-group {
        float: left;
        margin-left: 10px;
    }
}
</style>

<script>
/* eslint-disable */
import { PRINT_TABLE_DATA, PRINT_TABLE_TITLE } from "@/js/storageKeys";
import MetaDataMixin from "#/mixins/meta-data";
import FindIndex from "lodash.findindex";
import amDialog from "../components/dialog/index";
let columnData = [
    {
        label: "流水单号",
        width: "170",
        index: "billNo"
    },
    {
        label: "结单时间",
        width: "130",
        index: "consumeTime"
    },
    {
        label: "项目",
        width: "120",
        index: "itemName"
    },
    {
        label: "项目类别",
        width: "120",
        index: "className"
    },
    {
        label: "单据类型",
        width: "80",
        index: "单据类型"
    },
    {
        label: "评价",
        width: "80",
        index: "commentLevel"
    },
    {
        label: "消费类型",
        width: "80",
        index: "type"
        // index: "consumeType"
    },
    {
        label: "指定类型",
        width: "80",
        index: "pointFlag"
    },
    {
        label: "价格",
        width: "60",
        index: "price"
    },
    {
        label: "业绩",
        width: "60",
        index: "fee"
    },
    {
        label: "提成",
        width: "60",
        index: "gain"
    },
    {
        label: "现金业绩",
        width: "70",
        index: "cashFee"
    },
    {
        label: "卡扣类业绩",
        width: "85",
        index: "cardFee"
    },
    {
        label: "其他业绩",
        width: "70",
        index: "otherFee"
    },
    {
        label: "员工",
        width: "",
        index: "empName"
    }
    // {
    //     label: "达标",
    //     width: "",
    //     index: "stepEquation"
    // }
    // {
    //     label: "提成计算方法",
    //     width: "",
    //     index: ""
    // }
];

let columnDataStr = JSON.stringify(columnData);
export default {
    name: "simpleDetail",
    mixins: [MetaDataMixin],
    data() {
        return {
            width: "1200px",
            tableTitle: "工资提成流水",
            showDialog: false,
            packageFlag: false, //套餐包
            cradTypeFlag: false, //开卡
            itemFlag: false, //项目
            categoryFlag: false, // 卖品
            recountBtn: true,
            tableLoding: false,
            emps: [],
            items: [],
            categorys: [],
            cardTypes: [],
            data: null,
            searchObj: [],
            currParentShopId: "",
            form: {
                itemid: "",
                shopId: "",
                type: 0,
                empId: "",
                item: "",
                date: [],
                treatType: "",
                cardTypeId: ""
            },
            typeList: [{ label: "项目", type: 0 }, { label: "卖品", type: 1 }, { label: "开卡", type: 2 }, { label: "充值", type: 3 }, { label: "套餐销售", type: 4 }],
            packages: [{ name: "套餐包", id: 0 }, { name: "套餐项目", id: 1 }, { name: "自由组合", id: 2 }],
            //列表title
            packageColumnData: [
                {
                    label: "流水单号",
                    width: "240",
                    index: "billNo"
                },
                {
                    label: "结单时间",
                    width: "150",
                    index: "consumeTime"
                },
                {
                    label: "套餐",
                    width: "",
                    index: "itemName"
                },
                {
                    label: "单据类型",
                    width: "100",
                    index: "单据类型"
                },
                {
                    label: "总金额",
                    width: "80",
                    index: "sumMoney"
                },
                {
                    label: "套餐金额",
                    width: "70",
                    index: "money"
                },
                {
                    label: "套餐成本",
                    width: "80",
                    index: "cost"
                },
                {
                    label: "业绩",
                    width: "80",
                    index: "fee"
                },
                {
                    label: "提成",
                    width: "80",
                    index: "gain"
                },
                {
                    label: "现金业绩",
                    width: "80",
                    index: "cashFee"
                },
                {
                    label: "卡扣业绩",
                    width: "80",
                    index: "cardFee"
                },
                {
                    label: "其他业绩",
                    width: "80",
                    index: "otherFee"
                }
            ],
            //列表title
            columnData: columnData,
            //列表数据
            gridData: [],
            packageGridData: []
        };
    },
    components: {
        amDialog
    },
    mounted() {
        let self = this;
        document.querySelector("#simpleDetail .el-dialog__title").addEventListener("click", self.changeShow);
    },
    destroyed() {
        let self = this;
        document.querySelector("#simpleDetail .el-dialog__title").removeEventListener("click", self.changeShow);
    },
    methods: {
        open() {
            this.showDialog = true;
        },
        hide() {
            this.showDialog = false;
        },
        //切换下拉
        async handSelectType(val, submit) {
            this.itemFlag = false; //项目下拉
            this.cradTypeFlag = false; //卡类型下拉
            this.packageFlag = false; //套餐包下拉
            this.categoryFlag = false; // 卖品下拉
            let json = {
                type: this.form.type,
                parentShopId: this.currParentShopId,
                empId: this.form.empId,
                shopId: this.form.shopId,
                startTime: this.form.date[0],
                endTime: this.form.date[1],
                searchObj: this.searchObj || ""
            };
            if (val == "4") {
				this.packageFlag = true;
				const {
					treatType
				} = this.form;
				if (treatType !== '') {
					json.treatType = treatType;
				}
            } else if (val == "2" || val == "3") {
                this.cradTypeFlag = true;
                json.cardTypeId = this.form.cardTypeId;
            } else if (val == "1") {
                this.categoryFlag = true;
                if (!submit) {
                    this.form.itemid = "";
                    json.itemid = undefined;
                } else {
                    json.itemid = this.form.itemid ? this.form.itemid : undefined;
                }
            } else if (val == "0") {
                this.itemFlag = true;
                if (!submit) {
                    this.form.itemid = "";
                    json.itemid = undefined;
                } else {
                    json.itemid = this.form.itemid ? this.form.itemid : undefined;
                }
            }
            await this.changeColumData(this.form.type);
            //表格内容
            await this.getListData(json);
        },
        async onSubmit(data) {
            let submit = 0;
            this.gridData = [];
            this.packageGridData = [];
            if (data.simpleDetail) {
                //从主页面index过来
                this.form.type = data.type - 0;
                this.form.date = [data.starttime, data.endtime];
                this.form.shopId = data.shopId;
                this.searchObj = data.searchObj;
                this.currParentShopId = data.parentShopId;
                this.form.cardTypeId = "";
                this.form.treatType = "";
                //获取卡类型数据
                await this.getCardTypeData();
                //获取项目数据
                await this.getItemData(data.TENANTID || "");
                //获取卖品数据
                await this.getCategoryData(data.shopId);
                //获取员工
                await this.getEmpsData(data.shopId);
                //查询是否开启新提成,如果不是总部登录那么直接关掉重算提成btn
                // if (!this.isHeadquarters) {
                //     await this.isOpenRecount(data.shopId);
                // }
                this.form.empId = data.empId;
            } else if (data.wageItemDetail) {
                this.data = data;
                //从项目明细过来
                this.itemFlag = true;
                this.packageFlag = false;
                this.form.date = data.date;
                this.form.type = 0;
                this.form.shopId = data.shopId;
                this.searchObj = data.searchObj;
                this.currParentShopId = data.parentShopId;
                //获取卡类型数据
                await this.getCardTypeData();
                //获取项目数据
                await this.getItemData(data.TENANTID || "");
                let itemIndex = FindIndex(this.items, item => item.name == data.CLASSNAME);
                if (itemIndex > -1) {
                    let itemidIndex = FindIndex(this.items[itemIndex].serviceItems, res => res.name === data.NAME);
                    this.form.itemid = this.items[itemIndex].serviceItems[itemidIndex].itemid;
                }
                await this.getCategoryData(data.shopId);
                await this.getEmpsData(data.shopId);
                //查询是否开启新提成
                // if (!this.isHeadquarters) {
                //     await this.isOpenRecount(data.shopId);
                // }
                this.form.empId = data.empId;
                submit = 1;
            } else {
                submit = 1;
            }
            await this.handSelectType(this.form.type, submit);
        },
        changeShow() {
            this.hide();
            // this.$emit("back");
        },
        changeColumData(type) {
            if (type == "0") {
                this.columnData = JSON.parse(columnDataStr);
                return false;
            }
            this.columnData.forEach(v => {
                if (type == "3" || type == "2") {
                    //充值开卡隐藏className commentLevel consumeType pointFlagd cashFee
                    if (v.index == "className" || v.index == "commentLevel" || v.index == "consumeType" || v.index == "type" || v.index == "pointFlag" || v.index == "cashFee") {
                        v.disabled = true;
                        return false;
                    } else if (v.index == "price") {
                        v.label = "金额";
                        v.index = "money";
                    } else if (v.index == "itemName") {
                        v.label = "会员卡";
                    } else if (v.index == "cardFee") {
                        v.label = "成本";
                        v.index = "cost";
                    } else if (v.index == "otherFee") {
                        v.label = "赠送金";
                        v.index = "presentMoney";
                    }
                    //充值隐藏成本
                    if (type == "3" && (v.index == "cost" || v.index == "cardFee")) {
                        v.disabled = true;
                        return false;
                    }
                    v.disabled = false;
                } else if (type == "1") {
                    //卖品
                    if (v.index == "itemName") {
                        v.label = "卖品";
                    } else if (v.index == "className" || v.index == "commentLevel" || v.index == "type" || v.index == "pointFlag" || v.index == "price") {
                        //className commentLevel type pointFlag price
                        v.disabled = true;
                        return false;
                    } else if (v.index == "cost") {
                        v.label = "卡扣类业绩";
                        v.index = "cardFee";
                    } else if (v.index == "presentMoney") {
                        v.label = "其他业绩";
                        v.index = "otherFee";
                    }
                    v.disabled = false;
                }
            });
        },
        // 查看单据明细
        viewBillDetail(data) {
            let propData = {
                parentShopId: this.parentShopId - 0,
                id: data.id
            };
            console.log(propData);
            // this.showDialog = false;
            this.$emit("view", propData);
        },
        getConsumeTypeStr(val) {
            if (val == "0") {
                return "项目消费";
            } else if (val == "4") {
                return "套餐消费";
            } else if (val == "6") {
                return "年卡消费";
            } else {
                return "套餐消费";
            }
        },
        getComment(val) {
            if (val === null) {
                return "未评价";
            } else if (val === 0) {
                return "好评";
            } else if (val === 1) {
                return "中评";
            } else if (val === 2) {
                return "差评";
            }
        },
        getEmpsData(shopid) {
            this.$http
                .post("/shop/employee!list.action", {
                    parentshopid: this.currParentShopId,
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
        getListData(d) {
            this.tableLoding = true;
            this.$http.post("/bill!simpleDetail.action", d).then(res => {
                this.tableLoding = false;
                if (!res) {
                    return console.log("res:", res);
                }
                const { content, code } = res.data;
                if (code === 0) {
                    if (this.form.type == 4) {
                        this.packageGridData = content;
                    } else {
                        this.gridData = content;
                    }
                }
            });
        },
        //获取卡类型
        async getCardTypeData() {
            let params = {
                parentShopId: this.currParentShopId
            };
            let res = await this.$http.get(`/shop/proposal!cardTypes.action`, { params: params });
            if (!res) {
                return console.log("res:", res);
            }
            const { content, code } = res.data;
            if (code === 0) {
                this.cardTypes = content;
            }
        },
        //获取项目
        async getItemData(parentId) {
            let params = {
                parentShopId: parentId || this.parentShopId
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
        //获取卖品
        async getCategoryData(shopId) {
            let params = { shopId: shopId, pageNumber: 0, pageSize: 999999, keyWord: null, depot: { supplierid: null, type: -1, marqueid: null, subMarqueId: null, brandNo: null }, excludezero: 0 };
            this.$http.post(`/shair/stockApi!getDepotList.action`, params).then(res => {
                if (!res) {
                    return console.log("res:", res);
                }
                const { content, code } = res.data;
                if (code === 0) {
                    this.categorys = content;
                }
            });
        },
        // 调取接口查询选中的门店是否开启新提成,未开启则关闭重算提成
        isOpenRecount(shopId) {
            let params = {
                shopId: shopId,
                configKeys: ["enabledNewBonusModel"]
            };
            this.$http.post("/meiyike/config!queryNormalConfig.action", params).then(res => {
                if (!res) {
                    return console.log("res:", res);
                }
                const { content, code } = res.data;
                if (code === 0) {
                    console.log(content);
                    if (content && content[0] && content[0].configValue == "1") {
                        this.recountBtn = true;
                    } else {
                        this.recountBtn = false;
                    }
                }
            });
        },
        //重算提成
        onRecount() {
            let data = {
                emps: this.emps,
                shops: this.shops,
                parentShopId: this.parentShopId,
                form: {
                    shopId: this.form.shopId //选择的门店id
                },
                shopId: this.shopId, //登录的门店id
                softgenre: this.softgenre //3是附属 2是直属 0是总部
            };
            this.$emit("recount", data);
        },
        onPrintOrExcel() {
            //打印
            let thead = document.querySelector("#simpleDetail .el-table__header thead").innerHTML;
            let tbody = document.querySelector("#simpleDetail .el-table__body tbody").innerHTML;
            if (this.form.type == "4") {
                thead = document.querySelectorAll("#simpleDetail .el-table__header thead")[1].innerHTML;
                tbody = document.querySelectorAll("#simpleDetail .el-table__body tbody")[1].innerHTML;
            }
            let tableHtmlString = `<table class="rl_dataviewer_tbody" cellspacing="0" cellpadding="0" style="text-align:left;"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
            const { origin } = window.location;
            window.localStorage.setItem(PRINT_TABLE_TITLE, this.tableTitle);
            window.localStorage.setItem(PRINT_TABLE_DATA, tableHtmlString);
            window.open(`${origin}/shair/MGJ_reservation/lib/rl_printer/rlprinterInner.html`, "", "height=600,width=1280,top=0,left=0,toolbar=no,menubar=no,status=no");
        }
    }
};
</script>
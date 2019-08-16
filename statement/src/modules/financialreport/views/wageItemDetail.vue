<template>
	<div id="wageItemDetail">
		<amDialog v-model="visible" :width="width" :title="tableTitle" ref="amDialog">
			<div class="searchBox">
				<el-form :inline="true" :model="form" class="demo-form-inline">
					<el-form-item label="门店：" v-show="isParent">
						<el-select v-model="form.shopId" filterable placeholder="请选择门店" @change="getEmpsData">
							<el-option
							v-for="(item, index) in shops"
							:key="item.id"
							:label="item.shopName"
							:value="item.id">
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="员工：">
						<el-select v-model="form.empId" filterable placeholder="请选择员工">
							<el-option
							v-for="(item,index) in emps"
							:key="index"
							:label="item.no + '  ' + item.name"
							:value="item.userid">
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
					border
					size="mini"
					:highlight-current-row="true"
					:data="gridData">
					<el-table-column
						v-for="(item, index) in columnData"
						:key="index"
						:label="item.label"
						:width="item.width"
						:prop="item.index">
						<template slot-scope="props">
							<div v-if="item.label == '明细'">
								<a href="javascript:;" @click="changePageSimpleDetail(props.row)">明细</a>
							</div>
							<span v-else>{{ props.row[item.index] }}</span>
						</template>
					</el-table-column>
				</el-table>
		</amDialog>
	</div>
</template>

<style lang="less">
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
import amDialog from "../components/dialog/index";
import FindIndex from "lodash.findindex";
export default {
    name: "wageItemDetail",
    mixins: [MetaDataMixin],
    data() {
        return {
            width: "1200px",
            tableTitle: "工资提成项目明细",
            visible: false,
            isParent: false,
            recountBtn: true,
            tableLoding: false,
            currParentShopId: "",
            emps: [],
            data: {
                searchObj: []
            },
            form: {
                shopId: "",
                empId: "",
                date: []
            },
            //列表title
            columnData: [
                {
                    label: "项目编号",
                    width: "100",
                    index: "ITEMNO"
                },
                {
                    label: "项目名称",
                    width: "120",
                    index: "NAME"
                },
                {
                    label: "明细",
                    width: "50",
                    index: "明细"
                },
                {
                    label: "项目类别",
                    width: "120",
                    index: "CLASSNAME"
                },
                {
                    label: "个数",
                    width: "50",
                    index: "SUMNUM"
                },
                {
                    label: "总业绩",
                    width: "70",
                    index: "SUMFEE"
                },
                {
                    label: "总提成",
                    width: "70",
                    index: "SUMMGAIN"
                },
                {
                    label: "现金类业绩",
                    width: "85",
                    index: "SUMCASHFEE"
                },
                {
                    label: "卡扣类业绩",
                    width: "85",
                    index: "SUMCARDFEE"
                },
                {
                    label: "其他",
                    width: "60",
                    index: "SUMOTHERFEE"
                },
                {
                    label: "指定提成",
                    width: "70",
                    index: "POINTGAIN"
                },
                {
                    label: "指定业绩",
                    width: "70",
                    index: "POINTFEE"
                },
                {
                    label: "指定个数",
                    width: "70",
                    index: "POINTCOUNT"
                },
                {
                    label: "非指定提成",
                    width: "85",
                    index: "NOTPOINTGAIN"
                },
                {
                    label: "非指定业绩",
                    width: "85",
                    index: "NOTPOINTFEE"
                },
                {
                    label: "非指定个数",
                    width: "85",
                    index: "NOTPOINTCOUNT"
                }
            ],
            //列表数据
            gridData: []
        };
    },
    components: {
        amDialog
    },
    methods: {
        open() {
            this.visible = true;
        },
        hide() {
            this.visible = false;
        },
        changePageSimpleDetail(data) {
            let propData = data;
            propData.shopId = this.form.shopId;
            propData.empId = this.form.empId;
            propData.date = this.form.date;
            propData.searchObj = this.data.searchObj || [];
            propData.parentShopId = this.currParentShopId;
            propData.wageItemDetail = 1;
            this.$emit("name", propData);
        },
        async onSubmit(data) {
			this.gridData = [];
            if (data && (data.shopId || data.shopId === 0)) {
                this.isParent = this.parentShopId == this.shopId;
                this.data = data;
                this.form.date = [data.starttime, data.endtime];
                this.form.shopId = data.shopId;
                this.currParentShopId = data.parentShopId;
                await this.getEmpsData(this.form.shopId);
                this.form.empId = data.empId;
                // await this.isOpenRecount(data.shopId);
            }
            await this.getListData({
                empId: this.form.empId,
                shopId: this.form.shopId,
                startTime: this.form.date[0],
                endTime: this.form.date[1],
                searchObj: this.data.searchObj || []
            });
        },
        getListData(d) {
            this.tableLoding = true;
            this.$http.post("/bill!queryEmpfeeByEmpId.action", d).then(res => {
                this.tableLoding = false;
                if (!res) {
                    return console.log("res:", res);
                }
                const { content, code } = res.data;
                if (code === 0) {
                    this.gridData = content;
                }
            });
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
            let thead = document.querySelector("#wageItemDetail .el-table__header thead").innerHTML;
            let tbody = document.querySelector("#wageItemDetail .el-table__body tbody").innerHTML;
            let tableHtmlString = `<table class="rl_dataviewer_tbody" cellspacing="0" cellpadding="0" style="text-align:left;"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
            const { origin } = window.location;
            window.localStorage.setItem(PRINT_TABLE_TITLE, this.tableTitle);
            window.localStorage.setItem(PRINT_TABLE_DATA, tableHtmlString);
            window.open(`${origin}/shair/MGJ_reservation/lib/rl_printer/rlprinterInner.html`, "", "height=600,width=1280,top=0,left=0,toolbar=no,menubar=no,status=no");
        }
    }
};
</script>
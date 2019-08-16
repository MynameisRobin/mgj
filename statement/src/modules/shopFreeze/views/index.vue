<template>
    <div class="shopFreeze index" v-loading="initLoading">
        <div class="header" v-show="batchFlag">
            <div class="rv-tip">
                <el-button type="primary" @click="openOperation">门店批量对单</el-button>
                <span class="tipSpan">!</span>
                <p>勾选门店后可批量操作对单和取消某一时段对单单据</p>
            </div>
        </div>
        <div class="shopFreezeTable">
            <div class="scroll-table">
                <el-table
                    border
                    :data="tableData"
                    tooltip-effect="dark"
                    style="width: 100%"
                    ref="multipleTable"
                    @selection-change="handleSelectionChange"
                >
                    <el-table-column type="selection" width="55" v-if="batchFlag"></el-table-column>
                    <el-table-column
                        v-for="(item, index) in columnData"
                        :key="index"
                        :label="item.label"
                        :width="item.width"
                        :prop="item.index"
                    >
                        <template slot-scope="props">
                            <div v-if="item.label == '操作'">
                                <el-button
                                    type="primary"
                                    class="purple btn"
                                    @click="openFreeze(props.row.shopId)"
                                >对单</el-button>
                                <el-button
                                    type="primary"
                                    class="btn"
                                    @click="openUnFreeze(props.row.shopId)"
                                >取消对单</el-button>
                            </div>
                            <div v-else-if="item.label === '开支记录'">
                                <span :style="getTypeStr(props.row.configs,item.type).color">{{ getTypeStr(props.row.configs,item.type).str }}</span>
                            </div>
							<div v-else-if="item.label === '营业记录'">
                                <span :style="getTypeStr(props.row.configs,item.type).color">{{ getTypeStr(props.row.configs,item.type).str }}</span>
                            </div>
                            <span v-else>{{ props.row[item.index] }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <!-- 批量操作 -->
        <amDialog
            v-model="showDialog"
            :width="width"
            :title="title"
            ref="amDialog"
            @input="closeDialog"
        >
            <el-form :inline="false" :model="form" size="small" :label-position="'right'" v-loading="boxLoading">
                <el-form-item label="门店">
                    <span class="shopSpan">{{ shopNameStr.substr(0,shopNameStr.length-1) || "" }}</span>
                </el-form-item>
                <el-form-item label="操作">
                    <el-radio-group v-model="form.auditingFlag">
                        <el-radio label="1">批量对单</el-radio>
                        <el-radio label="0">批量取消对单</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="选择">
                    <el-checkbox-group v-model="form.types">
                        <el-checkbox v-for="item in checkboxs" :key="item.type" :label="item.label"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="对单" v-show="form.auditingFlag == '1'">
                    <el-date-picker
                        style="width:150px;"
                        v-model="form.optTime"
                        type="date"
                        placeholder="选择日期"
						:picker-options="pickerOptions"
                    ></el-date-picker>
                    <span class="font12">前的营业记录</span>
                </el-form-item>
				<el-form-item label="恢复" v-show="form.auditingFlag == '0'">
                    <el-date-picker
                        v-model="form.optTime"
                        :clearable="false"
                        type="daterange"
                        value-format="timestamp"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
						:picker-options="pickerOptions"
                    ></el-date-picker>
                    <span class="font12">已对单的营业记录</span>
                </el-form-item>
                <el-form-item style="text-align:left;margin-left:60px;">
                    <el-button type="primary" @click="onSubmit(form.auditingFlag)">确定</el-button>
                </el-form-item>
            </el-form>
        </amDialog>
        <!-- 解除冻结 -->
        <amDialog
            v-model="unFreezeShowDialog"
            :width="width"
            :title="unFreezeTitle"
            @input="closeDialog(1)"
        >
            <el-form
                :inline="false"
                :model="form"
                ref="form"
                :label-position="'right'"
                v-loading="boxLoading"
            >
                <el-form-item label="选择">
                    <el-checkbox-group v-model="form.types">
                        <el-checkbox v-for="item in checkboxs" :key="item.type" :label="item.label"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="取消">
                    <el-date-picker
                        v-model="form.optTime"
                        :clearable="false"
                        type="daterange"
                        value-format="timestamp"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
						:picker-options="pickerOptions"
                    ></el-date-picker>
                    <span class="font12">已对单的营业记录</span>
                </el-form-item>
                <el-form-item style="text-align:left;margin-left:60px;">
                    <el-button type="primary" @click="onSubmit('0')">确定</el-button>
                </el-form-item>
            </el-form>
        </amDialog>
        <!-- 冻结 -->
        <amDialog
            v-model="freezeShowDialog"
            :width="width"
            :title="freezeTitle"
            @input="closeDialog(1)"
        >
            <el-form
                :inline="false"
                :model="form"
                ref="form"
                :label-position="'right'"
                v-loading="boxLoading"
            >
                <el-form-item label="选择">
                    <el-checkbox-group v-model="form.types">
                        <el-checkbox v-for="item in checkboxs" :key="item.type" :label="item.label"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="对单">
                    <el-date-picker
                        v-model="form.optTime"
                        style="width:150px;"
                        type="date"
                        placeholder="选择日期"
						:picker-options="pickerOptions"
                    ></el-date-picker>
                    <span class="font12">前的营业记录</span>
                </el-form-item>
                <el-form-item style="text-align:left;margin-left:60px;">
                    <el-button type="primary" @click="onSubmit('1')">确定</el-button>
                </el-form-item>
            </el-form>
        </amDialog>
    </div>
</template>
<script>
/* eslint-disable */
import Api from "@/api";
import Dayjs from "dayjs";
import amDialog from "../components/dialog/index";
import FindIndex from "lodash.findindex";

export default {
    name: "Index",
    components: {
        amDialog
    },
    data() {
        return {
            width: "600px",
            title: "批量操作",
            freezeTitle: "对单",
            unFreezeTitle: "取消对单",
            initLoading: false,
            boxLoading: false,
            showDialog: false,
            freezeShowDialog: false,
            unFreezeShowDialog: false,
			validateFlag: false,
			batchFlag: false,
            apiUrl: {
                frozenList: "/frozen!list.action", //表格
                frozenAdd: "/frozen!add.action" //冻结、解冻、批量操作
			},
			baseId:"",
            parentShopId: "",
            shopNameStr: "",
			pickerOptions: {
				disabledDate(time) {
					return time.getTime() > Date.now() - 8.64e6
				}
			},  
            form: {
                type: "",
                types: [],
                shopIds: [],
                optTime: "",
                auditingFlag: "1"
            },
            checkboxs: [
                {
                    label: "营业记录",
                    type: 0
                },
                {
                    label: "开支记录",
                    type: 1
                }
            ],
            //列表title
            columnData: [
                {
                    label: "门店名称",
                    width: "260",
                    index: "shopName"
                },
                {
                    label: "开支记录",
                    width: "260",
                    index: "",
                    type: 1
                },
                {
                    label: "营业记录",
                    width: "260",
                    index: "",
                    type: 0
                },
                {
                    label: "操作",
                    width: "",
                    index: "operation"
                }
            ],
            tableData: []
        };
    },
    async mounted() {
		let res = await Api.getMetaData();
        let resData = res.data;
        const { code, content } = resData;
        if (code === 0) {
            const {
				shopId,
				softgenre,
				parentShopId
			} = content.userInfo;
			if(softgenre == "3"){
				this.parentShopId = shopId;
				this.baseId = parentShopId;
			}else{
				this.parentShopId = parentShopId;
			}
        }
        await this.getData();
	},
    methods: {
        getTypeStr(configs,type) {
            let str = "",
                startTime = "",
				endTime = "",
				color = "";
			let itemIndex = FindIndex(configs, item => item.type == type);
			let config = configs[itemIndex];
            if (!config) {
                return {
					str: "未对单",
					color: "#606266"
				};
			}
            if (config.type === 0 || config.type === 1) {
                if (config.auditingFlag === 0 && config.optTime.indexOf(",") > -1) {
                    startTime = config.optTime.split(",")[0];
                    endTime = config.optTime.split(",")[1];
                    str =
                        Dayjs(startTime - 0).format("YYYY-MM-DD") +
                        "至" +
                        Dayjs(endTime - 0).format("YYYY-MM-DD") +
						"取消对单";
					color = "color:#FC9252";
                } else if (config.auditingFlag === 1) {
                    str =
                        Dayjs(config.optTime - 0).format("YYYY-MM-DD") +
						"前已对单";
					color = "color:#606266"
                }
            }
            return {
				str: str,
				color: color
			};
        },
        handleSelectionChange(val) {
            let shopNameStr = "",
                shopIds = [];
            val.forEach(v => {
                shopIds.push(v.shopId);
                shopNameStr += v.shopName + "、";
            });
            this.shopNameStr = shopNameStr;
			this.form.shopIds = shopIds;
        },
        validateForm() {
            if (this.form.shopIds == "") {
                this.$message({
                    message: "请选择门店",
                    type: "error"
                });
                this.validateFlag = false;
            } else if (this.form.auditingFlag == "") {
                this.$message({
                    message: "请选择对单或取消对单",
                    type: "error"
                });
                this.validateFlag = false;
            } else if (this.form.types == "") {
                this.$message({
                    message: "请选择开支记录或营业记录",
                    type: "error"
                });
                this.validateFlag = false;
            } else if (this.form.optTime == "" || this.form.optTime === NaN) {
                this.$message({
                    message: "请选择日期",
                    type: "error"
                });
                this.validateFlag = false;
            } else {
                this.validateFlag = true;
                console.log("表单验证通过");
            }
        },
        closeDialog(shopFlag) {
            this.form.type = "";
            this.form.types = [];
            this.form.optTime = "";
            this.form.auditingFlag = "1";
            this.showDialog = false;
            this.freezeShowDialog = false;
            this.unFreezeShowDialog = false;
            if (shopFlag) {
                this.form.shopIds = [];
            }
        },
        openOperation() {
            if (this.form.shopIds == "") {
                this.$message({
                    message: "请勾选门店",
                    type: "error"
                });
                return false;
            }
            this.showDialog = true;
        },
        openFreeze(shopId) {
            this.$refs.multipleTable.clearSelection();
            this.freezeShowDialog = true;
            this.form.shopIds = [shopId];
        },
        openUnFreeze(shopId) {
            this.$refs.multipleTable.clearSelection();
            this.unFreezeShowDialog = true;
            this.form.shopIds = [shopId];
        },
        onSubmit(auditingFlag) {
            if (auditingFlag === "0" || auditingFlag === "1") {
                this.form.auditingFlag = auditingFlag;
            }
            this.validateForm();
            if (!this.validateFlag) return;
            let optTime = "";
            if (this.form.optTime.length === 2) {
                optTime =
                    new Date(this.form.optTime[0]).getTime() +
                    "," +
                    new Date(this.form.optTime[1]).getTime();
            } else {
                optTime = new Date(this.form.optTime).getTime();
            }
            let types = [];
            this.form.types.forEach(v => {
                this.checkboxs.forEach(r => {
                    if (v === r.label) {
                        types.push(r.type);
                    }
                });
            });
            let data = {
                parentShopId: this.parentShopId,
                shopIds: this.form.shopIds,
                auditingFlag: this.form.auditingFlag,
                optTime: optTime,
                types: types
			};
			//附属店才有baseId
			if(this.baseId){
				data.parentShopId = this.baseId;
			}
            console.log(data, "data");
            this.$http.post(this.apiUrl.frozenAdd, data).then(res => {
                if (!res) {
                    return console.log("res:", res);
                }
                const { content, code } = res.data;
                if (code === 0) {
                    this.$message({
                        message: "修改成功",
                        type: "success"
                    });
                    this.getData();
                    this.closeDialog(1);
                }
            });
        },
        getData() {
            this.initLoading = true;
            // type: 0, //0 营业记录，1-开支记录
            // optTime: "16666666,56564454", //冻结或解冻的时间戳(冻结1个，解冻2个用逗号分隔)
            // auditingFlag: 0 //0解冻 1已冻结
            this.$http
                .post(this.apiUrl.frozenList, {
                    parentShopId: this.parentShopId
                })
                .then(res => {
                    this.initLoading = false;
                    if (!res) {
                        return console.log("res:", res);
                    }
                    const { content, code } = res.data;
                    if (code === 0) {
                        this.tableData = content;
						this.batchFlag = content.length > 1;
                    }
                });
        }
    }
};
</script>

<style lang="less">
.shopFreeze {
	padding: 15px;
	.el-form-item__label,
	.el-checkbox__label,
	.el-radio__label,
	.shopSpan{
		font-size:12px;
	}
    .header {
        .rv-tip {
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
    }
    .shopFreezeTable {
        margin-top: 10px;
        .purple {
            background: #9c30a0;
            border-color: #9c30a0;
		}
		.btn{
			height:26px;
			line-height: 26px;
			padding: 0 10px;
		}
    }
    .am-dialog {
		font-size:12px;
        .shopSpan {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            display: inline-block;
            height: 32px;
            line-height: 32px;
            width: calc(100% - 80px);
        }
        .font12 {
            font-size: 12px;
        }
        .el-form-item__label {
            width: 60px;
            text-align: center;
        }
    }
}
</style>

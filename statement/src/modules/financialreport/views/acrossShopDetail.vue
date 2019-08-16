<template>
	<div id="acrossShopDetail" v-loading="loading">
		<AmDialog v-model="dialogTableVisible" width="1200px" v-if="dialogTableVisible" :title="tableTitle" ref="amDialog">
			<div>
				<div class="table-head">
					<label for="">跨店内容：</label>
					<template>
						<el-select v-model="value" placeholder="本店会员在他店卡扣消费" @change="handleSelect" style="width:235px">
							<el-option
							v-for="(item,index) in options"
							:key="item.name"
							:type="item.type"
							:ctype="item.ctype"
							:value="item.name">
							</el-option>
						</el-select>
					</template>
					<a href="javascript:;" class="exportBox" @click="onPrintOrExcel">
						<am-icon name="export_icon"></am-icon>导出
					</a>
				</div>
				<div class="scroll-table" v-loading="loading">
					<el-table
						v-if="type !== 7"
						border
						height="350"
						:highlight-current-row="true"
						:data="gridData">
						<el-table-column
							v-for="(item, index) in columnData"
							:fixed="item.fixed"
							:key="index"
							:label="item.label"
							:width="item.width"
							:prop="item.index">
							<template slot-scope="props">
								<div v-if="item.label == '支付方式'">
									<el-dropdown v-if="getPayType(props).length > 2">
										<span class="el-dropdown-link blue">
											{{getPayType(props)[0]}}<i class="el-icon-arrow-down el-icon--right" ></i>
										</span>
										<el-dropdown-menu slot="dropdown">
											<el-dropdown-item  v-for="(item,index) in getPayType(props)" :key="index">
												{{item}}
											</el-dropdown-item>
										</el-dropdown-menu>
									</el-dropdown>
									<span v-else>{{ getPayType(props)[0] || '--' }}</span>
								</div>
								<div v-else-if="item.label == '会员卡名称'">
									<span>{{ getMemCardName(props.row) }}</span>
								</div>
								<span v-else>{{ props.row[item.index] || '--' }}</span>
							</template>
						</el-table-column>
					</el-table>
					<el-table
						v-else-if="type === 7"
						border
						height="350"
						:highlight-current-row="true"
						:data="gridData">
						<el-table-column
							v-for="(item, index) in columnDataPackage"
							:key="index"
							:label="item.label"
							:width="item.width"
							:prop="item.index">
							<template slot-scope="props">
								<span>{{ props.row[item.index] || '--' }}</span>
							</template>
						</el-table-column>
					</el-table>
                </div>
			</div>
		</AmDialog>
	</div>
</template>

<style lang="less">
#acrossShopDetail {
    .blue {
        color: #409eff;
    }
}
</style>

<script>
/* eslint-disable */
import FindIndex from 'lodash.findindex'
import { PRINT_TABLE_DATA, PRINT_TABLE_TITLE } from "@/js/storageKeys";
import AmDialog from "../components/dialog/index";
export default {
    name: "AcrossShopDetail",
    data() {
        return {
            tableTitle: "跨店消费统计表-明细",
            dialogTableVisible: false,
            restaurants: [],
			value: null,
			loading: false,
			type: Number,
			ctype:Number,
            shopid: "",
            starttime: "",
            endtime: "",
            referShopId: "",
			parentShopId: "",
			cardTypeIds:[],
            //列表title
            columnData: [
                {
                    label: "会员门店",
                    width: "160",
					index: "memShopName",
					fixed:true
                },
                {
                    label: "交易发生门店",
                    width: "160",
                    index: "treatShopName",
					fixed:true
                },
                {
                    label: "会员姓名",
                    width: "120",
                    index: "memName"
                },
                {
                    label: "手机号",
                    width: "120",
                    index: "memMobile"
                },
                {
                    label: "交易类型",
                    width: "120",
                    index: "treatType"
                },
                {
                    label: "交易金额",
                    width: "100",
                    index: "treatMoney"
                },
                {
                    label: "支付方式",
                    width: "230",
                    index: "payType"
                },
                {
                    label: "流水单号",
                    width: "150",
                    index: "billNo"
				},
                {
                    label: "交易时间",
                    width: "150",
                    index: "consumeTime"
                }
			],
			columnDataPackage: [
                {
                    label: "会员套餐门店",
                    width: "",
                    index: "memShopName"
                },
                {
                    label: "转移门店",
                    width: "",
                    index: "treatShopName"
                },
                {
                    label: "会员姓名",
                    width: "100",
                    index: "memName"
                },
                {
                    label: "手机号",
                    width: "120",
                    index: "memMobile"
                },
                {
                    label: "套餐名称",
                    width: "100",
                    index: "treatName"
                },
                {
                    label: "套餐余额",
                    width: "100",
                    index: "treatMoney"
                },
                {
                    label: "套餐赠送金余额",
                    width: "160",
                    index: "presentMoney"
                },
                {
                    label: "转移时间",
                    width: "150",
                    index: "consumeTime"
                }
            ],
            //列表数据
            gridData: [
                // {
                //     shopid: 266662,
                //     memshopid: 266661,
                //     memShopName: "A店",
                //     treatShopName: "B店",
                //     memName: "张三",
                //     memMobile: "18899990000",
                //     treatMoney: 50,
                //     treatType: "消费",
                //     payType: "200-卡扣 100-现金 100-微信 ",
                //     billNo: "00000078",
                //     consumeTime: "2018-9-1 12:32"
                // },
            ],
            //搜索文本框数据
            options: [
                {
                    name: "本店会员在他店卡扣消费",
                    type: 1,
                    ctype: 0
                },
                {
                    name: "他店会员在本店卡扣消费",
                    type: 1,
                    ctype: 1
				},
                {
                    name: "本店会员在他店卡扣买套餐",
                    type: 2,
                    ctype: 0
                },
                {
                    name: "他店会员在本店卡扣买套餐",
                    type: 2,
                    ctype: 1
                },
                {
                    name: "本店会员在他店卡金充值",
                    type: 3,
                    ctype: 0
                },
                {
                    name: "他店会员在本店卡金充值",
                    type: 3,
                    ctype: 1
				},
				{
					name:"本店会员在他店赠金充值",
					type:3,
					ctype:2
				},
				{
					name:"他店会员在本店赠金充值",
					type:3,
					ctype:3
				},
                {
                    name: "本店会员在他店套餐卡金消耗",
                    type: 4,
                    ctype: 0
                },
                {
                    name: "他店会员在本店套餐卡金消耗",
                    type: 4,
                    ctype: 1
				},
                {
                    name: "本店会员卡卡金转到他店",
                    type: 5,
                    ctype: 0
                },
                {
                    name: "他店会员卡卡金转到本店",
                    type: 5,
                    ctype: 1
				},
				{
					name:"本店会员卡赠金转到他店",
					type:5,
					ctype:2
				},
				{
					name:"他店会员卡赠金转到本店",
					type:5,
					ctype:3
				},
				{
                    name: "本店会员套餐金转移到他店",
                    type: 7,
                    ctype: 0
				},
				{
                    name: "他店会员套餐金转移到本店",
                    type: 7,
                    ctype: 1
				},
				{
                    name: "本店会员套餐赠金转移到他店",
                    type: 7,
                    ctype: 0
				},
				{
                    name: "他店会员套餐赠金转移到本店",
                    type: 7,
                    ctype: 1
				},
				{
					name:"本店会员在他店赠金消费",
					type:1,
					ctype:2
				},
				{
					name:"他店会员在本店赠金消费",
					type:1,
					ctype:3
				},
				{
					name:"本店会员在他店赠金买套餐",
					type:2,
					ctype:2
				},
				{
					name:"他店会员在本店赠金买套餐",
					type:2,
					ctype:3
				},
				{
					name:"本店会员在他店套餐赠金消耗",
					type:4,
					ctype:2
				},
				{
					name:"他店会员在本店套餐赠金消耗",
					type:4,
					ctype:3
				}
            ]
        };
    },
    components: {
        AmDialog
    },
    mounted() {},
    methods: {
		//切换类型控制tab栏
		changeColumData(){
			let columnLen = this.columnData.length;
			let columnDataIndex0 = FindIndex(this.columnData,item => item.index === 'recPresFee');

			//充值显示赠金
			if(this.type === 3 && (this.ctype === 2 || this.ctype === 3)){
				if(columnDataIndex0 === -1){
					this.columnData.splice(columnLen-1,0,{
						label: "赠金",
						width: "120",
						index: "recPresFee"
					})
				}
			}else{
				if(columnDataIndex0 !== -1){
					this.columnData.splice(columnDataIndex0,1);
				}
			}

			let columnDataIndex1 = FindIndex(this.columnData,item=>item.label === "会员卡名称");
			//会员卡名称
			if(this.type === 5){
				if(columnDataIndex1 === -1){
					this.columnData.splice(3,0,{
						label: "会员卡名称",
						width: "100",
						index: ""
					})
				}
			}else{
				if(columnDataIndex1 > -1){
					this.columnData.splice(columnDataIndex1,1);
				}
			}
		},
        getPayType(props) {
            if (props && props.row && props.row.payType) {
                return props.row.payType.split(" ") || '--';
            }
            return [];
		},
		getMemCardName(data){
			let columnDataIndex = FindIndex(this.columnData,item=>item.label === "会员卡名称");
			if(data.type == "7"){
				this.columnData[columnDataIndex].index = "outCardType";
				return data.outCardType || '--';
			}else if(data.type == "5"){
				this.columnData[columnDataIndex].index = "intoCardType";
				return data.intoCardType || '--';
			}
		},
        handleSelect(d) {
            if (!d.columnLabel) {
                d = {
					columnLabel: d,
					cardTypeIds: this.cardTypeIds,
					parentShopId: this.parentShopId,
                    shopid: this.shopid,
                    starttime: this.starttime,
                    endtime: this.endtime,
                    referShopId: this.referShopId
                };
			}
			let optIndex = FindIndex(this.options,item => item.name === d.columnLabel);
			this.type = this.options[optIndex].type;
			this.ctype = this.options[optIndex].ctype;
			if(this.type === 3 && (this.ctype === 2 || this.ctype === 3)){}else{
				let columnDataIndex = FindIndex(this.columnData,item => item.label === '赠金');
				if(columnDataIndex !== -1){
					this.columnData.splice(columnDataIndex,1);
				}
			}
			console.log(this.type,'this.type')
			this.getListData({
				cardTypeIds: d.cardTypeIds || undefined,
				parentid: d.parentShopId,
				shopid: d.shopid,
				type: this.options[optIndex].type,
				ctype: this.options[optIndex].ctype,
				starttime: d.starttime,
				endtime: d.endtime,
				referShopId: d.referShopId
			});
        },
        //导出
        onPrintOrExcel() {
            let topTrContent = "";
            let childTrContent = "";
            let showColumnIndexList = [];
            this.columnData.forEach(item => {
                const { label, width } = item;
                topTrContent += `<th width="${width}">${label}</th>`;
            });
            let tbodyContent = "";
            this.gridData.forEach(item => {
                tbodyContent += `<tr>`;
                this.columnData.forEach(v => {
                    tbodyContent += `<td>${item[v.index] || '--'}</td>`;
                });
                tbodyContent += `</tr>`;
            });
            const tableHead = `<thead><tr>${topTrContent}</tr><tr>${childTrContent}</tr></thead>`;
            const table = tableHead + `<tbody>${tbodyContent}</tbody>`;
            let tableHtmlString = `<table class="rl_dataviewer_tbody" cellspacing="0" cellpadding="0" style="text-align:left;">${table}</table>`;
            const { origin } = window.location;
            window.localStorage.setItem(PRINT_TABLE_TITLE, this.tableTitle);
            window.localStorage.setItem(PRINT_TABLE_DATA, tableHtmlString);
            window.open(`${origin}/shair/MGJ_reservation/lib/rl_printer/rlprinterInner.html`, "", "height=600,width=1280,top=0,left=0,toolbar=no,menubar=no,status=no");
        },
        getListData(d) {
			this.changeColumData();
            (this.shopid = d.shopid), (this.starttime = d.starttime), (this.endtime = d.endtime), (this.referShopId = d.referShopId),(this.cardTypeIds = d.cardTypeIds), (this.parentShopId = d.parentShopId || d.parentid);
		   	if (d.columnLabel) {
				this.value = d.columnLabel || "";
                this.handleSelect(d);
                return false;
			}
			if(this.type !== 7){
				d.parentid = undefined;
			}
			if(this.ctype === 0 || this.ctype === 2){
			}else{
				d.cardTypeIds = undefined;
			}
			this.loading = true;
			this.gridData = [];
            this.$http.post("/crossShop!queryCrossShopDetails.action", d).then(res => {
				this.loading = false;
                const { content, code } = res.data;
                if (code === 0) {
                    this.gridData = content;
                }else{
					this.gridData = [];
				}
            });
        }
    }
};
</script>
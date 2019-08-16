<template>
    <li class="itemLi" v-loading="singleLoding" v-if="itemData">
        <div v-if="isEdit">
            <div class="item name">
                <el-input placeholder="输入方案名称" v-model="editVm.name"></el-input>
            </div>
            <div class="item shop">
                <span>{{ itemData.shops || '' }}</span>
            </div>
            <div class="item opeartion">
                <div class="btn" @click="onCancel(itemData)">取消</div>
                <div class="btn primary" @click="onSave()">{{ itemData.id ? '确定修改' : '确定新增' }}</div>
            </div>
        </div>
        <div v-else>
            <div class="item name">
                <span>{{ itemData.name || '' }}</span>
            </div>
            <div class="item shop">
                <el-popover
                    placement="top-start"
                    width="300"
                    trigger="hover"
                    :content="itemData.shops || ''"
                >
                    <span slot="reference">{{ itemData.shops || '' }}</span>
                </el-popover>
            </div>
            <div class="item opeartion">
                <am-icon
                    class="icon"
                    v-for="(item, key) in editTextList"
                    @click.native="item.function(itemData)"
                    :key="key"
                    :name="item.name"
                    :title="item.title"
                ></am-icon>
            </div>
        </div>
    </li>
</template>

<script>
/* eslint-disable */
import FindIndex from "lodash.findindex";
export default {
    data() {
        return {
            singleLoding: false,
            isEdit: false,
            apiUrl: {
                addScheme: "/cardType!cudScheme.action",
                delScheme: "/cardType!delScheme.action",
                copyScheme: "/cardType!copyScheme.action"
            },
            parentShopId: "",
            editVm: {},
            shopNameStr: "",
			itemData: {},
			itemList:[],
            editTextList: [
                {
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
                },
                {
                    name: "fanganshezhi",
                    title: "方案配置",
                    function: this.onSetting
                }
            ]
        };
    },
    props: {
        planData: Object,
		index: Number,
		pid: String,
		planList: Array
    },
    watch: {},
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.isEdit = this.planData.id !== 0 && !this.planData.id;
			this.itemData = this.planData;
			this.parentShopId = this.pid;
			this.itemList = this.planList;
		},
        //保存方案
        onSave() {
            if (!this.editVm.name) {
                this.$message({
                    message: "请输入方案名！",
                    type: "warning"
                });
                return;
			}

			let itemIndex = FindIndex(
	            this.itemList,
				item => item.name === this.editVm.name);
			if(itemIndex > -1){
				this.$message({
					type: "error",
					message: "卡升级方案名称不能重复"
				});
				return;
			}
			
            let params = {
                schemeId: this.editVm.id,
                name: this.editVm.name,
                parentShopId: this.parentShopId
            };
            console.log("updata===", params);
            this.singleLoding = true;
            this.$http.post(this.apiUrl.addScheme, params).then(res => {
                let resData = res.data;
                const { code, content } = resData;
                this.singleLoding = false;
                if (code === 0) {
                    this.isEdit = false;
                    this.itemData.name = params.name;
                    this.itemData.id = content || params.schemeId;
                    this.$message({
                        message: "操作成功",
                        type: "success"
                    });

                    this.$emit("update", {
                        index: this.index,
                        item: this.editVm
                    });
                }
            });
        },
        onEdit(data) {
            //深拷贝
            let obj = JSON.parse(JSON.stringify(data));
            this.editVm = obj;
            this.isEdit = true;
        },
        onDelete(data) {
            if (data.shops && data.shops.length > 0) {
                this.$message.warning("使用中的方案不能删除！");
                return;
            }
            this.$confirm("此操作将删除该方案, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                this.delProposal({
                    id: data.id,
                    parentShopId: this.parentShopId
                });
            });
        },
        delProposal(params) {
            this.singleLoding = true;
            this.$http.post(this.apiUrl.delScheme, params).then(res => {
                this.singleLoding = false;
                let resData = res.data;
                const { code, content } = resData;
                if (code === 0) {
                    this.$message({
                        message: "删除成功",
                        type: "success"
                    });
                    this.itemData = null;
                    this.$nextTick(() => {
                        this.$emit("delete", { index: this.index });
                    });
                }
            });
        },
        onCopy(data) {
            this.$confirm("确定要复制此方案吗?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            })
                .then(() => {
                    let params = {
						schemeId: data.id,
						name: data.name,
                        parentShopId: this.parentShopId
                    };
                    this.singleLoding = true;
                    this.$http
                        .post(this.apiUrl.copyScheme, params)
                        .then(res => {
                            this.singleLoding = false;
                            let resData = res.data;
                            const { code, content } = resData;
                            if (code === 0) {
                                this.isEdit = false;
                                this.$message({
                                    message: "操作成功",
                                    type: "success"
                                });

                                this.$emit("copy", {});
                            }
                        });
                })
                .catch(() => {});
        },
        onSetting(data) {
            this.$emit("onSetting", { item: data });
        },
        onCancel(data) {
            if (!data.id) {
                this.itemData = null;
                this.$emit("cancle", { index: this.index, item: this.editVm });
            }
            this.isEdit = false;
        }
    }
};
</script>
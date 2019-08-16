<template>
	<el-dialog @close="onDialogClose" :title="title" :width="width" :visible.sync="visibleValue" custom-class="am-dialog">
		<slot></slot>
	</el-dialog>
</template>

<style lang="less">
.am-dialog {
    border: none;
    border-top: 4px solid #701e74;
    box-shadow: none;
    .el-dialog__header {
        background: none;
        margin: 0 10px;
        padding: 8px 0;
        .el-dialog__title {
            font-size: 16px;
            color: #000;
            padding-left: 14px;
            position: relative;
            &::before {
                content: "";
                height: 14px;
                width: 4px;
                border-radius: 2px;
                background: #822687;
                position: absolute;
                left: 0;
                top: 50%;
                margin: -7px 0 0 0;
            }
        }
        .el-dialog__headerbtn {
            position: absolute;
            right: 0;
            top: -3px;
            width: 30px;
            height: 30px;
            background: #701e74;
            color: #fff;
            text-align: center;
            line-height: 30px;
            border-radius: 4px;
            .el-dialog__close {
                color: #fff;
            }
        }
    }
    .el-dialog__body {
        padding: 10px 20px;
        .el-table thead {
            color: #363636;
        }
        .table-head {
            height: 45px;
            padding: 5px 10px;
            background: #fafcff;
            border: 1px solid #ebeef5;
            line-height: 33px;
            border-bottom: none;
            .exportBox,
            .printBox {
                float: right;
                margin-right: 8px;
            }
        }
    }
}
</style>

<script>
/* eslint-disable */
import { PRINT_TABLE_DATA, PRINT_TABLE_TITLE } from "@/js/storageKeys";
export default {
    data() {
        return {
            visibleValue: false
        };
    },
    props: {
        width: String,
        value: Boolean,
        title: String
    },
    watch: {
        value: "init"
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.visibleValue = this.value;
        },
        onDialogClose() {
            this.visible = false;
            this.$emit("input", this.visible);
        }
    }
};
</script>
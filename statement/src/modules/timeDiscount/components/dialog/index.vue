<template>
	<el-dialog @close="onDialogClose" :title="title" :width="width" :visible.sync="visibleValue" custom-class="">
		<slot></slot>
	</el-dialog>
</template>

<style lang="less">
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
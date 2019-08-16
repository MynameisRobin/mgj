<template>
	<div class="distribution_dialog_container" v-if="dialogVisible">
		<el-dialog 
			class="distribution_dialog"
			:visible.sync="dialogVisible"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			:before-close="handleBeforeClose"
			title="分配顾客给其他员工"
			width="445px">
			<div class="distribution_dialog-content" v-loading="loading">
				<el-checkbox-group v-model="empIdList">
					<el-checkbox 
						v-for="emp in empList"
						:disabled="renderDisabled(emp)"
						:label="emp.id"
						:key="emp.id">
						<span class="distribution_dialog-empno" :title="emp.no">{{ emp.no | cutString(5) }}</span>
						<span :title="emp.dutyName">{{emp.name | cutString(12)}}</span>
					</el-checkbox>
				</el-checkbox-group>
			</div>
			<div slot="footer" class="distribution_dialog-footer">
				<el-button @click="onCancel">取 消</el-button>
				<el-button type="primary" @click="onSubmit" :disabled="!empIdList.length">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import Api from '@/api'
export default {
	name: 'DistributionDialog',
	data() {
		return {
			loading: true,
			dialogVisible: false,
			postData: null,
			empIdList: [],
			empList: [],
			currentEmpData: undefined
		}
	},
	methods: {
		renderDisabled(emp) {
			if (!this.currentEmpData) return false;
			const {
				id,
				no
			} = emp;
			const {
				empid,
				empno
			} = this.currentEmpData;
			return id === id && String(empno) === String(no);
		},
		open(params, currentEmpData) {
			this.dialogVisible = true;
			this.postData = params;
			this.currentEmpData = currentEmpData;
			const {
				parentId,
				shopId
			} = params;
			this.loading = true;
			Api.searchCondition({shops: [{shopId, parentId}]}).then(res => {
				this.loading = false;
				const resData = res.data;
				if (resData.code === 0) {
					this.empList = resData.content.emps;
				}
			}).catch(() => {
				this.loading = false;
			})
		},
		close() {
			this.empIdList = [];
			this.currentEmpData = undefined;
			this.dialogVisible = false;
		},
		handleBeforeClose(done) {
			if (this.loading) return;
			done();
			this.reject();
		},
		onCancel() {
			if (this.loading) return;
			this.close();
			this.reject();
		},
		onSubmit() {
			const empIdList = this.empIdList;
			const { empid } = this.currentEmpData;
			const {
				type,
				customerids
			} = this.postData;
			this.loading = true;
			this.$http.post('/member!updEmpCusts.action', {
				...this.postData,
				employeeIds: empIdList.join(','),
				customerids: customerids.join(','),
				currentEmployeeId: empid
			}).then(res => {
				this.loading = false;
				const resData = res.data;
				if (resData.code === 0) {
					this.resolve({
						type,
						result: resData.content,
						customerids,
						employeeIds: [...empIdList]
					});
					this.close();
				}
			}).catch(() => {
				this.loading = false;
			})
		}
	}
}
</script>
<style>
	.distribution_dialog-content {
		max-height: 200px;
		overflow-y: auto;
	}
	.distribution_dialog-content .el-checkbox {
		width: 50%;
		margin: 10px 0 0 !important;
	}
	.distribution_dialog-content .el-checkbox__label {
		font-size: 12px;
	}
	.distribution_dialog-empno {
		display: inline-block;
		width: 45px;
	}
</style>



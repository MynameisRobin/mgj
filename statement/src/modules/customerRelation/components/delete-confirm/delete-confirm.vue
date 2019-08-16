<template>
	<div class="delete_confirm_dialog" v-if="dialogVisible">
		<el-dialog 
			class="delete_confirm_dialog"
			:visible.sync="dialogVisible"
			:close-on-press-escape="false"
			:close-on-click-modal="false"
			title="提示"
			width="445px">
			<div class="delete_confirm_dialog-content">
				<p class="delete_confirm_dialog-tips">为保证数据安全，请输入验证码</p>
				<el-form ref="form" :model="vm" :rules="rules" @submit.native.prevent>
					<el-form-item prop="code">
						<el-input v-model="vm.code" @keyup.enter.native="onSubmit">
							<template slot="append">
								<img @click="createCodeImgUri" :src="vm.codeImgUri" />
							</template>
						</el-input>
					</el-form-item>
				</el-form>
			</div>
			<div slot="footer" class="delete_confirm_dialog-footer">
				<el-button @click="onCancel">取 消</el-button>
				<el-button type="primary" @click="onSubmit">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import AppConfig from '@/config/app'
export default {
	name: 'DeleteConfirmDialog',
	data() {
		return {
			dialogVisible: false,
			loading: true,
			postData: null,
			requestUri: null,
			vm: {
				codeImgUri: '',
				code: ''
			},
			rules: {
				code: [
					{ required: true, message: '请输入图形验证码', trigger: 'blur' },
				]
			}
		}
	},
	methods: {
		createCodeImgUri() {
			const {
				REQUEST_URL,
				REQUEST_URL_PREFIX
			} = AppConfig;
			this.vm.codeImgUri =  `${REQUEST_URL}${REQUEST_URL_PREFIX}/main!sensitiveVC.action?ts=${new Date().getTime()}`;
		},
		open(params) {
			this.vm = {
				code: '',
				codeImgUri: ''
			};
			const {
				requestUri,
				postData
			} = params;
			this.postData = postData;
			this.requestUri = requestUri;
			this.dialogVisible = true;
			this.createCodeImgUri();
		},
		async onSubmit() {
			const valid = await this.$refs.form.validate();
			if (!valid) return;
			this.loading = true;
			const {
				code
			} = this.vm;
			this.$http.post(this.requestUri, {...this.postData, code}).then(res => {
				const resData = res.data;
				this.loading = false;
				if (resData.code === 0) {
					this.resolve();
					this.onCancel();
				} else {
					this.createCodeImgUri();
				}
			}).catch((error) => {
				this.createCodeImgUri();
				this.loading = false;
			});
		},
		onCancel() {
			this.dialogVisible = false;
		}
	},
}
</script>
<style>
	.delete_confirm_dialog-tips {
		color: rgb(239, 92, 92);
		margin-bottom: 15px;
	}
	.delete_confirm_dialog .el-input-group__append {
		padding: 0;
	}
	.delete_confirm_dialog .el-input-group__append img {
		vertical-align: top;
		width: 65px;
	}
</style>

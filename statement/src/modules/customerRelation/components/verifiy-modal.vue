<template>
    <el-dialog title="验证" :visible.sync="dialogFormVisible" width="30%" class="verbox" @close="close">
		<p>为保证数据安全,请输入验证码</p>
		<div>
			<el-input v-model="form.name" auto-complete="off" @keyup.enter.native="ok()"></el-input>
			<img :src="form.imgs" alt="">
		</div>
		<div slot="footer" class="dialog-footer">
			<el-button @click="close">取 消</el-button>
			<el-button type="primary" @click="ok">确 定</el-button>
		</div>
    </el-dialog>
</template>
<script>
import Api from '@/api'
export default {
	name: 'VerifiyModal',
	data() {
		return {
			dialogFormVisible: true,
			form: {
				name: '',
				imgs: ''
			},
		}
	},
	async mounted() {
		this.vc()
	},
	methods: {
		// 打开验证码
		open() {
			this.dialogFormVisible = true
		},
		// 获取验证码
		vc() {
			let date = new Date().getTime()
			this.$http.post('/main!sensitiveVC.action').then(res => {
				this.form.imgs = `${window.location.origin}/shair/main!sensitiveVC.action?ts=${date}`
			})
		},
		ok() {
			this.$emit("verInfo", this.form.name)
			this.$emit('editbei', this.form.name)
			this.$emit('tui', this.form.name)
			this.$emit('reTreat', this.form.name)
			this.$emit('transferShopmate', this.form.name)
			this.dialogFormVisible = false
		},
		
		close() {
			this.$emit("verclose")
			this.$emit("closetv")
			this.dialogFormVisible = false
		},
		// enter() {
		// 	document.onkeydown = function (e) { // 回车提交表单
		// 		// 兼容FF和IE和Opera
		// 		var theEvent = window.event || e;
		// 		var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
		// 		if (code === 13) {
		// 			this.$emit("verInfo", this.form.name)
		// 			this.$emit('editbei', this.form.name)
		// 			this.$emit('tui', this.form.name)
		// 			this.$emit('reTreat', this.form.name)
		// 			this.$emit('transferShopmate', this.form.name)
		// 		}
		// 	}
		// }
	}
}
</script>

<style lang="less">
.verbox {
	padding: 0px;
	.el-input {
		width: 220px !important;
		padding: 0px;
	}
	p {
		padding: 0px 0px 10px 10px;
	}
	img {
		height: 30px;
		width: 80px;
		background: #ccc;
		display: inline-block;
		vertical-align: middle;
	}
}
</style>

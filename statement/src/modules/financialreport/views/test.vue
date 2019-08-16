<template>
	<div class="test">
		<textarea id="kpiData" v-show="kpiData" v-model="kpiData"></textarea>
		<textarea id="areaData" v-show="areaData" v-model="areaData"></textarea>
		<textarea id="postData" v-model="postData"></textarea>
		<button id="submit" @click="onSubmit">请求</button>
		<textarea id="result" v-show="result" v-model="result"></textarea>
	</div>
</template>
<script>
	export default {
		name: 'test',
		data() {
			return {
				result: null,
				kpiData: null,
				areaData: null,
				postData: ''
			}
		},
		methods: {
			onSubmit() {
				let postDataStr = document.getElementById('postData').value;
				let postData = JSON.parse(postDataStr);
				this.$http.post('/superOperationReport!search.action', postData).then(res => {
					let resData = res.data;
					const { code, content, messgae } = resData;
					if (code === 0) {
						this.result = JSON.stringify(content);
					}
				})
			}
		},
		mounted() {
			this.$http.post('/superOperationReport!getKpis.action').then(res => {
				let resData = res.data;
				let { code, content } = resData;
				if (code === 0) {
					this.kpiData = JSON.stringify(content);
				}
			});
			this.$http.post('/superOperationReport!getAreas.action', { allInfo: 1 }).then(res => {
				let resData = res.data;
				let { code, content } = resData;
				if (code === 0) {
					this.areaData = JSON.stringify([content]);
				}
			});
		}
	}
</script>

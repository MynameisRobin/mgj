<template>
	<div class="userList">
		<ul>
			<li v-for="(item, key) in arr" :key="key">
				<!-- <am-icon class="icon " name="zhu"></am-icon> -->
				<!-- <am-icon class="icon" name="e"></am-icon> -->
				<span class="no">{{item.no}}</span>
				<span class="name">{{item.name }}</span>
				<span class="title">{{item.dutyname}}</span>
			</li>
		</ul>
	</div>
</template>

<script>
/* eslint-disable */
import MetaDataMixin from '#/mixins/meta-data'
import Com from '../../com'

export default {
	name: "userList",
	mixins: [MetaDataMixin],
	components: {
		
	},
	props: {
		arr: Array
	},
	data() {
		return {
		
		}
	},
	
	created() {

	},
	mounted() {
		
	},
	methods: {
		handleClose(done) {
			this.$confirm('确认关闭？')
			.then(_ => {
				done();
			})
			.catch(_ => {});
		},
		btnClick() {
			console.log(this.obj);
		}
	}
}
</script>

<style lang="less" scope>
	.userList {
		li {
			padding: 7px 10px 7px 0px;
			span {
				display: inline-block;
			}
			.no {
				color: #333;
			}
			.name {
				margin-left: 8px;
				color: #606266;
				width: 50px;
			}
			.title {
				color: #B6B6B6;
			}
		}
	}
</style>

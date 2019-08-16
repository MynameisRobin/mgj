<template>
	<div class="customer_main">
		<div class="customer_main-header">
			<nav class="customer_menu">
				<ul class="customer_menu-main">
					<li class="customer_menu-item" v-for="item in menuList" :key="item.label">
						<router-link :to="item.to">{{ item.label }}</router-link>
					</li>
				</ul>
			</nav>
		</div>
		<div class="customer_main-content">
			<router-view></router-view>
		</div>
	</div>
</template>
<style>
	.customer_main-content {
		height: calc(100vh - 40px);
	}
	.customer_main .el-pagination {
		margin: 10px -10px 0;
	}
	.customer_main .efficacious {
		color: #10951C;
	}
	.customer_main .risk {
		color: #D40000;
	}
	.customer_main .static {
		color: #E69A1E;
	}
	.customer_main-header {
		height: 38px;
		box-shadow:0px 1px 10px 0px rgba(0,0,0,0.05);
	}
	.customer_menu-main {
		overflow: hidden;
		padding: 12px 13px;
	}
	.customer_menu-item {
		float: left;
		position: relative;
	}
	.customer_menu-item ~ .customer_menu-item {
		margin-left: 35px;
	}
	.customer_menu-item ~ .customer_menu-item:before {
		position: absolute;
		top: 50%;
		left: -20px;
		content: "";
		width: 3px;
		height: 3px;
		background: #C0C4CC;
		border-radius: 100%;
		transform: translateY(-50%);
	}
	.customer_menu-item .router-link-active,
	.customer_menu-item a:hover {
		color: #90208C
	}
	.customer_menu-item a {
		color: #222;
		transition: color .3s;
	}
	@media (max-height: 768px) {
		.customer_main .el-dialog__body {
			padding: 15px 20px 10px;
		}
		.customer_main .el-form-item--mini.el-form-item {
			margin-bottom: 5px;
		}
		.customer_main .advanced_form_title {
			margin-bottom: 10px;
		}
		.customer_main .el-dialog {
			margin-top: 50px !important;
		}
		.customer_main .el-dialog .el-row {
			margin-bottom: 0;
		}
	}
</style>
<script>
import Api from '@/api'
import MetaDataMixin from '#/mixins/meta-data'
import LodashSome from 'lodash.some'
const AllMenuList = [
	{label: '顾客概要分析', to: {name: 'index'}, permissions: ['F12']},
	{label: '顾客查询', to: {name: 'customerQuery'}, permissions: ['F13']},
	{label: '会员卡查询', to: {name: 'cardSearch'}, permissions: ['F14']},
	{label: '顾客分配', to: {name: 'distribution'}, permissions: ['F15']},
]
export default {
	name: 'customerMain',
	mixins: [
		MetaDataMixin
	],
	computed: {
		menuList() {
			return AllMenuList.filter(menu => {
				const {
					permissions
				} = menu;
				return LodashSome(permissions, permission => this.userPowerList.indexOf(permission) !== -1);
			})
		}
	},
	async created() {
		const res = await Api.getMetaData();
		const resData = res.data;
		const { code, content } = resData;
		if (code === 0) {
			this.$eventBus.env = {
				...content
			}
			if (this.$route.name === 'main') {
				this.$router.replace(this.menuList[0].to);
			}
		}
	}
}
</script>


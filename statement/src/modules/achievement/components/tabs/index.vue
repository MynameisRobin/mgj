<template>
	<div :style="tabStyle" class="tabsWrap">
		<div class="indexTabs">
			<span :class="{'label': true, 'active': qType == item.type}" 
				v-for="(item, key) in tabPaneList" :key="key"
				@click="handleClick(item)">
				<i v-if="item.type == 5" class="tab6Icon icon iconfont mgj-xuyeji"></i>
				{{item.label}}
			</span>
		</div>

		<div class="btnDiv"> 
			
			<!-- 分配界面 -->
			<div v-if="routePath.indexOf('/StoreConfig/storeTable') >= 0 " class="back_button">
				<el-button @click="handleBack" size="small">返回{{modelText}}配置</el-button>
			</div>

			<!-- 编辑界面 -->
			<div v-if="routePath.indexOf('indexConfigure') >= 0 " class="headExplain">
				<span class="fangdaBtn" @click="fangdaFun">
					<am-icon :name=" fangda ? 'offFullScreen' : 'FullScreen' " size="20"></am-icon>
					{{ fangda ? '收起' : '放大' }}配置窗口
				</span>
				<div v-if="isHeadquarters !== '2' " class="rightDiv">
					<span class="spanText" @click="popModelShow">
						<am-icon name="guanli" size="20"></am-icon>
						方案管理
					</span>
				</div>
			</div>

		</div>
	</div>
	
</template>

<script>
export default {
	name: 'tabs',
	props: {
		tabPaneList: Array,
		qType: [String, Number],
		isHeadquarters: [String, Number]
	},
	computed: {
		modelText() {
			let text = '业绩';
			return text;
		},
		routePath() {
			return this.$route.path;
		}
	},
	data() {
		return {
			tabStyle: null,
			fangda: false,
		}
	},
	mounted() {
		this.handleResize();
		window.addEventListener('resize', this.handleResize);
	},
	methods: {
		handleResize() {
			this.tabStyle = `width: ${document.body.clientWidth - 10}px`;
		},
		handleClick(data) {
			this.$emit('tabsChange', data);
		},
		handleBack() {
			this.$emit('tabsBack');	
		},
		fangdaFun() {
			let royaltyDom = window.parent.document.querySelector('#royaltyallocation');
			try {
				if (!this.fangda) {
					royaltyDom.style.top = '0';
					royaltyDom.style.zIndex = '999';
					royaltyDom.style.transition = 'all .1s';
				} else {
					royaltyDom.style.top = '146px';
					royaltyDom.style.zIndex = '0';
				}
				this.fangda = !this.fangda;
			} catch (err) {
				console.log(err);
			}
		},
		popModelShow() {
			this.$emit('tabsPopModelShow');
		},
	}
}
</script>

<style lang="less" scoped>
	.tabsWrap {
		position: relative;
		.indexTabs {
			margin-left: 13px;
			border-bottom: 1px solid #fc9252;
			.label {
				display: inline-block;
				cursor: pointer;
				margin-right: 5px;
				padding: 8px 21px;
				color: #303133;
				background: #eee;
				&:hover {
					color: #fff;
					background: #fc9252;
				}
			}
			.active {
				color: #fff;
				background: #fc9252;
			}

			.tab6Icon {
				font-size: 13px;
				margin-right: 10px;
			}
		}

		.btnDiv {
			position: absolute;
			z-index: 1;
			top: -2px;
			right: 13px;
			.headExplain {
				.fangdaBtn {
					cursor: pointer;
					display: inline-block;
					margin-right: 20px;
					color: #FC9252;
				}
				.rightDiv {
					display: inline-block;
					.spanText {
						color: #FC9252;
						cursor: pointer;
					}
				}
			}
		}
	}
	
</style>


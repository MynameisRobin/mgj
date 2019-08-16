<template>
	<el-popover
		placement="top-start"
		trigger="hover"
		width="300">
		<p v-if="type === 0 || type == false">门店仅可启用1种主方案，所有营收类型的提成均按照主方案的配置来计算；</p>
		<p v-if="type === 1 || type == true">门店同时启用最多3种额外奖励方案，计算叠加</p>
		<p>员工的提成=主方案计算的提成+额外奖励方案的提成</p>
		<am-icon 
			slot="reference"
			:class="classNames"
			:name="typeName">
		</am-icon>
	</el-popover>
</template>

<script>
	export default {
		name: 'PlanType',
		props: {
			type: [Number, Boolean],
		},
		computed: {
			typeName() {
				let typeNameMap = '';
				if (this.type === 0 || this.type === false) {
					typeNameMap = 'zhu';
				} else {
					typeNameMap = 'j';
				}
				return typeNameMap;
			},
			classNames() {
				
				let typeClassName = this.typeName || '';
				return ['icon', typeClassName];
			}
		}
	}
</script>

<style lang="less">
	i.zhu {
		color: #00AAEE;
	}
	i.j {
		color: #FC9252;
	}
</style>


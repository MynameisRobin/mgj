<template>
	
	<div class="wrap">
		<transition name="fade" mode="out-in">
			<component :is="showModel" 
				:fastSearchMap="fastSearchMap"
				:enableStep="enableStep"
				@showModelChange="onShowModelChange"></component>
		</transition>
	</div>

</template>

<script>

import Round from './round'
import ItemsWrap from './itemsWrap'
import Item from './item'

export default {
	name: 'FastNav',
	props: {
		fastSearchMap: Array,
		enableStep: Number
	},
	components: {
		Round,
		ItemsWrap,
	},
	data() {
		return {
			showModel: 'Round',
		}
	},
	created() {
		
	},
	mounted() {

	},
	methods: {
		onShowModelChange(type) {
			this.showModel = type;
		},
	}
}
</script>

<style lang="less" scoped>
	.wrap {
		.fade-enter-active{
			transition: all .1s;
			transition-delay: .2s;
		}
		.fade-leave-active{
			transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
		}
		.fade-enter, .fade-leave-active{
			opacity: 0;
			transform: translateX(10px);
		}
	}
</style>

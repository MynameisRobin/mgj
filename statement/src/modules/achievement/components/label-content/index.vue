<template>
	<span class="label" v-if="obj.fieldName || obj.name || obj.osName" :title="obj.fieldName || obj.name || obj.osName">{{obj.fieldName || obj.name || obj.osName | cutString(12)}}</span>
</template>

<script>
/* eslint-disable */
import draggable from 'vuedraggable'

export default {
	name: "LabelContent",
	components: {
		draggable,
	},
	props: {
		obj: Object,
		// keyParams: Number
	},
	data() {
		return {
			
		}
	},
	created() {
		
	},
	mounted() {
	
	},
}
</script>

<style lang="less" scoped>
	.label {
		display: inline-block;
		margin-right: 8px;
		margin-bottom: 8px;
		padding: 3px 14px;
		background:rgba(255,255,255,1);
		box-shadow:0px 2px 15px 0px rgba(0,0,0,0.1);
		border-radius: 4px;
		border:1px solid rgba(242,242,242,1);
	}
</style>

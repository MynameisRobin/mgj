<template>
	<li v-if="obj.id" :id="(obj.name || obj.cardtypename || obj.packName) + projectId"> 
		<div v-if="showId">
			<span class="type" v-if="obj.outer_name" :title="obj.outer_name">{{obj.outer_name}}</span>
			<!-- <span class="id">{{ obj.itemid || obj.no || obj.cardtypeid || obj.id }}</span> -->
			<span class="id" :title="obj.id">{{ obj.id }}</span>
			<span class="name" :title="obj.name || obj.cardtypename || obj.packName">{{obj.name || obj.cardtypename || obj.packName}}</span>
			<el-checkbox v-if="parentKey === batchKey" :pro_id="obj.id" class="pro_check"></el-checkbox>
		</div>

		<div v-else>
			<span class="name" :title="obj.packName">{{obj.packName | cutString(14)}}</span>
			<el-checkbox v-if="parentKey === batchKey" :pro_id="obj.id" class="pro_check"></el-checkbox>
		</div>
	</li>
</template>

<script>
/* eslint-disable */
import draggable from 'vuedraggable'

export default {
	name: "ProjectName",
	components: {
		draggable,
	},
	props: {
		obj: Object,
		index: Number,
		type: String,
		parentKey: String,
		batchKey: String
	},
	data() {
		return {
			
		}
	},
	computed: {
		showId () {
			return this.obj.id.indexOf('T') === -1;
		},
		projectId() {
			return `|${this.obj.id}`;
		}
	},
	created() {

	},
	mounted() {
		
	},
}
</script>

<style lang="less" scoped>
	li {
		
		position: relative;
		width: 220px;
		height: 30px;
		margin: 4px 0;
		padding: 5px 5px 5px 50px;
		line-height: 20px;
		background:rgba(255,255,255,1);
		box-shadow:0px 2px 15px 0px rgba(0,0,0,0.1);
		border-radius:2px;
		border:1px solid rgba(242,242,242,1);
		> div {
			display: flex;
		}
		.type, .id, .name {
			overflow:hidden;
			text-overflow:ellipsis;
			white-space:nowrap; 
		}
		.type {
			position: absolute;
			top: 5px;
			left: 5px;
			width: 40px;
			height: 18px;
			padding-left: 5px;
			line-height: 20px;
			background: #eee;
		}
		.id {
			display: inline-block;
			width: 45px;
		}
		.name {
			display: inline-block;
			width: 100px;
		}
		.pro_check {
			display: inline-block;			
		}
	}
	
</style>

<template>
	<p @click="clickFun">{{objCopy.a1}}</p>
</template>

<script>
/* eslint-disable */

export default {
	props : {
		obj: Object
	},
	data () {
		return {
			objCopy : {}
		}
	},
	computed: {
		// objCopy () {
		// 	return JSON.parse(JSON.stringify(this.obj))
		// }	
	},
	// watch: {
	// 	objCopy(newV, oldV) {
	// 		console.log(newV, oldV);
	// 	}
	// },
	mounted () {
		console.log(this.obj);
		this.objCopy = JSON.parse(JSON.stringify(this.obj));

		this.objCopy.a1 = 222222222;

		
	},
	methods: {
		clickFun() {
			console.log(22222);
			this.obj.a1 = this.objCopy.a1;
		}
	}
}
</script>

<template>
	<i class="" :class="classList" :style="styleObject"></i>
</template>
<script>
	export default {
		name: 'AmIcon',
		props: {
			name: String,
			size: {
				type: String,
				default: '14px'
			},
			isElement: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			classList() {
				if (this.isElement) {
					return [`el-icon-${this.name}`]
				} else {
					return ['icon', 'iconfont', `mgj-${this.name}`]
				}
			},
			styleObject() {
				return {
					fontSize: this.size
				}
			}
		}
	}
</script>

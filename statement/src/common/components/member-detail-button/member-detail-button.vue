<template>
	<a href="javascript:;" @click="openCustomerDetail">
		<slot>详情</slot>
	</a>
</template>
<script>
export default {
	name: 'MemberdetailButton',
	props: {
		id: [Number, String]
	},
	methods: {
		openCustomerDetail() {
			const parentDocument = window.parent.document;
			const iframeBoxEl = parentDocument.querySelector('#customer_detail_box');
			if (!iframeBoxEl) {
				this.$router.push({
					name: 'customerBasics',
					params: {
						id: this.id
					}
				})
			} else {
				const iframeEl = parentDocument.querySelector('.customer_detail_iframe');
				const curClassName = iframeBoxEl.className;
				iframeBoxEl.className = `${curClassName} show`;
				iframeEl.src = `/shair/components/customerRelation/index.html#/detail/${this.id}/profile/basics`;
			}
		},
	}
}
</script>

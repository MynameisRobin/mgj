import {
	SexMap,
	StatusMap,
	StageMap,
	StatusClassMap,
} from '#/config/constant'
export default {
	data() {
		return {
			SexMap
		}
	},
	methods: {
		getStatusName(status) {
			return StatusMap[status] || '';
		},
		getSexName(sex) {
			return SexMap[sex] || '';
		},
		getStageName(stage) {
			return StageMap[stage] || '';
		},
		formatterMemberStatusName(row) {
			const {
				memberstatusName,
				memberstatus,
				memberStatus
			} = row;
			const statusClassName = StatusClassMap[memberstatus || memberStatus];
			return <span class={statusClassName}>{memberstatusName}</span>
		},
	}
}
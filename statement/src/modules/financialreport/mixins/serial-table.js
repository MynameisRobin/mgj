import Dayjs from 'dayjs'
import ReportTableMixins from '#/mixins/report-table'
import MetaDataMixins from '@/mixins/meta-data'
const defaultStartTime = Dayjs().startOf('day').add(-1, 'M').add(1, 'day').valueOf();
const defaultEndTime = Dayjs().endOf('day').valueOf();
export default {
	mixins: [
		ReportTableMixins,
		MetaDataMixins
	],
	data() {
		return {
			tableData: [],
			columns: [],
			columnData: [],
			tableLoading: false,
			daterange: [defaultStartTime, defaultEndTime],
			total: 0,
			tableHeight: '',
			loaded: false,
		}
	},
	created() {
		this.$nextTick(() => {
			const positionConfig = this.$refs.tableWrap.getBoundingClientRect();
			this.tableHeight = `${positionConfig.height}px`;
			this.loaded = true;
		})
	},
	computed: {
		pageSizes() {
			let result = Array.from({ length: 5 }, (item, index) => 100 * (index + 1));
			return result;
		},
	},
	methods: {
		onViewOrderDetail(billId) {
			const parentShopId  = this.parentShopId;
			this.$emit('view-bill-detail', {billId, parentShopId});
		},
		handleDateChange(values) {
			const [minDate, maxDate] = values;
			let diffDays = Dayjs(maxDate).diff(Dayjs(minDate), 'day');
			if (diffDays > 31) {
				this.$message({
					type: 'warning',
					showClose: true,
					message: `流水表最多只能查31天`
				})
				this.daterange = [
					minDate,
					Dayjs(maxDate).add(31 - diffDays, 'day').valueOf()
				]
				return true;
			}
		},
		handleSizeChange(value) {
			this.filterData.pageSize = value;
			this.filterData.pageNumber = 1;
			this.onSearch();
		},
		handleCurrentPageChange(value) {
			this.filterData.pageNumber = value;
			this.onSearch();
		},
		onSearch() {
			this.getTableData();
		},
		getTableData() {
			const { daterange, searchObj, groups, filterData } = this;
			if (this.groups.length === 0 || this.searchObj.length === 0) {
				this.$message({
					type: 'error',
					message: '请选择查询对象及kpi',
					showClose: true
				});
				return;
			}
			const [startTime, endTime] = daterange;
			let level = searchObj[0].level;
			let postData = {
				...filterData,
				parentShopId: this.parentShopId,
				groups,
				searchObj,
				startTime,
				endTime,
				level,
				searchType: 1,
				reportType: 1,
			}
			postData.pageNumber -= 1;
			this.tableLoading = true;
			this.$http.post('/superOperationReport!search.action', postData).then(res => {
				this.tableLoading = false;
				let resData = res.data;
				const { code, content } = resData;
				if (code === 0) {
					const { data, columns, head, total } = content;
					this.tableData = this.decoratorTableData ? this.decoratorTableData(content) : (data || []);
					this.columns = columns;
					this.columnData = head;
					this.total = parseInt(total);
				}
			}).catch(err => {
				this.tableLoading = false;
			});
		},
		onViewBillDetail({billId, parentShopId}) {
			this.getBillDetail({
				id: billId,
				parentShopId
			})
		},
		getBillDetail(data) {
			this.$http
				.post("/bill!detail.action", {
					parentShopId: data.parentShopId,
					id: data.id
				})
				.then(res => {
					if (!res) {
						return console.log("res:", res);
					}
					const { content, code } = res.data;
					if (code === 0) {
						window.qrModal.show(content);
					}
				});
		},
		onTableSearch() {
			this.filterData.pageNumber = 1;
			this.onSearch();
		},
		refresh() {
			this.$nextTick(() => {
				this.onTableSearch();
			})
		}
	}
}
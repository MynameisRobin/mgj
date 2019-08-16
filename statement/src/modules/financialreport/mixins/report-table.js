const getSearchObjLabel = function (value) {
	if (!value) return '';
	let index = value.indexOf(')');
	if (index !== -1) {
		return value.substr(index + 1)
	}
	return value;
}
import { PRINT_TABLE_DATA, PRINT_TABLE_TITLE } from '@/js/storageKeys'
export default {
	filters: {
		viewFullLabel(value) {
			if (!value) return '--';
			let label = getSearchObjLabel(value);
			return label;
		}
	},
	methods: {
		onPrintOrExcel() {
			let topTrContent = '';
			let childTrContent = '';
			this.columnData.forEach(item => {
				topTrContent += `<th>${item}</th>`;
			})
			let tbodyContent = '';
			this.tableData.forEach(item => {
				let trContent = '';
				for (let cIndex = 0; cIndex < this.columnData.length; cIndex++) {
					const cItem = item[cIndex];
					let value = cIndex === 0 ? getSearchObjLabel(cItem) : cItem;
					let numberValue = parseFloat(value);
					if (!isNaN(numberValue) && numberValue === 0) {
						value = 0;
					}
					trContent += `<td>${value || '-'}</td>`;
				}
				tbodyContent += `<tr>${trContent}</tr>`
			})
			let tableHead = `<tr>${topTrContent}</tr>`;
			if (childTrContent) {
				tableHead += `<tr>${childTrContent}</tr>`;
			}
			const tableBody = `<tbody>${tbodyContent}</tbody>`;
			let tableHtmlString = `<table class="rl_dataviewer_tbody" cellspacing="0" cellpadding="0"><thead>${tableHead}</thead><tbody>${tableBody}</tbody></table>`;
			const { origin } = window.location;
			window.localStorage.setItem(PRINT_TABLE_TITLE, '财务报表');
			window.localStorage.setItem(PRINT_TABLE_DATA, tableHtmlString);
			window.open(`${origin}/shair/MGJ_reservation/lib/rl_printer/rlprinterInner.html`, '', 'height=600,width=1280,top=0,left=0,toolbar=no,menubar=no,status=no');
		},
	}
}
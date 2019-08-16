const realLength = (str) => {
	return str.replace(/[^\x00-\xff]/g, "**").length; 
}
export default function cutString(value, count) {
	if (!value) return '';
	let doubleLength = realLength(value);
	var maxLength = Math.floor(count / 2);
	for (let i = maxLength; i < value.length; i++) {
		if (realLength(value.substr(0, i)) >= count) {
			return value.substr(0, i) + "...";
		}
	}
	return value;
}
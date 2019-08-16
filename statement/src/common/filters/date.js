import dayjs from 'dayjs'
export default function date(value, format = "YYYY-MM-DD HH:mm:ss") {
	if (!value) return '';
	return dayjs(value).format(format)
}
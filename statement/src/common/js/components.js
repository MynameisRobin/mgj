import Icon from '@/components/icon'
import Sideslip from '@/components/sideslip'
import SignleLineText from '@/components/signle-line-text'
import FastNav from '@/components/fast-nav'

function install(Vue) {
	Vue.use(Icon);
	Vue.use(Sideslip);
	Vue.use(SignleLineText)
	Vue.use(FastNav)
}
export default install;
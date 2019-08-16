import Index from './src/index.vue'

Index.install = function (Vue) {
	Vue.component(Index.name, Index);
}

export default Index;
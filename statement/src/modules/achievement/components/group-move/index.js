import Vue from 'vue';
import GroupMove from './group-move'


export default {
	_instance: null,
	_initInstance(propsData) {
		let Component = Vue.extend(GroupMove);
		this._instance = new Component({
			el: document.createElement('div'),
			propsData
		});
		document.body.appendChild(this._instance.$el);
	},
	open(params) {
		return new Promise((resolve, reject) => {
			params.resolve = resolve;
			if (this._instance) {
				this.setData(params);
			} else {
				this._initInstance(params);
			}
			this._instance.open();
		})
	},
	close() {
		this._instance && this._instance.close();
	},
	setData(data) {
		Object.assign(this._instance, data);
	}
}
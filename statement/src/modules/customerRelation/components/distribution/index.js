
import Vue from 'vue'
import DistributionVue from './distribution.vue'

class DistributionDialog {
	constructor() {
		this._instance = undefined;
	}

	_initInstance() {
		let Component = Vue.extend(DistributionVue);
		this._instance = new Component({
			el: document.createElement('div'),
		});
		document.body.appendChild(this._instance.$el);
	}

	getInstance() {
		return this._instance;
	}

	open(params, currentEmpData) {
		return new Promise((resolve, reject) => {
			if (!this._instance) {
				this._initInstance();
			}
			Object.assign(this._instance, {resolve, reject})
			this._instance.open(params, currentEmpData);
		})
		
	}
}

export default new DistributionDialog();
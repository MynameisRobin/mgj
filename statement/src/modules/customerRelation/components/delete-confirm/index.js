
import Vue from 'vue'
import DeleteConfirm from './delete-confirm.vue'

class DistributionDialog {
	constructor() {
		this._instance = undefined;
	}

	_initInstance() {
		let Component = Vue.extend(DeleteConfirm);
		this._instance = new Component({
			el: document.createElement('div'),
		});
		document.body.appendChild(this._instance.$el);
	}

	getInstance() {
		return this._instance;
	}

	open(params) {
		return new Promise((resolve, reject) => {
			if (!this._instance) {
				this._initInstance();
			}
			Object.assign(this._instance, {resolve, reject})
			this._instance.open(params);
		})
		
	}
}

export default new DistributionDialog();
export const getChildState = node => {
	let all = true;
	let none = true;
	for (let i = 0, j = node.length; i < j; i++) {
		const n = node[i];
		if (n.checked !== true) {
			all = false;
		}
		if (n.checked !== false) {
			none = false;
		}
	}
	return { all, none, half: !all && !none };
};
  
const reInitChecked = function (node) {
	if (node.childNodes.length === 0) return;

	const {all, none, half} = getChildState(node.childNodes);
	if (all) {
		node.checkAll = true;
		node.indeterminate = false;
	} else if (half) {
		node.checkAll = false;
		node.indeterminate = true;
	} else if (none) {
		node.checkAll = false;
		node.indeterminate = false;
	}
};
let nodeIdSeed = 0;
export default class Node {
	constructor(options) {
		this.id = nodeIdSeed++;
		this.checked = false;
		this.data = null;
		this.parent = null;
		this.level = 0;
		this.childNodes = [];
		this.expanded = false;
		this.loaded = false;
		this.loading = false;
		this.checkAll = false;
		this.indeterminate = false;
		this.selected = false;

		for (let name in options) {
			if (options.hasOwnProperty(name)) {
				this[name] = options[name];
			}
		}

		if (this.parent) {
			this.level = this.parent.level + 1;
		}

		const store = this.store;
		store.registerNode(this);
		this.initData(this.data);
	}

	initData(data) {
		// data.relations = [];
		// if (this.parent) {
		// 	data.relations = [
		// 		...this.parent.data.relations,
		// 	]
		// }
		// if (data.id) {
		// 	data.relations.push(this.data.id);
		// }
		this.data = data;
		this.childNodes = [];

		let children;
		if (this.level === 0 && this.data instanceof Array) {
			children = this.data;
		} else {
			children = this.data[this.store.props.children] || [];
		}
		for (let i = 0, len = children.length; i < len; i++ ) {
			this.insertChild({child: { data: children[i] }});
		}
		this.updateLeafState();
	}

	shouldLoadData() {
		return this.store.lazy === true && this.store.load && !this.loaded;
	}

	getChildren(init = false) {
		if (this.level === 0) return this.data;
		const data = this.data;
		if (!data) return null;

		const props = this.store.props;
		const { children } = props;

		if (data[children] === undefined) {
			data[children] = null;
		}
		if (init && !data[children]) {
			data[children] = [];
		}

		return data[children];
	}

	insertChild({child, index}) {
		const props = this.store.props;
		const { children } = props;
		if (!(child instanceof Node)) {
			Object.assign(child, {
				parent: this,
				store: this.store,
				loaded: child.data[children]
			})
			child = new Node(child);
		}
		child.level = this.level + 1;
		if (typeof index === 'undefined' || index < 0) {
			this.childNodes.push(child);
		} else {
			this.childNodes.splice(index, 0, child);
		}
	}

	updateLeafState() {
		const childNodes = this.childNodes;
		if (!this.store.lazy || (this.store.lazy === true && this.loaded === true)) {
			this.isLeaf = !childNodes || childNodes.length === 0;
			return;
		}
		this.isLeaf = false;
	}

	async expand(callback) {
		if (this.shouldLoadData()) {
			await  this.loadData();
		}
		this.expanded = true;
		if (callback) callback();
	}

	collapse() {
		this.expanded = false;
	}

	setChecked(value) {
		this.indeterminate = value === 'half';
		this.checked = value === true;
		let parent = this.parent;
		reInitChecked(parent);
		if (this.checked) {
			this.store.removeOtherLevelNodeChecked(this)
			while (parent && parent.level > 0) {
				parent.expand();
				parent.selected = true;
				parent = parent.parent;
			}
		} else {
			this.selected = false;
		}
	}

	createChildren(nodes, defaultProps = {}) {
		nodes.forEach((item) => {
			this.insertChild({
				child: { data: item }
			});
		});
	}

	loadData() {
		return new Promise((resolve, reject) => {
			if (this.store.lazy === true && this.store.load && !this.loaded && !this.loading) {
				this.loading = true;
				this.store.load(this, (nodes) => {
					this.loaded = true;
					this.loading = false;
					this.childNodes = [];
					this.createChildren(nodes);
					this.updateLeafState();
					resolve();
				});
			}
			resolve();
		})
	}
}
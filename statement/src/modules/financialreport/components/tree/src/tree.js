import Node from './node.js'
export default class Tree {
	constructor(options) {
		this.currentNode = null; // 当前节点
		this.currentNodeKey = null; // 当前节点的key
		this.nodesMap = {}; // node 集合
		this.props = null; // 自定义字段

		for (let option in options) {
			if (options.hasOwnProperty(option)) {
				this[option] = options[option];
			}
		}
		this.root = new Node({
			data: this.data,
			store: this
		});
	}

	getAllNodes() {
		const allNodes = [];
		const nodesMap = this.nodesMap;
		for (let nodeKey in nodesMap) {
			if (nodesMap.hasOwnProperty(nodeKey)) {
				allNodes.push(nodesMap[nodeKey]);
			}
		}
		return allNodes;
	}

	getNode(key) {
		return this.nodesMap[key];
	}

	getCheckedNodes() {
		let checkedNodes = [];
		const recursion = function (node) {
			const childNodes = node.root ? node.root.childNodes : node.childNodes;
			childNodes.forEach((child) => {
				if (child.checked) {
					checkedNodes.push(child.data);
				}
				recursion(child);
			});
		}
		recursion(this);
		return checkedNodes;
	}

	setCheckedNodes(nodes) {

	}

	getCheckedKeys() {
		return this.getCheckedNodes().map((data) => (data || {})[this.key]);
	}

	resetChecked() {
		let allNodes = this.getAllNodes();
		allNodes.forEach(item => {
			item.setChecked(false)
		})
	}

	setCheckedKeys(keys, shopId, areaId) {
		const key = this.key;
		const allNodes = this.getAllNodes();
		for (let i = 0; i < allNodes.length; i++) {
			const node = allNodes[i];
			const nodeKey = node.data[key];
			let isChecked = keys.includes(nodeKey);
			if (!isChecked || (shopId && shopId !== node.data.shopId) || (areaId && areaId !== node.data.areaId)) {
				node.setChecked(false);
				continue;
			}
			node.setChecked(true);
			let parent = node.parent;
			while (parent && parent.level > 0) {
				if (isChecked) {
					parent.expand();
				} else {
					parent.collapse();
				}
				parent = parent.parent;
			}
		}
	}

	registerNode(node) {
		const key = this.key;
		if (!key || !node || !node.data) return;
		// const { parent } = node;
		// let parentNodeKey = "";
		// if (parent) {
		// 	parentNodeKey = parent.data[key] || "";
		// }
		let nodeKey = node.data[key];
		const { areaId, shopId, level, id } = node.data;
		const registerKey = `${level === 1 ? id : areaId}-${shopId}-${nodeKey}`;
		if (nodeKey !== undefined) this.nodesMap[registerKey] = node;
	}

	removeOtherLevelNodeChecked(node) {
		for (let key in this.nodesMap) {
			let cNode = this.nodesMap[key];
			if (cNode.level === node.level) {
				cNode.selected = cNode.checked;
			}
			if ((cNode.level !== node.level) || (cNode.parent.id !== node.parent.id)) {
				if (cNode.checked) {
					cNode.setChecked(false);
					cNode.collapse();
				}
				cNode.selected = false;
			}
		}
	}
}
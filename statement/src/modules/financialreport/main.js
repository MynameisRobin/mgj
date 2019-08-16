import Vue from 'vue'
import Module from '@/js/module-init'
import moduleRoutes from './router'
let moduleConfig = process.moduleConfig;
import './css/app.css';
async function install(Vue) {
	Module.install(Vue, {moduleConfig, moduleRoutes});
}
install(Vue)

import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import home from '@/page/index'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/vue',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/',
      name: 'home',
      component: home
    }
  ]
})

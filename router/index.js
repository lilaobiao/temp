import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'

const routePath = [
  {
    path: '/route',
    name: 'Route',
    component: () => import(/* webpackChunkName: "route" */ '../views/Route/Index.vue'),
    children: [
      {
        path: 'for',
        name: 'RouteFoo',
        component: () => import(/* webpackChunkName: "route" */ '../views/Route/Foo.vue')
      }, {
        path: 'bar/:id',
        name: 'RouteBar',
        component: () => import(/* webpackChunkName: "route" */ '../views/Route/Bar.vue')
      }, {
        path: 'other/:pre:catchAll(.*)', // pre默认会匹配到第一个字符
        name: 'RouteOther',
        component: () => import(/* webpackChunkName: "route" */ '../views/Route/Other.vue')
      }, {
        path: 'other2/:pre([a-z0-9A-Z]{3}):catchAll(.*)',
        name: 'RouteOther2',
        component: () => import(/* webpackChunkName: "route" */ '../views/Route/Other2.vue')
      }
    ]
  }
]

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/basic',
    name: 'Basic',
    component: () => import(/* webpackChunkName: "about" */ '../views/Basic.vue')
  },
  {
    path: '/i18n',
    name: 'I18n',
    component: () => import(/* webpackChunkName: "about" */ '../views/I18n.vue')
  },
  {
    path: '/element',
    name: 'Element',
    component: () => import(/* webpackChunkName: "element" */ '../views/Element.vue')
  },
  {
    path: '/vmodel',
    name: 'Vmodel',
    component: () => import(/* webpackChunkName: "element" */ '../views/Vmodel.vue')
  },
  {
    path: '/zhihu',
    name: 'Zhihu',
    component: () => import(/* webpackChunkName: "zhihu" */ '../views/Zhihu.vue')
  },
  {
    path: '/zhihu-detail/:id',
    name: 'ZhihuDetail',
    component: () => import(/* webpackChunkName: "zhihu" */ '../views/ZhihuDetail.vue')
  },
  {
    path: '/staff',
    name: 'Staff',
    component: () => import(/* webpackChunkName: "about" */ '../views/Staff.vue')
  },
  ...routePath,
  {
    path: '/:catchAll(.*)',
    name: 'Staff',
    component: () => import(/* webpackChunkName: "about" */ '../views/Staff.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

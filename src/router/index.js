import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "login-welcome-home" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login-welcome-home" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login-welcome-home" */ '../components/Welcome.vue')
const Users = () => import(/* webpackChunkName: "home" */ '../components/home/Users.vue')
const Roles = () => import(/* webpackChunkName: "power" */ '../components/power/Roles.vue')
const Rights = () => import(/* webpackChunkName: "power" */ '../components/power/Rights.vue')
const Categories = () => import(/* webpackChunkName: "goods" */ '../components/goods/Categories.vue')
const Params = () => import(/* webpackChunkName: "goods" */ '../components/goods/Params.vue')
const Goods = () => import(/* webpackChunkName: "goods" */ '../components/goods/Goods.vue')
const Add = () => import(/* webpackChunkName: "goods" */ '../components/goods/Add.vue')
const Orders = () => import(/* webpackChunkName: "orders" */ '../components/order/Orders.vue')
const Reports = () => import(/* webpackChunkName: "reports" */ '../components/reports/Reports.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: 'login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods,
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Orders
      },
      {
        path: '/reports',
        component: Reports
      },
      
    ]
  },
  
]

const router = new VueRouter({
  mode: 'history',
  routes
})

//添加导航守卫,如果没有携带token,则强制进入login页面
router.beforeEach((to, from, next) => {
  //如果访问登录页面,直接放行
  if(to.path === '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token')
  //如果没有token,直接强制跳转到登录页面
  if(!tokenStr) return next('/login');
  //如果有token,直接放行
  next();
}) 

export default router

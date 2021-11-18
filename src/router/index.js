import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import('../components/login/Login.vue')
const Home = () => import('../components/home/Home.vue')
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

//如果没有token,强制跳转到登录页面
router.beforeEach((to, from, next) => {
  //next()有两种作用: 1.满足条件,放行; 2.不满足条件,强制跳转
  // 如果当前路径就是在登录页,name放行
  if(to.path === "/login") {
    return next();
  }else {
    //获取token
    const tokenStr = window.sessionStorage.getItem('token');
    if(!tokenStr) {
      //如果没有token,强制跳转到登录页面(刷新之后会跳转到登录页)
      return next('/login');
    }else {
      //如果有,直接放行
      next();
    }
  }
})

export default router

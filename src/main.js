import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'


//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // console.log(config);
  // 为请求对象,添加token验证的Authorization字段
  //添加这个字段之后,那些需要权限访问的就可以连接到了
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
Vue.prototype.$http = axios;
Vue.use(ElementUI);

Vue.component('tree-table', TreeTable);

//引入全局样式
import './assets/css/common.css';
//引入font
import './assets/fonts/iconfont.css';

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

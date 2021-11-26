import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

//富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
//全局注册
Vue.use(VueQuillEditor)


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

//注册全局过滤器(主要是用在Goods.vue文件中)
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  //ES2017引入了字符串补全长度的功能。如果某个字符串不够指定长度，会在头部或尾部补全。
  //padStart()用于头部补全，padEnd()用于尾部补全。
  const m = (dt.getMonth() + 1 + '').padStart(2, '0');
  const d = (dt.getDate() + '').padStart(2, '0');
  const hh = (dt.getHours() + '').padStart(2, '0');
  const mm = (dt.getMinutes() + '').padStart(2, '0');
  const ss = (dt.getSeconds() + '').padStart(2, '0');
  //时间格式:yyyy-m-d hh:mm:ss
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})

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

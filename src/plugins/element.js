import Vue from 'vue'
import { Form, FormItem, Button, Input, Message } from 'elment-ui'

Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
//message用法不同,要挂载到Vue上
Vue.prototype.$message = Message;
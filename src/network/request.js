import axios from 'axios'
//导入进度条nprogress对应的js和css
import nProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default function request(config) {
  return new Promise((resolve, reject) => {
    const instance = axios.create({
      //接口基准地址
      baseURL: 'http://127.0.0.1:8888/api/private/v1/',
      timeout: 5000,
      method: config.method || 'get'
    })
    // 请求拦截
    instance.interceptors.request.use(config => {
      //展示进度条
      nProgress.start();
      //将token代入头部信息
      config.headers.Authorization = window.sessionStorage.getItem('token')
      return config;
    }, err => {
      console.log(err);
    })

    // 响应拦截
    instance.interceptors.response.use(config => {
      //隐藏进度条
      nProgress.done();
      //将token代入头部信息
      return config;
    }, err => {
      console.log(err);
    })

    instance(config)
      .then(value => {
        resolve(value)
      })
      .catch(err => {
        reject(err)
      })
  })
}
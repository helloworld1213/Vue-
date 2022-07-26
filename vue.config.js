module.exports = {
  publicPath: '/dist/',
  chainWebpack: config => {
    // 生产模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')


      //配置这个,就会在全局去找,而不会将这个包合并到对应的输出文件中
      //同时,要在index.html文件中引入这些文件(网上通过staticfile.org访问到的)
      config.set('externals', {
        vue: 'Vue',
       'vue-router': 'VueRouter',
       axios: 'axios',
       lodash: '_',
       echarts: 'echarts',
       nprogress: 'NProgress',
       'vue-quill-editor': 'VueQuillEditor'
       })

       config.plugin('html').tap(args => {
        args[0].isProd = true;
        return args;
       })
    })

    //开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      config.plugin('html').tap(args => {
        args[0].isProd = false;
        return args;
       })
    })
  }





  // configureWebpack: {
//   resolve: {
//     //配置别名
//     alias: {
//       '@': 'src',
//       'assets': '@/assets',
//       'components': '@/components',
//       'network': '@/network',
//     }
//   }
// }
}



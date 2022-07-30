module.exports = {
  //部署应用包时的基本 URL
  publicPath: process.env.NODE_ENV === 'production' ? '/dist/' : '/',
  //当运行 vue-cli-service build 时生成的生产环境构建文件的目录。注意目标
  //目录的内容在构建之前会被清除 (构建时传入 --no-clean 可关闭该行为)
  outputDir: 'dist',
  //放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
  assetsDir: '',
  //指定生成的 index.html 的输出路径 (相对于 outputDir)。也可以是一个绝对路径
  indexPath: 'index.html',
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





//   // configureWebpack: {
// //   resolve: {
// //     //配置别名
// //     alias: {
// //       '@': 'src',
// //       'assets': '@/assets',
// //       'components': '@/components',
// //       'network': '@/network',
// //     }
// //   }
// // }
}








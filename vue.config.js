const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    host:'localhost',
    port: 8892,
    open: true,
  },
  lintOnSave: false,
  configureWebpack: {
    devtool: 'source-map'
  },
  transpileDependencies: true,
  publicPath:'./' // 项目构建
})


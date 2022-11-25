// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })

module.exports = {
  devServer: {
    open: false,
    port: 8892,
  },
  lintOnSave: false,
  configureWebpack: {
    devtool: 'source-map'
  }
}

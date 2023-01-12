import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 elementUI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/en'
// 引入 openlayers
import 'ol/ol.css';

Vue.config.productionTip = false
Vue.use(ElementUI,{locale});
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

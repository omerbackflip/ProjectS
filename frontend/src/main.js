import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'jquery/src/jquery.js';
import "@popperjs/core";
import 'popper.js/dist/popper.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.use(VueMaterial)
Vue.use(Element)

Vue.use(Vuetify)

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Vue.config.productionTip = false

new Vue({
  router,
  vuetify: new Vuetify(),
    icons: {
    iconfont: 'mdi', // default - only for display purposes
  },
  rtl: true,
  render: h => h(App)
}).$mount('#app')

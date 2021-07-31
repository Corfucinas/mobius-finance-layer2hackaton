import Vue from 'vue';
import App from './App.vue';
import store from './store'
import router from './router';
Vue.use(router)

import * as echarts from 'echarts';
Vue.prototype.$echarts = echarts;

import { ethers } from 'ethers';
Vue.prototype.$ethers = ethers;

import { Provider } from './config/NewContract'
Vue.prototype.$Provider = Provider

import './common/utils/rem'
import './common/utils/filters'

import VueI18n from 'vue-i18n'
import LangENUS from './common/lang/en-us'
import LangZHCN from './common/lang/zh-cn'
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: 'en-us',
  messages: {
    'en-us': LangENUS,
    'zh-cn': LangZHCN
  }
})

import Antd  from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

import './assets/css/global.css';

Vue.use(Antd)

Vue.config.productionTip = false

new Vue({
  i18n,
  router,
  store,
  render: h => h(App),
}).$mount('#app')

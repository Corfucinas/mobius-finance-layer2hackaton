import Vue from 'vue'
import CsInstallTipModal from './index.vue'

const TipModal = Vue.extend(CsInstallTipModal)
CsInstallTipModal.install = function (data) {
  let instance = new TipModal({
    data
  }).$mount()

  document.body.appendChild(instance.$el)

  Vue.nextTick(() => {
    instance.isShow = true
  })
}

export default CsInstallTipModal
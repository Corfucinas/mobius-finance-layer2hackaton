import Vue from 'vue'
import CsInstallTipModal from './CsInstallTipModal/index.vue';

const components = [
    CsInstallTipModal
]

export default {
    install: (Vue) => {
        components.forEach(component => {
            Vue.component(component.name, component);
        });
    }
}
import _Vue from 'vue'

import drawViewer from '@/components/Cesium.vue'
import '@/assets/css/iconfont.css'
import { drawConfig, drawFunc } from '@/utils/drawGraph/index'

drawViewer.install = (Vue: any) => {
    if (!Vue)
        window.Vue = Vue = _Vue

    Vue.component(drawViewer.name, drawViewer)
}

if (typeof window !== 'undefined' && window.Vue)
    drawViewer.install(window.Vue)

export default {
    drawViewer,
    drawConfig,
    drawFunc,
}

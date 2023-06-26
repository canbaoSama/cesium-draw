import type { App } from 'vue'
import 'virtual:uno.css'

import DrawViewer from '@/components/DrawViewer.vue'
import { drawConfig, drawFunc } from '@/utils/drawGraph/index'

const component = [DrawViewer]

function install(App: App) {
    component.forEach((item) => {
        App.component(item.name, DrawViewer)
    })
}
export {
    DrawViewer,
    drawConfig,
    drawFunc,
}
export default {
    install,
}

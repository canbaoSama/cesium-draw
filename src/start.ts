import type { App } from 'vue'

import DrawViewer from '@/components/DrawViewer.vue'
import { drawConfig, drawFunc } from '@/utils/drawGraph/index'

const component = [DrawViewer]

export function install(App: App) {
    component.forEach((item) => {
        App.component(item.name, DrawViewer)
    })
}

export default {
    install,
    DrawViewer,
    drawConfig,
    drawFunc,
}

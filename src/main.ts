import { createApp } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import 'virtual:uno.css'

import App from './App.vue'

import '@/styles/index.less'
import drawViewer from './start'

// 构建vue实例
const app = createApp(App)

app.use(ElButton)
app.use(drawViewer)
declare global {
    interface Window {
        CESIUM_BASE_URL: string
        Sandcastle: any
        Vue: any
    }
}

app.mount('#app')

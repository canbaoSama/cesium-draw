import { createApp } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/index.css'
import 'virtual:uno.css'

import App from './App.vue'

import router from '@/router'
import '@/styles/index.less'

// 构建vue实例
const app = createApp(App)

app.use(router)

app.use(ElButton)
declare global {
    interface Window {
        CESIUM_BASE_URL: string
        Sandcastle: any
    }
}

app.mount('#app')

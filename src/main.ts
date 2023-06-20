import { createPinia } from 'pinia'
import { createApp } from 'vue'
import {
    ElAffix, ElButton, ElCheckbox, ElCheckboxGroup, ElCol, ElDialog, ElEmpty, ElForm, ElFormItem, ElIcon, ElImage, ElInput, ElInputNumber, ElLoading, ElPopconfirm, ElProgress,
    ElRow, ElScrollbar, ElTabPane, ElTable, ElTableColumn, ElTabs, ElTag, ElTooltip, ElTree,
} from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/index.css'
import 'virtual:uno.css'

import App from './App.vue'

import router from '@/router'
import '@/styles/index.less'

// 构建vue实例
const app = createApp(App)

app.use(router)

app.use(createPinia())

app.use(ElButton).use(ElForm).use(ElInput).use(ElIcon).use(ElAffix).use(ElTable).use(ElImage).use(ElScrollbar).use(ElProgress).use(ElInputNumber).use(ElTooltip).use(ElEmpty).use(ElTableColumn)
    .use(ElTag).use(ElTabs).use(ElTabPane).use(ElCheckboxGroup).use(ElCheckbox).use(ElLoading).use(ElTree).use(ElRow).use(ElCol).use(ElDialog).use(ElFormItem).use(ElPopconfirm)

declare global {
    interface Window {
        CESIUM_BASE_URL: string
        Sandcastle: any
    }
}

app.mount('#app')

<script setup lang="ts">
import { onMounted } from 'vue'

import DrawGraph from '@/components/DrawGraph.vue'
import MouseTooltip from '@/components/MouseTooltip.vue'
import 'cesium/Build/CesiumUnminified/Widgets/widgets.css'
import cesiumStore from '@/components/index'

onMounted(async () => {
    await cesiumStore.createViewer()
    // 地球贴图
    cesiumStore.addDefaultImageryProvider()
})
</script>

<template>
    <div class="cesium-container">
        <div id="viewerContainer" class="cesium-full-screen fixed wh-full overflow-hidden">
            <div id="toolbar" class="absolute z-99 left-8 top-5" />
        </div>
        <MouseTooltip />
    </div>
    <DrawGraph />
</template>

<style lang="less">
// 双球隐藏控件
.cesium-viewer-bottom {
    display: none;
}
</style>

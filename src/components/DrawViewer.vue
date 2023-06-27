<script setup lang="ts" name="DrawViewer">
import { onMounted, ref } from 'vue'
import { DrawGraphLine } from 'cesium-draw-ts'

import 'cesium/Build/CesiumUnminified/Widgets/widgets.css'
import cesiumStore from '@/components/index'

onMounted(async () => {
    await cesiumStore.createViewer()
    // 地球贴图
    cesiumStore.addDefaultImageryProvider()

    const drawGraph = ref()
    setTimeout(() => {
        drawGraph.value = new DrawGraphLine(cesiumStore.viewer, {})
    }, 5000)
})
</script>

<template>
    <div class="cesium-container">
        <div id="viewerContainer" class="cesium-full-screen fixed wh-full overflow-hidden">
            <div id="toolbar" class="absolute z-99 left-8 top-5" />
        </div>
    </div>
</template>

<style lang="less">
// 双球隐藏控件
.cesium-viewer-bottom {
    display: none;
}
</style>

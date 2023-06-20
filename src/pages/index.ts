import type { TerrainProvider } from 'cesium'
import { Camera, Ion, Rectangle, UrlTemplateImageryProvider, Viewer, createWorldTerrainAsync } from 'cesium'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import { DRAW_GRAPH_MAP, LAYER_CONTROL_TYPE } from '@/constants/cesium'
import '@/utils/dexie'

import { CESIUM_CONFIG, defaultAccessToken } from '@/config'

import { drawFunc } from '@/utils/drawGraph'

const viewer = ref(<Viewer>{}) // 断言方式赋初始值
let terrainProvider: TerrainProvider

// 创建基本的3D场景
async function createViewer() {
    try {
        Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(...CESIUM_CONFIG.DEFAULT_VIEW_RECTANGLE)// 默认定位到中国上空，home定位到中国范围
        Camera.DEFAULT_VIEW_FACTOR = CESIUM_CONFIG.DEFAULT_VIEW_FACTOR
        // 个人的access token,有时候默认的加载会出问题,就换成这个
        Ion.defaultAccessToken = defaultAccessToken
        viewer.value = new Viewer('viewerContainer', {
            // 隐藏底部控件
            animation: false,
            timeline: false,
            fullscreenButton: false,
            navigationHelpButton: false,
            sceneModePicker: false,
            infoBox: false, // 点击时的提示
            baseLayerPicker: false,
            shouldAnimate: true,
        })
        terrainProvider = await createWorldTerrainAsync({ requestWaterMask: true, requestVertexNormals: true })
        viewer.value.terrainProvider = terrainProvider
        viewer.value.scene.globe.depthTestAgainstTerrain = true // 地形遮挡

        // infobox 的camera图标点击事件
        // viewer.value.infoBox.viewModel.cameraClicked.addEventListener((e) => {
        //     if (!e.isCameraTracking)
        //         setSelEntityView()
        // })
        // 选中实体事件
        viewer.value.selectedEntityChanged.addEventListener(() => {
            // viewer.value.selectedEntity = a
        })

        drawLayer(LAYER_CONTROL_TYPE.INIT)
    }
    catch {
        ElMessage.error('cesium 场景加载失败, 请检查网络信息并刷新重试')
    }

    // viewer.value.scene.debugShowFramesPerSecond = true // 展示 fps
}

// 创建默认地球贴图
function addDefaultImageryProvider() {
    const imgLayer = new UrlTemplateImageryProvider({
        url: CESIUM_CONFIG.IMG_PROVIDER_DEFAULT,
        maximumLevel: 14,
    })
    viewer.value.imageryLayers.addImageryProvider(imgLayer)
}

function DrawGraphType(drawType: string) {
    if (drawGraph.value?.drawHandler || drawGraph.value?.modifyHandler) // 还处于绘制状态,要清除当前绘制信息
        drawGraph.value.clearDrawing()

    if (drawType) {
        drawGraph.value?.clearHandler()
        drawGraph.value = new drawFunc[DRAW_GRAPH_MAP[drawType]?.drawFunc](viewer.value)
    }
    else {
        drawGraph.value?.clearHandler()
        drawGraph.value = undefined
    }
}

/** ****************************************************************************** 逻辑量太大，划分成几个文件 ********************************************************************************/

// https://sandcastle.cesium.com/?src=Clustering.html&label=All
// https://sandcastle.cesium.com/?src=GPX.html&label=All
// https://sandcastle.cesium.com/?src=GeoJSON%20and%20TopoJSON.html&label=All
// https://sandcastle.cesium.com/?src=KML.html&label=All
// https://sandcastle.cesium.com/?src=Map%20Pins.html&label=All  // 给医院等地方打标记
import type { Entity, TerrainProvider } from 'cesium'
import { Camera, Cartesian3, Cartographic, Ion, Rectangle, UrlTemplateImageryProvider, Viewer, createWorldTerrainAsync, defined, sampleTerrainMostDetailed } from 'cesium'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import { HawkEye3DMap } from '@/utils/cesium/mapx'

import { CreateInfoWindow } from '@/utils/cesium/infoWindow'

import { CreatePlayBar } from '@/utils/cesium/playbar'

import { CESIUM_TASK, DRAW_GRAPH_MAP, LAYER_CONTROL_TYPE, MODEL_3D_OFFSET, RESERVED_ENTITY_NAME } from '@/constants/cesium'
import '@/utils/dexie'

import { degToRad, radToDeg } from '@/utils/common'
import type { infoWindowRender, newPositionProperty, vehicleCountHeight } from '@/types/cesium'
import { CESIUM_CONFIG, defaultAccessToken } from '@/config'
import { vehicleParamsConfig } from '@/constants/paramsConfig'

import { drawFunc } from '@/utils/cesium/drawGraph'

export const useCesiumStore = defineStore('cesium', () => {
    const viewer = ref(<Viewer>{}) // 断言方式赋初始值
    let terrainProvider: TerrainProvider

    // 当前图层
    const layerType: Ref<string> = ref('')

    // 当前 infoWindow 及其需要展示的数据
    const infoWindow = ref(<CreateInfoWindow | undefined>{})
    const infoWindowData: Ref<infoWindowRender[]> = ref([])
    // 鹰眼图
    const hawkEyeMap = ref(<HawkEye3DMap | undefined>{})
    // 播放条 playbar
    const playBar = ref(<CreatePlayBar | undefined>{})
    // 绘制图形
    const drawGraph = ref()

    // 环形操作指令
    const annularCommand = ref()

    // 图层切换,绘制图层要素
    function drawLayer(type: string) {
        layerType.value = type
        switch (type) {
            case LAYER_CONTROL_TYPE.INIT:
                infoWindow.value = new CreateInfoWindow(viewer.value)
                hawkEyeMap.value = new HawkEye3DMap(viewer.value)
                break
            case LAYER_CONTROL_TYPE.PAM_TO_PVP:
                playBar.value = new CreatePlayBar(viewer.value)
                break
            case LAYER_CONTROL_TYPE.PVP_TO_PAM:
                playBar.value = undefined
                break
            case LAYER_CONTROL_TYPE.DRAW:
                infoWindow.value?.clear?.()
                infoWindow.value = undefined
                hawkEyeMap.value?.clear?.()
                hawkEyeMap.value = undefined
                break
            case LAYER_CONTROL_TYPE.EXIT_DRAW:
                drawGraph.value?.clear()
                drawGraph.value = undefined
                infoWindow.value = new CreateInfoWindow(viewer.value)
                hawkEyeMap.value = new HawkEye3DMap(viewer.value)
                break
            case LAYER_CONTROL_TYPE.ANNULAR_COMMAND:
                infoWindow.value?.clear?.()
                infoWindow.value = undefined
                hawkEyeMap.value?.clear?.()
                hawkEyeMap.value = undefined
                break
            default: break
        }
    }

    // 创建基本的3D场景
    const createViewer = async () => {
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

    // 设置要播放和跟踪的实体
    function infoWindowSetTrackedEntity() {
        if (viewer.value.trackedEntity?.id === viewer.value.selectedEntity?.id)
            viewer.value.trackedEntity = undefined

        else
            viewer.value.trackedEntity = viewer.value.selectedEntity
    }

    // 设置选中的实体,并判断是否跟随,不同的 cesiumTask 任务获取 entity 的方式不同
    function setSelectEntity(id: string, cesiumTask: string, isTracked?: boolean) {
        // 本来想通过 selectedEntityChange.addEventListen 来实现同步设置的,但是发现时间间隔太长,效果太差
        let entity: Entity | undefined
        if (cesiumTask === CESIUM_TASK.PLAY_VEHICLE_POSITION)
            entity = viewer.value.dataSources.getByName(id)[0]?.entities.getById(id)
        else
            entity = viewer.value.entities.getById(id)

        if (isTracked && defined(entity?.position) && viewer.value.trackedEntity?.id !== id) { // 设置 trackedEntity
            viewer.value.selectedEntity = undefined // 要设置 trackedEntity 必须清除 selectedEntity,搞不懂为啥, 源码的双击跟随也是不设置selectedEntity
            viewer.value.trackedEntity = entity
        }
        else if (!isTracked && defined(entity?.position)) { // 设置 selectedEntity
            viewer.value.trackedEntity = undefined
            if (viewer.value.selectedEntity?.id !== id)
                viewer.value.selectedEntity = entity

            setSelEntityView()
        }
    }

    // 设置当前选中的实体的视角
    function setSelEntityView() {
        if (viewer.value.selectedEntity) {
            try {
                const positionO: newPositionProperty | undefined = viewer.value.selectedEntity.position

                const position = positionO?._value || positionO?._callback?.()

                const ellipsoid = viewer.value.scene.globe.ellipsoid
                const cartesian3 = new Cartesian3(position?.x, position?.y, position?.z)
                const cartographic = ellipsoid.cartesianToCartographic(cartesian3)
                const lon = radToDeg(cartographic.longitude)
                const lat = radToDeg(cartographic.latitude) + MODEL_3D_OFFSET[`${viewer.value.selectedEntity.model?.uri?._value.split('/').pop().split('.')[0] || 'defalut'}_lat`]
                const height = cartographic.height + 11.83093947613743

                viewer.value.camera.setView({
                    destination: Cartesian3.fromDegrees(lon, lat, height),
                    orientation: {
                        heading: degToRad(0), // 方向
                        pitch: degToRad(CESIUM_CONFIG.SET_VIEW_PITCH), // 倾斜角度
                        roll: 0,
                    },
                })
            }
            catch {
                console.warn('获取路径信息失败')
            }
        }
    }

    // 根据横纵坐标计算高度,如果没有横纵坐标则删除
    async function terrainToCountHeight(datas: Array<vehicleCountHeight>) {
        const positions: Cartographic[] = []
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].location && datas[i].location.lon && datas[i].location.lat) {
                positions.push(Cartographic.fromDegrees(datas[i].location.lon, datas[i].location.lat))
            }
            else {
                datas.splice(i, 1)
                i--
            }
        }

        await sampleTerrainMostDetailed(terrainProvider, positions)

        datas.forEach((pm2: vehicleCountHeight, index: number) => {
            pm2.location.height = positions[index].height | 0
        })
        return datas
    }

    // 更新 infoWindow 数据,需要根据配置扁平化对象
    function updateinfoWindowData(data: { [key: string]: any }) {
        infoWindowData.value = []
        function pushEditData(key: string, value: any) {
            infoWindowData.value.push({
                key,
                name: vehicleParamsConfig[key].name,
                col: vehicleParamsConfig[key].col,
                index: vehicleParamsConfig[key].index,
                value,
            })
        }

        function flatData(key: string, value: { [key: string]: any }) {
            if (vehicleParamsConfig[key] !== undefined) {
                if (vehicleParamsConfig[key].flatParams && vehicleParamsConfig[key].flatParams.length > 0) {
                    vehicleParamsConfig[key].flatParams.forEach((item: string) => {
                        flatData(item, value[item])
                    })
                }
                else {
                    pushEditData(key, value)
                }
            }
        }

        Object.keys(data).forEach((key) => {
            flatData(key, data[key])
        })
        infoWindowData.value.sort((a, b) => a.index - b.index)
    }

    // 清除所有场景,除了鹰眼图
    function clearEntities(arr?: Array<string>) {
        const reservedArr = arr || RESERVED_ENTITY_NAME
        for (let i = 0; i < viewer.value.entities.values.length; i++) {
            if (!reservedArr.includes(viewer.value.entities.values[i].id)) {
                viewer.value.entities.removeById(viewer.value.entities.values[i].id)
                i--
            }
        }
        hawkEyeMap.value?.removeAllEntity()
    }

    // 进入点,折线等绘制状态
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

    return {
        viewer,

        layerType,

        playBar,

        hawkEyeMap,

        drawGraph,
        DrawGraphType,

        annularCommand,

        drawLayer,

        infoWindow,
        infoWindowData,
        updateinfoWindowData,
        infoWindowSetTrackedEntity,

        setSelectEntity,

        createViewer,
        addDefaultImageryProvider,

        terrainToCountHeight,

        clearEntities,
    }
})

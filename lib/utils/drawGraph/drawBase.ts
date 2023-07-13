import { Cartesian3, ConstantProperty, EllipsoidGeodesic, HeightReference, defined, Color } from 'cesium'
import type { PolylineDashMaterialProperty, PolylineGlowMaterialProperty, ScreenSpaceEventHandler, Viewer } from 'cesium'
import { cloneDeep } from 'lodash-es'

import { FLAG_MAP, SAVE_NEED_UPDATE_POSITION, UNSAVE_DRAW_TYPE } from './config'


import { DRAW_GRAPH_MAP } from './config'
import { radToDeg } from '../common'
import type { DrawCartesian3, DrawEntity, createPointOpt, posInterface } from '../../../index'
import { CreateTooltip } from '../tooltip'

const drawConfig = {
    layerId: 'globeDrawerLayer',
    dragIconLight: '/src/assets/images/circle_point_icon.svg', // 绘制时的红点
    dragIcon: '/src/assets/images/point_icon.svg', // 绘制时的灰点
    fill: true,
    outline: true,
    outlineWidth: 2,
    outlineColor: Color.YELLOW,
    extrudedHeight: 0,
    polylineWidth: 8,
    radius: 1,
    line: true,
    lineWidth: 2,
}

export default class DrawGraphBase extends CreateTooltip {
    viewer: Viewer
    drawHandler: ScreenSpaceEventHandler | undefined
    modifyHandler: ScreenSpaceEventHandler | undefined
    okHandler: ScreenSpaceEventHandler | undefined
    cancelHandler: ScreenSpaceEventHandler | undefined

    drawType = '' // 绘制图形是何种类型
    objId = new Date().getTime() // 利用时间戳来记录,便于删除时进行判断

    layerDom: HTMLElement = <HTMLElement>document.getElementById('drawPopConfirmLayer')

    entity: DrawEntity | undefined // 当前绘制的 entity
    outlineEntity: DrawEntity | undefined
    position: DrawCartesian3 | undefined
    oldPosition: DrawCartesian3 | undefined
    positions: Array<DrawCartesian3> = []
    oldPositions: Array<DrawCartesian3> = []
    tempPositions: Array<DrawCartesian3> = []
    markers: { [key: number | string]: DrawEntity } = {} // 记录的 entity
    saveMarkers: { [key: number | string]: DrawEntity } = {} // 同 markers,但是这里保存的是需要保留的锚点,只有在取消绘制时才能删除

    material: PolylineGlowMaterialProperty | Color | undefined
    outlineMaterial: PolylineDashMaterialProperty | Color | PolylineDashMaterialProperty | undefined
    radiusLineMaterial: PolylineDashMaterialProperty | undefined
    lineMaterial: PolylineDashMaterialProperty | undefined

    dragIconLight = drawConfig.dragIconLight // 绘制时的红点
    dragIcon = drawConfig.dragIcon // 绘制时的灰点
    layerId = drawConfig.layerId
    fill = drawConfig.fill
    outline = drawConfig.outline
    outlineWidth = drawConfig.outlineWidth
    outlineColor = drawConfig.outlineColor
    extrudedHeight = drawConfig.extrudedHeight
    polylineWidth = drawConfig.polylineWidth

    radius = drawConfig.radius
    line = drawConfig.line
    lineWidth = drawConfig.lineWidth

    drawConfig: { [key: string]: any } = {
        material: undefined,
        outlineMaterial: undefined,
        radiusLineMaterial: undefined,
        lineMaterial: undefined,

        dragIconLight: drawConfig.dragIconLight, // 绘制时的红点
        dragIcon: drawConfig.dragIcon, // 绘制时的灰点
        layerId: drawConfig.layerId,
        fill: drawConfig.fill,
        outline: drawConfig.outline,
        outlineWidth: drawConfig.outlineWidth,
        outlineColor: drawConfig.outlineColor,
        extrudedHeight: drawConfig.extrudedHeight,
        polylineWidth: drawConfig.polylineWidth,

        radius: drawConfig.radius,
        line: drawConfig.line,
        lineWidth: drawConfig.lineWidth,
    }

    dialogVisible: Function = () => { } // 控制信息配置框的展示

    constructor(viewer: Viewer, options: { [key: string]: any } = {}) {
        super()
        this.viewer = viewer
        this.objId = new Date().getTime()

        Object.keys(options).forEach((key: string) => {
            this.drawConfig[key] = options[key]
        })

        setTimeout(() => {
            this.init()
        }, 0)
    }

    init() {
        const layerDom = document.getElementById('drawPopConfirmLayer')
        if (layerDom)
            this.layerDom = layerDom
    }

    createPoint(cartesian: DrawCartesian3, options: createPointOpt) {
        const point: DrawEntity = this.viewer.entities.add({
            position: cartesian,
            label: options.label || {},
            billboard: {
                image: options.image || this.drawConfig.dragIconLight,
                eyeOffset: new ConstantProperty(new Cartesian3(0, 0, -500)),
                heightReference: HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        })
        point.oid = options.oid
        point.layerId = this.drawConfig.layerId
        point.flag = options.flag || FLAG_MAP.ANCHOR
        point.objId = this.objId
        point.drawType = this.drawType

        // if (this.drawType !== DRAW_GRAPH_MAP.CIRCLE.key && this.drawType !== DRAW_GRAPH_MAP.POINT.key) { // 不是绘制圆或点 则需要保存 markers
        if (options.needSave) {
            this.saveMarkers[options.oid] = point
        }
        else { // 不需要保留的点需要放入markers
            this.markers[options.oid] = point
        }
        if (point.flag === FLAG_MAP.ANCHOR) { // 左键点击生成的点,线头点
            point.sid = cartesian?.sid // 记录原始序号
        }
        // }

        return point
    }

    reCreateAllPoint() {
        const positions = this.tempPositions
        for (let i = 0; i < positions.length; i++) {
            const ys = i % 2
            if (ys === 0)
                this.createPoint(positions[i], { oid: i })
            else
                this.createPoint(positions[i], { oid: i, flag: FLAG_MAP.MID_ANCHOR, image: this.drawConfig.dragIcon })
        }
    }

    updateModifyAnchors(oid: number) {
        const num = this.tempPositions.length
        if (oid === 0 || oid === num - 1)
            return

        // 重新计算tempPositions
        const p = this.tempPositions[oid]
        const p1 = this.tempPositions[oid - 1]
        const p2 = this.tempPositions[oid + 1]

        // 计算中心
        const cp1 = this.computeCenterPotition(p1, p)
        const cp2 = this.computeCenterPotition(p, p2)

        // 插入点
        this.tempPositions.splice(oid, 1, cp1, p, cp2)

        // 重新加载锚点
        this.clearAnchors()
        this.reCreateAllPoint()
    }

    // polygon 因为要首尾连接,并且产生中间锚点,所以计算方式不同
    _updateModifyAnchors(oid: number) {
        // 重新计算tempPositions
        const p = this.tempPositions[oid]
        let p1 = null
        let p2 = null
        const num = this.tempPositions.length
        if (oid === 0) {
            p1 = this.tempPositions[num - 1]
            p2 = this.tempPositions[oid + 1]
        }
        else if (oid === num - 1) {
            p1 = this.tempPositions[oid - 1]
            p2 = this.tempPositions[0]
        }
        else {
            p1 = this.tempPositions[oid - 1]
            p2 = this.tempPositions[oid + 1]
        }
        // 计算中心
        const cp1 = this.computeCenterPotition(p1, p)
        const cp2 = this.computeCenterPotition(p, p2)

        // 插入点
        this.tempPositions.splice(oid, 1, cp1, p, cp2)

        // 重新加载锚点
        this.clearAnchors()
        this.reCreateAllPoint()
    }

    // 更新中间锚点位置
    updateNewMidAnchors(oid: number) {
        if (oid === null || oid === undefined)
            return

        // 左边两个中点，oid2为临时中间点
        let oid1
        let oid2
        // 右边两个中点，oid3为临时中间点
        let oid3
        let oid4

        const num = this.tempPositions.length
        if (oid === 0) {
            oid1 = num - 2
            oid2 = num - 1
            oid3 = oid + 1
            oid4 = oid + 2
        }
        else if (oid === num - 2) {
            oid1 = oid - 2
            oid2 = oid - 1
            oid3 = num - 1
            oid4 = 0
        }
        else {
            oid1 = oid - 2
            oid2 = oid - 1
            oid3 = oid + 1
            oid4 = oid + 2
        }

        const c1 = this.tempPositions[oid1]
        const c = this.tempPositions[oid]
        const c4 = this.tempPositions[oid4]

        if (oid === 0) {
            const c3 = this.computeCenterPotition(c4, c)
            this.tempPositions[oid3] = c3
            this.markers[oid3].position = c3
        }
        else if (oid === num - 1) {
            const c2 = this.computeCenterPotition(c1, c)
            this.tempPositions[oid2] = c2
            this.markers[oid2].position = c2
        }
        else {
            const c2 = this.computeCenterPotition(c1, c)
            const c3 = this.computeCenterPotition(c4, c)
            this.tempPositions[oid2] = c2
            this.tempPositions[oid3] = c3
            this.markers[oid2].position = c2
            this.markers[oid3].position = c3
        }
    }

    // 计算中间位置信息
    computeCenterPotition(p1: DrawCartesian3, p2: DrawCartesian3) {
        const c1 = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(p1)
        const c2 = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(p2)
        const cm = new EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5)
        const cp = this.viewer.scene.globe.ellipsoid.cartographicToCartesian(cm)
        return cp
    }

    // 计算模板位置信息,首尾节点不需要连接在一起
    computeTempPositions() {
        const pnts = cloneDeep(this.positions)
        const num = pnts.length
        this.tempPositions = []
        for (let i = 1; i < num; i++) {
            const p1 = pnts[i - 1]
            const p2 = pnts[i]
            p1.sid = i - 1
            p2.sid = i
            const cp = this.computeCenterPotition(p1, p2)
            this.tempPositions.push(p1)
            this.tempPositions.push(cp)
        }
        const last = pnts[num - 1]
        this.tempPositions.push(last)
    }

    // 计算模板位置信息,首尾节点需要连接在一起
    _computeTempPositions() {
        const pnts = this.cloneDeep(this.positions)
        let num = pnts.length
        const first = pnts[0]
        const last = pnts[num - 1]
        if (this.isSimpleXYZ(first, last) === false) {
            pnts.push(first)
            num += 1
        }
        this.tempPositions = []
        for (let i = 1; i < num; i++) {
            const p1 = pnts[i - 1]
            const p2 = pnts[i]
            const cp = this.computeCenterPotition(p1, p2)
            this.tempPositions.push(p1)
            this.tempPositions.push(cp)
        }
    }

    // cloneDeep
    cloneDeep(data: any) {
        return cloneDeep(data)
    }

    // 设置公共的必须参数
    setPublicParams() {
        if (this.entity) {
            this.entity.layerId = this.drawConfig.layerId
            this.entity.objId = this.objId
            this.entity.drawType = this.drawType
        }
    }

    // 检查 position
    checkPosition(position: Cartesian3) {
        if (!defined(position))
            return false

        const ray = this.viewer.camera.getPickRay(position)
        if (ray && defined(ray)) {
            const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
            if (cartesian && defined(cartesian))
                return cartesian
        }

        return false
    }

    // 检查修改时的 position
    checkModifyPosition(position: Cartesian3) {
        const pickedObject = this.viewer.scene.pick(position)
        if (!defined(pickedObject) || !defined(pickedObject.id))
            return false
        return pickedObject
    }

    // 弹出的 layer (保存或取消的确认框)
    layerShowOrHide(status: boolean) {
        if (this.layerDom)
            this.layerDom.style.display = status ? 'block' : 'none'
    }

    // 保存绘制的图形
    saveDraw() {
        if (UNSAVE_DRAW_TYPE.includes(this.drawType)) { // 这些作为工具类提示的绘制类型，不需要保存
            this.clearDrawing()
            return false
        }
        else {
            this.saveClear()
            // 重新更新positions作为储存已绘制记录
            if (SAVE_NEED_UPDATE_POSITION.includes(this.drawType)) {
                const positions = []
                for (let i = 0; i < this.tempPositions.length; i += 2) {
                    const p = this.tempPositions[i]
                    positions.push(p)
                }
                this.positions = positions
            }
            let saveData: any
            switch (this.drawType) {
                case DRAW_GRAPH_MAP.POINT.key:
                    saveData = this.position
                    break
                case DRAW_GRAPH_MAP.BUFFER.key:
                    saveData = {
                        radius: this.drawConfig.radius,
                        positions: this.positions,
                    }
                    break
                default:
                    saveData = this.positions
                    break
            }

            return saveData
        }
    }

    // 清除 drawHandler
    clearDrawHandler() {
        if (this.drawHandler) {
            this.drawHandler.destroy()
            this.drawHandler = undefined
        }
    }

    // 清除 modifyHandler,退出编辑状态
    clearModifyHandler() {
        if (this.modifyHandler) {
            this.modifyHandler.destroy()
            this.modifyHandler = undefined
        }
        this.layerShowOrHide(false)
    }

    // 清除锚点
    clearAnchors() {
        for (const key in this.markers) {
            const m = this.markers[key]
            this.viewer.entities.remove(m)
        }
        this.markers = {}
    }

    // 清除保留锚点
    clearSavedAnchors() {
        for (const key in this.saveMarkers) {
            const m = this.saveMarkers[key]
            this.viewer.entities.remove(m)
        }
        this.saveMarkers = {}
    }

    // 清除 outlineEntity
    clearOutlineEntity() {
        if (this.drawConfig.outlineEntity)
            this.viewer.entities.remove(this.drawConfig.outlineEntity)
    }

    // 移除相关场景,包括绘制的图形
    clearMarkers(layerName: string) {
        const entityList: Array<DrawEntity> = this.viewer.entities.values
        if (!entityList || entityList.length < 1)
            return
        for (let i = 0; i < entityList.length; i++) {
            const entity = entityList[i]
            if (entity.layerId === layerName) {
                this.viewer.entities.remove(entity)
                i--
            }
        }
    }
    /**
     * 清除总共应该分为 4 种情况,对应下面4个方法
     * 1. 清除所有监听 + tooltip,比如初始化的时候就应该先清除之前 class 里添加的监听
     * 2. 保存时清除锚点和所有监听 + tooltip
     * 3. 取消绘制时或者切换绘制方式时默认清除当前正在绘制的图形,同时清除所有监听和锚点 + tooltip
     * 4. 清除所有绘制相关,包括监听,锚点以及绘制的图形
     */

    // 清除所有handler监听
    clearHandler() {
        this.clearDrawHandler()
        this.clearModifyHandler()
        this.tooltip.setVisible(false)
    }

    // 保存时清除监听和锚点并返回位置数据信息
    saveClear() {
        this.clearHandler()
        if (this.drawType !== DRAW_GRAPH_MAP.POINT.key) { // 绘制点的时候不能清除锚点
            this.clearAnchors()
        }
    }

    // 清除当前绘制的数据
    clearDrawing() {
        this.clearHandler()
        this.clearAnchors()
        this.clearSavedAnchors()
        this.clearOutlineEntity()
        if (this.entity)
            this.viewer.entities.remove(this.entity)
        this.tooltip.setVisible(false)
    }

    // 清除所有绘制相关
    clear() {
        this.clearHandler()
        this.clearMarkers(this.drawConfig.layerId)
        this.clearOutlineEntity()
        this.tooltip.setVisible(false)
    }

    // toobar 需要用到的函数
    // getPositionsWithSid() {
    //     const viewer = this.viewer
    //     const rlt: Array<DrawCartesian3> = []
    //     const entityList = viewer.entities.values
    //     if (entityList == undefined || entityList.length < 1)
    //         return rlt

    //     for (let i = 0; i < entityList.length; i++) {
    //         const entity: DrawEntity = entityList[i]
    //         if (entity.layerId !== this.drawConfig.layerId)
    //             continue

    //         if (entity.flag !== 'anchor')
    //             continue

    //         const p: DrawCartesian3 = entity.position?.getValue(bjTimeToJulianDate(new Date())) || new Cartesian3()
    //         p.sid = entity.sid
    //         p.oid = entity.oid
    //         rlt.push(p)
    //     }
    //     // 排序
    //     rlt.sort((obj1: DrawCartesian3, obj2: DrawCartesian3) => {
    //         if (obj1.oid !== undefined && obj2.oid !== undefined && obj1.oid > obj2.oid)
    //             return 1

    //         else if (obj1.oid === obj2.oid)
    //             return 0

    //         else
    //             return -1
    //     })
    //     return rlt
    // }

    // 获取经纬度
    getLonLat(cartesian: DrawCartesian3) {
        const cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian)
        cartographic.height = this.viewer.scene.globe.getHeight(cartographic) || 0
        const pos = {
            lon: cartographic.longitude,
            lat: cartographic.latitude,
            alt: cartographic.height,
            height: cartographic.height,
        }
        pos.lon = radToDeg(pos.lon)
        pos.lat = radToDeg(pos.lat)
        return pos
    }

    getLonLats(positions: Array<DrawCartesian3>) {
        const arr = []
        for (let i = 0; i < positions.length; i++) {
            const c = positions[i]
            const p: posInterface = this.getLonLat(c)
            p.sid = c.sid
            p.oid = c.oid
            arr.push(p)
        }
        return arr
    }

    getLonLatArr(positions: Array<DrawCartesian3>) {
        const arr = []
        for (let i = 0; i < positions.length; i++) {
            const p = this.getLonLat(positions[i])
            if (p !== undefined)
                arr.push([p.lon, p.lat])
        }
        return arr
    }

    // 判断位置信息是否完全相同
    isSimpleXYZ(p1: Cartesian3, p2: Cartesian3) {
        if (p1.x === p2.x && p1.y === p2.y && p1.z === p2.z)
            return true

        return false
    }

    cartesian2LonLat(cartesian: Cartesian3) {
        // 将笛卡尔坐标转换为地理坐标
        const cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian)
        // 将弧度转为度的十进制度表示
        const pos = {
            lon: radToDeg(cartographic.longitude),
            lat: radToDeg(cartographic.latitude),
            alt: Math.ceil(cartographic.height),
        }
        return pos
    }
}

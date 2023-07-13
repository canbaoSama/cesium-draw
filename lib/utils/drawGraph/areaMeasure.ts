import type { Viewer } from 'cesium'
import {
    CallbackProperty, Cartesian2, Color, PolygonGraphics, PolygonHierarchy, PolylineDashMaterialProperty,
    ScreenSpaceEventHandler, ScreenSpaceEventType,
} from 'cesium'

import DrawGraphBase from './drawBase'
import { ENTITY_LABEL_DEFAULT_CONFIG, FLAG_MAP } from './config'

import { DRAW_GRAPH_MAP } from './config'
import type { AreaMeasureOptions, DrawCartesian3, DrawEntity } from './types'

export default class DrawGraphAreaMeasure extends DrawGraphBase {
    viewer: Viewer

    constructor(viewer: Viewer, options: AreaMeasureOptions = {}) {
        super(viewer, options)

        this.viewer = viewer
        this.drawHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
        this.drawType = DRAW_GRAPH_MAP.AREA_MEASURE.key
    }

    // 开始绘制线条
    startDraw() {
        let floatingPoint: DrawEntity
        this.positions = []

        // 鼠标左键点击事件
        this.drawHandler?.setInputAction((movement: any) => {
            const cartesian = this.checkPosition(movement.position)
            if (!cartesian)
                return

            const num = this.positions.length
            if (num === 0) {
                this.positions.push(cartesian)
                floatingPoint = this.createPoint(cartesian, { oid: -1 })
                this.showRegion2Map()
            }

            this.positions.push(cartesian)
            const oid = this.positions.length - 2
            this.createPoint(cartesian, { oid })
            // if (this.positions.length > 2) {
            //     const text = this.getMeasureTip(this.positions);
            //     this.entity.label.text = text
            // }
            this.entity.position = cartesian
            const text = this.getMeasureTip(this.positions)
            this.entity.label.text = text
        }, ScreenSpaceEventType.LEFT_CLICK)

        // 鼠标移动事件
        this.drawHandler?.setInputAction((movement: any) => {
            if (this.positions.length < 1) {
                this.tooltip.showAt(movement.endPosition, '选择起点')
                return
            }
            let tip = '点击添加下一个点'
            const num = this.positions.length
            if (num > 2)
                tip += '或右键结束绘制'
            this.tooltip.showAt(movement.endPosition, tip)

            const cartesian = this.checkPosition(movement.endPosition)
            if (!cartesian)
                return

            floatingPoint.position = cartesian
            this.positions.pop()
            this.positions.push(cartesian)

            // if (this.positions.length > 2) {
            //     const text = this.getMeasureTip(this.positions);
            //     this.entity.label.text = text
            // }
            this.entity.position = cartesian
            const text = this.getMeasureTip(this.positions)
            this.entity.label.text = text
        }, ScreenSpaceEventType.MOUSE_MOVE)

        // 鼠标右键事件
        this.drawHandler?.setInputAction(() => {
            if (this.positions.length < 4)
                return

            this.positions.pop()
            this.viewer.entities.remove(floatingPoint)
            this.tooltip.setVisible(false)

            // 进入编辑状态
            this.clearDrawing()
            this.showModifyRegion2Map()
        }, ScreenSpaceEventType.RIGHT_CLICK)
    }

    showRegion2Map(isModify?: boolean) {
        if (!this.drawConfig.material)
            this.drawConfig.material = Color.fromCssColorString('#ff0').withAlpha(0.5)

        if (!this.drawConfig.outlineMaterial) {
            this.drawConfig.outlineMaterial = new PolylineDashMaterialProperty({
                dashLength: 16,
                color: Color.fromCssColorString('#00f').withAlpha(0.7),
            })
        }
        const dynamicHierarchy = new CallbackProperty(() => {
            if (this.positions.length > 2) {
                const pHierarchy = new PolygonHierarchy(isModify ? this.tempPositions : this.positions)
                return pHierarchy
            }
            else {
                return undefined
            }
        }, false)
        const outlineDynamicPositions = new CallbackProperty(() => {
            if (this.positions.length > 1) {
                const arr = this.cloneDeep(isModify ? this.tempPositions : this.positions)
                const first = isModify ? this.tempPositions[0] : this.positions[0]
                arr.push(first)
                return arr
            }
            else {
                return undefined
            }
        }, false)

        const num = isModify ? this.tempPositions.length : this.positions.length
        const last = isModify ? this.tempPositions[num - 1] : this.positions[num - 1]
        const text = isModify ? this.getMeasureTip(this.tempPositions) : ''

        const bData = {
            position: last,
            label: {
                text,
                ...ENTITY_LABEL_DEFAULT_CONFIG,
            },
            polygon: new PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: this.drawConfig.material,
                show: this.drawConfig.fill,
            }),
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: this.drawConfig.outlineWidth,
                material: this.drawConfig.outlineMaterial,
                show: this.drawConfig.outline,
            },
        }
        this.entity = this.viewer.entities.add(bData)
        this.setPublicParams()
    }

    showModifyRegion2Map() {
        this.startModify()
        this._computeTempPositions()

        this.showRegion2Map(true)
        const positions = this.tempPositions
        for (let i = 0; i < positions.length; i++) {
            const ys = i % 2
            if (ys === 0)
                this.createPoint(positions[i], { oid: i })
            else
                this.createPoint(positions[i], { oid: i, flag: FLAG_MAP.MID_ANCHOR, image: this.drawConfig.dragIcon })
        }
    }

    // 启动修改
    startModify() {
        let isMoving = false
        let pickedAnchor: DrawEntity
        this.clearDrawHandler()
        this.layerShowOrHide(true)

        this.modifyHandler = new ScreenSpaceEventHandler(this.viewer.scene.canvas)

        this.modifyHandler.setInputAction((movement: any) => {
            const cartesian = this.checkPosition(movement.position)
            if (!cartesian)
                return

            if (isMoving) {
                isMoving = false
                const oid = pickedAnchor.oid

                if (typeof oid === 'number' && oid >= 0) {
                    pickedAnchor.position = cartesian
                    this.tempPositions[oid] = cartesian
                    this.tooltip.setVisible(false)
                    if (pickedAnchor.flag === FLAG_MAP.MID_ANCHOR)
                        this._updateModifyAnchors(oid)

                    this.entity.position = cartesian
                    const text = this.getMeasureTip(this.tempPositions)
                    this.entity.label.text = text
                }
            }
            else {
                const pickedObject = this.checkModifyPosition(movement.position)
                if (!pickedObject)
                    return

                const entity = pickedObject.id
                if (entity.layerId !== this.drawConfig.layerId)
                    return
                if (entity.flag !== FLAG_MAP.ANCHOR && entity.flag !== FLAG_MAP.MID_ANCHOR)
                    return
                pickedAnchor = entity
                isMoving = true
                if (entity.flag === FLAG_MAP.ANCHOR)
                    this.tooltip.showAt(movement.position, '移动控制点')

                if (entity.flag === FLAG_MAP.MID_ANCHOR)
                    this.tooltip.showAt(movement.position, '移动创建新的控制点')
            }
        }, ScreenSpaceEventType.LEFT_CLICK)

        this.modifyHandler.setInputAction((movement: any) => {
            if (!isMoving)
                return

            this.tooltip.showAt(movement.endPosition, '移动控制点')

            const cartesian = this.checkPosition(movement.endPosition)
            if (!cartesian)
                return

            const oid = pickedAnchor.oid
            if (typeof oid === 'number' && oid >= 0) {
                if (pickedAnchor.flag === FLAG_MAP.ANCHOR) {
                    pickedAnchor.position = cartesian
                    this.tempPositions[oid] = cartesian
                    // 左右两个中点
                    this.updateNewMidAnchors(oid)
                }
                else if (pickedAnchor.flag === FLAG_MAP.MID_ANCHOR) {
                    pickedAnchor.position = cartesian
                    this.tempPositions[oid] = cartesian
                }
                this.entity.position = cartesian
                const text = this.getMeasureTip(this.tempPositions)
                this.entity.label.text = text
            }
        }, ScreenSpaceEventType.MOUSE_MOVE)
    }

    // computeLineDis2d(pntList: Array<DrawCartesian3>) {
    //     let total = 0
    //     for (let i = 1; i < pntList.length; i++) {
    //         const p1 = pntList[i - 1]
    //         const p2 = pntList[i]
    //         const dis = Cartesian2.distance(p1, p2) / 1000
    //         total += dis
    //     }
    //     return total
    // }

    computeLineDis3d(pntList: Array<DrawCartesian3>) {
        let total = 0
        for (let i = 1; i < pntList.length; i++) {
            const p1 = pntList[i - 1]
            const p2 = pntList[i]
            const dis = Cartesian2.distance(p1, p2) / 1000
            total += dis
        }
        return total
    }

    getMeasureTip(pntList: Array<DrawCartesian3>) {
        // let dis2d = this.computeLineDis2d(pntList)
        let dis3d = this.computeLineDis3d(pntList)
        // dis2d = parseFloat(dis2d.toFixed(3))
        dis3d = parseFloat(dis3d.toFixed(3))
        let tip = `周长：${dis3d}千米`
        if (pntList.length > 2) {
            const area = this.computeArea(pntList)
            tip += `\n 面积：${area.toFixed(3)}平方千米`
        }
        return tip
    }

    computeArea(positions: Array<DrawCartesian3>) {
        const arr = []
        for (let i = 0; i < positions.length; i++) {
            const p = this.cartesian2LonLat(positions[i])
            arr.push([p.lon, p.lat])
        }
        arr.push(arr[0]) // 终点和起点重合

        const polygon = turf.polygon([arr])
        const area = turf.area(polygon) / 1000 / 1000
        return area
    }
}

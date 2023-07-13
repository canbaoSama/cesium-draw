import type { Viewer } from 'cesium'
import { CallbackProperty, Cartesian2, Cartesian3, Color, PolylineGlowMaterialProperty, PolylinePipeline, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium'

import DrawGraphBase from './drawBase'
import { ENTITY_LABEL_DEFAULT_CONFIG, FLAG_MAP } from './config'

import { DRAW_GRAPH_MAP } from './config'
import type { DrawCartesian3, DrawEntity, StickDisMeasureOptions } from '../../../index'

export default class DrawGraphStickDisMeasure extends DrawGraphBase {
    viewer: Viewer

    constructor(viewer: Viewer, options: StickDisMeasureOptions = {}) {
        super(viewer, options)
        this.viewer = viewer
        this.drawHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
        this.drawType = DRAW_GRAPH_MAP.STICK_DIS_MEASURE.key
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
                this.showPolyline2Map()
            }

            this.positions.push(cartesian)
            const oid = this.positions.length - 2
            this.createPoint(cartesian, { oid })
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

            this.entity.position = cartesian
            const text = this.getMeasureTip(this.positions)
            this.entity.label.text = text
        }, ScreenSpaceEventType.MOUSE_MOVE)

        // 鼠标右键事件
        this.drawHandler?.setInputAction(() => {
            if (this.positions.length < 3)
                return

            this.positions.pop()
            this.viewer.entities.remove(floatingPoint)
            this.tooltip.setVisible(false)

            // 进入编辑状态
            this.clearDrawing()
            this.showModifyPolyline2Map()
        }, ScreenSpaceEventType.RIGHT_CLICK)
    }

    // 添加线条
    showPolyline2Map(isModify?: boolean) {
        if (!this.drawConfig.material) {
            this.drawConfig.material = new PolylineGlowMaterialProperty({
                glowPower: 0.25,
                color: Color.fromCssColorString('#00f').withAlpha(0.9),
            })
        }
        const dynamicPositions = new CallbackProperty(() => {
            return isModify ? this.tempPositions : this.positions
        }, false)
        const num = this.positions.length
        const last = this.positions[num - 1]
        const text = isModify ? this.getMeasureTip(this.tempPositions) : ''

        const bData = {
            position: last,
            label: {
                text,
                ...ENTITY_LABEL_DEFAULT_CONFIG,
            },
            polyline: {
                positions: dynamicPositions,
                clampToGround: true,
                width: this.drawConfig.polylineWidth,
                material: this.drawConfig.material,
            },
        }
        this.entity = this.viewer.entities.add(bData)
        this.setPublicParams()
    }

    // 修改线条
    showModifyPolyline2Map() {
        this.startModify()
        this.computeTempPositions()

        this.showPolyline2Map(true)
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
                        this.updateModifyAnchors(oid)

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

            this.tooltip.showAt(movement.position, '移动控制点')

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

    // 获取贴地线
    getStick2GroundLine(positions: Array<DrawCartesian3>) {
        const flatPositions = PolylinePipeline.generateArc({
            positions,
            granularity: 0.01, //  0.000001 值太小计算量就会等比变大,所以要非常小心
        })
        const cartesianArray = []
        for (let i = 0; i < flatPositions.length; i += 3) {
            const cartesian = Cartesian3.unpack(flatPositions, i)
            cartesianArray.push(cartesian)
        }

        const raisedPositions = []
        for (let i = 0; i < cartesianArray.length; i += 3) {
            const cartesian3 = this.getStick2GroundPoint3d(cartesianArray[i])
            raisedPositions.push(cartesian3)
        }
        return raisedPositions
    }

    // 获取高程值
    getStick2GroundPoint3d(cartesian: DrawCartesian3) {
        const ellipsoid = this.viewer.scene.globe.ellipsoid

        const cartographic = ellipsoid.cartesianToCartographic(cartesian)
        cartographic.height = this.viewer.scene.globe.getHeight(cartographic) || 0
        const cartesian3 = ellipsoid.cartographicToCartesian(cartographic)
        return cartesian3
    }

    computeLineDis3d(pntList: Array<DrawCartesian3>) {
        let total = 0
        const positions = this.getStick2GroundLine(pntList)
        for (let i = 1; i < positions.length; i++) {
            const p1 = positions[i - 1]
            const p2 = positions[i]
            const dis = Cartesian2.distance(p1, p2) / 1000
            total += dis
        }
        return total
    }

    getMeasureTip(pntList: Array<DrawCartesian3>) {
        try {
            let dis3d = this.computeLineDis3d(pntList)
            dis3d = parseFloat(dis3d.toFixed(3))
            const tip = `距离：${dis3d}千米`
            return tip
        }
        catch (err) {
            console.warn(err || '获取贴地距离信息失败')
        }
    }
}

import type { Viewer } from 'cesium'
import { CallbackProperty, Cartesian3, Color, PolygonGraphics, PolygonHierarchy, PolylineDashMaterialProperty, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium'

import DrawGraphBase from './drawBase'
import { FLAG_MAP } from './config'

import type { BufferOptions, DrawCartesian3, DrawEntity, configInterface } from '../../../index'

import { DRAW_GRAPH_MAP } from './config'

export default class DrawGraphBuffer extends DrawGraphBase {
    viewer: Viewer

    constructor(viewer: Viewer, options: BufferOptions = {}) {
        super(viewer, options)

        this.viewer = viewer
        this.drawHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
        this.drawType = DRAW_GRAPH_MAP.BUFFER.key
    }

    startDraw() {
        this.positions = []
        let floatingPoint: DrawEntity
        this.drawHandler = new ScreenSpaceEventHandler(this.viewer.scene.canvas)

        this.drawHandler.setInputAction((movement: any) => {
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
        }, ScreenSpaceEventType.LEFT_CLICK)

        this.drawHandler.setInputAction((movement: any) => {
            if (this.positions.length < 1) {
                this.tooltip.showAt(movement.position, '选择起点')
                return
            }
            const num = this.positions.length
            let tip = '点击添加下一个点'
            if (num > 2)
                tip += '右键结束绘制'

            this.tooltip.showAt(movement.position, tip)

            const cartesian = this.checkPosition(movement.endPosition)
            if (!cartesian)
                return

            floatingPoint.position = cartesian
            this.positions.pop()
            this.positions.push(cartesian)
        }, ScreenSpaceEventType.MOUSE_MOVE)

        this.drawHandler.setInputAction(() => {
            if (this.positions.length < 3)
                return

            this.positions.pop()
            this.viewer.entities.remove(floatingPoint)
            this.tooltip.setVisible(false)

            this.dialogVisible(true)
        }, ScreenSpaceEventType.RIGHT_CLICK)
    }

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
                }
            }
            else {
                const pickedObject = this.checkModifyPosition(movement.position)
                if (!pickedObject)
                    return

                const entity = pickedObject.id
                if (entity.layerId !== this.drawConfig.layerId)
                    return

                if (entity.flag !== 'anchor' && entity.flag !== 'mid_anchor')
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
            }
        }, ScreenSpaceEventType.MOUSE_MOVE)
    }

    showRegion2Map() {
        if (!this.drawConfig.lineMaterial) {
            this.drawConfig.lineMaterial = new PolylineDashMaterialProperty({
                dashLength: 16,
                color: Color.fromCssColorString('#00f').withAlpha(0.7),
            })
        }
        const dynamicPositions = new CallbackProperty(() => {
            return this.positions
        }, false)
        const bData = {
            polyline: {
                positions: dynamicPositions,
                clampToGround: true,
                width: this.drawConfig.lineWidth,
                material: this.drawConfig.lineMaterial,
            },
        }
        this.entity = this.viewer.entities.add(bData)
        this.setPublicParams()
    }

    showModifyRegion2MapCreateEntity(isModify?: true) {
        if (isModify)
            this.tempPositions = this.cloneDeep(this.positions)

        if (!this.drawConfig.material)
            this.drawConfig.material = Color.fromCssColorString('#ff0').withAlpha(0.5)

        if (!this.drawConfig.lineMaterial) {
            this.drawConfig.lineMaterial = new PolylineDashMaterialProperty({
                dashLength: 16,
                color: Color.fromCssColorString('#00f').withAlpha(0.7),
            })
        }

        const linePositions = new CallbackProperty(() => {
            return this.tempPositions
        }, false)
        const dynamicHierarchy = new CallbackProperty(() => {
            const pnts: Cartesian3[] | undefined = this.computeBufferLine(this.tempPositions, (this.drawConfig.radius || 1) * 1000) || undefined
            const pHierarchy = new PolygonHierarchy(pnts)
            return pHierarchy
        }, false)
        const bData = {
            polygon: new PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: this.drawConfig.material,
                show: this.drawConfig.fill,
            }),
            polyline: {
                positions: linePositions,
                clampToGround: true,
                width: this.drawConfig.lineWidth || 2,
                material: this.drawConfig.lineMaterial,
                show: this.drawConfig.line,
            },
        }
        this.entity = this.viewer.entities.add(bData)
        this.setPublicParams()
    }

    showModifyRegion2Map() {
        this.startModify()
        this.computeTempPositions()
        this.showModifyRegion2MapCreateEntity()
        this.reCreateAllPoint()
    }

    computeBufferLine(positions: Array<DrawCartesian3>, radius: number) {
        const arr = []
        const first = positions[0]
        const num = positions.length
        for (let i = 0; i < num; i++) {
            const p = this.cartesian2LonLat(positions[i])
            if (i === num - 1 && first === p)
                break

            arr.push([p.lon, p.lat])
        }

        const line = turf.lineString(arr)
        const feature = turf.buffer(line, radius * 1, { units: 'meters' })
        const coordinates = feature.geometry.coordinates
        if (!coordinates || coordinates.length < 1)
            return null

        const pnts = coordinates[0]
        if (!pnts || pnts.length < 3)
            return null

        const linePositions = []
        for (let j = 0; j < pnts.length; j++) {
            const p = pnts[j]
            const c = Cartesian3.fromDegrees(p[0], p[1])
            linePositions.push(c)
        }

        return linePositions
    }

    // 保存弹框配置
    saveConfig(config: configInterface) {
        this.drawConfig.radius = config.radius

        // 进入编辑状态
        this.clearDrawing()
        this.showModifyRegion2Map()
    }

    // 重新进入编辑状态
    reEnterModify(saveData: any, objId: number) {
        this.objId = objId
        this.positions = saveData.positions
        this.tempPositions = saveData.tempPositions
        this.drawConfig.radius = parseFloat(saveData.radius)
        this.showModifyRegion2Map()
    }

    // 编辑取消,重新绘制旧数据
    drawOldData() {
        this.showModifyRegion2MapCreateEntity(true)
    }
}

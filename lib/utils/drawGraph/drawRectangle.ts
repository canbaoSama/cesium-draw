import type { Viewer } from 'cesium'
import { CallbackProperty, Cartesian3, Color, PolylineDashMaterialProperty, Rectangle, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium'

import DrawGraphBase from './drawBase'
import { FLAG_MAP } from './config'

import type { DrawCartesian3, DrawEntity, RectangleOptions } from '../../../index'

import { DRAW_GRAPH_MAP } from './config'

export default class DrawGraphRectangle extends DrawGraphBase {
    viewer: Viewer

    constructor(viewer: Viewer, options: RectangleOptions = {}) {
        super(viewer, options)

        this.viewer = viewer
        this.drawHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
        this.drawType = DRAW_GRAPH_MAP.RECTANGLE.key
    }

    startDraw() {
        let floatingPoint: DrawEntity
        this.positions = []

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
            if (num > 1) {
                this.positions.pop()
                this.viewer.entities.remove(floatingPoint)
                this.tooltip.setVisible(false)
                this.startModify()
            }
        }, ScreenSpaceEventType.LEFT_CLICK)

        this.drawHandler?.setInputAction((movement: any) => {
            if (this.positions.length < 1) {
                this.tooltip.showAt(movement.position, '选择起点')
                return
            }
            this.tooltip.showAt(movement.position, '选择终点')
            const cartesian = this.checkPosition(movement.endPosition)
            if (!cartesian)
                return

            floatingPoint.position = cartesian
            this.positions.pop()
            this.positions.push(cartesian)
        }, ScreenSpaceEventType.MOUSE_MOVE)
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
                    this.positions[oid] = cartesian
                    this.tooltip.setVisible(false)
                }
            }
            else {
                const pickedObject = this.checkModifyPosition(movement.position)
                if (!pickedObject)
                    return

                const entity = pickedObject.id
                if (entity.layerId !== this.drawConfig.layerId || entity.flag !== FLAG_MAP.ANCHOR)
                    return

                pickedAnchor = entity
                isMoving = true
                this.tooltip.showAt(movement.position, '移动控制点')
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
                pickedAnchor.position = cartesian
                this.positions[oid] = cartesian
            }
        }, ScreenSpaceEventType.MOUSE_MOVE)
    }

    showRegion2Map(isModify?: boolean) {
        if (isModify)
            this.positions = this.cloneDeep(this.oldPositions)
        if (!this.drawConfig.material)
            this.drawConfig.material = Color.fromCssColorString('#ff0').withAlpha(0.5)

        if (!this.drawConfig.outlineMaterial) {
            this.drawConfig.outlineMaterial = new PolylineDashMaterialProperty({
                dashLength: 16,
                color: Color.fromCssColorString('#00f').withAlpha(0.7),
            })
        }
        const dynamicPositions = new CallbackProperty(() => {
            if (this.positions.length > 1) {
                const rect = Rectangle.fromCartesianArray(this.positions)
                return rect
            }
            else {
                return undefined
            }
        }, false)
        const outlineDynamicPositions = new CallbackProperty(() => {
            if (this.positions.length > 1) {
                const rect = Rectangle.fromCartesianArray(this.positions)
                const arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north]
                const positions = Cartesian3.fromRadiansArray(arr)
                return positions
            }
            else {
                return undefined
            }
        }, false)
        const bData = {
            rectangle: {
                coordinates: dynamicPositions,
                material: this.drawConfig.material,
                show: this.drawConfig.fill,
                // this.drawConfig.extrudedHeight > 0 时这四个参数需要添加
                // extrudedHeight: this.drawConfig.extrudedHeight,
                // extrudedHeightReference: HeightReference.RELATIVE_TO_GROUND,
                // closeTop: true,
                // closeBottom: true,
                // outline: false,
                // outlineWidth: 0
            },
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
        this.showRegion2Map(true)
        const positions = this.positions
        for (let i = 0; i < positions.length; i++)
            this.createPoint(positions[i], { oid: i })
    }

    // 重新进入编辑状态
    reEnterModify(positions: Array<DrawCartesian3>, objId: number) {
        this.objId = objId
        this.positions = positions
        this.oldPositions = positions
        this.showModifyRegion2Map()
        this.startModify()
    }

    // 编辑取消,重新绘制旧数据
    drawOldData() {
        this.showRegion2Map(true)
    }
}

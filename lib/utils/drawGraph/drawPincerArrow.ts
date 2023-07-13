import type { Viewer } from 'cesium'
import {
    CallbackProperty, Cartesian3, Color, PolygonGraphics, PolygonHierarchy, PolylineDashMaterialProperty, ScreenSpaceEventHandler, ScreenSpaceEventType, defined,
} from 'cesium'

import xp from './algorithm'

import DrawGraphBase from './drawBase'
import { FLAG_MAP } from './config'

import type { DrawEntity, PincerArrowOptions } from './types'

import { DRAW_GRAPH_MAP } from './config'

export default class DrawGraphPincerArrow extends DrawGraphBase {
    viewer: Viewer

    constructor(viewer: Viewer, options: PincerArrowOptions = {}) {
        super(viewer, options)

        this.viewer = viewer
        this.drawHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
        this.drawType = DRAW_GRAPH_MAP.PINCER_ARROW.key
        this.saveDraw = this._saveDraw
    }

    startDraw() {
        this.positions = []
        let floatingPoint: DrawEntity

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

            if (this.positions.length > 5) {
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
            this.tooltip.showAt(movement.position, '新增控制点')
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
                color: Color.fromCssColorString('#f00').withAlpha(0.7),
            })
        }

        const dynamicHierarchy = new CallbackProperty(() => {
            if (this.positions.length > 2) {
                try {
                    const lonLats = this.getLonLatArr(this.positions)
                    // 去重
                    this.removeDuplicate(lonLats)
                    const doubleArrow = xp.algorithm.doubleArrow(lonLats)
                    const positions = doubleArrow.polygonalPoint
                    if (!defined(positions))
                        return undefined

                    if (!positions || positions.length < 3)
                        return undefined

                    const pHierarchy = new PolygonHierarchy(positions)
                    return pHierarchy
                }
                catch (err) {
                    return undefined
                }
            }
            else {
                return undefined
            }
        }, false)
        const outlineDynamicPositions = new CallbackProperty(() => {
            if (this.positions.length < 3)
                return undefined

            try {
                const lonLats = this.getLonLatArr(this.positions)
                // 去重
                this.removeDuplicate(lonLats)
                const doubleArrow = xp.algorithm.doubleArrow(lonLats)
                const positions = doubleArrow.polygonalPoint
                if (!defined(positions))
                    return undefined

                if (!positions || positions.length < 3)
                    return undefined

                const firstPoint = positions[0]
                positions.push(firstPoint)
                return positions
            }
            catch (err) {
                return undefined
            }
        }, false)
        const bData = {
            polygon: new PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: this.drawConfig.material,
                show: this.drawConfig.fill,
                // this.drawConfig.extrudedHeight > 0 时这四个参数需要添加
                // extrudedHeight: this.drawConfig.extrudedHeight,
                // extrudedHeightReference: HeightReference.RELATIVE_TO_GROUND,
                // closeTop: true,
                // closeBottom: true,
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
        this.computeTempPositions()

        this.showRegion2Map(true)
        const positions = this.positions
        for (let i = 0; i < positions.length; i++)
            this.createPoint(positions[i], { oid: i })
    }

    removeDuplicate(lonLats: Array<number[]>) {
        if (!lonLats || lonLats.length < 2)
            return

        for (let i = 1; i < lonLats.length; i++) {
            const p1 = lonLats[i - 1]
            const p2 = lonLats[i]
            if (p2[0] === p1[0] && p2[1] === p1[1]) {
                lonLats.splice(i, 1)
                i--
            }
        }
    }

    _saveDraw() {
        this.saveClear()
        const lonLats = this.getLonLatArr(this.positions)
        const doubleArrow = xp.algorithm.doubleArrow(lonLats)
        const positions = doubleArrow.polygonalPoint
        const custom = doubleArrow.controlPoint
        return {
            custom,
            positions,
        }
    }

    // 重新进入编辑状态
    reEnterModify(saveData: any, objId: number) {
        this.objId = objId
        const arr = []
        for (let i = 0; i < saveData.custom.length; i++) {
            const p = saveData.custom[i]
            const c = Cartesian3.fromDegrees(p[0], p[1])
            arr.push(c)
        }
        this.positions = arr
        this.oldPositions = arr
        this.showModifyRegion2Map()
    }

    // 编辑取消,重新绘制旧数据
    drawOldData() {
        this.showRegion2Map(true)
    }
}

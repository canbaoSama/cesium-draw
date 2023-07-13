import type { Viewer } from 'cesium'
import {
    CallbackProperty, Cartesian2, Cartesian3, Color, ConstantProperty, EllipseGeometryLibrary, LabelStyle, PolygonGraphics, PolygonHierarchy,
    PolylineDashMaterialProperty, ScreenSpaceEventHandler, ScreenSpaceEventType,
} from 'cesium'

import DrawGraphBase from './drawBase'
import { FLAG_MAP } from './config'

import type { CircleOptions, DrawCartesian3, DrawEntity } from '../../../index'

import { DRAW_GRAPH_MAP } from './config'

export default class DrawGraphCircle extends DrawGraphBase {
    viewer: Viewer

    constructor(viewer: Viewer, options: CircleOptions = {}) {
        super(viewer, options)

        this.viewer = viewer
        this.drawHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
        this.drawType = DRAW_GRAPH_MAP.CIRCLE.key
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
                this.leftClickEvent(cartesian)
            }
            this.positions.push(cartesian)
            if (num > 0)
                this.createPoint(cartesian, { oid: 1 })

            if (num > 1) {
                this.positions.pop()
                this.viewer.entities.remove(floatingPoint)
                this.tooltip.setVisible(false)
                this.startModify()
            }
        }, ScreenSpaceEventType.LEFT_CLICK)

        // 鼠标移动事件
        this.drawHandler?.setInputAction((movement: any) => {
            if (this.positions.length < 1) {
                this.tooltip.showAt(movement.endPosition, '选择起点')
                return
            }
            this.tooltip.showAt(movement.endPosition, '选择终点')

            const cartesian = this.checkPosition(movement.endPosition)
            if (!cartesian)
                return

            floatingPoint.position = cartesian
            this.positions.pop()
            this.positions.push(cartesian)
        }, ScreenSpaceEventType.MOUSE_MOVE)
    }

    // 绘制时绑定是左点击事件(第一次点击)
    leftClickEvent(cartesian: DrawCartesian3) {
        this.createCenter(cartesian, 0)
        this.showRegion2Map()
        this.showCircleOutline2Map()
    }

    showRegion2Map(isModify?: boolean) {
        if (isModify)
            this.positions = this.cloneDeep(this.oldPositions)

        if (!this.drawConfig.material)
            this.drawConfig.material = Color.fromCssColorString('#ff0').withAlpha(0.5)

        if (this.drawConfig.radiusLineMaterial == null) {
            this.drawConfig.radiusLineMaterial = new PolylineDashMaterialProperty({
                dashLength: 16,
                color: Color.fromCssColorString('#00f').withAlpha(0.7),
            })
        }
        const dynamicHierarchy = new CallbackProperty(() => {
            if (this.positions.length > 1) {
                let dis = this.computeCircleRadius3D(this.positions)
                dis = parseFloat((dis / 1000).toFixed(3))
                this.entity.label.text = `${dis}km`
                const pnts = this.computeCirclePolygon(this.positions)
                const pHierarchy = new PolygonHierarchy(pnts)
                return pHierarchy
            }
            else {
                return undefined
            }
        }, false)
        const lineDynamicPositions = new CallbackProperty(() => {
            if (this.positions.length > 1)
                return this.positions

            else
                return undefined
        }, false)
        const labelDynamicPosition = new CallbackProperty(() => {
            if (this.positions.length > 1) {
                const p1 = this.positions[0]
                const p2 = this.positions[1]
                const cp = this.computeCenterPotition(p1, p2)
                return cp
            }
            else {
                return undefined
            }
        }, false)
        let dis: string | number = ''
        if (isModify) {
            dis = this.computeCircleRadius3D(this.positions)
            dis = `${(dis / 1000).toFixed(3)}km`
        }
        const bData = {
            position: labelDynamicPosition,
            label: {
                text: dis,
                font: '14px Helvetica',
                fillColor: Color.SKYBLUE,
                outlineColor: Color.BLACK,
                outlineWidth: 1,
                style: LabelStyle.FILL_AND_OUTLINE,
                eyeOffset: new ConstantProperty(new Cartesian3(0, 0, -9000)),
                pixelOffset: new Cartesian2(16, 16),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            polygon: new PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: this.drawConfig.material,
                fill: this.drawConfig.fill,
                outline: this.drawConfig.outline,
                outlineWidth: this.drawConfig.outlineWidth,
                outlineColor: this.drawConfig.outlineColor,
                // this.drawConfig.extrudedHeight > 0 时这四个参数需要添加
                // extrudedHeight: this.drawConfig.extrudedHeight,
                // extrudedHeightReference: HeightReference.RELATIVE_TO_GROUND,
                // closeTop: true,
                // closeBottom: true,
            }),
            polyline: {
                positions: lineDynamicPositions,
                clampToGround: true,
                width: this.drawConfig.lineWidth,
                material: this.drawConfig.radiusLineMaterial,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        }

        this.entity = this.viewer.entities.add(bData)
        this.setPublicParams()
    }

    showModifyRegion2Map() {
        this.showRegion2Map(true)
        this.createCenter(this.positions[0], 0)
        this.createPoint(this.positions[1], { oid: 1 })
    }

    // 添加圆外圈线条
    showCircleOutline2Map() {
        if (!this.drawConfig.outlineMaterial) {
            this.drawConfig.outlineMaterial = new PolylineDashMaterialProperty({
                dashLength: 16,
                color: Color.fromCssColorString('#f00').withAlpha(0.7),
            })
        }
        const outelinePositions = new CallbackProperty(() => {
            const pnts = this.computeCirclePolygon(this.positions)
            return pnts
        }, false)
        const bData = {
            polyline: {
                positions: outelinePositions,
                clampToGround: true,
                width: this.drawConfig.outlineWidth,
                material: this.drawConfig.outlineMaterial,
            },
        }
        this.drawConfig.outlineEntity = this.viewer.entities.add(bData)
        this.drawConfig.outlineEntity.layerId = this.drawConfig.layerId
        this.drawConfig.outlineEntity.objId = this.objId
        this.drawConfig.outlineEntity.drawType = this.drawType
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

    // 创建中心位置
    createCenter(cartesian: DrawCartesian3, oid: number) {
        return this.createPoint(cartesian, { oid, image: this.drawConfig.dragIcon, needSave: true })
    }

    computeCirclePolygon(positions: Array<DrawCartesian3>) {
        try {
            if (!positions || positions.length < 2)
                return undefined

            const cp = positions[0]
            const r = this.computeCircleRadius3D(positions)
            const pnts = this.computeCirclePolygon2(cp, r)
            return pnts
        }
        catch (err) {
            return undefined
        }
    }

    computeCirclePolygon2(center: DrawCartesian3, radius: number) {
        try {
            if (!center || radius <= 0)
                return undefined

            const cep = EllipseGeometryLibrary.computeEllipsePositions({
                center,
                semiMajorAxis: radius,
                semiMinorAxis: radius,
                rotation: 0,
                granularity: 0.005,
            }, false, true)
            if (!cep || !cep.outerPositions)
                return undefined

            const pnts = Cartesian3.unpackArray(cep.outerPositions)
            const first = pnts[0]
            pnts[pnts.length] = first
            return pnts
        }
        catch (err) {
            return undefined
        }
    }

    computeCircleRadius3D(positions: Array<DrawCartesian3>) {
        const c1 = positions[0]
        const c2 = positions[1]
        const x = (c1.x - c2.x) ** 2
        const y = (c1.y - c2.y) ** 2
        const z = (c1.z - c2.z) ** 2
        const dis = Math.sqrt(x + y + z)
        return dis
    }

    // computeCirclePolygon3(center, semiMajorAxis: number, semiMinorAxis: number, rotation) {
    //     try {
    //         if (!center || semiMajorAxis <= 0 || semiMinorAxis <= 0)
    //             return undefined

    //         const cep = EllipseGeometryLibrary.computeEllipsePositions({
    //             center,
    //             semiMajorAxis,
    //             semiMinorAxis,
    //             rotation,
    //             granularity: 0.005,
    //         }, false, true)
    //         if (!cep || !cep.outerPositions)
    //             return undefined

    //         const pnts = Cartesian3.unpackArray(cep.outerPositions)
    //         const first = pnts[0]
    //         pnts[pnts.length] = first
    //         return pnts
    //     }
    //     catch (err) {
    //         return undefined
    //     }
    // }
    // computeCirclePolygonForDegree(positions) {
    //     const cp = this.ellipsoid.cartesianToCartographic(positions[0])
    //     const rp = this.ellipsoid.cartesianToCartographic(positions[1])
    //     const x0 = cp.longitude
    //     const y0 = cp.latitude
    //     const xr = rp.longitude
    //     const yr = rp.latitude
    //     const r = Math.sqrt((x0 - xr) ** 2 + (y0 - yr) ** 2)

    //     const pnts = []
    //     for (let i = 0; i < 360; i++) {
    //         const x1 = x0 + r * Math.cos(i * Math.PI / 180)
    //         const y1 = y0 + r * Math.sin(i * Math.PI / 180)
    //         const p1 = Cartesian3.fromRadians(x1, y1)
    //         pnts.push(p1)
    //     }
    //     return pnts
    // }

    // 重新进入编辑状态
    reEnterModify(positions: Array<DrawCartesian3>, objId: number) {
        this.objId = objId
        this.positions = positions
        this.oldPositions = positions
        this.showModifyRegion2Map()
        this.showCircleOutline2Map()
        this.startModify()
    }

    // 编辑取消,重新绘制旧数据
    drawOldData() {
        this.createCenter(this.oldPositions[0], 0)
        this.showRegion2Map(true)
        this.showCircleOutline2Map()
    }
}

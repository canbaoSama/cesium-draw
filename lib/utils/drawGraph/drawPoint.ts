import type { Viewer } from 'cesium'
import { Entity, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium'

import DrawGraphBase from './drawBase'
import { FLAG_MAP } from './config'

import type { DrawCartesian3, DrawEntity, PointOptions } from '../../../index'

import { DRAW_GRAPH_MAP } from './config'

export default class DrawGraphPoint extends DrawGraphBase {
    viewer: Viewer

    constructor(viewer: Viewer, options: PointOptions = {}) {
        super(viewer, options)

        this.viewer = viewer
        this.drawHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
        this.drawType = DRAW_GRAPH_MAP.POINT.key
    }

    startDraw() {
        this.entity = undefined
        this.position = undefined

        this.drawHandler?.setInputAction((movement: any) => {
            const cartesian = this.checkPosition(movement.position)
            if (!cartesian)
                return
            this.position = cartesian
            this.entity = new Entity()
            this.entity.position = cartesian
            this.tooltip.setVisible(false)
            this.startModify()
        }, ScreenSpaceEventType.LEFT_CLICK)

        this.drawHandler?.setInputAction((movement: any) => {
            this.tooltip.showAt(movement.endPosition, '选择位置')
            const cartesian = this.checkPosition(movement.endPosition)
            if (!cartesian)
                return

            this.position = cartesian
            if (!this.entity)
                this.entity = this.createPoint(this.position, { oid: 0 })
            else
                this.entity.position = cartesian
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
                    this.position = cartesian
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
                this.tooltip.showAt(movement.position, '移动位置')
            }
        }, ScreenSpaceEventType.LEFT_CLICK)

        this.modifyHandler.setInputAction((movement: any) => {
            if (!isMoving)
                return

            this.tooltip.showAt(movement.endPosition, '移动位置')

            const cartesian = this.checkPosition(movement.endPosition)
            if (!cartesian)
                return

            pickedAnchor.position = cartesian
            this.position = cartesian
        }, ScreenSpaceEventType.MOUSE_MOVE)
    }

    reEnterModify(position: DrawCartesian3, objId: number) {
        this.objId = objId
        this.position = position
        this.oldPosition = position
        this.entity = undefined
        this.entity = this.createPoint(this.position, { oid: 0 })
        this.startModify()
    }

    drawOldData() {
        if (this.oldPosition) {
            this.createPoint(this.oldPosition, { oid: 0 })
            this.position = this.oldPosition
        }
    }
}

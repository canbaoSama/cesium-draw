import type { Viewer } from 'cesium'
import { ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium'

import DrawGraphBase from './drawBase'
import { ENTITY_LABEL_DEFAULT_CONFIG, FLAG_MAP } from './config'

import { DRAW_GRAPH_MAP } from './config'
import type { DrawCartesian3, DrawEntity, PosMeasureOptions, posInterface } from '../../../index'

export default class DrawGraphPosMeasure extends DrawGraphBase {
    viewer: Viewer

    constructor(viewer: Viewer, options: PosMeasureOptions = {}) {
        super(viewer, options)

        this.viewer = viewer
        this.drawHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
        this.drawType = DRAW_GRAPH_MAP.POS_MEASURE.key
    }

    startDraw() {
        this.entity = undefined
        this.position = undefined

        this.drawHandler?.setInputAction((movement: any) => {
            const cartesian = this.checkPosition(movement.position)
            if (!cartesian)
                return
            this.position = cartesian
            this.entity.position = cartesian
            const text = this.getMeasureTip(this.position)
            this.entity.label.text = text
            this.tooltip.setVisible(false)
            this.startModify()
        }, ScreenSpaceEventType.LEFT_CLICK)

        this.drawHandler?.setInputAction((movement: any) => {
            this.tooltip.showAt(movement.endPosition, '选择位置')
            const cartesian = this.checkPosition(movement.endPosition)
            if (!cartesian)
                return

            this.position = cartesian
            if (!this.entity) {
                this.entity = this._createPoint(this.position)
            }
            else {
                this.entity.position = cartesian
                const text = this.getMeasureTip(this.position)
                this.entity.label.text = text
            }
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
            const text = this.getMeasureTip(this.position)
            this.entity.label.text = text
        }, ScreenSpaceEventType.MOUSE_MOVE)
    }

    _createPoint(cartesian3: DrawCartesian3) {
        const text = this.getMeasureTip(cartesian3)
        const label = {
            text,
            ...ENTITY_LABEL_DEFAULT_CONFIG,
        }
        return this.createPoint(cartesian3, { oid: 0, label })
    }

    getMeasureTip(cartesian: DrawCartesian3) {
        const pos: posInterface = this.getLonLat(cartesian)

        pos.alt = parseFloat(pos.alt.toFixed(1))
        pos.lon = parseFloat(pos.lon.toFixed(3))
        pos.lat = parseFloat(pos.lat.toFixed(3))
        const tip = `经度：${pos.lon}, 纬度：${pos.lat}\n 海拔: ${pos.alt}米`
        return tip
    }
}

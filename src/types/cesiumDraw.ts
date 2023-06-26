import type { Cartesian3, Color, Entity, PolylineDashMaterialProperty, PolylineGlowMaterialProperty } from 'cesium'

export interface configInterface {
    radius: number
    material?: undefined
}

export interface DrawEntity extends Entity {
    oid?: number
    sid?: number
    flag?: string
    layerId?: string
    objId?: number
    drawType?: string
    startPoint?: boolean
}

export interface DrawCartesian3 extends Cartesian3 {
    sid?: number
    oid?: number
}

// 创建点的时候的 options
export interface createPointOpt {
    oid: number
    image?: string
    flag?: string
    needSave?: boolean // 是否需要保留
    label?: Object // 文案提示
    startPoint?: boolean
}

export interface posInterface {
    lon: number
    lat: number
    alt: number
    height: number
    sid?: number
    oid?: number
}

export interface InitOptions {
    startPoint?: DrawCartesian3
    rightEvent?: Function
    layerId?: string
    dragIconLight?: string // 绘制时的红点
    dragIcon?: string // 绘制时的灰点
    fill?: boolean
    outline?: boolean
    outlineWidth?: number
    outlineColor?: Color
    extrudedHeight?: number
    polylineWidth?: number
    radius?: number
    line?: boolean
    lineWidth?: number
    outlineEntity?: DrawEntity | undefined
    material?: PolylineGlowMaterialProperty | Color | undefined
    outlineMaterial?: PolylineDashMaterialProperty | Color | undefined
}

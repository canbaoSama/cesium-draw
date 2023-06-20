import type { Cartesian3, Entity } from 'cesium'

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
}

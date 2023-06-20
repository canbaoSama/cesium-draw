import type { Entity, PositionProperty } from 'cesium'

export interface position {
    lon: number // 精度
    lat: number // 维度

    height?: number // 高度
}

// websocket获取到的车辆位置信息
export interface vehicleInfo {
    vehicleName: string
    location: position
    vehicleNo: string | number
    vehicleType: number
    vehicleTypeDesc: string

    id?: number
    status?: boolean
    modelUrl?: string
}

// 根据横纵坐标计算后的包含高度对象
export interface vehicleCountHeight {
    location: position
}

export interface infoWindowRender {
    key: string
    value: string
    col: number
    name: string
    index: number
}

/**
 * 重新封装的接口,避免报错
 */
export interface newPositionProperty extends PositionProperty {
    _value?: any
    _callback?: Function
}

export interface newEntity extends Entity {
    getValue?: Function
}

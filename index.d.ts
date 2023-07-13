import type { Viewer, Cartesian3, Color, Entity, PolylineDashMaterialProperty, PolylineGlowMaterialProperty } from 'cesium'

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
}

export interface posInterface {
    lon: number
    lat: number
    alt: number
    height: number
    sid?: number
    oid?: number
}

export interface PublicOptions {
    layerId?: string
    dragIconLight?: string // 绘制时的红点,即鼠标点击生成的点
    dragIcon?: string // 绘制时的灰点,线条的中间点
}

export interface WithSurface extends PublicOptions {
    material?: PolylineGlowMaterialProperty | Color | undefined
    outlineMaterial?: PolylineDashMaterialProperty | Color | undefined
    fill?: boolean
    outlineWidth?: number
    outline?: boolean
}

// 绘制线条的options
export interface LineOptions extends PublicOptions {
    polylineWidth?: number
    material?: PolylineGlowMaterialProperty | Color | undefined
}

// 绘制面积量算的options
export interface AreaMeasureOptions extends WithSurface {
}
// 绘制攻击箭头的options
export interface AttactArrowOptions extends WithSurface {
}
// 绘制缓冲区的options
export interface BufferOptions extends PublicOptions {
    material?: PolylineGlowMaterialProperty | Color | undefined
    lineMaterial?: PolylineDashMaterialProperty | undefined
    lineWidth?: number
    radius?: number
    line?: boolean
    fill?: boolean
}
// 绘制圆的options
export interface CircleOptions extends PublicOptions {
    material?: PolylineGlowMaterialProperty | Color | undefined
    radiusLineMaterial?: PolylineDashMaterialProperty | undefined
    fill?: boolean
    outline?: boolean
    outlineWidth?: number
    outlineColor?: Color
    lineWidth?: number
    outlineMaterial?: PolylineDashMaterialProperty | Color | undefined
}
// 绘制钳击箭头的options
export interface PincerArrowOptions extends WithSurface {
}
// 绘制点的options
export interface PointOptions extends PublicOptions {
}
// 绘制多边形的options
export interface PolygonOptions extends WithSurface {
}
// 绘制矩形的options
export interface RectangleOptions extends WithSurface {
}
// 绘制直线箭头的options
export interface StraightArrowOptions extends WithSurface {
}
// 绘制坐标查询的options
export interface PosMeasureOptions extends PublicOptions {
}
// 绘制坐标查询的options
export interface SpaceDisMeasureOptions extends PublicOptions {
    polylineWidth?: number
    material?: PolylineGlowMaterialProperty | Color | undefined
}
// 绘制贴地距离的options
export interface StickDisMeasureOptions extends PublicOptions {
    polylineWidth?: number
    material?: PolylineGlowMaterialProperty | Color | undefined
}

export const DrawFunc
export function add1(): void
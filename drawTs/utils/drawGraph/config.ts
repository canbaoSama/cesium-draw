import { Cartesian2, Color, HeightReference, LabelStyle } from 'cesium'

import { DRAW_GRAPH_MAP } from '@/constants/cesium'

export const drawConfig = {
    layerId: 'globeDrawerLayer',
    dragIconLight: '/src/assets/images/circle_point_icon.svg', // 绘制时的红点
    dragIcon: '/src/assets/images/point_icon.svg', // 绘制时的灰点
    fill: true,
    outline: true,
    outlineWidth: 2,
    outlineColor: Color.YELLOW,
    extrudedHeight: 0,
    polylineWidth: 8,
    radius: 1,
    line: true,
    lineWidth: 2,
}

export const FLAG_MAP = {
    ANCHOR: 'anchor', // 锚点
    MID_ANCHOR: 'mid_anchor', // 中间的修改锚点
}

// 在保存时需要更新位置信息的图形类型,其实就是需要中间锚点的图形
export const SAVE_NEED_UPDATE_POSITION = [DRAW_GRAPH_MAP.LINE.key, DRAW_GRAPH_MAP.POLYGON.key, DRAW_GRAPH_MAP.BUFFER.key]

// 不需要保存的图形类型
export const UNSAVE_DRAW_TYPE = [DRAW_GRAPH_MAP.POS_MEASURE.key, DRAW_GRAPH_MAP.SPACE_DIS_MEASURE.key, DRAW_GRAPH_MAP.STICK_DIS_MEASURE.key, DRAW_GRAPH_MAP.AREA_MEASURE.key]

export const ENTITY_LABEL_DEFAULT_CONFIG = {
    font: '18px "微软雅黑", Arial, Helvetica, sans-serif, Helvetica',
    fillColor: Color.RED,
    outlineColor: Color.SKYBLUE,
    outlineWidth: 1,
    pixelOffset: new Cartesian2(0, 40),
    style: LabelStyle.FILL_AND_OUTLINE,
    heightReference: HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
}

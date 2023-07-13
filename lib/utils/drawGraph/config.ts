import { Cartesian2, Color, HeightReference, LabelStyle } from 'cesium'

// 绘制图形的功能列表
export const DRAW_GRAPH_MAP: { [key: string]: any } = {
    POINT: { key: 'POINT', name: '点', type: 'primary', drawFunc: 'DrawGraphPoint' },
    LINE: { key: 'LINE', name: '折线', type: 'primary', drawFunc: 'DrawGraphLine' },
    CIRCLE: { key: 'CIRCLE', name: '圆形', type: 'primary', drawFunc: 'DrawGraphCircle' },
    // ELLIPSE: { key: 'ELLIPSE', name: '椭圆', type: 'primary', disabled: true, drawFunc: 'DrawGraphLine' },
    POLYGON: { key: 'POLYGON', name: '多边形', type: 'primary', drawFunc: 'DrawGraphPolygon' },
    RECTANGLE: { key: 'RECTANGLE', name: '矩形', type: 'primary', drawFunc: 'DrawGraphRectangle' },
    BUFFER: { key: 'BUFFER', name: '缓冲区', type: 'primary', drawFunc: 'DrawGraphBuffer' },

    STRAIGHT_ARROW: { key: 'STRAIGHT_ARROW', name: '直线箭头', type: 'warning', drawFunc: 'DrawGraphPosMeasure' },
    ATTACT_ARROW: { key: 'ATTACT_ARROW', name: '攻击箭头', type: 'warning', drawFunc: 'DrawGraphAttactArrow' },
    PINCER_ARROW: { key: 'PINCER_ARROW', name: '钳击箭头', type: 'warning', drawFunc: 'DrawGraphPincerArrow' },

    POS_MEASURE: { key: 'POS_MEASURE', name: '坐标查询', type: 'success', drawFunc: 'DrawGraphStraightArrow' },
    SPACE_DIS_MEASURE: { key: 'SPACE_DIS_MEASURE', name: '空间距离', type: 'success', drawFunc: 'DrawGraphSpaceDisMeasure' },
    STICK_DIS_MEASURE: { key: 'STICK_DIS_MEASURE', name: '贴地距离', type: 'success', drawFunc: 'DrawGraphStickDisMeasure' },
    AREA_MEASURE: { key: 'AREA_MEASURE', name: '面积量算', type: 'success', drawFunc: 'DrawGraphAreaMeasure' },
}

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

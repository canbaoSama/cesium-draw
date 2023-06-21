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

    POS_MEASURE: { key: 'POS_MEASURE', name: '坐标查询', type: 'success', drawFunc: 'DrawGraphPosMeasure' },
    SPACE_DIS_MEASURE: { key: 'SPACE_DIS_MEASURE', name: '空间距离', type: 'success', drawFunc: 'DrawGraphSpaceDisMeasure' },
    STICK_DIS_MEASURE: { key: 'STICK_DIS_MEASURE', name: '贴地距离', type: 'success', drawFunc: 'DrawGraphStickDisMeasure' },
    AREA_MEASURE: { key: 'AREA_MEASURE', name: '面积量算', type: 'success', drawFunc: 'DrawGraphAreaMeasure' },
}

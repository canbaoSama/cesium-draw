import { drawConfig } from './config'

import DrawGraphLine from '@/utils/cesium/drawGraph/drawLine'
import DrawGraphPolygon from '@/utils/cesium/drawGraph/drawPolygon'
import DrawGraphCircle from '@/utils/cesium/drawGraph/drawCircle'
import DrawGraphStraightArrow from '@/utils/cesium/drawGraph/drawStraightArrow'
import DrawGraphBuffer from '@/utils/cesium/drawGraph/drawBuffer'
import DrawGraphRectangle from '@/utils/cesium/drawGraph/drawRectangle'
import DrawGraphAttactArrow from '@/utils/cesium/drawGraph/drawAttactArrow'
import DrawGraphPincerArrow from '@/utils/cesium/drawGraph/drawPincerArrow'
import DrawGraphPoint from '@/utils/cesium/drawGraph/drawPoint'
import DrawGraphPosMeasure from '@/utils/cesium/drawGraph/posMeasure'
import DrawGraphSpaceDisMeasure from '@/utils/cesium/drawGraph/spaceDisMeasure'
import DrawGraphStickDisMeasure from '@/utils/cesium/drawGraph/stickDisMeasure'
import DrawGraphAreaMeasure from '@/utils/cesium/drawGraph/areaMeasure'

const drawFunc: { [key: string | number]: any } = {
    DrawGraphLine,
    DrawGraphPolygon,
    DrawGraphCircle,
    DrawGraphStraightArrow,
    DrawGraphBuffer,
    DrawGraphRectangle,
    DrawGraphAttactArrow,
    DrawGraphPincerArrow,
    DrawGraphPoint,
    DrawGraphPosMeasure,
    DrawGraphSpaceDisMeasure,
    DrawGraphStickDisMeasure,
    DrawGraphAreaMeasure,
}
export {
    drawFunc,
    drawConfig,
}

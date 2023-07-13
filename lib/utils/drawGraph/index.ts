import { drawConfig } from './config'

import DrawGraphLine from './drawLine'
import DrawGraphPolygon from './drawPolygon'
import DrawGraphCircle from './drawCircle'
import DrawGraphStraightArrow from './drawStraightArrow'
import DrawGraphBuffer from './drawBuffer'
import DrawGraphRectangle from './drawRectangle'
import DrawGraphAttactArrow from './drawAttactArrow'
import DrawGraphPincerArrow from './drawPincerArrow'
import DrawGraphPoint from './drawPoint'
import DrawGraphPosMeasure from './posMeasure'
import DrawGraphSpaceDisMeasure from './spaceDisMeasure'
import DrawGraphStickDisMeasure from './stickDisMeasure'
import DrawGraphAreaMeasure from './areaMeasure'

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

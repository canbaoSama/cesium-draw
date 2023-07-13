import DrawGraphStraightArrow from './utils/drawGraph/drawStraightArrow'
import DrawGraphBuffer from './utils/drawGraph/drawBuffer'
import DrawGraphRectangle from './utils/drawGraph/drawRectangle'
import DrawGraphAttactArrow from './utils/drawGraph/drawAttactArrow'
import DrawGraphPincerArrow from './utils/drawGraph/drawPincerArrow'
import DrawGraphPoint from './utils/drawGraph/drawPoint'
import DrawGraphPosMeasure from './utils/drawGraph/posMeasure'
import DrawGraphSpaceDisMeasure from './utils/drawGraph/spaceDisMeasure'
import DrawGraphStickDisMeasure from './utils/drawGraph/stickDisMeasure'
import DrawGraphAreaMeasure from './utils/drawGraph/areaMeasure'
import DrawGraphLine from './utils/drawGraph/drawLine'
import DrawGraphCircle from './utils/drawGraph/drawCircle'
import DrawGraphPolygon from './utils/drawGraph/drawPolygon'

let init = 1;
export function add1() {
    console.log(init++)
}


export {
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

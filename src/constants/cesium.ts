//* **********************************************************************************  本页面所有注释不可删除 **********************************************************************************  */
//* **********************************************************************************  本页面所有注释不可删除 **********************************************************************************  */
//* **********************************************************************************  本页面所有注释不可删除 **********************************************************************************  */
import { ClockRange } from 'cesium'

import { CESIUM_CONFIG } from '@/config'

// 不同模型的偏移设置
export const MODEL_3D_OFFSET: { [key: string]: any } = {
    GroundVehicle_lat: -0.00009897970005567913, // 进入视角时默认偏移的维度
    GroundVehicle_h: 11.83093947613743,
    CesiumMilkTruck_lat: -0.00009897970005567913, // 进入视角时默认偏移的角度
    CesiumMilkTruck_h: 11.83093947613743,
}

// 当前的 cesium 任务类型
export const CESIUM_TASK = {
    POINT_AND_MODEL: 'point_and_model', // 初始化的实时展示类型
    PLAY_VEHICLE_POSITION: 'play_vehicle_position', // 播放历史车辆行动轨迹
}

// 图层控制类型
export const LAYER_CONTROL_TYPE: { [key: string]: any } = {
    INIT: 'init', // 初始化图层
    PAM_TO_PVP: 'pam_to_pvp', // 从 实时展示任务 转移到 播放历史车辆行动轨迹
    PVP_TO_PAM: 'pvp_to_pam', // 从 播放历史车辆行动轨迹 转移到 实时展示任务
    DRAW: 'draw', // 进入绘制状态,其它公用图层关闭
    EXIT_DRAW: 'exit_draw', // 退出绘制状态,需要将原有的图层还原
    ANNULAR_COMMAND: 'annular_command', // 进入环形命令状态
}

export const VEHICLE_TYPE_MODEL: { [key: string]: any } = {
    0: '/src/assets/files/GroundVehicle.glb', // 侦打车1 模型
    1: '/src/assets/files/CesiumMilkTruck.glb', // 侦打车2 模型
    2: '/src/assets/files/GroundVehicle.glb', // 警戒车1 模型
    3: '/src/assets/files/CesiumMilkTruck.glb', // 中继车1 模型
}

export const VEHICLE_TYPE_MARK: { [key: string]: any } = {
    0: '/src/assets/images/icons/car_mark_icon.svg', // 侦打车1 模型
    1: '/src/assets/images/icons/car_mark_icon.svg', // 侦打车2 模型
    2: '/src/assets/images/icons/car_mark_icon.svg', // 警戒车1 模型
    3: '/src/assets/images/icons/car_mark_icon.svg', // 中继车1 模型
}

// 清除场景时需要保留的场景名称,这是鹰眼图的场景名称
export const RESERVED_ENTITY_NAME = ['mapx_father', 'mapx_son']
export const RESERVED_ENTITY_NAME_MAP = {
    MAPX_FATHER: 'mapx_father',
    MAPX_SON: 'mapx_son',
}

// 绘制图形的功能列表
export const DRAW_GRAPH_MAP: { [key: string]: any } = {
    POINT: { key: 'POINT', name: '点', type: 'primary', drawFunc: 'DrawGraphPoint' },
    LINE: { key: 'LINE', name: '折线', type: 'primary', drawFunc: 'DrawGraphLine' },
    CIRCLE: { key: 'CIRCLE', name: '圆形', type: 'primary', drawFunc: 'DrawGraphCircle' },
    // ELLIPSE: { key: 'ELLIPSE', name: '椭圆', type: 'primary', disabled: true, drawFunc: 'DrawGraphLine' },
    POLYGON: { key: 'POLYGON', name: '多边形', type: 'primary', drawFunc: 'DrawGraphPolygon' },
    RECTANGLE: { key: 'RECTANGLE', name: '矩形', type: 'primary', drawFunc: 'DrawGraphRectangle' },
    BUFFER: { key: 'BUFFER', name: '缓冲区', type: 'primary', drawFunc: 'DrawGraphBuffer' },

    POS_MEASURE: { key: 'POS_MEASURE', name: '坐标查询', type: 'success', drawFunc: 'DrawGraphPosMeasure' },
    SPACE_DIS_MEASURE: { key: 'SPACE_DIS_MEASURE', name: '空间距离', type: 'success', drawFunc: 'DrawGraphSpaceDisMeasure' },
    STICK_DIS_MEASURE: { key: 'STICK_DIS_MEASURE', name: '贴地距离', type: 'success', drawFunc: 'DrawGraphStickDisMeasure' },
    AREA_MEASURE: { key: 'AREA_MEASURE', name: '面积量算', type: 'success', drawFunc: 'DrawGraphAreaMeasure' },

    STRAIGHT_ARROW: { key: 'STRAIGHT_ARROW', name: '直线箭头', type: 'warning', drawFunc: 'DrawGraphPosMeasure' },
    ATTACT_ARROW: { key: 'ATTACT_ARROW', name: '攻击箭头', type: 'warning', drawFunc: 'DrawGraphAttactArrow' },
    PINCER_ARROW: { key: 'PINCER_ARROW', name: '钳击箭头', type: 'warning', drawFunc: 'DrawGraphPincerArrow' },
}

// 环形按钮指令
export const ANNULAR_COMMAND_NAME = {
    WEAPONS_RANGE: 'weapons_range',
    DRAW_TRACE: 'draw_trace',
    STOP_TO_HIDE: 'stop_to_hide',
}
/**
 * 两种方式形成车辆任务
 * 1. polyline 可以贴地，就是需要不断更新两个position数据，而且没法保证model不被隐藏一部分,更新时会闪动
 * 2. path 只需要更新一个position，而且model可以完全贴合path路径，但是线条不能贴地，穿过山脉会被隐藏部分
 * */
export const VEHICLE_CZML = [
    {
        id: 'document',
        name: 'document',
        version: '1.0',
        clock: {
            currentTime: '2012-08-04T16:00:00Z',
            interval: '2012-08-04T16:00:00Z/2012-08-04T16:25:00Z',
            multiplier: 1,
            clockRange: ClockRange.LOOP_STOP,
        },
    },
    {
        id: CESIUM_CONFIG.VEHICLE_DEFAULT_NAME,
        name: CESIUM_CONFIG.VEHICLE_DEFAULT_NAME,
        availability: '2012-08-04T16:00:00Z/2012-08-04T16:25:00Z',
        label: {
            fillColor: [
                {
                    interval: '2012-08-04T16:00:00Z/2012-08-04T16:25:00Z',
                    rgba: [255, 255, 0, 255],
                },
            ],
            font: 'bold 10pt Segoe UI Semibold',
            horizontalOrigin: 'CENTER',
            outlineColor: { rgba: [0, 0, 0, 255] },
            pixelOffset: {
                cartesian2: [0, 20],
            },
            disableDepthTestDistance: Number.POSITIVE_INFINITY, // 设置label 不被遮挡
            scale: 1,
            show: [
                {
                    interval: '2012-08-04T16:00:00Z/2012-08-04T16:25:00Z',
                    boolean: true,
                },
            ],
            style: 'FILL',
            text: 'Test Vehicle',
            verticalOrigin: 'CENTER',
        },
        model: {
            gltf: '/src/assets/files/GroundVehicle.glb',
            minimumPixelSize: 100,
            maximumScale: 500,
        },
        orientation: {
            velocityReference: '#position',
        },
        // viewFrom: {
        //     cartesian: [-2080, -1715, 779],
        // },
        properties: {
            fuel_remaining: {
                epoch: '2012-08-04T16:00:00Z',
                number: [0, 22.5, 1500, 21.2],
            },
        },
        // path: {
        //     material: {
        //         solidColor: {
        //             color: {
        //                 interval: '2012-08-04T16:00:00Z/2012-08-04T16:25:00Z',
        //                 rgba: [255, 255, 0, 255],
        //             },
        //         },
        //     },
        //     clampToGround: true,
        //     width: [
        //         {
        //             interval: '2012-08-04T16:00:00Z/2012-08-04T16:25:00Z',
        //             number: 5,
        //         },
        //     ],
        //     show: [
        //         {
        //             interval: '2012-08-04T16:00:00Z/2012-08-04T16:25:00Z',
        //             boolean: true,
        //         },
        //     ],
        // },
        position: {
            forwardExtrapolationType: 'HOLD',
            interpolationAlgorithm: 'LINEAR',
            interpolationDegree: 1,
            epoch: '2012-08-04T16:00:00Z',
            // interpolationAlgorithm: 'LAGRANGE',
            // interpolationDegree: 1,
            // epoch: '2012-08-04T16:00:00Z',
            // cartesian: [], // [time, X, Y, Z] 形式 time为从0开始的数字，按照毫秒计算
            // cartographicDegrees: [], // [time, Longitude, Latitude, Heigh]
        },
    },
    // {
    //     id: 'Polyline',
    //     // polyline: {
    //     //     positions: {
    //     //         // cartographicDegrees: [],
    //     //     },
    //     //     material: {
    //     //         solidColor: {
    //     //             color: {
    //     //                 rgba: [255, 255, 0, 255],
    //     //             },
    //     //         },
    //     //     },
    //     //     width: 5,
    //     //     clampToGround: true,
    //     // },
    //     polyline: {
    //         // This callback updates positions each frame.
    //         // positions: new CallbackProperty((time, result) => {
    //         //     return Cartesian3.fromDegreesArrayHeights(
    //         //         initDegress.value,
    //         //         Ellipsoid.WGS84,
    //         //         result,
    //         //     )
    //         // }, false),
    //         width: 5,
    //         material: Color.YELLOW,
    //     },
    // },
]

//* **********************************************************************************  本页面所有注释不可删除 **********************************************************************************  */
//* **********************************************************************************  本页面所有注释不可删除 **********************************************************************************  */
//* **********************************************************************************  本页面所有注释不可删除 **********************************************************************************  */

/**
 * 加载多个czml文件
 */

// const statusDisplay = document.createElement('div')
// const fuelDisplay = document.createElement('div')
// const czmlPath = 'src/assets/czml/'
// let vehicleEntity: any

// // 添加一个空白CzmlDataSource来保存我们的多部分实体。
// const dataSource = new CzmlDataSource()
// viewer.dataSources.add(dataSource)

// // 这个演示展示了如何将单个路径分解为多个CZML流。
// const partsToLoad = [
//     {
//         url: 'part1.czml',
//         range: [0, 1500],
//         requested: false,
//         loaded: false,
//     },
//     {
//         url: 'part2.czml',
//         range: [1500, 3000],
//         requested: false,
//         loaded: false,
//     },
//     {
//         url: 'part3.czml',
//         range: [3000, 4500],
//         requested: false,
//         loaded: false,
//     },
// ]

// function updateStatusDisplay() {
//     let msg = ''
//     partsToLoad.forEach((part) => {
//         msg += `${part.url} - `
//         if (part.loaded)
//             msg += 'Loaded.<br/>'

//         else if (part.requested)
//             msg += 'Loading now...<br/>'

//         else
//             msg += 'Not needed yet.<br/>'
//     })
//     statusDisplay.innerHTML = msg
// }

// // Helper函数将一个部件标记为请求的，并将其处理到dataSource中
// function processPart(part: any) {
//     part.requested = true
//     updateStatusDisplay()
//     dataSource.process(czmlPath + part.url).then(() => {
//         part.loaded = true
//         updateStatusDisplay()

//         // Follow the vehicle with the camera.
//         if (!viewer.trackedEntity) {
//             viewer.trackedEntity = vehicleEntity = dataSource.entities.getById(
//                 'Vehicle',
//             )
//         }
//     })
// }

// // 将第一部分向前加载
// processPart(partsToLoad[0])

// // 在时钟自然到达之前加载一个新部分。
// // 请注意，这无法预测用户何时可以快进到它。
// const preloadTimeInSeconds = 100

// viewer.clock.onTick.addEventListener((clock) => {
//     // 本示例使用从开始的时间偏移来确定哪些零件需要加载。

//     const timeOffset = JulianDate.secondsDifference(
//         clock.currentTime,
//         clock.startTime,
//     )

//     // 将零件列表筛选为当前需要加载的零件。
//     // 然后，处理每个需要加载的部件。
//     partsToLoad
//         .filter((part) => {
//             return (
//                 !part.requested
//                 && timeOffset >= part.range[0] - preloadTimeInSeconds
//                 && timeOffset <= part.range[1]
//             )
//         })
//         .forEach((part) => {
//             processPart(part)
//         })

//     if (vehicleEntity) {
//         const fuel = vehicleEntity.properties.fuel_remaining.getValue(
//             clock.currentTime,
//         )
//         if (defined(fuel))
//             fuelDisplay.textContent = `Fuel: ${fuel.toFixed(2)} gal`
//     }
// })

// // 添加一个重置按钮，以方便操作
// window.Sandcastle.addToolbarButton('Reset demo', () => {
//     // 把东西放回起始位置
//     viewer.clock.currentTime = viewer.clock.startTime

//     partsToLoad.forEach((part) => {
//         part.requested = false
//         part.loaded = false
//     })

//     dataSource.entities.removeAll()
//     processPart(partsToLoad[0])
// })

// // 在重置按钮下方显示状态显示
// statusDisplay.style.background = 'rgba(42, 42, 42, 0.7)'
// statusDisplay.style.padding = '5px 10px'
// document.getElementById('toolbar')?.appendChild(statusDisplay)

// // 显示正在从CZML读取的多部分自定义属性
// fuelDisplay.style.background = 'rgba(42, 42, 42, 0.7)'
// fuelDisplay.style.padding = '5px 10px'
// fuelDisplay.style.marginTop = '5px'
// document.getElementById('toolbar')?.appendChild(fuelDisplay)

// 3d 动态模型一
// const czml = [
//     {
//         id: 'document',
//         name: 'CZML Path',
//         version: '1.0',
//         clock: {
//             interval: '2012-08-04T10:00:00Z/2012-08-04T15:00:00Z',
//             currentTime: '2012-08-04T10:00:00Z',
//             multiplier: 10,
//         },
//     },
//     {
//         id: 'GroundVehicle',
//         name: 'path with GPS flight data',
//         description:
//             '<p>Hang gliding flight log data from Daniel H. Friedman.<br>Icon created by Larisa Skosyrska from the Noun Project</p>',
//         availability: '2012-08-04T10:00:00Z/2012-08-04T15:00:00Z',
//         path: {
//             material: {
//                 polylineOutline: {
//                     color: {
//                         rgba: [255, 0, 255, 255],
//                     },
//                     outlineColor: {
//                         rgba: [0, 255, 255, 255],
//                     },
//                     outlineWidth: 5,
//                 },
//             },
//             width: 8,
//             leadTime: 10,
//             trailTime: 1000,
//             resolution: 5,
//         },
//         model: {
//             gltf: 'src/assets/files/GroundVehicle.glb',
//         },
//         position: {
//             epoch: '2012-08-04T10:00:00Z',
//             cartographicDegrees: [
//                 0,
//                 -122.93797,
//                 39.50935,
//                 1776,
//                 10,
//                 -122.93822,
//                 39.50918,
//                 1773,
//                 20,
//                 -122.9385,
//                 39.50883,
//                 1772,
//                 30,
//                 -122.93855,
//                 39.50842,
//                 1770,
//                 40,
//                 -122.93868,
//                 39.50792,
//                 1770,
//                 50,
//                 -122.93877,
//                 39.50743,
//                 1767,
//                 60,
//                 -122.93862,
//                 39.50697,
//                 1771,
//                 70,
//                 -122.93828,
//                 39.50648,
//                 1765,
//                 80,
//                 -122.93818,
//                 39.50608,
//                 1700,
//             ],
//         },
//     },
//     {
//         id: 'Polyline',
//         polyline: {
//             positions: {
//                 cartesian: [
//                     1216348.1632364073,
//                     -4736348.958775471,
//                     4081284.5528982095,
//                     1216369.1229444197,
//                     -4736377.467107148,
//                     4081240.888485707,
//                 ],
//             },
//             material: {
//                 polylineOutline: {
//                     color: {
//                         rgba: [255, 255, 0, 255],
//                     },
//                     outlineColor: {
//                         rgba: [0, 0, 0, 255],
//                     },
//                     outlineWidth: 2,
//                 },
//             },
//             width: 10,
//             clampToGround: true,
//         },
//     },
// ]

// const dataSource = await viewer.dataSources.add(CzmlDataSource.load(czml))
// viewer.trackedEntity = dataSource.entities.getById('GroundVehicle')

// 引入模型
// function createModel(url: string, height: number) {
//     viewer.entities.removeAll()

//     const position = Cartesian3.fromDegrees(
//         115.5310955104305,
//         29.45941132782301,
//         height,
//     )
//     const heading = degToRad(135)
//     const pitch = -90
//     const roll = 0
//     const hpr = new HeadingPitchRoll(heading, pitch, roll)
//     const orientation = Transforms.headingPitchRollQuaternion(
//         position,
//         hpr,
//     )

//     const entity = viewer.entities.add({
//         name: url,
//         position,
//         ...orientation,
//         model: {
//             uri: url,
//             minimumPixelSize: 128,
//             maximumScale: 20000,
//         },
//     })
//     viewer.trackedEntity = entity
//     // viewer.camera.flyTo({
//     //     destination: Cartesian3.fromDegrees(115.5310955104305, 29.45941132782301, 1000), // 设置位置
//     //     orientation: {
//     //         heading: degToRad(20.0), // 方向
//     //         pitch: degToRad(-90.0), // 倾斜角度
//     //         roll: 0,
//     //     },
//     // })
// }
// const options = [
//     {
//         text: 'Ground Vehicle',
//         onselect() {
//             createModel(
//                 'src/assets/files/GroundVehicle.glb',
//                 0,
//             )
//         },
//     },
//     {
//         text: 'Milk Truck',
//         onselect() {
//             createModel(
//                 'src/assets/files/CesiumMilkTruck.glb',
//                 0,
//             )
//         },
//     },
// ]
// window.Sandcastle.addToolbarMenu(options)
// options[0].onselect()

// viewer.camera.flyTo({
//     destination: Cartesian3.fromDegrees(115.5310955104305, 29.45941132782301, 100),
//     orientation: {
//         heading: degToRad(0), // 水平偏角，默认正北 0
//         pitch: degToRad(-90), // 俯视角，默认-90，垂直向下
//         roll: 0, // 旋转角
//     },
// })

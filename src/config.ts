// 项目公共配置
export const BASE_URL = '/api'

// 公共的延迟数据，比如表格点击，请求避免重复设置的延迟
export const PUBLIC_SETTIMEOUT_TIME = 100

// socket 配置
export enum WEB_SOCKET {
    URL = 'ws://192.168.3.107:9001/ws/',
    KEY = 'key=zklogs',
}

// axios 配置
export const AXIOS_CONFIG = {
    BASE_URL,
    TIME_OUT: 10 * 1000,
    DEFAULT_MSG: '接口请求错误',
    REPEAT_MSG: '重复请求',
}

export const CESIUM_CONFIG = {
    REQUEST_SETINTERVAL_TIME: 1, // 请求间隔 设置为 1 秒，那么最大播放倍速默认就是 REQUEST_SETINTERVAL_TIME × REQUEST_PATH_SIZE
    REQUEST_PATH_SIZE: 100, // 播放车辆路径时请求的数据，每次请求 100 秒的数据，也就是 100 条
    MAX_MULTIPLIER: 10, // 最大播放倍速
    MAX_CACHE_SIZE: 1000 * 4, // 最大播放缓存,因为缓存储存每条是4位数，所以要乘以4

    // 系统所有拼接逻辑是 `${下面的默认名字}_${vehicle.vehicleNo}`
    POINT_AND_MODEL_DEFAULT_NAME: 'PointAndModel', // entity 或者 datasource 默认的 id 和 name, 展示 pointandmodel 时使用
    VEHICLE_DEFAULT_NAME: 'Vehicle', // entity 或者 datasource 默认的 id 和 name，播放车辆历史轨迹时使用
    POLYLINE_DEFAULT_NAME: 'polyline', // polyline 默认的 id 和 name

    DEFAULT_VIEW_RECTANGLE: [80, 22, 130, 55], // 相机查看的默认位置，中国上方
    DEFAULT_VIEW_FACTOR: 1.2, // 相机距离地面距离标量，如果比1小就贴近地面
    DISTANCE_SHOW: 250, // 显示控制显隐的高度
    MODAL_MAX_SIZE: 500, // 导入的3D模型的最大尺寸
    MODAL_MIN_SIZE: 100, // 导入的3D模型的最小尺寸
    DEG: 135, // 导入的3D 模型旋转角度
    SET_VIEW_PITCH: -45, // 设置实体视角的ptich参数
    PIXEL_SIZE: 10, // 点的像素大小

    EYE_MIN_LEVEL: 3, // 鹰眼图最小详细级别
    EYE_MAX_LEVEL: 18, // 鹰眼图最大详细级别

    CESIUM_BASE_URL: 'node_modules/cesium/Build/CesiumUnminified/',
    IMAGERY_PROVIDER_URL: 'node_modules/cesium/Build/CesiumUnminified/Assets/Textures/NaturalEarthII',
    IMG_PROVIDER_DEFAULT: 'images/cq/{z}/{x}/{y}.jpg', // 默认的地图底图
    IMG_PROVIDER_GAODE: 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', // 高德地图 https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}
    IMG_PROVIDER_GOOGLE: 'http://www.google.com/maps/vt?lyrs=s@716&x={x}&y={y}&z={z}',
}

export const defaultAccessToken
    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiZmE4NzNlMS0xMDY0LTQzOGItOTI2NS1lYTNiMjc5ZjY2MWIiLCJpZCI6MTMzMDY2LCJpYXQiOjE2ODExODA4MzV9.v4hY4qWVEyk8rvNKiJnpNJl82VyX302WQRolFFWjiwQ'
export const billyangAccessToken
    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZDNlYzY5OS03MzlhLTRlOWEtYjgyMy00NTljNzkxMDI4NzQiLCJpZCI6MTMzMDY2LCJpYXQiOjE2ODExOTkxNzB9.CsRM9UXM-H1hFIsMkg3M6AyhO_VLNOvC8fMZ11Z8Tv8'

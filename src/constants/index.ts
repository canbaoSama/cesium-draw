export const EVENT_TYPE = {
    MOUSE_UP: 'MOUSE_UP', // 松开鼠标
    MOUSE_MOVE: 'MOUSE_MOVE', // 鼠标移动
}

export const LOADING_SVG = `
<path class="path" d="
  M 30 15
  L 28 17
  M 25.61 25.61
  A 15 15, 0, 0, 1, 15 30
  A 15 15, 0, 1, 1, 27.99 7.5
  L 15 15
" style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`

export const VEHICLE_IMAGE_BASE_URL = 'src/assets/images/vehicles/vehicle_'
export const VEHICLE_IMAGE_BASE_URL_SUFFIX = '.webp'
export const VEHICLE_IMAGE_URL_ARRAY = [
    'src/assets/images/vehicles/vehicle_0.webp',
    'src/assets/images/vehicles/vehicle_1.webp',
    'src/assets/images/vehicles/vehicle_2.webp',
    'src/assets/images/vehicles/vehicle_3.webp',
    'src/assets/images/vehicles/vehicle_4.webp',
]

export const WS_STATUS = {
    CONNECTING: 0, // 正在连接连接尚未打开
    OPEN: 1, // 连接已打开，可以进行通信
    CLOSING: 2, // 连接处于闭合过程中
    CLOSED: 3, // 连接已关闭
}

// 操作状态
export const OPERATE_STATUS = {
    NONE: 'none', // 无操作状态
    ADD: 'add', // 新增
    EDIT: 'edit', // 编辑
    DELETE: 'delete', // 删除
}

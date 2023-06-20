import { JulianDate } from 'cesium'

// 角度转弧度
export function degToRad(deg: number) {
    return Math.PI * 2 * (deg / 360)
}
// 弧度转角度
export function radToDeg(rad: number) {
    return rad * (360 / (Math.PI * 2))
}

// JulianDate代表天文朱利安时间，用的是世界协调时，比北京时间晚8个小时，所以在源代码中给默认的时间格式加上8小时。时间戳不需要增减
// 儒略日转时间戳
export function julianDateToTimeStamp(date: JulianDate) {
    return JulianDate.toDate(date).getTime()
}
// 时间戳转儒略日
export function timeStampToJulianDate(date: number) {
    return JulianDate.fromDate(new Date(date))
}
// 北京时间转儒略日
export function bjTimeToJulianDate(date: Date | undefined) {
    return JulianDate.addHours(JulianDate.fromDate(new Date(date || ''), new JulianDate()), -8, new JulianDate())
}
// 儒略日转北京时间
export function julianDateToBjTime(date: JulianDate | undefined) {
    return date ? JulianDate.toDate(JulianDate.addHours(date, 8, new JulianDate())) : ''
}

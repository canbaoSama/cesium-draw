import { Cartesian3 } from 'cesium'

import P from './plotUtil'

interface xpInterface {
    version: string
    createTime: string
    author: string
    algorithm: {
        doubleArrow: Function
        threeArrow: Function
        array2Dto1D: Function
        getArrowPoints: Function
        getArrowHeadPoints: Function
        getArrowBodyPoints: Function
        getTempPoint4: Function
        tailedAttackArrow: Function
        getAttackArrowHeadPoints: Function
        getAttackArrowBodyPoints: Function
        dereplication: Function
        fineArrow: Function
    }
}

interface publicResult {
    controlPoint: Array<number[]> | undefined
    polygonalPoint: Array<Cartesian3> | Array<number[]> | undefined
}

interface dftParamInterface {
    headHeightFactor: number
    headTailFactor: number
    headWidthFactor: number
    neckWidthFactor: number
    neckHeightFactor: number
}

const doubleArrowDefualParam = {
    type: 'doublearrow',
    headHeightFactor: 0.25,
    headWidthFactor: 0.3,
    neckHeightFactor: 0.85,
    fixPointCount: 4,
    neckWidthFactor: 0.15,
}
const tailedAttackArrowDefualParam = {
    headHeightFactor: 0.18,
    headWidthFactor: 0.3,
    neckHeightFactor: 0.85,
    neckWidthFactor: 0.15,
    tailWidthFactor: 0.1,
    headTailFactor: 0.8,
    swallowTailFactor: 1,
    swallowTailPnt: [], // 原生方法未定义次参数,我自己添加的,如果有用到此方法,到时候再查看是何作用
}
const fineArrowDefualParam = {
    tailWidthFactor: 0.15,
    neckWidthFactor: 0.20,
    headWidthFactor: 0.25,
    headAngle: Math.PI / 8.5,
    neckAngle: Math.PI / 13,
}

const xp: xpInterface = {
    version: '1.0.0',
    createTime: '2018.6.19',
    author: 'xupinhui',
    algorithm: {
        doubleArrow: (inputPoint: Array<number[]>) => {
            let connPoint, tempPoint4
            const points = inputPoint
            const result: publicResult = {
                controlPoint: undefined,
                polygonalPoint: undefined,
            }
            // 获取已经点击的坐标数
            const t = inputPoint.length
            if (!(t < 2)) {
                if (t === 2)
                    return inputPoint
                const o = points[0] // 第一个点
                const e = points[1] // 第二个点
                const r = points[2] // 第三个点
                // 下面的是移动点位后的坐标
                t === 3 ? tempPoint4 = xp.algorithm.getTempPoint4(o, e, r) : tempPoint4 = points[3];
                (t === 3 || t === 4) ? connPoint = P.PlotUtils.mid(o, e) : connPoint = points[4]
                let n, g
                if (P.PlotUtils.isClockWise(o, e, r)) {
                    n = xp.algorithm.getArrowPoints(o, connPoint, tempPoint4, !1)
                    g = xp.algorithm.getArrowPoints(connPoint, e, r, !0)
                }
                else {
                    n = xp.algorithm.getArrowPoints(e, connPoint, r, !1)
                    g = xp.algorithm.getArrowPoints(connPoint, o, tempPoint4, !0)
                }
                const i = n.length
                const s = (i - 5) / 2
                const a = n.slice(0, s)
                const l = n.slice(s, s + 5)
                let u = n.slice(s + 5, i)
                let c = g.slice(0, s)
                const p = g.slice(s, s + 5)
                const h = g.slice(s + 5, i)
                c = P.PlotUtils.getBezierPoints(c)
                const d = P.PlotUtils.getBezierPoints(h.concat(a.slice(1)))
                u = P.PlotUtils.getBezierPoints(u)
                const f = c.concat(p, d, l, u)
                const newArray = xp.algorithm.array2Dto1D(f)
                result.controlPoint = [o, e, r, tempPoint4, connPoint]
                result.polygonalPoint = Cartesian3.fromDegreesArray(newArray)
            }
            return result
        },
        threeArrow(inputPoint: Array<number[]>) {
            let connPoint, tempPoint4, tempPoint5
            const points = inputPoint
            const result: publicResult = {
                controlPoint: undefined,
                polygonalPoint: undefined,
            }
            // 获取已经点击的坐标数
            let t = inputPoint.length
            if (t >= 2) {
                if (t === 2)
                    return inputPoint

                const o = points[0] // 第一个点
                const e = points[1] // 第二个点
                const r = points[2] // 第三个点
                t = inputPoint.length // 获取已经点击的坐标数
                // 下面的是移动点位后的坐标
                if (t === 3) {
                    tempPoint4 = xp.algorithm.getTempPoint4(o, e, r)
                    tempPoint5 = P.PlotUtils.mid(r, tempPoint4)
                }
                else {
                    tempPoint4 = points[3]
                    tempPoint5 = points[4]
                }
                if (t < 6)
                    connPoint = P.PlotUtils.mid(o, e)

                else
                    connPoint = points[5]

                let n, g
                if (P.PlotUtils.isClockWise(o, e, r)) {
                    n = xp.algorithm.getArrowPoints(o, connPoint, tempPoint4, !1)
                    g = xp.algorithm.getArrowPoints(connPoint, e, r, !0)
                }
                else {
                    n = xp.algorithm.getArrowPoints(e, connPoint, r, !1)
                    g = xp.algorithm.getArrowPoints(connPoint, o, tempPoint4, !0)
                }
                const i = n.length
                const s = (i - 5) / 2
                const a = n.slice(0, s)
                const l = n.slice(s, s + 5)
                let u = n.slice(s + 5, i)
                let c = g.slice(0, s)
                const p = g.slice(s, s + 5)
                const h = g.slice(s + 5, i)
                c = P.PlotUtils.getBezierPoints(c)
                const d = P.PlotUtils.getBezierPoints(h.concat(a.slice(1)))
                u = P.PlotUtils.getBezierPoints(u)
                const f = c.concat(p, d, l, u)
                const newArray = xp.algorithm.array2Dto1D(f)
                result.controlPoint = [o, e, r, tempPoint4, tempPoint5, connPoint]
                result.polygonalPoint = Cartesian3.fromDegreesArray(newArray)
            }
            return result
        },
        array2Dto1D(array: Array<any[]>) {
            const newArray: Array<any> = []
            array.forEach((elt) => {
                newArray.push(elt[0])
                newArray.push(elt[1])
            })
            return newArray
        },
        getArrowPoints(t: Array<number>, o: Array<number>, e: Array<number>, r: number) {
            const headHeightFactor = doubleArrowDefualParam.headHeightFactor
            const headWidthFactor = doubleArrowDefualParam.headWidthFactor
            const neckHeightFactor = doubleArrowDefualParam.neckHeightFactor
            const neckWidthFactor = doubleArrowDefualParam.neckWidthFactor
            const n = P.PlotUtils.mid(t, o)
            const g = P.PlotUtils.distance(n, e)
            let i = P.PlotUtils.getThirdPoint(e, n, 0, 0.3 * g, !0)
            let s = P.PlotUtils.getThirdPoint(e, n, 0, 0.5 * g, !0)
            i = P.PlotUtils.getThirdPoint(n, i, P.Constants.HALF_PI, g / 5, r)
            s = P.PlotUtils.getThirdPoint(n, s, P.Constants.HALF_PI, g / 4, r)
            const a = [n, i, s, e]
            const l = xp.algorithm.getArrowHeadPoints(a, headHeightFactor, headWidthFactor, neckHeightFactor, neckWidthFactor)
            const u = l[0]
            const c = l[4]
            const p = P.PlotUtils.distance(t, o) / P.PlotUtils.getBaseLength(a) / 2
            const h = xp.algorithm.getArrowBodyPoints(a, u, c, p)
            const d = h.length
            let f = h.slice(0, d / 2)
            let E = h.slice(d / 2, d)
            f.push(u)
            E.push(c)
            f = f.reverse()
            f.push(o)
            E = E.reverse()
            E.push(t)
            return f.reverse().concat(l, E)
        },
        getArrowHeadPoints(t: Array<number[]>, o: Array<number>, e: Array<number>) {
            const headHeightFactor = doubleArrowDefualParam.headHeightFactor
            const headWidthFactor = doubleArrowDefualParam.headWidthFactor
            const neckHeightFactor = doubleArrowDefualParam.neckHeightFactor
            const neckWidthFactor = doubleArrowDefualParam.neckWidthFactor
            const r = P.PlotUtils.getBaseLength(t)
            const n = r * headHeightFactor
            const g = t[t.length - 1]
            const i = (P.PlotUtils.distance(o, e), n * headWidthFactor)
            const s = n * neckWidthFactor
            const a = n * neckHeightFactor
            const l = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, n, !0)
            const u = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, a, !0)
            const c = P.PlotUtils.getThirdPoint(g, l, P.Constants.HALF_PI, i, !1)
            const p = P.PlotUtils.getThirdPoint(g, l, P.Constants.HALF_PI, i, !0)
            const h = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !1)
            const d = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !0)
            return [h, c, g, p, d]
        },
        getArrowBodyPoints(t: Array<number>, o: Array<number>, e: Array<number>, r: number) {
            const u: Array<any> = []
            const c: Array<any> = []
            for (let n = P.PlotUtils.wholeDistance(t), g = P.PlotUtils.getBaseLength(t), i = g * r, s = P.PlotUtils.distance(o, e), a = (i - s) / 2, l = 0, u = [], c = [], p = 1; p < t.length - 1; p++) {
                const h = P.PlotUtils.getAngleOfThreePoints(t[p - 1], t[p], t[p + 1]) / 2
                l += P.PlotUtils.distance(t[p - 1], t[p])
                const d = (i / 2 - l / n * a) / Math.sin(h)
                const f = P.PlotUtils.getThirdPoint(t[p - 1], t[p], Math.PI - h, d, !0)
                const E = P.PlotUtils.getThirdPoint(t[p - 1], t[p], h, d, !1)
                u.push(f)
                c.push(E)
            }
            return u.concat(c)
        },
        getTempPoint4(t: Array<number>, o: Array<number>, e: Array<number>) {
            let r, n, g, i
            const s = P.PlotUtils.mid(t, o)
            const a = P.PlotUtils.distance(s, e)
            const l = P.PlotUtils.getAngleOfThreePoints(t, s, e)
            if (l < P.Constants.HALF_PI) {
                n = a * Math.sin(l)
                g = a * Math.cos(l)
                i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !1)
                r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !0)
            }
            else if (l >= P.Constants.HALF_PI && l < Math.PI) {
                n = a * Math.sin(Math.PI - l)
                g = a * Math.cos(Math.PI - l)
                i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !1)
                r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !1)
            }
            else if (l >= Math.PI && l < 1.5 * Math.PI) {
                n = a * Math.sin(l - Math.PI)
                g = a * Math.cos(l - Math.PI)
                i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !0)
                r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !0)
            }
            else {
                n = a * Math.sin(2 * Math.PI - l)
                g = a * Math.cos(2 * Math.PI - l)
                i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !0)
                r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !1)
            }
            // l < P.Constants.HALF_PI
            //     ? (n = a * Math.sin(l), g = a * Math.cos(l), i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !1), r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !0))
            //     : l >= P.Constants.HALF_PI && l < Math.PI
            //         ? (n = a * Math.sin(Math.PI - l), g = a * Math.cos(Math.PI - l), i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !1), r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !1))
            //         : l >= Math.PI && l < 1.5 * Math.PI
            //             ? (n = a * Math.sin(l - Math.PI), g = a * Math.cos(l - Math.PI), i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !0), r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !0))
            //             : (n = a * Math.sin(2 * Math.PI - l), g = a * Math.cos(2 * Math.PI - l), i = P.PlotUtils.getThirdPoint(t, s, P.Constants.HALF_PI, n, !0), r = P.PlotUtils.getThirdPoint(s, i, P.Constants.HALF_PI, g, !1))
            return r
        },
        tailedAttackArrow(inputPoint: Array<number[]>) {
            inputPoint = xp.algorithm.dereplication(inputPoint)
            const tailWidthFactor = tailedAttackArrowDefualParam.tailWidthFactor
            const swallowTailFactor = tailedAttackArrowDefualParam.swallowTailFactor
            let swallowTailPnt = tailedAttackArrowDefualParam.swallowTailPnt
            // 控制点
            const result: publicResult = {
                controlPoint: undefined,
                polygonalPoint: undefined,
            }
            result.controlPoint = inputPoint
            let t = inputPoint.length
            if (!(t < 2)) {
                if (inputPoint.length === 2) {
                    result.polygonalPoint = inputPoint
                    return result
                }
                const o = inputPoint
                let e = o[0]
                let r = o[1]
                if (P.PlotUtils.isClockWise(o[0], o[1], o[2])) {
                    e = o[1]
                    r = o[0]
                }
                const n = P.PlotUtils.mid(e, r)
                const g = [n].concat(o.slice(2))
                const i = xp.algorithm.getAttackArrowHeadPoints(g, e, r, tailedAttackArrowDefualParam)
                const s = i[0]
                const a = i[4]
                const l = P.PlotUtils.distance(e, r)
                const u = P.PlotUtils.getBaseLength(g)
                const c = u * tailWidthFactor * swallowTailFactor
                swallowTailPnt = P.PlotUtils.getThirdPoint(g[1], g[0], 0, c, !0)
                const p = l / u
                const h = xp.algorithm.getAttackArrowBodyPoints(g, s, a, p)
                t = h.length
                let d = [e].concat(h.slice(0, t / 2))
                d.push(s)
                let f = [r].concat(h.slice(t / 2, t))
                let newArray = []
                f.push(a)
                d = P.PlotUtils.getQBSplinePoints(d)
                f = P.PlotUtils.getQBSplinePoints(f)

                // 原生是这样的
                // newArray = xp.algorithm.array2Dto1D(d.concat(i, f.reverse(), [swallowTailPnt, d[0]]))
                newArray = xp.algorithm.array2Dto1D(d.concat(i, f.reverse(), [swallowTailPnt, d[0]]))
                result.polygonalPoint = Cartesian3.fromDegreesArray(newArray)
            }
            return result
        },
        getAttackArrowHeadPoints(t: Array<number[]>, o: Array<number>, e: Array<number>, defaultParam: dftParamInterface) {
            const headHeightFactor = defaultParam.headHeightFactor
            const headTailFactor = defaultParam.headTailFactor
            const headWidthFactor = defaultParam.headWidthFactor
            const neckWidthFactor = defaultParam.neckWidthFactor
            const neckHeightFactor = defaultParam.neckHeightFactor
            let r = P.PlotUtils.getBaseLength(t)
            let n = r * headHeightFactor
            const g = t[t.length - 1]
            r = P.PlotUtils.distance(g, t[t.length - 2])
            const i = P.PlotUtils.distance(o, e)
            n > i * headTailFactor && (n = i * headTailFactor)
            const s = n * headWidthFactor
            const a = n * neckWidthFactor
            n = n > r ? r : n
            const l = n * neckHeightFactor
            const u = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, n, !0)
            const c = P.PlotUtils.getThirdPoint(t[t.length - 2], g, 0, l, !0)
            const p = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !1)
            const h = P.PlotUtils.getThirdPoint(g, u, P.Constants.HALF_PI, s, !0)
            const d = P.PlotUtils.getThirdPoint(g, c, P.Constants.HALF_PI, a, !1)
            const f = P.PlotUtils.getThirdPoint(g, c, P.Constants.HALF_PI, a, !0)
            return [d, p, g, h, f]
        },
        getAttackArrowBodyPoints(t: Array<number[]>, o: Array<number>, e: Array<number>, r: number) {
            const u = []
            const c = []
            for (let n = P.PlotUtils.wholeDistance(t), g = P.PlotUtils.getBaseLength(t), i = g * r, s = P.PlotUtils.distance(o, e), a = (i - s) / 2, l = 0, p = 1; p < t.length - 1; p++) {
                const h = P.PlotUtils.getAngleOfThreePoints(t[p - 1], t[p], t[p + 1]) / 2
                l += P.PlotUtils.distance(t[p - 1], t[p])
                const d = (i / 2 - l / n * a) / Math.sin(h)
                const f = P.PlotUtils.getThirdPoint(t[p - 1], t[p], Math.PI - h, d, !0)
                const E = P.PlotUtils.getThirdPoint(t[p - 1], t[p], h, d, !1)
                u.push(f)
                c.push(E)
            }
            return u.concat(c)
        },
        dereplication(array: Array<number[]>) {
            const last = array[array.length - 1]
            let change = false
            let newArray = []
            newArray = array.filter((i) => {
                if (i[0] !== last[0] && i[1] !== last[1])
                    return i

                change = true
                return false
            })
            if (change)
                newArray.push(last)
            return newArray
        },
        fineArrow(tailPoint: Array<Cartesian3>, headerPoint: Array<Cartesian3>) {
            if ((tailPoint.length < 2) || (headerPoint.length < 2))
                return
            // 画箭头的函数
            const tailWidthFactor = fineArrowDefualParam.tailWidthFactor
            const neckWidthFactor = fineArrowDefualParam.neckWidthFactor
            const headWidthFactor = fineArrowDefualParam.headWidthFactor
            const headAngle = fineArrowDefualParam.headAngle
            const neckAngle = fineArrowDefualParam.neckAngle
            const o = []
            o[0] = tailPoint
            o[1] = headerPoint
            const e = o[0]
            const r = o[1]
            const n = P.PlotUtils.getBaseLength(o)
            const g = n * tailWidthFactor
            // 尾部宽度因子
            const i = n * neckWidthFactor
            // 脖子宽度银子
            const s = n * headWidthFactor
            // 头部宽度因子
            const a = P.PlotUtils.getThirdPoint(r, e, P.Constants.HALF_PI, g, !0)
            const l = P.PlotUtils.getThirdPoint(r, e, P.Constants.HALF_PI, g, !1)
            const u = P.PlotUtils.getThirdPoint(e, r, headAngle, s, !1)
            const c = P.PlotUtils.getThirdPoint(e, r, headAngle, s, !0)
            const p = P.PlotUtils.getThirdPoint(e, r, neckAngle, i, !1)
            const h = P.PlotUtils.getThirdPoint(e, r, neckAngle, i, !0)
            const d = []
            d.push(a[0], a[1], p[0], p[1], u[0], u[1], r[0], r[1], c[0], c[1], h[0], h[1], l[0], l[1], e[0], e[1])
            return Cartesian3.fromDegreesArray(d)
        },
    },
}

export default xp

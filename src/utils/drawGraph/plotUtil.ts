interface PInterface {
    version: string
    Constants: {
        TWO_PI: number
        HALF_PI: number
        FITTING_COUNT: number
        ZERO_TOLERANCE: number
    }
    PlotUtils: {
        distance: Function
        wholeDistance: Function
        getBaseLength: Function
        mid: Function
        getCircleCenterOfThreePoints: Function
        getIntersectPoint: Function
        getAzimuth: Function
        getAngleOfThreePoints: Function
        isClockWise: Function
        getPointOnLine: Function
        getCubicValue: Function
        getThirdPoint: Function
        getArcPoints: Function
        getBisectorNormals: Function
        getNormal: Function
        getCurvePoints: Function
        getLeftMostControlPoint: Function
        getRightMostControlPoint: Function
        getBezierPoints: Function
        getBinomialFactor: Function
        getFactorial: Function
        getQBSplinePoints: Function
        getQuadricBSplineFactor: Function
    }
}

const P: PInterface = {
    version: '1.0.0',
    Constants: {
        TWO_PI: 2 * Math.PI,
        HALF_PI: Math.PI / 2,
        FITTING_COUNT: 100,
        ZERO_TOLERANCE: 1e-4,
    },
    PlotUtils: {
        distance(t: Array<number>, o: Array<number>) {
            return Math.sqrt((t[0] - o[0]) ** 2 + (t[1] - o[1]) ** 2)
        },
        wholeDistance(t: Array<number>) {
            let o = 0
            for (let e = 0; e < t.length - 1; e++)
                o += this.distance(t[e], t[e + 1])

            return o
        },
        getBaseLength(t: number) {
            return this.wholeDistance(t) ** 0.99
        },
        mid(t: Array<number>, o: Array<number>) {
            return [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2]
        },
        getCircleCenterOfThreePoints(t: Array<number>, o: Array<number>, e: Array<number>) {
            const r = [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2]
            const n = [r[0] - t[1] + o[1], r[1] + t[0] - o[0]]
            const g = [(t[0] + e[0]) / 2, (t[1] + e[1]) / 2]
            const i = [g[0] - t[1] + e[1], g[1] + t[0] - e[0]]
            return this.getIntersectPoint(r, n, g, i)
        },
        getIntersectPoint(t: Array<number>, o: Array<number>, e: Array<number>, r: Array<number>) {
            let n, g, i, s
            if (t[1] === o[1]) {
                n = (r[0] - e[0]) / (r[1] - e[1])
                g = n * (t[1] - e[1]) + e[0]
                i = t[1]
                return [g, i]
            }
            if (e[1] === r[1]) {
                s = (o[0] - t[0]) / (o[1] - t[1])

                g = s * (e[1] - t[1]) + t[0]
                i = e[1]
                return [g, i]
            }

            s = (o[0] - t[0]) / (o[1] - t[1])
            n = (r[0] - e[0]) / (r[1] - e[1])
            i = (s * t[1] - t[0] - n * e[1] + e[0]) / (s - n)
            g = s * i - s * t[1] + t[0]
            return [g, i]
        },
        getAzimuth(t: Array<number>, o: Array<number>) {
            let e
            const r = Math.asin(Math.abs(o[1] - t[1]) / this.distance(t, o));
            (o[1] >= t[1] && o[0] >= t[0]) ? e = r + Math.PI : ((o[1] >= t[1] && o[0] < t[0]) ? e = P.Constants.TWO_PI - r : ((o[1] < t[1] && o[0] < t[0]) ? e = r : (o[1] < t[1] && o[0] >= t[0] && (e = Math.PI - r))))
            // 上方表达式如下
            // if (o[1] >= t[1] && o[0] >= t[0])
            //     e = r + Math.PI
            // else if (o[1] >= t[1] && o[0] < t[0])
            //     e = P.Constants.TWO_PI - r
            // else if (o[1] < t[1] && o[0] < t[0])
            //     e = r
            // else if (o[1] < t[1] && o[0] >= t[0])
            //     e = Math.PI - r;
            return e
        },
        getAngleOfThreePoints(t: Array<number>, o: Array<number>, e: Array<number>) {
            const r = this.getAzimuth(o, t) - this.getAzimuth(o, e)
            return r < 0 ? r + P.Constants.TWO_PI : r
        },
        isClockWise(t: Array<number>, o: Array<number>, e: Array<number>) {
            return (e[1] - t[1]) * (o[0] - t[0]) > (o[1] - t[1]) * (e[0] - t[0])
        },
        getPointOnLine(t: number, o: Array<number>, e: Array<number>) {
            const r = o[0] + t * (e[0] - o[0])
            const n = o[1] + t * (e[1] - o[1])
            return [r, n]
        },
        getCubicValue(t: number, o: Array<number>, e: Array<number>, r: Array<number>, n: Array<number>) {
            t = Math.max(Math.min(t, 1), 0)
            const g = 1 - t
            const i = t * t
            const s = i * t
            const a = g * g
            const l = a * g
            const u = l * o[0] + 3 * a * t * e[0] + 3 * g * i * r[0] + s * n[0]
            const c = l * o[1] + 3 * a * t * e[1] + 3 * g * i * r[1] + s * n[1]
            return [u, c]
        },
        getThirdPoint(t: Array<number>, o: Array<number>, e: number, r: number, n: number) {
            const g = this.getAzimuth(t, o)
            const i = n ? g + e : g - e
            const s = r * Math.cos(i)
            const a = r * Math.sin(i)
            return [o[0] + s, o[1] + a]
        },
        getArcPoints(t: Array<number>, o: number, e: number, r: number) {
            let n
            let g
            const i = []
            let s = r - e
            s = s < 0 ? s + P.Constants.TWO_PI : s
            for (let a = 0; a <= P.Constants.FITTING_COUNT; a++) {
                const l = e + s * a / P.Constants.FITTING_COUNT
                n = t[0] + o * Math.cos(l)
                g = t[1] + o * Math.sin(l)
                i.push([n, g])
            }
            return i
        },
        getBisectorNormals(t: number, o: Array<number>, e: Array<number>, r: Array<number>) {
            const n = this.getNormal(o, e, r)
            const g = Math.sqrt(n[0] * n[0] + n[1] * n[1])
            const i = n[0] / g
            const s = n[1] / g
            const a = this.distance(o, e)
            const l = this.distance(e, r)

            let h, d, u, p, c
            if (g > P.Constants.ZERO_TOLERANCE) {
                if (this.isClockWise(o, e, r)) {
                    let u = t * a
                    let c = e[0] - u * s
                    let p = e[1] + u * i
                    h = [c, p]
                    u = t * l
                    c = e[0] + u * s
                    p = e[1] - u * i
                    d = [c, p]
                }
                else {
                    u = t * a
                    c = e[0] + u * s
                    p = e[1] - u * i
                    h = [c, p]
                    u = t * l
                    c = e[0] - u * s
                    p = e[1] + u * i
                    d = [c, p]
                }
            }
            else {
                c = e[0] + t * (o[0] - e[0])
                p = e[1] + t * (o[1] - e[1])
                h = [c, p]
                c = e[0] + t * (r[0] - e[0])
                p = e[1] + t * (r[1] - e[1])
                d = [c, p]
            }
            return [h, d]
        },
        getNormal(t: Array<number>, o: Array<number>, e: Array<number>) {
            let r = t[0] - o[0]
            let n = t[1] - o[1]
            const g = Math.sqrt(r * r + n * n)
            r /= g
            n /= g
            let i = e[0] - o[0]
            let s = e[1] - o[1]
            const a = Math.sqrt(i * i + s * s)
            i /= a
            s /= a
            const l = r + i
            const u = n + s
            return [l, u]
        },
        getCurvePoints(t: number, o: Array<number>) {
            const e = this.getLeftMostControlPoint(o)
            let r = [e]
            let g, i
            for (let n = 0; n < o.length - 2; n++) {
                g = o[n]
                i = o[n + 1]
                const s = o[n + 2]
                const a = this.getBisectorNormals(t, g, i, s)
                r = r.concat(a)
            }
            const l = this.getRightMostControlPoint(o)
            r.push(l)
            const u = []
            for (let n = 0; n < o.length - 1; n++) {
                g = o[n]
                i = o[n + 1]
                u.push(g)
                for (let m = 0; m < P.Constants.FITTING_COUNT; m++) {
                    const c = this.getCubicValue(m / P.Constants.FITTING_COUNT, g, r[2 * n], r[2 * n + 1], i)
                    u.push(c)
                }
                u.push(i)
            }
            return u
        },
        getLeftMostControlPoint(o: Array<number[]>) {
            const t = 1 // 原生方法未定义次参数,我自己添加的,如果有用到此方法,到时候再查看是何作用

            const e = o[0]
            const r = o[1]
            const n = o[2]
            const g = this.getBisectorNormals(0, e, r, n)
            const i = g[0]
            const s = this.getNormal(e, r, n)
            const a = Math.sqrt(s[0] * s[0] + s[1] * s[1])
            let m, O
            if (a > P.Constants.ZERO_TOLERANCE) {
                const l = this.mid(e, r)
                const u = e[0] - l[0]
                const c = e[1] - l[1]
                const p = this.distance(e, r)
                const h = 2 / p
                const d = -h * c
                const f = h * u
                const E = d * d - f * f
                const v = 2 * d * f
                const A = f * f - d * d
                const _ = i[0] - l[0]
                const y = i[1] - l[1]
                m = l[0] + E * _ + v * y
                O = l[1] + v * _ + A * y
            }
            else {
                m = e[0] + t * (r[0] - e[0])
                O = e[1] + t * (r[1] - e[1])
            }
            return [m, O]
        },
        getRightMostControlPoint(o: Array<number[]>) {
            const t = 1 // 原生方法未定义次参数,我自己添加的,如果有用到此方法,到时候再查看是何作用

            const e = o.length
            const r = o[e - 3]
            const n = o[e - 2]
            const g = o[e - 1]
            const i = this.getBisectorNormals(0, r, n, g)
            const s = i[1]
            const a = this.getNormal(r, n, g)
            const l = Math.sqrt(a[0] * a[0] + a[1] * a[1])
            let T, O
            if (l > P.Constants.ZERO_TOLERANCE) {
                const u = this.mid(n, g)
                const c = g[0] - u[0]
                const p = g[1] - u[1]
                const h = this.distance(n, g)
                const d = 2 / h
                const f = -d * p
                const E = d * c
                const v = f * f - E * E
                const A = 2 * f * E
                const _ = E * E - f * f
                const y = s[0] - u[0]
                const m = s[1] - u[1]
                O = u[0] + v * y + A * m
                T = u[1] + A * y + _ * m
            }
            else {
                O = g[0] + t * (n[0] - g[0])
                T = g[1] + t * (n[1] - g[1])
            }
            return [O, T]
        },
        getBezierPoints(t: Array<number[]>) {
            if (t.length <= 2)
                return t
            const o = []
            const e = t.length - 1
            for (let r = 0; r <= 1; r += 0.01) {
                let n = 0
                let y = 0
                for (let g = 0; e >= g; g++) {
                    const i = this.getBinomialFactor(e, g)
                    const s = r ** g
                    const a = (1 - r) ** (e - g)
                    n += i * s * a * t[g][0]
                    y += i * s * a * t[g][1]
                }
                o.push([n, y])
            }
            o.push(t[e])
            return o
        },
        getBinomialFactor(t: number, o: number) {
            return this.getFactorial(t) / (this.getFactorial(o) * this.getFactorial(t - o))
        },
        getFactorial(t: number) {
            if (t <= 1)
                return 1
            if (t === 2)
                return 2
            if (t === 3)
                return 6
            if (t === 4)
                return 24
            if (t === 5)
                return 120
            let o = 1
            for (let e = 1; t >= e; e++) o *= e
            return o
        },
        getQBSplinePoints(t: Array<number[]>) {
            if (t.length <= 2)
                return t
            const o = 2
            const e = []
            const r = t.length - o - 1
            e.push(t[0])
            for (let n = 0; r >= n; n++) {
                for (let g = 0; g <= 1; g += 0.05) {
                    let i = 0
                    let y = 0
                    for (let s = 0; o >= s; s++) {
                        const a = this.getQuadricBSplineFactor(s, g)
                        i += a * t[n + s][0]
                        y += a * t[n + s][1]
                    }
                    e.push([i, y])
                }
            }
            e.push(t[t.length - 1])
            return e
        },
        getQuadricBSplineFactor(t: number, o: number) {
            return t === 0 ? (o - 1) ** 2 / 2 : t === 1 ? (-2 * o ** 2 + 2 * o + 1) / 2 : t === 2 ? o ** 2 / 2 : 0
        },
    },
}
export default P

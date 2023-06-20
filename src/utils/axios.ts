import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig, AxiosResponse, Canceler } from 'axios'

import { AXIOS_CONFIG, PUBLIC_SETTIMEOUT_TIME } from '@/config'

import { useUserStore } from '@/store/user'

interface requestConfig extends AxiosRequestConfig {
    isStopRepeat?: boolean // 取消了重复请求判断
}

const useStore = useUserStore()

export interface RequestOptions {
    /** 当前接口权限, 不需要鉴权的接口请忽略， 格式：sys:user:add */
    permCode?: string
    /** 是否直接获取data，而忽略message等 */
    isGetDataDirectly?: boolean
    /** 请求成功是提示信息 */
    successMsg?: string
    /** 请求失败是提示信息 */
    errorMsg?: string
    /** 是否mock数据请求 */
    isMock?: boolean
}

const reqList: Array<string | undefined> = []

/**
 * 阻止重复请求
 * @param {array} reqList - 请求缓存列表
 * @param {string} url - 当前请求地址
 * @param {function} cancel - 请求中断函数
 * @param {string} errorMessage - 请求中断时需要显示的错误信息
 */
const stopRepeatRequest = function (url: string | undefined, cancel: Canceler, errorMessage: string) {
    const errorMsg = errorMessage || AXIOS_CONFIG.REPEAT_MSG
    for (let i = 0; i < reqList.length; i++) {
        if (reqList[i] === url) {
            cancel(errorMsg)
            return
        }
    }
    reqList.push(url)
}

/**
   * 允许某个请求可以继续进行
   * @param {array} reqList 全部请求列表
   * @param {string} url 请求地址
   */
const allowRequest = function (url: string | undefined) {
    for (let i = 0; i < reqList.length; i++) {
        if (reqList[i] === url) {
            reqList.splice(i, 1)
            break
        }
    }
}

// 增加延迟，相同请求不得在短时间内重复发送
function delayStartRequest(response: AxiosResponse) {
    setTimeout(() => {
        allowRequest(response?.config?.url)
    }, PUBLIC_SETTIMEOUT_TIME)
}

const service = axios.create({
    baseURL: AXIOS_CONFIG.BASE_URL,
    timeout: AXIOS_CONFIG.TIME_OUT,
})

service.interceptors.request.use(
    (config: requestConfig) => {
        if (!config.isStopRepeat) { // 重复请求判断
            let cancel: Canceler = message => message
            // 设置cancelToken对象
            config.cancelToken = new axios.CancelToken((c) => {
                cancel = c
            })
            // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
            stopRepeatRequest(config.url, cancel, `${config.url} ${AXIOS_CONFIG.REPEAT_MSG}`)
        }
        if (config.method && config.method === 'post')
            config.data.token = useStore.userInfo.token

        return config
    },
    (error) => {
        Promise.reject(error)
    },
)

service.interceptors.response.use(
    (response) => {
        delayStartRequest(response)
        const res = response.data

        if (res?.code !== 0) {
            console.error(res?.message || AXIOS_CONFIG.DEFAULT_MSG)

            const error = new Error(
                res?.message || AXIOS_CONFIG.DEFAULT_MSG,
            ) as Error & { code: any }
            error.code = res?.code
            return Promise.reject(error)
        }
        else {
            return res
        }
    },
    (error) => {
        delayStartRequest(error)

        // 处理 422 或者 500 的错误异常提示
        const errMsg
            = error?.response?.data?.message ?? error?.message ?? AXIOS_CONFIG.DEFAULT_MSG
        console.error(errMsg)
        error.message = `${errMsg}`
        return Promise.reject(error)
    },
)

// 封装get和post，其他接口配置暂时不考虑
export async function request<T = any>(url: string, params?: object, config?: requestConfig, options: RequestOptions = {}): Promise<T> {
    try {
        const { successMsg, errorMsg, isGetDataDirectly = true } = options

        const setConfig = {
            url,
            params,
            baseURL: AXIOS_CONFIG.BASE_URL,
            ...config,
        }

        if (setConfig.method && setConfig.method !== 'get') {
            setConfig.params = {}
            setConfig.data = params
        }

        const res = await service.request(setConfig)
        successMsg && ElMessage.success(successMsg)
        errorMsg && ElMessage.error(errorMsg)
        return isGetDataDirectly ? res.data : res
    }
    catch (error: any) {
        return Promise.reject(error)
    }
}

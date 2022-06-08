// noinspection SpellCheckingInspection,JSCheckFunctionSignatures,JSUnresolvedVariable,JSUnresolvedFunction,JSIncompatibleTypesComparison,JSVoidFunctionReturnValueUsed,JSUnusedGlobalSymbols

/**
 代理请求处理器

 @author: aszswaz
 @date: 2022-03-14 14:14:52
 @IDE: WebStorm
 */

const HttpRequest = require("./HttpRequest")
const HttpResponse = require("./HttpResponse")
const HookManager = require("./HookManager")
const ViewDataManager = require("./ViewDataManager")
const {cloneDeep} = require("lodash")

/**
 * IO 异常响应
 */
const ERROR_RESPONSE = HttpResponse.gatewayTimeout()

/**
 * 请求发送之前
 */
function* beforeSendRequest(requestDetail) {
    return new Promise((resolve) => {
        // 生成请求 ID，用于上下文关联
        let request = HttpRequest.build(requestDetail)
        // 执行 HOOK
        const hookRun = HookManager.beforeRequest(request)
        request = hookRun && hookRun.request ? hookRun.request : request
        // 避免多次解析同样的请求
        requestDetail.requestOptions.cache = request
        // 将代理请求发送到页面
        ViewDataManager.append(request, hookRun ? hookRun.response : null)

        // HOOK 脚本要求修改请求或直接发送响应，向上传递给 anyproxy
        if (hookRun && hookRun.request) {
            const obj = hookRun.request.toAnyproxyObj()
            obj.response = hookRun.response ? hookRun.response.toAnyproxyObj() : null
            resolve(obj)
        } else {
            resolve(null)
        }
    })
}

/**
 * 响应发送之前
 */
function* beforeSendResponse(requestDetail, responseDetail) {
    return new Promise((resolve) => {
        let request = requestDetail.requestOptions.cache
        let response = HttpResponse.build(responseDetail)
        // 执行 HOOK
        const hookRun = HookManager.beforeResponse(request, response)
        response = hookRun ? hookRun : response
        // 代理请求发送到页面
        ViewDataManager.append(request, response)

        // HOOK 脚本要求修改响应，向上传递给 anyproxy
        if (hookRun)
            resolve({response: hookRun.toAnyproxyObj()})
        else
            resolve(null)
    })
}

/**
 * 域名解析异常、IO 异常、ssl 握手异常
 */
function* onConnectError(requestDetail, error) {
    return new Promise((resolve) => {
        console.debug(error)
        let request = requestDetail.requestOptions.cache
        const hookRun = HookManager.beforeResponse(request, cloneDeep(ERROR_RESPONSE))
        ViewDataManager.append(request, hookRun ? hookRun : ERROR_RESPONSE)
        if (hookRun)
            resolve(hookRun.toAnyproxyObj())
        else
            resolve(ERROR_RESPONSE.toAnyproxyObj())
    })
}

module.exports = {
    beforeSendRequest, beforeSendResponse, onConnectError, onError: onConnectError
}

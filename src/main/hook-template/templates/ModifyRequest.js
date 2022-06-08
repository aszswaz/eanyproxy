/**
 修改请求数据

 @author: aszswaz
 @date: 2022-02-26 17:54:26
 @IDE: WebStorm
 */
const {cloneDeep} = require("lodash")

/**
 * 修改请求数据
 */
function beforeRequest(request) {
    if (request.hostname === "localhost") {
        // 复制对象，防止多个 HOOK 同时运行产生的影响
        request = cloneDeep(request)
        if (request.contentType)
            request.headers["Content-Type"] = "text/html; charset=" + request.contentType.charset
        else
            request.headers["Content-Type"] = "text/html"

        // 修改请求参数
        if (request.query) request.query["demo"] = "Hello Word"

        // body 可以是 string、number、boolean、object，number和boolean 等同于文本，object 等同于 json
        request.body = {
            "message": "Hello World"
        }
        return request
    }
}

module.exports = {
    beforeRequest
}

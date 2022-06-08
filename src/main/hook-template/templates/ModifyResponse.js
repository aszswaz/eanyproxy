/**
 修改响应数据

 @author: aszswaz
 @date: 2022-02-26 17:54:26
 @IDE: WebStorm
 */

const {cloneDeep} = require("lodash");

/**
 * 修改响应数据
 */
function beforeResponse(request, response) {
    if (request.hostname === "localhost") {
        response = cloneDeep(response)
        if (response.contentType)
            response.headers["Content-Type"] = "text/html; charset=" + response.contentType.charset
        else
            response.headers["Content-Type"] = "text/html"

        // body 可以是 string、number、boolean、object，number和boolean 等同于文本，object 等同于 json
        response.body = {
            code: 404,
            message: "Not Found"
        }
        response.code = 404
        return response
    }
}

module.exports = {
    beforeResponse
}

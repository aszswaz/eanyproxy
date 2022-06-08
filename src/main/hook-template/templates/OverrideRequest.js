// noinspection JSUnusedGlobalSymbols

/**
 不发送请求，直接向客户端发送数据

 @author: aszswaz
 @date: 2022-02-26 17:54:26
 @IDE: WebStorm
 */

const {cloneDeep} = require("lodash");

/**
 * 不发送请求，直接向客户端发送数据
 */
function beforeRequest(request) {
    if (request.hostname === "localhost") {
        request = cloneDeep(request)
        request.response = {
            code: 200,
            header: {
                "Content-Type": "application/json"
            },
            body: {
                message: "Hello World"
            }
        }
        return request
    }
}

module.exports = {
    beforeRequest
}

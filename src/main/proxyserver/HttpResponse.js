/**
 HTTP 响应

 @author: aszswaz
 @date: 2022-05-12 09:43:14
 @IDE: WebStorm
 */
const ContentType = require("./ContentType")
const Utils = require("./Utils")
const enums = require("../config/enums");
const HttpStatus = require("../config/HttpStatus")

module.exports = class HttpResponse {
    code
    statusMessage
    headers
    // 程序内部通用的 header，header 全部小写，防止 Xxx-Xxx 和 xxx-xxx 的差异
    sHeaders
    contentType
    body
    rawBody

    static build(response) {
        let rawBody
        let contentType

        const newResponse = new HttpResponse()

        newResponse.code = response.response.statusCode
        newResponse.headers = response.response.header
        newResponse.sHeaders = Utils.standardHeaders(response.response.header)
        newResponse.contentType = contentType = ContentType.build(newResponse.sHeaders)
        newResponse.rawBody = rawBody = response.response.body
        newResponse.body = Utils.decodeBody(rawBody, contentType)
        newResponse.statusMessage = HttpStatus[newResponse.code]
        return newResponse
    }

    /**
     * 网关超时响应
     */
    static gatewayTimeout() {
        const response = new HttpResponse()
        response.code = 504
        response.statusMessage = HttpStatus[504]
        response.headers = {"Content-Type": "text/html"}
        response.body = "<h1 style='text-align: center'>Gateway Timeout</h1>"

        const htmlContentType = new ContentType()
        htmlContentType.name = "text/html"
        htmlContentType.dataType = enums.CONTENT_TYPE_HTML
        htmlContentType.charset = "utf-8"
        htmlContentType.text = true
        htmlContentType.suffix = "html"

        response.contentType = htmlContentType
        return response
    }

    /**
     * 生成符合 Anyproxy 要求的 response 对象
     */
    toAnyproxyObj() {
        return {
            statusCode: this.code,
            header: this.headers,
            body: Utils.encodeBody(this.body, this.contentType)
        }
    }
}
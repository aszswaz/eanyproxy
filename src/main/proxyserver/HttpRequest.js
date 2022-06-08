// noinspection JSCheckFunctionSignatures

/**
 HTTP 请求

 @author: aszswaz
 @date: 2022-05-11 18:41:49
 @IDE: WebStorm
 */

const ContentType = require("./ContentType")
const Utils = require("./Utils")
const {v4: uuid} = require("uuid")

module.exports = class HttpRequest {
    id
    // 协议
    protocol
    // http 协议版本
    httpVersion
    url
    hostname
    port
    path
    method
    headers
    // 程序内部通用的 header，header 全部小写，防止 Xxx-Xxx 和 xxx-xxx 的差异
    sHeaders
    // body 类型，从 headers 的 content-type 解析而来
    contentType
    body
    // 原始请求体，body 会被编码，而 rawBody 不会被编码
    rawBody
    // 请求参数
    query

    /**
     * 将 anyproxy 给的请求参数结构，转换为自己的结构
     */
    static build(aRequest) {
        let contentType
        let rawBody

        const httpRequest = new HttpRequest()
        const requestOptions = aRequest.requestOptions

        httpRequest.id = uuid()
        httpRequest.protocol = aRequest.protocol
        httpRequest.url = aRequest.url
        httpRequest.hostname = requestOptions.hostname
        httpRequest.port = requestOptions.port
        httpRequest.path = requestOptions.path
        httpRequest.method = requestOptions.method
        httpRequest.headers = requestOptions.headers
        httpRequest.sHeaders = Utils.standardHeaders(requestOptions.headers)
        httpRequest.httpVersion = aRequest._req.httpVersion
        httpRequest.contentType = contentType = ContentType.build(httpRequest.sHeaders)
        httpRequest.rawBody = rawBody = aRequest.requestData && aRequest.requestData.length ? aRequest.requestData : null
        httpRequest.body = Utils.decodeBody(rawBody, contentType)

        httpRequest.parseQuery()

        return httpRequest
    }

    /**
     * 处理请求参数或表单参数
     */
    parseQuery() {
        let index
        let queryStr

        if ((index = this.path.indexOf("?")) !== -1) {
            queryStr = this.path.substring(index + 1, this.path.length)
            this.path = this.path.substring(0, index)
        } else if (this.contentType && this.contentType.dataType === enums.CONTENT_TYPE_FORM_DATA) {
            queryStr = this.body
            this.body = null
        }
        if (queryStr) {
            const query = {}
            for (const item of queryStr.split("&")) {
                if ((index = item.indexOf("=")) !== -1) {
                    const key = decodeURI(item.substring(0, index))
                    query[key] = decodeURI(item.substring(index + 1, item.length))
                } else {
                    query[item] = null
                }
            }
            this.query = query
        }
    }

    /**
     * 生成符合 anyproxy 要求的对象
     */
    toAnyproxyObj() {
        const requestOptions = {}
        if (this.hostname) requestOptions.hostname = this.hostname
        if (this.port) requestOptions.port = this.port
        if (this.path) requestOptions.path = this.path
        if (this.method) requestOptions.method = this.method
        if (this.headers) requestOptions.headers = this.headers

        const anyproxyObj = {}
        if (Object.keys(requestOptions).length) anyproxyObj.requestOptions = requestOptions
        if (this.protocol) anyproxyObj.protocol = this.protocol
        if (this.body) {
            anyproxyObj.requestData = Utils.encodeBody(this.body, this.contentType)
        }
        this.encodeQuery(anyproxyObj)
        return anyproxyObj
    }

    /**
     * 将请求参数的 dict 转换为字符串
     */
    encodeQuery(obj) {
        // query 拼接到 path
        if (this.query && this.query.length) {
            let statements = []
            for (const key in this.query) {
                const value = this.query[key]
                statements.push(value ? `${encodeURI(key)}=${encodeURI(value)}` : `${encodeURI(key)}=`)
            }
            const queryStr = statements.join("&")
            if (this.contentType.dataType === enums.CONTENT_TYPE_FORM_DATA) {
                obj.requestData = queryStr
            } else {
                obj.requestOptions.path += `?${queryStr}`
            }
        }
    }
}
/**
 HTTP Content-Type

 @author: aszswaz
 @date: 2022-05-11 17:30:32
 @IDE: WebStorm
 */
const enums = require("../config/enums")

module.exports = class ContentType {
    static JSON = new ContentType("application/json", "json", enums.CONTENT_TYPE_JSON, true, "utf-8")
    static BIN = new ContentType("application/octet-stream", "json", enums.CONTENT_TYPE_BIN, false, null)
    static TEXT = new ContentType("text/plain", "txt", enums.CONTENT_TYPE_TEXT, false, "utf-8")

    // mime type
    name
    // 文件后缀
    suffix
    // 数据类型
    dataType
    // 是文本
    text
    // 文本字符集
    charset

    constructor(name, suffix, dataType, text, charset) {
        this.name = name
        this.suffix = suffix
        this.dataType = dataType
        this.text = text
        this.charset = charset
    }

    /**
     * 从 headers 中提取 Content-Type 信息
     *
     * @return {null|ContentType}
     */
    static build(headers) {
        const contentType = new ContentType()
        contentType.#parse(headers)
        if (!contentType.name) return null
        contentType.#mimeMatch()
        return contentType
    }

    /**
     * 从 headers 中提取 header
     */
    #parse(headers) {
        const contentType = headers["content-type"]
        if (contentType) {
            // 解析 Content-Type，提取 mime 和 charset
            const entries = contentType.split(";")
            this.name = entries[0]
            const map = {}
            for (let i = 1; i < entries.length; i++) {
                const entries02 = entries[i].trim().split("=")
                let value = entries02[1]
                if (value) value = value.trim()
                // charset="UTF-8" 也是 HTTP 协议所允许的格式
                if (value && value.length && /".*"/.test(value)) {
                    value = value.substring(1, value.length - 1)
                }
                map[entries02[0]] = value
            }
            this.charset = map["charset"]
            if (this.charset === "utf-8" || this.charset === "utf8" || this.charset === "UTF8") {
                this.charset = "UTF-8"
            }
        } else {
            // 没有声明 content-type，尝试检查有没有 body
            let contentLength = headers["content-length"]
            contentLength = contentLength ? parseInt(contentLength) : 0
            let transferEncoding = headers["transfer-encoding"]
            transferEncoding = transferEncoding ? transferEncoding : ""
            // 有 body，则设置 mime 为位置的 二进制
            if (contentLength > 0 && transferEncoding.includes("chunked")) {
                this.name = "application/octet-stream"
            }
        }
    }

    /**
     * 匹配 mime 对因的数据类型
     */
    #mimeMatch() {
        switch (this.name) {
            case "text/json":
            case "application/json":
                this.dataType = enums.CONTENT_TYPE_JSON
                this.suffix = "json"
                this.text = true
                break
            case "application/javascript":
            case "application/ecmascript":
            case "application/x-ecmascript":
            case "application/x-javascript":
            case "text/javascript":
            case "text/ecmascript":
            case "text/javascript1.0":
            case "text/javascript1.1":
            case "text/javascript1.2":
            case "text/javascript1.3":
            case "text/javascript1.4":
            case "text/javascript1.5":
            case "text/jscript":
            case "text/livescript":
            case "text/x-ecmascript":
            case "text/x-javascript":
                this.dataType = enums.CONTENT_TYPE_JAVASCRIPT
                this.suffix = "js"
                this.text = true
                break
            case "text/html":
                this.dataType = enums.CONTENT_TYPE_HTML
                this.suffix = "html"
                this.text = true
                break
            case "text/xml":
            case "application/xml":
                this.dataType = enums.CONTENT_TYPE_XML
                this.suffix = "xml"
                this.text = true
                break
            case "text/css":
                this.dataType = enums.CONTENT_TYPE_CSS
                this.suffix = "css"
                this.text = true
                break
            case "application/x-www-form-urlencoded":
                this.dataType = enums.CONTENT_TYPE_FORM_DATA
                this.suffix = "txt"
                this.text = true
                break
            case "text/plain":
                this.dataType = enums.CONTENT_TYPE_TEXT
                this.suffix = "txt"
                this.text = true
                break
            default:
                // 其他 mime
                this.dataType = enums.CONTENT_TYPE_BIN
                this.suffix = "bin"
                this.text = false
                break
        }
        if (!this.charset) {
            // 根据现在的 W3C 规范，文本数据的默认字符集为 UTF-8
            this.charset = this.text ? "utf-8" : null
        }
    }

    /**
     * 转换为 Header
     *
     * @return {string|*}
     */
    toHeader() {
        const charset = this.charset
        if (!charset || charset === "UTF-8" || charset === "UTF8" || charset === "utf-8" || charset === "utf8") {
            return this.name
        } else {
            return `${this.name}; charset=${charset}`
        }
    }
}
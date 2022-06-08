/**
 枚举定义

 @author: aszswaz
 @date: 2022-03-29 16:37:33
 @IDE: WebStorm
 */

/**
 * 请求体和响应体数据中的数据类型
 */
let code = 0

module.exports = {
    // json
    CONTENT_TYPE_JSON: code++,
    // js
    CONTENT_TYPE_JAVASCRIPT: code++,
    // css
    CONTENT_TYPE_CSS: code++,
    // html
    CONTENT_TYPE_HTML: code++,
    // xml
    CONTENT_TYPE_XML: code++,
    // text
    CONTENT_TYPE_TEXT: code++,
    // application/x-www-form-urlencoded
    CONTENT_TYPE_FORM_DATA: code++,
    // bin
    CONTENT_TYPE_BIN: code++
}
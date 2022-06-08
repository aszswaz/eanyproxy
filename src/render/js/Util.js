// noinspection SpellCheckingInspection,JSUnresolvedFunction

/**
 工具

 @author: aszswaz
 @date: 2022-02-26 16:15:37
 @IDE: WebStorm
 */

import hljs from "highlight.js"
import beautify from "js-beautify"

/**
 * 查找文本中的第一个非空格、\r、\n、\t 字符
 */
function firstValidChar(text, from) {
    if (typeof text !== "string") throw new Error("The type of the parameter text must be string.")
    if (typeof from === 'undefined' || from == null) from = 0

    for (let i = from; i < text.length; i++) {
        let c = text[i]
        if (c !== ' ' && c !== '\r' && c !== '\n' && c !== '\t') {
            return i
        }
    }
}

/**
 * 从代码中提取描述信息：
 * 忽略的换行和空格，如果代码的开头是 JS 代码注释，就把注释内容作为描述信息，否则，截取部分代码作为描述信息
 */
export function describe(code) {
    const maxLenght = 1000
    let sindex

    if (typeof code !== "string") return ''
    if (code.length === 0) return ''

    // 代码只有一行
    let firstLine = code.indexOf('\n')
    if (firstLine === -1) return code.length >= maxLenght ? code.substring(0, maxLenght) + "......" : code

    // 获取第一个有效字符位置
    sindex = firstValidChar(code)

    // 跳过 WebStorm 或 IDEA 在文件开头插入的 // noinspection JSxxxxxx 这种注释
    if (code.substring(0, firstLine).startsWith("// noinspection JS")) sindex = firstValidChar(code, firstLine + 1)

    let resultComment = ''
    if (sindex !== -1) {
        let statement = code.substring(sindex, sindex + 2)

        if (statement === '/*') {
            // 获取多行注释或者文档注释作为提示信息
            let rawComment = code.substring(sindex + 2, code.indexOf('*/', sindex))
            const rows = rawComment.split('\n')
            const newRows = []
            for (let i = 0; i < rows.length; i++) {
                let item = rows[i]
                for (let j = 0; j < item.length; j++) {
                    let c = item[j]
                    if (c !== '*' && c !== ' ') {
                        newRows.push(item.substring(j, item.length))
                        break
                    }
                }
            }
            resultComment = newRows.join('\n')
        } else if (statement === '//') {
            // 获取行注释作为提示信息
            resultComment = code.substring(sindex + 2, code.indexOf('\n')).trim()
        } else {
            // 开头不是任何代码注释，截取部分代码作为提示信息
            if (code.length - sindex > maxLenght)
                resultComment = code.substring(sindex, sindex + maxLenght) + '\n......'
            else
                resultComment = code.substring(sindex, code.length)
        }
    }
    return resultComment
}

/**
 * 不同的 HTTP 状态码显示不同颜色
 */
export function codeColor(code) {
    let color
    if (code < 200)
        color = "gray"
    else if (code < 300)
        color = "green"
    else if (code < 400)
        color = "orange"
    else
        color = "red"
    return color
}

/**
 * 美化 json、xml、css 等响应体
 */
export function formatBody(contentType, body) {
    try {
        if (!body || body.length === 0) return null
        let copeBody = body;
        // 格式化配置
        const formatConfig = {indent_size: 4, space_in_empty_paren: true}

        if (contentType.text && body.length < config.maxTextLength) {
            let newCode
            switch (contentType.dataType) {
                case enums.CONTENT_TYPE_JAVASCRIPT:
                    // 格式化 js
                    copeBody = beautify.js(copeBody, formatConfig)
                    newCode = hljs.highlight(copeBody, {language: "javascript"}).value
                    break
                case enums.CONTENT_TYPE_CSS:
                    // 格式化 css
                    copeBody = beautify.css(copeBody, formatConfig)
                    newCode = hljs.highlight(body, {language: "css"}).value
                    break
                case enums.CONTENT_TYPE_XML:
                    copeBody = beautify.xml(copeBody, formatConfig)
                    newCode = hljs.highlight(copeBody, {language: "xml"}).value
                    break
                case enums.CONTENT_TYPE_HTML:
                    copeBody = beautify.html(copeBody, formatConfig)
                    newCode = hljs.highlight(copeBody, {language: "html"}).value
                    break
                default:
                    newCode = copeBody
            }
            return newCode
        } else {
            return "<h3 style='text-align: center;'>数据无法展示，请导出到文件，使用其他工具查看</h3>"
        }
    } catch (e) {
        return body;
    }
}

/**
 * 将请求的 body 缓存文件，另存到用户指定路径
 */
export function saveAs(name, contentType, body) {
    if (body) {
        const blob = new Blob([body], {})
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = name + "." + (contentType ? contentType.suffix : "")
        a.click()
        URL.revokeObjectURL(url)
    }
}

/**
 * 字节长度格式化
 */
export function byteLenFormat(len) {
    if (!len) return "大小：0 B"
    if (len < 1000)
        return `大小：${len} B`
    if (len < 1000000)
        return `大小 ${len / 1000} KB`
    if (len < 1000000000)
        return `大小：${len / 1000 / 1000} MB`
    else
        return `大小：${len / 1000 / 1000 / 1000} GB`
}

/**
 * 将只触发一次的事件，封装为异步函数
 *
 * @param eventObj 事件挂载对象，比如 DOM 对象
 * @param eventType 事件类型
 */
export function eventAsync(eventObj, eventType) {
    return new Promise((resolve) => {
        eventObj.addEventListener(eventType, e => resolve(e.detail), {once: true})
    })
}
// noinspection JSCheckFunctionSignatures,JSUnresolvedFunction

/**
 工具

 @author: aszswaz
 @date: 2022-05-11 18:56:11
 @IDE: WebStorm
 */
const Iconv = require("iconv-lite")
const enums = require("../config/enums")
const Store = require("../store")
const path = require("path")
const {app, dialog} = require("electron")

/**
 * 转换为程序内通用的 header，防止 xxx-xxx 和 Xxx-Xxx 的差异
 */
function standardHeaders(headers) {
    if (!headers) return null
    const newHeaders = {}
    for (const key in headers) {
        newHeaders[key.toLowerCase()] = headers[key]
    }
    return newHeaders
}

/**
 * 对 HTTP body 进行解码
 */
function decodeBody(body, contentType) {
    try {
        if (!body || !contentType) return null
        if (!contentType.text) return null
        if (!body.length) return null

        if (Iconv.encodingExists(contentType.charset)) {
            body = Iconv.decode(body, contentType.charset)
        } else {
            console.warn("未知字符集：", contentType.charset)
            body = Buffer.from(body).toString()
        }
        return body
    } catch (e) {
        console.warn("body:", body, "; contentType:", contentType, "; error:", e)
        return body
    }
}

/**
 * 编码 body
 */
function encodeBody(body, contentType) {
    if (typeof body !== "string") return body
    if (!contentType || !contentType.text) return body
    if (!body.length) return Buffer.alloc(0)

    // 表单编码
    if (contentType.dataType === enums.CONTENT_TYPE_FORM_DATA) {
        body = encodeBody(body)
    }

    const charset = contentType.charset
    if (charset === "UTF-8") {
        return Buffer.from(body)
    }
    if (Iconv.encodingExists(contentType.charset)) {
        return Iconv.encode(body, contentType.charset)
    } else {
        console.warn("不支持的字符集：" + charset)
        return Buffer.from(body)
    }
}

/**
 * 保存文件对话框
 */
async function saveDialog(args) {
    let lastPath = Store.get("historyRecord.lastSaveDialogPath")
    if (!lastPath || !lastPath.length)
        lastPath = path.join(app.getPath("home"), args.filename)
    else
        lastPath = path.join(lastPath, args.filename)

    const dialogResult = await dialog.showSaveDialog(global.MAIN_WIN, {
        title: args.title,
        defaultPath: lastPath,
        filters: args.filters
    })
    if (dialogResult.canceled) return null
    Store.set("historyRecord.lastSaveDialogPath", path.dirname(dialogResult.filePath))
    return dialogResult.filePath
}

/**
 * 打开文件对话框
 */
async function openDialog(filters) {
    let lastPath = Store.get("historyRecord.lastOpenDialogPath")
    if (!lastPath || !lastPath.length) lastPath = app.getPath("home")
    const dialogResult = await dialog.showOpenDialog(global.MAIN_WIN, {
        title: "请选择",
        defaultPath: lastPath,
        filters,
        properties: ["openFile"]
    })
    if (dialogResult.canceled) return null
    Store.set("historyRecord.lastOpenDialogPath", path.dirname(dialogResult.filePaths[0]))
    return dialogResult.filePaths[0]
}

module.exports = {
    standardHeaders,
    decodeBody,
    encodeBody,
    saveDialog,
    openDialog
}
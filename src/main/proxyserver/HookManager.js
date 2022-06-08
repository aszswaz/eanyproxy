// noinspection JSUnresolvedFunction,JSCheckFunctionSignatures

/**
 HOOK 脚本

 @author: aszswaz
 @date: 2022-05-12 12:42:35
 @IDE: WebStorm
 */
const path = require("path")
const fs = require("fs/promises")
const {createWriteStream, createReadStream} = require("fs")
const HttpRequest = require("./HttpRequest")
const HttpResponse = require("./HttpResponse")
const Utils = require("./Utils")
const ContentType = require("./ContentType")
const enums = require("../config/enums")
const HttpStatus = require("../config/HttpStatus")
const {v4: uuid} = require("uuid")
const config = require("../config")
const archiver = require("archiver")
const unzip = require("unzipper")
const Store = require("../store")

const dialogZipFilter = [
    {
        name: "zip",
        extensions: ["zip"]
    }
]

module.exports = class HookManager {
    static #CONTAINER = {}

    // HOOK id
    id
    // HOOK 模块
    hookModule

    /**
     * 运行 HOOK 脚本
     */
    static async start(_, hook) {
        const m = new module.constructor()
        m.paths = module.paths
        m._compile(hook.code, hook.file)

        const hookManager = new HookManager()
        hookManager.id = hook.id
        hookManager.hookModule = m.exports

        HookManager.#CONTAINER[hook.id] = hookManager
    }

    /**
     * 发送请求之前
     */
    static beforeRequest(request) {
        try {
            let result = null
            for (const key in this.#CONTAINER) {
                result = this.#CONTAINER[key].beforeRequest(request)
            }
            return this.#toHttpReqObj(result, request)
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * 发送响应之前
     */
    static beforeResponse(request, response) {
        try {
            let result = null
            for (const key in this.#CONTAINER) {
                result = this.#CONTAINER[key].beforeResponse(request, response)
            }
            return this.#toHttpResObj(result)
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * 停止模块
     */
    static stop(_, hookId) {
        const hook = HookManager.#CONTAINER[hookId]
        if (hook) {
            hook.finish()
            delete HookManager.#CONTAINER[hookId]
        }
    }

    /**
     * 获取当前正在运行的 HOOK
     */
    static getHooks() {
        const hookIds = []
        for (let item in HookManager.#CONTAINER) {
            hookIds.push(item)
        }
        return hookIds
    }

    /**
     * HOOK 脚本 beforeRequest 函数 的返回对象解析
     */
    static #toHttpReqObj(hookResult, olderRequest) {
        if (!hookResult) return null
        const request = new HttpRequest()
        request.id = uuid()
        request.protocol = hookResult.protocol
        request.httpVersion = olderRequest.httpVersion
        request.hostname = hookResult.hostname
        request.port = hookResult.port
        request.path = hookResult.path
        request.method = hookResult.method
        request.query = hookResult.query
        request.headers = hookResult.headers
        request.sHeaders = Utils.standardHeaders(hookResult.headers)
        request.body = hookResult.body

        request.parseQuery()
        this.#handlerCT(request)
        this.#handlerBody(request)

        return {request, response: this.#toHttpResObj(hookResult.response)}
    }

    /**
     * HOOK 的 beforeResponse 函数返回值解析
     * @param hookResult
     */
    static #toHttpResObj(hookResult) {
        if (!hookResult) return null

        const response = new HttpResponse()
        response.code = hookResult.code
        if (hookResult.code) response.statusMessage = HttpStatus[hookResult.code]
        response.headers = hookResult.headers
        response.sHeaders = Utils.standardHeaders(hookResult.headers)
        response.body = hookResult.body

        this.#handlerCT(response)
        this.#handlerBody(response)

        return response
    }

    /**
     * 将 headers 中的 Content-Type 应用到 ContentType
     */
    static #handlerCT(httpObj) {
        if (httpObj.sHeaders) {
            if (httpObj.sHeaders["content-type"]) {
                httpObj.contentType = ContentType.build(httpObj.sHeaders)
            }
        }
    }

    /**
     * 处理 HTTP body，如果没有设置 contentType，根据 HTTP body 的类型设置 Content-Type
     */
    static #handlerBody(httpObj) {
        let body = httpObj.body
        if (!body) return null

        let contentType = httpObj.contentType

        // // 根据 body 类型处理数据，nodejs 的 Buffer 和 ArrayBuffer 继承 Unit8Array
        if (body instanceof Uint8Array) {
            if (!contentType) {
                contentType = ContentType.BIN
            }
        } else {
            switch (typeof body) {
                case "undefined":
                    break
                case "string":
                    if (!contentType) contentType = ContentType.TEXT
                    break
                case "number":
                case "boolean":
                    if (!contentType) contentType = ContentType.TEXT
                    httpObj.body = body.valueOf()
                    break
                case "object":
                    if (contentType) {
                        contentType.name = "application/json"
                        contentType.suffix = "json"
                        contentType.text = true
                        if (!contentType.charset) contentType.charset = "utf-8"
                        contentType.dataType = enums.CONTENT_TYPE_JSON
                    } else {
                        contentType = ContentType.JSON
                    }
                    httpObj.body = JSON.stringify(body)
                    break
                default:
                    console.error("不支持的 body 类型:", typeof body)
                    break
            }
        }
        httpObj.contentType = contentType

        // 更新 header 中的 Content-Type
        if (contentType) {
            if (!httpObj.sHeaders) {
                httpObj.headers = {"Content-Type": contentType.toHeader()}
            } else {
                httpObj.headers["Content-Type"] = contentType.toHeader()
            }
        }
    }

    /**
     * 导出 HOOK 脚本到 zip 文件
     */
    static async exportHook(_, hooksInfo) {
        // 获取用户指定的导出路径
        let zipFilePath = await Utils.saveDialog({
            title: "请选择导出路径",
            filename: "hooks.zip",
            filters: dialogZipFilter
        })
        if (!zipFilePath) return null
        zipFilePath = zipFilePath.endsWith(".zip") ? zipFilePath : zipFilePath + ".zip"

        // 获取脚本信息
        let hookInfos = Store.get("hooks")
        const exportObjs = []
        hookInfos = hookInfos.filter(item01 => {
            for (let item02 of hooksInfo) {
                if (item01.id === item02.id) {
                    exportObjs.push({
                        id: item01.id,
                        name: item01.name,
                        createTime: item01.createTime,
                        modifyTime: item01.modifyTime,
                        md5: item01.md5
                    })
                    return true
                }
            }
        })

        // 创建压缩包
        const archive = archiver("zip", {
            zlib: {level: 6}
        })
        archive.on("error", console.error)
        const output = createWriteStream(zipFilePath)
        archive.pipe(output)
        for (const item of hookInfos) {
            archive.file(item.file, {name: `${item.id}.js`})
        }
        archive.append(JSON.stringify(exportObjs), {name: "hooks.json"})
        await archive.finalize()
    }

    /**
     * 读取包含脚本的压缩包
     */
    static async importHook() {
        // 创建缓存文件夹，mkdtemp 会自动给传入路径添加随机字符串，并返回创建的文件夹路径
        const cacheDir = await fs.mkdtemp(path.join(config.cache, "import-hooks-"))
        // 让用户选择脚本压缩包
        const zipFilePath = await Utils.openDialog(dialogZipFilter)
        if (!zipFilePath) return null
        // 解压压缩包到缓存
        await createReadStream(zipFilePath).pipe(unzip.Extract({path: cacheDir})).promise()

        // 读取脚本信息和代码
        const iScripts = JSON.parse(await fs.readFile(path.join(cacheDir, "hooks.json"), {encoding: "utf-8"}))
        for (let item of iScripts) {
            item.code = await fs.readFile(path.join(cacheDir, `${item.id}.js`), {encoding: "utf-8"})
        }
        fs.rm(cacheDir, {recursive: true}).catch(console.error)

        return iScripts
    }

    /**
     * 发送请求之前
     */
    beforeRequest(request) {
        try {
            if (typeof this.hookModule.beforeRequest === "function") {
                return this.hookModule.beforeRequest(request)
            }
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * 发送响应之前
     */
    beforeResponse(request, response) {
        try {
            if (typeof this.hookModule.beforeResponse === "function") {
                return this.hookModule.beforeResponse(request, response)
            }
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * 停止脚本
     */
    finish() {
        try {
            if (typeof this.hookModule.finish === "function") {
                return this.hookModule.finish()
            }
        } catch (e) {
            console.error(e)
        }
    }
}
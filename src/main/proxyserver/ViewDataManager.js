/**
 页面展示的数据管理器

 @author: aszswaz
 @date: 2022-05-13 10:52:53
 @IDE: WebStorm
 */
const ipc = require("../config/IPCCommands")

module.exports = class ViewDataManager {
    static #DATA_CACHE = []
    static #timerTask

    /**
     * 开始定时将数据推送到渲染进程
     */
    static start() {
        this.#timerTask = setInterval(this.#sendData, 2000)
    }

    /**
     * 停止数据推送
     */
    static stop() {
        clearInterval(this.#timerTask)
    }

    /**
     * 添加数据
     */
    static append(request, response) {
        this.#DATA_CACHE.push({id: request.id, request, response})
    }

    /**
     * 发送数据到渲染进程
     */
    static #sendData() {
        if (!ViewDataManager.#DATA_CACHE.length) return
        if (global.MAIN_WEB_CONTENTS) {
            global.MAIN_WEB_CONTENTS.send(ipc.proxyServer.DATA, [...ViewDataManager.#DATA_CACHE])
            ViewDataManager.#DATA_CACHE = []
        }
    }
}
/**
 要展示到页面的数据管理

 @author: aszswaz
 @date: 2022-05-13 11:55:27
 @IDE: WebStorm
 */
import * as EventEnum from "./EventEnum"

const {ipcRenderer} = require("electron")

export default class ViewDataManager {
    // 数据容器
    static #DATA_CACHE = []

    static init() {
        ipcRenderer.on(ipc.proxyServer.DATA, this.#acceptData)
    }

    /**
     * 添加数据
     */
    static #acceptData(_, viewData) {
        t1: for (const item01 of viewData) {
            // 根据 ID 对应上下文
            for (const item02 of ViewDataManager.#DATA_CACHE) {
                if (item01.id === item02.id) {
                    item02.request = item01.request
                    item02.response = item01.response
                    continue t1
                }
            }
            // 有新的数据
            ViewDataManager.#DATA_CACHE.push(item01)
        }
        document.dispatchEvent(new CustomEvent(EventEnum.NEW_DATA))
    }

    /**
     * 主动从缓存中获取数据
     */
    static getData() {
        return this.#DATA_CACHE
    }

    /**
     * 清空缓存
     */
    static clearData() {
        this.#DATA_CACHE = []
    }
}
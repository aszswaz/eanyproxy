// noinspection NpmUsedModulesInstalled

/**
 初始化渲染进程

 @author: aszswaz
 @date: 2022-05-07 15:20:59
 @IDE: WebStorm
 */

import logger from "./js/logger"
import ViewDataManager from "./js/ViewDataManager"

export default async function () {
    await loaderCss()
    await logger()
    await keydown()
    ViewDataManager.init()
    await vueTool()
}

/**
 * 加载 CSS
 */
async function loaderCss() {
    await import("vue-json-viewer/style.css")
    await import('./css/JsonViewerStyle.less')
    await import("highlight.js/styles/vs.css")
    await import("element-plus/dist/index.css")
    await import("./css/base.less")
    await import("./css/ElementPlus.less")
}

/**
 * 连接到 vue 调试工具
 */
async function vueTool() {
    if (!config.development) return
    const s = document.createElement("script")
    s.src = "http://localhost:8098"
    document.body.appendChild(s)
}

/**
 * 在生产环境下，禁用一些快捷键
 */
async function keydown() {
    // 生产环境下禁用 Ctrl + R 刷新页面
    window.onkeydown = (e) => {
        if (e.ctrlKey && e.key === "r") {
            return config.development
        }
        return true
    }
}
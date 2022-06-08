/**
 程序的控制台，用于显示程序的所有输出。主要目的是为了让用户可以调试自己的 HOOK 脚本

 @author: aszswaz
 @date: 2022-02-24 16:20:24
 @IDE: WebStorm
 */

import {ipcRenderer} from "electron"

const strWindowFeatures = `
    resizable=yes,
    scrollbars=yes,
    height=250px,
    width=1000px
`

/**
 * 打开控制台窗口
 */
async function openConsole() {
    const terminal = window.open('', '', strWindowFeatures)
    const document = terminal.document
    const body = document.createElement("div")

    const style = body.style
    style.whiteSpace = "pre"
    style.backgroundColor = "white"
    style.width = "100%"
    style.height = "100%"

    // 从主进程接收日志
    const lambada = (_, args) => {
        const span = document.createElement("span")
        span.innerHTML = args
        body.appendChild(span)
    }
    ipcRenderer.on(ipc.logger.LOGGER, lambada)
    // 串口关闭，删除监听器
    terminal.onunload = () => ipcRenderer.removeListener(ipc.logger.LOGGER, lambada)

    document.body.appendChild(body)
}

export {
    openConsole
}
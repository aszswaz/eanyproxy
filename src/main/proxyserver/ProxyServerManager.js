// noinspection JSUnusedLocalSymbols,JSUnresolvedFunction

/**
 * 代理服务器管理主进程端
 */
const AnyProxy = require("anyproxy")
const ProxyRequestHandler = require("./ProxyRequestHandler")
const ipc = require("../config/IPCCommands")
const ViewDataManager = require("./ViewDataManager")
const config = require("../config")
const {store: magVStore} = require("../config/MagicalValue")
const Store = require("../store")

const ipcResponse = ipc.response

let proxyServer

/**
 * 开启代理服务器
 *
 * @see https://anyproxy.io/cn/#%E4%BD%9C%E4%B8%BAnpm%E6%A8%A1%E5%9D%97%E4%BD%BF%E7%94%A8
 */
function startProxy() {
    const options = Store.get("anyproxySettings")
    console.info(`Start running the proxy server, listening on port number: ${options.port}.`)
    // 不打印请求日志
    options.silent = !config.development
    options.rule = ProxyRequestHandler
    // 通过 Promise，把 anyproxy 的异步事件机制转为同步机制，收到来自 anyproxy 的 ready 或 error 事件后，函数才可以返回
    return new Promise((resolve, _) => {
        proxyServer = new AnyProxy.ProxyServer(options)
        // 服务器准备就绪
        proxyServer.on("ready", () => {
            console.info("The proxy server runs successfully.")
            // 通过 resolve 设置返回值
            resolve(ipcResponse.toSuccess())
            ViewDataManager.start()
        })
        // 服务器启动失败
        proxyServer.on("error", (e) => {
            console.error(e)
            resolve(ipcResponse.toUnknownError())
        })
        // 启动服务器
        proxyServer.start()
    })
}

/**
 * 停止服务器
 */
function stopProxy() {
    if (!proxyServer) {
        console.warn("The server is not started.")
        return
    }
    proxyServer.close()
    proxyServer = null
    ViewDataManager.stop()
    return ipcResponse.toSuccess();
}

function proxyStatus() {
    return proxyServer ? proxyServer.status === "READY" : false
}

module.exports = {
    startProxy, stopProxy, proxyStatus
}

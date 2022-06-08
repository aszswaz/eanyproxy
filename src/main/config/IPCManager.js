/**
 主进程中，全部的 IPC 调用管理

 @author: aszswaz
 @date: 2022-02-21 11:24:21
 @IDE: WebStorm
 */

const {ipcMain} = require("electron")
const ipc = require("./IPCCommands")
const {startProxy, stopProxy, proxyStatus} = require("../proxyserver/ProxyServerManager")
const logger = require("../logger")
const {getAll, deleteTemplate, saveTemplate} = require("../hook-template")
const {genCrtAndOpen} = require("../utils")
const HookManager = require("../proxyserver/HookManager")
const config = require("./index")

module.exports = async function () {
    /**
     * 监听 IPC 命令
     */
    const proxyServer = ipc.proxyServer

    ipcMain.handle(ipc.CONFIG, () => config)

    // HTTP 代理
    ipcMain.handle(proxyServer.START, startProxy)
    ipcMain.handle(proxyServer.STOP, stopProxy)
    ipcMain.handle(proxyServer.STATUS, proxyStatus)

    // log
    ipcMain.on(ipc.logger.LOGGER, logger.ipcLogger)

    // hook
    ipcMain.handle(ipc.hook.RUN, HookManager.start)
    ipcMain.handle(ipc.hook.STOP, HookManager.stop)
    ipcMain.handle(ipc.hook.CURRENT_RUN, HookManager.getHooks)
    ipcMain.handle(ipc.hook.EXPORT, HookManager.exportHook)
    ipcMain.handle(ipc.hook.IMPORT, HookManager.importHook)

    // 模板管理
    ipcMain.handle(ipc.template.GET_ALL, getAll)
    ipcMain.handle(ipc.template.DELETE, deleteTemplate)
    ipcMain.handle(ipc.template.SAVE, saveTemplate)

    // 证书
    ipcMain.handle(ipc.certificate.EXPORT, genCrtAndOpen)
}
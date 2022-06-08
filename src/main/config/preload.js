/**
 * 通过 electron 的 preload 功能，给渲染进程加载配置
 *
 * @author aszswaz
 */

const utils = require("../utils")
const {ipcRenderer} = require("electron")
const ipc = require("./IPCCommands")

try {
    // 加载程序的全局参数
    ipcRenderer.invoke(ipc.CONFIG).then((config) => global.config = config).catch(console.error)
    // 本机 IP 地址
    global.IPV4_ADDRESS = utils.getIpv4()
    // 加载 ipc 指令
    global.ipc = ipc
    // 加载枚举
    global.enums = require("./enums")
    // 加载魔法值
    global.MagicalValue = require("./MagicalValue")
    // 加载存储库
    global.STORE = require("../store/RenderStore")
} catch (e) {
    console.error(e)
}

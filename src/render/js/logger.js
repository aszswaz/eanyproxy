/**
 * 对渲染进程的 LOG 进行处理
 */

const {ipcRenderer} = require("electron")
const {DateTimeFormatter, LocalDateTime} = require("@js-joda/core");

const print = console.log

export default async function () {
    if (config.development) {
        // 输出 log 到控制台
        console.debug = function (...args) {
            let date = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").format(LocalDateTime.now())
            print(`${date} %cDEBUG%c:`, "color: blue", "color: none", ...args)
        }
        console.info = function (...args) {
            let date = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").format(LocalDateTime.now())
            print(`${date} %cINFO%c:`, "color: green", "color: none", ...args)
        }
        console.warn = function (...args) {
            let date = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").format(LocalDateTime.now())
            print(`${date} %cWARN%c:`, "color: yellow", "color: none", ...args)
        }
        console.error = function (...args) {
            let date = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").format(LocalDateTime.now())
            print(`${date} %cERROR%c:`, "color: red", "color: none", ...args)
        }
        console.log = console.info
        console.trace = console.error
    } else {
        // 输出 log 到文件
        console.debug = function (...args) {
            ipcRenderer.send(global.ipc.logger.LOGGER, {level: "DEBUG", "body": args})
        }
        console.info = function (...args) {
            ipcRenderer.send(global.ipc.logger.LOGGER, {level: "INFO", "body": args})
        }
        console.warn = function (...args) {
            ipcRenderer.send(global.ipc.logger.LOGGER, {level: "WARN", "body": args})
        }
        console.error = function (...args) {
            ipcRenderer.send(global.ipc.logger.LOGGER, {level: "ERROR", "body": args})
        }
        console.log = console.info
        console.trace = console.error
    }
}

/**
 * 初始化 log
 *
 * @author aszswaz
 */

const {printErr} = require("./util")
const IPCLogger = require("./IPCLogger")
const config = require("../config")
const {CONSOLE_LOGGER} = require("./Constant")

const HANDLERS = []
let needInit = true

async function init() {
    if (needInit) {
        if (config.development) {
            HANDLERS.push(require("./ConsoleLogger"))
        } else {
            const FileLogger = require("./FileLogger")
            await FileLogger.init()
            HANDLERS.push(FileLogger)
        }
        HANDLERS.push(IPCLogger)
    } else {
        needInit = false
    }

    /**
     * 覆盖 console 除了 log 之外的全部函数，也就是处理整个进程的日志
     */
    console.debug = (...args) => handlerLogger("DEBUG", args)
    console.info = (...args) => handlerLogger("INFO", args)
    console.warn = (...args) => handlerLogger("WARN", args)
    console.error = (...args) => handlerLogger("ERROR", args)
    console.log = console.info
    console.trace = console.error
}

/**
 * 关闭日志处理器
 */
async function close() {
    console.debug = CONSOLE_LOGGER
    console.info = CONSOLE_LOGGER
    console.warn = CONSOLE_LOGGER
    console.error = CONSOLE_LOGGER
    console.log = CONSOLE_LOGGER
    console.trace = CONSOLE_LOGGER

    for (let item of HANDLERS) {
        try {
            if (typeof item.close === "function") item.close()
        } catch (e) {
            printErr(e)
        }
    }
}

/**
 * 处理日志
 */
function handlerLogger(level, args) {
    for (let item of HANDLERS) {
        item.handler(level, args).catch(printErr)
    }
}

/**
 * 处理渲染进程发送过来的 Log
 */
async function ipcLogger(_, args) {
    handlerLogger(args.level, args.body)
}

module.exports = {init, close, ipcLogger, printErr}
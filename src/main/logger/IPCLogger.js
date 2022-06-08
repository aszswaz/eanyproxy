// noinspection JSUnusedLocalSymbols

/**
 把日志通过 IPC 转发到 renderer，主要目的是让用户可以看到 HOOK 脚本中，console 的输出

 @author: aszswaz
 @date: 2022-02-24 09:33:37
 @IDE: WebStorm
 */

const {DateTimeFormatter, LocalDateTime} = require("@js-joda/core")
const ipc = require("../config/IPCCommands")
const {printErr} = require("./util")
const Util = require("util")

/**
 * 向渲染进程发送日志
 */
async function handler(level, args) {
    if (!global.MAIN_WEB_CONTENTS) return

    const dateStr = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").format(LocalDateTime.now())

    let levelSpan
    switch (level) {
        case "DEBUG":
            levelSpan = "<span style='color: blue'>DEBUG</span>"
            break
        case "INFO":
            levelSpan = "<span style='color: green'>INFO</span>"
            break
        case "WARN":
            levelSpan = "<span style='color: yellow'>WARN</span>"
            break
        case "ERROR":
            levelSpan = "<span style='color: red'>ERROR</span>"
            break
        default:
            printErr("Unknown log level:", level)
            break
    }
    const message = `${dateStr} ${levelSpan} ${Util.format(...args)}<br>`
    if (global.MAIN_WEB_CONTENTS) global.MAIN_WEB_CONTENTS.send(ipc.logger.LOGGER, message)
}

module.exports = {
    handler
}
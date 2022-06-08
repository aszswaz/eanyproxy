/**
 日志工具

 @author: aszswaz
 @date: 2022-05-07 17:41:41
 @IDE: WebStorm
 */

const {CONSOLE_LOGGER, TIME_FORMAT} = require("./Constant")
const {DateTimeFormatter} = require("@js-joda/core");

/**
 * 打印日志到错误输出流
 */
function printErr(...args) {
    CONSOLE_LOGGER(DateTimeFormatter.ofPattern(TIME_FORMAT), "\033[91mERROR\033[0m", ...args)
}

module.exports = {
    printErr
}
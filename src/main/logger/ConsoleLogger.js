// noinspection DuplicatedCode

/**
 * 日志输出到控制台
 *
 * @author aszswaz
 */
const {LocalDateTime, DateTimeFormatter} = require("@js-joda/core")
const {CONSOLE_LOGGER, TIME_FORMAT} = require("./Constant")

async function handler(level, args) {
    let logLevel
    switch (level) {
        case "DEBUG":
            // 这里的 ... 表示展开数组
            logLevel = "\033[96mDEBUG\033[0m"
            break
        case "INFO":
            logLevel = "\033[92mINFO\033[0m"
            break
        case "WARN":
            logLevel = "\033[93mWARN\033[0m"
            break
        case "ERROR":
            logLevel = "\033[91mERROR\033[0m"
            break
        default:
            logLevel = level
            break
    }
    const time = DateTimeFormatter.ofPattern(TIME_FORMAT).format(LocalDateTime.now())
    CONSOLE_LOGGER(time, logLevel, ...args)
}

module.exports = {
    handler
}
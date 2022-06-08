// noinspection DuplicatedCode

/**
 * 日志输出到文件
 *
 * @author aszswaz
 */

const fs = require("fs/promises")
const {DateTimeFormatter, LocalDateTime} = require("@js-joda/core")
const {printErr} = require("./util")
const nodeUtil = require("util")
const config = require("../config")
const path = require("path")
const {TIME_FORMAT} = require("./Constant")

class FileLogger {
    static #fileNumber = 0
    static #filePath = null
    static #fileHandler = null
    static #writeStream = null

    // 初始化文件序号，用于分割日志文件
    static async init() {
        // 定时清理 log 文件，只保留 5 个文件
        setInterval(async () => {
            try {
                let subFiles = await fs.readdir(config.logsDir)
                if (subFiles.length < 10) return
                subFiles.sort((a, b) => {
                    let an = parseInt(a.substring(0, a.indexOf(".")))
                    let bn = parseInt(b.substring(0, b.indexOf(".")))
                    return an - bn
                })
                subFiles = subFiles.slice(0, subFiles.length - 5)
                for (let subFile of subFiles) await fs.rm(path.join(config.logsDir, subFile))
            } catch (e) {
                printErr(e)
            }
        }, 3600000)

        let logDirFiles = await fs.readdir(config.logsDir)
        for (let file of logDirFiles) {
            let number = parseInt(file.substring(0, file.indexOf('.')))
            if (number > this.#fileNumber) this.#fileNumber = number
        }
    }

    static async handler(level, args) {
        await this.#rollingFile()
        const log = this.#logFormat(level, args)
        if (this.#writeStream != null) this.#writeStream.write(log)
    }

    static close() {
        try {
            if (this.#fileHandler) this.#fileHandler.close()
            this.#writeStream = null
            this.#fileHandler = null
        } catch (e) {
            printErr(e)
        }
    }

    /**
     * 分割日志文件
     */
    static async #rollingFile() {
        if (this.#filePath !== null) {
            let status = await fs.stat(this.#filePath)
            if (status.size < 100 * 1024 * 1024 * 1024) return
            this.#fileHandler.close()
            this.#writeStream = null
            this.#fileHandler = null
        }

        // 创建新的文件
        this.#filePath = `${config.logsDir}/${this.#fileNumber++}.log`
        // 以追加模式创建新的文件流，旧的文件流，在对象被 GC 销毁时，或者发生 IO 异常时，会自动关闭
        this.#fileHandler = await fs.open(this.#filePath, "a+")
        this.#writeStream = this.#fileHandler.createWriteStream()
    }

    /**
     * 格式化日志
     *
     * @param logLevel 日志等级
     * @param args 日志参数
     * @returns {string} 格式化后的日志
     */
    static #logFormat(logLevel, args) {
        // 日志发生时间
        let dateStr = DateTimeFormatter.ofPattern(TIME_FORMAT).format(LocalDateTime.now())
        return `${dateStr} ${logLevel}: ${nodeUtil.format(...args)}\n`
    }
}

module.exports = FileLogger
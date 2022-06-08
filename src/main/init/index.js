// noinspection JSUnresolvedFunction

/**
 * 程序的初始化，主要是初始化应用程序的全局配置，以及监听 IPC 通信
 *
 * @author aszswaz
 */

const {genCrt} = require("../utils")
const logger = require("../logger")
const {EOL} = require("os")
const fs = require("fs/promises")
const {existsSync} = require("fs")
const config = require("../config")
const ipcManager = require("../config/IPCManager")
const {app} = require("electron")
const Store = require("electron-store")

module.exports = async function () {
    try {
        console.info("initializing")

        // 将枚举挂载到全局，这样的就可以在 HOOK 脚本中使用
        global.enums = require("../config/enums")

        await logger.init()
        await printConfig()
        await ipcManager()
        await createDir()
        await genCrt()
        await regExit()

        // electron-store 监听渲染进程
        Store.initRenderer()
        console.info("Initialization successful")
    } catch (e) {
        logger.printErr(e)
        process.exit(1)
    }
}

/**
 * 创建文件夹
 */
async function createDir() {
    const dirs = [
        config.applicationDir,
        config.logsDir,
        config.hooksDir,
        config.templateDir,
        config.cache
    ]
    for (let dir of dirs) {
        if (!existsSync(dir)) {
            await fs.mkdir(dir)
        } else {
            const stat = await fs.stat(dir)
            if (!stat.isDirectory()) {
                throw new Error(`File ${dir} already exists, but it is not a folder.`)
            }
        }
    }
}

/**
 * 打印配置信息
 */
async function printConfig() {
    console.info("user data:", config.applicationDir)
    console.info("log dir:", config.logsDir)
    console.info("Render base url:", config.renderBaseUrl)
    console.info("tmp dir:", app.getPath("temp"))
    console.info("desktop dir:", app.getPath("desktop"))
    console.info("cache dir:", config.cache)
}

/**
 * 注册程序退出事件
 */
async function regExit() {
    process.on("exit", async () => {
        console.info("Program exits.")
        try {
            await deleteDir()
            await logger.close()
        } catch (e) {
            process.stderr.write(e.valueOf() + EOL)
        }
    })
}

/**
 * 删除文件夹
 */
async function deleteDir() {
    try {
        if (existsSync(config.cache)) await fs.rm(config.cache, {recursive: true})
    } catch (e) {
        console.error(e)
    }
}

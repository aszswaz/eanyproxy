// noinspection JSCheckFunctionSignatures,JSUnresolvedFunction

/**
 将软件的所有配置数据，从文件中导入 electrons-store

 @author: aszswaz
 @date: 2022-05-26 10:14:49
 @IDE: WebStorm
 */
const config = require("../config")
const fs = require("fs/promises")
const {constants} = require("fs")
const path = require("path")
const crypto = require("crypto")

module.exports = async function (store) {
    let applicationDir
    if (config.development) {
        applicationDir = path.join(process.cwd(), "./eanyproxy")
    } else {
        switch (process.platform) {
            case "linux":
                applicationDir = path.join(process.env.HOME, ".config/" + config.applicationName)
                break
            case "win32":
                applicationDir = path.join(process.env.USERPROFILE, "AppData/Local/" + config.applicationName)
                break
            case "darwin":
            // mac OS 还不需要进行向下兼容
            default:
                return
        }
    }

    await hookConfig(store, applicationDir)
    await templateConfig(store, applicationDir)
    await anyproxySettings(store, applicationDir)
    await obsoleteResources(applicationDir)
}

/**
 * hook 配置导入 store
 */
async function hookConfig(store, applicationDir) {
    const hooksDir = path.join(applicationDir, "hooks")
    const hookConfig = path.join(hooksDir, "hooks.json")
    let hooks

    if (await fileExist(hookConfig)) {
        hooks = JSON.parse(await fs.readFile(hookConfig, {encoding: "utf-8"}))
        await fillCodeObj(hooks, hooksDir)
        store.set("hooks", hooks)
        await fs.rm(hookConfig)
    } else {
        hooks = store.get("hooks")
    }

    // 随着操作系统的更新，操作系统所规范的软件配置文件目录可能会发生变更
    if (hooksDir !== config.hooksDir) {
        for (const item of hooks) {
            const newPath = path.join(config.hooksDir, `${item.id}.js`)
            await fs.rename(item.file, newPath)
            item.file = newPath
        }
        store.set("hooks", hooks)
    }
}

/**
 * 模板配置导入 store
 */
async function templateConfig(store, applicationDir) {
    const templatesDir = path.join(applicationDir, "templates")
    let file = path.join(templatesDir, "templates.json")
    let templates

    if (await fileExist(file)) {
        templates = JSON.parse(await fs.readFile(file, {encoding: "utf-8"}))
        await fillCodeObj(templates, templatesDir)
        store.set("templates", templates)
        await fs.rm(file)
    }

    if (templatesDir !== config.templateDir) {
        for (const item of templates) {
            const newPath = path.join(config.templateDir, `${item.id}.js`)
            await fs.rename(item.file, newPath)
            item.file = newPath
        }
        store.set("templates", templates)
    }
}

/**
 * 将 anyproxy 配置导入 store
 */
async function anyproxySettings(store, applicationDir) {
    const file = path.join(applicationDir, "anyproxy-settings.json")
    console.info("anyproxy settings file:", file)
    if (await fileExist(file)) {
        const settings = JSON.parse(await fs.readFile(file, {encoding: "utf-8"}))
        delete settings.silent
        store.set("anyproxySettings", settings)
        await fs.rm(file)
    }
}

/**
 * 删除过时的、无效的资源或文件夹
 */
async function obsoleteResources(applicationDir) {
    if (applicationDir !== config.applicationDir) {
        await fs.rm(applicationDir, {recursive: true})
    }
}

/**
 * 填充模板配置和 HOOK 配置对象
 */
async function fillCodeObj(codeList, dir) {
    // 填充新的属性
    for (let item of codeList) {
        const codeFile = item.file = path.join(dir, `${item.id}.js`)
        // 重命名残留的 mjs 文件
        if (!await fileExist(codeFile)) {
            const esCode = path.join(dir, `${item.id}.mjs`)
            await fs.rename(esCode, codeFile)
        }
        if (!await fileExist(codeFile)) throw new Error(`file: ${codeFile} not exit.`)

        // 获取文件创建时间、修改时间和MD5
        if (typeof item.readOnly === "undefined") item.readOnly = false

        const codeStats = await fs.stat(codeFile)
        item.createTime = parseInt(codeStats.birthtimeMs)
        item.modifyTime = parseInt(codeStats.mtimeMs)

        const bytes = await fs.readFile(codeFile)
        const hash = crypto.createHash("md5")
        hash.update(bytes)
        item.md5 = hash.digest('hex')
    }
}

/**
 * 判断文件是否存在，以及文件是否可读
 */
async function fileExist(file) {
    try {
        await fs.access(file, constants.R_OK)
        return true
    } catch (e) {
        if (e.code === "ENOENT")
            return false
        else
            throw e
    }
}
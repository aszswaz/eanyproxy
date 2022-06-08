// noinspection SpellCheckingInspection,JSUnresolvedFunction

/**
 内置的 HOOK 脚本模板，管理

 @author: aszswaz
 @date: 2022-02-26 16:50:12
 @IDE: WebStorm
 */

const fs = require("fs/promises")
const {existsSync, mkdirSync} = require("fs")
const {cloneDeep} = require("lodash")
const ipc = require("../config/IPCCommands")
const path = require("path");
const config = require("../config")
const Store = require("../store")
const {store: magStore} = require("../config/MagicalValue")
const {createHash} = require("crypto")

// 内部 HOOK 脚本
const internalInfos = [
    {id: "HookSkeleton", name: "骨架"},
    {id: "ModifyRequest", name: "修改请求"},
    {id: "ModifyResponse", name: "修改响应"},
    {id: "OverrideRequest", name: "直接发送响应"},
    {id: "ToExcel", name: "输出数据到 excel 文件"}
]
// 每个脚本都加上 cdelete: false，表示不可删除
internalInfos.forEach(async item => {
    item.readOnly = true
    item.code = (await fs.readFile(path.join(__dirname, `./templates/${item.id}.js`), {encoding: "utf-8"}))
})

/**
 * 获取所有模板信息和代码
 */
async function getAll() {
    const result = cloneDeep(internalInfos)
    const userTemplates = Store.get("templates")
    for (let item of userTemplates) {
        item.code = await fs.readFile(item.file, {encoding: "utf-8"})
        result.push(item)
    }

    return ipc.response.toSuccess(result)
}

/**
 * 删除模板
 */
async function deleteTemplate(_, templateIds) {
    for (let templateId of templateIds) {
        const file = path.join(config.templateDir, `${templateId}.js`)
        if (existsSync(file)) await fs.rm(file)
    }
    return ipc.response.toSuccess()
}

/**
 * 保存模板信息
 */
async function saveTemplate(_, templateInfos) {
    if (!Array.isArray(templateInfos)) throw new TypeError("The templateInfos is not array.")
    const cTime = new Date().getTime()

    if (!existsSync(config.templateDir)) mkdirSync(config.templateDir, {recursive: true})
    const newTemplateInfos = []
    for (let item of templateInfos) {
        // 不保存只读模板
        if (item.readOnly) continue
        // 用户编辑过模板，保存模板代码
        if (item.alreadyEdited) {
            fs.writeFile(item.file, item.code, {encoding: "utf-8"}).catch((e) => console.error(e))
            item.md5 = createHash("md5").update(item.code, "utf-8").digest("hex")
            item.modifyTime = cTime
        }
        newTemplateInfos.push({
            id: item.id,
            name: item.name,
            readOnly: item.readOnly,
            file: item.file,
            md5: item.md5,
            createTime: item.createTime,
            modifyTime: item.modifyTime
        })
    }
    Store.set("templates", newTemplateInfos)
}

module.exports = {
    getAll, deleteTemplate, saveTemplate
}

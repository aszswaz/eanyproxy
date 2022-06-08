// noinspection SpellCheckingInspection,JSUnusedGlobalSymbols,NpmUsedModulesInstalled

/**
 HOOK 脚本管理器

 @author: aszswaz
 @date: 2022-05-31 11:00:32
 @IDE: WebStorm
 */

// 外部依赖或函数导入
import {CaretRight, CloseBold, Delete} from "@element-plus/icons-vue"
import {cloneDeep} from "lodash"
import {v4 as uuidv4} from "uuid"
import * as EventEnum from "../../../js/EventEnum"
import {eventAsync} from "../../../js/Util"
import {IDiffScriptEnum} from "../../../js/Enums"

// 来自主进程的函数导入
const {ipcRenderer} = require("electron")
const fs = require("fs/promises")
const {existsSync} = require("fs")
const path = require("path")
const {createHash} = require("crypto")

// vue 组件导入
import ScriptManager from "../ScriptManager"
import TemplateSelect from "../TemplateSelect"
import ScriptSelector from "../ScriptSelector"
import IDiffScripts from "../IDiffScripts"

const components = {ScriptManager, TemplateSelect, ScriptSelector, IDiffScripts}
const methods = {
    createHook,
    startScript,
    stopScript,
    deleteHook,
    save,
    exportScript,
    importScripts
}

function setup() {
    return {
        CaretRight,
        CloseBold,
        Delete
    }
}

function data() {
    return {
        // 用户的所有脚本信息
        hooksInfo: [],
        // 要显示 loading 的按钮，通常是主进程还没有通过 IPC 给出处理结果
        loadingId: '',
        // 是否打开模板选择窗口
        showTSelect: false,
        // 脚本选择器的展示数据，用于对脚本进行批量操作
        ssData: null,
        // 两个脚本比较
        diffScripts: null
    }
}

/**
 * 组件挂载时
 */
async function mounted() {
    try {
        // 读取所有脚本信息
        const hooks = STORE.get("hooks")
        if (!hooks || !hooks.length) return
        const runningHooks = await ipcRenderer.invoke(ipc.hook.CURRENT_RUN)
        if (hooks.length > 0) {
            for (const item of hooks) {
                item.code = await fs.readFile(item.file, {encoding: "utf-8"});
                item.alreadyEdited = false
                item.running = runningHooks.includes(item.id)
            }
            this.hooksInfo = hooks
        }

        window.addEventListener("keydown", this.save)
        window.addEventListener("blur", this.save)
        window.addEventListener("beforeunload", this.save)
    } catch (e) {
        console.error(e)
    }
}

/**
 * 组件卸载时
 */
function unmounted() {
    window.removeEventListener("keydown", this.save)
    window.removeEventListener("blur", this.save)
    window.removeEventListener("beforeunload", this.save)
    this.save()
}

/**
 * 创建脚本
 */
async function createHook() {
    // 打开脚本模板选择窗口
    this.showTSelect = true
    // 用户选择模板后，根据模板创建脚本
    const script = await eventAsync(this.$el, EventEnum.TEMPLATE_SELECT)
    if (script) {
        script.id = uuidv4()
        script.readOnly = false
        script.alreadyEdited = true
        script.file = path.join(config.hooksDir, `${script.id}.js`)
        const cTime = new Date().getTime()
        script.createTime = cTime
        script.modifyTime = cTime
    }
    this.showTSelect = false
    return script
}

/**
 * 运行脚本
 */
async function startScript(script) {
    try {
        // 指定按钮显示 loading 图标
        this.loadingId = script.id
        await this.save()
        // 请求主进程运行脚本
        await ipcRenderer.invoke(global.ipc.hook.RUN, cloneDeep(script))
        script.running = true
    } catch (e) {
        console.error(e)
    } finally {
        this.loadingId = -1
    }
}

/**
 * 停止脚本
 */
async function stopScript(script) {
    this.loadingId = script.id
    try {
        await ipcRenderer.invoke(global.ipc.hook.STOP, script.id)
        script.running = false
    } catch (e) {
        console.error(e)
    } finally {
        this.loadingId = -1
    }
}

/**
 * 删除用户选择的脚本
 */
async function deleteHook(hooksInfo) {
    this.hooksInfo = this.hooksInfo.filter(item01 => {
        for (let item02 of hooksInfo) {
            if (item01.id === item02.id) {
                if (existsSync(item01.file)) fs.rm(item01.file).catch(console.error)
                return false
            }
        }
        return true
    })
    this.save()
}

/**
 * 保存脚本
 */
async function save(e) {
    try {
        const cTime = new Date().getTime()

        if (e) {
            // ctrl + s 快捷键
            const b1 = e.ctrlKey && e.key === "s"
            const b2 = e.type === "blur"
            const b3 = e.type === "beforeunload"
            if (!(b1 || b2 || b3)) return
        }

        // 脚本信息保存到 electron-store 存储库
        const newHooks = []
        for (const item of this.hooksInfo) {
            const file = path.join(config.hooksDir, `${item.id}.js`)
            // 脚本的 alreadyEdited 字段表示该脚本已经被用户编辑，需要保存
            if (item.alreadyEdited && typeof item.code === "string") {
                await fs.writeFile(file, item.code)
                item.modifyTime = cTime
            }

            // 考虑到无法在这个函数知道那些脚本已经被删除，因此，必须采取覆盖式脚本信息保存
            newHooks.push({
                id: item.id,
                name: item.name,
                readOnly: false,
                file,
                createTime: item.createTime,
                modifyTime: item.modifyTime,
                md5: createHash("md5").update(item.code, "utf-8").digest("hex")
            })
            item.alreadyEdited = false
        }
        STORE.set("hooks", newHooks)
    } catch (e) {
        console.error(e)
    }
}

/**
 * 导出脚本
 */
async function exportScript() {
    // 打开脚本选择器
    this.ssData = this.hooksInfo
    const hooksInfo = await eventAsync(this.$el, EventEnum.SCRIPT_SELECTOR)
    this.ssData = null
    if (!hooksInfo || !hooksInfo.length) return
    this.save()
    // 让主进程导出脚本
    await ipcRenderer.invoke(ipc.hook.EXPORT, cloneDeep(hooksInfo))
}

/**
 * 导入脚本
 */
async function importScripts() {
    try {
        const cTime = new Date().getTime()

        // 从压缩包获得脚本
        this.ssData = await ipcRenderer.invoke(ipc.hook.IMPORT)

        // 用户选择导入哪些脚本
        const scriptsInfo = await eventAsync(this.$el, EventEnum.SCRIPT_SELECTOR)
        this.ssData = null
        if (!scriptsInfo) return

        // 导入的脚本放入常规脚本队列，如果脚本出现冲突，让用户对此进行处理
        const conflict = [], cache = cloneDeep(this.hooksInfo)
        target01:
            for (let item01 of scriptsInfo) {
                // 检查导入的脚本与原有的脚本是否存在冲突
                for (let item02 of cache) {
                    if (item01.id === item02.id) {
                        conflict.push({a: {...item02}, b: {...item01}})
                        continue target01
                    }
                }
                this.hooksInfo.push(item01)
            }
        if (!conflict.length) return

        // 让用户选择那些脚本需要忽略、替换和新建
        this.diffScripts = conflict
        await eventAsync(this.$el, EventEnum.DIFF_SCRIPTS)
        this.diffScripts = null
        conflict.forEach(item01 => {
            const newScript = item01.b
            switch (item01.operate) {
                case IDiffScriptEnum.NEGLECT:
                    break
                case IDiffScriptEnum.REPLACE:
                    for (let item02 of this.hooksInfo) {
                        if (newScript.id === item02.id) {
                            item02.name = newScript.name
                            item02.readOnly = false
                            item02.code = newScript.code
                            return
                        }
                    }
                    break
                case IDiffScriptEnum.CREATE:
                    this.hooksInfo.push({
                        id: uuidv4(),
                        name: newScript.name,
                        readOnly: false,
                        createTime: cTime,
                        code: newScript.code,
                        md5: newScript.md5
                    })
                    break
                default:
                    throw new Error("Unknown IDiffScriptEnum value.")
            }
        })
    } catch (e) {
        console.error(e)
    } finally {
        this.save()
    }
}

export default {
    name: "HookScriptManager",
    components,
    setup,
    data,
    mounted,
    unmounted,
    methods
}
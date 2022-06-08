<!--
用户模板管理

@author aszswaz
@date 2022年02月26日
-->

<!--suppress SpellCheckingInspection, JSUnusedGlobalSymbols, NpmUsedModulesInstalled -->
<template>
  <div class="TemplateManager">
    <!--脚本管理窗口组件-->
    <script-manager
        :script-infos="templateInfos"
        :create-script="this.createTemplate"
        :deleteFunc="this.deleteTemplate"/>
  </div>
</template>

<script>
import ScriptManager from "./ScriptManager"
import {Delete} from "@element-plus/icons-vue"
import {v4 as uuidv4} from "uuid"
import {cloneDeep} from "lodash"

const {ipcRenderer} = require("electron")
const path = require("path")

const methods = {createTemplate, deleteTemplate, save}
const components = {ScriptManager}

function setup() {
  return {Delete}
}

function data() {
  return {
    templateInfos: []
  }
}

function mounted() {
  getAllTemplateInfos().then(result => {
    if (result.length === 0) return
    this.templateInfos = result
    this.chooseScript = 0
  })

  window.addEventListener("keydown", this.save)
  window.addEventListener("blur", this.save)
  window.addEventListener("beforeunload", this.save)
}

function unmounted() {
  window.removeEventListener("keydown", this.save)
  window.removeEventListener("blur", this.save)
  window.removeEventListener("beforeunload", this.save)
  this.save()
}

/**
 * 获得所有模板信息
 */
async function getAllTemplateInfos() {
  const result = await ipcRenderer.invoke(global.ipc.template.GET_ALL)
  if (result.code !== ipc.code.SUCCESS) throw new Error(result.message)
  // 读取第一个模板的代码
  const data = result.data
  if (!Array.isArray(data)) throw new TypeError()
  return data
}

/**
 * 创建一个模板
 */
async function createTemplate() {
  const cTime = new Date().getTime()
  const obj = {
    id: uuidv4(),
    name: null,
    readOnly: false,
    code: "",
    file: null,
    alreadyEdited: true,
    createTime: cTime,
    modifyTime: cTime
  }
  obj.file = path.join(config.templateDir, `${obj.id}.js`)
  return obj
}

/**
 * 删除模板
 */
function deleteTemplate(templateInfos) {
  ipcRenderer.invoke(ipc.template.DELETE, Object.assign([], templateInfos))
  this.templateInfos = this.templateInfos.filter(item01 => {
    for (let item02 of templateInfos) {
      if (item01.id === item02.id) {
        return false
      }
    }
    return true;
  })
}

/**
 * 保存模板
 */
function save(e) {
  // 保存模板信息和模板代码
  if (e) {
    const b1 = e.ctrlKey && e.key === 's'
    const b2 = e.type === "blur"
    const b3 = e.type === "beforeunload"
    if (!(b1 || b2 || b3)) return
  }
  ipcRenderer.invoke(ipc.template.SAVE, cloneDeep(this.templateInfos))
  this.templateInfos.forEach(item => item.alreadyEdited = false)
}

export default {
  name: "TemplateManager",
  data,
  components,
  mounted,
  unmounted,
  setup,
  methods
}
</script>

<style scoped lang="less">
@import "../../css/variable.less";

// 模板管理器
.TemplateManager {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

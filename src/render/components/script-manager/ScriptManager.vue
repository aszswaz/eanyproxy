<!--
用户自定义脚本管理

@author: aszswaz
@date: 2022-02-21 10:32:47
@IDE: WebStorm
-->
<!--suppress ALL -->

<template>
  <!--脚本明细-->
  <div class="scriptDetails">
    <!--已有的脚本列表-->
    <div class="scriptList" @mouseleave="this.mouseOver = -1">
      <!--所有脚本操作按钮，比如：创建脚本、导出脚本、导入脚本-->
      <div class="allScriptOperate">
        <!--创建脚本-->
        <el-button class="scriptManagerButton" :icon="Plus" title="创建脚本或脚本模板" @click="this.create()" circle/>

        <!--模板删除按钮-->
        <el-button
            class="scriptManagerButton"
            :disabled="!this.scriptInfos && !this.scriptInfos.length"
            :icon="Delete"
            @click="this.deleteScript()"
            circle/>

        <!--其他组件自定义按钮-->
        <slot name="allScriptOperateButton"/>
      </div>

      <!--脚本名称列表-->
      <el-scrollbar>
        <div
            class="scriptListCell"
            v-for="(item, index) of this.scriptInfos"
            :class="{
              chooseScript: this.chooseIndex === index || this.mouseOver === index,
              blackPoint: item.alreadyEdited
            }"
            @mouseenter="mouseOver = index"
            :key="item.id"
            @click="this.chooseIndex = index"
            :title="this.describe(item.code)">
          <!--脚本名称-->
          <input
              type="text"
              spellcheck="false"
              :id="item.id"
              v-model="item.name"
              :disabled="item.readOnly"
              @change="item.alreadyEdited = true"
              @focusout="this.changeName = -1"
              maxlength="10"/>

          <!--操作脚本，比如运行、停止、删除脚本-->
          <div class="scriptCellOperate">
            <slot name="scriptCellOperate" v-bind="{item, index}"/>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!--指定的脚本详细信息，外层的 v-if 作用是确保 chooseHook 不为 null 才可以进行渲染-->
    <div class="scriptDetail" v-if="this.scriptInfos.length > 0">
      <!--脚本代码-->
      <code-editor
          class="scriptCode"
          v-if="this.chooseScript"
          :script="this.chooseScript"/>
    </div>

    <!--脚本多选器-->
    <script-selector v-if="this.scriptSelector" :scripts="this.scriptInfos"/>
  </div>
</template>

<!--suppress JSUnresolvedVariable -->
<script>
import CodeEditor from "./CodeEditor"
import {Plus, Delete} from "@element-plus/icons-vue"
import {describe, eventAsync} from "../../js/Util"
import {cloneDeep} from "lodash"
import ScriptSelector from "./ScriptSelector"
import * as EventEnum from "../../js/EventEnum"

const fs = require("fs")

/**
 * 用户所有脚本的序列化文件
 *
 * @deprecated
 */
const file = `${global.APPLICATION_DIR}/UserScript.json`
// 页面渲染完毕之后要完成的任务
const renderTask = []
const components = {CodeEditor, ScriptSelector}
const methods = {deleteScript, create}
const computed = {chooseScript}
const props = {
  scriptInfos: Array,
  createScript: Function,
  deleteFunc: Function
}

function data() {
  return {
    // 鼠标在哪一行上
    mouseOver: -1,
    // 用户要修改哪个脚本名称
    changeName: -1,
    // 用户选择的脚本
    chooseIndex: 0,
    // 脚本多选器
    scriptSelector: false
  }
}

function setup() {
  return {Plus, Delete, describe}
}

// 组件渲染完毕之后
function updated() {
  for (let item of renderTask) {
    try {
      item()
    } catch (e) {
      console.error(e)
    }
  }
  renderTask.splice(0, renderTask.length)
}

/**
 * 用户选择的脚本
 */
function chooseScript() {
  return this.scriptInfos[this.chooseIndex]
}

/**
 * 创建脚本
 */
async function create() {
  // 调用父组件传入的脚本创建函数
  if (typeof this.createScript !== "function") throw new TypeError("The createScript is not a function.")
  const newScript = await this.createScript()
  if (!newScript) return
  this.scriptInfos.push(newScript)
  let lastIndex = this.scriptInfos.length - 1
  this.changeName = lastIndex
  this.chooseIndex = lastIndex
  // 等组件渲染完毕之后，自动对新增的脚本名称输入框聚焦
  renderTask.push(() => document.getElementById(newScript.id).focus())
}

/**
 * 删除脚本
 */
async function deleteScript(obj, index) {
  this.scriptSelector = true
  const scripts = await eventAsync(this.$el, EventEnum.SCRIPT_SELECTOR)
  this.scriptSelector = false
  if (!scripts || !scripts.length) return
  this.chooseIndex = 0
  // 删除脚本或模板
  this.deleteFunc(scripts)
}

export default {
  name: "ScriptManager",
  data,
  computed,
  props,
  updated,
  setup,
  components,
  methods
}
</script>

<style scoped lang="less" src="../../css/ScriptManager.less"/>
<style scoped lang="less">
@import "../../css/variable";

@fontSize: 16px;
@cellHeight: 60px;
@scriptNameTop: calc(@cellHeight / 2 - @fontSize / 2 - 5px);
@border: @thinBorderWidth solid #C9C9C9;

// 脚本明细
.scriptDetails {
  // 按行排列元素
  display: flex;
  flex-direction: row;

  background-color: @backgroundColor;
  overflow: hidden;
  height: 100%;
  width: 100%;
}

// 所有脚本的操作按钮
.allScriptOperate {
  height: @cellHeight;
  width: 100%;
  padding: 8px 10px;
  border-bottom: @border;
}

// 脚本列表
.scriptList {
  width: auto;
  height: 100%;
  // 按列排列元素
  flex-direction: column;
  border-right: @border;
}

// 脚本单元格
.scriptListCell {
  height: @cellHeight;
  border-bottom: @border;
  // 禁止用户选择文本
  user-select: none;

  &:first-child {
    border-top: @border;
  }

  // 脚本名称
  input {
    height: 100%;
    text-align: center;
    font-size: @fontSize;
    background: none;
    border: none;

    &:disabled {
      color: black;
    }
  }

  // 脚本的操作按钮
  .scriptCellOperate {
    display: inline-block;
    float: right;
    position: relative;
    // el-button 默认大小为 32px。计算按钮的居中摆放位置
    top: calc(@cellHeight / 2 - 16px);
    right: 20px;
  }
}

// 指定脚本明细
.scriptDetail {
  display: inline-block;
  height: 100%;
  // 填充剩余空间
  flex: 1;

  // 脚本代码编辑器
  .scriptCode {
    width: 100%;
    display: inline-block;
    height: 100%;
  }
}
</style>

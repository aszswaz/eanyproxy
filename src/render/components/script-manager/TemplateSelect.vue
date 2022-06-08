<!--
模板选择窗口

@author: aszswaz
@date: 2022-02-28 15:04:39
@IDE: WebStorm
-->
<!--suppress SpellCheckingInspection, JSCheckFunctionSignatures, JSUnusedGlobalSymbols -->
<template>
  <!--背景板-->
  <div class="winBackground">
    <!--tabindex="0" 可以让 DIV 也能获取焦点，这样 DIV 就可以监听键盘按键-->
    <div class="selector" tabindex="0">
      <!--标题-->
      <div class="selectorTitle">请选择模板</div>

      <!--模板选择窗格主体-->
      <div class="selectorContent">
        <!--模板名称列表-->
        <div class="scriptNames">
          <el-scrollbar>
            <div
                class="scriptName"
                v-for="item of this.templateInfos"
                :key="item.id"
                :class="{cSelection: this.vSelect === item}"
                @click="this.vSelect = item"
                :title="this.describe(item.code)">
              {{ item.name }}
            </div>
          </el-scrollbar>
        </div>

        <!--脚本预览窗格-->
        <div class="preview">
          <el-scrollbar>
            <!--代码展示区域-->
            <div class="previewContent" v-html="this.codePretty"/>
          </el-scrollbar>
        </div>
      </div>

      <!--操作模板-->
      <div class="actionButtons">
        <el-button :icon="Check" size="large" @click="this.yes()" circle/>
        <el-button :icon="Close" size="large" @click="this.cancel()" circle/>
      </div>
    </div>
  </div>
</template>

<script>
import {Check, Close} from "@element-plus/icons-vue"
import hls from "highlight.js"
import {cloneDeep} from "lodash"
import {describe} from "../../js/Util"
import * as EventEnum from "../../js/EventEnum"

const {ipcRenderer} = require("electron")

const methods = {yes, cancel}
const computed = {codePretty}

function setup() {
  return {Check, describe, Close}
}

function data() {
  return {
    vSelect: null,
    // 模板信息和代码
    templateInfos: []
  }
}

async function mounted() {
  // 获取模板数据
  this.templateInfos = (await ipcRenderer.invoke(ipc.template.GET_ALL)).data
  if (this.templateInfos.length > 0) this.vSelect = this.templateInfos[0]
}

/**
 * 美化代码
 */
function codePretty() {
  if (typeof this.vSelect === "undefined" || this.vSelect == null || !this.vSelect.code || !this.vSelect.code.length) return ''
  return hls.highlight(this.vSelect.code, {language: "javascript"}).value
}

/**
 * 用户确定选择该模板
 */
function yes() {
  this.$parent.$el.dispatchEvent(new CustomEvent(EventEnum.TEMPLATE_SELECT, {detail: cloneDeep(this.vSelect)}))
}

/**
 * 用户取消选择
 */
function cancel() {
  this.$parent.$el.dispatchEvent(new Event(EventEnum.TEMPLATE_SELECT))
}

export default {
  name: "TemplateSelect",
  setup,
  data,
  mounted,
  methods,
  computed
}
</script>

<style scoped lang="less" src="../../css/SelectorStyle.less"/>
<style scoped lang="less">
@import "../../css/variable";

// 操作按钮
.actionButtons {
  padding: 7px calc(25% - @elButtonWidth / 2);

  *:last-child {
    float: right;
  }
}

// 脚本名称
.scriptName {
  text-align: center;
  padding: 7px 10px;
}
</style>
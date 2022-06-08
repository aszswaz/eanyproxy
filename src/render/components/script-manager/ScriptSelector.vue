<!--
脚本选择器，让用户可以选择多个脚本，选择器返回用户选中的脚本的 ID

@author: aszswaz
@date: 2022-05-24 11:21:29
@IDE: WebStorm
-->
<!--suppress JSUnresolvedVariable -->
<template>
  <!--背景板-->
  <div class="winBackground">
    <div class="selector">
      <div class="selectorTitle">请选择</div>

      <div class="selectorContent">
        <div class="scriptNames">
          <el-scrollbar>
            <!--脚本名称-->
            <div
                class="scriptName"
                v-for="(item, index) of this.scripts"
                :key="item.id"
                :class='{cSelection: this.vSelect === item}'
                @click="this.vSelectIndex = index"
                :title="this.describe(item.code)">
              <!--单选按钮-->
              <el-checkbox
                  v-model="this.selectResult[item.id]"
                  @click.stop=""
                  @change="this.checkSelectAllFunc()"
                  :disabled="item.readOnly"/>
              <span>{{ item.name }}</span>
            </div>
          </el-scrollbar>
        </div>

        <div class="preview">
          <el-scrollbar>
            <div class="previewContent" v-html="this.codePretty"/>
          </el-scrollbar>
        </div>
      </div>

      <div class="actionButtons">
        <el-button
            class="actionButton"
            size="large"
            @click="this.selectAllFunc()"
            :style='this.selectAll ? "background-color: #C5C5C5" : ""'
            circle>
          全选
        </el-button>
        <el-button class="actionButton" :icon="Check" size="large" @click="this.confirm()" circle/>
        <el-button class="actionButton" :icon="Close" size="large" @click="this.cancel()" circle/>
      </div>
    </div>
  </div>
</template>

<script>
import {describe} from "../../js/Util"
import hls from "highlight.js"
import {Check, Close} from "@element-plus/icons-vue"
import * as EventEnum from "../../js/EventEnum"

const methods = {describe, selectAllFunc, checkSelectAllFunc, confirm, cancel}
const computed = {vSelect, codePretty}
const props = {
  scripts: Array
}

function setup() {
  return {
    Check,
    Close
  }
}

function data() {
  return {
    // 用户要预览的脚本
    vSelectIndex: 0,
    // 用户的选择结果
    selectResult: {},
    // 全选
    selectAll: false
  }
}

/**
 * 用户查看的脚本
 */
function vSelect() {
  return this.scripts[this.vSelectIndex]
}

/**
 * 美化代码
 */
function codePretty() {
  if (typeof this.vSelect === "undefined" || this.vSelect == null || !this.vSelect.code || !this.vSelect.code.length) return ''
  return hls.highlight(this.vSelect.code, {language: "javascript"}).value
}

/**
 * 全选
 */
function selectAllFunc() {
  this.selectAll = !this.selectAll
  for (let item of this.scripts) this.selectResult[item.id] = this.selectAll
}

/**
 * 检查全选状态是否正确
 */
function checkSelectAllFunc() {
  for (let item of this.scripts) {
    if (!this.selectResult[item.id]) {
      this.selectAll = false
      return
    }
  }
  this.selectAll = true
}

/**
 * 用户确认选择
 */
function confirm() {
  const selectResult = []
  for (let item of this.scripts) {
    if (this.selectResult[item.id]) selectResult.push(item)
  }
  this.$parent.$el.dispatchEvent(new CustomEvent(EventEnum.SCRIPT_SELECTOR, {detail: selectResult}))
}

/**
 * 用户取消选择
 */
function cancel() {
  // 向父组件的 DOM 发送事件
  this.$parent.$el.dispatchEvent(new CustomEvent(EventEnum.SCRIPT_SELECTOR))
}

export default {
  name: "ScriptSelector",
  setup,
  props,
  data,
  methods,
  computed
}
</script>

<style scoped lang="less" src="../../css/SelectorStyle.less"/>
<style scoped lang="less">
@import "../../css/variable";

// 操作按钮
.actionButtons {
  // 子元素间距和内边距
  --interval: calc(25% - @elButtonWidth / 2);
  padding: 7px 0;

  .actionButton {
    margin-left: var(--interval) !important;
  }
}

// 脚本名称
.scriptName {
  padding: 4px 10px;

  span {
    display: inline-block;
    text-align: center;
    min-width: calc(100% - 20px);
    height: 100%;
  }
}
</style>
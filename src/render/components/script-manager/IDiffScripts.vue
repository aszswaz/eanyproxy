<!--
当用户导入脚本时，与原有脚本发生冲突，向用户展示两个脚本

@author: aszswaz
@date: 2022-05-26 16:51:32
@IDE: WebStorm
-->
<!--suppress JSValidateTypes, JSUnresolvedVariable, JSUnusedGlobalSymbols -->
<template>
  <!--背景层-->
  <div class="winBackground">
    <!--居中窗口-->
    <div class="diffScripts">
      <!--上面板-->
      <div class="topPanel">
        <!--操作按钮-->
        <div class="operateButton">
          <el-button @click="this.confirm()">确认</el-button>
          <el-button @click="this.operateAll(IDiffScriptEnum.NEGLECT)">全部忽略</el-button>
          <el-button @click="this.operateAll(IDiffScriptEnum.REPLACE)">全部替换</el-button>
          <el-button @click="this.operateAll(IDiffScriptEnum.CREATE)">全部新建</el-button>
        </div>
        <!--窗口标题-->
        <div class="title">导入脚本时，以下脚本发生冲突</div>
      </div>

      <!--内容区域-->
      <div class="diffContentPanel">
        <!--冲突的两个脚本名称-->
        <div class="scriptNames">
          <el-scrollbar>
            <div
                class="scriptName"
                :class="{chooseScript: this.currentClickIndex === index}"
                v-for="(item, index) of this.diffScripts"
                :key="item.a.id"
                @click="this.currentClickIndex = index">
              {{ item.a.name }}
              <span
                  style="font-size: 16px; transform: scale(2, 1);display: inline-block;margin: 0 10px;">&#10231;</span>
              {{ item.b.name }}

              <!--操作按钮-->
              <el-radio-group v-model="item.operate" style="float: right; margin-left: 10px;">
                <el-radio-button :label="this.IDiffScriptEnum.NEGLECT" @click.stop>忽略</el-radio-button>
                <el-radio-button :label="this.IDiffScriptEnum.REPLACE" @click.stop>替换</el-radio-button>
                <el-radio-button :label="this.IDiffScriptEnum.CREATE" @click.stop>新建</el-radio-button>
              </el-radio-group>
            </div>
          </el-scrollbar>
        </div>

        <!--代码对比-->
        <div class="diffScriptPanel">
          <div>
            <el-scrollbar>
              <div class="panelTitle">原脚本</div>
              <!--脚本信息-->
              <div class="scriptInfos">
                <table>
                  <tr>
                    <td>脚本名称</td>
                    <td>：</td>
                    <td>{{ this.currentClick.a.name }}</td>
                  </tr>
                  <tr>
                    <td>脚本 ID</td>
                    <td>：</td>
                    <td>{{ this.currentClick.a.id }}</td>
                  </tr>
                  <tr>
                    <td>创建时间</td>
                    <td>：</td>
                    <td>{{ this.dateFormat(this.currentClick.a.createTime) }}</td>
                  </tr>
                  <tr>
                    <td>修改时间</td>
                    <td>：</td>
                    <td>{{ this.dateFormat(this.currentClick.a.modifyTime) }}</td>
                  </tr>
                </table>
              </div>
              <div class="scriptCode" v-html="this.codePretty(this.currentClick.a.code)"/>
            </el-scrollbar>
          </div>

          <div>
            <el-scrollbar>
              <div class="panelTitle">导入的脚本</div>
              <div class="scriptInfos">
                <table>
                  <tr>
                    <td>脚本名称</td>
                    <td>：</td>
                    <td>{{ this.currentClick.b.name }}</td>
                  </tr>
                  <tr>
                    <td>脚本 ID</td>
                    <td>：</td>
                    <td>{{ this.currentClick.b.id }}</td>
                  </tr>
                  <tr>
                    <td>创建时间</td>
                    <td>：</td>
                    <td>{{ this.dateFormat(this.currentClick.b.createTime) }}</td>
                  </tr>
                  <tr>
                    <td>修改时间</td>
                    <td>：</td>
                    <td>{{ this.dateFormat(this.currentClick.b.modifyTime) }}</td>
                  </tr>
                </table>
              </div>
              <div class="scriptCode" v-html="this.codePretty(this.currentClick.b.code)"/>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import hls from "highlight.js"
import {DateTimeFormatter, LocalDateTime, Instant, ZoneId} from "@js-joda/core"
import {IDiffScriptEnum} from "../../js/Enums"
import * as EventEnum from "../../js/EventEnum"

const props = {
  diffScripts: Array
}
const methods = {codePretty, dateFormat, operateAll, confirm}
const computed = {currentClick}

function setup() {
  return {IDiffScriptEnum}
}

function data() {
  return {
    // 用户当前点击元素
    currentClickIndex: 0
  }
}

function mounted() {
  // 设置默认选项为“替换”
  this.diffScripts.forEach(item => item.operate = IDiffScriptEnum.REPLACE)
}

/**
 * 用户当前点击的脚本
 */
function currentClick() {
  return this.diffScripts[this.currentClickIndex]
}

/**
 * 美化代码
 */
function codePretty(code) {
  return hls.highlight(code, {language: "javascript"}).value
}

/**
 * 日期格式化
 */
function dateFormat(timestamp) {
  const format = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
  const time = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault())
  return time.format(format)
}

/**
 * 对所有脚本执行指定的操作
 */
function operateAll(operateCode) {
  this.diffScripts.forEach(item => item.operate = operateCode)
  this.confirm()
}

/**
 * 用户确认选择
 */
function confirm() {
  this.$parent.$el.dispatchEvent(new CustomEvent(EventEnum.DIFF_SCRIPTS, {detail: this.diffScripts}))
}

export default {
  name: "DiffScripts",
  setup,
  props,
  data,
  computed,
  mounted,
  methods
}
</script>

<style scoped lang="less">
@import "../../css/variable";

// 窗口宽高
@winWidth: 95vw;
@winHeight: 95vh;
// 边框弧度
@borderRadius: 20px;

// 脚本比较窗口样式
.diffScripts {
  width: @winWidth;
  height: @winHeight;
  // 窗口居中
  position: relative;
  left: calc(100vw / 2 - @winWidth / 2);
  top: calc(100vh / 2 - @winHeight / 2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// 上面板
.topPanel {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
}

// 操作按钮
.operateButton {
  width: 410px;
  height: 100%;
  border-radius: @borderRadius;
  padding: 7px 13px;
  border: @crudeBorder;
  background-color: @backgroundColor;
}

// 窗口标题
.title {
  text-align: center;
  margin-left: 10px;
  width: calc(100% - 330px);
  height: 100%;
  line-height: 48px;
  border-radius: @borderRadius;
  border: @crudeBorder;
  background-color: @backgroundColor;
}

// 内容区域
.diffContentPanel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

// 脚本名称
.scriptNames {
  flex-direction: column;
  height: calc(100% - 60px);
  background-color: @backgroundColor;
  margin-right: 10px;
  border-radius: @borderRadius;
  // 宽度根据内容自适应
  width: fit-content;
  max-width: 600px;
  min-width: 250px;
  border: @crudeBorder;
  overflow: hidden;
}

.scriptName {
  display: block;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border-bottom: 1px solid #C9C9C9;
  padding: 0 10px;
}

// 代码比较面板
.diffScriptPanel {
  background-color: @backgroundColor;
  // 填充剩余的空间
  flex: 1;
  height: calc(100% - 60px);
  border-radius: @borderRadius;
  border: @crudeBorder;
  display: flex;
  flex-direction: row;

  > div {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;

    &:first-child {
      border-right: @thinBorder;
    }
  }
}

// 两边面板的标题
.panelTitle {
  text-align: center;
  height: 30px;
  line-height: 30px;
  border-bottom: @thinBorder;
}

// 脚本信息
.scriptInfos {
  width: 100%;
  border-bottom: @thinBorder;
  padding-left: 10px;
}

// 脚本代码
.scriptCode {
  padding: 10px;
  white-space: pre;
}
</style>
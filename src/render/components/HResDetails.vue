<!--
HTTP 响应明细

@author: aszswaz
@date: 2022-04-21 15:26:46
@IDE: WebStorm
-->
<template>
  <div>
    <!--常规参数-->
    <div class="entry01">General</div>
    <div class="entryBody" v-if="this.response">
      <table>
        <tr>
          <td class="entry02">Status Code</td>
          <td :style="{color: this.cCodeColor}" class="value">
            <!--状态圆圈-->
            <div style="display: inline-block; width: 10px; height: 10px; border-radius: 5px;margin-right: 5px;"
                 :style="{'background-color': this.cCodeColor}"/>
            {{ this.response.statusCode }}
            {{ this.response.statusMessage }}
          </td>
        </tr>
      </table>
    </div>

    <!--响应头-->
    <div class="entry01">Headers</div>
    <div class="entryBody" v-if="this.response">
      <table>
        <tr v-for="(value, header) in this.response.headers">
          <td class="entry02">{{ header }}</td>
          <td class="value">{{ value }}</td>
        </tr>
      </table>
    </div>

    <!--响应体-->
    <div class="entry01" :title="this.byteLF">
      Body
      <el-button class="entryButton" @click="this.bodyExport()"
                 :disabled="!(this.response && this.response.rawBody)">
        导出
      </el-button>
      <el-button class="entryButton" @click="this.bodyCopy()"
                 :disabled="!(this.response && typeof this.response.body === 'string')">复制
      </el-button>
    </div>
    <!--展示 HTTP body-->
    <http-body-viewer
        v-if="this.response && this.response.contentType"
        class="entryBody"
        style="padding-bottom: 10px;"
        :content-type="this.response.contentType"
        :body="this.response.body"
        :title="this.byteLF"/>
  </div>
</template>

<script>
import {formatBody, codeColor, saveAs, byteLenFormat} from "../js/Util.js"
import HttpBodyViewer from "./viewers/HttpBodyViewer"

const components = {HttpBodyViewer}
const methods = {bodyExport, bodyCopy}
const computed = {cCodeColor, byteLF}
const props = {
  id: "",
  response: {}
}

function setup() {
  return {
    formatBody, saveAs,
    MAX_TEXT_LENGTH: global.MAX_TEXT_LENGTH
  }
}

/**
 * 给状态码上色
 */
function cCodeColor() {
  return codeColor(this.response.code)
}

/**
 * 请求体的字节长度格式化
 */
function byteLF() {
  if (this.response && this.response.rawBody)
    return byteLenFormat(this.response.rawBody.length)
  else
    return null
}

/**
 * 导出响应体
 */
function bodyExport() {
  saveAs(this.id, this.response.contentType, this.response.rawBody)
}

/**
 * 复制响应体到剪切板
 */
function bodyCopy() {
  navigator.clipboard.writeText(this.response.body)
  this.$message({
    message: "复制成功！",
    type: "success",
    customClass: "elMessage"
  })
}

export default {
  name: "HResDetails",
  props,
  computed,
  setup,
  components,
  methods
}
</script>

<style scoped lang="less" src="../css/HRDetails.less"/>
<!--
HTTP 请求明细

@author: aszswaz
@date: 2022-04-21 15:23:23
@IDE: WebStorm
-->
<template>
  <div style="width: 100%;">
    <!--HTTP 请求基本信息-->
    <div class="entry01">
      General
      <el-button
          class="entryButton"
          style="width: 120px;"
          @click="this.copyAsCurl()">
        copy as curl
      </el-button>
    </div>
    <div class="entryBody">
      <table>
        <tr>
          <td class="entry02">Method</td>
          <td class="value">{{ this.request.method }}</td>
        </tr>
        <tr>
          <td class="entry02">URL</td>
          <td class="value">{{ this.request.url }}</td>
        </tr>
        <tr>
          <td class="entry02">Protocol</td>
          <td class="value">{{ this.request.protocol.toUpperCase() + "/" + this.request.httpVersion }}</td>
        </tr>
      </table>
    </div>

    <!--HTTP 请求头-->
    <div class="entry01">Headers</div>
    <div class="entryBody">
      <table>
        <tr v-for="(value, header) in this.request.headers">
          <td class="entry02">{{ header }}</td>
          <td class="value">{{ value }}</td>
        </tr>
      </table>
    </div>

    <!--Cookies-->
    <div class="entry01">Cookies</div>
    <div class="entryBody">
      <table>
        <tr v-for="(value, cookie) in this.cookies">
          <td class="entry02">{{ cookie }}</td>
          <td class="value">{{ value }}</td>
        </tr>
      </table>
    </div>

    <!--Query parameters-->
    <div class="entry01">Query string parameters</div>
    <div class="entryBody">
      <table>
        <tr v-for="(value, parameter) in this.request.query">
          <td class="entry02">{{ parameter }}</td>
          <td class="value">{{ value }}</td>
        </tr>
      </table>
    </div>

    <!--request body-->
    <div class="entry01" :title="this.byteLF">
      Body
      <el-button class="entryButton" @click="this.bodyExport()" :disabled="!this.request.rawBody">导出</el-button>
      <el-button class="entryButton" @click="this.bodyCopy()" :disabled="!(typeof this.request.body === 'string')">
        复制
      </el-button>
    </div>
    <!--展示 HTTP body-->
    <http-body-viewer
        v-if="this.request.contentType"
        class="entryBody"
        style="padding-bottom: 10px;"
        :content-type="this.request.contentType"
        :body="this.request.body"
        :title="this.byteLF"/>
  </div>
</template>

<script>
import {byteLenFormat, formatBody, saveAs} from "../js/Util.js"
import HttpBodyViewer from "./viewers/HttpBodyViewer"
import {v4 as uuid} from "uuid"

const {EOL} = require("os")
const path = require("path")
const fs = require("fs/promises")

const components = {HttpBodyViewer}
const methods = {bodyCopy, bodyExport, copyAsCurl}
const computed = {cookies, byteLF}
const props = {
  request: {}
}

function setup() {
  return {formatBody, saveAs}
}

/**
 * 解析请求中的 cookie
 */
function cookies() {
  const cookies = {}

  const headers = this.request.sHeaders;
  if (headers.cookie) {
    const lines = headers.cookie.split(";")
    for (const line of lines) {
      const keyValue = line.trim().split("=")
      cookies[keyValue[0]] = keyValue.length === 2 ? keyValue[1] : ""
    }
  }

  return cookies
}

/**
 * 请求体的字节长度格式化
 */
function byteLF() {
  if (this.request && this.request.rawBody)
    return byteLenFormat(this.request.rawBody.length)
  else
    return null
}

/**
 * 导出响应体
 */
function bodyExport() {
  saveAs(this.request.id, this.request.contentType, this.request.rawBody)
}

/**
 * 复制响应体到剪切板
 */
async function bodyCopy() {
  await navigator.clipboard.writeText(this.request.body)
  this.$message({
    message: "复制成功！",
    type: "success",
    customClass: "elMessage"
  })
}

/**
 * 复制请求体为 curl 命令行
 */
async function copyAsCurl() {
  let curl = `curl -v --compressed '${this.request.url}' -X${this.request.method}`

  let body = this.request.body
  if (body && body.length) {
    body = body.replaceAll("'", "\\'")
    curl += ` \\${EOL}-d '${body}'`
  } else if (this.request.rawBody && this.request.rawBody.length) {
    const file = path.join(config.cache, uuid() + ".bin")
    await fs.writeFile(file, this.request.rawBody);
    curl += ` \\${EOL}-d '@${file}'`
  }

  const headers = {...this.request.headers}
  delete headers["Content-Length"]
  delete headers["content-length"]

  for (const header in headers) curl += ` \\${EOL}-H '${header}: ${headers[header]}'`

  await navigator.clipboard.writeText(curl)
  this.$message({
    message: "复制成功！",
    type: "success",
    customClass: "elMessage"
  })
}

export default {
  name: "HReqDetails",
  props,
  computed,
  components,
  setup,
  methods
}
</script>

<style scoped lang="less" src="../css/HRDetails.less"/>
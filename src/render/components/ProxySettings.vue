<!--
anyproxy 代理服务器设置

@author: aszswaz
@date: 2022-02-17 16:09:59
@IDE: WebStorm
-->
<!--suppress JSUnresolvedVariable, NpmUsedModulesInstalled, JSUnusedGlobalSymbols -->
<template>
  <!--窗口的背景-->
  <div class="winBackground">
    <div class="InlineWindow">
      <div class="content">
        <table>
          <tr>
            <td>代理端口：</td>
            <td>
              <el-input-number v-model="port" :min="80" :max="65535" class="input"/>
            </td>
          </tr>
          <tr>
            <td>HTTPS：</td>
            <td>
              <el-switch v-model="this.forceProxyHttps" active-color="#13ce66" class="input"/>
            </td>
          </tr>
          <tr>
            <td>限速：</td>
            <td>
              <el-input-number v-model="this.throttle" :min="0" class="input"/>
              kb/s
            </td>
          </tr>
          <tr>
            <td>Websocket：</td>
            <td>
              <el-switch v-model="this.wsIntercept" active-color="#13ce66" class="input"/>
            </td>
          </tr>
          <tr>
            <td>Anyproxy 网页：</td>
            <td>
              <el-switch active-color="#13ce66" v-model="this.webInterface.enable" class="input"/>
            </td>
          </tr>
          <tr>
            <td>
              网页端口：
            </td>
            <td>
              <el-input-number
                  class="input"
                  v-model="this.webInterface.webPort"
                  :min="80"
                  :max="65535"
                  :disabled="!webInterface.enable"/>
            </td>
          </tr>
        </table>

        <div>
          <!--确认-->
          <el-button :icon="Check" @click="this.close()" class="proxySettingsButton" size="large" circle/>
          <!--取消-->
          <el-button :icon="Close" @click="this.$emit('close')" class="proxySettingsButton" size="large" circle/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {Check, Close} from "@element-plus/icons-vue"

const fs = require("fs/promises")

const methods = {close}

function setup() {
  return {Check, Close}
}

function data() {
  return {...STORE.get("anyproxySettings")}
}

function close() {
  // 保存配置
  STORE.set("anyproxySettings", {
    port: this.port,
    forceProxyHttps: this.forceProxyHttps,
    throttle: this.throttle,
    wsIntercept: this.wsIntercept,
    webInterface: {...this.webInterface}
  })
  // 通知父组件关闭窗口
  this.$emit("close")
}

export default {
  name: "ProxySettings",
  setup,
  data,
  methods
}
</script>

<style scoped lang="less">
@import "../css/variable";

@InlineWindowWidth: 400px;

// 居中的虚拟窗口，屏幕中央显示一个小窗口
.InlineWindow {
  @height: 325px;

  border: @crudeBorder;
  background-color: @backgroundColor;
  width: @InlineWindowWidth;
  height: @height;
  position: absolute;
  top: calc(50vh - @InlineWindowWidth / 2);
  left: calc(50vw - @height / 2);
  border-radius: @mainWindowRadius;
  padding: 20px;
  z-index: 9999;
}

// 服务器设置的内容区
.content {
  --el-bg-color: @backgroundColor;
  --el-button-active-bg-color: @backgroundColor;
  --el-color-primary: black;
  width: 100%;
  height: 100%;
}

// 代理设置的确认和取消按钮
.proxySettingsButton {
  margin-top: 10px;
  @margin: calc(@InlineWindowWidth / 4 - @elButtonWidth / 2) !important;

  &:first-child {
    margin-left: @margin;
  }

  &:last-child {
    float: right;
    margin-right: @margin;
  }
}
</style>

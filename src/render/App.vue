<!--
页面主页

author: aszswaz
-->
<!--suppress SpellCheckingInspection, JSUnresolvedVariable, NpmUsedModulesInstalled -->
<template>
  <div class="home">
    <!--左边面板-->
    <div class="leftPanel">
      <div class="leftTopButton">
        <!-- 启动或关闭代理服务器 -->
        <div>
          <el-button
              :icon="CaretRight"
              v-if="!this.open"
              @click="this.startProxy()"
              size="large"
              title="开启代理服务"
              :loading="this.loading"
              circle/>
          <el-button
              :icon="CloseBold"
              v-if="this.open"
              @click="this.stopProxy()"
              :loading="this.loading"
              size="large"
              title="关闭代理服务"
              circle/>
        </div>

        <!--打开控制台窗口，展示主进程转发过来的所有日志信息-->
        <div>
          <el-button title="打开控制台" @click="this.openConsole()" size="large" circle>
            <img src="../../public/console.png" alt="暂无图片" style="width: 16px; height: 16px;"/>
          </el-button>
        </div>

        <!-- anyproxy 启动参数设置按钮 -->
        <div>
          <el-button :icon="Setting" @click="this.settings = true" size="large" title="设置代理服务" circle/>
        </div>

        <!--生成 HTTPS 证书-->
        <div>
          <el-button size="large" title="生成 HTTPS 证书" @click="this.exportCertificate()" circle>证书</el-button>
        </div>

        <!--打开软件文档-->
        <div>
          <el-button size="large" title="打开软件的操作文档" @click="this.openDocument()" circle>文档</el-button>
        </div>
      </div>

      <!--导航按钮-->
      <div class="leftNavigations">
        <router-link to="/" class="leftNavigation">抓包列表</router-link>
        <router-link to="/script" class="leftNavigation">脚本</router-link>
        <router-link to="/template" class="leftNavigation">模板</router-link>
      </div>
    </div>

    <!--右边面板-->
    <div class="rightPanel">
      <router-view/>
    </div>

    <!--anyproxy 参数设置窗口-->
    <proxy-settings @close="this.settings = false" v-if="this.settings"/>
  </div>
</template>

<script>
import {CaretRight, CloseBold, Setting, Delete, Document, CoffeeCup} from '@element-plus/icons-vue'
import ProxySettings from "./components/ProxySettings"
import {openConsole} from "./js/console"
import {ElMessage} from "element-plus"

const {ipcRenderer} = require("electron")

const methods = {startProxy, stopProxy, openConsole, exportCertificate, openDocument}
const components = {Delete, ProxySettings}

const ipcProxy = global.ipc.proxyServer
const ipcCode = global.ipc.code

function data() {
  return {
    // anyproxy 开启状态
    open: false,
    // 是否显示加载状态
    loading: false,
    // 是否显示代理服务器设置
    settings: false
  }
}

function setup() {
  return {
    CaretRight, CloseBold, Setting, Delete, Document, CoffeeCup
  }
}

async function mounted() {
  this.open = await ipcRenderer.invoke(ipc.proxyServer.STATUS)
}

/**
 * 启动 anyproxy 代理服务器
 */
async function startProxy() {
  const proxySettings = STORE.get("anyproxySettings")

  console.info("Request to start the proxy server.")
  // 请求主进程启动代理服务器
  let result = await ipcRenderer.invoke(ipcProxy.START)
  let message = "代理服务器启动成功！<br>"
  if (result.code === ipcCode.SUCCESS) {
    for (let address of IPV4_ADDRESS) {
      message += `${address.family}: ${address.address}<br>代理端口：${proxySettings.port}`
    }
    if (proxySettings.webInterface.enable) message += ` 网页端口：${proxySettings.webInterface.webPort}`
    this.open = true
    // 提示消息
    ElMessage.info({
      dangerouslyUseHTMLString: true,
      message,
      customClass: "elMessage"
    })
  } else {
    ElMessage.info({
      message: result.message,
      customClass: "elMessage"
    })
  }
}

/**
 * 关闭代理服务器
 */
async function stopProxy() {
  console.info("Stoping proxy server.")
  ipcRenderer.invoke(ipcProxy.STOP).then((result) => {
    if (result.code === ipcCode.SUCCESS) {
      ElMessage.info({
        message: "代理服务器已关闭！",
        customClass: "elMessage"
      })
      this.open = false
    } else {
      ElMessage.info({
        message: result.message,
        customClass: "elMessage"
      })
    }
  })
}

/**
 * 导出 HTTPS 证书
 */
function exportCertificate() {
  ipcRenderer.invoke(global.ipc.certificate.EXPORT).catch(e => console.error(e))
}

/**
 * 打开文档
 */
function openDocument() {
  const features = "width=1500px, height=1000px"
  window.open("file://" + config.documentHome, '_blank', features)
}

export default {
  name: "Home",
  setup,
  data,
  mounted,
  components,
  methods
}
</script>

<style scoped lang="less">
@import "./css/variable";

// 主页
.home {
  display: flex;
  width: 100%;
  height: 100%;
  flex: auto;
  flex-direction: row;
  background-color: @backgroundColor;
}

// 左面板
.leftPanel {
  display: inline-block;
  height: 100%;
  width: @leftPanelWidth;
  border-right: @thinBorder;
}

// 右边面板
.rightPanel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: calc(100% - @leftPanelWidth);
}

// 左边导航
.leftNavigations {
  @height: 120px;
  width: @leftPanelWidth - 1px;
  height: @height;
  position: absolute;
  top: calc(50% - @height / 2);
  left: 0;
}

// 选项
.leftNavigation {
  text-decoration-line: none;
  color: black;
  display: block;
  width: 100%;
  @height: 80px;
  height: @height;
  text-align: center;
  // 文字水平居中
  line-height: @height - 20px;
  border-bottom: @thinBorder;
  outline: none;
  // 文字竖立
  writing-mode: tb-rl;

  &:first-child {
    border-top: @thinBorder;
  }
}

// 左上按钮
.leftTopButton {
  display: flex;
  flex-direction: column;
  position: absolute;
  min-height: 80px;
  top: 20px;
}

.leftTopButton {
  left: calc(@leftPanelWidth / 2 - @elButtonWidth / 2);
}

.leftTopButton > div {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
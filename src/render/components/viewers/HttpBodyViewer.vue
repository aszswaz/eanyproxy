<!--
展示 HTTP body

@author: aszswaz
@date: 2022-04-22 15:39:47
@IDE: WebStorm
-->
<template>
  <div v-if="this.body && this.contentType">
    <!--是文本，并且长度小于指定要求-->
    <div v-if="typeof this.body === 'string' && this.body.length < this.maxTextLength" class="httpTextBody">
      <!--是 JSON-->
      <http-json-viewer v-if="this.contentType.dataType === enums.CONTENT_TYPE_JSON" :j-data="this.body"/>
      <!--是 JS、XML、HTML、CSS 代码，或者普通文本-->
      <div v-else v-html="this.formatBody(this.contentType, this.body)"/>
    </div>

    <!--无法展示的 HTTP BODY，提示用户导出到文件-->
    <h3 v-else style='text-align: center;'>数据无法展示，请导出到文件，使用其他工具查看</h3>
  </div>
</template>

<script>
import HttpJsonViewer from "./HttpJsonViewer"
import {formatBody} from "../../js/Util"

const props = {
  contentType: null,
  body: null
}

const components = {
  HttpJsonViewer
}

function setup() {
  return {
    maxTextLength: global.config.maxTextLength,
    enums: global.enums,
    formatBody
  }
}

export default {
  name: "HttpBodyViewer",
  props, setup, components
}
</script>

<style scoped lang="less">

// http 的 body 是文本
.httpTextBody {
  white-space: pre;
}

</style>
<!--
json 树展示器

@author: aszswaz
@date: 2022-04-22 15:28:16
@IDE: WebStorm
-->
<!--suppress HtmlUnknownTag -->
<template>
  <div v-if="typeof this.jData === 'string'">
    <json-viewer
        v-if="this.complete"
        :value='this.jObj' sort :show-array-index="false"/>
    <!--防止出现 JSON 格式错误的情况-->
    <p v-else>{{ this.jObj }}</p>
  </div>
</template>

<script>

const props = {
  jData: ""
}
const computed = {
  jObj
}

function data() {
  return {
    // json 格式是否完整
    complete: true
  }
}

function jObj() {
  try {
    return JSON.parse(this.jData)
  } catch (e) {
    this.complete = false
    return this.jData
  }
}

export default {
  name: "HttpJsonViewer",
  props, computed, data
}
</script>

<style scoped lang="less">

</style>
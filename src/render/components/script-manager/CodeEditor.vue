<!--
代码编辑器

@author: aszswaz
@date: 2022-02-22 19:22:23
@IDE: WebStorm
-->
<!--suppress JSUnresolvedVariable, JSUnusedGlobalSymbols -->
<template>
  <div/>
</template>

<!--Monaco editor 对象不能被 Vue 代理，因为 Monaco Editor 的对象结构非常复杂，并且数据变动的频率也极高，所以这里只能通过 setup 封装 Monaco-->
<script>
import * as monaco from "monaco-editor"

// 接收来自父组件的代码
const props = {
  script: Object
}

let editor

/**
 * 组件的 DOM 创建完毕之后，把 Monaco editor 挂载到组件的 DOM
 */
function mounted() {
  editor = monaco.editor.create(this.$el, {
    value: this.script.code,
    language: "javascript",
    // 高度自适应
    automaticLayout: true,
    // 代码小地图
    minimap: {
      enabled: true
    },
    // 光标平移动画
    cursorSmoothCaretAnimation: true,
    // 禁止编辑器可以滚动到最后一行加上一个屏幕的地方，也就是到最后一行就终止滚动
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 0,
    // 配置缩进 4 个空格
    tabSize: 4,
    insertSpaces: true,
    readOnly: this.script.readOnly
  })

  // 监听内容被修改
  editor.onDidChangeModelContent(() => {
    if (editor.getValue() !== this.script.code) {
      this.script.code = editor.getValue()
      // 表示此脚本已被用户修改
      this.script.alreadyEdited = true
    }
  })
}

/**
 * 组件的数据出现变化，修改编辑器内的文本，这样可以响应父组件切换代码文件的动作
 */
function updated() {
  // 如果父组件传入的文本和编辑器中的文本相等，就不修改编辑器的文本。防止 Vue 的数据修改事件，和 Monaco 的内容修改事件形成相互作用的死循环
  if (editor.getValue() !== this.script.code) editor.setValue(this.script.code)
  editor.updateOptions({readOnly: this.script.readOnly})
}

export default {
  name: "CodecEditor",
  props,
  mounted,
  updated
}

</script>
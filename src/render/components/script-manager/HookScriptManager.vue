<!--
HOOK 脚本管理器

@author: aszswaz
@date: 2022-02-28 14:02:29
@IDE: WebStorm
-->
<!--suppress JSUnusedGlobalSymbols -->
<template>
  <div class="HookScriptManager">
    <script-manager :script-infos="hooksInfo" :create-script="this.createHook" :delete-func="this.deleteHook">
      <template v-slot:allScriptOperateButton>
        <!--导出脚本-->
        <el-button class="scriptManagerButton" title="导出脚本或脚本模板" @click="this.exportScript()" circle>导出</el-button>
        <!--导入脚本-->
        <el-button class="scriptManagerButton" title="导入脚本或模板" @click="this.importScripts()" circle>导入</el-button>
      </template>

      <template v-slot:scriptCellOperate="{item, index}">
        <!--运行脚本按钮-->
        <el-button
            :icon="CaretRight" title="运行脚本"
            v-if="!item.running"
            :loading="loadingId === item.id"
            @click="this.startScript(item)"
            circle/>

        <!--停止脚本-->
        <el-button
            :icon="CloseBold" title="停止脚本"
            v-else
            :loading="loadingId === item.id"
            @click="this.stopScript(item)"
            circle/>
      </template>
    </script-manager>

    <!--模板选择器-->
    <template-select v-if="this.showTSelect"/>
    <!--脚本选择器，用于对脚本进行批量操作-->
    <script-selector v-if="this.ssData" :scripts="this.ssData"/>
    <!--展示脚本的比较结果-->
    <i-diff-scripts v-if="this.diffScripts" :diff-scripts="this.diffScripts"/>
  </div>
</template>

<script src="./js/HookScriptManager.js"/>
<style scoped lang="less" src="../../css/ScriptManager.less"/>
<style scoped lang="less">
@import "../../css/variable.less";

.HookScriptManager {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

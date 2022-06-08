<!--
anyproxy 代理的所有请求列表

author: aszswaz
-->
<!--suppress JSUnresolvedVariable, JSValidateTypes, JSUnusedGlobalSymbols, JSCheckFunctionSignatures, NpmUsedModulesInstalled -->
<template>
  <div class="http-requests" @mouseleave="this.hoverRow = -1">
    <!--抓包列表的请求页面手部-->
    <div class="http-requests-header">
      <!--清理请求数据-->
      <el-button :icon="Delete" @click="this.clearData()" size="large" title="删除所有请求" circle/>

      <div
          class="dataTypes"
          title="根据响应体的数据类型刷选数据">
        <el-checkbox-group v-model="this.dataTypes" style="display: inline-block;" @change="this.updateViewData()">
          <el-checkbox :label="enums.CONTENT_TYPE_JSON">JSON</el-checkbox>
          <el-checkbox :label="enums.CONTENT_TYPE_JAVASCRIPT">JAVASCRIPT</el-checkbox>
          <el-checkbox :label="enums.CONTENT_TYPE_CSS">CSS</el-checkbox>
          <el-checkbox :label="enums.CONTENT_TYPE_HTML">HTML</el-checkbox>
          <el-checkbox :label="enums.CONTENT_TYPE_XML">XML</el-checkbox>
          <el-checkbox :label="enums.CONTENT_TYPE_TEXT">TEXT</el-checkbox>
          <el-checkbox :label="enums.CONTENT_TYPE_FORM_DATA">FORM DATA</el-checkbox>
          <el-checkbox :label="enums.CONTENT_TYPE_BIN">OTHER</el-checkbox>
        </el-checkbox-group>
      </div>

      <!--用户输入用于过滤请求的关键词-->
      <el-input
          spellcheck="false"
          class="searchInput"
          v-model="this.word"
          placeholder="请输入关键词"
          title="根据关键词对 host 和 path 进行过滤"
          clearable/>

      <div
          class="searchInput"
          title="指定用关键词匹配哪些内容">
        <el-checkbox-group v-model="this.searchMode" :min="1">
          <el-checkbox label="URL"/>
          <el-checkbox label="BODY"/>
        </el-checkbox-group>
      </div>
    </div>

    <!-- HTTP 请求列表 -->
    <div class="http-request-internal">
      <div class="http-request-table" :style="{width: this.chooseData ? '48.5%' : '100%'}">
        <el-scrollbar>
          <table>
            <!-- 表格标题：#、HOST、METHOD、STATUS CODE、CONTENT TYPE、PATH -->
            <tr>
              <th style="width: 60px; padding-left: 10px;">#</th>
              <th style="width: 100px;">METHOD</th>
              <th style="width: 150px;">STATUS CODE</th>
              <th style="width: 200px;">CONTENT TYPE</th>
              <th style="width: 350px;">HOST</th>
              <th style="min-width: 200px;">PATH</th>
            </tr>

            <!--表格内容-->
            <tr v-for="(item, index) in this.viewData"
                :class="{activation: this.chooseData === item}"
                :key="item.id"
                @click.stop="this.chooseData = item">
              <!--序号-->
              <td style="padding-left: 10px;">{{ index + 1 }}</td>
              <!--请求方法-->
              <td>{{ item.request.method }}</td>
              <!--响应状态码-->
              <td v-if="item.response" :style="{'color': this.codeColor(item.response.code)}">
                {{ item.response.code }}
              </td>
              <td v-else>
                <loading class="rotateEast" style="width: 30px;"/>
              </td>
              <!--响应体类型-->
              <td :title="item.response && item.response.contentType ? item.response.contentType.name : ''">
                {{ item.response && item.response.contentType ? item.response.contentType.name : "——" }}
              </td>
              <!--域名-->
              <td :title="item.request.hostname + ':' + item.request.port">
                {{ item.request.hostname + ":" + item.request.port }}
              </td>
              <!--URL 路径-->
              <td :title="item.request.path">{{ item.request.path }}</td>
            </tr>
          </table>

          <el-empty v-if="this.viewData.length === 0" description="暂无数据"/>
        </el-scrollbar>
      </div>

      <!--HTTP 代理请求明细窗格-->
      <h-p-r-details
          class="HRDetailsTab"
          :data="this.chooseData"
          v-if="this.chooseData"
          @close="this.chooseData = null"/>
    </div>

    <!-- 分页 -->
    <el-pagination
        :total="total"
        layout="sizes, prev, pager, next, jumper, ->, total"
        :page-sizes="[60, 100, 500]"
        v-model:page-size="this.pageSize"
        v-model:current-page="this.currentPage"/>
  </div>
</template>

<script>
import {Loading, Delete} from "@element-plus/icons-vue"
import HPRDetails from "./HPRDetails"
import {codeColor} from "../js/Util.js"
import ViewDataManager from "../js/ViewDataManager"
import * as EventEnum from "../js/EventEnum"

const methods = {clearData, updateViewData}
const components = {Loading, HPRDetails}
// vue 的 watch 用于 data 中的指定字段被修改，那么触发指定函数
const watch = {
  pageSize: updateViewData,
  currentPage: resetViewData,
  word: resetViewData,
  searchMode: updateViewData
}

function data() {
  return {
    viewData: [],
    // 数据总量
    total: 0,
    // 每页显示个数选择器的选项设置
    pageSize: 60,
    // 当前页
    currentPage: 1,
    // 鼠标在表格内时，悬停的那一行
    hoverRow: -1,
    // 用户点击的数据
    chooseData: null,
    // 用于过滤请求的关键词
    word: null,
    // 搜索模式
    searchMode: [
      "URL"
    ],
    // 要展示到页面的数据类型
    dataTypes: []
  }
}

function setup() {
  return {Delete, codeColor, enums}
}

function mounted() {
  // 从缓存中获取数据
  this.updateViewData()
  // 监听新数据到达事件
  document.addEventListener(EventEnum.NEW_DATA, this.updateViewData)
}

function unmounted() {
  document.removeEventListener(EventEnum.NEW_DATA, this.updateViewData)
}

/**
 * 出现下列情况，更新数据展示视图
 * 1. 有新的数据到达时
 * 2. 用户修改每页展示的数据量时
 * 3. 用户改变当前页的页码时
 */
function updateViewData() {
  let dataCache = ViewDataManager.getData()
  if (!dataCache.length) return

  // 根据 response 的响应体类型进行过滤
  if (this.dataTypes.length) {
    dataCache = dataCache.filter(item => {
      if (!item.response) return false
      if (item.response.contentType) {
        for (let dataType of this.dataTypes) {
          if (dataType === item.response.contentType.dataType) return true
        }
      } else {
        // 用户选中了“其他”，那么无论是否存在响应体，都要展示到页面
        return this.dataTypes.includes(enums.CONTENT_TYPE_BIN)
      }
    })
  }

  // 根据用户设置的关键词过滤请求
  if (this.word && this.word.length) {
    dataCache = dataCache.filter(item => {
      for (const searchMode of this.searchMode) {
        switch (searchMode) {
          case "URL":
            if (item.request.url.includes(this.word)) return true
            break
          case "BODY":
            if (item.request.body && item.request.body.includes(this.word)) return true
            if (item.response && item.response.body && item.response.body.includes(this.word)) return true
            break
          default:
            console.warn("unknown searchMode:", searchMode)
        }
      }
    })
  }

  this.total = dataCache.length
  let start = (this.currentPage - 1) * this.pageSize, end = start + this.pageSize
  dataCache = dataCache.slice(start, end)
  this.viewData = dataCache
}

/**
 * 清理数据
 */
function clearData() {
  this.total = 0
  this.viewData = []
  ViewDataManager.clearData()
  this.chooseData = null
}

/**
 * 当 currentPage 或 word 被修改：
 * 1. 关闭请求明细窗口
 * 2. 更新视图中的数据列表
 */
function resetViewData() {
  this.chooseData = null
  this.updateViewData()
}

export default {
  name: "HttpRequestList",
  setup,
  data,
  mounted,
  unmounted,
  watch,
  components,
  methods
}
</script>

<style scoped lang="less">
@import "../css/variable";

@borderRadius: 10px;

// 外部边框
.http-requests {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px 20px;
  text-align: left;
}

// 页面头部
.http-requests-header {
  height: 60px;
  width: 100%;
  margin-bottom: 10px;

  .searchInput {
    width: 320px;
  }

  .dataTypes {
    width: 780px;
  }

  .searchInput, .dataTypes {
    display: inline-block;
    margin-left: 10px;
    font-size: 20px;
  }
}

// 内部边框，用于修饰表格
.http-request-internal {
  display: flex;
  flex-direction: row;
  border: @crudeBorder;
  border-radius: @borderRadius;
  height: 100%;
  width: 100%;
  // 裁剪子元素的边角，以免影响容器的圆角展示效果
  overflow: hidden;
  margin-bottom: 10px;
}

// HTTP 请求明细
.HRDetailsTab {
  display: inline-block;
  width: 51.5%;
  float: right;
  height: 100%;
}

// 请求列表
.http-request-table {
  table {
    border-collapse: collapse;
    width: 100%;
    // 表格和列的宽度通过表格的宽度来设置，某一列的宽度仅由该列首行的单元格决定。任何一个包含溢出内容的单元格可以使用 overflow  属性控制是否允许内容溢出。
    table-layout: fixed;

    tr {
      border-bottom: solid 1px black;
      height: 40px;

      // 鼠标非表格标题的某一行上
      &:not(&:first-child) {
        &:hover {
          background-color: @chooseColor;
        }
      }
    }

    td {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 用户点击某个元素
.activation {
  background-color: @chooseColor;
}
</style>
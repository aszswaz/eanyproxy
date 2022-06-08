<!--
HTTP 带请请求明细窗格

@author: aszswaz
@date: 2022-03-28 11:27:08
@IDE: WebStorm
-->
<!--suppress SpellCheckingInspection, JSCheckFunctionSignatures, JSUnresolvedFunction, JSUnresolvedVariable -->
<template>
  <div id="HRDetailsTab">
    <!--标签页-->
    <div class="tab">
      <div class="tab-button"
           :class="{active: this.activeTab === REQUEST_TAB}"
           @click="this.activeTab = REQUEST_TAB">
        请求
      </div>

      <div class="tab-button"
           :class="{active: this.activeTab === RESPONSE_TAB}"
           @click="this.activeTab = RESPONSE_TAB">
        响应
        <!--关闭“代理请求明细”窗格-->
        <el-button :icon="CloseBold" size="small" @click.stop="this.$emit('close')" circle style="float: right;"/>
      </div>
    </div>

    <div class="details">
      <el-scrollbar>
        <h-req-details v-if="this.activeTab === REQUEST_TAB" :request="this.data.request"/>
        <h-res-details v-else-if="this.activeTab === RESPONSE_TAB" :response="this.data.response" :id="this.data.id"/>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import {CloseBold} from "@element-plus/icons-vue"
import HReqDetails from "./HReqDetails"
import HResDetails from "./HResDetails"

// 定义标签页代码
const REQUEST_TAB = 1
const RESPONSE_TAB = 2

function data() {
  return {
    activeTab: 1
  }
}

function setup() {
  return {REQUEST_TAB, RESPONSE_TAB, CloseBold}
}

const props = {
  data: Object
}


export default {
  name: "HRDetailsTab",
  props, data, setup,
  components: {HReqDetails, HResDetails}
}
</script>

<style scoped lang="less">
@import "../css/variable";

@tabHeight: 40px;

// 请求明细窗格
#HRDetailsTab {
  overflow: hidden;
  border-left: @thinBorder;
}

// 选项卡
.tab {
  height: @tabHeight;
  width: 100%;
  border-bottom: @thinBorder;
  vertical-align: middle;
  text-align: center;

  .tab-button {
    display: inline-block;
    width: 50%;
    margin: 0;
    height: 100%;
    border: none;
    padding: 7px;

    &:not(&:first-child) {
      border-left: @thinBorder;
    }
  }

  // 活动的选项卡
  .active {
    background-color: @chooseColor;
  }
}

// 请求或响应明细
.details {
  height: calc(100% - @tabHeight);
  width: 100%;
}
</style>
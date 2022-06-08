import {createRouter, createWebHashHistory} from "vue-router"
import HttpRequestList from "../components/HttpRequestList"
import HookScriptManager from "../components/script-manager/HookScriptManager"
import TemplateManager from "../components/script-manager/TemplateManager"

const routes = [
    {
        // 抓包列表
        path: "/",
        name: "HttpRequestList",
        component: HttpRequestList
    },
    {
        // 脚本
        path: "/script",
        name: "HookScript",
        component: HookScriptManager
    },
    {
        // 模板
        path: "/template",
        name: "TemplateManager",
        component: TemplateManager
    }
]

// noinspection JSCheckFunctionSignatures
export default createRouter({
    routes,
    history: createWebHashHistory()
})

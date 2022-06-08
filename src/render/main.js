// noinspection SpellCheckingInspection,JSUnresolvedFunction

/**
 *  页面的 js 入口
 *
 * @author aszswaz
 */

import app from "./App"
import {createApp} from "vue"
import router from "./router"
import ElementPlus from "element-plus"
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import JsonViewer from "vue-json-viewer"
import init from "./init"

globalThis.__VUE_OPTIONS_API__ = true
globalThis.__VUE_PROD_DEVTOOLS__ = false

async function main() {
    await init()
    createApp(app)
        .use(ElementPlus, {locale: zhCn})
        .use(router)
        .use(JsonViewer)
        .mount("#app")
}

main().catch(console.error)

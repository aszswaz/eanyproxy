/**
 * 初始化应用程序的全局配置参数，参数之间有依赖关系，他们的初始化顺序不可随意改动
 *
 * @author aszswaz
 */

const path = require("path")
const {app} = require("electron")

// 关闭 electron 安全警告
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true"

const config = {
    // 软件的当前版本序号
    version: 1,
    development: false,
    applicationName: null,
    applicationDir: null,
    logsDir: null,
    // HOOK 脚本文件夹
    hooksDir: null,
    // 脚本模板文件夹
    templateDir: null,
    // 缓存文件夹
    cache: null,
    // 可显示在页面上的文本最大长度
    maxTextLength: 0,
    // 渲染进程基础 url
    renderBaseUrl: null,
    // anyproxy 代理设置
    anyproxySettingsFile: null,
    // 文档主页
    documentHome: null
}

config.development = process.argv.includes("--dev")
config.applicationName = app.getName()

if (config.development) {
    config.applicationDir = path.join(__dirname, "../../../" + config.applicationName)
    // 设置 electron 的数据输出路径
    app.setPath("userData", config.applicationDir)
} else {
    config.applicationDir = app.getPath("userData")
    config.cache = app.getPath("cache")
}

config.renderBaseUrl = path.join(__dirname, "../../../dist/render")
config.logsDir = app.getPath("logs")
config.hooksDir = path.join(config.applicationDir, "hooks")
config.templateDir = path.join(config.applicationDir, "templates")
config.cache = path.join(app.getPath("temp"), app.getName())
config.maxTextLength = 100 * 1000
config.anyproxySettingsFile = path.join(config.applicationDir, "anyproxy-settings.json")
config.documentHome = path.join(__dirname, "../../../dist/documents/home.html")

module.exports = config
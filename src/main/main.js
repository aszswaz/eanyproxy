// noinspection JSUnusedLocalSymbols,JSCheckFunctionSignatures

/**
 * electron 主程序入口
 *
 * @author aszswaz
 */

const {app, BrowserWindow, screen, Menu} = require("electron")
const path = require("path")
const config = require("./config")
const init = require("./init")

const iconPath = path.join(__dirname, "../../dist/public/icon.png")

async function main() {
    // 初始化程序配置、IPC 监听等
    await init()
    // 禁用菜单栏和状态栏
    if (!config.development) Menu.setApplicationMenu(null)
    // 等程序准备完毕后，打开窗口
    await app.whenReady()
    // 打开加载窗口和主窗口
    await openMainWindow(await openLoadWindow())
}

/**
 * 打开加载窗口
 */
async function openLoadWindow() {
    // 程序加载窗口
    const loadWin = new BrowserWindow({
        width: 580,
        height: 200,
        // 无边框
        frame: false,
        show: false,
        icon: iconPath,
        // webpack 生成的 js 会用到  global 对象，这是 nodejs 特有的，所以即使是在加载窗口也需要集成 node api
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });
    await loadWin.loadFile(`${config.renderBaseUrl}/loading.html`)
    loadWin.show()
    return loadWin
}

/**
 * 打开主窗口
 */
async function openMainWindow(loadWin) {
    const primaryDisplay = screen.getPrimaryDisplay()
    const {width: screenWidth, height: screenHeight} = primaryDisplay.size
    console.info("Primary display width:", screenWidth, ", height:", screenHeight)
    const {width: workWidth, height: workHeight} = primaryDisplay.workAreaSize
    console.info("Primary display work area width:", workWidth, ", height:", workHeight)

    // 打开主窗口
    global.MAIN_WIN = new BrowserWindow({
        // 不知道为什么，小数的存在会导致窗口的宽高存在很大的偏差，这里通过 parseInt 去除小数部分
        width: parseInt(workWidth * 0.9),
        height: parseInt(workHeight * 0.9),
        show: false,
        icon: iconPath,
        center: true,
        spellcheck: false,
        enableWebSQL: false,
        autoHideMenuBar: true,
        webPreferences: {
            // 是否启用浏览器的开发者工具
            devTools: config.development, // 渲染进程可调用 nodejs API
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, "./config/preload.js"),
            webSecurity: false
        }
    })

    await MAIN_WIN.loadFile(`${config.renderBaseUrl}/index.html`)
    loadWin.close()
    MAIN_WIN.show()
    // 打开浏览器的开发者工具
    MAIN_WIN.webContents.openDevTools({activate: config.development, mode: "bottom"})
    MAIN_WIN.webContents.setWindowOpenHandler(subWindowOpenHandler)
    global.MAIN_WEB_CONTENTS = MAIN_WIN.webContents
    global.MAIN_WEB_CONTENTS.on("destroyed", _ => global.MAIN_WEB_CONTENTS = null)
}

/**
 * 渲染进程通过 window.open 创建窗口时，调用此函数，主要是为了“文档”功能可以通过默认浏览器打开不受信任的网址
 */
function subWindowOpenHandler(details) {
    return {
        action: "allow",
        overrideBrowserWindowOptions: {
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            }
        }
    }
}

if (require.main === module) {
    main().catch(console.error)
}

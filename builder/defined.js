/**
 * 通用常量声明
 *
 * @author aszswaz
 * @date 2022-04-25
 */

const path = require("path")

const PROJECT_DIR = path.join(__dirname, "../")

const CHILD_OPTIONS = {
    cwd: PROJECT_DIR,
    stdio: "inherit"
}

// 主进程源代码
const SOURCE_MAIN_DIR = path.join(PROJECT_DIR, "src/main")
// 编译得到的源代码存放路径
const DIST_DIR = path.join(PROJECT_DIR, "dist")
// 编译得到的主进程代码存放路径
const DIST_MAIN_DIR = path.join(DIST_DIR, "main")
// 文档文件夹
const DIST_DOCUMENT_DIR = path.join(DIST_DIR, "documents")
// electron-builder 所需的文件夹
const APPLICATION_DIR = path.join(PROJECT_DIR, "app")
// 需要排除的运行时依赖，通常是网页当中的 js 运行所需的依赖，但它们都被 webpack 整合了
const EXCLUDE_DEPEND = [
    "vue", "vue-router", "element-plus", "@element-plus/icons-vue"
]

module.exports = {
    PROJECT_DIR,
    CHILD_OPTIONS,
    SOURCE_MAIN_DIR,
    DIST_DIR,
    DIST_MAIN_DIR,
    DIST_DOCUMENT_DIR,
    APPLICATION_DIR,
    EXCLUDE_DEPEND
}

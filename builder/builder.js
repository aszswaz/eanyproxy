// noinspection JSUnresolvedFunction,JSValidateTypes

/**
 * 构建项目
 *
 * @author aszswaz
 * @date 2022-04-25
 */

const {execSync} = require("child_process")
const {
    CHILD_OPTIONS,
    SOURCE_MAIN_DIR,
    DIST_MAIN_DIR,
    DIST_DIR,
    DIST_DOCUMENT_DIR,
    APPLICATION_DIR,
    EXCLUDE_DEPEND,
    PROJECT_DIR
} = require("./defined")
const fs = require("fs/promises")
const {existsSync} = require("fs")
const path = require("path")
const UglifyJS = require("uglify-js")
const Options = require("./Options")

async function main() {
    const options = new Options()
    await init()
    await compiler(options.compress)
    if (options.all)
        await buildAll()
    else
        await buildSingle(options.platform)

}

/**
 * 初始化
 */
async function init() {
    if (existsSync(DIST_DIR)) await fs.rm(DIST_DIR, {recursive: true})
    if (existsSync(APPLICATION_DIR)) await fs.rm(APPLICATION_DIR, {recursive: true})
    await fs.mkdir(DIST_DIR)
    await fs.mkdir(DIST_MAIN_DIR)
    await fs.mkdir(APPLICATION_DIR)
}

/**
 * 编译 JS 代码，主要是进行压缩、删除注释
 */
async function compiler(compress) {
    // 编译渲染进程代码
    console.info("Compiling renderer code...")
    execSync("webpack --config config/webpack-render-pro.js", CHILD_OPTIONS)
    // 处理主进程代码
    console.info("Compressing code")
    if (compress) {
        // 压缩代码
        await compressCode(SOURCE_MAIN_DIR, DIST_MAIN_DIR)
        // 复制压缩后的主进程代码
        await fs.cp(DIST_MAIN_DIR, path.join(APPLICATION_DIR, "src/main"), {recursive: true})
    } else {
        // 不压缩代码
        fs.cp(SOURCE_MAIN_DIR, path.join(APPLICATION_DIR, 'src/main'), {recursive: true})
    }
    // 编译文档
    execSync("node ./document/ToDoc.js", CHILD_OPTIONS)

    // 生成 package
    const packageJson = require(path.join(PROJECT_DIR, "package.json"))
    delete packageJson.devDependencies
    for (const key of EXCLUDE_DEPEND) {
        if (packageJson.dependencies.hasOwnProperty(key)) {
            delete packageJson.dependencies[key]
        }
    }

    // 输出 package.json
    await fs.writeFile(path.join(APPLICATION_DIR, "package.json"), JSON.stringify(packageJson, null, 2))
    // 复制编译后的渲染进程代码
    await fs.cp(path.join(PROJECT_DIR, 'dist/render'), path.join(APPLICATION_DIR, 'dist/render'), {recursive: true})
    // 复制文档
    await fs.cp(DIST_DOCUMENT_DIR, path.join(APPLICATION_DIR, 'dist/documents'), {recursive: true})
}

/**
 * 压缩主进程的代码
 */
async function compressCode(sourceDir, targetDir) {
    const dir = await fs.opendir(sourceDir)
    for await (const subFile of dir) {
        if (subFile.isDirectory()) {
            const subDir = path.join(sourceDir, subFile.name)
            if (subDir.endsWith(path.join("src/main/hook-template/templates"))) {
                // 是模板代码，直接复制
                fs.cp(subDir, path.join(DIST_MAIN_DIR, 'hook-template/templates'), {recursive: true});
            } else {
                // 不是模板代码，继续压缩
                await compressCode(subDir, path.join(targetDir, subFile.name))
            }
        } else {
            const sourceFile = path.join(sourceDir, subFile.name), targetFile = path.join(targetDir, subFile.name)
            console.info("Build: ", sourceFile, "->", targetFile)
            if (!existsSync(targetDir)) await fs.mkdir(targetDir, {"recursive": true})
            const sourceCode = await fs.readFile(sourceFile, {encoding: "utf-8"})
            await fs.writeFile(targetFile, UglifyJS.minify(sourceCode).code, {encoding: "utf-8"})
        }
    }
}

/**
 * 构建指定平台的安装包
 */
async function buildSingle(platform) {
    switch (platform) {
        case "win32":
            await require("./win32").builder()
            break
        case "linux":
            await require("./linux").builder()
            break
        case "mac":
            await require("./mac").builder()
            break
        default:
            throw new Error("Unknown platform: " + platform)
    }
}

if (require.main === module) main().catch(console.error)

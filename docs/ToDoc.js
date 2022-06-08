// noinspection JSCheckFunctionSignatures,SpellCheckingInspection

const {existsSync} = require("fs")
const fs = require("fs/promises")
const {spawn} = require("child_process")
const path = require("path")
const {v4: uuid} = require("uuid")
const {Buffer} = require("buffer")

const SOURCE_DIR = path.join(__dirname, ".")
const STYLE = "markdown.css"
const TARGET_DIR = path.join(__dirname, "../dist/documents")
let PANDOC_EXEC = null

/**
 * 从 Markdown 文档生成 Html 文件
 */
async function main() {
    try {
        if (!existsSync(SOURCE_DIR)) {
            console.error(`文件 ${SOURCE_DIR} 不存在`)
            process.exit(1)
            return
        }

        if (existsSync(TARGET_DIR)) await fs.rm(TARGET_DIR, {recursive: true})
        await fs.mkdir(TARGET_DIR, {recursive: true})
        // 查找 Pandoc
        PANDOC_EXEC = await getPandoc()
        // 编译 Markdown 文件
        await convert(SOURCE_DIR, TARGET_DIR)
        // 复制图片
        await copyImage()
    } catch (e) {
        console.info(e)
        process.exit(1)
    }
}

/**
 * 从系统中查找 pandoc 的程序所在位置
 */
async function getPandoc() {
    if (PANDOC_EXEC) return
    console.info("正在查找 Pandoc...")

    let filename, delimiter
    if (process.platform === "win32") {
        filename = "pandoc.exe"
        delimiter = ";"
    } else {
        filename = "pandoc"
        delimiter = ":"
    }

    const paths = process.env.PATH.split(delimiter)
    for (const item of paths) {
        const pandoc = path.join(item, filename)
        if (existsSync(pandoc)) {
            console.info("Pandoc path:", pandoc)
            return pandoc
        }
    }
    throw new Error("查找 Pandoc 失败，请先安装 Pandoc，并确保 Pandoc 的安装路径在 PATH 变量中，Pandoc github：https://github.com/jgm/pandoc")
}

/**
 * 转换 Markdown 为 html
 */
async function convert(sourceDir, targetDir) {
    const subFiles = await fs.opendir(sourceDir);
    if (!existsSync(targetDir)) await fs.mkdir(targetDir, {recursive: true})
    for await (const subFile of subFiles) {
        if (subFile.isDirectory()) {
            await convert(path.join(sourceDir, subFile.name), path.join(targetDir, subFile.name))
        } else if (/.+.md/.test(subFile.name)) {
            const mdFile = path.join(sourceDir, subFile.name)
            const htmlFile = path.join(targetDir, subFile.name.substring(0, subFile.name.lastIndexOf("."))) + ".html"
            console.info(mdFile, "->", htmlFile)
            let mdCode = await fs.readFile(mdFile, {encoding: "utf-8"})

            // 匹配文档超链接
            const mdLinkReg = /\[.*]\((?!:\/\/).+.md\)/g
            let result
            // 文档中，其他的 md 文档的超链接，改为 html 链接
            while (result = mdLinkReg.exec(mdCode)) {
                result = result[0]
                let mdl = result.substring(result.indexOf("(") + 1, result.lastIndexOf(")"))
                mdl = mdl.substring(0, mdl.lastIndexOf(".")) + ".html"
                const newMdl = result.substring(0, result.indexOf("(") + 1) + mdl + ")"
                mdCode = mdCode.replaceAll(result, newMdl)
            }

            // 使用 pandoc 把 Markdown 转为 html
            const pandoc = spawn(
                PANDOC_EXEC,
                ["-f", "markdown", "-t", "html", "-o", htmlFile, "-c", STYLE, "--template", "template.html", "-s", "-M", "title=eanyproxy"],
                {
                    cwd: path.join(__dirname),
                    stdio: ["pipe", 'inherit', 'inherit'],
                    env: process.env
                }
            )
            pandoc.stdin.write(Buffer.from(mdCode))
            pandoc.stdin.end()
        }
    }
}

/**
 * 复制图片
 */
async function copyImage() {
    const sourceDir = path.join(SOURCE_DIR, "image")
    const targetDir = path.join(TARGET_DIR, "image")
    await fs.cp(sourceDir, targetDir, {recursive: true})
}

// 如果当前模块是程序的入口模块
if (require.main === module) main().catch(console.error)

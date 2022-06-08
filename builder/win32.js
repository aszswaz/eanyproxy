/**
 * 给 windows10 操作系统打包
 *
 * @author aszswaz
 * @date 2022-04-25
 */

const {execSync} = require("child_process")
const {
    CHILD_OPTIONS,
    PROJECT_DIR
} = require("./defined")
const path = require("path")

module.exports.builder = async function () {
    execSync(`electron-builder --config ${path.join(PROJECT_DIR, 'config/electron-builder-win-zip.js')} --x64 --win`, CHILD_OPTIONS)
    execSync(`electron-builder --config ${path.join(PROJECT_DIR, 'config/electron-builder-win-nsis.js')} --x64 --win`, CHILD_OPTIONS)
    execSync(`electron-builder --config ${path.join(PROJECT_DIR, 'config/electron-builder-win-msi.js')} --x64 --win`, CHILD_OPTIONS)
}

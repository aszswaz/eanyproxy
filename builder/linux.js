/**
 打包 linux 平台下的安装包

 @author: aszswaz
 @date: 2022-04-28 17:32:31
 @IDE: WebStorm
 */

const {execSync} = require("child_process")
const path = require("path")
const {
    CHILD_OPTIONS,
    PROJECT_DIR
} = require("./defined")

module.exports.builder = async function () {
    execSync(`electron-builder --config ${path.join(PROJECT_DIR, "config/electron-builder-linux-tar-gz.js")} --x64 --linux`, CHILD_OPTIONS)
    execSync(`electron-builder --config ${path.join(PROJECT_DIR, "config/electron-builder-linux-AppImage.js")} --x64 --linux`, CHILD_OPTIONS)
}
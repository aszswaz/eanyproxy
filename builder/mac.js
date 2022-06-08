/**
 打包 mac os 应用程序

 @author: aszswaz
 @date: 2022-04-28 17:50:01
 @IDE: WebStorm
 */
const {execSync} = require("child_process")
const {
    CHILD_OPTIONS,
    PROJECT_DIR
} = require("./defined")
const path = require("path")

module.exports.builder = async function () {
    execSync(`electron-builder --config ${path.join(PROJECT_DIR, "config/electron-builder-mac-dmg.js")}`, CHILD_OPTIONS)
    execSync(`electron-builder --config ${path.join(PROJECT_DIR, "config/electron-builder-mac-zip.js")}`, CHILD_OPTIONS)
}
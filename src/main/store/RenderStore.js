// noinspection JSCheckFunctionSignatures

/**
 用于渲染进程的存储库对象

 @author: aszswaz
 @date: 2022-06-07 12:18:34
 @IDE: WebStorm
 */
const Store = require("electron-store")

module.exports = new Store({
    schema: require("./Schema"),
    defaults: require("./Defaults")
})
// noinspection JSCheckFunctionSignatures

/**
 electron-store 用户配置数据存储库，用于主进程

 @author: aszswaz
 @date: 2022-05-25 11:08:22
 @IDE: WebStorm
 */
const Store = require("electron-store")

module.exports = new Store({
    schema: require("./Schema"),
    defaults: require("./Defaults"),
    // 当软件的版本更新时，也要对 store 中的数据进行更新
    migrations: {
        "1.0.0": require("./Migrations100")
    }
})
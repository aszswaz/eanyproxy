// noinspection SpellCheckingInspection

const publicConfig = require('./electron-builder-public')

publicConfig.electronDownload.platform = "win32"
// windows 编译配置
publicConfig.win = {
    target: "msi",
    icon: "public/icon.ico"
}

module.exports = publicConfig

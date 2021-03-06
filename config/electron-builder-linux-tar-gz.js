// noinspection SpellCheckingInspection
// 引入公共配置
const publicConfig = require('./electron-builder-public')

// 设置系统平台
publicConfig.electronDownload.platform = "linux"

// linux 编译配置
publicConfig.linux = {
    target: "tar.gz",
    icon: "public/icon.png",
    category: "Development"
}

module.exports = publicConfig

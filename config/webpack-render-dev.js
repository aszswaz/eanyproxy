const publicConfig = require('./webpack-render-public')
const path = require("path");

// 设置 webpack 的编译模式为开发模式
publicConfig.mode = "development"
publicConfig.devtool = "inline-source-map"
// 增量编译配置
publicConfig.cache = {
    type: "filesystem",
    // 缓存依赖，当依赖修改时，依赖的缓存就会失效
    buildDependencies: {
        // 当 webpack 的配置修改时，让项目依赖的缓存是小
        config: [__filename]
    },
    // 缓存文件夹
    cacheDirectory: path.join(__dirname, "../node_modules/.cache/webpack")
}

module.exports = publicConfig
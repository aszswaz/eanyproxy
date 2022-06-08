// noinspection JSUnresolvedFunction

const {VueLoaderPlugin} = require("vue-loader")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const {ElementPlusResolver} = require('unplugin-vue-components/resolvers')
const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')
const {minify} = require("./config")
const path = require("path")

/**
 * webpack 的公共配置
 */
module.exports = {
    // 指定编译目标为 electron 的渲染进程
    target: "electron-renderer",
    // 渲染进程入口文件
    entry: {
        main: path.join(__dirname, "../src/render/main.js"),
        loading: path.join(__dirname, "../src/render/css/loading.less")
    },
    output: {
        path: path.join(__dirname, "../dist/render"),
        filename: "[name].js"
    },
    resolve: {
        // 没有后缀的模块，尝试添加指定的后缀
        extensions: ['*', '.js', '.vue', '.mjs', '.less']
    },
    plugins: [
        // vue 插件
        new VueLoaderPlugin(),
        // 程序加载页面
        new HtmlWebpackPlugin({
            filename: "loading.html",
            template: path.join(__dirname, "../public/loading.html"),
            minify,
            chunks: ['loading']
        }),
        // 程序主窗口
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: path.join(__dirname, "../public/index.html"),
            minify,
            chunks: ["main"]
        }),
        // element-plus 的 vue 组件自动加载
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
        // Monaco 文本编辑器打包插件
        new MonacoEditorPlugin({
            languages: ['javascript', 'css', 'html', 'typescript', 'json']
        })
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: [
                    {loader: "vue-loader"}
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {loader: "vue-style-loader"},
                    {loader: "css-loader"}
                ]
            },
            {
                // 处理图片
                test: /\.(jpg|jpeg|png|gif)$/,
                // webpack5中使用assets-module（url-loader已废弃）
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        // 小于 10kb 的图片转换为 Base64
                        maxSize: 10 * 1024
                    }
                },
                generator: {
                    // 图片的输出路径，[name] 是图片原本的名称，[hash:8] 是给图片生成一个8位的 hashcode，[ext] 是文件的后缀名
                    filename: 'img/[name]-[hash:8][ext]'
                }
            },
            {
                test: /\.mjs$/,
                resolve: {
                    // 项目的依赖的库当中如果存在 .mjs 文件，webpack 会强制要求导入模块的时候，加上文件的后缀名，这会导致打包失败，需要显式禁用
                    fullySpecified: false
                }
            },
            {
                // 把 less 重写为 css，less 是 css 的一个分支
                test: /\.less$/,
                use: [
                    // compiles Less to CSS
                    "style-loader",
                    "css-loader",
                    "less-loader"
                ]
            }
        ]
    }
}
/**
 解析控制台参数

 @author: aszswaz
 @date: 2022-05-18 14:21:56
 @IDE: WebStorm
 */

const {program} = require("commander");

/**
 * 解析命令行参数
 */
module.exports = class Options {
    platform
    all
    release
    compress

    constructor() {
        program
            .option("-p, --platform <char>", "目标平台 win32、linux、darwin")
            .option("-a, --all", "依次构建支持的所有平台，设置此参数，则忽略 --platform 参数")
            .option("-r, --release", "打包成功后，发布安装包到在线平台")
            .option("-c, --compress", "压缩主进程的 JS 代码")
        program.parse()
        const opt = program.opts()

        this.platform = opt.platform
        // !!opt.all 表示 opt.all ? true : false，作用是命令行和传入的参数当中，有该选项就开启相应的功能
        this.all = !!opt.all
        this.release = !!opt.release
        this.compress = !!opt.compress
    }
}
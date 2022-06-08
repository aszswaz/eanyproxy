// noinspection JSUnusedGlobalSymbols,DuplicatedCode

/**
 把数据输出到 excel 文件

 @author: aszswaz
 @date: 2022-04-07 10:20:18
 @IDE: WebStorm
 */

const ExcelJS = require("exceljs")
const path = require("path")

let username, userHome
if (process.platform === "win32") {
    username = process.env["USERNAME"]
    userHome = process.env["USERPROFILE"]
} else {
    username = process.env["USER"]
    userHome = process.env["HOME"]
}

const workbook = new ExcelJS.Workbook()
// 文件创建人，process.env.USER 是当前系统（Windows、Linux、Mac OS）登陆的用户名
workbook.creator = username
// 文件最后修改人
workbook.lastModifiedBy = username
// 文件创建时间
workbook.created = new Date()
// 文件修改时间
workbook.modified = new Date()

const sheet = workbook.addWorksheet("demo")
// 设置列和列宽
sheet.columns = [
    {header: '地址', key: 'url', width: 10},
    {header: '文本', key: 'text', width: 20},
]

/**
 * 响应发送之前
 */
function beforeResponse(request, response) {
    if (response.code === 200 && response.contentType.dataType === global.enums.CONTENT_TYPE_JSON) {
        const body = JSON.parse(response.body)
        sheet.addRow([request["url"], body["tagline"]])
    }
}

/**
 * 停止脚本时，程序会调用此函数，可以利用该函数进行资源回收
 */
function finish() {
    workbook.xlsx.writeFile(path.join(userHome, "demo.xlsx")).catch(console.error)
}

module.exports = {
    beforeResponse, finish
}

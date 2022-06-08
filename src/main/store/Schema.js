/**
 electrons-store 数据库结构定义，规范文档：https://json-schema.org/understanding-json-schema/

 @author: aszswaz
 @date: 2022-06-02 13:58:09
 @IDE: WebStorm
 */

const {store: magVStore} = require("../config/MagicalValue")

// HOOK 和模板数据结构
const codeSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            id: {
                type: "string"
            },
            name: {
                type: "string"
            },
            readOnly: {
                type: "boolean"
            },
            // 代码文件
            file: {
                type: "string"
            },
            // 创建时间，单位：毫秒
            createTime: {
                type: "integer"
            },
            // 修改时间， 单位：毫秒
            modifyTime: {
                type: "integer"
            },
            md5: {
                type: "string"
            }
        },
        additionalProperties: false,
        // 对象必须具备的属性
        required: [
            "id",
            "name",
            "readOnly",
            "file",
            "createTime",
            "modifyTime",
            "md5"
        ]
    }
}

// 用户的 GUI 操作历史记录
const historyRecord = {
    // 类型：对象
    type: "object",
    // 对象拥有的属性
    properties: {
        // 上次通过“保存文件对话框”获取的路径
        lastSaveDialogPath: {
            type: "string"
        },
        // 上次通过“打开文件对话框”获取的路径
        lastOpenDialogPath: {
            type: "string"
        }
    },
    // 是否可以添加 properties 定义之外的属性
    additionalProperties: false
}

// anyproxy 设置
const anyproxySettings = {
    type: "object",
    properties: {
        port: {
            type: "integer",
            minimum: 1,
            maximum: 65535
        },
        // HTTPS 代理
        forceProxyHttps: {
            type: "boolean"
        },
        // 网速控制
        throttle: {
            type: "integer"
        },
        // websocket 代理
        wsIntercept: {
            type: "boolean"
        },
        // anyproxy 网页
        webInterface: {
            type: "object",
            properties: {
                enable: {
                    type: "boolean"
                },
                webPort: {
                    type: "integer",
                    minimum: 1,
                    maximum: 65535
                }
            },
            additionalProperties: false,
            required: [
                "enable",
                "webPort"
            ]
        }
    },
    additionalProperties: false,
    required: [
        "port",
        "forceProxyHttps",
        "throttle",
        "wsIntercept",
        "webInterface"
    ]
}

module.exports = {
    // 版本数字
    version: {
        type: "integer"
    },
    // 历史记录
    historyRecord,
    // HOOK 脚本的信息
    hooks: codeSchema,
    // 模板信息
    templates: codeSchema,
    // anyproxy 设置
    anyproxySettings
}
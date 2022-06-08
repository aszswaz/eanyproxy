/**
 * IPC 远程通信命令
 *
 * @author aszswaz
 */

const code = {
    // 请求成功
    SUCCESS: 200,
    // 用户取消请求
    CANCEL: 300,
    // 请求执行时出现未知错误
    UNKNOWN_ERROR: 500
}

/**
 * 操作 anyproxy 代理服务的 IPC
 */
const proxyServer = {
    // 启动代理服务器
    START: "IPC_PROXY_SERVER_START",
    // 停止代理服务器
    STOP: "IPC_PROXY_SERVER_STOP",
    // 主进程和渲染进程之间的代理请求的数据传输
    DATA: "IPC_PROXY_SERVER_DATA",
    // 查询代理状态
    STATUS: "IPC_PROXY_SERVER_STATUS"
}

/**
 * 构建 IPC 响应体
 */
const response = {
    toSuccess(data) {
        return {
            code: code.SUCCESS,
            data: data,
            message: "请求执行成功！"
        }
    },
    toUnknownError(message) {
        return {
            code: code.UNKNOWN_ERROR,
            message: message ? message : "未知错误，请联系开发者！"
        }
    }
}

/**
 * 用户的 HOOK 相关操作
 */
const hook = {
    // 运行 HOOK 脚本
    RUN: "IPC_HOOK_RUN",
    // 停止 HOOK 脚本
    STOP: "IPC_HOOK_STOP",
    // 当前正在运行的 HOOK 脚本
    CURRENT_RUN: "IPC_HOOK_CURRENT_RUN",
    // 导出脚本
    EXPORT: "IPC_HOOK_EXPORT",
    // 导入脚本
    IMPORT: "IPC_HOOK_IMPORT"
}

/**
 * HOOK 模板操作
 */
const template = {
    GET_ALL: "IPC_TEMPLATE_GET_ALL",
    DELETE: "IPC_TEMPLATE_DELETE",
    SAVE: "IPC_TEMPLATE_SAVE"
}

/**
 * 日志相关
 */
const logger = {
    // 接收渲染进程的日志
    LOGGER: "IPC_LOGGER",
}

/**
 * HTTPS 证书
 */
const certificate = {
    // 导出 HTTPS 证书
    EXPORT: "IPC_PROXY_CERTIFICATE_EXPORT"
}

module.exports = {
    code,
    proxyServer,
    response,
    hook,
    logger,
    template,
    certificate,
    CONFIG: "IPC_GET_CONFIG"
}
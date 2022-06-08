// noinspection JSUnusedGlobalSymbols

/**
 HOOK 脚本骨架

 @author: aszswaz
 @date: 2022-02-26 17:12:44
 @IDE: WebStorm
 */

/**
 * 程序收到代理请求，发送给目标服务器之前
 */
function beforeRequest(request) {
    console.info(request)
}

/**
 * 程序收到目标服务器的响应，发送给客户端之前
 */
function beforeResponse(request, response) {
    console.info(request, response)
}

/**
 * 停止脚本时，程序会调用此函数，可以利用该函数进行资源回收
 */
function finish() {}

module.exports = {
    beforeRequest,
    beforeResponse,
    finish
}

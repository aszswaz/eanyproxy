/**
 electron-store 存储库默认值

 @author: aszswaz
 @date: 2022-06-02 14:02:15
 @IDE: WebStorm
 */

// anyproxy 默认设置
const anyproxySettings = {
    port: 8080,
    forceProxyHttps: true,
    throttle: 10000,
    wsIntercept: false,
    webInterface: {
        enable: false,
        webPort: 8002
    }
}

module.exports = {
    anyproxySettings
}
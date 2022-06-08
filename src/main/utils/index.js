// noinspection JSUnresolvedVariable,JSUnresolvedFunction,JSCheckFunctionSignatures

const {networkInterfaces} = require("os")
const AnyProxy = require("anyproxy")
const {shell, dialog, app} = require("electron")

/**
 * 获得本机外部 IP 地址
 */
function getIpv4() {
    const interfaces = networkInterfaces()
    let ipv4Address = []
    for (let networkCard in interfaces) {
        for (let bind of interfaces[networkCard]) {
            if (!bind.internal && bind.family === "IPv4") {
                ipv4Address.push({address: bind.address, family: bind.family})
            }
        }
    }
    return ipv4Address
}

/**
 * 生成 HTTPS 证书
 *
 * @return 证书路径
 */
function genCrt() {
    return new Promise((resolve, reject) => {
        const certMgr = AnyProxy.utils.certMgr
        if (!certMgr.ifRootCAFileExists()) {
            certMgr.generateRootCA((error, keypath) => {
                if (!error) {
                    resolve(keypath)
                } else {
                    reject(error)
                }
            })
        } else {
            resolve(certMgr.getRootCAFilePath())
        }
    })
}

/**
 * 生成 HTTPS 证书，并打开证书所在目录
 */
async function genCrtAndOpen() {
    shell.showItemInFolder(await genCrt())
}

module.exports = {
    getIpv4,
    genCrtAndOpen,
    genCrt
}

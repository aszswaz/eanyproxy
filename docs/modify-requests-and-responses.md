# 修改请求

可修改的请求参数如下

```js
const {cloneDeep} = require("lodash")

/**
 * 修改请求数据
 */
function beforeRequest(request) {
    if (request.hostname === "localhost") {
        // 复制对象，防止多个 HOOK 同时运行产生的影响
        request = cloneDeep(request)
        if (request.contentType)
            request.headers["Content-Type"] = "text/html; charset=" + request.contentType.charset
        else
            request.headers["Content-Type"] = "text/html"
        
        // 修改请求参数

        // body 可以是 string、number、boolean、object，number和boolean 等同于文本，object 等同于 json
        request.body = {
            "message": "Hello World"
        }
        return request
    }
}

module.exports = {
    beforeRequest
}
```

# 不发送请求，直接响应客户端

```js
const {cloneDeep} = require("lodash");

/**
 * 不发送请求，直接向客户端发送数据
 */
function beforeRequest(request) {
    if (request.hostname === "localhost") {
        request = cloneDeep(request)
        request.response = {
            code: 200,
            header: {
                "Content-Type": "application/json"
            },
            body: {
                message: "Hello World"
            }
        }
        return request
    }
}

module.exports = {
    beforeRequest
}
```

# 修改响应

```js
const {cloneDeep} = require("lodash");

/**
 * 修改响应数据
 */
function beforeResponse(request, response) {
    if (request.hostname === "localhost") {
        response = cloneDeep(response)
        if (response.contentType)
            response.headers["Content-Type"] = "text/html; charset=" + response.contentType.charset
        else
            response.headers["Content-Type"] = "text/html"

        // body 可以是 string、number、boolean、object，number和boolean 等同于文本，object 等同于 json
        response.body = {
            code: 404,
            message: "Not Found"
        }
        response.code = 404
        return response
    }
}

module.exports = {
    beforeResponse
}
```

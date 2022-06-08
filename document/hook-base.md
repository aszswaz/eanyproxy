### HOOK 脚本基本格式

HOOK 脚本的基本格式如下

```js
/**
 * 对请求进行过滤
 * 被过滤的请求不会出现在请求列表中，但依旧会发送到目标服务器
 * beforeRequest 函数优先于该函数被执行，所以该函数不会对 beforeRequest 起到过滤作用
 */
function filterRequest(request) {
}

/**
 * 程序收到代理请求，发送给目标服务器之前
 */
function beforeRequest(request) {
}

/**
 * 程序收到目标服务器的响应，发送给客户端之前
 */
function beforeResponse(request, response) {
}

/**
 * 停止脚本时，程序会调用此函数，可以利用该函数进行资源回收
 */
function finish() {
}

module.exports = {
    filterRequest,
    beforeRequest,
    beforeResponse,
    finish
}

```

**参数结构**

```js
// 客户端请求
const request = {
    // 目标服务器域名
	hostname: "",
    // 目标服务器端口
	port: 0,
    // URL PATH
	path: "",
    // HTTP METHOD
	method: "",
    // 请求头，不可以有中文
	headers: {},
    // 由于请求头存在 Xxx-Xxx 和 xxx-xxx 两种方式，为了对请求头取值方便，将 headers 中所有的 key 都转为全小写形式存储于 sHeaders，需要注意的是 sHeaders 不会被发送到目标服务器，如果要修改请求头，请修改 headers
	sHeaders: {},
    // 请求路径
	url: "",
    // HTTP 协议版本
	httpVersion: "",
    // 请求协议，固定 HTTP
	protocol: "http",
    // 请求参数
	query: {},
    // 请求体类型，如果要修改请求体的类型，请修改 headers 中的 Content-Type，该字段不会发送到目标服务器
	contentType: {},
    // 请求体，contentType.text 是 true，body 类型为 string，如果是 false，body 类型为 Uint8Array
	body: null,
    // 没有经过任何处理的请求体，不会发送给目标数据，要修改请求体，请修改 body
	rawBody: [],
    // 上下文唯一标识
	id: ""
}

// 目标服务器的响应
const response = {
    // http code
    code: 200,
    // 响应体
    body: "",
    // 未经过编码的响应体
    rawBody: {},
    // 响应体类型，参见 contentType
    contentType: {},
    // 响应头，不可以有中文
    headers: {},
    // 驼峰响应头，同 request
    humpHeaders: {},
    // HTTP 状态信息
    statusMessage: ""
}

// body 类型，取决于 HTTP header 中的 Content-Type
const contentType = {
    // body 的 mime type，比如 text/javascript
    name: "",
    // mime type 对应的文件后缀，比如 js
    suffix: "",
    // 数据类型枚举，枚举结构参见下方 global.enums
    dataType: 0,
    // 是否为文本
    text: false,
    // 文本编码，比如 utf-8
    charset: ""
}

let code = 0
// body 的数据类型枚举
global.enums = {
	// json
    CONTENT_TYPE_JSON: code++,
    // js
    CONTENT_TYPE_JAVASCRIPT: code++,
    // css
    CONTENT_TYPE_CSS: code++,
    // html
    CONTENT_TYPE_HTML: code++,
    // xml
    CONTENT_TYPE_XML: code++,
    // text
    CONTENT_TYPE_TEXT: code++,
    // application/x-www-form-urlencoded
    CONTENT_TYPE_FORM_DATA: code++,
    // bin
    CONTENT_TYPE_BIN: code++
}
```

<font color="red">注意事项：</font>

<font color="red">所有的函数都不支持异步，以下两种异步调用都是不可以的：</font>

```js
async function demo01() {
}

function demo02() {
    return new Promise((resolve, reject) => {
    })
}
```

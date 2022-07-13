# 项目介绍

本项目主要用于作为中间人服务器，对目标数据执行用户自定义的 HOOK 脚本

# 项目开发

首先安装项目的依赖到本地：

```bash
$ npm install
```

安装过程中，需要从 github 下载 electron，肯定会下载超时，可以通过以下方式解决：

```bash
# 设置国外网络代理
$ npm config set proxy 'https://www.example.com/'
# 或者使用国内华为云的软件镜像
$ npm config set registry https://repo.huaweicloud.com/repository/npm/
$ npm cache clean -f
# 设置 electron 软件镜像
$ npm config set ELECTRON_MIRROR https://repo.huaweicloud.com/electron/
```

或者参考[官方文档](https://www.electronjs.org/zh/docs/latest/tutorial/installation)

依赖安装完毕以后，通过以下命令运行项目：

```bash
# 先执行 webpack 编译页面的代码
$ npm run start-webpack
# 执行 vue tool，用于调试 vue 框架
$ npm run start-vuetool
# 执行项目
$ npm run start-electron
```

项目启动时会打开 debug 功能，在 chrome 浏览器地址栏中输入：`chrome://inspect/#devices`，点击 configure，查看是否有 localhost:9229，如果沒有则新增，点击“完成”，页面会出现：`electron/js2c/browser_init`，单击“inspect” 即可打开 debug 控制台。<font color="red">重启 electron 时，也需要重新打开 devtool</font>

项目打包：

<font color="red">打包前，请先安装 [Pandoc](https://github.com/jgm/pandoc/releases)，并确保 Path 变量包含 Pandoc，项目的 Markdown 文档编译需要此工具</font>

```bash
# 打包 windows 平台下的安装包，有三个安装包：zip、exe、msi
$ npm run build-win
# linux，有 tar.gz 和 AppImage
$ npm run build-linux
# mac，有 dmg 和 zip
$ npm run build-mac
```

如果控制台为 bash、zsh 等 shell 环境，那么可以直接通过 shell 执行上述操作：

```bash
# 加载 PATH 环境变量和指令别名
$ source ./command.sh
# 下面指令和上面等同
$ start-webpack
$ start-vuetool
$ start-electron
$ build-win
$ build-linux
$ build-mac
```

构建完成后，所有的安装包都在 dist/electron-builder 目录下，<font color="red">由于缺少 mac 机器，因此没有在 mac 平台上进行过测试</font>

# 目录结构介绍

| 文件夹                           | 简介                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| src/main                         | 主进程的源代码目录                                           |
| src/render                       | 渲染进程的源代码目录                                         |
| config                           | 用于构建项目的配置文件，webpack 和 electron-builder 的配置文件都在当中 |
| builder                          | 项目的构建脚本                                               |
| docs                             | 软件的使用文档，该文件夹下的 Markdown 文档会被 pandoc 编译成 html，集成到软件包当中 |
| public                           | GUI 的静态资源，比如 html 文件、图片文件等                   |
| src/main/hook-template/templates | 该文件夹下的脚本为软件内置的 HOOK 模板                       |

# 软件极限性能测试记录

测试要求：不会崩溃，没有明显卡顿

| 日期       | 版本   | 请求次数 | 瞬时并发 | 持续时间 |
| ---------- | ------ | -------- | -------- | -------- |
| 2022-05-17 | v1.0.0 | 50000    | 50       | 93 s     |

# 注意事项

electron 的 PCI 通信开销很大，建议采用批量数据传输的方式，在主进程和渲染进程之间传输数据，不建议频繁的进行数据传输

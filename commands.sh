current_dir="$PWD"
cd "$(dirname $0)"

BIN_DIR="$PWD/node_modules/.bin"
[[ $PATH =~ $BIN_DIR ]] || export PATH="${PATH}:$BIN_DIR"

# 在开发环境下运行项目
alias start-webpack="env -C $PWD webpack --config ./config/webpack-render-dev.js"
alias start-vue-tool="env -C $PWD vue-devtools &"
alias start-electron="env -C $PWD electron --inspect=9229 . --dev"

# 打包项目
alias build-linux="env -C $PWD node builder/builder.js -c -p linux"
alias build-win="env -C $PWD node builder/builder.js -c -p win32"
alias build-mac="env -C $PWD node builder/builder.js -c -p mac"
alias build-doc="env -C $PWD node ./document/ToDoc.js"

# 加载 curl 的代理设置，用于测试
source ./test-utils/set-proxy.sh

cd "$current_dir"

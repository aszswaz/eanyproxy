/**
 对象函数声明

 @author: aszswaz
 @date: 2022-05-16 16:23:04
 @IDE: WebStorm
 */

/**
 * 比较对象
 */
export function equals(self, target) {
    if (typeof self !== typeof target) {
        return false
    } else if (this === target) {
        return true
    } else if (!self || !target) {
        return false
    }

    const sourceKeys = Object.keys(self)
    if (!arrayEquals(sourceKeys, Object.keys(target))) return false

    for (const srcKey of sourceKeys) {
        const item = self[srcKey]
        const tarEle = target[srcKey]
        // 不管 null 和 undefined 的区别
        if ((!item && !tarEle) || (item === tarEle)) continue

        if (Array.isArray(item)) {
            // 比较数组元素
            arrayEquals(item, tarEle)
        } else if (typeof item === "symbol") {
            // symbol 表示独一无二的值，比如 Symbol(1) === Symbol(1) 比较结果为 false
            return false
        } else if (typeof item !== "object") {
            if (item !== tarEle) return false
        } else {
            // 递归比较对象
            if (equals(item, tarEle)) return false
        }
    }
    return true
}

/**
 * 比较两个数组
 */
export function arrayEquals(self, target) {
    if (!Array.isArray(self) || !Array.isArray(target)) return false
    if (self === target) return true
    if (self.length !== target.length) return false

    for (let i = 0; i < self.length; i++) {
        const item = self[i]
        if (typeof item === "symbol") {
            return false
        } else if (typeof item !== "object") {
            if (item !== target[i]) return false
        } else {
            if (!equals(item, target[i])) return false
        }
    }
    return true
}
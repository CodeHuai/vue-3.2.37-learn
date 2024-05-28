import { track, trigger } from './effect'

/**
 *
 * @returns res 返回target 对象中 对应的 key 值
 */
const createGetter = () => {
  return (target: Object, key: string | symbol, receiver: Object) => {
    const res = Reflect.get(target, key, receiver)

    // getter 中收集依赖
    track(target, key)

    return res
  }
}

const createSetter = () => {
  return (
    target: object,
    key: string | symbol,
    value: string,
    receiver: object
  ) => {
    const result = Reflect.set(target, key, value, receiver)

    // setter 中触发依赖
    trigger(target, key, value)

    return result
  }
}

const get = createGetter()

const set = createSetter()

/**
 * 响应性的 handler （Proxy 的处理对象）
 */
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}

import { mutableHandlers } from './baseHandlers'

/**
 * 响应式 weakMap 缓存对象
 */
export const reactiveMap = new WeakMap()

/**
 *
 * @param target 需要响应式的对象
 * @param baseHandlers 响应式的处理对象配置
 * @param proxyMap 响应式 weakMap 缓存对象
 */
export const createReactiveObject = (
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>
) => {
  // 优化机制，如果被响应式的对象已经是一个响应式了，就不需要再进行观测，直接返回
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  // 如果不是，则需要根据 target 创建一个代理对象,对收据的收集和触发，都是在baseHandlers中进行处理的
  const proxy = new Proxy(target, baseHandlers)

  // 缓存代理对象
  reactiveMap.set(target, proxy)

  return proxy
}

/**
 * 响应式Api - reactive
 * @param target: 需要响应式的对象
 * @returns Proxy 实例
 */
export const reactive = (target: object) => {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

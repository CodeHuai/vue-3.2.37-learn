type KeyToDepMap = Map<any, ReactiveEffect>

let activeEffect: ReactiveEffect | undefined

/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. `key`：响应性对象
 * 2. `value`：`Map` 对象
 * 		1. `key`：响应性对象的指定属性
 * 		2. `value`：指定对象的指定属性的 执行函数
 */
export const targetMap = new WeakMap<any, KeyToDepMap>()

/**
 * 用于收集依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 */
export const track = (target: object, key: unknown) => {
  if (!activeEffect) {
    return
  }

  let depsMap = targetMap.get(target)

  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  depsMap.set(key, activeEffect)
}

/**
 * 触发依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 * @param newValue 指定 key 的最新值
 * @param oldValue 指定 key 的旧值
 */
export const trigger = (target: object, key: unknown, newValue: string) => {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  const effect = depsMap.get(key) as ReactiveEffect
  if (!effect) {
    return
  }

  // effect.fn()
  effect.run()
}

// 副作用函数
export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    activeEffect = this

    return this.fn()
  }

  stop() {}
}

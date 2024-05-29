import { Dep, createDep } from './dep'

type KeyToDepMap = Map<any, Dep>

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

  let depsMap = targetMap.get(target) //  这里获取的是一个 map对象

  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key) // 获取set
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }

  // dep?.add(activeEffect)
  // 因为一个 key 可能对应多个 副作用函数，所以需要用set 收集起来
  trackEffects(dep)
}

/**
 * 利用 dep 依次跟踪指定 key 的所有 effect
 * @param dep
 */
export function trackEffects(dep: Dep) {
  // activeEffect! ： 断言 activeEffect 不为 null
  dep.add(activeEffect!)
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

  const effects: Dep | undefined = depsMap.get(key)
  if (!effects || !effects.size) {
    return
  }

  triggerEffects(effects)
}

/**
 * 依次触发 dep 中保存的依赖
 */
export function triggerEffects(dep: Dep) {
  // 把 dep 构建为一个数组
  const effects = Array.isArray(dep) ? dep : [...dep]
  // 依次触发
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

export function triggerEffect(effect: ReactiveEffect) {
  // 这里确实需要执行 run 方法，是为了重新 对 activeEffct 进行赋值
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
    // 将当前实例对象赋值给 全局的 activeEffect变量
    activeEffect = this

    return this.fn()
  }

  stop() {}
}

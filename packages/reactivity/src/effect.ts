import { extend } from '@vue/shared'
import { ComputedRefImpl } from './computed'
import { Dep, createDep } from './dep'

export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
}

type KeyToDepMap = Map<any, Dep>

export type EffectScheduler = (...args: any[]) => any

export let activeEffect: ReactiveEffect | undefined

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
  // for (const effect of effects) {
  // 	triggerEffect(effect)
  // }

  // 不在依次触发，而是先触发所有的计算属性依赖，再触发所有的非计算属性依赖
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}

export function triggerEffect(effect: ReactiveEffect) {
  // 存在调度器就执行调度函数
  if (effect.schedule) {
    effect.schedule()
  } else {
    // 这里确实需要执行 run 方法，是为了重新 对 activeEffct 进行赋值
    effect.run()
  }
}

// 副作用函数
export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const _effect = new ReactiveEffect(fn)

  // 存在 options，则合并配置对象
  if (options) {
    extend(_effect, options)
  }

  // !options.lazy 时
  if (!options || !options.lazy) {
    // 执行 run 函数
    _effect.run()
  }
}

/**
 * 响应性触发依赖时的执行类
 */
export class ReactiveEffect<T = any> {
  /**
   * 存在该属性，则表示当前的 effect 为计算属性的 effect
   */
  computed?: ComputedRefImpl<T>

  constructor(
    public fn: () => T,
    public schedule: EffectScheduler | null = null
  ) {}

  run() {
    // 将当前实例对象赋值给 全局的 activeEffect变量
    activeEffect = this

    return this.fn()
  }

  stop() {}
}

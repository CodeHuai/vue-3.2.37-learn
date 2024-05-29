import { Dep, createDep } from './dep'
import { toReactive } from './reactive'
import { activeEffect, trackEffects, triggerEffects } from './effect'
import { hasChanged } from '@vue/shared'

export interface Ref<T = any> {
  value: T
}

/**
 * 实际开发中使用的 ref api
 * @param value 传入的参数
 * @returns RefImpl 实例
 */
export function ref(value?: unknown) {
  return createRef(value, false)
}

/**
 * 指定数据是否为 RefImpl 类型
 */
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}

/**
 * 创建 RefImpl 实例
 * @param rawValue 原始数据
 * @param shallow boolean 形数据，表示《浅层的响应性（即：只有 .value 是响应性的）》
 * @returns
 */
export function createRef(rawValue: unknown, shallow: boolean) {
  // 如果已经是响应式了就直接返回
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}

class RefImpl<T> {
  private _value: T

  private _rawValue: T

  public dep?: Dep = undefined

  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._rawValue = value
    // 如果 __v_isShallow 为 true，则 value 不会被转化为 reactive 数据，即如果当前 value 为复杂数据类型，则会失去响应性。对应官方文档 shallowRef ：https://cn.vuejs.org/api/reactivity-advanced.html#shallowref
    this._value = __v_isShallow ? value : toReactive(value)
  }

  // 实现原始类型的响应式全靠这个 访问符 get set
  get value() {
    // 收集依赖
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    /**
     * newVal 为新数据
     * this._rawValue 为旧数据（原始数据）
     * 对比两个数据是否发生了变化
     */
    if (hasChanged(newVal, this._rawValue)) {
      // 更新原始数据
      this._rawValue = newVal
      // 更新 .value 的值
      this._value = toReactive(newVal)
      // 触发依赖
      triggerRefValue(this)
    }
  }
}

export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

/**
 * 为 ref 的 value 进行触发依赖工作
 */
export function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

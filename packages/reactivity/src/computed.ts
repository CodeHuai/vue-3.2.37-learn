import { isFunction } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { Dep } from './dep'
import { trackRefValue, triggerRefValue } from './ref'

export function computed(getterOrOptions) {
  let getter

  // 判断 参数是否是一个函数，因为 computed 还可以传入一个对象
  const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    // 如果是函数，则赋值给 getter
    getter = getterOrOptions
  }

  const cRef = new ComputedRefImpl(getter)

  return cRef as any
}

// computed api 实际上返回的是一个 是一个 ComputedRefImpl实例，比较重要的树形在 effect 属性上， 还有一个 _dirty 变量
export class ComputedRefImpl<T> {
  /**
   * 脏：为 false 时，表示需要触发依赖。为 true 时表示需要重新执行 run 方法，获取数据。即：数据脏了
   */
  public _dirty = true

  public dep?: Dep = undefined

  private _value!: T

  public readonly effect: ReactiveEffect<T>

  public readonly __v_isRef = true

  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this)
      }
    })
    this.effect.computed = this
  }

  get value() {
    trackRefValue(this)
    if (this._dirty) {
      this._dirty = false
      // 执行 run 函数
      this._value = this.effect.run()!
    }

    // 返回计算之后的真实值
    return this._value
  }

  // set value() {}
}

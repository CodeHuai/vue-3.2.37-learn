/**
 * 用于收集依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 */
export const track = (target: object, key: unknown) => {
  console.log('track: 收集依赖')
}

/**
 * 触发依赖的方法
 * @param target WeakMap 的 key
 * @param key 代理对象的 key，当依赖被触发时，需要根据该 key 获取
 * @param newValue 指定 key 的最新值
 * @param oldValue 指定 key 的旧值
 */
export const trigger = (target: object, key: unknown, newValue: string) => {
  console.log('trigger: 触发依赖')
}

export function effect<T = any>(fn: () => T) {}

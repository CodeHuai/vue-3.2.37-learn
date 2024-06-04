import { createVNode } from './vnode'
import { ShapeFlags } from 'packages/shared/src/shapeFlags'

/**
 * 解析 render 函数的返回值
 */
export function renderComponentRoot(instance) {
  const { vnode, render } = instance

  let result
  try {
    // 解析到状态组件
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 获取到 result 返回值
      // 注意这里执行了 render 也就是执行了 测试文件中 render-component.html 中的 h('div', 'hello component')函数
      result = normalizeVNode(render!())
    }
  } catch (err) {
    console.error(err)
  }

  return result
}

/**
 * 标准化 VNode
 */
export function normalizeVNode(child) {
  if (typeof child === 'object') {
    return cloneIfMounted(child)
  } else {
    return createVNode(Text, null, String(child))
  }
}

/**
 * clone VNode
 */
export function cloneIfMounted(child) {
  return child
}

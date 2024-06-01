// import { h } from 'vue'

import { isArray, isObject } from '@vue/shared'
import { createVNode, isVNode } from './vnode'

// // 除了 type 外，其他参数都是可选的
// h('div')
// h('div', { id: 'foo' })

// // attribute 和 property 都可以用于 prop
// // Vue 会自动选择正确的方式来分配它
// h('div', { class: 'bar', innerHTML: 'hello' })

// // class 与 style 可以像在模板中一样
// // 用数组或对象的形式书写
// h('div', { class: [foo, { bar }], style: { color: 'red' } })

// // 事件监听器应以 onXxx 的形式书写
// h('div', { onClick: () => {} })

// // children 可以是一个字符串
// h('div', { id: 'foo' }, 'hello')

// // 没有 prop 时可以省略不写
// h('div', 'hello')
// h('div', [h('span', 'hello')])

// // children 数组可以同时包含 vnode 和字符串
// h('div', ['hello', h('span', 'hello')])

export function h(type: any, propsOrChildren?: any, children?: any) {
  // 获取用户传递的参数数量
  const l = arguments.length

  // 参数只有两个
  if (l === 2) {
    // 是一个对象，但是不是数组形式，说明不是 子元素那种形式，则第二个参数只有两种可能性：1. VNode 2.普通的 props
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // 判断是否是 vnode, 内部有一个属性判断是否为vnode
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }

      // 如果不是 VNode， 则第二个参数代表了 props
      return createVNode(type, propsOrChildren, [])
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2)
    }

    // // 如果传递的参数只有三个，则 children 是单纯的 children
    if (l === 3) {
      children = [children]
    }
    // 触发 createVNode 方法，创建 VNode 实例
    return createVNode(type, propsOrChildren, children)
  }
}

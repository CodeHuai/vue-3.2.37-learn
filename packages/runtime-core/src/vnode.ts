import { isArray, isFunction, isObject, isString } from '@vue/shared'
import { normalizeClass } from 'packages/shared/src/normalizeProp'
import { ShapeFlags } from 'packages/shared/src/shapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

export interface VNode {
  __v_isVNode: true
  type: any
  props: any
  children: any
  shapeFlag: number
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false
}

/**
 * 生成一个 VNode 对象，并返回
 * @param type vnode.type
 * @param props 标签属性或自定义属性
 * @param children 子节点
 * @returns vnode 对象
 */
export function createVNode(type, props, children): VNode {
  // 通过 bit 位处理 shapeFlag 类型， 标识dom的类型 第一次
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0

  // 处理 class 和 style
  if (props) {
    // 处理 class
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }

  return createBaseVNode(type, props, children, shapeFlag)
}

// 构建基础的 vnode
function createBaseVNode(type, props, children, shapeFlag) {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    shapeFlag
  } as VNode

  normalizeChildren(vnode, children)

  return vnode
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0

  const { shapeFlag } = vnode

  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
    // TODO: array
  } else if (typeof children === 'object') {
    // TODO: object
  } else if (isFunction(children)) {
    // TODO: function
  } else {
    // children 为 string
    children = String(children)
    // 为 type 指定 Flags
    type = ShapeFlags.TEXT_CHILDREN
  }
  // 修改 vnode 的 chidlren
  vnode.children = children
  // 按位或赋值  标识vnode的类型 第二次代表children 的类型，将第一次和第二次的合并起来，用来同时标识dom类型和children类型
  vnode.shapeFlag |= type // 32位 按位运算
}

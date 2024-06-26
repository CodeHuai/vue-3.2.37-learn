import { reactive } from '@vue/reactivity'
import { isFunction, isObject } from '@vue/shared'
import { onBeforeMount, onMounted } from './apiLifecycle'

let uid = 0

/**
 * 生命周期钩子
 */
export const enum LifecycleHooks {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm'
}

export function handleSetupResult(instance, setupResult) {
  // 存在 setupResult，并且它是一个函数，则 setupResult 就是需要渲染的 render
  if (isFunction(setupResult)) {
    instance.render = setupResult
  }
  finishComponentSetup(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  // 存在 setup ，则直接获取 setup 函数的返回值即可
  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  } else {
    // 获取组件实例
    finishComponentSetup(instance)
  }
}

/**
 * 触发 hooks
 */
function callHook(hook: Function, proxy) {
  hook.bind(proxy)()
}

function applyOptions(instance: any) {
  const {
    data: dataOptions,
    beforeCreate,
    created,
    beforeMount,
    mounted
  } = instance.type

  // hooks
  if (beforeCreate) {
    callHook(beforeCreate, instance.data)
  }

  // 存在 data 选项时
  if (dataOptions) {
    // 触发 dataOptions 函数，拿到 data 对象
    const data = dataOptions()
    // 如果拿到的 data 是一个对象
    if (isObject(data)) {
      // 则把 data 包装成 reactiv 的响应性数据，赋值给 instance
      instance.data = reactive(data)
    }
  }

  // hooks
  if (created) {
    callHook(created, instance.data)
  }

  function registerLifecycleHook(register: Function, hook?: Function) {
    // hook：对应生命周期函数
    // instance：组件实例
    register(hook?.bind(instance.data), instance)
  }

  // 注册 hooks，也就是在组件实例上，将对应生命周期函数赋值到组件实例上的对应属性。属性名是LifecycleHooks枚举中的枚举值
  registerLifecycleHook(onBeforeMount, beforeMount)
  registerLifecycleHook(onMounted, mounted)
}

/**
 * 根据 vnode 创建组件实例
 */
export function createComponentInstance(vnode) {
  const type = vnode.type

  const instance = {
    uid: uid++, // 唯一标记
    vnode, // 虚拟节点
    type, // 组件类型
    subTree: null!, // render 函数的返回值
    effect: null!, // ReactiveEffect 实例
    update: null!, // update 函数，触发 effect.run
    render: null, // 组件内的 render 函数
    isMounted: false, // 是否挂载
    bc: null, // beforeCreate
    c: null, // created
    bm: null, // beforeMount
    m: null // mounted
  }

  return instance
}

/**
 * 规范化组件实例数据
 */
export function setupComponent(instance) {
  // 为 render 赋值
  const setupResult = setupStatefulComponent(instance)
  return setupResult
}

export function finishComponentSetup(instance) {
  const Component = instance.type

  instance.render = Component.render

  // 组件不存在 render 时，才需要重新赋值
  if (!instance.render) {
    instance.render = Component.render
  }

  // 改变 options 中的 this 指向
  applyOptions(instance)
}

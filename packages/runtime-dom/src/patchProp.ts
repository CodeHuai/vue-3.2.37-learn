import { isOn } from '@vue/shared'
import { patchClass } from './modules/class'
import { patchAttr } from './modules/attrs'
import { patchDOMProp } from './modules/props'
import { patchStyle } from './modules/style'

/**
 * 为 prop 进行打补丁操作
 */
export const patchProp = (el, key, prevValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
  } else if (isOn(key)) {
    // TODO: 事件
  } else if (shouldSetAsProp(el, key)) {
    // TODO: style
    patchDOMProp(el, key, nextValue)
  } else {
    // TODO: 其他属性
    patchAttr(el, key, nextValue)
  }
}

/**
 * 判断指定元素的指定属性是否可以通过 DOM Properties 指定
 */
function shouldSetAsProp(el: Element, key: string) {
  // #1787, #2840 表单元素的表单属性是只读的，必须设置为属性 attribute
  if (key === 'form') {
    return false
  }

  // #1526 <input list> 必须设置为属性 attribute
  if (key === 'list' && el.tagName === 'INPUT') {
    return false
  }

  // #2766 <textarea type> 必须设置为属性 attribute
  if (key === 'type' && el.tagName === 'TEXTAREA') {
    return false
  }

  return key in el
}

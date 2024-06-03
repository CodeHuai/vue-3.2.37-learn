import { createRenderer } from '@vue/runtime-core'
import { extend } from '@vue/shared'
import { nodeOps } from '../../runtime-dom/src/nodeOps'
import { patchProp } from '../../runtime-dom/src/patchProp'

const rendererOptions = extend({ patchProp }, nodeOps)

let renderer

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}

export const render = (...args) => {
  ensureRenderer().render(...args)
}

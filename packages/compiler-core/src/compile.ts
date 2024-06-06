import { baseParse } from './parse'

export function baseCompile(template: string, options: unknown) {
  const ast = baseParse(template)
  console.log(ast)
  return {}
}

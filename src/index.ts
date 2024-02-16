export * from './runtime-dom'
export * from './reacitivity'


import { baseCompile } from './complier-core/compile'
import { registerRuntimeCompiler } from './runtime-dom'
import * as runtimedom from './runtime-dom'



function compilerTofunction(template) {
  const { code } = baseCompile(template)
  const render = new Function("Vue", code)(runtimedom)
  console.log(render);

  return render
}


registerRuntimeCompiler(compilerTofunction)
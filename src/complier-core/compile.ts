import { transform } from "./transform";
import { baseParse } from "./parse";
import { generate } from "./codegen";
import { transformElement } from "./transforms/transformElement";
import { transformText } from "./transforms/transformText";
import { transformExpression } from "./transforms/transformExpression";

export function baseCompile(template) {
  const ast = baseParse(template)
  transform(ast, {
    nodeTransforms: [transformElement, transformText, transformExpression]
  })
  return generate(ast)
}
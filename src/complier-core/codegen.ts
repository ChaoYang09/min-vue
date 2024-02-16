import { isString } from "../shared"
import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperNameMap } from "./runtimeHelpers"

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context

  genModulePreamble(ast, context)

  const funcName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')
  push(`function ${funcName}(${signature}){`)
  push('return ')
  genNode(ast.codegenNode, context)
  push('}')
  return {
    code: context.code
  }
}

function genNode(node, context) {

  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break;

    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break;

    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break;

    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;

    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;

    default:
      break;
  }


}


function genCompoundExpression(node: any, context: any) {
  const { push } = context;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genElement(node, context) {
  const { push, helper } = context;
  const { tag, props, children } = node;

  push(`${helper(CREATE_ELEMENT_VNODE)}(`);

  genNodeList(genNullableArgs([tag, props, children]), context);

  push(`)`);
}

function genNodeList(nodes: any, context: any) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isString(node)) {
      push(`${node}`);
    } else {
      genNode(node, context);
    }
    // node 和 node 之间需要加上 逗号(,)
    // 但是最后一个不需要 "div", [props], [children]
    if (i < nodes.length - 1) {
      push(", ");
    }
  }
}

function genNullableArgs(args) {

  let i = args.length;

  while (i--) {
    if (args[i] != null) break;
  }
  // 把为 false 的值都替换成 "null"
  return args.slice(0, i + 1).map((arg) => arg || "null");
}


function genInterpolation(node, context) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

function genExpression(node, context) {
  const { push } = context
  push(node.content)
}

function genText(node, context) {
  const { push } = context
  push(`'${node.content}'`)
}

function genModulePreamble(ast, context) {
  const { push, helper, newLine } = context
  const { helpers } = ast
  if (helpers.length) {
    const code = `const {${helpers.map((key) => `${helperNameMap[key]} : ${helper(key)}`).join(', ')}} = Vue`
    push(code)
  }
  newLine()
  push('return ')
}


function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperNameMap[key]}`
    },
    newLine() {
      context.code += "\n"
    }
  }
  return context
}
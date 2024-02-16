import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING } from "./runtimeHelpers"

export function transform(root, options = {}) {

  const context = createTransformContext(root, options)

  traverseNode(root, context)

  createRootCodegen(root, context)

  root.helpers.push(...context.helpers.keys())
  // return context
}

function traverseNode(node, context) {
  const { type } = node
  const { nodeTransforms } = context

  let exitFns: any = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    const onExit = transform(node, context)
    if (onExit) {
      exitFns.push(onExit)
    }
  }

  switch (type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break;

    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traversChildren(node, context)
      break;

    default:
      break;
  }

  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }

}

function traversChildren(parent, context) {
  parent.children.forEach(node => {
    traverseNode(node, context)
  });
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms,
    helpers: new Map(),
    helper: (name) => {
      context.helpers.set(name, 1)
    }
  }
  return context
}

function createRootCodegen(root, context) {
  const { children } = root;

  const child = children[0];

  if (child.type === NodeTypes.ELEMENT && child.codegenNode) {
    const codegenNode = child.codegenNode;
    root.codegenNode = codegenNode;
  } else {
    root.codegenNode = child;
  }
}


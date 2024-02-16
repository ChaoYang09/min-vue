import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

export const enum NodeTypes {
  ROOT,
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  COMPOUND_EXPRESSION,
  TEXT
}

export const enum ElementTypes {
  ELEMENT,
}

export function createVNodeCall(context, tag, props?, children?) {
  if (context) {
    context.helper(CREATE_ELEMENT_VNODE);
  }

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
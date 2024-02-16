import { isObject } from "../shared"
import { shapeFlags } from "../shared/shapeFlags"
export { createVNode as createElementVNode }


export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    key: props?.key,
    shapeFlag: getShapeFlags(type),
    el: null,
    component: null
  }
  if (typeof children === "string") {
    vnode.shapeFlag |= shapeFlags.TETX_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= shapeFlags.ARRAY_CHILREN
  }

  if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
    if (isObject(vnode.children)) {
      vnode.shapeFlag |= shapeFlags.SLOT_CHILDREN
    }
  }
  return vnode
}

export function createTextVNode(text) {
  return createVNode('Text', {}, text)
}

function getShapeFlags(type) {
  return typeof type === 'string' ? shapeFlags.ELEMENT : shapeFlags.STATEFUL_COMPONENT
}
export enum shapeFlags {
  //最后渲染的element
  ELEMENT = 1,
  //组件类型
  STATEFUL_COMPONENT = 1 << 2,
  //vnode chilren -> text
  TETX_CHILDREN = 1 << 3,
  //vnode chilren -> array
  ARRAY_CHILREN = 1 << 4,
  SLOT_CHILDREN = 1 << 5
}
import { h } from "../h";

export const Fragment = Symbol("Fragment")

export function renderSlot(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      return h(Fragment, {}, slot(props))
    }
  }
}
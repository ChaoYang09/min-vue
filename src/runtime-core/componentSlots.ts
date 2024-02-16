export function initSlots(instance, children) {
  normalizeSlotObject(children, instance.slots)
}

function normalizeSlotObject(children, slots) {
  for (const key in children) {
    const value = children[key]
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
import { createAppAPI } from "../runtime-core/createApp"
import { createRenderer } from "../runtime-core/renderer"
import { isOn } from "../shared"


export function createElement(type) {
  const element = document.createElement(type)
  return element
}

export function createText(text) {
  const element = document.createTextNode(text)
  return element
}


export function patchProp(el, key, oldVal, newVal) {
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, newVal)
  } else {
    if (newVal === undefined || newVal === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, newVal)
    }
  }
}

export function insert(child, parent, anchor = null) {
  // console.log(parent, anchor);
  // parent.append(child)
  parent.insertBefore(child, anchor)
}

export function remove(child) {
  const parent = child.parentNode
  if (parent) {
    parent.removeChild(child)
  }
}

export function setElementText(el, text) {
  el.textContent = text
}


let renderer;

function ensureRenderer() {
  // 如果 renderer 有值的话，那么以后都不会初始化了
  return (
    renderer ||
    (renderer = createRenderer({
      createElement,
      createText,
      // setText,
      setElementText,
      patchProp,
      insert,
      remove,
    }))
  );
}

export const createApp = (...args) => {
  return ensureRenderer().createApp(...args);
};

export * from '../runtime-core'
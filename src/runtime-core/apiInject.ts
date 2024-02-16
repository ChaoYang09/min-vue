import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const instance: any = getCurrentInstance()
  if (instance) {
    let { provides } = instance
    const parentProvides = instance.parent?.provides
    //init 组件实例第一次 provide 的时候会调用一次
    if (parentProvides === provides) {
      provides = instance.provides = Object.create(parentProvides)
    }
    provides[key] = value
  }
}

export function inject(key, defaultValue) {
  const instance: any = getCurrentInstance()
  if (instance) {
    const parentProvides = instance.parent.provides
    if (key in parentProvides) {
      return parentProvides[key]
    } else if (defaultValue) {//没有provide 允许使用默认值
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
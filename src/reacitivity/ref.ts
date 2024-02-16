import { hasChanged, isObject } from "../shared/index"
import { isTracting, trackEffect, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class refImpl {
  private _value
  private _rawValue
  public dep = new Set()
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
  }
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newVal) {
    if (hasChanged(this._rawValue, newVal)) return
    this._rawValue = newVal
    this._value = convert(newVal)
    triggerEffects(this.dep)
  }
}

function trackRefValue(ref) {
  if (isTracting()) {
    trackEffect(ref.dep)
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

export function ref(value) {
  return new refImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWidthRefs) {
  return new Proxy(objectWidthRefs, {
    get(target, key) {
      //如果是 ref 返回 .value
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      //如果是 ref，set ref.value
      if (isRef(target[key]) && !isRef(value)) {
        return target[key].value = value
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}

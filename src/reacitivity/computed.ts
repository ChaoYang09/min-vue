import { ReactiveEffect } from "./effect"

class ComputedRefTmpl {
  private _getter: any
  private _dirty = true
  private _value: any
  private _effect: ReactiveEffect
  constructor(getter) {
    //getter 是fn
    this._getter = getter
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }
  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}
export function computed(getter) {
  return new ComputedRefTmpl(getter)
}
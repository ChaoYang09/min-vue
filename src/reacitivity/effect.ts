import { extend } from "../shared"


let activeEffect

let shouldTrack = false

// 收集依赖
let targetMap = new Map()

export class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: () => void
  constructor(fn, public scheduler?) {//public 可以直接获取到scheduler
    this._fn = fn
  }
  run() {

    // 不收集依赖
    if (!this.active) {
      return this._fn()
    }

    shouldTrack = true
    activeEffect = this

    const result = this._fn()
    //重置
    shouldTrack = false
    activeEffect = undefined
    return result
  }
  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

export function track(target, key) {
  if (!isTracting()) return
  let depMap = targetMap.get(target)
  if (!depMap) {//初始化
    depMap = new Map()
    targetMap.set(target, depMap)
  }

  let dep = depMap.get(key)
  if (!dep) {//初始化
    dep = new Set()//fn不能重复
    depMap.set(key, dep)
  }
  trackEffect(dep)
}

export function trackEffect(dep) {
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect?.deps.push(dep)
  }
}

export function trigger(target, key) {
  const depMap = targetMap.get(target)
  const dep = depMap.get(key)
  triggerEffects(dep)
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function cleanupEffect(effect) {
  effect.deps.forEach(dep => {
    dep.delete(effect)
  });
  effect.deps.length = 0;
}

export function stop(runner) {
  runner.effect.stop()
}

export function isTracting() {
  return shouldTrack && activeEffect !== undefined
}

export function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}
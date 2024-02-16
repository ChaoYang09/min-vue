import { shallowReadonly } from "../reacitivity/reactive"
import { proxyRefs } from "../reacitivity/ref"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandler } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode, parent) {
  const component = {
    type: vnode.type,
    vnode,
    parent,
    isMounted: false,
    next: null,
    setupState: {},
    props: {},
    slots: {},
    subTree: {},
    provides: parent ? parent.provides : {},
    emit: () => { },
  }
  component.emit = emit.bind(null, component) as any

  console.log('createComponentInstance', component);
  return component
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type

  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler)

  const { setup } = Component
  if (setup) {
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit })
    //TODO 如果设置了null ，上面的 instance 为 null
    // setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance)
}

let currentInstance = {}
//便于断点调试
export function setCurrentInstance(instance) {
  currentInstance = instance
}

export function getCurrentInstance() {
  return currentInstance
}

function finishComponentSetup(instance) {
  const Component = instance.vnode.type
  if (compiler && !Component.render) {
    if (Component.template) {
      Component.render = compiler(Component.template)
    }
  }

  instance.render = Component.render
}

let compiler
export function registerRuntimeCompiler(_compiler) {
  compiler = _compiler
}
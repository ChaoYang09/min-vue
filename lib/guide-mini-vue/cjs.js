'use strict';

const toDisplayString = (val) => {
    return String(val);
};

const extend = Object.assign;
const isObject = function (val) {
    return val !== null && (typeof val === 'object');
};
const isString = (value) => typeof value === 'string';
const hasChanged = function (value, newValue) {
    return Object.is(value, newValue);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const isOn = (key) => /^on[A-Z]/.test(key);
const EMPRY_OBJ = {};

let activeEffect;
let shouldTrack = false;
// 收集依赖
let targetMap = new Map();
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        // 不收集依赖
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        //重置
        shouldTrack = false;
        activeEffect = undefined;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function track(target, key) {
    if (!isTracting())
        return;
    let depMap = targetMap.get(target);
    if (!depMap) { //初始化
        depMap = new Map();
        targetMap.set(target, depMap);
    }
    let dep = depMap.get(key);
    if (!dep) { //初始化
        dep = new Set(); //fn不能重复
        depMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
        activeEffect === null || activeEffect === void 0 ? void 0 : activeEffect.deps.push(dep);
    }
}
function trigger(target, key) {
    const depMap = targetMap.get(target);
    const dep = depMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function isTracting() {
    return shouldTrack && activeEffect !== undefined;
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

var shapeFlags;
(function (shapeFlags) {
    //最后渲染的element
    shapeFlags[shapeFlags["ELEMENT"] = 1] = "ELEMENT";
    //组件类型
    shapeFlags[shapeFlags["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
    //vnode chilren -> text
    shapeFlags[shapeFlags["TETX_CHILDREN"] = 8] = "TETX_CHILDREN";
    //vnode chilren -> array
    shapeFlags[shapeFlags["ARRAY_CHILREN"] = 16] = "ARRAY_CHILREN";
    shapeFlags[shapeFlags["SLOT_CHILDREN"] = 32] = "SLOT_CHILDREN";
})(shapeFlags || (shapeFlags = {}));

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (!isReadonly) {
            track(target, key);
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        // readonly 的响应式对象不可以修改值
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        return true;
    }
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target, key) {
        // readonly 的响应式对象不可以修改值
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        return true;
    }
};

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}

class refImpl {
    constructor(value) {
        this.dep = new Set();
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        if (hasChanged(this._rawValue, newVal))
            return;
        this._rawValue = newVal;
        this._value = convert(newVal);
        triggerEffects(this.dep);
    }
}
function trackRefValue(ref) {
    if (isTracting()) {
        trackEffect(ref.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new refImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWidthRefs) {
    return new Proxy(objectWidthRefs, {
        get(target, key) {
            //如果是 ref 返回 .value
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            //如果是 ref，set ref.value
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

const emit = function (instance, event, ...args) {
    const { props } = instance;
    console.log(event);
    // add-foo -> addFoo
    const camelLize = (str) => {
        return str.replace(/[-_](.)/, (a, b) => {
            return b.toUpperCase();
        });
    };
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const toHandlerKey = (str) => {
        return str ? "on" + capitalize(str) : "";
    };
    const handlerName = toHandlerKey(camelLize(event));
    const handler = props[handlerName];
    handler && handler(...args);
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props
};
const publicInstanceProxyHandler = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    normalizeSlotObject(children, instance.slots);
}
function normalizeSlotObject(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
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
    };
    component.emit = emit.bind(null, component);
    console.log('createComponentInstance', component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        //TODO 如果设置了null ，上面的 instance 为 null
        // setCurrentInstance(null)
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
let currentInstance = {};
//便于断点调试
function setCurrentInstance(instance) {
    currentInstance = instance;
}
function getCurrentInstance() {
    return currentInstance;
}
function finishComponentSetup(instance) {
    const Component = instance.vnode.type;
    if (compiler && !Component.render) {
        if (Component.template) {
            Component.render = compiler(Component.template);
        }
    }
    instance.render = Component.render;
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props === null || props === void 0 ? void 0 : props.key,
        shapeFlag: getShapeFlags(type),
        el: null,
        component: null
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= shapeFlags.TETX_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= shapeFlags.ARRAY_CHILREN;
    }
    if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
        if (isObject(vnode.children)) {
            vnode.shapeFlag |= shapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode('Text', {}, text);
}
function getShapeFlags(type) {
    return typeof type === 'string' ? shapeFlags.ELEMENT : shapeFlags.STATEFUL_COMPONENT;
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

const h = (type, props = null, children = []) => {
    return createVNode(type, props, children);
};

const Fragment = Symbol("Fragment");
function renderSlot(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return h(Fragment, {}, slot(props));
        }
    }
}

const queue = [];
let isFlushPending = false;
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJob(job) {
    if (!queue.includes(job)) {
        queue.push(job);
        queueFlush();
    }
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while (job = queue.shift())
        job && job();
}

function shouldUpdateComponent(preVnode, nextVnode) {
    const { props: preProps } = preVnode;
    const { props: nextProps } = nextVnode;
    for (const key in nextProps) {
        if (nextProps[key] !== preProps[key]) {
            return true;
        }
    }
    return false;
}

function createRenderer(options) {
    const { createElement: hostCreateElement, setElementText: hostSetElementText, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setText: hostSetText, createText: hostCreateText, } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null, null);
    }
    function patch(n1, n2, container, parentComponent = null, anchor) {
        // console.log(vnode.type, parentComponent);
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case 'Text':
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlags.ELEMENT & shapeFlag) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlags.STATEFUL_COMPONENT & shapeFlag) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            updateElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function processComponent(n1, n2, container, parentComponent) {
        if (!n1) {
            mountComponent(n2, container, parentComponent);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(container, n2.children, parentComponent, anchor);
    }
    function processText(n1, n2, container) {
        const el = (n2.el = hostCreateText(n2, n2.children));
        hostInsert(el, container);
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const { type, children } = vnode;
        const el = (vnode.el = hostCreateElement(type));
        if (shapeFlags.TETX_CHILDREN & vnode.shapeFlag) {
            el.textContent = children;
        }
        else if (shapeFlags.ARRAY_CHILREN & vnode.shapeFlag) {
            mountChildren(el, children, parentComponent, anchor);
        }
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        hostInsert(el, container, anchor);
    }
    function updateElement(n1, n2, container, parentComponent, anchor) {
        // console.log('updateElment', n1, n2);
        const oldProps = n1.props || EMPRY_OBJ;
        const newProps = n2.props || EMPRY_OBJ;
        const el = (n2.el = n1.el); // n1已经mount完成，所以有el
        patchProps(el, oldProps, newProps);
        patchChildren(n1, n2, el, parentComponent, anchor);
    }
    function patchProps(el, oldProps, newProps) {
        for (let key in newProps) {
            const newValue = newProps[key];
            const oldValue = oldProps[key];
            if (newValue !== oldValue) {
                hostPatchProp(el, key, oldValue, newValue);
            }
        }
        // oldProps里有prop，newProps里面没有，需要把new里面对应的prop删除
        if (oldProps !== EMPRY_OBJ) { //oldProps不为空的时候才走下面的逻辑
            for (let key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null);
                }
            }
        }
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const oldShapeFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        //new textChildren
        if (shapeFlag & shapeFlags.TETX_CHILDREN) {
            if (oldShapeFlag & shapeFlags.ARRAY_CHILREN) {
                //删除旧的array children
                unmountChildren(c1);
            }
            if (c1 !== c2) {
                //设置新的text
                hostSetElementText(container, c2);
            }
        }
        else {
            // new arrayChildren
            if (oldShapeFlag & shapeFlags.TETX_CHILDREN) {
                hostSetElementText(container, '');
                mountChildren(container, c2, parentComponent, anchor);
            }
            else {
                // old array -> new array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        //收窄左端指针 i
        while (i <= e1 && i <= e2) {
            const pre = c1[i];
            const next = c2[i];
            if (isSameVNodeType(pre, next)) {
                patch(pre, next, container, parentComponent, anchor);
            }
            else {
                break;
            }
            i++;
        }
        //收窄右端指针 e1 e2
        while (i <= e1 && i <= e2) {
            const pre = c1[e1];
            const next = c2[e2];
            if (isSameVNodeType(pre, next)) {
                patch(pre, next, container, parentComponent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            // 新的比老得多，需要创建
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < c2.length ? c2[nextPos].el : null; //左右侧处理方式不一样
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            //老的比新的多，需要删除
            if (i <= e1) {
                while (i <= e1) {
                    hostRemove(c1[i].el);
                    i++;
                }
            }
        }
        else {
            // 中间对比
            // 收缩完处理剩余的中间节点
            let s1 = i;
            let s2 = i;
            let toBePatched = e2 - s2 + 1;
            let patched = 0;
            const keyToNewindexMap = new Map();
            const newIndexToOldIndexMap = Array.from({ length: toBePatched }, () => 0);
            let moved = false;
            let maxNewIndexSoFar = 0;
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewindexMap.set(nextChild.key, i);
            }
            // 遍历旧节点
            //  删除新节点中不存在旧节点
            // 创建旧节点中不存在的新节点
            for (let i = s1; i <= e1; i++) {
                let newIndex;
                const preChild = c1[i];
                //优化点，ABCD GH EF -> ABCDEF GH直接remove
                if (patched >= toBePatched) {
                    hostRemove(preChild.el);
                    continue;
                }
                if (preChild.key !== null) {
                    newIndex = keyToNewindexMap.get(preChild.key); //没有 get 到也为 undefined
                }
                else {
                    // 没有key的话 通过遍历新节点获取 对应的index
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(preChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(preChild.el);
                }
                else {
                    //AB CDEF  GHI -> AB FCDE GHI
                    // 0123
                    // 6345
                    //sequence -> [1,2,3]
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    patch(preChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function isSameVNodeType(n1, n2) {
        return (n1.type === n2.type) && (n1.key === n2.key);
    }
    function unmountChildren(children) {
        children.forEach((v) => {
            hostRemove(v.el);
        });
    }
    function mountChildren(el, children, parentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, el, parentComponent, anchor);
        });
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function updateComponent(n1, n2, container, parentComponent) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.component = n1.component;
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function setupRenderEffect(instance, initialVNode, container) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log('mount');
                // console.log(instance);
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                // console.log('subTree', subTree);
                patch(null, subTree, container, instance, null);
                // element -> mount 
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const nextTree = instance.render.call(proxy, proxy);
                const preTree = instance.subTree;
                instance.subTree = nextTree;
                // console.log('preTree', preTree);
                // console.log('nextTree', nextTree);
                patch(preTree, nextTree, container, instance, null);
                // element -> mount 
                initialVNode.el = nextTree.el;
            }
        }, {
            scheduler: () => {
                queueJob(instance.update);
            }
        });
    }
    function updateComponentPreRender(instance, nextVnode) {
        nextVnode.component = instance;
        instance.vnode = nextVnode;
        instance.next = null;
        instance.props = nextVnode.props;
    }
    return {
        render,
        createApp: createAppAPI(render),
    };
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function provide(key, value) {
    var _a;
    const instance = getCurrentInstance();
    if (instance) {
        let { provides } = instance;
        const parentProvides = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        //init 组件实例第一次 provide 的时候会调用一次
        if (parentProvides === provides) {
            provides = instance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const instance = getCurrentInstance();
    if (instance) {
        const parentProvides = instance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) { //没有provide 允许使用默认值
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createElement(type) {
    const element = document.createElement(type);
    return element;
}
function createText(text) {
    const element = document.createTextNode(text);
    return element;
}
function patchProp(el, key, oldVal, newVal) {
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, newVal);
    }
    else {
        if (newVal === undefined || newVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, newVal);
        }
    }
}
function insert(child, parent, anchor = null) {
    // console.log(parent, anchor);
    // parent.append(child)
    parent.insertBefore(child, anchor);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
let renderer;
function ensureRenderer() {
    // 如果 renderer 有值的话，那么以后都不会初始化了
    return (renderer ||
        (renderer = createRenderer({
            createElement,
            createText,
            // setText,
            setElementText,
            patchProp,
            insert,
            remove,
        })));
}
const createApp = (...args) => {
    return ensureRenderer().createApp(...args);
};

var runtimedom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    createAppAPI: createAppAPI,
    createComponentInstance: createComponentInstance,
    createElement: createElement,
    createElementVNode: createVNode,
    createRenderer: createRenderer,
    createText: createText,
    createTextVNode: createTextVNode,
    createVNode: createVNode,
    getCurrentInstance: getCurrentInstance,
    h: h,
    inject: inject,
    insert: insert,
    nextTick: nextTick,
    patchProp: patchProp,
    provide: provide,
    queueJob: queueJob,
    registerRuntimeCompiler: registerRuntimeCompiler,
    remove: remove,
    renderSlot: renderSlot,
    setCurrentInstance: setCurrentInstance,
    setElementText: setElementText,
    setupComponent: setupComponent,
    toDisplayString: toDisplayString
});

const TO_DISPLAY_STRING = Symbol(`toDisplayString`);
const CREATE_ELEMENT_VNODE = Symbol('createElementVnode');
const helperNameMap = {
    [TO_DISPLAY_STRING]: 'toDisplayString',
    [CREATE_ELEMENT_VNODE]: 'createElementVNode'
};

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers.push(...context.helpers.keys());
    // return context
}
function traverseNode(node, context) {
    const { type } = node;
    const { nodeTransforms } = context;
    let exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const onExit = transform(node, context);
        if (onExit) {
            exitFns.push(onExit);
        }
    }
    switch (type) {
        case 1 /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 0 /* NodeTypes.ROOT */:
        case 3 /* NodeTypes.ELEMENT */:
            traversChildren(node, context);
            break;
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function traversChildren(parent, context) {
    parent.children.forEach(node => {
        traverseNode(node, context);
    });
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms,
        helpers: new Map(),
        helper: (name) => {
            context.helpers.set(name, 1);
        }
    };
    return context;
}
function createRootCodegen(root, context) {
    const { children } = root;
    const child = children[0];
    if (child.type === 3 /* NodeTypes.ELEMENT */ && child.codegenNode) {
        const codegenNode = child.codegenNode;
        root.codegenNode = codegenNode;
    }
    else {
        root.codegenNode = child;
    }
}

function baseParse(content) {
    const context = createParserContext(content);
    return creaRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        let node;
        let s = context.source;
        if (s.startsWith('{{')) {
            node = parseInterpolation(context);
        }
        else if (s[0] === '<') {
            node = parseElement(context, ancestors);
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    // console.log(nodes);
    return nodes;
}
function parseText(context) {
    const s = context.source;
    const endTokens = ['<', '{{'];
    let endIndex = s.length;
    for (let i = 0; i < endTokens.length; i++) {
        const index = s.indexOf(endTokens[i]);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    return {
        type: 5 /* NodeTypes.TEXT */,
        content
    };
}
//处理 "{{ }}""
function parseInterpolation(context) {
    const openDelimiter = '{{';
    const closeDelimiter = '}}';
    const openLength = openDelimiter.length;
    const closeIndex = context.source.indexOf(closeDelimiter, openLength);
    // 去除{{
    advanceBy(context, openLength);
    const rawContentLength = closeIndex - openLength;
    const content = parseTextData(context, rawContentLength).trim();
    // 去除}}
    advanceBy(context, openLength);
    return {
        type: 1 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 2 /* NodeTypes.SIMPLE_EXPRESSION */,
            content
        },
    };
}
function parseElement(context, ancestors) {
    const element = parseTag(context, 0 /* TagType.Start */);
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    //开始结束标签匹配上，再把结束标签去掉
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, 1 /* TagType.End */);
    }
    else {
        throw new Error(`缺少结束标签:${element.tag}`);
    }
    return element;
}
function isEnd(context, ancestors) {
    let s = context.source;
    if (s.startsWith('</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            if (startsWithEndTagOpen(s, ancestors[i].tag)) {
                return true;
            }
        }
    }
    return !s;
}
function startsWithEndTagOpen(source, tag) {
    return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}
function parseTag(context, type) {
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (type === 1 /* TagType.End */)
        return;
    return {
        type: 3 /* NodeTypes.ELEMENT */,
        tag,
        tagType: 0 /* ElementTypes.ELEMENT */,
        children: [],
    };
}
function parseTextData(context, length) {
    const rawData = context.source.slice(0, length);
    advanceBy(context, length);
    return rawData;
}
function advanceBy(context, numberOfCharacters) {
    context.source = context.source.slice(numberOfCharacters);
}
function createParserContext(content) {
    return {
        source: content
    };
}
function creaRoot(children) {
    return {
        type: 0 /* NodeTypes.ROOT */,
        children,
        helpers: []
    };
}

function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    genModulePreamble(ast, context);
    const funcName = 'render';
    const args = ['_ctx', '_cache'];
    const signature = args.join(', ');
    push(`function ${funcName}(${signature}){`);
    push('return ');
    genNode(ast.codegenNode, context);
    push('}');
    return {
        code: context.code
    };
}
function genNode(node, context) {
    switch (node.type) {
        case 5 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 1 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 2 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 3 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 4 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
}
function genCompoundExpression(node, context) {
    const { push } = context;
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, props, children } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullableArgs([tag, props, children]), context);
    push(`)`);
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            push(`${node}`);
        }
        else {
            genNode(node, context);
        }
        // node 和 node 之间需要加上 逗号(,)
        // 但是最后一个不需要 "div", [props], [children]
        if (i < nodes.length - 1) {
            push(", ");
        }
    }
}
function genNullableArgs(args) {
    let i = args.length;
    while (i--) {
        if (args[i] != null)
            break;
    }
    // 把为 false 的值都替换成 "null"
    return args.slice(0, i + 1).map((arg) => arg || "null");
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(')');
}
function genExpression(node, context) {
    const { push } = context;
    push(node.content);
}
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}
function genModulePreamble(ast, context) {
    const { push, helper, newLine } = context;
    const { helpers } = ast;
    if (helpers.length) {
        const code = `const {${helpers.map((key) => `${helperNameMap[key]} : ${helper(key)}`).join(', ')}} = Vue`;
        push(code);
    }
    newLine();
    push('return ');
}
function createCodegenContext() {
    const context = {
        code: '',
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperNameMap[key]}`;
        },
        newLine() {
            context.code += "\n";
        }
    };
    return context;
}

function createVNodeCall(context, tag, props, children) {
    if (context) {
        context.helper(CREATE_ELEMENT_VNODE);
    }
    return {
        type: 3 /* NodeTypes.ELEMENT */,
        tag,
        props,
        children,
    };
}

function transformElement(node, context) {
    if (node.type === 3 /* NodeTypes.ELEMENT */) {
        return () => {
            // 没有实现 block  所以这里直接创建 element
            // TODO
            // 需要把之前的 props 和 children 等一系列的数据都处理
            const vnodeTag = `'${node.tag}'`;
            // TODO props 暂时不支持
            const vnodeProps = null;
            let vnodeChildren = null;
            if (node.children.length > 0) {
                if (node.children.length === 1) {
                    // 只有一个孩子节点 ，那么当生成 render 函数的时候就不用 [] 包裹
                    const child = node.children[0];
                    vnodeChildren = child;
                }
            }
            // 创建一个新的 node 用于 codegen 的时候使用
            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
        };
    }
}

function isText(node) {
    return node.type === 1 /* NodeTypes.INTERPOLATION */ || node.type === 5 /* NodeTypes.TEXT */;
}

function transformText(node, context) {
    if (node.type === 3 /* NodeTypes.ELEMENT */) {
        // 在 exit 的时期执行
        // 下面的逻辑会改变 ast 树
        // 有些逻辑是需要在改变之前做处理的
        return () => {
            // hi,{{msg}}
            // 上面的模块会生成2个节点，一个是 text 一个是 interpolation 的话
            // 生成的 render 函数应该为 "hi," + _toDisplayString(_ctx.msg)
            // 这里面就会涉及到添加一个 “+” 操作符
            // 那这里的逻辑就是处理它
            // 检测下一个节点是不是 text 类型，如果是的话， 那么会创建一个 COMPOUND 类型
            // COMPOUND 类型把 2个 text || interpolation 包裹（相当于是父级容器）
            const children = node.children;
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    // 看看下一个节点是不是 text 类
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            // currentContainer 的目的是把相邻的节点都放到一个 容器内
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 4 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    loc: child.loc,
                                    children: [child],
                                };
                            }
                            currentContainer.children.push(` + `, next);
                            // 把当前的节点放到容器内, 然后删除掉j
                            children.splice(j, 1);
                            // 因为把 j 删除了，所以这里就少了一个元素，那么 j 需要 --
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function transformExpression(node, context) {
    if (node.type === 1 /* NodeTypes.INTERPOLATION */) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformElement, transformText, transformExpression]
    });
    return generate(ast);
}

function compilerTofunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("Vue", code)(runtimedom);
    console.log(render);
    return render;
}
registerRuntimeCompiler(compilerTofunction);

exports.createApp = createApp;
exports.createAppAPI = createAppAPI;
exports.createComponentInstance = createComponentInstance;
exports.createElement = createElement;
exports.createElementVNode = createVNode;
exports.createRenderer = createRenderer;
exports.createText = createText;
exports.createTextVNode = createTextVNode;
exports.createVNode = createVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.insert = insert;
exports.nextTick = nextTick;
exports.patchProp = patchProp;
exports.provide = provide;
exports.queueJob = queueJob;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler;
exports.remove = remove;
exports.renderSlot = renderSlot;
exports.setCurrentInstance = setCurrentInstance;
exports.setElementText = setElementText;
exports.setupComponent = setupComponent;
exports.toDisplayString = toDisplayString;

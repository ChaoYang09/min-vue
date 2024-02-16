import { effect } from "../reacitivity/effect";
import { EMPRY_OBJ } from "../shared";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp";
import { Fragment } from "./helpers/renderSlot";
import { queueJob } from "./scheduler";
import { shouldUpdateComponent } from "./shouldUpdateComponent";

export function createRenderer(options) {


  const {
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setText: hostSetText,
    createText: hostCreateText,
  } = options;


  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }

  function patch(n1, n2, container, parentComponent = null, anchor) {
    // console.log(vnode.type, parentComponent);
    const { type, shapeFlag } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break;
      case 'Text':
        processText(n1, n2, container)
        break;
      default:
        if (shapeFlags.ELEMENT & shapeFlag) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlags.STATEFUL_COMPONENT & shapeFlag) {
          processComponent(n1, n2, container, parentComponent)
        }
        break;
    }

  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      updateElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function processComponent(n1, n2, container, parentComponent) {
    if (!n1) {
      mountComponent(n2, container, parentComponent)

    } else {
      updateComponent(n1, n2, container, parentComponent)
    }
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(container, n2.children, parentComponent, anchor)
  }

  function processText(n1, n2, container) {
    const el = (n2.el = hostCreateText(n2, n2.children))
    hostInsert(el, container)
  }

  function mountElement(vnode, container, parentComponent, anchor) {
    const { type, children } = vnode
    const el = (vnode.el = hostCreateElement(type))

    if (shapeFlags.TETX_CHILDREN & vnode.shapeFlag) {
      el.textContent = children
    } else if (shapeFlags.ARRAY_CHILREN & vnode.shapeFlag) {
      mountChildren(el, children, parentComponent, anchor)
    }

    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
    hostInsert(el, container, anchor)
  }

  function updateElement(n1, n2, container, parentComponent, anchor) {
    // console.log('updateElment', n1, n2);
    const oldProps = n1.props || EMPRY_OBJ
    const newProps = n2.props || EMPRY_OBJ
    const el = (n2.el = n1.el)// n1已经mount完成，所以有el
    patchProps(el, oldProps, newProps)
    patchChildren(n1, n2, el, parentComponent, anchor)
  }

  function patchProps(el, oldProps, newProps) {
    for (let key in newProps) {
      const newValue = newProps[key]
      const oldValue = oldProps[key]
      if (newValue !== oldValue) {
        hostPatchProp(el, key, oldValue, newValue)
      }
    }
    // oldProps里有prop，newProps里面没有，需要把new里面对应的prop删除
    if (oldProps !== EMPRY_OBJ) {//oldProps不为空的时候才走下面的逻辑
      for (let key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {

    const oldShapeFlag = n1.shapeFlag
    const { shapeFlag } = n2
    const c1 = n1.children
    const c2 = n2.children

    //new textChildren
    if (shapeFlag & shapeFlags.TETX_CHILDREN) {
      if (oldShapeFlag & shapeFlags.ARRAY_CHILREN) {
        //删除旧的array children
        unmountChildren(c1)
      }
      if (c1 !== c2) {
        //设置新的text
        hostSetElementText(container, c2)
      }
    } else {
      // new arrayChildren
      if (oldShapeFlag & shapeFlags.TETX_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(container, c2, parentComponent, anchor)
      } else {
        // old array -> new array

        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    //收窄左端指针 i
    while (i <= e1 && i <= e2) {
      const pre = c1[i]
      const next = c2[i]
      if (isSameVNodeType(pre, next)) {
        patch(pre, next, container, parentComponent, anchor)
      } else {
        break;
      }
      i++
    }
    //收窄右端指针 e1 e2
    while (i <= e1 && i <= e2) {
      const pre = c1[e1]
      const next = c2[e2]
      if (isSameVNodeType(pre, next)) {
        patch(pre, next, container, parentComponent, anchor)
      } else {
        break;
      }
      e1--
      e2--
    }

    if (i > e1) {
      // 新的比老得多，需要创建
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < c2.length ? c2[nextPos].el : null//左右侧处理方式不一样
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      //老的比新的多，需要删除
      if (i <= e1) {
        while (i <= e1) {
          hostRemove(c1[i].el)
          i++
        }
      }
    } else {
      // 中间对比
      // 收缩完处理剩余的中间节点
      let s1 = i
      let s2 = i
      let toBePatched = e2 - s2 + 1
      let patched = 0
      const keyToNewindexMap = new Map()
      const newIndexToOldIndexMap = Array.from({ length: toBePatched }, () => 0)
      let moved = false
      let maxNewIndexSoFar = 0;

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewindexMap.set(nextChild.key, i)
      }

      // 遍历旧节点
      //  删除新节点中不存在旧节点
      // 创建旧节点中不存在的新节点
      for (let i = s1; i <= e1; i++) {
        let newIndex
        const preChild = c1[i]

        //优化点，ABCD GH EF -> ABCDEF GH直接remove
        if (patched >= toBePatched) {
          hostRemove(preChild.el)
          continue;
        }

        if (preChild.key !== null) {
          newIndex = keyToNewindexMap.get(preChild.key)//没有 get 到也为 undefined
        } else {
          // 没有key的话 通过遍历新节点获取 对应的index

          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(preChild, c2[j])) {
              newIndex = j
              break;
            }
          }
        }
        if (newIndex === undefined) {
          hostRemove(preChild.el)
        } else {
          //AB CDEF  GHI -> AB FCDE GHI
          // 0123
          // 6345
          //sequence -> [1,2,3]
          newIndexToOldIndexMap[newIndex - s2] = i + 1

          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }

          patch(preChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let j = increasingNewIndexSequence.length - 1
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }

      }
    }
  }

  function isSameVNodeType(n1, n2) {
    return (n1.type === n2.type) && (n1.key === n2.key)
  }

  function unmountChildren(children) {
    children.forEach((v) => {
      hostRemove(v.el)
    })
  }

  function mountChildren(el, children, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, el, parentComponent, anchor)
    })
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent))
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  function updateComponent(n1, n2, container, parentComponent) {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.component = n1.component
      n2.el = n1.el
      instance.vnode = n2
    }

  }

  function setupRenderEffect(instance, initialVNode, container) {
    instance.update = effect(() => {
      if (!instance.isMounted) {
        console.log('mount');
        // console.log(instance);
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy, proxy))
        // console.log('subTree', subTree);
        patch(null, subTree, container, instance, null)
        // element -> mount 
        initialVNode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log('update');
        const { next, vnode } = instance
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        }
        const { proxy } = instance
        const nextTree = instance.render.call(proxy, proxy)
        const preTree = instance.subTree
        instance.subTree = nextTree
        // console.log('preTree', preTree);
        // console.log('nextTree', nextTree);
        patch(preTree, nextTree, container, instance, null)
        // element -> mount 
        initialVNode.el = nextTree.el
      }

    }, {
      scheduler: () => {
        queueJob(instance.update)
      }
    })
  }

  function updateComponentPreRender(instance, nextVnode) {
    nextVnode.component = instance
    instance.vnode = nextVnode
    instance.next = null
    instance.props = nextVnode.props
  }

  return {
    render,
    createApp: createAppAPI(render),
  }
}


function getSequence(arr: number[]): number[] {
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
        } else {
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

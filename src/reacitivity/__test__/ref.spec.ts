import { effect } from "../effect"
import { reactive } from "../reactive"
import { isRef, proxyRefs, ref, unRef } from "../ref"

describe("ref", () => {
  it("should be reactive", () => {
    let dummy
    let calls = 0
    const a = ref(1)
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    // expect(a.value).toBe(2)
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    //相同的value 不触发
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it("should make nested properties reactive", () => {
    let dummy
    const a = ref({
      foo: 1
    })
    const b = ref({
      foo: 1
    })
    effect(() => {
      dummy = a.value.foo + b.value.foo
    })
    expect(dummy).toBe(2)
    a.value.foo = 2
    b.value.foo++
    expect(dummy).toBe(4)
  })

  it("isRef", () => {
    const a = ref(1)
    const b = reactive({
      foo: 1
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(b)).toBe(false)
  })

  it("unRef", () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })

  it("proxyRefs", () => {
    const user = {
      age: ref(1),
      name: 'Nancy'
    }
    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(1)
    expect(proxyUser.age).toBe(1)

    proxyUser.age = 2
    expect(user.age.value).toBe(2)
    expect(proxyUser.age).toBe(2)

    proxyUser.age = ref(10)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
  })
})
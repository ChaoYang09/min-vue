import { isProxy, isReactive, isReadOnly, reactive, readonly } from "../reactive"

describe("readonly", () => {
  it("should make nested values readonly", () => {
    console.warn = jest.fn()
    const original = {
      foo: 1,
      bar: {
        foo: 10
      }
    }
    const wrapped = readonly(original)
    wrapped.foo++
    expect(wrapped).not.toBe(original)
    expect(console.warn).toHaveBeenCalled()
    expect(isReactive(wrapped)).toBe(false)
    expect(isReadOnly(wrapped)).toBe(true)
    expect(isProxy(wrapped)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isReadOnly(original)).toBe(false)
    expect(isReactive(wrapped.bar)).toBe(false)
    //TODO：会先触发wrapped的get ，然后返回bar对象，这时就不是响应式了
    expect(isReadOnly(wrapped.bar)).toBe(true)
  })
})
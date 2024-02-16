import { isReactive, isReadOnly, shallowReadonly } from "../reactive"

describe("shallowReadonly", () => {

  it("should not make mon-reactive properties reactive", () => {
    console.warn = jest.fn()
    const original = {
      foo: 1,
      bar: {
        foo: 10
      }
    }
    const wrapped = shallowReadonly(original)
    wrapped.foo++
    expect(wrapped).not.toBe(original)
    expect(console.warn).toHaveBeenCalled()
    expect(isReactive(wrapped)).toBe(false)
    expect(isReadOnly(wrapped)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isReadOnly(original)).toBe(false)
    expect(isReactive(wrapped.bar)).toBe(false)
    expect(isReadOnly(wrapped.bar)).toBe(false)
  })
})
import { effect, stop } from "../effect"
import { reactive } from "../reactive"

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge

    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)
    //update
    user.age++
    expect(nextAge).toBe(12)
  })

  it("should return runner when call effect", () => {
    let foo = 10
    const runner = effect(() => {
      foo++
      return "foo"
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe("foo")
  })

  it("scheduler", () => {
    // 1.effect第一次执行时 执行fn
    // 2.响应式对象更新时 不会执行fn 执行scheuler
    let dummy
    let run
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({
      foo: 1
    })
    const runner = effect(() => {
      dummy = obj.foo
    }, { scheduler })
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)
    run()
    expect(dummy).toBe(2)

  })
})

it("stop", () => {
  let dummy
  const obj = reactive({
    foo: 1
  })
  const runner = effect(() => {
    dummy = obj.foo
  })
  obj.foo = 2
  expect(dummy).toBe(2)
  stop(runner)
  obj.foo++//会先触发get 然后set
  expect(dummy).toBe(2)
  runner()
  expect(dummy).toBe(3)
})

it("onStop", () => {
  let dummy
  const onStop = jest.fn()
  const obj = reactive({
    foo: 1
  })
  const runner = effect(() => {
    dummy = obj.foo
  }, {
    onStop
  })
  expect(onStop).toHaveBeenCalledTimes(0)
  stop(runner)
  expect(onStop).toHaveBeenCalledTimes(1)

})
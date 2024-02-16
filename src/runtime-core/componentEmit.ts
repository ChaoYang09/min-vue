export const emit = function (instance, event, ...args) {
  const { props } = instance
  console.log(event);

  // add-foo -> addFoo
  const camelLize = (str) => {
    return str.replace(/[-_](.)/, (a, b) => {
      return b.toUpperCase()
    })
  }
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : ""
  }
  const handlerName = toHandlerKey(camelLize(event))
  const handler = props[handlerName]
  handler && handler(...args)
}